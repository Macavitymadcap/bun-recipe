import { SignJWT, jwtVerify } from "jose";

export interface TokenPayload {
  userId: number;
  username: string;
}

export class TokenService {
  private readonly accessTokenSecret: Uint8Array;
  private readonly refreshTokenSecret: Uint8Array;
  private readonly accessTokenExpiry = "15m";
  private readonly refreshTokenExpiry = "7d";

  constructor(accessTokenSecret?: string, refreshTokenSecret?: string) {
    // Use environment variables or provided secrets
    const accessSecret =
      accessTokenSecret ||
      process.env.JWT_ACCESS_SECRET ||
      "your-access-secret-key";
    const refreshSecret =
      refreshTokenSecret ||
      process.env.JWT_REFRESH_SECRET ||
      "your-refresh-secret-key";

    this.accessTokenSecret = new TextEncoder().encode(accessSecret);
    this.refreshTokenSecret = new TextEncoder().encode(refreshSecret);
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.accessTokenExpiry)
      .sign(this.accessTokenSecret);
  }

  async generateRefreshToken(payload: TokenPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(this.refreshTokenExpiry)
      .sign(this.refreshTokenSecret);
  }

  async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.accessTokenSecret);
      return {
        userId: payload.userId as number,
        username: payload.username as string,
      };
    } catch (error) {
      return null;
    }
  }

  async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.refreshTokenSecret);
      return {
        userId: payload.userId as number,
        username: payload.username as string,
      };
    } catch (error) {
      return null;
    }
  }
}
