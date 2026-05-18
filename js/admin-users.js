import { auth, db } from './firebase.js';
import { showToast } from './toasts.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js';
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js';

const staffRoles = ['Chief Executive Officer','Chief Operating Officer','Executive Director','Executive Assistant','Senior Director','Director','Associate Director','Deputy Director','Senior Operations Manager','Operations Manager','Assistant Manager','Management Trainee','Lead Associate','Senior Associate','Associate','Junior Associate','Trainee'];
const customerRoles = ['Customer Owner','Customer Admin','Customer Staff','Customer Viewer'];

function cleanUsername(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

function isAdmin(profile) {
  return ['Chief Executive Officer','Chief Operating Officer','Executive Director','Executive Assistant'].includes(profile?.role);
}

function rowTemplate(id, data, pending = false) {
  const status = data.status || 'active';
  const role = data.role || 'Customer Owner';
  const username = data.username || id;
  return `<tr>
    <td><strong>${username}</strong><br><span class="muted">${data.displayName || data.fullName || 'No display name'}</span></td>
    <td>${role}</td>
    <td>${data.staffAccess ? 'Staff' : ''}${data.staffAccess && data.customerAccess ? ' + ' : ''}${data.customerAccess ? 'Customer' : ''}</td>
    <td>${status}</td>
    <td class="table-actions">
      ${pending ? `<button class="btn btn-outline" data-action="delete-pending" data-id="${id}">Delete Invite</button>` : `
      <button class="btn btn-outline" data-action="restore" data-id="${id}">Restore</button>
      <button class="btn btn-outline" data-action="suspend" data-id="${id}">Suspend</button>
      <button class="btn btn-outline" data-action="terminate" data-id="${id}">Terminate</button>`}
    </td>
  </tr>`;
}

async function loadUsers() {
  const activeBody = document.getElementById('activeUsersBody');
  const pendingBody = document.getElementById('pendingUsersBody');
  if (!activeBody || !pendingBody) return;

  activeBody.innerHTML = '<tr><td colspan="5">Loading users...</td></tr>';
  pendingBody.innerHTML = '<tr><td colspan="5">Loading pending users...</td></tr>';

  try {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    activeBody.innerHTML = usersSnapshot.empty ? '<tr><td colspan="5">No active user profiles found.</td></tr>' : '';
    usersSnapshot.forEach((item) => {
      activeBody.insertAdjacentHTML('beforeend', rowTemplate(item.id, item.data(), false));
    });

    const pendingSnapshot = await getDocs(collection(db, 'pendingUsers'));
    pendingBody.innerHTML = pendingSnapshot.empty ? '<tr><td colspan="5">No pending users found.</td></tr>' : '';
    pendingSnapshot.forEach((item) => {
      pendingBody.insertAdjacentHTML('beforeend', rowTemplate(item.id, item.data(), true));
    });
  } catch (error) {
    showToast('Unable to Load Users', error.message, 'error');
  }
}

async function addPendingUser(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const username = cleanUsername(form.username.value);
  const displayName = form.displayName.value.trim();
  const role = form.role.value;
  const accessType = form.accessType.value;

  if (!username || username.length < 3) {
    showToast('Invalid Username', 'Usernames must be at least 3 characters.', 'error');
    return;
  }

  const staffAccess = accessType === 'staff' || accessType === 'both' || staffRoles.includes(role);
  const customerAccess = accessType === 'customer' || accessType === 'both' || customerRoles.includes(role);

  try {
    await setDoc(doc(db, 'pendingUsers', username), {
      username,
      displayName,
      role,
      rank: role,
      staffAccess,
      customerAccess,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    form.reset();
    showToast('User Prepared', 'The user can now create an account with that username.');
    await loadUsers();
  } catch (error) {
    showToast('User Add Failed', error.message, 'error');
  }
}

async function handleUserAction(event) {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  const id = button.dataset.id;

  try {
    if (action === 'delete-pending') {
      await deleteDoc(doc(db, 'pendingUsers', id));
      showToast('Pending User Deleted', 'The pending user record was removed.');
    } else {
      const status = action === 'restore' ? 'active' : action === 'suspend' ? 'Suspended' : 'Terminated';
      await updateDoc(doc(db, 'users', id), { status, updatedAt: serverTimestamp() });
      showToast('User Updated', `Account status changed to ${status}.`);
    }
    await loadUsers();
  } catch (error) {
    showToast('Action Failed', error.message, 'error');
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = '../login.html';
    return;
  }

  const profileSnap = await getDoc(doc(db, 'users', user.uid));
  const profile = profileSnap.exists() ? profileSnap.data() : null;
  if (!isAdmin(profile)) {
    showToast('Access Denied', 'Only RFN executive administrators can manage users.', 'error');
    setTimeout(() => { window.location.href = '../role-select.html'; }, 1000);
    return;
  }

  document.getElementById('addUserForm')?.addEventListener('submit', addPendingUser);
  document.addEventListener('click', handleUserAction);
  await loadUsers();
});
