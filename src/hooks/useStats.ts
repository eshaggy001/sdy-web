import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapStat } from '../lib/mappers';
import type { Stat } from '../types';

export function useStats() {
  const [data, setData] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('stats')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data: rows }) => {
        setData((rows ?? []).map(mapStat));
        setLoading(false);
      });
  }, []);

  return { data, loading };
}
