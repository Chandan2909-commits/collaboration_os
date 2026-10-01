export type UserRole =
  | 'PLATFORM_ADMIN'
  | 'ORGANIZATION_OWNER'
  | 'ORGANIZATION_ADMIN'
  | 'DEPARTMENT_MANAGER'
  | 'TEAM_LEAD'
  | 'TEAM_MEMBER';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ChannelType = 'PUBLIC' | 'PRIVATE' | 'DIRECT' | 'GROUP';

export interface User {
  id: string;
  clerk_id?: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  created_by?: string;
  created_at?: string;
}

export interface OrganizationMembership {
  id: string;
  organization_id: string;
  user_id: string;
  role: UserRole;
  department_id?: string;
  team_id?: string;
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE';
  joined_at: string;
  user?: User;
  organization?: Organization;
}

export interface Department {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  manager_id?: string;
  manager?: User;
  teams_count?: number;
  members_count?: number;
  created_at?: string;
}

export interface Team {
  id: string;
  organization_id: string;
  department_id: string;
  department_name?: string;
  name: string;
  description?: string;
  lead_id?: string;
  lead?: User;
  members_count?: number;
  created_at?: string;
}

export interface TeamMembership {
  id: string;
  team_id: string;
  user_id: string;
  role: 'LEAD' | 'MEMBER';
  joined_at: string;
  user?: User;
}

export interface Board {
  id: string;
  organization_id: string;
  department_id?: string;
  team_id?: string;
  name: string;
  description?: string;
  created_at?: string;
  columns?: BoardColumn[];
}

export interface BoardColumn {
  id: string;
  board_id: string;
  name: string;
  position: number;
  wip_limit?: number;
}

export interface Task {
  id: string;
  organization_id: string;
  department_id?: string;
  board_id: string;
  column_id: string;
  title: string;
  description?: string;
  created_by?: string;
  assigned_to?: string;
  assignee?: User;
  priority: TaskPriority;
  position: number;
  due_date?: string;
  created_at: string;
  updated_at?: string;
  comments?: TaskComment[];
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user?: User;
  content: string;
  created_at: string;
}

export interface Channel {
  id: string;
  organization_id: string;
  department_id?: string;
  team_id?: string;
  name: string;
  type: ChannelType;
  description?: string;
  created_by?: string;
  unread_count?: number;
  created_at?: string;
}

export interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  sender?: User;
  content: string;
  reply_to_id?: string;
  attachments?: Array<{ name: string; url: string; size?: string }>;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  organization_id?: string;
  type: 'TASK_ASSIGNED' | 'MENTION' | 'MESSAGE' | 'INVITATION' | 'DEPT_UPDATE' | 'TEAM_UPDATE';
  title: string;
  message: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  actor_id?: string;
  actor?: User;
  action: string;
  resource_type: string;
  resource_id: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface Invitation {
  id: string;
  organization_id: string;
  organization_name?: string;
  department_id?: string;
  department_name?: string;
  team_id?: string;
  team_name?: string;
  email: string;
  role: UserRole;
  token_hash: string;
  expires_at: string;
  accepted_at?: string;
  invited_by?: string;
  created_at: string;
}
