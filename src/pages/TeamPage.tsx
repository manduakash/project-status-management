import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { UserRole } from '../types';
import { Users, Mail, Phone, Shield, MoreHorizontal, Plus, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

export const TeamPage = () => {
  const { users, currentUser, addUser, deleteUser } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: UserRole.DEVELOPER,
  });

  const canManage = currentUser?.role === UserRole.MANAGEMENT;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(formData);
    setIsModalOpen(false);
    toast.success('User created successfully');
    setFormData({ name: '', username: '', role: UserRole.DEVELOPER });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Team Members</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your organization's resources and roles.</p>
        </div>
        {canManage && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <div key={user.id} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                  {user.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">{user.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</p>
                </div>
              </div>
              {canManage && user.id !== currentUser?.id && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => {
                    if (confirm('Are you sure you want to remove this user?')) {
                      deleteUser(user.id);
                      toast.success('User removed');
                    }
                  }}
                >
                  <X size={20} />
                </Button>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <Shield className="mr-3 h-4 w-4" />
                <span className="capitalize">{user.role.toLowerCase().replace('_', ' ')}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <Mail className="mr-3 h-4 w-4" />
                {user.username}@promanage.com
              </div>
              <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                <Phone className="mr-3 h-4 w-4" />
                +1 (555) 000-0000
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="flex-1">View Profile</Button>
              <Button variant="outline" className="flex-1">Message</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New User</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)}>
                <X />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                label="Full Name" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
              <Input 
                label="Username" 
                required 
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="johndoe"
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                <select 
                  className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  {Object.values(UserRole).map(role => (
                    <option key={role} value={role}>{role.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create User</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
