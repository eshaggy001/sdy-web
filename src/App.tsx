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
import { AnimatePresence } from 'motion/react';
import { I18nProvider } from './contexts/I18nContext';

export default function App() {
  return (
    <Router>
      <I18nProvider>
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
                  <Route path="admin/polls" element={<AdminPollsPage />} />
                </Route>
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </I18nProvider>
    </Router>
  );
}
