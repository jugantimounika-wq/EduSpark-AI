import React, { useState } from 'react';
import { Database, CheckCircle2, RefreshCw, Key, ShieldCheck, Sparkles } from 'lucide-react';
import { isSupabaseConfigured, testSupabaseConnection } from '../../lib/supabase';
import { StorageService } from '../../lib/storage';
import { Modal } from './Modal';
import { useNotification } from '../../context/NotificationContext';

export const StatusBanner: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(() => localStorage.getItem('ccai_supabase_url') || '');
  const [keyInput, setKeyInput] = useState(() => localStorage.getItem('ccai_supabase_key') || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { addToast } = useNotification();

  const isLive = isSupabaseConfigured();

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const res = await testSupabaseConnection(urlInput, keyInput);
    setTesting(false);
    setTestResult(res);

    if (res.success) {
      localStorage.setItem('ccai_supabase_url', urlInput);
      localStorage.setItem('ccai_supabase_key', keyInput);
      addToast('Supabase Connected!', 'Backend configuration saved. Reloading storage...', 'success');
      setTimeout(() => window.location.reload(), 1200);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset all demo data back to clean seed state? This will restore original sample projects, communities, and posts.')) {
      StorageService.resetDemoData();
      addToast('Demo Data Reset', 'Initial sample data restored successfully.', 'info');
      setTimeout(() => window.location.reload(), 800);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('ccai_supabase_url');
    localStorage.removeItem('ccai_supabase_key');
    setUrlInput('');
    setKeyInput('');
    setTestResult(null);
    addToast('Switched to Demo Mode', 'Using local persistence with realistic sample data.', 'info');
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <>
      {/* Clickable Pill in Header */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border cursor-pointer hover:scale-105"
        style={{
          backgroundColor: isLive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
          borderColor: isLive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)',
          color: isLive ? '#10b981' : '#818cf8'
        }}
        title="Click to view database connection status"
      >
        <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${isLive ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
        <span>{isLive ? 'Supabase Connected' : 'Demo Mode (Local Sync)'}</span>
      </button>

      {/* Modal Dialog */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Platform Data & Supabase Status"
        subtitle="Manage cloud database connection, offline sample data, and schema synchronization."
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Status Box */}
          <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            isLive 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
          }`}>
            <Database className="h-5 w-5 shrink-0 mt-0.5 text-indigo-400" />
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                {isLive ? 'Live PostgreSQL Database Active' : 'Autonomous Demo Mode Active'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {isLive 
                  ? 'Application is persisting data directly to your live Supabase database with Row-Level Security enabled.'
                  : 'Operating in full-featured offline demo mode with realistic sample creators, communities, hackathons, and AI synthesis. All changes persist automatically to localStorage.'}
              </p>
            </div>
          </div>

          {/* Config Form */}
          <form onSubmit={handleTestAndSave} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                testResult.success 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
              }`}>
                {testResult.success ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Key className="h-4 w-4 shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={testing || !urlInput || !keyInput}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {testing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  Test & Connect Supabase
                </button>
                {isLive && (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Disconnect
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleResetData}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                title="Restore fresh sample communities and projects"
              >
                <RefreshCw className="h-3 w-3" />
                Reset Demo Data
              </button>
            </div>
          </form>

          {/* Quick info footer */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-indigo-400" />
              SQL Schema file ready at <code className="text-indigo-400">supabase/schema.sql</code>
            </span>
            <span>RLS Protected</span>
          </div>
        </div>
      </Modal>
    </>
  );
};
