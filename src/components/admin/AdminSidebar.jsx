// src/components/admin/AdminSidebar.jsx - Collapsible & Responsive Admin Studio Sidebar
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, Inbox, FileText, Trash2, History, 
  ArrowLeft, Bell, BellOff, Volume2, VolumeX, Shield, 
  Menu, X, Sparkles, ChevronRight, Plus
} from 'lucide-react';
import StudentLogo from '../StudentLogo';

export default function AdminSidebar({
  activeTab = 'dashboard',
  onTabChange,
  unreadCount = 0,
  pendingCount = 0,
  trashCount = 0,
  onNewIdea,
  isMuted = false,
  onToggleMute,
  notificationPermission = 'default',
  onRequestNotificationPermission,
  userEmail = 'Founder Admin'
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      description: 'System velocity & overview'
    },
    {
      id: 'inbox',
      label: 'Inbox',
      icon: Inbox,
      badge: unreadCount > 0 ? unreadCount : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
      description: 'User submissions & messages'
    },
    {
      id: 'blueprints',
      label: 'Blueprints',
      icon: FileText,
      badge: null,
      description: 'Live & draft blueprints'
    },
    {
      id: 'trash',
      label: 'Trash & Restore',
      icon: Trash2,
      badge: trashCount > 0 ? trashCount : null,
      badgeColor: 'bg-slate-700 text-slate-300',
      description: 'Soft-deleted items'
    },
    {
      id: 'activity',
      label: 'Activity Log',
      icon: History,
      badge: null,
      description: 'Audit trail of admin events'
    }
  ];

  const handleSelectTab = (id) => {
    onTabChange(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Navbar with Hamburger */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <StudentLogo size="sm" showTagline={false} className="text-white" />
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => onTabChange('inbox')}
              className="relative p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold flex items-center gap-1"
            >
              <Inbox className="w-4 h-4" />
              <span>{unreadCount}</span>
            </button>
          )}

          <button
            onClick={onNewIdea}
            className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen lg:z-30
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <StudentLogo size="sm" showTagline={false} className="text-white" />
            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-400">Founder Studio</span>
              <span className="text-[10px] text-slate-400 font-mono">v2.4 Production</span>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Action: New Blueprint */}
        <div className="p-3">
          <button
            onClick={() => { onNewIdea(); setMobileOpen(false); }}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Blueprint</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== null && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-400" />}
                </div>
              </button>
            );
          })}
        </nav>
{/* Recommended Resources Link */}
<Link href="/admin/recommended-resources" className="block">
  <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer hover:bg-slate-800/80 hover:text-white">
    <div className="flex items-center gap-2.5">
      <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
      <span>Recommended Resources</span>
    </div>
    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
  </button>
</Link>

        {/* Quick Tools & Controls */}
        <div className="p-3 border-t border-slate-800 space-y-2 text-xs">
          {/* Audio & Notification Toggles */}
          <div className="bg-slate-950/60 rounded-xl p-2 flex items-center justify-between border border-slate-800/60">
            <button
              onClick={onToggleMute}
              className={`p-1.5 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                isMuted ? 'text-slate-500 hover:text-slate-300' : 'text-teal-400 hover:text-teal-300'
              }`}
              title={isMuted ? 'Sound alerts muted. Click to unmute.' : 'Sound alerts active. Click to mute.'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMuted ? 'Muted' : 'Sound On'}</span>
            </button>

            {notificationPermission !== 'granted' && (
              <button
                onClick={onRequestNotificationPermission}
                className="text-[10px] bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/20 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                title="Enable desktop browser notifications"
              >
                <Bell className="w-3 h-3" />
                <span>Notify</span>
              </button>
            )}
            {notificationPermission === 'granted' && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live
              </span>
            )}
          </div>

          {/* Exit Link */}
          <Link
            href="/"
            className="w-full flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors text-xs font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit to Public Feed</span>
          </Link>

          {/* Admin User Badge */}
          <div className="px-2 pt-1 flex items-center gap-2 text-[10px] text-slate-500 truncate">
            <Shield className="w-3 h-3 text-teal-500 flex-shrink-0" />
            <span className="truncate font-mono">{userEmail}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
