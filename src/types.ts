import { LucideIcon } from 'lucide-react';

export interface LocalizedString {
  mn: string;
  en: string;
}

export interface NavItem {
  label: LocalizedString;
  href: string;
}

export interface Stat {
  label: LocalizedString;
  value: string;
  unit?: LocalizedString;
  icon?: LucideIcon;
}

export interface Pillar {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  icon: LucideIcon;
  href: string;
  image: string;
}

export interface Program {
  id: string;
  title: LocalizedString;
  pillar: LocalizedString;
  status: LocalizedString;
  description: LocalizedString;
  image: string;
  date?: LocalizedString;
  location?: LocalizedString;
  content?: LocalizedString;
  highlights?: LocalizedString[];
  capacity?: LocalizedString;
  deadline?: LocalizedString;
  maxParticipants?: number | null;
  registrationOpen?: boolean;
}

export interface ProgramRegistration {
  id: string;
  programId: string;
  programTitle?: LocalizedString;
  name: string;
  email: string;
  phone: string;
  age?: number;
  isSdyMember?: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';

export interface SDYEvent {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  content?: LocalizedString;
  image?: string;
  dateStart: string;
  dateEnd?: string;
  location?: LocalizedString;
  status: EventStatus;
  registrationOpen: boolean;
  maxParticipants?: number | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle?: LocalizedString;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface NewsItem {
  id: string;
  title: LocalizedString;
  category: LocalizedString;
  date: LocalizedString;
  image: string;
  excerpt: LocalizedString;
  content?: LocalizedString;
}

export interface Leader {
  id: string;
  name: LocalizedString;
  role: LocalizedString;
  image: string;
  bio: LocalizedString;
}

export interface Testimonial {
  id: string;
  name: LocalizedString;
  role: LocalizedString;
  content: LocalizedString;
  image: string;
}

export type PollStatus = 'draft' | 'published' | 'expired' | 'archived';

export interface PollOption {
  id: string;
  text: LocalizedString;
  votes: number;
}

export interface Poll {
  id: string;
  question: LocalizedString;
  options: PollOption[];
  totalVotes: number;
  createdAt: string;
  expiresAt: string;
  status: PollStatus;
  isActive: boolean;
  userHasVoted?: boolean;
  selectedOptionId?: string;
  showOnHomepage?: boolean;
}
