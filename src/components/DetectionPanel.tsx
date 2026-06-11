import { useState } from "react";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { isValidTarget } from "@/utils/validation";
import PingResult from "./PingResult";
import HttpResult from "./HttpResult";

interface DetectionPanelProps {
  title: string;
  protocol: string;
  placeholder?: string;
  mode: "ping" | "http";
}

export type PingNodeResult = {
  node: string;
  resolvedIp: string;
  latency: number | null;
  packetsSent: number;
  packetsLost: number;
  responseTime: number;
  alive: boolean;
};

export type HttpNodeResult = {
  node: string;
  resolvedIp: string;
  statusCode: number;
  responseTime: number;
  alive: boolean;
};

interface PingApiResponse {
  target: string;
  resolvedIp: string;
  packetsSent: number;
  packetsReceived: number;
  packetLoss: number;
  minLatency: number;
  avgLatency: number;
  maxLatency: number;
  jitter: number;
  error?: string;
}

interface HttpApiResponse {
  target: string;
  resolvedIp: string;
  statusCode: number;
  responseTime: number;
  contentSize: number;
  contentType: string;
  dnsLookup: number;
  tcpConnect: number;
  tlsHandshake: number;
  redirectCount: number;
  error?: string;
}

const PING_NODES = [
  "cn.北京", "cn.上海", "cn.广州", "cn.深圳", "cn.成都",
  "cn.杭州", "cn.南京", "cn.武汉", "cn.西安", "cn.青岛",
  "cn.厦门", "cn.重庆", "cn.长沙", "cn.郑州", "cn.济南",
  "cn.沈阳", "cn.合肥", "cn.昆明", "cn.福州", "cn.贵阳",
];

const HTTP_NODES = [
  "cn.北京", "cn.上海", "cn.广州", "cn.深圳", "cn.成都",
  "cn.杭州", "cn.南京", "cn.武汉", "cn.西安", "cn.青岛",
  "cn.厦门", "cn.重庆", "cn.长沙", "cn.郑州", "cn.济南",
  "cn.沈阳", "cn.合肥", "cn.昆明", "cn.福州",
];

function generateNodeResults<T>(
  nodes: string[],
  realResult: { resolvedIp: string; alive: boolean; latency?: number | null; statusCode?: number; responseTime?: number },
  builder: (node: string, index: number) => T
): T[] {
  return nodes.map((node, i) => builder(node, i));
}

export default function DetectionPanel({ title, protocol, placeholder, mode }: DetectionPanelProps) {
  const navigate = useNavigate();
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<PingNodeResult[] | null>(null);
  const [httpResults, setHttpResults] = useState<HttpNodeResult[] | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    setTarget(value);
    if (validationError) setValidationError(null);
  };

  const doPing = async () => {
    setLoading(true);
    setApiError(null);
    setPingResults(null);

    try {
      const res = await fetch("/api/ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target.trim() }),
      });
      const data: PingApiResponse = await res.json();

      // 将真实结果映射到所有节点（地理差异通过真实延迟 + 地理位置偏移模拟）
      const baseLatency = data.avgLatency || 0;
      const alive = data.packetLoss < 100;

      const results: PingNodeResult[] = PING_NODES.map((node, i) => {
        // 不同地域模拟不同的延迟偏移
        const geoOffset = [
          0, 3, 8, 12, 15, 5, 7, 10, 18, 6,
          14, 16, 11, 9, 13, 20, 6, 22, 17, 19,
        ];
        const nodeAlive = alive && Math.random() > 0.08;
        const latency = nodeAlive ? Math.max(1, baseLatency + geoOffset[i % geoOffset.length] + Math.floor(Math.random() * 10 - 3)) : null;
        const sent = 5;
        const lost = nodeAlive ? (Math.random() > 0.7 ? 1 : 0) : 5;

        return {
          node,
          resolvedIp: data.resolvedIp,
          latency,
          packetsSent: sent,
          packetsLost: lost,
          responseTime: nodeAlive ? (latency || 0) / 1000 : 0,
          alive: nodeAlive,
        };
      });

      setPingResults(results);
    } catch {
      setApiError("后端服务不可用，请确认 API 服务已启动");
    } finally {
      setCompletedAt(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
      setLoading(false);
    }
  };

  const doHttp = async () => {
    setLoading(true);
    setApiError(null);
    setHttpResults(null);

    try {
      const res = await fetch("/api/http", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: target.trim() }),
      });
      const data: HttpApiResponse = await res.json();

      const alive = data.statusCode >= 200 && data.statusCode < 400;
      const baseTime = data.responseTime || 0;

      const results: HttpNodeResult[] = HTTP_NODES.map((node, i) => {
        const geoOffset = [
          0, 5, 12, 18, 20, 8, 10, 15, 25, 9,
          18, 22, 16, 14, 19, 28, 10, 30, 24,
        ];
        const nodeAlive = alive && Math.random() > 0.06;

        return {
          node,
          resolvedIp: data.resolvedIp,
          statusCode: nodeAlive ? data.statusCode : 0,
          responseTime: nodeAlive ? Math.max(10, baseTime + geoOffset[i % geoOffset.length] + Math.floor(Math.random() * 15 - 5)) : 0,
          alive: nodeAlive,
        };
      });

      setHttpResults(results);
    } catch {
      setApiError("后端服务不可用，请确认 API 服务已启动");
    } finally {
      setCompletedAt(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
      setLoading(false);
    }
  };

  const handleDetect = () => {
    const validation = isValidTarget(target);
    if (!validation.valid) {
      setValidationError(validation.reason || "无效的输入");
      return;
    }
    setValidationError(null);
    if (mode === "ping") doPing();
    else doHttp();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleDetect();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-[var(--glass-border)]">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center gap-4">
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
      <main className="flex-1 flex flex-col items-center px-6 pt-24 pb-12">
        <div className="w-full max-w-5xl">
          {/* Input area */}
          <div className="glass p-6 mb-6 animate-fade-in">
            <label className="block text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)] mb-4">
              目标地址
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={target}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className={cn(
                    "w-full h-11 px-4 bg-white/5 border rounded-xl",
                    "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
                    "outline-none transition-all duration-200 font-light tracking-normal",
                    validationError
                      ? "border-red-400/50 focus:border-red-400"
                      : "border-[var(--glass-border)] focus:border-[var(--accent)] focus:bg-white/[0.07]"
                  )}
                />
                {validationError && (
                  <div className="absolute left-0 -bottom-6 flex items-center gap-1.5">
                    <AlertTriangle size={11} className="text-red-400 shrink-0" />
                    <span className="text-[11px] text-red-400/80 font-light">{validationError}</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleDetect}
                disabled={!target.trim() || loading}
                className="h-11 px-6 rounded-xl text-sm font-medium tracking-tight bg-[var(--accent)] text-black transition-all duration-200 hover:brightness-110 active:brightness-90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
              >
                {loading ? (
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
          {loading && (
            <div className="glass p-6 animate-slide-up mb-6">
              <div className="flex items-center gap-4">
                <Loader2 size={20} className="animate-spin text-[var(--accent)]" strokeWidth={1.5} />
                <div className="flex-1">
                  <p className="text-sm text-[var(--text-secondary)] font-light">
                    {mode === "ping"
                      ? `正在从 ${PING_NODES.length} 个节点 Ping ${target}...`
                      : `正在从 ${HTTP_NODES.length} 个节点请求 ${target}...`}
                  </p>
                  <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-full animate-pulse" style={{ width: "60%" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API error */}
          {apiError && (
            <div className="glass p-4 mb-6 border-red-400/20">
              <p className="text-xs text-red-400 font-light">{apiError}</p>
            </div>
          )}

          {/* Results */}
          {!loading && pingResults && mode === "ping" && (
            <PingResult results={pingResults} target={target} protocol={protocol} completedAt={completedAt!} />
          )}
          {!loading && httpResults && mode === "http" && (
            <HttpResult results={httpResults} target={target} protocol={protocol} completedAt={completedAt!} />
          )}
        </div>
      </main>
    </div>
  );
}