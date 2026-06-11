import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DetectionPanelProps {
  title: string;
  protocol: string;
  placeholder?: string;
}

type ResultStatus = "idle" | "loading" | "success" | "failure";

export default function DetectionPanel({ title, protocol, placeholder = "输入目标地址 (IP 或域名)" }: DetectionPanelProps) {
  const navigate = useNavigate();
  const [target, setTarget] = useState("");
  const [status, setStatus] = useState<ResultStatus>("idle");
  const [result, setResult] = useState<{ latency?: number; details?: string; error?: string } | null>(null);

  const handleDetect = () => {
    if (!target.trim()) return;

    setStatus("loading");
    setResult(null);

    // Simulate detection
    setTimeout(() => {
      const success = Math.random() > 0.3;
      if (success) {
        setStatus("success");
        setResult({
          latency: Math.floor(Math.random() * 120 + 5),
          details: `${protocol} 检测成功 - ${target}`,
        });
      } else {
        setStatus("failure");
        setResult({
          error: `无法连接到 ${target}`,
          details: `${protocol} 请求超时或无响应`,
        });
      }
    }, 1500 + Math.random() * 1000);
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
                className={cn(
                  "flex-1 h-11 px-4 bg-white/5 border border-[var(--glass-border)] rounded-xl",
                  "text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]",
                  "outline-none transition-all duration-200",
                  "focus:border-[var(--accent)] focus:bg-white/[0.07]",
                  "font-light tracking-normal"
                )}
              />
              <button
                onClick={handleDetect}
                disabled={!target.trim() || status === "loading"}
                className={cn(
                  "h-11 px-6 rounded-xl text-sm font-medium tracking-tight",
                  "bg-[var(--accent)] text-black",
                  "transition-all duration-200",
                  "hover:brightness-110 active:brightness-90",
                  "disabled:opacity-30 disabled:cursor-not-allowed",
                  "flex items-center gap-2"
                )}
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

          {/* Result area */}
          {status !== "idle" && (
            <div className={cn("glass p-6 animate-slide-up")}>
              {status === "loading" ? (
                <div className="flex items-center gap-4">
                  <Loader2 size={20} className="animate-spin text-[var(--accent)]" strokeWidth={1.5} />
                  <div className="flex-1">
                    <p className="text-sm text-[var(--text-secondary)] font-light">
                      正在检测 {target}...
                    </p>
                    <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent)] rounded-full animate-pulse" style={{ width: "60%" }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status header */}
                  <div className="flex items-center gap-3">
                    {status === "success" ? (
                      <CheckCircle size={20} className="text-green-400" strokeWidth={1.5} />
                    ) : (
                      <XCircle size={20} className="text-red-400" strokeWidth={1.5} />
                    )}
                    <div>
                      <p className={cn(
                        "text-sm font-medium",
                        status === "success" ? "text-green-400" : "text-red-400"
                      )}>
                        {status === "success" ? "连接成功" : "连接失败"}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] font-light mt-0.5">
                        {target}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="border-t border-[var(--glass-border)] pt-4 space-y-2">
                    {result?.latency && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[var(--text-secondary)] font-light">延迟</span>
                        <span className="text-sm text-[var(--text-primary)] font-medium">
                          {result.latency} ms
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--text-secondary)] font-light">协议</span>
                      <span className="text-sm text-[var(--text-primary)] font-mono">{protocol}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--text-secondary)] font-light">时间</span>
                      <span className="text-sm text-[var(--text-primary)]">
                        {new Date().toLocaleTimeString("zh-CN", { hour12: false })}
                      </span>
                    </div>
                    {result?.details && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[var(--text-secondary)] font-light">详情</span>
                        <span className="text-sm text-[var(--text-primary)] text-right max-w-[200px] truncate">
                          {result.details}
                        </span>
                      </div>
                    )}
                    {result?.error && (
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-[var(--text-secondary)] font-light">错误</span>
                        <span className="text-sm text-red-400 text-right max-w-[200px] truncate">
                          {result.error}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}