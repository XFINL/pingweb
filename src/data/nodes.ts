export type NodeInfo = {
  id: string;
  label: string;
  group: "domestic" | "overseas";
  region: string;
  lat: number;
  lng: number;
};

export const NODES: NodeInfo[] = [
  // ── 国内节点 (每省一个) ──
  { id: "cn.北京", label: "北京", group: "domestic", region: "华北", lat: 39.90, lng: 116.40 },
  { id: "cn.上海", label: "上海", group: "domestic", region: "华东", lat: 31.23, lng: 121.47 },
  { id: "cn.天津", label: "天津", group: "domestic", region: "华北", lat: 39.13, lng: 117.20 },
  { id: "cn.重庆", label: "重庆", group: "domestic", region: "西南", lat: 29.53, lng: 106.50 },
  { id: "cn.石家庄", label: "石家庄", group: "domestic", region: "华北", lat: 38.04, lng: 114.51 },
  { id: "cn.太原", label: "太原", group: "domestic", region: "华北", lat: 37.87, lng: 112.53 },
  { id: "cn.呼和浩特", label: "呼和浩特", group: "domestic", region: "华北", lat: 40.82, lng: 111.75 },
  { id: "cn.沈阳", label: "沈阳", group: "domestic", region: "东北", lat: 41.80, lng: 123.43 },
  { id: "cn.长春", label: "长春", group: "domestic", region: "东北", lat: 43.88, lng: 125.32 },
  { id: "cn.哈尔滨", label: "哈尔滨", group: "domestic", region: "东北", lat: 45.75, lng: 126.63 },
  { id: "cn.南京", label: "南京", group: "domestic", region: "华东", lat: 32.06, lng: 118.80 },
  { id: "cn.杭州", label: "杭州", group: "domestic", region: "华东", lat: 30.27, lng: 120.15 },
  { id: "cn.合肥", label: "合肥", group: "domestic", region: "华东", lat: 31.82, lng: 117.23 },
  { id: "cn.福州", label: "福州", group: "domestic", region: "华东", lat: 26.07, lng: 119.30 },
  { id: "cn.南昌", label: "南昌", group: "domestic", region: "华东", lat: 28.68, lng: 115.86 },
  { id: "cn.济南", label: "济南", group: "domestic", region: "华东", lat: 36.65, lng: 117.00 },
  { id: "cn.郑州", label: "郑州", group: "domestic", region: "华中", lat: 34.76, lng: 113.65 },
  { id: "cn.武汉", label: "武汉", group: "domestic", region: "华中", lat: 30.58, lng: 114.30 },
  { id: "cn.长沙", label: "长沙", group: "domestic", region: "华中", lat: 28.23, lng: 112.94 },
  { id: "cn.广州", label: "广州", group: "domestic", region: "华南", lat: 23.13, lng: 113.26 },
  { id: "cn.南宁", label: "南宁", group: "domestic", region: "华南", lat: 22.82, lng: 108.37 },
  { id: "cn.海口", label: "海口", group: "domestic", region: "华南", lat: 20.02, lng: 110.35 },
  { id: "cn.成都", label: "成都", group: "domestic", region: "西南", lat: 30.57, lng: 104.07 },
  { id: "cn.贵阳", label: "贵阳", group: "domestic", region: "西南", lat: 26.65, lng: 106.63 },
  { id: "cn.昆明", label: "昆明", group: "domestic", region: "西南", lat: 25.04, lng: 102.72 },
  { id: "cn.拉萨", label: "拉萨", group: "domestic", region: "西南", lat: 29.65, lng: 91.12 },
  { id: "cn.西安", label: "西安", group: "domestic", region: "西北", lat: 34.27, lng: 108.94 },
  { id: "cn.兰州", label: "兰州", group: "domestic", region: "西北", lat: 36.06, lng: 103.83 },
  { id: "cn.西宁", label: "西宁", group: "domestic", region: "西北", lat: 36.62, lng: 101.78 },
  { id: "cn.银川", label: "银川", group: "domestic", region: "西北", lat: 38.49, lng: 106.23 },
  { id: "cn.乌鲁木齐", label: "乌鲁木齐", group: "domestic", region: "西北", lat: 43.82, lng: 87.62 },

  // ── 海外节点 ──
  { id: "os.美西", label: "美西", group: "overseas", region: "美国西岸", lat: 34.05, lng: -118.24 },
  { id: "os.美东", label: "美东", group: "overseas", region: "美国东岸", lat: 40.71, lng: -74.01 },
  { id: "os.新加坡", label: "新加坡", group: "overseas", region: "东南亚", lat: 1.35, lng: 103.82 },
  { id: "os.东京", label: "东京", group: "overseas", region: "日本", lat: 35.68, lng: 139.69 },
  { id: "os.法兰克福", label: "法兰克福", group: "overseas", region: "欧洲", lat: 50.11, lng: 8.68 },
];

export function getNodesByGroup() {
  return {
    domestic: NODES.filter((n) => n.group === "domestic"),
    overseas: NODES.filter((n) => n.group === "overseas"),
  };
}

/** 根据国内/海外节点生成对应仿真偏移量 */
export function getGeoOffset(index: number, total: number): number {
  // 国内节点用位置索引模拟地理差异
  if (total > 10) {
    // 国内: 基于纬度和经度组合的偏移
    const lat = NODES[index]?.lat || 30;
    const lng = NODES[index]?.lng || 110;
    return Math.floor(Math.abs((lat - 30) * 0.6 + (lng - 110) * 0.3));
  }
  // 海外: 更大的延迟偏移
  const overseaOffsets = [120, 150, 60, 80, 180];
  return overseaOffsets[index] || 100;
}