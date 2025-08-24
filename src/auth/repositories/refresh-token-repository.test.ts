import {
  describe,
  test,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
} from "bun:test";
import {
  RefreshTokenEntity,
  RefreshTokenRepository,
} from "./refresh-token-repository";
import { UserEntity, UserRepository } from "./user-repository";
import { DB_CONFIG } from "../../database/config";
import { DbContext } from "../../database/context/context";

const sampleRefreshToken = (
  overrides: Partial<Omit<RefreshTokenEntity, "id" | "created_at">> = {},
): Omit<RefreshTokenEntity, "id" | "created_at"> => ({
  user_id: 1,
  token_hash: "$2b$12$hash.of.refresh.token",
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  ...overrides,
});

describe("RefreshTokenRepository", () => {
  let refreshTokenRepository: RefreshTokenRepository;
  let userRepository: UserRepository;
  let testUser: UserEntity;

  beforeAll(() => {
    (DbContext as any).instance = undefined;
    userRepository = new UserRepository(DB_CONFIG.inMemoryPath);
    refreshTokenRepository = new RefreshTokenRepository(DB_CONFIG.inMemoryPath);
  });

  afterAll(() => {
    try {
      refreshTokenRepository.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
    (DbContext as any).instance = undefined;
  });

  beforeEach(() => {
    // Clean up tokens first (due to foreign key constraints)
    const allTokens = refreshTokenRepository.readAll();
    allTokens.forEach((token) => refreshTokenRepository.delete(token.id));

    // Clean up users
    const allUsers = userRepository.readAll();
    allUsers.forEach((user) => userRepository.delete(user.id));

    // Create a test user for foreign key constraints
    testUser = userRepository.create({
      username: "testuser",
      password_hash: "hash",
    })!;
  });

  test("should create the refresh_tokens table on init", () => {
    expect(refreshTokenRepository).toBeInstanceOf(RefreshTokenRepository);
  });

  describe("create", () => {
    test("should create a new refresh token and return the created entity", () => {
      // Arrange
      const tokenData = sampleRefreshToken({ user_id: testUser.id });

      // Act
      const result = refreshTokenRepository.create(tokenData);

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.id).toBeTypeOf("number");
      expect(result!.id).toBeGreaterThan(0);
      expect(result!.user_id).toBe(testUser.id);
      expect(result!.token_hash).toBe(tokenData.token_hash);
      expect(result!.expires_at).toBe(tokenData.expires_at);
      expect(result!.created_at).toBeTypeOf("string");
    });

    test("should enforce unique token_hash constraint", () => {
      // Arrange
      const tokenData = sampleRefreshToken({
        user_id: testUser.id,
        token_hash: "unique_hash",
      });
      refreshTokenRepository.create(tokenData);

      // Create second user for different user_id
      const user2 = userRepository.create({
        username: "testuser2",
        password_hash: "hash2",
      })!;

      // Act & Assert
      expect(() => {
        refreshTokenRepository.create({
          ...tokenData,
          user_id: user2.id, // Different user but same hash
        });
      }).toThrow();
    });

    test("should allow multiple tokens for same user", () => {
      // Arrange
      const token1Data = sampleRefreshToken({
        user_id: testUser.id,
        token_hash: "hash1",
      });
      const token2Data = sampleRefreshToken({
        user_id: testUser.id,
        token_hash: "hash2",
      });

      // Act
      const token1 = refreshTokenRepository.create(token1Data);
      const token2 = refreshTokenRepository.create(token2Data);

      // Assert
      expect(token1).not.toBeNull();
      expect(token2).not.toBeNull();
      expect(token1!.user_id).toBe(token2!.user_id);
      expect(token1!.token_hash).not.toBe(token2!.token_hash);
    });
  });

  describe("read", () => {
    test("should read an existing refresh token by id", () => {
      // Arrange
      const tokenData = sampleRefreshToken({ user_id: testUser.id });
      const createdToken = refreshTokenRepository.create(tokenData);

      // Act
      const result = refreshTokenRepository.read(createdToken!.id);

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(createdToken!.id);
      expect(result!.token_hash).toBe(tokenData.token_hash);
    });

    test("should return null for non-existent token", () => {
      // Act
      const result = refreshTokenRepository.read(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("readAll", () => {
    test("should return all refresh tokens", () => {
      // Arrange
      refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: testUser.id,
          token_hash: "hash1",
        }),
      );
      refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: testUser.id,
          token_hash: "hash2",
        }),
      );

      // Act
      const result = refreshTokenRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(2);
    });

    test("should return empty array when no tokens exist", () => {
      // Act
      const result = refreshTokenRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("update", () => {
    test("should update an existing refresh token", () => {
      // Arrange
      const originalToken = refreshTokenRepository.create(
        sampleRefreshToken({ user_id: testUser.id }),
      );
      const newExpiresAt = new Date(
        Date.now() + 14 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const updatedData: RefreshTokenEntity = {
        ...originalToken!,
        expires_at: newExpiresAt,
      };

      // Act
      const result = refreshTokenRepository.update(updatedData);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.id).toBe(originalToken!.id);
      expect(result!.expires_at).toBe(newExpiresAt);
    });

    test("should return null when trying to update non-existent token", () => {
      // Arrange
      const nonExistentToken: RefreshTokenEntity = {
        id: 999,
        user_id: testUser.id,
        token_hash: "hash",
        expires_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };

      // Act
      const result = refreshTokenRepository.update(nonExistentToken);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    test("should delete an existing token and return true", () => {
      // Arrange
      const token = refreshTokenRepository.create(
        sampleRefreshToken({ user_id: testUser.id }),
      );

      // Act
      const result = refreshTokenRepository.delete(token!.id);

      // Assert
      expect(result).toBe(true);

      // Verify token is actually deleted
      const deletedToken = refreshTokenRepository.read(token!.id);
      expect(deletedToken).toBeNull();
    });

    test("should return false when trying to delete non-existent token", () => {
      // Act
      const result = refreshTokenRepository.delete(999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("readByTokenHash", () => {
    test("should find token by hash", () => {
      // Arrange
      const tokenHash = "unique_token_hash";
      const token = refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: testUser.id,
          token_hash: tokenHash,
        }),
      );

      // Act
      const result = refreshTokenRepository.readByTokenHash(tokenHash);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.id).toBe(token!.id);
      expect(result!.token_hash).toBe(tokenHash);
    });

    test("should return null when token hash not found", () => {
      // Act
      const result = refreshTokenRepository.readByTokenHash("notfound");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("deleteByUserId", () => {
    test("should delete all tokens for a user", () => {
      // Arrange
      refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: testUser.id,
          token_hash: "hash1",
        }),
      );
      refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: testUser.id,
          token_hash: "hash2",
        }),
      );

      // Create another user with a token
      const user2 = userRepository.create({
        username: "user2",
        password_hash: "hash",
      })!;
      refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: user2.id,
          token_hash: "hash3",
        }),
      );

      // Act
      const result = refreshTokenRepository.deleteByUserId(testUser.id);

      // Assert
      expect(result).toBe(true);

      // Verify only testUser's tokens were deleted
      const testUserTokens = refreshTokenRepository.getByUserId(testUser.id);
      expect(testUserTokens).toBeArrayOfSize(0);

      const user2Tokens = refreshTokenRepository.getByUserId(user2.id);
      expect(user2Tokens).toBeArrayOfSize(1);
    });

    test("should return true even when no tokens exist for user", () => {
      // Act
      const result = refreshTokenRepository.deleteByUserId(999);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("deleteExpiredTokens", () => {
    test("should delete expired tokens and return count", () => {
      // Arrange
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // 1 day ago
      const futureDate = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString(); // 1 day from now

      refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: testUser.id,
          token_hash: "expired1",
          expires_at: pastDate,
        }),
      );
      refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: testUser.id,
          token_hash: "expired2",
          expires_at: pastDate,
        }),
      );
      refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: testUser.id,
          token_hash: "valid",
          expires_at: futureDate,
        }),
      );

      // Act
      const deletedCount = refreshTokenRepository.deleteExpiredTokens();

      // Assert
      expect(deletedCount).toBe(2);

      // Verify only expired tokens were deleted
      const remainingTokens = refreshTokenRepository.readAll();
      expect(remainingTokens).toBeArrayOfSize(1);
      expect(remainingTokens[0].token_hash).toBe("valid");
    });

    test("should return 0 when no expired tokens exist", () => {
      // Arrange
      const futureDate = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString();
      refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: testUser.id,
          expires_at: futureDate,
        }),
      );

      // Act
      const deletedCount = refreshTokenRepository.deleteExpiredTokens();

      // Assert
      expect(deletedCount).toBe(0);
    });

    test("should handle empty table", () => {
      // Act
      const deletedCount = refreshTokenRepository.deleteExpiredTokens();

      // Assert
      expect(deletedCount).toBe(0);
    });
  });

  describe("getByUserId", () => {
    test("should return all tokens for a user ordered by created_at DESC", async () => {
      // Arrange
      const token1 = refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: testUser.id,
          token_hash: "hash1",
        }),
      );

      await Bun.sleep(10); // Ensure different timestamps

      const token2 = refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: testUser.id,
          token_hash: "hash2",
        }),
      );

      // Act
      const result = refreshTokenRepository.getByUserId(testUser.id);

      // Assert
      expect(result).toBeArrayOfSize(2);
      // Most recent first
      expect(result[0].id).toBe(token2!.id);
      expect(result[1].id).toBe(token1!.id);
    });

    test("should return empty array when user has no tokens", () => {
      // Act
      const result = refreshTokenRepository.getByUserId(testUser.id);

      // Assert
      expect(result).toBeArrayOfSize(0);
    });

    test("should only return tokens for specified user", () => {
      // Arrange
      refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: testUser.id,
          token_hash: "hash1",
        }),
      );

      const user2 = userRepository.create({
        username: "user2",
        password_hash: "hash",
      })!;
      refreshTokenRepository.create(
        sampleRefreshToken({
          user_id: user2.id,
          token_hash: "hash2",
        }),
      );

      // Act
      const result = refreshTokenRepository.getByUserId(testUser.id);

      // Assert
      expect(result).toBeArrayOfSize(1);
      expect(result[0].user_id).toBe(testUser.id);
    });
  });
});
