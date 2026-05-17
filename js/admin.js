export const ACCOUNT_STATUSES = [
  'Active',
  'Leave of Absence',
  'Suspended',
  'Restricted',
  'Terminated'
];

export function createAdminCard(title, description, status = 'System') {
  return `
    <article class="dashboard-card">
      <span class="status-pill">${status}</span>
      <h3>${title}</h3>
      <p class="muted">${description}</p>
    </article>
  `;
}
