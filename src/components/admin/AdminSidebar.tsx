import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Newspaper, Users2, Columns3, BarChart3,
  ClipboardList, ClipboardCheck, Inbox, UserCog, LogOut, Menu, X, ChevronLeft, Shield
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, path: '/admin',             labelMn: 'Хянах самбар',      labelEn: 'Dashboard',       adminOnly: false },
  { icon: FileText,        path: '/admin/programs',     labelMn: 'Хөтөлбөрүүд',      labelEn: 'Programs',        adminOnly: false },
  { icon: Newspaper,       path: '/admin/news',         labelMn: 'Мэдээ',             labelEn: 'News',            adminOnly: false },
  { icon: Users2,          path: '/admin/leaders',      labelMn: 'Удирдлага',         labelEn: 'Leaders',         adminOnly: false },
  { icon: Columns3,        path: '/admin/pillars',      labelMn: 'Тулгуур чиглэл',   labelEn: 'Pillars',         adminOnly: false },
  { icon: BarChart3,       path: '/admin/stats',        labelMn: 'Статистик',         labelEn: 'Stats',           adminOnly: false },
  { icon: ClipboardList,   path: '/admin/polls',        labelMn: 'Санал асуулга',     labelEn: 'Polls',           adminOnly: false },
  { icon: ClipboardCheck,  path: '/admin/registrations', labelMn: 'Бүртгэлүүд',       labelEn: 'Registrations',   adminOnly: true },
  { icon: Inbox,           path: '/admin/submissions',  labelMn: 'Хүсэлтүүд',        labelEn: 'Submissions',     adminOnly: true  },
  { icon: UserCog,         path: '/admin/users',        labelMn: 'Хэрэглэгчид',      labelEn: 'Users',           adminOnly: true  },
];

export const AdminSidebar: React.FC<{ collapsed: boolean; onToggle: () => void }> = ({ collapsed, onToggle }) => {
  const { t, l, language } = useI18n();
  const { signOut, role, user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = role === 'admin';

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  const isActive = (path: string) => {
    const fullPath = `/${language}${path}`;
    if (path === '/admin') return location.pathname === fullPath;
    return location.pathname.startsWith(fullPath);
  };

  const userName = user?.email?.split('@')[0] ?? 'Admin';

  const navContent = (
    <>
      {/* Logo */}
      <div className="px-5 pt-7 pb-6 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sdy-red rounded-xl flex items-center justify-center">
              <span className="text-white text-sm font-black">S</span>
            </div>
            <div>
              <div className="text-base font-black text-gray-900 dark:text-white tracking-tight leading-none">SDY Admin</div>
              <div className="text-[10px] font-bold text-gray-500 mt-0.5">{t({ mn: 'Удирдлагын самбар', en: 'Management Panel' })}</div>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 bg-sdy-red rounded-xl flex items-center justify-center mx-auto">
            <span className="text-white text-sm font-black">S</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden md:flex p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
        >
          <ChevronLeft size={16} className={`text-gray-500 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-gray-200 dark:border-white/6 mb-3" />

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {visibleItems.map(({ icon: Icon, path, labelMn, labelEn, adminOnly }) => {
          const active = isActive(path);
          return (
            <NavLink
              key={path}
              to={l(path)}
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 ${
                active
                  ? 'bg-sdy-red/12 text-sdy-red font-bold'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-sdy-red rounded-r-full" />
              )}
              <Icon size={17} className={`flex-shrink-0 ${active ? 'text-sdy-red' : ''}`} />
              {!collapsed && (
                <span className="truncate">{language === 'mn' ? labelMn : labelEn}</span>
              )}
              {!collapsed && adminOnly && (
                <Shield size={10} className="text-gray-600 ml-auto flex-shrink-0" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User info + Logout */}
      <div className="px-3 pb-5 mt-2">
        <div className="mx-1 border-t border-gray-200 dark:border-white/6 mb-3" />
        {!collapsed && (
          <div className="px-3 py-2.5 mb-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gray-100 dark:bg-white/8 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex-shrink-0">
                {userName[0]}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-gray-900 dark:text-white truncate">{userName}</div>
                <div className="flex items-center gap-1">
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                    role === 'admin' ? 'text-sdy-red' : 'text-blue-400'
                  }`}>
                    {role === 'admin' ? 'Admin' : 'Editor'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => signOut()}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all w-full ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={17} className="flex-shrink-0" />
          {!collapsed && <span>{t({ mn: 'Гарах', en: 'Log out' })}</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-[#16161a] rounded-xl shadow-sm border border-gray-200 dark:border-white/8"
      >
        <Menu size={18} className="text-gray-500 dark:text-gray-400" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[270px] bg-white dark:bg-[#111114] flex flex-col shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-4 p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <X size={16} className="text-gray-500" />
            </button>
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col bg-white dark:bg-[#111114] border-r border-gray-200 dark:border-white/6 h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? 'w-[68px]' : 'w-[260px]'
      }`}>
        {navContent}
      </aside>
    </>
  );
};
