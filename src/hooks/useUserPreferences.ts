import { useLocalStorage } from './useLocalStorage';
import { DEFAULT_PREFERENCES, type UserPreferences, type ViewMode, type FleetTab, type SortOption } from '@/types/vehicle';
import { useCallback } from 'react';

const STORAGE_KEY = 'frota-gpm-preferences';

export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    STORAGE_KEY,
    DEFAULT_PREFERENCES
  );

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

  const setSortBy = useCallback((sortBy: SortOption) => {
    setPreferences(prev => ({ ...prev, sortBy }));
  }, [setPreferences]);

  return {
    preferences,
    setViewMode,
    setSelectedCoordinations,
    toggleCoordination,
    clearFilters,
    setActiveTab,
    setSortBy,
  };
}
