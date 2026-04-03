import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Ideology } from './pages/Ideology';
import { ProgramsPage } from './pages/ProgramsPage';
import { ProgramDetailPage } from './pages/ProgramDetailPage';
import { NewsPage } from './pages/NewsPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { JoinPage } from './pages/JoinPage';
import { ContactPage } from './pages/ContactPage';
import { PollsPage } from './pages/PollsPage';
import { AdminPollsPage } from './pages/AdminPollsPage';
import { AdminSubmissionsPage } from './pages/AdminSubmissionsPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminForgotPasswordPage } from './pages/AdminForgotPasswordPage';
import { AdminResetPasswordPage } from './pages/AdminResetPasswordPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminProgramsPage } from './pages/AdminProgramsPage';
import { AdminNewsPage } from './pages/AdminNewsPage';
import { AdminLeadersPage } from './pages/AdminLeadersPage';
import { AdminPillarsPage } from './pages/AdminPillarsPage';
import { AdminStatsPage } from './pages/AdminStatsPage';
import { AdminRegistrationsPage } from './pages/AdminRegistrationsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AnimatePresence } from 'motion/react';
import { I18nProvider } from './contexts/I18nContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HelmetProvider } from 'react-helmet-async';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = /^\/[a-z]{2}\/admin(\/|$)/.test(location.pathname);
  const isAdminLogin = /^\/[a-z]{2}\/admin\/(login|forgot-password|reset-password)$/.test(location.pathname);

  return (
    <div className="min-h-screen flex flex-col">
      {(!isAdminRoute || isAdminLogin) && <Navbar />}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/mn" replace />} />

            <Route path="/:lang">
              {/* Public routes */}
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="ideology" element={<Ideology />} />
              <Route path="programs" element={<ProgramsPage />} />
              <Route path="programs/:id" element={<ProgramDetailPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="news/:id" element={<NewsDetailPage />} />
              <Route path="join" element={<JoinPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="polls" element={<PollsPage />} />

              {/* Admin login (no layout) */}
              <Route path="admin/login" element={<AdminLoginPage />} />
              <Route path="admin/forgot-password" element={<AdminForgotPasswordPage />} />
              <Route path="admin/reset-password" element={<AdminResetPasswordPage />} />

              {/* Admin routes (with layout) */}
              <Route path="admin" element={<ProtectedRoute><AdminLayout><AdminDashboardPage /></AdminLayout></ProtectedRoute>} />
              <Route path="admin/programs" element={<ProtectedRoute><AdminLayout><AdminProgramsPage /></AdminLayout></ProtectedRoute>} />
              <Route path="admin/news" element={<ProtectedRoute><AdminLayout><AdminNewsPage /></AdminLayout></ProtectedRoute>} />
              <Route path="admin/leaders" element={<ProtectedRoute><AdminLayout><AdminLeadersPage /></AdminLayout></ProtectedRoute>} />
              <Route path="admin/pillars" element={<ProtectedRoute><AdminLayout><AdminPillarsPage /></AdminLayout></ProtectedRoute>} />
              <Route path="admin/stats" element={<ProtectedRoute><AdminLayout><AdminStatsPage /></AdminLayout></ProtectedRoute>} />
              <Route path="admin/polls" element={<ProtectedRoute><AdminLayout><AdminPollsPage /></AdminLayout></ProtectedRoute>} />
              <Route path="admin/registrations" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminRegistrationsPage /></AdminLayout></ProtectedRoute>} />
              <Route path="admin/submissions" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminSubmissionsPage /></AdminLayout></ProtectedRoute>} />
              <Route path="admin/users" element={<ProtectedRoute requiredRole="admin"><AdminLayout><AdminUsersPage /></AdminLayout></ProtectedRoute>} />
            </Route>
          </Routes>
          </div>
        </AnimatePresence>
      </main>
      {(!isAdminRoute || isAdminLogin) && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <HelmetProvider>
    <Router>
      <I18nProvider>
      <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      </ThemeProvider>
      </I18nProvider>
    </Router>
    </HelmetProvider>
  );
}
