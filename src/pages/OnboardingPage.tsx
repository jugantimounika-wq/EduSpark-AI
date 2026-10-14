import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, Award, Zap, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const OnboardingPage: React.FC = () => {
  const { currentUser, completeOnboarding } = useAuth();
  const { addToast, triggerCelebration } = useNotification();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Generative AI', 'Creative Coding']);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'TypeScript', 'TailwindCSS']);
  const [headline, setHeadline] = useState(currentUser?.headline || 'CS Student & AI builder exploring autonomous agents');
  const [goal, setGoal] = useState('Build an AI-powered creative app and join a hackathon squad');

  const interestsList = [
    'Generative AI',
    'Creative Coding & Shaders',
    'UI/UX Design Systems',
    'Indie Game Development',
    'Robotics & Autonomous Agents',
    'Spatial Audio & Music Tech',
    'Climate & Green Tech',
    'Open Source DevTools'
  ];

  const skillsList = [
    'React', 'TypeScript', 'Python', 'FastAPI', 'Figma', 'Three.js', 
    'PyTorch', 'Rust', 'Docker', 'TailwindCSS', 'WebGL', 'WebSockets'
  ];

  const toggleInterest = (item: string) => {
    setSelectedInterests(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleSkill = (item: string) => {
    setSelectedSkills(prev => 
      prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]
    );
  };

  const handleFinish = async () => {
    await completeOnboarding(selectedInterests, selectedSkills, [goal], headline);
    triggerCelebration();
    addToast('Profile Setup Complete!', '+50 Reputation Points awarded for onboarding!', 'success');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Progress header */}
        <div className="space-y-2 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">
            Creator Onboarding • Step {step} of 3
          </span>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-1.5 w-16 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Creative Interests */}
        {step === 1 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-xl space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                What creative domains excite you?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Our AI matching algorithm will tailor community hubs and project ideas around these topics.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {interestsList.map(item => {
                const active = selectedInterests.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleInterest(item)}
                    className={`p-3 rounded-2xl text-xs font-bold text-left border transition-all cursor-pointer flex items-center justify-between ${
                      active
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                    }`}
                  >
                    <span>{item}</span>
                    {active && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={selectedInterests.length === 0}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-xl space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                What are your core tools & skills?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Used by the AI Team Builder to calculate complementary squad synergies.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {skillsList.map(skill => {
                const active = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all cursor-pointer ${
                      active
                        ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-sm font-black'
                        : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-cyan-400'
                    }`}
                  >
                    {active ? '✓ ' : '+ '} {skill}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={selectedSkills.length === 0}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Ambitions & Headline */}
        {step === 3 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-xl space-y-5 animate-in fade-in">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                What is your creative ambition?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tell collaborators what you're working toward.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Creator Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. AI engineer exploring multi-modal generative video"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Top Goal for Next Month
                </label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Win Global AI Hackathon or ship my first open source tool"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Launch Creator Dashboard</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
