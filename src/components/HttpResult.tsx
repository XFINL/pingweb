import { cn } from "@/lib/utils";
import { getNodesByGroup } from "@/data/nodes";
import NodeMap from "./NodeMap";
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
  const { domestic, overseas } = getNodesByGroup();
  const domesticResults = results.filter((r) => r.group === "domestic");
  const overseasResults = results.filter((r) => r.group === "overseas");

  const aliveCount = results.filter((r) => r.alive).length;
  const avgResponseTime = Math.round(
    results.filter((r) => r.alive).reduce((s, r) => s + r.responseTime, 0) /
      Math.max(aliveCount, 1)
  );
  const resolvedIp = results[0]?.resolvedIp || "";

  const mapNodes = results.map((r) => ({
    id: r.node,
    label: r.label,
    lat: r.lat,
    lng: r.lng,
    value: r.responseTime > 0 ? r.responseTime : null,
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
              全球节点 HTTP 检测结果
              {resolvedIp && <span className="ml-2 font-mono">&#8594; {resolvedIp}</span>}
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)] font-light">
            <span className="tabular-nums">{aliveCount}/{results.length} 在线</span>
            <span className="tabular-nums">平均响应 {avgResponseTime} ms</span>
          </div>
        </div>
        <div className="border-t border-[var(--glass-border)] mt-4 pt-3 flex justify-between text-[10px] text-[var(--text-tertiary)] font-light">
          <span>协议: {protocol}</span>
          <span>{completedAt}</span>
        </div>
      </div>

      {/* Global Map */}
      <NodeMap nodes={mapNodes} valueLabel="响应时间" />

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
                <th className="text-right pb-2 pr-3 tabular-nums">状态码</th>
                <th className="text-right pb-2 pr-3 tabular-nums">响应时间</th>
                <th className="text-right pb-2">状态</th>
              </tr>
            </thead>
            <tbody>
              {domesticResults.map((r, i) => (
                <tr
                  key={r.node}
                  className={cn(
                    "transition-colors duration-200 hover:bg-white/[0.03]",
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
                    {r.alive ? (
                      <span className={cn("text-xs font-mono tabular-nums font-medium", statusCodeClass(r.statusCode))}>
                        {r.statusCode}
                      </span>
                    ) : (
                      <span className="text-xs text-red-400/60">--</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {r.alive ? (
                      <span className="text-xs font-mono tabular-nums text-[var(--text-primary)]">
                        {r.responseTime}<span className="text-[var(--text-tertiary)]"> ms</span>
                      </span>
                    ) : (
                      <span className="text-xs text-red-400/60">--</span>
                    )}
                  </td>
                  <td className="py-2 text-right">{statusBadge(r.alive, r.statusCode)}</td>
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
              <th className="text-right pb-2 pr-3 tabular-nums">状态码</th>
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
                  {r.alive ? (
                    <span className={cn("text-xs font-mono tabular-nums font-medium", statusCodeClass(r.statusCode))}>
                      {r.statusCode}
                    </span>
                  ) : (
                    <span className="text-xs text-red-400/60">--</span>
                  )}
                </td>
                <td className="py-2 pr-3 text-right">
                  {r.alive ? (
                    <span className="text-xs font-mono tabular-nums text-[var(--text-primary)]">
                      {r.responseTime}<span className="text-[var(--text-tertiary)]"> ms</span>
                    </span>
                  ) : (
                    <span className="text-xs text-red-400/60">--</span>
                  )}
                </td>
                <td className="py-2 text-right">{statusBadge(r.alive, r.statusCode)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}