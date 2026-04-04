import { useState, useEffect } from 'react';
import { supabase, isAuthError, tryRefreshSession } from '../lib/supabase';
import { mapProgram } from '../lib/mappers';
import type { Program } from '../types';

export function usePrograms() {
  const [data, setData] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        let { data: rows, error } = await supabase
          .from('programs')
          .select('*, program_highlights(*)')
          .order('created_at', { ascending: true });

        if (error && isAuthError(error) && await tryRefreshSession()) {
          const retry = await supabase.from('programs').select('*, program_highlights(*)').order('created_at', { ascending: true });
          rows = retry.data;
          error = retry.error;
        }

        if (error) {
          console.error('[usePrograms]', error.message);
          if (isAuthError(error)) setAuthError(true);
        }
        setData((rows ?? []).map(mapProgram));
      } catch (err) {
        console.error('[usePrograms] fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { data, loading, authError };
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
