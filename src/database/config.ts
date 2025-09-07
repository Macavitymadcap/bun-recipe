export type DbConfig = {
  connectionString: string | undefined;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean | { rejectUnauthorized: boolean };
  pool: {
    min: number;
    max: number;
    idleTimeoutMillis: number;
  };
};

/**
 * Database configuration settings
 */
export const DB_CONFIG: DbConfig = {
  // Railway provides DATABASE_URL, but we can also use individual vars
  connectionString: process.env.DATABASE_URL,

  // Fallback to individual environment variables
  host: process.env.PGHOST || process.env.DB_HOST || "localhost",
  port: parseInt(process.env.PGPORT || process.env.DB_PORT || "5432"),
  database: process.env.PGDATABASE || process.env.DB_NAME || "recipe_db",
  user: process.env.PGUSER || process.env.DB_USER || "postgres",
  password: process.env.PGPASSWORD || process.env.DB_PASSWORD || "",

  // Railway typically requires SSL for external connections
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,

  // Connection pool settings
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
  },
};
