import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  Users, 
  FolderKanban, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  UserPlus, 
  ArrowRight,
  Award
} from 'lucide-react';
import { StorageService } from '../lib/storage';
import { AIService } from '../lib/aiService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Community, Profile, Project, Event, AITeamMatchResult } from '../types/database';

export const DiscoverPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToast } = useNotification();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState<'all' | 'communities' | 'people' | 'projects' | 'events'>('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [communities, setCommunities] = useState<Community[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [aiMatches, setAiMatches] = useState<AITeamMatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cList, pList, prList, eList] = await Promise.all([
          StorageService.getCommunities(),
          StorageService.getProfiles(),
          StorageService.getProjects(),
          StorageService.getEvents()
        ]);
        setCommunities(cList);
        setProfiles(pList.filter(p => p.id !== currentUser?.id));
        setProjects(prList);
        setEvents(eList);

        if (currentUser) {
          const matchResults = await AIService.matchTeamCandidates({
            projectId: 'explore',
            requiredSkills: currentUser.skills,
            preferredInterests: currentUser.interests,
            teamSizeGoal: 4
          }, pList.filter(p => p.id !== currentUser.id));
          setAiMatches(matchResults);
        }
      } catch (err) {
        console.error('Discover page error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  const categories = [
    'All',
    'AI & Robotics',
    'Creative Coding',
    'UI/UX & Design',
    'Game Development',
    'Open Source & DevTools',
    'Audio & Music Tech',
    'Climate & Green Tech'
  ];

  const q = searchQuery.toLowerCase().trim();

  // Filter Communities
  const filteredCommunities = communities.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  // Filter Profiles
  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = !q || p.fullName.toLowerCase().includes(q) || p.headline.toLowerCase().includes(q) || p.skills.some(s => s.toLowerCase().includes(q));
    return matchesSearch;
  });

  // Filter Projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
    return matchesSearch;
  });

  // Filter Events
  const filteredEvents = events.filter(e => {
    const matchesSearch = !q || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q));
    return matchesSearch;
  });

  const handleConnect = async (p: Profile) => {
    await StorageService.addNotification({
      recipientId: p.id,
      sender: currentUser || undefined,
      type: 'invite',
      title: 'New Connection Request',
      message: `${currentUser?.fullName || 'A creator'} connected with your profile from the Discover Directory.`,
      link: '/profile'
    });
    addToast('Connection Sent!', `Connected with ${p.fullName}.`, 'success');
  };

  const handleToggleJoin = async (communityId: string) => {
    const isJoined = await StorageService.toggleJoinCommunity(communityId);
    setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, isJoined } : c));
    addToast(isJoined ? 'Joined Community!' : 'Left Community', 'Membership status updated.', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-500 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="h-4 w-4" />
          <span>Smart AI Search & Discovery Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Discover Communities, Creators & Projects
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Powered by complementary skill synergy, domain interests, and live platform activity.
        </p>
      </div>

      {/* Search Bar & Category Chips */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by skill, topic, technology, or creative domain..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
          />
        </div>

        {/* Category Horizontal Scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'communities', label: `Communities (${filteredCommunities.length})` },
            { id: 'people', label: `People & Creators (${filteredProfiles.length})` },
            { id: 'projects', label: `Projects (${filteredProjects.length})` },
            { id: 'events', label: `Events (${filteredEvents.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Top Complementary Synergy Matches Banner */}
      {aiMatches.length > 0 && activeTab === 'all' && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-cyan-950/30 border border-indigo-500/30 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Your Top AI Complementary Matches
                </h3>
                <p className="text-xs text-indigo-300">
                  Creators with complementary skills to help you build your next vision.
                </p>
              </div>
            </div>
            <Link to="/ai-assistant?tab=team" className="text-xs font-bold text-cyan-400 hover:underline">
              Launch Team Builder →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiMatches.slice(0, 2).map(({ candidate, matchScore, relevanceExplanation, suggestedRole }) => (
              <div
                key={candidate.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <img src={candidate.avatarUrl} alt={candidate.fullName} className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/30" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white">{candidate.fullName}</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                        {matchScore}% Synergy
                      </span>
                    </div>
                    <p className="text-[11px] text-cyan-300 mt-0.5 font-medium">{suggestedRole}</p>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      💡 {relevanceExplanation}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleConnect(candidate)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 cursor-pointer"
                >
                  Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid Content */}
      <div className="space-y-10">
        
        {/* Communities Section */}
        {(activeTab === 'all' || activeTab === 'communities') && filteredCommunities.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              Community Hubs ({filteredCommunities.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map(c => (
                <div
                  key={c.id}
                  className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="h-28 w-full relative">
                      <img src={c.bannerUrl} alt={c.name} className="h-full w-full object-cover" />
                      <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white">
                        {c.category}
                      </span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2.5 -mt-7 mb-2">
                        <img src={c.iconUrl} alt={c.name} className="h-10 w-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-900 shadow" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{c.name}</h4>
                          <span className="text-[10px] text-slate-400">{c.memberCount} members</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                        {c.description}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 pt-0 flex gap-2">
                    <Link
                      to={`/communities/${c.slug}`}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                      Explore Hub
                    </Link>
                    <button
                      onClick={() => handleToggleJoin(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        c.isJoined
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 border border-indigo-200 dark:border-indigo-800'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {c.isJoined ? 'Joined' : 'Join'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Creators Section */}
        {(activeTab === 'all' || activeTab === 'people') && filteredProfiles.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Users className="h-4 w-4 text-violet-400" />
              Creators & Innovators ({filteredProfiles.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map(p => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-3.5">
                      <img src={p.avatarUrl} alt={p.fullName} className="h-12 w-12 rounded-2xl object-cover ring-2 ring-indigo-500/30 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.fullName}</h4>
                          {p.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {p.role}
                        </span>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {p.headline}
                        </p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1">
                      {p.skills.slice(0, 4).map((sk, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      ⭐ {p.reputationPoints} pts
                    </span>
                    <button
                      onClick={() => handleConnect(p)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <UserPlus className="h-3 w-3" />
                      <span>Connect</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredCommunities.length === 0 && filteredProfiles.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <p className="text-base font-bold text-slate-900 dark:text-white">No items found matching "{searchQuery}"</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing filters or search for skills like "React", "Shaders", or "Figma".</p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
