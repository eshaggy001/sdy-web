import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export type Language = 'mn' | 'en';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (content: { mn: string; en: string } | string) => string;
  l: (path: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('sdy_lang');
    if (saved === 'mn' || saved === 'en') return saved;
    return 'mn';
  });

  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const langInPath = pathParts[1];
    
    if (langInPath === 'mn' || langInPath === 'en') {
      if (langInPath !== language) {
        setLanguageState(langInPath as Language);
        localStorage.setItem('sdy_lang', langInPath);
      }
    } else {
      // Redirect to default language path if no lang prefix
      const newPath = `/${language}${location.pathname === '/' ? '' : location.pathname}`;
      navigate(newPath, { replace: true });
    }
  }, [location.pathname, language, navigate]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sdy_lang', lang);
    
    const pathParts = location.pathname.split('/');
    pathParts[1] = lang;
    navigate(pathParts.join('/'), { replace: true });
  };

  const t = (content: { mn: string; en: string } | string): string => {
    if (typeof content === 'string') return content;
    return content[language] || content['mn'];
  };

  const l = (path: string): string => {
    if (path.startsWith('/mn') || path.startsWith('/en')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `/${language}${cleanPath === '/' ? '' : cleanPath}`;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, l }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
