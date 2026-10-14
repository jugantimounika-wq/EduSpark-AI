import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Award, 
  ArrowLeft, 
  CheckCircle2, 
  Ticket, 
  Share2,
  Sparkles
} from 'lucide-react';
import { StorageService } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Event } from '../types/database';

export const EventDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentUser } = useAuth();
  const { addToast, triggerCelebration } = useNotification();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvent = async () => {
      if (!slug) return;
      setLoading(true);
      const evt = await StorageService.getEventBySlug(slug);
      setEvent(evt || null);
      setLoading(false);
    };
    loadEvent();
  }, [slug]);

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400">Loading event details...</div>;
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Event Not Found</h2>
        <Link to="/events" className="text-indigo-500 font-semibold text-xs hover:underline">
          ← Back to events
        </Link>
      </div>
    );
  }

  const handleToggleRegister = async () => {
    const res = await StorageService.toggleRegisterEvent(event.id);
    setEvent({
      ...event,
      isRegistered: res.registered,
      attendeeCount: res.count,
      ticketCode: res.ticketCode
    });

    if (res.registered) {
      triggerCelebration();
      addToast('Ticket Issued!', `Registered for ${event.title}!`, 'success');
    } else {
      addToast('Registration Cancelled', 'Your spot has been opened.', 'info');
    }
  };

  const daysLeft = Math.ceil((new Date(event.registrationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      
      {/* Back Link */}
      <Link to="/events" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-500 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to all events</span>
      </Link>

      {/* Hero Banner Header */}
      <div className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-lg">
        <div className="h-52 sm:h-72 w-full relative">
          <img src={event.bannerUrl} alt={event.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
          <div className="absolute top-4 right-4 flex gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black backdrop-blur-md">
              {event.type}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
              {event.locationType}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 -mt-16 relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Registration Deadline: {new Date(event.registrationDeadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} ({daysLeft > 0 ? `${daysLeft} days left` : 'Closed'})
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              {event.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleToggleRegister}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                event.isRegistered
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30'
              }`}
            >
              {event.isRegistered ? 'Cancel Registration' : 'Register for Free'}
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Showcase Card if registered */}
      {event.isRegistered && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/30 border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in zoom-in-95">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Ticket className="h-8 w-8" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Official Registered Attendee
              </span>
              <h3 className="text-lg font-bold text-white">
                Ticket Pass: {event.ticketCode}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Issued to {currentUser?.fullName || 'Creator'} • Present ticket on Discord / Stage entrance.
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs">
            CONFIRMED SEAT ✓
          </span>
        </div>
      )}

      {/* Event Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Agenda & Prizes */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Prizes Breakdown */}
          {event.prizes && event.prizes.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Prizes & Innovation Grants
                </h3>
              </div>

              <div className="space-y-3">
                {event.prizes.map((pz, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{pz.rank}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{pz.description}</p>
                    </div>
                    <span className="text-sm font-extrabold text-amber-500 shrink-0 font-mono">
                      {pz.reward}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule & Logistics */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Event Details & Schedule
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">Opening Ceremony & Kickoff</span>
                <p className="font-bold text-slate-900 dark:text-white">{new Date(event.startDate).toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-slate-400 font-semibold block">Submissions & Demo Pitch Gala</span>
                <p className="font-bold text-slate-900 dark:text-white">{new Date(event.endDate).toLocaleString()}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2">
              All registered participants gain access to mentor office hours, free cloud compute credits, and private Discord collaboration channels. Teams of 1 to 5 members are welcome.
            </p>
          </div>

        </div>

        {/* Right 1 Col: Organizer & Attendees */}
        <div className="space-y-6">
          {/* Organizer Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Event Organizer
            </h4>
            <div className="flex items-center gap-3">
              <img src={event.organizer.avatarUrl} alt={event.organizer.fullName} className="h-12 w-12 rounded-2xl object-cover ring-2 ring-indigo-500/30" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{event.organizer.fullName}</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{event.organizer.headline}</p>
              </div>
            </div>
          </div>

          {/* Location & Attendance info */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Location</span>
                <span className="font-bold text-slate-900 dark:text-white">{event.locationDetails}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase">Capacity</span>
                <span className="font-bold text-slate-900 dark:text-white">{event.attendeeCount} Registered</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
