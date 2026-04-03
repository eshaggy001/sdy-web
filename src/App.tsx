import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { AnimatePresence } from 'motion/react';
import { I18nProvider } from './contexts/I18nContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  return (
    <HelmetProvider>
    <Router>
      <I18nProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <Routes>
                {/* Default redirect to /mn */}
                <Route path="/" element={<Navigate to="/mn" replace />} />
                
                {/* Bilingual Routes */}
                <Route path="/:lang">
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
                  <Route path="admin/login" element={<AdminLoginPage />} />
                  <Route path="admin/polls" element={<ProtectedRoute><AdminPollsPage /></ProtectedRoute>} />
                  <Route path="admin/submissions" element={<ProtectedRoute><AdminSubmissionsPage /></ProtectedRoute>} />
                </Route>
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </AuthProvider>
      </I18nProvider>
    </Router>
    </HelmetProvider>
  );
}
