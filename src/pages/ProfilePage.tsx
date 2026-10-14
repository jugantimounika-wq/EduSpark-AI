import React, { useState, useEffect } from 'react';
import { 
  User, 
  CheckCircle2, 
  MapPin, 
  Globe, 
  Award, 
  Edit3, 
  Sparkles, 
  FolderKanban, 
  Users, 
  ShieldCheck, 
  Flame,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { StorageService } from '../lib/storage';
import { Achievement, Project, Community } from '../types/database';
import { Modal } from '../components/common/Modal';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const { addToast, triggerCelebration } = useNotification();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userCommunities, setUserCommunities] = useState<Community[]>([]);
  const [activeTab, setActiveTab] = useState<'achievements' | 'projects' | 'communities'>('achievements');

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [headline, setHeadline] = useState(currentUser?.headline || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [skillsInput, setSkillsInput] = useState(currentUser?.skills.join(', ') || '');
  const [interestsInput, setInterestsInput] = useState(currentUser?.interests.join(', ') || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [achs, projs, comms] = await Promise.all([
        StorageService.getAchievements(),
        StorageService.getProjects(),
        StorageService.getCommunities()
      ]);
      setAchievements(achs);
      setUserProjects(projs.filter(p => p.createdBy === currentUser?.id || p.members.some(m => m.id === currentUser?.id)));
      setUserCommunities(comms.filter(c => c.isJoined));
    };
    fetchData();
  }, [currentUser]);

  if (!currentUser) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const skills = skillsInput.split(',').map(s => s.trim()).filter(Boolean);
      const interests = interestsInput.split(',').map(i => i.trim()).filter(Boolean);

      await updateUserProfile({
        fullName,
        headline,
        bio,
        location,
        skills,
        interests
      });

      setEditModalOpen(false);
      triggerCelebration();
      addToast('Profile Updated!', 'Your changes have been saved.', 'success');
    } catch (err: any) {
      addToast('Update Failed', err?.message || 'Could not save profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalPoints = achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.points, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.fullName}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl object-cover ring-4 ring-indigo-500/30 shadow-lg"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {currentUser.fullName}
                </h1>
                {currentUser.isVerified && (
                  <span title="Verified Creator" className="text-emerald-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-500 border border-indigo-200 dark:border-indigo-800">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-600 dark:text-cyan-400 font-semibold">
                {currentUser.headline}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {currentUser.location || 'Remote'}
                </span>
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="h-3.5 w-3.5" />
                  {currentUser.reputationPoints} Reputation Points
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setEditModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Bio */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          {currentUser.bio}
        </p>

        {/* Skills & Interests Tags */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Core Skills & Tools
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.skills.map((sk, idx) => (
                <span key={idx} className="px-2.5 py-1 text-xs rounded-lg font-mono bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Creative Interests & Focus Areas
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentUser.interests.map((int, idx) => (
                <span key={idx} className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  #{int}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="pt-2 flex items-center gap-4 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'achievements', label: `Achievements & Badges (${unlockedCount}/${achievements.length})`, icon: Award },
            { id: 'projects', label: `My Workspaces (${userProjects.length})`, icon: FolderKanban },
            { id: 'communities', label: `My Communities (${userCommunities.length})`, icon: Users }
          ].map(tab => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-3 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <TabIcon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. ACHIEVEMENTS & BADGES TAB */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <Award className="h-4 w-4 text-amber-500" />
                Creator Badges & Achievements
              </h3>
              <p className="text-xs text-slate-500">
                Earn reputation badges through event participation, AI plan generation, and squad collaboration.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-500">
              {totalPoints} Points Earned
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  ach.isUnlocked
                    ? 'bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-950/80 shadow-md'
                    : 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500">
                      <Award className="h-6 w-6" />
                    </div>
                    {/* Badge verified vs demo distinction */}
                    {ach.isUnlocked ? (
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        ach.isVerified
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {ach.isVerified ? '✓ Verified Badge' : '⚡ Demo Badge'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Locked</span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ach.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {ach.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                  <span className="text-indigo-500 font-mono">+{ach.points} pts</span>
                  {ach.unlockedAt && (
                    <span className="text-[10px] text-slate-400 font-normal">
                      Unlocked {new Date(ach.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. USER WORKSPACES TAB */}
      {activeTab === 'projects' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userProjects.map(p => (
            <div key={p.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-indigo-500">{p.stage}</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{p.title}</h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.tagline}</p>
              </div>
              <button
                onClick={() => window.location.href = `/projects/${p.id}`}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white shrink-0"
              >
                Open
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. USER COMMUNITIES TAB */}
      {activeTab === 'communities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userCommunities.map(c => (
            <div key={c.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={c.iconUrl} alt={c.name} className="h-10 w-10 rounded-xl object-cover ring-2 ring-indigo-500/20" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{c.name}</h4>
                  <p className="text-[10px] text-slate-400">{c.memberCount} members</p>
                </div>
              </div>
              <button
                onClick={() => window.location.href = `/communities/${c.slug}`}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shrink-0"
              >
                View
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Creator Profile"
        subtitle="Update your public skills, bio, and creative interests."
        maxWidth="md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Headline
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Building AI tools for student creators"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. San Francisco, CA or Remote"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Skills (comma separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, TypeScript, Figma, PyTorch"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Interests (comma separated)
            </label>
            <input
              type="text"
              value={interestsInput}
              onChange={(e) => setInterestsInput(e.target.value)}
              placeholder="Generative AI, Creative Coding, Hackathons"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
