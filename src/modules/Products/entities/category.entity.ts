import { _BaseEntity } from '@/common/bases';
import { Column, Entity } from 'typeorm';
import { OnlineStatus } from '@/modules/Products/constants';

@Entity('category')
export class CategoryEntity extends _BaseEntity {
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    unique: true,
  })
  name: string;

  @Column({
    type: 'enum',
    nullable: false,
    enum: OnlineStatus,
    default: OnlineStatus.ONLINE,
  })
  status: OnlineStatus;
}
