# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述
这是一个为 XXL-JOB 任务调度系统开发的 Chrome 浏览器扩展，通过注入批量操作UI组件到XXL-JOB管理页面，实现批量启动/停止任务的功能。

## 常用命令

### 开发和构建
```bash
npm run dev    # 启动开发服务器（热重载，访问 popup-local.html）
npm run build  # 构建生产版本到 dist 目录
npm run lint   # 运行 ESLint 代码检查
```

### 加载扩展到浏览器
1. 运行 `npm run build` 构建项目
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"，选择 `dist` 文件夹
5. 修改代码后需重新构建并点击扩展的刷新按钮

## 架构设计

### 扩展组件架构（四部分）
```
┌─────────────────┐    消息通信    ┌─────────────────┐
│   Content Script│ ──────────────> │ Background SW   │
│  (注入到XXL-JOB) │                 │  (Service Worker)│
└─────────────────┘                 └─────────────────┘
        ↑                                    ↓
        │                                    ↓
        │                                Chrome Storage
        ↓                                    ↓
┌─────────────────┐                 ┌─────────────────┐
│  XXL-JOB 页面   │                 │   Popup页面     │
│  (批量操作UI)   │                 │  (操作日志)     │
└─────────────────┘                 └─────────────────┘
                                      ┌─────────────────┐
                                      │  Options页面    │
                                      │  (域名配置)     │
                                      └─────────────────┘
```

### 核心技术栈
- **React 18.3.1 + TypeScript** - UI组件构建
- **Vite 5.4.5** - 多入口构建系统（popup、options、content、background）
- **Tailwind CSS 3.4.11** - 样式方案
- **Chrome Manifest V3** - 扩展规范
- **Shadow DOM** - 样式隔离，避免注入组件与原页面CSS冲突

### 目录结构
```
src/chrome-extension/
├── manifest.json           # 扩展配置（权限、入口点）
├── background/index.ts     # Service Worker：处理批量操作API调用
├── content/
│   ├── index.tsx          # 内容脚本入口：检查域名并注入
│   └── jobinfo-injector.tsx # React组件：批量操作UI（复选框、按钮）
├── popup/index.tsx         # 弹窗界面：显示操作日志
├── options/index.tsx       # 选项页面：域名配置管理
├── types/index.ts          # TypeScript类型定义（核心数据结构）
├── utils/storage.ts        # Chrome Storage API封装
└── global.css              # 全局样式（Tailwind）
```

### 数据流和消息传递
1. **用户操作流程**：Content Script → Background → XXL-JOB API
2. **消息类型**（定义在 `types/index.ts`）：
   - `ContentMessage`: GET_SELECTED_TASKS, EXECUTE_BATCH_OPERATION
   - `BackgroundMessage`: BATCH_OPERATION, GET_LOGS, CLEAR_LOGS
3. **异步响应**：Background监听消息后返回 `true` 保持通道开放
4. **跨域请求**：Background使用 `credentials: 'include'` 携带XXL-JOB登录态

### 关键实现细节

#### Shadow DOM 样式隔离
Content Script在 `src/chrome-extension/content/index.tsx:22` 使用 Shadow DOM 包裹React根节点，确保注入组件的样式不会影响XXL-JOB原页面，反之亦然。

#### 单页应用URL监听
XXL-JOB是SPA，路由变化不会触发页面重载。在 `src/chrome-extension/content/index.tsx:51-58` 使用 MutationObserver 监听DOM变化检测URL变化，重新执行注入逻辑。

#### 批量操作失败立即停止
在 `src/chrome-extension/background/index.ts:11-48` 循环处理任务，任一任务失败立即返回并记录失败索引，避免批量错误扩大化。

#### 操作日志限制
`src/chrome-extension/utils/storage.ts:62` 自动限制只保留最近100条日志，防止Storage膨胀。

#### XXL-JOB API调用规范
- 请求格式：FormData (`id: taskId`)
- 响应格式：`{code: 200, msg: null, content: any}`，code非200视为失败
- 请求头：`X-Requested-With: XMLHttpRequest` 标识AJAX请求

## 开发注意事项

### 添加新的构建入口
修改 `vite.config.ts` 的 `build.rollupOptions.input`，并在 `manifest.json` 中声明。

### Chrome Storage 数据结构
```typescript
{
  domains: DomainConfig[],  // 域名配置列表
  logs: OperationLog[]      // 操作日志（最多100条）
}
```

### 域名匹配逻辑
`isMatchingDomain()` 函数检查：
1. URL hostname 是否在配置的域名列表中
2. 域名是否启用（enabled: true）
3. URL路径包含 `/xxl-job-admin/jobinfo`

### Console日志前缀
统一使用 `[XXL-JOB批量工具]` 前缀便于调试追踪。
