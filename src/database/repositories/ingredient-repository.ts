import { DbConfig } from "../config";
import { BaseEntity, BaseRepository } from "./base-repository";
import { sql } from "bun";

export interface IngredientEntity extends BaseEntity {
  recipe_id: number;
  quantity?: string;
  unit?: string;
  name: string;
  order_index: number;
}

export class IngredientRepository extends BaseRepository<IngredientEntity> {
  constructor(config: DbConfig) {
    super("ingredients", config);
  }

  protected async initDb(): Promise<void> {
    await this.createTable();
    await this.createIndexes();
  }

  protected async createTable(): Promise<void> {
    await this.dbContext.queryOne`
      CREATE TABLE IF NOT EXISTS ingredients (
        id SERIAL PRIMARY KEY,
        recipe_id INTEGER NOT NULL,
        quantity TEXT,
        unit TEXT,
        name TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );`;
  }

  private async createIndexes(): Promise<void> {
    await this.dbContext.queryOne`
      CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id);
    `;
  }

  async create(entity: Omit<IngredientEntity, "id">): Promise<IngredientEntity | null> {
    const result = await this.dbContext.queryOne<IngredientEntity>`
      INSERT INTO ingredients (
        recipe_id, 
        quantity,
        unit,
        name,
        order_index
      ) 
      VALUES (
        ${entity.recipe_id},
        ${entity.quantity},
        ${entity.unit},
        ${entity.name},
        ${entity.order_index}
      )
      RETURNING *;
    `;

    return result || null
  }

  async read(id: number): Promise<IngredientEntity | null> {
    return await this.dbContext.queryOne<IngredientEntity>`
      SELECT * FROM ingredients WHERE id = ${id};
    `;
  }

  async readAll(): Promise<IngredientEntity[]> {
    return await this.dbContext.query<IngredientEntity>`
      SELECT * FROM ingredients;
    `;
  }

  async readByRecipeId(recipeId: number): Promise<IngredientEntity[]> {
    return await this.dbContext.query<IngredientEntity>`
      SELECT * FROM ingredients WHERE recipe_id = ${recipeId} ORDER BY order_index;
    `;
  }

  async update(entity: IngredientEntity): Promise<IngredientEntity | null> {
    const existing = await this.read(entity.id);
    if (!existing) {
      return null;
    }

    const result = await this.dbContext.queryOne<IngredientEntity>`
      UPDATE ingredients SET
        recipe_id = ${entity.recipe_id},
        quantity = ${entity.quantity},
        unit = ${entity.unit},
        name = ${entity.name},
        order_index = ${entity.order_index}
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

      await sql`
        DELETE FROM ingredients WHERE id = ${id};
      `; 

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
      DELETE FROM ingredients WHERE recipe_id = ${recipeId};
    `;

    return await this.isDeleted(recipeId);
  }

  async searchByName(searchTerm: string): Promise<IngredientEntity[]> {
    return await this.dbContext.query<IngredientEntity>`
      SELECT * FROM ingredients 
      WHERE name LIKE ${`%${searchTerm}%`} 
      ORDER BY name;
    `;
  }
}
