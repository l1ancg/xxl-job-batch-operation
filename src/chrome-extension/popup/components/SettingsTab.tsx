import { useEffect, useState } from "react";
import { DomainConfig as DomainConfigType } from "../../types";
import { getDomains, removeDomain, updateDomainStatus } from "../../utils/storage";
import { DomainConfigForm } from "./DomainConfig";

export const SettingsTab = () => {
  const [domains, setDomains] = useState<DomainConfigType[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDomains = async () => {
    setLoading(true);
    try {
      const data = await getDomains();
      setDomains(data);
    } catch (error) {
      console.error("加载域名失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个域名吗？")) return;

    try {
      await removeDomain(id);
      await loadDomains();
    } catch (error) {
      console.error("删除域名失败:", error);
      alert("删除域名失败");
    }
  };

  const handleToggleStatus = async (id: string, enabled: boolean) => {
    try {
      await updateDomainStatus(id, enabled);
      await loadDomains();
    } catch (error) {
      console.error("更新域名状态失败:", error);
      alert("更新域名状态失败");
    }
  };

  return (
    <div className="xxl-flex xxl-flex-col xxl-h-full">
      <div className="xxl-mb-4">
        <h2 className="xxl-text-sm xxl-font-semibold xxl-mb-1">域名配置</h2>
        <p className="xxl-text-xs xxl-text-gray-500">
          配置域名后，访问对应页面时会自动显示批量操作按钮
        </p>
      </div>

      <DomainConfigForm onDomainAdded={loadDomains} />

      <div className="xxl-flex-1 xxl-overflow-y-auto">
        {loading ? (
          <p className="xxl-text-sm xxl-text-gray-500">加载中...</p>
        ) : domains.length === 0 ? (
          <p className="xxl-text-sm xxl-text-gray-500">暂无配置的域名</p>
        ) : (
          <div className="xxl-space-y-2">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className="xxl-flex xxl-items-center xxl-justify-between xxl-p-2 xxl-border xxl-rounded-md"
              >
                <div className="xxl-flex-1 xxl-overflow-hidden">
                  <div className="xxl-text-sm xxl-font-medium xxl-truncate">{domain.domain}</div>
                  <div className="xxl-text-xs xxl-text-gray-500">
                    {domain.enabled ? "已启用" : "已禁用"}
                  </div>
                </div>
                <div className="xxl-flex xxl-items-center xxl-gap-1">
                  <button
                    onClick={() => handleToggleStatus(domain.id, !domain.enabled)}
                    className={`xxl-px-2 xxl-py-1 xxl-text-xs xxl-rounded ${
                      domain.enabled
                        ? "xxl-bg-green-100 xxl-text-green-700 hover:xxl-bg-green-200"
                        : "xxl-bg-gray-100 xxl-text-gray-700 hover:xxl-bg-gray-200"
                    }`}
                  >
                    {domain.enabled ? "禁用" : "启用"}
                  </button>
                  <button
                    onClick={() => handleDelete(domain.id)}
                    className="xxl-px-2 xxl-py-1 xxl-text-xs xxl-bg-red-100 xxl-text-red-700 xxl-rounded hover:xxl-bg-red-200"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
