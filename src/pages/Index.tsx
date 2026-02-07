import { useEffect, useState, useMemo } from 'react';
import { AppHeader } from '@/components/frota/AppHeader';
import { CoordinationFilters } from '@/components/frota/CoordinationFilters';
import { BalanceStats } from '@/components/frota/BalanceStats';
import { ViewModeToggle } from '@/components/frota/ViewModeToggle';
import { VehicleGrid } from '@/components/frota/VehicleGrid';
import { VehicleTable } from '@/components/frota/VehicleTable';
import { VehicleCarousel } from '@/components/frota/VehicleCarousel';
import { VehicleGridSkeleton, VehicleTableSkeleton } from '@/components/frota/VehicleSkeletons';
import { SearchBar } from '@/components/frota/SearchBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useCoordinations } from '@/hooks/useCoordinations';
import { useVehicles } from '@/hooks/useVehicles';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import type { FleetTab, VehicleWithDetails } from '@/types/vehicle';

function filterBySearch(vehicles: VehicleWithDetails[], search: string): VehicleWithDetails[] {
  if (!search.trim()) return vehicles;
  const term = search.trim().toLowerCase();
  return vehicles.filter(v =>
    v.plate.toLowerCase().includes(term) ||
    (v.model && v.model.toLowerCase().includes(term))
  );
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { 
    preferences, 
    setViewMode, 
    toggleCoordination, 
    clearFilters,
    setSelectedCoordinations,
    setActiveTab,
  } = useUserPreferences();

  const { data: coordinations = [], isLoading: loadingCoordinations } = useCoordinations();
  
  const { 
    data: vehicles = [], 
    undefinedVehicles = [],
    isLoading: loadingVehicles,
    isFetching,
    lastUpdated,
  } = useVehicles({ 
    selectedCoordinations: preferences.selectedCoordinations 
  });

  const isSynced = !isFetching;
  const isLoading = loadingCoordinations || loadingVehicles;

  const filteredVehicles = useMemo(
    () => filterBySearch(vehicles, searchQuery),
    [vehicles, searchQuery]
  );

  const filteredUndefined = useMemo(
    () => filterBySearch(undefinedVehicles, searchQuery),
    [undefinedVehicles, searchQuery]
  );

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

  const renderVehicleContent = (vehicleList: VehicleWithDetails[]) => {
    if (isLoading) {
      return preferences.viewMode === 'table' 
        ? <VehicleTableSkeleton /> 
        : <VehicleGridSkeleton />;
    }

    switch (preferences.viewMode) {
      case 'table':
        return <VehicleTable vehicles={vehicleList} />;
      case 'carousel':
        return <VehicleCarousel vehicles={vehicleList} />;
      case 'card':
      default:
        return <VehicleGrid vehicles={vehicleList} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader isSynced={isSynced} lastUpdated={lastUpdated} />
      
      <Tabs
        value={preferences.activeTab}
        onValueChange={(value) => setActiveTab(value as FleetTab)}
      >
        <div className="border-b bg-background sticky top-0 z-10">
          <TabsList className="w-full justify-start rounded-none border-none bg-transparent h-auto p-0">
            <TabsTrigger
              value="fleet"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium"
            >
              Frota
            </TabsTrigger>
            <TabsTrigger
              value="undefined"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium gap-2"
            >
              Indefinidos
              {!isLoading && undefinedVehicles.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1.5 text-xs">
                  {undefinedVehicles.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <TabsContent value="fleet" className="mt-0">
          <CoordinationFilters
            coordinations={coordinations}
            selectedIds={preferences.selectedCoordinations}
            onToggle={toggleCoordination}
            onClear={clearFilters}
            onSelectAll={setSelectedCoordinations}
          />
          
          <BalanceStats vehicles={filteredVehicles} />
          
          <ViewModeToggle
            value={preferences.viewMode}
            onChange={setViewMode}
          />

          <main className="pb-safe">
            {renderVehicleContent(filteredVehicles)}
          </main>
        </TabsContent>

        <TabsContent value="undefined" className="mt-0">
          <BalanceStats vehicles={filteredUndefined} />
          
          <ViewModeToggle
            value={preferences.viewMode}
            onChange={setViewMode}
          />

          <main className="pb-safe">
            {renderVehicleContent(filteredUndefined)}
          </main>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
