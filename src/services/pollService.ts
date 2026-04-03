import { Poll, PollOption, PollStatus } from '../types';

const STORAGE_KEY = 'sdy_polls';
const VOTES_KEY = 'sdy_user_votes';

const DEFAULT_POLLS: Poll[] = [
  {
    id: '1',
    question: {
      mn: 'Та Туулын хурдны замын төслийг дэмжиж байна уу?',
      en: 'Do you support the Tuul Highway project?'
    },
    options: [
      { id: 'opt1', text: { mn: 'Тийм', en: 'Yes' }, votes: 124 },
      { id: 'opt2', text: { mn: 'Үгүй', en: 'No' }, votes: 86 }
    ],
    totalVotes: 210,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    isActive: true,
    showOnHomepage: true
  },
  {
    id: '2',
    question: {
      mn: 'Залуучуудын улс төрийн оролцоог нэмэгдүүлэх хамгийн үр дүнтэй арга юу вэ?',
      en: 'What is the most effective way to increase youth political participation?'
    },
    options: [
      { id: 'opt3', text: { mn: 'Боловсрол', en: 'Education' }, votes: 45 },
      { id: 'opt4', text: { mn: 'Цахим платформ', en: 'Digital Platforms' }, votes: 32 },
      { id: 'opt5', text: { mn: 'Шууд уулзалт', en: 'Direct Meetings' }, votes: 18 }
    ],
    totalVotes: 95,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    isActive: true,
    showOnHomepage: true
  },
  {
    id: '3',
    question: {
      mn: 'Монголын их дээд сургуулийн сургалтын төлбөрийг улс бүрэн хариуцах ёстой юу?',
      en: 'Should the state fully cover university tuition fees in Mongolia?'
    },
    options: [
      { id: 'opt6', text: { mn: 'Тийм, бүрэн үнэгүй байх ёстой', en: 'Yes, fully free' }, votes: 312 },
      { id: 'opt7', text: { mn: 'Зарим хэсгийг — орлогоос хамааруулж', en: 'Partially — means-tested support' }, votes: 178 },
      { id: 'opt8', text: { mn: 'Үгүй, одоогийн тогтолцоо хангалттай', en: 'No, current system is sufficient' }, votes: 54 }
    ],
    totalVotes: 544,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    isActive: true,
    showOnHomepage: false
  },
  {
    id: '4',
    question: {
      mn: 'Нийслэлийн агаарын бохирдлыг бууруулах хамгийн чухал арга хэмжээ юу вэ?',
      en: 'What is the most important measure to reduce Ulaanbaatar\'s air pollution?'
    },
    options: [
      { id: 'opt9',  text: { mn: 'Нүүрсний хэрэглээг хориглох', en: 'Ban coal use' }, votes: 201 },
      { id: 'opt10', text: { mn: 'Нийтийн тээврийг өргөжүүлэх', en: 'Expand public transport' }, votes: 167 },
      { id: 'opt11', text: { mn: 'Цэвэр эрчим хүчинд татаас олгох', en: 'Subsidise clean energy' }, votes: 143 },
      { id: 'opt12', text: { mn: 'Аж үйлдвэрийн хатуу хяналт', en: 'Stricter industrial regulation' }, votes: 89 }
    ],
    totalVotes: 600,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    isActive: true,
    showOnHomepage: false
  },
  {
    id: '5',
    question: {
      mn: 'Санал өгөх насны доод хязгаарыг 16 болгон бууруулах ёстой юу?',
      en: 'Should the voting age be lowered to 16?'
    },
    options: [
      { id: 'opt13', text: { mn: 'Тийм', en: 'Yes' }, votes: 389 },
      { id: 'opt14', text: { mn: 'Үгүй', en: 'No' }, votes: 241 }
    ],
    totalVotes: 630,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    isActive: true,
    showOnHomepage: false
  },
  {
    id: '6',
    question: {
      mn: 'SDY-ийн ямар хөтөлбөр таны хувьд хамгийн чухал вэ?',
      en: 'Which SDY program matters most to you?'
    },
    options: [
      { id: 'opt15', text: { mn: 'SDY Академи — манлайллын сургалт', en: 'SDY Academy — leadership training' }, votes: 156 },
      { id: 'opt16', text: { mn: 'EDU Тэтгэлэг — боловсролын дэмжлэг', en: 'EDU Scholarship — education support' }, votes: 134 },
      { id: 'opt17', text: { mn: 'Олон улсын форум — гадаад сүлжээ', en: 'International Forum — global network' }, votes: 78 },
      { id: 'opt18', text: { mn: 'Орон нутгийн хөтөлбөрүүд', en: 'Local community programs' }, votes: 102 }
    ],
    totalVotes: 470,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'published',
    isActive: true,
    showOnHomepage: false
  }
];

export const pollService = {
  getPolls: (): Poll[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const polls: Poll[] = stored ? JSON.parse(stored) : DEFAULT_POLLS;
    const userVotes = JSON.parse(localStorage.getItem(VOTES_KEY) || '{}');

    return polls.map(poll => ({
      ...poll,
      userHasVoted: !!userVotes[poll.id],
      selectedOptionId: userVotes[poll.id]
    }));
  },

  savePolls: (polls: Poll[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
  },

  vote: (pollId: string, optionId: string): Poll | null => {
    const polls = pollService.getPolls();
    const pollIndex = polls.findIndex(p => p.id === pollId);
    
    if (pollIndex === -1) return null;
    
    const poll = polls[pollIndex];
    if (poll.userHasVoted || !poll.isActive) return poll;

    const optionIndex = poll.options.findIndex(o => o.id === optionId);
    if (optionIndex === -1) return poll;

    poll.options[optionIndex].votes += 1;
    poll.totalVotes += 1;
    poll.userHasVoted = true;
    poll.selectedOptionId = optionId;

    const userVotes = JSON.parse(localStorage.getItem(VOTES_KEY) || '{}');
    userVotes[pollId] = optionId;
    localStorage.setItem(VOTES_KEY, JSON.stringify(userVotes));

    polls[pollIndex] = poll;
    pollService.savePolls(polls);

    return poll;
  },

  createPoll: (pollData: Partial<Poll>): Poll => {
    const polls = pollService.getPolls();
    const newPoll: Poll = {
      id: Math.random().toString(36).substr(2, 9),
      question: pollData.question || { mn: '', en: '' },
      options: pollData.options || [],
      totalVotes: 0,
      createdAt: new Date().toISOString(),
      expiresAt: pollData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: pollData.status || 'draft',
      isActive: pollData.status === 'published',
      showOnHomepage: pollData.showOnHomepage || false,
      ...pollData
    };
    
    polls.push(newPoll);
    pollService.savePolls(polls);
    return newPoll;
  },

  updatePoll: (pollId: string, pollData: Partial<Poll>): Poll | null => {
    const polls = pollService.getPolls();
    const index = polls.findIndex(p => p.id === pollId);
    if (index === -1) return null;

    polls[index] = { ...polls[index], ...pollData };
    pollService.savePolls(polls);
    return polls[index];
  },

  deletePoll: (pollId: string) => {
    const polls = pollService.getPolls();
    const filtered = polls.filter(p => p.id !== pollId);
    pollService.savePolls(filtered);
  }
};
