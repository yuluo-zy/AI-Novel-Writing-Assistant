import type { CreativeHubInterrupt, CreativeHubMessage, CreativeHubTurnSummary } from "./creativeHub";
import type { ChapterRuntimePackage } from "./chapterRuntime";

/**
 * 通用 API 响应包装接口
 * @template T - 响应数据的类型
 */
export interface ApiResponse<T> {
  /** 请求是否成功 */
  success: boolean;
  /** 响应数据（成功时存在） */
  data?: T;
  /** 错误信息（失败时存在） */
  error?: string;
  /** 附加消息 */
  message?: string;
}

/**
 * SSE（Server-Sent Events）帧类型，用于服务端推送实时事件。
 * 涵盖文本块、完成、错误、心跳、推理过程、工具调用/结果、审批、运行时包和运行状态。
 */
export type SSEFrame =
  /** 增量文本块 */
  | { type: "chunk"; content: string }
  /** 完整内容 */
  | { type: "done"; fullContent: string }
  /** 错误信息 */
  | { type: "error"; error: string }
  /** 心跳帧 */
  | { type: "ping" }
  /** LLM 推理过程中的中间思考 */
  | { type: "reasoning"; content: string }
  /** 工具调用 */
  | { type: "tool_call"; runId: string; stepId: string; toolName: string; inputSummary: string }
  /** 工具执行结果 */
  | { type: "tool_result"; runId: string; stepId: string; toolName: string; outputSummary: string; success: boolean }
  /** 需要用户审批 */
  | { type: "approval_required"; runId: string; approvalId: string; summary: string; targetType: string; targetId: string }
  /** 审批已处理 */
  | { type: "approval_resolved"; runId: string; approvalId: string; action: "approved" | "rejected"; note?: string }
  /** 运行时数据包推送 */
  | { type: "runtime_package"; package: ChapterRuntimePackage }
  /** 运行状态变更 */
  | {
    type: "run_status";
    runId: string;
    status: "queued" | "running" | "waiting_approval" | "succeeded" | "failed" | "cancelled";
    phase?: "streaming" | "finalizing" | "completed";
    message?: string;
  };

/**
 * Creative Hub SSE 流帧类型，用于创意中心特有的实时事件推送。
 * 覆盖消息增量/完成、元数据、运行状态、轮次摘要、工具调用/结果、中断、审批和错误。
 */
export type CreativeHubStreamFrame =
  /** 消息部分增量 */
  | { event: "messages/partial"; data: CreativeHubMessage[] }
  /** 消息已完成 */
  | { event: "messages/complete"; data: CreativeHubMessage[] }
  /** 元数据 */
  | { event: "metadata"; data: Record<string, unknown> }
  /** 创意中心运行状态 */
  | { event: "creative_hub/run_status"; data: { runId?: string; status: string; message?: string } }
  /** 轮次摘要 */
  | { event: "creative_hub/turn_summary"; data: CreativeHubTurnSummary }
  /** 工具调用 */
  | { event: "creative_hub/tool_call"; data: { runId?: string; stepId?: string; toolName: string; inputSummary: string } }
  /** 工具执行结果 */
  | {
    event: "creative_hub/tool_result";
    data: {
      runId?: string;
      stepId?: string;
      toolName: string;
      outputSummary: string;
      success: boolean;
      output?: Record<string, unknown>;
      errorCode?: string;
    };
  }
  /** 创意中心中断 */
  | { event: "creative_hub/interrupt"; data: CreativeHubInterrupt }
  /** 审批已处理 */
  | { event: "creative_hub/approval_resolved"; data: { approvalId: string; action: "approved" | "rejected"; note?: string } }
  /** 创意中心错误 */
  | { event: "creative_hub/error"; data: { message: string } }
  /** 通用错误 */
  | { event: "error"; data: { message: string } };
