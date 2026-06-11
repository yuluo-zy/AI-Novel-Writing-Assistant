# Creative Hub 与 Agent Runtime 动态编排

## Background

Creative Hub 早期已经具备 AI 识别意图、生成动态计划和逐阶段执行的雏形，但这套能力只在 Creative Hub 主链路上真正生效。通用 `AgentRuntime` 仍然会把规划结果压回静态动作表，导致同样是“整本创作推进”，不同入口会出现不同的执行语义、审批续跑语义和状态可见性。

这会直接带来三个维护问题：

- 用户在 Creative Hub 里看到的是动态编排，在通用运行详情里看到的却像固定脚本执行。
- 审批中断后，如果续跑只理解静态 continuation，动态计划的当前阶段和上下文会丢失。
- 前端难以解释“系统现在是在按计划推进、正在重规划，还是已经退回静态执行”。

## Decision

项目对动态编排采用“AI 先规划，受控执行器落地”的混合策略：

- AI 负责意图识别和动态计划生成。
- Runtime 负责受控工具执行、审批、续跑、失败归因和状态持久化。
- 动态编排不是任意自由代理，而是受工具权限和运行时边界约束的阶段式执行。

当前首个收敛范围只覆盖 `produce_novel`。其他 intent 继续走静态编排，直到动态执行语义稳定。

## Current Rule

### 1. 入口一致性

- `createStructuredPlan()` 若返回 `dynamicPlan`，Creative Hub 与通用 `AgentRuntime` 都必须识别并进入动态执行链。
- 不允许 Creative Hub 使用动态编排，而通用 runtime 默默退回静态执行。

### 2. 执行语义

- 动态计划按 phase 推进，不按整个计划一次性展开成固定工具表。
- 每次 phase 执行后都要更新当前阶段、当前步骤、剩余阶段/步骤和最近一次重规划原因。
- 连续重规划达到预算上限后，允许退回静态执行，但必须明确记录为 `dynamic_fallback_static`。

### 3. 审批与续跑

- 审批 payload 必须携带当前编排模式和动态执行状态。
- 审批通过后的 continuation 继续沿当前待执行动作推进，不能把动态语义 silently 丢失。
- 审批拒绝后的替代路径仍然可以保留“本次运行原本处于动态编排”这一状态信息。

### 4. 状态投影

- 面向前端与 API 的统一投影字段为 `DynamicExecutionStateSummary`。
- 该投影只暴露 UI 必需信息：
  - `mode`
  - `currentPhase`
  - `currentStep`
  - `remainingPhaseCount`
  - `remainingStepCount`
  - `waitingForApproval`
  - `lastReplanReason`
  - `fallbackReason`
- 前端不直接依赖完整内部 `DynamicWorkflowPlan` 结构做展示。

## Examples

- 用户在 Creative Hub 发起“继续推进这本书的整本创作”，Planner 返回动态计划，运行时逐阶段执行，摘要显示“动态编排 / 当前阶段 / 当前步骤”。
- 某个写入动作触发审批，续跑通过后继续执行后续动作，同时保留“这次运行属于动态编排”的状态投影。
- 动态计划连续失败达到预算上限，系统切换到静态执行，并在摘要和运行面板里显示“动态失败后转静态”。

## Failure Modes

- 只在一个入口启用动态编排，另一个入口继续静态执行，导致同类任务出现不同恢复语义。
- 审批续跑只识别静态 continuation，导致动态执行状态在中断后丢失。
- 前端只能看到工具日志，看不到当前究竟是动态推进、等待审批，还是静态回退。

## Related Modules

- `server/src/agents/orchestrator.ts`
- `server/src/agents/runtime/AgentRuntime.ts`
- `server/src/agents/runtime/PlanExecutionService.ts`
- `server/src/agents/runtime/RunExecutionService.ts`
- `server/src/creativeHub/CreativeHubLangGraph.ts`
- `shared/types/agent.ts`

## Source Documents

- `docs/wiki/workflows/creative-hub-boundary.md`
- `docs/wiki/prompts/prompt-registry-and-structured-output.md`
