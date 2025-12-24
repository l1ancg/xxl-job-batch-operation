# XXL-JOB 批量操作工具

为 XXL-JOB 任务调度系统增强批量操作能力的 Chrome 浏览器扩展。

## 功能

- 批量启动/停止任务
- 多域名管理
- 操作日志记录
- Shadow DOM 样式隔离

## 安装

```bash
npm install
npm run build
```

然后在 Chrome 浏览器中打开 `chrome://extensions/`，开启开发者模式，加载 `dist` 文件夹。

## 使用

1. 在扩展设置中添加你的 XXL-JOB 域名
2. 登录 XXL-JOB 管理页面
3. 点击任务行进行多选
4. 使用批量启动/停止按钮

## 开发

```bash
npm run dev    # 开发模式
npm run build  # 构建
npm run lint   # 代码检查
```

## 说明

> 本项目代码由 [Claude Code](https://claude.com/claude-code) 生成。

## 技术栈

- React 18.3 + TypeScript
- Vite 5.4
- Tailwind CSS 3.4
- Chrome Manifest V3

## 许可证

MIT License
