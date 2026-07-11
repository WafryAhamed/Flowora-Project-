"use client";

import React from 'react';
import { useStore } from '../store/useStore';
import { Card, Button } from '../components/ui';
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
  PieChart,
  Pie,
  Cell } from
'recharts';
import { Download } from 'lucide-react';
import { useEffect } from 'react';

export function Analytics() {
  const { currentUser, projects, metrics, fetchMetrics } = useStore();
  
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);
  
  if (!currentUser || (currentUser.role !== 'MANAGER' && currentUser.role !== 'ADMIN')) return null;
  // Real metrics or mock fallback
  const totalReports = metrics?.total_reports || 0;
  const complianceRate = metrics?.compliance_rate || 0;
  const totalProjects = metrics?.total_projects || 0;
  const totalUsers = metrics?.total_users || 0;
  
  const taskTrendData = metrics?.task_trend || [];
  
  // Create actual compliance data from task trend if we want to show it, 
  // or use the task trend for the submission compliance chart.
  const complianceData = taskTrendData.map(t => ({
    name: t.week,
    submitted: t.completed,
    pending: t.planned
  }));

  const hoursData = taskTrendData.map((t) => ({
    name: t.week,
    hours: t.completed * 2 // Just an approximation since we don't have weekly hours from backend right now
  }));

  const projectDistribution = projects.map((p) => ({
    name: p.name,
    value: p.members.length * 40,
    color: p.color
  }));
  


  return (
    <div className="space-y-6 animate-fade-in h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-brand-muted mt-1">
            Deep dive into team performance and project metrics.
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4 flex flex-col justify-center">
          <div className="text-brand-muted text-sm font-medium">Total Reports</div>
          <div className="text-2xl font-bold mt-1">{totalReports}</div>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
          <div className="text-brand-muted text-sm font-medium">Compliance Rate</div>
          <div className="text-2xl font-bold mt-1 text-green-500">{complianceRate}%</div>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
          <div className="text-brand-muted text-sm font-medium">Total Projects</div>
          <div className="text-2xl font-bold mt-1">{totalProjects}</div>
        </Card>
        <Card className="p-4 flex flex-col justify-center">
          <div className="text-brand-muted text-sm font-medium">Total Users</div>
          <div className="text-2xl font-bold mt-1">{totalUsers}</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col">
          <h3 className="font-semibold mb-6">Submission Compliance Trend</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={complianceData}
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
                  dataKey="submitted"
                  name="Submitted"
                  fill="#415A77"
                  radius={[4, 4, 0, 0]}
                  stackId="a" />
                
                <Bar
                  dataKey="late"
                  name="Late"
                  fill="#eab308"
                  radius={[0, 0, 0, 0]}
                  stackId="a" />
                
                <Bar
                  dataKey="pending"
                  name="Pending"
                  fill="#778DA9"
                  radius={[4, 4, 0, 0]}
                  stackId="a" />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <h3 className="font-semibold mb-6">Total Hours Logged</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={hoursData}
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
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6 flex flex-col lg:col-span-2">
          <h3 className="font-semibold mb-6">Task Trend</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--app-border)" />
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: 'var(--app-text-secondary)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--app-text-secondary)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--app-surface)', borderColor: 'var(--app-border)', borderRadius: '8px', color: 'var(--app-text)' }} />
                <Line type="monotone" dataKey="planned" name="Planned Tasks" stroke="#eab308" strokeWidth={3} dot={{ r: 4, fill: '#eab308' }} />
                <Line type="monotone" dataKey="completed" name="Completed Tasks" stroke="#415A77" strokeWidth={3} dot={{ r: 4, fill: '#415A77' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 flex flex-col lg:col-span-2">
          <h3 className="font-semibold mb-6">
            Workload Distribution by Project
          </h3>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {projectDistribution.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.color} />
                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--app-surface)',
                    borderColor: 'var(--app-border)',
                    borderRadius: '8px',
                    color: 'var(--app-text)'
                  }} />
                
              </PieChart>
            </ResponsiveContainer>
            <div className="ml-8 space-y-3">
              {projectDistribution.map((p, i) =>
              <div key={i} className="flex items-center gap-2 text-sm">
                  <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: p.color
                  }} />
                
                  <span className="font-medium">{p.name}</span>
                  <span className="text-brand-muted ml-2">{p.value} hrs</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>);

}