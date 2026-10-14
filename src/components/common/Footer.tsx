import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, MessageSquare } from 'lucide-react';
import { GithubIcon, TwitterIcon } from './SocialIcons';
import { StatusBanner } from './StatusBanner';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-indigo-950/60 bg-white dark:bg-[#070b14] text-slate-600 dark:text-slate-400 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">
                Creative Club AI
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Create Together. Grow Together. An intelligent ecosystem where students, creators, and innovators build teams and launch ambitious ideas with AI.
            </p>
            <div className="pt-1">
              <StatusBanner />
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/communities" className="hover:text-indigo-500 transition-colors">
                  Community Hubs
                </Link>
              </li>
              <li>
                <Link to="/discover" className="hover:text-indigo-500 transition-colors">
                  AI Match & People Directory
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-indigo-500 transition-colors">
                  Hackathons & Demo Days
                </Link>
              </li>
              <li>
                <Link to="/showcase" className="hover:text-indigo-500 transition-colors">
                  Creative Project Showcase
                </Link>
              </li>
            </ul>
          </div>

          {/* AI Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              AI Tools & Innovation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/ai-assistant?tab=idea" className="hover:text-indigo-500 transition-colors flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3 text-indigo-400" />
                  AI Idea Generator
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant?tab=plan" className="hover:text-indigo-500 transition-colors">
                  AI Project Planner & Milestones
                </Link>
              </li>
              <li>
                <Link to="/ai-assistant?tab=team" className="hover:text-indigo-500 transition-colors">
                  AI Team Builder & Synergy Match
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-indigo-500 transition-colors">
                  AI Community Moderator
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Governance */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">
              Community & Governance
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/profile" className="hover:text-indigo-500 transition-colors">
                  Creator Badges & Achievements
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-indigo-500 transition-colors">
                  Account Preferences
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-indigo-500 transition-colors">
                  Admin Platform Dashboard
                </Link>
              </li>
              <li>
                <span className="text-slate-400 text-[11px] block pt-1">
                  Protected by PostgreSQL RLS & AI Safety Filters
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="flex items-center gap-1 text-slate-500">
            Crafted for student innovators & creators worldwide with
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline" />
            using AI & Open Source.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">
              <GithubIcon className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">
              <TwitterIcon className="h-4 w-4" />
            </a>
            <a href="https://discord.com" target="_blank" rel="noreferrer" className="hover:text-indigo-400 transition-colors">
              <MessageSquare className="h-4 w-4" />
            </a>
            <span className="text-[11px]">© 2026 Creative Community Club AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
