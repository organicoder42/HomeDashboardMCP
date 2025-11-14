'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'high-contrast';
export type FontSize = 'small' | 'medium' | 'large' | 'x-large';

export interface UserPreferences {
  theme: Theme;
  fontSize: FontSize;
  useDyslexicFont: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderOptimized: boolean;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>;
  isLoading: boolean;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  fontSize: 'medium',
  useDyslexicFont: false,
  reducedMotion: false,
  highContrast: false,
  screenReaderOptimized: false,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Apply theme and font size to document
  useEffect(() => {
    const root = document.documentElement;

    // Apply theme
    root.setAttribute('data-theme', preferences.theme);

    // Apply font size
    root.setAttribute('data-font-size', preferences.fontSize);

    // Apply dyslexic font
    if (preferences.useDyslexicFont) {
      root.classList.add('dyslexic-font');
    } else {
      root.classList.remove('dyslexic-font');
    }

    // Apply reduced motion
    if (preferences.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Apply high contrast
    if (preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [preferences]);

  async function loadPreferences() {
    try {
      const response = await fetch('/api/preferences');
      if (response.ok) {
        const data = await response.json();
        setPreferences({
          theme: data.theme || defaultPreferences.theme,
          fontSize: data.fontSize || defaultPreferences.fontSize,
          useDyslexicFont: data.useDyslexicFont || defaultPreferences.useDyslexicFont,
          reducedMotion: data.reducedMotion || defaultPreferences.reducedMotion,
          highContrast: data.highContrast || defaultPreferences.highContrast,
          screenReaderOptimized: data.screenReaderOptimized || defaultPreferences.screenReaderOptimized,
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updatePreference<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) {
    // Optimistic update
    setPreferences(prev => ({ ...prev, [key]: value }));

    try {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        // Revert on error
        await loadPreferences();
      }
    } catch (error) {
      console.error('Error updating preference:', error);
      // Revert on error
      await loadPreferences();
    }
  }

  return (
    <PreferencesContext.Provider value={{ preferences, updatePreference, isLoading }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
