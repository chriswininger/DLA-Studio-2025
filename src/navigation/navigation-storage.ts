const NAVIGATION_STORAGE_KEY = 'dlasim-navigation-tab';

export const navigationStorage = {
  getStoredTab: (): string | null => {
    try {
      return localStorage.getItem(NAVIGATION_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to read navigation from localStorage:', error);
      return null;
    }
  },

  setStoredTab: (tab: string): void => {
    try {
      localStorage.setItem(NAVIGATION_STORAGE_KEY, tab);
    } catch (error) {
      console.warn('Failed to save navigation to localStorage:', error);
    }
  },

  clearStoredTab: (): void => {
    try {
      localStorage.removeItem(NAVIGATION_STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear navigation from localStorage:', error);
    }
  },
};
