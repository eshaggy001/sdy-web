import { supabase, isAuthError, tryRefreshSession } from '../lib/supabase';

interface ProgramHighlight {
  text_mn: string;
  text_en: string;
  sort_order: number;
}

export const programService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('programs')
      .select('*, program_highlights(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('programService.getAll:', error);
      if (isAuthError(error) && await tryRefreshSession()) {
        const retry = await supabase.from('programs').select('*, program_highlights(*)').order('created_at', { ascending: false });
        if (!retry.error) return retry.data ?? [];
      }
      return [];
    }
    return data ?? [];
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('programs')
      .select('*, program_highlights(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('programService.getById:', error);
      return null;
    }
    return data;
  },

  create: async (item: Record<string, unknown>, highlights: ProgramHighlight[] = []) => {
    const id = crypto.randomUUID();
    const { error } = await supabase.from('programs').insert({ id, ...item });
    if (error) {
      console.error('programService.create:', error);
      return false;
    }

    if (highlights.length > 0) {
      const { error: hlError } = await supabase.from('program_highlights').insert(
        highlights.map((h) => ({ program_id: id, ...h }))
      );
      if (hlError) {
        console.error('programService.create highlights:', hlError);
        return false;
      }
    }

    return true;
  },

  update: async (id: string, item: Record<string, unknown>, highlights?: ProgramHighlight[]) => {
    const { error } = await supabase.from('programs').update(item).eq('id', id);
    if (error) {
      console.error('programService.update:', error);
      return false;
    }

    if (highlights !== undefined) {
      const { error: delError } = await supabase
        .from('program_highlights')
        .delete()
        .eq('program_id', id);

      if (delError) {
        console.error('programService.update delete highlights:', delError);
        return false;
      }

      if (highlights.length > 0) {
        const { error: hlError } = await supabase.from('program_highlights').insert(
          highlights.map((h) => ({ program_id: id, ...h }))
        );
        if (hlError) {
          console.error('programService.update insert highlights:', hlError);
          return false;
        }
      }
    }

    return true;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('programs').delete().eq('id', id);
    if (error) {
      console.error('programService.delete:', error);
      return false;
    }
    return true;
  },
};
