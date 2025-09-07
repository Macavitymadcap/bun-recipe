import { DbConfig } from "../config";
import { BaseEntity, BaseRepository } from "./base-repository";

export interface TagEntity extends BaseEntity {
  name: string;
}

export class TagRepository extends BaseRepository<TagEntity> {
  constructor(config: DbConfig) {
    super("tags", config);
  }

  protected async initDb(): Promise<void> {
    await this.createTable();
  }

  protected async createTable(): Promise<void> {
    await this.dbContext.queryOne`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );
    `;
  }

  async create(entity: Omit<TagEntity, "id">): Promise<TagEntity | null> {
    const result = await this.dbContext.queryOne<TagEntity>`
      INSERT INTO tags (name)
      VALUES (${entity.name})
      RETURNING *;
    `;

    return result || null;
  }

  async read(id: number): Promise<TagEntity | null> {
    return await this.dbContext.queryOne<TagEntity>`
      SELECT * FROM tags WHERE id = ${id};
    `;
  }

  async readAll(): Promise<TagEntity[]> {
    return await this.dbContext.query<TagEntity>`
      SELECT * FROM tags ORDER BY name;
    `;
  }

  async readByName(name: string): Promise<TagEntity | null> {
    return await this.dbContext.queryOne<TagEntity>`
      SELECT * FROM tags WHERE name = ${name};
    `;
  }

  async createOrRead(name: string): Promise<TagEntity | null> {
    const existing = await this.readByName(name);
    if (existing) {
      return existing;
    }

    return await this.create({ name });
  }

  async update(entity: TagEntity): Promise<TagEntity | null> {
    const existing = await this.read(entity.id);
    if (!existing) {
      return null;
    }

    const result = await this.dbContext.queryOne<TagEntity>`
      UPDATE tags SET 
        name = ${entity.name} 
      WHERE id = ${entity.id}
      RETURNING *;
    `;

    return result || null;
  }

  async delete(id: number): Promise<boolean> {
    return await this.dbContext.transaction(async (sql) => {
      const existing = await this.read(id);
      if (!existing) {
        return false;
      }

      await sql`DELETE FROM tags WHERE id = ${id};`;

      return (await this.read(id)) === null;
    });
  }
}
