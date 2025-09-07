import { SQL } from "bun";
import { DB_CONFIG, type DbConfig } from "../config";

/**
 * Database context class that manages connections and provides
 * utility methods for working with the database.
 */
export class DbContext {
  private static instance: DbContext;
  private db: SQL

  private constructor(config: DbConfig = DB_CONFIG) {

    if (config.connectionString) {
      this.db = new SQL(config.connectionString);
    } else {
      this.db = new SQL({
        host: config.host,
        port: config.port,
        database: config.database,
        username: config.user, 
        password: config.password,
        max: config.pool.max || 10,
        idleTimeout: config.pool.idleTimeoutMillis || 3000,
        ssl: config.ssl ? true : false,
      })
    }
  }

  /**
   * Get the singleton database context instance
   */
  public static getInstance(config: DbConfig): DbContext {
    if (!DbContext.instance) {
      DbContext.instance = new DbContext(config);
    }
    return DbContext.instance;
  }

  /**
   * Execute SQL query with parameters and return all matching rows
   */
  public async query<T>(sql: TemplateStringsArray, ...params: unknown[]): Promise<T[]> {
    return await this.db(sql, ...params) as T[];
  }

  /**
   * Execute SQL query with parameters and return the first matching row
   */
  public async queryOne<T>(sql: TemplateStringsArray, ...params: unknown[]): Promise<T | null> {
    const results = await this.query<T>(sql, ...params)
    return results.length > 0 ? results[0] : null
  }

  /**
   * Execute function within a transaction
   */
  public async transaction<T>(callback: (sql: SQL) => Promise<T>): Promise<T> {
    return await this.db.begin(callback)
  }

  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    await this.db.close();
  }
}
