import {
  describe,
  test,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
} from "bun:test";
import { TagEntity, TagRepository } from "./tag-repository";
import { DB_CONFIG, DbConfig } from "../config";
import { DbContext } from "../context/context";

const sampleTag = (
  overrides: Partial<Omit<TagEntity, "id">> = {},
): Omit<TagEntity, "id"> => ({
  name: "Indian",
  ...overrides,
});

describe("TagRepository", () => {
  let tagRepository: TagRepository;

  beforeAll(() => {
    const testConfig: DbConfig = {
      ...DB_CONFIG,
      database: "recipe_test",
    };
    (DbContext as any).instance = undefined; // Reset singleton instance before tests
    tagRepository = new TagRepository(testConfig);
  });

  afterAll(async () => {
    try {
      await tagRepository.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
    (DbContext as any).instance = undefined; // Reset singleton instance after tests
  });

  beforeEach(async () => {
    // Clean up any existing tags before each test
    const allTags = await tagRepository.readAll();
    allTags.forEach(async (tag) => await tagRepository.delete(tag.id));
  });

  test("should create the tags table on init", () => {
    // Table creation is implicit; just ensure no error on instantiation
    expect(tagRepository).toBeInstanceOf(TagRepository);
  });

  describe("create", () => {
    test("should create a new tag and return the created entity with an id", async () => {
      // Arrange
      const tagData = sampleTag();

      // Act
      const result = (await tagRepository.create(tagData)) as TagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBeTypeOf("number");
      expect(result.id).toBeGreaterThan(0);
      expect(result.name).toBe(tagData.name);
    });

    test("should create multiple tags with unique ids", async () => {
      // Arrange
      const tag1Data = sampleTag({ name: "Tag 1" });
      const tag2Data = sampleTag({ name: "Tag 2" });

      // Act
      const tag1 = (await tagRepository.create(tag1Data)) as TagEntity;
      const tag2 = (await tagRepository.create(tag2Data)) as TagEntity;

      // Assert
      expect(tag1).not.toBeNull();
      expect(tag2).not.toBeNull();
      expect(tag1.id).not.toBe(tag2.id);
      expect(tag2.id).toBeGreaterThan(tag1.id);
      expect(tag1.name).toBe(tag1Data.name);
      expect(tag2.name).toBe(tag2Data.name);
    });
  });

  describe("read", () => {
    test("should read an existing tag by id", async () => {
      // Arrange
      const tagData = sampleTag();
      const createdTag = (await tagRepository.create(tagData)) as TagEntity;

      // Act
      const result = (await tagRepository.read(createdTag.id)) as TagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(createdTag.id);
      expect(result.name).toBe(tagData.name);
    });

    test("should return null for non-existent tag", async () => {
      // Act
      const result = await tagRepository.read(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("readAll", () => {
    test("should return all tags ordered by name", async () => {
      // Arrange
      const tag1 = await tagRepository.create(sampleTag({ name: "A Tag" }));
      const tag2 = await tagRepository.create(sampleTag({ name: "B Tag" }));
      const tag3 = await tagRepository.create(sampleTag({ name: "C Tag" }));

      // Act
      const result = await tagRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result[0].name).toBe(tag1!.name);
      expect(result[1].name).toBe(tag2!.name);
      expect(result[2].name).toBe(tag3!.name);
    });

    test("should return an empty array when no tags exist", async () => {
      // Act
      const result = await tagRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("update", () => {
    test("should update an existing tag and return the updated entity", async () => {
      // Arrange
      const originalTag = (await tagRepository.create(
        sampleTag(),
      )) as TagEntity;
      const updatedData: TagEntity = {
        ...originalTag,
        name: "South Indian",
      };

      // Act
      const result = (await tagRepository.update(updatedData)) as TagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(originalTag.id);
      expect(result.name).toBe(updatedData.name);
    });

    test("should return null when trying to update a non-existant tag", async () => {
      // Arrange
      const nonExistentTag: TagEntity = {
        id: 999,
        name: "non-existant",
      };

      // Act
      const result = await tagRepository.update(nonExistentTag);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    test("should delete an existing tag and return true", async () => {
      // Arrange
      const tag = (await tagRepository.create(sampleTag())) as TagEntity;

      // Act
      const result = await tagRepository.delete(tag.id);

      // Assert
      expect(result).toBe(true);

      // Verify tag is actually deleted
      const deletedTag = await tagRepository.read(tag.id);
      expect(deletedTag).toBeNull();
    });

    test("should return false when when trying to delete a non-existant tag", async () => {
      // Arrange
      const nonExistantId = 999;

      // Act
      const result = await tagRepository.delete(nonExistantId);

      // Assert
      expect(result).toBe(false);
    });

    test("should handle deleting all tags", async () => {
      // Arrange
      await tagRepository.create(sampleTag({ name: "Tag 1" }));
      await tagRepository.create(sampleTag({ name: "Tag 2" }));
      await tagRepository.create(sampleTag({ name: "Tag 3" }));

      const allTags = await tagRepository.readAll();

      // Act
      allTags.forEach(async (tag) => {
        const deleted = await tagRepository.delete(tag.id);
        expect(deleted).toBe(true);
      });

      // Assert
      const remainingTags = await tagRepository.readAll();
      expect(remainingTags).toBeArrayOfSize(0);
    });
  });

  describe("readByName", () => {
    test("Should return an entity with a name that exactly matches the query", async () => {
      // Arrange
      const tag = (await tagRepository.create(
        sampleTag({ name: "Vegetarian" }),
      )) as TagEntity;

      // Act
      const result = (await tagRepository.readByName(tag.name)) as TagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(tag.id);
      expect(result.name).toBe(tag.name);
    });

    test("should return null when the query only partially matches an existing entity", async () => {
      // Arrange
      await tagRepository.create(sampleTag({ name: "North Indian" }));

      // Act
      const result = await tagRepository.readByName("Indian");

      // Assert
      expect(result).toBeNull();
    });

    test("should return null when the query matches no existing entities", async () => {
      // Arrange
      await tagRepository.create(sampleTag({ name: "Healthy" }));

      // Act
      const result = await tagRepository.readByName("Opulent");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("createOrRead", () => {
    test("should return an existing entity when given a name that belongs to an existing tag", async () => {
      // Arrange
      const existingName = "Barbecue";
      const existingTag = (await tagRepository.create(
        sampleTag({ name: existingName }),
      )) as TagEntity;

      // Act
      const result = (await tagRepository.createOrRead(
        existingName,
      )) as TagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(existingTag.id);
      expect(result.name).toBe(existingName);
    });

    test("should create a new entity when given a name that does already have a tag", async () => {
      // Arrange
      const nonExistantName = "Hearty";
      expect(await tagRepository.readByName(nonExistantName)).toBeNull();

      // Act
      const result = await tagRepository.createOrRead(nonExistantName);

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.id).toBeGreaterThan(0);
      expect(result!.name).toBe(nonExistantName);
    });
  });
});
