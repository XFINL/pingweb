import { Globe, Radio, Navigation, Wifi } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  title: string;
  subtitle: string;
  path: string;
  icon: "http-v4" | "http-v6" | "ping-v4" | "ping-v6";
  delay?: number;
}

const iconMap = {
  "http-v4": Globe,
  "http-v6": Navigation,
  "ping-v4": Radio,
  "ping-v6": Wifi,
};

export default function ToolCard({ title, subtitle, path, icon, delay = 0 }: ToolCardProps) {
  const Icon = iconMap[icon];

  return (
    <Link
      to={path}
      className={cn(
        "glass group relative flex flex-col justify-between p-8",
        "min-h-[200px] cursor-pointer",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Icon */}
      <div className="mb-6">
        <Icon
          size={28}
          className="text-[var(--text-secondary)] transition-all duration-300 group-hover:text-[var(--accent)]"
          strokeWidth={1.5}
        />
      </div>

      {/* Text */}
      <div>
        <h2 className="text-xl font-medium tracking-tight text-[var(--text-primary)] mb-1.5">
          {title}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] font-light tracking-normal">
          {subtitle}
        </p>
      </div>

      {/* Arrow indicator */}
      <div className="absolute top-8 right-8 opacity-0 translate-x-[-8px] transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
        <span className="text-sm text-[var(--accent)] font-medium">&rarr;</span>
      </div>

      {/* Bottom accent line - appears on hover */}
      <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-[var(--accent)] scale-x-0 transition-transform duration-400 group-hover:scale-x-100" style={{ transitionDuration: "0.4s" }} />
    </Link>
  );
}