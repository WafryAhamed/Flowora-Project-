"use client";

import React, { useMemo, useState } from 'react';
import { useStore, Report } from '../store/useStore';
import { Card, Button, Badge, Input } from '../components/ui';
import { ConfirmDialog } from '../components/Feedback';
import {
  Plus,
  Search,
  Calendar,
  Clock,
  FileText,
  Trash2,
  Edit2,
  X } from
'lucide-react';
export function Reports() {
  const {
    currentUser,
    reports,
    projects,
    users,
    deleteReport,
    addToast,
    fetchReports,
    fetchProjects,
    fetchUsers
  } = useStore();

  React.useEffect(() => {
    fetchReports();
    fetchProjects();
    fetchUsers();
  }, [fetchReports, fetchProjects, fetchUsers]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [deletingReport, setDeletingReport] = useState<string | null>(null);
  // Filters
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const isManager = currentUser?.role === 'MANAGER';
  const currentUserId = currentUser?.id ?? '';
  const handleEdit = (r: Report) => {
    setEditingReport(r);
    setIsFormOpen(true);
  };
  const handleDelete = () => {
    if (deletingReport) {
      deleteReport(deletingReport);
      addToast({
        title: 'Report deleted',
        type: 'success'
      });
      setDeletingReport(null);
    }
  };
  const filteredReports = useMemo(() => {
    let result = isManager ?
    reports :
    reports.filter((r) => r.userId === currentUserId);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
        (r.tasksCompleted || '').toLowerCase().includes(q) ||
        (r.tasksPlanned || '').toLowerCase().includes(q) ||
        (r.blockers || '').toLowerCase().includes(q)
      );
    }
    if (isManager && filterUser) {
      result = result.filter((r) => r.userId === filterUser);
    }
    if (filterProject) {
      result = result.filter((r) => r.projectId === filterProject);
    }
    if (filterStatus) {
      result = result.filter((r) => r.status === filterStatus);
    }
    if (filterDateFrom) {
      result = result.filter((r) => r.weekStart >= filterDateFrom);
    }
    if (filterDateTo) {
      result = result.filter((r) => r.weekStart <= filterDateTo);
    }
    return result.sort(
      (a, b) =>
      new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
    );
  }, [
  reports,
  isManager,
  currentUserId,
  search,
  filterUser,
  filterProject,
  filterStatus,
  filterDateFrom,
  filterDateTo]
  );

  const totalPages = Math.ceil(filteredReports.length / pageSize);
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredReports.slice(startIndex, startIndex + pageSize);
  }, [filteredReports, currentPage]);

  if (!currentUser) return null;
  const resetFilters = () => {
    setSearch('');
    setFilterUser('');
    setFilterProject('');
    setFilterStatus('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setCurrentPage(1);
  };
  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Weekly Reports</h1>
          <p className="text-sm text-brand-muted mt-1">
            {isManager ?
            'Monitor team submissions and progress.' :
            'Manage your weekly status updates.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isManager &&
          <Button
            onClick={() => {
              setEditingReport(null);
              setIsFormOpen(true);
            }}>
            
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          }
        </div>
      </div>

      {isFormOpen && !isManager ?
      <ReportForm
        initialData={editingReport}
        onClose={() => {
          setIsFormOpen(false);
          setEditingReport(null);
        }} /> :


      <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-app-border flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-app-bg/30">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <Input
              placeholder="Search reports..."
              className="pl-9 bg-app-surface"
              value={search}
              onChange={(e) => setSearch(e.target.value)} />
            
            </div>

            {isManager &&
          <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="date"
                  className="h-10 w-auto bg-app-surface"
                  value={filterDateFrom}
                  onChange={(e) => { setFilterDateFrom(e.target.value); setCurrentPage(1); }}
                  title="From Date"
                />
                <Input
                  type="date"
                  className="h-10 w-auto bg-app-surface"
                  value={filterDateTo}
                  onChange={(e) => { setFilterDateTo(e.target.value); setCurrentPage(1); }}
                  title="To Date"
                />
                <select
              className="h-10 rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}>
              
                  <option value="">All Members</option>
                  {users.
              filter((u) => u.role === 'MEMBER').
              map((u) =>
              <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName}
                      </option>
              )}
                </select>
                <select
              className="h-10 rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}>
              
                  <option value="">All Projects</option>
                  {projects.map((p) =>
              <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
              )}
                </select>
                <select
              className="h-10 rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}>
              
                  <option value="">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Draft">Draft</option>
                  <option value="Late">Late</option>
                </select>
                {(search || filterUser || filterProject || filterStatus || filterDateFrom || filterDateTo) &&
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="h-10 px-3">
              
                    <X className="w-4 h-4 mr-1" /> Clear
                  </Button>
            }
              </div>
          }
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-brand-muted uppercase bg-app-bg/50 sticky top-0 z-10">
                <tr>
                  {isManager &&
                <th className="px-6 py-4 font-medium">Team Member</th>
                }
                  <th className="px-6 py-4 font-medium">Week</th>
                  <th className="px-6 py-4 font-medium">Project</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Hours</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {paginatedReports.map((report) => {
                const user = users.find((u) => u.id === report.userId);
                const project = projects.find(
                  (p) => p.id === report.projectId
                );
                return (
                  <tr
                    key={report.id}
                    className="hover:bg-app-bg/30 transition-colors group">
                    
                      {isManager &&
                    <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                          src={user?.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full" />
                        
                            <div>
                              <div className="font-medium">
                                {user?.firstName} {user?.lastName}
                              </div>
                              <div className="text-xs text-brand-muted">
                                {user?.department}
                              </div>
                            </div>
                          </div>
                        </td>
                    }
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-brand-muted" />
                          <span>W/C {report.weekStart}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: project?.color || '#ccc'
                          }} />
                        
                          <span className="font-medium">{project?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                        variant={
                        report.status === 'Submitted' ?
                        'success' :
                        report.status === 'Late' ?
                        'error' :
                        'warning'
                        }>
                        
                          {report.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-brand-muted">
                          <Clock className="w-4 h-4" />
                          <span>{report.hoursWorked}h</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!isManager && report.status === 'Draft' &&
                        <>
                              <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(report)}>
                            
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            onClick={() => setDeletingReport(report.id)}>
                            
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                        }
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>);

              })}
                {filteredReports.length === 0 &&
              <tr>
                    <td
                  colSpan={isManager ? 6 : 5}
                  className="px-6 py-12 text-center text-brand-muted">
                  
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="w-12 h-12 mb-4 opacity-20" />
                        <p>No reports found.</p>
                      </div>
                    </td>
                  </tr>
              }
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="p-4 border-t border-app-border flex items-center justify-between bg-app-bg/30">
              <span className="text-sm text-brand-muted">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredReports.length)} of {filteredReports.length} reports
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-sm px-2">Page {currentPage} of {totalPages}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      }

      <ConfirmDialog
        isOpen={!!deletingReport}
        title="Delete Draft"
        description="Are you sure you want to delete this draft report? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        onCancel={() => setDeletingReport(null)} />
      
    </div>);

}
function ReportForm({
  onClose,
  initialData



}: {onClose: () => void;initialData: Report | null;}) {
  const { currentUser, projects, addReport, updateReport, addToast } =
  useStore();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    weekStart: initialData?.weekStart || new Date().toISOString().split('T')[0],
    projectId: initialData?.projectId || projects[0]?.id || '',
    tasksCompleted: initialData?.tasksCompleted || '',
    tasksPlanned: initialData?.tasksPlanned || '',
    blockers: initialData?.blockers || '',
    hoursWorked: initialData?.hoursWorked || 40,
    notes: initialData?.notes || '',
    links: initialData?.links || ''
  });
  const handleSubmit = async (e: React.FormEvent, status: 'Draft' | 'Submitted') => {
    e.preventDefault();
    if (!currentUser) return;
    if (!formData.tasksCompleted.trim()) {
      setFormError('Tasks completed is required.');
      return;
    }
    if (!formData.projectId) {
      setFormError('Please select a project.');
      return;
    }
    setFormError('');
    setSubmitting(true);
    const payload = {
      ...formData,
      userId: currentUser.id,
      status,
      submittedAt:
      status === 'Submitted' ? new Date().toISOString() : undefined
    };
    let result;
    if (initialData) {
      result = await updateReport(initialData.id, payload);
    } else {
      result = await addReport(payload);
    }
    setSubmitting(false);
    if (result.ok) {
      addToast({
        title: `Report ${status === 'Submitted' ? 'submitted' : 'saved as draft'}`,
        type: 'success'
      });
      onClose();
    } else {
      setFormError(result.error || 'Something went wrong. Please try again.');
      addToast({
        title: 'Failed to save report',
        description: result.error,
        type: 'error'
      });
    }
  };
  return (
    <Card className="p-6 max-w-3xl mx-auto w-full animate-fade-in">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-app-border">
        <div>
          <h2 className="text-xl font-bold">
            {initialData ? 'Edit Report' : 'New Weekly Report'}
          </h2>
          <p className="text-sm text-brand-muted mt-1">
            Fill out your standard weekly update.
          </p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      </div>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Week Starting</label>
            <Input
              type="date"
              value={formData.weekStart}
              onChange={(e) =>
              setFormData({
                ...formData,
                weekStart: e.target.value
              })
              }
              required />
            
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Project / Category</label>
            <select
              className="flex h-10 w-full rounded-xl border border-app-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              value={formData.projectId}
              onChange={(e) =>
              setFormData({
                ...formData,
                projectId: e.target.value
              })
              }>
              
              {projects.map((p) =>
              <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              )}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tasks Completed</label>
          <textarea
            className="flex min-h-[100px] w-full rounded-xl border border-app-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent resize-y"
            placeholder="What did you accomplish this week?"
            value={formData.tasksCompleted}
            onChange={(e) =>
            setFormData({
              ...formData,
              tasksCompleted: e.target.value
            })
            }
            required />
          
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Tasks Planned for Next Week
          </label>
          <textarea
            className="flex min-h-[100px] w-full rounded-xl border border-app-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent resize-y"
            placeholder="What are your priorities for next week?"
            value={formData.tasksPlanned}
            onChange={(e) =>
            setFormData({
              ...formData,
              tasksPlanned: e.target.value
            })
            }
            required />
          
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Blockers / Challenges</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-xl border border-app-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent resize-y"
              placeholder="Any roadblocks?"
              value={formData.blockers}
              onChange={(e) =>
              setFormData({
                ...formData,
                blockers: e.target.value
              })
              } />
            
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Hours Worked</label>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.hoursWorked}
              onChange={(e) =>
              setFormData({
                ...formData,
                hoursWorked: Number(e.target.value)
              })
              }
              required />
            
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Optional Links</label>
          <Input
            type="url"
            placeholder="https://..."
            value={formData.links}
            onChange={(e) =>
            setFormData({
              ...formData,
              links: e.target.value
            })
            } />
          
        </div>

        {formError && (
          <p className="text-sm text-red-500 pb-2">{formError}</p>
        )}
        <div className="pt-6 border-t border-app-border flex items-center justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            disabled={submitting}
            onClick={(e) => handleSubmit(e, 'Draft')}>
            
            {submitting ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button type="button" disabled={submitting} onClick={(e) => handleSubmit(e, 'Submitted')}>
            {submitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </Card>);

}