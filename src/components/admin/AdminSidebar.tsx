import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, FileText, Newspaper, Users2, Columns3, BarChart3,
  ClipboardList, Inbox, UserCog, LogOut, Menu, X, ChevronLeft
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, path: '/admin',             labelMn: 'Хянах самбар',      labelEn: 'Dashboard',   adminOnly: false },
  { icon: FileText,        path: '/admin/programs',     labelMn: 'Хөтөлбөрүүд',      labelEn: 'Programs',    adminOnly: false },
  { icon: Newspaper,       path: '/admin/news',         labelMn: 'Мэдээ',             labelEn: 'News',        adminOnly: false },
  { icon: Users2,          path: '/admin/leaders',      labelMn: 'Удирдлага',         labelEn: 'Leaders',     adminOnly: false },
  { icon: Columns3,        path: '/admin/pillars',      labelMn: 'Тулгуур чиглэл',   labelEn: 'Pillars',     adminOnly: false },
  { icon: BarChart3,       path: '/admin/stats',        labelMn: 'Статистик',         labelEn: 'Stats',       adminOnly: false },
  { icon: ClipboardList,   path: '/admin/polls',        labelMn: 'Санал асуулга',     labelEn: 'Polls',       adminOnly: false },
  { icon: Inbox,           path: '/admin/submissions',  labelMn: 'Хүсэлтүүд',        labelEn: 'Submissions', adminOnly: true  },
  { icon: UserCog,         path: '/admin/users',        labelMn: 'Хэрэглэгчид',      labelEn: 'Users',       adminOnly: true  },
];

export const AdminSidebar: React.FC<{ collapsed: boolean; onToggle: () => void }> = ({ collapsed, onToggle }) => {
  const { t, l, language } = useI18n();
  const { signOut, role } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = role === 'admin';

  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  const isActive = (path: string) => {
    const fullPath = `/${language}${path}`;
    if (path === '/admin') return location.pathname === fullPath;
    return location.pathname.startsWith(fullPath);
  };

  const navContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-8 flex items-center justify-between">
        {!collapsed && (
          <div>
            <div className="text-xl font-black text-sdy-black tracking-tighter">SDY</div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Panel</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden md:flex p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ChevronLeft size={18} className={`text-gray-400 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-1">
        {visibleItems.map(({ icon: Icon, path, labelMn, labelEn }) => (
          <NavLink
            key={path}
            to={l(path)}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm transition-all ${
              isActive(path)
                ? 'bg-sdy-red text-white'
                : 'text-gray-500 hover:bg-gray-100 hover:text-sdy-black'
            }`}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span className="truncate">{language === 'mn' ? labelMn : labelEn}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-sm text-gray-400 hover:bg-red-50 hover:text-sdy-red transition-all w-full"
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>{t({ mn: 'Гарах', en: 'Logout' })}</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl"
            >
              <X size={18} />
            </button>
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-100 h-screen sticky top-0 transition-all duration-300 ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}>
        {navContent}
      </aside>
    </>
  );
};
