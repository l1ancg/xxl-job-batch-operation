import { createRoot } from 'react-dom/client';
import { isMatchingDomain } from '../utils/storage';
import JobinfoInjector from './jobinfo-injector';
import '../global.css';

// 防止重复注入
let injected = false;

async function checkAndInject() {
  if (injected) return;

  console.log('[XXL-JOB批量工具] Content Script 已加载');
  console.log('[XXL-JOB批量工具] 当前 URL:', window.location.href);

  const { matched, domain } = await isMatchingDomain(window.location.href);

  console.log('[XXL-JOB批量工具] 域名匹配结果:', { matched, domain });

  if (matched) {
    console.log('[XXL-JOB批量工具] 检测到XXL-JOB页面，准备注入组件');

    // 创建容器
    const container = document.createElement('div');
    container.id = 'xxl-job-batch-tools-root';
    container.className = 'xxl-scope';
    document.body.appendChild(container);

    // 直接渲染React组件（不使用 Shadow DOM）
    const root = createRoot(container);
    root.render(<JobinfoInjector />);

    injected = true;
    console.log('[XXL-JOB批量工具] 组件注入成功');
  } else {
    console.log('[XXL-JOB批量工具] 域名不匹配或未在 jobinfo 页面');
    console.log('[XXL-JOB批量工具] 请先在扩展设置中配置域名');
  }
}

// 页面加载时检查
checkAndInject();

// 监听URL变化（XXL-JOB是单页应用）
let lastUrl = window.location.href;
new MutationObserver(() => {
  const currentUrl = window.location.href;
  if (currentUrl !== lastUrl) {
    lastUrl = currentUrl;
    injected = false;
    console.log('[XXL-JOB批量工具] 检测到 URL 变化:', currentUrl);
    checkAndInject();
  }
}).observe(document.body, { childList: true, subtree: true });

// 监听来自 Background 的日志消息
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'LOG') {
    console.log(`[XXL-JOB批量工具] ${message.message}`, message.data || '');
  }
  return true;
});
