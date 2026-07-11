"use client";

import React, { useMemo, useState } from 'react';
import { useStore, Role } from '../store/useStore';
import { Card, Badge, Button, Input } from '../components/ui';
import { Plus, Search, Mail, Users as UsersIcon } from 'lucide-react';
export function Users() {
  const { currentUser, users, projects, updateUserRole, addToast, fetchUsers, fetchProjects } = useStore();

  React.useEffect(() => {
    fetchUsers();
    fetchProjects();
  }, [fetchUsers, fetchProjects]);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.department ?? ''}`.
    toLowerCase().
    includes(q)
    );
  }, [users, query]);

  if (!currentUser || (currentUser.role !== 'MANAGER' && currentUser.role !== 'ADMIN')) return null;

  const handleRoleChange = (id: string, role: Role, name: string) => {
    updateUserRole(id, role);
    addToast({
      type: 'success',
      title: 'Role updated',
      description: `${name} is now a ${role === 'MANAGER' ? 'Manager' : 'Team Member'}.`
    });
  };
  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-sm text-brand-muted mt-1">
            Manage users, roles, and access.
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Invite User
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-app-border flex items-center justify-between bg-app-bg/30">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-9 bg-app-surface" />
            
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-brand-muted uppercase bg-app-bg/50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Projects</th>
                <th className="px-6 py-4 font-medium text-right">
                  Assign Role
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {filtered.map((user) => {
                const userProjects = projects.filter((p) =>
                p.members.includes(user.id)
                );
                const isSelf = user.id === currentUser.id;
                return (
                  <tr
                    key={user.id}
                    className="hover:bg-app-bg/30 transition-colors">
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar}
                          alt=""
                          className="w-10 h-10 rounded-full border border-app-border" />
                        
                        <div>
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                            {isSelf &&
                            <span className="text-brand-muted font-normal">
                                {' '}
                                (you)
                              </span>
                            }
                          </div>
                          <div className="text-xs text-brand-muted flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                        user.role === 'MANAGER' ? 'default' : 'success'
                        }>
                        
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {userProjects.length > 0 ?
                        userProjects.map((p) =>
                        <span
                          key={p.id}
                          className="text-xs px-2 py-1 rounded-md bg-app-bg border border-app-border">
                          
                              {p.name}
                            </span>
                        ) :

                        <span className="text-brand-muted text-xs">
                            No projects
                          </span>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={user.role}
                        disabled={isSelf}
                        onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value as Role,
                          `${user.firstName} ${user.lastName}`
                        )
                        }
                        className="h-9 rounded-xl border border-app-border bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={`Change role for ${user.firstName} ${user.lastName}`}>
                        
                        <option value="MEMBER">Team Member</option>
                        <option value="MANAGER">Manager</option>
                      </select>
                    </td>
                  </tr>);

              })}
            </tbody>
          </table>

          {filtered.length === 0 &&
          <div className="flex flex-col items-center justify-center py-16 text-brand-muted">
              <UsersIcon className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">No users match “{query}”.</p>
            </div>
          }
        </div>
      </Card>
    </div>);

}