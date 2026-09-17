// src/app/api/admin/push/send/route.js - Server-Side Web Push Dispatcher
import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { collection, getDocs, query, where, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, ADMIN_EMAILS } from '@/lib/firebase';
import { COLLECTIONS } from '@/lib/firestoreStore';

// Configure Web Push VAPID credentials securely from environment variables
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@studentearningideas.com';

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (err) {
    console.warn('[Push API] Error setting VAPID details:', err);
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, message, url, type = 'announcement', adminEmail } = body;

    // 1. Validate inputs
    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'Title and message are required.' },
        { status: 400 }
      );
    }

    // 2. Protect with admin email whitelist
    const normalizedEmail = (adminEmail || '').trim().toLowerCase();
    const isAuthorized = ADMIN_EMAILS.some((e) => e.toLowerCase() === normalizedEmail);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 403 }
      );
    }

    // 3. Ensure database and VAPID credentials are configured
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firestore database is not initialized.' },
        { status: 500 }
      );
    }

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { success: false, error: 'VAPID keys are missing from server configuration.' },
        { status: 500 }
      );
    }

    // 4. Fetch all active push subscriptions from Firestore
    const subQuery = query(
      collection(db, COLLECTIONS.PUSH_SUBSCRIPTIONS || 'pushSubscriptions'),
      where('active', '==', true)
    );
    const snap = await getDocs(subQuery);

    if (snap.empty) {
      return NextResponse.json({
        success: true,
        sentCount: 0,
        failedCount: 0,
        totalSubscribers: 0,
        message: 'No active push subscriptions found.',
      });
    }

    // 5. Build push payload
    const payload = JSON.stringify({
      title: title.trim(),
      message: message.trim(),
      url: url || '/',
      type,
      timestamp: Date.now(),
    });

    let sentCount = 0;
    let failedCount = 0;
    const expiredDocIds = [];

    // 6. Send push notifications with error handling & expired subscription cleanup
    const sendPromises = snap.docs.map(async (subDoc) => {
      const subData = subDoc.data();
      const subscription = {
        endpoint: subData.endpoint,
        keys: subData.keys,
      };

      try {
        await webpush.sendNotification(subscription, payload);
        sentCount++;
      } catch (err) {
        failedCount++;
        // HTTP 404 Not Found or 410 Gone indicates expired or revoked subscription
        if (err.statusCode === 404 || err.statusCode === 410) {
          expiredDocIds.push(subDoc.id);
        } else {
          console.warn(`[Push API] Failed to send to ${subDoc.id}:`, err.message);
        }
      }
    });

    await Promise.allSettled(sendPromises);

    // 7. Prune expired subscriptions safely in Firestore
    for (const docId of expiredDocIds) {
      try {
        const docRef = doc(db, COLLECTIONS.PUSH_SUBSCRIPTIONS || 'pushSubscriptions', docId);
        await updateDoc(docRef, {
          active: false,
          expiredAt: serverTimestamp(),
        });
      } catch (pruneErr) {
        console.warn(`[Push API] Failed to prune expired subscription ${docId}:`, pruneErr);
      }
    }

    // 8. Record notification dispatch to Admin Activity Log
    try {
      await addDoc(collection(db, COLLECTIONS.ACTIVITY_LOG || 'adminActivityLog'), {
        action: 'Push Notification Sent',
        entityId: type,
        entityType: 'Notification',
        adminEmail: normalizedEmail,
        details: `Dispatched "${title}" to ${sentCount} subscribers (${failedCount} failed, ${expiredDocIds.length} pruned)`,
        timestamp: serverTimestamp(),
      });
    } catch (logErr) {
      console.warn('[Push API] Failed to log activity:', logErr);
    }

    return NextResponse.json({
      success: true,
      sentCount,
      failedCount,
      prunedCount: expiredDocIds.length,
      totalSubscribers: snap.size,
    });
  } catch (err) {
    console.error('[Push API] Fatal error sending notifications:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
