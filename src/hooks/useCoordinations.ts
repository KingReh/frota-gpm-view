import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Coordination } from '@/types/vehicle';

export function useCoordinations() {
  return useQuery({
    queryKey: ['coordinations'],
    queryFn: async (): Promise<Coordination[]> => {
      const { data, error } = await supabase
        .from('coordinations')
        .select('id, name, color, font_color, order_index')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
