import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapPillar } from '../lib/mappers';
import type { Pillar } from '../types';

export function usePillars() {
  const [data, setData] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: rows, error } = await supabase
          .from('pillars')
          .select('*')
          .order('sort_order', { ascending: true });
        if (error) console.error('[usePillars]', error.message);
        setData((rows ?? []).map(mapPillar));
      } catch (err) {
        console.error('[usePillars] fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading };
}
