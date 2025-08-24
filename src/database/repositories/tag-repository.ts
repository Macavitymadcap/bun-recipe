import { BaseEntity, BaseRepository } from "./base-repository";

export interface TagEntity extends BaseEntity {
  name: string;
}

export class TagRepository extends BaseRepository<TagEntity> {
  constructor(dbPath?: string) {
    super("tags", dbPath);
  }

  protected initDb(): void {
    this.createTable();
  }

  protected createTable(): void {
    this.dbContext.execute(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE
      );
    `);
  }

  create(entity: Omit<TagEntity, "id">): TagEntity | null {
    this.dbContext.queryOne(`INSERT INTO tags (name) VALUES ($name);`, {
      $name: entity.name,
    });

    const lastId = this.dbContext.getLastInsertedId();
    if (lastId === null) {
      return null;
    }

    return this.read(lastId);
  }

  read(id: number): TagEntity | null {
    return this.dbContext.queryOne<TagEntity>(
      `SELECT * FROM tags WHERE id = $id;`,
      { $id: id },
    );
  }

  readAll(): TagEntity[] {
    return this.dbContext.query<TagEntity>(`SELECT * FROM tags ORDER BY name;`);
  }

  readByName(name: string): TagEntity | null {
    return this.dbContext.queryOne<TagEntity>(
      `SELECT * FROM tags WHERE name = $name;`,
      { $name: name },
    );
  }

  createOrRead(name: string): TagEntity | null {
    const existing = this.readByName(name);
    if (existing) {
      return existing;
    }

    return this.create({ name });
  }

  update(entity: TagEntity): TagEntity | null {
    const existing = this.read(entity.id);
    if (!existing) {
      return null;
    }

    this.dbContext.queryOne(`UPDATE tags SET name = $name WHERE id = $id;`, {
      $id: entity.id,
      $name: entity.name,
    });

    return this.read(entity.id);
  }

  delete(id: number): boolean {
    return this.dbContext.transaction(() => {
      const existing = this.read(id);
      if (!existing) {
        return false;
      }

      this.dbContext.queryOne(`DELETE FROM tags WHERE id = $id;`, { $id: id });

      return this.read(id) === null;
    });
  }
}
