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
import { DB_CONFIG, DbConfig } from "../config";
import { DbContext } from "../context/context";

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
      const testConfig: DbConfig = {
      ...DB_CONFIG, 
      database: "recipe_test"
    };
    (DbContext as any).instance = undefined; // Reset singleton instance before tests

    // Initialize repositories - order matters for foreign key constraints
    recipeRepository = new RecipeRepository(testConfig);
    tagRepository = new TagRepository(testConfig);
    recipeTagRepository = new RecipeTagRepository(testConfig);
  });

  afterAll(async () => {
    try {
      await recipeTagRepository.close();
      await recipeRepository.close()
      await tagRepository.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
    (DbContext as any).instance = undefined; // Reset singleton instance after tests
  });

  beforeEach(async () => {
    // Clean up in reverse order due to foreign key constraints
    const allRecipeTags = await recipeTagRepository.readAll();
    allRecipeTags.forEach(async (recipeTag) =>
      await recipeTagRepository.delete(recipeTag.id),
    );

    const allRecipes = await recipeRepository.readAll();
    allRecipes.forEach(async (recipe) => await recipeRepository.delete(recipe.id));

    const allTags = await tagRepository.readAll();
    allTags.forEach(async (tag) => await tagRepository.delete(tag.id));
  });

  test("should create the recipe_tags table on init", () => {
    // Table creation is implicit; just ensure no error on instantiation
    expect(recipeTagRepository).toBeInstanceOf(RecipeTagRepository);
  });

  describe("create", () => {
    let testRecipe: RecipeEntity;
    let testTag: TagEntity;

    beforeEach(async () => {
      // Create test recipe and tag for foreign key constraints
      testRecipe = await recipeRepository.create({
        name: "Test Recipe",
        servings: "4",
      }) as RecipeEntity;

      testTag = await tagRepository.create({
        name: "Test Tag",
      }) as TagEntity;
    });

    test("should create a new recipe-tag relationship and return the created entity with id", async () => {
      // Arrange
      const recipeTagData = sampleRecipeTag({
        recipe_id: testRecipe.id,
        tag_id: testTag.id,
      });

      // Act
      const result = await recipeTagRepository.create(
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

    test("should create multiple recipe-tag relationships with unique ids", async () => {
      // Arrange
      const testTag2 = await tagRepository.create({
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
      const recipeTag1 = await recipeTagRepository.create(
        recipeTag1Data,
      ) as RecipeTagEntity;
      const recipeTag2 = await recipeTagRepository.create(
        recipeTag2Data,
      ) as RecipeTagEntity;

      // Assert
      expect(recipeTag1).not.toBeNull();
      expect(recipeTag2).not.toBeNull();
      expect(recipeTag1.id).not.toBe(recipeTag2.id);
      expect(recipeTag2.id).toBeGreaterThan(recipeTag1.id);
    });

    test("should enforce unique constraint on recipe_id and tag_id combination", async () => {
      // Arrange
      const recipeTagData = sampleRecipeTag({
        recipe_id: testRecipe.id,
        tag_id: testTag.id,
      });

      // Act
      await recipeTagRepository.create(recipeTagData);

      // Assert - attempting to create duplicate should fail
      expect(async () => {
        await recipeTagRepository.create(recipeTagData);
      }).toThrow();
    });
  });

  describe("read", () => {
    let testRecipe: RecipeEntity;
    let testTag: TagEntity;

    beforeEach(async () => {
      testRecipe = await recipeRepository.create({
        name: "Test Recipe",
        servings: "4",
      }) as RecipeEntity;

      testTag = await tagRepository.create({
        name: "Test Tag",
      }) as TagEntity;
    });

    test("should read an existing recipe-tag relationship by id", async () => {
      // Arrange
      const recipeTagData = sampleRecipeTag({
        recipe_id: testRecipe.id,
        tag_id: testTag.id,
      });
      const createdRecipeTag = await recipeTagRepository.create(
        recipeTagData,
      ) as RecipeTagEntity;

      // Act
      const result = await recipeTagRepository.read(
        createdRecipeTag.id,
      ) as RecipeTagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(createdRecipeTag.id);
      expect(result.recipe_id).toBe(testRecipe.id);
      expect(result.tag_id).toBe(testTag.id);
    });

    test("should return null for non-existent recipe-tag relationship", async () => {
      // Act
      const result = await recipeTagRepository.read(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("readAll", () => {
    test("should return all recipe-tag relationships", async () => {
      // Arrange
      const recipe1 = await recipeRepository.create({
        name: "Recipe 1",
        servings: "2",
      }) as RecipeEntity;
      const recipe2 = await recipeRepository.create({
        name: "Recipe 2",
        servings: "4",
      }) as RecipeEntity;
      const tag1 = await tagRepository.create({ name: "Tag 1" }) as TagEntity;
      const tag2 = await tagRepository.create({ name: "Tag 2" }) as TagEntity;

      const recipeTag1 = await recipeTagRepository.create({
        recipe_id: recipe1.id,
        tag_id: tag1.id,
      });
      const recipeTag2 = await recipeTagRepository.create({
        recipe_id: recipe1.id,
        tag_id: tag2.id,
      });
      const recipeTag3 = await recipeTagRepository.create({
        recipe_id: recipe2.id,
        tag_id: tag1.id,
      });

      // Act
      const result = await recipeTagRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result).toContainValues([recipeTag1, recipeTag2, recipeTag3]);
    });

    test("should return empty array when no recipe-tag relationships exist", async () => {
      // Act
      const result = await recipeTagRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("update", () => {
    let testRecipe1: RecipeEntity;
    let testRecipe2: RecipeEntity;
    let testTag1: TagEntity;
    let testTag2: TagEntity;

    beforeEach(async () => {
      testRecipe1 = await recipeRepository.create({
        name: "Recipe 1",
        servings: "2",
      }) as RecipeEntity;
      testRecipe2 = await recipeRepository.create({
        name: "Recipe 2",
        servings: "4",
      }) as RecipeEntity;
      testTag1 = await tagRepository.create({ name: "Tag 1" }) as TagEntity;
      testTag2 = await tagRepository.create({ name: "Tag 2" }) as TagEntity;
    });

    test("should update an existing recipe-tag relationship and return the updated entity", async () => {
      // Arrange
      const originalRecipeTag = await recipeTagRepository.create({
        recipe_id: testRecipe1.id,
        tag_id: testTag1.id,
      }) as RecipeTagEntity;

      const updatedData: RecipeTagEntity = {
        ...originalRecipeTag,
        recipe_id: testRecipe2.id,
        tag_id: testTag2.id,
      };

      // Act
      const result = await recipeTagRepository.update(updatedData) as RecipeTagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(originalRecipeTag.id);
      expect(result.recipe_id).toBe(testRecipe2.id);
      expect(result.tag_id).toBe(testTag2.id);
    });

    test("should return null when trying to update non-existent recipe-tag relationship", async () => {
      // Arrange
      const nonExistentRecipeTag: RecipeTagEntity = {
        id: 999,
        recipe_id: testRecipe1.id,
        tag_id: testTag1.id,
      };

      // Act
      const result = await recipeTagRepository.update(nonExistentRecipeTag);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    let testRecipe: RecipeEntity;
    let testTag: TagEntity;

    beforeEach(async () => {
      testRecipe = await recipeRepository.create({
        name: "Test Recipe",
        servings: "4",
      }) as RecipeEntity;
      testTag = await tagRepository.create({ name: "Test Tag" }) as TagEntity;
    });

    test("should delete an existing recipe-tag relationship and return true", async () => {
      // Arrange
      const recipeTag = await recipeTagRepository.create({
        recipe_id: testRecipe.id,
        tag_id: testTag.id,
      }) as RecipeTagEntity;

      // Act
      const result = await recipeTagRepository.delete(recipeTag.id);

      // Assert
      expect(result).toBe(true);

      // Verify recipe-tag is actually deleted
      const deletedRecipeTag = await recipeTagRepository.read(recipeTag.id);
      expect(deletedRecipeTag).toBeNull();
    });

    test("should return false when trying to delete non-existent recipe-tag relationship", async () => {
      // Act
      const result = await recipeTagRepository.delete(999);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("readByRecipeId", () => {
    test("should return all recipe-tag relationships for a given recipe", async () => {
      // Arrange
      const recipe = await recipeRepository.create({
        name: "Tagged Recipe",
        servings: "6",
      }) as RecipeEntity;
      const tag1 = await tagRepository.create({ name: "Italian" }) as TagEntity;
      const tag2 = await tagRepository.create({ name: "Vegetarian" }) as TagEntity;
      const tag3 = await tagRepository.create({ name: "Quick" }) as TagEntity;

      const recipeTag1 = await recipeTagRepository.create({
        recipe_id: recipe.id,
        tag_id: tag1.id,
      });
      const recipeTag2 = await recipeTagRepository.create({
        recipe_id: recipe.id,
        tag_id: tag2.id,
      });
      const recipeTag3 = await recipeTagRepository.create({
        recipe_id: recipe.id,
        tag_id: tag3.id,
      });

      // Act
      const result = await recipeTagRepository.readByRecipeId(recipe.id);

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result).toContainValues([recipeTag1, recipeTag2, recipeTag3]);
    });

    test("should return empty array when recipe has no tags", async () => {
      // Arrange
      const recipe = await recipeRepository.create({
        name: "Untagged Recipe",
        servings: "4",
      }) as RecipeEntity;

      // Act
      const result = await recipeTagRepository.readByRecipeId(recipe.id);

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("readByTagId", () => {
    test("should return all recipe-tag relationships for a given tag", async () => {
      // Arrange
      const tag = await tagRepository.create({ name: "Healthy" }) as TagEntity;
      const recipe1 = await recipeRepository.create({
        name: "Salad",
        servings: "2",
      }) as RecipeEntity;
      const recipe2 = await recipeRepository.create({
        name: "Smoothie",
        servings: "1",
      }) as RecipeEntity;
      const recipe3 = await recipeRepository.create({
        name: "Soup",
        servings: "4",
      }) as RecipeEntity;

      const recipeTag1 = await recipeTagRepository.create({
        recipe_id: recipe1.id,
        tag_id: tag.id,
      });
      const recipeTag2 = await  recipeTagRepository.create({
        recipe_id: recipe2.id,
        tag_id: tag.id,
      });
      const recipeTag3 = await recipeTagRepository.create({
        recipe_id: recipe3.id,
        tag_id: tag.id,
      });

      // Act
      const result = await recipeTagRepository.readByTagId(tag.id);

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result).toContainValues([recipeTag1, recipeTag2, recipeTag3]);
    });

    test("should return empty array when tag is not used by any recipes", async () => {
      // Arrange
      const unusedTag = await tagRepository.create({ name: "Unused" }) as TagEntity;

      // Act
      const result = await recipeTagRepository.readByTagId(unusedTag.id);

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("deleteByRecipeId", () => {
    test("should return false when recipe has no associated tags", async () => {
      // Arrange
      const recipe = await recipeRepository.create({
        name: "Untagged Recipe",
        servings: "4",
      }) as RecipeEntity;

      // Act
      const result = await recipeTagRepository.deleteByRecipeId(recipe.id);

      // Assert
      expect(result).toBe(false);
    });

    test("should return true and remove all tags for a recipe", async () => {
      // Arrange
      const recipe = await recipeRepository.create({
        name: "Multi-Tagged Recipe",
        servings: "8",
      }) as RecipeEntity;
      const tag1 = await tagRepository.create({ name: "Dessert" }) as TagEntity;
      const tag2 = await tagRepository.create({ name: "Chocolate" }) as TagEntity;
      const tag3 = await tagRepository.create({ name: "Party" }) as TagEntity;

      await recipeTagRepository.create({ recipe_id: recipe.id, tag_id: tag1.id });
      await recipeTagRepository.create({ recipe_id: recipe.id, tag_id: tag2.id });
      await recipeTagRepository.create({ recipe_id: recipe.id, tag_id: tag3.id });

      // Verify tags exist before deletion
      expect(await recipeTagRepository.readByRecipeId(recipe.id)).toBeArrayOfSize(3);

      // Act
      const result = await recipeTagRepository.deleteByRecipeId(recipe.id);

      // Assert
      expect(result).toBe(true);
      expect(await recipeTagRepository.readByRecipeId(recipe.id)).toBeArrayOfSize(0);
    });

    test("should only delete tags for specified recipe", async () => {
      // Arrange
      const recipe1 = await recipeRepository.create({
        name: "Recipe 1",
        servings: "4",
      }) as RecipeEntity;
      const recipe2 = await recipeRepository.create({
        name: "Recipe 2",
        servings: "6",
      }) as RecipeEntity;
      const tag = await tagRepository.create({ name: "Shared Tag" }) as TagEntity;

      await recipeTagRepository.create({ recipe_id: recipe1.id, tag_id: tag.id });
      await recipeTagRepository.create({ recipe_id: recipe2.id, tag_id: tag.id });

      // Act
      const result = await recipeTagRepository.deleteByRecipeId(recipe1.id);

      // Assert
      expect(result).toBe(true);
      expect(await recipeTagRepository.readByRecipeId(recipe1.id)).toBeArrayOfSize(0);
      expect(await recipeTagRepository.readByRecipeId(recipe2.id)).toBeArrayOfSize(1);
    });
  });

  describe("readByRecipeAndTag", () => {
    let testRecipe: RecipeEntity;
    let testTag: TagEntity;

    beforeEach(async () => {
      testRecipe = await recipeRepository.create({
        name: "Test Recipe",
        servings: "4",
      }) as RecipeEntity;
      testTag = await tagRepository.create({ name: "Test Tag" }) as TagEntity;
    });

    test("should find existing recipe-tag relationship", async () => {
      // Arrange
      const recipeTag = await recipeTagRepository.create({
        recipe_id: testRecipe.id,
        tag_id: testTag.id,
      }) as RecipeTagEntity;

      // Act
      const result = await recipeTagRepository.readByRecipeAndTag(
        testRecipe.id,
        testTag.id,
      );

      // Assert
      expect(result).not.toBeNull();
      expect(result!.id).toBe(recipeTag.id);
      expect(result!.recipe_id).toBe(testRecipe.id);
      expect(result!.tag_id).toBe(testTag.id);
    });

    test("should return null when relationship does not exist", async () => {
      // Act
      const result = await recipeTagRepository.readByRecipeAndTag(
        testRecipe.id,
        testTag.id,
      );

      // Assert
      expect(result).toBeNull();
    });

    test("should return null for non-existent recipe or tag ids", async () => {
      // Act
      const result1 = await recipeTagRepository.readByRecipeAndTag(999, testTag.id);
      const result2 = await recipeTagRepository.readByRecipeAndTag(
        testRecipe.id,
        999,
      );
      const result3 = await recipeTagRepository.readByRecipeAndTag(999, 999);

      // Assert
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      expect(result3).toBeNull();
    });
  });
});
