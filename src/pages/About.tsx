import React from 'react';
import { SEOMeta } from '../components/SEOMeta';
import { motion } from 'motion/react';
import { useLeaders } from '../hooks/useLeaders';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

export const About = () => {
  const { t, l } = useI18n();
  const { data: leaders, loading: leadersLoading } = useLeaders();

  return (
    <>
      <SEOMeta
        title={t({ mn: 'Бидний тухай', en: 'About Us' })}
        description={t({ mn: '1997 онд байгуулагдсан SDY нь Монголын залуучуудын хамгийн том байгууллага. 60,000+ гишүүн, 21 аймгийн сүлжээ.', en: 'Founded in 1997, SDY is Mongolia\'s largest youth organization with 60,000+ members across 21 aimags.' })}
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
                mn: '1997 онд байгуулагдсан Нийгмийн Ардчилсан Залуучуудын Холбоо (SDY) нь өдгөө Монгол Улсын өнцөг булан бүрт 60,000 гаруй гишүүнтэй, залуучуудын хамгийн том байгууллага болон өргөжжээ.',
                en: 'Founded in 1997, the Social Democratic Youth (SDY) has grown into Mongolia\'s largest youth organization, representing over 60,000 members across every corner of our nation.'
              })}
            </p>
          </div>

          {/* Values Icons Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-6 mb-32">
            {[
              { icon: '/icons/SDY_icons-01.png', label: { mn: 'Залуучуудын хүсэл зорилго', en: 'Youth Aspirations' } },
              { icon: '/icons/SDY_icons-02.png', label: { mn: 'Хүний эрх', en: 'Human Rights' } },
              { icon: '/icons/SDY_icons-05.png', label: { mn: 'Олон талт соёл', en: 'Multiculturalism' } },
              { icon: '/icons/SDY_icons-06.png', label: { mn: 'Эрх тэгш нийгэм', en: 'Equal Society' } },
              { icon: '/icons/SDY_icons-13.png', label: { mn: 'Хуулийн засаглал', en: 'Rule of Law' } },
              { icon: '/icons/SDY_icons-04.png', label: { mn: 'Шударга ёс', en: 'Justice' } },
              { icon: '/icons/SDY_icons-12.png', label: { mn: 'Эерэг өөрчлөлт', en: 'Positive Change' } },
              { icon: '/icons/SDY_icons-19.png', label: { mn: 'Тогтвортой хөгжил', en: 'Sustainable Development' } },
              { icon: '/icons/SDY_icons-20.png', label: { mn: 'Хамтын үнэ цэн', en: 'Collective Value' } },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden mb-3">
                  <img src={item.icon} alt={t(item.label)} className="w-full h-full object-cover" />
                </div>
                <span className="text-xs md:text-sm font-bold text-sdy-black dark:text-white leading-tight">
                  {t(item.label)}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Strategic Foundation Section */}
          <div className="mb-32">
            <div className="text-sdy-red font-black uppercase tracking-widest text-sm mb-6">
              {t({ mn: 'Стратегийн суурь', en: 'Strategic Foundation' })}
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-sdy-black dark:text-white tracking-tighter mb-16">
              {t({ mn: 'Үзэл баримтлал', en: 'Core Ideology' })}
            </h2>

            {/* Activity Direction */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 md:p-12 mb-8">
              <h3 className="text-2xl font-black text-sdy-red uppercase tracking-tight mb-4">
                {t({ mn: 'Үйл ажиллагааны чиглэл', en: 'Direction of Activities' })}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {t({
                  mn: 'SDY нь 18-35 насны социал демократ үзэл баримтлалтай залуучуудын байгууллага, бид залуучуудад хөгжлийн боломжуудыг олгосноор нийгмийн өмнө тулгамдаад байгаа асуудлуудыг хөндөн, улс орон, нийгмийн тогтвортой хөгжилд бодит хувь нэмрээ оруулахад нь дэмжлэг, нөлөөлөл үзүүлж ажиллана.',
                  en: 'SDY is a youth organization for 18-35 year-olds with social democratic values. By providing development opportunities for youth, we address pressing social issues and work to provide support and advocacy for real contributions to sustainable national and social development.'
                })}
              </p>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 md:p-12">
                <h3 className="text-2xl font-black text-sdy-red uppercase tracking-tight mb-4">
                  {t({ mn: 'Эрхэм зорилго', en: 'Mission' })}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  {t({
                    mn: 'Улс төр, нийгмийн хөгжил дэвшилд манлайлна.',
                    en: 'To lead in political and social development and progress.'
                  })}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 md:p-12">
                <h3 className="text-2xl font-black text-sdy-red uppercase tracking-tight mb-4">
                  {t({ mn: 'Алсын хараа', en: 'Vision' })}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  {t({
                    mn: 'Залуучуудын хөгжил, оролцооны тэргүүлэгч байгууллага байна.',
                    en: 'To be the leading organization in youth development and participation.'
                  })}
                </p>
              </div>
            </div>

            {/* Values Description */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-3xl p-8 md:p-12 mb-12">
              <h3 className="text-2xl font-black text-sdy-red uppercase tracking-tight mb-4">
                {t({ mn: 'Үнэт зүйлс', en: 'Core Values' })}
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {t({
                  mn: 'Залуучуудын хүсэл зорилго, дуу хоолойг төлөөлсөн үндэсний хэмжээний байгууллага байж, нийгмийн бүх салбарыг хамарч, хүний эрх, олон талт соёл, эрх тэгш нийгэм, хуулийн засаглал, шударга ёсыг дээдлэн, улс орон, нийгэмдээ эерэг өөрчлөлт, тогтвортой хөгжлийг хамтын үнэ цэнээр цогцлооход оршино.',
                  en: 'As a national organization representing youth aspirations and voices, covering all sectors of society, upholding human rights, multiculturalism, equal society, rule of law, and justice, our values lie in achieving positive change and sustainable development for our nation and society through collective value.'
                })}
              </p>
            </div>


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
                  mn: 'Манай хөдөлгөөнийг удирдаж, SDY-ны ирээдүйг тодорхойлж буй зүтгэлтнүүдтэй танилцана уу.',
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
                {t({ mn: 'SDY-д нэгдэх', en: 'Join SDY Now' })} <ArrowRight size={24} />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
