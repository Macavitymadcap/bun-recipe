import { BaseEntity, BaseRepository } from "./base-repository";

export interface DirectionEntity extends BaseEntity {
  recipe_id: number;
  order_index: number;
  instruction: string;
}

export class DirectionRepository extends BaseRepository<DirectionEntity> {
  constructor(dbPath?: string) {
    super("directions", dbPath);
  }

  protected initDb(): void {
    this.createTable();
    this.createIndexes();
  }

  protected createTable(): void {
    this.dbContext.execute(`
      CREATE TABLE IF NOT EXISTS directions (
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
      CREATE INDEX IF NOT EXISTS idx_directions_recipe_id ON directions(recipe_id);
    `);
  }

  create(entity: Omit<DirectionEntity, "id">): DirectionEntity | null {
    this.dbContext.queryOne(
      `INSERT INTO directions (recipe_id, order_index, instruction) 
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

  read(id: number): DirectionEntity | null {
    return this.dbContext.queryOne<DirectionEntity>(
      `SELECT * FROM directions WHERE id = $id;`,
      { $id: id },
    );
  }

  readAll(): DirectionEntity[] {
    return this.dbContext.query<DirectionEntity>(
      `SELECT * FROM directions;`,
    );
  }

  readByRecipeId(recipeId: number): DirectionEntity[] {
    return this.dbContext.query<DirectionEntity>(
      `SELECT * FROM directions WHERE recipe_id = $recipe_id ORDER BY order_index;`,
      { $recipe_id: recipeId },
    );
  }

  update(entity: DirectionEntity): DirectionEntity | null {
    const existing = this.read(entity.id);
    if (!existing) {
      return null;
    }

    this.dbContext.queryOne(
      `UPDATE directions SET
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

      this.dbContext.queryOne(`DELETE FROM directions WHERE id = $id;`, {
        $id: id,
      });

      return this.read(id) === null;
    });
  }

  deleteByRecipeId(recipeId: number): boolean {
    if (this.readByRecipeId(recipeId).length === 0) return false;

    this.dbContext.queryOne(
      `DELETE FROM directions WHERE recipe_id = $recipe_id;`,
      { $recipe_id: recipeId },
    );

    return this.readByRecipeId(recipeId).length === 0;
  }
}
