import { ObjectLiteral } from 'typeorm';
import { BaseRepository } from '@/common/bases/base.repository';

export class BaseService<E extends ObjectLiteral, R extends BaseRepository<E>> {
  /**
   * 服务默认存储类
   */
  protected repository: R;

  constructor(repository: R) {
    this.repository = repository;
    if (!(this.repository instanceof BaseRepository)) {
      throw new Error(
        'Repository must instance of BaseRepository in DataService!',
      );
    }
  }

  async create(data: any) {
    return await this.repository.save(
      this.repository.create(data as unknown as E),
    );
  }

  async findOne(id: string): Promise<E> {
    return await this.repository.findByIdOrFail(id);
  }

  async update(id: string, data: any) {
    const entity = await this.findOne(id);
    this.applyChanges(entity, data);
    return await this.repository.save(entity);
  }

  async delete(id: string) {
    return await this.repository.delete(id);
  }

  async toggleStatus(id: string) {
    return await this.repository.toggleStatus(id);
  }

  protected applyChanges(entity: any, dto: any): void {
    for (const [key, value] of Object.entries(dto)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (value !== undefined) entity[key] = value;
    }
  }
}
