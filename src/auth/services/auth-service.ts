import { DbContext } from "../../database/context";
import {
  UserRepository,
  UserEntity,
  RefreshTokenRepository,
} from "../repositories";
import { PasswordService } from "./password-service";
import { TokenService, TokenPayload } from "./token-service";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: number;
  username: string;
}

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private dbContext: DbContext,
  ) {}

  async login(credentials: LoginCredentials): Promise<AuthTokens | null> {
    const user = this.userRepository.findByUsername(credentials.username);
    if (!user) {
      return null;
    }

    const isPasswordValid = await this.passwordService.verify(
      credentials.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      return null;
    }

    // Update last login
    this.userRepository.updateLastLogin(user.id);

    // Generate tokens
    return this.generateAuthTokens(user);
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
    // Verify refresh token
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload) {
      return null;
    }

    // Find refresh token in database
    const tokenHash = await this.passwordService.hash(refreshToken);
    const storedToken = this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken || storedToken.user_id !== payload.userId) {
      return null;
    }

    // Check if token is expired
    if (new Date(storedToken.expires_at) < new Date()) {
      this.refreshTokenRepository.delete(storedToken.id);
      return null;
    }

    // Get user
    const user = this.userRepository.read(payload.userId);
    if (!user) {
      return null;
    }

    // Delete old refresh token
    this.refreshTokenRepository.delete(storedToken.id);

    // Generate new tokens
    return this.generateAuthTokens(user);
  }

  async logout(userId: number): Promise<void> {
    // Delete all refresh tokens for the user
    this.refreshTokenRepository.deleteByUserId(userId);
  }

  async createUser(
    username: string,
    password: string,
  ): Promise<UserEntity | null> {
    // Check if user already exists
    const existingUser = this.userRepository.findByUsername(username);
    if (existingUser) {
      return null;
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(password);

    // Create user
    return this.userRepository.create({
      username,
      password_hash: passwordHash,
    });
  }

  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = this.userRepository.read(userId);
    if (!user) {
      return false;
    }

    // Verify old password
    const isOldPasswordValid = await this.passwordService.verify(
      oldPassword,
      user.password_hash,
    );

    if (!isOldPasswordValid) {
      return false;
    }

    // Hash new password
    const newPasswordHash = await this.passwordService.hash(newPassword);

    // Update user
    const updatedUser = this.userRepository.update({
      ...user,
      password_hash: newPasswordHash,
    });

    // Invalidate all refresh tokens
    if (updatedUser) {
      this.refreshTokenRepository.deleteByUserId(userId);
    }

    return updatedUser !== null;
  }

  async validateAccessToken(token: string): Promise<AuthUser | null> {
    const payload = await this.tokenService.verifyAccessToken(token);
    if (!payload) {
      return null;
    }

    const user = this.userRepository.read(payload.userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
    };
  }

  private async generateAuthTokens(user: UserEntity): Promise<AuthTokens> {
    const payload: TokenPayload = {
      userId: user.id,
      username: user.username,
    };

    const accessToken = await this.tokenService.generateAccessToken(payload);
    const refreshToken = await this.tokenService.generateRefreshToken(payload);

    // Store refresh token hash
    const refreshTokenHash = await this.passwordService.hash(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    this.refreshTokenRepository.create({
      user_id: user.id,
      token_hash: refreshTokenHash,
      expires_at: expiresAt.toISOString(),
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  cleanupExpiredTokens(): number {
    return this.refreshTokenRepository.deleteExpiredTokens();
  }
}
