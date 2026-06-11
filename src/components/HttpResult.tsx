import { cn } from "@/lib/utils";
import type { HttpNodeResult } from "./DetectionPanel";

interface HttpResultProps {
  results: HttpNodeResult[];
  target: string;
  protocol: string;
  completedAt: string;
}

function statusCodeClass(code: number): string {
  if (code >= 200 && code < 300) return "text-green-400";
  if (code >= 300 && code < 400) return "text-yellow-400";
  if (code >= 400) return "text-red-400";
  return "text-[var(--text-tertiary)]";
}

function statusBadge(alive: boolean, code: number) {
  if (!alive) return <span className="text-[10px] text-red-400 font-medium">超时</span>;
  if (code < 300) return <span className="text-[10px] text-green-400 font-medium">正常</span>;
  if (code < 400) return <span className="text-[10px] text-yellow-400 font-medium">重定向</span>;
  return <span className="text-[10px] text-red-400 font-medium">错误</span>;
}

export default function HttpResult({ results, target, protocol, completedAt }: HttpResultProps) {
  const aliveCount = results.filter((r) => r.alive).length;
  const avgResponseTime = Math.round(
    results.filter((r) => r.alive).reduce((s, r) => s + r.responseTime, 0) /
      Math.max(aliveCount, 1)
  );

  return (
    <div className="glass p-6 animate-slide-up space-y-5">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-[var(--text-primary)]">{target}</h2>
          <p className="text-[11px] text-[var(--text-tertiary)] font-light mt-0.5">多节点 HTTP 检测结果</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)] font-light">
          <span className="tabular-nums">{aliveCount}/{results.length} 在线</span>
          <span className="tabular-nums">平均响应 {avgResponseTime} ms</span>
        </div>
      </div>

      <div className="border-t border-[var(--glass-border)]" />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
              <th className="text-left pb-3 pr-4">节点</th>
              <th className="text-right pb-3 pr-4 tabular-nums">状态码</th>
              <th className="text-right pb-3 pr-4 tabular-nums">响应时间</th>
              <th className="text-right pb-3">状态</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr
                key={r.node}
                className={cn(
                  "transition-colors duration-200",
                  "hover:bg-white/[0.03]",
                  i < results.length - 1 && "border-b border-[var(--glass-border)]"
                )}
              >
                <td className="py-2.5 pr-4">
                  <span className="text-xs text-[var(--text-primary)] font-medium">{r.node}</span>
                </td>
                <td className="py-2.5 pr-4 text-right">
                  {r.alive ? (
                    <span className={cn("text-xs font-mono tabular-nums font-medium", statusCodeClass(r.statusCode))}>
                      {r.statusCode}
                    </span>
                  ) : (
                    <span className="text-xs text-red-400/60">--</span>
                  )}
                </td>
                <td className="py-2.5 pr-4 text-right">
                  {r.alive ? (
                    <span className="text-xs font-mono tabular-nums text-[var(--text-primary)]">
                      {r.responseTime}
                      <span className="text-[var(--text-tertiary)]"> ms</span>
                    </span>
                  ) : (
                    <span className="text-xs text-red-400/60">--</span>
                  )}
                </td>
                <td className="py-2.5 text-right">{statusBadge(r.alive, r.statusCode)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Meta */}
      <div className="border-t border-[var(--glass-border)] pt-3 flex justify-between text-[10px] text-[var(--text-tertiary)] font-light">
        <span>协议: {protocol}</span>
        <span>{completedAt}</span>
      </div>
    </div>
  );
}