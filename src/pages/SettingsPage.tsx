import React, { useState } from 'react';
import { Settings, Moon, Sun, Database, Bell, Shield, RefreshCw, Key, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { isSupabaseConfigured, testSupabaseConnection } from '../lib/supabase';
import { StorageService } from '../lib/storage';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useNotification();

  const isLive = isSupabaseConfigured();
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('ccai_supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('ccai_supabase_key') || '');
  const [testingDb, setTestingDb] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Preference toggles
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [teamInvites, setTeamInvites] = useState(true);

  const handleTestAndSaveDb = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingDb(true);
    setTestResult(null);

    const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setTestingDb(false);
    setTestResult(res);

    if (res.success) {
      localStorage.setItem('ccai_supabase_url', supabaseUrl);
      localStorage.setItem('ccai_supabase_key', supabaseKey);
      addToast('Supabase Saved!', 'Connected to live database. Reloading...', 'success');
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo state back to clean sample projects, communities, and tasks?')) {
      StorageService.resetDemoData();
      addToast('Data Restored', 'Clean seed data reloaded.', 'info');
      setTimeout(() => window.location.reload(), 800);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
          <Settings className="h-4 w-4" />
          System Preferences
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          Settings & Configuration
        </h1>
      </div>

      <div className="space-y-6">
        
        {/* 1. Appearance / Theme */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-500" />
            Theme & Appearance
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Interface Color Scheme
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toggle between sleek indigo dark mode and clean daylight theme.
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-2 cursor-pointer transition-colors"
            >
              {theme === 'dark' ? <Moon className="h-4 w-4 text-cyan-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
              <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          </div>
        </div>

        {/* 2. Notifications & AI Preferences */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="h-4 w-4 text-indigo-500" />
            Communication & AI Intelligence
          </h3>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">AI Synergy Recommendations</p>
                <p className="text-[11px] text-slate-500">Receive proactive community and teammate match insights.</p>
              </div>
              <input
                type="checkbox"
                checked={aiSuggestions}
                onChange={(e) => setAiSuggestions(e.target.checked)}
                className="h-4 w-4 accent-indigo-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer">
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">Squad & Team Invitations</p>
                <p className="text-[11px] text-slate-500">Allow other creators to invite you to collaborative project workspaces.</p>
              </div>
              <input
                type="checkbox"
                checked={teamInvites}
                onChange={(e) => setTeamInvites(e.target.checked)}
                className="h-4 w-4 accent-indigo-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* 3. Supabase Cloud Connection & Persistence */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="h-4 w-4 text-cyan-400" />
              Supabase PostgreSQL Connection
            </h3>
            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
              isLive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
            }`}>
              {isLive ? 'Supabase Connected' : 'Local Storage Sync (Demo Mode)'}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            By default, Creative Community Club AI persists data to local browser storage so you can experiment freely without credentials. To connect a live Supabase database with PostgreSQL and Row-Level Security, enter your project credentials below.
          </p>

          <form onSubmit={handleTestAndSaveDb} className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Supabase Anon Public API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Key className="h-4 w-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={testingDb || !supabaseUrl || !supabaseKey}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer disabled:opacity-50"
              >
                {testingDb ? 'Validating Connection...' : 'Connect Supabase'}
              </button>

              <button
                type="button"
                onClick={handleResetData}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Sample Data</span>
              </button>
            </div>
          </form>
        </div>

      </div>

    </div>
  );
};
