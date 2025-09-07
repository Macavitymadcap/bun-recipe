import { DbConfig } from "../config";
import { BaseEntity, BaseRepository } from "./base-repository";

export interface ShoppingListItemEntity extends BaseEntity {
  item: string;
  is_checked: boolean;
  created_at: string;
  updated_at: string;
}

export class ShoppingListRepository extends BaseRepository<ShoppingListItemEntity> {
  constructor(dbConfig: DbConfig) {
    super("shopping_list", dbConfig);
  }

  protected async initDb(): Promise<void> {
    await this.createTable();
  }

  protected async createTable(): Promise<void> {
    await this.dbContext.queryOne`
      CREATE TABLE IF NOT EXISTS shopping_list (
        id SERIAL PRIMARY KEY,
        item TEXT NOT NULL,
        is_checked BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
  }

  async create(
    entity: Omit<ShoppingListItemEntity, "id" | "created_at" | "updated_at">,
  ): Promise<ShoppingListItemEntity | null> {
    const result = await this.dbContext.queryOne<ShoppingListItemEntity>`
      INSERT INTO shopping_list (
        item, 
        is_checked
      ) 
      VALUES (
        ${entity.item}, 
        ${entity.is_checked}
      )
      RETURNING *;
    `;

    return result || null;
  }

  async read(id: number): Promise<ShoppingListItemEntity | null> {
    return await this.dbContext.queryOne<ShoppingListItemEntity>`
      SELECT * FROM shopping_list WHERE id = ${id};
    `;
  }

  async readAll(): Promise<ShoppingListItemEntity[]> {
    return await this.dbContext.query<ShoppingListItemEntity>`
      SELECT * FROM shopping_list ORDER BY is_checked ASC, created_at ASC;
    `;
  }

  async update(
    entity: ShoppingListItemEntity,
  ): Promise<ShoppingListItemEntity | null> {
    const existing = await this.read(entity.id);
    if (!existing) {
      return null;
    }

    const result = await this.dbContext.queryOne<ShoppingListItemEntity>`
      UPDATE shopping_list SET
        item = ${entity.item},
        is_checked = ${entity.is_checked},
        updated_at = NOW()
      WHERE id = ${entity.id}
      RETURNING *;
    `;

    return result || null;
  }

  async delete(id: number): Promise<boolean> {
    await this.dbContext.queryOne`
      DELETE FROM shopping_list WHERE id = ${id};
    `;

    const remains = await this.read(id);

    return remains === null;
  }

  async deleteAll(): Promise<boolean> {
    await this.dbContext.queryOne`
      DELETE FROM shopping_list;
    `;

    const remaining = await this.readAll();

    return remaining.length === 0;
  }

  async toggleChecked(id: number): Promise<ShoppingListItemEntity | null> {
    const item = await this.read(id);
    if (!item) return null;

    return await this.update({
      ...item,
      is_checked: !item.is_checked,
    });
  }

  async clearCheckedItems(): Promise<boolean> {
    await this.dbContext.queryOne`
      DELETE FROM shopping_list WHERE is_checked = TRUE;
    `;

    const remainingChecked = await this.dbContext.query<ShoppingListItemEntity>`
      SELECT * FROM shopping_list WHERE is_checked = TRUE;
    `;

    return remainingChecked.length === 0;
  }

  async getItemByText(
    itemText: string,
  ): Promise<ShoppingListItemEntity | null> {
    return this.dbContext.queryOne<ShoppingListItemEntity>`
      SELECT * FROM shopping_list WHERE item = ${itemText} LIMIT 1;
    `;
  }

  async addOrUpdateItem(
    itemText: string,
  ): Promise<ShoppingListItemEntity | null> {
    const existing = await this.getItemByText(itemText);

    if (existing) {
      if (existing.is_checked) {
        return await this.update({ ...existing, is_checked: false });
      }
      return existing;
    }

    return await this.create({ item: itemText, is_checked: false });
  }
}
