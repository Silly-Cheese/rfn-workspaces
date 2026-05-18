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
const STAFF_ROLES = ['Chief Executive Officer','Chief Operating Officer','Executive Director','Executive Assistant','Senior Director','Director','Associate Director','Deputy Director','Senior Operations Manager','Operations Manager','Assistant Manager','Management Trainee','Lead Associate','Senior Associate','Associate','Junior Associate','Trainee'];
const CUSTOMER_ROLES = ['Customer Owner', 'Customer Admin', 'Customer Staff', 'Customer Viewer'];

function normalizeUsername(username) {
  return username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
}
function usernameToEmail(username) { return `${normalizeUsername(username)}@${AUTH_DOMAIN}`; }
function rootPrefix() {
  const path = window.location.pathname;
  return path.includes('/customer/') || path.includes('/rfn/') || path.includes('/admin/') ? '../' : '';
}
function hasStaffAccess(profile) { return STAFF_ROLES.includes(profile.role) || profile.staffAccess === true || profile.isStaff === true; }
function hasCustomerAccess(profile) { return CUSTOMER_ROLES.includes(profile.role) || profile.customerAccess === true || profile.isCustomer === true; }
function dashboardForProfile(profile) {
  const staff = hasStaffAccess(profile);
  const customer = hasCustomerAccess(profile);
  if (staff && customer) return `${rootPrefix()}role-select.html`;
  if (staff) return `${rootPrefix()}rfn/employee-hub.html`;
  return `${rootPrefix()}customer/dashboard.html`;
}
async function safeBootstrap() {
  try { await bootstrapFirestore(); } catch (error) { console.warn('Bootstrap skipped:', error.message); }
}
async function getPendingProfile(username) {
  const cleanUsername = normalizeUsername(username);
  const owner = OWNER_USERNAMES.includes(cleanUsername);
  if (owner) {
    return { username: cleanUsername, displayName: cleanUsername, role: 'Chief Executive Officer', rank: 'Chief Executive Officer', department: 'Executive Leadership', status: 'active', staffAccess: true, customerAccess: true };
  }
  const pendingSnap = await getDoc(doc(db, 'pendingUsers', cleanUsername));
  if (!pendingSnap.exists()) return null;
  return pendingSnap.data();
}
async function ensureUserProfile(user, displayName = '', username = '') {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) return userSnap.data();

  const cleanUsername = normalizeUsername(username || user.email.split('@')[0]);
  const pending = await getPendingProfile(cleanUsername);
  if (!pending) throw new Error('This username has not been approved by RFN administration. Ask an administrator to add you first.');

  const profile = {
    uid: user.uid,
    username: cleanUsername,
    displayName: displayName || pending.displayName || cleanUsername,
    fullName: displayName || pending.displayName || cleanUsername,
    loginEmail: user.email || '',
    role: pending.role || 'Customer Owner',
    rank: pending.rank || pending.role || 'Customer Owner',
    department: pending.department || (pending.staffAccess ? 'RFN Operations' : 'Customer Workspace'),
    status: pending.status || 'active',
    staffAccess: pending.staffAccess === true || STAFF_ROLES.includes(pending.role),
    customerAccess: pending.customerAccess === true || CUSTOMER_ROLES.includes(pending.role),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(userRef, profile, { merge: true });
  await setDoc(doc(db, 'usernames', cleanUsername), { uid: user.uid, username: cleanUsername, createdAt: serverTimestamp() }, { merge: true });
  return profile;
}
async function finishLogin(credential, username, displayName = '') {
  const profile = await ensureUserProfile(credential.user, displayName, username);
  await safeBootstrap();
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
      const pending = await getPendingProfile(username);
      if (!pending) throw new Error('This username is not approved yet. An RFN administrator must add it before signup.');
      const credential = await createUserWithEmailAndPassword(auth, usernameToEmail(username), password);
      const profile = await finishLogin(credential, username, displayName);
      message.textContent = 'Account created successfully.';
      showToast('Account Created', 'Your RFN Workspaces account was created successfully.');
      setTimeout(() => { window.location.href = dashboardForProfile(profile); }, 900);
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
      const profile = await finishLogin(credential, username);
      message.textContent = 'Login successful.';
      showToast('Access Verified', 'Routing you to the correct RFN workspace.');
      setTimeout(() => { window.location.href = dashboardForProfile(profile); }, 800);
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
    setTimeout(() => { window.location.href = `${rootPrefix()}login.html`; }, 700);
  });
}
