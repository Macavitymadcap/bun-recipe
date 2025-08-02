import {
  describe,
  test,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
} from "bun:test";
import { RecipeEntity, RecipeRepository } from "./recipe-repository";
import { DB_CONFIG } from "../config";
import { DbContext } from "../context";

const sampleRecipe = (
  overrides: Partial<
    Omit<RecipeEntity, "id" | "created_at" | "updated_at">
  > = {},
): Omit<RecipeEntity, "id" | "created_at" | "updated_at"> => ({
  name: "Test Recipe",
  servings: "4-6",
  calories_per_portion: 350,
  preparation_time: "30 minutes",
  cooking_time: "1 hour",
  ...overrides,
});

describe("RecipeRepository", () => {
  let recipeRepository: RecipeRepository;

  beforeAll(() => {
    (DbContext as any).instance = undefined; // Reset singleton instance before tests
    recipeRepository = new RecipeRepository(DB_CONFIG.inMemoryPath);
  });

  afterAll(() => {
    try {
      recipeRepository.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
    (DbContext as any).instance = undefined; // Reset singleton instance after tests
  });

  beforeEach(() => {
    // Clean up any existing recipes before each test
    const allRecipes = recipeRepository.readAll();
    allRecipes.forEach((recipe) => recipeRepository.delete(recipe.id));
  });

  test("should create the recipes table on init", () => {
    // Table creation is implicit; just ensure no error on instantiation
    expect(recipeRepository).toBeInstanceOf(RecipeRepository);
  });

  describe("create", () => {
    test("should create a new recipe and return the created entity with id and timestamps", () => {
      // Arrange
      const recipeData = sampleRecipe();

      // Act
      const result = recipeRepository.create(recipeData) as RecipeEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBeTypeOf("number");
      expect(result.id).toBeGreaterThan(0);
      expect(result.name).toBe(recipeData.name);
      expect(result.servings).toBe(recipeData.servings);
      expect(result.calories_per_portion).toBe(recipeData.calories_per_portion);
      expect(result.preparation_time).toBe(recipeData.preparation_time);
      expect(result.cooking_time).toBe(recipeData.cooking_time);
      expect(result.created_at).toBeTypeOf("string");
      expect(result.updated_at).toBeTypeOf("string");
    });

    test("should create a recipe with only required fields", () => {
      // Arrange
      const recipeData = sampleRecipe({
        calories_per_portion: undefined,
        preparation_time: undefined,
        cooking_time: undefined,
      });

      // Act
      const result = recipeRepository.create(recipeData) as RecipeEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBeGreaterThan(0);
      expect(result.name).toBe(recipeData.name);
      expect(result.servings).toBe(recipeData.servings);
      expect(result.calories_per_portion).toBeNull();
      expect(result.preparation_time).toBeNull();
      expect(result.cooking_time).toBeNull();
    });

    test("should create multiple recipes with unique ids", () => {
      // Arrange
      const recipe1Data = sampleRecipe({ name: "Recipe 1" });
      const recipe2Data = sampleRecipe({ name: "Recipe 2" });

      // Act
      const recipe1 = recipeRepository.create(recipe1Data) as RecipeEntity;
      const recipe2 = recipeRepository.create(recipe2Data) as RecipeEntity;

      // Assert
      expect(recipe1).not.toBeNull();
      expect(recipe2).not.toBeNull();
      expect(recipe1.id).not.toBe(recipe2.id);
      expect(recipe2.id).toBeGreaterThan(recipe1.id);
      expect(recipe1.name).toBe(recipe1Data.name);
      expect(recipe2.name).toBe(recipe2Data.name);
    });
  });

  describe("read", () => {
    test("should read an existing recipe by id", () => {
      // Arrange
      const recipeData = sampleRecipe();
      const createdRecipe = recipeRepository.create(recipeData) as RecipeEntity;

      // Act
      const result = recipeRepository.read(createdRecipe.id) as RecipeEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(createdRecipe.id);
      expect(result.name).toBe(recipeData.name);
      expect(result.servings).toBe(recipeData.servings);
      expect(result.calories_per_portion).toBe(recipeData.calories_per_portion);
      expect(result.preparation_time).toBe(recipeData.preparation_time);
      expect(result.cooking_time).toBe(recipeData.cooking_time);
    });

    test("should return null for non-existent recipe", () => {
      // Act
      const result = recipeRepository.read(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("readAll", () => {
    test("should return all recipes ordered by created_at DESC", async () => {
      // Arrange - Add small delays to ensure different timestamps
      const recipe1 = recipeRepository.create(
        sampleRecipe({ name: "Recipe 1" }),
      ) as RecipeEntity;
      await Bun.sleep(10); // 10ms delay
      const recipe2 = recipeRepository.create(
        sampleRecipe({ name: "Recipe 2" }),
      ) as RecipeEntity;
      await Bun.sleep(10); // 10ms delay
      const recipe3 = recipeRepository.create(
        sampleRecipe({ name: "Recipe 3" }),
      ) as RecipeEntity;

      // Act
      const result = recipeRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(3);
      // Should be ordered by created_at DESC (most recent first)
      expect(result[0].name).toBe(recipe3.name);
      expect(result[1].name).toBe(recipe2.name);
      expect(result[2].name).toBe(recipe1.name);
    });

    test("should return empty array when no recipes exist", () => {
      // Act
      const result = recipeRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("update", () => {
    test("should update an existing recipe and return the updated entity", async () => {
      // Arrange
      const originalRecipe = recipeRepository.create(
        sampleRecipe(),
      ) as RecipeEntity;
      const originalUpdatedAt = originalRecipe!.updated_at;

      // Add a small delay to ensure updated_at will be different
      await Bun.sleep(10);

      const updatedData: RecipeEntity = {
        ...originalRecipe,
        name: "Updated Recipe",
        servings: "8-10",
        calories_per_portion: 450,
        preparation_time: "45 minutes",
        cooking_time: "1.5 hours",
      };

      // Act
      const result = recipeRepository.update(updatedData) as RecipeEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(originalRecipe.id);
      expect(result.name).toBe(updatedData.name);
      expect(result.servings).toBe(updatedData.servings);
      expect(result.calories_per_portion).toBe(
        updatedData.calories_per_portion,
      );
      expect(result.preparation_time).toBe(updatedData.preparation_time);
      expect(result.cooking_time).toBe(updatedData.cooking_time);
      expect(result.created_at).toBe(originalRecipe.created_at);
      // Updated_at should be different
      expect(result.updated_at).not.toBe(originalUpdatedAt);
    });

    test("should handle updating optional fields to null", () => {
      // Arrange
      const originalRecipe = recipeRepository.create(
        sampleRecipe(),
      ) as RecipeEntity;

      const updatedData: RecipeEntity = {
        ...originalRecipe,
        calories_per_portion: undefined,
        preparation_time: undefined,
        cooking_time: undefined,
      };

      // Act
      const result = recipeRepository.update(updatedData) as RecipeEntity;

      // Assert
      expect(result).not.toBeNull();
      expect(result.calories_per_portion).toBeNull();
      expect(result.preparation_time).toBeNull();
      expect(result.cooking_time).toBeNull();
    });

    test("should return null when trying to update a non-existent recipe", () => {
      // Arrange
      const nonExistentRecipe: RecipeEntity = {
        id: 999,
        name: "Non-existent",
        servings: "4",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Act
      const result = recipeRepository.update(nonExistentRecipe);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    test("should delete an existing recipe and return true", () => {
      // Arrange
      const recipe = recipeRepository.create(sampleRecipe()) as RecipeEntity;

      // Act
      const result = recipeRepository.delete(recipe.id);

      // Assert
      expect(result).toBe(true);

      // Verify recipe is actually deleted
      const deletedRecipe = recipeRepository.read(recipe.id);
      expect(deletedRecipe).toBeNull();
    });

    test("should return false when trying to delete a non-existent recipe", () => {
      // Arrange
      const nonExistantId = 999;

      // Act
      const result = recipeRepository.delete(nonExistantId);

      // Assert
      expect(result).toBe(false);
    });

    test("should handle deleting all recipes", () => {
      // Arrange
      recipeRepository.create(sampleRecipe({ name: "Recipe 1" }));
      recipeRepository.create(sampleRecipe({ name: "Recipe 2" }));
      recipeRepository.create(sampleRecipe({ name: "Recipe 3" }));

      const allRecipes = recipeRepository.readAll();

      // Act
      allRecipes.forEach((recipe) => {
        const deleted = recipeRepository.delete(recipe.id);
        expect(deleted).toBe(true);
      });

      // Assert
      const remainingRecipes = recipeRepository.readAll();
      expect(remainingRecipes).toBeArrayOfSize(0);
    });
  });

  describe("searchByName", () => {
    beforeEach(() => {
      // Setup test data
      recipeRepository.create(sampleRecipe({ name: "Spaghetti Bolognese" }));
      recipeRepository.create(sampleRecipe({ name: "Spaghetti Carbonara" }));
      recipeRepository.create(sampleRecipe({ name: "Chicken Alfredo" }));
      recipeRepository.create(sampleRecipe({ name: "Beef Stroganoff" }));
    });

    test("should find recipes containing search term", () => {
      // Act
      const result = recipeRepository.searchByName("Spaghetti");

      // Assert
      expect(result).toBeArrayOfSize(2);
      expect(result.map((r) => r.name)).toContain("Spaghetti Bolognese");
      expect(result.map((r) => r.name)).toContain("Spaghetti Carbonara");
    });

    test("should be case-insensitive", () => {
      // Act
      const result = recipeRepository.searchByName("spaghetti");

      // Assert
      expect(result).toBeArrayOfSize(2);
      expect(result.map((r) => r.name)).toContain("Spaghetti Bolognese");
      expect(result.map((r) => r.name)).toContain("Spaghetti Carbonara");
    });

    test("should find recipes with partial matches", () => {
      // Act
      const result = recipeRepository.searchByName("redo");

      // Assert
      expect(result).toBeArrayOfSize(1);
      expect(result[0].name).toBe("Chicken Alfredo");
    });

    test("should return empty array when no matches found", () => {
      // Act
      const result = recipeRepository.searchByName("Pizza");

      // Assert
      expect(result).toBeArrayOfSize(0);
    });

    test("should return all recipes when searching with empty string", () => {
      // Act
      const result = recipeRepository.searchByName("");

      // Assert
      expect(result).toBeArrayOfSize(4);
    });

    test("should order results by created_at DESC", async () => {
      // Clear existing data first
      const existing = recipeRepository.readAll();
      existing.forEach((r) => recipeRepository.delete(r.id));

      // Create with delays
      recipeRepository.create(sampleRecipe({ name: "Spaghetti Bolognese" }));
      await Bun.sleep(10);
      recipeRepository.create(sampleRecipe({ name: "Spaghetti Carbonara" }));

      // Act
      const result = recipeRepository.searchByName("Spaghetti");

      // Assert
      expect(result).toBeArrayOfSize(2);
      // The second created recipe should appear first
      expect(result[0].name).toBe("Spaghetti Carbonara");
      expect(result[1].name).toBe("Spaghetti Bolognese");
    });

    test("should handle special SQL characters in search term", () => {
      // Arrange
      recipeRepository.create(sampleRecipe({ name: "Recipe with % symbol" }));
      recipeRepository.create(
        sampleRecipe({ name: "Recipe with _ underscore" }),
      );

      // Act
      const percentResult = recipeRepository.searchByName("%");
      const underscoreResult = recipeRepository.searchByName("_");

      // Assert
      expect(percentResult.some((r) => r.name.includes("%"))).toBe(true);
      expect(underscoreResult.some((r) => r.name.includes("_"))).toBe(true);
    });
  });
});
