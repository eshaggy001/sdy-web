import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, EyeOff, BarChart3, Users } from 'lucide-react';
import { Poll, PollStatus } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { pollService } from '../services/pollService';

export const AdminPollsPage = () => {
  const { t, language: lang } = useI18n();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadPolls(); }, []);

  const loadPolls = async () => {
    setIsLoading(true);
    setPolls(await pollService.getPolls());
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t({ mn: 'Устгах уу?', en: 'Delete this poll?' }))) {
      await pollService.deletePoll(id);
      loadPolls();
    }
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
            <h1 className="text-2xl font-bold text-sdy-black dark:text-white tracking-tight">
              {t({ mn: 'Санал асуулга', en: 'Polls' })}
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {t({ mn: `Нийт ${polls.length} асуулга`, en: `${polls.length} polls total` })}
            </p>
          </div>
          <button onClick={() => navigate(`/${lang}/admin/polls/new`)} className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2">
            <Plus size={15} />
            {t({ mn: 'Нэмэх', en: 'Create' })}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Асуулт', en: 'Question' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Төлөв', en: 'Status' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Санал', en: 'Votes' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Дуусах', en: 'Expires' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="w-48 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-16 h-5 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-8 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-20 h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-20 h-6 bg-gray-100 dark:bg-gray-800 rounded ml-auto animate-pulse" /></td>
                    </tr>
                  ))
                ) : polls.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <BarChart3 size={24} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{t({ mn: 'Санал асуулга байхгүй', en: 'No polls yet' })}</p>
                    </td>
                  </tr>
                ) : (
                  polls.map((poll) => (
                    <tr key={poll.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sdy-black dark:text-white text-sm line-clamp-1">{t(poll.question)}</div>
                        <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">ID: {poll.id}</div>
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
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                          <Users size={13} className="text-gray-400 dark:text-gray-500" />
                          {poll.totalVotes}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(poll.expiresAt).toLocaleDateString()}</div>
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
                          <button onClick={() => navigate(`/${lang}/admin/polls/${poll.id}`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit2 size={15} /></button>
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
    </div>
  );
};
