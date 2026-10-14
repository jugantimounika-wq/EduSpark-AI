import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  FolderKanban, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Activity, 
  Sparkles, 
  RefreshCw,
  Search,
  Check,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { StorageService } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Report, Community } from '../types/database';

export const AdminPage: React.FC = () => {
  const { currentUser, switchUser } = useAuth();
  const { addToast } = useNotification();

  const [reports, setReports] = useState<Report[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeProjects: 0,
    activeCommunities: 0,
    upcomingEvents: 0,
    pendingReports: 0,
    aiGenerationsRun: 0,
    platformUptime: '99.98%'
  });
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'reviewed' | 'all'>('pending');

  const loadAdminData = async () => {
    setLoading(true);
    const [repList, commList, st] = await Promise.all([
      StorageService.getReports(),
      StorageService.getCommunities(),
      StorageService.getPlatformStats()
    ]);
    setReports(repList);
    setCommunities(commList);
    setStats(st);
    setLoading(false);
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleAction = async (reportId: string, action: 'dismissed' | 'action_taken', notes: string) => {
    await StorageService.updateReportStatus(reportId, action, notes);
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: action, actionNotes: notes } : r));
    addToast(
      action === 'action_taken' ? 'Moderation Action Enforced' : 'Report Dismissed',
      `Updated report status to ${action}.`,
      action === 'action_taken' ? 'warning' : 'info'
    );
  };

  const filteredReports = reports.filter(r => {
    if (selectedStatus === 'all') return true;
    return r.status === selectedStatus;
  });

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Admin Header with Role Indicator */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
              Platform Governance & AI Safety Suite
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Admin Panel & Moderation Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Human-in-the-loop review queue for AI flagged discussions, spam detection, community oversight, and platform health metrics.
          </p>
        </div>

        {/* Role status banner */}
        {!isAdmin ? (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 space-y-2">
            <p className="font-semibold flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4" />
              Viewing as {currentUser?.fullName} ({currentUser?.role})
            </p>
            <button
              onClick={() => switchUser('usr-6')}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer w-full"
            >
              Switch to Dr. Alistair Vance (Admin Demo)
            </button>
          </div>
        ) : (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span>Administrator Authorized</span>
          </div>
        )}
      </div>

      {/* 1. Platform Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Members</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.totalMembers}</p>
          <span className="text-[10px] text-emerald-400 font-semibold">+18% this month</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Workspaces</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.activeProjects}</p>
          <span className="text-[10px] text-indigo-400 font-semibold">92% sprint velocity</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI Safety Scans</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.aiGenerationsRun}</p>
          <span className="text-[10px] text-cyan-400 font-semibold">0.4% flag rate</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pending Review Queue</span>
          <p className="text-2xl font-extrabold text-rose-500">{reports.filter(r => r.status === 'pending').length}</p>
          <span className="text-[10px] text-rose-400 font-semibold">Action required</span>
        </div>
      </div>

      {/* 2. AI Community Moderator Queue */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-rose-400" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                AI Community Moderator Queue
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated heuristics flag suspicious spam, malicious links, or harassment. Final consequential actions require human authorization.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {(['pending', 'reviewed', 'all'] as const).map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                  selectedStatus === st
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Cards */}
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-200 dark:border-slate-800">
              No reports in this queue. Platform community health is green!
            </div>
          ) : (
            filteredReports.map(rep => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      Flagged: {rep.targetType}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      "{rep.targetTitle}"
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400">
                      AI Confidence: {Math.round(rep.aiConfidence * 100)}%
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      rep.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400'
                        : rep.status === 'action_taken'
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      Status: {rep.status}
                    </span>
                  </div>
                </div>

                {/* Reason & AI Assessment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Reporter Reason:
                    </span>
                    <p className="text-slate-700 dark:text-slate-300">{rep.reason}</p>
                    <span className="text-[10px] text-slate-400 block mt-2">
                      Reported by {rep.reporter.fullName} on {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-200">
                    <span className="text-[10px] font-bold uppercase block mb-1 text-rose-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      AI Diagnostic Assessment:
                    </span>
                    <p className="text-xs leading-relaxed">{rep.aiAssessment}</p>
                    {rep.actionNotes && (
                      <p className="text-[11px] text-emerald-400 mt-2 font-medium">
                        ✓ Action Notes: {rep.actionNotes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Human Moderator Action Bar */}
                {rep.status === 'pending' && (
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200/60 dark:border-slate-800">
                    <button
                      onClick={() => handleAction(rep.id, 'dismissed', 'Content verified as false positive by human moderator.')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      Dismiss Report (False Positive)
                    </button>
                    <button
                      onClick={() => handleAction(rep.id, 'action_taken', 'Issued official warning to user.')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 transition-colors cursor-pointer"
                    >
                      Warn Author
                    </button>
                    <button
                      onClick={() => handleAction(rep.id, 'action_taken', 'Removed content and quarantined access.')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer"
                    >
                      Remove Content & Penalize
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. Community Management & Platform Audits */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Active Community Guilds Overview
        </h3>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {communities.map(c => (
            <div key={c.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img src={c.iconUrl} alt={c.name} className="h-8 w-8 rounded-lg object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{c.name}</h4>
                  <p className="text-[10px] text-slate-400">{c.category} • {c.memberCount} members</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.isFeatured ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {c.isFeatured ? 'Featured Hub' : 'Standard Guild'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
