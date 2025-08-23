import { BaseEntity, BaseRepository } from "./base-repository";

export interface CooksNoteEntity extends BaseEntity {
  recipe_id: number;
  note: string;
}

export class CooksNoteRepository extends BaseRepository<CooksNoteEntity> {
  constructor(dbPath?: string) {
    super("cooks_notes", dbPath);
  }

  protected initDb(): void {
    this.createTable();
    this.createIndexes();
  }

  protected createTable(): void {
    this.dbContext.execute(`
      CREATE TABLE IF NOT EXISTS cooks_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        note TEXT NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
      );
    `);
  }

  private createIndexes(): void {
    this.dbContext.execute(`
      CREATE INDEX IF NOT EXISTS idx_cooks_notes_recipe_id ON cooks_notes(recipe_id);
    `);
  }

  create(entity: Omit<CooksNoteEntity, "id">): CooksNoteEntity | null {
    this.dbContext.queryOne(
      `INSERT INTO cooks_notes (recipe_id, note) VALUES ($recipe_id, $note);`,
      {
        $recipe_id: entity.recipe_id,
        $note: entity.note,
      },
    );

    const lastId = this.dbContext.getLastInsertedId();
    if (lastId === null) {
      return null;
    }

    return this.read(lastId);
  }

  read(id: number): CooksNoteEntity | null {
    return this.dbContext.queryOne<CooksNoteEntity>(
      `SELECT * FROM cooks_notes WHERE id = $id;`,
      { $id: id },
    );
  }

  readAll(): CooksNoteEntity[] {
    return this.dbContext.query<CooksNoteEntity>(`SELECT * FROM cooks_notes;`);
  }

  update(entity: CooksNoteEntity): CooksNoteEntity | null {
    const existing = this.read(entity.id);
    if (!existing) {
      return null;
    }

    this.dbContext.queryOne(
      `UPDATE cooks_notes SET
          recipe_id = $recipe_id,
          note = $note
        WHERE id = $id;`,
      {
        $id: entity.id,
        $recipe_id: entity.recipe_id,
        $note: entity.note,
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

      this.dbContext.queryOne(`DELETE FROM cooks_notes WHERE id = $id;`, {
        $id: id,
      });

      return this.read(id) === null;
    });
  }

  getByRecipeId(recipeId: number): CooksNoteEntity[] {
    return this.dbContext.query<CooksNoteEntity>(
      `SELECT * FROM cooks_notes WHERE recipe_id = $recipe_id;`,
      { $recipe_id: recipeId },
    );
  }

  deleteByRecipeId(recipeId: number): boolean {
    if (this.getByRecipeId(recipeId).length === 0) return false;

    this.dbContext.queryOne(
      `DELETE FROM cooks_notes WHERE recipe_id = $recipe_id;`,
      { $recipe_id: recipeId },
    );

    return this.getByRecipeId(recipeId).length === 0;
  }
}
