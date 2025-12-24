import { useState } from "react";
import { LogTab } from "./components/LogTab";
import { AboutTab } from "./components/AboutTab";
import { SettingsTab } from "./components/SettingsTab";
import "../global.css";

export const Popup = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'settings' | 'about'>('logs');

  return (
    <div className="xxl-w-full xxl-h-full xxl-flex xxl-flex-col">
      {/* 标签页头部 */}
      <div className="xxl-flex xxl-border-b">
        <button
          onClick={() => setActiveTab('logs')}
          className={`xxl-flex-1 xxl-py-2 xxl-px-3 xxl-text-center xxl-font-medium xxl-transition-colors xxl-text-sm ${
            activeTab === 'logs'
              ? 'xxl-text-blue-600 xxl-border-b-2 xxl-border-blue-600 xxl-bg-blue-50'
              : 'xxl-text-gray-600 hover:xxl-text-gray-800 hover:xxl-bg-gray-50'
          }`}
        >
          操作日志
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`xxl-flex-1 xxl-py-2 xxl-px-3 xxl-text-center xxl-font-medium xxl-transition-colors xxl-text-sm ${
            activeTab === 'settings'
              ? 'xxl-text-blue-600 xxl-border-b-2 xxl-border-blue-600 xxl-bg-blue-50'
              : 'xxl-text-gray-600 hover:xxl-text-gray-800 hover:xxl-bg-gray-50'
          }`}
        >
          设置
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`xxl-flex-1 xxl-py-2 xxl-px-3 xxl-text-center xxl-font-medium xxl-transition-colors xxl-text-sm ${
            activeTab === 'about'
              ? 'xxl-text-blue-600 xxl-border-b-2 xxl-border-blue-600 xxl-bg-blue-50'
              : 'xxl-text-gray-600 hover:xxl-text-gray-800 hover:xxl-bg-gray-50'
          }`}
        >
          关于
        </button>
      </div>

      {/* 标签页内容 */}
      <div className="xxl-flex-1 xxl-overflow-hidden xxl-p-3">
        {activeTab === 'logs' && <LogTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'about' && <AboutTab />}
      </div>
    </div>
  );
};
