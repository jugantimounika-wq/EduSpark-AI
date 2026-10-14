import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Users, 
  FolderKanban, 
  Calendar, 
  Award, 
  ArrowRight, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  Bell,
  Clock,
  Compass,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StorageService } from '../lib/storage';
import { AIService } from '../lib/aiService';
import { Community, Project, Event, Notification, Achievement } from '../types/database';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [recommendedCommunities, setRecommendedCommunities] = useState<{ community: Community; matchScore: number; reason: string }[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const [comms, projs, evts, notifs, achs] = await Promise.all([
          StorageService.getCommunities(),
          StorageService.getProjects(),
          StorageService.getEvents(),
          StorageService.getNotifications(),
          StorageService.getAchievements()
        ]);
        setCommunities(comms);
        setProjects(projs);
        setEvents(evts);
        setNotifications(notifs.slice(0, 4));
        setAchievements(achs);

        if (currentUser) {
          const matched = await AIService.matchCommunitiesForUser(currentUser, comms);
          setRecommendedCommunities(matched.slice(0, 2));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [currentUser]);

  // Greeting by hour
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Personalized Welcome & Quick Actions Header */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-900/40 via-violet-950/30 to-slate-900 border border-indigo-500/20 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatarUrl}
            alt={currentUser?.fullName}
            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-lg"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {getGreeting()}, {currentUser?.fullName?.split(' ')[0] || 'Creator'}!
              </h1>
              {currentUser?.isVerified && (
                <span title="Verified Member">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              {currentUser?.headline || 'Ready to co-create and explore new AI workflows today.'}
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => navigate('/ai-assistant?tab=idea')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
            <span>Generate Idea</span>
          </button>
          <button
            onClick={() => navigate('/projects?action=create')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Project</span>
          </button>
          <button
            onClick={() => navigate('/discover')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            <span>Find Teammates</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{projects.length}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Active Workspaces</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-500">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {communities.filter(c => c.isJoined).length}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Joined Communities</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 text-cyan-500">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {unlockedCount} / {achievements.length}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Badges Unlocked</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {currentUser?.reputationPoints || 100}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Reputation Points</p>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid (2 columns: Left 2/3, Right 1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: AI Recommendations & Trending Projects */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* AI Recommended Communities */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  AI Recommended Communities For You
                </h3>
              </div>
              <Link to="/communities" className="text-xs font-semibold text-indigo-500 hover:text-indigo-400">
                View all ({communities.length}) →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedCommunities.map(({ community, matchScore, reason }) => (
                <div
                  key={community.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between hover:border-indigo-500/40 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {matchScore}% Match
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {community.memberCount} members
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 mb-2">
                      <img src={community.iconUrl} alt={community.name} className="h-8 w-8 rounded-lg object-cover" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {community.name}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {community.tagline}
                    </p>

                    <div className="p-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-[10px] text-indigo-600 dark:text-indigo-300 leading-snug mb-3">
                      💡 <strong>Why Match: </strong>{reason}
                    </div>
                  </div>

                  <Link
                    to={`/communities/${community.slug}`}
                    className="w-full py-1.5 rounded-lg text-center text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors block"
                  >
                    Enter Hub
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Active Workspaces / Projects */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Active Projects & Sprints
                </h3>
              </div>
              <Link to="/projects" className="text-xs font-semibold text-indigo-500 hover:text-indigo-400">
                View all ({projects.length}) →
              </Link>
            </div>

            <div className="space-y-3">
              {projects.map(p => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 bg-slate-50/40 dark:bg-slate-800/20 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500">
                        {p.stage}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-400 transition-colors">
                        {p.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {p.tagline}
                    </p>
                  </div>

                  {/* Progress & Team */}
                  <div className="flex items-center gap-5 w-full sm:w-auto justify-between">
                    <div className="w-28 text-right">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {p.progress}%
                      </span>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-1">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex -space-x-2 shrink-0">
                      {p.members.slice(0, 3).map((m, i) => (
                        <img
                          key={i}
                          src={m.avatarUrl}
                          alt={m.fullName}
                          className="h-7 w-7 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                          title={m.fullName}
                        />
                      ))}
                    </div>

                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Upcoming Deadlines & Recent Alerts */}
        <div className="space-y-8">
          
          {/* Upcoming Events / Hackathon Deadlines */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Upcoming Deadlines
                </h3>
              </div>
              <Link to="/events" className="text-xs font-semibold text-indigo-500 hover:text-indigo-400">
                All Events →
              </Link>
            </div>

            <div className="space-y-3">
              {events.slice(0, 2).map(evt => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {evt.title}
                    </h5>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 shrink-0">
                      {evt.type}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-slate-400" />
                    Deadline: {new Date(evt.registrationDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>

                  {evt.isRegistered && (
                    <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Registered • Ticket: {evt.ticketCode}</span>
                    </div>
                  )}

                  <Link
                    to={`/events/${evt.slug}`}
                    className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-400 block pt-1"
                  >
                    View Details & Agenda →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Alerts */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-violet-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Recent Activity
                </h3>
              </div>
              <Link to="/notifications" className="text-xs font-semibold text-indigo-500 hover:text-indigo-400">
                Inbox →
              </Link>
            </div>

            <div className="space-y-3">
              {notifications.map(n => (
                <div key={n.id} className="text-xs space-y-1 pb-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {n.title}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
