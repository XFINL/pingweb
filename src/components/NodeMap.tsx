import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { feature } from "topojson-client";

import "leaflet/dist/leaflet.css";

// 节点 ID → 省份/国家名称 映射
const NODE_TO_REGION: Record<string, string> = {
  // 国内
  "cn.北京": "北京市",
  "cn.上海": "上海市",
  "cn.天津": "天津市",
  "cn.重庆": "重庆市",
  "cn.石家庄": "河北省",
  "cn.太原": "山西省",
  "cn.呼和浩特": "内蒙古自治区",
  "cn.沈阳": "辽宁省",
  "cn.长春": "吉林省",
  "cn.哈尔滨": "黑龙江省",
  "cn.南京": "江苏省",
  "cn.杭州": "浙江省",
  "cn.合肥": "安徽省",
  "cn.福州": "福建省",
  "cn.南昌": "江西省",
  "cn.济南": "山东省",
  "cn.郑州": "河南省",
  "cn.武汉": "湖北省",
  "cn.长沙": "湖南省",
  "cn.广州": "广东省",
  "cn.南宁": "广西壮族自治区",
  "cn.海口": "海南省",
  "cn.成都": "四川省",
  "cn.贵阳": "贵州省",
  "cn.昆明": "云南省",
  "cn.拉萨": "西藏自治区",
  "cn.西安": "陕西省",
  "cn.兰州": "甘肃省",
  "cn.西宁": "青海省",
  "cn.银川": "宁夏回族自治区",
  "cn.乌鲁木齐": "新疆维吾尔自治区",
  // 海外
  "os.美西": "United States",
  "os.美东": "United States",
  "os.新加坡": "Singapore",
  "os.东京": "Japan",
  "os.法兰克福": "Germany",
};

export interface MapNodeData {
  id: string;
  label: string;
  value: number | null;
  alive: boolean;
}

interface NodeMapProps {
  nodes: MapNodeData[];
  valueLabel: string;
}

function getColor(value: number): string {
  if (value <= 20) return "#22c55e";
  if (value <= 50) return "#66cc33";
  if (value <= 80) return "#99cc00";
  if (value <= 120) return "#eab308";
  if (value <= 200) return "#f97316";
  if (value <= 500) return "#ef4444";
  return "#b91c1c";
}

function getOpacity(value: number | null): number {
  if (value === null) return 0.08;
  return 0.7;
}

const LEGEND = [
  { label: "≤20ms", color: "#22c55e" },
  { label: "≤50ms", color: "#66cc33" },
  { label: "≤80ms", color: "#99cc00" },
  { label: "≤120ms", color: "#eab308" },
  { label: "≤200ms", color: "#f97316" },
  { label: "≤500ms", color: "#ef4444" },
  { label: ">500ms", color: "#b91c1c" },
];

export default function NodeMap({ nodes, valueLabel }: NodeMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  // 建立节点值查找表
  const valueMap: Record<string, number | null> = {};
  for (const n of nodes) {
    const region = NODE_TO_REGION[n.id];
    if (region) valueMap[region] = n.value;
  }

  // 合并：多个海外节点对应同一个国家时取平均
  const mergedValueMap: Record<string, number | null> = {};
  const overseasValues: number[] = [];
  for (const [region, val] of Object.entries(valueMap)) {
    if (region === "United States") {
      if (val !== null) overseasValues.push(val);
    } else {
      mergedValueMap[region] = val;
    }
  }
  if (overseasValues.length > 0) {
    mergedValueMap["United States"] = Math.round(
      overseasValues.reduce((a, b) => a + b, 0) / overseasValues.length
    );
  } else {
    mergedValueMap["United States"] = null;
  }

  // 获取区域值
  const getRegionValue = (name: string): number | null => {
    return mergedValueMap[name] ?? null;
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [25, 110],
      zoom: 2,
      minZoom: 1,
      maxZoom: 6,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 加载 GeoJSON 并渲染
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 清除旧图层
    if (geoLayerRef.current) {
      map.removeLayer(geoLayerRef.current);
      geoLayerRef.current = null;
    }

    setStatus("loading");

    Promise.all([
      fetch("/china.geojson").then((r) => r.json()),
      fetch("/world-110m.json").then((r) => r.json()),
    ])
      .then(([chinaData, worldTopo]) => {
        // 转换世界 TopoJSON → GeoJSON
        const worldData = feature(
          worldTopo,
          worldTopo.objects.countries
        );

        // 合并两个 GeoJSON，过滤世界数据中的中国（用省份数据替代）
        const allFeatures = [
          ...chinaData.features,
          ...worldData.features.filter(
            (f: any) => f.properties?.name !== "China"
          ),
        ];

        const geoLayer = L.geoJSON(allFeatures, {
          style: (feature) => {
            const name = feature?.properties?.name;
            const val = name ? getRegionValue(name) : null;
            const color = val !== null ? getColor(val) : "#333";
            return {
              fillColor: color,
              fillOpacity: getOpacity(val),
              color: "rgba(255,255,255,0.15)",
              weight: 0.5,
            };
          },
          onEachFeature: (feature, layer) => {
            const name = feature.properties?.name || "";
            const val = name ? getRegionValue(name) : null;
            const display = val !== null ? `${val} ms` : "无数据";

            layer.bindTooltip(
              `<div style="font-family:'DM Sans',sans-serif;font-size:12px;line-height:1.4">
                <strong>${name}</strong><br/>
                ${valueLabel}: ${display}
              </div>`,
              { sticky: true }
            );
          },
        });

        geoLayer.addTo(map);
        geoLayerRef.current = geoLayer;

        // 自适应边界
        const bounds = geoLayer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [20, 20], maxZoom: 4 });
        }

        setStatus("ready");
      })
      .catch((err) => {
        console.error("GeoJSON 加载失败:", err);
        setStatus("error");
      });
  }, [nodes, valueLabel]);

  return (
    <div className="glass overflow-hidden relative">
      {/* Loading overlay */}
      {status === "loading" && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/60">
          <p className="text-xs text-[var(--text-secondary)] font-light">加载地图数据...</p>
        </div>
      )}

      {/* Map container */}
      <div ref={containerRef} className="w-full h-[420px] relative" />

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--glass-border)]">
        {/* Legend */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[var(--text-tertiary)] font-light uppercase tracking-wider mr-1">
            {valueLabel}
          </span>
          {LEGEND.map((l) => (
            <div key={l.color} className="flex items-center gap-1">
              <span
                className="inline-block"
                style={{ width: 12, height: 12, background: l.color, borderRadius: 2 }}
              />
              <span className="text-[9px] text-[var(--text-tertiary)] font-mono">{l.label}</span>
            </div>
          ))}
        </div>
        {/* Status */}
        {status === "error" && (
          <span className="text-[10px] text-red-400/60">地图数据加载失败</span>
        )}
        {status === "ready" && (
          <span className="text-[10px] text-green-400/60">已加载 {nodes.length} 个节点</span>
        )}
      </div>
    </div>
  );
}