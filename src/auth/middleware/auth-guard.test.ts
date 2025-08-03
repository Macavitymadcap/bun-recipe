// src/auth/middleware/auth-guard.test.ts
import { describe, test, expect, beforeEach, mock, jest } from "bun:test";
import { Context } from "hono";
import { createAuthGuard, createOptionalAuth, AuthContext } from "./auth-guard";
import { AuthService } from "../services/auth-service";

describe("Auth Middleware", () => {
  let mockAuthService: Partial<AuthService>;
  let mockContext: Partial<Context & AuthContext>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockAuthService = {
      validateAccessToken: mock(async () => ({ id: 1, username: "testuser" })),
    };

    mockContext = {
      req: {
        header: mock(() => "Bearer valid.token"),
      } as any,
      json: mock((data: any, status?: number) => ({ data, status })),
      user: undefined,
    };

    mockNext = mock(async () => {});
  });

  describe("createAuthGuard", () => {
    test("should authenticate valid bearer token", async () => {
      // Arrange
      const authGuard = createAuthGuard(mockAuthService as AuthService);

      // Act
      await authGuard(mockContext as Context & AuthContext, mockNext);

      // Assert
      expect(mockContext.user).toEqual({ id: 1, username: "testuser" });
      expect(mockNext).toHaveBeenCalled();
      expect(mockAuthService.validateAccessToken).toHaveBeenCalledWith(
        "valid.token",
      );
    });

    test("should return 401 when no authorization header", async () => {
      // Arrange
      mockContext.req!.header = mock(() => undefined);
      const authGuard = createAuthGuard(mockAuthService as AuthService);

      // Act
      const result = await authGuard(
        mockContext as Context & AuthContext,
        mockNext,
      );

      // Assert
      expect(result).toEqual({ data: { error: "Unauthorized" }, status: 401 });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("should return 401 when header doesn't start with Bearer", async () => {
      // Arrange
      mockContext.req!.header = mock(() => "Basic credentials");
      const authGuard = createAuthGuard(mockAuthService as AuthService);

      // Act
      const result = await authGuard(
        mockContext as Context & AuthContext,
        mockNext,
      );

      // Assert
      expect(result).toEqual({ data: { error: "Unauthorized" }, status: 401 });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test("should return 401 for invalid token", async () => {
      // Arrange
      mockAuthService.validateAccessToken = mock(async () => null);
      const authGuard = createAuthGuard(mockAuthService as AuthService);

      // Act
      const result = await authGuard(
        mockContext as Context & AuthContext,
        mockNext,
      );

      // Assert
      expect(result).toEqual({ data: { error: "Invalid token" }, status: 401 });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("createOptionalAuth", () => {
    test("should add user when valid token provided", async () => {
      // Arrange
      const optionalAuth = createOptionalAuth(mockAuthService as AuthService);

      // Act
      await optionalAuth(mockContext as Context & AuthContext, mockNext);

      // Assert
      expect(mockContext.user).toEqual({ id: 1, username: "testuser" });
      expect(mockNext).toHaveBeenCalled();
    });

    test("should continue without user when no token", async () => {
      // Arrange
      mockContext.req!.header = mock(() => undefined);
      const optionalAuth = createOptionalAuth(mockAuthService as AuthService);

      // Act
      await optionalAuth(mockContext as Context & AuthContext, mockNext);

      // Assert
      expect(mockContext.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    test("should continue without user when invalid token", async () => {
      // Arrange
      mockAuthService.validateAccessToken = mock(async () => null);
      const optionalAuth = createOptionalAuth(mockAuthService as AuthService);

      // Act
      await optionalAuth(mockContext as Context & AuthContext, mockNext);

      // Assert
      expect(mockContext.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });

    test("should handle non-Bearer auth schemes", async () => {
      // Arrange
      mockContext.req!.header = mock(() => "Basic credentials");
      const optionalAuth = createOptionalAuth(mockAuthService as AuthService);

      // Act
      await optionalAuth(mockContext as Context & AuthContext, mockNext);

      // Assert
      expect(mockContext.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockAuthService.validateAccessToken).not.toHaveBeenCalled();
    });
  });
});
