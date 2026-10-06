// src/app/api/admin/creator-referrals/route.js
// Secure Admin-Only API for Creator Referral CRUD
// - All Firestore access uses Firebase Admin SDK (bypasses client-side rules correctly)
// - Caller must send a valid Firebase ID token in Authorization: Bearer <token>
// - Token is verified server-side; only whitelisted admin emails are accepted
import 'server-only';
import { NextResponse } from 'next/server';
import { adminDb, adminAuth, FieldValue } from '@/lib/firebaseAdmin';
import { ADMIN_EMAILS } from '@/lib/firebase';

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function verifyAdminToken(request) {
  try {
    if (!adminAuth) return null;
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return null;
    const idToken = authHeader.slice(7);
    const decoded = await adminAuth.verifyIdToken(idToken);
    const email = (decoded.email || '').toLowerCase();
    const isAdmin = ADMIN_EMAILS.some((e) => e.toLowerCase() === email);
    return isAdmin ? decoded : null;
  } catch {
    return null;
  }
}

function checkAdminConfig() {
  if (!adminDb || !adminAuth) {
    return NextResponse.json({
      success: false,
      error: 'Firebase Admin credentials are not configured on the server. Please define FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local.'
    }, { status: 500 });
  }
  return null;
}

// ─── GET — list all creator referrals ────────────────────────────────────────

export async function GET(request) {
  const configErr = checkAdminConfig();
  if (configErr) return configErr;

  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }


  try {
    const snap = await adminDb
      .collection('creatorReferrals')
      .orderBy('createdAt', 'desc')
      .get();

    const referrals = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        // Convert Firestore Timestamp → serializable millis for the client
        createdAt: data.createdAt?.toMillis?.() ?? null,
        lastClickAt: data.lastClickAt?.toMillis?.() ?? null,
      };
    });

    return NextResponse.json({ success: true, referrals });
  } catch (err) {
    console.error('[CreatorReferrals API] GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── POST — create a new referral link ───────────────────────────────────────

export async function POST(request) {
  const configErr = checkAdminConfig();
  if (configErr) return configErr;

  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { creatorName, platform = 'youtube', campaignName = '', customSlug = '', createdBy = '' } = body;

    if (!creatorName?.trim()) {
      return NextResponse.json({ success: false, error: 'creatorName is required' }, { status: 400 });
    }

    // Safe slug generation (mirrors generateSafeSlug in firestoreStore.js)
    const toSlug = (text = '') =>
      text
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    const baseSlug = toSlug(customSlug || campaignName || creatorName) || 'creator';

    // Collision check
    const allSnap = await adminDb.collection('creatorReferrals').get();
    const existingSlugs = new Set(allSnap.docs.map((d) => d.data().slug));

    let uniqueSlug = baseSlug;
    let counter = 2;
    while (existingSlugs.has(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const payload = {
      slug: uniqueSlug,
      creatorName: creatorName.trim(),
      platform: (platform || 'other').toLowerCase(),
      campaignName: (campaignName || '').trim(),
      active: true,
      totalClicks: 0,
      uniqueVisitors: 0,
      lastClickAt: null,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: createdBy || admin.email || 'admin',
    };

    const docRef = await adminDb.collection('creatorReferrals').add(payload);
    return NextResponse.json({ success: true, id: docRef.id, slug: uniqueSlug });
  } catch (err) {
    console.error('[CreatorReferrals API] POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── PATCH — update / toggle a referral ──────────────────────────────────────

export async function PATCH(request) {
  const configErr = checkAdminConfig();
  if (configErr) return configErr;

  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, action, data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    const docRef = adminDb.collection('creatorReferrals').doc(id);

    if (action === 'toggle') {
      // Toggle active status
      const snap = await docRef.get();
      if (!snap.exists) {
        return NextResponse.json({ success: false, error: 'Referral not found' }, { status: 404 });
      }
      const currentStatus = snap.data().active;
      await docRef.update({ active: !currentStatus });
      return NextResponse.json({ success: true, newStatus: !currentStatus });
    }

    if (action === 'update' && data) {
      // General field update — strip immutable fields
      const cleanData = { ...data };
      delete cleanData.id;
      delete cleanData.createdAt;
      delete cleanData.totalClicks;
      delete cleanData.uniqueVisitors;
      await docRef.update(cleanData);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    console.error('[CreatorReferrals API] PATCH error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// ─── DELETE — permanently remove a referral ──────────────────────────────────

export async function DELETE(request) {
  const configErr = checkAdminConfig();
  if (configErr) return configErr;

  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'id is required' }, { status: 400 });
    }

    await adminDb.collection('creatorReferrals').doc(id).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[CreatorReferrals API] DELETE error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
