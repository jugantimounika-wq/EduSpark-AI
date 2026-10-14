import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, FolderKanban, Users, Cpu, ArrowRight } from 'lucide-react';
import { IdeaGeneratorModal } from '../components/ai/IdeaGeneratorModal';
import { ProjectPlanModal } from '../components/ai/ProjectPlanModal';
import { TeamMatchModal } from '../components/ai/TeamMatchModal';

export const AIAssistantPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'idea';
  const [activeTab, setActiveTab] = useState<'idea' | 'plan' | 'team' | 'consultant'>(initialTab);

  const tabs = [
    { id: 'idea', label: 'AI Idea Generator', icon: Sparkles, desc: 'Synthesize novel project concepts with difficulty tiers and skills' },
    { id: 'plan', label: 'AI Project Planner', icon: FolderKanban, desc: 'Convert concepts into phased roadmaps and populated Kanban boards' },
    { id: 'team', label: 'AI Team Builder', icon: Users, desc: 'Calculate complementary skill synergies and find co-founders' }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Studio Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-cyan-300 text-xs font-bold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Intelligent Co-Creation Suite</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          AI Innovation Studio
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Accelerate your creative ambitions. Generate battle-tested project ideas, synthesize phased milestones, and discover complementary teammates with mathematical synergy.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tabs.map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-indigo-900/40 border-indigo-500/60 shadow-lg ring-1 ring-indigo-500/40'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-indigo-950/60 hover:border-indigo-400/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {tab.label}
                </span>
                <div className={`p-2 rounded-xl ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <TabIcon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {tab.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-indigo-950/60 shadow-xl">
        {activeTab === 'idea' && <IdeaGeneratorModal />}
        {activeTab === 'plan' && <ProjectPlanModal />}
        {activeTab === 'team' && <TeamMatchModal />}
      </div>

    </div>
  );
};
