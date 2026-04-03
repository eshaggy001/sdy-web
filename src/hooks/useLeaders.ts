import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapLeader } from '../lib/mappers';
import type { Leader } from '../types';

export function useLeaders() {
  const [data, setData] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('leaders')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data: rows }) => {
        setData((rows ?? []).map(mapLeader));
        setLoading(false);
      });
  }, []);

  return { data, loading };
}
