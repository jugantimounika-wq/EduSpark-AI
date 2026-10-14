import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FolderKanban, Plus, Search, Sparkles, Filter, ExternalLink, ArrowRight } from 'lucide-react';
import { StorageService } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Project, ProjectStage, ProjectStatus } from '../types/database';
import { Modal } from '../components/common/Modal';

export const ProjectsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToast, triggerCelebration } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(searchParams.get('action') === 'create');

  // New Project Form
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AI & Web Applications');
  const [stage, setStage] = useState<ProjectStage>('Ideation');
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, TailwindCSS');
  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await StorageService.getProjects();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const filtered = projects.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesQuery = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesQuery;
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    setSubmitting(true);
    try {
      const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

      const created = await StorageService.createProject({
        title,
        tagline: tagline || 'Collaborative initiative in progress.',
        description: description || 'Creative tech project developed with the community.',
        category,
        status: 'active',
        stage,
        progress: 10,
        coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
        demoUrl: demoUrl.trim() || undefined,
        repoUrl: repoUrl.trim() || undefined,
        requiredSkills: skills,
        tags: [stage, category.split(' ')[0]],
        createdBy: currentUser.id,
        creator: currentUser,
        milestones: [
          { id: 'm-1', title: 'Initialize MVP Project Repository', deadline: '2026-03-25', completed: true, description: 'Base setup' },
          { id: 'm-2', title: 'Core Feature Prototype Review', deadline: '2026-04-10', completed: false, description: 'Alpha testing' }
        ],
        members: [currentUser]
      });

      // Add default task
      await StorageService.createTask({
        projectId: created.id,
        title: 'Project Kickoff & Architecture Alignment',
        description: 'Define database models and assign sprint priorities.',
        status: 'in_progress',
        priority: 'high',
        assignedTo: currentUser.id,
        assignee: currentUser,
        dueDate: '2026-03-20',
        tags: ['Setup'],
        position: 0
      });

      setProjects([created, ...projects]);
      setCreateModalOpen(false);
      triggerCelebration();
      addToast('Project Created!', `Initialized workspace for "${created.title}".`, 'success');
      navigate(`/projects/${created.id}`);
    } catch (err: any) {
      addToast('Error creating project', err?.message || 'Failed to save', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-cyan-400 flex items-center gap-1.5">
            <FolderKanban className="h-4 w-4" />
            Collaboration Workspaces
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Projects & Workspaces
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Manage sprint tasks with Kanban boards, assemble complementary teams, and convert AI ideas into live code.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/ai-assistant?tab=plan')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-300 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Plan Generator</span>
          </button>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Start Project</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title, tech stack..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {['all', 'active', 'planning', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => (
          <div
            key={p.id}
            className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              {/* Cover Image */}
              <div className="h-36 w-full relative">
                <img src={p.coverUrl} alt={p.title} className="h-full w-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
                    {p.stage}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/80 text-white backdrop-blur-md">
                    {p.progress}%
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <div>
                  <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">
                    {p.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {p.tagline}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1">
                  {p.requiredSkills.slice(0, 3).map((sk, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {sk}
                    </span>
                  ))}
                </div>

                {/* Team Avatars */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {p.members.map((m, i) => (
                      <img
                        key={i}
                        src={m.avatarUrl}
                        alt={m.fullName}
                        className="h-7 w-7 rounded-full object-cover ring-2 ring-white dark:ring-slate-900"
                        title={m.fullName}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {p.members.length} {p.members.length === 1 ? 'creator' : 'squad members'}
                  </span>
                </div>
              </div>
            </div>

            {/* Workspace Link */}
            <div className="p-5 pt-0">
              <Link
                to={`/projects/${p.id}`}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-center bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Enter Project Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Start New Project Workspace"
        subtitle="Initialize collaborative Kanban tasks, team roster, and milestones."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HoloCanvas 3D WebGL Studio"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              One-Line Summary / Elevator Pitch
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Browser-based 3D workspace powered by generative AI and WebSockets."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="AI & Web Applications">AI & Web Applications</option>
                <option value="Creative Coding & WebGL">Creative Coding & WebGL</option>
                <option value="UI/UX & Design Systems">UI/UX & Design Systems</option>
                <option value="Game Development">Game Development</option>
                <option value="Audio & Music Tech">Audio & Music Tech</option>
                <option value="Climate Tech & IoT">Climate Tech & IoT</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Current Development Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as ProjectStage)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="Ideation">Ideation</option>
                <option value="Prototype">Prototype</option>
                <option value="Alpha">Alpha</option>
                <option value="Beta">Beta</option>
                <option value="Launch Ready">Launch Ready</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Required Skills & Tech (comma separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, TypeScript, Three.js, Python"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                GitHub Repository URL
              </label>
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Live Demo / Preview URL
              </label>
              <input
                type="text"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Initialize Workspace'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
