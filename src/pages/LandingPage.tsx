import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  Users, 
  FolderKanban, 
  Calendar, 
  Award, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Compass, 
  MessageSquare,
  Play
} from 'lucide-react';
import { StorageService } from '../lib/storage';
import { Community, Project, Event } from '../types/database';
import { StatusBanner } from '../components/common/StatusBanner';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 1840,
    activeProjects: 112,
    activeCommunities: 8,
    upcomingEvents: 5
  });
  const [featuredCommunities, setFeaturedCommunities] = useState<Community[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [st, comms, projs, evts] = await Promise.all([
        StorageService.getPlatformStats(),
        StorageService.getCommunities(),
        StorageService.getProjects(),
        StorageService.getEvents()
      ]);
      setStats(st);
      setFeaturedCommunities(comms.filter(c => c.isFeatured).slice(0, 3));
      setFeaturedProjects(projs.slice(0, 3));
      setUpcomingEvents(evts.slice(0, 2));
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 overflow-hidden selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-violet-600/20 to-cyan-500/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 shadow-sm mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              Creative Community Club AI • Create Together. Grow Together.
            </span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.1] mb-6">
            Your Ideas Deserve a{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 bg-clip-text text-transparent">
              Community.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10">
            An intelligent platform where students, creators, innovators, and builders discover people with complementary skills, collaborate in real-time workspaces, organize hackathons, and accelerate their projects with AI.
          </p>

          {/* Primary Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Get Started Free</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/communities')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-bold text-sm bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-indigo-900/60 shadow-md hover:border-indigo-400 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="h-4 w-4 text-indigo-400" />
              <span>Explore Communities</span>
            </button>
            <button
              onClick={() => navigate('/ai-assistant?tab=idea')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold text-sm bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-cyan-300 border border-indigo-200 dark:border-indigo-800/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Try AI Idea Generator</span>
            </button>
          </div>

          {/* Hero Visual Mockup */}
          <div className="relative mx-auto max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-indigo-900/50 group">
            <img
              src="/hero-banner.jpg"
              alt="Creative Community Club AI Platform"
              className="w-full h-[320px] sm:h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-10 text-left">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 backdrop-blur-md">
                    Live Collaboration Space
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                    Multi-Disciplinary Synergy in Action
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
                    Connecting designers, AI researchers, backend developers, and creative coders into high-performing project squads.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/showcase')}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30 transition-all flex items-center gap-2"
                >
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>View Community Showcase</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-500">{stats.totalMembers}+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Student & Creator Members</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-violet-500">{stats.activeProjects}+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Projects & Workspaces</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400">{stats.activeCommunities}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Curated Community Guilds</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">$25,000+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Hackathon Prizes & Grants</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-20 border-t border-slate-200 dark:border-indigo-950/60 bg-white/50 dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
              The Journey
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              From Spark to Shipped Product
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
              Creative Community Club AI gives you an intelligent companion at every phase of your creative journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Join or Form Hubs',
                desc: 'Discover guilds in AI Agents, Creative Coding, UI/UX, Game Dev, or create your own specialized niche club.',
                icon: Users,
                color: 'text-indigo-400'
              },
              {
                step: '02',
                title: 'Ideate & Plan with AI',
                desc: 'Generate novel blueprints tailored to your available time and convert raw concepts into phased milestones.',
                icon: Sparkles,
                color: 'text-violet-400'
              },
              {
                step: '03',
                title: 'Assemble Dream Squad',
                desc: 'Our AI Team Matcher pairs your skill gaps with creators who share your passion and complement your abilities.',
                icon: Zap,
                color: 'text-cyan-400'
              },
              {
                step: '04',
                title: 'Build, Showcase & Win',
                desc: 'Track tasks on interactive Kanban boards, compete in global hackathons, and publish your work to get discovered.',
                icon: Award,
                color: 'text-emerald-400'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black text-slate-200 dark:text-slate-800 group-hover:text-indigo-500/40 transition-colors">
                    {item.step}
                  </span>
                  <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURE HIGHLIGHTS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
              Everything Creators Need to Thrive
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
              Engineered with Discord's vibrancy, Notion's structure, and next-gen AI capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'AI Community Matching',
                desc: 'Evaluates your skills, creative interests, and active discussions to recommend communities and explain exactly why the match is valuable.',
                icon: Users,
                link: '/discover',
                gradient: 'from-indigo-500/20 to-violet-500/10'
              },
              {
                title: 'AI Team Builder',
                desc: 'Specify missing capabilities (e.g. 3D WebGL + Prompt Engineering) and get a ranked synergy list of complementary collaborators.',
                icon: Zap,
                link: '/ai-assistant?tab=team',
                gradient: 'from-cyan-500/20 to-indigo-500/10'
              },
              {
                title: 'AI Project Assistant',
                desc: 'Transforms raw ideas into structured executive blueprints, milestone checklists, and 1-click populated sprint Kanban boards.',
                icon: Sparkles,
                link: '/ai-assistant?tab=plan',
                gradient: 'from-violet-500/20 to-pink-500/10'
              },
              {
                title: 'Project Workspaces & Kanban',
                desc: 'Manage sprint velocity, assign tasks with priority tags, track progress bars, and store repository links in one central hub.',
                icon: FolderKanban,
                link: '/projects',
                gradient: 'from-emerald-500/20 to-cyan-500/10'
              },
              {
                title: 'Hackathons & Events',
                desc: 'Countdown timers to registration deadlines, 1-click digital ticket codes, attendee rosters, and prize pool breakdowns.',
                icon: Calendar,
                link: '/events',
                gradient: 'from-amber-500/20 to-rose-500/10'
              },
              {
                title: 'AI Moderation & Safe Spaces',
                desc: 'Automated safety scans for spam, phishing, and toxicity, with transparent human review to maintain a welcoming environment.',
                icon: ShieldCheck,
                link: '/admin',
                gradient: 'from-rose-500/20 to-indigo-500/10'
              }
            ].map((f, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-tr ${f.gradient} flex items-center justify-center text-indigo-400 mb-4`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {f.desc}
                  </p>
                </div>
                <Link
                  to={f.link}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  <span>Explore Feature</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED COMMUNITIES PREVIEW */}
      <section className="py-20 border-t border-slate-200 dark:border-indigo-950/60 bg-white/40 dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400">
                Active Guilds
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Featured Communities
              </h2>
            </div>
            <Link
              to="/communities"
              className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
            >
              <span>Browse All Communities</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCommunities.map(c => (
              <div
                key={c.id}
                className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="h-32 w-full relative">
                    <img src={c.bannerUrl} alt={c.name} className="h-full w-full object-cover" />
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md">
                      {c.category}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-3 -mt-9 mb-3">
                      <img src={c.iconUrl} alt={c.name} className="h-12 w-12 rounded-xl object-cover ring-2 ring-white dark:ring-slate-900 shadow-md" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {c.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {c.memberCount} members
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {c.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {c.tags.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <Link
                    to={`/communities/${c.slug}`}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-center bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-700 dark:text-slate-200 transition-colors block cursor-pointer"
                  >
                    View Community Hub
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SAMPLE TESTIMONIALS (CLEARLY LABELED SAMPLE CONTENT) */}
      <section className="py-20 border-t border-slate-200 dark:border-indigo-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Sample Creator Testimonials (Demo Simulation)
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
              Loved by Student Innovators
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "The AI Team Builder found me a Three.js shader developer within 5 minutes. We ended up winning 1st place in the Global AI Hackathon!",
                name: "Alex Chen",
                role: "CS Student & AI Developer",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
              },
              {
                quote: "Having AI break our vague product ideas into 3-phase milestone roadmaps saved us at least 3 weeks of architectural confusion.",
                name: "Sophia Zhang",
                role: "Product Design Lead",
                avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80"
              },
              {
                quote: "The combination of Discord's energy and Notion's Kanban organization makes Creative Club AI the perfect incubator for campus builders.",
                name: "Marcus Vance",
                role: "Systems Engineer",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
              }
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm flex flex-col justify-between">
                <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-indigo-500/30" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</h5>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 border border-indigo-500/30 shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Join the Network Today
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                Ready to build something extraordinary?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Connect with creators worldwide, launch AI-accelerated projects, and build lifelong friendships.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-xs bg-white text-indigo-950 hover:bg-slate-100 shadow-xl transition-all cursor-pointer"
              >
                Launch Dashboard
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer"
              >
                Sign Up Free
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
