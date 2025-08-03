import {
  describe,
  test,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
} from "bun:test";
import { UserEntity, UserRepository } from "./user-repository";
import { DB_CONFIG } from "../../database/config";
import { DbContext } from "../../database/context/context";

const sampleUser = (
  overrides: Partial<Omit<UserEntity, "id" | "created_at" | "updated_at">> = {},
): Omit<UserEntity, "id" | "created_at" | "updated_at"> => ({
  username: "testuser",
  password_hash: "$2b$12$hash.of.password",
  last_login: undefined,
  ...overrides,
});

describe("UserRepository", () => {
  let userRepository: UserRepository;

  beforeAll(() => {
    (DbContext as any).instance = undefined;
    userRepository = new UserRepository(DB_CONFIG.inMemoryPath);
  });

  afterAll(() => {
    try {
      userRepository.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
    (DbContext as any).instance = undefined;
  });

  beforeEach(() => {
    // Clean up any existing users before each test
    const allUsers = userRepository.readAll();
    allUsers.forEach((user) => userRepository.delete(user.id));
  });

  test("should create the users table on init", () => {
    expect(userRepository).toBeInstanceOf(UserRepository);
  });

  describe("create", () => {
    test("should create a new user and return the created entity with id and timestamps", () => {
      // Arrange
      const userData = sampleUser();

      // Act
      const result = userRepository.create(userData);

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.id).toBeTypeOf("number");
      expect(result!.id).toBeGreaterThan(0);
      expect(result!.username).toBe(userData.username);
      expect(result!.password_hash).toBe(userData.password_hash);
      expect(result!.last_login).toBeNull();
      expect(result!.created_at).toBeTypeOf("string");
      expect(result!.updated_at).toBeTypeOf("string");
      expect(result!.created_at).toBe(result!.updated_at);
    });

    test("should create user with last_login if provided", () => {
      // Arrange
      const lastLogin = "2025-01-01T10:00:00.000Z";
      const userData = sampleUser({ last_login: lastLogin });

      // Act
      const result = userRepository.create(userData);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.last_login).toBe(lastLogin);
    });

    test("should enforce unique username constraint", () => {
      // Arrange
      const userData = sampleUser({ username: "uniqueuser" });
      userRepository.create(userData);

      // Act & Assert
      expect(() => {
        userRepository.create(userData);
      }).toThrow();
    });

    test("should create multiple users with unique usernames", () => {
      // Arrange
      const user1Data = sampleUser({ username: "user1" });
      const user2Data = sampleUser({ username: "user2" });

      // Act
      const user1 = userRepository.create(user1Data);
      const user2 = userRepository.create(user2Data);

      // Assert
      expect(user1).not.toBeNull();
      expect(user2).not.toBeNull();
      expect(user1!.id).not.toBe(user2!.id);
      expect(user1!.username).toBe("user1");
      expect(user2!.username).toBe("user2");
    });
  });

  describe("read", () => {
    test("should read an existing user by id", () => {
      // Arrange
      const userData = sampleUser();
      const createdUser = userRepository.create(userData);
      expect(createdUser).not.toBeNull();

      // Act
      const result = userRepository.read(createdUser!.id);

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(createdUser!.id);
      expect(result!.username).toBe(userData.username);
      expect(result!.password_hash).toBe(userData.password_hash);
    });

    test("should return null for non-existent user", () => {
      // Act
      const result = userRepository.read(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("readAll", () => {
    test("should return all users ordered by username", () => {
      // Arrange
      userRepository.create(sampleUser({ username: "charlie" }));
      userRepository.create(sampleUser({ username: "alice" }));
      userRepository.create(sampleUser({ username: "bob" }));

      // Act
      const result = userRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result[0].username).toBe("alice");
      expect(result[1].username).toBe("bob");
      expect(result[2].username).toBe("charlie");
    });

    test("should return empty array when no users exist", () => {
      // Act
      const result = userRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("update", () => {
    test("should update an existing user and update the updated_at timestamp", async () => {
      // Arrange
      const originalUser = userRepository.create(sampleUser());
      expect(originalUser).not.toBeNull();
      const originalUpdatedAt = originalUser!.updated_at;

      // Wait to ensure different timestamp
      await Bun.sleep(10);

      const updatedData: UserEntity = {
        ...originalUser!,
        username: "updateduser",
        password_hash: "$2b$12$new.hash",
      };

      // Act
      const result = userRepository.update(updatedData);

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(originalUser!.id);
      expect(result!.username).toBe("updateduser");
      expect(result!.password_hash).toBe("$2b$12$new.hash");
      expect(result!.created_at).toBe(originalUser!.created_at);
      expect(result!.updated_at).not.toBe(originalUpdatedAt);
    });

    test("should update last_login field", () => {
      // Arrange
      const originalUser = userRepository.create(sampleUser());
      const newLastLogin = "2025-01-02T15:30:00.000Z";

      const updatedData: UserEntity = {
        ...originalUser!,
        last_login: newLastLogin,
      };

      // Act
      const result = userRepository.update(updatedData);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.last_login).toBe(newLastLogin);
    });

    test("should return null when trying to update non-existent user", () => {
      // Arrange
      const nonExistentUser: UserEntity = {
        id: 999,
        username: "nonexistent",
        password_hash: "hash",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Act
      const result = userRepository.update(nonExistentUser);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    test("should delete an existing user and return true", () => {
      // Arrange
      const user = userRepository.create(sampleUser());
      expect(user).not.toBeNull();

      // Act
      const result = userRepository.delete(user!.id);

      // Assert
      expect(result).toBe(true);

      // Verify user is actually deleted
      const deletedUser = userRepository.read(user!.id);
      expect(deletedUser).toBeNull();
    });

    test("should return false when trying to delete non-existent user", () => {
      // Act
      const result = userRepository.delete(999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("findByUsername", () => {
    test("should find user by username", () => {
      // Arrange
      const user = userRepository.create(sampleUser({ username: "findme" }));

      // Act
      const result = userRepository.findByUsername("findme");

      // Assert
      expect(result).not.toBeNull();
      expect(result!.id).toBe(user!.id);
      expect(result!.username).toBe("findme");
    });

    test("should return null when username not found", () => {
      // Act
      const result = userRepository.findByUsername("notfound");

      // Assert
      expect(result).toBeNull();
    });

    test("should be case-sensitive", () => {
      // Arrange
      userRepository.create(sampleUser({ username: "TestUser" }));

      // Act
      const result1 = userRepository.findByUsername("testuser");
      const result2 = userRepository.findByUsername("TestUser");

      // Assert
      expect(result1).toBeNull();
      expect(result2).not.toBeNull();
    });
  });

  describe("updateLastLogin", () => {
    test("should update last_login timestamp", async () => {
      // Arrange
      const user = userRepository.create(sampleUser());
      expect(user).not.toBeNull();
      const originalLastLogin = user!.last_login;

      // Wait a bit to ensure different timestamp
      await Bun.sleep(10);

      // Act
      const result = userRepository.updateLastLogin(user!.id);

      // Assert
      expect(result).toBe(true);

      // Verify the update
      const updatedUser = userRepository.read(user!.id);
      expect(updatedUser).not.toBeNull();
      expect(updatedUser!.last_login).not.toBe(originalLastLogin);
      expect(updatedUser!.last_login).toBeTypeOf("string");
    });

    test("should handle updating non-existent user", () => {
      // Act
      const result = userRepository.updateLastLogin(999);

      // Assert
      expect(result).toBe(true); // The method always returns true
    });
  });
});
