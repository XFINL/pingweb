import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import type { PingResultData } from "./DetectionPanel";

function LatencyBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const color =
    value < 50 ? "bg-green-500" : value < 100 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-[var(--text-secondary)] font-mono w-14 text-right tabular-nums">
        {value} ms
      </span>
    </div>
  );
}

export default function PingResult({ data, protocol }: { data: PingResultData; protocol: string }) {
  const success = data.packetLoss < 100;

  const formatLatency = (v: number) => `${v} ms`;

  return (
    <div className="glass p-6 animate-slide-up space-y-5">
      {/* Status header */}
      <div className="flex items-center gap-3">
        {success ? (
          <CheckCircle size={20} className="text-green-400 shrink-0" strokeWidth={1.5} />
        ) : (
          <XCircle size={20} className="text-red-400 shrink-0" strokeWidth={1.5} />
        )}
        <div>
          <p className={cn("text-sm font-medium", success ? "text-green-400" : "text-red-400")}>
            {success ? "连通正常" : "无法连通"}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] font-light mt-0.5">
            {data.target}
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--glass-border)]" />

      {/* Packet stats */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)] mb-3">
          数据包统计
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <div className="glass !rounded-xl p-3 text-center">
            <p className="text-lg font-medium text-[var(--text-primary)] tabular-nums">{data.packetsSent}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-1">发送</p>
          </div>
          <div className="glass !rounded-xl p-3 text-center">
            <p className="text-lg font-medium text-green-400 tabular-nums">{data.packetsReceived}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-1">接收</p>
          </div>
          <div className="glass !rounded-xl p-3 text-center">
            <p className={cn(
              "text-lg font-medium tabular-nums",
              data.packetLoss === 0 ? "text-green-400" : data.packetLoss < 30 ? "text-yellow-400" : "text-red-400"
            )}>
              {data.packetLoss}%
            </p>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-1">丢包</p>
          </div>
          <div className="glass !rounded-xl p-3 text-center">
            <p className="text-lg font-medium text-[var(--text-primary)] tabular-nums">{data.ttl}</p>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mt-1">TTL</p>
          </div>
        </div>
      </div>

      {/* Latency stats */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)] mb-3">
          延迟统计
        </h3>
        <div className="space-y-2">
          {[
            { label: "最小延迟", value: data.minLatency },
            { label: "平均延迟", value: data.avgLatency },
            { label: "最大延迟", value: data.maxLatency },
            { label: "抖动", value: data.jitter },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-secondary)] font-light w-16 shrink-0">
                {label}
              </span>
              {label === "抖动" ? (
                <span className="text-sm text-[var(--text-primary)] font-mono tabular-nums">
                  &plusmn;{value} ms
                </span>
              ) : (
                <LatencyBar value={value} max={Math.max(data.maxLatency, 1)} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Individual pings */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)] mb-3">
          逐包响应
        </h3>
        <div className="space-y-1.5">
          {data.individualPings.map((p) => (
            <div key={p.seq} className="flex items-center gap-3 text-xs">
              <span className="text-[var(--text-tertiary)] font-mono w-6">#{p.seq}</span>
              {p.latency !== null ? (
                <>
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--accent)]"
                      style={{ width: `${Math.min((p.latency / Math.max(data.maxLatency, 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-[var(--text-primary)] font-mono w-14 text-right tabular-nums">
                    {p.latency} ms
                  </span>
                </>
              ) : (
                <>
                  <div className="flex-1" />
                  <span className="text-red-400 font-mono">超时</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Meta */}
      <div className="border-t border-[var(--glass-border)] pt-3 flex justify-between text-[10px] text-[var(--text-tertiary)] font-light">
        <span>协议: {protocol}</span>
        <span>跳数: ~{data.hops}</span>
        <span>{new Date().toLocaleTimeString("zh-CN", { hour12: false })}</span>
      </div>
    </div>
  );
}