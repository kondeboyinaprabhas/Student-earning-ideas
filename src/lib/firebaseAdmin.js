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
    // Replace escaped newlines if passed in .env string
    privateKey = privateKey.replace(/\\n/g, '\n');
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

