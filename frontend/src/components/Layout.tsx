"use client";

import React, { useEffect, useState, useRef, ComponentType } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  LayoutDashboard,
  FileText,
  FolderKanban,
  BarChart3,
  Bot,
  Users,
  Settings,
  LogOut,
  Menu,
  Moon,
  Sun,
  Bell,
  Search,
  X,
  User as UserIcon,
  CheckCheck,
  AlertTriangle,
  Megaphone,
  WifiOff } from
'lucide-react';
import { Input, Badge, cn } from './ui';
import { ChatWidget } from './ChatWidget';
import logo from '@/logo/logo.PNG';

interface NavItem {
  name: string;
  path: '/dashboard' | '/reports' | '/projects' | '/analytics' | '/ai' | '/users' | '/settings';
  icon: ComponentType<{
    className?: string;
  }>;
  roles: string[];
}
const NAV_ITEMS: NavItem[] = [
{
  name: 'Dashboard',
  path: '/dashboard',
  icon: LayoutDashboard,
  roles: ['MEMBER', 'MANAGER', 'ADMIN']
},
{
  name: 'Weekly Reports',
  path: '/reports',
  icon: FileText,
  roles: ['MEMBER', 'MANAGER', 'ADMIN']
},
{
  name: 'Projects',
  path: '/projects',
  icon: FolderKanban,
  roles: ['MANAGER', 'ADMIN']
},
{
  name: 'Analytics',
  path: '/analytics',
  icon: BarChart3,
  roles: ['MANAGER', 'ADMIN']
},
{
  name: 'AI Assistant',
  path: '/ai',
  icon: Bot,
  roles: ['MANAGER', 'ADMIN']
},
{
  name: 'Users',
  path: '/users',
  icon: Users,
  roles: ['MANAGER', 'ADMIN']
},
{
  name: 'Settings',
  path: '/settings',
  icon: Settings,
  roles: ['MEMBER', 'MANAGER', 'ADMIN']
}];

const notifTypeTone: Record<string, string> = {
  warning: 'text-yellow-500 bg-yellow-500/10',
  info: 'text-brand-accent bg-brand-accent/10',
  success: 'text-green-500 bg-green-500/10',
  error: 'text-red-500 bg-red-500/10',
};
const notifTypeIcon: Record<string, ComponentType<{className?: string}>> = {
  warning: AlertTriangle,
  info: Megaphone,
  success: CheckCheck,
  error: AlertTriangle,
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  return `${Math.max(0, mins)}m ago`;
}

export function Layout({ children }: { children: React.ReactNode }) {
  const {
    currentUser, logout, theme, toggleTheme,
    notifications, fetchNotifications, markAllNotificationsRead, markNotificationRead,
    reports, projects, users
  } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Offline detection
  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Fetch notifications when user is available
  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      // Poll every 60 seconds
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [currentUser, fetchNotifications]);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setNotifOpen(false);
    setProfileOpen(false);
    setSearchQuery('');
    setSearchOpen(false);
  }, [pathname]);

  // Click-away for dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!currentUser) {
    return null;
  }

  const visibleNavItems = NAV_ITEMS.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Global search results
  const searchResults = searchQuery.trim().length >= 2 ? (() => {
    const q = searchQuery.toLowerCase();
    const matchedReports = reports
      .filter(r => (r.tasksCompleted || '').toLowerCase().includes(q) || (r.weekStart || '').includes(q))
      .slice(0, 3)
      .map(r => ({ type: 'report' as const, id: r.id, label: `Report: W/C ${r.weekStart}`, sub: r.tasksCompleted?.split('\n')[0] || '', path: '/reports' }));
    const matchedProjects = projects
      .filter(p => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q))
      .slice(0, 3)
      .map(p => ({ type: 'project' as const, id: p.id, label: `Project: ${p.name}`, sub: p.description || '', path: '/projects' }));
    const matchedUsers = users
      .filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q))
      .slice(0, 3)
      .map(u => ({ type: 'user' as const, id: u.id, label: `${u.firstName} ${u.lastName}`, sub: u.email, path: '/users' }));
    return [...matchedProjects, ...matchedReports, ...matchedUsers];
  })() : [];

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
  };

  const SidebarContent = ({ showLabels }: {showLabels: boolean;}) =>
  <>
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/10 shrink-0">
        {showLabels &&
      <img src={logo.src ?? logo} alt="Flowora" className="h-8 object-contain" />
      }
        <button
        onClick={() => setCollapsed((c) => !c)}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors hidden md:block"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
        
          <Menu className="w-5 h-5" />
        </button>
        <button
        onClick={() => setMobileOpen(false)}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors md:hidden"
        aria-label="Close menu">
        
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        {visibleNavItems.map((item) => {
        const active = pathname.startsWith(item.path);
        return (
          <Link
            key={item.path}
            href={item.path as never}
            className={cn(
              'flex items-center px-3 py-2.5 rounded-xl transition-colors',
              active ?
              'bg-brand-accent text-white' :
              'text-brand-muted hover:bg-white/5 hover:text-white',
              !showLabels && 'justify-center'
            )}
            title={!showLabels ? item.name : undefined}
            aria-current={active ? 'page' : undefined}>
            
              <item.icon className={cn('w-5 h-5', showLabels && 'mr-3')} />
              {showLabels &&
            <span className="text-sm font-medium">{item.name}</span>
            }
            </Link>);

      })}
      </nav>
      <div className="p-4 border-t border-white/10 shrink-0">
        <button
        onClick={handleLogout}
        className={cn(
          'flex items-center w-full px-3 py-2.5 text-brand-muted hover:bg-white/5 hover:text-white rounded-xl transition-colors',
          !showLabels && 'justify-center'
        )}>
        
          <LogOut className={cn('w-5 h-5', showLabels && 'mr-3')} />
          {showLabels && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </>;

  return (
    <div className="flex h-screen w-full bg-app-bg text-app-text overflow-hidden">
      {/* Offline banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-sm font-medium flex items-center justify-center gap-2 py-2 px-4"
          >
            <WifiOff className="w-4 h-4" />
            No internet connection — changes may not be saved.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-brand-primary text-white transition-all duration-300 z-20',
          collapsed ? 'w-20' : 'w-64'
        )}>
        
        <SidebarContent showLabels={!collapsed} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen &&
        <>
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden" />
          
            <motion.aside
            initial={{
              x: '-100%'
            }}
            animate={{
              x: 0
            }}
            exit={{
              x: '-100%'
            }}
            transition={{
              type: 'tween',
              duration: 0.25
            }}
            className="fixed inset-y-0 left-0 w-64 flex flex-col bg-brand-primary text-white z-50 md:hidden">
            
              <SidebarContent showLabels />
            </motion.aside>
          </>
        }
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className={`${isOffline ? 'mt-8' : ''} h-16 bg-app-surface z-30 flex items-center justify-between px-4 sm:px-6 border-b border-app-border`}>
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 text-brand-muted hover:text-app-text transition-colors rounded-lg md:hidden"
              aria-label="Open menu">
              
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/dashboard" className="hidden md:flex items-center gap-2">
              <img src={logo.src ?? logo} alt="Flowora" className="h-8 object-contain"/>
            </Link>
            {/* Global Search */}
            <div className="relative w-64 hidden md:block" ref={searchRef}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted pointer-events-none" />
              <Input
                id="global-search"
                placeholder="Search reports, projects, people..."
                className="pl-9 bg-app-bg/50 border-transparent focus:border-brand-accent focus:bg-app-surface"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
              />
              {/* Search results dropdown */}
              <AnimatePresence>
                {searchOpen && searchQuery.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full mt-1 left-0 right-0 rounded-xl bg-app-surface border border-app-border shadow-glass overflow-hidden z-50"
                  >
                    {searchResults.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-brand-muted">No results for "{searchQuery}"</div>
                    ) : (
                      <div className="divide-y divide-app-border">
                        {searchResults.map((r) => (
                          <button
                            key={`${r.type}-${r.id}`}
                            className="w-full px-4 py-3 text-left hover:bg-app-bg transition-colors"
                            onClick={() => {
                              router.push(r.path as any);
                              setSearchQuery('');
                              setSearchOpen(false);
                            }}
                          >
                            <div className="text-sm font-medium truncate">{r.label}</div>
                            {r.sub && <div className="text-xs text-brand-muted truncate mt-0.5">{r.sub}</div>}
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 text-brand-muted hover:text-app-text transition-colors rounded-full hover:bg-app-bg"
              aria-label="Toggle theme">
              
              {theme === 'dark' ?
              <Sun className="w-5 h-5" /> :

              <Moon className="w-5 h-5" />
              }
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setProfileOpen(false);
                }}
                className="p-2 text-brand-muted hover:text-app-text transition-colors rounded-full hover:bg-app-bg relative"
                aria-label="Notifications"
                aria-expanded={notifOpen}>
                
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-brand-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-app-surface">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                    scale: 0.98
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    y: 8,
                    scale: 0.98
                  }}
                  transition={{
                    duration: 0.15
                  }}
                  className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-2xl bg-app-surface border border-app-border shadow-glass overflow-hidden"
                  role="menu">
                  
                    <div className="flex items-center justify-between px-4 py-3 border-b border-app-border">
                      <span className="font-semibold text-sm">
                        Notifications
                      </span>
                      {unreadCount > 0 && <Badge>{unreadCount} unread</Badge>}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-app-border">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-brand-muted">
                          <Bell className="w-6 h-6 mb-2 opacity-30" />
                          <p className="text-xs">No notifications</p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => {
                          const Icon = notifTypeIcon[n.type] || Bell;
                          const tone = notifTypeTone[n.type] || 'text-brand-muted bg-app-bg';
                          return (
                            <div
                              key={n.id}
                              className={`flex gap-3 p-4 hover:bg-app-bg/50 transition-colors ${!n.isRead ? 'bg-brand-accent/5' : ''}`}
                            >
                              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', tone)}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-1">
                                  <p className={`text-sm font-medium ${!n.isRead ? '' : 'text-brand-muted'}`}>{n.title}</p>
                                  {!n.isRead && (
                                    <button
                                      onClick={() => markNotificationRead(n.id)}
                                      className="text-brand-accent hover:text-brand-accent/70 shrink-0"
                                      title="Mark as read"
                                    >
                                      <CheckCheck className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                                <p className="text-xs text-brand-muted mt-0.5 line-clamp-2">{n.message}</p>
                                <p className="text-[11px] text-brand-muted mt-1">{timeAgo(n.createdAt)}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="flex border-t border-app-border divide-x divide-app-border">
                      <button
                        className="flex-1 text-center text-sm text-brand-accent hover:bg-app-bg py-3 transition-colors font-medium"
                        onClick={handleMarkAllRead}
                      >
                        Mark all as read
                      </button>
                      <Link
                        href="/settings"
                        onClick={() => setNotifOpen(false)}
                        className="flex-1 text-center text-sm text-brand-muted hover:bg-app-bg py-3 transition-colors font-medium"
                      >
                        View all
                      </Link>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => {
                  setProfileOpen((o) => !o);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-3 pl-2 sm:pl-4 sm:border-l border-app-border rounded-full"
                aria-label="Account menu"
                aria-expanded={profileOpen}>
                
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium leading-tight">
                    {currentUser.firstName} {currentUser.lastName}
                  </div>
                  <div className="text-xs text-brand-muted">
                    {currentUser.role}
                  </div>
                </div>
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt=""
                    className="w-9 h-9 rounded-full border-2 border-app-border" />
                ) : (
                  <div className="w-9 h-9 rounded-full border-2 border-app-border bg-brand-accent text-white flex items-center justify-center text-sm font-bold">
                    {currentUser.firstName[0]}{currentUser.lastName[0]}
                  </div>
                )}
                
              </button>
              <AnimatePresence>
                {profileOpen &&
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                    scale: 0.98
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1
                  }}
                  exit={{
                    opacity: 0,
                    y: 8,
                    scale: 0.98
                  }}
                  transition={{
                    duration: 0.15
                  }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-app-surface border border-app-border shadow-glass overflow-hidden"
                  role="menu">
                  
                    <div className="px-4 py-3 border-b border-app-border">
                      <p className="text-sm font-medium truncate">
                        {currentUser.firstName} {currentUser.lastName}
                      </p>
                      <p className="text-xs text-brand-muted truncate">
                        {currentUser.email}
                      </p>
                    </div>
                    <div className="p-1.5">
                      <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-app-bg transition-colors"
                      role="menuitem">
                      
                        <UserIcon className="w-4 h-4 text-brand-muted" />
                        Profile
                      </Link>
                      <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-app-bg transition-colors"
                      role="menuitem">
                      
                        <Settings className="w-4 h-4 text-brand-muted" />
                        Settings
                      </Link>
                    </div>
                    <div className="p-1.5 border-t border-app-border">
                      <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 text-red-500 w-full transition-colors"
                      role="menuitem">
                      
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                }
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>

      {/* Floating AI assistant (managers only) */}
      <ChatWidget />
    </div>);

}