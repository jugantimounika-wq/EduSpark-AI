import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FolderKanban, 
  ArrowLeft, 
  ExternalLink, 
  Users, 
  CheckCircle2, 
  Calendar, 
  Sparkles, 
  Send, 
  Plus, 
  Layers, 
  Zap,
  Check,
  Award
} from 'lucide-react';
import { GithubIcon } from '../components/common/SocialIcons';
import { StorageService } from '../lib/storage';
import { AIService } from '../lib/aiService';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Project, Task, Profile, ProjectMilestone, AITeamMatchResult } from '../types/database';
import { KanbanBoard } from '../components/kanban/KanbanBoard';

export const ProjectWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const { addToast, triggerCelebration } = useNotification();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [activeTab, setActiveTab] = useState<'kanban' | 'milestones' | 'team' | 'ai_copilot'>('kanban');
  const [loading, setLoading] = useState(true);

  // AI Copilot Chat state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ sender: 'user' | 'ai'; text: string; actionSuggestion?: string }[]>([
    {
      sender: 'ai',
      text: 'Hello team! I am your Project AI Copilot. Ask me to draft user stories, suggest complementary skills, or create sprint milestones!'
    }
  ]);

  // Team Synergy matches inside workspace
  const [teamMatches, setTeamMatches] = useState<AITeamMatchResult[]>([]);
  const [invitedMap, setInvitedMap] = useState<Record<string, boolean>>({});

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    const p = await StorageService.getProjectById(id);
    if (!p) {
      setLoading(false);
      return;
    }
    setProject(p);

    const [tList, profs] = await Promise.all([
      StorageService.getTasks(p.id),
      StorageService.getProfiles()
    ]);
    setTasks(tList);
    setAllProfiles(profs);

    // Compute synergy recommendations for missing skills
    const candidates = profs.filter(prof => !p.members.some(m => m.id === prof.id));
    const matches = await AIService.matchTeamCandidates({
      projectId: p.id,
      requiredSkills: p.requiredSkills,
      preferredInterests: p.tags,
      teamSizeGoal: 4
    }, candidates);
    setTeamMatches(matches);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Loading project workspace...</div>;
  }

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workspace Not Found</h2>
        <Link to="/projects" className="text-indigo-500 font-semibold text-xs hover:underline">
          ← Back to projects
        </Link>
      </div>
    );
  }

  const handleToggleMilestone = async (mId: string) => {
    const updated = project.milestones.map(m => m.id === mId ? { ...m, completed: !m.completed } : m);
    const completedCount = updated.filter(m => m.completed).length;
    const newProgress = Math.round((completedCount / updated.length) * 100);

    const updatedProj = await StorageService.createProject({
      ...project,
      milestones: updated,
      progress: newProgress
    });
    setProject({ ...project, milestones: updated, progress: newProgress });
    if (newProgress === 100) {
      triggerCelebration();
      addToast('All Milestones Completed!', 'Project is Launch Ready!', 'success');
    }
  };

  const handleInviteToTeam = async (candidate: Profile) => {
    setInvitedMap(prev => ({ ...prev, [candidate.id]: true }));
    await StorageService.addNotification({
      recipientId: candidate.id,
      sender: currentUser || undefined,
      type: 'invite',
      title: `Team Invite: ${project.title}`,
      message: `${currentUser?.fullName || 'Project lead'} invited you to join "${project.title}" as a core collaborator!`,
      link: `/projects/${project.id}`
    });
    addToast('Invite Sent', `Invited ${candidate.fullName} to the workspace.`, 'success');
  };

  const handleSendAiPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    const userText = aiPrompt.trim();
    setAiMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setAiPrompt('');
    setAiThinking(true);

    // AI synthesis
    await new Promise(r => setTimeout(r, 800));

    let aiReply = `Based on "${project.title}" and the current sprint status (${tasks.filter(t => t.status === 'done').length}/${tasks.length} tasks completed): Here is the recommended plan of action.`;
    
    if (userText.toLowerCase().includes('task') || userText.toLowerCase().includes('sprint')) {
      aiReply = `I've analyzed your backlog for ${project.title}. Recommended next tasks to add:
1. "Implement debounced WebSocket cursor broadcasts"
2. "Draft user onboarding tooltips for canvas controls"
3. "Benchmark FPS under 20 concurrent canvas nodes"`;
    } else if (userText.toLowerCase().includes('architecture') || userText.toLowerCase().includes('stack')) {
      aiReply = `Architecture recommendations for ${project.title}:
- State: Zustand or React Context with optimistic updates
- Persistence: Supabase PostgreSQL with Row-Level Security
- Real-time: Supabase Realtime channels or WebSocket relay`;
    }

    setAiMessages(prev => [...prev, {
      sender: 'ai',
      text: aiReply
    }]);
    setAiThinking(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-in fade-in duration-300">
      
      {/* Back Link */}
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-500 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Projects</span>
      </Link>

      {/* Workspace Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-500 border border-indigo-200 dark:border-indigo-800">
                {project.stage} Stage
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {project.category}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {project.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {project.tagline}
            </p>
          </div>

          {/* External links & Team Avatars */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <GithubIcon className="h-3.5 w-3.5" />
                <span>Repository</span>
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Live Demo</span>
              </a>
            )}
          </div>
        </div>

        {/* Workspace Progress & Team */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Project Squad:</span>
            <div className="flex -space-x-2">
              {project.members.map((m, i) => (
                <img
                  key={i}
                  src={m.avatarUrl}
                  alt={m.fullName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                  title={`${m.fullName} (${m.role})`}
                />
              ))}
            </div>
            <button
              onClick={() => setActiveTab('team')}
              className="text-xs text-indigo-500 font-semibold hover:underline"
            >
              + Find Teammates with AI
            </button>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 w-full sm:w-64">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              {project.progress}% Done
            </span>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="pt-2 flex items-center gap-4 overflow-x-auto border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'kanban', label: 'Kanban Sprint Board', icon: FolderKanban, count: tasks.length },
            { id: 'milestones', label: 'Milestones & Roadmap', icon: Calendar, count: project.milestones?.length || 0 },
            { id: 'team', label: 'Team & AI Matcher', icon: Users, count: project.members.length },
            { id: 'ai_copilot', label: 'AI Project Copilot', icon: Sparkles }
          ].map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <TabIcon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      {/* 1. KANBAN TASK BOARD */}
      {activeTab === 'kanban' && (
        <KanbanBoard
          projectId={project.id}
          tasks={tasks}
          availableMembers={project.members}
          onTasksUpdated={loadData}
        />
      )}

      {/* 2. MILESTONES & ROADMAP */}
      {activeTab === 'milestones' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Project Milestone Roadmap
              </h3>
              <p className="text-xs text-slate-500">
                Check off milestones as your team delivers them to automatically advance the project progress.
              </p>
            </div>
            <span className="text-xs font-extrabold text-indigo-500">
              {project.milestones.filter(m => m.completed).length} / {project.milestones.length} Completed
            </span>
          </div>

          <div className="space-y-3">
            {project.milestones.map((m, idx) => (
              <div
                key={m.id}
                onClick={() => handleToggleMilestone(m.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                  m.completed
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-indigo-500/40'
                }`}
              >
                <div className={`mt-0.5 p-1 rounded-lg border ${
                  m.completed ? 'bg-emerald-500 text-white border-emerald-500' : 'border-slate-300 dark:border-slate-600'
                }`}>
                  <Check className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-bold ${m.completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      Milestone {idx + 1}: {m.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Due {m.deadline}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TEAM & AI MATCHER */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Active Members */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Current Squad Members ({project.members.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {project.members.map(member => (
                <div key={member.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <img src={member.avatarUrl} alt={member.fullName} className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/30" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{member.fullName}</h4>
                    <span className="text-[10px] font-bold uppercase text-indigo-500">{member.role}</span>
                    <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{member.headline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommended Teammates for Missing Skills */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-cyan-950/30 border border-indigo-500/30 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  AI Complementary Candidate Matching
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Recommended Creators to Complement Your Squad
                </h3>
              </div>
              <span className="text-xs text-indigo-300">
                Skills Needed: {project.requiredSkills.join(', ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamMatches.slice(0, 4).map(({ candidate, matchScore, relevanceExplanation, suggestedRole, complementarySkills }) => {
                const isInvited = invitedMap[candidate.id];
                return (
                  <div key={candidate.id} className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-3">
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
                        <div className="mt-2 flex flex-wrap gap-1">
                          {complementarySkills.map((sk, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-300">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleInviteToTeam(candidate)}
                      disabled={isInvited}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                        isInvited
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {isInvited ? 'Invited ✓' : '+ Invite'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. AI PROJECT COPILOT CHAT */}
      {activeTab === 'ai_copilot' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-lg space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Workspace Intelligence Assistant
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              AI Project Copilot for {project.title}
            </h3>
            <p className="text-xs text-slate-500">
              Brainstorm technical architecture, decompose complex features, or synthesize sprint summaries.
            </p>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3 min-h-[280px] max-h-[400px] overflow-y-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            {aiMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-xl whitespace-pre-line leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {aiThinking && (
              <div className="flex gap-3 items-center text-xs text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                <span>Copilot is analyzing project workspace...</span>
              </div>
            )}
          </div>

          {/* Prompt Bar */}
          <form onSubmit={handleSendAiPrompt} className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Suggest 3 backend tasks for our next sprint milestone..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={aiThinking || !aiPrompt.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Ask Copilot</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
