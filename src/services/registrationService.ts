import { supabase } from '../lib/supabase';
import type { ProgramRegistration } from '../types';

interface RegisterData {
  program_id: string;
  name: string;
  email: string;
  phone: string;
  age?: number;
  is_sdy_member?: boolean;
}

export const registrationService = {
  register: async (data: RegisterData): Promise<{ success: boolean; duplicate?: boolean }> => {
    const { error } = await supabase.from('program_registrations').insert(data);
    if (error) {
      if (error.code === '23505') return { success: false, duplicate: true };
      console.error('registrationService.register:', error);
      return { success: false };
    }
    return { success: true };
  },

  getByProgram: async (programId: string): Promise<ProgramRegistration[]> => {
    const { data, error } = await supabase
      .from('program_registrations')
      .select('*')
      .eq('program_id', programId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('registrationService.getByProgram:', error);
      return [];
    }
    return (data ?? []).map(mapRegistration);
  },

  getAll: async (): Promise<(ProgramRegistration & { programTitleMn?: string; programTitleEn?: string })[]> => {
    const { data, error } = await supabase
      .from('program_registrations')
      .select('*, programs(title_mn, title_en)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('registrationService.getAll:', error);
      return [];
    }
    return (data ?? []).map((row) => {
      const reg = mapRegistration(row);
      const prog = row.programs as { title_mn: string; title_en: string } | null;
      return {
        ...reg,
        programTitle: prog ? { mn: prog.title_mn, en: prog.title_en } : undefined,
      };
    });
  },

  updateStatus: async (id: string, status: string): Promise<boolean> => {
    const { error } = await supabase
      .from('program_registrations')
      .update({ status })
      .eq('id', id);
    if (error) {
      console.error('registrationService.updateStatus:', error);
      return false;
    }
    return true;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('program_registrations')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('registrationService.delete:', error);
      return false;
    }
    return true;
  },

  getCounts: async (): Promise<Record<string, number>> => {
    const { data, error } = await supabase
      .from('program_registrations')
      .select('program_id');

    if (error) {
      console.error('registrationService.getCounts:', error);
      return {};
    }
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.program_id] = (counts[row.program_id] || 0) + 1;
    }
    return counts;
  },

  registerEvent: async (data: { event_id: string; name: string; email: string; phone?: string; message?: string }): Promise<{ success: boolean; duplicate?: boolean }> => {
    const { error } = await supabase.from('event_registrations').insert(data);
    if (error) {
      if (error.code === '23505') return { success: false, duplicate: true };
      console.error('registrationService.registerEvent:', error);
      return { success: false };
    }
    return { success: true };
  },

  getEventCounts: async (): Promise<Record<string, number>> => {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('event_id');

    if (error) {
      console.error('registrationService.getEventCounts:', error);
      return {};
    }
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      counts[row.event_id] = (counts[row.event_id] || 0) + 1;
    }
    return counts;
  },
};

function mapRegistration(row: Record<string, unknown>): ProgramRegistration {
  return {
    id: row.id as string,
    programId: row.program_id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string,
    age: row.age as number | undefined,
    isSdyMember: row.is_sdy_member as boolean | undefined,
    status: row.status as ProgramRegistration['status'],
    createdAt: row.created_at as string,
  };
}
