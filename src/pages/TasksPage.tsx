import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Plus, Search, Filter, Calendar,
  CheckCircle2, Clock, AlertCircle,
  MoreVertical, Trash2, Edit, LayoutGrid, List,
  ChevronLeft, ChevronRight, Activity, Eye,
  ArrowUpDown, Ban, MessageSquare, X
} from 'lucide-react';
import { cn, formatDate, getStatusColor } from '../lib/utils';
import { TaskStatus, UserRole, Task } from '../types';
import toast from 'react-hot-toast';

const TaskCard = ({ task, projects, users, columns, handleStatusChange, deleteTask }: {
  task: Task,
  projects: any[],
  users: any[],
  columns: any[],
  handleStatusChange: (id: string, status: TaskStatus) => void,
  deleteTask: (id: string) => void,
  key?: any
}) => (
  <div className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
    <div className="mb-3 flex items-start justify-between">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          {projects.find(p => p.id === task.projectId)?.name}
        </span>
        <h4 className="mt-1 font-semibold text-slate-900 dark:text-white line-clamp-1">{task.title}</h4>
      </div>
      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-rose-600 hover:text-rose-700"
          onClick={() => {
            if (confirm('Delete task?')) {
              deleteTask(task.id);
              toast.success('Task deleted');
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>

    <p className="mb-4 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
      {task.description}
    </p>

    <div className="mt-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 dark:text-slate-400">
          <Calendar className="h-3 w-3" />
          {formatDate(task.deadline)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">
            {users.find(u => u.id === task.assignedDeveloperId)?.name.split(' ')[0]}
          </span>
          <div className="h-6 w-6 rounded-full bg-slate-100 text-[10px] font-bold flex items-center justify-center text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {users.find(u => u.id === task.assignedDeveloperId)?.name.charAt(0)}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold">
          <span className="text-slate-400 uppercase tracking-tighter">Progress</span>
          <span className="text-slate-900 dark:text-white">{task.progressPercentage}%</span>
        </div>
        <div className="relative h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{ width: `${task.progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-1 pt-1">
        {columns.filter(c => c.id !== task.status).slice(0, 3).map(c => (
          <button
            key={c.id}
            onClick={() => handleStatusChange(task.id, c.id as TaskStatus)}
            className="rounded-md bg-slate-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-indigo-900/20 transition-colors"
          >
            {c.title}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export const TasksPage = () => {
  const { tasks, projects, currentUser, users, addTask, updateTask, deleteTask } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const filteredTasks = useMemo(() => {
    return tasks.filter(t =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTasks.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTasks, currentPage]);

  const columns = [
    { id: TaskStatus.PENDING, title: 'Pending', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: TaskStatus.IN_PROGRESS, title: 'In-Progress', icon: Activity, color: 'text-amber-600', bgColor: 'bg-amber-50' },
    { id: TaskStatus.REVIEW, title: 'Review', icon: MessageSquare, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { id: TaskStatus.CANCELLED, title: 'Cancelled', icon: Ban, color: 'text-rose-600', bgColor: 'bg-rose-50' },
    { id: TaskStatus.COMPLETED, title: 'Completed', icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { id: TaskStatus.POSTPONED, title: 'Postponed', icon: AlertCircle, color: 'text-slate-600', bgColor: 'bg-slate-50' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask(formData);
    setIsModalOpen(false);
    toast.success('Task created successfully');
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Task Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Organize, track, and optimize your team's workflow.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-3"
              onClick={() => setViewMode('table')}
            >
              <List className="mr-2 h-4 w-4" />
              Table
            </Button>
            <Button
              variant={viewMode === 'board' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 px-3"
              onClick={() => setViewMode('board')}
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Board
            </Button>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by title or description..."
            className="pl-10 h-11"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-11">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" className="h-11">
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Sort
          </Button>
        </div>
      </div>

      {viewMode === 'board' ? (
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
          {columns.map((column) => (
            <div key={column.id} className="min-w-[320px] flex-1 space-y-4">
              <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={cn("rounded-lg p-1.5", column.bgColor)}>
                    <column.icon className={cn("h-4 w-4", column.color)} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{column.title}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {filteredTasks.filter(t => t.status === column.id).length}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {filteredTasks
                  .filter(t => t.status === column.id)
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      projects={projects}
                      users={users}
                      columns={columns}
                      handleStatusChange={handleStatusChange}
                      deleteTask={deleteTask}
                    />
                  ))}
                {filteredTasks.filter(t => t.status === column.id).length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-10 dark:border-slate-800">
                    <p className="text-xs text-slate-400">No tasks in this stage</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Task Details</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Project</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Assignee</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Deadline</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Progress</th>
                  <th className="px-6 py-4 text-right font-semibold text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {paginatedTasks.map((task) => (
                  <tr key={task.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        {/* <p className="font-semibold text-slate-900 dark:text-white">{task.title}</p> */}
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{task.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {projects.find(p => p.id === task.projectId)?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-slate-100 text-[10px] font-bold flex items-center justify-center text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {users.find(u => u.id === task.assignedDeveloperId)?.name.charAt(0)}
                        </div>
                        <span className="text-xs text-slate-700 dark:text-slate-300">
                          {users.find(u => u.id === task.assignedDeveloperId)?.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(task.deadline)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[7px] font-bold uppercase tracking-wider", getStatusColor(task.status))}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-indigo-600"
                            style={{ width: `${task.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{task.progressPercentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-rose-600 hover:text-rose-700"
                          onClick={() => {
                            if (confirm('Delete task?')) {
                              deleteTask(task.id);
                              toast.success('Task deleted');
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredTasks.length)}</span> of <span className="font-bold text-slate-900 dark:text-white">{filteredTasks.length}</span> tasks
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-xs font-bold transition-colors",
                      currentPage === page
                        ? "bg-indigo-600 text-white"
                        : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Task</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X className="h-5 w-5" />
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
                placeholder="e.g., Implement OAuth Flow"
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the task requirements..."
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
