import React, { useState } from 'react';
import { Plus, CheckCircle2, Clock, Eye, AlertCircle } from 'lucide-react';
import { Task, TaskStatus, Profile } from '../../types/database';
import { TaskCard } from './TaskCard';
import { AddTaskModal } from './AddTaskModal';
import { StorageService } from '../../lib/storage';
import { useNotification } from '../../context/NotificationContext';

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  availableMembers: Profile[];
  onTasksUpdated: () => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  tasks,
  availableMembers,
  onTasksUpdated
}) => {
  const { addToast, triggerCelebration } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState<TaskStatus>('todo');

  const columns: { id: TaskStatus; title: string; icon: any; color: string }[] = [
    { id: 'todo', title: 'To Do', icon: AlertCircle, color: 'text-slate-400' },
    { id: 'in_progress', title: 'In Progress', icon: Clock, color: 'text-indigo-400' },
    { id: 'review', title: 'Under Review', icon: Eye, color: 'text-amber-400' },
    { id: 'done', title: 'Completed', icon: CheckCircle2, color: 'text-emerald-400' }
  ];

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await StorageService.updateTaskStatus(taskId, newStatus);
    if (newStatus === 'done') {
      triggerCelebration();
      addToast('Task Finished!', 'Awesome progress on your sprint!', 'success');
    }
    onTasksUpdated();
  };

  const handleDelete = async (taskId: string) => {
    await StorageService.deleteTask(taskId);
    addToast('Task Deleted', 'Removed from task board.', 'info');
    onTasksUpdated();
  };

  const openAddModal = (status: TaskStatus) => {
    setTargetColumn(status);
    setModalOpen(true);
  };

  // Calculate sprint completion %
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress Bar & Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-indigo-950/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-1/2 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700 dark:text-slate-300">Sprint Delivery Velocity</span>
            <span className="text-indigo-500 font-extrabold">{percentage}% Completed ({completed}/{total})</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <button
          onClick={() => openAddModal('todo')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer transition-all self-end sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* 4 Column Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);
          const ColIcon = col.icon;
          return (
            <div
              key={col.id}
              className="flex flex-col rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200/80 dark:border-indigo-950/40 p-3 min-h-[420px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <ColIcon className={`h-4 w-4 ${col.color}`} />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {col.title}
                  </h4>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => openAddModal(col.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title={`Add task to ${col.title}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Task Cards Column Body */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="h-28 flex flex-col items-center justify-center text-center p-3 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl">
                    <p className="text-[11px] text-slate-400">No tasks in {col.title}</p>
                    <button
                      onClick={() => openAddModal(col.id)}
                      className="text-[10px] text-indigo-400 hover:underline mt-1 cursor-pointer"
                    >
                      + Add task
                    </button>
                  </div>
                ) : (
                  colTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <AddTaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        projectId={projectId}
        initialStatus={targetColumn}
        availableMembers={availableMembers}
        onTaskCreated={onTasksUpdated}
      />
    </div>
  );
};
