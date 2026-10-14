import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, Calendar, MessageSquare, Award, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { NotificationType } from '../types/database';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = notifications.filter(n => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'invite': return <Sparkles className="h-4 w-4 text-cyan-400" />;
      case 'event_reminder': return <Calendar className="h-4 w-4 text-amber-400" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-indigo-400" />;
      case 'badge': return <Award className="h-4 w-4 text-violet-400" />;
      case 'moderation': return <ShieldAlert className="h-4 w-4 text-rose-400" />;
      default: return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
            <Bell className="h-4 w-4" />
            Activity Center
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Notifications {unreadCount > 0 && `(${unreadCount} Unread)`}
          </h1>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <CheckCheck className="h-4 w-4 text-indigo-500" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Type filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'all', label: 'All Alerts' },
          { id: 'invite', label: 'Invitations' },
          { id: 'event_reminder', label: 'Event Reminders' },
          { id: 'comment', label: 'Comments' },
          { id: 'badge', label: 'Badges' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              filterType === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            No notifications in this category.
          </div>
        ) : (
          filtered.map(n => (
            <div
              key={n.id}
              onClick={() => {
                markAsRead(n.id);
                if (n.link) navigate(n.link);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !n.isRead
                  ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{n.title}</span>
                    {!n.isRead && (
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                    )}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {n.message}
                </p>
                {n.link && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-500 dark:text-cyan-400 pt-1">
                    <span>Go to item</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
