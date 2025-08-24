import { BaseEntity, BaseRepository } from "./base-repository";

export interface RecipeEntity extends BaseEntity {
  name: string;
  servings: string;
  calories_per_serving?: number;
  preparation_time?: string;
  cooking_time?: string;
  created_at: string;
  updated_at: string;
}

export class RecipeRepository extends BaseRepository<RecipeEntity> {
  constructor(dbPath?: string) {
    super("recipes", dbPath);
  }

  protected initDb(): void {
    this.createTable();
  }

  protected createTable(): void {
    this.dbContext.execute(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      servings TEXT NOT NULL,
      calories_per_serving INTEGER,
      preparation_time TEXT,
      cooking_time TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  }

  create(
    entity: Omit<RecipeEntity, "id" | "created_at" | "updated_at">,
  ): RecipeEntity | null {
    const now = new Date().toISOString();

    this.dbContext.queryOne(
      `INSERT INTO recipes (name, servings, calories_per_serving, preparation_time, cooking_time, created_at, updated_at) 
         VALUES ($name, $servings, $calories_per_serving, $preparation_time, $cooking_time, $created_at, $updated_at);`,
      {
        $name: entity.name,
        $servings: entity.servings,
        $calories_per_serving: entity.calories_per_serving || null,
        $preparation_time: entity.preparation_time || null,
        $cooking_time: entity.cooking_time || null,
        $created_at: now,
        $updated_at: now,
      },
    );

    const lastId = this.dbContext.getLastInsertedId();
    if (lastId === null) {
      return null;
    }

    return this.read(lastId);
  }

  read(id: number): RecipeEntity | null {
    return this.dbContext.queryOne<RecipeEntity>(
      `SELECT * FROM recipes WHERE id = $id;`,
      { $id: id },
    );
  }

  readAll(): RecipeEntity[] {
    return this.dbContext.query<RecipeEntity>(
      `SELECT * FROM recipes ORDER BY created_at DESC;`,
    );
  }

  update(entity: RecipeEntity): RecipeEntity | null {
    const existing = this.read(entity.id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();

    this.dbContext.queryOne(
      `UPDATE recipes SET
        name = $name,
        servings = $servings,
        calories_per_serving = $calories_per_serving,
        preparation_time = $preparation_time,
        cooking_time = $cooking_time,
        updated_at = $updated_at
      WHERE id = $id;`,
      {
        $id: entity.id,
        $name: entity.name,
        $servings: entity.servings,
        $calories_per_serving: entity.calories_per_serving || null,
        $preparation_time: entity.preparation_time || null,
        $cooking_time: entity.cooking_time || null,
        $updated_at: now,
      },
    );

    return this.read(entity.id);
  }

  delete(id: number): boolean {
    return this.dbContext.transaction(() => {
      const existing = this.read(id);
      if (!existing) {
        return false;
      }

      this.dbContext.queryOne(`DELETE FROM recipes WHERE id = $id;`, {
        $id: id,
      });

      return this.read(id) === null;
    });
  }

  searchByName(searchTerm: string): RecipeEntity[] {
    return this.dbContext.query<RecipeEntity>(
      `SELECT * FROM recipes 
       WHERE name LIKE $searchTerm 
       ORDER BY created_at DESC;`,
      { $searchTerm: `%${searchTerm}%` },
    );
  }
}
