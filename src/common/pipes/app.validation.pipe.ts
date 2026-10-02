import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  ValidationPipe,
} from '@nestjs/common';
import type { ClassTransformOptions } from 'class-transformer';
import type { ValidationError, ValidatorOptions } from 'class-validator';
import deepmerge from 'deepmerge';
import { getValidateOptions, OptionsType } from '@/common/constants';

/**
 * 基于 ValidationPipe 的自定义管道。
 *
 * 核心思想：复用父类的校验 + 序列化能力（super.transform），
 * 只在「进入父类之前」按 DTO 上的 @ValidateOptions 动态合并选项，
 * 并在「退出之后」还原实例默认选项，避免全局单例管道在请求之间串号。
 *
 * 注册方式（推荐用 APP_PIPE，保证作用域与依赖注入）：
 *   // app.module.ts
 *   import { Module } from '@nestjs/common';
 *   import { APP_PIPE } from '@nestjs/core';
 *   import { CustomValidationPipe } from './common/pipes/custom-validation.pipe';
 *
 *   @Module({
 *     providers: [{ provide: APP_PIPE, useClass: CustomValidationPipe }],
 *   })
 *   export class AppModule {}
 *
 */
@Injectable()
export class AppValidationPipe extends ValidationPipe {
  constructor() {
    super({
      // transform 必须为 true：否则父类的 transformOptions 不会生效，
      // 第 11 步 super.transform 不会走序列化，合并出来的序列化选项等于白费。
      transform: true,
      whitelist: true, // 剥离 DTO 未声明的字段（可按需调整）
      stopAtFirstError: true,
      // 统一报错格式：配合全局异常过滤器 → 自动 statusCode 400，
      // 响应体结构与成功返回保持一致：{ statusCode, message, data }。
      exceptionFactory: (errors: ValidationError[]) => {
        const message = this.formatErrors(errors);
        return new BadRequestException({
          statusCode: 400,
          message,
          data: null,
        });
      },
    });
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    const { metatype, type: requestType } = metadata;

    // ──────────────── 前置守卫（不在 12 步内，但必须先有）────────────────
    // 基本类型（string/number/...）没有 DTO 类，也没有 @ValidateOptions，
    // 也无需序列化，直接交给父类默认行为，避免后面 getValidateOptions 报错。
    if (!metatype || this.isPrimitive(metatype)) {
      return super.transform(value, metadata);
    }

    // 【第 1 步】获取当前验证参数的 DTO 类，以及请求数据类型
    // metatype 就是 TypeScript 通过 design:paramtypes 反射出的参数类型
    // （Nest 已替我们 Reflect.getMetadata('design:paramtypes',...) 并封装进
    //  ArgumentMetadata.metatype）。它本身就是 DTO 类（如 CreateUserDto）。
    // requestType 是当前请求数据类型：@Body()→'body'、@Query()→'query'、
    // @Param()→'param'、@Headers()→'headers'、自定义→'custom'。
    const dtoClass = metatype as Function;

    // 【第 2 步】通过 metadata 读取这个 DTO 类上的自定义验证选项
    // 选项是用 @ValidateOptions 以 Reflect.defineMetadata 存在「类」上的，
    // 包含 type / serializeOptions / validateOptions。
    const customOptions = getValidateOptions(dtoClass);

    // 【第 3 步】把父类默认「验证选项」存进常量
    // 父类的受保护属性 this.validatorOptions 即 super({...}) 里传的验证选项。
    // 因为管道是全局单例，实例属性会跨请求存活；第 9 步我们要改写它，
    // 所以先备份一份快照，第 12 步再还原，防止污染下一次请求。
    // 用 { ... } 浅拷贝即可（deepmerge 不改动源，快照始终干净）。
    const defaultValidatorOptions: ValidatorOptions = {
      ...this.validatorOptions,
    };

    // 【第 4 步】把父类默认「序列化选项」存进常量（与第 3 步同理）
    // 父类序列化选项在受保护属性 this.transformOptions，初始可能为 undefined，
    // 用 ?? {} 兜底后再拷贝。验证和序列化是两套独立选项，必须分别合并/还原。
    const defaultTransformOptions: ClassTransformOptions = {
      ...(this.transformOptions ?? {}),
    };

    // 【第 5 步】把自定义选项解构出来
    // 拆出三样：该 DTO 打算验证哪种请求数据(dtoValidateType)、
    // 专属序列化选项(serializeOptions)、专属验证选项(validateOptions)。
    const {
      type: dtoValidateType,
      serializeOptions,
      validateOptions,
    } = customOptions;

    // 【第 6 步】没有自定义设置待验证的请求数据类型 → 默认验证 body
    // 绝大多数接口校验的是请求体，所以把 'body' 作为默认值最省事。
    const targetType: OptionsType = dtoValidateType ?? 'body';

    // 【第 7 步】请求数据类型与 DTO 设置的不一致 → 直接返回，不验证
    // 这是最关键的分流：一个接口可能同时有 @Body() 和 @Query()，
    // Nest 会对每个参数分别调用一次管道。验证 query 参数时若遇到
    // targetType='body' 的 DTO，两者不等 → 直接返回原始 value，不校验不序列化；
    // 验证 body 时遇到 query DTO 同理被跳过。结果：query 和 body 各管各的、互不影响。
    if (requestType !== targetType) {
      return value;
    }

    // 【第 8 步】深度合并「序列化选项」：自定义补充/覆盖父类默认
    // 用 deepmerge 而非 Object.assign：序列化选项可能是嵌套对象，
    // 浅合并会整段替换子对象，深度合并才能逐层合并且保留父类其它子字段。
    // deepmerge 不改动源对象，所以前面存的两份默认快照保持原样，便于第 12 步还原。
    this.transformOptions = deepmerge(
      defaultTransformOptions,
      serializeOptions ?? {},
    );

    // 【第 9 步】深度合并「验证选项」（与第 8 步同理，目标换成验证选项）
    // 合并结果写回 this.validatorOptions，第 11 步 super.transform 调用 validate()
    // 时会自动用上这份「全局默认 + 该类特例」的选项。
    this.validatorOptions = deepmerge(
      defaultValidatorOptions,
      validateOptions ?? {},
    );

    // 【第 10 步】设置待验证的值（文件上传部分此处忽略，直接用 value）
    // 规则：若请求数据不是对象，值本身就是待验证值（如只传一个字符串）；
    // 若是对象/数组，则遍历其中的值，如果某个值是对象或文件上传类型，
    // 就剔除其 fields 属性（Multer 文件上传会在值上挂 fields 元信息，
    // 不参与 DTO 校验/序列化）。普通 JSON 接口这一步基本是空操作。
    const valueToValidate = this.resolveValidateValue(value);

    // 【第 11 步】使用父类的 transform 方法完成校验 + 序列化并返回
    // 父类内部：先 validate()（用第 9 步合并好的 this.validatorOptions）跑
    // class-validator，失败则调 exceptionFactory 抛 BadRequestException(400)；
    // 通过后再 transformToClass()（用第 8 步合并好的 this.transformOptions）序列化。
    // 因为第 8/9 步已把合并结果写回实例属性，父类这次调用自动吃上这些选项。
    const result = await super.transform(valueToValidate, metadata);

    // 【第 12 步】重置默认选项为第 3/4 步存储的父类自带选项
    // 把单例管道恢复到「出厂默认」，避免下一请求（尤其是一个没有自定义选项的
    // DTO）继承本轮合并进去的特例，从而实现请求间不串号。
    this.validatorOptions = defaultValidatorOptions;
    this.transformOptions = defaultTransformOptions;

    return result;
  }

  /** 判断是否为基本类型（无 DTO，无需走自定义逻辑） */
  isPrimitive(metatype: Function): boolean {
    return [String, Boolean, Number, Array, Object].includes(metatype as any);
  }

  /**
   * 解析待验证值：
   *  - 非对象：值本身就是待验证值（如单个字符串）
   *  - 对象/数组：递归清理文件上传产生的 fields 属性
   */
  private resolveValidateValue(value: any): any {
    if (value === null || typeof value !== 'object') {
      return value;
    }
    if (Array.isArray(value)) {
      return value.map((item) => this.cleanFileFields(item));
    }
    return this.cleanFileFields(value);
  }

  /** 递归剔除对象 / 文件类型值上的 fields 属性（文件上传章节相关，不影响普通校验） */
  private cleanFileFields(input: any): any {
    if (input === null || typeof input !== 'object') return input;
    const out: Record<string, any> = {};
    for (const key of Object.keys(input)) {
      const v = input[key];
      if (v && typeof v === 'object') {
        const { fields, ...rest } = v; // 去掉 fields
        out[key] = this.cleanFileFields(rest);
      } else {
        out[key] = v;
      }
    }
    return out;
  }

  /** 把嵌套的 ValidationError[] 拍平成可读的字符串数组（便于统一报错） */
  private formatErrors(errors: ValidationError[]): string[] {
    const out: string[] = [];
    for (const e of errors) {
      if (e.constraints) out.push(...Object.values(e.constraints));
      if (e.children?.length) out.push(...this.formatErrors(e.children));
    }
    return out;
  }
}
