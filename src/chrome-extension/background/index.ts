import { BatchOperationRequest, BatchOperationResponse, OperationLog, XXLJobApiResponse } from '../types';
import { addLog } from '../utils/storage';

// 发送日志到 Content Script（在页面控制台显示）
function sendLogToContentScript(tabId: number, message: string, data?: any) {
  chrome.tabs.sendMessage(tabId, {
    type: 'LOG',
    message,
    data
  }).catch(() => {
    // Content script 可能未加载，忽略错误
  });
}

// 批量操作实现
async function performBatchOperation(request: BatchOperationRequest, senderTabId?: number): Promise<BatchOperationResponse> {
  const { type, taskIds, domain, basePath } = request;

  // 根据基础路径动态构建接口地址
  // 例如：basePath="/xxl-job-pay" -> endpoint="/xxl-job-pay/start"
  const endpoint = type === 'start' ? `${basePath}/start` : `${basePath}/stop`;

  console.log('[XXL-JOB批量工具] Background: 开始批量操作', { type, count: taskIds.length, domain, endpoint });
  if (senderTabId) {
    sendLogToContentScript(senderTabId, `开始批量${type === 'start' ? '启动' : '停止'}操作`, { count: taskIds.length, endpoint });
  }

  for (let i = 0; i < taskIds.length; i++) {
    try {
      const formData = new FormData();
      formData.append('id', taskIds[i].toString());

      const url = `${domain}${endpoint}`;
      console.log(`[XXL-JOB批量工具] Background: 处理任务 ${i + 1}/${taskIds.length}`, { taskId: taskIds[i], url });
      if (senderTabId) {
        sendLogToContentScript(senderTabId, `处理任务 ${i + 1}/${taskIds.length}`, { taskId: taskIds[i], url });
      }

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: XXLJobApiResponse = await response.json();
      console.log(`[XXL-JOB批量工具] Background: 任务 ${i + 1} 响应`, result);
      if (senderTabId) {
        sendLogToContentScript(senderTabId, `任务 ${i + 1} 响应: ${result.code === 200 ? '成功' : '失败'}`, result);
      }

      if (result.code !== 200) {
        // 失败：立即停止，返回失败信息
        console.error(`[XXL-JOB批量工具] Background: 任务 ${i + 1} 失败`, result);
        if (senderTabId) {
          sendLogToContentScript(senderTabId, `任务 ${i + 1} 失败`, { error: result.msg || '操作失败' });
        }
        return {
          success: false,
          processedCount: i,
          failedIndex: i,
          error: result.msg || '操作失败',
        };
      }
    } catch (error) {
      // 失败：立即停止，返回失败信息
      console.error(`[XXL-JOB批量工具] Background: 任务 ${i + 1} 异常`, error);
      if (senderTabId) {
        sendLogToContentScript(senderTabId, `任务 ${i + 1} 请求异常`, { error: error instanceof Error ? error.message : '未知错误' });
      }
      return {
        success: false,
        processedCount: i,
        failedIndex: i,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  console.log('[XXL-JOB批量工具] Background: 批量操作全部成功');
  if (senderTabId) {
    sendLogToContentScript(senderTabId, `批量操作全部成功`, { processedCount: taskIds.length });
  }
  return { success: true, processedCount: taskIds.length };
}

// 记录操作日志
async function recordLog(
  request: BatchOperationRequest,
  response: BatchOperationResponse
): Promise<void> {
  const log: OperationLog = {
    id: Date.now().toString(),
    type: request.type,
    timestamp: Date.now(),
    executorId: request.executorId,
    executorName: request.executorName,
    taskDescriptions: request.taskDescriptions,
    taskIdList: request.taskIds,
    domain: request.domain,
    successCount: response.success ? response.processedCount : 0,
    failCount: response.success ? 0 : 1,
    error: response.error,
  };

  await addLog(log);
}

// 监听消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BATCH_OPERATION') {
    const request = message.request as BatchOperationRequest;
    const senderTabId = sender.tab?.id;

    performBatchOperation(request, senderTabId)
      .then(async (response) => {
        // 记录日志
        await recordLog(request, response);
        sendResponse(response);
      })
      .catch((error) => {
        console.error('[XXL-JOB批量工具] 批量操作失败:', error);
        if (senderTabId) {
          sendLogToContentScript(senderTabId, '批量操作失败', { error: error.message });
        }
        sendResponse({
          success: false,
          processedCount: 0,
          error: error.message,
        });
      });

    return true; // 异步响应
  }

  if (message.type === 'GET_LOGS') {
    chrome.storage.local.get('logs', (result) => {
      sendResponse(result.logs || []);
    });
    return true;
  }

  if (message.type === 'CLEAR_LOGS') {
    chrome.storage.local.set({ logs: [] }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

console.log('[XXL-JOB批量工具] Background Service Worker 已启动');
