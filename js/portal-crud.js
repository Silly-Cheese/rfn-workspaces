import { auth, db } from './firebase.js';
import { showToast } from './toasts.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, query, serverTimestamp, updateDoc } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js';

const STAFF_ROLES = ['Chief Executive Officer','Chief Operating Officer','Executive Director','Executive Assistant','Senior Director','Director','Associate Director','Deputy Director','Senior Operations Manager','Operations Manager','Assistant Manager','Management Trainee','Lead Associate','Senior Associate','Associate','Junior Associate','Trainee'];
const ADMIN_ROLES = ['Chief Executive Officer','Chief Operating Officer','Executive Director','Executive Assistant'];
const CUSTOMER_ROLES = ['Customer Owner','Customer Admin','Customer Staff','Customer Viewer'];

function rootPrefix() {
  const path = window.location.pathname;
  return path.includes('/customer/') || path.includes('/rfn/') || path.includes('/admin/') ? '../' : '';
}

function hasStaff(profile) { return STAFF_ROLES.includes(profile?.role) || profile?.staffAccess === true || profile?.isStaff === true; }
function hasAdmin(profile) { return ADMIN_ROLES.includes(profile?.role); }
function hasCustomer(profile) { return CUSTOMER_ROLES.includes(profile?.role) || profile?.customerAccess === true || profile?.isCustomer === true; }

function requiredAccess() {
  const path = window.location.pathname;
  if (path.includes('/admin/')) return 'admin';
  if (path.includes('/rfn/')) return 'staff';
  if (path.includes('/customer/')) return 'customer';
  return 'active';
}

async function enforceAccess(user) {
  if (!user && document.body.dataset.public !== 'true') {
    window.location.href = `${rootPrefix()}login.html`;
    return null;
  }
  if (!user) return null;
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) {
    window.location.href = `${rootPrefix()}login.html`;
    return null;
  }
  const profile = snap.data();
  if (profile.status !== 'active') {
    showToast('Account Restricted', 'Your account is not active. Contact RFN administration.', 'error');
    setTimeout(() => { window.location.href = `${rootPrefix()}login.html`; }, 900);
    return null;
  }
  const needed = requiredAccess();
  if (needed === 'admin' && !hasAdmin(profile)) {
    showToast('Access Denied', 'Only RFN executive administrators can open this page.', 'error');
    setTimeout(() => { window.location.href = `${rootPrefix()}role-select.html`; }, 900);
    return null;
  }
  if (needed === 'staff' && !hasStaff(profile)) {
    showToast('Access Denied', 'Only RFN staff can open this page.', 'error');
    setTimeout(() => { window.location.href = `${rootPrefix()}role-select.html`; }, 900);
    return null;
  }
  if (needed === 'customer' && !hasCustomer(profile)) {
    showToast('Access Denied', 'Only customer workspace users can open this page.', 'error');
    setTimeout(() => { window.location.href = `${rootPrefix()}role-select.html`; }, 900);
    return null;
  }
  return profile;
}

function valueMap(form) {
  const data = {};
  new FormData(form).forEach((value, key) => { data[key] = typeof value === 'string' ? value.trim() : value; });
  return data;
}

function renderTable(target, snapshot) {
  const table = document.getElementById(target);
  if (!table) return;
  if (snapshot.empty) {
    table.innerHTML = '<tr><td colspan="6">No records found yet.</td></tr>';
    return;
  }
  table.innerHTML = '';
  snapshot.forEach((item) => {
    const data = item.data();
    const title = data.title || data.name || data.workspaceName || data.reportType || data.programName || data.type || item.id;
    const status = data.status || 'Submitted';
    const owner = data.username || data.assignedTo || data.createdBy || data.discordId || data.department || 'System';
    const details = data.summary || data.description || data.notes || data.robloxGroupName || data.assignment || 'Record saved in Firestore.';
    table.insertAdjacentHTML('beforeend', `<tr><td><strong>${title}</strong><br><span class="muted">${details}</span></td><td>${owner}</td><td>${status}</td><td class="table-actions"><button class="btn btn-outline" data-complete="${item.ref.path}">Complete</button><button class="btn btn-outline" data-delete="${item.ref.path}">Delete</button></td></tr>`);
  });
}

async function loadLists() {
  const lists = document.querySelectorAll('[data-list-collection]');
  for (const list of lists) {
    const collectionName = list.dataset.listCollection;
    try {
      const q = query(collection(db, collectionName), limit(25));
      const snap = await getDocs(q);
      renderTable(list.id, snap);
    } catch (error) {
      list.innerHTML = `<tr><td colspan="6">${error.message}</td></tr>`;
    }
  }
}

function wireForms(user) {
  document.querySelectorAll('form[data-collection]').forEach((form) => {
    if (form.dataset.wired === 'true') return;
    form.dataset.wired = 'true';
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const collectionName = form.dataset.collection;
      const title = form.dataset.toastTitle || 'Submitted';
      const payload = valueMap(form);
      payload.status = payload.status || 'Submitted';
      payload.createdBy = user?.email || 'unknown';
      payload.createdAt = serverTimestamp();
      payload.updatedAt = serverTimestamp();
      try {
        await addDoc(collection(db, collectionName), payload);
        form.reset();
        showToast(title, 'The record was saved successfully.');
        await loadLists();
      } catch (error) {
        showToast('Save Failed', error.message, 'error');
      }
    });
  });
}

function wireActions() {
  document.addEventListener('click', async (event) => {
    const complete = event.target.closest('[data-complete]');
    const remove = event.target.closest('[data-delete]');
    try {
      if (complete) {
        const [collectionName, id] = complete.dataset.complete.split('/');
        await updateDoc(doc(db, collectionName, id), { status: 'Completed', updatedAt: serverTimestamp() });
        showToast('Record Completed', 'The record status was updated.');
        await loadLists();
      }
      if (remove) {
        const [collectionName, id] = remove.dataset.delete.split('/');
        await deleteDoc(doc(db, collectionName, id));
        showToast('Record Deleted', 'The record was removed.');
        await loadLists();
      }
    } catch (error) {
      showToast('Action Failed', error.message, 'error');
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  const profile = await enforceAccess(user);
  if (!profile && document.body.dataset.public !== 'true') return;
  wireForms(user);
  wireActions();
  await loadLists();
});
