import React from 'react';
import { useStore } from '../store/useStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, CheckCircle2, AlertCircle, Clock, 
  ArrowUpRight, ArrowDownRight, Activity, FolderKanban,
  ShieldCheck, Zap, Target, BarChart3
} from 'lucide-react';
import { cn, formatDate, getStatusColor } from '../lib/utils';
import { UserRole, ProjectStatus } from '../types';
import { Button } from '../components/ui/Button';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between">
      <div className={cn("rounded-xl p-3", color)}>
        <Icon className="h-6 w-6" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center text-xs font-medium",
          trend === 'up' ? "text-emerald-600" : "text-rose-600"
        )}>
          {trend === 'up' ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
          {trendValue}%
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
    </div>
  </div>
);

export const Dashboard = () => {
  const { currentUser, projects, tasks, users, activityLogs } = useStore();

  // Role-based filtering
  const myProjects = currentUser?.role === UserRole.DEVELOPER 
    ? projects.filter(p => p.assignedDeveloperIds.includes(currentUser.id))
    : currentUser?.role === UserRole.TEAM_LEAD
    ? projects.filter(p => p.assignedLeadId === currentUser.id)
    : projects;

  const myTasks = tasks.filter(t => 
    currentUser?.role === UserRole.DEVELOPER ? t.assignedDeveloperId === currentUser.id : true
  );

  // Stats calculation
  const activeProjects = myProjects.filter(p => p.status === ProjectStatus.ACTIVE).length;
  const completedTasks = myTasks.filter(t => t.status === 'Completed').length;
  const completionRate = myTasks.length > 0 ? Math.round((completedTasks / myTasks.length) * 100) : 0;
  
  // Health Score Calculation (Mock)
  const healthScore = Math.min(100, Math.round(completionRate * 0.8 + (activeProjects / Math.max(1, projects.length)) * 20));

  // Chart Data
  const projectStatusData = Object.values(ProjectStatus).map(status => ({
    name: status,
    value: projects.filter(p => p.status === status).length
  }));

  const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#64748b', '#f43f5e', '#ec4899'];

  const workloadData = users
    .filter(u => u.role === UserRole.DEVELOPER)
    .map(u => ({
      name: u.name.split(' ')[0],
      tasks: tasks.filter(t => t.assignedDeveloperId === u.id).length
    }));

  // Mock Trend Data
  const trendData = [
    { name: 'Jan', projects: 4, tasks: 12 },
    { name: 'Feb', projects: 6, tasks: 18 },
    { name: 'Mar', projects: 5, tasks: 25 },
    { name: 'Apr', projects: 8, tasks: 32 },
    { name: 'May', projects: 10, tasks: 45 },
    { name: 'Jun', projects: 12, tasks: 50 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {currentUser?.name}</h1>
          <p className="text-slate-500 dark:text-slate-400">Here's a comprehensive overview of your enterprise status.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Health</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Optimal</p>
            </div>
          </div>
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Active Projects" 
          value={activeProjects} 
          icon={FolderKanban} 
          trend="up" 
          trendValue={12}
          color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
        />
        <StatCard 
          title="Tasks Completed" 
          value={completedTasks} 
          icon={CheckCircle2} 
          trend="up" 
          trendValue={8}
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
        />
        <StatCard 
          title="Project Health" 
          value={`${healthScore}%`} 
          icon={Target} 
          trend="up" 
          trendValue={5}
          color="bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400"
        />
        <StatCard 
          title="Total Resources" 
          value={users.length} 
          icon={Users} 
          color="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Growth & Productivity</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span> Projects
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span> Tasks
              </span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorProjects" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="projects" stroke="#6366f1" fillOpacity={1} fill="url(#colorProjects)" strokeWidth={2} />
                <Area type="monotone" dataKey="tasks" stroke="#10b981" fillOpacity={1} fill="url(#colorTasks)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Status Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Projects</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400">Project Name</th>
                  <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                  <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400">Deadline</th>
                  <th className="pb-3 font-semibold text-slate-600 dark:text-slate-400">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {myProjects.slice(0, 5).map((project) => (
                  <tr key={project.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-4 font-medium text-slate-900 dark:text-white">{project.name}</td>
                    <td className="py-4">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", getStatusColor(project.status))}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400">{formatDate(project.deadline)}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div 
                            className="h-full rounded-full bg-indigo-600" 
                            style={{ width: `${project.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{project.progressPercentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Activity Log</h3>
          <div className="space-y-6">
            {activityLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="flex gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  <Activity size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {users.find(u => u.id === log.userId)?.name} {log.action.toLowerCase()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(log.timestamp)} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {activityLogs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-3 rounded-full bg-slate-50 p-3 dark:bg-slate-800">
                  <Activity className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

