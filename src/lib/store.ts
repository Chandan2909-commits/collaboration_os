import {
  User,
  Organization,
  Department,
  Team,
  Board,
  BoardColumn,
  Task,
  Channel,
  Message,
  Notification,
  AuditLog,
  Invitation,
  UserRole,
  OrganizationMembership
} from './types';

// Initial Seed Users
export const SEED_USERS: User[] = [
  {
    id: 'usr_chandan',
    email: 'chandan@crosstech.io',
    full_name: 'Chandan Kumar',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'usr_rahul',
    email: 'rahul.mehta@crosstech.io',
    full_name: 'Rahul Mehta',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'usr_priya',
    email: 'priya.sharma@crosstech.io',
    full_name: 'Priya Sharma',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'usr_vikram',
    email: 'vikram.singh@crosstech.io',
    full_name: 'Vikram Singh',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'usr_ananya',
    email: 'ananya.roy@crosstech.io',
    full_name: 'Ananya Roy',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    status: 'ACTIVE'
  }
];

// Initial Organizations
export const SEED_ORGANIZATIONS: Organization[] = [
  {
    id: 'org_crosstech',
    name: 'CrossTech Enterprise',
    slug: 'crosstech-enterprise',
    logo_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    created_by: 'usr_chandan',
    created_at: '2026-01-15T09:00:00Z'
  },
  {
    id: 'org_apex',
    name: 'Apex Innovations',
    slug: 'apex-innovations',
    created_by: 'usr_external_apex',
    created_at: '2026-04-10T11:00:00Z'
  },
  {
    id: 'org_quantum',
    name: 'Quantum Scale Labs',
    slug: 'quantum-scale',
    created_by: 'usr_external_quantum',
    created_at: '2026-08-20T14:30:00Z'
  }
];

// Initial Organization Memberships (Strict Tenancy & Role Isolation)
export const SEED_MEMBERSHIPS: OrganizationMembership[] = [
  {
    id: 'mem_1',
    organization_id: 'org_crosstech',
    user_id: 'usr_chandan',
    role: 'ORGANIZATION_OWNER',
    status: 'ACTIVE',
    joined_at: '2026-01-15T09:00:00Z'
  },
  {
    id: 'mem_2',
    organization_id: 'org_crosstech',
    user_id: 'usr_rahul',
    role: 'DEPARTMENT_MANAGER',
    department_id: 'dept_tech',
    team_id: 'team_frontend',
    status: 'ACTIVE',
    joined_at: '2026-01-16T10:00:00Z'
  },
  {
    id: 'mem_3',
    organization_id: 'org_crosstech',
    user_id: 'usr_priya',
    role: 'DEPARTMENT_MANAGER',
    department_id: 'dept_product',
    team_id: 'team_design',
    status: 'ACTIVE',
    joined_at: '2026-01-16T10:15:00Z'
  },
  {
    id: 'mem_4',
    organization_id: 'org_crosstech',
    user_id: 'usr_vikram',
    role: 'TEAM_LEAD',
    department_id: 'dept_tech',
    team_id: 'team_backend',
    status: 'ACTIVE',
    joined_at: '2026-01-18T10:15:00Z'
  },
  {
    id: 'mem_5',
    organization_id: 'org_crosstech',
    user_id: 'usr_ananya',
    role: 'TEAM_MEMBER',
    department_id: 'dept_tech',
    team_id: 'team_ai',
    status: 'ACTIVE',
    joined_at: '2026-02-01T09:30:00Z'
  }
];

// Initial Departments
export const SEED_DEPARTMENTS: Department[] = [
  {
    id: 'dept_tech',
    organization_id: 'org_crosstech',
    name: 'Engineering & Tech',
    description: 'Core infrastructure, full-stack web, AI agents and distributed backends.',
    manager_id: 'usr_rahul',
    teams_count: 4,
    members_count: 24,
    created_at: '2026-01-16T10:00:00Z'
  },
  {
    id: 'dept_product',
    organization_id: 'org_crosstech',
    name: 'Product & Design',
    description: 'User experience research, UI architecture, prototyping, and feature roadmaps.',
    manager_id: 'usr_priya',
    teams_count: 2,
    members_count: 14,
    created_at: '2026-01-16T10:15:00Z'
  },
  {
    id: 'dept_ops',
    organization_id: 'org_crosstech',
    name: 'People & Operations',
    description: 'Talent recruitment, culture, compliance, legal, and company growth operations.',
    manager_id: 'usr_vikram',
    teams_count: 2,
    members_count: 8,
    created_at: '2026-01-20T12:00:00Z'
  },
  {
    id: 'dept_growth',
    organization_id: 'org_crosstech',
    name: 'Growth & Strategy',
    description: 'Enterprise outreach, partnerships, customer success, and metrics analysis.',
    manager_id: 'usr_ananya',
    teams_count: 2,
    members_count: 11,
    created_at: '2026-02-01T09:30:00Z'
  }
];

// Initial Teams
export const SEED_TEAMS: Team[] = [
  {
    id: 'team_frontend',
    organization_id: 'org_crosstech',
    department_id: 'dept_tech',
    department_name: 'Engineering & Tech',
    name: 'Frontend Core & UI Systems',
    description: 'Next.js App Router, ONIX Executive UI design, client performance & state.',
    lead_id: 'usr_rahul',
    members_count: 7,
    created_at: '2026-01-18T10:00:00Z'
  },
  {
    id: 'team_backend',
    organization_id: 'org_crosstech',
    department_id: 'dept_tech',
    department_name: 'Engineering & Tech',
    name: 'Cloud Services & Database',
    description: 'PostgreSQL Supabase schemas, multi-tenant RBAC enforcement & REST/WebSockets.',
    lead_id: 'usr_vikram',
    members_count: 8,
    created_at: '2026-01-18T10:15:00Z'
  },
  {
    id: 'team_ai',
    organization_id: 'org_crosstech',
    department_id: 'dept_tech',
    department_name: 'Engineering & Tech',
    name: 'AI Agent Systems',
    description: 'Agentic workflows, model orchestration, and automated task intelligence.',
    lead_id: 'usr_ananya',
    members_count: 5,
    created_at: '2026-02-10T14:00:00Z'
  },
  {
    id: 'team_design',
    organization_id: 'org_crosstech',
    department_id: 'dept_product',
    department_name: 'Product & Design',
    name: 'Design Systems & UX',
    description: 'Design tokens, dark-blue gradients, tactile button micro-interactions, vector charts.',
    lead_id: 'usr_priya',
    members_count: 6,
    created_at: '2026-01-20T11:00:00Z'
  }
];

export const DEFAULT_BOARD_COLUMNS: BoardColumn[] = [
  { id: 'col_backlog', board_id: 'brd_default', name: 'Backlog', position: 0, wip_limit: 15 },
  { id: 'col_todo', board_id: 'brd_default', name: 'To Do', position: 1, wip_limit: 8 },
  { id: 'col_in_progress', board_id: 'brd_default', name: 'In Progress', position: 2, wip_limit: 5 },
  { id: 'col_review', board_id: 'brd_default', name: 'Review', position: 3, wip_limit: 4 },
  { id: 'col_done', board_id: 'brd_default', name: 'Done', position: 4, wip_limit: 0 }
];

// Initial Board & Columns
export const SEED_BOARD: Board = {
  id: 'brd_default',
  organization_id: 'org_default',
  name: 'Main Kanban Board',
  description: 'Department agile workflows and deliverable tracking.',
  columns: DEFAULT_BOARD_COLUMNS
};

// Initial Tasks
export const SEED_TASKS: Task[] = [
  {
    id: 'tsk_1',
    organization_id: 'org_crosstech',
    department_id: 'dept_tech',
    board_id: 'brd_q4_sprint',
    column_id: 'col_in_progress',
    title: 'Implement Multi-Tenant RLS isolation in Supabase PostgreSQL',
    description: 'Enforce organization_id scoping at the database level and ensure cross-tenant leaks are mathematically impossible.',
    assigned_to: 'usr_vikram',
    priority: 'URGENT',
    position: 1000,
    due_date: '2026-10-05T18:00:00Z',
    created_at: '2026-09-28T09:00:00Z',
    comments: [
      {
        id: 'cm_1',
        task_id: 'tsk_1',
        user_id: 'usr_chandan',
        content: 'Crucial: every single query must use tenant context.',
        created_at: '2026-09-28T10:30:00Z'
      }
    ]
  },
  {
    id: 'tsk_2',
    organization_id: 'org_crosstech',
    department_id: 'dept_product',
    board_id: 'brd_q4_sprint',
    column_id: 'col_in_progress',
    title: 'Embed ONIX Floating Island & Dark-Blue Hero Card System',
    description: 'Incorporate 56px sticky topbar, collapsible 224px island sidebar, and 135deg linear gradient hero headers.',
    assigned_to: 'usr_priya',
    priority: 'HIGH',
    position: 2000,
    due_date: '2026-10-03T18:00:00Z',
    created_at: '2026-09-29T11:00:00Z'
  },
  {
    id: 'tsk_3',
    organization_id: 'org_crosstech',
    department_id: 'dept_tech',
    board_id: 'brd_q4_sprint',
    column_id: 'col_todo',
    title: 'Clerk Authentication & Webhook Sync to Supabase Users',
    description: 'Handle user.created and user.updated webhooks to atomically insert records into the public.users and organization_memberships tables.',
    assigned_to: 'usr_rahul',
    priority: 'HIGH',
    position: 1000,
    due_date: '2026-10-06T18:00:00Z',
    created_at: '2026-09-30T14:00:00Z'
  },
  {
    id: 'tsk_4',
    organization_id: 'org_crosstech',
    department_id: 'dept_product',
    board_id: 'brd_q4_sprint',
    column_id: 'col_review',
    title: 'Build Pure Vector SVG Dual Bézier Activity & Speedometer Gauges',
    description: 'Zero external chart dependency requirement. Pure responsive SVG math for cubic Bézier curves and 180° dial gauges.',
    assigned_to: 'usr_priya',
    priority: 'MEDIUM',
    position: 1000,
    due_date: '2026-10-02T18:00:00Z',
    created_at: '2026-09-27T08:00:00Z'
  },
  {
    id: 'tsk_5',
    organization_id: 'org_crosstech',
    department_id: 'dept_tech',
    board_id: 'brd_q4_sprint',
    column_id: 'col_done',
    title: 'RBAC Permission Hierarchy Matrix Specifications',
    description: 'Definitive mapping for Platform Admin, Org Owner, Admin, Dept Manager, Team Lead, and Member.',
    assigned_to: 'usr_chandan',
    priority: 'HIGH',
    position: 1000,
    due_date: '2026-09-26T18:00:00Z',
    created_at: '2026-09-25T10:00:00Z'
  },
  {
    id: 'tsk_6',
    organization_id: 'org_crosstech',
    department_id: 'dept_tech',
    board_id: 'brd_q4_sprint',
    column_id: 'col_backlog',
    title: 'Enterprise Single Sign-On (SAML / Okta) Integration',
    description: 'Support enterprise custom SAML connections for Fortune 500 organization tenants.',
    assigned_to: 'usr_ananya',
    priority: 'LOW',
    position: 1000,
    due_date: '2026-10-25T18:00:00Z',
    created_at: '2026-10-01T09:00:00Z'
  },
  {
    id: 'tsk_7',
    organization_id: 'org_crosstech',
    department_id: 'dept_ops',
    board_id: 'brd_q4_sprint',
    column_id: 'col_in_progress',
    title: 'Quarterly SOC2 Type II Audit & Employee Access Certification',
    description: 'Review access logs and revoke stale privileges across infrastructure.',
    assigned_to: 'usr_vikram',
    priority: 'HIGH',
    position: 1000,
    due_date: '2026-10-15T18:00:00Z',
    created_at: '2026-10-01T09:30:00Z'
  },
  {
    id: 'tsk_8',
    organization_id: 'org_crosstech',
    department_id: 'dept_growth',
    board_id: 'brd_q4_sprint',
    column_id: 'col_todo',
    title: 'Enterprise Account Expansion Playbook & Customer Success SLA',
    description: 'Deploy tier-1 priority SLA response flows and quarterly health check cadences.',
    assigned_to: 'usr_ananya',
    priority: 'MEDIUM',
    position: 1000,
    due_date: '2026-10-18T18:00:00Z',
    created_at: '2026-10-01T10:00:00Z'
  }
];

// Initial Channels
export const SEED_CHANNELS: Channel[] = [
  {
    id: 'chn_announcements',
    organization_id: 'org_crosstech',
    name: 'announcements',
    type: 'PUBLIC',
    description: 'Company-wide announcements and leadership updates.',
    unread_count: 0
  },
  {
    id: 'chn_general',
    organization_id: 'org_crosstech',
    name: 'general',
    type: 'PUBLIC',
    description: 'General discussion and cross-department collaboration.',
    unread_count: 2
  },
  {
    id: 'chn_eng',
    organization_id: 'org_crosstech',
    department_id: 'dept_tech',
    name: 'engineering-all',
    type: 'PUBLIC',
    description: 'Engineering department architecture discussions and releases.',
    unread_count: 1
  },
  {
    id: 'chn_frontend',
    organization_id: 'org_crosstech',
    department_id: 'dept_tech',
    team_id: 'team_frontend',
    name: 'frontend-core',
    type: 'PUBLIC',
    description: 'Frontend team sync, UI components, Next.js optimization.',
    unread_count: 0
  },
  {
    id: 'chn_ai_agents',
    organization_id: 'org_crosstech',
    department_id: 'dept_tech',
    team_id: 'team_ai',
    name: 'ai-agents-lab',
    type: 'PUBLIC',
    description: 'AI model orchestration, agent execution traces, and prompts.',
    unread_count: 0
  }
];

// Initial Messages
export const SEED_MESSAGES: Message[] = [
  {
    id: 'msg_1',
    channel_id: 'chn_general',
    sender_id: 'usr_chandan',
    content: 'Welcome team to the CrossTech Collaboration OS! We are combining Slack-style real-time channels with Jira-style multi-tenant Kanban boards.',
    created_at: '2026-10-01T09:15:00Z'
  },
  {
    id: 'msg_2',
    channel_id: 'chn_general',
    sender_id: 'usr_rahul',
    content: 'The floating island layout with ONIX executive styling looks exceptionally sharp. 224px collapsible sidebar is very smooth.',
    created_at: '2026-10-01T09:20:00Z'
  },
  {
    id: 'msg_3',
    channel_id: 'chn_general',
    sender_id: 'usr_priya',
    content: 'I verified the 5px ultra-slim custom scrollbars across Windows and macOS. Zero layout shift!',
    created_at: '2026-10-01T09:24:00Z'
  },
  {
    id: 'msg_4',
    channel_id: 'chn_eng',
    sender_id: 'usr_vikram',
    content: 'Supabase PostgreSQL schema has been drafted with proper tenant indexes and RLS policies on organization_id.',
    created_at: '2026-10-01T10:05:00Z'
  }
];

// Initial Notifications
export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    user_id: 'usr_chandan',
    organization_id: 'org_crosstech',
    type: 'TASK_ASSIGNED',
    title: 'New Task Assignment',
    message: 'Rahul Mehta assigned you to "RBAC Permission Hierarchy Matrix Specifications"',
    is_read: false,
    created_at: '2026-10-01T11:30:00Z'
  },
  {
    id: 'notif_2',
    user_id: 'usr_chandan',
    organization_id: 'org_crosstech',
    type: 'MESSAGE',
    title: 'New Message in #general',
    message: 'Priya Sharma commented on the design tokens',
    is_read: false,
    created_at: '2026-10-01T10:15:00Z'
  },
  {
    id: 'notif_3',
    user_id: 'usr_chandan',
    organization_id: 'org_crosstech',
    type: 'INVITATION',
    title: 'Member Invitation Accepted',
    message: 'Ananya Roy joined AI Agent Systems team',
    is_read: true,
    created_at: '2026-09-30T16:00:00Z'
  }
];

// Initial Audit Logs
export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_1',
    organization_id: 'org_crosstech',
    actor_id: 'usr_chandan',
    action: 'department.create',
    resource_type: 'Department',
    resource_id: 'dept_tech',
    metadata: { name: 'Engineering & Tech', manager: 'Rahul Mehta' },
    ip_address: '192.168.1.10',
    created_at: '2026-10-01T08:30:00Z'
  },
  {
    id: 'aud_2',
    organization_id: 'org_crosstech',
    actor_id: 'usr_rahul',
    action: 'team.create',
    resource_type: 'Team',
    resource_id: 'team_frontend',
    metadata: { name: 'Frontend Core & UI Systems', dept: 'Engineering & Tech' },
    ip_address: '192.168.1.14',
    created_at: '2026-10-01T09:00:00Z'
  },
  {
    id: 'aud_3',
    organization_id: 'org_crosstech',
    actor_id: 'usr_vikram',
    action: 'task.move',
    resource_type: 'Task',
    resource_id: 'tsk_1',
    metadata: { from_column: 'To Do', to_column: 'In Progress' },
    ip_address: '192.168.1.22',
    created_at: '2026-10-01T10:10:00Z'
  },
  {
    id: 'aud_4',
    organization_id: 'org_crosstech',
    actor_id: 'usr_chandan',
    action: 'member.invite',
    resource_type: 'Invitation',
    resource_id: 'inv_89a12c',
    metadata: { email: 'dev.lead@crosstech.io', role: 'TEAM_LEAD' },
    ip_address: '192.168.1.10',
    created_at: '2026-10-01T11:45:00Z'
  }
];

// Initial Invitations
export const SEED_INVITATIONS: Invitation[] = [
  {
    id: 'inv_1',
    organization_id: 'org_crosstech',
    department_id: 'dept_tech',
    team_id: 'team_ai',
    email: 'kavita.shukla@enterprise.com',
    role: 'TEAM_MEMBER',
    token_hash: 'tok_7f8a9e2b1c',
    expires_at: '2026-10-08T23:59:59Z',
    created_at: '2026-10-01T11:00:00Z'
  },
  {
    id: 'inv_2',
    organization_id: 'org_crosstech',
    department_id: 'dept_product',
    email: 'arjun.singh@designlab.io',
    role: 'TEAM_LEAD',
    token_hash: 'tok_3d4c5b6a7e',
    expires_at: '2026-10-08T23:59:59Z',
    created_at: '2026-10-01T12:30:00Z'
  }
];
