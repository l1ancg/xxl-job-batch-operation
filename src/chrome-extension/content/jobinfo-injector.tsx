import { useEffect, useState } from 'react';
import { BatchOperationRequest, BatchOperationResponse } from '../types';

// 高亮行信息
interface HighlightedRow {
  id: number;
  desc: string;
  element: HTMLTableRowElement;
}

// 全局状态存储（避免闭包问题）
const globalState = {
  highlightedRows: [] as HighlightedRow[],
  listeners: [] as Array<() => void>,
};

// 通知所有监听器
function notifyListeners() {
  globalState.listeners.forEach((listener) => listener());
}

// 订阅状态变化
function subscribe(listener: () => void) {
  globalState.listeners.push(listener);
  return () => {
    const index = globalState.listeners.indexOf(listener);
    if (index > -1) {
      globalState.listeners.splice(index, 1);
    }
  };
}

// 高亮样式类名
const HIGHLIGHT_CLASS = 'xxl-job-row-highlighted';

// 更新按钮样式的辅助函数（使用 classList 代替 className 拼接）
function updateButtonStyle(button: HTMLButtonElement, enabled: boolean, type: 'start' | 'stop') {
  // 移除所有状态类
  button.classList.remove('xxl-job-btn-start', 'xxl-job-btn-stop', 'xxl-job-btn-disabled');

  if (enabled) {
    // 启用状态：添加对应类型的类
    button.classList.add(type === 'start' ? 'xxl-job-btn-start' : 'xxl-job-btn-stop');
  } else {
    // 禁用状态：灰色
    button.classList.add('xxl-job-btn-disabled');
  }
}

// 切换行高亮状态
function toggleRowHighlight(row: HTMLTableRowElement, taskId: number, taskDesc: string) {
  const isHighlighted = row.classList.contains(HIGHLIGHT_CLASS);

  if (isHighlighted) {
    // 取消高亮
    row.classList.remove(HIGHLIGHT_CLASS);
    row.style.backgroundColor = '';
    globalState.highlightedRows = globalState.highlightedRows.filter((r) => r.id !== taskId);
  } else {
    // 添加高亮
    row.classList.add(HIGHLIGHT_CLASS);
    row.style.backgroundColor = '#e3f2fd'; // 浅蓝色背景
    globalState.highlightedRows.push({ id: taskId, desc: taskDesc, element: row });
  }

  console.log('[XXL-JOB批量工具] 行高亮状态变化:', {
    taskId,
    taskDesc,
    highlighted: !isHighlighted,
    count: globalState.highlightedRows.length,
  });

  notifyListeners();
}

// 清除所有高亮
function clearAllHighlights() {
  globalState.highlightedRows.forEach((row) => {
    row.element.classList.remove(HIGHLIGHT_CLASS);
    row.element.style.backgroundColor = '';
  });
  globalState.highlightedRows = [];
  notifyListeners();
}

// 主注入组件
const JobinfoInjector = () => {
  const [highlightedCount, setHighlightedCount] = useState(0);
  const [isOperating, setIsOperating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 订阅全局状态变化
  useEffect(() => {
    const unsubscribe = subscribe(() => {
      setHighlightedCount(globalState.highlightedRows.length);
    });
    return unsubscribe;
  }, []);

  // 初始化：注入行高亮和按钮
  useEffect(() => {
    injectRowHighlight();
    injectButtons();
  }, []);

  // 监听页面变化，确保按钮和行高亮始终存在
  useEffect(() => {
    const interval = setInterval(() => {
      injectRowHighlight();
      injectButtons();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 注入行点击高亮
  const injectRowHighlight = () => {
    const table = document.querySelector('#job_list tbody');
    if (!table) return;

    const rows = table.querySelectorAll('tr');
    rows.forEach((row) => {
      // 检查是否已经绑定过点击事件
      if (row.dataset.xxlJobHighlightBound === 'true') return;

      // 获取任务ID（第一个单元格）
      const firstTd = row.querySelector('td');
      if (!firstTd) return;

      const taskId = firstTd.textContent?.trim();
      if (!taskId) return;

      // 获取任务描述（第二个单元格）
      const tds = row.querySelectorAll('td');
      const taskDesc = tds[1]?.textContent?.trim() || '';

      // 添加点击事件
      row.addEventListener('click', () => {
        toggleRowHighlight(row, parseInt(taskId), taskDesc);
      });

      // 标记已绑定
      row.dataset.xxlJobHighlightBound = 'true';

      // 添加鼠标指针样式
      row.style.cursor = 'pointer';
    });
  };

  // 注入批量按钮
  const injectButtons = () => {
    const dataTablesLength = document.querySelector('.dataTables_length');
    if (!dataTablesLength) return;

    // 检查是否已经有按钮
    if (dataTablesLength.querySelector('.xxl-job-batch-buttons')) return;

    const buttonContainer = document.createElement('span');
    buttonContainer.className = 'xxl-job-batch-buttons xxl-mt-2 xxl-flex xxl-gap-2';

    // 批量启动按钮
    const startButton = document.createElement('button');
    startButton.textContent = '批量启动';
    startButton.className = 'xxl-job-batch-start xxl-job-btn-disabled'; // 初始状态为禁用

    // 批量停止按钮
    const stopButton = document.createElement('button');
    stopButton.textContent = '批量停止';
    stopButton.className = 'xxl-job-batch-stop xxl-job-btn-disabled'; // 初始状态为禁用

    // 点击事件
    startButton.addEventListener('click', () => handleBatchOperation('start'));
    stopButton.addEventListener('click', () => handleBatchOperation('stop'));

    buttonContainer.appendChild(startButton);
    buttonContainer.appendChild(stopButton);
    dataTablesLength.appendChild(buttonContainer);
  };

  // 执行批量操作
  const handleBatchOperation = async (type: 'start' | 'stop') => {
    const currentRows = globalState.highlightedRows;

    console.log('[XXL-JOB批量工具] 执行批量操作:', {
      type,
      count: currentRows.length,
      tasks: currentRows.map((r) => ({ id: r.id, desc: r.desc })),
    });

    if (currentRows.length === 0) {
      alert('请先点击行选择任务');
      return;
    }

    if (!confirm(`确定要批量${type === 'start' ? '启动' : '停止'} ${currentRows.length} 个任务吗？`)) {
      return;
    }

    setIsOperating(true);
    setMessage(null);

    try {
      // 获取当前执行器信息
      const jobGroupSelect = document.querySelector('#jobGroup') as HTMLSelectElement;
      if (!jobGroupSelect) {
        throw new Error('无法找到执行器选择器');
      }

      const executorId = jobGroupSelect.value;
      const executorName = jobGroupSelect.options[jobGroupSelect.selectedIndex].text;

      // 获取完整的 origin（包含协议、域名、端口）
      const origin = window.location.origin;

      // 获取当前页面路径，直接作为基础路径
      // 例如："/xxl-job-pay/jobinfo" 保持不变
      const pathname = window.location.pathname;
      const basePath = pathname;

      // 构建请求
      const request: BatchOperationRequest = {
        type,
        taskIds: currentRows.map((r) => r.id),
        domain: origin,
        basePath,
        executorId,
        executorName,
        taskDescriptions: currentRows.map((r) => r.desc),
      };

      console.log('[XXL-JOB批量工具] 发送批量操作请求:', request);

      // 发送消息给Background执行批量操作
      chrome.runtime.sendMessage(
        {
          type: 'BATCH_OPERATION',
          request,
        },
        (response: BatchOperationResponse) => {
          if (response.success) {
            setMessage({
              type: 'success',
              text: `批量操作成功！已处理 ${response.processedCount} 个任务`,
            });
            // 清空高亮（包括全局状态）
            clearAllHighlights();
            // 点击搜索按钮刷新数据
            setTimeout(() => {
              const searchBtn = document.querySelector('#searchBtn') as HTMLButtonElement;
              if (searchBtn) {
                searchBtn.click();
              }
            }, 1500);
          } else {
            setMessage({
              type: 'error',
              text: `批量操作失败：第 ${response.failedIndex! + 1} 个任务操作失败 - ${response.error}`,
            });
          }
          setIsOperating(false);
        }
      );
    } catch (error) {
      console.error('批量操作失败:', error);
      setMessage({
        type: 'error',
        text: `批量操作失败：${error instanceof Error ? error.message : '未知错误'}`,
      });
      setIsOperating(false);
    }
  };

  // 更新按钮状态
  useEffect(() => {
    const startButton = document.querySelector('.xxl-job-batch-start') as HTMLButtonElement;
    const stopButton = document.querySelector('.xxl-job-batch-stop') as HTMLButtonElement;

    if (startButton && stopButton) {
      const enabled = highlightedCount > 0;
      updateButtonStyle(startButton, enabled, 'start');
      updateButtonStyle(stopButton, enabled, 'stop');
    }
  }, [highlightedCount]);

  return (
    <>
      <style>{`
        .xxl-job-batch-start,
        .xxl-job-batch-stop {
          padding: 0.625rem 1rem;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 500;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          transition: all 0.2s ease-in-out;
        }
        .xxl-job-btn-start {
          background-color: rgb(22 163 74);
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgb(220 252 231);
        }
        .xxl-job-btn-start:hover {
          background-color: rgb(21 128 61);
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }
        .xxl-job-btn-stop {
          background-color: rgb(220 38 38);
          cursor: pointer;
          box-shadow: 0 4px 6px -1px rgb(254 226 226);
        }
        .xxl-job-btn-stop:hover {
          background-color: rgb(185 28 28);
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }
        .xxl-job-btn-disabled {
          background-color: rgb(156 163 175);
          cursor: not-allowed;
          opacity: 0.7;
          box-shadow: none;
        }
      `}</style>
      <div className="xxl-fixed xxl-top-1/2 xxl-left-1/2 xxl--translate-x-1/2 xxl--translate-y-1/2 xxl-z-[10000] xxl-max-w-[400px]">
        {message && (
          <div
            className={`xxl-p-3 xxl-rounded xxl-mb-2 xxl-border xxl-text-base xxl-shadow-sm ${
              message.type === 'success'
                ? 'xxl-bg-green-100 xxl-text-green-800 xxl-border-green-300'
                : 'xxl-bg-red-100 xxl-text-red-800 xxl-border-red-300'
            }`}
          >
            {message.text}
          </div>
        )}
        {isOperating && (
          <div className="xxl-p-3 xxl-rounded xxl-bg-yellow-100 xxl-text-yellow-800 xxl-border xxl-border-yellow-300 xxl-text-base xxl-shadow-sm">
            正在执行批量操作，请稍候...
          </div>
        )}
        {highlightedCount > 0 && (
          <div className="xxl-p-2 xxl-rounded xxl-bg-blue-100 xxl-text-blue-800 xxl-border xxl-border-blue-300 xxl-text-base xxl-shadow-sm">
            已选择 {highlightedCount} 个任务
          </div>
        )}
      </div>
    </>
  );
};

export default JobinfoInjector;
