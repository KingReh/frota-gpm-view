import { useEffect } from 'react';
import { AppHeader } from '@/components/frota/AppHeader';
import { CoordinationFilters } from '@/components/frota/CoordinationFilters';
import { BalanceStats } from '@/components/frota/BalanceStats';
import { ViewModeToggle } from '@/components/frota/ViewModeToggle';
import { VehicleGrid } from '@/components/frota/VehicleGrid';
import { VehicleTable } from '@/components/frota/VehicleTable';
import { VehicleCarousel } from '@/components/frota/VehicleCarousel';
import { VehicleGridSkeleton, VehicleTableSkeleton } from '@/components/frota/VehicleSkeletons';
import { useCoordinations } from '@/hooks/useCoordinations';
import { useVehicles } from '@/hooks/useVehicles';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const Index = () => {
  const { 
    preferences, 
    setViewMode, 
    toggleCoordination, 
    clearFilters,
    setSelectedCoordinations,
  } = useUserPreferences();

  const { data: coordinations = [], isLoading: loadingCoordinations } = useCoordinations();
  
  const { 
    data: vehicles = [], 
    isLoading: loadingVehicles,
    isFetching,
    lastUpdated,
  } = useVehicles({ 
    selectedCoordinations: preferences.selectedCoordinations 
  });

  const isSynced = !isFetching;
  const isLoading = loadingCoordinations || loadingVehicles;

  // Apply theme based on system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = (e: MediaQueryList | MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme(mediaQuery);
    mediaQuery.addEventListener('change', applyTheme);
    
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return preferences.viewMode === 'table' 
        ? <VehicleTableSkeleton /> 
        : <VehicleGridSkeleton />;
    }

    switch (preferences.viewMode) {
      case 'table':
        return <VehicleTable vehicles={vehicles} />;
      case 'carousel':
        return <VehicleCarousel vehicles={vehicles} />;
      case 'card':
      default:
        return <VehicleGrid vehicles={vehicles} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader isSynced={isSynced} lastUpdated={lastUpdated} />
      
      <CoordinationFilters
        coordinations={coordinations}
        selectedIds={preferences.selectedCoordinations}
        onToggle={toggleCoordination}
        onClear={clearFilters}
        onSelectAll={setSelectedCoordinations}
      />
      
      <BalanceStats vehicles={vehicles} />
      
      <ViewModeToggle
        value={preferences.viewMode}
        onChange={setViewMode}
      />

      <main className="pb-safe">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
