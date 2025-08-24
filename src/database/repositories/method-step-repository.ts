import { BaseEntity, BaseRepository } from "./base-repository";

export interface MethodStepEntity extends BaseEntity {
  recipe_id: number;
  order_index: number;
  instruction: string;
}

export class MethodStepRepository extends BaseRepository<MethodStepEntity> {
  constructor(dbPath?: string) {
    super("method_steps", dbPath);
  }

  protected initDb(): void {
    this.createTable();
    this.createIndexes();
  }

  protected createTable(): void {
    this.dbContext.execute(`
      CREATE TABLE IF NOT EXISTS method_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        instruction TEXT NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
    `);
  }

  private createIndexes(): void {
    this.dbContext.execute(`
      CREATE INDEX IF NOT EXISTS idx_method_steps_recipe_id ON method_steps(recipe_id);
    `);
  }

  create(entity: Omit<MethodStepEntity, "id">): MethodStepEntity | null {
    this.dbContext.queryOne(
      `INSERT INTO method_steps (recipe_id, order_index, instruction) 
         VALUES ($recipe_id, $order_index, $instruction);`,
      {
        $recipe_id: entity.recipe_id,
        $order_index: entity.order_index,
        $instruction: entity.instruction,
      },
    );

    const lastId = this.dbContext.getLastInsertedId();
    if (lastId === null) {
      return null;
    }

    return this.read(lastId);
  }

  read(id: number): MethodStepEntity | null {
    return this.dbContext.queryOne<MethodStepEntity>(
      `SELECT * FROM method_steps WHERE id = $id;`,
      { $id: id },
    );
  }

  readAll(): MethodStepEntity[] {
    return this.dbContext.query<MethodStepEntity>(
      `SELECT * FROM method_steps;`,
    );
  }

  readByRecipeId(recipeId: number): MethodStepEntity[] {
    return this.dbContext.query<MethodStepEntity>(
      `SELECT * FROM method_steps WHERE recipe_id = $recipe_id ORDER BY order_index;`,
      { $recipe_id: recipeId },
    );
  }

  update(entity: MethodStepEntity): MethodStepEntity | null {
    const existing = this.read(entity.id);
    if (!existing) {
      return null;
    }

    this.dbContext.queryOne(
      `UPDATE method_steps SET
          recipe_id = $recipe_id,
          order_index = $order_index,
          instruction = $instruction
        WHERE id = $id;`,
      {
        $id: entity.id,
        $recipe_id: entity.recipe_id,
        $order_index: entity.order_index,
        $instruction: entity.instruction,
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

      this.dbContext.queryOne(`DELETE FROM method_steps WHERE id = $id;`, {
        $id: id,
      });

      return this.read(id) === null;
    });
  }

  deleteByRecipeId(recipeId: number): boolean {
    if (this.readByRecipeId(recipeId).length === 0) return false;

    this.dbContext.queryOne(
      `DELETE FROM method_steps WHERE recipe_id = $recipe_id;`,
      { $recipe_id: recipeId },
    );

    return this.readByRecipeId(recipeId).length === 0;
  }
}
