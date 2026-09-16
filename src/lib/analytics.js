// analytics.js - Privacy-Friendly Anonymous Event Tracker
const ANALYTICS_KEY = 'sei_anonymous_analytics_v1';

function getStoredAnalytics() {
  if (typeof window === 'undefined') return { events: [], summary: {} };
  try {
    const data = localStorage.getItem(ANALYTICS_KEY);
    return data ? JSON.parse(data) : { events: [], summary: {} };
  } catch (e) {
    return { events: [], summary: {} };
  }
}

function saveAnalytics(data) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[Analytics] Save error:', e);
  }
}

export function trackEvent(eventType, payload = {}) {
  if (typeof window === 'undefined') return;
  const store = getStoredAnalytics();
  const event = {
    type: eventType,
    payload,
    timestamp: new Date().toISOString()
  };

  // Keep last 300 events
  store.events = [event, ...(store.events || [])].slice(0, 300);

  // Update aggregated summary
  if (!store.summary) store.summary = {};
  if (!store.summary[eventType]) store.summary[eventType] = 0;
  store.summary[eventType]++;

  if (eventType === 'search' && payload.keyword) {
    if (!store.summary.keywords) store.summary.keywords = {};
    const kw = payload.keyword.toLowerCase().trim();
    store.summary.keywords[kw] = (store.summary.keywords[kw] || 0) + 1;
  }

  if (eventType === 'read_expand' && payload.ideaId) {
    if (!store.summary.mostRead) store.summary.mostRead = {};
    store.summary.mostRead[payload.ideaId] = (store.summary.mostRead[payload.ideaId] || 0) + 1;
  }

  if (eventType === 'calculator_used' && payload.ideaId) {
    if (!store.summary.calculatorInteractions) store.summary.calculatorInteractions = 0;
    store.summary.calculatorInteractions++;
  }

  if (eventType === 'checklist_completed' && payload.ideaId) {
    if (!store.summary.checklistCompletions) store.summary.checklistCompletions = 0;
    store.summary.checklistCompletions++;
  }

  saveAnalytics(store);
}

export function getAnalyticsReport() {
  const store = getStoredAnalytics();
  return {
    totalEvents: store.events?.length || 0,
    likesCount: store.summary?.like || 0,
    savesCount: store.summary?.save || 0,
    sharesCount: store.summary?.share || 0,
    scrollDepthCounts: {
      depth_25: store.summary?.scroll_depth_25 || 0,
      depth_50: store.summary?.scroll_depth_50 || 0,
      depth_75: store.summary?.scroll_depth_75 || 0,
      depth_100: store.summary?.scroll_depth_100 || 0,
    },
    topKeywords: Object.entries(store.summary?.keywords || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8),
    mostReadIdeas: Object.entries(store.summary?.mostRead || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    calculatorUsage: store.summary?.calculatorInteractions || 0,
    checklistCompletions: store.summary?.checklistCompletions || 0,
    recentEvents: (store.events || []).slice(0, 20)
  };
}
