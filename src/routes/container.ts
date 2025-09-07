import { DB_CONFIG } from "../database/config";
import { DbContext } from "../database/context/context";
import { CooksNoteRepository } from "../database/repositories/cooks-note-repository";
import { IngredientRepository } from "../database/repositories/ingredient-repository";
import { DirectionRepository } from "../database/repositories/direction-repository";
import { RecipeRepository } from "../database/repositories/recipe-repository";
import { RecipeTagRepository } from "../database/repositories/recipe-tag-repository";
import { TagRepository } from "../database/repositories/tag-repository";
import { RecipeService } from "../database/services/recipe-service";
import { ShoppingListRepository } from "../database/repositories/shopping-list-repository";
import { ShoppingListService } from "../database/services/shopping-list-service";

const DEPENDENCY_KEYS = {
  DB_CONTEXT: "dbContext",
  COOKS_NOTE_REPOSITORY: "cooksNoteRepository",
  INGREDIENT_REPOSITORY: "ingredientRepository",
  direction_REPOSITORY: "directionRepository",
  RECIPE_REPOSITORY: "recipeRepository",
  RECIPE_TAG_REPOSITORY: "recipeTagRepository",
  TAG_REPOSITORY: "tagRepository",
  RECIPE_SERVICE: "recipeService",
  SHOPPING_LIST_REPOSITORY: "shoppingListRepository",
  SHOPPING_LIST_SERVICE: "shoppingListService",
} as const;

type ObjectValues<T> = T[keyof T];

export type DependencyKey = ObjectValues<typeof DEPENDENCY_KEYS>;

export interface Dependencies {
  dbContext: DbContext;
  cooksNoteRepository: CooksNoteRepository;
  ingredientRepository: IngredientRepository;
  directionRepository: DirectionRepository;
  recipeRepository: RecipeRepository;
  recipeTagRepository: RecipeTagRepository;
  tagRepository: TagRepository;
  recipeService: RecipeService;
  shoppingListRepository: ShoppingListRepository;
  shoppingListService: ShoppingListService;
}

export class Container {
  private static instance: Container;
  private dependencies: Map<string, any> = new Map();

  private constructor() {
    this.registerDependencies();
  }

  /**
   * Get singleton instance of container
   */
  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Register all dependencies
   */
  private registerDependencies(): void {
    this.dependencies.set(
      DEPENDENCY_KEYS.DB_CONTEXT,
      DbContext.getInstance(DB_CONFIG),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.COOKS_NOTE_REPOSITORY,
      new CooksNoteRepository(DB_CONFIG),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.INGREDIENT_REPOSITORY,
      new IngredientRepository(DB_CONFIG),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.direction_REPOSITORY,
      new DirectionRepository(DB_CONFIG),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.RECIPE_REPOSITORY,
      new RecipeRepository(DB_CONFIG),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.RECIPE_TAG_REPOSITORY,
      new RecipeTagRepository(DB_CONFIG),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.TAG_REPOSITORY,
      new TagRepository(DB_CONFIG),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.RECIPE_SERVICE,
      new RecipeService(
        this.get<RecipeRepository>("recipeRepository"),
        this.get<IngredientRepository>("ingredientRepository"),
        this.get<DirectionRepository>("directionRepository"),
        this.get<CooksNoteRepository>("cooksNoteRepository"),
        this.get<TagRepository>("tagRepository"),
        this.get<RecipeTagRepository>("recipeTagRepository"),
        this.get<DbContext>("dbContext"),
      ),
    );
    (this.dependencies.set(
      DEPENDENCY_KEYS.SHOPPING_LIST_REPOSITORY,
      new ShoppingListRepository(DB_CONFIG),
    ),
      this.dependencies.set(
        DEPENDENCY_KEYS.SHOPPING_LIST_SERVICE,
        new ShoppingListService(
          this.get<ShoppingListRepository>("shoppingListRepository"),
          this.get<IngredientRepository>("ingredientRepository"),
          this.get<DbContext>("dbContext"),
        ),
      ));
  }

  /**
   * Get a dependency by key
   */
  public get<T>(key: DependencyKey): T {
    if (!this.dependencies.has(key)) {
      throw new Error(`Dependency '${key}' not found`);
    }
    return this.dependencies.get(key) as T;
  }

  /**
   * Get all dependencies as an object
   */
  public getDependencies(): Dependencies {
    return {
      dbContext: this.get<DbContext>("dbContext"),
      cooksNoteRepository: this.get<CooksNoteRepository>("cooksNoteRepository"),
      ingredientRepository: this.get<IngredientRepository>(
        "ingredientRepository",
      ),
      directionRepository: this.get<DirectionRepository>("directionRepository"),
      recipeRepository: this.get<RecipeRepository>("recipeRepository"),
      recipeTagRepository: this.get<RecipeTagRepository>("recipeTagRepository"),
      tagRepository: this.get<TagRepository>("tagRepository"),
      recipeService: this.get<RecipeService>("recipeService"),
      shoppingListRepository: this.get<ShoppingListRepository>(
        "shoppingListRepository",
      ),
      shoppingListService: this.get<ShoppingListService>("shoppingListService"),
    };
  }

  /**
   * Reset container (useful for testing)
   */
  public reset(): void {
    this.dependencies.clear();
    this.registerDependencies();
  }
}
