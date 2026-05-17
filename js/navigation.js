export const NAVIGATION_LINKS = [
  {
    label: 'Dashboard',
    href: 'dashboard.html'
  },
  {
    label: 'Create Workspace',
    href: 'customer/create-workspace.html'
  },
  {
    label: 'My Workspace',
    href: 'customer/my-workspace.html'
  },
  {
    label: 'Tickets',
    href: 'customer/tickets.html'
  },
  {
    label: 'Internships',
    href: 'rfn/internships.html'
  },
  {
    label: 'Employee Hub',
    href: 'rfn/employee-hub.html'
  },
  {
    label: 'Activity Logs',
    href: 'rfn/activity-logs.html'
  },
  {
    label: 'Settings',
    href: 'admin/system-settings.html'
  }
];

export function activateNavigation() {
  const currentPath = window.location.pathname;

  document.querySelectorAll('.sidebar a').forEach((link) => {
    if (currentPath.includes(link.getAttribute('href'))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
