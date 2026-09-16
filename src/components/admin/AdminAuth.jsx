// AdminAuth.jsx - Google Sign-In & Email Whitelist Security Gate
'use client';

import { useState, useEffect } from 'react';
import { auth, provider, ADMIN_EMAILS } from '@/lib/firebase';

// If Firebase auth is unavailable (e.g., missing env vars), prevent auth actions
const firebaseReady = !!auth && !!provider;
import { signInWithPopup, signInWithRedirect, getRedirectResult, signOut, onAuthStateChanged } from 'firebase/auth';
import { ShieldAlert, ShieldCheck, LogOut, Lock } from 'lucide-react';
import StudentLogo from '../StudentLogo';

export default function AdminAuth({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // If Firebase auth is unavailable, skip listening and redirect handling.
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    // Handle redirect result (for fallback on localhost)
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        setUser(result.user);
      }
    }).catch((e) => {
      console.error('[Redirect Result Error]', e);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    if (!firebaseReady) {
      setAuthError('Firebase configuration missing. Sign‑in unavailable.');
      return;
    }
    setAuthError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('[Auth Error]', err);
      // Fallback for popup blocked or cancelled
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr) {
          console.error('[Redirect Auth Error]', redirectErr);
          setAuthError(redirectErr.message || 'Redirect authentication failed.');
        }
      } else {
        setAuthError(err.message || 'Authentication error. Please sign in with an authorized Google account.');
      }
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  // Check if current user is approved
  const isApproved = user && ADMIN_EMAILS.includes(user.email);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Verifying Founder Credentials...</p>
        </div>
      </div>
    );
  }

  // 1. Not signed in: Show Google Sign-In Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-6">
          <div className="flex justify-center">
            <StudentLogo size="lg" showTagline={false} className="text-white" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 px-3 py-1 rounded-full text-xs font-bold">
              <Lock className="w-3.5 h-3.5" /> Founder Studio Authentication
            </div>
            <h1 className="text-xl font-bold text-white mt-2">Sign in to Admin Studio</h1>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Restricted to authorized administrator email: <br />
              <strong className="text-teal-400 font-mono">kondeboyinaprabhas@gmail.com</strong>
            </p>
          </div>

          {authError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs text-left">
              <strong>Notice:</strong> {authError}
            </div>
          )}

          <div className="space-y-3">
            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-md active:scale-98 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign In with Google</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Signed in but NOT on whitelist: ACCESS DENIED SCREEN
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl space-y-4">
          <div className="w-14 h-14 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Access Denied</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The account <strong className="text-rose-300 font-mono">{user?.email}</strong> is not authorized to access the Founder Publishing Studio.
          </p>
          <div className="pt-2">
            <button
              onClick={handleSignOut}
              className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all inline-flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Administrator: Render Studio
  return (
    <div>
      {/* Founder Admin Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span className="text-slate-200 font-bold">Founder Studio</span>
          <span className="text-slate-600">•</span>
          <span className="text-[11px] font-mono text-teal-400">
            {user?.email || 'kondeboyinaprabhas@gmail.com'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-rose-400 font-semibold flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
      {typeof children === 'function' ? children({ user, adminEmail: user?.email || 'kondeboyinaprabhas@gmail.com' }) : children}
    </div>
  );
}
