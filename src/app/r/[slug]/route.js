// src/app/r/[slug]/route.js - Public Creator Referral Attribution & Redirect Route
// Secure Server-Side Execution: Uses Firebase Admin SDK to bypass public security rules while keeping Firestore 100% locked down from the browser.
import { NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// In-memory 60s cache of active referral slugs to drastically cut Firestore reads during viral traffic spikes
const slugCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

// Ensure Firebase Admin is initialized; if not, we cannot proceed with DB ops.

// Conservative regex for bots/crawlers/link-previewers (do NOT count as user visits)
const BOT_REGEX = /bot|spider|crawl|facebookexternalhit|whatsapp|telegrambot|twitterbot|discordbot|slackbot|applebot|linkedinbot|embedly|quora link preview|pinterest/i;

export async function GET(request, { params }) {
  try {
    const rawParams = await params;
    const rawSlug = rawParams?.slug || '';
    const slug = rawSlug.toString().toLowerCase().trim();

    // Fallback URL: always normal homepage
    const homepageUrl = new URL('/', request.url);

    // Guard against missing Firestore admin instance (e.g., missing env vars in production)
    if (!slug) {
      return NextResponse.redirect(homepageUrl, 307);
    }
    if (!adminDb) {
      console.error('[CreatorTracking] adminDb is not initialized – missing Firebase Admin credentials');
      return NextResponse.redirect(homepageUrl, 307);
    }

    // 1. Resolve referral data (from in-memory cache or Firebase Admin Firestore)
    const now = Date.now();
    let cached = slugCache.get(slug);
    let referralDoc = null;

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      referralDoc = cached.data;
    } else {
      const snap = await adminDb
        .collection('creatorReferrals')
        .where('slug', '==', slug)
        .where('active', '==', true)
        .limit(1)
        .get();

      if (!snap.empty) {
        const firstDoc = snap.docs[0];
        referralDoc = {
          id: firstDoc.id,
          ...firstDoc.data()
        };
        slugCache.set(slug, {
          data: referralDoc,
          timestamp: now
        });
      } else {
        // Cache negative result briefly (15s) to mitigate repeated brute-force lookups
        slugCache.set(slug, {
          data: null,
          timestamp: now - (CACHE_TTL_MS - 15000)
        });
      }
    }

    // If referral link not found or inactive, gracefully redirect to homepage
    if (!referralDoc || !referralDoc.active) {
      return NextResponse.redirect(homepageUrl, 307);
    }

    // Determine target redirect destination (default to homepage /)
    const destinationPath = referralDoc.destinationUrl || referralDoc.destination || '/';
    let targetUrl;
    try {
      targetUrl = new URL(destinationPath, request.url);
    } catch {
      targetUrl = homepageUrl;
    }

    // Prepare response with 307 Temporary Redirect to destination
    const response = NextResponse.redirect(targetUrl, 307);

    // 2. Attribution Cookie: sei_ref (30-day first-party cookie)
    response.cookies.set('sei_ref', slug, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: 'lax',
      httpOnly: false // Accessible by client if needed for attribution
    });

    // 3. Bot & Crawler Check
    const userAgent = request.headers.get('user-agent') || '';
    const isBot = BOT_REGEX.test(userAgent);

    if (!isBot) {
      // 4. Unique Visitor and Rapid Refresh Handling via First-Party Cookie
      const uvCookieName = `sei_uv_${slug}`;
      const hasUvCookie = !!request.cookies.get(uvCookieName);

      // Rapid-refresh debounce cookie (blocks double-clicks within 10 seconds)
      const debounceCookieName = `sei_deb_${slug}`;
      const isRapidDebounced = !!request.cookies.get(debounceCookieName);

      if (!isRapidDebounced) {
        // Set debounce cookie for 10 seconds
        response.cookies.set(debounceCookieName, '1', {
          path: '/',
          maxAge: 10,
          sameSite: 'lax',
          httpOnly: true
        });

        // Privileged atomic increment using Firebase Admin SDK
        const docRef = adminDb.collection('creatorReferrals').doc(referralDoc.id);

        try {
          if (!hasUvCookie) {
            // First-time unique visitor for this referral
            response.cookies.set(uvCookieName, '1', {
              path: '/',
              maxAge: 30 * 24 * 60 * 60, // 30 days attribution window
              sameSite: 'lax',
              httpOnly: true
            });

            // Increment both totalClicks and uniqueVisitors
            await docRef.update({
              totalClicks: FieldValue.increment(1),
              uniqueVisitors: FieldValue.increment(1),
              lastClickAt: FieldValue.serverTimestamp()
            });
          } else {
            // Returning visitor on this link — increment only totalClicks
            await docRef.update({
              totalClicks: FieldValue.increment(1),
              lastClickAt: FieldValue.serverTimestamp()
            });
          }
        } catch (updateErr) {
          console.warn('[CreatorTracking Admin] increment error:', updateErr?.message);
        }
      }
    }

    return response;
  } catch (err) {
    console.error('[CreatorTracking] Route error:', err);
    // Graceful fallback: never show broken page to visitor
    return NextResponse.redirect(new URL('/', request.url), 307);
  }
}
