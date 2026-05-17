export const AUDIT_STATUSES = [
  'Draft',
  'Open',
  'Under Review',
  'Corrective Action Required',
  'Closed'
];

export function createAuditCard(audit) {
  return `
    <article class="dashboard-card">
      <span class="status-pill">${audit.status}</span>
      <h3>${audit.title}</h3>
      <p class="muted">${audit.description}</p>
    </article>
  `;
}
