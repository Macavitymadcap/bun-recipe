import { Hono } from "hono";

export interface RouteConfig {
  prefix: string;
}

export abstract class BaseRoute {
  protected app: Hono;
  protected config: RouteConfig;

  constructor(config: RouteConfig) {
    this.app = new Hono();
    this.config = config;
    this.initializeRoutes();
  }

  /**
   * Initialize all routes for this router
   */
  protected abstract initializeRoutes(): void;

  /**
   * Get the Hono app instance
   */
  public getRouter(): Hono {
    return this.app;
  }

  /**
   * Get the route prefix
   */
  public getPrefix(): string {
    return this.config.prefix;
  }
}
