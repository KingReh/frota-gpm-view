import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
    queryFn: async (): Promise<VehicleWithDetails[]> => {
      // Fetch vehicle_data
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicle_data')
        .select('plate, model, fleet_type, balance, manufacturer, fleet_number, location, responsible_name');

      if (vehicleError) throw vehicleError;

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
          ...vd,
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

      return combined;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
