import { supabase } from '../lib/supabase';

export const leaderService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('leaders')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('leaderService.getAll:', error);
      return [];
    }
    return data ?? [];
  },

  create: async (item: Record<string, unknown>) => {
    const { error } = await supabase.from('leaders').insert(item);
    if (error) {
      console.error('leaderService.create:', error);
      return false;
    }
    return true;
  },

  update: async (id: string, item: Record<string, unknown>) => {
    const { error } = await supabase.from('leaders').update(item).eq('id', id);
    if (error) {
      console.error('leaderService.update:', error);
      return false;
    }
    return true;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('leaders').delete().eq('id', id);
    if (error) {
      console.error('leaderService.delete:', error);
      return false;
    }
    return true;
  },
};
