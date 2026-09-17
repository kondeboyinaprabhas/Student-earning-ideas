// src/lib/firestoreStore.js
// Firestore data layer: submissions inbox, activity log, soft-delete, export utilities
'use client';

import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, setDoc,
  query, orderBy, limit, startAfter, where, onSnapshot,
  serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
export { db };

// ─── Collection names ────────────────────────────────────────────────────────
export const COLLECTIONS = {
  SUBMISSIONS: 'submissions',
  ACTIVITY_LOG: 'adminActivityLog',
  BLUEPRINTS: 'blueprints',
  RECOMMENDED_RESOURCES: 'recommendedResources',
  SETTINGS: 'settings',
  PUSH_SUBSCRIPTIONS: 'pushSubscriptions',
};

// Global Display Frequency persistence
export async function getGlobalFrequency() {
  try {
    if (!db) return null;
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'globalFrequency');
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return data?.value ?? null;
  } catch (err) {
    console.error('[Firestore] getGlobalFrequency error:', err);
    return null;
  }
}

export async function setGlobalFrequency(value) {
  try {
    if (!db) throw new Error('Database not initialized');
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'globalFrequency');
    await setDoc(docRef, { value }, { merge: true });
    return { success: true };
  } catch (err) {
    console.error('[Firestore] setGlobalFrequency error:', err);
    return { success: false, error: err.message };
  }
}

// Recommended Resources CRUD
export async function fetchRecommendedResources() {
  try {
    if (!db) return [];
    const q = query(collection(db, COLLECTIONS.RECOMMENDED_RESOURCES), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[Firestore] fetchRecommendedResources error:', err);
    return [];
  }
}

export async function addRecommendedResource(resource) {
  try {
    if (!db) throw new Error('Database connection is not initialized');
    const ref = await addDoc(collection(db, COLLECTIONS.RECOMMENDED_RESOURCES), {
      ...resource,
      active: resource.active ?? true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { success: true, id: ref.id };
  } catch (err) {
    console.error('[Firestore] addRecommendedResource error:', err);
    return { success: false, error: err.message };
  }
}

export async function updateRecommendedResource(id, updates) {
  try {
    if (!db) throw new Error('Database connection is not initialized');
    await updateDoc(doc(db, COLLECTIONS.RECOMMENDED_RESOURCES, id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error('[Firestore] updateRecommendedResource error:', err);
    return { success: false, error: err.message };
  }
}

export async function deleteRecommendedResource(id) {
  try {
    if (!db) throw new Error('Database connection is not initialized');
    await deleteDoc(doc(db, COLLECTIONS.RECOMMENDED_RESOURCES, id));
    return { success: true };
  } catch (err) {
    console.error('[Firestore] deleteRecommendedResource error:', err);
    return { success: false, error: err.message };
  }
}


// ─── Status constants ─────────────────────────────────────────────────────────
export const SUBMISSION_STATUS = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  ARCHIVED: 'Archived',
};

// ─── Submissions / Inbox ──────────────────────────────────────────────────────

/**
 * Save a new user submission to Firestore.
 * Used by the Contact page and any public-facing forms.
 */
export async function saveSubmission({ name, email, type = 'Contact', title = '', message = '' }) {
  try {
    if (!db) {
      throw new Error('Database connection is not initialized. Please try again.');
    }

    const writePromise = addDoc(collection(db, COLLECTIONS.SUBMISSIONS), {
      name: name || '',
      email: email || '',
      type: type || 'Contact',
      title: title || '',
      message: message || '',
      status: SUBMISSION_STATUS.NEW,
      read: false,
      deleted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Submission timed out. Please check your network and try again.')), 12000)
    );

    const ref = await Promise.race([writePromise, timeoutPromise]);
    return { success: true, id: ref.id };
  } catch (err) {
    console.error('[Firestore] saveSubmission error:', err);
    return { success: false, error: err.message || 'Failed to submit' };
  }
}

/**
 * Fetch paginated submissions for admin inbox.
 * @param {{ limitCount?: number, lastDoc?: any, statusFilter?: string, typeFilter?: string, searchQuery?: string }} opts
 */
export async function fetchSubmissions({ limitCount = 20, lastDoc = null, statusFilter = '', typeFilter = '', searchQuery = '' } = {}) {
  try {
    let q = query(
      collection(db, COLLECTIONS.SUBMISSIONS),
      where('deleted', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    if (lastDoc) q = query(q, startAfter(lastDoc));

    const snap = await getDocs(q);
    let docs = snap.docs.map(d => ({ id: d.id, ...d.data(), _doc: d }));

    // Client-side filters (Firestore index limitations for multi-field composite)
    if (statusFilter) docs = docs.filter(d => d.status === statusFilter);
    if (typeFilter) docs = docs.filter(d => d.type === typeFilter);
    if (searchQuery) {
      const q2 = searchQuery.toLowerCase();
      docs = docs.filter(d =>
        (d.name || '').toLowerCase().includes(q2) ||
        (d.email || '').toLowerCase().includes(q2) ||
        (d.title || '').toLowerCase().includes(q2) ||
        (d.type || '').toLowerCase().includes(q2)
      );
    }

    return { docs, lastDoc: snap.docs[snap.docs.length - 1] || null };
  } catch (err) {
    console.error('[Firestore] fetchSubmissions error:', err);
    return { docs: [], lastDoc: null };
  }
}

/** Fetch a single submission by ID */
export async function getSubmission(id) {
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SUBMISSIONS, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('[Firestore] getSubmission error:', err);
    return null;
  }
}

/** Update submission status */
export async function updateSubmissionStatus(id, status) {
  try {
    await updateDoc(doc(db, COLLECTIONS.SUBMISSIONS, id), {
      status,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error('[Firestore] updateSubmissionStatus error:', err);
    return { success: false, error: err.message };
  }
}

/** Mark submission as read */
export async function markSubmissionRead(id) {
  try {
    await updateDoc(doc(db, COLLECTIONS.SUBMISSIONS, id), { read: true });
  } catch (err) {
    console.error('[Firestore] markSubmissionRead error:', err);
  }
}

/** Soft-delete a submission */
export async function softDeleteSubmission(id) {
  try {
    await updateDoc(doc(db, COLLECTIONS.SUBMISSIONS, id), {
      deleted: true,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error('[Firestore] softDeleteSubmission error:', err);
    return { success: false, error: err.message };
  }
}

/** Restore a soft-deleted submission */
export async function restoreSubmission(id) {
  try {
    await updateDoc(doc(db, COLLECTIONS.SUBMISSIONS, id), {
      deleted: false,
      updatedAt: serverTimestamp(),
    });
    return { success: true };
  } catch (err) {
    console.error('[Firestore] restoreSubmission error:', err);
    return { success: false, error: err.message };
  }
}

/** Permanently delete a submission */
export async function permanentDeleteSubmission(id) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.SUBMISSIONS, id));
    return { success: true };
  } catch (err) {
    console.error('[Firestore] permanentDeleteSubmission error:', err);
    return { success: false, error: err.message };
  }
}

/** Count unread submissions (real-time) */
export function subscribeToUnreadCount(callback) {
  const q = query(
    collection(db, COLLECTIONS.SUBMISSIONS),
    where('deleted', '==', false),
    where('read', '==', false)
  );
  return onSnapshot(q, snap => callback(snap.size), err => {
    console.error('[Firestore] subscribeToUnreadCount error:', err);
    callback(0);
  });
}

/** Real-time listener for new submissions (for notifications) */
export function subscribeToNewSubmissions(callback) {
  const q = query(
    collection(db, COLLECTIONS.SUBMISSIONS),
    where('deleted', '==', false),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  return onSnapshot(q, snap => {
    if (!snap.empty) callback(snap.docs[0].data());
  }, err => {
    console.error('[Firestore] subscribeToNewSubmissions error:', err);
  });
}

// ─── Activity Log ─────────────────────────────────────────────────────────────

/**
 * Log an admin action.
 * @param {{ action: string, entityId: string, entityType: string, adminEmail: string, details?: string }} entry
 */
export async function logAdminAction({ action, entityId = '', entityType = '', adminEmail = '', details = '' }) {
  try {
    await addDoc(collection(db, COLLECTIONS.ACTIVITY_LOG), {
      action,
      entityId,
      entityType,
      adminEmail,
      details,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error('[Firestore] logAdminAction error:', err);
  }
}

/** Fetch recent activity log entries */
export async function fetchActivityLog(limitCount = 50) {
  try {
    const q = query(
      collection(db, COLLECTIONS.ACTIVITY_LOG),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[Firestore] fetchActivityLog error:', err);
    return [];
  }
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

/** Get today's submission count */
export async function getTodaySubmissionCount() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const q = query(
      collection(db, COLLECTIONS.SUBMISSIONS),
      where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
      where('deleted', '==', false)
    );
    const snap = await getDocs(q);
    return snap.size;
  } catch (err) {
    console.error('[Firestore] getTodaySubmissionCount error:', err);
    return 0;
  }
}

/** Get count of pending (New) submissions */
export async function getPendingSubmissionCount() {
  try {
    const q = query(
      collection(db, COLLECTIONS.SUBMISSIONS),
      where('status', '==', SUBMISSION_STATUS.NEW),
      where('deleted', '==', false)
    );
    const snap = await getDocs(q);
    return snap.size;
  } catch (err) {
    console.error('[Firestore] getPendingSubmissionCount error:', err);
    return 0;
  }
}

// ─── Export Utilities ─────────────────────────────────────────────────────────

function toCSV(rows, columns) {
  const header = columns.join(',');
  const body = rows.map(row =>
    columns.map(col => {
      const val = row[col] ?? '';
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [header, ...body].join('\n');
}

function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportInboxAsCSV() {
  try {
    const { docs } = await fetchSubmissions({ limitCount: 1000 });
    const columns = ['id', 'name', 'email', 'type', 'title', 'message', 'status', 'read'];
    const csv = toCSV(docs, columns);
    downloadFile(csv, `inbox_export_${Date.now()}.csv`, 'text/csv');
  } catch (err) {
    console.error('[Export] exportInboxAsCSV error:', err);
  }
}

export async function exportInboxAsJSON() {
  try {
    const { docs } = await fetchSubmissions({ limitCount: 1000 });
    const clean = docs.map(({ _doc, ...rest }) => rest);
    downloadFile(JSON.stringify(clean, null, 2), `inbox_export_${Date.now()}.json`, 'application/json');
  } catch (err) {
    console.error('[Export] exportInboxAsJSON error:', err);
  }
}

export function exportBlueprintsAsCSV(blueprints = []) {
  const columns = ['id', 'title', 'slug', 'category', 'investment', 'estimatedProfit', 'difficulty', 'status', 'lastUpdated'];
  const csv = toCSV(blueprints, columns);
  downloadFile(csv, `blueprints_export_${Date.now()}.csv`, 'text/csv');
}

export function exportBlueprintsAsJSON(blueprints = []) {
  downloadFile(JSON.stringify(blueprints, null, 2), `blueprints_export_${Date.now()}.json`, 'application/json');
}
