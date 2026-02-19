import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Settings, LogOut, Moon, Sun, Bell } from 'lucide-react';
import { Button } from './ui/Button';
import { UserRole } from '../types';
import { cn } from '../lib/utils';

export const Sidebar = () => {
  const { currentUser, logout, isDarkMode, toggleDarkMode } = useStore();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  ];

  if (currentUser?.role === UserRole.MANAGEMENT || currentUser?.role === UserRole.TEAM_LEAD) {
    menuItems.push({ icon: Users, label: 'Team', path: '/team' });
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-full flex-col px-3 py-4">
        <div className="mb-10 flex items-center px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <FolderKanban size={24} />
          </div>
          <span className="ml-3 text-xl font-bold tracking-tight text-slate-900 dark:text-white">ProManage</span>
        </div>

        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className="group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
            >
              <item.icon className="mr-3 h-5 w-5 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4 pt-4">
          <div className="flex items-center justify-between px-2">
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <Button variant="ghost" size="icon">
              <Bell size={20} />
            </Button>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{currentUser?.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400 capitalize">{currentUser?.role.toLowerCase().replace('_', ' ')}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-4 w-full justify-start text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-900/20"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
};
