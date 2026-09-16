// src/components/admin/DashboardStats.jsx - Production Admin Metric Cards
'use client';

import { 
  FileText, CheckCircle2, Clock, Mail, Calendar, 
  AlertCircle, ArrowUpRight, Sparkles 
} from 'lucide-react';

export default function DashboardStats({
  publishedCount = 0,
  draftsCount = 0,
  unreadCount = 0,
  todaySubmissionsCount = 0,
  pendingInboxCount = 0,
  onNavigateTab
}) {
  const totalBlueprints = publishedCount + draftsCount;

  const cards = [
    {
      id: 'total-blueprints',
      label: 'Total Blueprints',
      value: totalBlueprints,
      subtext: `${publishedCount} active in live feed`,
      icon: FileText,
      iconColor: 'text-teal-400',
      bgColor: 'bg-teal-500/10 border-teal-500/20',
      action: () => onNavigateTab && onNavigateTab('blueprints')
    },
    {
      id: 'published-blueprints',
      label: 'Published Blueprints',
      value: publishedCount,
      subtext: 'Visible to public readers',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      action: () => onNavigateTab && onNavigateTab('blueprints')
    },
    {
      id: 'draft-blueprints',
      label: 'Draft Blueprints',
      value: draftsCount,
      subtext: draftsCount > 0 ? 'Pending editorial review' : 'No pending drafts',
      icon: Clock,
      iconColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      action: () => onNavigateTab && onNavigateTab('blueprints')
    },
    {
      id: 'new-messages',
      label: 'New Messages',
      value: unreadCount,
      subtext: unreadCount > 0 ? `${unreadCount} unread submissions` : 'All messages caught up',
      icon: Mail,
      iconColor: 'text-rose-400',
      bgColor: unreadCount > 0 ? 'bg-rose-500/15 border-rose-500/30' : 'bg-slate-800/40 border-slate-800',
      action: () => onNavigateTab && onNavigateTab('inbox'),
      isHighlight: unreadCount > 0
    },
    {
      id: 'today-submissions',
      label: "Today's Submissions",
      value: todaySubmissionsCount,
      subtext: 'Received in last 24h',
      icon: Calendar,
      iconColor: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 border-indigo-500/20',
      action: () => onNavigateTab && onNavigateTab('inbox')
    },
    {
      id: 'pending-inbox',
      label: 'Pending Inbox Items',
      value: pendingInboxCount,
      subtext: 'Requires founder review',
      icon: AlertCircle,
      iconColor: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/20',
      action: () => onNavigateTab && onNavigateTab('inbox')
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={card.action}
            className={`text-left p-4 rounded-2xl border transition-all hover:scale-102 hover:shadow-lg active:scale-98 relative group overflow-hidden ${card.bgColor} cursor-pointer`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl bg-slate-900/60 border border-slate-700/40 ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100" />
            </div>

            <div className="text-2xl font-black text-white tracking-tight">
              {card.value}
            </div>

            <div className="text-xs font-bold text-slate-200 mt-0.5 truncate">
              {card.label}
            </div>

            <div className="text-[10px] text-slate-400 mt-1 truncate">
              {card.subtext}
            </div>

            {card.isHighlight && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
