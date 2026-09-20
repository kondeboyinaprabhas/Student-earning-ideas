// ideasStore.js - Production State & Local/Firestore Synchronizer

import { SEED_IDEAS } from './seedData.js';
import { db } from './firebase';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { COLLECTIONS } from './firestoreStore';

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

    if (
      e.name === 'QuotaExceededError' ||
      e.code === 22 ||
      e.code === 1014
    ) {
      try {
        localStorage.removeItem(STORAGE_KEYS.VERSIONS);
        localStorage.removeItem('sei_audit_log_v1');
        localStorage.setItem(key, JSON.stringify(value));
      } catch (retryError) {
        console.warn(
          `[Storage] Retry write failed for ${key}:`,
          retryError
        );
      }
    }
  }
}

// Sync likes-count cache so toggleLike can remain callable without async
const LIKES_COUNT_CACHE_KEY = 'sei_likes_count_v1';

function getLikesCountCache() {
  return safeGet(LIKES_COUNT_CACHE_KEY, {});
}

function setLikesCountCache(ideaId, count) {
  const cache = getLikesCountCache();
  cache[ideaId] = count;
  safeSet(LIKES_COUNT_CACHE_KEY, cache);
}

// Published ideas manager
export async function getPublishedIdeas() {
  try {
    const snap = await getDocs(collection(db, COLLECTIONS.BLUEPRINTS));

    if (!snap.empty) {
      const ideas = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      // Populate the sync likes-count cache for toggleLike
      const cache = {};
      ideas.forEach(i => { if (typeof i.likes === 'number') cache[i.id] = i.likes; });
      safeSet(LIKES_COUNT_CACHE_KEY, cache);
      // Cache published ideas locally for fast reload
      safeSet(STORAGE_KEYS.PUBLISHED, ideas);
      return ideas;
    }

    const stored = safeGet(STORAGE_KEYS.PUBLISHED, null);

    if (stored?.length) {
      for (const idea of stored) {
        await setDoc(
          doc(db, COLLECTIONS.BLUEPRINTS, idea.id),
          idea
        );
      }
      // Populate likes cache from localStorage data too
      const cache = {};
      stored.forEach(i => { if (typeof i.likes === 'number') cache[i.id] = i.likes; });
      safeSet(LIKES_COUNT_CACHE_KEY, cache);
      return stored;
    }

    return SEED_IDEAS;
  } catch (e) {
    console.warn(e);
    return safeGet(STORAGE_KEYS.PUBLISHED, SEED_IDEAS);
  }
}

export async function savePublishedIdea(idea) {
  const finalIdea = {
    ...idea,
    lastUpdated: new Date().toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    })
  };

  recordVersionHistory(idea.id, finalIdea);

  await setDoc(
    doc(db, COLLECTIONS.BLUEPRINTS, finalIdea.id),
    finalIdea
  );

  removeDraftIdea(idea.id);

  return finalIdea;
}

export async function deletePublishedIdea(id) {
  await deleteDoc(doc(db, COLLECTIONS.BLUEPRINTS, id));
}

export async function unpublishIdea(id) {
  const published = await getPublishedIdeas();
  const target = published.find(i => i.id === id);

  if (!target) return;

  await deletePublishedIdea(id);

  saveDraftIdea({
    ...target,
    status: 'Draft',
    unpublishedAt: new Date().toISOString()
  });
}

// Trash manager
export function getTrashIdeas() {
  return safeGet(STORAGE_KEYS.TRASH, []);
}

export async function softDeleteIdea(id, origin = 'published') {
  let target = null;

  if (origin === 'published') {
    const published = await getPublishedIdeas();
    target = published.find(i => i.id === id);

    if (target) {
      await deletePublishedIdea(id);
    }
  }

  if (!target) {
    const drafts = getDraftIdeas();
    target = drafts.find(i => i.id === id);

    if (target) {
      safeSet(
        STORAGE_KEYS.DRAFTS,
        drafts.filter(i => i.id !== id)
      );
    }
  }

  if (target) {
    const currentTrash = getTrashIdeas();

    const updatedTrash = [
      {
        ...target,
        deletedAt: new Date().toISOString(),
        deletedOrigin: origin,
        deleted: true
      },
      ...currentTrash.filter(i => i.id !== id)
    ];

    safeSet(STORAGE_KEYS.TRASH, updatedTrash);
    return true;
  }

  return false;
}

export async function restoreIdea(id) {
  const trash = getTrashIdeas();
  const target = trash.find(i => i.id === id);

  if (!target) return false;

  const updatedTrash = trash.filter(i => i.id !== id);
  safeSet(STORAGE_KEYS.TRASH, updatedTrash);

  const cleanTarget = { ...target };

  delete cleanTarget.deletedAt;
  delete cleanTarget.deletedOrigin;
  delete cleanTarget.deleted;

  if (target.deletedOrigin === 'published') {
    await savePublishedIdea(cleanTarget);
  } else {
    saveDraftIdea(cleanTarget);
  }

  return true;
}

export async function permanentDeleteIdea(id) {
  const trash = getTrashIdeas();
  const updatedTrash = trash.filter(i => i.id !== id);
  safeSet(STORAGE_KEYS.TRASH, updatedTrash);

  await deletePublishedIdea(id);
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
    updated[index] = {
      ...draft,
      status: 'Draft',
      updatedAt: new Date().toISOString()
    };
  } else {
    updated = [
      {
        ...draft,
        status: 'Draft',
        updatedAt: new Date().toISOString()
      },
      ...current
    ];
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

  const scheduledItem = {
    ...idea,
    scheduledFor: publishAt,
    scheduledAt: new Date().toISOString()
  };

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

// Version History
export function getVersionHistory(ideaId) {
  const allHistory = safeGet(STORAGE_KEYS.VERSIONS, {});
  return allHistory[ideaId] || [];
}

export function recordVersionHistory(ideaId, snapshot) {
  if (!snapshot || !ideaId) return;

  try {
    const allHistory = safeGet(STORAGE_KEYS.VERSIONS, {});
    const versions = allHistory[ideaId] || [];

    const cleanSnapshot = { ...snapshot };

    if (
      typeof cleanSnapshot.heroImage === 'string' &&
      cleanSnapshot.heroImage.startsWith('data:')
    ) {
      cleanSnapshot.heroImage = '';
    }

    if (Array.isArray(cleanSnapshot.carouselImages)) {
      cleanSnapshot.carouselImages = cleanSnapshot.carouselImages.map(img =>
        typeof img === 'string' && img.startsWith('data:') ? '' : img
      );
    }

    const newEntry = {
      versionId: `v_${Date.now()}`,
      timestamp: new Date().toISOString(),
      snapshot: cleanSnapshot
    };

    allHistory[ideaId] = [newEntry, ...versions].slice(0, 3);

    safeSet(STORAGE_KEYS.VERSIONS, allHistory);
  } catch (err) {
    console.warn('[Storage] recordVersionHistory error:', err);
  }
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

  // Update the sync likes-count cache (populated by getPublishedIdeas on load)
  const currentCount = getLikesCountCache()[ideaId];
  const currentLikes = typeof currentCount === 'number' ? currentCount : 0;
  setLikesCountCache(ideaId, nextState ? currentLikes + 1 : Math.max(0, currentLikes - 1));

  return nextState;
}

// Saved system
export function getSavedIds() {
  return safeGet(STORAGE_KEYS.SAVES, []);
}

export function toggleSave(ideaId) {
  const current = getSavedIds();
  const exists = current.includes(ideaId);

  const updated = exists
    ? current.filter(id => id !== ideaId)
    : [...current, ideaId];

  safeSet(STORAGE_KEYS.SAVES, updated);

  return !exists;
}

// Viewed ideas
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

// Checklist
export function getChecklistState(ideaId) {
  const all = safeGet(STORAGE_KEYS.CHECKLISTS, {});
  return all[ideaId] || {};
}

export function setChecklistItem(
  ideaId,
  checkId,
  completed
) {
  const all = safeGet(STORAGE_KEYS.CHECKLISTS, {});

  if (!all[ideaId]) all[ideaId] = {};

  all[ideaId][checkId] = completed;

  safeSet(STORAGE_KEYS.CHECKLISTS, all);

  return all[ideaId];
}

// Scroll hint
export function getScrollHintDismissed() {
  return safeGet(STORAGE_KEYS.SCROLL_HINT, false);
}

export function setScrollHintDismissed() {
  safeSet(STORAGE_KEYS.SCROLL_HINT, true);
}

// Maintenance mode
export function getMaintenanceConfig() {
  const cfg = safeGet(STORAGE_KEYS.MAINTENANCE, {
    enabled: false,
    scheduledLaunch: null,
    message:
      'We are polishing new 2026 student earning blueprints. Launching soon!'
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
    message:
      config.message ||
      'We are polishing new 2026 student earning blueprints. Launching soon!'
  };

  safeSet(STORAGE_KEYS.MAINTENANCE, clean);
}

// Cookie consent
export function getCookieConsent() {
  return safeGet(STORAGE_KEYS.COOKIE_CONSENT, false);
}

export function setCookieConsent(accepted) {
  safeSet(STORAGE_KEYS.COOKIE_CONSENT, accepted);
}