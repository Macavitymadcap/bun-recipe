import { DbConfig } from "../config";
import { DbContext } from "../context/context";

export interface BaseEntity {
  id: number;
}

/**
 * Base Repository class that provides common CRUD operations
 * for all entities.
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected dbContext: DbContext;
  protected tableName: string;

  constructor(tableName: string, config: DbConfig) {
    this.tableName = tableName;
    this.dbContext = DbContext.getInstance(config);
    this.initDb();
  }

  /**
   * Initialize the database - create tables and seed initial data
   */
  protected abstract initDb(): Promise<void>;

  /**
   * Create database tables
   */
  protected abstract createTable(): Promise<void>;

  /**
   * Create a new entity in the database
   */
  abstract create(entity: Omit<T, "id">): Promise<T | null>;

  /**
   * Read an entity by its ID
   */
  abstract read(id: number): Promise<T | null>;

  /**
   * Read all entities from the table
   */
  abstract readAll(): Promise<T[]>;

  /**
   * Update an existing entity
   */
  abstract update(entity: T): Promise<T | null>;

  /**
   * Delete an entity by its ID
   */
  abstract delete(id: number): Promise<boolean>;

  /**
   * Close the database connection
   */
  public async close() {
    await this.dbContext.close();
  }
}
