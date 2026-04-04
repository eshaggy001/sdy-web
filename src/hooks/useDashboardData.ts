// src/hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DashboardData {
  kpis: {
    totalMembers: number;
    pendingRequests: number;
    joinedThisMonth: number;
    activePercent: number;
    membersTrend: number;
    joinedTrend: number;
    pendingNew: number;
  };
  funnel: {
    requested: number;
    approved: number;
    active: number;
  };
  growth: { month: string; actual: number }[];
  regions: { location: string; count: number }[];
  polls: {
    id: string;
    question: { mn: string; en: string };
    options: { text: { mn: string; en: string }; votes: number }[];
    totalVotes: number;
    expiresAt: string;
  }[];
  news: {
    id: string;
    title: { mn: string; en: string };
    createdAt: string;
    viewCount: number;
  }[];
  events: {
    id: string;
    title: { mn: string; en: string };
    date: string;
    location: { mn: string; en: string };
    status: string;
  }[];
}

const MONTH_LABELS = ['1-р', '2-р', '3-р', '4-р', '5-р', '6-р', '7-р', '8-р', '9-р', '10-р', '11-р', '12-р'];

function groupByMonth(rows: { created_at: string }[] | { created_at: string; location: string }[]): { month: string; actual: number }[] {
  const now = new Date();
  const months: { month: string; actual: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = MONTH_LABELS[d.getMonth()];
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const count = rows.filter((r) => {
      const t = new Date(r.created_at);
      return t >= d && t < nextMonth;
    }).length;
    months.push({ month: label, actual: count });
  }
  return months;
}

function groupByLocation(rows: { location: string }[]): { location: string; count: number }[] {
  const map: Record<string, number> = {};
  rows.forEach((r) => {
    if (r.location) map[r.location] = (map[r.location] ?? 0) + 1;
  });
  return Object.entries(map)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count);
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();
      // Only fetch last 12 months for growth/region charts instead of entire table
      const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();

      const [
        totalRes,
        pendingRes,
        approvedRes,
        thisMonthRes,
        prevMonthRes,
        pendingNewRes,
        recentMembersRes,
        locationRes,
        pollsRes,
        newsRes,
        eventsRes,
      ] = await Promise.all([
        supabase.from('member_applications').select('id', { count: 'exact', head: true }),
        supabase.from('member_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('member_applications').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('member_applications').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
        supabase.from('member_applications').select('id', { count: 'exact', head: true }).gte('created_at', startOfPrevMonth).lt('created_at', startOfMonth),
        supabase.from('member_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending').gte('created_at', startOfWeek),
        // Only fetch last 12 months for growth chart
        supabase.from('member_applications').select('created_at').gte('created_at', twelveMonthsAgo),
        // Only fetch location column for region map
        supabase.from('member_applications').select('location').not('location', 'is', null),
        supabase.from('polls').select('*, poll_options(*)').eq('status', 'published').order('created_at', { ascending: false }).limit(2),
        supabase.from('news_items').select('id, title_mn, title_en, created_at, view_count').order('view_count', { ascending: false }).order('created_at', { ascending: false }).limit(4),
        supabase.from('events').select('*').order('date_start', { ascending: false }).limit(3),
      ]);

      const total = totalRes.count ?? 0;
      const approved = approvedRes.count ?? 0;
      const thisMonth = thisMonthRes.count ?? 0;
      const prevMonth = prevMonthRes.count ?? 0;
      const membersTrend = prevMonth > 0 ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100) : (thisMonth > 0 ? 100 : 0);

      const recentMembers = (recentMembersRes.data ?? []) as { created_at: string }[];
      const locationRows = (locationRes.data ?? []) as { location: string }[];

      const polls = (pollsRes.data ?? []).map((p: any) => ({
        id: p.id,
        question: { mn: p.question_mn, en: p.question_en },
        options: (p.poll_options ?? [])
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((o: any) => ({
            text: { mn: o.text_mn, en: o.text_en },
            votes: o.votes ?? 0,
          })),
        totalVotes: p.total_votes ?? 0,
        expiresAt: p.expires_at ?? '',
      }));

      const news = (newsRes.data ?? []).map((n: any) => ({
        id: n.id,
        title: { mn: n.title_mn, en: n.title_en },
        createdAt: n.created_at,
        viewCount: n.view_count ?? 0,
      }));

      const events = (eventsRes.data ?? []).map((e: any) => ({
        id: e.id,
        title: { mn: e.title_mn, en: e.title_en },
        date: e.date_start,
        location: { mn: e.location_mn ?? '', en: e.location_en ?? '' },
        status: e.status ?? 'upcoming',
      }));

      setData({
        kpis: {
          totalMembers: total,
          pendingRequests: pendingRes.count ?? 0,
          joinedThisMonth: thisMonth,
          activePercent: total > 0 ? Math.round((approved / total) * 100) : 0,
          membersTrend,
          joinedTrend: prevMonth > 0 ? Math.round(((thisMonth - prevMonth) / prevMonth) * 100) : (thisMonth > 0 ? 100 : 0),
          pendingNew: pendingNewRes.count ?? 0,
        },
        funnel: {
          requested: total,
          approved,
          active: approved,
        },
        growth: groupByMonth(recentMembers as any),
        regions: groupByLocation(locationRows),
        polls,
        news,
        events,
      });
    } catch (err) {
      console.error('[useDashboardData]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { data, loading, refetch: load };
}
