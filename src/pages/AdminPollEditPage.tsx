import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Calendar, Plus, X, Trophy, Users, TrendingUp, BarChart3, Clock, Eye,
} from 'lucide-react';
import { Poll, PollOption, PollStatus } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { pollService } from '../services/pollService';
import {
  AdminEditLayout, SectionCard, LangDivider, FieldLabel, fieldClass,
} from '../components/admin/AdminEditLayout';

/* ─── Helpers ─── */

const STATUS_COLORS: Record<PollStatus, string> = {
  draft: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  published: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  expired: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500',
  archived: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500',
};

const BAR_COLORS = [
  'bg-sdy-red',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-orange-500',
];

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

/* ─── Results Visualization ─── */

const ResultsPanel: React.FC<{ options: PollOption[]; totalVotes: number; t: (s: { mn: string; en: string }) => string }> = ({ options, totalVotes, t }) => {
  const sorted = useMemo(() => [...options].sort((a, b) => b.votes - a.votes), [options]);
  const leadingOption = sorted[0];
  const isContested = sorted.length >= 2 && sorted[0].votes === sorted[1].votes;

  return (
    <SectionCard title={t({ mn: 'Үр дүн', en: 'Results' })}>
      {/* Top stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 text-center">
          <Users size={14} className="mx-auto text-gray-400 dark:text-gray-500 mb-1" />
          <div className="text-lg font-bold text-gray-900 dark:text-white">{totalVotes}</div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">
            {t({ mn: 'Нийт санал', en: 'Total votes' })}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 text-center">
          <BarChart3 size={14} className="mx-auto text-gray-400 dark:text-gray-500 mb-1" />
          <div className="text-lg font-bold text-gray-900 dark:text-white">{options.length}</div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">
            {t({ mn: 'Сонголт', en: 'Options' })}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 text-center">
          <TrendingUp size={14} className="mx-auto text-gray-400 dark:text-gray-500 mb-1" />
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {totalVotes > 0 ? `${Math.round((leadingOption.votes / totalVotes) * 100)}%` : '—'}
          </div>
          <div className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider font-medium">
            {t({ mn: 'Тэргүүлэгч', en: 'Leading' })}
          </div>
        </div>
      </div>

      {/* Leading option callout */}
      {totalVotes > 0 && (
        <div className={`flex items-center gap-2.5 p-3 rounded-lg border ${
          isContested
            ? 'bg-amber-50/50 border-amber-200/60 dark:bg-amber-900/10 dark:border-amber-800/40'
            : 'bg-emerald-50/50 border-emerald-200/60 dark:bg-emerald-900/10 dark:border-emerald-800/40'
        }`}>
          <Trophy size={14} className={isContested ? 'text-amber-500' : 'text-emerald-500'} />
          <div className="text-xs">
            {isContested ? (
              <span className="font-medium text-amber-700 dark:text-amber-400">
                {t({ mn: 'Тэнцсэн — тэргүүлэгч байхгүй', en: 'Tied — no clear leader' })}
              </span>
            ) : (
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                {t(leadingOption.text)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Vote distribution bars */}
      <div className="space-y-3">
        {sorted.map((opt, idx) => {
          const pct = totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0;
          const isLeader = idx === 0 && totalVotes > 0 && !isContested;
          return (
            <div key={opt.id}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-medium truncate max-w-[70%] ${
                  isLeader ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {t(opt.text) || `Option ${idx + 1}`}
                </span>
                <span className="text-xs tabular-nums text-gray-400 dark:text-gray-500 ml-2 shrink-0">
                  {opt.votes} ({pct.toFixed(1)}%)
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[idx % BAR_COLORS.length]} ${isLeader ? 'opacity-100' : 'opacity-60'}`}
                  style={{ width: `${Math.max(pct, 0.5)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {totalVotes === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">
          {t({ mn: 'Одоогоор санал ирээгүй байна', en: 'No votes yet' })}
        </p>
      )}
    </SectionCard>
  );
};

/* ─── Main Page ─── */

export const AdminPollEditPage = () => {
  const { lang, id } = useParams();
  const { t } = useI18n();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [form, setForm] = useState<Partial<Poll>>({
    question: { mn: '', en: '' },
    options: [
      { id: crypto.randomUUID(), text: { mn: 'Тийм', en: 'Yes' }, votes: 0 },
      { id: crypto.randomUUID(), text: { mn: 'Үгүй', en: 'No' }, votes: 0 },
    ],
    status: 'draft',
    totalVotes: 0,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    showOnHomepage: true,
  });

  // Reset UI state when switching between items
  useEffect(() => {
    setDirty(false);
    setSaveError(null);
    setForm({
      question: { mn: '', en: '' },
      options: [
        { id: crypto.randomUUID(), text: { mn: 'Тийм', en: 'Yes' }, votes: 0 },
        { id: crypto.randomUUID(), text: { mn: 'Үгүй', en: 'No' }, votes: 0 },
      ],
      status: 'draft',
      totalVotes: 0,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      showOnHomepage: true,
    });
  }, [id]);

  useEffect(() => {
    if (!isNew && id) {
      (async () => {
        const polls = await pollService.getPolls();
        const poll = polls.find((p) => p.id === id);
        if (poll) setForm({ ...poll, expiresAt: poll.expiresAt.split('T')[0] });
        setLoading(false);
      })();
    }
  }, [id, isNew]);

  /* ─── Option Management ─── */

  const addOption = () => {
    const newId = crypto.randomUUID();
    setForm({
      ...form,
      options: [...(form.options ?? []), { id: newId, text: { mn: '', en: '' }, votes: 0 }],
    });
    setDirty(true);
  };

  const removeOption = (optId: string) => {
    if ((form.options?.length ?? 0) <= 2) return; // minimum 2 options
    setForm({ ...form, options: form.options?.filter((o) => o.id !== optId) });
    setDirty(true);
  };

  const updateOptionText = (idx: number, lang: 'mn' | 'en', value: string) => {
    const newOpts = [...form.options!];
    newOpts[idx] = { ...newOpts[idx], text: { ...newOpts[idx].text, [lang]: value } };
    setForm({ ...form, options: newOpts });
    setDirty(true);
  };

  /* ─── Save ─── */

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setSaveError(null);
    const payload = {
      ...form,
      isActive: form.status === 'published',
      expiresAt: new Date(form.expiresAt!).toISOString(),
    };
    const result = form.id
      ? await pollService.updatePoll(form.id, payload)
      : await pollService.createPoll(payload);
    setSaving(false);
    if (!result) {
      setSaveError(t({ mn: 'Хадгалахад алдаа гарлаа. Консол шалгана уу.', en: 'Save failed. Check console for details.' }));
      return;
    }
    setDirty(false);
    window.history.back();
  };

  /* ─── Derived ─── */

  const days = form.expiresAt ? daysUntil(form.expiresAt) : 0;
  const totalVotes = form.totalVotes ?? 0;

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="space-y-6">
            {[200, 200, 180].map((h, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" style={{ height: h }} />
            ))}
          </div>
          <div className="space-y-5">
            {[160, 200].map((h, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" style={{ height: h }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminEditLayout
      title={form.id ? t({ mn: 'Асуулга засах', en: 'Edit Poll' }) : t({ mn: 'Шинэ санал асуулга', en: 'New Poll' })}
      backPath={`/${lang}/admin/polls`}
      saving={saving}
      onSave={handleSave}
      dirty={dirty}
      sidebar={
        <>
          {saveError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-red-600 dark:text-red-400">
              {saveError}
            </div>
          )}
          {/* ─── Settings ─── */}
          <SectionCard title={t({ mn: 'Тохиргоо', en: 'Settings' })}>
            <div>
              <FieldLabel>{t({ mn: 'Төлөв', en: 'Status' })}</FieldLabel>
              <div className="relative">
                <select
                  className={`${fieldClass} appearance-none pr-8`}
                  value={form.status}
                  onChange={(e) => { setForm({ ...form, status: e.target.value as PollStatus }); setDirty(true); }}
                >
                  <option value="draft">{t({ mn: 'Ноорог', en: 'Draft' })}</option>
                  <option value="published">{t({ mn: 'Нийтлэгдсэн', en: 'Published' })}</option>
                  <option value="expired">{t({ mn: 'Дууссан', en: 'Expired' })}</option>
                  <option value="archived">{t({ mn: 'Архивлагдсан', en: 'Archived' })}</option>
                </select>
                <span className={`absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider pointer-events-none ${STATUS_COLORS[form.status as PollStatus]}`}>
                  {form.status}
                </span>
              </div>
            </div>

            <div>
              <FieldLabel>
                <Calendar size={12} className="inline mr-1 -mt-0.5" />
                {t({ mn: 'Дуусах огноо', en: 'Expires At' })}
              </FieldLabel>
              <input
                type="date" className={fieldClass}
                value={form.expiresAt}
                onChange={(e) => { setForm({ ...form, expiresAt: e.target.value }); setDirty(true); }}
              />
              {form.expiresAt && (
                <div className={`flex items-center gap-1.5 mt-1.5 text-[11px] font-medium ${
                  days < 0
                    ? 'text-red-500'
                    : days <= 3
                      ? 'text-amber-500'
                      : 'text-gray-400 dark:text-gray-500'
                }`}>
                  <Clock size={10} />
                  {days < 0
                    ? t({ mn: `${Math.abs(days)} хоногийн өмнө дууссан`, en: `Expired ${Math.abs(days)}d ago` })
                    : days === 0
                      ? t({ mn: 'Өнөөдөр дуусна', en: 'Expires today' })
                      : t({ mn: `${days} хоног үлдсэн`, en: `${days}d remaining` })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-3 bg-sdy-red/5 rounded-lg border border-sdy-red/10">
              <input
                type="checkbox" id="homepage"
                className="w-4 h-4 text-sdy-red rounded border-gray-300 focus:ring-sdy-red"
                checked={form.showOnHomepage}
                onChange={(e) => { setForm({ ...form, showOnHomepage: e.target.checked }); setDirty(true); }}
              />
              <label htmlFor="homepage" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-1.5">
                <Eye size={13} className="text-gray-400" />
                {t({ mn: 'Нүүр хуудсанд', en: 'Show on homepage' })}
              </label>
            </div>
          </SectionCard>

          {/* ─── Quick Stats (edit mode only) ─── */}
          {form.id && (
            <SectionCard title={t({ mn: 'Товч мэдээлэл', en: 'Quick Stats' })}>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Users size={13} />
                    {t({ mn: 'Нийт санал', en: 'Total Votes' })}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white tabular-nums">{totalVotes}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <BarChart3 size={13} />
                    {t({ mn: 'Сонголтын тоо', en: 'Options' })}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white tabular-nums">{form.options?.length ?? 0}</span>
                </div>
                {form.createdAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Calendar size={13} />
                      {t({ mn: 'Үүсгэсэн', en: 'Created' })}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(form.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </SectionCard>
          )}
        </>
      }
    >
      {/* ─── Results Visualization (edit mode only) ─── */}
      {form.id && (
        <ResultsPanel options={form.options ?? []} totalVotes={totalVotes} t={t} />
      )}

      {/* ─── Question (MN) ─── */}
      <SectionCard>
        <LangDivider lang="mn" />
        <div>
          <FieldLabel required>{t({ mn: 'Асуулт', en: 'Question' })}</FieldLabel>
          <input
            className={fieldClass}
            value={form.question?.mn}
            onChange={(e) => { setForm({ ...form, question: { ...form.question!, mn: e.target.value } }); setDirty(true); }}
            placeholder={t({ mn: 'Асуултаа бичнэ үү...', en: 'Write your question...' })}
            required
          />
        </div>
        <div>
          <FieldLabel>{t({ mn: 'Сонголтууд', en: 'Options' })}</FieldLabel>
          <div className="space-y-2">
            {form.options?.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2 group">
                <span className="text-xs font-bold text-gray-300 dark:text-gray-600 w-5 text-center shrink-0">{idx + 1}</span>
                <input
                  className={`${fieldClass} flex-1`}
                  placeholder={`${t({ mn: 'Сонголт', en: 'Option' })} ${idx + 1}`}
                  value={opt.text.mn}
                  onChange={(e) => updateOptionText(idx, 'mn', e.target.value)}
                />
                {(form.options?.length ?? 0) > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(opt.id)}
                    className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    title={t({ mn: 'Устгах', en: 'Remove' })}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-sdy-red hover:text-sdy-red-dark transition-colors"
          >
            <Plus size={13} />
            {t({ mn: 'Сонголт нэмэх', en: 'Add option' })}
          </button>
        </div>
      </SectionCard>

      {/* ─── Question (EN) ─── */}
      <SectionCard>
        <LangDivider lang="en" />
        <div>
          <FieldLabel required>Question</FieldLabel>
          <input
            className={fieldClass}
            value={form.question?.en}
            onChange={(e) => { setForm({ ...form, question: { ...form.question!, en: e.target.value } }); setDirty(true); }}
            placeholder="Write your question..."
            required
          />
        </div>
        <div>
          <FieldLabel>Options</FieldLabel>
          <div className="space-y-2">
            {form.options?.map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2 group">
                <span className="text-xs font-bold text-gray-300 dark:text-gray-600 w-5 text-center shrink-0">{idx + 1}</span>
                <input
                  className={`${fieldClass} flex-1`}
                  placeholder={`Option ${idx + 1}`}
                  value={opt.text.en}
                  onChange={(e) => updateOptionText(idx, 'en', e.target.value)}
                />
                {(form.options?.length ?? 0) > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(opt.id)}
                    className="p-1.5 text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-all shrink-0"
                    title="Remove"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-sdy-red hover:text-sdy-red-dark transition-colors"
          >
            <Plus size={13} />
            Add option
          </button>
        </div>
      </SectionCard>
    </AdminEditLayout>
  );
};
