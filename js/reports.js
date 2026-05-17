export const REPORT_TYPES = [
  'Customer Evaluation',
  'Operational Incident',
  'Staff Observation',
  'Compliance Report'
];

export function createReportCard(report) {
  return `
    <article class="dashboard-card">
      <span class="status-pill">${report.type}</span>
      <h3>${report.title}</h3>
      <p class="muted">${report.summary}</p>
    </article>
  `;
}
