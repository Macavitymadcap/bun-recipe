import { DbConfig } from "../config";
import { BaseEntity, BaseRepository } from "./base-repository";

export interface RecipeTagEntity extends BaseEntity {
  recipe_id: number;
  tag_id: number;
}

interface TagCount {
  tag_id: number;
  count: number;
}

export class RecipeTagRepository extends BaseRepository<RecipeTagEntity> {
  constructor(config: DbConfig) {
    super("recipe_tags", config);
  }

  protected async initDb(): Promise<void> {
    await this.createTable();
    await this.createIndexes();
  }

  protected async createTable(): Promise<void> {
    await this.dbContext.queryOne`
      CREATE TABLE IF NOT EXISTS recipe_tags (
        id SERIAL PRIMARY KEY,
        recipe_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
        UNIQUE(recipe_id, tag_id)
      );
    `;
  }

  private async createIndexes(): Promise<void> {
    await this.dbContext.queryOne`
      CREATE INDEX IF NOT EXISTS idx_recipe_tags_recipe_id ON recipe_tags(recipe_id);
    `;
    await this.dbContext.queryOne`
      CREATE INDEX IF NOT EXISTS idx_recipe_tags_tag_id ON recipe_tags(tag_id);
    `;
  }

  async create(
    entity: Omit<RecipeTagEntity, "id">,
  ): Promise<RecipeTagEntity | null> {
    const result = await this.dbContext.queryOne<RecipeTagEntity>`
      INSERT INTO recipe_tags (
        recipe_id, 
        tag_id
      ) 
      VALUES (
        ${entity.recipe_id}, 
        ${entity.tag_id}
      )
      RETURNING *;
    `;

    return result || null;
  }

  async read(id: number): Promise<RecipeTagEntity | null> {
    return await this.dbContext.queryOne<RecipeTagEntity>`
      SELECT * FROM recipe_tags WHERE id = ${id};
    `;
  }

  async readAll(): Promise<RecipeTagEntity[]> {
    return await this.dbContext.query<RecipeTagEntity>`
      SELECT * FROM recipe_tags;
    `;
  }

  async readByTagId(tagId: number): Promise<RecipeTagEntity[]> {
    return await this.dbContext.query<RecipeTagEntity>`
      SELECT * FROM recipe_tags WHERE tag_id = ${tagId};
    `;
  }

  async readByRecipeId(recipeId: number): Promise<RecipeTagEntity[]> {
    return await this.dbContext.query<RecipeTagEntity>`
      SELECT * FROM recipe_tags WHERE recipe_id = ${recipeId};
    `;
  }

  async readByRecipeAndTag(
    recipeId: number,
    tagId: number,
  ): Promise<RecipeTagEntity | null> {
    return await this.dbContext.queryOne<RecipeTagEntity>`
      SELECT * FROM recipe_tags WHERE recipe_id = ${recipeId} AND tag_id = ${tagId};
    `;
  }

  async update(entity: RecipeTagEntity): Promise<RecipeTagEntity | null> {
    const existing = await this.read(entity.id);
    if (!existing) {
      return null;
    }

    const result = await this.dbContext.queryOne<RecipeTagEntity>`
      UPDATE recipe_tags SET
        recipe_id = ${entity.recipe_id},
        tag_id = ${entity.tag_id}
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
        DELETE FROM recipe_tags WHERE id = ${id};
      `;

      return (await this.read(id)) === null;
    });
  }

  private async isDeleted(recipeId: number) {
    return (await this.readByRecipeId(recipeId)).length === 0;
  }

  async deleteByRecipeId(recipeId: number): Promise<boolean> {
    const isDeleted = await this.isDeleted(recipeId);

    if (isDeleted) return false;

    await this.dbContext.queryOne`
      DELETE FROM recipe_tags WHERE recipe_id = ${recipeId};
    `;

    return await this.isDeleted(recipeId);
  }

  async getRecipeCountForTag(tagId: number): Promise<number> {
    const [result] = await this.dbContext.query<{ count: string }>`
      SELECT COUNT(*) as count FROM recipe_tags WHERE tag_id = ${tagId};
    `;

    return parseInt(result?.count || "0");
  }

  async getTagUsageStatistics(): Promise<TagCount[]> {
    return this.dbContext.query<TagCount>`
      SELECT tag_id, COUNT(*) as count 
      FROM recipe_tags 
      GROUP BY tag_id 
      ORDER BY count DESC;
    `;
  }

  async getMostUsedTags(limit: number = 10): Promise<TagCount[]> {
    return this.dbContext.query<TagCount>`
      SELECT tag_id, COUNT(*) as count 
      FROM recipe_tags 
      GROUP BY tag_id 
      ORDER BY count DESC 
      LIMIT ${limit};
    `;
  }
}
