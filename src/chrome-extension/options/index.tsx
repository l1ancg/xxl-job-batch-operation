import "../global.css";

const Options = () => {
  return (
    <div className="xxl-min-h-screen xxl-bg-gray-50 xxl-p-6">
      <div className="xxl-max-w-2xl xxl-mx-auto">
        {/* 迁移提示 */}
        <div className="xxl-bg-blue-50 xxl-border xxl-border-blue-200 xxl-rounded-lg xxl-p-6 xxl-mb-6">
          <h1 className="xxl-text-2xl xxl-font-bold xxl-text-blue-900 xxl-mb-4">
            XXL-JOB 批量操作工具
          </h1>
          <h2 className="xxl-text-lg xxl-font-semibold xxl-text-blue-800 xxl-mb-3">
            域名配置已迁移
          </h2>
          <p className="xxl-text-sm xxl-text-blue-700 xxl-mb-4">
            域名配置功能已移至浏览器扩展的 Popup 弹窗中。
          </p>
          <div className="xxl-bg-white xxl-rounded xxl-p-4 xxl-mb-4">
            <p className="xxl-text-sm xxl-text-gray-700 xxl-mb-2">
              <strong>使用步骤：</strong>
            </p>
            <ol className="xxl-list-decimal xxl-list-inside xxl-space-y-2 xxl-text-sm xxl-text-gray-600">
              <li>点击浏览器工具栏中的扩展图标</li>
              <li>在弹出的窗口中点击"设置"标签页</li>
              <li>添加你的 XXL-JOB 域名</li>
              <li>访问该域名的任务管理页面即可使用批量操作功能</li>
            </ol>
          </div>
        </div>

        <div className="xxl-mt-6 xxl-text-sm xxl-text-gray-500">
          <h3 className="xxl-font-semibold xxl-mb-2">功能说明：</h3>
          <ul className="xxl-list-disc xxl-list-inside xxl-space-y-1">
            <li>批量启动/停止任务</li>
            <li>查看操作日志</li>
            <li>支持多个 XXL-JOB 实例</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Options;
