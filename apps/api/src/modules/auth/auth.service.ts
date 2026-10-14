// ────────────────────────────────────────────────────────────────
// Planora API — Auth Service (Business Logic Layer)
// ────────────────────────────────────────────────────────────────

import type { User } from '@planora/domain';
import type { IUserRepository } from './auth.repository.js';
import type { RegisterDto, LoginDto, AuthResponse, UserRecord } from './auth.types.js';
import { hashPassword, verifyPassword, createToken, verifyToken } from './auth.security.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../shared/errors.js';

export class AuthService {
  constructor(private readonly userRepo: IUserRepository) {}

  /**
   * Registers a new professional user workspace.
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictError(`An account with email '${dto.email}' already exists. Please sign in instead.`);
    }

    const userId = `usr-${Date.now()}`;
    const now = new Date().toISOString();
    const passwordHash = hashPassword(dto.password);

    const newRecord: UserRecord = {
      id: userId,
      email: dto.email.trim().toLowerCase(),
      name: dto.name.trim(),
      passwordHash,
      role: dto.role || 'Architectural Practice / BIM CAD',
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.userRepo.create(newRecord);

    const user: User = {
      id: saved.id,
      email: saved.email,
      name: saved.name,
      role: saved.role,
      avatarUrl: saved.avatarUrl,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };

    const token = createToken(user, 30); // 30 days active session

    return {
      user,
      token,
      expiresIn: 30 * 24 * 60 * 60,
    };
  }

  /**
   * Authenticates a user with email and workstation password.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const record = await this.userRepo.findByEmail(dto.email);
    if (!record) {
      throw new UnauthorizedError('Invalid workstation email or password');
    }

    const isMatch = verifyPassword(dto.password, record.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid workstation email or password');
    }

    const user: User = {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role,
      avatarUrl: record.avatarUrl,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    const days = dto.rememberMe ? 30 : 7;
    const token = createToken(user, days);

    return {
      user,
      token,
      expiresIn: days * 24 * 60 * 60,
    };
  }

  /**
   * Resolves a user profile by ID.
   */
  async getMe(userId: string): Promise<User> {
    const record = await this.userRepo.findById(userId);
    if (!record) {
      throw new NotFoundError('User', userId);
    }

    return {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role,
      avatarUrl: record.avatarUrl,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  /**
   * Verifies an auth token and returns the user domain entity.
   */
  async verifySession(token: string): Promise<User | null> {
    const payload = verifyToken(token);
    if (!payload) return null;

    const record = await this.userRepo.findById(payload.sub);
    if (!record) return null;

    return {
      id: record.id,
      email: record.email,
      name: record.name,
      role: record.role,
      avatarUrl: record.avatarUrl,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}
