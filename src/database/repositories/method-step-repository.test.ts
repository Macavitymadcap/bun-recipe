import {
  describe,
  test,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
} from "bun:test";
import {
  MethodStepEntity,
  MethodStepRepository,
} from "./method-step-repository";
import { DB_CONFIG } from "../config";
import { DbContext } from "../context/context";

const samplemethodStep = (
  overrides: Partial<Omit<MethodStepEntity, "id">> = {},
): Omit<MethodStepEntity, "id"> => ({
  recipe_id: 1,
  instruction: "Concussa lactis omnos pueros ad aream ferat.",
  order_index: 1,
  ...overrides,
});

describe("MethodStepRepository", () => {
  let methodStepRepository: MethodStepRepository;

  beforeAll(() => {
    (DbContext as any).instance = undefined; // Reset singleton instance before tests
    methodStepRepository = new MethodStepRepository(DB_CONFIG.inMemoryPath);
  });

  afterAll(() => {
    try {
      methodStepRepository.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
    (DbContext as any).instance = undefined; // Reset singleton instance after tests
  });

  beforeEach(() => {
    // Clean up any existing methodSteps before each test
    const allmethodSteps = methodStepRepository.readAll();
    allmethodSteps.forEach((methodStep) =>
      methodStepRepository.delete(methodStep.id),
    );
  });

  test("should create the methodSteps table on init", () => {
    // Table creation is implicit; just ensure no error on instantiation
    expect(methodStepRepository).toBeInstanceOf(MethodStepRepository);
  });

  describe("create", () => {
    test("should create a new MethodStep and return the created entity with an id", () => {
      // Arrange
      const methodStepData = samplemethodStep();

      // Act
      const result = methodStepRepository.create(
        methodStepData,
      ) as MethodStepEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBeTypeOf("number");
      expect(result.id).toBeGreaterThan(0);
      expect(result.recipe_id).toBe(methodStepData.recipe_id);
      expect(result.instruction).toBe(methodStepData.instruction);
    });

    test("should create multiple MethodSteps with unique ids", () => {
      // Arrange
      const methodStep1Data = samplemethodStep({
        instruction: "Instruction 1",
      }) as MethodStepEntity;
      const methodStep2Data = samplemethodStep({
        instruction: "Instruction 2",
      }) as MethodStepEntity;

      // Act
      const methodStep1 = methodStepRepository.create(
        methodStep1Data,
      ) as MethodStepEntity;
      const methodStep2 = methodStepRepository.create(
        methodStep2Data,
      ) as MethodStepEntity;

      // Assert
      expect(methodStep1).not.toBeNull();
      expect(methodStep2).not.toBeNull();
      expect(methodStep1.id).not.toBe(methodStep2.id);
      expect(methodStep2.id).toBeGreaterThan(methodStep1.id);
      expect(methodStep1.recipe_id).toBe(methodStep1Data.recipe_id);
      expect(methodStep2.recipe_id).toBe(methodStep2Data.recipe_id);
      expect(methodStep1.instruction).toBe(methodStep1Data.instruction);
      expect(methodStep2.instruction).toBe(methodStep2Data.instruction);
    });
  });

  describe("read", () => {
    test("should read an existing MethodStep by id", () => {
      // Arrange
      const methodStepData = samplemethodStep();
      const createdmethodStep = methodStepRepository.create(
        methodStepData,
      ) as MethodStepEntity;

      // Act
      const result = methodStepRepository.read(
        createdmethodStep.id,
      ) as MethodStepEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(createdmethodStep.id);
      expect(result.recipe_id).toBe(createdmethodStep.recipe_id);
      expect(result.instruction).toBe(methodStepData.instruction);
    });

    test("should return null for non-existent MethodStep", () => {
      // Act
      const result = methodStepRepository.read(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("readAll", () => {
    test("should return all MethodSteps ordered by name", () => {
      // Arrange
      const methodStep1 = methodStepRepository.create(
        samplemethodStep({ instruction: "Instruction 1" }),
      );
      const methodStep2 = methodStepRepository.create(
        samplemethodStep({ instruction: "Instruction 2", order_index: 2 }),
      );
      const methodStep3 = methodStepRepository.create(
        samplemethodStep({ instruction: "Instruction 3", order_index: 3 }),
      );

      // Act
      const result = methodStepRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(3);
    });

    test("should return an empty array when no MethodSteps exist", () => {
      // Act
      const result = methodStepRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("update", () => {
    test("should update an existing MethodStep and return the updated entity", () => {
      // Arrange
      const originalmethodStep = methodStepRepository.create(
        samplemethodStep(),
      ) as MethodStepEntity;
      const updatedData: MethodStepEntity = {
        ...originalmethodStep!,
        instruction: "Lorem ispum dolor sit amet.",
      };

      // Act
      const result = methodStepRepository.update(
        updatedData,
      ) as MethodStepEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(originalmethodStep.id);
      expect(result.recipe_id).toBe(originalmethodStep.recipe_id);
      expect(result.instruction).toBe(updatedData.instruction);
    });

    test("should return null when trying to update a non-existant methodStep", () => {
      // Arrange
      const nonExistentmethodStep: MethodStepEntity = {
        id: 999,
        recipe_id: 999,
        instruction: "non-existant",
        order_index: 999,
      };

      // Act
      const result = methodStepRepository.update(nonExistentmethodStep);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    test("should delete an existing methodStep and return true", () => {
      // Arrange
      const methodStep = methodStepRepository.create(
        samplemethodStep(),
      ) as MethodStepEntity;

      // Act
      const result = methodStepRepository.delete(methodStep.id);

      // Assert
      expect(result).toBe(true);

      // Verify methodStep is actually deleted
      const deletedmethodStep = methodStepRepository.read(methodStep.id);
      expect(deletedmethodStep).toBeNull();
    });

    test("should return false when when trying to delete a non-existant methodStep", () => {
      // Arrange
      const nonExistantId = 999;

      // Act
      const result = methodStepRepository.delete(nonExistantId);

      // Assert
      expect(result).toBe(false);
    });

    test("should handle deleting all methodSteps", () => {
      // Arrange
      methodStepRepository.create(
        samplemethodStep({ instruction: "Instruction 1 of Recipe 1" }),
      );
      methodStepRepository.create(
        samplemethodStep({
          recipe_id: 2,
          instruction: "Instruction 1 of Recipe 2",
        }),
      );
      methodStepRepository.create(
        samplemethodStep({
          recipe_id: 3,
          instruction: "Instruction 1 of Recipe 3",
        }),
      );

      const allMethodSteps = methodStepRepository.readAll();

      // Act
      allMethodSteps.forEach((methodStep) => {
        const deleted = methodStepRepository.delete(methodStep.id);
        expect(deleted).toBe(true);
      });

      // Assert
      const remainingMethodSteps = methodStepRepository.readAll();
      expect(remainingMethodSteps).toBeArrayOfSize(0);
    });
  });

  describe("readByRecipeId", () => {
    test("should return all MethodSteps that have the given recipe_id", () => {
      // Arrange
      const recipeId = 30;
      const methodStep1 = methodStepRepository.create(
        samplemethodStep({ recipe_id: recipeId, instruction: "Instruction 1" }),
      );
      const methodStep2 = methodStepRepository.create(
        samplemethodStep({
          recipe_id: recipeId,
          instruction: "Instruction 2",
          order_index: 2,
        }),
      );
      const methodStep3 = methodStepRepository.create(
        samplemethodStep({
          recipe_id: recipeId,
          instruction: "Instruction 3",
          order_index: 3,
        }),
      );

      // Act
      const result = methodStepRepository.readByRecipeId(recipeId);

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result).toContainValues([methodStep1, methodStep2, methodStep3]);
    });

    test("should return an empty array when given a recipe_id with no associated MethodSteps", () => {
      // Arrange
      const nonExistantRecipeId = 50;

      // Act
      const result = methodStepRepository.readByRecipeId(nonExistantRecipeId);

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("deleteByRecipeId", () => {
    test("should return false when given a recipe_id with no associated MethodSteps", () => {
      // Arrange
      const nonExistantRecipeId = 55;

      // Act
      const result = methodStepRepository.deleteByRecipeId(nonExistantRecipeId);

      // Assert
      expect(result).toBe(false);
    });

    test("should return true and remove entities from the database when given a recipe_id with associated MethodSteps", () => {
      // Arrange
      const recipeId = 76;
      const methodSteps = [
        samplemethodStep({
          recipe_id: recipeId,
          instruction: "Cook's instruction 1 of Recipe 76",
        }),
        samplemethodStep({
          recipe_id: recipeId,
          instruction: "Cook's instruction 2 of Recipe 76",
          order_index: 2,
        }),
        samplemethodStep({
          recipe_id: recipeId,
          instruction: "Cook's instruction 3 of Recipe 76",
          order_index: 3,
        }),
      ];
      methodSteps.forEach((methodStep) =>
        methodStepRepository.create(methodStep),
      );

      // Act
      const result = methodStepRepository.deleteByRecipeId(recipeId);

      // Assert
      expect(result).toBe(true);

      // Verify deletion of MethodSteps
      const remainingMethodSteps =
        methodStepRepository.readByRecipeId(recipeId);
      expect(remainingMethodSteps).toBeArrayOfSize(0);
    });
  });
});
