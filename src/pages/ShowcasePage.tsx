import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Plus, Heart, ExternalLink, Search } from 'lucide-react';
import { StorageService } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Project } from '../types/database';
import { Modal } from '../components/common/Modal';

export const ShowcasePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToast, triggerCelebration } = useNotification();

  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  // Submit Project Form
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AI & Creative Tech');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
  const [demoUrl, setDemoUrl] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('React, AI, OpenSource');
  const [submitting, setSubmitting] = useState(false);

  // Active comment drawer project
  const [activeProjectComments, setActiveProjectComments] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await StorageService.getProjects();
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const tagsList = ['All', 'React', 'ThreeJS', 'AI', 'IoT', 'SpatialSound', 'OpenSource', 'Design'];

  const filtered = projects.filter(p => {
    const matchesTag = selectedTag === 'All' || p.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase()) || p.requiredSkills.some(s => s.toLowerCase() === selectedTag.toLowerCase());
    const matchesQuery = !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesQuery;
  });

  const handleLike = async (projectId: string) => {
    const { liked, count } = await StorageService.toggleLikeProject(projectId);
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, userHasLiked: liked, likesCount: count } : p));
    if (liked) {
      addToast('Upvoted!', 'Gave project an endorsement.', 'success');
    }
  };

  const handleSubmitShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    setSubmitting(true);
    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const created = await StorageService.createProject({
        title,
        tagline: tagline || 'Creative showcase product.',
        description: description || 'Built by our collaborative team.',
        category,
        status: 'completed',
        stage: 'Launch Ready',
        progress: 100,
        coverUrl,
        demoUrl: demoUrl.trim() || undefined,
        repoUrl: repoUrl.trim() || undefined,
        requiredSkills: tags,
        tags: [...tags, 'Showcase'],
        createdBy: currentUser.id,
        creator: currentUser,
        milestones: [],
        members: [currentUser]
      });

      setProjects([created, ...projects]);
      setSubmitModalOpen(false);
      triggerCelebration();
      addToast('Project Published!', `"${created.title}" is now featured on Creative Showcase.`, 'success');

      // Reset
      setTitle('');
      setTagline('');
      setDescription('');
    } catch (err: any) {
      addToast('Error submitting', err?.message || 'Failed to publish', 'error');
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
            <Award className="h-4 w-4" />
            Creative Hall of Fame
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Creative Showcase
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Explore polished student projects, generative tools, indie games, and prototypes built by our community.
          </p>
        </div>

        <button
          onClick={() => setSubmitModalOpen(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Submit Your Project</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by technology, category, or creator name..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Tag pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {tagsList.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer whitespace-nowrap border ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(p => (
          <div
            key={p.id}
            className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Cover Image */}
              <div className="h-48 w-full relative overflow-hidden">
                <img
                  src={p.coverUrl}
                  alt={p.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md">
                  {p.category}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {p.title}
                  </h3>
                  <button
                    onClick={() => handleLike(p.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                      p.userHasLiked
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border-rose-300 dark:border-rose-800'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${p.userHasLiked ? 'fill-rose-500' : ''}`} />
                    <span>{p.likesCount}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {p.tagline}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {p.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* Creator Attribution */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <img src={p.creator.avatarUrl} alt={p.creator.fullName} className="h-6 w-6 rounded-full object-cover" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {p.creator.fullName}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Links Bar */}
            <div className="p-5 pt-0 flex gap-2">
              <Link
                to={`/projects/${p.id}`}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Workspace
              </Link>
              {p.demoUrl && (
                <a
                  href={p.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Demo</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Project Modal */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Submit Project to Creative Showcase"
        subtitle="Share your deployed application or creative prototype with the community."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitShowcase} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. NeuroCanvas Spatial AI Studio"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              One-Line Elevator Pitch
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Real-time collaborative whiteboard turning concept sketches into code."
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
                <option value="AI & Creative Tech">AI & Creative Tech</option>
                <option value="Creative Coding & WebGL">Creative Coding & WebGL</option>
                <option value="UI/UX & Design Systems">UI/UX & Design Systems</option>
                <option value="Indie Games">Indie Games</option>
                <option value="Music Tech & Audio">Music Tech & Audio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Cover Image URL
              </label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this project special? How does it help students or creators?"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Live App / Demo Link
              </label>
              <input
                type="text"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://myproject.demo"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Tech Stack Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="React, ThreeJS, Python, WebSockets"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish to Showcase'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
