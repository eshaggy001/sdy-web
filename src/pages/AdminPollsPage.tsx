import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Eye, EyeOff, BarChart3, Save, X, Calendar, Clock, CheckCircle2, AlertCircle, Users, Inbox, LogOut } from 'lucide-react';
import { Poll, PollOption, PollStatus } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { pollService } from '../services/pollService';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AdminPollsPage = () => {
  const { t, l } = useI18n();
  const { signOut } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPoll, setCurrentPoll] = useState<Partial<Poll> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPolls();
  }, []);

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
    if (window.confirm(t({ mn: 'Та энэ санал асуулгыг устгахдаа итгэлтэй байна уу?', en: 'Are you sure you want to delete this poll?' }))) {
      await pollService.deletePoll(id);
      loadPolls();
    }
  };

  const handleSave = async () => {
    if (!currentPoll) return;

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
    <div className="pt-32 pb-24 min-h-screen bg-sdy-gray/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
              <BarChart3 size={18} />
              {t({ mn: 'Админ удирдлага', en: 'Admin Dashboard' })}
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-sdy-black leading-tight tracking-tighter mb-8">
              {t({ mn: 'Санал ', en: 'Manage ' })}
              <span className="text-sdy-red">{t({ mn: 'асуулга.', en: 'Polls.' })}</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              to={l('/admin/submissions')}
              className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-sdy-black transition-colors uppercase tracking-widest"
            >
              <Inbox size={16} />
              {t({ mn: 'Хүсэлтүүд', en: 'Submissions' })}
            </Link>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-sdy-red transition-colors uppercase tracking-widest"
            >
              <LogOut size={14} />
              {t({ mn: 'Гарах', en: 'Logout' })}
            </button>
          <button
            onClick={handleCreate}
            className="btn-primary px-8 py-4 flex items-center gap-2 text-lg"
          >
            <Plus size={24} />
            {t({ mn: 'Шинэ санал асуулга', en: 'Create New Poll' })}
          </button>
          </div>
        </div>

        {/* Polls Table */}
        <div className="bg-white rounded-[3rem] overflow-hidden card-shadow border-2 border-gray-50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="px-8 py-6 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Асуулт', en: 'Question' })}</th>
                  <th className="px-8 py-6 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Төлөв', en: 'Status' })}</th>
                  <th className="px-8 py-6 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Санал', en: 'Votes' })}</th>
                  <th className="px-8 py-6 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Дуусах', en: 'Expires' })}</th>
                  <th className="px-8 py-6 text-xs font-black text-sdy-black uppercase tracking-widest text-right">{t({ mn: 'Үйлдэл', en: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-50">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-12 bg-white" />
                    </tr>
                  ))
                ) : polls.length > 0 ? (
                  polls.map((poll) => (
                    <tr key={poll.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-black text-sdy-black mb-1 line-clamp-1 uppercase tracking-tight">{t(poll.question)}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: {poll.id}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          poll.status === 'published' ? 'bg-green-100 text-green-600' :
                          poll.status === 'expired' ? 'bg-gray-100 text-gray-400' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {t({ 
                            draft: { mn: 'Ноорог', en: 'Draft' },
                            published: { mn: 'Нийтлэгдсэн', en: 'Published' },
                            expired: { mn: 'Дууссан', en: 'Expired' },
                            archived: { mn: 'Архивлагдсан', en: 'Archived' }
                          }[poll.status])}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 font-black text-sdy-black">
                          <Users size={14} className="text-gray-400" />
                          {poll.totalVotes}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-xs font-bold text-gray-500">
                          {new Date(poll.expiresAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => toggleStatus(poll)}
                            className={`p-2 rounded-lg transition-all ${
                              poll.status === 'published' ? 'bg-gray-100 text-gray-400 hover:text-sdy-black' : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={poll.status === 'published' ? 'Unpublish' : 'Publish'}
                          >
                            {poll.status === 'published' ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button 
                            onClick={() => handleEdit(poll)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(poll.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="text-gray-300 font-black uppercase tracking-widest">No polls found</div>
                    </td>
                  </tr>
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
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-sdy-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-sdy-black uppercase tracking-tight">
                    {currentPoll.id ? t({ mn: 'Засварлах', en: 'Edit Poll' }) : t({ mn: 'Шинэ санал асуулга', en: 'New Poll' })}
                  </h2>
                  <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                  {/* Question MN */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-sdy-black uppercase tracking-widest">Асуулт (MN)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
                      value={currentPoll.question?.mn}
                      onChange={(e) => setCurrentPoll({
                        ...currentPoll, 
                        question: { ...currentPoll.question!, mn: e.target.value }
                      })}
                    />
                  </div>
                  {/* Question EN */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-sdy-black uppercase tracking-widest">Question (EN)</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
                      value={currentPoll.question?.en}
                      onChange={(e) => setCurrentPoll({
                        ...currentPoll, 
                        question: { ...currentPoll.question!, en: e.target.value }
                      })}
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-4">
                    <label className="text-xs font-black text-sdy-black uppercase tracking-widest">Options</label>
                    {currentPoll.options?.map((opt, idx) => (
                      <div key={opt.id} className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                        <input 
                          type="text" 
                          placeholder="MN"
                          className="px-3 py-2 rounded-lg border border-gray-200 font-bold text-sm"
                          value={opt.text.mn}
                          onChange={(e) => {
                            const newOpts = [...currentPoll.options!];
                            newOpts[idx].text.mn = e.target.value;
                            setCurrentPoll({ ...currentPoll, options: newOpts });
                          }}
                        />
                        <input 
                          type="text" 
                          placeholder="EN"
                          className="px-3 py-2 rounded-lg border border-gray-200 font-bold text-sm"
                          value={opt.text.en}
                          onChange={(e) => {
                            const newOpts = [...currentPoll.options!];
                            newOpts[idx].text.en = e.target.value;
                            setCurrentPoll({ ...currentPoll, options: newOpts });
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* Expiry */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-sdy-black uppercase tracking-widest">Expires At</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="date" 
                          className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold"
                          value={currentPoll.expiresAt}
                          onChange={(e) => setCurrentPoll({ ...currentPoll, expiresAt: e.target.value })}
                        />
                      </div>
                    </div>
                    {/* Status */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-sdy-black uppercase tracking-widest">Status</label>
                      <select 
                        className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold appearance-none bg-white"
                        value={currentPoll.status}
                        onChange={(e) => setCurrentPoll({ ...currentPoll, status: e.target.value as PollStatus })}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="expired">Expired</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-sdy-red/5 rounded-2xl border-2 border-sdy-red/10">
                    <input 
                      type="checkbox" 
                      id="homepage"
                      className="w-5 h-5 text-sdy-red rounded border-gray-300 focus:ring-sdy-red"
                      checked={currentPoll.showOnHomepage}
                      onChange={(e) => setCurrentPoll({ ...currentPoll, showOnHomepage: e.target.checked })}
                    />
                    <label htmlFor="homepage" className="text-sm font-black text-sdy-black uppercase tracking-tight cursor-pointer">
                      Show on homepage
                    </label>
                  </div>
                </div>

                <div className="mt-12 flex gap-4">
                  <button 
                    onClick={handleSave}
                    className="flex-grow btn-primary py-5 text-lg flex items-center justify-center gap-2"
                  >
                    <Save size={20} />
                    {t({ mn: 'Хадгалах', en: 'Save Poll' })}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-8 py-5 bg-gray-100 text-gray-400 font-black uppercase tracking-widest text-sm rounded-2xl hover:bg-gray-200 transition-all"
                  >
                    {t({ mn: 'Цуцлах', en: 'Cancel' })}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
