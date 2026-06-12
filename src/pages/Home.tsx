import ToolCard from "@/components/ToolCard";

const tools = [
  {
    title: "HTTP v4",
    subtitle: "IPv4 协议 HTTP 连通性检测",
    path: "/http-v4",
    icon: "http-v4" as const,
  },
  {
    title: "HTTP v6",
    subtitle: "IPv6 协议 HTTP 连通性检测",
    path: "/http-v6",
    icon: "http-v6" as const,
  },
  {
    title: "Ping v4",
    subtitle: "IPv4 协议 ICMP 连通性检测",
    path: "/ping-v4",
    icon: "ping-v4" as const,
  },
  {
    title: "Ping v6",
    subtitle: "IPv6 协议 ICMP 连通性检测",
    path: "/ping-v6",
    icon: "ping-v6" as const,
  },
  {
    title: "DNS 解析",
    subtitle: "全球多节点 DNS 解析查询",
    path: "/dns",
    icon: "dns" as const,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center h-24 border-b border-[var(--glass-border)]">
        <div className="text-center">
          <h1 className="text-sm font-medium uppercase tracking-[0.3em] text-[var(--text-secondary)]">
            NetScope
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] font-light tracking-wider mt-2">
            网络诊断工具
          </p>
        </div>
      </header>

      {/* Grid */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          <div className="swiss-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, i) => (
              <ToolCard
                key={tool.path}
                title={tool.title}
                subtitle={tool.subtitle}
                path={tool.path}
                icon={tool.icon}
                delay={0.08 * i}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center h-16 border-t border-[var(--glass-border)]">
        <p className="text-xs text-[var(--text-tertiary)] font-light tracking-wider">
          NetScope &middot; 运维诊断工具
        </p>
      </footer>
    </div>
  );
}