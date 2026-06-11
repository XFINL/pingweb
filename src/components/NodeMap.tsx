import { useEffect, useRef } from "react";
import L from "leaflet";

// 必须全局导入 leaflet CSS
import "leaflet/dist/leaflet.css";

export interface MapNodeData {
  id: string;
  label: string;
  lat: number;
  lng: number;
  value: number | null; // 延迟或响应时间 (ms)
  alive: boolean;
}

interface NodeMapProps {
  nodes: MapNodeData[];
  valueLabel: string;
}

function getColor(value: number): string {
  // 绿 → 黄 → 红
  if (value <= 30) return "#22c55e";
  if (value <= 60) return "#84cc16";
  if (value <= 100) return "#eab308";
  if (value <= 200) return "#f97316";
  if (value <= 500) return "#ef4444";
  return "#b91c1c";
}

function getRadius(value: number): number {
  if (value <= 20) return 6;
  if (value <= 50) return 8;
  if (value <= 100) return 10;
  if (value <= 200) return 12;
  return 14;
}

export default function NodeMap({ nodes, valueLabel }: NodeMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // 初始化地图
    const map = L.map(mapRef.current, {
      center: [20, 110],
      zoom: 2,
      minZoom: 1,
      maxZoom: 6,
      zoomControl: true,
      attributionControl: false,
    });

    // OpenStreetMap 瓦片
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // 更新标记
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // 清除旧标记
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    const validNodes = nodes.filter((n) => n.alive && n.value !== null && n.value > 0);

    if (validNodes.length === 0) return;

    const markers = validNodes.map((node) => {
      const color = getColor(node.value!);
      const radius = getRadius(node.value!);

      const marker = L.circleMarker([node.lat, node.lng], {
        radius,
        fillColor: color,
        color: "#fff",
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.75,
      });

      marker.bindTooltip(
        `<strong>${node.label}</strong><br/>${valueLabel}: ${node.value} ms`,
        { direction: "top", offset: [0, -8] }
      );

      marker.addTo(map);
      return marker;
    });

    markersRef.current = markers;

    // 自动适配视图范围
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      const bounds = group.getBounds().pad(0.3);
      if (bounds.isValid()) {
        map.fitBounds(bounds, { maxZoom: 4 });
      }
    }
  }, [nodes, valueLabel]);

  // 图例
  const levels = [
    { label: "≤30ms", color: "#22c55e" },
    { label: "≤60ms", color: "#84cc16" },
    { label: "≤100ms", color: "#eab308" },
    { label: "≤200ms", color: "#f97316" },
    { label: "≤500ms", color: "#ef4444" },
    { label: ">500ms", color: "#b91c1c" },
  ];

  return (
    <div className="glass overflow-hidden">
      <div ref={mapRef} className="w-full h-[360px]" />
      {/* 图例 */}
      <div className="flex items-center justify-center gap-3 px-4 py-2 border-t border-[var(--glass-border)]">
        <span className="text-[10px] text-[var(--text-tertiary)] font-light uppercase tracking-wider mr-1">
          {valueLabel}
        </span>
        {levels.map((l) => (
          <div key={l.color} className="flex items-center gap-1">
            <span
              className="inline-block rounded-full"
              style={{ width: 10, height: 10, background: l.color }}
            />
            <span className="text-[9px] text-[var(--text-tertiary)] font-mono">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}