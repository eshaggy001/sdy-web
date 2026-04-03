import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapProgram } from '../lib/mappers';
import type { Program } from '../types';

export function usePrograms() {
  const [data, setData] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: rows, error } = await supabase
          .from('programs')
          .select('*, program_highlights(*)')
          .order('created_at', { ascending: true });
        if (error) console.error('[usePrograms]', error.message);
        setData((rows ?? []).map(mapProgram));
      } catch (err) {
        console.error('[usePrograms] fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading };
}

export function useProgram(id: string | undefined) {
  const [data, setData] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const fetch = async () => {
      try {
        const { data: row, error } = await supabase
          .from('programs')
          .select('*, program_highlights(*)')
          .eq('id', id)
          .single();
        if (error) console.error('[useProgram]', error.message);
        setData(row ? mapProgram(row) : null);
      } catch (err) {
        console.error('[useProgram] fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { data, loading };
}
