import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapLeader } from '../lib/mappers';
import type { Leader } from '../types';

export function useLeaders() {
  const [data, setData] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: rows, error } = await supabase
          .from('leaders')
          .select('*')
          .order('sort_order', { ascending: true });
        if (error) console.error('[useLeaders]', error.message);
        setData((rows ?? []).map(mapLeader));
      } catch (err) {
        console.error('[useLeaders] fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading };
}
