import { Database, SQLQueryBindings } from "bun:sqlite";
import { DB_CONFIG } from "../config";

/**
 * Database context class that manages connections and provides
 * utility methods for working with the database.
 */
export class DbContext {
  private static instance: DbContext;
  private db: Database;

  private constructor(path: string = DB_CONFIG.path) {
    this.db = new Database(path, DB_CONFIG.options);
  }

  /**
   * Get the singleton database context instance
   */
  public static getInstance(path?: string): DbContext {
    if (!DbContext.instance) {
      DbContext.instance = new DbContext(path);
    }
    return DbContext.instance;
  }

  /**
   * Execute SQL query with parameters and return all matching rows
   */
  public query<T>(sql: string, params?: SQLQueryBindings): T[] {
    const statement = this.db.prepare(sql);
    if (params) {
      return statement.all(params) as T[];
    }
    return statement.all() as T[];
  }

  /**
   * Execute SQL query with parameters and return the first matching row
   */
  public queryOne<T>(sql: string, params?: SQLQueryBindings): T | null {
    const statement = this.db.prepare(sql);
    if (params) {
      return statement.get(params) as T | null;
    }
    return statement.get() as T | null;
  }

  /**
   * Get the last inserted row ID
   */
  public getLastInsertedId(): number | null {
    const result = this.queryOne<{ last_insert_rowid: number }>(
      "SELECT last_insert_rowid() as last_insert_rowid;",
    );

    return result ? result.last_insert_rowid : null;
  }

  /**
   * Execute SQL statement without returning results
   */
  public execute(sql: string): void {
    this.db.exec(sql);
  }

  /**
   * Execute function within a transaction
   */
  public transaction<T>(callback: () => T): T {
    try {
      this.beginTransaction();
      const result = callback();
      this.commitTransaction();
      return result;
    } catch (error) {
      this.rollbackTransaction();
      throw error;
    }
  }

  /**
   * Begin a database transaction
   */
  public beginTransaction(): void {
    this.db.exec("BEGIN TRANSACTION");
  }

  /**
   * Commit a database transaction
   */
  public commitTransaction(): void {
    this.db.exec("COMMIT");
  }

  /**
   * Rollback a database transaction
   */
  public rollbackTransaction(): void {
    this.db.exec("ROLLBACK");
  }

  /**
   * Close the database connection
   */
  public close(): void {
    this.db.close();
  }
}
