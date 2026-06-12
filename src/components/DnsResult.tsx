import { cn } from "@/lib/utils";
import NodeMap from "./NodeMap";

export type DnsNodeResult = {
  node: string;
  label: string;
  provider: string;
  dnsServer: string;
  lat: number;
  lng: number;
  group: "domestic" | "overseas";
  resolvedIp: string;
  allIps: string[];
  responseTime: number;
  recordType: string;
  alive: boolean;
};

interface DnsResultProps {
  results: DnsNodeResult[];
  target: string;
  completedAt: string;
}

export default function DnsResult({ results, target, completedAt }: DnsResultProps) {
  const domesticResults = results.filter((r) => r.group === "domestic");
  const overseasResults = results.filter((r) => r.group === "overseas");

  const aliveCount = results.filter((r) => r.alive).length;
  const avgResponse = Math.round(
    results.filter((r) => r.alive).reduce((s, r) => s + r.responseTime, 0) /
      Math.max(aliveCount, 1)
  );

  // 地图数据：按 node ID 聚合（去重）
  const nodeValueMap = new Map<string, number[]>();
  for (const r of results) {
    if (r.responseTime > 0) {
      const arr = nodeValueMap.get(r.node) || [];
      arr.push(r.responseTime);
      nodeValueMap.set(r.node, arr);
    }
  }
  const mapNodes = Array.from(nodeValueMap.entries()).map(([nodeId, times]) => {
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const first = results.find((r) => r.node === nodeId);
    return {
      id: nodeId,
      label: first?.label || nodeId,
      value: avg,
      alive: true,
    };
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Summary header */}
      <div className="glass p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-[var(--text-primary)]">{target}</h2>
            <p className="text-[11px] text-[var(--text-tertiary)] font-light mt-0.5">
              全球 DNS 解析结果（A 记录）
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[var(--text-secondary)] font-light">
            <span className="tabular-nums">{aliveCount}/{results.length} 成功</span>
            <span className="tabular-nums">平均响应 {avgResponse} ms</span>
          </div>
        </div>
        <div className="border-t border-[var(--glass-border)] mt-4 pt-3 flex justify-between text-[10px] text-[var(--text-tertiary)] font-light">
          <span>DNS 记录类型: A</span>
          <span>{completedAt}</span>
        </div>
      </div>

      {/* Global Map */}
      <NodeMap nodes={mapNodes} valueLabel="DNS 响应" />

      {/* Domestic table */}
      <div className="glass p-5">
        <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--text-secondary)] mb-3">
          国内 DNS 服务器 &middot; {domesticResults.length} 个
        </h3>
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-black z-10">
              <tr className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
                <th className="text-left pb-2 pr-3">节点</th>
                <th className="text-left pb-2 pr-3">DNS 服务器</th>
                <th className="text-left pb-2 pr-3 font-mono">解析 IP</th>
                <th className="text-right pb-2 pr-3 tabular-nums">响应时间</th>
                <th className="text-right pb-2">状态</th>
              </tr>
            </thead>
            <tbody>
              {domesticResults.map((r, i) => (
                <tr
                  key={`${r.provider}-${r.dnsServer}`}
                  className={cn(
                    "transition-colors duration-200 hover:bg-white/[0.03]",
                    i < domesticResults.length - 1 && "border-b border-[var(--glass-border)]"
                  )}
                >
                  <td className="py-2 pr-3">
                    <span className="text-xs text-[var(--text-primary)] font-medium">{r.node}</span>
                  </td>
                  <td className="py-2 pr-3">
                    <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                      {r.provider}
                    </span>
                    <span className="text-[9px] text-[var(--text-tertiary)] ml-1">
                      @{r.dnsServer}
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    {r.alive ? (
                      <span className="text-[10px] font-mono text-[var(--text-primary)]">
                        {r.resolvedIp}
                      </span>
                    ) : (
                      <span className="text-[10px] text-red-400/60">--</span>
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
                  <td className="py-2 text-right">
                    {r.alive
                      ? <span className="text-[10px] text-green-400 font-medium">成功</span>
                      : <span className="text-[10px] text-red-400 font-medium">超时</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overseas table */}
      <div className="glass p-5">
        <h3 className="text-[11px] font-medium uppercase tracking-widest text-[var(--text-secondary)] mb-3">
          海外 DNS 服务器 &middot; {overseasResults.length} 个
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-medium">
              <th className="text-left pb-2 pr-3">节点</th>
              <th className="text-left pb-2 pr-3">DNS 服务器</th>
              <th className="text-left pb-2 pr-3 font-mono">解析 IP</th>
              <th className="text-right pb-2 pr-3 tabular-nums">响应时间</th>
              <th className="text-right pb-2">状态</th>
            </tr>
          </thead>
          <tbody>
            {overseasResults.map((r, i) => (
              <tr
                key={`${r.provider}-${r.dnsServer}`}
                className={cn(
                  "transition-colors duration-200 hover:bg-white/[0.03]",
                  i < overseasResults.length - 1 && "border-b border-[var(--glass-border)]"
                )}
              >
                <td className="py-2 pr-3">
                  <span className="text-xs text-[var(--text-primary)] font-medium">{r.label}</span>
                </td>
                <td className="py-2 pr-3">
                  <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                    {r.provider}
                  </span>
                  <span className="text-[9px] text-[var(--text-tertiary)] ml-1">
                    @{r.dnsServer}
                  </span>
                </td>
                <td className="py-2 pr-3">
                  {r.alive ? (
                    <span className="text-[10px] font-mono text-[var(--text-primary)]">
                      {r.resolvedIp}
                    </span>
                  ) : (
                    <span className="text-[10px] text-red-400/60">--</span>
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
                <td className="py-2 text-right">
                  {r.alive
                    ? <span className="text-[10px] text-green-400 font-medium">成功</span>
                    : <span className="text-[10px] text-red-400 font-medium">超时</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}