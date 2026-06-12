import type { AgentRunDetail, ReplayRequest } from "@ai-novel/shared/types/agent";
import { createStructuredPlan } from "../orchestrator";
import { AgentTraceStore } from "../traceStore";
import type {
  AgentApprovalDecisionInput,
  AgentRuntimeCallbacks,
  AgentRuntimeResult,
  AgentRunStartInput,
  PlannedAction,
  StructuredIntent,
  ToolCall,
} from "../types";
import { ApprovalContinuationService } from "./ApprovalContinuationService";
import { PlanExecutionService } from "./PlanExecutionService";
import { RunExecutionService } from "./RunExecutionService";
import { AgentPlanStore } from "../store/AgentPlanStore";
import { withSharedRunLock } from "./runLocks";
import { summarizeDynamicExecutionState } from "./dynamicExecutionState";
import { normalizeAgent, parseRunMetadata, safeJson, TERMINAL_STATUSES, isRecord, asObject, type RunMetadata } from "./runtimeHelpers";

/**
 * AgentRuntime
 *
 * Agent 运行时的核心编排引擎，负责：
 * 1. 接收用户的运行请求（start）
 * 2. 调用 Planner（LLM）将目标转为结构化计划
 * 3. 按静态计划或动态计划（含 replan 循环）执行工具调用
 * 4. 处理审批暂停/继续、重放、取消、重试等生命周期操作
 *
 * 内部依赖：
 * - AgentTraceStore —— 所有运行记录/步骤的持久化
 * - RunExecutionService —— 执行静态 action 队列
 * - PlanExecutionService —— 执行动态计划（phases + steps + replan）
 * - ApprovalContinuationService —— 审批流程的暂停与恢复
 * - AgentPlanStore —— 动态计划快照的持久化与版本管理
 */
export class AgentRuntime {
  /** 运行记录存储 */
  private readonly store = new AgentTraceStore();

  /** 静态计划执行器（按顺序执行 action 列表） */
  private readonly executor = new RunExecutionService(this.store);

  /** 动态计划快照存储（版本化 plan 持久化） */
  private readonly planStore = new AgentPlanStore();

  /** 动态计划执行器（分阶段执行，支持 replan 循环） */
  private readonly planExecutor = new PlanExecutionService(this.executor, this.store, this.planStore);

  /** 审批流程处理器（等待审批、恢复执行） */
  private readonly approvals = new ApprovalContinuationService(this.store, this.executor);

  /** 带共享锁的并发保护，同一 runId 不会同时执行多个操作 */
  private async withRunLock<T>(runId: string, fn: () => Promise<T>): Promise<T> {
    return withSharedRunLock(runId, fn);
  }

  /**
   * 将运行标记为失败
   * - 更新 run 状态为 failed，记录错误信息和当前 agent
   * - 通过回调通知外部（如 WebSocket）
   */
  private async failRun(
    runId: string,
    message: string,
    agentName: string,
    callbacks?: AgentRuntimeCallbacks,
  ): Promise<void> {
    await this.store.updateRun(runId, {
      status: "failed",
      currentStep: "failed",
      currentAgent: agentName,
      error: message,
      finishedAt: new Date(),
    });
    callbacks?.onRunStatus?.({
      runId,
      status: "failed",
      message,
    });
  }

  /**
   * 根据输入创建 run 记录
   * - 组装 metadata（上下文模式、模型参数、最近 30 条消息）
   * - 可选 metadataPatch 用于附加信息（如动态执行状态）
   */
  private async createRunFromInput(input: AgentRunStartInput, metadataPatch?: Partial<RunMetadata>) {
    const metadata: RunMetadata = {
      contextMode: input.contextMode,
      provider: input.provider,
      model: input.model,
      temperature: input.temperature,
      maxTokens: input.maxTokens,
      messages: input.messages?.slice(-30),
      ...metadataPatch,
    };
    return this.store.createRun({
      sessionId: input.sessionId,
      goal: input.goal,
      novelId: input.novelId,
      entryAgent: "Planner",
      metadataJson: safeJson(metadata),
    });
  }

  /**
   * 更新 run 的 metadata
   * - plannerIntent 和 metadataPatch 都是可选叠加项
   * - 用于在运行时记录 orchestrationMode、动态执行状态等
   */
  private async updateRunMetadata(
    runId: string,
    input: AgentRunStartInput,
    plannerIntent?: StructuredIntent,
    metadataPatch?: Partial<RunMetadata>,
  ): Promise<void> {
    const metadata: RunMetadata = {
      contextMode: input.contextMode,
      provider: input.provider,
      model: input.model,
      temperature: input.temperature,
      maxTokens: input.maxTokens,
      messages: input.messages?.slice(-30),
      plannerIntent,
      ...metadataPatch,
    };
    await this.store.updateRun(runId, {
      metadataJson: safeJson(metadata),
    });
  }

  /**
   * 启动一次 Agent 运行 —— 核心入口
   *
   * 整体流程：
   * 1. 参数校验 + 并发冲突检测（同一 session 不能有两个运行）
   * 2. 创建 run 记录（queued → running）
   * 3. 调用 LLM Planner 生成结构化计划（createStructuredPlan）
   * 4. 根据 plan 类型选择执行路径：
   *    a. 静态计划 → 直接提交给 RunExecutionService.runActionPlan
   *    b. 动态计划 → 进入 phase 循环（PlanExecutionService），支持：
   *       - 分阶段执行工具调用
   *       - 阶段间自动 replan（最多 3 次）
   *       - 审批等待暂停
   *       - replan 超限后降级为静态计划（dynamic_fallback_static）
   * 5. 完成时返回执行结果（AgentRuntimeResult）
   */
  async start(input: AgentRunStartInput, callbacks?: AgentRuntimeCallbacks): Promise<AgentRuntimeResult> {
    // ---------- 参数校验 ----------
    if (input.contextMode === "novel" && !input.novelId) {
      throw new Error("novel mode requires novelId.");
    }

    // ---------- 并发检测：同一 session/novel 下不能有多个活跃运行 ----------
    const activeRuns = await this.store.listRuns({
      sessionId: input.sessionId,
      novelId: input.novelId,
      limit: 10,
    });
    const blockingRun = activeRuns.find((item) => item.status === "running" || item.status === "waiting_approval");
    if (blockingRun && blockingRun.id !== input.runId) {
      const message = blockingRun.status === "waiting_approval"
        ? "当前已有运行在等待审批，请先处理审批。"
        : "当前已有运行仍在执行中。";
      // 直接返回已有 run 的详情，外层通过 throwOnRunning 决定是否抛错
      return this.executor.getRunDetailOrThrow(blockingRun.id, message);
    }

    // ---------- 如果传入 runId，检查该 run 是否还在运行 ----------
    if (input.runId) {
      await this.approvals.reconcileWaitingApprovalRun(input.runId);
      const existing = await this.store.getRun(input.runId);
      if (existing && !TERMINAL_STATUSES.has(existing.status)) {
        if (existing.status === "waiting_approval") {
          return this.executor.getRunDetailOrThrow(existing.id, "当前运行正等待审批，请先处理审批。");
        }
        return this.executor.getRunDetailOrThrow(existing.id, "当前运行仍在执行中。");
      }
    }

    // ---------- 创建 run（状态：queued） ----------
    const run = await this.createRunFromInput(input);
    callbacks?.onRunStatus?.({
      runId: run.id,
      status: "queued",
      message: "已创建运行",
    });

    // ---------- 用共享锁保护运行过程 ----------
    return this.withRunLock(run.id, async () => {
      // 更新状态为 running，记录开始时间
      await this.store.updateRun(run.id, {
        status: "running",
        startedAt: new Date(),
        currentStep: "planning",
        currentAgent: "Planner",
      });
      callbacks?.onRunStatus?.({
        runId: run.id,
        status: "running",
        message: "开始规划",
      });

      // ===== 阶段 1：规划（Planning） =====
      // 创建 planning step（状态 running）
      const planningStep = await this.store.addStep({
        runId: run.id,
        agentName: "Planner",
        stepType: "planning",
        status: "running",
        inputJson: safeJson({
          goal: input.goal,
          contextMode: input.contextMode,
          novelId: input.novelId,
        }),
        provider: input.provider,
        model: input.model,
      });

      // 调用 LLM 生成结构化计划
      let planner;
      try {
        planner = await createStructuredPlan({
          goal: input.goal,
          messages: input.messages ?? [],
          contextMode: input.contextMode,
          novelId: input.novelId,
          provider: input.provider,
          model: input.model,
          temperature: input.temperature,
          maxTokens: input.maxTokens,
          currentRunStatus: "running",
          currentStep: "planning",
        });
      } catch (error) {
        // LLM 调用失败 → 记录错误步骤 + 标记 run 失败
        const message = error instanceof Error ? error.message : "LLM 意图识别失败。";
        await this.store.addStep({
          runId: run.id,
          agentName: "Planner",
          parentStepId: planningStep.id,
          stepType: "planning",
          status: "failed",
          error: message,
          provider: input.provider,
          model: input.model,
        });
        await this.failRun(run.id, message, "Planner", callbacks);
        throw error;
      }

      // 更新 metadata：记录编排模式、动态执行状态、planner intent
      await this.updateRunMetadata(run.id, input, planner.structuredIntent, {
        orchestrationMode: planner.dynamicPlan ? "dynamic" : "static",
        dynamicExecutionState: summarizeDynamicExecutionState({
          dynamicPlan: planner.dynamicPlan,
          mode: planner.dynamicPlan ? "dynamic" : "static",
        }),
      });

      // 记录 planning 成功 step（含 source、warnings、intent、plan）
      await this.store.addStep({
        runId: run.id,
        agentName: "Planner",
        parentStepId: planningStep.id,
        stepType: "planning",
        status: "succeeded",
        inputJson: safeJson({
          source: planner.source,
          warnings: planner.validationWarnings,
          structuredIntent: planner.structuredIntent,
          plan: planner.plan,
        }),
        provider: input.provider,
        model: input.model,
      });
      // 如果有校验警告，单独记录一条 reasoning step
      if (planner.validationWarnings.length > 0) {
        await this.store.addStep({
          runId: run.id,
          agentName: "Planner",
          stepType: "reasoning",
          status: "succeeded",
          inputJson: safeJson({
            warnings: planner.validationWarnings,
          }),
          provider: input.provider,
          model: input.model,
        });
      }

      // ===== 路径 A：静态计划（无动态编排） =====
      if (!planner.dynamicPlan) {
        return this.executor.runActionPlan(
          run.id,
          input.goal,
          planner.actions,
          {
            contextMode: input.contextMode,
            novelId: input.novelId,
            worldId: input.worldId,
            provider: input.provider,
            model: input.model,
            temperature: input.temperature,
            maxTokens: input.maxTokens,
          },
          planner.structuredIntent,
          this.failRun.bind(this),
          callbacks,
        );
      }

      // ===== 路径 B：动态计划（Dynamic Orchestration） =====
      let dynamicPlan = planner.dynamicPlan;
      let replanCount = 0; // 当前 replan 次数
      await this.planExecutor.saveInitialPlan(run.id, dynamicPlan);

      // 阶段执行循环 —— 每次迭代执行一个 phase，然后决定下一步
      while (true) {
        const phaseResult = await this.planExecutor.executeCurrentPhase(
          dynamicPlan,
          run.id,
          input.goal,
          {
            contextMode: input.contextMode,
            novelId: input.novelId,
            worldId: input.worldId,
            provider: input.provider,
            model: input.model,
            temperature: input.temperature,
            maxTokens: input.maxTokens,
          },
          planner.structuredIntent,
          this.failRun.bind(this),
          callbacks,
        );
        dynamicPlan = phaseResult.updatedPlan;

        // ----- 分支 1：需要审批暂停 -----
        if (phaseResult.waitingForApproval) {
          await this.updateRunMetadata(run.id, input, planner.structuredIntent, {
            orchestrationMode: "dynamic",
            dynamicExecutionState: summarizeDynamicExecutionState({
              dynamicPlan,
              waitingForApproval: true,
              mode: "dynamic",
            }),
          });
          return phaseResult.executionResult;
        }

        // ----- 分支 2：触发了重新规划（replan） -----
        if (phaseResult.replanTrigger) {
          replanCount += 1;
          // replan 超过 3 次 → 降级为静态计划（dynamic_fallback_static）
          if (replanCount >= 3) {
            await this.planStore.supersedePlan(run.id, dynamicPlan.version);
            await this.updateRunMetadata(run.id, input, planner.structuredIntent, {
              orchestrationMode: "dynamic_fallback_static",
              dynamicExecutionState: summarizeDynamicExecutionState({
                mode: "dynamic_fallback_static",
                fallbackReason: phaseResult.replanTrigger.detail,
                replanTrigger: phaseResult.replanTrigger,
              }),
            });
            // 将初始静态 plan 的 actions 转为 PlannedAction 队列执行
            return this.executor.runActionPlan(
              run.id,
              input.goal,
              planner.plan.actions.map((action) => ({
                agent: normalizeAgent(action.agent),
                reasoning: action.reason,
                calls: [{
                  tool: action.tool as ToolCall["tool"],
                  reason: action.reason,
                  idempotencyKey: action.idempotencyKey,
                  input: action.input,
                }],
              })),
              {
                contextMode: input.contextMode,
                novelId: input.novelId,
                worldId: input.worldId,
                provider: input.provider,
                model: input.model,
                temperature: input.temperature,
                maxTokens: input.maxTokens,
              },
              planner.structuredIntent,
              this.failRun.bind(this),
              callbacks,
            );
          }
          // replan 次数未超限 → 更新 metadata 后继续循环（重新规划新 phase）
          await this.updateRunMetadata(run.id, input, planner.structuredIntent, {
            orchestrationMode: "dynamic",
            dynamicExecutionState: summarizeDynamicExecutionState({
              dynamicPlan,
              mode: "dynamic",
              replanTrigger: phaseResult.replanTrigger,
            }),
          });
          continue;
        }

        // ----- 分支 3：正常完成当前 phase -----
        await this.updateRunMetadata(run.id, input, planner.structuredIntent, {
          orchestrationMode: "dynamic",
          dynamicExecutionState: summarizeDynamicExecutionState({
            dynamicPlan,
            mode: "dynamic",
          }),
        });

        // 如果没有更多 phase 了，返回结果
        if (!this.planExecutor.hasMorePhases(dynamicPlan)) {
          return phaseResult.executionResult;
        }
        // 否则继续循环，执行下一个 phase
      }
    });
  }

  /**
   * 处理审批决策
   * - 接收用户对等待审批步骤的批准/拒绝/修改
   * - 委派给 ApprovalContinuationService 处理
   * - 结果可以是继续执行、修改后执行或终止
   */
  async resolveApproval(input: AgentApprovalDecisionInput, callbacks?: AgentRuntimeCallbacks): Promise<AgentRuntimeResult> {
    return this.approvals.resolve(input, callbacks, this.failRun.bind(this));
  }

  /**
   * 从指定步骤开始重放（Replay）
   *
   * 场景：用户希望从某个历史步骤重新执行，而非从头开始
   * 流程：
   * 1. 找到源 step 之后的所有 tool_call 步骤
   * 2. 将它们转成 PlannedAction 队列
   * 3. 创建一个新 run（继承原 run 的 metadata，标记 parentRunId）
   * 4. 以新 run 直接执行（跳过 planning 阶段）
   *
   * 支持模式：
   * - dry_run：模拟执行（工具调用的 input 中加入 dryRun: true）
   * - live：实际重放
   */
  async replayFromStep(runId: string, request: ReplayRequest): Promise<AgentRuntimeResult> {
    const detail = await this.store.getRunDetail(runId);
    if (!detail) {
      throw new Error("Run not found.");
    }
    const fromStep = detail.steps.find((item) => item.id === request.fromStepId);
    if (!fromStep) {
      throw new Error("Replay source step not found.");
    }
    // 收集源 step 之后的所有 tool_call 步骤（按 seq 升序）
    const afterSteps = detail.steps
      .filter((item) => item.seq > fromStep.seq && item.stepType === "tool_call")
      .sort((a, b) => a.seq - b.seq);
    const replayActions: PlannedAction[] = [];
    for (const step of afterSteps) {
      const payload = asObject(step.inputJson);
      const tool = payload.tool;
      if (typeof tool !== "string") {
        continue;
      }
      const input = isRecord(payload.input) ? payload.input : {};
      const call: ToolCall = {
        tool: tool as ToolCall["tool"],
        reason: typeof payload.reason === "string" ? payload.reason : "replay",
        idempotencyKey: `${typeof step.idempotencyKey === "string" ? step.idempotencyKey : `replay_${Date.now()}`}_replay`,
        input: request.mode === "dry_run"
          ? { ...input, dryRun: true }
          : input,
        dryRun: request.mode === "dry_run",
      };
      replayActions.push({
        agent: normalizeAgent(step.agentName),
        reasoning: "从历史步骤重放",
        calls: [call],
      });
    }
    if (replayActions.length === 0) {
      throw new Error("No replayable tool steps after source step.");
    }
    // 继承原 run 的 metadata，附加 parentRunId 和重放源步骤
    const metadata = parseRunMetadata(detail.run.metadataJson);
    const run = await this.store.createRun({
      sessionId: detail.run.sessionId,
      goal: detail.run.goal,
      novelId: detail.run.novelId ?? undefined,
      entryAgent: "Planner",
      metadataJson: safeJson({
        ...metadata,
        parentRunId: detail.run.id,
        replayFromStepId: request.fromStepId,
      }),
    });
    return this.withRunLock(run.id, async () => {
      await this.store.updateRun(run.id, {
        status: "running",
        startedAt: new Date(),
        currentStep: "executing",
        currentAgent: replayActions[0].agent,
      });
      return this.executor.runActionPlan(
        run.id,
        detail.run.goal,
        replayActions,
        {
          contextMode: metadata.contextMode,
          novelId: detail.run.novelId ?? undefined,
          provider: metadata.provider,
          model: metadata.model,
          temperature: metadata.temperature,
          maxTokens: metadata.maxTokens,
        },
        metadata.plannerIntent,
        this.failRun.bind(this),
      );
    });
  }

  /**
   * 获取 run 详情（含步骤列表）
   * - 先检查是否有需要自动 reconcile 的审批
   * - 委托 AgentTraceStore.getRunDetail 返回完整信息
   */
  async getRunDetail(runId: string): Promise<AgentRunDetail | null> {
    await this.approvals.reconcileWaitingApprovalRun(runId);
    return this.store.getRunDetail(runId);
  }

  /**
   * 列出 run，支持按状态/小说/章节/session 过滤
   * - 对 pending_approval 的 run 先做一次 reconcile（检查是否超时）
   * - 返回过滤后的 run 列表（不含 step 详情）
   */
  async listRuns(filters: {
    status?: AgentRunDetail["run"]["status"];
    novelId?: string;
    chapterId?: string;
    sessionId?: string;
    limit?: number;
  }) {
    const runs = await this.store.listRuns(filters);
    // 先 reconcile 所有等待审批的 run（处理超时过期）
    await Promise.all(
      runs
        .filter((item) => item.status === "waiting_approval")
        .map((item) => this.approvals.reconcileWaitingApprovalRun(item.id)),
    );
    return this.store.listRuns(filters);
  }

  /**
   * 取消运行
   * - 使所有待审批的 approval 过期
   * - 将 run 状态标记为 "cancelled"
   */
  async cancelRun(runId: string): Promise<void> {
    await this.withRunLock(runId, async () => {
      await this.store.expireAllPendingApprovals(runId, "Run cancelled.");
      await this.store.updateRun(runId, {
        status: "cancelled",
        error: null,
        finishedAt: new Date(),
        currentStep: "cancelled",
      });
    });
  }

  /**
   * 重试运行
   * - 从原 run 中提取 metadata（模型参数、消息历史等）
   * - 以相同的配置重新调用 start，走完整的规划→执行流程
   */
  async retryRun(runId: string): Promise<AgentRuntimeResult> {
    const detail = await this.store.getRunDetail(runId);
    if (!detail) {
      throw new Error("Run not found.");
    }
    const metadata = parseRunMetadata(detail.run.metadataJson);
    return this.start({
      sessionId: detail.run.sessionId,
      goal: detail.run.goal,
      messages: metadata.messages,
      contextMode: metadata.contextMode,
      novelId: detail.run.novelId ?? undefined,
      provider: metadata.provider,
      model: metadata.model,
      temperature: metadata.temperature,
      maxTokens: metadata.maxTokens,
    });
  }

  /** 创建章节生成轨迹 run，用于章节编辑页展示 */
  async createChapterGenRun(novelId: string, chapterId: string, chapterOrder: number): Promise<string> {
    const run = await this.store.createRun({
      sessionId: `chapter-gen-${chapterId}-${Date.now()}`,
      goal: `章节 ${chapterOrder} 生成`,
      novelId,
      chapterId,
      entryAgent: "Writer",
    });
    await this.store.updateRun(run.id, { status: "running", startedAt: new Date() });
    return run.id;
  }

  /** 章节生成完成后更新 run 并记录一条步骤 */
  async finishChapterGenRun(runId: string, summary: string, durationMs?: number): Promise<void> {
    await this.store.updateRun(runId, {
      status: "succeeded",
      finishedAt: new Date(),
      currentStep: "章节生成完成",
    });
    await this.store.addStep({
      runId,
      agentName: "Writer",
      stepType: "tool_result",
      outputJson: JSON.stringify({ summary }),
      durationMs,
    });
  }
}

/** 全局单例，供外部调用 */
export const agentRuntime = new AgentRuntime();
