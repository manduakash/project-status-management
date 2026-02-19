import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  Plus, Search, Filter, MoreVertical, Calendar,
  Flag, User as UserIcon, Trash2, Edit
} from 'lucide-react';
import { cn, formatDate, getStatusColor, getPriorityColor } from '../lib/utils';
import { UserRole, ProjectStatus, Priority } from '../types';
import toast from 'react-hot-toast';

export const ProjectsPage = () => {
  const { projects, currentUser, users, addProject, deleteProject } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    deadline: '',
    priority: Priority.MEDIUM,
    status: ProjectStatus.PLANNING,
    assignedLeadId: currentUser?.id || '',
    assignedDeveloperIds: [] as string[],
  });

  const canManage = currentUser?.role === UserRole.MANAGEMENT || currentUser?.role === UserRole.TEAM_LEAD;

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProject(formData);
    setIsModalOpen(false);
    toast.success('Project created successfully');
    setFormData({
      name: '',
      description: '',
      startDate: '',
      deadline: '',
      priority: Priority.MEDIUM,
      status: ProjectStatus.PLANNING,
      assignedLeadId: currentUser?.id || '',
      assignedDeveloperIds: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Projects</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and track your team's projects.</p>
        </div>
        {canManage && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search projects..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <div key={project.id} className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-start justify-between">
              <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", getStatusColor(project.status))}>
                {project.status}
              </span>
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {canManage && (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-600 hover:text-rose-700"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this project?')) {
                          deleteProject(project.id);
                          toast.success('Project deleted');
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">{project.name}</h3>
            <p className="mb-6 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{project.description}</p>

            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center text-slate-500 dark:text-slate-400">
                  <Calendar className="mr-1.5 h-3.5 w-3.5" />
                  {formatDate(project.deadline)}
                </div>
                <div className={cn("flex items-center font-medium", getPriorityColor(project.priority))}>
                  <Flag className="mr-1.5 h-3.5 w-3.5" />
                  {project.priority}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-600 dark:text-slate-400">Progress</span>
                  <span className="text-slate-900 dark:text-white">{project.progressPercentage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${project.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex -space-x-2 overflow-hidden">
                  {project.assignedDeveloperIds.map((devId) => {
                    const dev = users.find(u => u.id === devId);
                    return (
                      <div
                        key={devId}
                        className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold flex items-center justify-center dark:border-slate-900 dark:bg-slate-800"
                        title={dev?.name}
                      >
                        {`${dev?.name?.charAt(0)}${dev?.name?.split(' ')[1]?.charAt(1)?.toUpperCase()}`}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <UserIcon className="mr-1 h-3 w-3" />
                  Lead: {users.find(u => u.id === project.assignedLeadId)?.name.split(' ')[0]}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Project</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <Plus className="rotate-45" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Project Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  className="flex min-h-[100px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
                <Input
                  label="Deadline"
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                  >
                    {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lead</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                    value={formData.assignedLeadId}
                    onChange={(e) => setFormData({ ...formData, assignedLeadId: e.target.value })}
                  >
                    {users.filter(u => u.role !== UserRole.DEVELOPER).map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create Project</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
