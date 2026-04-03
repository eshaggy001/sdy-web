import React from 'react';
import { SEOMeta } from '../components/SEOMeta';
import { motion } from 'motion/react';
import { useLeaders } from '../hooks/useLeaders';
import { Shield, Target, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

export const About = () => {
  const { t, l } = useI18n();
  const { data: leaders, loading: leadersLoading } = useLeaders();

  return (
    <>
    <SEOMeta
      title={t({ mn: 'Бидний тухай', en: 'About Us' })}
      description={t({ mn: '1997 онд байгуулагдсан НАЗХ нь Монголын залуучуудын хамгийн том байгууллага. 60,000+ гишүүн, 21 аймгийн сүлжээ.', en: 'Founded in 1997, SDY is Mongolia\'s largest youth organization with 60,000+ members across 21 aimags.' })}
      path="/mn/about"
    />
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-32 pb-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="max-w-4xl mb-24">
          <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-6">
            {t({ mn: 'Бидний түүх', en: 'Our Story' })}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-sdy-black dark:text-white leading-tight tracking-tighter mb-8">
            {t({ mn: 'Монголын дараагийн үеийн ', en: 'Empowering the Next Generation of ' })}
            <span className="text-sdy-red">{t({ mn: 'удирдагчдыг чадваржуулах нь.', en: 'Mongolian Leaders.' })}</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed">
            {t({
              mn: '1997 онд байгуулагдсан Нийгмийн Ардчилсан Залуучуудын Холбоо (НАЗХ) нь өдгөө Монгол Улсын өнцөг булан бүрт 60,000 гаруй гишүүнтэй, залуучуудын хамгийн том байгууллага болон өргөжжээ.',
              en: 'Founded in 1997, the Social Democratic Youth (SDY) has grown into Mongolia\'s largest youth organization, representing over 60,000 members across every corner of our nation.'
            })}
          </p>
        </div>

        {/* Mission/Vision Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
          {[
            {
              title: { mn: 'Бидний эрхэм зорилго', en: 'Our Mission' },
              description: { 
                mn: 'Нийгмийн хариуцлагатай, улс төрийн идэвхтэй, дэлхийн хэмжээний сэтгэлгээтэй, эерэг өөрчлөлтийг түүчээлэх шинэ үеийн удирдагчдыг бэлтгэх.',
                en: 'To cultivate a new generation of socially responsible, politically active, and globally minded leaders who drive positive change.'
              },
              icon: Target,
            },
            {
              title: { mn: 'Бидний алсын хараа', en: 'Our Vision' },
              description: { 
                mn: 'Залуу хүн бүр манлайлах боломжтой, шударга, ардчилсан, цэцэглэн хөгжсөн Монгол Улсыг цогцлоох.',
                en: 'A Mongolia where every young person has the opportunity to lead and contribute to a just, democratic, and prosperous society.'
              },
              icon: Shield,
            },
            {
              title: { mn: 'Бидний сүлжээ', en: 'Our Network' },
              description: { 
                mn: '21 аймаг, 9 дүүрэгт идэвхтэй үйл ажиллагаа явуулж буй 60,000 гаруй гишүүдийн хүчирхэг хамтын нийгэмлэг.',
                en: 'A powerful community of 60,000+ members active in 21 aimags and 9 districts, united by shared values and collective action.'
              },
              icon: Users,
            },
          ].map((item, i) => (
            <div key={i} className="group">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-sdy-red group-hover:text-white transition-colors duration-500">
                <item.icon size={32} />
              </div>
              <h3 className="text-2xl font-black text-sdy-black dark:text-white mb-4 uppercase tracking-tight">{t(item.title)}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                {t(item.description)}
              </p>
            </div>
          ))}
        </div>

        {/* Leadership Section */}
        <div className="mb-32">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-4">
                {t({ mn: 'Бидний баг', en: 'Our Team' })}
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-sdy-black dark:text-white tracking-tighter">
                {t({ mn: 'Үндэсний удирдлага', en: 'National Leadership' })}
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-300 max-w-md text-lg">
              {t({ 
                mn: 'Манай хөдөлгөөнийг удирдаж, НАЗХ-ны ирээдүйг тодорхойлж буй зүтгэлтнүүдтэй танилцана уу.',
                en: 'Meet the dedicated individuals leading our movement and shaping the future of SDY.'
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {leadersLoading ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-3xl aspect-[4/5] bg-gray-100 dark:bg-gray-800 mb-6" />
                <div className="h-5 bg-gray-100 dark:bg-gray-800 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2 mb-4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-full" />
              </div>
            )) : leaders.map((leader) => (
              <motion.div 
                key={leader.id}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-3xl aspect-[4/5] mb-6 grayscale hover:grayscale-0 transition-all duration-500">
                  <img 
                    src={leader.image} 
                    alt={t(leader.name)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sdy-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-2xl font-black text-sdy-black dark:text-white mb-1">{t(leader.name)}</h4>
                <p className="text-sdy-red font-black text-sm uppercase tracking-widest mb-4">{t(leader.role)}</p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">{t(leader.bio)}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-sdy-black rounded-4xl p-12 md:p-24 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-sdy-red)_1px,_transparent_1px)] bg-[length:40px_40px] opacity-10" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
              {t({ mn: 'Түүхийн нэг хэсэг болоорой.', en: 'Be Part of the Story.' })}
            </h2>
            <p className="text-xl text-gray-400 mb-10">
              {t({ 
                mn: 'Монголын залуучуудын хамгийн том хөдөлгөөнд нэгдэж, өнөөдрөөс манлайллын аялалаа эхлүүлээрэй.',
                en: 'Join Mongolia\'s largest youth movement and start your journey as a leader today.'
              })}
            </p>
            <Link to={l('/join')} className="btn-primary btn-xl inline-flex items-center gap-3">
              {t({ mn: 'НАЗХ-д нэгдэх', en: 'Join SDY Now' })} <ArrowRight size={24} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
    </>
  );
};
