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
  latency: number | null;
  packetsSent: number;
  packetsLost: number;
  responseTime: number;
  alive: boolean;
};

export type HttpNodeResult = {
  node: string;
  statusCode: number;
  responseTime: number;
  alive: boolean;
};

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

export default function DetectionPanel({ title, protocol, placeholder, mode }: DetectionPanelProps) {
  const navigate = useNavigate();
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<PingNodeResult[] | null>(null);
  const [httpResults, setHttpResults] = useState<HttpNodeResult[] | null>(null);
  const [completedAt, setCompletedAt] = useState<string | null>(null);

  const handleInputChange = (value: string) => {
    setTarget(value);
    if (validationError) setValidationError(null);
  };

  const simulatePing = () => {
    setLoading(true);
    setPingResults(null);

    setTimeout(() => {
      const results: PingNodeResult[] = PING_NODES.map((node) => {
        const alive = Math.random() > 0.12;
        const sent = 5;
        const lost = alive ? (Math.random() > 0.7 ? 1 : Math.random() > 0.8 ? 2 : 0) : sent;
        const latency = alive ? Math.floor(Math.random() * 80 + 5 + Math.random() * 40) : null;

        return {
          node,
          latency,
          packetsSent: sent,
          packetsLost: lost,
          responseTime: alive ? (latency || 0) / 1000 : 0,
          alive,
        };
      });

      setPingResults(results);
      setCompletedAt(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
      setLoading(false);
    }, 2000 + Math.random() * 1500);
  };

  const simulateHttp = () => {
    setLoading(true);
    setHttpResults(null);

    const codePool = [200, 200, 200, 200, 200, 200, 301, 302, 403, 404, 500, 502, 503];

    setTimeout(() => {
      const results: HttpNodeResult[] = HTTP_NODES.map((node) => {
        const alive = Math.random() > 0.1;
        const statusCode = alive ? codePool[Math.floor(Math.random() * codePool.length)] : 0;

        return {
          node,
          statusCode,
          responseTime: alive ? Math.floor(Math.random() * 600 + 30 + Math.random() * 200) : 0,
          alive,
        };
      });

      setHttpResults(results);
      setCompletedAt(new Date().toLocaleTimeString("zh-CN", { hour12: false }));
      setLoading(false);
    }, 1500 + Math.random() * 1500);
  };

  const handleDetect = () => {
    const validation = isValidTarget(target);
    if (!validation.valid) {
      setValidationError(validation.reason || "无效的输入");
      return;
    }
    setValidationError(null);
    if (mode === "ping") simulatePing();
    else simulateHttp();
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