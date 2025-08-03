import { beforeEach, describe, test, expect } from "bun:test";
import { PasswordService } from "./password-service";

describe("PasswordService", () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  describe("hash", () => {
    test("should hash a password", async () => {
      // Arrange
      const password = "testPassword123";

      // Act
      const hash = await passwordService.hash(password);

      // Assert
      expect(hash).toBeString();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    test("should produce different hashes for the same password", async () => {
      // Arrange
      const password = "testPassword123";

      // Act
      const hash1 = await passwordService.hash(password);
      const hash2 = await passwordService.hash(password);

      // Assert
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verify", () => {
    test("should verify correct password", async () => {
      // Arrange
      const password = "correctPassword123";
      const hash = await passwordService.hash(password);

      // Act
      const isValid = await passwordService.verify(password, hash);

      // Assert
      expect(isValid).toBe(true);
    });

    test("should reject incorrect password", async () => {
      // Arrange
      const password = "correctPassword123";
      const wrongPassword = "wrongPassword123";
      const hash = await passwordService.hash(password);

      // Act
      const isValid = await passwordService.verify(wrongPassword, hash);

      // Assert
      expect(isValid).toBe(false);
    });

    test("should reject invalid hash format", async () => {
      // Arrange
      const password = "testPassword123";
      const invalidHash = "not-a-valid-hash";

      // Act & Assert
      expect(passwordService.verify(password, invalidHash)).rejects.toThrow();
    });
  });
});
