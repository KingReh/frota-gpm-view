import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Coordination } from '@/types/vehicle';
import { MOCK_COORDINATIONS } from '@/lib/mockData';

export function useCoordinations() {
  return useQuery({
    queryKey: ['coordinations'],
    queryFn: async (): Promise<Coordination[]> => {
      try {
        const { data, error } = await supabase
          .from('coordinations')
          .select('id, name, color, font_color, order_index')
          .order('order_index', { ascending: true });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('Using local coordinations data:', err);
      }
      return MOCK_COORDINATIONS;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
