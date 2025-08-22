import {
  BaseEntity,
  BaseRepository,
} from "../../database/repositories/base-repository";

export interface UserEntity extends BaseEntity {
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export class UserRepository extends BaseRepository<UserEntity> {
  constructor(dbPath?: string) {
    super("users", dbPath);
  }

  protected initDb(): void {
    this.createTable();
    this.createIndexes();
  }

  protected createTable(): void {
    this.dbContext.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        last_login TEXT
      );
    `);
  }

  private createIndexes(): void {
    this.dbContext.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);
    `);
  }

  create(
    entity: Omit<UserEntity, "id" | "created_at" | "updated_at">,
  ): UserEntity | null {
    return this.dbContext.transaction(() => {
      const now = new Date().toISOString();

      this.dbContext.queryOne(
        `INSERT INTO users (username, password_hash, created_at, updated_at, last_login) 
         VALUES ($username, $password_hash, $created_at, $updated_at, $last_login);`,
        {
          $username: entity.username,
          $password_hash: entity.password_hash,
          $created_at: now,
          $updated_at: now,
          $last_login: entity.last_login || null,
        },
      );

      const lastId = this.dbContext.getLastInsertedId();
      if (lastId === null) {
        return null;
      }

      return this.read(lastId);
    });
  }

  read(id: number): UserEntity | null {
    return this.dbContext.queryOne<UserEntity>(
      `SELECT * FROM users WHERE id = $id;`,
      { $id: id },
    );
  }

  readAll(): UserEntity[] {
    return this.dbContext.query<UserEntity>(
      `SELECT * FROM users ORDER BY username;`,
    );
  }

  update(entity: UserEntity): UserEntity | null {
    return this.dbContext.transaction(() => {
      const existing = this.read(entity.id);
      if (!existing) {
        return null;
      }

      const now = new Date().toISOString();

      this.dbContext.queryOne(
        `UPDATE users SET
          username = $username,
          password_hash = $password_hash,
          updated_at = $updated_at,
          last_login = $last_login
        WHERE id = $id;`,
        {
          $id: entity.id,
          $username: entity.username,
          $password_hash: entity.password_hash,
          $updated_at: now,
          $last_login: entity.last_login || null,
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

      this.dbContext.queryOne(`DELETE FROM users WHERE id = $id;`, { $id: id });

      return this.read(id) === null;
    });
  }

  findByUsername(username: string): UserEntity | null {
    return this.dbContext.queryOne<UserEntity>(
      `SELECT * FROM users WHERE username = $username;`,
      { $username: username },
    );
  }

  updateLastLogin(id: number): boolean {
    const now = new Date().toISOString();

    this.dbContext.queryOne(
      `UPDATE users SET last_login = $last_login WHERE id = $id;`,
      { $id: id, $last_login: now },
    );

    return true;
  }
}
