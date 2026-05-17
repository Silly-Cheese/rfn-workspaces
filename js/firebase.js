import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyDbPT5wV5u8VWN8z3RmzKB2rC8_AVQhpuY",
  authDomain: "rfn-workspace.firebaseapp.com",
  projectId: "rfn-workspace",
  storageBucket: "rfn-workspace.firebasestorage.app",
  messagingSenderId: "486448184491",
  appId: "1:486448184491:web:54e90548bec8386c974bee"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const REQUIRED_COLLECTION_DOCS = [
  ["systemSettings", "default", { portalName: "RFN Workspaces", workspaceCreationEnabled: true, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }],
  ["permissions", "default", { version: 1, note: "Default permission registry placeholder.", updatedAt: serverTimestamp() }],
  ["roles", "default", { owner: "RFN Owner", executive: "RFN Executive", management: "RFN Management", staff: "RFN Staff", customer: "Customer", updatedAt: serverTimestamp() }],
  ["departments", "default", { name: "General Operations", status: "active", createdAt: serverTimestamp() }],
  ["approvedCustomers", "_schema", { description: "Approved customer Discord IDs and workspace slots are stored here.", createdAt: serverTimestamp() }],
  ["workspaces", "_schema", { description: "Customer and RFN-owned workspaces are stored here.", createdAt: serverTimestamp() }],
  ["tickets", "_schema", { description: "Customer and RFN support tickets are stored here.", createdAt: serverTimestamp() }],
  ["internships", "_schema", { description: "RFN internship rooms and programs are stored here.", createdAt: serverTimestamp() }],
  ["activityLogs", "_schema", { description: "System action logs are stored here.", createdAt: serverTimestamp() }]
];

export async function bootstrapFirestore() {
  const results = [];
  for (const [collectionName, documentId, payload] of REQUIRED_COLLECTION_DOCS) {
    const ref = doc(db, collectionName, documentId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, payload, { merge: true });
      results.push(`${collectionName}/${documentId}: created`);
    } else {
      results.push(`${collectionName}/${documentId}: exists`);
    }
  }
  return results;
}
