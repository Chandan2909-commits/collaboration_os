-- ==============================================================================
-- CrossTech Collaboration OS - Supabase Database Schema
-- Multi-Tenant RBAC Hierarchy: Platform -> Organization -> Department -> Team -> Members
-- Built for Supabase (PostgreSQL 15+) with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. USERS TABLE
create table if not exists public.users (
  id uuid primary key default uuid_generate_v4(),
  clerk_id text unique,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  status text default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. ORGANIZATIONS TABLE
create table if not exists public.organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  logo_url text,
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. ORGANIZATION MEMBERSHIPS TABLE
create table if not exists public.organization_memberships (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('ORGANIZATION_OWNER', 'ORGANIZATION_ADMIN', 'DEPARTMENT_MANAGER', 'TEAM_LEAD', 'TEAM_MEMBER')),
  status text default 'ACTIVE' check (status in ('ACTIVE', 'PENDING', 'INACTIVE')),
  joined_at timestamptz default now(),
  unique (organization_id, user_id)
);

-- 4. DEPARTMENTS TABLE
create table if not exists public.departments (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  manager_id uuid references public.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. DEPARTMENT MEMBERSHIPS TABLE
create table if not exists public.department_memberships (
  id uuid primary key default uuid_generate_v4(),
  department_id uuid not null references public.departments(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text default 'MEMBER' check (role in ('MANAGER', 'MEMBER')),
  joined_at timestamptz default now(),
  unique (department_id, user_id)
);

-- 6. TEAMS TABLE
create table if not exists public.teams (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  name text not null,
  description text,
  lead_id uuid references public.users(id) on delete set null,
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. TEAM MEMBERSHIPS TABLE
create table if not exists public.team_memberships (
  id uuid primary key default uuid_generate_v4(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text default 'MEMBER' check (role in ('LEAD', 'MEMBER')),
  joined_at timestamptz default now(),
  unique (team_id, user_id)
);

-- 8. INVITATIONS TABLE
create table if not exists public.invitations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  department_id uuid references public.departments(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  email text not null,
  role text not null,
  token_hash text unique not null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  invited_by uuid references public.users(id),
  created_at timestamptz default now()
);

-- 9. KANBAN BOARDS TABLE
create table if not exists public.boards (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  department_id uuid references public.departments(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  name text not null,
  description text,
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 10. BOARD COLUMNS TABLE
create table if not exists public.board_columns (
  id uuid primary key default uuid_generate_v4(),
  board_id uuid not null references public.boards(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  wip_limit integer default 0,
  created_at timestamptz default now()
);

-- 11. TASKS TABLE
create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  board_id uuid not null references public.boards(id) on delete cascade,
  column_id uuid not null references public.board_columns(id) on delete cascade,
  title text not null,
  description text,
  created_by uuid references public.users(id),
  assigned_to uuid references public.users(id) on delete set null,
  priority text default 'MEDIUM' check (priority in ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  position double precision default 1000.0,
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 12. TASK COMMENTS TABLE
create table if not exists public.task_comments (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- 13. CHANNELS TABLE
create table if not exists public.channels (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  department_id uuid references public.departments(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  name text not null,
  type text default 'PUBLIC' check (type in ('PUBLIC', 'PRIVATE', 'DIRECT', 'GROUP')),
  description text,
  created_by uuid references public.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 14. CHANNEL MEMBERS TABLE
create table if not exists public.channel_members (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  joined_at timestamptz default now(),
  last_read_message_id uuid,
  unique (channel_id, user_id)
);

-- 15. MESSAGES TABLE
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  channel_id uuid not null references public.channels(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  reply_to_id uuid references public.messages(id) on delete set null,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  edited_at timestamptz
);

-- 16. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  reference_type text,
  reference_id text,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- 17. AUDIT LOGS TABLE
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references public.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text not null,
  metadata jsonb default '{}'::jsonb,
  ip_address text,
  created_at timestamptz default now()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE & MULTI-TENANCY ISOLATION
-- ==============================================================================
create index if not exists idx_org_memberships_user on public.organization_memberships(user_id);
create index if not exists idx_org_memberships_org on public.organization_memberships(organization_id);
create index if not exists idx_departments_org on public.departments(organization_id);
create index if not exists idx_teams_dept on public.teams(department_id);
create index if not exists idx_teams_org on public.teams(organization_id);
create index if not exists idx_tasks_board on public.tasks(board_id);
create index if not exists idx_tasks_column on public.tasks(column_id);
create index if not exists idx_tasks_org on public.tasks(organization_id);
create index if not exists idx_messages_channel on public.messages(channel_id);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read);
create index if not exists idx_audit_logs_org on public.audit_logs(organization_id);

-- Enable Supabase Realtime on critical tables
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.tasks;
alter publication supabase_realtime add table public.notifications;
