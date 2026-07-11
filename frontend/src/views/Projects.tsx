"use client";

import React, { useState } from 'react';
import { useStore, Project } from '../store/useStore';
import { Card, Button, Badge, Input } from '../components/ui';
import { ConfirmDialog } from '../components/Feedback';
import {
  Plus,
  Users,
  FolderKanban,
  Edit2,
  Trash2 } from
'lucide-react';
export function Projects() {
  const {
    currentUser,
    projects,
    users,
    deleteProject,
    addToast,
    fetchProjects,
    fetchUsers
  } = useStore();

  React.useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, [fetchProjects, fetchUsers]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  if (!currentUser || (currentUser.role !== 'MANAGER' && currentUser.role !== 'ADMIN')) return null;
  const handleEdit = (p: Project) => {
    setEditingProject(p);
    setIsFormOpen(true);
  };
  const handleDelete = async () => {
    if (deletingProject) {
      const result = await deleteProject(deletingProject);
      if (result.ok) {
        addToast({
          title: 'Project deleted',
          type: 'success'
        });
      } else {
        addToast({
          title: 'Failed to delete project',
          description: result.error,
          type: 'error'
        });
      }
      setDeletingProject(null);
    }
  };
  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-brand-muted mt-1">
            Manage categories and assign team members.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProject(null);
            setIsFormOpen(true);
          }}>
          
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {isFormOpen ?
      <ProjectForm
        initialData={editingProject}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProject(null);
        }} /> :


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-brand-muted">
              <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center mb-4">
                <FolderKanban className="w-8 h-8 text-brand-accent" />
              </div>
              <p className="font-medium text-app-text">No projects yet</p>
              <p className="text-sm mt-1">Create your first project to get started</p>
              <Button className="mt-4" onClick={() => { setEditingProject(null); setIsFormOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" /> New Project
              </Button>
            </div>
          ) : projects.map((project) =>
        <Card
          key={project.id}
          className="p-6 flex flex-col hover:shadow-card-hover transition-shadow group">
          
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{
                  backgroundColor: project.color
                }}>
                
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{project.name}</h3>
                    <Badge
                  variant={
                  project.status === 'Active' ?
                  'success' :
                  project.status === 'Completed' ?
                  'default' :
                  'warning'
                  }
                  className="mt-1">
                  
                      {project.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleEdit(project)}>
                
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={() => setDeletingProject(project.id)}>
                
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-brand-muted flex-1 mb-6">
                {project.description || 'No project summary provided.'}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-app-border">
                <div className="flex items-center -space-x-2">
                  {project.members.map((memberId) => {
                const user = users.find((u) => u.id === memberId);
                if (!user) return null;
                return (
                  <img
                    key={user.id}
                    src={user.avatar}
                    alt={user.firstName}
                    className="w-8 h-8 rounded-full border-2 border-app-surface"
                    title={`${user.firstName} ${user.lastName}`} />);


              })}
                  <button className="w-8 h-8 rounded-full border-2 border-app-surface bg-app-bg flex items-center justify-center text-xs font-medium text-brand-muted hover:bg-brand-accent/10 hover:text-brand-accent transition-colors">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs text-brand-muted flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {project.members.length} members
                </div>
              </div>
            </Card>
          )}
        </div>
      }

      <ConfirmDialog
        isOpen={!!deletingProject}
        title="Delete Project"
        description="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeletingProject(null)} />
      
    </div>);

}
function ProjectForm({
  onClose,
  initialData



}: {onClose: () => void;initialData: Project | null;}) {
  const { addProject, updateProject, users, addToast } = useStore();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    color: initialData?.color || '#415A77',
    status: initialData?.status || 'Active' as const,
    description: initialData?.description || '',
    members: initialData?.members || [] as string[]
  });
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Project name is required.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    let result;
    if (initialData) {
      result = await updateProject(initialData.id, formData);
    } else {
      result = await addProject(formData);
    }
    setSubmitting(false);
    if (result.ok) {
      addToast({
        title: initialData ? 'Project updated' : 'Project created',
        type: 'success'
      });
      onClose();
    } else {
      setFormError(result.error || 'Something went wrong. Please try again.');
      addToast({
        title: initialData ? 'Failed to update project' : 'Failed to create project',
        description: result.error,
        type: 'error'
      });
    }
  };
  return (
    <Card className="p-6 max-w-2xl mx-auto w-full animate-fade-in">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-app-border">
        <div>
          <h2 className="text-xl font-bold">
            {initialData ? 'Edit Project' : 'New Project'}
          </h2>
          <p className="text-sm text-brand-muted mt-1">
            Create a new project or category.
          </p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name</label>
            <Input
              value={formData.name}
              onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value
              })
              }
              required
              placeholder="e.g. Retail Operations Portal" />
            
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={formData.color}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  color: e.target.value
                })
                }
                className="w-16 p-1 h-10" />
              
              <Input
                type="text"
                value={formData.color}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  color: e.target.value
                })
                }
                className="flex-1" />
              
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select
            className="flex h-10 w-full rounded-xl border border-app-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
            value={formData.status}
            onChange={(e) =>
            setFormData({
              ...formData,
              status: e.target.value as 'Active' | 'Completed' | 'On Hold'
            })
            }>
            
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <textarea
            className="flex min-h-[80px] w-full rounded-xl border border-app-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent resize-y"
            placeholder="Brief summary of the project..."
            value={formData.description}
            onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value
            })
            } />
          
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Assign Members</label>
          <div className="border border-app-border rounded-xl p-4 max-h-48 overflow-y-auto space-y-2">
            {users.
            filter((u) => u.role === 'MEMBER').
            map((user) =>
            <label
              key={user.id}
              className="flex items-center gap-3 p-2 hover:bg-app-bg rounded-lg cursor-pointer transition-colors">
              
                  <input
                type="checkbox"
                className="w-4 h-4 rounded border-app-border text-brand-accent focus:ring-brand-accent"
                checked={formData.members.includes(user.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({
                      ...formData,
                      members: [...formData.members, user.id]
                    });
                  } else {
                    setFormData({
                      ...formData,
                      members: formData.members.filter(
                        (id) => id !== user.id
                      )
                    });
                  }
                }} />
              
                  <img
                src={user.avatar}
                alt=""
                className="w-6 h-6 rounded-full" />
              
                  <span className="text-sm font-medium">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="text-xs text-brand-muted ml-auto">
                    {user.department}
                  </span>
                </label>
            )}
          </div>
        </div>

        <div className="pt-6 border-t border-app-border flex items-center justify-between gap-3">
          {formError && (
            <p className="text-sm text-red-500 flex-1">{formError}</p>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <Button variant="outline" type="button" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : initialData ? 'Update Project' : 'Create Project'}
            </Button>
          </div>
        </div>
      </form>
    </Card>);

}