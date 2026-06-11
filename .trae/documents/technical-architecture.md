## 1. 架构设计

```mermaid
flowchart LR
  "用户浏览器" --> "React SPA"
  "React SPA" --> "Vite 开发服务器"
  "React SPA" --> "React Router 路由"
  "React Router 路由" --> "首页"
  "React Router 路由" --> "检测页面"
```

## 2. 技术说明

- **前端**: React@18 + TypeScript + Vite
- **路由**: react-router-dom@6
- **样式**: CSS Modules + CSS Variables
- **初始化工具**: Vite + React + TypeScript 模板
- **构建工具**: Vite
- **无后端**: 纯前端 SPA，检测功能通过前端 API 调用实现

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| / | 首页，展示四个工具入口 |
| /http-v4 | HTTP v4 检测页面 |
| /http-v6 | HTTP v6 检测页面 |
| /ping-v4 | Ping v4 检测页面 |
| /ping-v6 | Ping v6 检测页面 |

## 4. 组件结构

```
App
├── Layout（全局布局容器）
│   ├── Header（页面标题/导航）
│   └── Main（内容区域）
├── HomePage（首页）
│   └── ToolCard × 4（工具卡片入口）
├── HttpV4Page（HTTP v4 检测页）
├── HttpV6Page（HTTP v6 检测页）
├── PingV4Page（Ping v4 检测页）
└── PingV6Page（Ping v6 检测页）
```

每个检测页面共享相同的布局结构组件：
- TargetInput（目标地址输入）
- ResultPanel（结果展示面板）

## 5. 数据模型

### 5.1 检测结果类型定义

```typescript
interface DetectionResult {
  status: 'success' | 'failure' | 'pending'
  target: string
  latency?: number
  timestamp: number
  details?: string
  error?: string
}
```