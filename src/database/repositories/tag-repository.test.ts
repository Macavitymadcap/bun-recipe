import {
  describe,
  test,
  expect,
  beforeEach,
  beforeAll,
  afterAll,
} from "bun:test";
import { TagEntity, TagRepository } from "./tag-repository";
import { DB_CONFIG } from "../config";
import { DbContext } from "../context";

const sampleTag = (
  overrides: Partial<Omit<TagEntity, "id">> = {},
): Omit<TagEntity, "id"> => ({
  name: "Indian",
  ...overrides,
});

describe("TagRepository", () => {
  let tagRepository: TagRepository;

  beforeAll(() => {
    (DbContext as any).instance = undefined; // Reset singleton instance before tests
    tagRepository = new TagRepository(DB_CONFIG.inMemoryPath);
  });

  afterAll(() => {
    try {
      tagRepository.close();
    } catch (error) {
      // Ignore errors during cleanup
    }
    (DbContext as any).instance = undefined; // Reset singleton instance after tests
  });

  beforeEach(() => {
    // Clean up any existing tags before each test
    const allTags = tagRepository.readAll();
    allTags.forEach((tag) => tagRepository.delete(tag.id));
  });

  test("should create the tags table on init", () => {
    // Table creation is implicit; just ensure no error on instantiation
    expect(tagRepository).toBeInstanceOf(TagRepository);
  });

  describe("create", () => {
    test("should create a new tag and return the created entity with an id", () => {
      // Arrange
      const tagData = sampleTag();

      // Act
      const result = tagRepository.create(tagData) as TagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBeTypeOf("number");
      expect(result.id).toBeGreaterThan(0);
      expect(result.name).toBe(tagData.name);
    });

    test("should create multiple tags with unique ids", () => {
      // Arrange
      const tag1Data = sampleTag({ name: "Tag 1" });
      const tag2Data = sampleTag({ name: "Tag 2" });

      // Act
      const tag1 = tagRepository.create(tag1Data) as TagEntity;
      const tag2 = tagRepository.create(tag2Data) as TagEntity;

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
    test("should read an existing tag by id", () => {
      // Arrange
      const tagData = sampleTag();
      const createdTag = tagRepository.create(tagData) as TagEntity;

      // Act
      const result = tagRepository.read(createdTag.id) as TagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(createdTag.id);
      expect(result.name).toBe(tagData.name);
    });

    test("should return null for non-existent tag", () => {
      // Act
      const result = tagRepository.read(999);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("readAll", () => {
    test("should return all tags ordered by name", () => {
      // Arrange
      const tag1 = tagRepository.create(sampleTag({ name: "A Tag" }));
      const tag2 = tagRepository.create(sampleTag({ name: "B Tag" }));
      const tag3 = tagRepository.create(sampleTag({ name: "C Tag" }));

      // Act
      const result = tagRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(3);
      expect(result[0].name).toBe(tag1!.name);
      expect(result[1].name).toBe(tag2!.name);
      expect(result[2].name).toBe(tag3!.name);
    });

    test("should return an empty array when no tags exist", () => {
      // Act
      const result = tagRepository.readAll();

      // Assert
      expect(result).toBeArrayOfSize(0);
    });
  });

  describe("update", () => {
    test("should update an existing tag and return the updated entity", () => {
      // Arrange
      const originalTag = tagRepository.create(sampleTag()) as TagEntity;
      const updatedData: TagEntity = {
        ...originalTag,
        name: "South Indian",
      };

      // Act
      const result = tagRepository.update(updatedData) as TagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(originalTag.id);
      expect(result.name).toBe(updatedData.name);
    });

    test("should return null when trying to update a non-existant tag", () => {
      // Arrange
      const nonExistentTag: TagEntity = {
        id: 999,
        name: "non-existant",
      };

      // Act
      const result = tagRepository.update(nonExistentTag);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    test("should delete an existing tag and return true", () => {
      // Arrange
      const tag = tagRepository.create(sampleTag()) as TagEntity;

      // Act
      const result = tagRepository.delete(tag.id);

      // Assert
      expect(result).toBe(true);

      // Verify tag is actually deleted
      const deletedTag = tagRepository.read(tag.id);
      expect(deletedTag).toBeNull();
    });

    test("should return false when when trying to delete a non-existant tag", () => {
      // Arrange
      const nonExistantId = 999;

      // Act
      const result = tagRepository.delete(nonExistantId);

      // Assert
      expect(result).toBe(false);
    });

    test("should handle deleting all tags", () => {
      // Arrange
      tagRepository.create(sampleTag({ name: "Tag 1" }));
      tagRepository.create(sampleTag({ name: "Tag 2" }));
      tagRepository.create(sampleTag({ name: "Tag 3" }));

      const allTags = tagRepository.readAll();

      // Act
      allTags.forEach((tag) => {
        const deleted = tagRepository.delete(tag.id);
        expect(deleted).toBe(true);
      });

      // Assert
      const remainingTags = tagRepository.readAll();
      expect(remainingTags).toBeArrayOfSize(0);
    });
  });

  describe("findByName", () => {
    test("Should return an entity with a name that exactly matches the query", () => {
      // Arrange
      const tag = tagRepository.create(
        sampleTag({ name: "Vegetarian" }),
      ) as TagEntity;

      // Act
      const result = tagRepository.findByName(tag.name) as TagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(tag.id);
      expect(result.name).toBe(tag.name);
    });

    test("should return null when the query only partially matches an existing entity", () => {
      // Arrange
      tagRepository.create(sampleTag({ name: "North Indian" }));

      // Act
      const result = tagRepository.findByName("Indian");

      // Assert
      expect(result).toBeNull();
    });

    test("should return null when the query matches no existing entities", () => {
      // Arrange
      tagRepository.create(sampleTag({ name: "Healthy" }));

      // Act
      const result = tagRepository.findByName("Opulent");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("createOrFind", () => {
    test("should return an existing entity when given a name that belongs to an existing tag", () => {
      // Arrange
      const existingName = "Barbecue";
      const existingTag = tagRepository.create(
        sampleTag({ name: existingName }),
      ) as TagEntity;

      // Act
      const result = tagRepository.createOrFind(existingName) as TagEntity;

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result.id).toBe(existingTag.id);
      expect(result.name).toBe(existingName);
    });

    test("should create a new entity when given a name that does already have a tag", () => {
      // Arrange
      const nonExistantName = "Hearty";
      expect(tagRepository.findByName(nonExistantName)).toBeNull();

      // Act
      const result = tagRepository.createOrFind(nonExistantName);

      // Assert
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.id).toBeGreaterThan(0);
      expect(result!.name).toBe(nonExistantName);
    });
  });
});
