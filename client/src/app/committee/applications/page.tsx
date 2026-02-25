'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ThumbsUp, ThumbsDown, CheckCircle2, XCircle, Clock, CheckCheck } from 'lucide-react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { api } from '../../../lib/api';
import { AwardApplication } from '../../../types';

// ──────────────────────────────────────
// Helpers
// ──────────────────────────────────────

const VOTE_STEPS = ['PENDING_COMMITTEE', 'ACCEPTED_BY_ADMIN'];

function getMyVote(app: AwardApplication, userId: string): 'APPROVED' | 'REJECTED' | null {
  if (!app.approvalLogs) return null;
  const log = app.approvalLogs.find(
    (l) => l.actor?.id === userId && VOTE_STEPS.includes(l.step)
  );
  if (!log) return null;
  return log.action === 'APPROVED' ? 'APPROVED' : log.action === 'REJECTED' ? 'REJECTED' : null;
}

function getVoteCounts(app: AwardApplication) {
  if (!app.approvalLogs) return { approve: 0, reject: 0 };
  const relevant = app.approvalLogs.filter((l) => VOTE_STEPS.includes(l.step));
  return {
    approve: relevant.filter((l) => l.action === 'APPROVED').length,
    reject:  relevant.filter((l) => l.action === 'REJECTED').length,
  };
}

// ──────────────────────────────────────
// Status Badge
// ──────────────────────────────────────

function StatusBadge({ app, myVote }: { app: AwardApplication; myVote: 'APPROVED' | 'REJECTED' | null }) {
  if (app.status === 'APPROVED')
    return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200"><CheckCheck className="w-3.5 h-3.5" />Passed</span>;
  if (app.status === 'REJECTED')
    return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200"><XCircle className="w-3.5 h-3.5" />Rejected</span>;
  if (myVote === 'APPROVED')
    return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200"><CheckCircle2 className="w-3.5 h-3.5" />Voted: Approve</span>;
  if (myVote === 'REJECTED')
    return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-red-50 text-red-700 border border-red-200"><XCircle className="w-3.5 h-3.5" />Voted: Reject</span>;
  return <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3.5 h-3.5" />Pending</span>;
}

// ──────────────────────────────────────
// VoteCard
// ──────────────────────────────────────

interface VoteCardProps {
  app: AwardApplication;
  myVote: 'APPROVED' | 'REJECTED' | null;
  voteCounts: { approve: number; reject: number };
  onVote: (id: string, action: 'APPROVED' | 'REJECTED') => Promise<void>;
  actionLoading: string | null;
}

function VoteCard({ app, myVote, voteCounts, onVote, actionLoading }: VoteCardProps) {
  const router = useRouter();
  const isFinal = app.status === 'APPROVED' || app.status === 'REJECTED';
  const isLoading = actionLoading === app.id;
  const isVoted = !!myVote;

  const achievements = app.workItems?.slice(0, 3).map(w =>
    [w.competitionName, w.rank].filter(Boolean).join(' — ') || w.title
  ) ?? [];

  return (
    <div className={`rounded-xl border bg-white p-5 transition-shadow hover:shadow-md ${
      isVoted ? 'ring-2 ring-green-200' : ''
    }`}>
      {/* Top section */}
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="h-20 w-20 rounded-lg flex-shrink-0 overflow-hidden bg-gray-100">
          {app.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={app.user.image} alt={app.user.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-300">
              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-base text-gray-900 leading-tight">{app.user?.name || '-'}</h3>
              <p className="text-sm font-medium text-green-600 mt-0.5">{app.user?.faculty?.facultyName || '-'}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                GPA: <span className="font-semibold text-gray-700">{app.gpax ? parseFloat(app.gpax).toFixed(2) : '-'}</span>
                {app.user?.actualId && <span className="ml-2">#{app.user.actualId}</span>}
              </p>
            </div>
            <StatusBadge app={app} myVote={myVote} />
          </div>

          {/* Key Achievements */}
          {achievements.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-green-600 mb-1">Key Achievements</p>
              <ul className="space-y-0.5">
                {achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">●</span>
                    <span className="line-clamp-1">{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ใบสมัคร + vote counts */}
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => router.push(`/committee/applications/${app.id}`)}
          className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          ใบสมัคร
        </button>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5 text-green-500" /> {voteCounts.approve}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsDown className="h-3.5 w-3.5 text-red-400" /> {voteCounts.reject}
          </span>
        </div>
      </div>

      {/* Footer: voted / closed / action buttons */}
      {isVoted ? (
        <div className="mt-4 flex flex-col items-center gap-1.5 py-2 border-t border-gray-100">
          <p className="flex items-center gap-1.5 text-sm text-green-700 font-medium">
            {myVote === 'APPROVED'
              ? <><CheckCircle2 className="w-4 h-4" /> You have voted: Approve</>
              : <><XCircle className="w-4 h-4 text-red-500" /><span className="text-red-600">You have voted: Reject</span></>}
          </p>
          <button
            onClick={() => onVote(app.id, myVote === 'APPROVED' ? 'REJECTED' : 'APPROVED')}
            className="text-xs text-gray-400 underline hover:text-gray-700 transition-colors"
          >
            Change Vote
          </button>
        </div>
      ) : isFinal ? (
        <div className="mt-4 text-center py-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-400">Voting closed</p>
        </div>
      ) : (
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => onVote(app.id, 'APPROVED')}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:bg-green-300 transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <> เห็นชอบ (Approve) <ThumbsUp className="h-4 w-4" /> </>
            )}
          </button>
          <button
            onClick={() => onVote(app.id, 'REJECTED')}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg border-2 border-red-200 bg-white py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400" />
            ) : (
              <> ไม่เห็นชอบ <ThumbsDown className="h-4 w-4" /> </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────
// Main Page (inner, uses searchParams)
// ──────────────────────────────────────

type Tab = 'PENDING' | 'APPROVED' | 'REJECTED';

function CommitteeApplicationsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeId = searchParams.get('typeId');

  const { user, loading: userLoading } = useCurrentUser();
  const [applications, setApplications] = useState<AwardApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('PENDING');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!userLoading) {
      if (!user) router.push('/');
      else if (user.role !== 'COMMITTEE') router.push('/');
    }
  }, [user, userLoading, router]);

  const fetchApplications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.get<AwardApplication[]>('/applications');
      setApplications(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'COMMITTEE') fetchApplications();
  }, [user, fetchApplications]);

  const handleVote = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    setActionLoading(id);
    setErrorMsg(null);
    try {
      await api.patch(`/applications/${id}/status`, {
        action,
        comment: `${action === 'APPROVED' ? 'เห็นชอบ' : 'ไม่เห็นชอบ'} โดยคณะกรรมการ`,
      });
      await fetchApplications();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setActionLoading(null);
    }
  };

  const matchType = (app: AwardApplication) =>
    !typeId || app.typeId === typeId || app.awardType?.id === typeId;

  const filtered = (() => {
    let apps = applications.filter((app) => {
      if (!matchType(app)) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !app.user?.name?.toLowerCase().includes(q) &&
          !app.user?.actualId?.toLowerCase().includes(q) &&
          !app.user?.email?.toLowerCase().includes(q)
        )
          return false;
      }
      if (activeTab === 'PENDING')
        return app.status === 'ACCEPTED_BY_ADMIN' || app.status === 'PENDING_COMMITTEE';
      if (activeTab === 'APPROVED') return app.status === 'APPROVED';
      if (activeTab === 'REJECTED') return app.status === 'REJECTED';
      return false;
    });
    apps = [...apps].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });
    return apps;
  })();

  const awardTitle = applications.find((a) => matchType(a))?.awardType?.awardName || 'รายการโหวตทั้งหมด';

  return (
    <div className="min-h-screen bg-gray-50 pb-12">

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <button onClick={() => router.push('/committee/home')} className="hover:text-gray-900">Home</button>
            <span>/</span>
            <span>{awardTitle}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{awardTitle}</h1>

          {/* Tabs */}
          <div className="mt-8 flex space-x-8">
            {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 font-medium text-sm transition-colors relative ${
                  activeTab === tab
                    ? 'text-green-600 border-b-2 border-green-500'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'PENDING' ? 'Pending Review' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-lg font-bold text-gray-900">
            All Requests
            <span className="ml-2 text-sm font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {filtered.length}
            </span>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 w-64"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-green-500 focus:border-green-500 bg-white"
            >
              <option value="newest">ใหม่สุด</option>
              <option value="oldest">เก่าสุด</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        {/* Card Grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center text-gray-400">
            <p className="text-lg font-medium">ไม่มีรายการ</p>
            <p className="text-sm mt-1">ไม่พบใบสมัครในหมวดนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((app) => {
              const myVote = user ? getMyVote(app, user.id) : null;
              const voteCounts = getVoteCounts(app);
              return (
                <VoteCard
                  key={app.id}
                  app={app}
                  myVote={myVote}
                  voteCounts={voteCounts}
                  onVote={handleVote}
                  actionLoading={actionLoading}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────
// Exported page (Suspense for searchParams)
// ──────────────────────────────────────

export default function CommitteeApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
        </div>
      }
    >
      <CommitteeApplicationsInner />
    </Suspense>
  );
}
