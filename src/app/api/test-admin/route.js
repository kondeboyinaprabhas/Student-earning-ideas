import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics = {};

  // 1. Check env vars existence
  diagnostics.env = {
    hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
    hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    privateKeyLength: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.length || 0,
    hasPublicProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };

  // 2. Try importing server-only
  try {
    await import('server-only');
    diagnostics.serverOnlyImport = 'SUCCESS';
  } catch (err) {
    diagnostics.serverOnlyImport = `FAILED: ${err.message}`;
  }

  // 3. Try importing firebase-admin/app
  try {
    const adminApp = await import('firebase-admin/app');
    diagnostics.firebaseAdminAppImport = 'SUCCESS';
    diagnostics.existingAppsCount = adminApp.getApps().length;
  } catch (err) {
    diagnostics.firebaseAdminAppImport = `FAILED: ${err.message}\n${err.stack}`;
  }

  // 4. Try importing firebase-admin/firestore
  try {
    const adminFs = await import('firebase-admin/firestore');
    diagnostics.firebaseAdminFirestoreImport = 'SUCCESS';
  } catch (err) {
    diagnostics.firebaseAdminFirestoreImport = `FAILED: ${err.message}\n${err.stack}`;
  }

  // 5. Try importing firebase-admin/auth
  try {
    const adminAuth = await import('firebase-admin/auth');
    diagnostics.firebaseAdminAuthImport = 'SUCCESS';
  } catch (err) {
    diagnostics.firebaseAdminAuthImport = `FAILED: ${err.message}\n${err.stack}`;
  }

  // 6. Try importing local @/lib/firebaseAdmin
  try {
    const localAdmin = await import('@/lib/firebaseAdmin');
    diagnostics.localFirebaseAdminModule = {
      hasAdminDb: !!localAdmin.adminDb,
      hasAdminAuth: !!localAdmin.adminAuth,
      hasFieldValue: !!localAdmin.FieldValue,
    };
  } catch (err) {
    diagnostics.localFirebaseAdminModule = `FAILED: ${err.message}\n${err.stack}`;
  }

  return NextResponse.json(diagnostics);
}
