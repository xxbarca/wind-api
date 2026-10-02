import 'reflect-metadata';
import type { ClassTransformOptions } from 'class-transformer';
import type { ValidatorOptions } from 'class-validator';

/**
 * 待验证的请求数据类型。
 * 对应 NestJS ArgumentMetadata.type 的取值（body/query/param/header/custom）
 * 加上这里自定义的扩展，用来告诉管道「这个 DTO 到底要校验哪部分请求数据」。
 */
export type OptionsType = 'body' | 'query' | 'param' | 'header' | 'custom';

/** DTO 类上可声明的自定义验证选项 */
export interface ValidateOptionsMeta {
  /** 该 DTO 要验证的请求数据类型，默认 'body' */
  type?: OptionsType;
  /** class-transformer 序列化选项（如 groups、excludeExtraneousValues 等） */
  serializeOptions?: ClassTransformOptions;
  /** class-validator 验证选项（如 groups、stopOnFirstError、whitelist 等） */
  validateOptions?: ValidatorOptions;
}

/** metadata 的 key，选项按「类」维度存储 */
const VALIDATE_OPTIONS_KEY = 'nest:validate-options';

/**
 * 挂在校验用的 DTO 类上，声明该类专属的序列化 / 验证选项与请求数据类型。
 * 例：
 *   @ValidateOptions({ type: 'query' })
 *   export class ListQueryDto { ... }
 *
 * 通过 Reflect.defineMetadata 把选项存在「类本身」上（不是实例），
 * 供 CustomValidationPipe 在运行时读取。
 */
export function ValidateOptions(options: ValidateOptionsMeta): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(VALIDATE_OPTIONS_KEY, options, target);
  };
}

/** 从 DTO 类上读取自定义选项；未声明则返回空对象 */
export function getValidateOptions(target: Function): ValidateOptionsMeta {
  return Reflect.getMetadata(VALIDATE_OPTIONS_KEY, target) ?? {};
}

export const ValidatorGroup = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  PAGE: 'PAGE',
};
