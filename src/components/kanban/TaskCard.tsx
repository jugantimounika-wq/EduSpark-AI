import React from 'react';
import { Calendar, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types/database';

interface TaskCardProps {
  task: Task;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusChange, onDelete }) => {
  const priorityColors: Record<TaskPriority, string> = {
    low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    medium: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    high: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    urgent: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800'
  };

  const statusOrder: TaskStatus[] = ['todo', 'in_progress', 'review', 'done'];
  const currentIndex = statusOrder.indexOf(task.status);

  const movePrev = () => {
    if (currentIndex > 0) {
      onStatusChange(task.id, statusOrder[currentIndex - 1]);
    }
  };

  const moveNext = () => {
    if (currentIndex < statusOrder.length - 1) {
      onStatusChange(task.id, statusOrder[currentIndex + 1]);
    }
  };

  return (
    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-indigo-950/70 shadow-sm hover:shadow-md transition-all space-y-2.5 group">
      {/* Priority and delete */}
      <div className="flex items-center justify-between">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <button
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity cursor-pointer rounded"
          title="Delete task"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {/* Title & Description */}
      <div>
        <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
          {task.title}
        </h5>
        {task.description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Assignee & Stage navigation */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
        {/* Assignee / Due Date */}
        <div className="flex items-center gap-1.5 text-slate-400">
          {task.assignee ? (
            <img
              src={task.assignee.avatarUrl}
              alt={task.assignee.fullName}
              className="h-4 w-4 rounded-full object-cover"
              title={`Assigned to ${task.assignee.fullName}`}
            />
          ) : (
            <span className="text-[10px]">Unassigned</span>
          )}
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[10px]">
              <Calendar className="h-2.5 w-2.5" />
              {task.dueDate.slice(5)}
            </span>
          )}
        </div>

        {/* Next / Prev Move Buttons */}
        <div className="flex items-center gap-1">
          {currentIndex > 0 && (
            <button
              onClick={movePrev}
              className="p-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-400 hover:bg-slate-200 transition-colors"
              title="Move backward"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
          )}
          {currentIndex < statusOrder.length - 1 && (
            <button
              onClick={moveNext}
              className="p-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-500 hover:text-white hover:bg-indigo-600 transition-colors"
              title="Move forward"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
