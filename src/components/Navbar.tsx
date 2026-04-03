import React, { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { language, setLanguage, t, l } = useI18n();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const toggleLanguage = () => setLanguage(language === 'mn' ? 'en' : 'mn');

  const isActive = (href: string) => location.pathname === l(href);

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-[0_1px_12px_rgba(0,0,0,0.06)] py-3'
          : 'bg-white/0 py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link to={l('/')} className="flex items-center flex-shrink-0 group">
            <img
              src="/sdy-logo.png"
              alt="SDY Mongolia"
              className="h-8 w-auto transition-opacity duration-200 group-hover:opacity-80"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={String(item.href)}
                  to={l(item.href)}
                  className={`relative px-3 py-2 text-[13px] font-bold rounded-lg transition-all duration-200 ${
                    active
                      ? 'text-sdy-red'
                      : 'text-sdy-black/70 hover:text-sdy-black hover:bg-gray-50'
                  }`}
                >
                  {t(item.label)}
                  {active && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute bottom-0.5 left-3 right-3 h-0.5 bg-sdy-red rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:border-sdy-red/40 transition-all font-black text-[11px] uppercase tracking-widest text-sdy-black/60 hover:text-sdy-red bg-white/60"
            >
              <Globe size={12} className="text-sdy-red" />
              {language === 'mn' ? 'EN' : 'MN'}
            </button>

            {/* Join CTA */}
            <Link to={l('/join')} className="btn-primary btn-sm">
              {t({ mn: 'Элсэх', en: 'Join SDY' })}
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 font-black text-[11px] uppercase tracking-widest text-sdy-black"
            >
              <Globe size={11} className="text-sdy-red" />
              {language === 'mn' ? 'EN' : 'MN'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-sdy-black"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden shadow-xl"
          >
            <div className="px-4 pt-4 pb-8 space-y-1">
              {NAV_ITEMS.map((item, i) => {
                const active = isActive(item.href);
                return (
                  <motion.div
                    key={String(item.href)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      to={l(item.href)}
                      className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-base transition-colors ${
                        active
                          ? 'bg-sdy-red/8 text-sdy-red'
                          : 'text-sdy-black hover:bg-gray-50'
                      }`}
                    >
                      {t(item.label)}
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-sdy-red" />}
                    </Link>
                  </motion.div>
                );
              })}

              <div className="pt-4 px-1">
                <Link
                  to={l('/join')}
                  className="btn-primary btn-lg btn-full flex items-center"
                >
                  {t({ mn: 'Хөдөлгөөнд нэгдэх', en: 'Join The Movement' })}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
