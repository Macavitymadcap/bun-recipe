import { BaseEntity, BaseRepository } from "./base-repository";

export interface ShoppingListItemEntity extends BaseEntity {
  item: string;
  is_checked: boolean;
  created_at: string;
  updated_at: string;
}

export class ShoppingListRepository extends BaseRepository<ShoppingListItemEntity> {
  constructor(dbPath?: string) {
    super("shopping_list", dbPath);
  }

  protected initDb(): void {
    this.createTable();
  }

  protected createTable(): void {
    this.dbContext.execute(`
      CREATE TABLE IF NOT EXISTS shopping_list (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item TEXT NOT NULL,
        is_checked BOOLEAN NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  }

  create(entity: Omit<ShoppingListItemEntity, "id" | "created_at" | "updated_at">): ShoppingListItemEntity | null {
    const now = new Date().toISOString();

    this.dbContext.queryOne(
      `INSERT INTO shopping_list (item, is_checked, created_at, updated_at) 
       VALUES ($item, $is_checked, $created_at, $updated_at);`,
      {
        $item: entity.item,
        $is_checked: entity.is_checked ? 1 : 0,
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

  read(id: number): ShoppingListItemEntity | null {
    return this.dbContext.queryOne<ShoppingListItemEntity>(
      `SELECT * FROM shopping_list WHERE id = $id;`,
      { $id: id },
    );
  }

  readAll(): ShoppingListItemEntity[] {
    return this.dbContext.query<ShoppingListItemEntity>(
      `SELECT * FROM shopping_list ORDER BY is_checked ASC, created_at ASC;`,
    );
  }

  update(entity: ShoppingListItemEntity): ShoppingListItemEntity | null {
    const existing = this.read(entity.id);
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();

    this.dbContext.queryOne(
      `UPDATE shopping_list SET
        item = $item,
        is_checked = $is_checked,
        updated_at = $updated_at
      WHERE id = $id;`,
      {
        $id: entity.id,
        $item: entity.item,
        $is_checked: entity.is_checked ? 1 : 0,
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

      this.dbContext.queryOne(`DELETE FROM shopping_list WHERE id = $id;`, {
        $id: id,
      });

      return this.read(id) === null;
    });
  }

  toggleChecked(id: number): ShoppingListItemEntity | null {
    const item = this.read(id);
    if (!item) return null;

    return this.update({
      ...item,
      is_checked: !item.is_checked,
    });
  }

  clearCheckedItems(): boolean {
    this.dbContext.queryOne(`DELETE FROM shopping_list WHERE is_checked = 1;`);
    return true;
  }

  getItemByText(itemText: string): ShoppingListItemEntity | null {
    return this.dbContext.queryOne<ShoppingListItemEntity>(
      `SELECT * FROM shopping_list WHERE item = $item LIMIT 1;`,
      { $item: itemText },
    );
  }

  addOrUpdateItem(itemText: string): ShoppingListItemEntity | null {
    const existing = this.getItemByText(itemText);
    
    if (existing) {
      // If item exists and is checked, uncheck it
      if (existing.is_checked) {
        return this.update({ ...existing, is_checked: false });
      }
      return existing;
    } else {
      // Create new item
      return this.create({ item: itemText, is_checked: false });
    }
  }
}