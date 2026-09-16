// theme.js - Production Theme Manager (System Default + Manual Override + LocalStorage)
'use client';

const THEME_KEY = 'sei_theme_preference_v1';

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  
  // 1. Check user preference in localStorage
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }

  // 2. Default to system theme
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

export function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function saveThemePreference(theme) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}
