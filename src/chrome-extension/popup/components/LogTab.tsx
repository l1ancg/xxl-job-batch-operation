import { useEffect, useState } from 'react';
import { OperationLog } from '../../types';

export const LogTab = () => {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = () => {
    chrome.runtime.sendMessage({ type: 'GET_LOGS' }, (response) => {
      setLogs(response || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClearLogs = () => {
    if (!confirm('确定要清空所有日志吗？')) return;

    chrome.runtime.sendMessage({ type: 'CLEAR_LOGS' }, () => {
      setLogs([]);
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  };

  const formatType = (type: 'start' | 'stop') => {
    return type === 'start' ? '批量启动' : '批量停止';
  };

  const getBadgeColor = (type: 'start' | 'stop') => {
    return type === 'start'
      ? 'xxl-bg-green-100 xxl-text-green-700'
      : 'xxl-bg-red-100 xxl-text-red-700';
  };

  return (
    <div className="xxl-h-full xxl-flex xxl-flex-col">
      <div className="xxl-flex xxl-justify-between xxl-items-center xxl-mb-4">
        <h2 className="xxl-text-lg xxl-font-semibold">操作日志</h2>
        <button
          onClick={handleClearLogs}
          className="xxl-px-3 xxl-py-1 xxl-text-sm xxl-bg-red-500 xxl-text-white xxl-rounded hover:xxl-bg-red-600"
        >
          清空日志
        </button>
      </div>

      <div className="xxl-flex-1 xxl-overflow-y-auto">
        {loading ? (
          <p className="xxl-text-center xxl-text-gray-500 xxl-py-4">加载中...</p>
        ) : logs.length === 0 ? (
          <p className="xxl-text-center xxl-text-gray-500 xxl-py-4">暂无操作日志</p>
        ) : (
          <div className="xxl-space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="xxl-p-3 xxl-bg-gray-50 xxl-rounded-lg xxl-border xxl-border-gray-200 hover:xxl-shadow-md xxl-transition-shadow"
              >
                <div className="xxl-flex xxl-justify-between xxl-items-start xxl-mb-2">
                  <span className={`xxl-text-sm xxl-font-medium ${getBadgeColor(log.type)}`}>
                    {formatType(log.type)}
                  </span>
                  <span className="xxl-text-xs xxl-text-gray-500">{formatDate(log.timestamp)}</span>
                </div>

                <div className="xxl-text-sm xxl-space-y-1">
                  <div className="xxl-flex">
                    <span className="xxl-text-gray-500 xxl-w-20 xxl-flex-shrink-0">域名：</span>
                    <span className="xxl-text-gray-900">{log.domain}</span>
                  </div>
                  <div className="xxl-flex">
                    <span className="xxl-text-gray-500 xxl-w-20 xxl-flex-shrink-0">执行器：</span>
                    <span className="xxl-text-gray-900">{log.executorName}</span>
                  </div>
                  <div className="xxl-flex">
                    <span className="xxl-text-gray-500 xxl-w-20 xxl-flex-shrink-0">任务描述：</span>
                    <span className="xxl-text-gray-900">{log.taskDescriptions.join(' / ')}</span>
                  </div>
                  <div className="xxl-flex">
                    <span className="xxl-text-gray-500 xxl-w-20 xxl-flex-shrink-0">结果：</span>
                    <span className={log.successCount > 0 ? 'xxl-text-green-600' : 'xxl-text-red-600'}>
                      {log.successCount > 0
                        ? `成功 ${log.successCount} 个`
                        : `失败 - ${log.error}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div className="xxl-mt-4 xxl-pt-4 xxl-border-t xxl-border-gray-200 xxl-text-xs xxl-text-gray-500 xxl-text-center">
          最近 100 条操作日志
        </div>
      )}
    </div>
  );
};
