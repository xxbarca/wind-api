import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class _BaseEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DeleteDateColumn()
  delete_time: Date;

  @UpdateDateColumn()
  update_time: Date;

  @CreateDateColumn()
  create_time: Date;

  @Column({
    comment: '描述',
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    comment: '排序',
    default: 0,
  })
  index: number;
}
