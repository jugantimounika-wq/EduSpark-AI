import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, FolderKanban, Calendar, Sparkles, X, ArrowRight } from 'lucide-react';
import { StorageService } from '../../lib/storage';
import { Community, Profile, Project, Event } from '../../types/database';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchCommandPalette: React.FC<SearchPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [comms, profs, projs, evts] = await Promise.all([
        StorageService.getCommunities(),
        StorageService.getProfiles(),
        StorageService.getProjects(),
        StorageService.getEvents()
      ]);
      setCommunities(comms);
      setProfiles(profs);
      setProjects(projs);
      setEvents(evts);
    };
    if (isOpen) {
      fetchData();
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q))
  ).slice(0, 3);

  const filteredProfiles = profiles.filter(p =>
    p.fullName.toLowerCase().includes(q) || p.headline.toLowerCase().includes(q) || p.skills.some(s => s.toLowerCase().includes(q))
  ).slice(0, 3);

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q))
  ).slice(0, 3);

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(q) || e.type.toLowerCase().includes(q) || e.tags.some(t => t.toLowerCase().includes(q))
  ).slice(0, 3);

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity" onClick={onClose} />
      <div className="flex min-h-screen items-start justify-center p-4 pt-20 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-900/60 text-left shadow-2xl transition-all w-full max-w-2xl my-8">
          {/* Search Header Input */}
          <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <Search className="h-5 w-5 text-indigo-500 mr-3 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search communities, people, projects, events, or type an AI query..."
              className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-base"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="ml-2 hidden sm:inline-block px-2 py-0.5 text-[11px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
              ESC
            </kbd>
          </div>

          {/* Results list */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
            {/* Quick AI Shortcuts */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-1.5 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-indigo-400" />
                AI Assistant Actions
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleSelect('/ai-assistant?tab=idea')}
                  className="w-full text-left p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/50 dark:border-indigo-800/40 transition-colors flex items-center justify-between group"
                >
                  <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                    💡 Generate Project Idea with AI
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => handleSelect('/ai-assistant?tab=plan')}
                  className="w-full text-left p-2.5 rounded-xl bg-violet-50/50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-900/50 border border-violet-200/50 dark:border-violet-800/40 transition-colors flex items-center justify-between group"
                >
                  <span className="text-xs font-semibold text-violet-900 dark:text-violet-200">
                    📋 Convert Idea to Full Project Plan
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 text-violet-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Communities */}
            {filteredCommunities.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-1.5 flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-cyan-400" />
                  Communities
                </p>
                <div className="space-y-1">
                  {filteredCommunities.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleSelect(`/communities/${c.slug}`)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={c.iconUrl} alt={c.name} className="h-7 w-7 rounded-lg object-cover" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                            {c.tagline}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                        {c.memberCount} members
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {filteredProjects.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-1.5 flex items-center gap-1.5">
                  <FolderKanban className="h-3 w-3 text-emerald-400" />
                  Projects & Workspaces
                </p>
                <div className="space-y-1">
                  {filteredProjects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(`/projects/${p.id}`)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                          {p.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                          {p.tagline}
                        </p>
                      </div>
                      <span className="text-[10px] text-indigo-400 font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60">
                        {p.stage} • {p.progress}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Events */}
            {filteredEvents.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-amber-400" />
                  Events & Hackathons
                </p>
                <div className="space-y-1">
                  {filteredEvents.map(e => (
                    <button
                      key={e.id}
                      onClick={() => handleSelect(`/events/${e.slug}`)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between group"
                    >
                      <div>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                          {e.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(e.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {e.locationType}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-amber-500 px-2 py-0.5 rounded-full bg-amber-500/10">
                        {e.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Creators / People */}
            {filteredProfiles.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 mb-1.5 flex items-center gap-1.5">
                  <Users className="h-3 w-3 text-violet-400" />
                  Creators & Mentors
                </p>
                <div className="space-y-1">
                  {filteredProfiles.map(prof => (
                    <button
                      key={prof.id}
                      onClick={() => handleSelect(`/discover?user=${prof.id}`)}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={prof.avatarUrl} alt={prof.fullName} className="h-7 w-7 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-400 transition-colors">
                            {prof.fullName}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm">
                            {prof.headline}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {prof.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {q && filteredCommunities.length === 0 && filteredProjects.length === 0 && filteredEvents.length === 0 && filteredProfiles.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">No results found for "{query}".</p>
                <p className="text-xs text-slate-500 mt-1">Try searching for "AI", "Figma", "Shaders", or "Hackathon".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
