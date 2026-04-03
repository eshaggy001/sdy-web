import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Users, CheckCircle2, XCircle, Clock, Trash2, RefreshCw, Inbox, LogOut } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

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
  name: string;
  email: string;
  age: number;
  location: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export const AdminSubmissionsPage = () => {
  const { t, l } = useI18n();
  const { signOut } = useAuth();
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
    <div className="pt-32 pb-24 min-h-screen bg-sdy-gray/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
              <Inbox size={16} />
              {t({ mn: 'Админ удирдлага', en: 'Admin Dashboard' })}
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-sdy-black leading-tight tracking-tighter">
              {t({ mn: 'Ирсэн ', en: 'Submissions' })}
              <span className="text-sdy-red">{t({ mn: 'хүсэлтүүд.', en: '.' })}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to={l('/admin/polls')}
              className="text-sm font-black text-gray-400 hover:text-sdy-black transition-colors uppercase tracking-widest"
            >
              {t({ mn: 'Санал асуулга', en: 'Polls' })} →
            </Link>
            <button
              onClick={load}
              className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-sdy-red transition-colors uppercase tracking-widest"
            >
              <RefreshCw size={14} />
              {t({ mn: 'Шинэчлэх', en: 'Refresh' })}
            </button>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-sdy-red transition-colors uppercase tracking-widest"
            >
              <LogOut size={14} />
              {t({ mn: 'Гарах', en: 'Logout' })}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Mail,         value: messages.length,                                              label: t({ mn: 'Нийт зурвас', en: 'Total Messages' }) },
            { icon: Users,        value: applications.length,                                          label: t({ mn: 'Нийт өргөдөл', en: 'Total Applications' }) },
            { icon: Clock,        value: pendingCount,                                                  label: t({ mn: 'Хүлээгдэж буй', en: 'Pending' }) },
            { icon: CheckCircle2, value: applications.filter((a) => a.status === 'approved').length,   label: t({ mn: 'Зөвшөөрөгдсөн', en: 'Approved' }) },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-white rounded-2xl px-6 py-5 card-shadow flex items-center gap-4">
              <div className="w-10 h-10 bg-sdy-red/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-sdy-red" />
              </div>
              <div>
                <div className="text-2xl font-black text-sdy-black tabular-nums">{value}</div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(['applications', 'messages'] as const).map((t_) => (
            <button
              key={t_}
              onClick={() => setTab(t_)}
              className={`px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all ${
                tab === t_ ? 'bg-sdy-black text-white' : 'bg-white text-gray-400 hover:text-sdy-black card-shadow'
              }`}
            >
              {t_ === 'applications'
                ? t({ mn: `Өргөдөл${pendingCount ? ` (${pendingCount})` : ''}`, en: `Applications${pendingCount ? ` (${pendingCount})` : ''}` })
                : t({ mn: `Зурвас${messages.length ? ` (${messages.length})` : ''}`, en: `Messages${messages.length ? ` (${messages.length})` : ''}` })}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-[3rem] overflow-hidden card-shadow border-2 border-gray-50">
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-sdy-red border-t-transparent rounded-full mx-auto" />
            </div>
          ) : tab === 'applications' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-100">
                    <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Нэр', en: 'Name' })}</th>
                    <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Холбоо барих', en: 'Contact' })}</th>
                    <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Байршил / Нас', en: 'Location / Age' })}</th>
                    <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Огноо', en: 'Date' })}</th>
                    <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Төлөв', en: 'Status' })}</th>
                    <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest text-right">{t({ mn: 'Үйлдэл', en: 'Action' })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-50">
                  {applications.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-300 font-black uppercase tracking-widest text-sm">
                      {t({ mn: 'Өргөдөл байхгүй байна', en: 'No applications yet' })}
                    </td></tr>
                  ) : applications.map((app) => (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="font-black text-sdy-black">{app.name}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-gray-600">{app.email}</div>
                        <div className="text-xs font-bold text-gray-400">{app.phone}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-gray-600">{app.location}</div>
                        <div className="text-xs font-bold text-gray-400">{t({ mn: `${app.age} нас`, en: `Age ${app.age}` })}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-bold text-gray-400">
                          {new Date(app.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          app.status === 'approved' ? 'bg-green-100 text-green-600' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-500' :
                          'bg-yellow-100 text-yellow-600'
                        }`}>
                          {t({
                            pending:  { mn: 'Хүлээгдэж буй', en: 'Pending' },
                            approved: { mn: 'Зөвшөөрсөн',    en: 'Approved' },
                            rejected: { mn: 'Татгалзсан',     en: 'Rejected' },
                          }[app.status])}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          {app.status !== 'approved' && (
                            <button
                              onClick={() => updateAppStatus(app.id, 'approved')}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all"
                              title="Approve"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => updateAppStatus(app.id, 'rejected')}
                              className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-all"
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteApp(app.id)}
                            className="p-2 bg-gray-100 text-gray-400 rounded-lg hover:bg-gray-200 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-100">
                    <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Илгээгч', en: 'From' })}</th>
                    <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Гарчиг', en: 'Subject' })}</th>
                    <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Зурвас', en: 'Message' })}</th>
                    <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Огноо', en: 'Date' })}</th>
                    <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest text-right">{t({ mn: 'Үйлдэл', en: 'Action' })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-50">
                  {messages.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-300 font-black uppercase tracking-widest text-sm">
                      {t({ mn: 'Зурвас байхгүй байна', en: 'No messages yet' })}
                    </td></tr>
                  ) : messages.map((msg) => (
                    <motion.tr
                      key={msg.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="font-black text-sdy-black">{msg.name}</div>
                        <div className="text-xs font-bold text-gray-400">{msg.email}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-gray-600 max-w-[200px] truncate">{msg.subject}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-500 max-w-[300px] line-clamp-2 leading-relaxed">{msg.message}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-bold text-gray-400 whitespace-nowrap">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => deleteMessage(msg.id)}
                          className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
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
