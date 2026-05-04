'use client';

import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';
export type ThemePreference = ThemeMode | 'system';

type ThemeState = {
  theme: ThemeMode;
  preference: ThemePreference;
  hydrated: boolean;
  setPreference: (next: ThemePreference) => void;
  toggle: () => void;
  hydrate: () => void;
};

const STORAGE_KEY = 'kfs-theme-preference';
let stopSystemThemeListener: (() => void) | null = null;

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function getStoredPreference(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'system';
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }

  return 'system';
}

function resolveTheme(preference: ThemePreference): ThemeMode {
  return preference === 'system' ? getSystemTheme() : preference;
}

function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  preference: 'system',
  hydrated: false,
  setPreference: (next) => {
    const theme = resolveTheme(next);
    applyTheme(theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
    set({ theme, preference: next });
  },
  toggle: () => {
    const current = get().preference;
    const next: ThemePreference = current === 'system' ? 'light' : current === 'light' ? 'dark' : 'system';
    get().setPreference(next);
  },
  hydrate: () => {
    if (typeof window === 'undefined') {
      return;
    }

    const preference = getStoredPreference();
    const theme = resolveTheme(preference);
    applyTheme(theme);
    set({ theme, preference, hydrated: true });

    stopSystemThemeListener?.();
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = () => {
      if (get().preference !== 'system') {
        return;
      }

      const nextTheme = getSystemTheme();
      applyTheme(nextTheme);
      set({ theme: nextTheme });
    };

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);
      stopSystemThemeListener = () => media.removeEventListener('change', handleChange);
      return;
    }

    media.addListener(handleChange);
    stopSystemThemeListener = () => media.removeListener(handleChange);
  },
}));
