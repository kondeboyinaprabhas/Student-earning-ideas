// src/lib/firebaseAdmin.js - Server-Only Privileged Firebase Admin SDK
// IMPORTANT: This file MUST ONLY be imported in server-side contexts (API route handlers, server actions).
// It must NEVER be imported in client components or any file bundled for the browser.
import 'server-only';
import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function normalizePrivateKey(rawKey) {
  if (!rawKey) return null;
  let key = rawKey.trim();

  // If entire service account JSON was provided
  if (key.startsWith('{') && key.endsWith('}')) {
    try {
      const parsed = JSON.parse(key);
      if (parsed.private_key) key = parsed.private_key.trim();
    } catch {}
  }

  // Strip repeated or escaped surrounding quotes added by dashboards / env parsers
  while (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'")) ||
    (key.startsWith('\\"') && key.endsWith('\\"')) ||
    (key.startsWith("\\'") && key.endsWith("\\'"))
  ) {
    if (key.startsWith('\\"') || key.startsWith("\\'")) {
      key = key.slice(2, -2).trim();
    } else {
      key = key.slice(1, -1).trim();
    }
  }

  // Replace any variant of escaped newlines / returns
  key = key
    .replace(/\\+r\\+n/g, '\n')
    .replace(/\\+n/g, '\n')
    .replace(/\\+r/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // If PEM headers are present, rebuild canonical PEM with 64-char lines
  const beginMarker = '-----BEGIN PRIVATE KEY-----';
  const endMarker = '-----END PRIVATE KEY-----';

  if (key.includes(beginMarker) && key.includes(endMarker)) {
    const startIndex = key.indexOf(beginMarker) + beginMarker.length;
    const endIndex = key.indexOf(endMarker);
    const rawBody = key.slice(startIndex, endIndex);

    // Keep only valid base64 characters
    const cleanBase64 = rawBody.replace(/[^A-Za-z0-9+/=]/g, '');

    // Chunk into 64-char lines
    const lines = cleanBase64.match(/.{1,64}/g) || [];
    return `${beginMarker}\n${lines.join('\n')}\n${endMarker}\n`;
  }

  return key.trim();
}

function getFirebaseAdminApp() {
  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      return existingApps[0];
    }

    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

    // Explicit verification: all 3 required variables must be provided
    if (!projectId || !clientEmail || !privateKey) {
      return null;
    }

    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (err) {
    console.error('[FirebaseAdmin] Failed to initialize Firebase Admin SDK:', err?.message);
    return null;
  }
}

function getAdminFirestore(app) {
  if (!app) return null;
  try {
    return getFirestore(app);
  } catch (err) {
    console.error('[FirebaseAdmin] Failed to get Firestore instance:', err?.message);
    return null;
  }
}

function getAdminAuth(app) {
  if (!app) return null;
  try {
    return getAuth(app);
  } catch (err) {
    console.error('[FirebaseAdmin] Failed to get Auth instance:', err?.message);
    return null;
  }
}

export function getFreshAdminDb() {
  const app = getFirebaseAdminApp();
  return getAdminFirestore(app);
}

export function getFreshAdminAuth() {
  const app = getFirebaseAdminApp();
  return getAdminAuth(app);
}

const adminApp = getFirebaseAdminApp();
export const adminDb = getAdminFirestore(adminApp);
export const adminAuth = getAdminAuth(adminApp);
export { FieldValue };
