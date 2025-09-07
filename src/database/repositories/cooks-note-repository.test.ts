import {
  describe,
  test,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
} from "bun:test";
import { CooksNoteEntity, CooksNoteRepository } from "./cooks-note-repository";
import { DB_CONFIG, DbConfig } from "../config";
import { DbContext } from "../context/context";

const samplecooksNote = (
  overrides: Partial<Omit<CooksNoteEntity, "id">> = {},
): Omit<CooksNoteEntity, "id"> => ({
  recipe_id: 1,
  note: "Concussa lactis omnos pueros ad aream ferat.",
  ...overrides,
});

describe("CooksNoteRepository", () => {
  let cooksNoteRepository: CooksNoteRepository;

  beforeAll(() => {
    const testConfig: DbConfig = {
      ...DB_CONFIG, 
      database: "recipe_test"
    };

    (DbContext as any).instance = undefined; // Reset singleton instance before tests
    cooksNoteRepository = new CooksNoteRepository(testConfig);
  });

  afterAll(async () => {
    try {
      await cooksNoteRepository.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
    (DbContext as any).instance = undefined; // Reset singleton instance after tests
  });

  beforeEach(async () => {
    // Clean up any existing cooksNotes before each test
    const allcooksNotes = await  cooksNoteRepository.readAll();
    allcooksNotes.forEach(async (cooksNote) =>
      await cooksNoteRepository.delete(cooksNote.id),
    );
  });

  test("should create the cooksNotes table on init", () => {
    // Table creation is implicit; just ensure no error on instantiation
    expect(cooksNoteRepository).toBeInstanceOf(CooksNoteRepository);
  });

  describe("create", () => {
    test("should create a new CooksNote and return the created entity with an id", async () => {
      // Arrange
      const cooksNoteData = samplecooksNote();

      // Act
      const result = await cooksNoteRepository.create(
        cooksNoteData,
      ) as CooksNoteEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBeTypeOf("number");
      expect(result.id).toBeGreaterThan(0);
      expect(result.recipe_id).toBe(cooksNoteData.recipe_id);
      expect(result.note).toBe(cooksNoteData.note);
    });

    test("should create multiple CooksNotes with unique ids", async () => {
      // Arrange
      const cooksNote1Data = samplecooksNote({
        note: "Cook's Note 1",
      }) as CooksNoteEntity;
      const cooksNote2Data = samplecooksNote({
        note: "Cook's Note 2",
      }) as CooksNoteEntity;

      // Act
      const cooksNote1 = await cooksNoteRepository.create(
        cooksNote1Data,
      ) as CooksNoteEntity;
      const cooksNote2 = await cooksNoteRepository.create(
        cooksNote2Data,
      ) as CooksNoteEntity;

      // Assert
      expect(cooksNote1).not.toBeNull();
      expect(cooksNote2).not.toBeNull();
      expect(cooksNote1.id).not.toBe(cooksNote2.id);
      expect(cooksNote2.id).toBeGreaterThan(cooksNote1.id);
      expect(cooksNote1.recipe_id).toBe(cooksNote1Data.recipe_id);
      expect(cooksNote2.recipe_id).toBe(cooksNote2Data.recipe_id);
      expect(cooksNote1.note).toBe(cooksNote1Data.note);
      expect(cooksNote2.note).toBe(cooksNote2Data.note);
    });
  });

  describe("read", () => {
    test("should read an existing CooksNote by id", async () => {
      // Arrange
      const cooksNoteData = samplecooksNote();
      const createdcooksNote = await cooksNoteRepository.create(
        cooksNoteData,
      ) as CooksNoteEntity;

      // Act
      const result = await cooksNoteRepository.read(
        createdcooksNote.id,
      ) as CooksNoteEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(createdcooksNote.id);
      expect(result.recipe_id).toBe(createdcooksNote.recipe_id);
      expect(result.note).toBe(cooksNoteData.note);
    });

    test("should return null for non-existent CooksNote", async () => {
      // Act
      const result = await cooksNoteRepository.read(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("readAll", () => {
    test("should return all CooksNotes ordered by name", async () => {
      // Arrange
      const cooksNote1 = await cooksNoteRepository.create(
        samplecooksNote({ note: "Cook's Note 1" }),
      );
      const cooksNote2 = await cooksNoteRepository.create(
        samplecooksNote({ note: "Cook's Note 2" }),
      );
      const cooksNote3 = await cooksNoteRepository.create(
        samplecooksNote({ note: "Cook's Note 3" }),
      );

      // Act
      const result = await cooksNoteRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result).toContainValues([cooksNote1, cooksNote2, cooksNote3])
    });

    test("should return an empty array when no CooksNotes exist", async () => {
      // Act
      const result = await cooksNoteRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("update", () => {
    test("should update an existing CooksNote and return the updated entity", async () => {
      // Arrange
      const originalcooksNote = await cooksNoteRepository.create(
        samplecooksNote(),
      ) as CooksNoteEntity;
      const updatedData: CooksNoteEntity = {
        ...originalcooksNote!,
        note: "Lorem ispum dolor sit amet.",
      };

      // Act
      const result = await cooksNoteRepository.update(updatedData) as CooksNoteEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(originalcooksNote.id);
      expect(result.recipe_id).toBe(originalcooksNote.recipe_id);
      expect(result.note).toBe(updatedData.note);
    });

    test("should return null when trying to update a non-existant cooksNote", async () => {
      // Arrange
      const nonExistentcooksNote: CooksNoteEntity = {
        id: 999,
        recipe_id: 999,
        note: "non-existant",
      };

      // Act
      const result = await cooksNoteRepository.update(nonExistentcooksNote);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    test("should delete an existing cooksNote and return true", async () => {
      // Arrange
      const cooksNote = await cooksNoteRepository.create(
        samplecooksNote(),
      ) as CooksNoteEntity;

      // Act
      const result = await cooksNoteRepository.delete(cooksNote.id);

      // Assert
      expect(result).toBe(true);

      // Verify cooksNote is actually deleted
      const deletedcooksNote = cooksNoteRepository.read(cooksNote.id);
      expect(deletedcooksNote).toBeNull();
    });

    test("should return false when when trying to delete a non-existant cooksNote", async () => {
      // Arrange
      const nonExistantId = 999;

      // Act
      const result = await cooksNoteRepository.delete(nonExistantId);

      // Assert
      expect(result).toBe(false);
    });

    test("should handle deleting all cooksNotes", async () => {
      // Arrange
      await cooksNoteRepository.create(
        samplecooksNote({ note: "Cook's Note 1 of Recipe 1" }),
      );
      await cooksNoteRepository.create(
        samplecooksNote({ recipe_id: 2, note: "Cook's Note 1 of Recipe 2" }),
      );
      await cooksNoteRepository.create(
        samplecooksNote({ recipe_id: 3, note: "Cook's Note 1 of Recipe 3" }),
      );

      const allCooksNotes = await cooksNoteRepository.readAll();

      // Act
      allCooksNotes.forEach(async (cooksNote) => {
        const deleted = await cooksNoteRepository.delete(cooksNote.id);
        expect(deleted).toBe(true);
      });

      // Assert
      const remainingCooksNotes = await cooksNoteRepository.readAll();
      expect(remainingCooksNotes).toBeArrayOfSize(0);
    });
  });

  describe("readByRecipeId", () => {
    test("should return all CooksNotes that have the given recipe_id", async () => {
      // Arrange
      const recipeId = 30;
      const cooksNote1 = await cooksNoteRepository.create(
        samplecooksNote({ recipe_id: recipeId, note: "Cook's Note 1" }),
      );
      const cooksNote2 = await cooksNoteRepository.create(
        samplecooksNote({ recipe_id: recipeId, note: "Cook's Note 2" }),
      );
      const cooksNote3 = await cooksNoteRepository.create(
        samplecooksNote({ recipe_id: recipeId, note: "Cook's Note 3" }),
      );

      // Act
      const result = await cooksNoteRepository.readByRecipeId(recipeId);

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result).toContainValues([cooksNote1, cooksNote2, cooksNote3]);
    });

    test("should return an empty array when given a recipe_id with no associated CooksNotes", async () => {
      // Arrange
      const nonExistantRecipeId = 50;

      // Act
      const result = await cooksNoteRepository.readByRecipeId(nonExistantRecipeId);

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("deleteByRecipeId", () => {
    test("should return false when given a recipe_id with no associated CooksNotes", async () => {
      // Arrange
      const nonExistantRecipeId = 55;

      // Act
      const result = await cooksNoteRepository.deleteByRecipeId(nonExistantRecipeId);

      // Assert
      expect(result).toBe(false);
    });

    test("should return true and remove entities from the database when given a recipe_id with associated CooksNotes", async () => {
      // Arrange
      const recipeId = 76;
      const cooksNotes = [
        samplecooksNote({
          recipe_id: recipeId,
          note: "Cook's note 1 of Recipe 76",
        }),
        samplecooksNote({
          recipe_id: recipeId,
          note: "Cook's note 2 of Recipe 76",
        }),
        samplecooksNote({
          recipe_id: recipeId,
          note: "Cook's note 3 of Recipe 76",
        }),
      ];
      cooksNotes.forEach(async (cooksNote) => await cooksNoteRepository.create(cooksNote));

      // Act
      const result = await cooksNoteRepository.deleteByRecipeId(recipeId);

      // Assert
      expect(result).toBe(true);

      // Verify deletion of CooksNotes
      const remainingCooksNotes = cooksNoteRepository.readByRecipeId(recipeId);
      expect(remainingCooksNotes).toBeArrayOfSize(0);
    });
  });
});
