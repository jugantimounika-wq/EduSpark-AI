import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, Plus, Search, Sparkles, Filter, CheckCircle2, ArrowRight } from 'lucide-react';
import { StorageService } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Community, CommunityCategory } from '../types/database';
import { Modal } from '../components/common/Modal';

export const CommunitiesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToast, triggerCelebration } = useNotification();
  const [searchParams] = useSearchParams();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [createModalOpen, setCreateModalOpen] = useState(searchParams.get('action') === 'create');

  // Form states for Create Community
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CommunityCategory>('AI & Robotics');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [rulesInput, setRulesInput] = useState('Be respectful and collaborative\nShare code and repro steps\nConstructive feedback only');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      const data = await StorageService.getCommunities();
      setCommunities(data);
    };
    fetchCommunities();
  }, []);

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

  const filtered = communities.filter(c => {
    const matchesCat = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesQuery = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleToggleJoin = async (id: string) => {
    const isJoined = await StorageService.toggleJoinCommunity(id);
    setCommunities(prev => prev.map(c => c.id === id ? { ...c, isJoined } : c));
    if (isJoined) {
      triggerCelebration();
      addToast('Welcome to the Community!', 'Joined successfully. Check out the latest posts.', 'success');
    } else {
      addToast('Left Community', 'You have left this community.', 'info');
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const rules = rulesInput.split('\n').map(r => r.trim()).filter(Boolean);

      const created = await StorageService.createCommunity({
        name,
        slug,
        tagline,
        description,
        category,
        bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        iconUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=200&q=80',
        createdBy: currentUser?.id || 'usr-1',
        creatorName: currentUser?.fullName || 'Community Builder',
        isFeatured: false,
        rules: rules.length > 0 ? rules : ['Be collaborative and respectful'],
        tags: tags.length > 0 ? tags : ['Innovation', 'Community']
      });

      setCommunities([created, ...communities]);
      setCreateModalOpen(false);
      triggerCelebration();
      addToast('Community Hub Created!', `Welcome to "${created.name}".`, 'success');

      // Reset form
      setName('');
      setTagline('');
      setDescription('');
      setTagsInput('');
    } catch (err: any) {
      addToast('Error creating community', err?.message || 'Failed to save', 'error');
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
            <Users className="h-4 w-4" />
            Curated Guilds & Labs
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Community Hubs
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Join domain-specific clubs, discuss breakthroughs, find mentors, and collaborate on cutting-edge projects.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create Community</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search communities by title, keyword, or technology..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs shadow-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => (
          <div
            key={c.id}
            className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              {/* Banner */}
              <div className="h-32 w-full relative overflow-hidden">
                <img src={c.bannerUrl} alt={c.name} className="h-full w-full object-cover" />
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
                  {c.category}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-center gap-3 -mt-9 mb-3">
                  <img src={c.iconUrl} alt={c.name} className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white dark:ring-slate-900 shadow-md" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {c.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {c.memberCount} members
                    </span>
                  </div>
                </div>

                <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium mb-1">
                  {c.tagline}
                </p>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                  {c.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {c.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-5 pt-0 flex gap-2">
              <Link
                to={`/communities/${c.slug}`}
                className="flex-1 py-2 rounded-xl text-xs font-bold text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Enter Hub
              </Link>
              <button
                onClick={() => handleToggleJoin(c.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  c.isJoined
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                }`}
              >
                {c.isJoined ? 'Joined' : 'Join'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <p className="text-base font-bold text-slate-900 dark:text-white">No communities match your criteria.</p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white cursor-pointer"
          >
            Create the First Hub
          </button>
        </div>
      )}

      {/* Create Community Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Community Hub"
        subtitle="Found a new creative guild for students and builders with shared ambitions."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCommunity} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Community Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. XR & Spatial Computing Collective"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CommunityCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              >
                {categories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                One-Sentence Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Exploring VisionOS, WebXR, and spatial human-computer interaction."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Description & Mission
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics will your guild discuss? What kinds of projects will you build together?"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="WebXR, Unity, VisionOS, SpatialUX"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Community Ground Rules (One per line)
            </label>
            <textarea
              rows={2}
              value={rulesInput}
              onChange={(e) => setRulesInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Hub'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
