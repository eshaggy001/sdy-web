import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import type { UserRole } from '../lib/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, role, isLoading } = useAuth();
  const { l } = useI18n();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="w-8 h-8 border-2 border-sdy-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={l('/admin/login')} replace />;
  }

  if (requiredRole === 'admin' && role !== 'admin') {
    return <Navigate to={l('/admin')} replace />;
  }

  return <>{children}</>;
};
