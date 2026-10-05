import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { DtoValidation, ValidatorGroup } from '@/common/constants';
import { BasePageDto } from '@/common/bases/base.page.dto';

@DtoValidation({ groups: [ValidatorGroup.CREATE] })
export class CreateCategoryDto {
  @IsString({ message: '分类名格式不对' })
  @IsNotEmpty({
    groups: [ValidatorGroup.CREATE],
    message: '分类名不能为空',
  })
  name: string;
}

@DtoValidation({ groups: [ValidatorGroup.UPDATE] })
export class UpdateCategoryDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty({ groups: [ValidatorGroup.UPDATE] })
  id: string;

  @IsOptional({ groups: [ValidatorGroup.UPDATE] })
  name?: string;
}

@DtoValidation({ groups: [ValidatorGroup.PAGE] })
export class PageCategoryDto extends BasePageDto {}
