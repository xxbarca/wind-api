import { IsNotEmpty, IsNumber } from 'class-validator';
import { ValidatorGroup } from '@/common/constants';

export class BasePageDto {
  @IsNumber()
  @IsNotEmpty({ groups: [ValidatorGroup.PAGE] })
  pageNo: number;

  @IsNumber()
  @IsNotEmpty({ groups: [ValidatorGroup.PAGE] })
  pageSize: number;
}
