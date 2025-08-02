import { BaseEntity, BaseRepository } from "./base-repository";

export interface RecipeTagEntity extends BaseEntity {
  recipe_id: number;
  tag_id: number;
}

export class RecipeTagRepository extends BaseRepository<RecipeTagEntity> {
  constructor(dbPath?: string) {
    super("recipe_tags", dbPath);
  }

  protected initDb(): void {
    this.createTable();
    this.createIndexes();
  }

  protected createTable(): void {
    this.dbContext.execute(`
      CREATE TABLE IF NOT EXISTS recipe_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        recipe_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        UNIQUE(recipe_id, tag_id)
      );
    `);
  }

  private createIndexes(): void {
    this.dbContext.execute(`
      CREATE INDEX IF NOT EXISTS idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
      CREATE INDEX IF NOT EXISTS idx_recipe_tags_tag_id ON recipe_tags(tag_id);
    `);
  }

  create(entity: Omit<RecipeTagEntity, "id">): RecipeTagEntity | null {
    return this.dbContext.transaction(() => {
      this.dbContext.queryOne(
        `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($recipe_id, $tag_id);`,
        {
          $recipe_id: entity.recipe_id,
          $tag_id: entity.tag_id,
        },
      );

      const lastId = this.dbContext.getLastInsertedId();
      if (lastId === null) {
        return null;
      }

      return this.read(lastId);
    });
  }

  read(id: number): RecipeTagEntity | null {
    return this.dbContext.queryOne<RecipeTagEntity>(
      `SELECT * FROM recipe_tags WHERE id = $id;`,
      { $id: id },
    );
  }

  readAll(): RecipeTagEntity[] {
    return this.dbContext.query<RecipeTagEntity>(`SELECT * FROM recipe_tags;`);
  }

  update(entity: RecipeTagEntity): RecipeTagEntity | null {
    return this.dbContext.transaction(() => {
      const existing = this.read(entity.id);
      if (!existing) {
        return null;
      }

      this.dbContext.queryOne(
        `UPDATE recipe_tags SET
          recipe_id = $recipe_id,
          tag_id = $tag_id
        WHERE id = $id;`,
        {
          $id: entity.id,
          $recipe_id: entity.recipe_id,
          $tag_id: entity.tag_id,
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

      this.dbContext.queryOne(`DELETE FROM recipe_tags WHERE id = $id;`, {
        $id: id,
      });

      return this.read(id) === null;
    });
  }

  getByRecipeId(recipeId: number): RecipeTagEntity[] {
    return this.dbContext.query<RecipeTagEntity>(
      `SELECT * FROM recipe_tags WHERE recipe_id = $recipe_id;`,
      { $recipe_id: recipeId },
    );
  }

  getByTagId(tagId: number): RecipeTagEntity[] {
    return this.dbContext.query<RecipeTagEntity>(
      `SELECT * FROM recipe_tags WHERE tag_id = $tag_id;`,
      { $tag_id: tagId },
    );
  }

  deleteByRecipeId(recipeId: number): boolean {
    if (this.getByRecipeId(recipeId).length === 0) return false;

    this.dbContext.queryOne(
      `DELETE FROM recipe_tags WHERE recipe_id = $recipe_id;`,
      { $recipe_id: recipeId },
    );

    return this.getByRecipeId(recipeId).length === 0;
  }

  findByRecipeAndTag(recipeId: number, tagId: number): RecipeTagEntity | null {
    return this.dbContext.queryOne<RecipeTagEntity>(
      `SELECT * FROM recipe_tags WHERE recipe_id = $recipe_id AND tag_id = $tag_id;`,
      { $recipe_id: recipeId, $tag_id: tagId },
    );
  }
}
