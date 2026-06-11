import { cn } from "@/lib/utils";
import type { PingNodeResult } from "./DetectionPanel";

interface PingResultProps {
  results: PingNodeResult[];
  target: string;
  protocol: string;
  completedAt: string;
}

function statusBadge(alive: boolean) {
  return alive
    ? <span className="text-[10px] text-green-400 font-medium">正常</span>
    : <span className="text-[10px] text-red-400 font-medium">超时</span>;
}

export default function PingResult({ results, target, protocol, completedAt }: PingResultProps) {
  const totalSent = results.reduce((s, r) => s + r.packetsSent, 0);
  const totalLost = results.reduce((s, r) => s + r.packetsLost, 0);
  const aliveCount = results.filter((r) => r.alive).length;
  const avgLatency = Math.round(
    results.filter((r) => r.latency !== null).reduce((s, r) => s + (r.latency || 0), 0) /
      Math.max(results.filter((r) => r.latency !== null).length, 1)
  );

  return (
    <div className="glass p-6 animate-slide-up space-y-5">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-[var(--text-primary)]">{target}</h2>
          <p className="text-[11px] text-[var(--text-tertiary)] font-light mt-0.5">多节点 Ping 检测结果</p>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)] font-light">
          <span className="tabular-nums">{aliveCount}/{results.length} 在线</span>
          <span className="tabular-nums">平均延迟 {avgLatency} ms</span>
          <span className="tabular-nums">总丢包 {totalLost}/{totalSent}</span>
        </div>
      </div>

      <div className="border-t border-[var(--glass-border)]" />

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
              <th className="text-left pb-3 pr-4">节点</th>
              <th className="text-right pb-3 pr-4 tabular-nums">延迟</th>
              <th className="text-right pb-3 pr-4 tabular-nums">发包</th>
              <th className="text-right pb-3 pr-4 tabular-nums">丢包</th>
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
                  {r.latency !== null ? (
                    <span className="text-xs font-mono tabular-nums text-[var(--text-primary)]">
                      {r.latency}
                      <span className="text-[var(--text-tertiary)]"> ms</span>
                    </span>
                  ) : (
                    <span className="text-xs text-red-400/60">--</span>
                  )}
                </td>
                <td className="py-2.5 pr-4 text-right">
                  <span className="text-xs font-mono tabular-nums text-[var(--text-primary)]">{r.packetsSent}</span>
                </td>
                <td className="py-2.5 pr-4 text-right">
                  <span className={cn(
                    "text-xs font-mono tabular-nums",
                    r.packetsLost === 0 ? "text-green-400" : r.packetsLost < 3 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {r.packetsLost}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-right">
                  {r.alive ? (
                    <span className="text-xs font-mono tabular-nums text-[var(--text-primary)]">
                      {r.responseTime.toFixed(2)}
                      <span className="text-[var(--text-tertiary)]"> s</span>
                    </span>
                  ) : (
                    <span className="text-xs text-red-400/60">--</span>
                  )}
                </td>
                <td className="py-2.5 text-right">{statusBadge(r.alive)}</td>
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