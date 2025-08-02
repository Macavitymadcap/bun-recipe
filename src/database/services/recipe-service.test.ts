import {
  describe,
  test,
  expect,
  beforeEach,
  mock,
  jest,
} from "bun:test";
import {
  RecipeService,
  CompleteRecipe,
  CreateRecipeData,
} from "./recipe-service";
import {
  RecipeRepository,
  IngredientRepository,
  MethodStepRepository,
  CooksNoteRepository,
  TagRepository,
  RecipeTagRepository,
} from "../repositories";
import { DbContext } from "../../database/context";

describe("RecipeService", () => {
  let recipeService: RecipeService;
  let mockRecipeRepository: Partial<RecipeRepository>;
  let mockIngredientRepository: Partial<IngredientRepository>;
  let mockMethodStepRepository: Partial<MethodStepRepository>;
  let mockCooksNoteRepository: Partial<CooksNoteRepository>;
  let mockTagRepository: Partial<TagRepository>;
  let mockRecipeTagRepository: Partial<RecipeTagRepository>;
  let mockDbContext: Partial<DbContext>;

  const sampleRecipe = {
    id: 1,
    name: "Test Recipe",
    servings: "4-6",
    calories_per_portion: 350,
    preparation_time: "30 minutes",
    cooking_time: "1 hour",
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
  };

  const sampleIngredients = [
    { id: 1, recipe_id: 1, quantity: 2, unit: "cups", name: "flour", order_index: 0 },
    { id: 2, recipe_id: 1, quantity: 1, unit: "cup", name: "sugar", order_index: 1 },
  ];

  const sampleMethodSteps = [
    { id: 1, recipe_id: 1, order_index: 1, instruction: "Mix dry ingredients" },
    { id: 2, recipe_id: 1, order_index: 2, instruction: "Bake for 30 minutes" },
  ];

  const sampleCooksNotes = [
    { id: 1, recipe_id: 1, note: "Can substitute honey for sugar" },
    { id: 2, recipe_id: 1, note: "Best served warm" },
  ];

  const sampleTags = [
    { id: 1, name: "Dessert" },
    { id: 2, name: "Easy" },
  ];

  const sampleRecipeTags = [
    { id: 1, recipe_id: 1, tag_id: 1 },
    { id: 2, recipe_id: 1, tag_id: 2 },
  ];

  beforeEach(() => {
    // Reset all mocks
    mockRecipeRepository = {
      create: mock(() => sampleRecipe),
      read: mock(() => sampleRecipe),
      update: mock(() => sampleRecipe),
      delete: mock(() => true),
      searchByName: mock(() => [sampleRecipe]),
    };

    mockIngredientRepository = {
      create: mock(() => sampleIngredients[0]),
      getByRecipeId: mock(() => sampleIngredients),
      deleteByRecipeId: mock(() => true),
    };

    mockMethodStepRepository = {
      create: mock(() => sampleMethodSteps[0]),
      getByRecipeId: mock(() => sampleMethodSteps),
      deleteByRecipeId: mock(() => true),
    };

    mockCooksNoteRepository = {
      create: mock(() => sampleCooksNotes[0]),
      getByRecipeId: mock(() => sampleCooksNotes),
      deleteByRecipeId: mock(() => true),
    };

    mockTagRepository = {
      create: mock(() => sampleTags[0]),
      read: mock((id: number) => sampleTags.find(t => t.id === id) || null),
      createOrFind: mock((name: string) => sampleTags.find(t => t.name === name) || { id: 3, name }),
      findByName: mock((name: string) => sampleTags.find(t => t.name === name) || null),
      readAll: mock(() => sampleTags),
    };

    mockRecipeTagRepository = {
      create: mock(() => sampleRecipeTags[0]),
      getByRecipeId: mock(() => sampleRecipeTags),
      getByTagId: mock((tagId: number) => sampleRecipeTags.filter(rt => rt.tag_id === tagId)),
      deleteByRecipeId: mock(() => true),
    };

    mockDbContext = {
      transaction: mock((callback: () => any) => callback()),
    };

    recipeService = new RecipeService(
      mockRecipeRepository as RecipeRepository,
      mockIngredientRepository as IngredientRepository,
      mockMethodStepRepository as MethodStepRepository,
      mockCooksNoteRepository as CooksNoteRepository,
      mockTagRepository as TagRepository,
      mockRecipeTagRepository as RecipeTagRepository,
      mockDbContext as DbContext,
    );
  });

  describe("getCompleteRecipe", () => {
    test("should return complete recipe with all related data", () => {
      // Act
      const result = recipeService.getCompleteRecipe(1);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
      expect(result!.name).toBe("Test Recipe");
      expect(result!.ingredients).toEqual(sampleIngredients);
      expect(result!.methodSteps).toEqual(sampleMethodSteps);
      expect(result!.cooksNotes).toEqual(["Can substitute honey for sugar", "Best served warm"]);
      expect(result!.tags).toEqual(["Dessert", "Easy"]);

      // Verify repository calls
      expect(mockRecipeRepository.read).toHaveBeenCalledWith(1);
      expect(mockIngredientRepository.getByRecipeId).toHaveBeenCalledWith(1);
      expect(mockMethodStepRepository.getByRecipeId).toHaveBeenCalledWith(1);
      expect(mockCooksNoteRepository.getByRecipeId).toHaveBeenCalledWith(1);
      expect(mockRecipeTagRepository.getByRecipeId).toHaveBeenCalledWith(1);
    });

    test("should return null when recipe does not exist", () => {
      // Arrange
      mockRecipeRepository.read = mock(() => null);

      // Act
      const result = recipeService.getCompleteRecipe(999);

      // Assert
      expect(result).toBeNull();
      expect(mockRecipeRepository.read).toHaveBeenCalledWith(999);
      // Should not call other repositories if recipe doesn't exist
      expect(mockIngredientRepository.getByRecipeId).not.toHaveBeenCalled();
    });

    test("should handle recipes with no tags", () => {
      // Arrange
      mockRecipeTagRepository.getByRecipeId = mock(() => []);

      // Act
      const result = recipeService.getCompleteRecipe(1);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.tags).toEqual([]);
    });

    test("should filter out null tags", () => {
      // Arrange
      mockTagRepository.read = mock((id: number) => id === 1 ? sampleTags[0] : null);

      // Act
      const result = recipeService.getCompleteRecipe(1);

      // Assert
      expect(result).not.toBeNull();
      expect(result!.tags).toEqual(["Dessert"]);
    });
  });

  describe("createCompleteRecipe", () => {
    const createRecipeData: CreateRecipeData = {
      name: "New Recipe",
      servings: "4",
      calories_per_portion: 300,
      preparation_time: "20 minutes",
      cooking_time: "45 minutes",
      ingredients: [
        { quantity: 2, unit: "cups", name: "flour" },
        { quantity: 1, unit: "cup", name: "milk" },
      ],
      method: [
        { instruction: "Mix ingredients" },
        { instruction: "Bake" },
      ],
      cooksNotes: ["Preheat oven", "Cool before serving"],
      tags: ["Dessert", "Easy"],
    };

    test("should create complete recipe with all components", () => {
      // Arrange
      const getCompleteRecipeSpy = jest.spyOn(recipeService, "getCompleteRecipe");
      getCompleteRecipeSpy.mockReturnValue({
        ...sampleRecipe,
        ingredients: sampleIngredients,
        methodSteps: sampleMethodSteps,
        cooksNotes: ["Preheat oven", "Cool before serving"],
        tags: ["Dessert", "Easy"],
      } as CompleteRecipe);

      // Act
      const result = recipeService.createCompleteRecipe(createRecipeData);

      // Assert
      expect(result).not.toBeNull();
      expect(mockDbContext.transaction).toHaveBeenCalled();
      expect(mockRecipeRepository.create).toHaveBeenCalledWith({
        name: "New Recipe",
        servings: "4",
        calories_per_portion: 300,
        preparation_time: "20 minutes",
        cooking_time: "45 minutes",
      });

      // Verify ingredients creation
      expect(mockIngredientRepository.create).toHaveBeenCalledTimes(2);
      expect(mockIngredientRepository.create).toHaveBeenCalledWith({
        recipe_id: 1,
        quantity: 2,
        unit: "cups",
        name: "flour",
        order_index: 0,
      });

      // Verify method steps creation
      expect(mockMethodStepRepository.create).toHaveBeenCalledTimes(2);
      expect(mockMethodStepRepository.create).toHaveBeenCalledWith({
        recipe_id: 1,
        order_index: 1,
        instruction: "Mix ingredients",
      });

      // Verify cook's notes creation
      expect(mockCooksNoteRepository.create).toHaveBeenCalledTimes(2);

      // Verify tags creation
      expect(mockTagRepository.createOrFind).toHaveBeenCalledTimes(2);
      expect(mockRecipeTagRepository.create).toHaveBeenCalledTimes(2);

      getCompleteRecipeSpy.mockRestore();
    });

    test("should return null when recipe creation fails", () => {
      // Arrange
      mockRecipeRepository.create = mock(() => null);

      // Act
      const result = recipeService.createCompleteRecipe(createRecipeData);

      // Assert
      expect(result).toBeNull();
      expect(mockIngredientRepository.create).not.toHaveBeenCalled();
    });

    test("should handle recipe without optional fields", () => {
      // Arrange
      const minimalRecipeData: CreateRecipeData = {
        name: "Simple Recipe",
        servings: "2",
        ingredients: [{ quantity: 1, name: "egg" }],
        method: [{ instruction: "Cook egg" }],
      };

      const getCompleteRecipeSpy = jest.spyOn(recipeService, "getCompleteRecipe");
      getCompleteRecipeSpy.mockReturnValue({
        ...sampleRecipe,
        ingredients: [{ id: 1, recipe_id: 1, quantity: 1, name: "egg", order_index: 0 }],
        methodSteps: [{ id: 1, recipe_id: 1, order_index: 1, instruction: "Cook egg" }],
        cooksNotes: [],
        tags: [],
      } as CompleteRecipe);

      // Act
      const result = recipeService.createCompleteRecipe(minimalRecipeData);

      // Assert
      expect(result).not.toBeNull();
      expect(mockCooksNoteRepository.create).not.toHaveBeenCalled();
      expect(mockTagRepository.createOrFind).not.toHaveBeenCalled();

      getCompleteRecipeSpy.mockRestore();
    });

    test("should continue creating tags even if one fails", () => {
      // Arrange
      mockTagRepository.createOrFind = mock((name: string) => 
        name === "Dessert" ? null : { id: 2, name }
      );

      const getCompleteRecipeSpy = jest.spyOn(recipeService, "getCompleteRecipe");
      getCompleteRecipeSpy.mockReturnValue({
        ...sampleRecipe,
        ingredients: sampleIngredients,
        methodSteps: sampleMethodSteps,
        cooksNotes: ["Preheat oven", "Cool before serving"],
        tags: ["Easy"],
      } as CompleteRecipe);

      // Act
      const result = recipeService.createCompleteRecipe(createRecipeData);

      // Assert
      expect(result).not.toBeNull();
      expect(mockRecipeTagRepository.create).toHaveBeenCalledTimes(1);

      getCompleteRecipeSpy.mockRestore();
    });
  });

  describe("updateCompleteRecipe", () => {
    const updateRecipeData: CreateRecipeData = {
      name: "Updated Recipe",
      servings: "6-8",
      calories_per_portion: 400,
      preparation_time: "40 minutes",
      cooking_time: "1.5 hours",
      ingredients: [
        { quantity: 3, unit: "cups", name: "flour" },
        { quantity: 2, unit: "cups", name: "milk" },
      ],
      method: [
        { instruction: "Updated step 1" },
        { instruction: "Updated step 2" },
      ],
      cooksNotes: ["Updated note"],
      tags: ["Updated", "Tag"],
    };

    test("should update complete recipe successfully", () => {
      // Arrange
      const getCompleteRecipeSpy = jest.spyOn(recipeService, "getCompleteRecipe");
      getCompleteRecipeSpy.mockReturnValue({
        ...sampleRecipe,
        name: "Updated Recipe",
        servings: "6-8",
        ingredients: sampleIngredients,
        methodSteps: sampleMethodSteps,
        cooksNotes: ["Updated note"],
        tags: ["Updated", "Tag"],
      } as CompleteRecipe);

      // Act
      const result = recipeService.updateCompleteRecipe(1, updateRecipeData);

      // Assert
      expect(result).not.toBeNull();
      expect(mockDbContext.transaction).toHaveBeenCalled();
      expect(mockRecipeRepository.read).toHaveBeenCalledWith(1);
      expect(mockRecipeRepository.update).toHaveBeenCalled();

      // Verify deletion of existing related data
      expect(mockIngredientRepository.deleteByRecipeId).toHaveBeenCalledWith(1);
      expect(mockMethodStepRepository.deleteByRecipeId).toHaveBeenCalledWith(1);
      expect(mockCooksNoteRepository.deleteByRecipeId).toHaveBeenCalledWith(1);
      expect(mockRecipeTagRepository.deleteByRecipeId).toHaveBeenCalledWith(1);

      // Verify recreation of related data
      expect(mockIngredientRepository.create).toHaveBeenCalledTimes(2);
      expect(mockMethodStepRepository.create).toHaveBeenCalledTimes(2);
      expect(mockCooksNoteRepository.create).toHaveBeenCalledTimes(1);
      expect(mockTagRepository.createOrFind).toHaveBeenCalledTimes(2);

      getCompleteRecipeSpy.mockRestore();
    });

    test("should return null when recipe does not exist", () => {
      // Arrange
      mockRecipeRepository.read = mock(() => null);

      // Act
      const result = recipeService.updateCompleteRecipe(999, updateRecipeData);

      // Assert
      expect(result).toBeNull();
      expect(mockRecipeRepository.update).not.toHaveBeenCalled();
    });

    test("should return null when recipe update fails", () => {
      // Arrange
      mockRecipeRepository.update = mock(() => null);

      // Act
      const result = recipeService.updateCompleteRecipe(1, updateRecipeData);

      // Assert
      expect(result).toBeNull();
      expect(mockIngredientRepository.deleteByRecipeId).not.toHaveBeenCalled();
    });

    test("should handle update without optional fields", () => {
      // Arrange
      const minimalUpdateData: CreateRecipeData = {
        name: "Simple Updated Recipe",
        servings: "2",
        ingredients: [{ quantity: 1, name: "egg" }],
        method: [{ instruction: "Cook egg differently" }],
      };

      const getCompleteRecipeSpy = jest.spyOn(recipeService, "getCompleteRecipe");
      getCompleteRecipeSpy.mockReturnValue({
        ...sampleRecipe,
        name: "Simple Updated Recipe",
        ingredients: [{ id: 1, recipe_id: 1, quantity: 1, name: "egg", order_index: 0 }],
        methodSteps: [{ id: 1, recipe_id: 1, order_index: 1, instruction: "Cook egg differently" }],
        cooksNotes: [],
        tags: [],
      } as CompleteRecipe);

      // Act
      const result = recipeService.updateCompleteRecipe(1, minimalUpdateData);

      // Assert
      expect(result).not.toBeNull();
      expect(mockCooksNoteRepository.create).not.toHaveBeenCalled();
      expect(mockTagRepository.createOrFind).not.toHaveBeenCalled();

      getCompleteRecipeSpy.mockRestore();
    });
  });

  describe("deleteCompleteRecipe", () => {
    test("should delete recipe successfully", () => {
      // Act
      const result = recipeService.deleteCompleteRecipe(1);

      // Assert
      expect(result).toBe(true);
      expect(mockRecipeRepository.delete).toHaveBeenCalledWith(1);
    });

    test("should return false when deletion fails", () => {
      // Arrange
      mockRecipeRepository.delete = mock(() => false);

      // Act
      const result = recipeService.deleteCompleteRecipe(999);

      // Assert
      expect(result).toBe(false);
      expect(mockRecipeRepository.delete).toHaveBeenCalledWith(999);
    });
  });

  describe("searchRecipesByTag", () => {
    test("should return recipes with specified tag", () => {
      // Act
      const result = recipeService.searchRecipesByTag("Dessert");

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(sampleRecipe);
      expect(mockTagRepository.findByName).toHaveBeenCalledWith("Dessert");
      expect(mockRecipeTagRepository.getByTagId).toHaveBeenCalledWith(1);
    });

    test("should return empty array when tag does not exist", () => {
      // Arrange
      mockTagRepository.findByName = mock(() => null);

      // Act
      const result = recipeService.searchRecipesByTag("NonExistent");

      // Assert
      expect(result).toEqual([]);
      expect(mockRecipeTagRepository.getByTagId).not.toHaveBeenCalled();
    });

    test("should filter out null recipes", () => {
      // Arrange
      mockRecipeRepository.read = mock((id: number) => id === 1 ? sampleRecipe : null);
      mockRecipeTagRepository.getByTagId = mock(() => [
        { id: 1, recipe_id: 1, tag_id: 1 },
        { id: 2, recipe_id: 999, tag_id: 1 },
      ]);

      // Act
      const result = recipeService.searchRecipesByTag("Dessert");

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    test("should return empty array when no recipes have the tag", () => {
      // Arrange
      mockRecipeTagRepository.getByTagId = mock(() => []);

      // Act
      const result = recipeService.searchRecipesByTag("Dessert");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("searchRecipesByName", () => {
    test("should return recipes matching search term", () => {
      // Arrange
      const searchResults = [
        { ...sampleRecipe, name: "Chocolate Cake" },
        { ...sampleRecipe, id: 2, name: "Chocolate Brownies" },
      ];
      mockRecipeRepository.searchByName = mock(() => searchResults);

      // Act
      const result = recipeService.searchRecipesByName("Chocolate");

      // Assert
      expect(result).toEqual(searchResults);
      expect(mockRecipeRepository.searchByName).toHaveBeenCalledWith("Chocolate");
    });

    test("should return empty array when no matches found", () => {
      // Arrange
      mockRecipeRepository.searchByName = mock(() => []);

      // Act
      const result = recipeService.searchRecipesByName("NoMatch");

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe("getAllTags", () => {
    test("should return all tags", () => {
      // Act
      const result = recipeService.getAllTags();

      // Assert
      expect(result).toEqual(sampleTags);
      expect(mockTagRepository.readAll).toHaveBeenCalled();
    });

    test("should return empty array when no tags exist", () => {
      // Arrange
      mockTagRepository.readAll = mock(() => []);

      // Act
      const result = recipeService.getAllTags();

      // Assert
      expect(result).toEqual([]);
    });
  });
});