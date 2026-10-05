/** ==================== 参数校验公共配置 ==================== */
import { BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ErrorType } from '@/common/api-response';

/** 把 class-validator 的错误转为统一响应体的 details */
export function toValidationDetails(errors: ValidationError[]) {
  return errors.map((e) => ({
    field: e.property,
    message: Object.values(e.constraints || {}).join('; '),
  }));
}

/**
 * 校验失败统一抛出 VALIDATION_ERROR 结构。
 * 注意：直接抛裸数组会被 Nest 包成 { message: [...] }，导致字段名丢失。
 */
export function validationExceptionFactory(errors: ValidationError[]) {
  return new BadRequestException({
    type: ErrorType.VALIDATION,
    details: toValidationDetails(errors),
  });
}

/** 全局 ValidationPipe 与参数级 BaseDtoPipe 共用的选项 */
export const VALIDATION_PIPE_OPTIONS = {
  transform: true, // 按 DTO 类型自动转换（含 query 中的 number）
  whitelist: true, // 剔除 DTO 未声明的属性
  exceptionFactory: validationExceptionFactory,
};
