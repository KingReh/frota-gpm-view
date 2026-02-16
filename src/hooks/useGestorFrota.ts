import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase
        .from('gestor_frota')
        .select('name, telefone, email, status_telefone, status_email')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
