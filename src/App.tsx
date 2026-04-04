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
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminProgramEditPage } from './pages/AdminProgramEditPage';
import { AdminNewsEditPage } from './pages/AdminNewsEditPage';
import { AdminLeaderEditPage } from './pages/AdminLeaderEditPage';
import { AdminPillarEditPage } from './pages/AdminPillarEditPage';
import { AdminStatEditPage } from './pages/AdminStatEditPage';
import { AdminPollEditPage } from './pages/AdminPollEditPage';
import { AdminEventsPage } from './pages/AdminEventsPage';
import { AdminEventEditPage } from './pages/AdminEventEditPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { AdminLayout } from './components/admin/AdminLayout';
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
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {(!isAdminRoute || isAdminLogin) && <Navbar />}
      <main className="flex-grow">
        <Routes>
            <Route path="/" element={<Navigate to="/mn" replace />} />

            <Route path="/:lang">
              {/* Public routes */}
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="ideology" element={<Ideology />} />
              <Route path="programs" element={<ProgramsPage />} />
              <Route path="programs/:id" element={<ProgramDetailPage />} />
              <Route path="events/:id" element={<EventDetailPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="news/:id" element={<NewsDetailPage />} />
              <Route path="join" element={<JoinPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="polls" element={<PollsPage />} />

              {/* Admin login (no layout) */}
              <Route path="admin/login" element={<AdminLoginPage />} />
              <Route path="admin/forgot-password" element={<AdminForgotPasswordPage />} />
              <Route path="admin/reset-password" element={<AdminResetPasswordPage />} />

              {/* Admin routes (nested under shared layout) */}
              <Route path="admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="programs" element={<AdminProgramsPage />} />
                <Route path="programs/:id" element={<AdminProgramEditPage />} />
                <Route path="events" element={<AdminEventsPage />} />
                <Route path="events/:id" element={<AdminEventEditPage />} />
                <Route path="news" element={<AdminNewsPage />} />
                <Route path="news/:id" element={<AdminNewsEditPage />} />
                <Route path="leaders" element={<AdminLeadersPage />} />
                <Route path="leaders/:id" element={<AdminLeaderEditPage />} />
                <Route path="pillars" element={<AdminPillarsPage />} />
                <Route path="pillars/:id" element={<AdminPillarEditPage />} />
                <Route path="stats" element={<AdminStatsPage />} />
                <Route path="stats/:id" element={<AdminStatEditPage />} />
                <Route path="polls" element={<AdminPollsPage />} />
                <Route path="polls/:id" element={<AdminPollEditPage />} />
                <Route path="submissions" element={<ProtectedRoute requiredRole="admin"><AdminSubmissionsPage /></ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute requiredRole="admin"><AdminUsersPage /></ProtectedRoute>} />
              </Route>
            </Route>
          </Routes>
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
