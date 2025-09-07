import { describe, test, expect, beforeEach, mock, jest } from "bun:test";
import {
  RecipeService,
  CompleteRecipe,
  CreateRecipeData,
} from "./recipe-service";
import { DbContext } from "../../database/context/context";
import { CooksNoteEntity, CooksNoteRepository } from "../repositories/cooks-note-repository";
import { IngredientEntity, IngredientRepository } from "../repositories/ingredient-repository";
import { DirectionEntity, DirectionRepository } from "../repositories/direction-repository";
import { RecipeRepository } from "../repositories/recipe-repository";
import { RecipeTagEntity, RecipeTagRepository } from "../repositories/recipe-tag-repository";
import { TagEntity, TagRepository } from "../repositories/tag-repository";

describe("RecipeService", () => {
  let recipeService: RecipeService;
  let mockRecipeRepository: Partial<RecipeRepository>;
  let mockIngredientRepository: Partial<IngredientRepository>;
  let mockDirectionRepository: Partial<DirectionRepository>;
  let mockCooksNoteRepository: Partial<CooksNoteRepository>;
  let mockTagRepository: Partial<TagRepository>;
  let mockRecipeTagRepository: Partial<RecipeTagRepository>;
  let mockDbContext: Partial<DbContext>;

  const sampleRecipe = {
    id: 1,
    name: "Test Recipe",
    servings: "4-6",
    calories_per_serving: 350,
    preparation_time: "30 minutes",
    cooking_time: "1 hour",
    created_at: 1640995200, // Unix timestamp
    updated_at: 1640995200,
  };

  const sampleIngredients: IngredientEntity[] = [
    {
      id: 1,
      recipe_id: 1,
      quantity: "2",
      unit: "cups",
      name: "flour",
      order_index: 0,
    },
    {
      id: 2,
      recipe_id: 1,
      quantity: "1",
      unit: "cup",
      name: "sugar",
      order_index: 1,
    },
  ];

  const sampleDirections: DirectionEntity[] = [
    { id: 1, recipe_id: 1, order_index: 1, instruction: "Mix dry ingredients" },
    { id: 2, recipe_id: 1, order_index: 2, instruction: "Bake for 30 minutes" },
  ];

  const sampleCooksNotes: CooksNoteEntity[] = [
    { id: 1, recipe_id: 1, note: "Can substitute honey for sugar" },
    { id: 2, recipe_id: 1, note: "Best served warm" },
  ];

  const sampleTags: TagEntity[] = [
    { id: 1, name: "Dessert" },
    { id: 2, name: "Easy" },
  ];

  const sampleRecipeTags: RecipeTagEntity[] = [
    { id: 1, recipe_id: 1, tag_id: 1 },
    { id: 2, recipe_id: 1, tag_id: 2 },
  ];

  beforeEach(() => {
    // Reset all mocks with async functions
    mockRecipeRepository = {
      create: mock(async () => sampleRecipe),
      read: mock(async () => sampleRecipe),
      update: mock(async () => sampleRecipe),
      delete: mock(async () => true),
      searchByName: mock(async () => [sampleRecipe]),
      getTotalRecipeCount: mock(async () => 1),
    };

    mockIngredientRepository = {
      create: mock(async () => sampleIngredients[0]),
      read: mock(async () => sampleIngredients[0]),
      update: mock(async () => sampleIngredients[0]),
      delete: mock(async () => true),
      readByRecipeId: mock(async () => sampleIngredients),
      deleteByRecipeId: mock(async () => true),
    };

    mockDirectionRepository = {
      create: mock(async () => sampleDirections[0]),
      read: mock(async () => sampleDirections[0]),
      update: mock(async () => sampleDirections[0]),
      delete: mock(async () => true),
      readByRecipeId: mock(async () => sampleDirections),
      deleteByRecipeId: mock(async () => true),
    };

    mockCooksNoteRepository = {
      create: mock(async () => sampleCooksNotes[0]),
      read: mock(async () => sampleCooksNotes[0]),
      update: mock(async () => sampleCooksNotes[0]),
      delete: mock(async () => true),
      readByRecipeId: mock(async () => sampleCooksNotes),
      deleteByRecipeId: mock(async () => true),
    };

    mockTagRepository = {
      create: mock(async () => sampleTags[0]),
      read: mock(async (id: number) => sampleTags.find((t) => t.id === id) || null),
      update: mock(async () => sampleTags[0]),
      delete: mock(async () => true),
      createOrRead: mock(async (name: string) =>
        sampleTags.find((t) => t.name === name) || { id: 3, name },
      ),
      readByName: mock(async (name: string) => 
        sampleTags.find((t) => t.name === name) || null,
      ),
      readAll: mock(async () => sampleTags),
    };

    mockRecipeTagRepository = {
      create: mock(async () => sampleRecipeTags[0]),
      read: mock(async () => sampleRecipeTags[0]),
      update: mock(async () => sampleRecipeTags[0]),
      delete: mock(async () => true),
      readByRecipeId: mock(async () => sampleRecipeTags),
      readByTagId: mock(async (tagId: number) =>
        sampleRecipeTags.filter((rt) => rt.tag_id === tagId),
      ),
      readByRecipeAndTag: mock(async () => sampleRecipeTags[0]),
      deleteByRecipeId: mock(async () => true),
      getRecipeCountForTag: mock(async () => 2),
    };

    mockDbContext = {
      transaction: mock(async (callback: () => any) => await callback()),
    };

    recipeService = new RecipeService(
      mockRecipeRepository as RecipeRepository,
      mockIngredientRepository as IngredientRepository,
      mockDirectionRepository as DirectionRepository,
      mockCooksNoteRepository as CooksNoteRepository,
      mockTagRepository as TagRepository,
      mockRecipeTagRepository as RecipeTagRepository,
      mockDbContext as DbContext,
    );
  });

  describe("getCompleteRecipe", () => {
    test("should return complete recipe with all related data", async () => {
      // Act
      const result = await recipeService.getCompleteRecipe(1);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
      expect(result!.name).toBe("Test Recipe");
      expect(result!.ingredients).toEqual(sampleIngredients);
      expect(result!.directions).toEqual(sampleDirections);
      expect(result!.cooksNotes).toEqual([
        "Can substitute honey for sugar",
        "Best served warm",
      ]);
      expect(result!.tags).toEqual(["Dessert", "Easy"]);

      // Verify repository calls
      expect(mockRecipeRepository.read).toHaveBeenCalledWith(1);
      expect(mockIngredientRepository.readByRecipeId).toHaveBeenCalledWith(1);
      expect(mockDirectionRepository.readByRecipeId).toHaveBeenCalledWith(1);
      expect(mockCooksNoteRepository.readByRecipeId).toHaveBeenCalledWith(1);
      expect(mockRecipeTagRepository.readByRecipeId).toHaveBeenCalledWith(1);
    });

    test("should return null when recipe does not exist", async () => {
      // Arrange
      mockRecipeRepository.read = mock(async () => null);

      // Act
      const result = await recipeService.getCompleteRecipe(999);

      // Assert
      expect(result).toBeNull();
      expect(mockRecipeRepository.read).toHaveBeenCalledWith(999);
    });

    test("should handle recipes with no tags", async () => {
      // Arrange
      mockRecipeTagRepository.readByRecipeId = mock(async () => []);

      // Act
      const result = await recipeService.getCompleteRecipe(1);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.tags).toEqual([]);
    });

    test("should filter out null tags", async () => {
      // Arrange
      mockTagRepository.read = mock(async (id: number) =>
        id === 1 ? sampleTags[0] : null,
      );

      // Act
      const result = await recipeService.getCompleteRecipe(1);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.tags).toEqual(["Dessert"]);
    });
  });

  describe("createCompleteRecipe", () => {
    const createRecipeData: CreateRecipeData = {
      name: "New Recipe",
      servings: "4",
      calories_per_serving: 300,
      preparation_time: "20 minutes",
      cooking_time: "45 minutes",
      ingredients: [
        { quantity: "2", unit: "cups", name: "flour" },
        { quantity: "1", unit: "cup", name: "milk" },
      ],
      directions: [{ instruction: "Mix ingredients" }, { instruction: "Bake" }],
      cooksNotes: ["Preheat oven", "Cool before serving"],
      tags: ["Dessert", "Easy"],
    };

    test("should create complete recipe with all components", async () => {
      // Arrange
      const getCompleteRecipeSpy = jest.spyOn(
        recipeService,
        "getCompleteRecipe",
      );
      getCompleteRecipeSpy.mockResolvedValue({
        ...sampleRecipe,
        ingredients: sampleIngredients,
        directions: sampleDirections,
        cooksNotes: ["Preheat oven", "Cool before serving"],
        tags: ["Dessert", "Easy"],
      } as CompleteRecipe);

      // Act
      const result = await recipeService.createCompleteRecipe(createRecipeData);

      // Assert
      expect(result).not.toBeNull();
      expect(mockDbContext.transaction).toHaveBeenCalled();
      expect(mockRecipeRepository.create).toHaveBeenCalledWith({
        name: "New Recipe",
        servings: "4",
        calories_per_serving: 300,
        preparation_time: "20 minutes",
        cooking_time: "45 minutes",
      });

      // Verify ingredients creation - should be called through Promise.all
      expect(mockIngredientRepository.create).toHaveBeenCalledTimes(2);

      // Verify directions creation - should be called through Promise.all
      expect(mockDirectionRepository.create).toHaveBeenCalledTimes(2);

      // Verify cook's notes creation
      expect(mockCooksNoteRepository.create).toHaveBeenCalledTimes(2);

      // Verify tags creation
      expect(mockTagRepository.createOrRead).toHaveBeenCalledTimes(2);
      expect(mockRecipeTagRepository.create).toHaveBeenCalledTimes(2);

      getCompleteRecipeSpy.mockRestore();
    });

    test("should return null when recipe creation fails", async () => {
      // Arrange
      mockRecipeRepository.create = mock(async () => null);

      // Act
      const result = await recipeService.createCompleteRecipe(createRecipeData);

      // Assert
      expect(result).toBeNull();
      expect(mockIngredientRepository.create).not.toHaveBeenCalled();
    });

    test("should handle recipe without optional fields", async () => {
      // Arrange
      const minimalRecipeData: CreateRecipeData = {
        name: "Simple Recipe",
        servings: "2",
        ingredients: [{ quantity: "1", name: "egg" }],
        directions: [{ instruction: "Cook egg" }],
      };

      const getCompleteRecipeSpy = jest.spyOn(
        recipeService,
        "getCompleteRecipe",
      );
      getCompleteRecipeSpy.mockResolvedValue({
        ...sampleRecipe,
        ingredients: [
          { id: 1, recipe_id: 1, quantity: "1", name: "egg", order_index: 0 },
        ],
        directions: [
          { id: 1, recipe_id: 1, order_index: 1, instruction: "Cook egg" },
        ],
        cooksNotes: [],
        tags: [],
      } as CompleteRecipe);

      // Act
      const result = await recipeService.createCompleteRecipe(minimalRecipeData);

      // Assert
      expect(result).not.toBeNull();
      // Cook's notes and tags should not be created for minimal recipe
      expect(mockCooksNoteRepository.create).not.toHaveBeenCalled();
      expect(mockTagRepository.createOrRead).not.toHaveBeenCalled();

      getCompleteRecipeSpy.mockRestore();
    });

    test("should continue creating tags even if one fails", async () => {
      // Arrange
      mockTagRepository.createOrRead = mock(async (name: string) =>
        name === "Dessert" ? null : { id: 2, name },
      );

      const getCompleteRecipeSpy = jest.spyOn(
        recipeService,
        "getCompleteRecipe",
      );
      getCompleteRecipeSpy.mockResolvedValue({
        ...sampleRecipe,
        ingredients: sampleIngredients,
        directions: sampleDirections,
        cooksNotes: ["Preheat oven", "Cool before serving"],
        tags: ["Easy"],
      } as CompleteRecipe);

      // Act
      const result = await recipeService.createCompleteRecipe(createRecipeData);

      // Assert
      expect(result).not.toBeNull();
      // Only one tag should be created successfully
      expect(mockRecipeTagRepository.create).toHaveBeenCalledTimes(1);

      getCompleteRecipeSpy.mockRestore();
    });
  });

  describe("updateCompleteRecipe", () => {
    const updateRecipeData: CreateRecipeData = {
      name: "Updated Recipe",
      servings: "6-8",
      calories_per_serving: 400,
      preparation_time: "40 minutes",
      cooking_time: "1.5 hours",
      ingredients: [
        { quantity: "3", unit: "cups", name: "flour" },
        { quantity: "2", unit: "cups", name: "milk" },
      ],
      directions: [
        { instruction: "Updated step 1" },
        { instruction: "Updated step 2" },
      ],
      cooksNotes: ["Updated note"],
      tags: ["Updated", "Tag"],
    };

    test("should update complete recipe successfully", async () => {
      // Arrange
      const getCompleteRecipeSpy = jest.spyOn(
        recipeService,
        "getCompleteRecipe",
      );
      getCompleteRecipeSpy.mockResolvedValue({
        ...sampleRecipe,
        name: "Updated Recipe",
        servings: "6-8",
        ingredients: sampleIngredients,
        directions: sampleDirections,
        cooksNotes: ["Updated note"],
        tags: ["Updated", "Tag"],
      } as CompleteRecipe);

      // Act
      const result = await recipeService.updateCompleteRecipe(1, updateRecipeData);

      // Assert
      expect(result).not.toBeNull();
      expect(mockDbContext.transaction).toHaveBeenCalled();
      expect(mockRecipeRepository.read).toHaveBeenCalledWith(1);
      expect(mockRecipeRepository.update).toHaveBeenCalled();

      // With smart update, it should read existing constituents
      expect(mockIngredientRepository.readByRecipeId).toHaveBeenCalledWith(1);
      expect(mockDirectionRepository.readByRecipeId).toHaveBeenCalledWith(1);
      expect(mockCooksNoteRepository.readByRecipeId).toHaveBeenCalledWith(1);
      expect(mockRecipeTagRepository.readByRecipeId).toHaveBeenCalledWith(1);

      getCompleteRecipeSpy.mockRestore();
    });

    test("should return null when recipe does not exist", async () => {
      // Arrange
      mockRecipeRepository.read = mock(async () => null);

      // Act
      const result = await recipeService.updateCompleteRecipe(999, updateRecipeData);

      // Assert
      expect(result).toBeNull();
      expect(mockRecipeRepository.update).not.toHaveBeenCalled();
    });

    test("should return null when recipe update fails", async () => {
      // Arrange
      mockRecipeRepository.update = mock(async () => null);

      // Act
      const result = await recipeService.updateCompleteRecipe(1, updateRecipeData);

      // Assert
      expect(result).toBeNull();
    });

    test("should handle update without optional fields", async () => {
      // Arrange
      const minimalUpdateData: CreateRecipeData = {
        name: "Simple Updated Recipe",
        servings: "2",
        ingredients: [{ quantity: "1", name: "egg" }],
        directions: [{ instruction: "Cook egg differently" }],
      };

      const getCompleteRecipeSpy = jest.spyOn(
        recipeService,
        "getCompleteRecipe",
      );
      getCompleteRecipeSpy.mockResolvedValue({
        ...sampleRecipe,
        name: "Simple Updated Recipe",
        ingredients: [
          { id: 1, recipe_id: 1, quantity: "1", name: "egg", order_index: 0 },
        ],
        directions: [
          {
            id: 1,
            recipe_id: 1,
            order_index: 1,
            instruction: "Cook egg differently",
          },
        ],
        cooksNotes: [],
        tags: [],
      } as CompleteRecipe);

      // Mock empty arrays for existing constituents
      mockCooksNoteRepository.readByRecipeId = mock(async () => []);
      mockRecipeTagRepository.readByRecipeId = mock(async () => []);

      // Act
      const result = await recipeService.updateCompleteRecipe(1, minimalUpdateData);

      // Assert
      expect(result).not.toBeNull();

      getCompleteRecipeSpy.mockRestore();
    });
  });

  describe("deleteCompleteRecipe", () => {
    test("should delete recipe successfully", async () => {
      // Act
      const result = await recipeService.deleteCompleteRecipe(1);

      // Assert
      expect(result).toBe(true);
      expect(mockRecipeRepository.delete).toHaveBeenCalledWith(1);
    });

    test("should return false when deletion fails", async () => {
      // Arrange
      mockRecipeRepository.delete = mock(async () => false);

      // Act
      const result = await recipeService.deleteCompleteRecipe(999);

      // Assert
      expect(result).toBe(false);
      expect(mockRecipeRepository.delete).toHaveBeenCalledWith(999);
    });
  });

  describe("searchRecipesByTag", () => {
    test("should return recipes with specified tag", async () => {
      // Act
      const result = await recipeService.searchRecipesByTag("Dessert");

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ...sampleRecipe,
        ingredients: sampleIngredients,
        directions: sampleDirections,
        cooksNotes: ["Can substitute honey for sugar", "Best served warm"],
        tags: ["Dessert", "Easy"],
      });
      expect(mockTagRepository.readByName).toHaveBeenCalledWith("Dessert");
      expect(mockRecipeTagRepository.readByTagId).toHaveBeenCalledWith(1);
    });

    test("should return empty array when tag does not exist", async () => {
      // Arrange
      mockTagRepository.readByName = mock(async () => null);

      // Act
      const result = await recipeService.searchRecipesByTag("NonExistent");

      // Assert
      expect(result).toEqual([]);
      expect(mockRecipeTagRepository.readByTagId).not.toHaveBeenCalled();
    });

    test("should filter out null recipes", async () => {
      // Arrange
      mockRecipeRepository.read = mock(async (id: number) =>
        id === 1 ? sampleRecipe : null,
      );
      mockRecipeTagRepository.readByTagId = mock(async () => [
        { id: 1, recipe_id: 1, tag_id: 1 },
        { id: 2, recipe_id: 999, tag_id: 1 },
      ]);

      // Act
      const result = await recipeService.searchRecipesByTag("Dessert");

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    test("should return empty array when no recipes have the tag", async () => {
      // Arrange
      mockRecipeTagRepository.readByTagId = mock(async () => []);

      // Act
      const result = await recipeService.searchRecipesByTag("Dessert");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("searchRecipesByName", () => {
    test("should return recipes matching search term", async () => {
      // Arrange
      const searchResults = [
        { ...sampleRecipe, name: "Chocolate Cake" },
        { ...sampleRecipe, id: 2, name: "Chocolate Brownies" },
      ];
      mockRecipeRepository.searchByName = mock(async () => searchResults);

      // Act
      const result = await recipeService.searchRecipesByName("Chocolate");

      // Assert
      expect(result).toEqual([
        {
          ...searchResults[0],
          ingredients: sampleIngredients,
          directions: sampleDirections,
          cooksNotes: ["Can substitute honey for sugar", "Best served warm"],
          tags: ["Dessert", "Easy"],
        },
        {
          ...searchResults[1],
          ingredients: sampleIngredients,
          directions: sampleDirections,
          cooksNotes: ["Can substitute honey for sugar", "Best served warm"],
          tags: ["Dessert", "Easy"],
        },
      ]);
      expect(mockRecipeRepository.searchByName).toHaveBeenCalledWith(
        "Chocolate",
      );
    });

    test("should return empty array when no matches found", async () => {
      // Arrange
      mockRecipeRepository.searchByName = mock(async () => []);

      // Act
      const result = await recipeService.searchRecipesByName("NoMatch");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getAllTags", () => {
    test("should return all tags", async () => {
      // Act
      const result = await recipeService.getAllTags();

      // Assert
      expect(result).toEqual(sampleTags);
      expect(mockTagRepository.readAll).toHaveBeenCalled();
    });

    test("should return empty array when no tags exist", async () => {
      // Arrange
      mockTagRepository.readAll = mock(async () => []);

      // Act
      const result = await recipeService.getAllTags();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getRecipeStatistics", () => {
    test("should return recipe statistics", async () => {
      // Act
      const result = await recipeService.getRecipeStatistics();

      // Assert
      expect(result.totalRecipes).toBe(1);
      expect(result.tagStatistics).toEqual([
        { name: "Dessert", count: 2 },
        { name: "Easy", count: 2 },
      ]);
      expect(mockRecipeRepository.getTotalRecipeCount).toHaveBeenCalled();
      expect(mockTagRepository.readAll).toHaveBeenCalled();
    });
  });
});
