export const INTERNSHIP_STATUSES = [
  'Draft',
  'Open',
  'In Progress',
  'Reviewing',
  'Completed'
];

export function createInternshipCard(internship) {
  return `
    <article class="dashboard-card">
      <span class="status-pill">${internship.status}</span>
      <h3>${internship.title}</h3>
      <p class="muted">${internship.description}</p>
    </article>
  `;
}
