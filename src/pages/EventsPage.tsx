import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Plus, Search, Clock, MapPin, Users, Award, CheckCircle2, Ticket } from 'lucide-react';
import { StorageService } from '../lib/storage';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Event, EventType, LocationType } from '../types/database';
import { Modal } from '../components/common/Modal';

export const EventsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToast, triggerCelebration } = useNotification();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(searchParams.get('action') === 'create');

  // New Event Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('hackathon');
  const [locationType, setLocationType] = useState<LocationType>('virtual');
  const [locationDetails, setLocationDetails] = useState('Stage 1 Virtual Auditorium & Discord');
  const [startDate, setStartDate] = useState('2026-05-15T18:00');
  const [endDate, setEndDate] = useState('2026-05-17T20:00');
  const [deadline, setDeadline] = useState('2026-05-10T23:59');
  const [tagsInput, setTagsInput] = useState('AI, Hackathon, Innovation');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await StorageService.getEvents();
      setEvents(data);
    };
    fetchEvents();
  }, []);

  const filtered = events.filter(e => {
    const matchesType = typeFilter === 'all' || e.type === typeFilter;
    const matchesQuery = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const handleToggleRegister = async (eventId: string) => {
    const res = await StorageService.toggleRegisterEvent(eventId);
    setEvents(prev => prev.map(e => e.id === eventId ? {
      ...e,
      isRegistered: res.registered,
      attendeeCount: res.count,
      ticketCode: res.ticketCode
    } : e));

    if (res.registered) {
      triggerCelebration();
      addToast('Ticket Issued!', `You are registered! Pass #${res.ticketCode}`, 'success');
    } else {
      addToast('Registration Cancelled', 'Your ticket spot was released.', 'info');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;

    setSubmitting(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const created = await StorageService.createEvent({
        title,
        slug,
        description,
        type,
        bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        organizer: currentUser,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        registrationDeadline: new Date(deadline).toISOString(),
        locationType,
        locationDetails,
        maxAttendees: 500,
        prizes: type === 'hackathon' ? [
          { rank: 'Grand Champion', reward: '$5,000 + Cloud Grants', description: 'Best overall innovation.' }
        ] : [],
        tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean)
      });

      setEvents([created, ...events]);
      setCreateModalOpen(false);
      triggerCelebration();
      addToast('Event Created!', `Published "${created.title}".`, 'success');
      navigate(`/events/${created.slug}`);
    } catch (err: any) {
      addToast('Error creating event', err?.message || 'Failed to save', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Hackathons & Masterclasses
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Events & Hackathons
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
            Test your skills in 48-hour sprints, win innovation prizes, attend live masterclasses, and pitch to community judges.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2 cursor-pointer transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Host an Event</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hackathons, workshops, demo days..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto pb-1">
          {['all', 'hackathon', 'workshop', 'demo_day', 'meetup'].map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-amber-400'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(evt => {
          const daysLeft = Math.ceil((new Date(evt.registrationDeadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          return (
            <div
              key={evt.id}
              className="rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                {/* Banner */}
                <div className="h-40 w-full relative">
                  <img src={evt.bannerUrl} alt={evt.title} className="h-full w-full object-cover" />
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900/80 text-white backdrop-blur-md">
                      {evt.type}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/80 text-white backdrop-blur-md">
                      {evt.locationType}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  {/* Countdown Badge */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {daysLeft > 0 ? `${daysLeft} days to register` : 'Registration closed'}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {evt.attendeeCount} registered
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-indigo-400" />
                      Starts: {new Date(evt.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-cyan-400" />
                      {evt.locationDetails}
                    </p>
                  </div>

                  {/* Registered Ticket Pill */}
                  {evt.isRegistered && (
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-400 font-bold">
                      <span className="flex items-center gap-1.5">
                        <Ticket className="h-4 w-4" />
                        <span>Pass: {evt.ticketCode}</span>
                      </span>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 flex gap-2">
                <Link
                  to={`/events/${evt.slug}`}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold text-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                >
                  View Agenda & Prizes
                </Link>
                <button
                  onClick={() => handleToggleRegister(evt.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    evt.isRegistered
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  }`}
                >
                  {evt.isRegistered ? 'Cancel Ticket' : 'Register Free'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Host Event Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Host Community Event or Hackathon"
        subtitle="Organize a creative hackathon, design critique, or tech masterclass."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Generative AI Design Jam 2026"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Event Format
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="hackathon">🏆 Hackathon (Sprint Competition)</option>
                <option value="workshop">🛠️ Workshop / Masterclass</option>
                <option value="demo_day">🎤 Demo Day & Pitch Gala</option>
                <option value="meetup">☕ Community Meetup</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Location Type
              </label>
              <select
                value={locationType}
                onChange={(e) => setLocationType(e.target.value as LocationType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              >
                <option value="virtual">Virtual (Zoom / Discord)</option>
                <option value="in-person">In-Person Campus Hub</option>
                <option value="hybrid">Hybrid (Stream + Physical)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Event Description & Requirements
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is the schedule, rules, challenge prompt, and eligibility?"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                Registration Deadline
              </label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
              Venue / Stream Link Details
            </label>
            <input
              type="text"
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              placeholder="e.g. YouTube Live Stream & Discord Voice Lounge"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
