"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card, Button, Input } from '../components/ui';
import { User, Bell, Shield, Palette, CheckCheck, Trash2, AlertTriangle, Megaphone, Eye, EyeOff } from 'lucide-react';

type Tab = 'profile' | 'notifications' | 'security' | 'appearance';

export function Settings() {
  const {
    currentUser, theme, toggleTheme, updateUserProfile, addToast,
    notifications, fetchNotifications, markAllNotificationsRead, markNotificationRead, deleteNotification
  } = useStore();

  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile form
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Security form
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [securitySaving, setSecuritySaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [securityError, setSecurityError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '',
        department: currentUser.department || ''
      });
    }
  }, [currentUser]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleProfileSave = async () => {
    if (!currentUser) return;
    setProfileSaving(true);
    const res = await updateUserProfile(currentUser.id, formData);
    setProfileSaving(false);
    if (res.ok) {
      addToast({ title: 'Profile updated successfully', type: 'success' });
    } else {
      addToast({ title: 'Update failed', description: res.error, type: 'error' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    if (!securityData.newPassword || securityData.newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters.');
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      setSecurityError('Passwords do not match.');
      return;
    }
    if (!currentUser) return;
    setSecuritySaving(true);
    const res = await updateUserProfile(currentUser.id, { password: securityData.newPassword } as any);
    setSecuritySaving(false);
    if (res.ok) {
      addToast({ title: 'Password changed successfully', type: 'success' });
      setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setSecurityError(res.error || 'Failed to change password.');
      addToast({ title: 'Password change failed', description: res.error, type: 'error' });
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    addToast({ title: 'All notifications marked as read', type: 'success' });
  };

  if (!currentUser) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const tabs: { id: Tab; label: string; Icon: React.ComponentType<{className?: string}> }[] = [
    { id: 'profile', label: 'Profile', Icon: User },
    { id: 'notifications', label: 'Notifications', Icon: Bell },
    { id: 'security', label: 'Security', Icon: Shield },
    { id: 'appearance', label: 'Appearance', Icon: Palette },
  ];

  const notifTypeIcon: Record<string, React.ComponentType<{className?: string}>> = {
    warning: AlertTriangle,
    info: Megaphone,
    success: CheckCheck,
    error: AlertTriangle,
  };
  const notifTypeTone: Record<string, string> = {
    warning: 'text-yellow-500 bg-yellow-500/10',
    info: 'text-brand-accent bg-brand-accent/10',
    success: 'text-green-500 bg-green-500/10',
    error: 'text-red-500 bg-red-500/10',
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-brand-muted mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar tabs */}
        <div className="space-y-1">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === id
                  ? 'bg-brand-accent/10 text-brand-accent'
                  : 'text-brand-muted hover:bg-app-bg hover:text-app-text'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-brand-accent text-white text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="md:col-span-3 space-y-6">

          {/* ── Profile Tab ── */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-lg">Profile Information</h3>
              <div className="flex items-start gap-6 mb-6">
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt=""
                    className="w-20 h-20 rounded-full border-2 border-app-border" />
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-app-border bg-brand-accent text-white flex items-center justify-center text-3xl font-bold">
                    {currentUser.firstName[0]}{currentUser.lastName[0]}
                  </div>
                )}
                <div>
                  <Button variant="outline" size="sm" className="mb-2">
                    Change Avatar
                  </Button>
                  <p className="text-xs text-brand-muted">
                    JPG, GIF or PNG. Max size of 800K
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Last name"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    type="email"
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="e.g. Engineering"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Input value={currentUser.role} disabled />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={handleProfileSave} disabled={profileSaving}>
                  {profileSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === 'notifications' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Notifications</h3>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                    <CheckCheck className="w-4 h-4 mr-2" />
                    Mark All as Read
                  </Button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-brand-muted">
                  <Bell className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {notifications.map((notif) => {
                    const Icon = notifTypeIcon[notif.type] || Bell;
                    const tone = notifTypeTone[notif.type] || 'text-brand-muted bg-app-bg';
                    const timeAgo = (() => {
                      const diff = Date.now() - new Date(notif.createdAt).getTime();
                      const mins = Math.floor(diff / 60000);
                      const hrs = Math.floor(mins / 60);
                      const days = Math.floor(hrs / 24);
                      if (days > 0) return `${days}d ago`;
                      if (hrs > 0) return `${hrs}h ago`;
                      return `${mins}m ago`;
                    })();
                    return (
                      <div
                        key={notif.id}
                        className={`flex gap-3 p-4 rounded-xl border transition-colors ${
                          notif.isRead
                            ? 'border-app-border bg-transparent opacity-60'
                            : 'border-brand-accent/20 bg-brand-accent/5'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${tone}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-medium ${!notif.isRead ? '' : 'text-brand-muted'}`}>
                              {notif.title}
                            </p>
                            <span className="text-[11px] text-brand-muted shrink-0">{timeAgo}</span>
                          </div>
                          <p className="text-xs text-brand-muted mt-0.5">{notif.message}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {!notif.isRead && (
                            <button
                              onClick={() => markNotificationRead(notif.id)}
                              title="Mark as read"
                              className="p-1.5 rounded-lg hover:bg-app-bg text-brand-muted hover:text-brand-accent transition-colors"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            title="Delete"
                            className="p-1.5 rounded-lg hover:bg-app-bg text-brand-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {/* ── Security Tab ── */}
          {activeTab === 'security' && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-lg">Change Password</h3>
              <p className="text-sm text-brand-muted mb-6">
                Choose a strong password and don't reuse it for other accounts.
              </p>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <div className="relative">
                    <Input
                      type={showCurrentPw ? 'text' : 'password'}
                      value={securityData.currentPassword}
                      onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                      placeholder="••••••••"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-app-text"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Input
                      type={showNewPw ? 'text' : 'password'}
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                      placeholder="Min. 6 characters"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-app-text"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                    placeholder="Repeat new password"
                  />
                </div>
                {securityError && (
                  <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 rounded-lg px-3 py-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {securityError}
                  </div>
                )}
                <div className="pt-2">
                  <Button type="submit" disabled={securitySaving}>
                    {securitySaving ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-app-border">
                <h4 className="font-medium text-sm mb-2">Session</h4>
                <p className="text-xs text-brand-muted mb-4">
                  You are currently logged in as <strong>{currentUser.email}</strong>
                </p>
                <div className="flex items-center gap-3 text-xs text-brand-muted bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg w-fit">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Active session
                </div>
              </div>
            </Card>
          )}

          {/* ── Appearance Tab ── */}
          {activeTab === 'appearance' && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4 text-lg">Appearance</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-xl border border-app-border">
                  <div>
                    <p className="font-medium text-sm">Theme Preference</p>
                    <p className="text-xs text-brand-muted mt-1">
                      Toggle between light and dark mode.
                    </p>
                  </div>
                  <Button variant="outline" onClick={toggleTheme}>
                    Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-app-border">
                  <div>
                    <p className="font-medium text-sm">Current Theme</p>
                    <p className="text-xs text-brand-muted mt-1">
                      Active: <span className="capitalize font-medium">{theme}</span> mode
                    </p>
                  </div>
                  <div className={`w-10 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-brand-accent' : 'bg-app-border'} relative`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>
              </div>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}