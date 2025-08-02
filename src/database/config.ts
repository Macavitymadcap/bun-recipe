/**
 * Database configuration settings
 */
export const DB_CONFIG = {
  path: "src/database/data.db",
  inMemoryPath: ":memory:",
  options: {
    create: true,
    readonly: false,
  },
};
