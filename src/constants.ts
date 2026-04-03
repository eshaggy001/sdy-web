import { NavItem, Stat, Pillar, Program, NewsItem, Leader, Testimonial } from './types';
import { Users, Globe, Zap, Shield, Heart } from 'lucide-react';

export const NAV_ITEMS: NavItem[] = [
  { label: { mn: 'Нүүр', en: 'Home' }, href: '/' },
  { label: { mn: 'Бидний тухай', en: 'About' }, href: '/about' },
  { label: { mn: 'Үзэл баримтлал', en: 'Ideology' }, href: '/ideology' },
  { label: { mn: 'Хөтөлбөрүүд', en: 'Programs' }, href: '/programs' },
  { label: { mn: 'Мэдээ', en: 'News' }, href: '/news' },
  { label: { mn: 'Санал асуулга', en: 'Polls' }, href: '/polls' },
  { label: { mn: 'Холбоо барих', en: 'Contact' }, href: '/contact' },
];

export const STATS: Stat[] = [
  { label: { mn: 'Идэвхтэй гишүүд', en: 'Active Members' }, value: '60,000+', icon: Users },
  { label: { mn: 'Орон нутгийн салбар', en: 'Regional Branches' }, value: '21', icon: Globe },
  { label: { mn: 'Олон улсын түншүүд', en: 'Global Partners' }, value: '12', icon: Globe },
  { label: { mn: 'Түүхэн замнал', en: 'Years of Impact' }, value: '27', icon: Shield },
];

export const PILLARS: Pillar[] = [
  {
    id: 'personal',
    title: { mn: 'Хувь хүний хөгжил', en: 'Personal Development' },
    description: {
      mn: 'SDY Академиар дамжуулан залуучуудад манлайллын ур чадвар, мэргэжлийн сургалт, менторшип олгож байна.',
      en: 'Empowering youth with leadership skills, professional training, and mentorship through our SDY Academy.'
    },
    icon: Zap,
    href: '/programs?pillar=personal',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'social',
    title: { mn: 'Нийгмийн нөлөөлөл', en: 'Social Impact' },
    description: {
      mn: 'Орон нутгийн санаачилга, сайн дурын ажиллагаагаар дамжуулан нийгмийн шударга ёсыг тогтоох.',
      en: 'Driving community-led development and social justice through grassroots initiatives and volunteerism.'
    },
    icon: Heart,
    href: '/programs?pillar=social',
    image: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'international',
    title: { mn: 'Дэлхийн сүлжээ', en: 'Global Network' },
    description: {
      mn: 'Олон улсын форум, солилцооны хөтөлбөрүүдээр дамжуулан Монгол залуусыг дэлхийтэй холбох.',
      en: 'Connecting Mongolian youth with the world through international forums, exchange programs, and twinning.'
    },
    icon: Globe,
    href: '/programs?pillar=international',
    image: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'political',
    title: { mn: 'Иргэний оролцоо', en: 'Civic Participation' },
    description: {
      mn: 'Прогрессив үнэт зүйлсийг хамгаалж, үндэсний улс төрийн хэлэлцүүлэгт залуусын дуу хоолойг хүргэх.',
      en: 'Advocating for progressive values and ensuring youth voices are heard in the national political dialogue.'
    },
    icon: Shield,
    href: '/programs?pillar=political',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
  },
];

export const PROGRAMS: Program[] = [
  {
    id: 'sdy-academy',
    title: { mn: 'SDY Академи 2026', en: 'SDY Academy 2026' },
    pillar: { mn: 'Хувь хүн', en: 'Personal' },
    status: { mn: 'Идэвхтэй', en: 'Active' },
    description: {
      mn: 'Нийгмийн ардчиллын үнэт зүйлсэд суурилсан залуу мэргэжилтнүүд, оюутнуудад зориулсан манлайллын хөтөлбөр.',
      en: 'Our flagship leadership program for young professionals and students focusing on social democratic values.'
    },
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=800',
    date: { mn: '4-р сарын 15 - 6-р сарын 20', en: 'April 15 - June 20' },
    location: { mn: 'Улаанбаатар, Монгол', en: 'Ulaanbaatar, Mongolia' },
  },
  {
    id: 'edu-scholarship',
    title: { mn: 'SDY EDU Тэтгэлэг', en: 'SDY EDU Scholarship' },
    pillar: { mn: 'Нийгэм', en: 'Social' },
    status: { mn: 'Удахгүй', en: 'Upcoming' },
    description: {
      mn: 'Орон нутгийн шилдэг оюутнуудад дээд боловсрол эзэмшихэд нь санхүүгийн дэмжлэг, менторшип олгох.',
      en: 'Providing financial support and mentorship for outstanding students from rural aimags to pursue higher education.'
    },
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
    date: { mn: 'Эцсийн хугацаа: 5-р сарын 1', en: 'Deadline: May 1' },
    location: { mn: 'Улс даяар', en: 'National' },
  },
  {
    id: 'youth-forum',
    title: { mn: 'Олон улсын залуучуудын форум', en: 'International Youth Forum' },
    pillar: { mn: 'Олон улс', en: 'International' },
    status: { mn: 'Удахгүй', en: 'Upcoming' },
    description: {
      mn: 'Тогтвортой хөгжил, бүс нутгийн хамтын ажиллагааны талаар хэлэлцэх Азийн залуу удирдагчдын цугларалт.',
      en: 'A gathering of young leaders from across Asia to discuss sustainable development and regional cooperation.'
    },
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800',
    date: { mn: '8-р сарын 12-14', en: 'August 12-14' },
    location: { mn: 'Улаанбаатар', en: 'Ulaanbaatar' },
  },
];

export const NEWS: NewsItem[] = [
  {
    id: '1',
    title: { mn: 'Дараагийн үеийн манлайлагчдыг чадваржуулах нь', en: 'Empowering the Next Generation of Leaders' },
    category: { mn: 'Залуусын санал', en: 'Youth Opinion' },
    date: { mn: '2025.11.15', en: 'Nov 15, 2025' },
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200',
    excerpt: {
      mn: 'SDY боловсрол болон идэвхтэй оролцоогоор дамжуулан Монголын улс төрийн ирээдүйг хэрхэн тодорхойлж байна вэ.',
      en: 'How SDY is shaping the future of Mongolian politics through education and active participation.'
    },
    content: {
      mn: `Нийгмийн Ардчилсан Залуучуудын Холбоо (НАЗХ) нь 1997 оноос хойш Монголын залуу удирдагчдыг бэлтгэхэд тасралтгүй ажиллаж байна. Боловсрол, иргэний идэвхжил, бодлогын оролцоо — эдгээр гурван тулгуур нь SDY-ийн үйл ажиллагааны үндэс суурь болдог.\n\nДараагийн үеийн манлайлагчдыг чадваржуулах гэдэг нь зөвхөн мэдлэг эзэмшүүлэхэд хязгаарлагдахгүй. Бодит асуудлыг шийдвэрлэх, хамтын ажиллагааг бэхжүүлэх, ардчилсан зарчмыг амьдралдаа хэрэгжүүлэх чадамжийг хөгжүүлэх явдал юм.\n\nSDY Академийн 2025 оны хөтөлбөрт 21 аймгаас 200 гаруй оролцогч хамрагдаж, улс төр судлал, эдийн засгийн бодлого, нийтийн харилцаа зэрэг чиглэлүүдээр сургалт авлаа. Оролцогчдын 60 гаруй хувь нь орон нутгийн засаг захиргааны нэгжүүдэд идэвхтэй ажиллаж байна.\n\n"Манлайлал бол нэг хүний ажил биш — энэ бол хамт олны үйл явц" гэж SDY-ийн Ерөнхийлөгч Б. Пүрэвдагва онцолсон. "Бид нийгмийн шударга ёс, тэгш боломжийн төлөө зүтгэдэг залуусыг тэтгэж, тэдний дуу хоолойг бодлогын хэлэлцүүлэгт хүргэхийг зорьдог."\n\nЦаашлаад SDY олон улсын хамтрагч байгууллагуудтай хамтран залуу удирдагчдад гадаад туршлага олох боломжийг нэмэгдүүлэх төлөвлөгөөтэй байна. IUSY-тай хамтран зохион байгуулдаг солилцооны хөтөлбөрийг өргөжүүлэх, Европын социал демократ хөдөлгөөнүүдтэй шинэ гэрээ байгуулах ажлууд хийгдэж байна.`,
      en: `The Social Democratic Youth (SDY) has been tirelessly working to develop Mongolia's young leaders since 1997. Education, civic engagement, and policy participation — these three pillars form the foundation of SDY's mission.\n\nEmpowering the next generation of leaders goes beyond simply imparting knowledge. It means developing the capacity to solve real problems, strengthen collaboration, and put democratic principles into practice in everyday life.\n\nSDY Academy's 2025 program brought together over 200 participants from all 21 aimags, receiving training in political science, economic policy, and public communications. More than 60 percent of participants are now actively involved in local government units.\n\n"Leadership is not the work of one person — it is a collective process," said SDY President B. Pürevdagva. "We strive to support young people who fight for social justice and equal opportunity, and to bring their voices into policy discussions."\n\nGoing forward, SDY plans to expand opportunities for young leaders to gain international experience through partnerships with global organizations. Work is underway to expand the exchange program jointly organized with IUSY and to sign new agreements with European social democratic movements.`
    },
  },
  {
    id: '2',
    title: { mn: 'Ногоон ирээдүйг хамтдаа бүтээцгээе', en: 'Creating a Greener Future Together' },
    category: { mn: 'Улс төр', en: 'Political' },
    date: { mn: '2022.05.23', en: 'May 23, 2022' },
    image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80&w=1200',
    excerpt: {
      mn: 'Сүхбаатар аймагт хэрэгжиж буй байгаль орчны бодлогын шинэ санаачилга нь тогтвортой эрчим хүчинд анхаарлаа хандуулж байна.',
      en: 'Our latest environmental policy initiative launched in Sukhbaatar aimag focuses on sustainable energy.'
    },
    content: {
      mn: `Монгол Улс байгалийн нөөцийн асар их баялагтай боловч уур амьсгалын өөрчлөлт, агаарын болон хөрсний бохирдол зэрэг экологийн томоохон сорилтуудтай тулгарч байна. SDY энэхүү асуудлыг улс төрийн тавцанд дэвшүүлж, тогтвортой хөгжлийн бодлогыг нэн тэргүүнд тавьж байна.\n\nСүхбаатар аймагт хэрэгжиж буй "Ногоон Монгол" санаачилгын хүрээнд нарны эрчим хүчний суурилуулалт, орон нутгийн ойн нөхөн сэргээлт, усны нөөц хамгаалалтын арга хэмжээнүүд явагдаж байна. Энэ хөтөлбөрт 500 гаруй өрх үйлчлүүлж, жилд дунджаар 30 хувийн эрчим хүчний хэмнэлтэд хүрсэн байна.\n\nSDY-ийн байгаль орчны бодлогын баг улсын хэмжээнд нүүрстөрөгчийн татвар нэвтрүүлэх, нэн ялангуяа уул уурхайн салбарт ногоон технологийн хөрөнгө оруулалтыг нэмэгдүүлэх санал боловсруулж УИХ-д өргөн мэдүүлэхэд бэлтгэж байна.\n\n"Байгаль орчны хамгаалал бол зөвхөн дараагийн үеийн асуудал биш — энэ бол өнөөгийн залуусын тэргүүлэх зорилт" гэж SDY-ийн байгаль орчны бодлогын зохицуулагч онцоллоо.`,
      en: `Mongolia possesses vast natural resources but faces significant ecological challenges including climate change, air pollution, and soil degradation. SDY is bringing these issues to the political stage, making sustainable development policy a top priority.\n\nWithin the "Green Mongolia" initiative being implemented in Sukhbaatar aimag, solar energy installations, local reforestation efforts, and water resource conservation measures are underway. Over 500 households have benefited from the program, achieving an average energy savings of 30 percent annually.\n\nSDY's environmental policy team is preparing proposals for a national carbon tax and increased green technology investment — particularly in the mining sector — to submit to parliament.\n\n"Environmental protection is not just an issue for future generations — it is the primary goal of today's youth," emphasized SDY's environmental policy coordinator.`
    },
  },
  {
    id: '3',
    title: { mn: 'Тэгш бус байдлыг арилгах нь: Эдийн засгийн стратеги', en: 'Addressing Inequality: Economic Strategies' },
    category: { mn: 'Үзэл баримтлал', en: 'Ideology' },
    date: { mn: '2023.02.23', en: 'Feb 23, 2023' },
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    excerpt: {
      mn: 'Монголын нөхцөл байдалд тохирсон нийгмийн ардчилсан эдийн засгийн бодлогын гүнзгий дүн шинжилгээ.',
      en: 'A deep dive into social democratic economic policies tailored for the Mongolian context.'
    },
    content: {
      mn: `Нийгмийн ардчиллын үзэл баримтлал нь зах зээлийн эдийн засгийн эрх чөлөөг нийгмийн шударга ёстой хослуулах онол практикийн тогтолцоо юм. Монгол Улсын хувьд уул уурхайн орлогын жигд бус хуваарилалт, орон нутаг хооронд болон нийгмийн давхаргуудын хооронд үүссэн гүн тэгш бус байдал нь цочмог асуудал болоод байна.\n\nSDY-ийн эдийн засгийн бодлогын судалгааны баг гаргасан тайланд дурдсанаар Монголын хамгийн баян 10 хувь нь нийт баялгийн 50 орчим хувийг хянадаг байна. Энэхүү тэгш бус байдлыг арилгахын тулд дэвшилтэт татварын тогтолцоо, боловсрол болон эрүүл мэндийн үйлчилгээний нэгдсэн санхүүжилт, орон нутгийн хөгжлийн сан зэрэг арга хэмжээнүүд шаардлагатай байна.\n\nСканdinав орнуудын туршлагаас харахад социал демократ загвар нь эдийн засгийн өсөлтийг сааруулахгүйгээр тэгш бус байдлыг бууруулах боломжтой гэдгийг харуулсан байна. SDY энэ загварыг Монголын онцлогт тохируулан хэрэгжүүлэх нарийвчилсан төлөвлөгөө боловсруулсан.\n\nТус тайланд тусгагдсан гол саналуудын нэг бол уул уурхайн орлогоос санхүүждэг "Залуусын Ирээдүйн Сан" байгуулах явдал юм. Энэ сангаас жил бүр 18-30 насны залуусын боловсрол, эрүүл мэнд, бизнесийн дэмжлэгт зарцуулах саналыг SDY дэмжиж байна.`,
      en: `Social democratic ideology is a theoretical and practical framework that combines the freedom of a market economy with social justice. For Mongolia, the uneven distribution of mining revenues and deep inequality between regions and social classes has become an acute problem.\n\nAccording to a report by SDY's economic policy research team, the wealthiest 10 percent of Mongolians control approximately 50 percent of total wealth. Addressing this inequality requires progressive taxation systems, unified funding for education and healthcare services, and regional development funds.\n\nExperience from Scandinavian countries shows that a social democratic model can reduce inequality without slowing economic growth. SDY has developed a detailed plan to adapt this model to Mongolia's unique context.\n\nOne of the key proposals in the report is the establishment of a "Youth Future Fund" financed from mining revenues. SDY supports a proposal to allocate funds annually from this fund toward education, healthcare, and business support for youth aged 18–30.`
    },
  },
  {
    id: '4',
    title: { mn: 'SDY Академийн 2026 оны элсэлт ёсчлон нээгдлээ', en: 'SDY Academy 2026 Enrollment Now Open' },
    category: { mn: 'Хөтөлбөр', en: 'Program' },
    date: { mn: '2026.01.10', en: 'Jan 10, 2026' },
    image: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=1200',
    excerpt: {
      mn: 'Манлайлал, иргэний идэвхжил болон олон нийтийн бодлогоор мэргэшсэн 18-30 насны 120 залуу оролцогчийг элсүүлнэ.',
      en: 'Applications are open for 120 participants aged 18–30 to specialize in leadership, civic engagement, and public policy.'
    },
    content: {
      mn: `SDY Академи 2026 нь Монголын залуу удирдагчдад зориулсан 10 долоо хоногийн эрчимжүүлсэн хөтөлбөр юм. Энэ жил Улаанбаатарт болон 5 аймгийн төвд зэрэгцэн явагдах тус хөтөлбөр 4-р сарын 15-наас 6-р сарын 20-ны хооронд үргэлжилнэ.\n\nОролцогчид манлайллын онол, нийтийн бодлогын шинжилгээ, иргэний идэвхжил, олон нийттэй харилцах ур чадвар зэрэг сэдвүүдээр гүнзгийрсэн сургалт авна. Гадаадын зочин лекторуудын хичээл, хэлэлцүүлэг, дадлагын ажил хөтөлбөрийн чухал хэсэг болно.\n\nЭлсэлтийн шаардлага:\n— Нас: 18–30\n— Боловсрол: Бакалавраас дээш буюу одоо суралцаж байгаа\n— Монголын иргэн\n— Нийгмийн идэвхтэй оролцоонд сонирхолтой\n\nСонгон шалгаруулалт дараах шатнаас бүрдэнэ: CV болон урам зориг захидал, бичгийн шалгалт, ярилцлага. Шалгарсан оролцогчдод бүрэн тэтгэлэг олгох бөгөөд орон нутгаас ирэгчдэд байр, тээврийн зардлыг хариуцна.\n\nЭлсэлтийн хүсэлтийг 2026 оны 3-р сарын 15-ны дотор sdy.mn/academy цахим хуудсаар илгээнэ үү. Дэлгэрэнгүй мэдээлэл авах бол info@sdy.mn хаягаар холбоо барина уу.`,
      en: `SDY Academy 2026 is an intensive 10-week program for Mongolia's young leaders. This year's program, running simultaneously in Ulaanbaatar and five aimag centers, takes place from April 15 to June 20.\n\nParticipants will receive in-depth training on leadership theory, public policy analysis, civic engagement, and public communication skills. Guest lectures from international speakers, discussions, and practical exercises form an integral part of the curriculum.\n\nEligibility requirements:\n— Age: 18–30\n— Education: Bachelor's degree or currently enrolled\n— Mongolian citizen\n— Interest in active civic participation\n\nSelection involves: CV and motivation letter, written exam, and interview. Selected participants receive a full scholarship, and accommodation and travel costs are covered for those coming from the regions.\n\nSubmit applications by March 15, 2026, at sdy.mn/academy. For more information, contact info@sdy.mn.`
    },
  },
  {
    id: '5',
    title: { mn: 'БНГУ-ын Залуу Нийгэм Демократуудтай хамтын ажиллагааны гэрээ байгуулав', en: 'Partnership Agreement Signed with German Young Social Democrats' },
    category: { mn: 'Олон улс', en: 'International' },
    date: { mn: '2026.02.18', en: 'Feb 18, 2026' },
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
    excerpt: {
      mn: 'SDY болон БНГУ-ын Jusos байгууллагын хооронд солилцооны хөтөлбөр, хамтарсан бодлогын судалгааны гэрээ гарын үсэг зурагдлаа.',
      en: 'SDY and Germany\'s Jusos signed an exchange program and joint policy research agreement, deepening bilateral youth ties.'
    },
    content: {
      mn: `2026 оны 2-р сарын 18-нд Берлин хотод болсон ёслолын үеэр SDY болон Германы Залуу Нийгэм Демократууд (Jusos) хоёр талын хамтын ажиллагааны гэрээнд гарын үсэг зурлаа. Энэхүү гэрээ нь хоёр байгууллагын хооронд удаан хугацааны хамтын ажиллагааг бэхжүүлэх чухал алхам болж байна.\n\nГэрээний хүрээнд жил бүр 10 залуу удирдагчийг харилцан солилцох, хамтарсан бодлогын судалгааны баг байгуулах, нийгмийн ардчиллын үзэл баримтлалыг орон нутгийн нөхцөлд хэрэгжүүлэх туршлага солилцох ажлууд тусгагдсан байна.\n\nSDY-ийн Ерөнхийлөгч Б. Пүрэвдагва гарын үсэг зурах ёслолд хэлсэн үгэндээ: "Германы ардчиллын туршлага, Jusos-ийн залуусыг чадваржуулах аргачлал бидэнд маш их зүйл заах болно. Монголын нийгмийн ардчиллын хөдөлгөөн олон улсын холбоосоо бэхжүүлэх нь нэн чухал."\n\nЭнэхүү хамтын ажиллагаа нь SDY-ийн IUSY болон Progressive Alliance-тэй хамтран ажиллаж буй олон улсын сүлжээний нэг чухал холбоос болохоор байна. 2026 оны 9-р сард Улаанбаатарт хоёр талын анхны хамтарсан семинар зохион байгуулах товлогдсон байна.`,
      en: `On February 18, 2026, at a ceremony held in Berlin, SDY and the German Young Social Democrats (Jusos) signed a bilateral cooperation agreement. This agreement marks an important step in strengthening long-term collaboration between the two organizations.\n\nUnder the agreement, ten young leaders will be exchanged annually, a joint policy research team will be established, and experiences in applying social democratic principles to local contexts will be shared.\n\nSDY President B. Pürevdagva stated at the signing ceremony: "Germany's democratic experience and Jusos's methods of empowering youth have much to teach us. It is critically important for Mongolia's social democratic movement to strengthen its international connections."\n\nThis collaboration is set to become a key link in SDY's international network alongside its work with IUSY and the Progressive Alliance. The first joint seminar between the two parties is scheduled to be held in Ulaanbaatar in September 2026.`
    },
  },
  {
    id: '6',
    title: { mn: 'Нийслэлийн агаарын бохирдлын эсрэг залуусын жагсаал боллоо', en: 'Youth Rally Against Capital City Air Pollution' },
    category: { mn: 'Байгаль орчин', en: 'Environment' },
    date: { mn: '2026.03.05', en: 'Mar 5, 2026' },
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
    excerpt: {
      mn: '3,000 гаруй залуу Сүхбаатарын талбайд цугларч, утааны хязгаарлалт, цэвэр эрчим хүчинд шилжих тухай хуулийн шинэчлэлийг нэхэмжиллээ.',
      en: 'Over 3,000 youth gathered at Sukhbaatar Square to demand stricter emissions limits and faster transition to clean energy legislation.'
    },
    content: {
      mn: `2026 оны 3-р сарын 5-нд Улаанбаатарын Сүхбаатарын талбайд SDY-ийн зохион байгуулалтаар болсон "Цэвэр Агаар — Миний Эрх" жагсаал нь улсын хамгийн том залуусын байгаль орчны жагсаал болж түүхэнд тэмдэглэгдлээ.\n\nЖагсаалд 3,200 гаруй оролцогч цугларч, Монгол Улсын засгийн газарт дараах шаардлагуудыг тавьсан байна:\n— 2027 оноос нүүрсэн зуухны хотод хэрэглээг бүрэн хориглох\n— Гэр хорооллын дулаалгын дэмжлэгийн хөтөлбөрийн санхүүжилтийг нэмэгдүүлэх\n— Нарны болон салхины эрчим хүчний хөрөнгө оруулалтад татварын хөнгөлөлт үзүүлэх\n— Агаарын чанарын шалгуур үзүүлэлтийг Европын стандартад хүргэх\n\nУлаанбаатар дэлхийн хамгийн их агаарын бохирдолтой нийслэлүүдийн нэгд тооцогддог. Өвлийн улиралд PM2.5 тоосонцрын хэмжээ Дэлхийн эрүүл мэндийн байгууллагын зөвшөөрөгдөх хэмжээнээс 20-40 дахин давдаг.\n\n"Энэ бол ирээдүйн асуудал биш. Өнөөдөр амьсгаж буй агаараа цэвэрлэхийн тулд бид одоо үйлчилнэ" гэж жагсаалыг удирдсан SDY-ийн гишүүн Н. Энхтуяа хэлсэн байна.`,
      en: `On March 5, 2026, the "Clean Air — My Right" rally organized by SDY at Ulaanbaatar's Sukhbaatar Square was recorded in history as the country's largest youth environmental protest.\n\nMore than 3,200 participants gathered and presented the following demands to the Government of Mongolia:\n— Complete ban on coal stove use in the city starting in 2027\n— Increase funding for ger district insulation support programs\n— Provide tax incentives for solar and wind energy investment\n— Bring air quality standards up to European standards\n\nUlaanbaatar ranks among the world's most air-polluted capitals. During winter, PM2.5 particulate levels exceed WHO permissible limits by 20 to 40 times.\n\n"This is not a problem for the future. We act now to clean the air we breathe today," said SDY member N. Enkhtuyaa, who led the rally.`
    },
  },
  {
    id: '7',
    title: { mn: '2026 оны сонгуульд залуу нэр дэвшигчдийг дэмжих "Залуу Хүч" санаачилга', en: '"Young Force" Initiative to Back Youth Candidates in 2026 Elections' },
    category: { mn: 'Сонгууль', en: 'Elections' },
    date: { mn: '2026.03.20', en: 'Mar 20, 2026' },
    image: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&q=80&w=1200',
    excerpt: {
      mn: 'SDY 35-аас доош насны 50 нэр дэвшигчийг кампанийн сургалт, санхүүгийн дэмжлэг, дугуйлан сүлжээгээр хангаж хөгжүүлнэ.',
      en: 'SDY will support 50 candidates under 35 with campaign training, financial aid, and a nationwide network of youth hubs.'
    },
    content: {
      mn: `2026 оны УИХ-ын сонгуульд залуусын дуу хоолойг улс төрийн тавцанд хүчтэй хүргэхийн тулд SDY "Залуу Хүч" санаачилгыг албан ёсоор зарлалаа. Энэ нь Монголын сонгуулийн түүхэн дэх залуусын хамгийн томоохон улс төрийн хөдөлгөөн болох юм.\n\n"Залуу Хүч" хөтөлбөрийн хүрээнд:\n— 35-аас доош насны 50 нэр дэвшигчийг дэмжих\n— Нэр дэвшигч тус бүрд 3 сарын эрчимжүүлсэн кампанийн сургалт\n— Орон нутаг бүрт дугуйлангийн сүлжээ байгуулах\n— Дижитал кампанийн удирдлагын дэмжлэг\n— Нэр дэвшигч тус бүрд хуулийн болон санхүүгийн зөвлөгөө\n\nМонголын хууль тогтоомжийн байгуулагуудад 35-аас доош насны төлөөлөл 8 хувь орчимд л байгаа нь дэлхийн дундажаас мэдэгдэхүйц доогуур. SDY энэ тоог 2030 он гэхэд 20 хувиас дээш болгох зорилт тавьж байна.\n\n"Хуулийн тулгуур болох УИХ-д залуусын дуу хоолой сонсогдохгүй бол ардчилсан засаглал бүрэн дүүрэн хэрэгжихгүй" гэж SDY-ийн Ерөнхийлөгч мэдэгдэв. "Бид залуу нэр дэвшигчдийг дэмжих замаар Монголын ирээдүйг тодорхойлоход хувь нэмрээ оруулна."`,
      en: `SDY has officially launched the "Young Force" initiative to bring the voices of youth powerfully onto the political stage in the 2026 parliamentary elections. This is set to become the largest youth political movement in Mongolia's electoral history.\n\nWithin the "Young Force" program:\n— Support for 50 candidates under the age of 35\n— 3 months of intensive campaign training for each candidate\n— Establishment of youth hub networks in every region\n— Digital campaign management support\n— Legal and financial advisory for each candidate\n\nRepresentation of those under 35 in Mongolia's legislative bodies stands at only around 8 percent, significantly below the global average. SDY has set a goal to raise this figure above 20 percent by 2030.\n\n"Without the voices of youth heard in parliament — the cornerstone of legislation — democratic governance cannot be fully realized," said the SDY President. "By supporting young candidates, we contribute to shaping the future of Mongolia."`
    },
  },
];

export const LEADERS: Leader[] = [
  {
    id: 'puredagva',
    name: { mn: 'Б. Пүрэвдагва', en: 'B. Pürevdagva' },
    role: { mn: 'НАМЗХ-ны Ерөнхийлөгч', en: 'SDY President' },
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    bio: {
      mn: '2024 оноос хойш НАМЗХ-г удирдаж байгаа бөгөөд дижитал шилжилт, бүс нутгийн өсөлтөд анхаарлаа хандуулж байна.',
      en: 'Leading SDY since 2024 with a focus on digital transformation and regional growth.'
    },
  },
  {
    id: 'altan',
    name: { mn: 'С. Алтан', en: 'S. Altan' },
    role: { mn: 'Ерөнхий нарийн бичгийн дарга', en: 'General Secretary' },
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    bio: {
      mn: 'Олон улсын харилцаа, залуучуудын өмгөөллийн чиглэлээр 10 гаруй жилийн туршлагатай мэргэжилтэн.',
      en: 'Expert in international relations and youth advocacy with over 10 years of experience.'
    },
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: { mn: 'Г. Бат-Эрдэнэ', en: 'G. Bat-Erdene' },
    role: { mn: 'SDY Академийн төгсөгч', en: 'SDY Academy Graduate' },
    content: {
      mn: 'SDY Академи миний манлайллын талаарх төсөөллийг өөрчилсөн. Энэ нь надад нийгэмдээ бодит өөрчлөлт хийх арга хэрэгслийг өгсөн.',
      en: 'SDY Academy changed my perspective on leadership. It gave me the tools to actually make a difference in my community.'
    },
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: '2',
    name: { mn: 'Э. Хулан', en: 'E. Khulan' },
    role: { mn: 'Сайн дурын зохицуулагч', en: 'Volunteer Coordinator' },
    content: {
      mn: 'SDY-ийн хамт олон, нэгдмэл зорилго үнэхээр гайхалтай. Бид хамтдаа илүү сайн ирээдүйг бүтээж байна.',
      en: 'The sense of community and shared purpose at SDY is incredible. We are truly building a better future together.'
    },
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200',
  },
];
