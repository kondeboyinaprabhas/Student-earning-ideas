// src/app/api/diag-key/route.js
// TEMPORARY DIAGNOSTIC ONLY — reports ONLY structural metadata, NEVER key content
// DELETE THIS FILE after diagnosis is complete.
import 'server-only';
import { NextResponse } from 'next/server';
import { createPrivateKey } from 'crypto';

export async function GET() {
  const raw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  const exists = raw !== undefined;
  const isEmpty = raw === '';
  const totalLength = raw != null ? raw.length : 0;

  if (!raw) {
    return NextResponse.json({ exists, isEmpty, totalLength });
  }

  const startsDoubleQuote = raw.startsWith('"');
  const endsDoubleQuote   = raw.endsWith('"');
  const startsSingleQuote = raw.startsWith("'");
  const endsSingleQuote   = raw.endsWith("'");
  const quotesMatched     = (startsDoubleQuote && endsDoubleQuote) || (startsSingleQuote && endsSingleQuote);

  const hasLiteralBackslashN = raw.includes('\\n');
  const hasActualNewline     = raw.includes('\n');
  const hasDoubleEscapedN    = /\\\\n/.test(raw);

  // Apply same normalization as firebaseAdmin.js
  let normalized = raw.trim();
  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1);
  }
  normalized = normalized.replace(/\\n/g, '\n').trim();

  const normalizedLength       = normalized.length;
  const startsWithBeginHeader  = normalized.startsWith('-----BEGIN PRIVATE KEY-----');
  const endsWithEndHeader      = normalized.trimEnd().endsWith('-----END PRIVATE KEY-----');
  const containsActualNewline  = normalized.includes('\n');
  const newlineCount           = (normalized.match(/\n/g) || []).length;
  const stillHasLiteralNewline = normalized.includes('\\n');

  let cryptoResult = 'NOT_TESTED';
  let cryptoError  = null;
  try {
    createPrivateKey({ key: normalized, format: 'pem' });
    cryptoResult = 'SUCCESS';
  } catch (err) {
    cryptoResult = 'FAILED';
    cryptoError  = err.message;
  }

  return NextResponse.json({
    raw: {
      exists, isEmpty, totalLength,
      startsDoubleQuote, endsDoubleQuote,
      startsSingleQuote, endsSingleQuote,
      quotesMatched,
      hasLiteralBackslashN,
      hasActualNewline,
      hasDoubleEscapedN,
    },
    normalized: {
      normalizedLength,
      startsWithBeginHeader,
      endsWithEndHeader,
      containsActualNewline,
      newlineCount,
      stillHasLiteralNewline,
    },
    crypto: { result: cryptoResult, error: cryptoError },
  });
}
