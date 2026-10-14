import React, { useState, useEffect } from 'react';
import { Sparkles, Users, Loader2, CheckCircle2, UserPlus, Filter, Award } from 'lucide-react';
import { AIService } from '../../lib/aiService';
import { StorageService } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { AITeamMatchResult, Profile } from '../../types/database';

export const TeamMatchModal: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToast, triggerCelebration } = useNotification();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Figma', 'React', 'Three.js']);
  const [skillInput, setSkillInput] = useState('');
  const [preferredInterests, setPreferredInterests] = useState<string[]>(['Generative AI', 'Design Systems']);
  const [interestInput, setInterestInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<AITeamMatchResult[]>([]);
  const [invitedMap, setInvitedMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProfiles = async () => {
      const all = await StorageService.getProfiles();
      // Filter out the current user so they don't match with themselves
      setProfiles(all.filter(p => p.id !== currentUser?.id));
    };
    fetchProfiles();
  }, [currentUser]);

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!selectedSkills.includes(skillInput.trim())) {
        setSelectedSkills([...selectedSkills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleAddCustomInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && interestInput.trim()) {
      e.preventDefault();
      if (!preferredInterests.includes(interestInput.trim())) {
        setPreferredInterests([...preferredInterests, interestInput.trim()]);
      }
      setInterestInput('');
    }
  };

  const handleFindMatches = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMatches([]);
    try {
      const results = await AIService.matchTeamCandidates({
        projectId: 'proj-new',
        requiredSkills: selectedSkills,
        preferredInterests,
        teamSizeGoal: 3
      }, profiles);
      setMatches(results);
      triggerCelebration();
      addToast('AI Team Synergy Matched!', `Found ${results.length} complementary creators.`, 'success');
    } catch (err: any) {
      addToast('Matching failed', err?.message || 'Could not calculate synergy', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (candidate: Profile) => {
    setInvitedMap(prev => ({ ...prev, [candidate.id]: true }));
    await StorageService.addNotification({
      recipientId: candidate.id,
      sender: currentUser || undefined,
      type: 'invite',
      title: 'Team Collaboration Invitation',
      message: `${currentUser?.fullName || 'A creator'} invited you to collaborate based on your complementary skills in ${candidate.skills.slice(0, 2).join(' & ')}.`,
      link: '/projects'
    });
    addToast('Invitation Sent!', `Invited ${candidate.fullName} to your creative team.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Search / Synergy Filter form */}
      <form onSubmit={handleFindMatches} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-indigo-400" />
            Required Skills for Your Project Squad
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {['Figma', 'Three.js', 'React', 'Python', 'Rust', 'UI/UX', 'LangChain', 'Docker'].map((sk) => {
              const active = selectedSkills.includes(sk);
              return (
                <button
                  key={sk}
                  type="button"
                  onClick={() => handleToggleSkill(sk)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  {active ? '✓ ' : '+ '} {sk}
                </button>
              );
            })}
          </div>
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleAddCustomSkill}
            placeholder="Type custom skill (e.g. WebGPU, GLSL) and press Enter..."
            className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Shared Interests or Domain Focus
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {preferredInterests.map((int, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 flex items-center gap-1.5"
              >
                <span>{int}</span>
                <button
                  type="button"
                  onClick={() => setPreferredInterests(preferredInterests.filter((_, i) => i !== idx))}
                  className="hover:text-rose-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={handleAddCustomInterest}
            placeholder="Type interest (e.g. Spatial Audio, Climate Tech) and press Enter..."
            className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing skill matrix & calculating synergy scores...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Calculate AI Team Matches</span>
            </>
          )}
        </button>
      </form>

      {/* Matched Candidates List */}
      {matches.length > 0 && (
        <div className="space-y-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-indigo-400" />
              Top Recommended Collaborators ({matches.length})
            </h4>
            <span className="text-[11px] text-indigo-400 font-medium">
              Ranked by Complementary Synergy Matrix
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {matches.map(({ candidate, matchScore, relevanceExplanation, suggestedRole, complementarySkills }) => {
              const isInvited = invitedMap[candidate.id];
              return (
                <div
                  key={candidate.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-md hover:border-indigo-500/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Left: Avatar & Bio */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={candidate.avatarUrl}
                      alt={candidate.fullName}
                      className="h-12 w-12 rounded-2xl object-cover ring-2 ring-indigo-500/30 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                          {candidate.fullName}
                        </h5>
                        {candidate.isVerified && (
                          <span className="p-0.5 rounded-full bg-emerald-500/10 text-emerald-400" title="Verified Creator">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {candidate.role}
                        </span>
                      </div>
                      
                      <p className="text-xs text-indigo-500 dark:text-indigo-400 font-semibold mt-0.5">
                        Recommended Role: {suggestedRole}
                      </p>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-lg leading-relaxed">
                        {candidate.headline}
                      </p>

                      {/* AI Explanation Pill */}
                      <div className="mt-2 text-[11px] text-cyan-600 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/40 p-2 rounded-xl flex items-start gap-2">
                        <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-400 mt-0.5" />
                        <span><strong>Why Relevant: </strong>{relevanceExplanation}</span>
                      </div>

                      {/* Complementary Skills */}
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {complementarySkills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] rounded-md font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Score Gauge & Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 shrink-0">
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/30 text-indigo-500 dark:text-indigo-300 font-black text-sm">
                        <Award className="h-3.5 w-3.5 text-indigo-400" />
                        <span>{matchScore}% Synergy</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleInvite(candidate)}
                      disabled={isInvited}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isInvited
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                      }`}
                    >
                      {isInvited ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Invite Sent</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3.5 w-3.5" />
                          <span>Invite to Team</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
