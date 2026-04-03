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

  // Invite modal
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor'>('editor');
  const [inviting, setInviting] = useState(false);

  // Role edit
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
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
              <UserCog size={18} />
              {t({ mn: 'Хэрэглэгчид', en: 'Users' })}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-sdy-black tracking-tighter">
              {t({ mn: 'Хэрэглэгчийн ', en: 'User ' })}
              <span className="text-sdy-red">{t({ mn: 'удирдлага.', en: 'Management.' })}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-sdy-red transition-colors uppercase tracking-widest"
            >
              <RefreshCw size={14} />
              {t({ mn: 'Шинэчлэх', en: 'Refresh' })}
            </button>
            <button
              onClick={() => setInviteOpen(true)}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <Plus size={16} />
              {t({ mn: 'Урих', en: 'Invite' })}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border-2 border-sdy-red/20 text-sdy-red text-sm font-bold px-6 py-4 rounded-2xl">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-[3rem] overflow-hidden card-shadow border-2 border-gray-50">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-gray-100">
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Имэйл', en: 'Email' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Эрх', en: 'Role' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Бүртгүүлсэн', en: 'Created' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest">{t({ mn: 'Сүүлд нэвтэрсэн', en: 'Last Login' })}</th>
                  <th className="px-6 py-5 text-xs font-black text-sdy-black uppercase tracking-widest text-right">{t({ mn: 'Үйлдэл', en: 'Actions' })}</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-50">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-8 py-12 bg-white" />
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-300 font-black uppercase tracking-widest text-sm">
                      {t({ mn: 'Хэрэглэгч олдсонгүй', en: 'No users found' })}
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-black text-gray-400 uppercase">
                            {u.email?.[0]}
                          </div>
                          <div>
                            <div className="font-black text-sdy-black text-sm">{u.email}</div>
                            {u.id === currentUser?.id && (
                              <span className="text-[9px] font-black text-sdy-red uppercase tracking-widest">
                                {t({ mn: 'Та', en: 'You' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1 ${
                          u.role === 'admin' ? 'bg-sdy-red/10 text-sdy-red' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {u.role === 'admin' && <Shield size={10} />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-bold text-gray-400">
                          {new Date(u.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-bold text-gray-400">
                          {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : '—'}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openRoleEdit(u)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                            title={t({ mn: 'Эрх өөрчлөх', en: 'Change role' })}
                          >
                            <Pencil size={16} />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                              title={t({ mn: 'Устгах', en: 'Delete' })}
                            >
                              <Trash2 size={16} />
                            </button>
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
        <AdminModal
          open={inviteOpen}
          title={t({ mn: 'Хэрэглэгч урих', en: 'Invite User' })}
          onClose={() => setInviteOpen(false)}
          onSave={handleInvite}
          saving={inviting}
        >
          <div className="space-y-2">
            <label className="text-xs font-black text-sdy-black uppercase tracking-widest">
              {t({ mn: 'Имэйл хаяг', en: 'Email Address' })}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              <input
                type="email"
                className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-gray-100 focus:border-sdy-red outline-none transition-all font-bold text-sm"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-sdy-black uppercase tracking-widest">
              {t({ mn: 'Эрх', en: 'Role' })}
            </label>
            <div className="flex gap-3">
              {(['editor', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setInviteRole(r)}
                  className={`flex-1 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all border-2 ${
                    inviteRole === r
                      ? r === 'admin' ? 'border-sdy-red bg-sdy-red/10 text-sdy-red' : 'border-blue-500 bg-blue-50 text-blue-600'
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
        <AdminModal
          open={roleModalOpen}
          title={t({ mn: 'Эрх өөрчлөх', en: 'Change Role' })}
          onClose={() => setRoleModalOpen(false)}
          onSave={handleRoleSave}
          saving={savingRole}
        >
          {editingUser && (
            <>
              <div className="text-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-black text-gray-400 uppercase">
                  {editingUser.email?.[0]}
                </div>
                <div className="font-black text-sdy-black">{editingUser.email}</div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-sdy-black uppercase tracking-widest">
                  {t({ mn: 'Шинэ эрх', en: 'New Role' })}
                </label>
                <div className="flex gap-3">
                  {(['editor', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setEditRole(r)}
                      className={`flex-1 px-4 py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all border-2 ${
                        editRole === r
                          ? r === 'admin' ? 'border-sdy-red bg-sdy-red/10 text-sdy-red' : 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-100 text-gray-400 hover:border-gray-200'
                      }`}
                    >
                      {r === 'admin' && <Shield size={14} className="inline mr-1" />}
                      {r === 'admin' ? t({ mn: 'Админ', en: 'Admin' }) : t({ mn: 'Засварлагч', en: 'Editor' })}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-400 font-bold mt-2">
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
