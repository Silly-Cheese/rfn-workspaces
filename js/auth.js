import { auth, db, bootstrapFirestore } from './firebase.js';
import { showToast } from './toasts.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js';

const AUTH_DOMAIN = 'rfn-workspaces.local';
const OWNER_USERNAMES = ['executive_eagle', 'christophershelley', 'christophershelley257'];

function normalizeUsername(username) {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');
}

function usernameToEmail(username) {
  return `${normalizeUsername(username)}@${AUTH_DOMAIN}`;
}

async function safeBootstrap() {
  try {
    await bootstrapFirestore();
  } catch (error) {
    console.warn('Bootstrap skipped:', error.message);
  }
}

async function ensureUserProfile(user, displayName = '', username = '') {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  }

  const cleanUsername = normalizeUsername(username || user.email.split('@')[0]);
  const owner = OWNER_USERNAMES.includes(cleanUsername);

  const profile = {
    uid: user.uid,
    username: cleanUsername,
    displayName: displayName || cleanUsername,
    fullName: displayName || cleanUsername,
    loginEmail: user.email || '',
    role: owner ? 'Chief Executive Officer' : 'Customer Owner',
    rank: owner ? 'Chief Executive Officer' : 'Customer Owner',
    department: owner ? 'Executive Leadership' : 'Customer Workspace',
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(userRef, profile, { merge: true });
  await setDoc(doc(db, 'usernames', cleanUsername), {
    uid: user.uid,
    username: cleanUsername,
    createdAt: serverTimestamp()
  }, { merge: true });

  return profile;
}

await safeBootstrap();

const signupForm = document.getElementById('signupForm');

if (signupForm) {
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const displayName = document.getElementById('fullName')?.value.trim() || '';
    const usernameRaw = document.getElementById('username')?.value.trim() || '';
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    const username = normalizeUsername(usernameRaw);

    if (!username || username.length < 3) {
      message.textContent = 'Username must be at least 3 characters.';
      showToast('Signup Failed', 'Username must be at least 3 characters.', 'error');
      return;
    }

    try {
      const credential = await createUserWithEmailAndPassword(auth, usernameToEmail(username), password);
      await ensureUserProfile(credential.user, displayName, username);
      await safeBootstrap();

      message.textContent = 'Account created successfully.';
      showToast('Account Created', 'Your RFN Workspaces account was created successfully.');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1100);
    } catch (error) {
      message.textContent = error.message;
      showToast('Signup Failed', error.message, 'error');
    }
  });
}

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const usernameRaw = document.getElementById('username')?.value.trim() || '';
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    const username = normalizeUsername(usernameRaw);

    try {
      const credential = await signInWithEmailAndPassword(auth, usernameToEmail(username), password);
      await ensureUserProfile(credential.user, '', username);
      await safeBootstrap();

      message.textContent = 'Login successful.';
      showToast('Login Successful', 'Welcome back to RFN Workspaces.');

      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 900);
    } catch (error) {
      message.textContent = error.message;
      showToast('Login Failed', error.message, 'error');
    }
  });
}

const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await signOut(auth);
    showToast('Logged Out', 'You have been signed out.');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 700);
  });
}
