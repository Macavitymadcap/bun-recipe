import { BaseEntity, BaseRepository } from "./base-repository";

export interface IngredientEntity extends BaseEntity {
  recipe_id: number;
  quantity: number;
  unit?: string;
  name: string;
  order_index: number;
}

export class IngredientRepository extends BaseRepository<IngredientEntity> {
  constructor(dbPath?: string) {
    super("ingredients", dbPath);
  }

  protected initDb(): void {
    this.createTable();
    this.createIndexes();
  }

  protected createTable(): void {
    this.dbContext.execute(`
      CREATE TABLE IF NOT EXISTS ingredients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT,
        name TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
    `);
  }

  private createIndexes(): void {
    this.dbContext.execute(`
      CREATE INDEX IF NOT EXISTS idx_ingredients_recipe_id ON ingredients(recipe_id);
    `);
  }

  create(entity: Omit<IngredientEntity, "id">): IngredientEntity | null {
    return this.dbContext.transaction(() => {
      this.dbContext.queryOne(
        `INSERT INTO ingredients (recipe_id, quantity, unit, name, order_index) 
         VALUES ($recipe_id, $quantity, $unit, $name, $order_index);`,
        {
          $recipe_id: entity.recipe_id,
          $quantity: entity.quantity,
          $unit: entity.unit || null,
          $name: entity.name,
          $order_index: entity.order_index,
        },
      );

      const lastId = this.dbContext.getLastInsertedId();
      if (lastId === null) {
        return null;
      }

      return this.read(lastId);
    });
  }

  read(id: number): IngredientEntity | null {
    return this.dbContext.queryOne<IngredientEntity>(
      `SELECT * FROM ingredients WHERE id = $id;`,
      { $id: id },
    );
  }

  readAll(): IngredientEntity[] {
    return this.dbContext.query<IngredientEntity>(`SELECT * FROM ingredients;`);
  }

  update(entity: IngredientEntity): IngredientEntity | null {
    return this.dbContext.transaction(() => {
      const existing = this.read(entity.id);
      if (!existing) {
        return null;
      }

      this.dbContext.queryOne(
        `UPDATE ingredients SET
          recipe_id = $recipe_id,
          quantity = $quantity,
          unit = $unit,
          name = $name,
          order_index = $order_index
        WHERE id = $id;`,
        {
          $id: entity.id,
          $recipe_id: entity.recipe_id,
          $quantity: entity.quantity,
          $unit: entity.unit || null,
          $name: entity.name,
          $order_index: entity.order_index,
        },
      );

      return this.read(entity.id);
    });
  }

  delete(id: number): boolean {
    return this.dbContext.transaction(() => {
      const existing = this.read(id);
      if (!existing) {
        return false;
      }

      this.dbContext.queryOne(`DELETE FROM ingredients WHERE id = $id;`, {
        $id: id,
      });

      return this.read(id) === null;
    });
  }

  getByRecipeId(recipeId: number): IngredientEntity[] {
    return this.dbContext.query<IngredientEntity>(
      `SELECT * FROM ingredients WHERE recipe_id = $recipe_id ORDER BY order_index;`,
      { $recipe_id: recipeId },
    );
  }

  deleteByRecipeId(recipeId: number): boolean {
    if (this.getByRecipeId(recipeId).length === 0) return false;

    this.dbContext.queryOne(
      `DELETE FROM ingredients WHERE recipe_id = $recipe_id;`,
      { $recipe_id: recipeId },
    );

    return this.getByRecipeId(recipeId).length === 0;
  }
}
