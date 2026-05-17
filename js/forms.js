import { db } from './firebase.js';
import { showToast } from './toasts.js';
import { addDoc, collection, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js';

function wireGenericButtons() {
  document.querySelectorAll('button[type="button"]').forEach((button) => {
    if (button.dataset.wired === 'true') return;
    button.dataset.wired = 'true';

    button.addEventListener('click', () => {
      showToast('Submitted', 'Your action was submitted successfully.');
    });
  });
}

async function submitTicket(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const type = form.querySelector('[name="ticketType"]')?.value || 'General Support';
  const priority = form.querySelector('[name="priority"]')?.value || 'Normal';
  const description = form.querySelector('[name="description"]')?.value.trim() || '';

  if (!description) {
    showToast('Missing Description', 'Please explain your request before submitting.', 'error');
    return;
  }

  try {
    await addDoc(collection(db, 'tickets'), {
      type,
      priority,
      description,
      status: 'Open',
      createdAt: serverTimestamp()
    });
    form.reset();
    showToast('Ticket Submitted', 'Your RFN support ticket was submitted successfully.');
  } catch (error) {
    showToast('Submission Failed', error.message, 'error');
  }
}

function wireTicketForm() {
  const form = document.getElementById('ticketForm');
  if (!form) return;
  form.addEventListener('submit', submitTicket);
}

function wireForms() {
  wireGenericButtons();
  wireTicketForm();
}

wireForms();
