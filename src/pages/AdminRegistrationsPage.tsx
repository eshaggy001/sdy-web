import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ClipboardCheck, Users, CheckCircle2, XCircle, Clock, Trash2, RefreshCw } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { registrationService } from '../services/registrationService';
import type { ProgramRegistration, LocalizedString } from '../types';

type RegistrationWithProgram = ProgramRegistration & { programTitle?: LocalizedString };

export const AdminRegistrationsPage = () => {
  const { t } = useI18n();
  const [items, setItems] = useState<RegistrationWithProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProgram, setFilterProgram] = useState('all');

  const load = async () => {
    setLoading(true);
    const data = await registrationService.getAll();
    setItems(data as RegistrationWithProgram[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: ProgramRegistration['status']) => {
    const ok = await registrationService.updateStatus(id, status);
    if (ok) setItems((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t({ mn: 'Устгах уу?', en: 'Delete this registration?' }))) return;
    const ok = await registrationService.delete(id);
    if (ok) setItems((prev) => prev.filter((r) => r.id !== id));
  };

  const programOptions = Array.from(
    new Map(items.map((r) => [r.programId, r.programTitle])).entries()
  );

  const filtered = filterProgram === 'all' ? items : items.filter((r) => r.programId === filterProgram);
  const pendingCount = filtered.filter((r) => r.status === 'pending').length;
  const approvedCount = filtered.filter((r) => r.status === 'approved').length;
  const rejectedCount = filtered.filter((r) => r.status === 'rejected').length;

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-sdy-black tracking-tight">
              {t({ mn: 'Бүртгэлүүд', en: 'Registrations' })}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {t({ mn: 'Хөтөлбөрийн бүртгэлүүд', en: 'Program registrations' })}
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
            { icon: Users,        value: filtered.length, label: t({ mn: 'Нийт', en: 'Total' }),          iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
            { icon: Clock,        value: pendingCount,    label: t({ mn: 'Хүлээгдэж буй', en: 'Pending' }), iconBg: 'bg-amber-50', iconColor: 'text-amber-500' },
            { icon: CheckCircle2, value: approvedCount,   label: t({ mn: 'Зөвшөөрсөн', en: 'Approved' }),   iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
            { icon: XCircle,      value: rejectedCount,   label: t({ mn: 'Татгалзсан', en: 'Rejected' }),   iconBg: 'bg-red-50', iconColor: 'text-red-500' },
          ].map(({ icon: Icon, value, label, iconBg, iconColor }) => (
            <div key={label} className="bg-white rounded-xl px-5 py-4 border border-gray-100 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon size={16} className={iconColor} />
              </div>
              <div>
                <div className="text-xl font-black text-sdy-black tabular-nums leading-none">{value}</div>
                <div className="text-[10px] font-medium text-gray-400 mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Program filter */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterProgram('all')}
            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              filterProgram === 'all' ? 'bg-white text-sdy-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t({ mn: `Бүгд (${items.length})`, en: `All (${items.length})` })}
          </button>
          {programOptions.map(([id, title]) => (
            <button
              key={id}
              onClick={() => setFilterProgram(id)}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                filterProgram === id ? 'bg-white text-sdy-black shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {title ? t(title) : id}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-16 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-sdy-red border-t-transparent rounded-full mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Нэр', en: 'Name' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Холбоо барих', en: 'Contact' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Хөтөлбөр', en: 'Program' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Огноо', en: 'Date' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Төлөв', en: 'Status' })}</th>
                    <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Action' })}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <ClipboardCheck size={24} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-400">{t({ mn: 'Бүртгэл байхгүй байна', en: 'No registrations yet' })}</p>
                      </td>
                    </tr>
                  ) : filtered.map((reg) => (
                    <motion.tr key={reg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sdy-black text-sm">{reg.name}</div>
                        <div className="text-xs text-gray-400">
                          {reg.age ? `${reg.age} ${t({ mn: 'нас', en: 'yrs' })}` : ''}
                          {reg.isSdyMember && (
                            <span className="ml-1 px-1.5 py-0.5 bg-sdy-red/8 text-sdy-red rounded text-[9px] font-semibold uppercase tracking-wider">SDY</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-sm text-gray-600">{reg.email}</div>
                        <div className="text-xs text-gray-400">{reg.phone}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 max-w-[160px] truncate inline-block">
                          {reg.programTitle ? t(reg.programTitle) : reg.programId.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs text-gray-400 whitespace-nowrap">{new Date(reg.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                          reg.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                          reg.status === 'rejected' ? 'bg-red-50 text-red-500' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {t({
                            pending:  { mn: 'Хүлээгдэж буй', en: 'Pending' },
                            approved: { mn: 'Зөвшөөрсөн',    en: 'Approved' },
                            rejected: { mn: 'Татгалзсан',     en: 'Rejected' },
                          }[reg.status])}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {reg.status !== 'approved' && (
                            <button onClick={() => updateStatus(reg.id, 'approved')} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Approve"><CheckCircle2 size={15} /></button>
                          )}
                          {reg.status !== 'rejected' && (
                            <button onClick={() => updateStatus(reg.id, 'rejected')} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Reject"><XCircle size={15} /></button>
                          )}
                          <button onClick={() => handleDelete(reg.id)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" title="Delete"><Trash2 size={15} /></button>
                        </div>
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
