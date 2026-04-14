import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VehicleMaintenance {
  id: string;
  plate: string;
  fleet_type: string | null;
  model: string | null;
  os_number: number | null;
  requested_date: string;
  gad_service_date: string | null;
  workshop_entry_date: string | null;
  created_at: string;
}

interface InsertPayload {
  plate: string;
  fleet_type?: string | null;
  model?: string | null;
  os_number?: number | null;
  requested_date: string;
}

interface UpdatePayload {
  gad_service_date?: string | null;
  workshop_entry_date?: string | null;
}

const QUERY_KEY = ['vehicle_maintenance'];

export function useVehicleMaintenance() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('vehicle_maintenance')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as VehicleMaintenance[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: InsertPayload) => {
      const { error } = await (supabase as any)
        .from('vehicle_maintenance')
        .insert(payload);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: UpdatePayload & { id: string }) => {
      const { error } = await (supabase as any)
        .from('vehicle_maintenance')
        .update(payload)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('vehicle_maintenance')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    records: query.data ?? [],
    isLoading: query.isLoading,
    add: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
  };
}
