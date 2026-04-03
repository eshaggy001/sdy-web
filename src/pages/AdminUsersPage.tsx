import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserCog, Plus, Shield, Pencil, Trash2, Mail, RefreshCw } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';
import { useAuth } from '../contexts/AuthContext';
import { userService, type AdminUser } from '../services/userService';
import { AdminModal } from '../components/admin/AdminModal';

export const AdminUsersPage = () => {
  const { t } = useI18n();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor'>('editor');
  const [inviting, setInviting] = useState(false);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editRole, setEditRole] = useState<'admin' | 'editor'>('editor');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [savingRole, setSavingRole] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.listUsers();
      setUsers(data);
    } catch (err) {
      setError((err as Error).message);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError(null);
    try {
      await userService.inviteUser(inviteEmail.trim(), inviteRole);
      setInviteOpen(false);
      setInviteEmail('');
      setInviteRole('editor');
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
    setInviting(false);
  };

  const openRoleEdit = (u: AdminUser) => {
    setEditingUser(u);
    setEditRole(u.role);
    setRoleModalOpen(true);
  };

  const handleRoleSave = async () => {
    if (!editingUser) return;
    setSavingRole(true);
    setError(null);
    try {
      await userService.updateRole(editingUser.id, editRole);
      setRoleModalOpen(false);
      setEditingUser(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
    setSavingRole(false);
  };

  const handleDelete = async (u: AdminUser) => {
    if (!window.confirm(t({
      mn: `${u.email} хэрэглэгчийг устгах уу?`,
      en: `Delete user ${u.email}?`
    }))) return;
    setError(null);
    try {
      await userService.deleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="p-6 md:p-10">
      <div className="max-w-6xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-sdy-black tracking-tight">
              {t({ mn: 'Хэрэглэгчид', en: 'Users' })}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {t({ mn: `Нийт ${users.length} хэрэглэгч`, en: `${users.length} users total` })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={load}
              className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-all"
              title={t({ mn: 'Шинэчлэх', en: 'Refresh' })}
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => setInviteOpen(true)}
              className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"
            >
              <Plus size={15} />
              {t({ mn: 'Урих', en: 'Invite' })}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-5 py-3.5 rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Имэйл', en: 'Email' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Эрх', en: 'Role' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Бүртгүүлсэн', en: 'Created' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t({ mn: 'Сүүлд нэвтэрсэн', en: 'Last Login' })}</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">{t({ mn: 'Үйлдэл', en: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-100 rounded-lg animate-pulse" /><div className="w-32 h-4 bg-gray-100 rounded animate-pulse" /></div></td>
                      <td className="px-5 py-4"><div className="w-14 h-5 bg-gray-100 rounded-full animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-20 h-4 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-20 h-4 bg-gray-100 rounded animate-pulse" /></td>
                      <td className="px-5 py-4"><div className="w-16 h-6 bg-gray-100 rounded ml-auto animate-pulse" /></td>
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <UserCog size={24} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400">{t({ mn: 'Хэрэглэгч олдсонгүй', en: 'No users found' })}</p>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 uppercase">
                            {u.email?.[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-sdy-black text-sm">{u.email}</div>
                            {u.id === currentUser?.id && (
                              <span className="text-[9px] font-bold text-sdy-red uppercase tracking-wider">
                                {t({ mn: 'Та', en: 'You' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                          u.role === 'admin' ? 'bg-sdy-red/8 text-sdy-red' : 'bg-blue-50 text-blue-500'
                        }`}>
                          {u.role === 'admin' && <Shield size={9} />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs text-gray-400">{new Date(u.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-xs text-gray-400">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : '—'}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openRoleEdit(u)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title={t({ mn: 'Эрх өөрчлөх', en: 'Change role' })}><Pencil size={15} /></button>
                          {u.id !== currentUser?.id && (
                            <button onClick={() => handleDelete(u)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title={t({ mn: 'Устгах', en: 'Delete' })}><Trash2 size={15} /></button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite Modal */}
        <AdminModal open={inviteOpen} title={t({ mn: 'Хэрэглэгч урих', en: 'Invite User' })} onClose={() => setInviteOpen(false)} onSave={handleInvite} saving={inviting}>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t({ mn: 'Имэйл хаяг', en: 'Email Address' })}</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
              <input type="email" className="input input-icon text-sm" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t({ mn: 'Эрх', en: 'Role' })}</label>
            <div className="flex gap-2">
              {(['editor', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setInviteRole(r)}
                  className={`flex-1 px-4 py-3 rounded-xl text-sm font-semibold transition-all border ${
                    inviteRole === r
                      ? r === 'admin' ? 'border-sdy-red bg-sdy-red/8 text-sdy-red' : 'border-blue-400 bg-blue-50 text-blue-500'
                      : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {r === 'admin' && <Shield size={12} className="inline mr-1" />}
                  {r}
                </button>
              ))}
            </div>
          </div>
        </AdminModal>

        {/* Role Edit Modal */}
        <AdminModal open={roleModalOpen} title={t({ mn: 'Эрх өөрчлөх', en: 'Change Role' })} onClose={() => setRoleModalOpen(false)} onSave={handleRoleSave} saving={savingRole}>
          {editingUser && (
            <>
              <div className="text-center mb-4">
                <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-base font-bold text-gray-400 uppercase">
                  {editingUser.email?.[0]}
                </div>
                <div className="font-semibold text-sdy-black">{editingUser.email}</div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{t({ mn: 'Шинэ эрх', en: 'New Role' })}</label>
                <div className="flex gap-2">
                  {(['editor', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditRole(r)}
                      className={`flex-1 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all border ${
                        editRole === r
                          ? r === 'admin' ? 'border-sdy-red bg-sdy-red/8 text-sdy-red' : 'border-blue-400 bg-blue-50 text-blue-500'
                          : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {r === 'admin' && <Shield size={13} className="inline mr-1" />}
                      {r === 'admin' ? t({ mn: 'Админ', en: 'Admin' }) : t({ mn: 'Засварлагч', en: 'Editor' })}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 mt-2">
                  {editRole === 'admin'
                    ? t({ mn: 'Бүх эрхтэй: контент, хэрэглэгч, хүсэлтүүд', en: 'Full access: content, users, submissions' })
                    : t({ mn: 'Зөвхөн контент засах эрхтэй', en: 'Content editing only' })
                  }
                </p>
              </div>
            </>
          )}
        </AdminModal>
      </div>
    </div>
  );
};
