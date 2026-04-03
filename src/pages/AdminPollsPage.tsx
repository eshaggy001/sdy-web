import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Eye, EyeOff, BarChart3, Save, X, Calendar, Users, Loader2 } from 'lucide-react';
import { Poll, PollStatus } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { pollService } from '../services/pollService';

export const AdminPollsPage = () => {
  const { t } = useI18n();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPoll, setCurrentPoll] = useState<Partial<Poll> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadPolls(); }, []);

  const loadPolls = async () => {
    setIsLoading(true);
    setPolls(await pollService.getPolls());
    setIsLoading(false);
  };

  const handleCreate = () => {
    setCurrentPoll({
      question: { mn: '', en: '' },
      options: [
        { id: 'opt1', text: { mn: 'Тийм', en: 'Yes' }, votes: 0 },
        { id: 'opt2', text: { mn: 'Үгүй', en: 'No' }, votes: 0 }
      ],
      status: 'draft',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      showOnHomepage: true
    });
    setIsEditing(true);
  };

  const handleEdit = (poll: Poll) => {
    setCurrentPoll({ ...poll, expiresAt: poll.expiresAt.split('T')[0] });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t({ mn: 'Устгах уу?', en: 'Delete this poll?' }))) {
      await pollService.deletePoll(id);
      loadPolls();
    }
  };

  const handleSave = async () => {
    if (!currentPoll) return;
    setSaving(true);

    if (currentPoll.id) {
      await pollService.updatePoll(currentPoll.id, {
        ...currentPoll,
        isActive: currentPoll.status === 'published',
        expiresAt: new Date(currentPoll.expiresAt!).toISOString()
      });
    } else {
      await pollService.createPoll({
        ...currentPoll,
        isActive: currentPoll.status === 'published',
        expiresAt: new Date(currentPoll.expiresAt!).toISOString()
      });
    }

    setSaving(false);
    setIsEditing(false);
    setCurrentPoll(null);
    loadPolls();
  };

  const toggleStatus = async (poll: Poll) => {
    const newStatus: PollStatus = poll.status === 'published' ? 'draft' : 'published';
    await pollService.updatePoll(poll.id, { status: newStatus, isActive: newStatus === 'published' });
    loadPolls();
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-sdy-black tracking-tight">
              {t({ mn: 'Санал асуулга', en: 'Polls' })}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {t({ mn: `Нийт ${polls.length} асуулга`, en: `${polls.length} polls total` })}
            </p>
          </div>
          <button onClick={handleCreate} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            <Plus size={15} />
            {t({ mn: 'Нэмэх', en: 'Create' })}
          </button>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Асуулт', en: 'Question' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Төлөв', en: 'Status' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Санал', en: 'Votes' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Дуусах', en: 'Expires' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="w-48 h-4 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-16 h-5 bg-gray-100 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-8 h-4 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-20 h-4 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-20 h-6 bg-gray-100 rounded ml-auto animate-pulse" /></td>
                    </tr>
                  ))
                ) : polls.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <BarChart3 size={24} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400">{t({ mn: 'Санал асуулга байхгүй', en: 'No polls yet' })}</p>
                    </td>
                  </tr>
                ) : (
                  polls.map((poll) => (
                    <tr key={poll.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sdy-black text-sm line-clamp-1">{t(poll.question)}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">ID: {poll.id}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          poll.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
                          poll.status === 'expired' ? 'bg-gray-100 text-gray-400' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {t({
                            draft: { mn: 'Ноорог', en: 'Draft' },
                            published: { mn: 'Нийтлэгдсэн', en: 'Published' },
                            expired: { mn: 'Дууссан', en: 'Expired' },
                            archived: { mn: 'Архивлагдсан', en: 'Archived' }
                          }[poll.status])}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Users size={13} className="text-gray-400" />
                          {poll.totalVotes}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs text-gray-400">{new Date(poll.expiresAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleStatus(poll)}
                            className={`p-2 rounded-lg transition-all ${
                              poll.status === 'published' ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100' : 'text-emerald-500 hover:bg-emerald-50'
                            }`}
                            title={poll.status === 'published' ? 'Unpublish' : 'Publish'}
                          >
                            {poll.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button onClick={() => handleEdit(poll)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete(poll.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditing && currentPoll && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-sdy-black">
                  {currentPoll.id ? t({ mn: 'Засварлах', en: 'Edit Poll' }) : t({ mn: 'Шинэ санал асуулга', en: 'New Poll' })}
                </h2>
                <button onClick={() => setIsEditing(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="px-7 py-6 space-y-5 max-h-[65vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t({ mn: 'Асуулт (MN)', en: 'Question (MN)' })}</label>
                  <input type="text" className="input input-sm" value={currentPoll.question?.mn} onChange={(e) => setCurrentPoll({ ...currentPoll, question: { ...currentPoll.question!, mn: e.target.value } })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t({ mn: 'Асуулт (EN)', en: 'Question (EN)' })}</label>
                  <input type="text" className="input input-sm" value={currentPoll.question?.en} onChange={(e) => setCurrentPoll({ ...currentPoll, question: { ...currentPoll.question!, en: e.target.value } })} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t({ mn: 'Сонголтууд', en: 'Options' })}</label>
                  <div className="space-y-2">
                    {currentPoll.options?.map((opt, idx) => (
                      <div key={opt.id} className="grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <input
                          type="text"
                          placeholder="MN"
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-sdy-red outline-none transition-colors"
                          value={opt.text.mn}
                          onChange={(e) => {
                            const newOpts = [...currentPoll.options!];
                            newOpts[idx] = { ...newOpts[idx], text: { ...newOpts[idx].text, mn: e.target.value } };
                            setCurrentPoll({ ...currentPoll, options: newOpts });
                          }}
                        />
                        <input
                          type="text"
                          placeholder="EN"
                          className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-sdy-red outline-none transition-colors"
                          value={opt.text.en}
                          onChange={(e) => {
                            const newOpts = [...currentPoll.options!];
                            newOpts[idx] = { ...newOpts[idx], text: { ...newOpts[idx].text, en: e.target.value } };
                            setCurrentPoll({ ...currentPoll, options: newOpts });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t({ mn: 'Дуусах огноо', en: 'Expires At' })}</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
                      <input type="date" className="input input-sm pl-10" value={currentPoll.expiresAt} onChange={(e) => setCurrentPoll({ ...currentPoll, expiresAt: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t({ mn: 'Төлөв', en: 'Status' })}</label>
                    <select className="input input-sm appearance-none bg-white" value={currentPoll.status} onChange={(e) => setCurrentPoll({ ...currentPoll, status: e.target.value as PollStatus })}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="expired">Expired</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-sdy-red/5 rounded-xl border border-sdy-red/10">
                  <input
                    type="checkbox"
                    id="homepage"
                    className="w-4 h-4 text-sdy-red rounded border-gray-300 focus:ring-sdy-red"
                    checked={currentPoll.showOnHomepage}
                    onChange={(e) => setCurrentPoll({ ...currentPoll, showOnHomepage: e.target.checked })}
                  />
                  <label htmlFor="homepage" className="text-sm font-semibold text-sdy-black cursor-pointer">
                    {t({ mn: 'Нүүр хуудсанд харуулах', en: 'Show on homepage' })}
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="px-7 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <button onClick={handleSave} disabled={saving} className="flex-grow btn-primary py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={15} />}
                  {t({ mn: 'Хадгалах', en: 'Save' })}
                </button>
                <button onClick={() => setIsEditing(false)} className="px-5 py-3 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
                  {t({ mn: 'Цуцлах', en: 'Cancel' })}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
