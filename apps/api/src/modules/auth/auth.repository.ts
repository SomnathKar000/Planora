// ────────────────────────────────────────────────────────────────
// Planora API — User Repository (Data Access Layer)
// ────────────────────────────────────────────────────────────────

import type { UserRecord } from './auth.types.js';
import { prisma } from '../../lib/prisma.js';
import { hashPassword } from './auth.security.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(user: UserRecord): Promise<UserRecord>;
  update(user: UserRecord): Promise<UserRecord>;
  delete(id: string): Promise<boolean>;
}

// ── In-Memory Implementation ──────────────────────────────────
export class InMemoryUserRepository implements IUserRepository {
  private readonly users: Map<string, UserRecord> = new Map();

  constructor() {
    // Seed default demo user matching the UI showcase
    const defaultUser: UserRecord = {
      id: 'usr-sarah-lin',
      email: 'sarah.lin@forma-studio.com',
      name: 'Sarah Lin, AIA',
      passwordHash: hashPassword('PrecisionDraft#2025'),
      role: 'Architectural Practice / BIM CAD',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) ?? null;
  }

  async create(user: UserRecord): Promise<UserRecord> {
    this.users.set(user.id, user);
    return user;
  }

  async update(user: UserRecord): Promise<UserRecord> {
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}

// ── Prisma Implementation ──────────────────────────────────────
export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<UserRecord | null> {
    try {
      const record = await prisma.user.findUnique({
        where: { email: email.trim().toLowerCase() },
      });
      if (!record) return null;
      return {
        id: record.id,
        email: record.email,
        name: record.name,
        passwordHash: record.passwordHash,
        role: record.role,
        avatarUrl: record.avatarUrl ?? undefined,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    } catch {
      return null;
    }
  }

  async findById(id: string): Promise<UserRecord | null> {
    try {
      const record = await prisma.user.findUnique({
        where: { id },
      });
      if (!record) return null;
      return {
        id: record.id,
        email: record.email,
        name: record.name,
        passwordHash: record.passwordHash,
        role: record.role,
        avatarUrl: record.avatarUrl ?? undefined,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    } catch {
      return null;
    }
  }

  async create(user: UserRecord): Promise<UserRecord> {
    const record = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email.trim().toLowerCase(),
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });

    return {
      id: record.id,
      email: record.email,
      name: record.name,
      passwordHash: record.passwordHash,
      role: record.role,
      avatarUrl: record.avatarUrl ?? undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  async update(user: UserRecord): Promise<UserRecord> {
    const record = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });

    return {
      id: record.id,
      email: record.email,
      name: record.name,
      passwordHash: record.passwordHash,
      role: record.role,
      avatarUrl: record.avatarUrl ?? undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
