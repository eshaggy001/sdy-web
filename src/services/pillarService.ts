import { supabase } from '../lib/supabase';

export const pillarService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('pillars')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('pillarService.getAll:', error);
      return [];
    }
    return data ?? [];
  },

  create: async (item: Record<string, unknown>) => {
    const id = crypto.randomUUID();
    const { error } = await supabase.from('pillars').insert({ id, ...item });
    if (error) {
      console.error('pillarService.create:', error);
      return false;
    }
    return true;
  },

  update: async (id: string, item: Record<string, unknown>) => {
    const { error } = await supabase.from('pillars').update(item).eq('id', id);
    if (error) {
      console.error('pillarService.update:', error);
      return false;
    }
    return true;
  },

  delete: async (id: string) => {
    const { error } = await supabase.from('pillars').delete().eq('id', id);
    if (error) {
      console.error('pillarService.delete:', error);
      return false;
    }
    return true;
  },
};
