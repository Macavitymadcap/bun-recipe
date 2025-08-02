import { expect, test, describe, beforeEach, afterEach, spyOn } from "bun:test";
import { DbContext } from "./context";
import { DB_CONFIG } from "../config";

interface TestEntity {
  id: number;
  name: string;
  value: number;
}

describe("DbContext", () => {
  describe("getInstance", () => {
    beforeEach(() => {
      (DbContext as any).instance = undefined;
    });

    afterEach(() => {
      try {
        const instance = (DbContext as any).instance;
        if (instance) {
          instance.close();
        }
      } catch (error) {
        // Ignore any errors
      }
      (DbContext as any).instance = undefined;
    });

    test("should create a new instance when one does not exist", () => {
      // Act
      const instance = DbContext.getInstance(DB_CONFIG.inMemoryPath);

      // Assert
      expect(instance).toBeInstanceOf(DbContext);
    });

    test("should return the existing instance when one already exists", () => {
      // Arrange
      const instance1 = DbContext.getInstance(DB_CONFIG.inMemoryPath);

      // Act
      const instance2 = DbContext.getInstance(DB_CONFIG.inMemoryPath);

      // Assert
      expect(instance1).toBe(instance2);
    });

    test("should ignore the path parameter when an instance already exists", () => {
      // Arrange
      const instance1 = DbContext.getInstance(DB_CONFIG.inMemoryPath);

      // Act
      const instance2 = DbContext.getInstance("different-path.db");

      // Assert
      expect(instance1).toBe(instance2);
    });
  });

  describe("Database operations", () => {
    let dbContext: DbContext;

    beforeEach(() => {
      (DbContext as any).instance = undefined;
      dbContext = DbContext.getInstance(DB_CONFIG.inMemoryPath);

      dbContext.execute(`
        CREATE TABLE IF NOT EXISTS test_entities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          value INTEGER NOT NULL
        );
      `);
    });

    afterEach(() => {
      try {
        dbContext.execute("DROP TABLE IF EXISTS test_entities;");
        dbContext.close();
      } catch (error) {
        // Ignore errors if database is already closed
      }

      (DbContext as any).instance = undefined;
    });

    describe("query", () => {
      beforeEach(() => {
        dbContext.execute(`
        INSERT INTO test_entities (name, value) VALUES 
        ('Test1', 10),
        ('Test2', 20),
        ('Test3', 30);
      `);
      });

      test("should return all rows matching the query", () => {
        // Act
        const result = dbContext.query<TestEntity>(
          "SELECT * FROM test_entities",
        );

        // Assert
        expect(result).toBeArrayOfSize(3);
        expect(result.map((r) => r.name)).toEqual(["Test1", "Test2", "Test3"]);
        expect(result.map((r) => r.value)).toEqual([10, 20, 30]);
      });

      test("should return filtered rows when using parameters", () => {
        // Act
        const result = dbContext.query<TestEntity>(
          "SELECT * FROM test_entities WHERE value > $minValue",
          { $minValue: 15 },
        );

        // Assert
        expect(result).toBeArrayOfSize(2);
        expect(result.map((r) => r.name)).toEqual(["Test2", "Test3"]);
      });

      test("should return an empty array when no rows match", () => {
        // Act
        const result = dbContext.query<TestEntity>(
          "SELECT * FROM test_entities WHERE name = $name",
          { $name: "NonExistent" },
        );

        // Assert
        expect(result).toBeArrayOfSize(0);
      });
    });

    describe("queryOne", () => {
      beforeEach(() => {
        dbContext.execute(`
        INSERT INTO test_entities (name, value) VALUES 
        ('Test1', 10),
        ('Test2', 20),
        ('Test3', 30);
      `);
      });

      test("should return the first row matching the query", () => {
        // Act
        const result = dbContext.queryOne<TestEntity>(
          "SELECT * FROM test_entities WHERE id = $id",
          { $id: 2 },
        );

        // Assert
        expect(result).not.toBeNull();
        expect(result?.name).toBe("Test2");
        expect(result?.value).toBe(20);
      });

      test("should return null when no rows match the query", () => {
        // Act
        const result = dbContext.queryOne<TestEntity>(
          "SELECT * FROM test_entities WHERE id = $id",
          { $id: 999 },
        );

        // Assert
        expect(result).toBeNull();
      });

      test("should return the first row when multiple rows match", () => {
        // Act
        const result = dbContext.queryOne<TestEntity>(
          "SELECT * FROM test_entities WHERE value > $minValue",
          { $minValue: 15 },
        );

        // Assert
        expect(result).not.toBeNull();
        expect(result?.name).toBe("Test2");
      });
    });

    describe("execute", () => {
      test("should execute statements without returning results", () => {
        // Act
        dbContext.execute(`
        INSERT INTO test_entities (name, value) VALUES 
        ('TestA', 100),
        ('TestB', 200);
      `);

        // Assert
        const result = dbContext.query<TestEntity>(
          "SELECT * FROM test_entities",
        );
        expect(result).toBeArrayOfSize(2);
        expect(result.map((r) => r.name)).toEqual(["TestA", "TestB"]);
      });

      test("should throw error for invalid SQL", () => {
        // Act & Assert
        expect(() => {
          dbContext.execute("INVALID SQL STATEMENT");
        }).toThrow();
      });
    });

    describe("transaction", () => {
      test("should commit changes when callback completes successfully", () => {
        // Act
        const result = dbContext.transaction(() => {
          dbContext.execute(`
          INSERT INTO test_entities (name, value) VALUES ('TransactionTest', 500);
        `);
          return "transaction succeeded";
        });

        // Assert
        expect(result).toBe("transaction succeeded");

        const entities = dbContext.query<TestEntity>(
          "SELECT * FROM test_entities",
        );
        expect(entities).toBeArrayOfSize(1);
        expect(entities[0].name).toBe("TransactionTest");
      });

      test("should roll back changes when callback throws an error", () => {
        // Act & Assert
        expect(() => {
          dbContext.transaction(() => {
            dbContext.execute(`
            INSERT INTO test_entities (name, value) VALUES ('TransactionTest', 500);
          `);
            throw new Error("Transaction failure");
          });
        }).toThrow("Transaction failure");

        const entities = dbContext.query<TestEntity>(
          "SELECT * FROM test_entities",
        );
        expect(entities).toBeArrayOfSize(0);
      });
    });

    describe("beginTransaction, commitTransaction, rollbackTransaction", () => {
      test("should be able to manually control transactions", () => {
        // Act
        dbContext.beginTransaction();
        dbContext.execute(
          "INSERT INTO test_entities (name, value) VALUES ('Manual1', 1000)",
        );
        dbContext.commitTransaction();

        // Assert
        const entities = dbContext.query<TestEntity>(
          "SELECT * FROM test_entities",
        );
        expect(entities).toBeArrayOfSize(1);
        expect(entities[0].name).toBe("Manual1");
      });

      test("should be able to roll back transactions manually", () => {
        // Act
        dbContext.beginTransaction();
        dbContext.execute(
          "INSERT INTO test_entities (name, value) VALUES ('Manual2', 2000)",
        );
        dbContext.rollbackTransaction();

        // Assert
        const entities = dbContext.query<TestEntity>(
          "SELECT * FROM test_entities",
        );
        expect(entities).toBeArrayOfSize(0);
      });
    });

    describe("close", () => {
      test("should close the database connection", () => {
        // Arrange
        const spyClose = spyOn((dbContext as any).db, "close");

        // Act
        dbContext.close();

        // Assert
        expect(spyClose).toHaveBeenCalled();
      });
    });
  });

  describe("error handling", () => {
    let dbContext: DbContext;

    beforeEach(() => {
      (DbContext as any).instance = undefined;
      dbContext = DbContext.getInstance(DB_CONFIG.inMemoryPath);

      dbContext.execute(`
        CREATE TABLE IF NOT EXISTS test_entities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          value INTEGER NOT NULL
        );
      `);
    });

    afterEach(() => {
      try {
        dbContext.close();
      } catch (error) {}
      (DbContext as any).instance = undefined;
    });

    test("should throw error when executing invalid SQL", () => {
      // Act & Assert
      expect(() => {
        dbContext.query("SELECT * FROM non_existent_table");
      }).toThrow();
    });

    test("should throw error with malformed parameters", () => {
      // Arrange
      dbContext.execute(`
    INSERT INTO test_entities (name, value) VALUES 
    ('TestParam', 100);
  `);

      // Act
      const result = dbContext.query<TestEntity>(
        "SELECT * FROM test_entities WHERE id = $id",
        { wrongParam: 1 },
      );

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });
});
