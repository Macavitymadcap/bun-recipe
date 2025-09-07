import { DbConfig } from "../config";
import { BaseEntity, BaseRepository } from "./base-repository";
import { sql } from "bun";

export interface CooksNoteEntity extends BaseEntity {
  recipe_id: number;
  note: string;
}

export class CooksNoteRepository extends BaseRepository<CooksNoteEntity> {
  constructor(config: DbConfig) {
    super("cooks_notes", config);
  }

  protected async initDb(): Promise<void> {
    await this.createTable();
    await this.createIndexes();
  }

  protected async createTable(): Promise<void> {
    await this.dbContext.queryOne`
      CREATE TABLE IF NOT EXISTS cooks_notes (
        id SERIAL PRIMARY KEY,
        recipe_id INTEGER NOT NULL,
        note TEXT NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
    `;
  }

  private async createIndexes(): Promise<void> {
    await this.dbContext.queryOne`
      CREATE INDEX IF NOT EXISTS idx_cooks_notes_recipe_id ON cooks_notes(recipe_id);
    `;
  }

  async create(entity: Omit<CooksNoteEntity, "id">): Promise<CooksNoteEntity | null> {
    const result = await this.dbContext.queryOne<CooksNoteEntity>`
      INSERT INTO cooks_notes (recipe_id, note) 
      VALUES (${entity.recipe_id}, ${entity.note})
      RETURNING *;
    `;

    return result || null;
  }

  async read(id: number): Promise<CooksNoteEntity | null> {
    return await this.dbContext.queryOne<CooksNoteEntity>`
      SELECT * FROM cooks_notes WHERE id = ${id};
    `;
  }

  async readAll(): Promise<CooksNoteEntity[]> {
    return await this.dbContext.query<CooksNoteEntity>`
      SELECT * FROM cooks_notes;
    `;
  }

  async update(entity: CooksNoteEntity): Promise<CooksNoteEntity | null> {
    const existing = await this.read(entity.id);
    if (!existing) {
      return null;
    }

    const result = await this.dbContext.queryOne<CooksNoteEntity>`
      UPDATE cooks_notes SET
        recipe_id = ${entity.recipe_id},
        note = ${entity.note}
      WHERE id = ${entity.id}
      RETURNING *;
    `;

    return result || null;
  }

  async readByRecipeId(recipeId: number): Promise<CooksNoteEntity[]> {
    return await this.dbContext.query<CooksNoteEntity>`
      SELECT * FROM cooks_notes WHERE recipe_id = ${recipeId};
    `;
  }

  async delete(id: number): Promise<boolean> {
    return await this.dbContext.transaction(async (sql) => {
      const existing = await this.read(id);
      if (!existing) {
        return false;
      }

      await sql`DELETE FROM cooks_notes WHERE id = ${id};`

      return await this.read(id) === null;
    });
  }

  private async isDeleted(recipeId: number) {
    return (await this.readByRecipeId(recipeId)).length === 0;
  }

  async deleteByRecipeId(recipeId: number): Promise<boolean> {
    const isDeleted = await this.isDeleted(recipeId);
    if (isDeleted) return false;

    await this.dbContext.queryOne`
      DELETE FROM cooks_notes WHERE recipe_id = ${recipeId};
    `;

    return await this.isDeleted(recipeId)
  }
}
