import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, Calendar, Users, CheckCircle2, Shield, ArrowRight, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { AIService } from '../../lib/aiService';
import { StorageService } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { AIProjectPlanResponse } from '../../types/database';

interface ProjectPlanModalProps {
  initialTitle?: string;
  initialDescription?: string;
}

export const ProjectPlanModal: React.FC<ProjectPlanModalProps> = ({
  initialTitle = '',
  initialDescription = ''
}) => {
  const { currentUser } = useAuth();
  const { addToast, triggerCelebration } = useNotification();
  const navigate = useNavigate();

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [deadlineWeeks, setDeadlineWeeks] = useState(4);
  const [teamSize, setTeamSize] = useState(3);

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AIProjectPlanResponse | null>(null);
  const [saving, setSaving] = useState(false);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Title Required', 'Please enter a project title or concept.', 'warning');
      return;
    }
    setLoading(true);
    setPlan(null);
    try {
      const generated = await AIService.generateProjectPlan({
        title,
        description: description || 'Creative collaborative web application with real-time sync and modern UI.',
        targetDeadlineWeeks: deadlineWeeks,
        teamSize
      });
      setPlan(generated);
      triggerCelebration();
      addToast('Project Plan Generated!', 'Review phases, adjust milestones, and launch into workspace.', 'success');
    } catch (err: any) {
      addToast('Generation failed', err?.message || 'Could not generate plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToWorkspace = async () => {
    if (!plan || !currentUser) return;
    setSaving(true);
    try {
      // Gather all milestones from all phases
      const allMilestones = plan.timelinePhases.flatMap((phase, pIdx) =>
        phase.milestones.map((m, mIdx) => ({
          id: `m-${pIdx}-${mIdx}`,
          title: m,
          deadline: new Date(Date.now() + (pIdx + 1) * 10 * 86400000).toISOString().split('T')[0],
          completed: false,
          description: `${phase.phaseName}: Milestone requirement.`
        }))
      );

      const newProj = await StorageService.createProject({
        title,
        tagline: `${deadlineWeeks}-Week Sprint: ${plan.executiveSummary.slice(0, 100)}...`,
        description: description || plan.executiveSummary,
        category: 'Web App & AI',
        status: 'active',
        stage: 'Ideation',
        progress: 10,
        coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
        requiredSkills: plan.recommendedTechStack,
        tags: [`${deadlineWeeks}Weeks`, `${teamSize}Team`, 'AIPlan'],
        createdBy: currentUser.id,
        creator: currentUser,
        aiSummary: plan.executiveSummary,
        milestones: allMilestones,
        members: [currentUser]
      });

      // Populate initial tasks from plan's suggestedTasks
      let taskPosition = 0;
      for (const phase of plan.timelinePhases) {
        for (const taskText of phase.suggestedTasks) {
          await StorageService.createTask({
            projectId: newProj.id,
            title: taskText,
            description: `Generated from ${phase.phaseName}.`,
            status: taskPosition === 0 ? 'in_progress' : 'todo',
            priority: taskPosition < 2 ? 'high' : 'medium',
            assignedTo: currentUser.id,
            assignee: currentUser,
            dueDate: new Date(Date.now() + (taskPosition + 2) * 3 * 86400000).toISOString().split('T')[0],
            tags: [phase.phaseName.split(':')[0]],
            position: taskPosition
          });
          taskPosition++;
        }
      }

      addToast('Project Plan Saved!', `Created workspace "${newProj.title}" with populated Kanban tasks.`, 'success');
      navigate(`/projects/${newProj.id}`);
    } catch (err: any) {
      addToast('Save Error', err?.message || 'Could not save project workspace', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMilestone = (phaseIndex: number, milestoneIndex: number, newText: string) => {
    if (!plan) return;
    const updatedPhases = [...plan.timelinePhases];
    updatedPhases[phaseIndex].milestones[milestoneIndex] = newText;
    setPlan({ ...plan, timelinePhases: updatedPhases });
  };

  const handleDeleteTask = (phaseIndex: number, taskIndex: number) => {
    if (!plan) return;
    const updatedPhases = [...plan.timelinePhases];
    updatedPhases[phaseIndex].suggestedTasks.splice(taskIndex, 1);
    setPlan({ ...plan, timelinePhases: updatedPhases });
  };

  const handleAddTask = (phaseIndex: number) => {
    if (!plan) return;
    const updatedPhases = [...plan.timelinePhases];
    updatedPhases[phaseIndex].suggestedTasks.push('New custom actionable task');
    setPlan({ ...plan, timelinePhases: updatedPhases });
  };

  return (
    <div className="space-y-6">
      {/* Parameter input */}
      <form onSubmit={handleGeneratePlan} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Project Title or Working Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Real-Time Spatial Audio Collaboration Workspace"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Project Concept & Key Goals
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe what this project does, who it is for, and key deliverables..."
            className="w-full px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              Target Deadline (Weeks): {deadlineWeeks} weeks
            </label>
            <input
              type="range"
              min="2"
              max="16"
              value={deadlineWeeks}
              onChange={(e) => setDeadlineWeeks(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>2w (Hackathon)</span>
              <span>4w (Sprint)</span>
              <span>8w (MVP)</span>
              <span>16w (Semester)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              Ideal Team Size: {teamSize} creators
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Solo</span>
              <span>2 Duo</span>
              <span>3 Core</span>
              <span>5-6 Squad</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Synthesizing roadmap, roles, and milestones...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Generate Comprehensive Project Plan</span>
            </>
          )}
        </button>
      </form>

      {/* Structured Output */}
      {plan && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/60 shadow-xl space-y-6 animate-in fade-in zoom-in-95">
          {/* Executive Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 mb-1 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Executive Architecture Summary
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40">
              {plan.executiveSummary}
            </p>
          </div>

          {/* Recommended Roles */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2.5 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-cyan-400" />
              Suggested Team Roles & Responsibilities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plan.suggestedRoles.map((role, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs flex flex-col justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white mb-1">{role.role}</h5>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed mb-2.5">
                      {role.primaryResponsibilities}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {role.skillsNeeded.map((sk, sIdx) => (
                      <span key={sIdx} className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-mono">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Phases & Milestones */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-violet-400" />
              Execution Roadmap & Editable Tasks
            </h4>
            <div className="space-y-4">
              {plan.timelinePhases.map((phase, pIdx) => (
                <div key={pIdx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {phase.phaseName} ({phase.durationWeeks} {phase.durationWeeks === 1 ? 'Week' : 'Weeks'})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddTask(pIdx)}
                      className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" /> Add Task
                    </button>
                  </div>

                  {/* Milestones */}
                  <div className="mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Key Deliverable Milestones (Editable)
                    </span>
                    <div className="space-y-1.5">
                      {phase.milestones.map((m, mIdx) => (
                        <div key={mIdx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <input
                            type="text"
                            value={m}
                            onChange={(e) => handleUpdateMilestone(pIdx, mIdx, e.target.value)}
                            className="w-full text-xs bg-white dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tasks list */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Actionable Checklist
                    </span>
                    <div className="space-y-1">
                      {phase.suggestedTasks.map((task, tIdx) => (
                        <div key={tIdx} className="flex items-center justify-between gap-2 p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                          <span className="text-slate-700 dark:text-slate-300 truncate">
                            • {task}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(pIdx, tIdx)}
                            className="text-slate-400 hover:text-rose-400 p-0.5 cursor-pointer"
                            title="Remove task"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Mitigation */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
            <h5 className="font-bold text-amber-500 flex items-center gap-1.5 mb-1.5">
              <Shield className="h-3.5 w-3.5" />
              Risk Mitigation & Guardrails
            </h5>
            <ul className="space-y-1 text-slate-700 dark:text-slate-300">
              {plan.riskMitigation.map((risk, idx) => (
                <li key={idx}>⚠️ {risk}</li>
              ))}
            </ul>
          </div>

          {/* Curated Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2">
              Curated Documentation & Starters
            </h4>
            <div className="flex flex-wrap gap-2">
              {plan.curatedResources.map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 text-indigo-500 hover:text-indigo-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <span>{res.title}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Plan ready to initialize as active team workspace.
            </span>
            <button
              onClick={handleSaveToWorkspace}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Configuring workspace & tasks...</span>
                </>
              ) : (
                <>
                  <span>Save Plan & Launch Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
