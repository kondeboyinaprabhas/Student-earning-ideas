// src/app/admin/page.js - Complete Production Founder Admin Studio
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

import { 
  Plus, Edit3, Trash2, Eye, Share2, History, Check, 
  ArrowLeft, RefreshCw, LayoutGrid, Calendar, Layers, ShieldCheck, 
  Save, Send, ExternalLink, Inbox, FileText, Bell, Volume2, VolumeX,
  Clock, RotateCcw, Archive, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react';
import AdminAuth from '@/components/admin/AdminAuth';

// Default empty form data used for initializing and resetting form state
const emptyFormData = {
  id: '',
  slug: '',
  title: '',
  subtitle: '',
  category: 'Online Business',
  categoryColor: 'emerald',
  heroImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80',
  carouselImages: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80'],
  likes: 0,
  investment: '₹0–₹500',
  estimatedProfit: '₹15,000–₹40,000 / mo',
  profitMargin: '40–80%',
  paybackPeriod: '7 Days',
  difficulty: 'Beginner',
  timeRequired: '1–2 hrs / day',
  tags: ['Online', 'Beginner'],
  summary: '',
  howItWorks: [
    'Understand student customer demand and identify a niche.',
    'Set up free digital tools and create initial proof of concept.',
    'Connect with buyers and collect direct UPI payments.'
  ],
  implementationSteps: [
    { step: 1, title: 'Niche Research', detail: 'Identify demand within campus or online.', proTip: 'Survey peers.' },
    { step: 2, title: 'Build Proof-of-Work', detail: 'Create 3 sample deliverables.', proTip: 'Host on Drive.' },
    { step: 3, title: 'Direct Outreach', detail: 'Contact first 10 clients directly.', proTip: 'Personalize messages.' },
    { step: 4, title: 'Fulfillment & UPI Pay', detail: 'Deliver quality on time.', proTip: 'Accept UPI.' },
    { step: 5, title: 'Scale with Testimonials', detail: 'Ask clients for word-of-mouth.', proTip: 'Offer referrals.' }
  ],
  risks: [
    { risk: 'Competition from generic sellers', mitigation: 'Focus on niche campus or regional localization.' }
  ],
  checklist: [
    { id: 'chk_1', text: 'Set up digital accounts and payment method', completed: false },
    { id: 'chk_2', text: 'Create 3 high quality free samples', completed: false },
    { id: 'chk_3', text: 'Pitch 10 prospective buyers on WhatsApp', completed: false }
  ],
  startupPlanner: [
    { item: 'Essential Free Software (Canva, Notion)', cost: 0, isFree: true, essential: true },
    { item: 'Smartphone / Laptop with Internet', cost: 0, isFree: true, essential: true },
    { item: 'Payment / UPI Setup', cost: 0, isFree: true, essential: true }
  ],
  relatedIdeaSlugs: [],
  canonicalUrl: '',
  seoTitle: '',
  metaDescription: ''
};

// Admin Subcomponents
import AdminSidebar from '@/components/admin/AdminSidebar';
import DashboardStats from '@/components/admin/DashboardStats';
import InboxView from '@/components/admin/InboxView';
import BlueprintsListView from '@/components/admin/BlueprintsListView';
import TrashView from '@/components/admin/TrashView';
import ActivityLog from '@/components/admin/ActivityLog';
import ProductionHealthDashboard from '@/components/admin/ProductionHealthDashboard';
import ImageProcessorStudio from '@/components/admin/ImageProcessorStudio';
import LiveMobilePreview from '@/components/admin/LiveMobilePreview';
import LiveSeoIntelligence from '@/components/admin/LiveSeoIntelligence';
import ContentQualityGuard, { runQualityGuardCheck } from '@/components/admin/ContentQualityGuard';
import BrokenLinkScanner from '@/components/admin/BrokenLinkScanner';
import PreLaunchTestingAudit from '@/components/admin/PreLaunchTestingAudit';
import VersionHistoryModal from '@/components/admin/VersionHistoryModal';
import MaintenanceControl from '@/components/admin/MaintenanceControl';
import AnonymousAnalyticsView from '@/components/admin/AnonymousAnalyticsView';
import AdminPushBroadcast from '@/components/admin/AdminPushBroadcast';
import Toast from '@/components/Toast';

// Store & Firebase
import { 
  getPublishedIdeas, savePublishedIdea, deletePublishedIdea,
  getDraftIdeas, saveDraftIdea, removeDraftIdea,
  getScheduledIdeas, saveScheduledIdea,
  getTrashIdeas, softDeleteIdea, restoreIdea, permanentDeleteIdea,
  unpublishIdea
} from '@/lib/ideasStore';
import { CATEGORIES } from '@/lib/seedData';
import { db } from '@/lib/firebase';
import { auth, ADMIN_EMAILS } from '@/lib/firebaseAuth';
import { 
  COLLECTIONS, logAdminAction
} from '@/lib/firestoreStore';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  playNotificationSound, 
  requestNotificationPermission, 
  sendBrowserNotification,
  isSoundMuted, 
  setSoundMuted 
} from '@/lib/notifications';

export default function AdminPage() {
  // Navigation: 'dashboard' | 'inbox' | 'blueprints' | 'editor' | 'trash' | 'activity'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Ideas State
  const [publishedIdeas, setPublishedIdeas] = useState([]);
  const [draftIdeas, setDraftIdeas] = useState([]);
  const [scheduledIdeas, setScheduledIdeas] = useState([]);
  const [trashIdeas, setTrashIdeas] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Submissions State (from Firestore)
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [todaySubmissionsCount, setTodaySubmissionsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Activity Logs (from Firestore)
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);

  // Sound & Notification preferences
  const [isMuted, setIsMuted] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Editor State (18 Fields)
  const [formData, setFormData] = useState(emptyFormData);
  const [versionModalOpen, setVersionModalOpen] = useState(false);
  const [selectedIdeaForVersion, setSelectedIdeaForVersion] = useState(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');

  // Toast Helper
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Sync Local Ideas Data
  const refreshLocalData = useCallback(async () => {
    setPublishedIdeas(await getPublishedIdeas());
    setDraftIdeas(getDraftIdeas());
    setScheduledIdeas(getScheduledIdeas());
    setTrashIdeas(getTrashIdeas());
  }, []);

  // Initial load & listeners
  useEffect(() => {
    refreshLocalData();
    setIsMuted(isSoundMuted());

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [refreshLocalData]);

  // Firestore Real-Time Submissions & Activity Log Listeners
  // Guarded by onAuthStateChanged — listeners only start after admin auth is confirmed
  useEffect(() => {
    if (typeof window === 'undefined' || !db || !auth) return;

    let unsubSubmissions = null;
    let unsubLogs = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Tear down any existing listeners when auth state changes
      if (unsubSubmissions) { unsubSubmissions(); unsubSubmissions = null; }
      if (unsubLogs) { unsubLogs(); unsubLogs = null; }

      // Only attach admin-only listeners for confirmed admin users
      const isAdmin = user && ADMIN_EMAILS.some(
        (e) => e === (user.email || '').toLowerCase()
      );
      if (!isAdmin) {
        setSubmissionsLoading(false);
        setLogsLoading(false);
        return;
      }

      let initialLoadDone = false;

      try {
        // 1. Submissions Listener
        const subQuery = query(
          collection(db, COLLECTIONS.SUBMISSIONS),
          orderBy('createdAt', 'desc')
        );

        unsubSubmissions = onSnapshot(subQuery, (snap) => {
          const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setSubmissions(docs);
          setSubmissionsLoading(false);

          // Counts
          const unread = docs.filter(s => !s.deleted && !s.read).length;
          setUnreadCount(unread);

          const pending = docs.filter(s => !s.deleted && s.status === 'New').length;
          setPendingCount(pending);

          // Today's Submissions count
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);
          const today = docs.filter(s => {
            if (s.deleted) return false;
            let t = 0;
            if (s.createdAt?.seconds) t = s.createdAt.seconds * 1000;
            else if (s.createdAt) t = new Date(s.createdAt).getTime();
            return t >= startOfDay.getTime();
          }).length;
          setTodaySubmissionsCount(today);

          // Real-time audio chime & browser notification for new items
          if (initialLoadDone) {
            snap.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const newDoc = change.doc.data();
                playNotificationSound();
                sendBrowserNotification('New Student Submission!', {
                  body: `${newDoc.name || 'Anonymous'}: ${newDoc.title || newDoc.type || 'New submission'}`,
                });
                showToast(`🔔 New submission received from ${newDoc.name || 'a student'}!`);
              }
            });
          }
          initialLoadDone = true;
        }, (err) => {
          console.warn('[Firestore] Submissions listener error:', err);
          setSubmissionsLoading(false);
        });

        // 2. Activity Logs Listener
        const logsQuery = query(
          collection(db, COLLECTIONS.ACTIVITY_LOG),
          orderBy('timestamp', 'desc'),
          limit(60)
        );

        unsubLogs = onSnapshot(logsQuery, (snap) => {
          const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setActivityLogs(logs);
          setLogsLoading(false);
        }, (err) => {
          console.warn('[Firestore] Activity log listener error:', err);
          setLogsLoading(false);
        });
      } catch (e) {
        console.warn('[Firestore] Subscription setup error:', e);
      }
    });

    return () => {
      unsubAuth();
      if (unsubSubmissions) unsubSubmissions();
      if (unsubLogs) unsubLogs();
    };
  }, [showToast]);

  // Log an admin event to Firestore
  const handleLogAction = useCallback(async ({ action, entityId, entityType, adminEmail, details }) => {
    await logAdminAction({
      action,
      entityId: entityId || '',
      entityType: entityType || 'Admin',
      adminEmail: adminEmail || 'kondeboyinaprabhas@gmail.com',
      details: details || ''
    });
  }, []);

  // Sound toggle
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    setSoundMuted(next);
    if (!next) {
      playNotificationSound();
    }
  };

  // Browser notification request
  const handleRequestNotificationPermission = async () => {
    const res = await requestNotificationPermission();
    setNotificationPermission(res);
    if (res === 'granted') {
      sendBrowserNotification('Notifications Active', { body: 'You will receive desktop alerts for new student submissions.' });
      showToast('Browser notifications enabled!');
    } else {
      showToast('Notification permission not granted.');
    }
  };

  // Editor Actions
  const handleNewIdea = () => {
    setIsEditingExisting(false);
    const newId = `idea_${Date.now()}`;
    setFormData({
      ...emptyFormData,
      id: newId,
      likes: 0,
    });
    setActiveTab('editor');
  };

  const handleEditIdea = (idea) => {
    setIsEditingExisting(true);
    setFormData({
      ...emptyFormData,
      ...idea,
      likes: typeof idea.likes === 'number' ? idea.likes : 0,
      howItWorks: idea.howItWorks?.length ? idea.howItWorks : (idea.breakdown?.howItWorks || []),
      summary: idea.summary || idea.breakdown?.summary || '',
      seoTitle: idea.seoTitle ?? '',
      metaDescription: idea.metaDescription ?? ''
    });
    setActiveTab('editor');
  };



  // Publish validation and action
  const handlePublish = async (adminEmail = 'Founder Admin') => {
    const { canPublish, issues } = runQualityGuardCheck(formData, publishedIdeas);
    if (!canPublish) {
      alert(`Cannot publish yet. Please fix blocking issues:\n\n${issues.filter(i => i.critical).map(i => `• ${i.message}`).join('\n')}`);
      return;
    }

    const autoSlug = formData.slug || formData.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

    const rawHiw = Array.isArray(formData.howItWorks)
      ? formData.howItWorks
      : typeof formData.howItWorks === 'string'
        ? formData.howItWorks.split('\n')
        : [];
    const cleanHiw = rawHiw
      .map(l => (typeof l === 'string' ? l.replace(/^\d+[.)\s]+/, '').trim() : l))
      .filter(Boolean);

    const finalIdea = {
      ...formData,
      slug: autoSlug,
      status: 'Published',
      likes: typeof formData.likes === 'number' ? formData.likes : 0,
      breakdown: {
        summary: formData.summary || formData.subtitle,
        // Use explicitly entered/parsed howItWorks when available; fall back to generating from steps
        howItWorks: cleanHiw.length
          ? cleanHiw
          : formData.implementationSteps?.map(s => `${s.title}: ${s.detail}`) || [],
        bestFor: `Students interested in ${formData.category} with zero upfront capital.`
      }
    };

    await savePublishedIdea(finalIdea);
    await refreshLocalData();
    handleLogAction({
      action: 'Publish',
      entityId: finalIdea.id,
      entityType: 'Blueprint',
      adminEmail,
      details: `Published "${finalIdea.title}" live to feed`
    });

    // Part 12: Trigger non-blocking push notification to subscribed students
    fetch('/api/admin/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `🔥 New Blueprint: ${finalIdea.title}`,
        message: finalIdea.summary || finalIdea.subtitle || `Explore the complete ${finalIdea.category} blueprint now.`,
        url: `/idea/${finalIdea.slug}`,
        type: 'blueprint',
        adminEmail,
      }),
    }).catch((err) => {
      console.warn('[Push Hook] Failed to send blueprint push notification:', err);
    });

    showToast("Blueprint published live to website feed!");
    setActiveTab('blueprints');
  };

  // Save Draft
  const handleSaveDraft = (adminEmail = 'Founder Admin') => {
    saveDraftIdea({ ...formData, status: 'Draft', likes: typeof formData.likes === 'number' ? formData.likes : 0 });
    refreshLocalData();
    handleLogAction({
      action: isEditingExisting ? 'Edit' : 'Create',
      entityId: formData.id,
      entityType: 'Blueprint',
      adminEmail,
      details: `Saved draft: "${formData.title || 'Untitled'}"`
    });
    showToast("Saved as draft blueprint.");
  };

  // Schedule Post
  const handleSchedule = (adminEmail = 'Founder Admin') => {
    if (!scheduledDate) {
      alert('Please select a date and time to schedule this blueprint.');
      return;
    }
    saveScheduledIdea({ ...formData, likes: typeof formData.likes === 'number' ? formData.likes : 0 }, scheduledDate);
    refreshLocalData();
    handleLogAction({
      action: 'Schedule',
      entityId: formData.id,
      entityType: 'Blueprint',
      adminEmail,
      details: `Scheduled "${formData.title}" for ${new Date(scheduledDate).toLocaleString()}`
    });
    showToast(`Blueprint scheduled for ${new Date(scheduledDate).toLocaleString()}!`);
    setActiveTab('blueprints');
  };

  // Unpublish
  const handleUnpublishIdea = async (id, adminEmail = 'Founder Admin') => {
    await unpublishIdea(id);
    await refreshLocalData();
    handleLogAction({
      action: 'Unpublish',
      entityId: id,
      entityType: 'Blueprint',
      adminEmail,
      details: `Unpublished blueprint and moved to drafts`
    });
    showToast("Blueprint unpublished and moved to drafts.");
  };

  // Soft Delete
  const handleSoftDeleteIdea = async (id, origin = 'published', adminEmail = 'Founder Admin') => {
    await softDeleteIdea(id, origin);
    await refreshLocalData();
    handleLogAction({
      action: 'Soft Delete',
      entityId: id,
      entityType: 'Blueprint',
      adminEmail,
      details: `Moved blueprint to trash`
    });
    showToast("Blueprint moved to Trash.");
  };

  // Restore Idea
  const handleRestoreIdea = async (id, adminEmail = 'Founder Admin') => {
    await restoreIdea(id);
    await refreshLocalData();
    handleLogAction({
      action: 'Restore',
      entityId: id,
      entityType: 'Blueprint',
      adminEmail,
      details: `Restored blueprint from trash`
    });
    showToast("Blueprint restored successfully.");
  };

  // Permanent Delete
  const handlePermanentDeleteIdea = async (id, adminEmail = 'Founder Admin') => {
    await permanentDeleteIdea(id);
    await refreshLocalData();
    handleLogAction({
      action: 'Permanent Delete',
      entityId: id,
      entityType: 'Blueprint',
      adminEmail,
      details: `Permanently destroyed blueprint`
    });
    showToast("Blueprint permanently deleted.");
  };

  // Version History Modal Handlers
  const handleOpenVersions = (idea) => {
    setSelectedIdeaForVersion(idea);
    setVersionModalOpen(true);
  };

  const handleRollback = async (snapshot) => {
    await savePublishedIdea(snapshot);
    await refreshLocalData();
    showToast(`Successfully rolled back to snapshot!`);
  };

  // Soft-deleted submissions count
  const trashSubmissions = useMemo(() => {
    return submissions.filter(s => s.deleted);
  }, [submissions]);

  return (
    <AdminAuth>
      {({ user, adminEmail }) => (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row font-sans">
          <Toast message={toastMessage} />

          {/* Collapsible & Responsive Studio Sidebar */}
          <AdminSidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            unreadCount={unreadCount}
            pendingCount={pendingCount}
            trashCount={trashIdeas.length + trashSubmissions.length}
            onNewIdea={handleNewIdea}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            notificationPermission={notificationPermission}
            onRequestNotificationPermission={handleRequestNotificationPermission}
            userEmail={adminEmail}
          />

          {/* Main Studio Viewport */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* Top Bar for Desktop */}
            <header className="hidden lg:flex bg-slate-900 border-b border-slate-800 px-6 py-3 items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Admin Studio
                </span>
                <span className="text-slate-700">•</span>
                <span className="text-xs text-teal-400 font-bold capitalize">
                  {activeTab === 'blueprints' ? 'Blueprints Studio' : activeTab} View
                </span>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => setActiveTab('inbox')}
                    className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 animate-pulse"
                  >
                    <Inbox className="w-3.5 h-3.5" />
                    <span>{unreadCount} Unread Submissions</span>
                  </button>
                )}

                <button
                  onClick={handleNewIdea}
                  className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Idea</span>
                </button>
              </div>
            </header>

            {/* Dynamic View Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
              
              {/* TAB 1: DASHBOARD */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Live Metric Cards */}
                  <DashboardStats
                    publishedCount={publishedIdeas.length}
                    draftsCount={draftIdeas.length}
                    unreadCount={unreadCount}
                    todaySubmissionsCount={todaySubmissionsCount}
                    pendingInboxCount={pendingCount}
                    onNavigateTab={setActiveTab}
                  />

                  {/* Production Health & Platform Audits */}
                  <ProductionHealthDashboard
                    publishedCount={publishedIdeas.length}
                    draftsCount={draftIdeas.length}
                    scheduledCount={scheduledIdeas.length}
                    ideas={publishedIdeas}
                    onNewIdeaClick={handleNewIdea}
                  />

                  {/* Recent Activity Quick Feed */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-teal-400" />
                        <h3 className="text-sm font-bold text-white">Recent Founder Activity</h3>
                      </div>
                      <button
                        onClick={() => setActiveTab('activity')}
                        className="text-xs text-teal-400 hover:underline flex items-center gap-1"
                      >
                        <span>View Full Log</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                    {activityLogs.slice(0, 4).map((log, i) => (
                      <div key={log.id || i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-300">{log.action}:</span>
                          <span className="text-slate-400 truncate max-w-xs sm:max-w-md">{log.details}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {log.timestamp?.seconds ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Diagnostics & Controls */}
                  <BrokenLinkScanner ideas={publishedIdeas} />
                  <PreLaunchTestingAudit ideas={publishedIdeas} />
                  <AnonymousAnalyticsView />
                  <MaintenanceControl />
                </div>
              )}

              {/* TAB 2: INBOX */}
              {activeTab === 'inbox' && (
                <div className="animate-in fade-in">
                  <InboxView
                    submissions={submissions}
                    loading={submissionsLoading}
                    onRefresh={() => {}}
                    onLogAction={handleLogAction}
                    adminEmail={adminEmail}
                  />
                </div>
              )}

              {/* TAB 3: BLUEPRINTS */}
              {activeTab === 'blueprints' && (
                <div className="animate-in fade-in">
                  <BlueprintsListView
                    publishedIdeas={publishedIdeas}
                    draftIdeas={draftIdeas}
                    scheduledIdeas={scheduledIdeas}
                    onNewIdea={handleNewIdea}
                    onEditIdea={handleEditIdea}
                    onOpenVersions={handleOpenVersions}
                    onUnpublishIdea={(id) => handleUnpublishIdea(id, adminEmail)}
                    onPublishDraft={(draft) => {
                      handleEditIdea(draft);
                      showToast("Loaded draft into editor for final publish review.");
                    }}
                    onSoftDeleteIdea={(id, origin) => handleSoftDeleteIdea(id, origin, adminEmail)}
                    onRefresh={refreshLocalData}
                  />
                </div>
              )}

              {/* TAB 4: TRASH & RESTORE */}
              {activeTab === 'trash' && (
                <div className="animate-in fade-in">
                  <TrashView
                    trashIdeas={trashIdeas}
                    trashSubmissions={trashSubmissions}
                    onRestoreIdea={(id) => handleRestoreIdea(id, adminEmail)}
                    onPermanentDeleteIdea={(id) => handlePermanentDeleteIdea(id, adminEmail)}
                    onRefresh={() => { refreshLocalData(); }}
                    onLogAction={handleLogAction}
                    adminEmail={adminEmail}
                  />
                </div>
              )}

              {/* TAB 5: ACTIVITY LOG */}
              {activeTab === 'activity' && (
                <div className="animate-in fade-in">
                  <ActivityLog
                    activities={activityLogs}
                    loading={logsLoading}
                    onRefresh={() => {}}
                  />
                </div>
              )}

              {/* TAB 6: PUSH BROADCAST */}
              {activeTab === 'notifications' && (
                <div className="animate-in fade-in">
                  <AdminPushBroadcast
                    adminEmail={adminEmail}
                    showToast={showToast}
                  />
                </div>
              )}

              {/* TAB 7: BLUEPRINT EDITOR */}
              {activeTab === 'editor' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
                  {/* Left Column: Editor & Tooling (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* Top Switcher back to Blueprints */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setActiveTab('blueprints')}
                        className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Blueprints List</span>
                      </button>
                      {isEditingExisting && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                          Editing: {formData.title || 'Existing Idea'}
                        </span>
                      )}
                    </div>



                    {/* 2. Client-Side 16:9 Image Processing Studio */}
                    <ImageProcessorStudio
                      heroImage={formData.heroImage}
                      carouselImages={formData.carouselImages}
                      onUpdateImages={({ heroImage, carouselImages }) => {
                        setFormData(prev => ({ ...prev, heroImage, carouselImages }));
                      }}
                    />

                    {/* 3. Core 18 Editor Fields */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span>Blueprint Details & Content</span>
                          {isEditingExisting && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                              Editing Existing
                            </span>
                          )}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setVersionModalOpen(true)}
                          className="text-xs text-teal-400 hover:underline flex items-center gap-1"
                        >
                          <History className="w-3.5 h-3.5" /> Versions
                        </button>
                      </div>

                      {/* Title & Slug */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Main Title *</label>
                          <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Festival Camera Rental Portrait Service"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Subtitle / Tagline *</label>
                          <textarea
                            rows="2"
                            value={formData.subtitle}
                            onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                            placeholder="e.g. Design t-shirts, mugs and more. Sell them online without holding any stock."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>

                      {/* Category & Investment Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Category *</label>
                          <input
                            type="text"
                            list="admin-category-options"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            placeholder="e.g. Digital Business, Campus Gigs..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-teal-500"
                          />
                          <datalist id="admin-category-options">
                            {CATEGORIES.filter(c => c !== 'All').map(c => (
                              <option key={c} value={c} />
                            ))}
                          </datalist>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Initial Investment *</label>
                          <input
                            type="text"
                            value={formData.investment}
                            onChange={e => setFormData({ ...formData, investment: e.target.value })}
                            placeholder="e.g. ₹0 or ₹0–₹500"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-emerald-400 font-bold outline-none focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Estimated Monthly Profit *</label>
                          <input
                            type="text"
                            value={formData.estimatedProfit}
                            onChange={e => setFormData({ ...formData, estimatedProfit: e.target.value })}
                            placeholder="e.g. ₹15,000–₹40,000 / mo"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Payback Period</label>
                          <input
                            type="text"
                            value={formData.paybackPeriod}
                            onChange={e => setFormData({ ...formData, paybackPeriod: e.target.value })}
                            placeholder="e.g. Instant upon sale or 7 Days"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Difficulty Level</label>
                          <select
                            value={formData.difficulty}
                            onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-teal-500 cursor-pointer"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Time Required</label>
                          <input
                            type="text"
                            value={formData.timeRequired}
                            onChange={e => setFormData({ ...formData, timeRequired: e.target.value })}
                            placeholder="e.g. 1–2 hrs / day"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>

                      {/* Idea Breakdown Summary */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">💡 Idea Breakdown Summary *</label>
                        <textarea
                          rows="3"
                          value={formData.summary}
                          onChange={e => setFormData({ ...formData, summary: e.target.value })}
                          placeholder="Detailed explanation of how the business model works..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-teal-500"
                        />
                      </div>

                      {/* How It Works — add/remove points */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-xs font-bold text-slate-300">⚙️ How It Works</label>
                          <button
                            type="button"
                            onClick={() => {
                              const hiw = Array.isArray(formData.howItWorks) ? formData.howItWorks : [];
                              setFormData({ ...formData, howItWorks: [...hiw, ''] });
                            }}
                            className="text-[10px] font-bold text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-2 py-1 rounded-lg transition-all flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Point
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(Array.isArray(formData.howItWorks) ? formData.howItWorks : []).map((point, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[10px] flex items-center justify-center shrink-0">{idx + 1}</span>
                              <input
                                type="text"
                                value={point || ''}
                                onChange={e => {
                                  const updated = [...formData.howItWorks];
                                  updated[idx] = e.target.value;
                                  setFormData({ ...formData, howItWorks: updated });
                                }}
                                placeholder={`Point ${idx + 1}...`}
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-teal-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.howItWorks.filter((_, i) => i !== idx);
                                  setFormData({ ...formData, howItWorks: updated });
                                }}
                                className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-500/10 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {(!Array.isArray(formData.howItWorks) || formData.howItWorks.length === 0) && (
                            <p className="text-[10px] text-slate-600 text-center py-2">No points yet. Click &quot;Add Point&quot; to begin.</p>
                          )}
                        </div>
                      </div>

                      {/* Implementation Steps — add/remove/edit */}
                      <div className="border-t border-slate-800 pt-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                            Implementation Steps ({(formData.implementationSteps || []).length})
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              const steps = formData.implementationSteps || [];
                              const newStep = { step: steps.length + 1, title: '', detail: '', proTip: '' };
                              setFormData({ ...formData, implementationSteps: [...steps, newStep] });
                            }}
                            className="text-[10px] font-bold text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-2 py-1 rounded-lg transition-all flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Step
                          </button>
                        </div>
                        {(formData.implementationSteps || []).map((st, idx) => (
                          <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <input
                                type="text"
                                value={st.title || ''}
                                onChange={e => {
                                  const updated = [...(formData.implementationSteps || [])];
                                  updated[idx] = { ...updated[idx], title: e.target.value };
                                  setFormData({ ...formData, implementationSteps: updated });
                                }}
                                placeholder={`Step ${idx + 1} Title`}
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (formData.implementationSteps || []).filter((_, i) => i !== idx);
                                  setFormData({ ...formData, implementationSteps: updated });
                                }}
                                className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-500/10 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <textarea
                              rows="2"
                              value={st.detail || ''}
                              onChange={e => {
                                const updated = [...(formData.implementationSteps || [])];
                                updated[idx] = { ...updated[idx], detail: e.target.value };
                                setFormData({ ...formData, implementationSteps: updated });
                              }}
                              placeholder={`Step ${idx + 1} full details...`}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 outline-none focus:border-teal-500"
                            />
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-amber-400 font-bold shrink-0">💡 Pro Tip:</span>
                              <input
                                type="text"
                                value={st.proTip || ''}
                                onChange={e => {
                                  const updated = [...(formData.implementationSteps || [])];
                                  updated[idx] = { ...updated[idx], proTip: e.target.value };
                                  setFormData({ ...formData, implementationSteps: updated });
                                }}
                                placeholder="Pro tip for this step..."
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-amber-300 placeholder:text-slate-600 outline-none focus:border-teal-500"
                              />
                            </div>
                          </div>
                        ))}
                        {(formData.implementationSteps || []).length === 0 && (
                          <p className="text-[10px] text-slate-600 text-center py-2">No steps yet. Click &quot;Add Step&quot; to begin.</p>
                        )}
                      </div>

                      {/* Startup Cost Planner */}
                      <div className="border-t border-slate-800 pt-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">Startup Cost Planner</h4>
                          <button
                            type="button"
                            onClick={() => {
                              const newRow = { item: '', cost: 0, isFree: true, essential: true };
                              setFormData({ ...formData, startupPlanner: [...(formData.startupPlanner || []), newRow] });
                            }}
                            className="text-[10px] font-bold text-teal-400 hover:text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-2 py-1 rounded-lg transition-all flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Row
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(formData.startupPlanner || []).map((row, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-slate-950 border border-slate-800/80 rounded-xl p-2.5">
                              <input
                                type="text"
                                value={row.item || ''}
                                onChange={e => {
                                  const updated = [...formData.startupPlanner];
                                  updated[idx] = { ...updated[idx], item: e.target.value };
                                  setFormData({ ...formData, startupPlanner: updated });
                                }}
                                placeholder="Item name..."
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-teal-500"
                              />
                              <div className="flex items-center gap-1">
                                <span className="text-slate-500 text-[10px]">₹</span>
                                <input
                                  type="number"
                                  value={row.cost ?? 0}
                                  onChange={e => {
                                    const updated = [...formData.startupPlanner];
                                    const cost = Number(e.target.value);
                                    updated[idx] = { ...updated[idx], cost, isFree: cost === 0 };
                                    setFormData({ ...formData, startupPlanner: updated });
                                  }}
                                  placeholder="0"
                                  className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-emerald-400 font-bold outline-none focus:border-teal-500"
                                />
                              </div>
                              <select
                                value={row.essential ? 'essential' : 'optional'}
                                onChange={e => {
                                  const updated = [...formData.startupPlanner];
                                  updated[idx] = { ...updated[idx], essential: e.target.value === 'essential' };
                                  setFormData({ ...formData, startupPlanner: updated });
                                }}
                                className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-slate-300 outline-none focus:border-teal-500 cursor-pointer"
                              >
                                <option value="essential">Essential</option>
                                <option value="optional">Optional</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.startupPlanner.filter((_, i) => i !== idx);
                                  setFormData({ ...formData, startupPlanner: updated });
                                }}
                                className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-500/10 transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          {(!formData.startupPlanner || formData.startupPlanner.length === 0) && (
                            <p className="text-[10px] text-slate-600 text-center py-2">No items yet. Click &quot;Add Row&quot; to begin.</p>
                          )}
                        </div>
                      </div>

                      {/* SEO Fields */}
                      <div className="border-t border-slate-800 pt-3 space-y-3">
                        <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider">
                          SEO & Meta Architecture
                        </h4>
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">SEO Title *</label>
                          <input
                            type="text"
                            value={formData.seoTitle}
                            onChange={e => setFormData({ ...formData, seoTitle: e.target.value })}
                            placeholder="e.g. Festival Camera Rental Portrait Service | Student Earning Ideas"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Meta Description *</label>
                          <textarea
                            rows="2"
                            value={formData.metaDescription}
                            onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                            placeholder="120–160 character snippet for Google search preview..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-teal-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Canonical URL</label>
                          <input
                            type="url"
                            value={formData.canonicalUrl || ''}
                            onChange={e => setFormData({ ...formData, canonicalUrl: e.target.value })}
                            placeholder="https://studentearningideas.in/idea/your-idea-slug"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4. Live SEO Intelligence */}
                    <LiveSeoIntelligence ideaData={formData} />

                    {/* 5. Content Quality Guard & Publish Blocker */}
                    <ContentQualityGuard ideaData={formData} existingIdeas={publishedIdeas} />

                    {/* 6. Publishing Actions Bar */}
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-3 sticky bottom-4 shadow-2xl z-30">
                      <div className="flex items-center gap-2">
                        {/* Draft Button */}
                        <button
                          type="button"
                          onClick={() => handleSaveDraft(adminEmail)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Draft</span>
                        </button>

                        {/* Preview Link */}
                        <Link
                          href={`/preview/${formData.id || 'current-draft'}`}
                          target="_blank"
                          onClick={() => {
                            if (formData.id) {
                              saveDraftIdea(formData);
                            }
                            if (typeof window !== 'undefined') {
                              try {
                                sessionStorage.setItem('sei_preview_temp_draft', JSON.stringify(formData));
                              } catch (e) {
                                console.warn('Could not store temp preview draft:', e);
                              }
                            }
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1"
                          title="Shareable Preview Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </Link>
                      </div>

                      {/* Schedule & Live Publish */}
                      <div className="flex items-center gap-2">
                        <input
                          type="datetime-local"
                          value={scheduledDate}
                          onChange={e => setScheduledDate(e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-2 py-2 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSchedule(adminEmail)}
                          className="bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer"
                        >
                          Schedule
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePublish(adminEmail)}
                          className="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>Publish Live →</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Live Mobile Smartphone Mockup (5 cols) */}
                  <div className="lg:col-span-5 hidden lg:block">
                    <LiveMobilePreview ideaData={formData} allIdeas={publishedIdeas} />
                  </div>
                </div>
              )}

            </main>
          </div>

          {/* Version History Modal */}
          <VersionHistoryModal
            isOpen={versionModalOpen}
            onClose={() => setVersionModalOpen(false)}
            ideaId={selectedIdeaForVersion?.id || formData.id}
            onRollback={handleRollback}
          />
        </div>
      )}
    </AdminAuth>
  );
}
