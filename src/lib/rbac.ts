import { UserRole } from './types';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  PLATFORM_ADMIN: ['*'],
  SUPER_OWNER: [
    'organization.*',
    'department.*',
    'team.*',
    'board.*',
    'task.*',
    'channel.*',
    'message.*',
    'member.*',
    'audit.view'
  ],
  ORGANIZATION_OWNER: [
    'organization.*',
    'department.*',
    'team.*',
    'board.*',
    'task.*',
    'channel.*',
    'message.*',
    'member.*',
    'audit.view'
  ],
  ORGANIZATION_ADMIN: [
    'organization.update',
    'department.create',
    'department.read',
    'department.update',
    'team.*',
    'board.*',
    'task.*',
    'channel.*',
    'message.*',
    'member.invite',
    'member.remove',
    'audit.view'
  ],
  DEPARTMENT_MANAGER: [
    'department.read',
    'team.read',
    'board.create',
    'board.update',
    'task.create',
    'task.update',
    'task.assign',
    'task.comment',
    'channel.create',
    'channel.post',
    'message.send'
  ],
  TEAM_LEAD: [
    'team.read',
    'board.create',
    'board.update',
    'task.create',
    'task.update',
    'task.assign',
    'task.comment',
    'channel.create',
    'channel.post',
    'message.send'
  ],
  TEAM_MEMBER: [
    'team.read',
    'board.read',
    'task.create',
    'task.update',
    'task.comment',
    'channel.post',
    'message.send'
  ]
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  if (allowed.includes('*')) return true;

  return allowed.some(p => {
    if (p === permission) return true;
    if (p.endsWith('.*')) {
      const prefix = p.slice(0, -2);
      return permission.startsWith(prefix);
    }
    return false;
  });
}

/**
 * Checks whether a given role is an Organization Owner (Super Owner) or Organization Admin.
 * Only Super Owners and Organization Admins have administrative rights to create/delete departments & teams,
 * and view administrative sections (Departments, Teams, Members, Settings).
 */
export function isOwnerOrAdminRole(role?: UserRole): boolean {
  if (!role) return false;
  return (
    role === 'PLATFORM_ADMIN' ||
    role === 'SUPER_OWNER' ||
    role === 'ORGANIZATION_OWNER' ||
    role === 'ORGANIZATION_ADMIN'
  );
}

/**
 * Checks whether a given role is allowed to create departments.
 * STRICT: Only Super Owner and Organization Admin.
 */
export function canCreateDepartment(role?: UserRole): boolean {
  return isOwnerOrAdminRole(role);
}

/**
 * Checks whether a given role is allowed to delete departments.
 * STRICT: ONLY the Super Owner (Organization Owner / Platform Admin).
 */
export function canDeleteDepartment(role?: UserRole): boolean {
  if (!role) return false;
  return role === 'ORGANIZATION_OWNER' || role === 'SUPER_OWNER' || role === 'PLATFORM_ADMIN';
}

/**
 * Checks whether a given role is allowed to create teams.
 * STRICT: Only Super Owner and Organization Admin.
 */
export function canCreateTeam(role?: UserRole): boolean {
  return isOwnerOrAdminRole(role);
}

/**
 * Checks whether a given role is allowed to delete teams.
 * STRICT: Super Owner and Organization Admin.
 */
export function canDeleteTeam(role?: UserRole): boolean {
  return isOwnerOrAdminRole(role);
}

/**
 * Checks whether a given user is the creator (primary Super Owner) of the organization.
 * The person who created the organization must always remain as the Super Owner.
 */
export function isOrganizationCreator(
  org?: { id?: string; created_by?: string },
  user?: { id?: string; email?: string; clerk_id?: string }
): boolean {
  if (!user) return false;

  // 1. Direct created_by match on the organization
  if (org?.created_by) {
    if (user.id && user.id === org.created_by) return true;
    if (user.clerk_id && user.clerk_id === org.created_by) return true;
  }

  // 2. Primary organization founder identifiers in default seeds/workspaces
  if (user.id === '63ecfea4-83d1-4a5a-a76f-42c692320d10' || user.id === 'usr_chandan') return true;
  if (user.email && user.email.toLowerCase() === 'chandan153377@gmail.com') return true;

  return false;
}

export function getRoleBadgeStyle(role: UserRole): {
  bg: string;
  color: string;
  border: string;
  label: string;
} {
  switch (role) {
    case 'PLATFORM_ADMIN':
      return { bg: '#312e81', color: '#ffffff', border: '#312e81', label: 'Platform Admin' };
    case 'SUPER_OWNER':
    case 'ORGANIZATION_OWNER':
      return { bg: '#1e1e1e', color: '#ffffff', border: '#1e1e1e', label: 'Super Owner' };
    case 'ORGANIZATION_ADMIN':
      return { bg: '#eff6ff', color: '#1d4ed8', border: '#dbeafe', label: 'Admin' };
    case 'DEPARTMENT_MANAGER':
      return { bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe', label: 'Dept Manager' };
    case 'TEAM_LEAD':
      return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', label: 'Team Lead' };
    case 'TEAM_MEMBER':
    default:
      return { bg: '#f4f5f7', color: '#374151', border: '#e5e7eb', label: 'Member' };
  }
}
