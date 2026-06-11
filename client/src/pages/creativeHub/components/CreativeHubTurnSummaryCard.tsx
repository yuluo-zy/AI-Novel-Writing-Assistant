import type { CreativeHubTurnSummary } from "@ai-novel/shared/types/creativeHub";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CreativeHubTurnSummaryCardProps {
  summary: CreativeHubTurnSummary;
  onQuickAction?: (prompt: string) => void;
}

function toStatusLabel(status: CreativeHubTurnSummary["status"]): string {
  switch (status) {
    case "succeeded":
      return "已完成";
    case "interrupted":
      return "待确认";
    case "failed":
      return "失败";
    case "cancelled":
      return "已取消";
    case "running":
      return "进行中";
    default:
      return status;
  }
}

function toVariant(status: CreativeHubTurnSummary["status"]): "secondary" | "destructive" | "outline" {
  if (status === "failed" || status === "cancelled") {
    return "destructive";
  }
  if (status === "interrupted") {
    return "secondary";
  }
  return "outline";
}

function toOrchestrationLabel(summary: CreativeHubTurnSummary): string | null {
  const mode = summary.orchestration?.mode;
  if (mode === "dynamic") {
    return "动态编排";
  }
  if (mode === "dynamic_fallback_static") {
    return "动态失败后转静态";
  }
  if (mode === "static") {
    return "静态编排";
  }
  return null;
}

export default function CreativeHubTurnSummaryCard({
  summary,
  onQuickAction,
}: CreativeHubTurnSummaryCardProps) {
  const orchestrationLabel = toOrchestrationLabel(summary);

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-slate-900">创作推进摘要</div>
          <div className="mt-1 text-xs text-slate-500">
            当前阶段：{summary.currentStage}
          </div>
        </div>
        <Badge variant={toVariant(summary.status)}>{toStatusLabel(summary.status)}</Badge>
      </div>

      <div className="mt-4 grid gap-3">
        {orchestrationLabel ? (
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">编排模式</div>
            <div className="mt-2 text-sm leading-6 text-slate-800">{orchestrationLabel}</div>
            {typeof summary.orchestration?.remainingPhaseCount === "number" || typeof summary.orchestration?.remainingStepCount === "number" ? (
              <div className="mt-1 text-xs text-slate-500">
                {typeof summary.orchestration?.remainingPhaseCount === "number" ? `剩余阶段 ${summary.orchestration.remainingPhaseCount}` : ""}
                {typeof summary.orchestration?.remainingPhaseCount === "number" && typeof summary.orchestration?.remainingStepCount === "number" ? " · " : ""}
                {typeof summary.orchestration?.remainingStepCount === "number" ? `剩余步骤 ${summary.orchestration.remainingStepCount}` : ""}
              </div>
            ) : null}
          </div>
        ) : null}
        {summary.currentPlanPhase ? (
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">动态计划阶段</div>
            <div className="mt-2 text-sm leading-6 text-slate-800">{summary.currentPlanPhase}</div>
          </div>
        ) : null}
        {summary.currentStepDescription ? (
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">当前步骤</div>
            <div className="mt-2 text-sm leading-6 text-slate-800">{summary.currentStepDescription}</div>
          </div>
        ) : null}
        {summary.waitReason ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-amber-700">等待原因</div>
            <div className="mt-2 text-sm leading-6 text-amber-800">{summary.waitReason}</div>
          </div>
        ) : null}
        {summary.lastReplanReason ? (
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">重规划原因</div>
            <div className="mt-2 text-sm leading-6 text-slate-800">{summary.lastReplanReason}</div>
          </div>
        ) : null}
        {summary.orchestration?.fallbackReason ? (
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">回退原因</div>
            <div className="mt-2 text-sm leading-6 text-slate-800">{summary.orchestration.fallbackReason}</div>
          </div>
        ) : null}
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">本轮判断</div>
          <div className="mt-2 text-sm leading-6 text-slate-800">{summary.intentSummary}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">本轮推进</div>
          <div className="mt-2 text-sm leading-6 text-slate-800">{summary.actionSummary}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">已确认变化</div>
          <div className="mt-2 text-sm leading-6 text-slate-800">{summary.impactSummary}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">建议下一步</div>
          <div className="mt-2 text-sm leading-6 text-slate-800">{summary.nextSuggestion}</div>
          {onQuickAction && summary.nextSuggestion.trim() ? (
            <div className="mt-3">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onQuickAction(summary.nextSuggestion)}
              >
                沿这个方向继续
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
