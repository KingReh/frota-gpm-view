import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MOCK_MAINTENANCE_RECORDS } from '@/lib/mockData';

export interface VehicleMaintenance {
  id: string;
  plate: string;
  fleet_type: string | null;
  model: string | null;
  os_number: number | null;
  requested_date: string;
  gad_service_date: string | null;
  workshop_entry_date: string | null;
  identified_problems: string;
  created_at: string;
}

interface InsertPayload {
  plate: string;
  fleet_type?: string | null;
  model?: string | null;
  os_number?: number | null;
  requested_date: string;
  identified_problems: string;
}

interface UpdatePayload {
  gad_service_date?: string | null;
  workshop_entry_date?: string | null;
  identified_problems?: string;
}

const QUERY_KEY = ['vehicle_maintenance'];
const LOCAL_STORAGE_KEY = 'local_vehicle_maintenance';

function getLocalRecords(): VehicleMaintenance[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return MOCK_MAINTENANCE_RECORDS;
}

function saveLocalRecords(records: VehicleMaintenance[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function useVehicleMaintenance() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('vehicle_maintenance')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as VehicleMaintenance[];
        }
      } catch (err) {
        console.warn('Using local maintenance data:', err);
      }
      return getLocalRecords();
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: InsertPayload) => {
      try {
        const { error } = await (supabase as any)
          .from('vehicle_maintenance')
          .insert(payload);
        if (!error) return;
      } catch {
        // Fall back to local
      }
      const existing = getLocalRecords();
      const newRec: VehicleMaintenance = {
        id: 'm-' + Math.random().toString(36).substring(2, 9),
        plate: payload.plate,
        fleet_type: payload.fleet_type || null,
        model: payload.model || null,
        os_number: payload.os_number || null,
        requested_date: payload.requested_date,
        gad_service_date: null,
        workshop_entry_date: null,
        identified_problems: payload.identified_problems,
        created_at: new Date().toISOString(),
      };
      saveLocalRecords([newRec, ...existing]);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...payload }: UpdatePayload & { id: string }) => {
      try {
        const { error } = await (supabase as any)
          .from('vehicle_maintenance')
          .update(payload)
          .eq('id', id);
        if (!error) return;
      } catch {
        // Fall back to local
      }
      const existing = getLocalRecords();
      const updated = existing.map(item => item.id === id ? { ...item, ...payload } : item);
      saveLocalRecords(updated);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await (supabase as any)
          .from('vehicle_maintenance')
          .delete()
          .eq('id', id);
        if (!error) return;
      } catch {
        // Fall back to local
      }
      const existing = getLocalRecords();
      const filtered = existing.filter(item => item.id !== id);
      saveLocalRecords(filtered);
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
