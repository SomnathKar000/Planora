// ────────────────────────────────────────────────────────────────
// Planora Web — Auth Store (Pinia)
// Handles session persistence, workstation token, and user state
// ────────────────────────────────────────────────────────────────

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@planora/domain';

const TOKEN_KEY = 'planora_auth_token';
const USER_KEY = 'planora_auth_user';
const STORAGE_TYPE_KEY = 'planora_auth_storage';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<User | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);

  const userInitials = computed(() => {
    if (!user.value?.name) return 'PL';
    const parts = user.value.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  });

  const userName = computed(() => user.value?.name ?? 'Architect');
  const userRole = computed(() => user.value?.role ?? 'Architectural Practice / BIM CAD');
  const userEmail = computed(() => user.value?.email ?? '');

  /**
   * Initializes auth state from persistent storage on app bootstrap.
   */
  async function initAuth() {
    const isLocal = localStorage.getItem(STORAGE_TYPE_KEY) === 'local';
    const storage = isLocal ? localStorage : sessionStorage;

    const storedToken = storage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    const storedUserJson = storage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);

    if (storedToken && storedUserJson) {
      try {
        token.value = storedToken;
        user.value = JSON.parse(storedUserJson);

        // Background session verification
        verifySession().catch(() => {
          // Keep local state if server is momentarily unreachable
        });
      } catch {
        clearAuth();
      }
    }
  }

  /**
   * Persists authentication token and user profile.
   */
  function persistAuth(newToken: string, newUser: User, rememberMe: boolean) {
    token.value = newToken;
    user.value = newUser;
    error.value = null;

    const storageType = rememberMe ? 'local' : 'session';
    localStorage.setItem(STORAGE_TYPE_KEY, storageType);

    if (rememberMe) {
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(TOKEN_KEY, newToken);
      sessionStorage.setItem(USER_KEY, JSON.stringify(newUser));
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }

  /**
   * Clears all session and local storage.
   */
  function clearAuth() {
    token.value = null;
    user.value = null;
    error.value = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STORAGE_TYPE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  /**
   * Logs in a user with work email and master password.
   */
  async function login(email: string, password: string, rememberMe = true): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Authentication failed. Please verify credentials.');
      }

      persistAuth(data.data.token, data.data.user, rememberMe);
      return true;
    } catch (err: any) {
      // Fallback for standalone/demo testing if API server is offline or network fails
      if (
        (err.name === 'TypeError' || err.message?.includes('fetch')) &&
        email.toLowerCase() === 'sarah.lin@forma-studio.com' &&
        password === 'PrecisionDraft#2025'
      ) {
        const demoUser: User = {
          id: 'usr-sarah-lin',
          email: 'sarah.lin@forma-studio.com',
          name: 'Sarah Lin, AIA',
          role: 'Architectural Practice / BIM CAD',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const demoToken = 'mock-demo-session-token-' + Date.now();
        persistAuth(demoToken, demoUser, rememberMe);
        return true;
      }

      error.value = err.message || 'Unable to connect to Planora authentication gateway';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Registers a new professional CAD workspace account.
   */
  async function register(
    email: string,
    password: string,
    name: string,
    role = 'Architectural Practice / BIM CAD'
  ): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          name: name.trim(),
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'Registration failed. Please check your details.');
      }

      persistAuth(data.data.token, data.data.user, true);
      return true;
    } catch (err: any) {
      error.value = err.message || 'Unable to connect to Planora authentication gateway';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Verifies the active session with the backend.
   */
  async function verifySession(): Promise<boolean> {
    if (!token.value) return false;

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });

      if (!response.ok) {
        clearAuth();
        return false;
      }

      const data = await response.json();
      if (data.success && data.data) {
        user.value = data.data;
        return true;
      }
      return false;
    } catch {
      // Server may be offline, keep offline session if exists
      return !!user.value;
    }
  }

  /**
   * Logs out the user and clears state.
   */
  function logout() {
    clearAuth();
  }

  /**
   * Auto-fill demo credentials for Sarah Lin, AIA.
   */
  function setDemoCredentials() {
    return {
      email: 'sarah.lin@forma-studio.com',
      password: 'PrecisionDraft#2025',
    };
  }

  return {
    token,
    user,
    isLoading,
    error,
    isAuthenticated,
    userInitials,
    userName,
    userRole,
    userEmail,
    initAuth,
    login,
    register,
    logout,
    verifySession,
    setDemoCredentials,
  };
});
