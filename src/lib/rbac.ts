import { UserRole } from './types';

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  PLATFORM_ADMIN: ['*'],
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
    'department.*',
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
    'team.create',
    'team.update',
    'team.add_member',
    'team.remove_member',
    'board.create',
    'board.update',
    'task.create',
    'task.update',
    'task.assign',
    'task.comment',
    'channel.create',
    'channel.post',
    'message.send',
    'member.invite'
  ],
  TEAM_LEAD: [
    'team.read',
    'team.add_member',
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

export function getRoleBadgeStyle(role: UserRole): {
  bg: string;
  color: string;
  border: string;
  label: string;
} {
  switch (role) {
    case 'ORGANIZATION_OWNER':
      return { bg: '#1e1e1e', color: '#ffffff', border: '#1e1e1e', label: 'Owner' };
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
