import {
  describe,
  test,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
} from "bun:test";
import { RecipeTagEntity, RecipeTagRepository } from "./recipe-tag-repository";
import { RecipeEntity, RecipeRepository } from "./recipe-repository";
import { TagEntity, TagRepository } from "./tag-repository";
import { DB_CONFIG } from "../config";
import { DbContext } from "../context";

const sampleRecipeTag = (
  overrides: Partial<Omit<RecipeTagEntity, "id">> = {},
): Omit<RecipeTagEntity, "id"> => ({
  recipe_id: 1,
  tag_id: 1,
  ...overrides,
});

describe("RecipeTagRepository", () => {
  let recipeTagRepository: RecipeTagRepository;
  let recipeRepository: RecipeRepository;
  let tagRepository: TagRepository;

  beforeAll(() => {
    (DbContext as any).instance = undefined; // Reset singleton instance before tests

    // Initialize repositories - order matters for foreign key constraints
    recipeRepository = new RecipeRepository(DB_CONFIG.inMemoryPath);
    tagRepository = new TagRepository(DB_CONFIG.inMemoryPath);
    recipeTagRepository = new RecipeTagRepository(DB_CONFIG.inMemoryPath);
  });

  afterAll(() => {
    try {
      recipeTagRepository.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
    (DbContext as any).instance = undefined; // Reset singleton instance after tests
  });

  beforeEach(() => {
    // Clean up in reverse order due to foreign key constraints
    const allRecipeTags = recipeTagRepository.readAll();
    allRecipeTags.forEach((recipeTag) =>
      recipeTagRepository.delete(recipeTag.id),
    );

    const allRecipes = recipeRepository.readAll();
    allRecipes.forEach((recipe) => recipeRepository.delete(recipe.id));

    const allTags = tagRepository.readAll();
    allTags.forEach((tag) => tagRepository.delete(tag.id));
  });

  test("should create the recipe_tags table on init", () => {
    // Table creation is implicit; just ensure no error on instantiation
    expect(recipeTagRepository).toBeInstanceOf(RecipeTagRepository);
  });

  describe("create", () => {
    let testRecipe: RecipeEntity;
    let testTag: TagEntity;

    beforeEach(() => {
      // Create test recipe and tag for foreign key constraints
      testRecipe = recipeRepository.create({
        name: "Test Recipe",
        servings: "4",
      }) as RecipeEntity;

      testTag = tagRepository.create({
        name: "Test Tag",
      }) as TagEntity;
    });

    test("should create a new recipe-tag relationship and return the created entity with id", () => {
      // Arrange
      const recipeTagData = sampleRecipeTag({
        recipe_id: testRecipe.id,
        tag_id: testTag.id,
      });

      // Act
      const result = recipeTagRepository.create(
        recipeTagData,
      ) as RecipeTagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBeTypeOf("number");
      expect(result.id).toBeGreaterThan(0);
      expect(result.recipe_id).toBe(testRecipe.id);
      expect(result.tag_id).toBe(testTag.id);
    });

    test("should create multiple recipe-tag relationships with unique ids", () => {
      // Arrange
      const testTag2 = tagRepository.create({
        name: "Another Tag",
      }) as TagEntity;

      const recipeTag1Data = sampleRecipeTag({
        recipe_id: testRecipe.id,
        tag_id: testTag.id,
      });
      const recipeTag2Data = sampleRecipeTag({
        recipe_id: testRecipe.id,
        tag_id: testTag2.id,
      });

      // Act
      const recipeTag1 = recipeTagRepository.create(
        recipeTag1Data,
      ) as RecipeTagEntity;
      const recipeTag2 = recipeTagRepository.create(
        recipeTag2Data,
      ) as RecipeTagEntity;

      // Assert
      expect(recipeTag1).not.toBeNull();
      expect(recipeTag2).not.toBeNull();
      expect(recipeTag1.id).not.toBe(recipeTag2.id);
      expect(recipeTag2.id).toBeGreaterThan(recipeTag1.id);
    });

    test("should enforce unique constraint on recipe_id and tag_id combination", () => {
      // Arrange
      const recipeTagData = sampleRecipeTag({
        recipe_id: testRecipe.id,
        tag_id: testTag.id,
      });

      // Act
      recipeTagRepository.create(recipeTagData);

      // Assert - attempting to create duplicate should fail
      expect(() => {
        recipeTagRepository.create(recipeTagData);
      }).toThrow();
    });
  });

  describe("read", () => {
    let testRecipe: RecipeEntity;
    let testTag: TagEntity;

    beforeEach(() => {
      testRecipe = recipeRepository.create({
        name: "Test Recipe",
        servings: "4",
      }) as RecipeEntity;

      testTag = tagRepository.create({
        name: "Test Tag",
      }) as TagEntity;
    });

    test("should read an existing recipe-tag relationship by id", () => {
      // Arrange
      const recipeTagData = sampleRecipeTag({
        recipe_id: testRecipe.id,
        tag_id: testTag.id,
      });
      const createdRecipeTag = recipeTagRepository.create(
        recipeTagData,
      ) as RecipeTagEntity;

      // Act
      const result = recipeTagRepository.read(
        createdRecipeTag.id,
      ) as RecipeTagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(createdRecipeTag.id);
      expect(result.recipe_id).toBe(testRecipe.id);
      expect(result.tag_id).toBe(testTag.id);
    });

    test("should return null for non-existent recipe-tag relationship", () => {
      // Act
      const result = recipeTagRepository.read(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("readAll", () => {
    test("should return all recipe-tag relationships", () => {
      // Arrange
      const recipe1 = recipeRepository.create({
        name: "Recipe 1",
        servings: "2",
      }) as RecipeEntity;
      const recipe2 = recipeRepository.create({
        name: "Recipe 2",
        servings: "4",
      }) as RecipeEntity;
      const tag1 = tagRepository.create({ name: "Tag 1" }) as TagEntity;
      const tag2 = tagRepository.create({ name: "Tag 2" }) as TagEntity;

      const recipeTag1 = recipeTagRepository.create({
        recipe_id: recipe1.id,
        tag_id: tag1.id,
      });
      const recipeTag2 = recipeTagRepository.create({
        recipe_id: recipe1.id,
        tag_id: tag2.id,
      });
      const recipeTag3 = recipeTagRepository.create({
        recipe_id: recipe2.id,
        tag_id: tag1.id,
      });

      // Act
      const result = recipeTagRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result).toContainValues([recipeTag1, recipeTag2, recipeTag3]);
    });

    test("should return empty array when no recipe-tag relationships exist", () => {
      // Act
      const result = recipeTagRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("update", () => {
    let testRecipe1: RecipeEntity;
    let testRecipe2: RecipeEntity;
    let testTag1: TagEntity;
    let testTag2: TagEntity;

    beforeEach(() => {
      testRecipe1 = recipeRepository.create({
        name: "Recipe 1",
        servings: "2",
      }) as RecipeEntity;
      testRecipe2 = recipeRepository.create({
        name: "Recipe 2",
        servings: "4",
      }) as RecipeEntity;
      testTag1 = tagRepository.create({ name: "Tag 1" }) as TagEntity;
      testTag2 = tagRepository.create({ name: "Tag 2" }) as TagEntity;
    });

    test("should update an existing recipe-tag relationship and return the updated entity", () => {
      // Arrange
      const originalRecipeTag = recipeTagRepository.create({
        recipe_id: testRecipe1.id,
        tag_id: testTag1.id,
      }) as RecipeTagEntity;

      const updatedData: RecipeTagEntity = {
        ...originalRecipeTag,
        recipe_id: testRecipe2.id,
        tag_id: testTag2.id,
      };

      // Act
      const result = recipeTagRepository.update(updatedData) as RecipeTagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(originalRecipeTag.id);
      expect(result.recipe_id).toBe(testRecipe2.id);
      expect(result.tag_id).toBe(testTag2.id);
    });

    test("should return null when trying to update non-existent recipe-tag relationship", () => {
      // Arrange
      const nonExistentRecipeTag: RecipeTagEntity = {
        id: 999,
        recipe_id: testRecipe1.id,
        tag_id: testTag1.id,
      };

      // Act
      const result = recipeTagRepository.update(nonExistentRecipeTag);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    let testRecipe: RecipeEntity;
    let testTag: TagEntity;

    beforeEach(() => {
      testRecipe = recipeRepository.create({
        name: "Test Recipe",
        servings: "4",
      }) as RecipeEntity;
      testTag = tagRepository.create({ name: "Test Tag" }) as TagEntity;
    });

    test("should delete an existing recipe-tag relationship and return true", () => {
      // Arrange
      const recipeTag = recipeTagRepository.create({
        recipe_id: testRecipe.id,
        tag_id: testTag.id,
      }) as RecipeTagEntity;

      // Act
      const result = recipeTagRepository.delete(recipeTag.id);

      // Assert
      expect(result).toBe(true);

      // Verify recipe-tag is actually deleted
      const deletedRecipeTag = recipeTagRepository.read(recipeTag.id);
      expect(deletedRecipeTag).toBeNull();
    });

    test("should return false when trying to delete non-existent recipe-tag relationship", () => {
      // Act
      const result = recipeTagRepository.delete(999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("getByRecipeId", () => {
    test("should return all recipe-tag relationships for a given recipe", () => {
      // Arrange
      const recipe = recipeRepository.create({
        name: "Tagged Recipe",
        servings: "6",
      }) as RecipeEntity;
      const tag1 = tagRepository.create({ name: "Italian" }) as TagEntity;
      const tag2 = tagRepository.create({ name: "Vegetarian" }) as TagEntity;
      const tag3 = tagRepository.create({ name: "Quick" }) as TagEntity;

      const recipeTag1 = recipeTagRepository.create({
        recipe_id: recipe.id,
        tag_id: tag1.id,
      });
      const recipeTag2 = recipeTagRepository.create({
        recipe_id: recipe.id,
        tag_id: tag2.id,
      });
      const recipeTag3 = recipeTagRepository.create({
        recipe_id: recipe.id,
        tag_id: tag3.id,
      });

      // Act
      const result = recipeTagRepository.getByRecipeId(recipe.id);

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result).toContainValues([recipeTag1, recipeTag2, recipeTag3]);
    });

    test("should return empty array when recipe has no tags", () => {
      // Arrange
      const recipe = recipeRepository.create({
        name: "Untagged Recipe",
        servings: "4",
      }) as RecipeEntity;

      // Act
      const result = recipeTagRepository.getByRecipeId(recipe.id);

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("getByTagId", () => {
    test("should return all recipe-tag relationships for a given tag", () => {
      // Arrange
      const tag = tagRepository.create({ name: "Healthy" }) as TagEntity;
      const recipe1 = recipeRepository.create({
        name: "Salad",
        servings: "2",
      }) as RecipeEntity;
      const recipe2 = recipeRepository.create({
        name: "Smoothie",
        servings: "1",
      }) as RecipeEntity;
      const recipe3 = recipeRepository.create({
        name: "Soup",
        servings: "4",
      }) as RecipeEntity;

      const recipeTag1 = recipeTagRepository.create({
        recipe_id: recipe1.id,
        tag_id: tag.id,
      });
      const recipeTag2 = recipeTagRepository.create({
        recipe_id: recipe2.id,
        tag_id: tag.id,
      });
      const recipeTag3 = recipeTagRepository.create({
        recipe_id: recipe3.id,
        tag_id: tag.id,
      });

      // Act
      const result = recipeTagRepository.getByTagId(tag.id);

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result).toContainValues([recipeTag1, recipeTag2, recipeTag3]);
    });

    test("should return empty array when tag is not used by any recipes", () => {
      // Arrange
      const unusedTag = tagRepository.create({ name: "Unused" }) as TagEntity;

      // Act
      const result = recipeTagRepository.getByTagId(unusedTag.id);

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("deleteByRecipeId", () => {
    test("should return false when recipe has no associated tags", () => {
      // Arrange
      const recipe = recipeRepository.create({
        name: "Untagged Recipe",
        servings: "4",
      }) as RecipeEntity;

      // Act
      const result = recipeTagRepository.deleteByRecipeId(recipe.id);

      // Assert
      expect(result).toBe(false);
    });

    test("should return true and remove all tags for a recipe", () => {
      // Arrange
      const recipe = recipeRepository.create({
        name: "Multi-Tagged Recipe",
        servings: "8",
      }) as RecipeEntity;
      const tag1 = tagRepository.create({ name: "Dessert" }) as TagEntity;
      const tag2 = tagRepository.create({ name: "Chocolate" }) as TagEntity;
      const tag3 = tagRepository.create({ name: "Party" }) as TagEntity;

      recipeTagRepository.create({ recipe_id: recipe.id, tag_id: tag1.id });
      recipeTagRepository.create({ recipe_id: recipe.id, tag_id: tag2.id });
      recipeTagRepository.create({ recipe_id: recipe.id, tag_id: tag3.id });

      // Verify tags exist before deletion
      expect(recipeTagRepository.getByRecipeId(recipe.id)).toBeArrayOfSize(3);

      // Act
      const result = recipeTagRepository.deleteByRecipeId(recipe.id);

      // Assert
      expect(result).toBe(true);
      expect(recipeTagRepository.getByRecipeId(recipe.id)).toBeArrayOfSize(0);
    });

    test("should only delete tags for specified recipe", () => {
      // Arrange
      const recipe1 = recipeRepository.create({
        name: "Recipe 1",
        servings: "4",
      }) as RecipeEntity;
      const recipe2 = recipeRepository.create({
        name: "Recipe 2",
        servings: "6",
      }) as RecipeEntity;
      const tag = tagRepository.create({ name: "Shared Tag" }) as TagEntity;

      recipeTagRepository.create({ recipe_id: recipe1.id, tag_id: tag.id });
      recipeTagRepository.create({ recipe_id: recipe2.id, tag_id: tag.id });

      // Act
      const result = recipeTagRepository.deleteByRecipeId(recipe1.id);

      // Assert
      expect(result).toBe(true);
      expect(recipeTagRepository.getByRecipeId(recipe1.id)).toBeArrayOfSize(0);
      expect(recipeTagRepository.getByRecipeId(recipe2.id)).toBeArrayOfSize(1);
    });
  });

  describe("findByRecipeAndTag", () => {
    let testRecipe: RecipeEntity;
    let testTag: TagEntity;

    beforeEach(() => {
      testRecipe = recipeRepository.create({
        name: "Test Recipe",
        servings: "4",
      }) as RecipeEntity;
      testTag = tagRepository.create({ name: "Test Tag" }) as TagEntity;
    });

    test("should find existing recipe-tag relationship", () => {
      // Arrange
      const recipeTag = recipeTagRepository.create({
        recipe_id: testRecipe.id,
        tag_id: testTag.id,
      }) as RecipeTagEntity;

      // Act
      const result = recipeTagRepository.findByRecipeAndTag(
        testRecipe.id,
        testTag.id,
      );

      // Assert
      expect(result).not.toBeNull();
      expect(result!.id).toBe(recipeTag.id);
      expect(result!.recipe_id).toBe(testRecipe.id);
      expect(result!.tag_id).toBe(testTag.id);
    });

    test("should return null when relationship does not exist", () => {
      // Act
      const result = recipeTagRepository.findByRecipeAndTag(
        testRecipe.id,
        testTag.id,
      );

      // Assert
      expect(result).toBeNull();
    });

    test("should return null for non-existent recipe or tag ids", () => {
      // Act
      const result1 = recipeTagRepository.findByRecipeAndTag(999, testTag.id);
      const result2 = recipeTagRepository.findByRecipeAndTag(
        testRecipe.id,
        999,
      );
      const result3 = recipeTagRepository.findByRecipeAndTag(999, 999);

      // Assert
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });
  });
});
