import {
  BaseEntity,
  BaseRepository,
} from "../../database/repositories/base-repository";

export interface RefreshTokenEntity extends BaseEntity {
  user_id: number;
  token_hash: string;
  expires_at: string;
  created_at: string;
}

export class RefreshTokenRepository extends BaseRepository<RefreshTokenEntity> {
  constructor(dbPath?: string) {
    super("refresh_tokens", dbPath);
  }

  protected initDb(): void {
    this.createTable();
    this.createIndexes();
  }

  protected createTable(): void {
    this.dbContext.execute(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  }

  private createIndexes(): void {
    this.dbContext.execute(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
    `);
  }

  create(
    entity: Omit<RefreshTokenEntity, "id" | "created_at">,
  ): RefreshTokenEntity | null {
    return this.dbContext.transaction(() => {
      const now = new Date().toISOString();

      this.dbContext.queryOne(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, created_at) 
         VALUES ($user_id, $token_hash, $expires_at, $created_at);`,
        {
          $user_id: entity.user_id,
          $token_hash: entity.token_hash,
          $expires_at: entity.expires_at,
          $created_at: now,
        },
      );

      const lastId = this.dbContext.getLastInsertedId();
      if (lastId === null) {
        return null;
      }

      return this.read(lastId);
    });
  }

  read(id: number): RefreshTokenEntity | null {
    return this.dbContext.queryOne<RefreshTokenEntity>(
      `SELECT * FROM refresh_tokens WHERE id = $id;`,
      { $id: id },
    );
  }

  readAll(): RefreshTokenEntity[] {
    return this.dbContext.query<RefreshTokenEntity>(
      `SELECT * FROM refresh_tokens;`,
    );
  }

  update(entity: RefreshTokenEntity): RefreshTokenEntity | null {
    return this.dbContext.transaction(() => {
      const existing = this.read(entity.id);
      if (!existing) {
        return null;
      }

      this.dbContext.queryOne(
        `UPDATE refresh_tokens SET
          user_id = $user_id,
          token_hash = $token_hash,
          expires_at = $expires_at
        WHERE id = $id;`,
        {
          $id: entity.id,
          $user_id: entity.user_id,
          $token_hash: entity.token_hash,
          $expires_at: entity.expires_at,
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

      this.dbContext.queryOne(`DELETE FROM refresh_tokens WHERE id = $id;`, {
        $id: id,
      });

      return this.read(id) === null;
    });
  }

  findByTokenHash(tokenHash: string): RefreshTokenEntity | null {
    return this.dbContext.queryOne<RefreshTokenEntity>(
      `SELECT * FROM refresh_tokens WHERE token_hash = $token_hash;`,
      { $token_hash: tokenHash },
    );
  }

  deleteByUserId(userId: number): boolean {
    this.dbContext.queryOne(
      `DELETE FROM refresh_tokens WHERE user_id = $user_id;`,
      { $user_id: userId },
    );
    return true;
  }

  deleteExpiredTokens(): number {
    const now = new Date().toISOString();

    this.dbContext.query(`DELETE FROM refresh_tokens WHERE expires_at < $now`, {
      $now: now,
    });

    const result = this.dbContext.queryOne<{ changes: number }>(
      `SELECT changes() as changes`,
    );

    return result?.changes || 0;
  }

  getByUserId(userId: number): RefreshTokenEntity[] {
    return this.dbContext.query<RefreshTokenEntity>(
      `SELECT * FROM refresh_tokens WHERE user_id = $user_id ORDER BY created_at DESC;`,
      { $user_id: userId },
    );
  }
}
