import { DbConfig } from "../config";
import { BaseEntity, BaseRepository } from "./base-repository";

export interface DirectionEntity extends BaseEntity {
  recipe_id: number;
  order_index: number;
  instruction: string;
}

export class DirectionRepository extends BaseRepository<DirectionEntity> {
  constructor(dbConfig: DbConfig) {
    super("directions", dbConfig);
  }

  protected async initDb(): Promise<void> {
    await this.createTable();
    await this.createIndexes();
  }

  protected async createTable(): Promise<void> {
    await this.dbContext.queryOne`
      CREATE TABLE IF NOT EXISTS directions (
        id SERIAL PRIMARY KEY,
        recipe_id INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        instruction TEXT NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
    `;
  }

  private async createIndexes(): Promise<void> {
    await this.dbContext.queryOne`
      CREATE INDEX IF NOT EXISTS idx_directions_recipe_id ON directions(recipe_id);
    `;
  }

  async create(entity: Omit<DirectionEntity, "id">): Promise<DirectionEntity | null> {
    const result = await this.dbContext.queryOne<DirectionEntity>`
      INSERT INTO directions (recipe_id, order_index, instruction) 
      VALUES (${entity.recipe_id}, ${entity.order_index}, ${entity.instruction})
      RETURNING *;
    `;

    return result || null;
  }

  async read(id: number): Promise<DirectionEntity | null> {
    return await this.dbContext.queryOne<DirectionEntity>`
      SELECT * FROM directions WHERE id = ${id};
    `;
  }

  async readAll(): Promise<DirectionEntity[]> {
    return await this.dbContext.query<DirectionEntity>`
      SELECT * FROM directions;
    `;
  }

  async readByRecipeId(recipeId: number): Promise<DirectionEntity[]> {
    return await this.dbContext.query<DirectionEntity>`
      SELECT * FROM directions WHERE recipe_id = ${recipeId} ORDER BY order_index;
    `;
  }

  async update(entity: DirectionEntity): Promise<DirectionEntity | null> {
    const existing = await this.read(entity.id);
    if (!existing) {
      return null;
    }

    const result = await this.dbContext.queryOne<DirectionEntity>`
      UPDATE directions SET
        recipe_id = ${entity.recipe_id},
        order_index = ${entity.order_index},
        instruction = ${entity.instruction}
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

      await sql`DELETE FROM directions WHERE id = ${id};`; 

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
      DELETE FROM directions WHERE recipe_id = ${recipeId};
    `;

    return await this.isDeleted(recipeId);
  }
}
