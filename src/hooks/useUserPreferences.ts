import { useLocalStorage } from './useLocalStorage';
import { DEFAULT_PREFERENCES, type UserPreferences, type ViewMode, type FleetTab, type SortOption } from '@/types/vehicle';
import { useCallback } from 'react';

const STORAGE_KEY = 'frota-gpm-preferences-v2';

function getInitialPreferences(): UserPreferences {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
  try {
    const current = window.localStorage.getItem(STORAGE_KEY);
    if (current) {
      const parsed = JSON.parse(current);
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        sortOption: parsed.sortOption || 'balance_desc',
      };
    }

    // Check legacy storage to migrate preferences
    const legacy = window.localStorage.getItem('frota-gpm-preferences');
    if (legacy) {
      const parsed = JSON.parse(legacy);
      return {
        ...DEFAULT_PREFERENCES,
        viewMode: parsed.viewMode || DEFAULT_PREFERENCES.viewMode,
        selectedCoordinations: parsed.selectedCoordinations || DEFAULT_PREFERENCES.selectedCoordinations,
        activeTab: parsed.activeTab || DEFAULT_PREFERENCES.activeTab,
        favoritePlates: parsed.favoritePlates || DEFAULT_PREFERENCES.favoritePlates,
        // Ensure default is highest balance to lowest (balance_desc)
        sortOption: 'balance_desc',
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_PREFERENCES;
}

export function useUserPreferences() {
  const [rawPreferences, setPreferences] = useLocalStorage<UserPreferences>(
    STORAGE_KEY,
    getInitialPreferences()
  );

  // Merge with defaults to handle missing fields from older stored versions
  const preferences: UserPreferences = {
    ...DEFAULT_PREFERENCES,
    ...rawPreferences,
    sortOption: rawPreferences.sortOption || 'balance_desc',
  };

  const setViewMode = useCallback((viewMode: ViewMode) => {
    setPreferences(prev => ({ ...prev, viewMode }));
  }, [setPreferences]);

  const setSelectedCoordinations = useCallback((coordinations: string[]) => {
    setPreferences(prev => ({ ...prev, selectedCoordinations: coordinations }));
  }, [setPreferences]);

  const toggleCoordination = useCallback((coordinationId: string) => {
    setPreferences(prev => {
      const isSelected = prev.selectedCoordinations.includes(coordinationId);
      return {
        ...prev,
        selectedCoordinations: isSelected
          ? prev.selectedCoordinations.filter(id => id !== coordinationId)
          : [...prev.selectedCoordinations, coordinationId],
      };
    });
  }, [setPreferences]);

  const clearFilters = useCallback(() => {
    setPreferences(prev => ({ ...prev, selectedCoordinations: [] }));
  }, [setPreferences]);

  const setActiveTab = useCallback((activeTab: FleetTab) => {
    setPreferences(prev => ({ ...prev, activeTab }));
  }, [setPreferences]);

  const setSortOption = useCallback((sortOption: SortOption) => {
    setPreferences(prev => ({ ...prev, sortOption }));
  }, [setPreferences]);

  const toggleFavorite = useCallback((plate: string) => {
    setPreferences(prev => {
      // Create new array if undefined (backward compatibility)
      const currentFavorites = prev.favoritePlates || [];
      const isFavorite = currentFavorites.includes(plate);

      return {
        ...prev,
        favoritePlates: isFavorite
          ? currentFavorites.filter(p => p !== plate)
          : [...currentFavorites, plate],
      };
    });
  }, [setPreferences]);

  return {
    preferences,
    setViewMode,
    setSelectedCoordinations,
    toggleCoordination,
    clearFilters,
    setActiveTab,
    setSortOption,
    toggleFavorite,
  };
}
