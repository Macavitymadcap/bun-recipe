import { DbConfig } from "../config";
import { BaseEntity, BaseRepository } from "./base-repository";

export interface RecipeEntity extends BaseEntity {
  name: string;
  servings: string;
  calories_per_serving?: number;
  preparation_time?: string;
  cooking_time?: string;
  created_at: number;
  updated_at: number;
}

export class RecipeRepository extends BaseRepository<RecipeEntity> {
  constructor(config: DbConfig) {
    super("recipes", config);
  }

  protected async initDb(): Promise<void> {
    await this.createTable();
  }

  protected async createTable(): Promise<void> {
    await this.dbContext.queryOne`
    CREATE TABLE IF NOT EXISTS recipes (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      servings TEXT NOT NULL,
      calories_per_serving INTEGER,
      preparation_time TEXT,
      cooking_time TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  }

  async create(
    entity: Omit<RecipeEntity, "id" | "created_at" | "updated_at">,
  ): Promise<RecipeEntity | null> {
    const result = await this.dbContext.queryOne<RecipeEntity>`
      INSERT INTO recipes (
        name, 
        servings, 
        calories_per_serving, 
        preparation_time, 
        cooking_time
      ) 
      VALUES (
        ${entity.name}, 
        ${entity.servings}, 
        ${entity.calories_per_serving || null}, 
        ${entity.preparation_time || null}, 
        ${entity.cooking_time || null}
      )
      RETURNING *;
    `;

    return result || null;
  }

  async read(id: number): Promise<RecipeEntity | null> {
    return await this.dbContext.queryOne<RecipeEntity>`
      SELECT * FROM recipes WHERE id = ${id};
    `;
  }

  async readAll(): Promise<RecipeEntity[]> {
    return await this.dbContext.query<RecipeEntity>`
      SELECT * FROM recipes ORDER BY created_at DESC;
    `;
  }

  async update(entity: RecipeEntity): Promise<RecipeEntity | null> {
    const existing = await this.read(entity.id);
    if (!existing) {
      return null;
    }

    const result = await this.dbContext.queryOne<RecipeEntity>`
      UPDATE recipes SET
        name = ${entity.name},
        servings = ${entity.servings},
        calories_per_serving = ${entity.calories_per_serving || null},
        preparation_time = ${entity.preparation_time || null},
        cooking_time = ${entity.cooking_time || null},
        updated_at = NOW()
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

      await sql`DELETE FROM recipes WHERE id = ${id};`;

      return (await this.read(id)) === null;
    });
  }

  async searchByName(searchTerm: string): Promise<RecipeEntity[]> {
    return await this.dbContext.query<RecipeEntity>`
      SELECT * FROM recipes
      WHERE name ILIKE ${`%${searchTerm}%`}
      ORDER BY created_at DESC;
    `;
  }

  async getTotalRecipeCount(): Promise<number> {
    const [result] = await this.dbContext.query<{ count: string }>`
      SELECT COUNT(*) as count FROM recipes;
    `;

    return parseInt(result?.count || "0");
  }
}
