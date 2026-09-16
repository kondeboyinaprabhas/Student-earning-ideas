// ideasStore.js - Production State & Local/Firestore Synchronizer
import { SEED_IDEAS } from './seedData';

const STORAGE_KEYS = {
  PUBLISHED: 'sei_published_ideas_v1',
  DRAFTS: 'sei_draft_ideas_v1',
  SCHEDULED: 'sei_scheduled_ideas_v1',
  LIKES: 'sei_user_likes_v1',
  SAVES: 'sei_user_saved_v1',
  VIEWED: 'sei_user_viewed_v1',
  CHECKLISTS: 'sei_user_checklists_v1',
  SCROLL_HINT: 'sei_scroll_hint_dismissed_v1',
  VERSIONS: 'sei_version_history_v1',
  MAINTENANCE: 'sei_maintenance_mode_v1',
  COOKIE_CONSENT: 'sei_cookie_consent_v1',
  TRASH: 'sei_trash_ideas_v1'
};

// Safe localStorage helper
function safeGet(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`[Storage] Read error for ${key}:`, e);
    return fallback;
  }
}

function safeSet(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[Storage] Write error for ${key}:`, e);
  }
}

// Published ideas manager
export function getPublishedIdeas() {
  const stored = safeGet(STORAGE_KEYS.PUBLISHED, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    safeSet(STORAGE_KEYS.PUBLISHED, SEED_IDEAS);
    return SEED_IDEAS;
  }
  return stored;
}

export function savePublishedIdea(idea) {
  const current = getPublishedIdeas();
  const index = current.findIndex(i => i.id === idea.id);
  
  // Record version history before saving
  recordVersionHistory(idea.id, idea);

  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...idea, lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) };
  } else {
    updated = [{ ...idea, lastUpdated: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) }, ...current];
  }
  safeSet(STORAGE_KEYS.PUBLISHED, updated);
  
  // Clean up if it was previously in drafts
  removeDraftIdea(idea.id);
  return updated;
}

export function deletePublishedIdea(id) {
  const current = getPublishedIdeas();
  const updated = current.filter(i => i.id !== id);
  safeSet(STORAGE_KEYS.PUBLISHED, updated);
  return updated;
}

export function unpublishIdea(id) {
  const published = getPublishedIdeas();
  const target = published.find(i => i.id === id);
  if (!target) return published;
  // Remove from published
  const updatedPublished = published.filter(i => i.id !== id);
  safeSet(STORAGE_KEYS.PUBLISHED, updatedPublished);
  // Add to drafts with status draft
  saveDraftIdea({ ...target, status: 'Draft', unpublishedAt: new Date().toISOString() });
  return updatedPublished;
}

// Trash / Soft-delete manager
export function getTrashIdeas() {
  return safeGet(STORAGE_KEYS.TRASH, []);
}

export function softDeleteIdea(id, origin = 'published') {
  let target = null;
  if (origin === 'published') {
    const published = getPublishedIdeas();
    target = published.find(i => i.id === id);
    if (target) {
      safeSet(STORAGE_KEYS.PUBLISHED, published.filter(i => i.id !== id));
    }
  }
  if (!target) {
    const drafts = getDraftIdeas();
    target = drafts.find(i => i.id === id);
    if (target) {
      safeSet(STORAGE_KEYS.DRAFTS, drafts.filter(i => i.id !== id));
    }
  }
  if (target) {
    const currentTrash = getTrashIdeas();
    const updatedTrash = [{
      ...target,
      deletedAt: new Date().toISOString(),
      deletedOrigin: origin,
      deleted: true
    }, ...currentTrash.filter(i => i.id !== id)];
    safeSet(STORAGE_KEYS.TRASH, updatedTrash);
    return true;
  }
  return false;
}

export function restoreIdea(id) {
  const trash = getTrashIdeas();
  const target = trash.find(i => i.id === id);
  if (!target) return false;
  // Remove from trash
  const updatedTrash = trash.filter(i => i.id !== id);
  safeSet(STORAGE_KEYS.TRASH, updatedTrash);
  
  const cleanTarget = { ...target };
  delete cleanTarget.deletedAt;
  delete cleanTarget.deletedOrigin;
  delete cleanTarget.deleted;

  if (target.deletedOrigin === 'published') {
    savePublishedIdea(cleanTarget);
  } else {
    saveDraftIdea(cleanTarget);
  }
  return true;
}

export function permanentDeleteIdea(id) {
  const trash = getTrashIdeas();
  const updatedTrash = trash.filter(i => i.id !== id);
  safeSet(STORAGE_KEYS.TRASH, updatedTrash);
  // Also ensure it is removed from published & drafts just in case
  deletePublishedIdea(id);
  removeDraftIdea(id);
  return updatedTrash;
}

// Drafts manager
export function getDraftIdeas() {
  return safeGet(STORAGE_KEYS.DRAFTS, []);
}

export function saveDraftIdea(draft) {
  const current = getDraftIdeas();
  const index = current.findIndex(d => d.id === draft.id);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...draft, status: 'Draft', updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...draft, status: 'Draft', updatedAt: new Date().toISOString() }, ...current];
  }
  safeSet(STORAGE_KEYS.DRAFTS, updated);
  recordVersionHistory(draft.id, draft);
  return updated;
}

export function removeDraftIdea(id) {
  const current = getDraftIdeas();
  const updated = current.filter(d => d.id !== id);
  safeSet(STORAGE_KEYS.DRAFTS, updated);
  return updated;
}

// Scheduled posts manager
export function getScheduledIdeas() {
  return safeGet(STORAGE_KEYS.SCHEDULED, []);
}

export function saveScheduledIdea(idea, publishAt) {
  const current = getScheduledIdeas();
  const index = current.findIndex(s => s.id === idea.id);
  const scheduledItem = { ...idea, scheduledFor: publishAt, scheduledAt: new Date().toISOString() };
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = scheduledItem;
  } else {
    updated = [scheduledItem, ...current];
  }
  safeSet(STORAGE_KEYS.SCHEDULED, updated);
  return updated;
}

// Version History & Rollback System
export function getVersionHistory(ideaId) {
  const allHistory = safeGet(STORAGE_KEYS.VERSIONS, {});
  return allHistory[ideaId] || [];
}

export function recordVersionHistory(ideaId, snapshot) {
  const allHistory = safeGet(STORAGE_KEYS.VERSIONS, {});
  const versions = allHistory[ideaId] || [];
  const newEntry = {
    versionId: `v_${Date.now()}`,
    timestamp: new Date().toISOString(),
    snapshot: JSON.parse(JSON.stringify(snapshot))
  };
  // Keep last 10 versions
  allHistory[ideaId] = [newEntry, ...versions].slice(0, 10);
  safeSet(STORAGE_KEYS.VERSIONS, allHistory);
}

// Likes system
export function getLikedMap() {
  return safeGet(STORAGE_KEYS.LIKES, {});
}

export function toggleLike(ideaId) {
  const map = getLikedMap();
  const isLiked = !!map[ideaId];
  const nextState = !isLiked;
  map[ideaId] = nextState;
  safeSet(STORAGE_KEYS.LIKES, map);
  return nextState;
}

// Saved system
export function getSavedIds() {
  return safeGet(STORAGE_KEYS.SAVES, []);
}

export function toggleSave(ideaId) {
  const current = getSavedIds();
  const exists = current.includes(ideaId);
  const updated = exists ? current.filter(id => id !== ideaId) : [...current, ideaId];
  safeSet(STORAGE_KEYS.SAVES, updated);
  return !exists;
}

// Viewed ideas tracking (for unseen first logic)
export function getViewedIds() {
  return safeGet(STORAGE_KEYS.VIEWED, []);
}

export function markAsViewed(ideaId) {
  const current = getViewedIds();
  if (!current.includes(ideaId)) {
    const updated = [...current, ideaId];
    safeSet(STORAGE_KEYS.VIEWED, updated);
    return updated;
  }
  return current;
}

// Checklist state manager
export function getChecklistState(ideaId) {
  const all = safeGet(STORAGE_KEYS.CHECKLISTS, {});
  return all[ideaId] || {};
}

export function setChecklistItem(ideaId, checkId, completed) {
  const all = safeGet(STORAGE_KEYS.CHECKLISTS, {});
  if (!all[ideaId]) all[ideaId] = {};
  all[ideaId][checkId] = completed;
  safeSet(STORAGE_KEYS.CHECKLISTS, all);
  return all[ideaId];
}

// First-time scroll hint
export function getScrollHintDismissed() {
  return safeGet(STORAGE_KEYS.SCROLL_HINT, false);
}

export function setScrollHintDismissed() {
  safeSet(STORAGE_KEYS.SCROLL_HINT, true);
}

// Maintenance Mode
export function getMaintenanceConfig() {
  const cfg = safeGet(STORAGE_KEYS.MAINTENANCE, {
    enabled: false,
    scheduledLaunch: null,
    message: "We are polishing new 2026 student earning blueprints. Launching soon!"
  });
  if (cfg && cfg.bypassPassword !== undefined) {
    delete cfg.bypassPassword;
  }
  return cfg;
}

export function setMaintenanceConfig(config) {
  const clean = {
    enabled: !!config.enabled,
    scheduledLaunch: config.scheduledLaunch || null,
    message: config.message || "We are polishing new 2026 student earning blueprints. Launching soon!"
  };
  safeSet(STORAGE_KEYS.MAINTENANCE, clean);
}

// Cookie Consent
export function getCookieConsent() {
  return safeGet(STORAGE_KEYS.COOKIE_CONSENT, false);
}

export function setCookieConsent(accepted) {
  safeSet(STORAGE_KEYS.COOKIE_CONSENT, accepted);
}
