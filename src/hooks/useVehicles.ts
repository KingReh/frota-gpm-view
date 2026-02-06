import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { VehicleWithDetails, Coordination } from '@/types/vehicle';

interface VehicleWithCoordination {
  id: string;
  plate: string;
  coordination_id: string | null;
  coordinations: {
    id: string;
    name: string;
    color: string;
    font_color: string;
    order_index: number;
  } | null;
}

interface UseVehiclesOptions {
  selectedCoordinations?: string[];
}

export function useVehicles({ selectedCoordinations = [] }: UseVehiclesOptions = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['vehicles', selectedCoordinations],
    queryFn: async (): Promise<{ vehicles: VehicleWithDetails[]; lastUpdated: Date | null }> => {
      // Fetch vehicle_data with updated_at for tracking last update
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicle_data')
        .select('plate, model, fleet_type, balance, manufacturer, fleet_number, location, responsible_name, updated_at');

      if (vehicleError) throw vehicleError;

      // Get the most recent updated_at timestamp
      let lastUpdated: Date | null = null;
      if (vehicleData && vehicleData.length > 0) {
        const timestamps = vehicleData
          .map(v => new Date(v.updated_at))
          .filter(d => !isNaN(d.getTime()));
        if (timestamps.length > 0) {
          lastUpdated = new Date(Math.max(...timestamps.map(d => d.getTime())));
        }
      }

      // Fetch vehicles with coordinations
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select(`
          id,
          plate,
          coordination_id,
          coordinations (
            id,
            name,
            color,
            font_color,
            order_index
          )
        `) as unknown as { data: VehicleWithCoordination[] | null; error: Error | null };

      if (vehiclesError) throw vehiclesError;

      // Fetch vehicle images
      const { data: images, error: imagesError } = await supabase
        .from('vehicle_images')
        .select('vehicle_id, image_url');

      if (imagesError) throw imagesError;

      // Create lookup maps
      const vehicleMap = new Map(
        vehicles?.map(v => [v.plate, { 
          id: v.id, 
          coordination_id: v.coordination_id,
          coordination: v.coordinations as Coordination | null
        }]) || []
      );

      const imageMap = new Map(
        images?.map(img => [img.vehicle_id, img.image_url]) || []
      );

      // Combine data
      let combined: VehicleWithDetails[] = (vehicleData || []).map(vd => {
        const vehicle = vehicleMap.get(vd.plate);
        return {
          plate: vd.plate,
          model: vd.model,
          fleet_type: vd.fleet_type,
          balance: vd.balance,
          manufacturer: vd.manufacturer,
          fleet_number: vd.fleet_number,
          location: vd.location,
          responsible_name: vd.responsible_name,
          vehicle_id: vehicle?.id || null,
          coordination: vehicle?.coordination || null,
          image_url: vehicle?.id ? imageMap.get(vehicle.id) || null : null,
        };
      });

      // Filter by coordinations if any selected
      if (selectedCoordinations.length > 0) {
        combined = combined.filter(v => 
          v.coordination && selectedCoordinations.includes(v.coordination.id)
        );
      }

      return { vehicles: combined, lastUpdated };
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Track if initial load has completed to avoid toast on first fetch
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (!query.isLoading && query.data) {
      hasLoadedRef.current = true;
    }
  }, [query.isLoading, query.data]);

  // Realtime subscription for vehicle_data updates
  useEffect(() => {
    const channel = supabase
      .channel('vehicle_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_data',
        },
        () => {
          // Invalidate and refetch on any change
          queryClient.invalidateQueries({ queryKey: ['vehicles'] });

          // Show toast only after initial load
          if (hasLoadedRef.current) {
            toast.success('Saldos atualizados', {
              description: `Dados recebidos às ${new Date().toLocaleTimeString('pt-BR')}`,
              duration: 4000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    ...query,
    data: query.data?.vehicles ?? [],
    lastUpdated: query.data?.lastUpdated ?? null,
  };
}
