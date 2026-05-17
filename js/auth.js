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

const OWNER_EMAILS = ['christophershelley257@gmail.com'];

async function safeBootstrap() {
  try {
    await bootstrapFirestore();
  } catch (error) {
    console.warn('Bootstrap skipped:', error.message);
  }
}

async function ensureUserProfile(user, fullName = '') {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  }

  const owner = OWNER_EMAILS.includes((user.email || '').toLowerCase());

  const profile = {
    uid: user.uid,
    fullName: fullName || user.email || 'RFN User',
    email: user.email || '',
    role: owner ? 'Chief Executive Officer' : 'Customer Owner',
    rank: owner ? 'Chief Executive Officer' : 'Customer Owner',
    department: owner ? 'Executive Leadership' : 'Customer Workspace',
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  await setDoc(userRef, profile, { merge: true });
  return profile;
}

await safeBootstrap();

const signupForm = document.getElementById('signupForm');

if (signupForm) {
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const fullName = document.getElementById('fullName')?.value.trim() || '';
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(credential.user, fullName);
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

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(credential.user);
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
