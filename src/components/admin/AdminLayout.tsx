import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

export const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0c0c10]">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 min-w-0">
        {children ?? <Outlet />}
      </main>
    </div>
  );
};
