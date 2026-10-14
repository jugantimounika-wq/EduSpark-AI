import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { announceToScreenReader } from './lib/a11y';

// Code-split pages for high performance and optimal initial page load efficiency
const LandingPage = lazy(() => import('./pages/LandingPage').then(m => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage').then(m => ({ default: m.DiscoverPage })));
const CommunitiesPage = lazy(() => import('./pages/CommunitiesPage').then(m => ({ default: m.CommunitiesPage })));
const CommunityDetailPage = lazy(() => import('./pages/CommunityDetailPage').then(m => ({ default: m.CommunityDetailPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ProjectWorkspacePage = lazy(() => import('./pages/ProjectWorkspacePage').then(m => ({ default: m.ProjectWorkspacePage })));
const EventsPage = lazy(() => import('./pages/EventsPage').then(m => ({ default: m.EventsPage })));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage').then(m => ({ default: m.EventDetailPage })));
const ShowcasePage = lazy(() => import('./pages/ShowcasePage').then(m => ({ default: m.ShowcasePage })));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage').then(m => ({ default: m.AIAssistantPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const AuthPage = lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage').then(m => ({ default: m.OnboardingPage })));

/**
 * Route change observer for screen reader accessibility
 */
function RouteChangeAnnouncer() {
  const location = useLocation();

  useEffect(() => {
    const pageName = location.pathname.replace('/', '') || 'home';
    const formattedTitle = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    announceToScreenReader(`Navigated to ${formattedTitle} page`, 'polite');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return null;
}

/**
 * Accessible Fallback Skeleton Loader
 */
function PageLoadingFallback() {
  return (
    <div
      role="status"
      aria-label="Loading page content"
      className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4"
    >
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-ping"></div>
        <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
        Loading experience...
      </p>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <RouteChangeAnnouncer />
              <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-slate-100 transition-colors duration-200">
                <Navbar />
                <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none" role="main">
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/discover" element={<DiscoverPage />} />
                      <Route path="/communities" element={<CommunitiesPage />} />
                      <Route path="/communities/:slug" element={<CommunityDetailPage />} />
                      <Route path="/projects" element={<ProjectsPage />} />
                      <Route path="/projects/:id" element={<ProjectWorkspacePage />} />
                      <Route path="/events" element={<EventsPage />} />
                      <Route path="/events/:slug" element={<EventDetailPage />} />
                      <Route path="/showcase" element={<ShowcasePage />} />
                      <Route path="/ai-assistant" element={<AIAssistantPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/admin" element={<AdminPage />} />
                      <Route path="/login" element={<AuthPage />} />
                      <Route path="/signup" element={<AuthPage />} />
                      <Route path="/onboarding" element={<OnboardingPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
