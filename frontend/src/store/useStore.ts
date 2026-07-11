import { create } from 'zustand';

export type Role = 'MEMBER' | 'MANAGER' | 'ADMIN';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  avatar?: string;
  department?: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  status: 'Active' | 'Completed' | 'On Hold';
  description?: string;
  members: string[]; // User IDs
}

export interface Report {
  id: string;
  userId: string;
  weekStart: string; // YYYY-MM-DD
  projectId: string;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers: string;
  hoursWorked: number;
  notes?: string;
  links?: string;
  status: 'Draft' | 'Submitted' | 'Late';
  submittedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

// Helpers to map snake_case API responses to camelCase Frontend models
function mapUser(apiUser: any): User {
  return {
    ...apiUser,
    firstName: apiUser.first_name || apiUser.firstName,
    lastName: apiUser.last_name || apiUser.lastName,
  };
}

function mapReport(apiReport: any): Report {
  return {
    ...apiReport,
    userId: apiReport.user_id || apiReport.userId,
    weekStart: apiReport.week_start || apiReport.weekStart,
    projectId: apiReport.project_id || apiReport.projectId,
    tasksCompleted: apiReport.tasks_completed || apiReport.tasksCompleted || '',
    tasksPlanned: apiReport.tasks_planned || apiReport.tasksPlanned || '',
    blockers: apiReport.blockers || '',
    hoursWorked: apiReport.hours_worked ?? apiReport.hoursWorked ?? 0,
    submittedAt: apiReport.submitted_at || apiReport.submittedAt,
  };
}

function mapNotification(apiNotif: any): Notification {
  return {
    id: apiNotif.id,
    userId: apiNotif.user_id || apiNotif.userId,
    title: apiNotif.title,
    message: apiNotif.message,
    type: apiNotif.type || 'info',
    isRead: apiNotif.is_read ?? apiNotif.isRead ?? false,
    createdAt: apiNotif.created_at || apiNotif.createdAt || new Date().toISOString(),
  };
}

export interface DashboardMetrics {
  total_reports: number;
  pending_reports: number;
  late_reports: number;
  total_hours: number;
  compliance_rate: number;
  open_blockers: number;
  total_projects: number;
  total_users: number;
  task_trend: { week: string, planned: number, completed: number }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface AppState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  currentUser: User | null;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (
    user: Omit<User, 'id' | 'avatar'> & { password?: string; department?: string; }
  ) => Promise<{ok: boolean;error?: string;}>;
  logout: () => void;
  fetchMe: () => Promise<void>;

  users: User[];
  projects: Project[];
  reports: Report[];
  metrics: DashboardMetrics | null;
  chatHistory: ChatMessage[];
  notifications: Notification[];

  fetchUsers: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchReports: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  fetchChatHistory: () => Promise<void>;
  askAI: (prompt: string, context?: string) => Promise<string>;
  fetchNotifications: () => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  addReport: (report: Omit<Report, 'id' | 'userId'>) => Promise<{ok: boolean; error?: string}>;
  updateReport: (id: string, report: Partial<Report>) => Promise<{ok: boolean; error?: string}>;
  deleteReport: (id: string) => Promise<{ok: boolean; error?: string}>;

  addProject: (project: Omit<Project, 'id'>) => Promise<{ok: boolean; error?: string}>;
  updateProject: (id: string, project: Partial<Project>) => Promise<{ok: boolean; error?: string}>;
  deleteProject: (id: string) => Promise<{ok: boolean; error?: string}>;
  updateUserRole: (id: string, role: Role) => Promise<void>;
  updateUserProfile: (id: string, profile: Partial<User> & {password?: string}) => Promise<{ok: boolean; error?: string}>;

  toasts: {
    id: string;
    title: string;
    description?: string;
    type?: 'success' | 'error' | 'info';
  }[];
  addToast: (
    toast: Omit<
      {
        id: string;
        title: string;
        description?: string;
        type?: 'success' | 'error' | 'info';
      },
      'id'
    >
  ) => void;
  removeToast: (id: string) => void;
}

const THEME_KEY = 'flowora-theme';
const TOKEN_KEY = 'flowora-token';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(THEME_KEY);
  const theme = stored === 'dark' ? 'dark' : 'light';
  if (theme === 'dark') document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
  return theme;
}

function getAuthHeader(): Record<string, string> {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeader(),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  return res;
}

export const useStore = create<AppState>((set, get) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try {
        window.localStorage.setItem(THEME_KEY, newTheme);
      } catch {}
      return { theme: newTheme };
    }),

  currentUser: null,
  login: async (email, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password || '');
      
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });
      
      if (!res.ok) return false;
      const data = await res.json();
      window.localStorage.setItem(TOKEN_KEY, data.access_token);
      await get().fetchMe();
      return true;
    } catch {
      return false;
    }
  },
  register: async (data) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          role: data.role,
          department: data.department,
          password: data.password || 'password'
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        return { ok: false, error: errorData.detail || 'Registration failed' };
      }
      
      // Auto login after register
      await get().login(data.email, data.password);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  },
  logout: () => {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {}
    set({ currentUser: null, users: [], projects: [], reports: [], notifications: [] });
  },
  fetchMe: async () => {
    try {
      const res = await apiFetch('/auth/me');
      if (res.ok) {
        const user = await res.json();
        set({ currentUser: mapUser(user) });
      }
    } catch {}
  },

  users: [],
  projects: [],
  reports: [],
  notifications: [],

  fetchUsers: async () => {
    try {
      const res = await apiFetch('/users');
      if (res.ok) {
        const data = await res.json();
        set({ users: data.map(mapUser) });
      }
    } catch {}
  },
  fetchProjects: async () => {
    try {
      const res = await apiFetch('/projects');
      if (res.ok) {
        const data = await res.json();
        set({ projects: data });
      }
    } catch {}
  },
  fetchReports: async () => {
    try {
      const res = await apiFetch('/reports');
      if (res.ok) {
        const data = await res.json();
        set({ reports: data.map(mapReport) });
      }
    } catch {}
  },
  
  metrics: null,
  fetchMetrics: async () => {
    try {
      const res = await apiFetch('/analytics/dashboard-metrics');
      if (res.ok) {
        const data = await res.json();
        set({ metrics: data });
      }
    } catch {}
  },
  
  chatHistory: [],
  fetchChatHistory: async () => {
    try {
      const res = await apiFetch('/ai/history');
      if (res.ok) {
        const data = await res.json();
        set({ chatHistory: data });
      }
    } catch {}
  },
  askAI: async (prompt: string, context?: string) => {
    try {
      const res = await apiFetch('/ai/ask', {
        method: 'POST',
        body: JSON.stringify({ prompt, context }),
      });
      if (res.ok) {
        const data = await res.json();
        await get().fetchChatHistory();
        return data.response;
      }
      return "Sorry, I couldn't process your request.";
    } catch {
      return "Sorry, there was an error connecting to the AI service.";
    }
  },

  // ─── Notifications ──────────────────────────────────────────────────────────
  fetchNotifications: async () => {
    try {
      const res = await apiFetch('/notifications');
      if (res.ok) {
        const data = await res.json();
        set({ notifications: data.map(mapNotification) });
      }
    } catch {}
  },
  markAllNotificationsRead: async () => {
    try {
      const res = await apiFetch('/notifications/mark-all-read', { method: 'PATCH' });
      if (res.ok) {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      }
    } catch {}
  },
  markNotificationRead: async (id: string) => {
    try {
      const res = await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
      if (res.ok) {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        }));
      }
    } catch {}
  },
  deleteNotification: async (id: string) => {
    try {
      const res = await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }
    } catch {}
  },

  // ─── Reports ────────────────────────────────────────────────────────────────
  addReport: async (report) => {
    try {
      const res = await apiFetch('/reports', {
        method: 'POST',
        body: JSON.stringify({
          week_start: report.weekStart,
          project_id: report.projectId,
          tasks_completed: report.tasksCompleted,
          tasks_planned: report.tasksPlanned,
          blockers: report.blockers,
          hours_worked: report.hoursWorked,
          notes: report.notes,
          links: report.links,
          status: report.status,
        }),
      });
      if (res.ok) {
        await get().fetchReports();
        return { ok: true };
      }
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.detail || `Server error ${res.status}` };
    } catch (e: any) {
      return { ok: false, error: e.message || 'Network error' };
    }
  },
  updateReport: async (id, updates) => {
    try {
      const payload: any = {};
      if (updates.weekStart !== undefined) payload.week_start = updates.weekStart;
      if (updates.projectId !== undefined) payload.project_id = updates.projectId;
      if (updates.tasksCompleted !== undefined) payload.tasks_completed = updates.tasksCompleted;
      if (updates.tasksPlanned !== undefined) payload.tasks_planned = updates.tasksPlanned;
      if (updates.blockers !== undefined) payload.blockers = updates.blockers;
      if (updates.hoursWorked !== undefined) payload.hours_worked = updates.hoursWorked;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.links !== undefined) payload.links = updates.links;
      if (updates.status !== undefined) payload.status = updates.status;

      const res = await apiFetch(`/reports/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await get().fetchReports();
        return { ok: true };
      }
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.detail || `Server error ${res.status}` };
    } catch (e: any) {
      return { ok: false, error: e.message || 'Network error' };
    }
  },
  updateUserProfile: async (id, profile) => {
    try {
      const payload: any = {};
      if (profile.firstName !== undefined) payload.first_name = profile.firstName;
      if (profile.lastName !== undefined) payload.last_name = profile.lastName;
      if (profile.email !== undefined) payload.email = profile.email;
      if (profile.department !== undefined) payload.department = profile.department;
      if ((profile as any).password !== undefined) payload.password = (profile as any).password;
      
      const res = await apiFetch(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await get().fetchMe();
        return { ok: true };
      }
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.detail || 'Update failed' };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  },
  deleteReport: async (id) => {
    try {
      const res = await apiFetch(`/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await get().fetchReports();
        return { ok: true };
      }
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.detail || `Server error ${res.status}` };
    } catch (e: any) {
      return { ok: false, error: e.message || 'Network error' };
    }
  },

  // ─── Projects ───────────────────────────────────────────────────────────────
  addProject: async (project) => {
    try {
      const res = await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: project.name,
          color: project.color,
          status: project.status,
          description: project.description,
          members: project.members,
        }),
      });
      if (res.ok) {
        await get().fetchProjects();
        return { ok: true };
      }
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.detail || `Server error ${res.status}` };
    } catch (e: any) {
      return { ok: false, error: e.message || 'Network error' };
    }
  },
  updateProject: async (id, updates) => {
    try {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.color !== undefined) payload.color = updates.color;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.members !== undefined) payload.members = updates.members;

      const res = await apiFetch(`/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        await get().fetchProjects();
        return { ok: true };
      }
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.detail || `Server error ${res.status}` };
    } catch (e: any) {
      return { ok: false, error: e.message || 'Network error' };
    }
  },
  deleteProject: async (id) => {
    try {
      const res = await apiFetch(`/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await get().fetchProjects();
        return { ok: true };
      }
      const err = await res.json().catch(() => ({}));
      return { ok: false, error: err.detail || `Server error ${res.status}` };
    } catch (e: any) {
      return { ok: false, error: e.message || 'Network error' };
    }
  },
  updateUserRole: async (id, role) => {
    try {
      const res = await apiFetch(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        await get().fetchUsers();
      }
    } catch {}
  },

  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: `t${Date.now()}` }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));