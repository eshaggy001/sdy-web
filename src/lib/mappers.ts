import { Zap, Heart, Globe, Shield, Users, LucideIcon } from 'lucide-react';
import type { Program, NewsItem, Leader, Stat, Pillar, Poll, PollOption } from '../types';

const PILLAR_ICONS: Record<string, LucideIcon> = { Zap, Heart, Globe, Shield };
const STAT_ICONS: Record<string, LucideIcon> = { Users, Globe, Shield };

export function mapProgram(row: Record<string, unknown>): Program {
  const highlights = row.program_highlights as Array<{ text_mn: string; text_en: string; sort_order: number }> | undefined;
  return {
    id: row.id as string,
    title: { mn: row.title_mn as string, en: row.title_en as string },
    pillar: { mn: row.pillar_mn as string, en: row.pillar_en as string },
    status: { mn: row.status_mn as string, en: row.status_en as string },
    description: { mn: row.description_mn as string, en: row.description_en as string },
    image: row.image as string,
    date: row.date_mn ? { mn: row.date_mn as string, en: row.date_en as string } : undefined,
    location: row.location_mn ? { mn: row.location_mn as string, en: row.location_en as string } : undefined,
    content: row.content_mn ? { mn: row.content_mn as string, en: row.content_en as string } : undefined,
    capacity: row.capacity_mn ? { mn: row.capacity_mn as string, en: row.capacity_en as string } : undefined,
    deadline: row.deadline_mn ? { mn: row.deadline_mn as string, en: row.deadline_en as string } : undefined,
    highlights: highlights
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map((h) => ({ mn: h.text_mn, en: h.text_en })),
    maxParticipants: (row.max_participants as number | null) ?? null,
    registrationOpen: (row.registration_open as boolean) ?? false,
  };
}

export function mapNewsItem(row: Record<string, unknown>): NewsItem {
  return {
    id: row.id as string,
    title: { mn: row.title_mn as string, en: row.title_en as string },
    category: { mn: row.category_mn as string, en: row.category_en as string },
    date: { mn: row.date_mn as string, en: row.date_en as string },
    image: row.image as string,
    excerpt: { mn: row.excerpt_mn as string, en: row.excerpt_en as string },
    content: row.content_mn ? { mn: row.content_mn as string, en: row.content_en as string } : undefined,
  };
}

export function mapLeader(row: Record<string, unknown>): Leader {
  return {
    id: row.id as string,
    name: { mn: row.name_mn as string, en: row.name_en as string },
    role: { mn: row.role_mn as string, en: row.role_en as string },
    image: row.image as string,
    bio: { mn: row.bio_mn as string, en: row.bio_en as string },
  };
}

export function mapStat(row: Record<string, unknown>): Stat {
  return {
    label: { mn: row.label_mn as string, en: row.label_en as string },
    value: row.value as string,
    icon: STAT_ICONS[row.icon_name as string],
  };
}

export function mapPillar(row: Record<string, unknown>): Pillar {
  return {
    id: row.id as string,
    title: { mn: row.title_mn as string, en: row.title_en as string },
    description: { mn: row.description_mn as string, en: row.description_en as string },
    icon: PILLAR_ICONS[row.icon_name as string] ?? Zap,
    href: row.href as string,
    image: row.image as string,
  };
}

export function mapPoll(
  row: Record<string, unknown>,
  userVoteMap: Record<string, string> = {}
): Poll {
  const options = row.poll_options as Array<{ id: string; text_mn: string; text_en: string; votes: number }> | undefined;
  return {
    id: row.id as string,
    question: { mn: row.question_mn as string, en: row.question_en as string },
    options: (options ?? []).map((o): PollOption => ({
      id: o.id,
      text: { mn: o.text_mn, en: o.text_en },
      votes: o.votes,
    })),
    totalVotes: row.total_votes as number,
    createdAt: row.created_at as string,
    expiresAt: row.expires_at as string,
    status: row.status as Poll['status'],
    isActive: row.status === 'published',
    showOnHomepage: row.show_on_homepage as boolean,
    userHasVoted: !!userVoteMap[row.id as string],
    selectedOptionId: userVoteMap[row.id as string],
  };
}
