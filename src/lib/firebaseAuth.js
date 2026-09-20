// src/lib/firebaseAuth.js - Isolated Firebase Auth for Admin Features Only
// Kept separate so the public homepage and client-side feeds do not import
// the 93+ KiB Firebase Auth SDK or spawn the background auth iframe.

import { app, ADMIN_EMAILS } from './firebase';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

export { ADMIN_EMAILS };
