import { describe, test, afterEach } from "bun:test";
import { expect, jest } from "bun:test";

import { Container, DependencyKey } from "./container";
import { RefreshTokenRepository } from "../auth/repositories/refresh-token-repository";
import { UserRepository } from "../auth/repositories/user-repository";
import { AuthService } from "../auth/services/auth-service";
import { PasswordService } from "../auth/services/password-service";
import { TokenService } from "../auth/services/token-service";
import { DbContext } from "../database/context/context";
import { CooksNoteRepository } from "../database/repositories/cooks-note-repository";
import { IngredientRepository } from "../database/repositories/ingredient-repository";
import { DirectionRepository } from "../database/repositories/direction-repository";
import { RecipeRepository } from "../database/repositories/recipe-repository";
import { RecipeTagRepository } from "../database/repositories/recipe-tag-repository";
import { TagRepository } from "../database/repositories/tag-repository";
import { RecipeService } from "../database/services/recipe-service";

describe("Container", () => {
  afterEach(() => {
    // Reset singleton for isolation
    Container.getInstance().reset();
  });

  test("should return the same singleton instance", () => {
    // Act
    const instance1 = Container.getInstance();
    const instance2 = Container.getInstance();

    // Assert
    expect(instance1).toBe(instance2);
  });

  test("should register and retrieve dependencies", () => {
    // Arrange
    const container = Container.getInstance();

    // Act
    const deps = container.getDependencies();

    // Assert
    expect(deps.authService).toBeInstanceOf(AuthService);
    expect(deps.cooksNoteRepository).toBeInstanceOf(CooksNoteRepository);
    expect(deps.dbContext).toBeInstanceOf(DbContext);
    expect(deps.ingredientRepository).toBeInstanceOf(IngredientRepository);
    expect(deps.directionRepository).toBeInstanceOf(DirectionRepository);
    expect(deps.passwordService).toBeInstanceOf(PasswordService);
    expect(deps.recipeRepository).toBeInstanceOf(RecipeRepository);
    expect(deps.recipeService).toBeInstanceOf(RecipeService);
    expect(deps.recipeTagRepository).toBeInstanceOf(RecipeTagRepository);
    expect(deps.refreshTokenRepository).toBeInstanceOf(RefreshTokenRepository);
    expect(deps.tagRepository).toBeInstanceOf(TagRepository);
    expect(deps.tokenService).toBeInstanceOf(TokenService);
    expect(deps.userRepository).toBeInstanceOf(UserRepository);
  });

  test("should throw if dependency does not exist", () => {
    // Arrange
    const container = Container.getInstance();

    // Act & Assert
    expect(() => container.get("nonExistent" as DependencyKey)).toThrow(
      "Dependency 'nonExistent' not found",
    );
  });
});
