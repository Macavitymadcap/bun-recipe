import { Context, Next } from "hono";
import { AuthService } from "../services";

export interface AuthContext {
  user?: {
    id: number;
    username: string;
  };
}

export function createAuthGuard(authService: AuthService) {
  return async (c: Context & AuthContext, next: Next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const token = authHeader.slice(7);
    const user = await authService.validateAccessToken(token);

    if (!user) {
      return c.json({ error: "Invalid token" }, 401);
    }

    // Add user to context
    c.user = user;

    await next();
  };
}

// Optional auth middleware - doesn't require auth but adds user if present
export function createOptionalAuth(authService: AuthService) {
  return async (c: Context & AuthContext, next: Next) => {
    const authHeader = c.req.header("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const user = await authService.validateAccessToken(token);

      if (user) {
        c.user = user;
      }
    }

    await next();
  };
}
