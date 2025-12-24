export const AboutTab = () => {
  return (
    <div className="xxl-h-full xxl-overflow-y-auto">
      <h2 className="xxl-text-lg xxl-font-semibold xxl-mb-4">关于</h2>

      <div className="xxl-space-y-4 xxl-text-sm">
        <div>
          <h3 className="xxl-font-medium xxl-mb-2">XXL-JOB 批量操作工具</h3>
          <p className="xxl-text-gray-600">
            为XXL-JOB任务调度中心添加批量启动/停止功能，提高运维效率。
          </p>
        </div>

        <div className="xxl-border-t xxl-pt-4">
          <h3 className="xxl-font-medium xxl-mb-2">使用说明</h3>
          <ol className="xxl-list-decimal xxl-list-inside xxl-space-y-2 xxl-text-gray-600">
            <li>
              点击右下角的设置图标，进入设置页面
            </li>
            <li>
              在设置页面添加你的XXL-JOB域名（如: xxl-job-test.zhongbaozhiyun.com:9012）
            </li>
            <li>
              访问你配置的XXL-JOB系统的 /xxl-job-admin/jobinfo 页面
            </li>
            <li>
              页面会自动显示批量操作按钮和任务复选框
            </li>
            <li>
              勾选需要操作的任务，点击批量启动或批量停止按钮
            </li>
            <li>
              在本弹窗的"操作日志"标签页可以查看操作历史
            </li>
          </ol>
        </div>

        <div className="xxl-border-t xxl-pt-4">
          <h3 className="xxl-font-medium xxl-mb-2">功能特性</h3>
          <ul className="xxl-list-disc xxl-list-inside xxl-space-y-1 xxl-text-gray-600">
            <li>支持批量启动/停止任务</li>
            <li>操作失败立即停止并提示</li>
            <li>记录操作日志，便于追溯</li>
            <li>支持多域名配置</li>
            <li>复用浏览器登录状态，无需重复登录</li>
          </ul>
        </div>

        <div className="xxl-border-t xxl-pt-4">
          <h3 className="xxl-font-medium xxl-mb-2">注意事项</h3>
          <ul className="xxl-list-disc xxl-list-inside xxl-space-y-1 xxl-text-gray-600">
            <li>请确保已在浏览器中登录XXL-JOB系统</li>
            <li>批量操作会立即执行，请谨慎勾选任务</li>
            <li>日志仅保留最近100条记录</li>
          </ul>
        </div>

        <div className="xxl-border-t xxl-pt-4 xxl-text-xs xxl-text-gray-400">
          <p>版本: 1.0.0</p>
          <p className="xxl-mt-1">基于Chrome Extension Starter开发</p>
        </div>
      </div>
    </div>
  );
};
