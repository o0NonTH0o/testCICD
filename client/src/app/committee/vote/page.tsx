'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
    (l) => (l.actor?.id === userId) && VOTE_STEPS.includes(l.step)
  );
  if (!log) return null;
  return log.action === 'APPROVED' ? 'APPROVED' : log.action === 'REJECTED' ? 'REJECTED' : null;
}

function getVoteCounts(app: AwardApplication) {
  if (!app.approvalLogs) return { approve: 0, reject: 0 };
  const relevant = app.approvalLogs.filter((l) => VOTE_STEPS.includes(l.step));
  const approve = relevant.filter((l) => l.action === 'APPROVED').length;
  const reject = relevant.filter((l) => l.action === 'REJECTED').length;
  return { approve, reject };
}

// ──────────────────────────────────────
// Sub-components
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

  const statusBadge = () => {
    if (app.status === 'APPROVED')
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
          Passed ✓
        </span>
      );
    if (app.status === 'REJECTED')
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
          Rejected ✗
        </span>
      );
    if (myVote === 'APPROVED')
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
          Voted: Approve ✓
        </span>
      );
    if (myVote === 'REJECTED')
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
          Voted: Reject ✗
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
        Pending ⏱
      </span>
    );
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border transition-all overflow-hidden ${
      myVote ? 'border-green-200' : 'border-gray-100'
    }`}>
      <div className="p-5">
        {/* Top row: photo + info + badge */}
        <div className="flex gap-4 items-start">
          {/* Photo */}
          <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
            {app.user?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={app.user.image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start gap-2">
              <div>
                <p className="font-bold text-gray-900 text-sm leading-tight">{app.user?.name || '-'}</p>
                <p className="text-xs text-green-600 font-medium mt-0.5">
                  {app.user?.faculty?.facultyName || '-'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  GPA: <span className="font-semibold text-gray-800">
                    {app.gpax ? parseFloat(app.gpax).toFixed(2) : '-'}
                  </span> / 4.00
                </p>
              </div>
              <div className="flex-shrink-0">{statusBadge()}</div>
            </div>

            {/* Key Achievements */}
            {app.workItems && app.workItems.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Key Achievements</p>
                <ul className="space-y-0.5">
                  {app.workItems.slice(0, 3).map((w, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">●</span>
                      <span className="truncate">{w.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* View button + vote count */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
          <button
            onClick={() => router.push(`/committee/applications/${app.id}`)}
            className="px-3 py-1 text-xs font-semibold bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            ใบสมัคร
          </button>
          <div className="text-xs text-gray-400 flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> {voteCounts.approve}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-red-400">✗</span> {voteCounts.reject}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: voted state or action buttons */}
      {myVote ? (
        <div className="bg-green-50 border-t border-green-100 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-semibold text-green-700">
              You have voted for this candidate
            </span>
          </div>
        </div>
      ) : isFinal ? (
        <div className="bg-gray-50 border-t border-gray-100 px-5 py-3">
          <p className="text-xs text-center text-gray-400">Voting closed</p>
        </div>
      ) : (
        <div className="border-t border-gray-100 px-5 py-3 flex gap-3">
          <button
            onClick={() => onVote(app.id, 'APPROVED')}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            ) : (
              <>
                เห็นชอบ (Approve)
                <span>👍</span>
              </>
            )}
          </button>
          <button
            onClick={() => onVote(app.id, 'REJECTED')}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-red-50 disabled:opacity-50 text-red-500 border border-red-200 hover:border-red-400 text-sm font-semibold rounded-xl transition-colors"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400" />
            ) : (
              <>
                ไม่เห็นชอบ
                <span>👎</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────
// Main Page
// ──────────────────────────────────────

type Tab = 'PENDING' | 'APPROVED' | 'REJECTED';

export default function CommitteeVotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeId = searchParams.get('typeId');

  const { user, loading: userLoading } = useCurrentUser();
  const [applications, setApplications] = useState<AwardApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('PENDING');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Role guard
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
      await api.patch(`/applications/${id}/status`, { action, comment: `${action === 'APPROVED' ? 'เห็นชอบ' : 'ไม่เห็นชอบ'} โดยคณะกรรมการ` });
      await fetchApplications();
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg('เกิดข้อผิดพลาด');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = applications.filter((app) => {
    // Award type filter
    if (typeId && app.typeId !== typeId && app.awardType?.id !== typeId) return false;

    // Search
    if (search) {
      const q = search.toLowerCase();
      const matchName = app.user?.name?.toLowerCase().includes(q);
      const matchId = app.user?.actualId?.toLowerCase().includes(q);
      const matchEmail = app.user?.email?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchEmail) return false;
    }

    // Tab filter
    if (activeTab === 'PENDING')
      return app.status === 'ACCEPTED_BY_ADMIN' || app.status === 'PENDING_COMMITTEE';
    if (activeTab === 'APPROVED')
      return app.status === 'APPROVED';
    if (activeTab === 'REJECTED')
      return app.status === 'REJECTED';
    return false;
  });

  const pendingCount = applications.filter(
    (a) => (!typeId || a.typeId === typeId || a.awardType?.id === typeId) &&
      (a.status === 'ACCEPTED_BY_ADMIN' || a.status === 'PENDING_COMMITTEE')
  ).length;

  const awardTitle = applications.find(
    (a) => a.awardType && (!typeId || a.awardType.id === typeId)
  )?.awardType?.awardName || 'รายการโหวตทั้งหมด';

  if (userLoading || (loading && applications.length === 0)) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
          <button onClick={() => router.push('/committee/home')} className="hover:text-gray-700">Home</button>
          <span>/</span>
          <span>Vote</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{typeId ? awardTitle : 'รายการโหวตทั้งหมด'}</h1>

        {/* Tabs */}
        <div className="mt-6 flex space-x-8 border-b border-transparent">
          {([
            { key: 'PENDING', label: `Pending Review (${pendingCount})` },
            { key: 'APPROVED', label: 'Approved' },
            { key: 'REJECTED', label: 'Rejected' },
          ] as { key: Tab; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                activeTab === tab.key
                  ? 'text-green-600 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <span className="text-sm text-gray-500">
            {filtered.length} รายการ
          </span>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            {errorMsg}
          </div>
        )}

        {/* Cards Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">ไม่มีรายการในหมวดนี้</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
