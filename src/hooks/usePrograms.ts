import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { mapProgram } from '../lib/mappers';
import type { Program } from '../types';

export function usePrograms() {
  const [data, setData] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('programs')
      .select('*, program_highlights(*)')
      .order('created_at', { ascending: true })
      .then(({ data: rows }) => {
        setData((rows ?? []).map(mapProgram));
        setLoading(false);
      });
  }, []);

  return { data, loading };
}

export function useProgram(id: string | undefined) {
  const [data, setData] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    supabase
      .from('programs')
      .select('*, program_highlights(*)')
      .eq('id', id)
      .single()
      .then(({ data: row }) => {
        setData(row ? mapProgram(row) : null);
        setLoading(false);
      });
  }, [id]);

  return { data, loading };
}
