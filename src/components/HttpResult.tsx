import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";
import type { HttpResultData } from "./DetectionPanel";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusColor(code: number): string {
  if (code < 300) return "text-green-400";
  if (code < 400) return "text-yellow-400";
  return "text-red-400";
}

function statusBg(code: number): string {
  if (code < 300) return "bg-green-400/10 border-green-400/20";
  if (code < 400) return "bg-yellow-400/10 border-yellow-400/20";
  return "bg-red-400/10 border-red-400/20";
}

export default function HttpResult({ data, protocol }: { data: HttpResultData; protocol: string }) {
  const success = data.statusCode < 400;

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
            {data.statusCode} {data.statusText}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] font-light mt-0.5">
            {data.target}
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--glass-border)]" />

      {/* Status code badge */}
      <div className="flex justify-center">
        <div className={cn(
          "inline-flex items-center gap-3 px-5 py-3 rounded-xl border",
          statusBg(data.statusCode)
        )}>
          <span className={cn("text-2xl font-bold tabular-nums", statusColor(data.statusCode))}>
            {data.statusCode}
          </span>
          <span className="text-xs text-[var(--text-secondary)] font-light">
            {data.statusText}
          </span>
        </div>
      </div>

      {/* Timeline visualization */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)] mb-3">
          请求时间线
        </h3>
        <div className="space-y-2">
          {[
            { label: "DNS 解析", value: data.dnsLookup },
            { label: "TCP 连接", value: data.tcpConnect },
            { label: "TLS 握手", value: data.tlsHandshake },
          ].map(({ label, value }) => {
            const maxTime = Math.max(data.dnsLookup + data.tcpConnect + data.tlsHandshake, 1);
            return (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-secondary)] font-light w-16 shrink-0">
                  {label}
                </span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                    style={{ width: `${(value / maxTime) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--text-primary)] font-mono w-14 text-right tabular-nums">
                  {value} ms
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Response summary */}
      <div>
        <h3 className="text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)] mb-3">
          响应概况
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass !rounded-xl p-3">
            <p className="text-xs text-[var(--text-tertiary)] font-light">响应时间</p>
            <p className="text-lg font-medium text-[var(--text-primary)] tabular-nums mt-1">
              {data.responseTime} <span className="text-xs font-light text-[var(--text-secondary)]">ms</span>
            </p>
          </div>
          <div className="glass !rounded-xl p-3">
            <p className="text-xs text-[var(--text-tertiary)] font-light">内容大小</p>
            <p className="text-lg font-medium text-[var(--text-primary)] tabular-nums mt-1">
              {formatSize(data.contentSize)}
            </p>
          </div>
          <div className="glass !rounded-xl p-3">
            <p className="text-xs text-[var(--text-tertiary)] font-light">服务器</p>
            <p className="text-sm font-mono text-[var(--text-primary)] mt-1 truncate">{data.server}</p>
          </div>
          <div className="glass !rounded-xl p-3">
            <p className="text-xs text-[var(--text-tertiary)] font-light">重定向</p>
            <p className="text-lg font-medium text-[var(--text-primary)] tabular-nums mt-1">
              {data.redirectCount}
            </p>
          </div>
        </div>
      </div>

      {/* Content type */}
      <div className="flex items-center gap-2 text-[10px] text-[var(--text-tertiary)] font-light">
        <span className="px-2 py-0.5 rounded bg-white/5 font-mono truncate max-w-[200px]">
          {data.contentType}
        </span>
      </div>

      {/* Meta */}
      <div className="border-t border-[var(--glass-border)] pt-3 flex justify-between text-[10px] text-[var(--text-tertiary)] font-light">
        <span>协议: {protocol}</span>
        <span>{new Date().toLocaleTimeString("zh-CN", { hour12: false })}</span>
      </div>
    </div>
  );
}