import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Users, CheckCircle2, XCircle, Clock, Trash2, RefreshCw, Inbox } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { supabase } from '../lib/supabase';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

interface MemberApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
  location: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const AdminSubmissionsPage = () => {
  const { t } = useI18n();
  const [tab, setTab] = useState<'messages' | 'applications'>('applications');
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [applications, setApplications] = useState<MemberApplication[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: msgs }, { data: apps }] = await Promise.all([
      supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
      supabase.from('member_applications').select('*').order('created_at', { ascending: false }),
    ]);
    setMessages(msgs ?? []);
    setApplications(apps ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateAppStatus = async (id: string, status: MemberApplication['status']) => {
    await supabase.from('member_applications').update({ status }).eq('id', id);
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
  };

  const deleteMessage = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    await supabase.from('contact_messages').delete().eq('id', id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const deleteApp = async (id: string) => {
    if (!window.confirm('Delete this application?')) return;
    await supabase.from('member_applications').delete().eq('id', id);
    setApplications((prev) => prev.filter((a) => a.id !== id));
  };

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-sdy-black dark:text-white tracking-tight">
              {t({ mn: 'Хүсэлтүүд', en: 'Submissions' })}
            </h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
              {t({ mn: 'Ирсэн зурвас болон гишүүнчлэлийн өргөдлүүд', en: 'Messages and membership applications' })}
            </p>
          </div>
          <button
            onClick={load}
            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
            title={t({ mn: 'Шинэчлэх', en: 'Refresh' })}
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Mail,         value: messages.length,                                              label: t({ mn: 'Нийт зурвас', en: 'Messages' }),     iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
            { icon: Users,        value: applications.length,                                          label: t({ mn: 'Нийт өргөдөл', en: 'Applications' }), iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
            { icon: Clock,        value: pendingCount,                                                  label: t({ mn: 'Хүлээгдэж буй', en: 'Pending' }),    iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
            { icon: CheckCircle2, value: applications.filter((a) => a.status === 'approved').length,   label: t({ mn: 'Зөвшөөрсөн', en: 'Approved' }),       iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
          ].map(({ icon: Icon, value, label, iconBg, iconColor }) => (
            <div key={label} className="bg-white dark:bg-gray-900 rounded-xl px-5 py-4 border border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon size={16} className={iconColor} />
              </div>
              <div>
                <div className="text-xl font-black text-sdy-black dark:text-white tabular-nums leading-none">{value}</div>
                <div className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          {(['applications', 'messages'] as const).map((t_) => (
            <button
              key={t_}
              onClick={() => setTab(t_)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                tab === t_ ? 'bg-white dark:bg-gray-900 text-sdy-black dark:text-white shadow-sm' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              {t_ === 'applications'
                ? t({ mn: `Өргөдөл${pendingCount ? ` (${pendingCount})` : ''}`, en: `Applications${pendingCount ? ` (${pendingCount})` : ''}` })
                : t({ mn: `Зурвас (${messages.length})`, en: `Messages (${messages.length})` })}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-sdy-red border-t-transparent rounded-full mx-auto" />
            </div>
          ) : tab === 'applications' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Нэр', en: 'Name' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Холбоо барих', en: 'Contact' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Байршил / Нас', en: 'Location / Age' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Огноо', en: 'Date' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Төлөв', en: 'Status' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Action' })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {applications.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-16 text-center">
                      <Inbox size={24} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{t({ mn: 'Өргөдөл байхгүй байна', en: 'No applications yet' })}</p>
                    </td></tr>
                  ) : applications.map((app) => (
                    <motion.tr key={app.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sdy-black dark:text-white text-sm">{app.last_name} {app.first_name}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-gray-600 dark:text-gray-300">{app.email}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{app.phone}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-gray-600 dark:text-gray-300">{app.location}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{t({ mn: `${app.age} нас`, en: `Age ${app.age}` })}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs text-gray-400 dark:text-gray-500">{new Date(app.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          app.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                          app.status === 'rejected' ? 'bg-red-50 text-red-500' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {t({
                            pending:  { mn: 'Хүлээгдэж буй', en: 'Pending' },
                            approved: { mn: 'Зөвшөөрсөн',    en: 'Approved' },
                            rejected: { mn: 'Татгалзсан',     en: 'Rejected' },
                          }[app.status])}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status !== 'approved' && (
                            <button onClick={() => updateAppStatus(app.id, 'approved')} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Approve"><CheckCircle2 size={15} /></button>
                          )}
                          {app.status !== 'rejected' && (
                            <button onClick={() => updateAppStatus(app.id, 'rejected')} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Reject"><XCircle size={15} /></button>
                          )}
                          <button onClick={() => deleteApp(app.id)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all" title="Delete"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Илгээгч', en: 'From' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Гарчиг', en: 'Subject' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Зурвас', en: 'Message' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Огноо', en: 'Date' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Action' })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {messages.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-16 text-center">
                      <Mail size={24} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{t({ mn: 'Зурвас байхгүй байна', en: 'No messages yet' })}</p>
                    </td></tr>
                  ) : messages.map((msg) => (
                    <motion.tr key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sdy-black dark:text-white text-sm">{msg.name}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{msg.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-gray-600 dark:text-gray-300 max-w-[180px] truncate">{msg.subject}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-[280px] line-clamp-2 leading-relaxed">{msg.message}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{new Date(msg.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => deleteMessage(msg.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={15} /></button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
