import { useState, useEffect } from 'react';
import { registrationService } from '../services/registrationService';
import type { ProgramRegistration, EventRegistration } from '../types';

export function useRegistrationCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await registrationService.getCounts();
      setCounts(data);
    } catch (err) {
      console.error('[useRegistrationCounts]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return { counts, loading, refresh };
}

export function useProgramRegistrations(programId: string | undefined) {
  const [data, setData] = useState<ProgramRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!programId) { setLoading(false); return; }
    try {
      const rows = await registrationService.getByProgram(programId);
      setData(rows);
    } catch (err) {
      console.error('[useProgramRegistrations]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [programId]);

  return { data, loading, refresh };
}

export function useEventRegistrationCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const data = await registrationService.getEventCounts();
      setCounts(data);
    } catch (err) {
      console.error('[useEventRegistrationCounts]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return { counts, loading, refresh };
}

export function useEventRegistrations(eventId: string | undefined) {
  const [data, setData] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!eventId) { setLoading(false); return; }
    try {
      const rows = await registrationService.getByEvent(eventId);
      setData(rows);
    } catch (err) {
      console.error('[useEventRegistrations]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [eventId]);

  return { data, loading, refresh };
}
