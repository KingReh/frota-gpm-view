import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MOCK_GESTOR_FROTA } from '@/lib/mockData';

export interface GestorFrota {
  name: string;
  telefone: string;
  email: string;
  status_telefone: boolean | null;
  status_email: boolean | null;
}

export function useGestorFrota() {
  return useQuery<GestorFrota | null>({
    queryKey: ['gestor-frota'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('gestor_frota')
          .select('name, telefone, email, status_telefone, status_email')
          .limit(1)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Using local gestor frota data:', err);
      }
      return MOCK_GESTOR_FROTA;
    },
    staleTime: 5 * 60 * 1000,
  });
}
