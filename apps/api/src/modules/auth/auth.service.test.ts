import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from './auth.service.js';
import { InMemoryUserRepository } from './auth.repository.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../shared/errors.js';
import { verifyToken } from './auth.security.js';

describe('AuthService', () => {
  let userRepo: InMemoryUserRepository;
  let authService: AuthService;

  beforeEach(() => {
    userRepo = new InMemoryUserRepository();
    authService = new AuthService(userRepo);
  });

  describe('Demo User Pre-seeding', () => {
    it('allows logging in with pre-seeded demo user credentials', async () => {
      const result = await authService.login({
        email: 'sarah.lin@forma-studio.com',
        password: 'PrecisionDraft#2025',
        rememberMe: true,
      });

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('sarah.lin@forma-studio.com');
      expect(result.user.name).toBe('Sarah Lin, AIA');
      expect(result.token).toBeDefined();
      expect(result.expiresIn).toBe(30 * 24 * 60 * 60);

      const payload = verifyToken(result.token);
      expect(payload?.sub).toBe(result.user.id);
      expect(payload?.email).toBe('sarah.lin@forma-studio.com');
    });
  });

  describe('User Registration', () => {
    it('successfully registers a new architectural workspace user', async () => {
      const result = await authService.register({
        email: 'marcus.v@studio-arch.com',
        password: 'SecureArchitectKey#2026',
        name: 'Marcus Vance',
        role: 'Architectural Practice / BIM CAD',
      });

      expect(result.user.id).toBeDefined();
      expect(result.user.email).toBe('marcus.v@studio-arch.com');
      expect(result.user.name).toBe('Marcus Vance');
      expect(result.user.role).toBe('Architectural Practice / BIM CAD');
      expect(result.token).toBeDefined();

      const inRepo = await userRepo.findByEmail('marcus.v@studio-arch.com');
      expect(inRepo).toBeDefined();
      // Master password must be securely hashed, never stored raw
      expect(inRepo?.passwordHash).not.toBe('SecureArchitectKey#2026');
      expect(inRepo?.passwordHash).toContain(':');
    });

    it('rejects registration with duplicate email with ConflictError', async () => {
      await expect(
        authService.register({
          email: 'sarah.lin@forma-studio.com',
          password: 'AnotherPassword123!',
          name: 'Sarah Duplicate',
        })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('User Login', () => {
    it('authenticates valid credentials and honors rememberMe flag', async () => {
      await authService.register({
        email: 'elena.rostova@design.co',
        password: 'DesignPrecision#99',
        name: 'Elena Rostova',
      });

      // Login with rememberMe = false -> 7 days
      const res7Days = await authService.login({
        email: 'elena.rostova@design.co',
        password: 'DesignPrecision#99',
        rememberMe: false,
      });
      expect(res7Days.expiresIn).toBe(7 * 24 * 60 * 60);

      // Login with rememberMe = true -> 30 days
      const res30Days = await authService.login({
        email: 'elena.rostova@design.co',
        password: 'DesignPrecision#99',
        rememberMe: true,
      });
      expect(res30Days.expiresIn).toBe(30 * 24 * 60 * 60);
    });

    it('rejects invalid password with UnauthorizedError', async () => {
      await expect(
        authService.login({
          email: 'sarah.lin@forma-studio.com',
          password: 'WrongPassword!',
        })
      ).rejects.toThrow(UnauthorizedError);
    });

    it('rejects non-existent email with UnauthorizedError', async () => {
      await expect(
        authService.login({
          email: 'ghost@nonexistent.domain',
          password: 'PrecisionDraft#2025',
        })
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('Session Verification & Profile Resolution', () => {
    it('verifies valid session token', async () => {
      const loginRes = await authService.login({
        email: 'sarah.lin@forma-studio.com',
        password: 'PrecisionDraft#2025',
      });

      const user = await authService.verifySession(loginRes.token);
      expect(user).not.toBeNull();
      expect(user?.id).toBe(loginRes.user.id);
    });

    it('returns null for an invalid or tampered token', async () => {
      const user = await authService.verifySession('invalid.tampered.token');
      expect(user).toBeNull();
    });

    it('resolves user profile with getMe', async () => {
      const me = await authService.getMe('usr-sarah-lin');
      expect(me.name).toBe('Sarah Lin, AIA');
      expect(me.email).toBe('sarah.lin@forma-studio.com');
    });

    it('throws NotFoundError when user ID does not exist', async () => {
      await expect(authService.getMe('usr-does-not-exist')).rejects.toThrow(NotFoundError);
    });
  });
});
