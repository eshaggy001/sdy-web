import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapStat } from '../lib/mappers';
import type { Stat } from '../types';

export function useStats() {
  const [data, setData] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: rows, error } = await supabase
          .from('stats')
          .select('*')
          .order('sort_order', { ascending: true });
        if (error) console.error('[useStats]', error.message);
        setData((rows ?? []).map(mapStat));
      } catch (err) {
        console.error('[useStats] fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading };
}
