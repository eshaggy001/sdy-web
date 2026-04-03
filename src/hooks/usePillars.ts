import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapPillar } from '../lib/mappers';
import type { Pillar } from '../types';

export function usePillars() {
  const [data, setData] = useState<Pillar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('pillars')
      .select('*')
      .order('sort_order', { ascending: true })
      .then(({ data: rows }) => {
        setData((rows ?? []).map(mapPillar));
        setLoading(false);
      });
  }, []);

  return { data, loading };
}
