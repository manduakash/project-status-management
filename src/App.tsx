import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';
import { TeamPage } from './pages/TeamPage';

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useStore((state) => state.currentUser);
  const isDarkMode = useStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <Sidebar />
      <main className="pl-64">
        <div className="mx-auto max-w-7xl p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedLayout>
              <ProjectsPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedLayout>
              <TasksPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/team"
          element={
            <ProtectedLayout>
              <TeamPage />
            </ProtectedLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
