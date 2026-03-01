import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Car, Truck, Fuel, Wrench, Factory, LayoutGrid, ArrowLeft } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useCoordinations } from '@/hooks/useCoordinations';
import { CoordinationFilters } from '@/components/frota/CoordinationFilters';
import { StatCard } from '@/components/dashboard/StatCard';
import { FleetTypeChart } from '@/components/dashboard/FleetTypeChart';
import { FuelTypeChart } from '@/components/dashboard/FuelTypeChart';
import { CoordinationBarChart } from '@/components/dashboard/CoordinationBarChart';
import { ModelBarChart } from '@/components/dashboard/ModelBarChart';
import { ManufacturerBarChart } from '@/components/dashboard/ManufacturerBarChart';
import { CoordinationBalanceLineChart } from '@/components/dashboard/CoordinationBalanceLineChart';
import { DetailTable } from '@/components/dashboard/DetailTable';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardPage() {
  const [selectedCoordinations, setSelectedCoordinations] = useState<string[]>([]);
  const { data: coordinations = [] } = useCoordinations();
  const dashboard = useDashboardData(selectedCoordinations);

  const handleToggle = (id: string) => {
    setSelectedCoordinations(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  if (dashboard.isLoading) {
    return (
      <div className="min-h-screen bg-background mesh-bg p-4 pt-20 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const coordTableRows = dashboard.byCoordination.map(c => ({
    name: c.name,
    count: c.count,
    balance: `R$ ${c.totalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  }));

  const modelTableRows = dashboard.byModel.slice(0, 15).map(m => ({
    name: m.name,
    count: m.count,
  }));

  const mfrTableRows = dashboard.byManufacturer.map(m => ({
    name: m.name,
    count: m.count,
  }));

  return (
    <div className="min-h-screen bg-background mesh-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 px-3 md:px-6 flex items-center justify-between glass-panel border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold tracking-tight leading-none text-white">
              Dashboard
            </h1>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
              Painel de Inteligência
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pt-20 pb-10 px-3 md:px-6 lg:px-8 max-w-[1400px] mx-auto space-y-6">
        {/* Filters */}
        <CoordinationFilters
          coordinations={coordinations}
          selectedIds={selectedCoordinations}
          onToggle={handleToggle}
          onClear={() => setSelectedCoordinations([])}
          onSelectAll={(ids) => setSelectedCoordinations(ids)}
        />

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total de Veículos" value={dashboard.totalVehicles} icon={Car} delay={0} />
          <StatCard label="Próprios" value={dashboard.ownedCount} icon={Truck} accentColor="hsl(207, 100%, 35%)" delay={50} />
          <StatCard label="Locados" value={dashboard.rentedCount} icon={Truck} accentColor="hsl(190, 100%, 50%)" delay={100} />
          <StatCard label="Modelos" value={dashboard.distinctModels} icon={LayoutGrid} accentColor="hsl(207, 80%, 50%)" delay={150} />
          <StatCard label="Combustíveis" value={dashboard.distinctFuelTypes} icon={Fuel} accentColor="hsl(25, 95%, 53%)" delay={200} />
          <StatCard label="Fabricantes" value={dashboard.distinctManufacturers} icon={Factory} accentColor="hsl(207, 60%, 65%)" delay={250} />
        </div>

        {/* Charts Row 1: Donuts + Coordination Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FleetTypeChart data={dashboard.byFleetType} />
          <FuelTypeChart data={dashboard.byFuelType} />
          <CoordinationBarChart data={dashboard.byCoordination} />
        </div>

        {/* Charts Row 2: Models + Manufacturers + Balance Line */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ModelBarChart data={dashboard.byModel} />
          <ManufacturerBarChart data={dashboard.byManufacturer} />
          <CoordinationBalanceLineChart data={dashboard.byCoordination} />
        </div>

        {/* Detail Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailTable
            title="Coordenações"
            columns={[
              { key: 'name', label: 'Coordenação' },
              { key: 'count', label: 'Veículos', align: 'right' },
              { key: 'balance', label: 'Saldo Total', align: 'right' },
            ]}
            rows={coordTableRows}
            delay={800}
          />
          <DetailTable
            title="Modelos"
            columns={[
              { key: 'name', label: 'Modelo' },
              { key: 'count', label: 'Quantidade', align: 'right' },
            ]}
            rows={modelTableRows}
            delay={900}
          />
          <DetailTable
            title="Fabricantes"
            columns={[
              { key: 'name', label: 'Fabricante' },
              { key: 'count', label: 'Quantidade', align: 'right' },
            ]}
            rows={mfrTableRows}
            delay={1000}
          />
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;
