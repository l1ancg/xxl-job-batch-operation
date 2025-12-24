import { DomainConfig, OperationLog } from '../types';

const STORAGE_KEYS = {
  DOMAINS: 'domains',
  LOGS: 'logs',
};

// 清理域名，只保留 hostname:port
function cleanDomain(input: string): string {
  // 移除协议前缀
  let cleaned = input.replace(/^https?:\/\//, '');
  // 移除路径部分（取第一个 / 之前的内容）
  cleaned = cleaned.split('/')[0];
  // 移除末尾空白
  cleaned = cleaned.trim();
  return cleaned;
}

// 获取域名列表
export async function getDomains(): Promise<DomainConfig[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.DOMAINS);
  return result.domains || [];
}

// 保存域名列表
export async function saveDomains(domains: DomainConfig[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.DOMAINS]: domains });
}

// 添加域名
export async function addDomain(domain: string): Promise<DomainConfig> {
  const domains = await getDomains();
  const newDomain: DomainConfig = {
    id: Date.now().toString(),
    domain: cleanDomain(domain), // 清理域名，只保留 hostname:port
    enabled: true,
  };
  domains.push(newDomain);
  await saveDomains(domains);
  return newDomain;
}

// 删除域名
export async function removeDomain(id: string): Promise<void> {
  const domains = await getDomains();
  const filtered = domains.filter(d => d.id !== id);
  await saveDomains(filtered);
}

// 更新域名状态
export async function updateDomainStatus(id: string, enabled: boolean): Promise<void> {
  const domains = await getDomains();
  const domain = domains.find(d => d.id === id);
  if (domain) {
    domain.enabled = enabled;
    await saveDomains(domains);
  }
}

// 获取操作日志
export async function getLogs(): Promise<OperationLog[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.LOGS);
  return result.logs || [];
}

// 添加操作日志（自动限制100条）
export async function addLog(log: OperationLog): Promise<void> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.LOGS);
  const logs = result.logs || [];

  logs.unshift(log);

  // 只保留最近100条
  const trimmedLogs = logs.slice(0, 100);

  await chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: trimmedLogs });
}

// 清空日志
export async function clearLogs(): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: [] });
}

// 检查URL是否匹配配置的域名
export async function isMatchingDomain(url: string): Promise<{ matched: boolean; domain?: string }> {
  const domains = await getDomains();
  const enabledDomains = domains.filter(d => d.enabled);

  console.log('[XXL-JOB批量工具] 已配置的域名:', enabledDomains);

  try {
    const urlObj = new URL(url);
    // 构建 host（包含端口）和 hostname（不含端口）
    const urlHost = urlObj.host; // hostname:port
    const urlHostname = urlObj.hostname; // hostname only

    // 支持带端口和不带端口的域名匹配
    const matched = enabledDomains.find(d => {
      // 清理配置的域名（移除协议和路径，兼容旧数据）
      const cleanConfigDomain = cleanDomain(d.domain);
      // 检查是否匹配 hostname 或 host
      return cleanConfigDomain === urlHostname || cleanConfigDomain === urlHost;
    });

    console.log('[XXL-JOB批量工具] URL 解析:', { urlHost, urlHostname, matched: !!matched });

    return {
      matched: !!matched,
      domain: matched?.domain,
    };
  } catch (error) {
    console.error('[XXL-JOB批量工具] URL 解析错误:', error);
    return { matched: false };
  }
}
