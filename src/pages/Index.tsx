import { useEffect, useState, useMemo, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { CoordinationFilters } from '@/components/frota/CoordinationFilters';
import { VehicleGrid } from '@/components/frota/VehicleGrid';
import { VehicleTable } from '@/components/frota/VehicleTable';
import { VehicleCarousel } from '@/components/frota/VehicleCarousel';
import { VehicleGridSkeleton, VehicleTableSkeleton } from '@/components/frota/VehicleSkeletons';
import { TotalBalanceStats } from '@/components/frota/TotalBalanceStats';
import { SearchBar } from '@/components/frota/SearchBar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LayoutList, Grid, MonitorPlay, Copy, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { parseBalance } from '@/lib/balance';
import { useCoordinations } from '@/hooks/useCoordinations';
import { useVehicles } from '@/hooks/useVehicles';
import { useToast } from '@/hooks/use-toast';
import { useBalanceUpdateAlert } from '@/hooks/useBalanceUpdateAlert';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { SortControl } from '@/components/frota/SortControl';
import type { FleetTab, VehicleWithDetails, SortOption } from '@/types/vehicle';

function filterBySearch(vehicles: VehicleWithDetails[], search: string): VehicleWithDetails[] {
  if (!search.trim()) return vehicles;
  const term = search.trim().toLowerCase();
  return vehicles.filter(v =>
    v.plate.toLowerCase().includes(term) ||
    (v.model && v.model.toLowerCase().includes(term))
  );
}

function sortVehicles(vehicles: VehicleWithDetails[], sortOption: SortOption): VehicleWithDetails[] {
  return [...vehicles].sort((a, b) => {
    switch (sortOption) {
      case 'plate_asc':
        return a.plate.localeCompare(b.plate);
      case 'plate_desc':
        return b.plate.localeCompare(a.plate);
      case 'balance_asc':
        return parseBalance(a.balance) - parseBalance(b.balance);
      case 'balance_desc':
        return parseBalance(b.balance) - parseBalance(a.balance);
      case 'coordination_asc':
        return (a.coordination?.name || '').localeCompare(b.coordination?.name || '');
      case 'coordination_desc':
        return (b.coordination?.name || '').localeCompare(a.coordination?.name || '');
      default:
        return 0;
    }
  });
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
    setSortOption,
  } = useUserPreferences();

  const { toast } = useToast();
  const { recentlyUpdated, triggerAlert } = useBalanceUpdateAlert();

  const onRealtimeUpdate = useCallback(() => {
    triggerAlert();
  }, [triggerAlert]);

  const { data: coordinations = [], isLoading: loadingCoordinations } = useCoordinations();

  const {
    data: vehicles = [],
    undefinedVehicles = [],
    isLoading: loadingVehicles,
    isFetching,
    lastUpdated,
    totalFleetBalance = 0,
  } = useVehicles({
    selectedCoordinations: preferences.selectedCoordinations,
    onRealtimeUpdate,
  });

  const isSynced = !isFetching;
  const isLoading = loadingCoordinations || loadingVehicles;

  const filteredVehicles = useMemo(
    () => {
      const filtered = filterBySearch(vehicles, searchQuery);
      return sortVehicles(filtered, preferences.sortOption);
    },
    [vehicles, searchQuery, preferences.sortOption]
  );

  const filteredFavorites = useMemo(
    () => {
      const allVehicles = [...vehicles, ...undefinedVehicles];
      const favorites = allVehicles.filter(v => preferences.favoritePlates?.includes(v.plate));
      const filtered = filterBySearch(favorites, searchQuery);
      return sortVehicles(filtered, preferences.sortOption);
    },
    [vehicles, undefinedVehicles, searchQuery, preferences.sortOption, preferences.favoritePlates]
  );

  const filteredUndefined = useMemo(
    () => {
      const filtered = filterBySearch(undefinedVehicles, searchQuery);
      return sortVehicles(filtered, preferences.sortOption);
    },
    [undefinedVehicles, searchQuery, preferences.sortOption]
  );

  // Apply theme based on system preference (Automotive Dark Mode default logic handled in CSS now, 
  // but keeping this to ensure 'dark' class is present if needed)
  useEffect(() => {
    // Force dark mode for automotive feel
    document.documentElement.classList.add('dark');
  }, []);

  const handleExportBalance = () => {
    // Determine which vehicles to export
    let targetVehicles: VehicleWithDetails[] = [];

    if (preferences.activeTab === 'fleet') {
      // If no coordination filter is selected, include both fleet and undefined vehicles
      if (preferences.selectedCoordinations.length === 0) {
        targetVehicles = [...filteredVehicles, ...filteredUndefined];
      } else {
        targetVehicles = filteredVehicles;
      }
    } else if (preferences.activeTab === 'favorites') {
      targetVehicles = filteredFavorites;
    } else {
      targetVehicles = filteredUndefined;
    }

    if (targetVehicles.length === 0) {
      toast({
        title: "Nenhum veículo para exportar",
        description: "A lista atual está vazia.",
        variant: "destructive",
      });
      return;
    }

    // 1. Generate individual vehicle lines
    const vehicleLines = targetVehicles.map(v => {
      const coordName = v.coordination?.name || 'IND';
      // Remove R$ and whitespace, keep comma
      const balanceValue = v.balance ? v.balance.replace('R$', '').trim() : '0,00';
      return `* ${coordName} - ${v.plate} = ${balanceValue}`;
    });

    // 2. Calculate totals by coordination
    const totalsByCoordination = targetVehicles.reduce((acc, v) => {
      const coordName = v.coordination?.name || 'IND';
      const balance = parseBalance(v.balance);

      if (!acc[coordName]) {
        acc[coordName] = 0;
      }
      acc[coordName] += balance;
      return acc;
    }, {} as Record<string, number>);

    // 3. Generate summary lines
    const summaryLines = Object.entries(totalsByCoordination)
      .sort((a, b) => a[0].localeCompare(b[0])) // Sort alphabetically by coordination name
      .map(([name, total]) => {
        const formattedTotal = total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `* ${name} = R$ ${formattedTotal}`;
      });

    // 4. Generate Date Title
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    const title = `*SALDO - ${day}/${month}/${year} às ${hours}:${minutes}*`;

    // 5. Combine everything
    const textToCopy = [
      title,
      "",
      ...vehicleLines,
      "",
      "--- TOTAL POR COORDENAÇÃO ---\n",
      ...summaryLines
    ].join('\n');

    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Saldo Exportado!",
        description: `${targetVehicles.length} veículos e totais copiados.`,
      });
    }).catch(() => {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível copiar para a área de transferência.",
        variant: "destructive"
      });
    });
  };

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
    <DashboardLayout
      viewMode={preferences.viewMode}
      setViewMode={setViewMode}
      isSynced={isSynced}
      lastUpdated={lastUpdated ? new Date(lastUpdated) : null}
      recentlyUpdated={recentlyUpdated}
      vehicles={[...vehicles, ...undefinedVehicles]}
      coordinations={coordinations}
      selectedCoordinations={preferences.selectedCoordinations}
    >
      <div className="space-y-8">
        {/* 1. Global Filters (Centered at Top) */}
        <div className="flex justify-center w-full px-2 md:px-0">
          <CoordinationFilters
            coordinations={coordinations}
            selectedIds={preferences.selectedCoordinations}
            onToggle={toggleCoordination}
            onClear={clearFilters}
            onSelectAll={setSelectedCoordinations}
          />
        </div>

        {/* 2. Statistical Context Cards */}
        <TotalBalanceStats
          vehicles={preferences.activeTab === 'fleet' ? filteredVehicles : filteredUndefined}
          totalFleetBalance={totalFleetBalance}
        />

        <Tabs
          value={preferences.activeTab}
          onValueChange={(value) => setActiveTab(value as FleetTab)}
          className="space-y-8"
        >
          {/* 3. Main Control Bar: Tabs + View Selection + Search */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 md:gap-6 lg:gap-8 glass-panel p-3 md:p-4 rounded-xl md:rounded-[24px] sticky top-16 md:top-20 z-40 bg-black/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-8">
              <TabsList className="bg-transparent p-0 gap-2 shrink-0 w-full md:w-auto flex overflow-x-auto scrollbar-hide">
                <TabsTrigger
                  value="fleet"
                  className="rounded-lg md:rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-3 md:px-8 py-2 text-xs md:text-sm transition-all duration-300 font-bold flex-1 md:flex-none whitespace-nowrap"
                >
                  Frota Geral
                </TabsTrigger>
                <TabsTrigger
                  value="undefined"
                  className="rounded-lg md:rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white px-3 md:px-8 py-2 text-xs md:text-sm gap-2 transition-all duration-300 font-bold flex-1 md:flex-none whitespace-nowrap"
                >
                  Indefinidos
                  {!isLoading && undefinedVehicles.length > 0 && (
                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 px-1.5 py-0.5 text-[9px] md:text-xs">
                      {undefinedVehicles.length}
                    </Badge>
                  )}
                </TabsTrigger>

                <TabsTrigger
                  value="favorites"
                  className="rounded-lg md:rounded-xl data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-400 px-3 md:px-8 py-2 text-xs md:text-sm transition-all duration-300 font-bold flex-1 md:flex-none whitespace-nowrap gap-2"
                >
                  <Star className="w-3 h-3 md:w-3.5 md:h-3.5" fill={preferences.activeTab === 'favorites' ? 'currentColor' : 'none'} />
                  <span className="hidden md:inline">Favoritos</span>
                  <span className="md:hidden">Fav</span>
                  {preferences.favoritePlates?.length > 0 && (
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 px-1.5 py-0.5 text-[9px] md:text-xs">
                      {preferences.favoritePlates.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="hidden md:block w-px h-8 bg-white/10" />

              {/* View Selection & Sort */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center justify-center md:justify-start gap-1 md:gap-2 bg-white/5 p-1 rounded-lg border border-white/5 shadow-inner w-full md:w-auto">
                  {[
                    { mode: 'table', icon: LayoutList, title: 'Tabela' },
                    { mode: 'card', icon: Grid, title: 'Cards' },
                    { mode: 'carousel', icon: MonitorPlay, title: 'Carousel' }
                  ].map((item) => (
                    <button
                      key={item.mode}
                      onClick={() => setViewMode(item.mode as any)}
                      className={cn(
                        "p-1.5 md:p-2 rounded-md transition-all duration-300 flex-1 md:flex-none flex justify-center",
                        preferences.viewMode === item.mode
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-zinc-500 hover:text-white hover:bg-white/5"
                      )}
                      title={item.title}
                    >
                      <item.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>

                <SortControl
                  currentSort={preferences.sortOption}
                  onSortChange={setSortOption}
                />
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportBalance}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all border border-white/5 hover:border-white/10 group"
                title="Exportar Saldo (Copiar para área de transferência)"
              >
                <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Exportar</span>
              </button>
            </div>

            <div className="w-full lg:w-auto min-w-0 lg:min-w-[300px]">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>

          <TabsContent value="fleet" className="space-y-8 focus-visible:ring-0">
            <div className="min-h-[500px]">
              {renderVehicleContent(filteredVehicles)}
            </div>
          </TabsContent>

          <TabsContent value="undefined" className="space-y-8 focus-visible:ring-0">
            <div className="min-h-[500px]">
              {renderVehicleContent(filteredUndefined)}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-8 focus-visible:ring-0">
            <div className="min-h-[500px]">
              {renderVehicleContent(filteredFavorites)}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Index;
