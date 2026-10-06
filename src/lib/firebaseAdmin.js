// src/lib/firebaseAdmin.js - Server-Only Privileged Firebase Admin SDK
// IMPORTANT: This file MUST ONLY be imported in server-side contexts (API route handlers, server actions).
// It must NEVER be imported in client components or any file bundled for the browser.
import 'server-only';
import { getApps, initializeApp, cert, getApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function getFirebaseAdminApp() {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (privateKey) {
    // 1. Trim surrounding whitespace
    privateKey = privateKey.trim();
    // 2. Strip one pair of surrounding matching quotes added by some env dashboards (e.g. Vercel)
    if (
      (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
      (privateKey.startsWith("'") && privateKey.endsWith("'"))
    ) {
      privateKey = privateKey.slice(1, -1);
    }
    // 3. Normalize newlines: handle double-escaped (\\n) first, then single-escaped (\n)
    privateKey = privateKey.replace(/\\n/g, '\n');
    // 4. Final trim in case quote removal left stray whitespace
    privateKey = privateKey.trim();
  }

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
}

const adminApp = getFirebaseAdminApp();
export const adminDb = adminApp ? getFirestore(adminApp) : null;
export const adminAuth = adminApp ? getAuth(adminApp) : null;
export { FieldValue };
