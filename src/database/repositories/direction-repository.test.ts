import {
  describe,
  test,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
} from "bun:test";
import { DirectionEntity, DirectionRepository } from "./direction-repository";
import { DB_CONFIG, DbConfig } from "../config";
import { DbContext } from "../context/context";

const sampledirection = (
  overrides: Partial<Omit<DirectionEntity, "id">> = {},
): Omit<DirectionEntity, "id"> => ({
  recipe_id: 1,
  instruction: "Concussa lactis omnos pueros ad aream ferat.",
  order_index: 1,
  ...overrides,
});

describe("directionRepository", () => {
  let directionRepository: DirectionRepository;

  beforeAll(() => {
    const testConfig: DbConfig = {
      ...DB_CONFIG,
      database: "recipe_test",
    };

    (DbContext as any).instance = undefined; // Reset singleton instance before tests
    directionRepository = new DirectionRepository(testConfig);
  });

  afterAll(async () => {
    try {
      await directionRepository.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
    (DbContext as any).instance = undefined; // Reset singleton instance after tests
  });

  beforeEach(async () => {
    // Clean up any existing directions before each test
    const alldirections = await directionRepository.readAll();
    alldirections.forEach(
      async (direction) => await directionRepository.delete(direction.id),
    );
  });

  test("should create the directions table on init", () => {
    // Table creation is implicit; just ensure no error on instantiation
    expect(directionRepository).toBeInstanceOf(DirectionRepository);
  });

  describe("create", () => {
    test("should create a new direction and return the created entity with an id", async () => {
      // Arrange
      const directionData = sampledirection();

      // Act
      const result = (await directionRepository.create(
        directionData,
      )) as DirectionEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBeTypeOf("number");
      expect(result.id).toBeGreaterThan(0);
      expect(result.recipe_id).toBe(directionData.recipe_id);
      expect(result.instruction).toBe(directionData.instruction);
    });

    test("should create multiple directions with unique ids", async () => {
      // Arrange
      const direction1Data = sampledirection({
        instruction: "Instruction 1",
      }) as DirectionEntity;
      const direction2Data = sampledirection({
        instruction: "Instruction 2",
      }) as DirectionEntity;

      // Act
      const direction1 = (await directionRepository.create(
        direction1Data,
      )) as DirectionEntity;
      const direction2 = (await directionRepository.create(
        direction2Data,
      )) as DirectionEntity;

      // Assert
      expect(direction1).not.toBeNull();
      expect(direction2).not.toBeNull();
      expect(direction1.id).not.toBe(direction2.id);
      expect(direction2.id).toBeGreaterThan(direction1.id);
      expect(direction1.recipe_id).toBe(direction1Data.recipe_id);
      expect(direction2.recipe_id).toBe(direction2Data.recipe_id);
      expect(direction1.instruction).toBe(direction1Data.instruction);
      expect(direction2.instruction).toBe(direction2Data.instruction);
    });
  });

  describe("read", () => {
    test("should read an existing direction by id", async () => {
      // Arrange
      const directionData = sampledirection();
      const createddirection = (await directionRepository.create(
        directionData,
      )) as DirectionEntity;

      // Act
      const result = (await directionRepository.read(
        createddirection.id,
      )) as DirectionEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(createddirection.id);
      expect(result.recipe_id).toBe(createddirection.recipe_id);
      expect(result.instruction).toBe(directionData.instruction);
    });

    test("should return null for non-existent direction", async () => {
      // Act
      const result = await directionRepository.read(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("readAll", () => {
    test("should return all directions ordered by name", async () => {
      // Arrange
      const direction1 = await directionRepository.create(
        sampledirection({ instruction: "Instruction 1" }),
      );
      const direction2 = await directionRepository.create(
        sampledirection({ instruction: "Instruction 2", order_index: 2 }),
      );
      const direction3 = await directionRepository.create(
        sampledirection({ instruction: "Instruction 3", order_index: 3 }),
      );

      // Act
      const result = await directionRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result).toContainValues([direction1, direction2, direction3]);
    });

    test("should return an empty array when no directions exist", () => {
      // Act
      const result = directionRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("update", () => {
    test("should update an existing direction and return the updated entity", async () => {
      // Arrange
      const originaldirection = (await directionRepository.create(
        sampledirection(),
      )) as DirectionEntity;
      const updatedData: DirectionEntity = {
        ...originaldirection!,
        instruction: "Lorem ispum dolor sit amet.",
      };

      // Act
      const result = (await directionRepository.update(
        updatedData,
      )) as DirectionEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(originaldirection.id);
      expect(result.recipe_id).toBe(originaldirection.recipe_id);
      expect(result.instruction).toBe(updatedData.instruction);
    });

    test("should return null when trying to update a non-existant direction", async () => {
      // Arrange
      const nonExistentdirection: DirectionEntity = {
        id: 999,
        recipe_id: 999,
        instruction: "non-existant",
        order_index: 999,
      };

      // Act
      const result = await directionRepository.update(nonExistentdirection);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    test("should delete an existing direction and return true", async () => {
      // Arrange
      const direction = (await directionRepository.create(
        sampledirection(),
      )) as DirectionEntity;

      // Act
      const result = await directionRepository.delete(direction.id);

      // Assert
      expect(result).toBe(true);

      // Verify direction is actually deleted
      const deleteddirection = directionRepository.read(direction.id);
      expect(deleteddirection).toBeNull();
    });

    test("should return false when when trying to delete a non-existant direction", async () => {
      // Arrange
      const nonExistantId = 999;

      // Act
      const result = await directionRepository.delete(nonExistantId);

      // Assert
      expect(result).toBe(false);
    });

    test("should handle deleting all directions", async () => {
      // Arrange
      await directionRepository.create(
        sampledirection({ instruction: "Instruction 1 of Recipe 1" }),
      );
      await directionRepository.create(
        sampledirection({
          recipe_id: 2,
          instruction: "Instruction 1 of Recipe 2",
        }),
      );
      await directionRepository.create(
        sampledirection({
          recipe_id: 3,
          instruction: "Instruction 1 of Recipe 3",
        }),
      );

      const alldirections = await directionRepository.readAll();

      // Act
      alldirections.forEach(async (direction) => {
        const deleted = await directionRepository.delete(direction.id);
        expect(deleted).toBe(true);
      });

      // Assert
      const remainingdirections = directionRepository.readAll();
      expect(remainingdirections).toBeArrayOfSize(0);
    });
  });

  describe("readByRecipeId", () => {
    test("should return all directions that have the given recipe_id", async () => {
      // Arrange
      const recipeId = 30;
      const direction1 = await directionRepository.create(
        sampledirection({ recipe_id: recipeId, instruction: "Instruction 1" }),
      );
      const direction2 = await directionRepository.create(
        sampledirection({
          recipe_id: recipeId,
          instruction: "Instruction 2",
          order_index: 2,
        }),
      );
      const direction3 = await directionRepository.create(
        sampledirection({
          recipe_id: recipeId,
          instruction: "Instruction 3",
          order_index: 3,
        }),
      );

      // Act
      const result = await directionRepository.readByRecipeId(recipeId);

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result).toContainValues([direction1, direction2, direction3]);
    });

    test("should return an empty array when given a recipe_id with no associated directions", async () => {
      // Arrange
      const nonExistantRecipeId = 50;

      // Act
      const result =
        await directionRepository.readByRecipeId(nonExistantRecipeId);

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("deleteByRecipeId", () => {
    test("should return false when given a recipe_id with no associated directions", async () => {
      // Arrange
      const nonExistantRecipeId = 55;

      // Act
      const result =
        await directionRepository.deleteByRecipeId(nonExistantRecipeId);

      // Assert
      expect(result).toBe(false);
    });

    test("should return true and remove entities from the database when given a recipe_id with associated directions", async () => {
      // Arrange
      const recipeId = 76;
      const directions = [
        sampledirection({
          recipe_id: recipeId,
          instruction: "Cook's instruction 1 of Recipe 76",
        }),
        sampledirection({
          recipe_id: recipeId,
          instruction: "Cook's instruction 2 of Recipe 76",
          order_index: 2,
        }),
        sampledirection({
          recipe_id: recipeId,
          instruction: "Cook's instruction 3 of Recipe 76",
          order_index: 3,
        }),
      ];
      directions.forEach(
        async (direction) => await directionRepository.create(direction),
      );

      // Act
      const result = await directionRepository.deleteByRecipeId(recipeId);

      // Assert
      expect(result).toBe(true);

      // Verify deletion of directions
      const remainingdirections =
        await directionRepository.readByRecipeId(recipeId);
      expect(remainingdirections).toBeArrayOfSize(0);
    });
  });
});
