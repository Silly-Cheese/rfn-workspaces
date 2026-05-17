export const ROLE_GROUPS = {
  owner: ['Chief Executive Officer'],
  executive: ['Chief Operating Officer', 'Executive Director', 'Executive Assistant'],
  seniorManagement: ['Senior Director', 'Director', 'Associate Director', 'Deputy Director'],
  management: ['Senior Operations Manager', 'Operations Manager', 'Assistant Manager', 'Management Trainee'],
  seniorStaff: ['Lead Associate', 'Senior Associate'],
  staff: ['Associate', 'Junior Associate', 'Trainee'],
  customer: ['Customer Owner', 'Customer Admin', 'Customer Staff', 'Customer Viewer']
};

export function isExecutive(role) {
  return ROLE_GROUPS.owner.includes(role) || ROLE_GROUPS.executive.includes(role);
}

export function isManagement(role) {
  return ROLE_GROUPS.seniorManagement.includes(role) || ROLE_GROUPS.management.includes(role);
}

export function isStaff(role) {
  return ROLE_GROUPS.staff.includes(role) || ROLE_GROUPS.seniorStaff.includes(role);
}

export function canEditWorkspace(role) {
  return isExecutive(role) || isManagement(role);
}

export function canViewWorkspace(role) {
  return isExecutive(role) || isManagement(role) || isStaff(role);
}
