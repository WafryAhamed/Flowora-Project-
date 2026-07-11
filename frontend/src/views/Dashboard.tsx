"use client";

import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, Badge } from '../components/ui';
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2 } from
'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend } from
'recharts';
import { useRouter } from 'next/navigation';

export function Dashboard() {
  const { currentUser, reports, projects, metrics, fetchReports, fetchProjects, fetchMetrics } = useStore();
  const router = useRouter();
  
  useEffect(() => {
    fetchReports();
    fetchProjects();
    fetchMetrics();
  }, [fetchReports, fetchProjects, fetchMetrics]);
  
  if (!currentUser) return null;
  const isManager = currentUser.role === 'MANAGER' || currentUser.role === 'ADMIN';

  const taskTrendData = metrics?.task_trend.map(t => ({
    name: t.week,
    completed: t.completed,
    planned: t.planned
  })) || [];

  // For members, we can show their own hours over weeks
  const sortedReports = [...reports].sort((a, b) => a.weekStart.localeCompare(b.weekStart));
  const userHoursData = sortedReports.filter(r => r.userId === currentUser.id).map(r => ({
    name: r.weekStart,
    hours: r.hoursWorked
  }));

  const displayTotalReports = isManager ? (metrics?.total_reports || 0) : reports.filter(r => r.userId === currentUser.id).length;
  const displayCompliance = isManager ? (metrics?.compliance_rate || 0) : 
    (reports.filter(r => r.userId === currentUser.id && r.status === 'Submitted').length / (displayTotalReports || 1) * 100).toFixed(0);
  
  const userTotalHours = reports.filter(r => r.userId === currentUser.id).reduce((acc, r) => acc + r.hoursWorked, 0);
  const displayHours = isManager ? (metrics?.pending_reports || 0) : userTotalHours; // using pending reports for manager's 3rd card
  
  const openBlockers = isManager 
    ? metrics?.open_blockers || 0 
    : reports.filter(r => r.userId === currentUser.id && r.blockers && r.blockers.trim() !== '').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {currentUser.firstName}
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            Here's what's happening{' '}
            {isManager ? 'across your team' : 'with your work'} this week.
          </p>
        </div>
        {!isManager &&
        <Button className="shrink-0">
            <FileText className="w-4 h-4 mr-2" />
            Create Weekly Report
          </Button>
        }
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center space-x-4">
          <div className="p-3 bg-brand-accent/10 rounded-xl text-brand-accent">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-muted">
              {isManager ? 'Total Reports' : 'Reports Submitted'}
            </p>
            <h3 className="text-2xl font-bold">{displayTotalReports}</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center space-x-4">
          <div className="p-3 bg-green-500/10 rounded-xl text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-muted">
              {isManager ? 'Compliance Rate' : 'On-time Rate'}
            </p>
            <h3 className="text-2xl font-bold">{displayCompliance}%</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center space-x-4">
          <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-600 dark:text-yellow-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-muted">
              {isManager ? 'Pending Reports' : 'Hours Logged'}
            </p>
            <h3 className="text-2xl font-bold">{displayHours}</h3>
          </div>
        </Card>
        <Card className="p-5 flex items-center space-x-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-600 dark:text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-brand-muted">
              Open Blockers
            </p>
            <h3 className="text-2xl font-bold">{openBlockers}</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <Card className="p-6 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">
                {isManager ? 'Team Tasks Trend' : 'Hours Logged'}
              </h3>
              <p className="text-xs text-brand-muted mt-0.5">
                {isManager ? 'Completed vs planned tasks by week' : 'Your weekly hours over time'}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/reports')}>
              View Reports
            </Button>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              {isManager ?
              <BarChart
                data={taskTrendData}
                margin={{
                  top: 0,
                  right: 0,
                  left: -20,
                  bottom: 0
                }}>
                
                  <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--app-border)" />
                
                  <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--app-text-secondary)',
                    fontSize: 12
                  }}
                  dy={10} />
                
                  <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--app-text-secondary)',
                    fontSize: 12
                  }} />
                
                  <Tooltip
                  cursor={{
                    fill: 'var(--app-border)',
                    opacity: 0.4
                  }}
                  contentStyle={{
                    backgroundColor: 'var(--app-surface)',
                    borderColor: 'var(--app-border)',
                    borderRadius: '8px',
                    color: 'var(--app-text)'
                  }} />
                
                  <Bar
                  dataKey="completed"
                  name="Completed Tasks"
                  fill="#415A77"
                  radius={[4, 4, 0, 0]} />
                
                  <Bar
                  dataKey="planned"
                  name="Planned Tasks"
                  fill="#778DA9"
                  radius={[4, 4, 0, 0]} />

                  <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                  formatter={(value) => <span style={{ color: 'var(--app-text-secondary)' }}>{value}</span>} />
                
                </BarChart> :

              <LineChart
                data={userHoursData}
                margin={{
                  top: 0,
                  right: 0,
                  left: -20,
                  bottom: 0
                }}>
                
                  <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--app-border)" />
                
                  <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--app-text-secondary)',
                    fontSize: 12
                  }}
                  dy={10} />
                
                  <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: 'var(--app-text-secondary)',
                    fontSize: 12
                  }} />
                
                  <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--app-surface)',
                    borderColor: 'var(--app-border)',
                    borderRadius: '8px',
                    color: 'var(--app-text)'
                  }} />
                
                  <Line
                  type="monotone"
                  dataKey="hours"
                  name="Hours"
                  stroke="#415A77"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: '#415A77'
                  }}
                  activeDot={{
                    r: 6
                  }} />
                
                </LineChart>
              }
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity / Reports */}
        <Card className="p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold">Recent Reports</h3>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2">
            {reports.slice(0, 10).map((report) => {
              const project = projects.find((p) => p.id === report.projectId);
              return (
                <div
                  key={report.id}
                  className="p-4 rounded-xl border border-app-border bg-app-bg/50 hover:bg-app-bg transition-colors">
                  
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={
                      report.status === 'Submitted' ? 'success' : report.status === 'Draft' ? 'default' : 'warning'
                      }>
                      
                      {report.status}
                    </Badge>
                    <span className="text-xs text-brand-muted">
                      {report.weekStart}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">
                    {project?.name || 'Unknown Project'}
                  </p>
                  <p className="text-xs text-brand-muted mt-1 truncate">
                    {report.tasksCompleted.split('\n')[0] || 'No tasks listed'}
                  </p>
                </div>);

            })}
            {reports.length === 0 &&
            <div className="flex flex-col items-center justify-center h-full text-brand-muted py-8">
                <FileText className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">No recent reports</p>
              </div>
            }
          </div>
        </Card>
      </div>
    </div>);
}