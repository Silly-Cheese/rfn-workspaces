export function createNotificationCard(title, message) {
  const card = document.createElement('div');
  card.className = 'dashboard-card';

  const heading = document.createElement('h3');
  heading.textContent = title;

  const body = document.createElement('p');
  body.className = 'muted';
  body.textContent = message;

  card.appendChild(heading);
  card.appendChild(body);

  return card;
}

export function showTemporaryNotification(message) {
  const banner = document.createElement('div');
  banner.className = 'status-pill';
  banner.textContent = message;

  banner.style.position = 'fixed';
  banner.style.bottom = '20px';
  banner.style.right = '20px';
  banner.style.zIndex = '9999';

  document.body.appendChild(banner);

  setTimeout(() => {
    banner.remove();
  }, 3000);
}
