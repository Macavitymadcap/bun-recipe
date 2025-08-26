import { RefreshTokenRepository } from "../auth/repositories/refresh-token-repository";
import { UserRepository } from "../auth/repositories/user-repository";
import { AuthService } from "../auth/services/auth-service";
import { PasswordService } from "../auth/services/password-service";
import { TokenService } from "../auth/services/token-service";
import { DB_CONFIG } from "../database/config";
import { DbContext } from "../database/context/context";
import { CooksNoteRepository } from "../database/repositories/cooks-note-repository";
import { IngredientRepository } from "../database/repositories/ingredient-repository";
import { DirectionRepository } from "../database/repositories/direction-repository";
import { RecipeRepository } from "../database/repositories/recipe-repository";
import { RecipeTagRepository } from "../database/repositories/recipe-tag-repository";
import { TagRepository } from "../database/repositories/tag-repository";
import { RecipeService } from "../database/services/recipe-service";

const DEPENDENCY_KEYS = {
  DB_CONTEXT: "dbContext",
  COOKS_NOTE_REPOSITORY: "cooksNoteRepository",
  INGREDIENT_REPOSITORY: "ingredientRepository",
  direction_REPOSITORY: "directionRepository",
  RECIPE_REPOSITORY: "recipeRepository",
  RECIPE_TAG_REPOSITORY: "recipeTagRepository",
  TAG_REPOSITORY: "tagRepository",
  RECIPE_SERVICE: "recipeService",
  REFRESH_TOKEN_REPOSITORY: "refreshTokenRepository",
  USER_REPOSITORY: "userRepository",
  PASSWORD_SERVICE: "passwordService",
  TOKEN_SERVICE: "tokenService",
  AUTH_SERVICE: "authService",
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
  refreshTokenRepository: RefreshTokenRepository;
  userRepository: UserRepository;
  passwordService: PasswordService;
  tokenService: TokenService;
  authService: AuthService;
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
    this.dependencies.set(DEPENDENCY_KEYS.DB_CONTEXT, DbContext.getInstance());
    this.dependencies.set(
      DEPENDENCY_KEYS.COOKS_NOTE_REPOSITORY,
      new CooksNoteRepository(DB_CONFIG.path),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.INGREDIENT_REPOSITORY,
      new IngredientRepository(DB_CONFIG.path),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.direction_REPOSITORY,
      new DirectionRepository(DB_CONFIG.path),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.RECIPE_REPOSITORY,
      new RecipeRepository(DB_CONFIG.path),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.RECIPE_TAG_REPOSITORY,
      new RecipeTagRepository(DB_CONFIG.path),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.TAG_REPOSITORY,
      new TagRepository(DB_CONFIG.path),
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
    this.dependencies.set(
      DEPENDENCY_KEYS.REFRESH_TOKEN_REPOSITORY,
      new RefreshTokenRepository(DB_CONFIG.path),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.USER_REPOSITORY,
      new UserRepository(DB_CONFIG.path),
    );
    this.dependencies.set(
      DEPENDENCY_KEYS.PASSWORD_SERVICE,
      new PasswordService(),
    );
    this.dependencies.set(DEPENDENCY_KEYS.TOKEN_SERVICE, new TokenService());
    this.dependencies.set(
      DEPENDENCY_KEYS.AUTH_SERVICE,
      new AuthService(
        this.get(DEPENDENCY_KEYS.USER_REPOSITORY),
        this.get(DEPENDENCY_KEYS.REFRESH_TOKEN_REPOSITORY),
        this.get(DEPENDENCY_KEYS.PASSWORD_SERVICE),
        this.get(DEPENDENCY_KEYS.TOKEN_SERVICE),
        this.get(DEPENDENCY_KEYS.DB_CONTEXT),
      ),
    );
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

  // /**
  //  * Set a dependency (useful for testing)
  //  */
  // public set(key: string, value: any): void {
  //   this.dependencies.set(key, value);
  // }

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
      directionRepository: this.get<DirectionRepository>(
        "directionRepository",
      ),
      recipeRepository: this.get<RecipeRepository>("recipeRepository"),
      recipeTagRepository: this.get<RecipeTagRepository>("recipeTagRepository"),
      tagRepository: this.get<TagRepository>("tagRepository"),
      recipeService: this.get<RecipeService>("recipeService"),
      refreshTokenRepository: this.get<RefreshTokenRepository>(
        "refreshTokenRepository",
      ),
      userRepository: this.get<UserRepository>("userRepository"),
      passwordService: this.get<PasswordService>("passwordService"),
      tokenService: this.get<TokenService>("tokenService"),
      authService: this.get<AuthService>("authService"),
    };
  }

  /**
   * Reset container (useful for testing)
   */
  public reset(): void {
    this.dependencies.clear();
    this.registerDependencies();
  }

  // /**
  //  * Create a test container with mock dependencies
  //  */
  // public static createTestContainer(
  //   mockDependencies: Partial<Dependencies>,
  // ): Container {
  //   const container = new Container();

  //   // Override with mock dependencies
  //   Object.entries(mockDependencies).forEach(([key, value]) => {
  //     container.set(key, value);
  //   });

  //   return container;
  // }
}
