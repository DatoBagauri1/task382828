import { create } from 'zustand';

import {
  restoreAuthState,
  signIn as providerSignIn,
  signOut as providerSignOut,
  signUp as providerSignUp,
  type BackendMode,
} from '@/lib/data-provider';
import type { SessionUser, UserProfile } from '@/types';

type AuthState = {
  backendMode: BackendMode;
  sessionUser: SessionUser | null;
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  sync: (payload: {
    backendMode: BackendMode;
    sessionUser: SessionUser | null;
    profile: UserProfile | null;
  }) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  backendMode: 'demo',
  sessionUser: null,
  profile: null,
  isLoading: true,
  error: null,
  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const restored = await restoreAuthState();
      set({
        backendMode: restored.mode,
        sessionUser: restored.sessionUser,
        profile: restored.profile,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize authentication.',
        isLoading: false,
      });
    }
  },
  sync: ({ backendMode, sessionUser, profile }) =>
    set({
      backendMode,
      sessionUser,
      profile,
      isLoading: false,
    }),
  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await providerSignIn(email, password);
      set({
        backendMode: result.mode,
        sessionUser: result.sessionUser,
        profile: result.profile,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to sign in.',
        isLoading: false,
      });
      throw error;
    }
  },
  signUp: async (fullName, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await providerSignUp(fullName, email, password);
      set({
        backendMode: result.mode,
        sessionUser: result.sessionUser,
        profile: result.profile,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to sign up.',
        isLoading: false,
      });
      throw error;
    }
  },
  signOut: async () => {
    await providerSignOut();
    set({
      sessionUser: null,
      profile: null,
      isLoading: false,
      error: null,
    });
  },
}));
