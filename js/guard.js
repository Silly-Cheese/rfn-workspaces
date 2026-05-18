import { auth, db } from './firebase.js';
import { showToast } from './toasts.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js';

const STAFF_ROLES = ['Chief Executive Officer','Chief Operating Officer','Executive Director','Executive Assistant','Senior Director','Director','Associate Director','Deputy Director','Senior Operations Manager','Operations Manager','Assistant Manager','Management Trainee','Lead Associate','Senior Associate','Associate','Junior Associate','Trainee'];
const ADMIN_ROLES = ['Chief Executive Officer','Chief Operating Officer','Executive Director','Executive Assistant'];
const CUSTOMER_ROLES = ['Customer Owner','Customer Admin','Customer Staff','Customer Viewer'];

function rootPrefix() {
  const path = window.location.pathname;
  return path.includes('/customer/') || path.includes('/rfn/') || path.includes('/admin/') ? '../' : '';
}

function hasStaff(profile) {
  return STAFF_ROLES.includes(profile?.role) || profile?.staffAccess === true || profile?.isStaff === true;
}

function hasAdmin(profile) {
  return ADMIN_ROLES.includes(profile?.role);
}

function hasCustomer(profile) {
  return CUSTOMER_ROLES.includes(profile?.role) || profile?.customerAccess === true || profile?.isCustomer === true;
}

function requiredAccess() {
  const path = window.location.pathname;
  if (path.includes('/admin/')) return 'admin';
  if (path.includes('/rfn/')) return 'staff';
  if (path.includes('/customer/')) return 'customer';
  return 'active';
}

function deny(message) {
  showToast('Access Denied', message, 'error');
  setTimeout(() => { window.location.href = `${rootPrefix()}role-select.html`; }, 900);
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = `${rootPrefix()}login.html`;
    return;
  }

  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (!snap.exists()) {
      window.location.href = `${rootPrefix()}login.html`;
      return;
    }

    const profile = snap.data();
    if (profile.status !== 'active') {
      showToast('Account Restricted', 'Your account is not active. Contact RFN administration.', 'error');
      setTimeout(() => { window.location.href = `${rootPrefix()}login.html`; }, 900);
      return;
    }

    const needed = requiredAccess();
    if (needed === 'admin' && !hasAdmin(profile)) return deny('Only RFN executive administrators can open this page.');
    if (needed === 'staff' && !hasStaff(profile)) return deny('Only RFN staff can open this page.');
    if (needed === 'customer' && !hasCustomer(profile)) return deny('Only customer workspace users can open this page.');
  } catch (error) {
    showToast('Access Check Failed', error.message, 'error');
    setTimeout(() => { window.location.href = `${rootPrefix()}login.html`; }, 900);
  }
});
