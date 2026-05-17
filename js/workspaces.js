import { db } from './firebase.js';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js';

const verificationForm = document.getElementById('workspaceVerificationForm');

if (verificationForm) {
  verificationForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const discordId = document.getElementById('discordId').value.trim();
    const result = document.getElementById('workspaceResult');

    if (!discordId) {
      result.textContent = 'Please enter a Discord ID.';
      return;
    }

    try {
      const approvalRef = doc(db, 'approvedCustomers', discordId);
      const approvalDoc = await getDoc(approvalRef);

      if (!approvalDoc.exists()) {
        result.innerHTML = '<strong>No approved customer record was found for that Discord ID.</strong>';
        return;
      }

      const data = approvalDoc.data();

      result.innerHTML = `
        <strong>Verification Successful</strong><br><br>
        Discord Username: ${data.discordUsername || 'Unknown'}<br>
        Roblox Group: ${data.robloxGroupName || 'Unknown'}<br>
        Available Workspace Creations: ${data.allowedWorkspaceCount || 0}<br>
        Status: ${data.status || 'Unknown'}
      `;

      const workspaceId = `workspace_${Date.now()}`;

      await setDoc(doc(db, 'workspaceRequests', workspaceId), {
        workspaceId,
        discordId,
        robloxGroupName: data.robloxGroupName || '',
        createdAt: serverTimestamp()
      });

    } catch (error) {
      result.textContent = error.message;
    }
  });
}
