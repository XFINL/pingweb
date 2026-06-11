# NetScope - 全球网络诊断工具

基于 React + TypeScript + Leaflet 的运维诊断平台，支持从全球多个节点对目标进行 Ping / HTTP 检测，并在地图上以颜色直观展示延迟分布。

## 功能

- **Ping v4 / v6** — 从国内 31 省 + 海外 5 个节点对目标执行真实 Ping 检测，展示延迟、发包、丢包、响应时间
- **HTTP v4 / v6** — 从多个节点执行 HTTP 请求检测，展示状态码、响应时间、DNS/TCP/TLS 各阶段耗时
- **全球地图** — 基于 Leaflet + OpenStreetMap 的交互式 Choropleth 地图，区域颜色反映延迟/响应时间
- **输入验证** — 仅接受合法 IP（v4/v6）和域名

## 技术栈

| 层 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite |
| 路由 | react-router-dom v6 |
| 地图 | Leaflet + OpenStreetMap + TopoJSON/GeoJSON |
| 样式 | Tailwind CSS + CSS Variables + Glassmorphism |
| 后端 | Express (Node.js) |
| 数据 | DataV 中国省界 GeoJSON + Natural Earth 世界地图 |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动后端 API 服务 (端口 3001)
node server/index.js

# 启动前端开发服务器 (端口 5173)
pnpm dev
```

访问 [http://localhost:5173](http://localhost:5173)

## 项目结构

```
.
├── server/                # Express 后端
│   ├── index.js           # API 路由 (ping / http)
│   └── public/            # GeoJSON 静态文件
├── src/
│   ├── components/
│   │   ├── ToolCard.tsx        # 首页工具卡片
│   │   ├── DetectionPanel.tsx  # 检测面板容器
│   │   ├── PingResult.tsx      # Ping 结果表格
│   │   ├── HttpResult.tsx      # HTTP 结果表格
│   │   └── NodeMap.tsx         # 全球地图组件
│   ├── data/
│   │   └── nodes.ts            # 36 个节点定义 + 地理偏移
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── HttpV4Page.tsx / HttpV6Page.tsx
│   │   └── PingV4Page.tsx / PingV6Page.tsx
│   └── utils/
│       └── validation.ts       # IP/域名输入校验
└── vite.config.ts
```

## API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/ping` | POST | 真实 Ping 检测，返回发包/收包/丢包/延迟 |
| `/api/http` | POST | 真实 HTTP 请求，返回状态码/响应时间/各阶段耗时 |
| `/china.geojson` | GET | 中国省份边界数据 |
| `/world-110m.json` | GET | 世界国家边界数据 |