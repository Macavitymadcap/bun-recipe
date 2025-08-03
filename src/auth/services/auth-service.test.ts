import { describe, test, expect, beforeEach, mock } from "bun:test";
import { AuthService, LoginCredentials } from "./auth-service";
import { UserRepository, RefreshTokenRepository } from "../repositories";
import { PasswordService } from "./password-service";
import { TokenService } from "./token-service";
import { DbContext } from "../../database/context";

describe("AuthService", () => {
  let authService: AuthService;
  let mockUserRepository: Partial<UserRepository>;
  let mockRefreshTokenRepository: Partial<RefreshTokenRepository>;
  let mockPasswordService: Partial<PasswordService>;
  let mockTokenService: Partial<TokenService>;
  let mockDbContext: Partial<DbContext>;

  const testUser = {
    id: 1,
    username: "testuser",
    password_hash: "hashed_password",
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    last_login: null,
  };

  const testTokens = {
    accessToken: "test.access.token",
    refreshToken: "test.refresh.token",
  };

  beforeEach(() => {
    mockUserRepository = {
      findByUsername: mock(() => testUser),
      read: mock(() => testUser),
      create: mock(() => testUser),
      update: mock(() => testUser),
      updateLastLogin: mock(() => true),
    };

    mockRefreshTokenRepository = {
      create: mock(() => ({
        id: 1,
        user_id: 1,
        token_hash: "hash",
        expires_at: "2025-01-08",
        created_at: "2025-01-01",
      })),
      findByTokenHash: mock(() => ({
        id: 1,
        user_id: 1,
        token_hash: "hash",
        expires_at: "2025-01-08",
        created_at: "2025-01-01",
      })),
      delete: mock(() => true),
      deleteByUserId: mock(() => true),
      deleteExpiredTokens: mock(() => 5),
    };

    mockPasswordService = {
      hash: mock(async () => "hashed_password"),
      verify: mock(async () => true),
    };

    mockTokenService = {
      generateAccessToken: mock(async () => testTokens.accessToken),
      generateRefreshToken: mock(async () => testTokens.refreshToken),
      verifyAccessToken: mock(async () => ({
        userId: 1,
        username: "testuser",
      })),
      verifyRefreshToken: mock(async () => ({
        userId: 1,
        username: "testuser",
      })),
    };

    mockDbContext = {
      transaction: mock((fn: () => any) => fn()),
    };

    authService = new AuthService(
      mockUserRepository as UserRepository,
      mockRefreshTokenRepository as RefreshTokenRepository,
      mockPasswordService as PasswordService,
      mockTokenService as TokenService,
      mockDbContext as DbContext,
    );
  });

  describe("login", () => {
    test("should login with valid credentials", async () => {
      // Arrange
      const credentials: LoginCredentials = {
        username: "testuser",
        password: "password123",
      };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.accessToken).toBe(testTokens.accessToken);
      expect(result!.refreshToken).toBe(testTokens.refreshToken);
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(
        "testuser",
      );
      expect(mockPasswordService.verify).toHaveBeenCalledWith(
        "password123",
        "hashed_password",
      );
      expect(mockUserRepository.updateLastLogin).toHaveBeenCalledWith(1);
    });

    test("should return null for non-existent user", async () => {
      // Arrange
      mockUserRepository.findByUsername = mock(() => null);
      const credentials: LoginCredentials = {
        username: "nonexistent",
        password: "password123",
      };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result).toBeNull();
      expect(mockPasswordService.verify).not.toHaveBeenCalled();
    });

    test("should return null for invalid password", async () => {
      // Arrange
      mockPasswordService.verify = mock(async () => false);
      const credentials: LoginCredentials = {
        username: "testuser",
        password: "wrongpassword",
      };

      // Act
      const result = await authService.login(credentials);

      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.updateLastLogin).not.toHaveBeenCalled();
    });
  });

  describe("refreshTokens", () => {
    test("should refresh tokens with valid refresh token", async () => {
      // Arrange
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);
      mockRefreshTokenRepository.findByTokenHash = mock(() => ({
        id: 1,
        user_id: 1,
        token_hash: "hash",
        expires_at: futureDate.toISOString(),
        created_at: new Date().toISOString(),
      }));

      // Act
      const result = await authService.refreshTokens("valid.refresh.token");

      // Assert
      expect(result).not.toBeNull();
      expect(result!.accessToken).toBe(testTokens.accessToken);
      expect(result!.refreshToken).toBe(testTokens.refreshToken);
      expect(mockRefreshTokenRepository.delete).toHaveBeenCalledWith(1);
    });

    test("should return null for invalid refresh token", async () => {
      // Arrange
      mockTokenService.verifyRefreshToken = mock(async () => null);

      // Act
      const result = await authService.refreshTokens("invalid.token");

      // Assert
      expect(result).toBeNull();
    });

    test("should return null for expired refresh token", async () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      mockRefreshTokenRepository.findByTokenHash = mock(() => ({
        id: 1,
        user_id: 1,
        token_hash: "hash",
        expires_at: pastDate.toISOString(),
        created_at: new Date().toISOString(),
      }));

      // Act
      const result = await authService.refreshTokens("expired.token");

      // Assert
      expect(result).toBeNull();
      expect(mockRefreshTokenRepository.delete).toHaveBeenCalledWith(1);
    });

    test("should return null when token not found in database", async () => {
      // Arrange
      mockRefreshTokenRepository.findByTokenHash = mock(() => null);

      // Act
      const result = await authService.refreshTokens("not.in.database");

      // Assert
      expect(result).toBeNull();
    });

    test("should return null when user ID mismatch", async () => {
      // Arrange
      mockRefreshTokenRepository.findByTokenHash = mock(() => ({
        id: 1,
        user_id: 2, // Different user ID
        token_hash: "hash",
        expires_at: "2025-01-08",
        created_at: "2025-01-01",
      }));

      // Act
      const result = await authService.refreshTokens("mismatched.token");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("logout", () => {
    test("should delete all user refresh tokens", async () => {
      // Act
      await authService.logout(1);

      // Assert
      expect(mockRefreshTokenRepository.deleteByUserId).toHaveBeenCalledWith(1);
    });
  });

  describe("createUser", () => {
    test("should create new user", async () => {
      // Arrange
      mockUserRepository.findByUsername = mock(() => null);

      // Act
      const result = await authService.createUser("newuser", "password123");

      // Assert
      expect(result).not.toBeNull();
      expect(result!.username).toBe("testuser");
      expect(mockPasswordService.hash).toHaveBeenCalledWith("password123");
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: "newuser",
        password_hash: "hashed_password",
      });
    });

    test("should return null if user already exists", async () => {
      // Act
      const result = await authService.createUser("testuser", "password123");

      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("changePassword", () => {
    test("should change password successfully", async () => {
      // Act
      const result = await authService.changePassword(
        1,
        "oldpassword",
        "newpassword",
      );

      // Assert
      expect(result).toBe(true);
      expect(mockPasswordService.verify).toHaveBeenCalledWith(
        "oldpassword",
        "hashed_password",
      );
      expect(mockPasswordService.hash).toHaveBeenCalledWith("newpassword");
      expect(mockUserRepository.update).toHaveBeenCalled();
      expect(mockRefreshTokenRepository.deleteByUserId).toHaveBeenCalledWith(1);
    });

    test("should return false for non-existent user", async () => {
      // Arrange
      mockUserRepository.read = mock(() => null);

      // Act
      const result = await authService.changePassword(
        999,
        "oldpassword",
        "newpassword",
      );

      // Assert
      expect(result).toBe(false);
      expect(mockPasswordService.verify).not.toHaveBeenCalled();
    });

    test("should return false for incorrect old password", async () => {
      // Arrange
      mockPasswordService.verify = mock(async () => false);

      // Act
      const result = await authService.changePassword(
        1,
        "wrongpassword",
        "newpassword",
      );

      // Assert
      expect(result).toBe(false);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    test("should return false if update fails", async () => {
      // Arrange
      mockUserRepository.update = mock(() => null);

      // Act
      const result = await authService.changePassword(
        1,
        "oldpassword",
        "newpassword",
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("validateAccessToken", () => {
    test("should validate valid access token", async () => {
      // Act
      const result =
        await authService.validateAccessToken("valid.access.token");

      // Assert
      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
      expect(result!.username).toBe("testuser");
    });

    test("should return null for invalid token", async () => {
      // Arrange
      mockTokenService.verifyAccessToken = mock(async () => null);

      // Act
      const result = await authService.validateAccessToken("invalid.token");

      // Assert
      expect(result).toBeNull();
    });

    test("should return null when user not found", async () => {
      // Arrange
      mockUserRepository.read = mock(() => null);

      // Act
      const result = await authService.validateAccessToken("valid.token");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("cleanupExpiredTokens", () => {
    test("should cleanup expired tokens", () => {
      // Act
      const result = authService.cleanupExpiredTokens();

      // Assert
      expect(result).toBe(5);
      expect(mockRefreshTokenRepository.deleteExpiredTokens).toHaveBeenCalled();
    });
  });
});
