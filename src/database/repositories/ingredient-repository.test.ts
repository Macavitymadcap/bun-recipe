import {
  describe,
  test,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
} from "bun:test";
import {
  IngredientEntity,
  IngredientRepository,
} from "./ingredient-repository";
import { DB_CONFIG } from "../config";
import { DbContext } from "../context";

const sampleIngredient = (
  overrides: Partial<Omit<IngredientEntity, "id">> = {},
): Omit<IngredientEntity, "id"> => ({
  recipe_id: 1,
  quantity: 1,
  unit: "pinch",
  name: "salt",
  order_index: 1,
  ...overrides,
});

describe("IngredientRepository", () => {
  let ingredientRepository: IngredientRepository;

  beforeAll(() => {
    (DbContext as any).instance = undefined; // Reset singleton instance before tests
    ingredientRepository = new IngredientRepository(DB_CONFIG.inMemoryPath);
  });

  afterAll(() => {
    try {
      ingredientRepository.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
    (DbContext as any).instance = undefined; // Reset singleton instance after tests
  });

  beforeEach(() => {
    // Clean up any existing ingredients before each test
    const allIngredients = ingredientRepository.readAll();
    allIngredients.forEach((ingredient) =>
      ingredientRepository.delete(ingredient.id),
    );
  });

  test("should create the ingredients table on init", () => {
    // Table creation is implicit; just ensure no error on instantiation
    expect(ingredientRepository).toBeInstanceOf(IngredientRepository);
  });

  describe("create", () => {
    test("should create a new ingredient and return the created entity with an id", () => {
      // Arrange
      const ingredientData = sampleIngredient();

      // Act
      const result = ingredientRepository.create(
        ingredientData,
      ) as IngredientEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBeTypeOf("number");
      expect(result.id).toBeGreaterThan(0);
      expect(result.recipe_id).toBe(ingredientData.recipe_id);
      expect(result.quantity).toBe(ingredientData.quantity);
      expect(result.unit).toBe(ingredientData.unit);
      expect(result.name).toBe(ingredientData.name);
    });

    test("should create multiple ingredients with unique ids", () => {
      // Arrange
      const ingredient1Data = sampleIngredient();
      const ingredient2Data = sampleIngredient({
        unit: undefined,
        name: "Onion",
        order_index: 2,
      });

      // Act
      const ingredient1 = ingredientRepository.create(
        ingredient1Data,
      ) as IngredientEntity;
      const ingredient2 = ingredientRepository.create(
        ingredient2Data,
      ) as IngredientEntity;

      // Assert
      expect(ingredient1).not.toBeNull();
      expect(ingredient2).not.toBeNull();
      expect(ingredient1.id).not.toBe(ingredient2!.id);
      expect(ingredient2.id).toBeGreaterThan(ingredient1.id);
      expect(ingredient1.name).toBe(ingredient1Data.name);
      expect(ingredient2.name).toBe(ingredient2Data.name);
    });
  });

  describe("read", () => {
    test("should read an existing ingredient by id", () => {
      // Arrange
      const ingredientData = sampleIngredient();
      const createdIngredient = ingredientRepository.create(
        ingredientData,
      ) as IngredientEntity;

      // Act
      const result = ingredientRepository.read(
        createdIngredient.id,
      ) as IngredientEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(createdIngredient.id);
      expect(result.name).toBe(ingredientData.name);
      expect(result.recipe_id).toBe(ingredientData.recipe_id);
      expect(result.quantity).toBe(ingredientData.quantity);
      expect(result.unit).toBe(ingredientData.unit);
    });

    test("should return null for non-existent ingredient", () => {
      // Act
      const result = ingredientRepository.read(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("readAll", () => {
    test("should return all ingredients ordered by name", () => {
      // Arrange
      const ingredient1 = ingredientRepository.create(
        sampleIngredient({ unit: undefined, name: "Onion" }),
      ) as IngredientEntity;
      const ingredient2 = ingredientRepository.create(
        sampleIngredient({
          unit: undefined,
          name: "Bell Pepper",
          order_index: 2,
        }),
      ) as IngredientEntity;
      const ingredient3 = ingredientRepository.create(
        sampleIngredient({ unit: undefined, name: "Celery", order_index: 3 }),
      ) as IngredientEntity;

      // Act
      const result = ingredientRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result).toContainValues([ingredient1, ingredient2, ingredient3]);
    });

    test("should return an empty array when no ingredients exist", () => {
      // Act
      const result = ingredientRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("update", () => {
    test("should update an existing ingredient and return the updated entity", () => {
      // Arrange
      const originalIngredient = ingredientRepository.create(
        sampleIngredient(),
      ) as IngredientEntity;
      const updatedData: IngredientEntity = {
        ...originalIngredient,
        quantity: 2,
        name: "Sugar",
      };

      // Act
      const result = ingredientRepository.update(
        updatedData,
      ) as IngredientEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(originalIngredient.id);
      expect(result.name).toBe(updatedData.name);
      expect(result.quantity).toBe(updatedData.quantity);
      expect(result.unit).toBe(originalIngredient.unit);
      expect(result.order_index).toBe(originalIngredient.order_index);
    });

    test("should handle updating optional fields to null", () => {
      // Arrange
      const originalIngredient = ingredientRepository.create(
        sampleIngredient(),
      ) as IngredientEntity;

      const updatedData: IngredientEntity = {
        ...originalIngredient,
        unit: undefined,
      };

      // Act
      const result = ingredientRepository.update(
        updatedData,
      ) as IngredientEntity;

      // Assert
      expect(result).not.toBeNull();
      expect(result.unit).toBeNull();
    });

    test("should return null when trying to update a non-existant ingredient", () => {
      // Arrange
      const nonExistentIngredient: IngredientEntity = {
        id: 999,
        recipe_id: 999,
        quantity: 5,
        name: "non-existant",
        order_index: 20,
      };

      // Act
      const result = ingredientRepository.update(nonExistentIngredient);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    test("should delete an existing ingredient and return true", () => {
      // Arrange
      const ingredient = ingredientRepository.create(
        sampleIngredient(),
      ) as IngredientEntity;

      // Act
      const result = ingredientRepository.delete(ingredient.id);

      // Assert
      expect(result).toBe(true);

      // Verify ingredient is actually deleted
      const deletedIngredient = ingredientRepository.read(ingredient.id);
      expect(deletedIngredient).toBeNull();
    });

    test("should return false when when trying to delete a non-existant ingredient", () => {
      // Arrange
      const nonExistantId = 999;

      // Act
      const result = ingredientRepository.delete(nonExistantId);

      // Assert
      expect(result).toBe(false);
    });

    test("should handle deleting all ingredients", () => {
      // Arrange
      ingredientRepository.create(sampleIngredient());
      ingredientRepository.create(
        sampleIngredient({
          unit: "dash",
          name: "Henderson's Relish",
          order_index: 2,
        }),
      );
      ingredientRepository.create(
        sampleIngredient({
          quantity: 150,
          unit: "g",
          name: "Minced Beef",
          order_index: 3,
        }),
      );

      const allIngredients = ingredientRepository.readAll();

      // Act
      allIngredients.forEach((ingredient) => {
        const deleted = ingredientRepository.delete(ingredient.id);
        expect(deleted).toBe(true);
      });

      // Assert
      const remainingIngredients = ingredientRepository.readAll();
      expect(remainingIngredients).toBeArrayOfSize(0);
    });
  });

  describe("getByRecipeId", () => {
    test("should return all Ingredients that have the given recipe_id", () => {
      // Arrange
      const recipeId = 30;
      const ingredient1 = ingredientRepository.create(
        sampleIngredient({
          recipe_id: recipeId,
          unit: undefined,
          name: "Apple",
        }),
      );
      const ingredient2 = ingredientRepository.create(
        sampleIngredient({
          recipe_id: recipeId,
          unit: undefined,
          name: "Pear",
          order_index: 2,
        }),
      );
      const ingredient3 = ingredientRepository.create(
        sampleIngredient({
          recipe_id: recipeId,
          unit: undefined,
          name: "Orange",
          order_index: 3,
        }),
      );

      // Act
      const result = ingredientRepository.getByRecipeId(recipeId);

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result).toContainValues([ingredient1, ingredient2, ingredient3]);
    });

    test("should return an empty array when given a recipe_id with no associated Ingredients", () => {
      // Arrange
      const nonExistantRecipeId = 50;

      // Act
      const result = ingredientRepository.getByRecipeId(nonExistantRecipeId);

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("deleteByRecipeId", () => {
    test("should return false when given a recipe_id with no associated Ingredients", () => {
      // Arrange
      const nonExistantRecipeId = 55;

      // Act
      const result = ingredientRepository.deleteByRecipeId(nonExistantRecipeId);

      // Assert
      expect(result).toBe(false);
    });

    test("should return true and remove entities from the database when given a recipe_id with associated Ingredients", () => {
      // Arrange
      const recipeId = 76;
      const ingredient = [
        sampleIngredient({ recipe_id: recipeId }),
        sampleIngredient({ recipe_id: recipeId, unit: "bulb", name: "Garlic" }),
        sampleIngredient({
          recipe_id: recipeId,
          quantity: 100,
          unit: "ml",
          name: "Chicken Stock",
        }),
      ];
      ingredient.forEach((ingredient) =>
        ingredientRepository.create(ingredient),
      );

      // Act
      const result = ingredientRepository.deleteByRecipeId(recipeId);

      // Assert
      expect(result).toBe(true);

      // Verify deletion of Ingredients
      const remainingIngredients = ingredientRepository.getByRecipeId(recipeId);
      expect(remainingIngredients).toBeArrayOfSize(0);
    });
  });
});
