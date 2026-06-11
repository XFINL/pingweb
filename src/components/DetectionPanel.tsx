import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PingResult from "./PingResult";
import HttpResult from "./HttpResult";

interface DetectionPanelProps {
  title: string;
  protocol: string;
  placeholder?: string;
  mode: "ping" | "http";
}

export type ResultStatus = "idle" | "loading" | "success" | "failure";

export interface PingResultData {
  target: string;
  packetsSent: number;
  packetsReceived: number;
  packetLoss: number;
  minLatency: number;
  avgLatency: number;
  maxLatency: number;
  jitter: number;
  ttl: number;
  hops: number;
  individualPings: { seq: number; latency: number | null }[];
  error?: string;
}

export interface HttpResultData {
  target: string;
  statusCode: number;
  statusText: string;
  responseTime: number;
  contentSize: number;
  server: string;
  contentType: string;
  dnsLookup: number;
  tcpConnect: number;
  tlsHandshake: number;
  redirectCount: number;
  error?: string;
}

export default function DetectionPanel({ title, protocol, placeholder, mode }: DetectionPanelProps) {
  const navigate = useNavigate();
  const [target, setTarget] = useState("");
  const [status, setStatus] = useState<ResultStatus>("idle");
  const [pingResult, setPingResult] = useState<PingResultData | null>(null);
  const [httpResult, setHttpResult] = useState<HttpResultData | null>(null);

  const simulatePing = () => {
    setStatus("loading");
    setPingResult(null);

    setTimeout(() => {
      const success = Math.random() > 0.25;
      const sent = 5;
      const received = success ? (Math.random() > 0.3 ? sent : sent - 1) : 0;
      const loss = Math.round(((sent - received) / sent) * 100);
      const baseLatency = Math.floor(Math.random() * 80 + 10);

      const pings = Array.from({ length: sent }, (_, i) => ({
        seq: i + 1,
        latency: received > i ? baseLatency + Math.floor(Math.random() * 30 - 10) : null,
      }));

      const validLatencies = pings.filter((p) => p.latency !== null).map((p) => p.latency!);

      setPingResult({
        target,
        packetsSent: sent,
        packetsReceived: received,
        packetLoss: loss,
        minLatency: validLatencies.length ? Math.min(...validLatencies) : 0,
        avgLatency: validLatencies.length ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length) : 0,
        maxLatency: validLatencies.length ? Math.max(...validLatencies) : 0,
        jitter: validLatencies.length > 1
          ? Math.round(Math.sqrt(validLatencies.reduce((sum, v) => sum + Math.pow(v - (validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length), 2), 0) / validLatencies.length))
          : 0,
        ttl: Math.random() > 0.5 ? 64 : 128,
        hops: Math.floor(Math.random() * 15 + 3),
        individualPings: pings,
        error: success ? undefined : `请求超时: 目标 ${target} 无响应`,
      });
      setStatus(success ? "success" : "failure");
    }, 1800 + Math.random() * 1200);
  };

  const simulateHttp = () => {
    setStatus("loading");
    setHttpResult(null);

    setTimeout(() => {
      const codes = [200, 200, 200, 200, 301, 302, 401, 403, 404, 500, 502, 503];
      const statusCode = codes[Math.floor(Math.random() * codes.length)];
      const statusTexts: Record<number, string> = {
        200: "OK", 301: "Moved Permanently", 302: "Found",
        401: "Unauthorized", 403: "Forbidden", 404: "Not Found",
        500: "Internal Server Error", 502: "Bad Gateway", 503: "Service Unavailable",
      };
      const servers = ["nginx/1.24.0", "Cloudflare", "Apache/2.4.57", "openresty/1.21.4", "caddy", "gunicorn"];
      const contentTypes = ["text/html; charset=utf-8", "application/json", "text/plain", "text/html"];

      const success = statusCode < 400;

      setHttpResult({
        target,
        statusCode,
        statusText: statusTexts[statusCode] || "Unknown",
        responseTime: Math.floor(Math.random() * 800 + 50),
        contentSize: Math.floor(Math.random() * 50000 + 500),
        server: servers[Math.floor(Math.random() * servers.length)],
        contentType: contentTypes[Math.floor(Math.random() * contentTypes.length)],
        dnsLookup: Math.floor(Math.random() * 60 + 5),
        tcpConnect: Math.floor(Math.random() * 40 + 10),
        tlsHandshake: Math.floor(Math.random() * 80 + 20),
        redirectCount: Math.floor(Math.random() * 3),
        error: success ? undefined : `HTTP ${statusCode} ${statusTexts[statusCode]}`,
      });
      setStatus(success ? "success" : "failure");
    }, 1200 + Math.random() * 1000);
  };

  const handleDetect = () => {
    if (!target.trim()) return;
    if (mode === "ping") simulatePing();
    else simulateHttp();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-[var(--glass-border)]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            返回
          </button>
          <span className="text-[var(--text-tertiary)] font-light">/</span>
          <h1 className="text-sm font-medium tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-xl">
          {/* Input area */}
          <div className="glass p-6 mb-6 animate-fade-in">
            <label className="block text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)] mb-4">
              目标地址
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDetect()}
                placeholder={placeholder}
                className="flex-1 h-11 px-4 bg-white/5 border border-[var(--glass-border)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] outline-none transition-all duration-200 focus:border-[var(--accent)] focus:bg-white/[0.07] font-light tracking-normal"
              />
              <button
                onClick={handleDetect}
                disabled={!target.trim() || status === "loading"}
                className="h-11 px-6 rounded-xl text-sm font-medium tracking-tight bg-[var(--accent)] text-black transition-all duration-200 hover:brightness-110 active:brightness-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    检测中
                  </>
                ) : (
                  "检测"
                )}
              </button>
            </div>
          </div>

          {/* Loading */}
          {status === "loading" && (
            <div className="glass p-6 animate-slide-up">
              <div className="flex items-center gap-4">
                <Loader2 size={20} className="animate-spin text-[var(--accent)]" strokeWidth={1.5} />
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-secondary)] font-light">
                    {mode === "ping" ? `正在 Ping ${target}...` : `正在请求 ${target}...`}
                  </p>
                  <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-full animate-pulse" style={{ width: "60%" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {status !== "idle" && status !== "loading" && mode === "ping" && pingResult && (
            <PingResult data={pingResult} protocol={protocol} />
          )}
          {status !== "idle" && status !== "loading" && mode === "http" && httpResult && (
            <HttpResult data={httpResult} protocol={protocol} />
          )}
        </div>
      </main>
    </div>
  );
}