import { supabase } from '../lib/supabase';
import { logService } from '../lib/logger';
import { toServiceError } from '../lib/errors';

function logErr(operation: string, err: unknown) {
  const se = toServiceError(operation, err);
  logService('error', se.code, {
    operation: se.operation,
    message: se.message,
    retryable: se.retryable,
  });
}

export const leaderService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('leaders')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) {
        logErr('leaderService.getAll', error);
        return [];
      }
      return data ?? [];
    } catch (err) {
      logErr('leaderService.getAll', err);
      return [];
    }
  },

  create: async (item: Record<string, unknown>) => {
    try {
      const { error } = await supabase.from('leaders').insert(item);
      if (error) {
        logErr('leaderService.create', error);
        return false;
      }
      return true;
    } catch (err) {
      logErr('leaderService.create', err);
      return false;
    }
  },

  update: async (id: string, item: Record<string, unknown>) => {
    try {
      const { error } = await supabase.from('leaders').update(item).eq('id', id);
      if (error) {
        logErr('leaderService.update', error);
        return false;
      }
      return true;
    } catch (err) {
      logErr('leaderService.update', err);
      return false;
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase.from('leaders').delete().eq('id', id);
      if (error) {
        logErr('leaderService.delete', error);
        return false;
      }
      return true;
    } catch (err) {
      logErr('leaderService.delete', err);
      return false;
    }
  },
};
