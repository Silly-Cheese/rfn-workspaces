export const TASK_STATUSES = [
  'Pending',
  'Assigned',
  'In Progress',
  'Reviewing',
  'Completed',
  'Escalated'
];

export function buildTaskCard(task) {
  return `
    <article class="dashboard-card">
      <span class="status-pill">${task.status}</span>
      <h3>${task.title}</h3>
      <p class="muted">${task.description}</p>
    </article>
  `;
}
