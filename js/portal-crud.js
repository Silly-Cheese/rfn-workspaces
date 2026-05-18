import { auth, db } from './firebase.js';
import { showToast } from './toasts.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js';
import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, serverTimestamp, updateDoc } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js';

function valueMap(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = typeof value === 'string' ? value.trim() : value;
  });
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
    const owner = data.username || data.createdBy || data.discordId || data.department || 'System';
    const details = data.summary || data.description || data.notes || data.robloxGroupName || data.assignment || 'Record saved in Firestore.';
    table.insertAdjacentHTML('beforeend', `<tr><td><strong>${title}</strong><br><span class="muted">${details}</span></td><td>${owner}</td><td>${status}</td><td class="table-actions"><button class="btn btn-outline" data-complete="${item.ref.path}">Complete</button><button class="btn btn-outline" data-delete="${item.ref.path}">Delete</button></td></tr>`);
  });
}

async function loadLists() {
  const lists = document.querySelectorAll('[data-list-collection]');
  for (const list of lists) {
    const collectionName = list.dataset.listCollection;
    const target = list.id;
    try {
      const q = query(collection(db, collectionName), limit(25));
      const snap = await getDocs(q);
      renderTable(target, snap);
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
  if (!user && document.body.dataset.public !== 'true') {
    window.location.href = '../login.html';
    return;
  }
  wireForms(user);
  wireActions();
  await loadLists();
});
