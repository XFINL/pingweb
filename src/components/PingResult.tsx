import { cn } from "@/lib/utils";
import { getNodesByGroup } from "@/data/nodes";
import NodeMap from "./NodeMap";
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
  const { domestic, overseas } = getNodesByGroup();
  const domesticResults = results.filter((r) => r.group === "domestic");
  const overseasResults = results.filter((r) => r.group === "overseas");

  const totalSent = results.reduce((s, r) => s + r.packetsSent, 0);
  const totalLost = results.reduce((s, r) => s + r.packetsLost, 0);
  const aliveCount = results.filter((r) => r.alive).length;
  const avgLatency = Math.round(
    results.filter((r) => r.latency !== null).reduce((s, r) => s + (r.latency || 0), 0) /
      Math.max(results.filter((r) => r.latency !== null).length, 1)
  );
  const resolvedIp = results[0]?.resolvedIp || "";

  const mapNodes = results.map((r) => ({
    id: r.node,
    label: r.label,
    lat: r.lat,
    lng: r.lng,
    value: r.latency,
    alive: r.alive,
  }));

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Summary header */}
      <div className="glass p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-[var(--text-primary)]">{target}</h2>
            <p className="text-[11px] text-[var(--text-tertiary)] font-light mt-0.5">
              全球节点 Ping 检测结果
              {resolvedIp && <span className="ml-2 font-mono">&#8594; {resolvedIp}</span>}
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)] font-light">
            <span className="tabular-nums">{aliveCount}/{results.length} 在线</span>
            <span className="tabular-nums">平均延迟 {avgLatency} ms</span>
            <span className="tabular-nums">总丢包 {totalLost}/{totalSent}</span>
          </div>
        </div>
        <div className="border-t border-[var(--glass-border)] mt-4 pt-3 flex justify-between text-[10px] text-[var(--text-tertiary)] font-light">
          <span>协议: {protocol}</span>
          <span>{completedAt}</span>
        </div>
      </div>

      {/* Global Map */}
      <NodeMap nodes={mapNodes} valueLabel="延迟" />

      {/* Domestic table */}
      <div className="glass p-5">
        <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--text-secondary)] mb-3">
          国内节点 &middot; {domestic.length} 个省份
        </h3>
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-black z-10">
              <tr className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
                <th className="text-left pb-2 pr-3">节点</th>
                <th className="text-left pb-2 pr-3">解析</th>
                <th className="text-right pb-2 pr-3 tabular-nums">延迟</th>
                <th className="text-right pb-2 pr-3 tabular-nums">发包</th>
                <th className="text-right pb-2 pr-3 tabular-nums">丢包</th>
                <th className="text-right pb-2 pr-3 tabular-nums">响应时间</th>
                <th className="text-right pb-2">状态</th>
              </tr>
            </thead>
            <tbody>
              {domesticResults.map((r, i) => (
                <tr
                  key={r.node}
                  className={cn(
                    "transition-colors duration-200",
                    "hover:bg-white/[0.03]",
                    i < domesticResults.length - 1 && "border-b border-[var(--glass-border)]"
                  )}
                >
                  <td className="py-2 pr-3">
                    <span className="text-xs text-[var(--text-primary)] font-medium">{r.node}</span>
                  </td>
                  <td className="py-2 pr-3">
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{r.resolvedIp}</span>
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {r.latency !== null ? (
                      <span className="text-xs font-mono tabular-nums text-[var(--text-primary)]">
                        {r.latency}<span className="text-[var(--text-tertiary)]"> ms</span>
                      </span>
                    ) : (
                      <span className="text-xs text-red-400/60">--</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    <span className="text-xs font-mono tabular-nums text-[var(--text-primary)]">{r.packetsSent}</span>
                  </td>
                  <td className="py-2 pr-3 text-right">
                    <span className={cn(
                      "text-xs font-mono tabular-nums",
                      r.packetsLost === 0 ? "text-green-400" : r.packetsLost < 3 ? "text-yellow-400" : "text-red-400"
                    )}>{r.packetsLost}</span>
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {r.alive ? (
                      <span className="text-xs font-mono tabular-nums text-[var(--text-primary)]">
                        {r.responseTime.toFixed(2)}<span className="text-[var(--text-tertiary)]"> s</span>
                      </span>
                    ) : (
                      <span className="text-xs text-red-400/60">--</span>
                    )}
                  </td>
                  <td className="py-2 text-right">{statusBadge(r.alive)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overseas table */}
      <div className="glass p-5">
        <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--text-secondary)] mb-3">
          海外节点 &middot; {overseas.length} 个
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
              <th className="text-left pb-2 pr-3">节点</th>
              <th className="text-left pb-2 pr-3">解析</th>
              <th className="text-right pb-2 pr-3 tabular-nums">延迟</th>
              <th className="text-right pb-2 pr-3 tabular-nums">发包</th>
              <th className="text-right pb-2 pr-3 tabular-nums">丢包</th>
              <th className="text-right pb-2 pr-3 tabular-nums">响应时间</th>
              <th className="text-right pb-2">状态</th>
            </tr>
          </thead>
          <tbody>
            {overseasResults.map((r, i) => (
              <tr
                key={r.node}
                className={cn(
                  "transition-colors duration-200 hover:bg-white/[0.03]",
                  i < overseasResults.length - 1 && "border-b border-[var(--glass-border)]"
                )}
              >
                <td className="py-2 pr-3">
                  <span className="text-xs text-[var(--text-primary)] font-medium">{r.node}</span>
                </td>
                <td className="py-2 pr-3">
                  <span className="text-[10px] font-mono text-[var(--text-tertiary)]">{r.resolvedIp}</span>
                </td>
                <td className="py-2 pr-3 text-right">
                  {r.latency !== null ? (
                    <span className="text-xs font-mono tabular-nums text-[var(--text-primary)]">
                      {r.latency}<span className="text-[var(--text-tertiary)]"> ms</span>
                    </span>
                  ) : (
                    <span className="text-xs text-red-400/60">--</span>
                  )}
                </td>
                <td className="py-2 pr-3 text-right">
                  <span className="text-xs font-mono tabular-nums text-[var(--text-primary)]">{r.packetsSent}</span>
                </td>
                <td className="py-2 pr-3 text-right">
                  <span className={cn(
                    "text-xs font-mono tabular-nums",
                    r.packetsLost === 0 ? "text-green-400" : r.packetsLost < 3 ? "text-yellow-400" : "text-red-400"
                  )}>{r.packetsLost}</span>
                </td>
                <td className="py-2 pr-3 text-right">
                  {r.alive ? (
                    <span className="text-xs font-mono tabular-nums text-[var(--text-primary)]">
                      {r.responseTime.toFixed(2)}<span className="text-[var(--text-tertiary)]"> s</span>
                    </span>
                  ) : (
                    <span className="text-xs text-red-400/60">--</span>
                  )}
                </td>
                <td className="py-2 text-right">{statusBadge(r.alive)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}