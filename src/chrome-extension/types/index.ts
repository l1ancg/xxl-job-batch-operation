// XXL-JOB域名配置
export interface DomainConfig {
  id: string;
  domain: string;
  enabled: boolean;
}

// 操作日志
export interface OperationLog {
  id: string;
  type: 'start' | 'stop';
  timestamp: number;
  executorId: string;
  executorName: string;
  taskDescriptions: string[];
  taskIdList: number[];
  domain: string;
  successCount: number;
  failCount: number;
  error?: string;
}

// 批量操作请求
export interface BatchOperationRequest {
  type: 'start' | 'stop';
  taskIds: number[];
  domain: string;
  basePath: string;  // 基础路径，如 "/xxl-job-pay"
  executorId: string;
  executorName: string;
  taskDescriptions: string[];
}

// 批量操作响应
export interface BatchOperationResponse {
  success: boolean;
  processedCount: number;
  failedIndex?: number;
  error?: string;
}

// Content Script消息类型
export type ContentMessage =
  | { type: 'GET_SELECTED_TASKS' }
  | { type: 'EXECUTE_BATCH_OPERATION'; request: BatchOperationRequest };

// Background消息类型
export type BackgroundMessage =
  | { type: 'BATCH_OPERATION'; request: BatchOperationRequest }
  | { type: 'GET_LOGS' }
  | { type: 'CLEAR_LOGS' };

// Storage数据结构
export interface StorageData {
  domains: DomainConfig[];
  logs: OperationLog[];
}

// XXL-JOB API响应格式
export interface XXLJobApiResponse {
  code: number;
  msg: string | null;
  content: any;
}
