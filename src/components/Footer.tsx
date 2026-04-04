import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

export const Footer = () => {
  const { t, l } = useI18n();

  const navLinks = [
    { label: { mn: 'Бид хэн бэ', en: 'Who We Are' }, href: '/about' },
    { label: { mn: 'Үзэл баримтлал', en: 'Our Ideology' }, href: '/ideology' },
    { label: { mn: 'Хөтөлбөрүүд', en: 'Programs' }, href: '/programs' },
    { label: { mn: 'Сүүлийн мэдээ', en: 'Recent News' }, href: '/news' },
  ];

  const involvedLinks = [
    { label: { mn: 'Гишүүнээр элсэх', en: 'Join as Member' }, href: '/join' },
    { label: { mn: 'Сайн дурын ажилтан', en: 'Volunteer' }, href: '/contact' },
    { label: { mn: 'Санал асуулга', en: 'Polls' }, href: '/polls' },
    { label: { mn: 'Холбоо барих', en: 'Contact Us' }, href: '/contact' },
  ];

  // Inline SVGs for social icons (branded icons deprecated in lucide-react)
  const socialLinks = [
    {
      href: 'https://x.com/SdyMongolia', label: 'X (Twitter)',
      svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
    },
    {
      href: 'https://www.facebook.com/SDYMongolia', label: 'Facebook',
      svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
    },
    {
      href: 'https://www.instagram.com/sdymongolia', label: 'Instagram',
      svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>,
    },
    {
      href: 'https://www.youtube.com/@SDYMongolia', label: 'YouTube',
      svg: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
    },
  ];

  return (
    <footer className="bg-sdy-black text-white">
      {/* Top CTA strip */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 font-bold text-sm">
            {t({ mn: 'Хөдөлгөөний нэг хэсэг болоорой →', en: 'Be part of the movement →' })}
          </p>
          <Link
            to={l('/join')}
            className="btn-primary btn-sm flex items-center gap-2"
          >
            {t({ mn: 'Өнөөдөр нэгдэх', en: 'Join Today' })}
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link to={l('/')} className="inline-flex mb-6 group w-fit">
              <img
                src="/sdy-logo.png"
                alt="SDY Mongolia"
                className="h-8 w-auto transition-opacity duration-200 group-hover:opacity-80"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
            <p className="text-gray-500 leading-relaxed mb-6 text-sm max-w-[240px]">
              {t({
                mn: 'Монголын залуучуудын тэргүүлэгч дэвшилтэт дуу хоолой. 1997 оноос хойш.',
                en: 'The leading progressive voice for Mongolian youth. Building a democratic future since 1997.',
              })}
            </p>
            <div className="flex gap-2.5">
              {socialLinks.map(({ svg, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center hover:bg-sdy-red transition-colors duration-200"
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[11px] font-black mb-5 uppercase tracking-[0.14em] text-gray-400">
              {t({ mn: 'Цэс', en: 'Navigation' })}
            </h4>
            <ul className="space-y-3">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    to={l(href)}
                    className="text-gray-500 hover:text-white transition-colors font-semibold text-sm"
                  >
                    {t(label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h4 className="text-[11px] font-black mb-5 uppercase tracking-[0.14em] text-gray-400">
              {t({ mn: 'Оролцох', en: 'Get Involved' })}
            </h4>
            <ul className="space-y-3">
              {involvedLinks.map(({ label, href }) => (
                <li key={href + String(label.en)}>
                  <Link
                    to={l(href)}
                    className="text-gray-500 hover:text-white transition-colors font-semibold text-sm"
                  >
                    {t(label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-black mb-5 uppercase tracking-[0.14em] text-gray-400">
              {t({ mn: 'Холбоо барих', en: 'Contact' })}
            </h4>
            <ul className="space-y-3.5 text-gray-500 font-semibold text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sdy-red flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {t({ mn: 'Тусгаар тогтнолын ордон, Сүхбаатарын талбай, УБ', en: 'Independence Palace, Sukhbaatar Square, UB' })}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-sdy-red flex-shrink-0" />
                <a href="mailto:info@sdy.mn" className="hover:text-white transition-colors">info@sdy.mn</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-sdy-red flex-shrink-0" />
                <span>+976 99247526</span>
              </li>
              <li className="pt-2">
                <span className="inline-block px-3 py-1.5 border border-white/10 rounded-lg text-[10px] font-black tracking-widest uppercase text-gray-600">
                  {t({ mn: 'IUSY гишүүн', en: 'Member of IUSY' })}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[12px] text-gray-600 font-semibold">
            © 2026 {t({ mn: 'Нийгмийн Ардчилсан Залуучуудын Холбоо.', en: 'Social Democratic Youth Organization.' })}
          </p>
          <div className="flex gap-6 text-[12px] text-gray-600 font-semibold">
            <Link to={l('/')} className="hover:text-gray-400 transition-colors">
              {t({ mn: 'Нууцлалын бодлого', en: 'Privacy Policy' })}
            </Link>
            <Link to={l('/')} className="hover:text-gray-400 transition-colors">
              {t({ mn: 'Үйлчилгээний нөхцөл', en: 'Terms of Service' })}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
