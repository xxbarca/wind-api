import { IsNotEmpty, IsString } from 'class-validator';
import { ValidatorGroup } from '@/common/constants';

export class CreateCategoryDto {
  @IsString({ message: '分类名格式不对' })
  @IsNotEmpty({
    groups: [ValidatorGroup.CREATE],
    message: '分类名不能为空',
  })
  name: string;
}
