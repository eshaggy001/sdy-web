import React from 'react';
import { motion } from 'motion/react';
import { ClipboardCheck, Users, CheckCircle2, XCircle, Clock, Trash2, RefreshCw } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  isSdyMember?: boolean;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface RegistrationsPanelProps {
  items: Registration[];
  loading: boolean;
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => void;
  onDelete: (id: string) => void;
  showMemberInfo?: boolean;
}

export const RegistrationsPanel: React.FC<RegistrationsPanelProps> = ({
  items, loading, onRefresh, onUpdateStatus, onDelete, showMemberInfo = false,
}) => {
  const { t } = useI18n();

  const pendingCount = items.filter((r) => r.status === 'pending').length;
  const approvedCount = items.filter((r) => r.status === 'approved').length;
  const rejectedCount = items.filter((r) => r.status === 'rejected').length;

  const handleDelete = (id: string) => {
    if (!window.confirm(t({ mn: 'Устгах уу?', en: 'Delete this registration?' }))) return;
    onDelete(id);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Users, value: items.length, label: t({ mn: 'Нийт', en: 'Total' }), iconBg: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-500' },
          { icon: Clock, value: pendingCount, label: t({ mn: 'Хүлээгдэж буй', en: 'Pending' }), iconBg: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-500' },
          { icon: CheckCircle2, value: approvedCount, label: t({ mn: 'Зөвшөөрсөн', en: 'Approved' }), iconBg: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-500' },
          { icon: XCircle, value: rejectedCount, label: t({ mn: 'Татгалзсан', en: 'Rejected' }), iconBg: 'bg-red-50 dark:bg-red-900/20', iconColor: 'text-red-500' },
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

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t({ mn: 'Бүртгэлүүд', en: 'Registrations' })}
          </h3>
          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
            title={t({ mn: 'Шинэчлэх', en: 'Refresh' })}
          >
            <RefreshCw size={14} />
          </button>
        </div>
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin w-6 h-6 border-2 border-sdy-red border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Нэр', en: 'Name' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Холбоо барих', en: 'Contact' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Огноо', en: 'Date' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t({ mn: 'Төлөв', en: 'Status' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Action' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <ClipboardCheck size={24} className="text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{t({ mn: 'Бүртгэл байхгүй байна', en: 'No registrations yet' })}</p>
                    </td>
                  </tr>
                ) : items.map((reg) => (
                  <motion.tr key={reg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-sdy-black dark:text-white text-sm">{reg.name}</div>
                      {showMemberInfo && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {reg.age ? `${reg.age} ${t({ mn: 'нас', en: 'yrs' })}` : ''}
                          {reg.isSdyMember && (
                            <span className="ml-1 px-1.5 py-0.5 bg-sdy-red/8 text-sdy-red rounded text-[9px] font-semibold uppercase tracking-wider">SDY</span>
                          )}
                        </div>
                      )}
                      {!showMemberInfo && reg.message && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">{reg.message}</div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm text-gray-600 dark:text-gray-300">{reg.email}</div>
                      {reg.phone && <div className="text-xs text-gray-400 dark:text-gray-500">{reg.phone}</div>}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{new Date(reg.createdAt).toLocaleDateString()}</div>
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
                          <button onClick={() => onUpdateStatus(reg.id, 'approved')} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Approve"><CheckCircle2 size={15} /></button>
                        )}
                        {reg.status !== 'rejected' && (
                          <button onClick={() => onUpdateStatus(reg.id, 'rejected')} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Reject"><XCircle size={15} /></button>
                        )}
                        <button onClick={() => handleDelete(reg.id)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all" title="Delete"><Trash2 size={15} /></button>
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
  );
};
