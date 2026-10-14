import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../types/database';
import { StorageService } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SEED_PROFILES } from '../data/seedData';

interface AuthContextType {
  currentUser: Profile | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  signup: (fullName: string, email: string, pass: string, role: Profile['role']) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchUser: (profileId: string) => Promise<void>;
  updateUserProfile: (data: Partial<Profile>) => Promise<Profile | null>;
  completeOnboarding: (interests: string[], skills: string[], goals: string[], headline: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial user
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUserId = localStorage.getItem('ccai_current_user_id');
        const profiles = await StorageService.getProfiles();
        
        if (savedUserId) {
          const matched = profiles.find(p => p.id === savedUserId);
          if (matched) {
            setCurrentUser(matched);
            setIsLoading(false);
            return;
          }
        }
        
        // Default to Alex Chen (SEED_PROFILES[0])
        const defaultUser = profiles[0] || SEED_PROFILES[0];
        setCurrentUser(defaultUser);
        localStorage.setItem('ccai_current_user_id', defaultUser.id);
      } catch (err) {
        console.error('Failed initializing auth user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, _pass: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const profiles = await StorageService.getProfiles();
      const user = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('ccai_current_user_id', user.id);
        setIsLoading(false);
        return { success: true };
      }
      // If email doesn't exist, log in as first demo user or notify
      const fallback = profiles[0] || SEED_PROFILES[0];
      setCurrentUser(fallback);
      localStorage.setItem('ccai_current_user_id', fallback.id);
      setIsLoading(false);
      return { success: true, message: 'Logged in using demo profile.' };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, message: e.message || 'Login error' };
    }
  };

  const signup = async (fullName: string, email: string, _pass: string, role: Profile['role']): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    try {
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_');
      const newProfile: Profile = {
        id: `usr-${Date.now()}`,
        fullName,
        username,
        email,
        avatarUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${username}`,
        bio: `New ${role} at Creative Community Club AI ready to collaborate!`,
        role,
        headline: `${role.charAt(0).toUpperCase() + role.slice(1)} & Creative Innovator`,
        location: 'Remote',
        skills: ['Creative Collaboration'],
        interests: ['AI & Innovation', 'Community'],
        goals: ['Collaborate on impactful projects'],
        reputationPoints: 50,
        isVerified: false,
        createdAt: new Date().toISOString()
      };

      const created = await StorageService.updateProfile(newProfile);
      setCurrentUser(created);
      localStorage.setItem('ccai_current_user_id', created.id);
      setIsLoading(false);
      return { success: true };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, message: e.message || 'Signup failed' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ccai_current_user_id');
  };

  const switchUser = async (profileId: string) => {
    setIsLoading(true);
    const profiles = await StorageService.getProfiles();
    const target = profiles.find(p => p.id === profileId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('ccai_current_user_id', target.id);
    }
    setIsLoading(false);
  };

  const updateUserProfile = async (data: Partial<Profile>): Promise<Profile | null> => {
    if (!currentUser) return null;
    const updated = await StorageService.updateProfile({ ...data, id: currentUser.id });
    setCurrentUser(updated);
    return updated;
  };

  const completeOnboarding = async (interests: string[], skills: string[], goals: string[], headline: string) => {
    if (!currentUser) return;
    const updated = await StorageService.updateProfile({
      id: currentUser.id,
      interests,
      skills,
      goals,
      headline: headline || currentUser.headline,
      reputationPoints: currentUser.reputationPoints + 50 // Onboarding bonus
    });
    setCurrentUser(updated);
    localStorage.setItem(`ccai_onboarded_${currentUser.id}`, 'true');
  };

  const isOnboarded = currentUser ? Boolean(
    currentUser.skills.length > 0 && 
    currentUser.interests.length > 0 &&
    localStorage.getItem(`ccai_onboarded_${currentUser.id}`) === 'true'
  ) : false;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isOnboarded,
        isLoading,
        login,
        signup,
        logout,
        switchUser,
        updateUserProfile,
        completeOnboarding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
