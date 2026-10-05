/**
 * ==================== 统一响应格式 ====================
 *
 * 所有接口（正常 / 异常）均返回同一外层结构，前端只需读 body.code 即可判断结果。
 *
 * 正常：
 * {
 *   "code": 0,
 *   "message": "success",
 *   "data": { ... },                 // 列表接口此处为数组
 *   "meta": { "pagination": { ... } },// 仅分页接口出现
 *   "timestamp": "2026-10-01 10:46:46"
 * }
 *
 * 异常：
 * {
 *   "code": 400,                     // 与 HTTP 状态码一致
 *   "message": "请求参数校验失败",
 *   "error": { "type": "VALIDATION_ERROR", "details": [ { "field": "...", "message": "..." } ] },
 *   "path": "/api/products?pageSize=999",
 *   "timestamp": "2026-10-01 10:46:46"
 * }
 */

/** 业务成功码：0 表示成功，非 0 为错误码（与 HTTP 状态码一致） */
export const SUCCESS_CODE = 0;

/** 成功响应默认文案 */
export const SUCCESS_MESSAGE = 'success';

/** 分页信息 */
export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

/** 成功响应附加元信息（目前仅分页） */
export interface ResponseMeta {
  pagination: Pagination;
}

/** 统一成功响应体 */
export interface ApiSuccess<T> {
  code: typeof SUCCESS_CODE;
  message: string;
  data: T;
  meta?: ResponseMeta;
  timestamp: string;
}

/** 错误类型（便于前端按类型分支处理） */
export const ErrorType = {
  /** 参数校验失败（class-validator / 全局 ValidationPipe） */
  VALIDATION: 'VALIDATION_ERROR',
  /** 业务参数不合法 */
  BAD_REQUEST: 'BAD_REQUEST',
  /** 未认证 */
  UNAUTHORIZED: 'UNAUTHORIZED',
  /** 无权限 */
  FORBIDDEN: 'FORBIDDEN',
  /** 资源不存在 / 路由不存在 */
  NOT_FOUND: 'NOT_FOUND',
  /** 资源冲突（唯一约束等） */
  CONFLICT: 'CONFLICT',
  /** 数据库错误 */
  DATABASE: 'DATABASE_ERROR',
  /** 未捕获的服务端错误 */
  INTERNAL: 'INTERNAL_ERROR',
} as const;
export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];

/** 错误明细 */
export interface ApiErrorDetail {
  /** 出错字段（校验类错误才有） */
  field?: string;
  message: string;
}

/** 错误主体 */
export interface ApiErrorBody {
  type: ErrorType;
  details: ApiErrorDetail[];
}

/** 统一失败响应体 */
export interface ApiFailure {
  code: number;
  message: string;
  error: ApiErrorBody;
  /** 请求路径（含 query） */
  path: string;
  timestamp: string;
}

/** 判断是否为分页结果（PageResult） */
export function isPageResult(value: any): value is PaginationResultLike {
  return (
    !!value &&
    typeof value === 'object' &&
    Array.isArray(value.list) &&
    typeof value.total === 'number' &&
    typeof value.page === 'number' &&
    typeof value.pageSize === 'number' &&
    typeof value.pages === 'number'
  );
}

interface PaginationResultLike {
  list: any[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}
