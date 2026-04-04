import { supabase } from '../lib/supabase';
import { logService } from '../lib/logger';
import { toServiceError } from '../lib/errors';

/**
 * Log a structured error for a failed service operation.
 * UI contracts are preserved (callers still get [] / null / false) — this
 * adds observability without breaking existing consumers.
 */
function logErr(operation: string, err: unknown) {
  const se = toServiceError(operation, err);
  logService('error', se.code, {
    operation: se.operation,
    message: se.message,
    retryable: se.retryable,
  });
}

export const eventService = {
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date_start', { ascending: false });
      if (error) {
        logErr('eventService.getAll', error);
        return [];
      }
      return data ?? [];
    } catch (err) {
      logErr('eventService.getAll', err);
      return [];
    }
  },

  getPublished: async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .in('status', ['published', 'ongoing', 'completed'])
        .order('date_start', { ascending: false });
      if (error) {
        logErr('eventService.getPublished', error);
        return [];
      }
      return data ?? [];
    } catch (err) {
      logErr('eventService.getPublished', err);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        logErr('eventService.getById', error);
        return null;
      }
      return data;
    } catch (err) {
      logErr('eventService.getById', err);
      return null;
    }
  },

  create: async (item: Record<string, unknown>) => {
    try {
      const { error } = await supabase.from('events').insert(item);
      if (error) {
        logErr('eventService.create', error);
        return false;
      }
      return true;
    } catch (err) {
      logErr('eventService.create', err);
      return false;
    }
  },

  update: async (id: string, item: Record<string, unknown>) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ ...item, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        logErr('eventService.update', error);
        return false;
      }
      return true;
    } catch (err) {
      logErr('eventService.update', err);
      return false;
    }
  },

  delete: async (id: string) => {
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) {
        logErr('eventService.delete', error);
        return false;
      }
      return true;
    } catch (err) {
      logErr('eventService.delete', err);
      return false;
    }
  },
};
