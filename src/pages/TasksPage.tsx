import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { 
  Plus, Search, Filter, Calendar, 
  CheckCircle2, Clock, AlertCircle, 
  MoreVertical, Trash2, Edit 
} from 'lucide-react';
import { cn, formatDate, getStatusColor } from '../lib/utils';
import { TaskStatus, UserRole } from '../types';
import toast from 'react-hot-toast';

export const TasksPage = () => {
  const { tasks, projects, currentUser, users, addTask, updateTask, deleteTask } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    projectId: projects[0]?.id || '',
    title: '',
    description: '',
    assignedDeveloperId: currentUser?.id || '',
    deadline: '',
    status: TaskStatus.PENDING,
    progressPercentage: 0,
  });

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { id: TaskStatus.PENDING, title: 'Pending', icon: Clock, color: 'text-blue-600' },
    { id: TaskStatus.IN_PROGRESS, title: 'In Progress', icon: Activity, color: 'text-amber-600' },
    { id: TaskStatus.COMPLETED, title: 'Completed', icon: CheckCircle2, color: 'text-emerald-600' },
    { id: TaskStatus.POSTPONED, title: 'Postponed', icon: AlertCircle, color: 'text-slate-600' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask(formData);
    setIsModalOpen(false);
    toast.success('Task created');
    setFormData({
      projectId: projects[0]?.id || '',
      title: '',
      description: '',
      assignedDeveloperId: currentUser?.id || '',
      deadline: '',
      status: TaskStatus.PENDING,
      progressPercentage: 0,
    });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
    toast.success(`Task moved to ${newStatus}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your daily tasks and track progress.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="min-w-[300px] flex-1 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <column.icon className={cn("h-4 w-4", column.color)} />
                <h3 className="font-bold text-slate-900 dark:text-white">{column.title}</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {filteredTasks.filter(t => t.status === column.id).length}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {filteredTasks
                .filter(t => t.status === column.id)
                .map((task) => (
                  <div 
                    key={task.id} 
                    className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {projects.find(p => p.id === task.projectId)?.name}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-rose-600 hover:text-rose-700"
                          onClick={() => {
                            if (confirm('Delete task?')) {
                              deleteTask(task.id);
                              toast.success('Task deleted');
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">{task.title}</h4>
                    <p className="mb-4 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{task.description}</p>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-[10px] text-slate-500 dark:text-slate-400">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formatDate(task.deadline)}
                        </div>
                        <div className="h-6 w-6 rounded-full bg-indigo-100 text-[10px] font-bold flex items-center justify-center text-indigo-600">
                          {users.find(u => u.id === task.assignedDeveloperId)?.name.charAt(0)}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-medium">
                          <span className="text-slate-500">Progress</span>
                          <span className="text-slate-900 dark:text-white">{task.progressPercentage}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={task.progressPercentage}
                          onChange={(e) => updateTask(task.id, { progressPercentage: parseInt(e.target.value) })}
                          className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-100 accent-indigo-600 dark:bg-slate-800"
                        />
                      </div>

                      <div className="flex gap-1 pt-1">
                        {columns.filter(c => c.id !== task.status).map(c => (
                          <button
                            key={c.id}
                            onClick={() => handleStatusChange(task.id, c.id as TaskStatus)}
                            className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-indigo-600 dark:hover:bg-slate-800"
                          >
                            Move to {c.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Task</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <Plus className="rotate-45" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Project</label>
                <select 
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  required
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <Input 
                label="Task Title" 
                required 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Deadline" 
                  type="date" 
                  required 
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assign To</label>
                  <select 
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                    value={formData.assignedDeveloperId}
                    onChange={(e) => setFormData({ ...formData, assignedDeveloperId: e.target.value })}
                  >
                    {users.filter(u => u.role === UserRole.DEVELOPER).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import { Activity } from 'lucide-react';
