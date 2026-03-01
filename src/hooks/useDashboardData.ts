import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Coordination } from '@/types/vehicle';

interface CoordinationAgg {
  name: string;
  color: string;
  count: number;
  totalBalance: number;
}

interface NameCount {
  name: string;
  count: number;
}

export interface DashboardData {
  totalVehicles: number;
  ownedCount: number;
  rentedCount: number;
  distinctModels: number;
  distinctFuelTypes: number;
  distinctManufacturers: number;
  byCoordination: CoordinationAgg[];
  byFleetType: NameCount[];
  byFuelType: NameCount[];
  byModel: NameCount[];
  byManufacturer: NameCount[];
  isLoading: boolean;
}

export function useDashboardData(selectedCoordinations: string[]) {
  // Fetch all vehicle_data
  const vehicleDataQuery = useQuery({
    queryKey: ['dashboard-vehicle-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_data')
        .select('plate, fleet_type, model, manufacturer, balance');
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });

  // Fetch vehicles with coordination join
  const vehiclesQuery = useQuery({
    queryKey: ['dashboard-vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('plate, fuel_type, coordination_id, coordinations:coordination_id(id, name, color)');
      if (error) throw error;
      return data || [];
    },
    staleTime: 30_000,
  });

  const result = useMemo((): Omit<DashboardData, 'isLoading'> => {
    const vdRaw = vehicleDataQuery.data || [];
    const vRaw = vehiclesQuery.data || [];

    // Build plate -> vehicle lookup
    const vehicleMap = new Map<string, { fuel_type: string | null; coordination_id: string | null; coord_name: string | null; coord_color: string | null }>();
    for (const v of vRaw) {
      const coord = v.coordinations as unknown as { id: string; name: string; color: string } | null;
      vehicleMap.set(v.plate, {
        fuel_type: v.fuel_type,
        coordination_id: v.coordination_id,
        coord_name: coord?.name || null,
        coord_color: coord?.color || null,
      });
    }

    // Filter by coordination if selected
    let filteredVD = vdRaw;
    if (selectedCoordinations.length > 0) {
      const allowedPlates = new Set<string>();
      for (const v of vRaw) {
        if (v.coordination_id && selectedCoordinations.includes(v.coordination_id)) {
          allowedPlates.add(v.plate);
        }
      }
      filteredVD = vdRaw.filter(d => allowedPlates.has(d.plate));
    }

    // Aggregations
    let ownedCount = 0;
    let rentedCount = 0;
    const modelMap = new Map<string, number>();
    const manufacturerMap = new Map<string, number>();
    const fuelTypeMap = new Map<string, number>();
    const coordMap = new Map<string, { name: string; color: string; count: number; totalBalance: number }>();
    const fleetTypeMap = new Map<string, number>();

    for (const d of filteredVD) {
      // Fleet type
      const ft = (d.fleet_type || '').toUpperCase();
      if (ft === 'PROPRIO' || ft === 'PROPRIA') ownedCount++;
      else if (ft === 'LOCADO') rentedCount++;
      if (ft) fleetTypeMap.set(ft === 'PROPRIA' ? 'PROPRIO' : ft, (fleetTypeMap.get(ft === 'PROPRIA' ? 'PROPRIO' : ft) || 0) + 1);

      // Model
      const model = d.model?.trim();
      if (model) modelMap.set(model, (modelMap.get(model) || 0) + 1);

      // Manufacturer
      const mfr = d.manufacturer?.trim();
      if (mfr) manufacturerMap.set(mfr, (manufacturerMap.get(mfr) || 0) + 1);

      // Fuel type from vehicles table
      const vInfo = vehicleMap.get(d.plate);
      const fuelType = vInfo?.fuel_type?.trim();
      if (fuelType) fuelTypeMap.set(fuelType, (fuelTypeMap.get(fuelType) || 0) + 1);

      // Coordination
      if (vInfo?.coord_name && vInfo?.coord_color) {
        const key = vInfo.coord_name;
        const existing = coordMap.get(key) || { name: key, color: vInfo.coord_color, count: 0, totalBalance: 0 };
        existing.count++;
        const bal = parseFloat((d.balance || '0').replace(/[^\d.,-]/g, '').replace(',', '.'));
        existing.totalBalance += isNaN(bal) ? 0 : bal;
        coordMap.set(key, existing);
      }
    }

    const toSorted = (map: Map<string, number>): NameCount[] =>
      Array.from(map.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return {
      totalVehicles: filteredVD.length,
      ownedCount,
      rentedCount,
      distinctModels: modelMap.size,
      distinctFuelTypes: fuelTypeMap.size,
      distinctManufacturers: manufacturerMap.size,
      byCoordination: Array.from(coordMap.values()).sort((a, b) => b.count - a.count),
      byFleetType: toSorted(fleetTypeMap),
      byFuelType: toSorted(fuelTypeMap),
      byModel: toSorted(modelMap),
      byManufacturer: toSorted(manufacturerMap),
    };
  }, [vehicleDataQuery.data, vehiclesQuery.data, selectedCoordinations]);

  return {
    ...result,
    isLoading: vehicleDataQuery.isLoading || vehiclesQuery.isLoading,
  };
}
