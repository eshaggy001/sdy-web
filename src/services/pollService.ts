import { supabase } from '../lib/supabase';
import { mapPoll } from '../lib/mappers';
import { Poll, PollStatus } from '../types';

function getUserKey(): string {
  let key = localStorage.getItem('sdy_user_key');
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem('sdy_user_key', key);
  }
  return key;
}

export const pollService = {
  getPolls: async (): Promise<Poll[]> => {
    try {
      const userKey = getUserKey();

      const { data: polls, error } = await supabase
        .from('polls')
        .select('*, poll_options(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!polls) return [];

      const { data: userVotes } = await supabase
        .from('user_votes')
        .select('poll_id, option_id')
        .eq('user_key', userKey);

      const userVoteMap: Record<string, string> = {};
      for (const v of userVotes ?? []) {
        userVoteMap[v.poll_id] = v.option_id;
      }

      return polls.map((row) => mapPoll(row, userVoteMap));
    } catch (err) {
      console.error('pollService.getPolls:', err);
      return [];
    }
  },

  vote: async (pollId: string, optionId: string): Promise<Poll | null> => {
    try {
      const userKey = getUserKey();

      const { data: existing } = await supabase
        .from('user_votes')
        .select('id')
        .eq('poll_id', pollId)
        .eq('user_key', userKey)
        .maybeSingle();

      if (existing) return null;

      // TODO: Replace with a single atomic RPC once the DB function is created:
      // await supabase.rpc('increment_votes', { p_poll_id: pollId, p_option_id: optionId, p_user_key: userKey });
      // Until then, insert vote + increment counts in parallel (best-effort atomic).
      const { data: option, error: optErr } = await supabase
        .from('poll_options')
        .select('votes')
        .eq('id', optionId)
        .single();

      const { data: poll, error: pollErr } = await supabase
        .from('polls')
        .select('total_votes')
        .eq('id', pollId)
        .single();

      if (optErr || pollErr) throw optErr ?? pollErr;

      const { error: writeError } = await supabase.from('user_votes').insert({
        poll_id: pollId,
        option_id: optionId,
        user_key: userKey,
      });
      if (writeError) throw writeError;

      await Promise.all([
        supabase
          .from('poll_options')
          .update({ votes: (option?.votes ?? 0) + 1 })
          .eq('id', optionId),
        supabase
          .from('polls')
          .update({ total_votes: (poll?.total_votes ?? 0) + 1 })
          .eq('id', pollId),
      ]);

      const polls = await pollService.getPolls();
      return polls.find((p) => p.id === pollId) ?? null;
    } catch (err) {
      console.error('pollService.vote:', err);
      return null;
    }
  },

  createPoll: async (pollData: Partial<Poll>): Promise<Poll | null> => {
    try {
      const id = crypto.randomUUID();
      const { data: newPoll, error } = await supabase
        .from('polls')
        .insert({
          id,
          question_mn: pollData.question?.mn ?? '',
          question_en: pollData.question?.en ?? '',
          total_votes: 0,
          expires_at: pollData.expiresAt ?? new Date(Date.now() + 7 * 86400000).toISOString(),
          status: pollData.status ?? 'draft',
          show_on_homepage: pollData.showOnHomepage ?? false,
        })
        .select()
        .single();

      if (error) throw error;

      if (pollData.options?.length) {
        await supabase.from('poll_options').insert(
          pollData.options.map((o) => ({
            id: o.id || crypto.randomUUID(),
            poll_id: id,
            text_mn: o.text.mn,
            text_en: o.text.en,
            votes: 0,
          }))
        );
      }

      const polls = await pollService.getPolls();
      return polls.find((p) => p.id === id) ?? mapPoll({ ...newPoll, poll_options: [] });
    } catch (err) {
      console.error('pollService.createPoll:', err);
      return null;
    }
  },

  updatePoll: async (pollId: string, pollData: Partial<Poll>): Promise<Poll | null> => {
    try {
      const updates: Record<string, unknown> = {};
      if (pollData.question) {
        updates.question_mn = pollData.question.mn;
        updates.question_en = pollData.question.en;
      }
      if (pollData.status !== undefined) updates.status = pollData.status;
      if (pollData.showOnHomepage !== undefined) updates.show_on_homepage = pollData.showOnHomepage;
      if (pollData.expiresAt !== undefined) updates.expires_at = pollData.expiresAt;

      const { error } = await supabase.from('polls').update(updates).eq('id', pollId);
      if (error) throw error;

      if (pollData.options) {
        await supabase.from('poll_options').delete().eq('poll_id', pollId);
        await supabase.from('poll_options').insert(
          pollData.options.map((o) => ({
            id: o.id || crypto.randomUUID(),
            poll_id: pollId,
            text_mn: o.text.mn,
            text_en: o.text.en,
            votes: o.votes ?? 0,
          }))
        );
      }

      const polls = await pollService.getPolls();
      return polls.find((p) => p.id === pollId) ?? null;
    } catch (err) {
      console.error('pollService.updatePoll:', err);
      return null;
    }
  },

  deletePoll: async (pollId: string): Promise<void> => {
    try {
      const { error } = await supabase.from('polls').delete().eq('id', pollId);
      if (error) throw error;
    } catch (err) {
      console.error('pollService.deletePoll:', err);
    }
  },

  toggleStatus: async (poll: Poll): Promise<void> => {
    try {
      const newStatus: PollStatus = poll.status === 'published' ? 'draft' : 'published';
      const { error } = await supabase.from('polls').update({ status: newStatus }).eq('id', poll.id);
      if (error) throw error;
    } catch (err) {
      console.error('pollService.toggleStatus:', err);
    }
  },
};
