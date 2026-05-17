export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

export function qsa(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

export function setText(selector, value, parent = document) {
  const element = qs(selector, parent);
  if (element) element.textContent = value ?? '';
}

export function showMessage(target, message, type = 'info') {
  const element = typeof target === 'string' ? qs(target) : target;
  if (!element) return;
  element.textContent = message;
  element.dataset.type = type;
}

export function formatDate(value) {
  if (!value) return 'Not recorded';
  const date = value.toDate ? value.toDate() : new Date(value);
  return date.toLocaleString();
}

export function normalizeId(value) {
  return String(value || '').trim().replace(/[^a-zA-Z0-9_-]/g, '');
}

export function generateId(prefix = 'rfn') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function requireFields(payload, fields) {
  const missing = fields.filter((field) => !payload[field]);
  if (missing.length) {
    throw new Error(`Missing required field(s): ${missing.join(', ')}`);
  }
}

export function redirect(path) {
  window.location.href = path;
}
