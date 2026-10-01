'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { isClerkConfigured } from './clerk';
import { DEFAULT_BOARD_COLUMNS } from './store';
import {
  syncUserAndFetchWorkspace,
  createOrgInSupabase,
  createDepartmentInSupabase,
  createTeamInSupabase,
  deleteDepartmentInSupabase,
  deleteTeamInSupabase
} from './sync';
import {
  Organization,
  User,
  UserRole,
  Department,
  Team,
  Board,
  Task,
  Channel,
  Message,
  Notification,
  AuditLog,
  Invitation,
  OrganizationMembership
} from './types';
import {
  SEED_ORGANIZATIONS,
  SEED_USERS,
  SEED_DEPARTMENTS,
  SEED_TEAMS,
  SEED_BOARD,
  SEED_TASKS,
  SEED_CHANNELS,
  SEED_MESSAGES,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  SEED_INVITATIONS,
  SEED_MEMBERSHIPS
} from './store';

interface AppContextType {
  organizations: Organization[];
  userOrganizations: Organization[];
  currentOrg: Organization;
  hasActiveOrganization: boolean;
  isInitialLoading: boolean;
  setCurrentOrg: (org: Organization) => void;
  createOrganization: (name: string, slug: string) => Organization;
  createInitialCompany: (data: { name: string; slug: string; departmentName: string }) => Organization;
  
  users: User[];
  currentUser: User & { role: UserRole };
  memberships: OrganizationMembership[];
  currentUserMembership?: OrganizationMembership;
  setCurrentUserRole: (role: UserRole) => void;
  switchUser: (userId: string) => void;
  
  // Role & Tenant Management (Controlled by Org Owner)
  updateMemberRole: (userId: string, newRole: UserRole) => void;
  updateMemberDepartment: (userId: string, deptId?: string, teamId?: string) => void;
  removeMember: (userId: string) => void;
  addEmployee: (emp: { full_name: string; email: string; role: UserRole; department_id?: string; team_id?: string }) => void;
  
  departments: Department[];
  addDepartment: (dept: { name: string; description: string; manager_id?: string }) => Department;
  deleteDepartment: (deptId: string) => Promise<boolean>;
  
  teams: Team[];
  addTeam: (team: { name: string; description: string; department_id: string; lead_id?: string }) => Team;
  deleteTeam: (teamId: string) => Promise<boolean>;
  
  board: Board;
  tasks: Task[];
  addTask: (task: { title: string; description?: string; column_id: string; priority: Task['priority']; assigned_to?: string; due_date?: string; department_id?: string }) => Task;
  moveTask: (taskId: string, targetColId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addTaskComment: (taskId: string, content: string) => void;
  
  channels: Channel[];
  activeChannel: Channel;
  setActiveChannel: (channel: Channel) => void;
  addChannel: (channel: { name: string; type: Channel['type']; description?: string; department_id?: string; team_id?: string }) => Channel;
  messages: Message[];
  sendMessage: (content: string, replyToId?: string) => Message;
  
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  
  auditLogs: AuditLog[];
  invitations: Invitation[];
  createInvitation: (inv: { email: string; role: UserRole; department_id?: string; team_id?: string }) => Invitation;
  acceptInvitation: (token: string, userOverride?: Partial<User>) => { success: boolean; organization?: Organization; role?: UserRole; error?: string };
  
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;
  
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  
  isInviteModalOpen: boolean;
  setIsInviteModalOpen: (open: boolean) => void;
  
  isCreateOrgModalOpen: boolean;
  setIsCreateOrgModalOpen: (open: boolean) => void;
  
  isCreateDeptModalOpen: boolean;
  setIsCreateDeptModalOpen: (open: boolean) => void;
  
  isCreateTeamModalOpen: boolean;
  setIsCreateTeamModalOpen: (open: boolean) => void;
  
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (open: boolean) => void;
  
  activeTaskForModal: Task | null;
  setActiveTaskForModal: (task: Task | null) => void;
  
  isLoading: boolean;
  triggerLoader: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function decodeInviteToken(token: string): {
  tok?: string;
  org_id?: string;
  org_name?: string;
  org_slug?: string;
  dept_id?: string;
  dept_name?: string;
  team_id?: string;
  email?: string;
  role?: UserRole;
  exp?: number;
} | null {
  try {
    let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonStr = decodeURIComponent(escape(atob(base64)));
    const data = JSON.parse(jsonStr);
    if (data && (data.org_id || data.org_name)) {
      return data;
    }
  } catch (e) {
    // not base64 payload
  }
  return null;
}

function ClerkUserSync({ onSync, onDoneLoading }: { onSync: (user: any) => Promise<void>; onDoneLoading: () => void }) {
  const { user, isLoaded } = useUser();
  const syncedUserIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (user) {
        if (syncedUserIdRef.current !== user.id) {
          syncedUserIdRef.current = user.id;
          onSync(user).finally(() => onDoneLoading());
        } else {
          onDoneLoading();
        }
      } else {
        onDoneLoading();
      }
    }
  }, [isLoaded, user, onSync, onDoneLoading]);
  return null;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crosstech_orgs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [{
      id: '0a3faf5c-a66c-411f-96f9-36c3d138a5b8',
      name: 'CrossTech Solutions',
      slug: 'crosstechsolutions',
      created_by: '63ecfea4-83d1-4a5a-a76f-42c692320d10'
    }];
  });

  const [currentOrgState, setCurrentOrgState] = useState<Organization>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crosstech_orgs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
        }
      } catch {}
    }
    return {
      id: '0a3faf5c-a66c-411f-96f9-36c3d138a5b8',
      name: 'CrossTech Solutions',
      slug: 'crosstechsolutions',
      created_by: '63ecfea4-83d1-4a5a-a76f-42c692320d10'
    };
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crosstech_users');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [{
      id: '63ecfea4-83d1-4a5a-a76f-42c692320d10',
      email: 'chandan153377@gmail.com',
      full_name: 'Chandan Kumar',
      clerk_id: 'user_3K6aLGTFuKMq1ClDc4K2LJeNluB',
      status: 'ACTIVE'
    }];
  });

  const [memberships, setMemberships] = useState<OrganizationMembership[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crosstech_memberships');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [{
      id: '750b64f1-2f9c-4fb8-992a-64bc5d02c69c',
      organization_id: '0a3faf5c-a66c-411f-96f9-36c3d138a5b8',
      user_id: '63ecfea4-83d1-4a5a-a76f-42c692320d10',
      role: 'ORGANIZATION_OWNER',
      status: 'ACTIVE'
    }];
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crosstech_depts');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [
      {
        id: '317acf71-c5d5-47fa-adc1-d13482e86f02',
        organization_id: '0a3faf5c-a66c-411f-96f9-36c3d138a5b8',
        name: 'Engineering & Operations',
        description: 'Core engineering and technical operations',
        manager_id: '63ecfea4-83d1-4a5a-a76f-42c692320d10'
      },
      {
        id: 'e1e9cf6a-d9b0-48d2-a2c4-be2e1aeb8abb',
        organization_id: '0a3faf5c-a66c-411f-96f9-36c3d138a5b8',
        name: 'Product & Design',
        description: 'Product innovation and UI/UX design',
        manager_id: '63ecfea4-83d1-4a5a-a76f-42c692320d10'
      }
    ];
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crosstech_teams');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [board, setBoard] = useState<Board>(SEED_BOARD);
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crosstech_tasks');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [];
  });

  const [channels, setChannels] = useState<Channel[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crosstech_channels');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return [{
      id: 'chan_general',
      organization_id: '0a3faf5c-a66c-411f-96f9-36c3d138a5b8',
      name: 'general',
      type: 'PUBLIC',
      description: 'Company announcements and general discussion'
    }];
  });

  const [activeChannel, setActiveChannel] = useState<Channel>(() => ({
    id: 'chan_general',
    organization_id: '0a3faf5c-a66c-411f-96f9-36c3d138a5b8',
    name: 'general',
    type: 'PUBLIC'
  }));

  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  
  const [currentUser, setCurrentUserState] = useState<User & { role: UserRole }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crosstech_current_user');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return {
      id: '63ecfea4-83d1-4a5a-a76f-42c692320d10',
      email: 'chandan153377@gmail.com',
      full_name: 'Chandan Kumar',
      role: 'ORGANIZATION_OWNER'
    };
  });

  // Load persisted real data on mount
  useEffect(() => {
    try {
      const savedOrgs = localStorage.getItem('crosstech_orgs');
      if (savedOrgs) {
        const parsed = JSON.parse(savedOrgs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrganizations(parsed);
          setCurrentOrgState(parsed[0]);
        }
      }
      const savedUsers = localStorage.getItem('crosstech_users');
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      const savedMems = localStorage.getItem('crosstech_memberships');
      if (savedMems) setMemberships(JSON.parse(savedMems));
      const savedDepts = localStorage.getItem('crosstech_depts');
      if (savedDepts) setDepartments(JSON.parse(savedDepts));
      const savedTeams = localStorage.getItem('crosstech_teams');
      if (savedTeams) setTeams(JSON.parse(savedTeams));
      const savedTasks = localStorage.getItem('crosstech_tasks');
      if (savedTasks) setTasks(JSON.parse(savedTasks));
      const savedChans = localStorage.getItem('crosstech_channels');
      if (savedChans) {
        const chans = JSON.parse(savedChans);
        setChannels(chans);
        if (chans.length > 0) setActiveChannel(chans[0]);
      }
    } catch (e) {
      console.warn('Failed to load saved state from localStorage:', e);
    }
    setIsInitialLoading(false);
  }, []);

  // Continuous localStorage persistence
  useEffect(() => {
    if (tasks.length > 0) {
      try { localStorage.setItem('crosstech_tasks', JSON.stringify(tasks)); } catch {}
    }
  }, [tasks]);

  useEffect(() => {
    if (departments.length > 0) {
      try { localStorage.setItem('crosstech_depts', JSON.stringify(departments)); } catch {}
    }
  }, [departments]);

  useEffect(() => {
    if (teams.length > 0) {
      try { localStorage.setItem('crosstech_teams', JSON.stringify(teams)); } catch {}
    }
  }, [teams]);

  useEffect(() => {
    if (memberships.length > 0) {
      try { localStorage.setItem('crosstech_memberships', JSON.stringify(memberships)); } catch {}
    }
  }, [memberships]);

  useEffect(() => {
    if (channels.length > 0) {
      try { localStorage.setItem('crosstech_channels', JSON.stringify(channels)); } catch {}
    }
  }, [channels]);

  const handleClerkUserSync = useCallback(async (clerkUser: any) => {
    const userEmail = clerkUser.primaryEmailAddress?.emailAddress || '';
    const userFullName = clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'Workspace Owner';
    const userId = clerkUser.id;
    const userAvatar = clerkUser.imageUrl;

    try {
      const wsData = await syncUserAndFetchWorkspace(userEmail, userId, userFullName, userAvatar);
      if (wsData) {
        const resolvedUserId = wsData.user?.id || userId;

        const userObj: User & { role: UserRole } = {
          id: resolvedUserId,
          email: userEmail,
          full_name: userFullName,
          avatar_url: userAvatar,
          role: wsData.memberships?.[0]?.role || 'ORGANIZATION_OWNER',
          status: 'ACTIVE'
        };

        setCurrentUserState(userObj);
        try {
          localStorage.setItem('crosstech_current_user', JSON.stringify(userObj));
        } catch {}

        if (wsData.users && wsData.users.length > 0) {
          setUsers(wsData.users);
          try {
            localStorage.setItem('crosstech_users', JSON.stringify(wsData.users));
          } catch {}
        } else {
          setUsers(prev => {
            const uObj: User = {
              id: resolvedUserId,
              email: userEmail,
              full_name: userFullName,
              avatar_url: userAvatar,
              status: 'ACTIVE'
            };
            const existing = prev.find(u => u.id === resolvedUserId || u.email === userEmail);
            if (!existing) return [uObj, ...prev];
            return prev.map(u => (u.id === resolvedUserId || u.email === userEmail ? { ...u, ...uObj } : u));
          });
        }

        if (wsData.organizations && wsData.organizations.length > 0) {
          setOrganizations(wsData.organizations);
          setCurrentOrgState(wsData.organizations[0]);
          try {
            localStorage.setItem('crosstech_orgs', JSON.stringify(wsData.organizations));
          } catch {}
        }

        if (wsData.memberships && wsData.memberships.length > 0) {
          setMemberships(wsData.memberships);
          try {
            localStorage.setItem('crosstech_memberships', JSON.stringify(wsData.memberships));
          } catch {}
        }

        if (wsData.departments && wsData.departments.length > 0) {
          setDepartments(wsData.departments);
          try {
            localStorage.setItem('crosstech_depts', JSON.stringify(wsData.departments));
          } catch {}
        }

        if (wsData.teams && wsData.teams.length > 0) {
          setTeams(wsData.teams);
          try {
            localStorage.setItem('crosstech_teams', JSON.stringify(wsData.teams));
          } catch {}
        }

        if (wsData.tasks) {
          setTasks(wsData.tasks);
          try {
            localStorage.setItem('crosstech_tasks', JSON.stringify(wsData.tasks));
          } catch {}
        }

        if (wsData.boards && wsData.boards.length > 0) {
          setBoard(wsData.boards[0]);
        }

        if (wsData.channels && wsData.channels.length > 0) {
          setChannels(wsData.channels);
          setActiveChannel(wsData.channels[0]);
          try {
            localStorage.setItem('crosstech_channels', JSON.stringify(wsData.channels));
          } catch {}
        }
      } else {
        const fallbackUser: User & { role: UserRole } = {
          id: userId,
          email: userEmail,
          full_name: userFullName,
          avatar_url: userAvatar,
          role: 'ORGANIZATION_OWNER',
          status: 'ACTIVE'
        };
        setCurrentUserState(fallbackUser);
        try {
          localStorage.setItem('crosstech_current_user', JSON.stringify(fallbackUser));
        } catch {}
      }
    } catch (err) {
      console.warn('Failed to sync workspace with Supabase:', err);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Multi-Tenant Isolation: Match user's organizations
  const userOrganizations = organizations.filter(org => {
    if (memberships.length === 0) return true;
    return memberships.some(m =>
      m.organization_id === org.id &&
      (
        m.user_id === currentUser.id ||
        m.user_id === 'usr_init' ||
        m.user_id === '63ecfea4-83d1-4a5a-a76f-42c692320d10' ||
        (m.user?.email && currentUser.email && m.user.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        !currentUser.email
      )
    );
  });

  const hasActiveOrganization = organizations.length > 0;
  const currentOrg =
    userOrganizations.find(o => o.id === currentOrgState.id) ||
    organizations.find(o => o.id === currentOrgState.id) ||
    userOrganizations[0] ||
    organizations[0] ||
    currentOrgState;

  // Calculate current membership
  const currentUserMembership = memberships.find(
    m =>
      (
        m.user_id === currentUser.id ||
        m.user_id === 'usr_init' ||
        m.user_id === '63ecfea4-83d1-4a5a-a76f-42c692320d10' ||
        (m.user?.email && currentUser.email && m.user.email.toLowerCase() === currentUser.email.toLowerCase())
      ) &&
      (m.organization_id === currentOrg.id || !currentOrg.id)
  ) || memberships[0];

  const effectiveRole: UserRole = currentUserMembership?.role || currentUser.role || 'ORGANIZATION_OWNER';

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = useState(false);
  const [isCreateDeptModalOpen, setIsCreateDeptModalOpen] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [activeTaskForModal, setActiveTaskForModal] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Restore sidebar state from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed');
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const triggerLoader = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  };

  const setCurrentOrg = (org: Organization) => {
    triggerLoader();
    setCurrentOrgState(org);
    // Sync current user's role in this new organization
    const mem = memberships.find(m => m.user_id === currentUser.id && m.organization_id === org.id);
    if (mem) {
      setCurrentUserState(prev => ({ ...prev, role: mem.role }));
    }
  };

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUserState(prev => ({ ...prev, role }));
  };

  const switchUser = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (!found) return;

    const mem = memberships.find(m => m.user_id === userId && m.organization_id === currentOrg.id);
    const role: UserRole = mem?.role || (found.id === 'usr_chandan' ? 'ORGANIZATION_OWNER' : 'TEAM_MEMBER');

    setCurrentUserState({ ...found, role });
    triggerLoader();
  };

  // Role Management controlled by Organization Owner
  const updateMemberRole = (userId: string, newRole: UserRole) => {
    triggerLoader();
    setMemberships(prev =>
      prev.map(m =>
        m.user_id === userId && m.organization_id === currentOrg.id
          ? { ...m, role: newRole }
          : m
      )
    );
    if (currentUser.id === userId) {
      setCurrentUserState(prev => ({ ...prev, role: newRole }));
    }
    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        organization_id: currentOrg.id,
        actor_id: currentUser.id,
        action: 'member.role_update',
        resource_type: 'Membership',
        resource_id: userId,
        metadata: { new_role: newRole },
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const updateMemberDepartment = (userId: string, deptId?: string, teamId?: string) => {
    triggerLoader();
    setMemberships(prev =>
      prev.map(m =>
        m.user_id === userId && m.organization_id === currentOrg.id
          ? { ...m, department_id: deptId, team_id: teamId }
          : m
      )
    );
    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        organization_id: currentOrg.id,
        actor_id: currentUser.id,
        action: 'member.department_reassign',
        resource_type: 'Membership',
        resource_id: userId,
        metadata: { department_id: deptId, team_id: teamId },
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const removeMember = (userId: string) => {
    if (userId === currentUser.id) return;
    triggerLoader();
    setMemberships(prev =>
      prev.filter(m => !(m.user_id === userId && m.organization_id === currentOrg.id))
    );
    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        organization_id: currentOrg.id,
        actor_id: currentUser.id,
        action: 'member.remove',
        resource_type: 'Membership',
        resource_id: userId,
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const addEmployee = (emp: {
    full_name: string;
    email: string;
    role: UserRole;
    department_id?: string;
    team_id?: string;
  }) => {
    triggerLoader();
    const newUserId = `usr_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      email: emp.email,
      full_name: emp.full_name,
      status: 'ACTIVE',
      created_at: new Date().toISOString()
    };
    setUsers(prev => [...prev, newUser]);

    const newMem: OrganizationMembership = {
      id: `mem_${Date.now()}`,
      organization_id: currentOrg.id,
      user_id: newUserId,
      role: emp.role,
      department_id: emp.department_id,
      team_id: emp.team_id,
      status: 'ACTIVE',
      joined_at: new Date().toISOString()
    };
    setMemberships(prev => [...prev, newMem]);

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        organization_id: currentOrg.id,
        actor_id: currentUser.id,
        action: 'member.add',
        resource_type: 'Membership',
        resource_id: newUserId,
        metadata: { full_name: emp.full_name, email: emp.email, role: emp.role },
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const createOrganization = (name: string, slug: string) => {
    triggerLoader();
    const newOrg: Organization = {
      id: `org_${Date.now()}`,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    };
    const nextOrgs = [...organizations, newOrg];
    setOrganizations(nextOrgs);
    setCurrentOrgState(newOrg);

    // Automatically create OWNER membership for creator
    const ownerMembership: OrganizationMembership = {
      id: `mem_${Date.now()}`,
      organization_id: newOrg.id,
      user_id: currentUser.id,
      role: 'ORGANIZATION_OWNER',
      status: 'ACTIVE',
      joined_at: new Date().toISOString(),
      user: currentUser,
      organization: newOrg
    };
    const nextMems = [...memberships, ownerMembership];
    setMemberships(nextMems);
    setCurrentUserState(prev => ({ ...prev, role: 'ORGANIZATION_OWNER' }));

    try {
      localStorage.setItem('crosstech_orgs', JSON.stringify(nextOrgs));
      localStorage.setItem('crosstech_memberships', JSON.stringify(nextMems));
    } catch {}

    createOrgInSupabase({
      userId: currentUser.id,
      email: currentUser.email,
      fullName: currentUser.full_name,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    }).then(res => {
      if (res?.org) {
        setOrganizations(prev => {
          const updated = prev.map(o => (o.id === newOrg.id ? { ...o, id: res.org.id } : o));
          try { localStorage.setItem('crosstech_orgs', JSON.stringify(updated)); } catch {}
          return updated;
        });
        setCurrentOrgState(prev => (prev.id === newOrg.id ? { ...prev, id: res.org.id } : prev));
        if (res.mem) {
          setMemberships(prev => {
            const updated = prev.map(m => (m.organization_id === newOrg.id ? { ...m, id: res.mem.id, organization_id: res.org.id } : m));
            try { localStorage.setItem('crosstech_memberships', JSON.stringify(updated)); } catch {}
            return updated;
          });
        }
      }
    }).catch(err => console.warn('Supabase sync warning for organization:', err));

    // Audit log
    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        organization_id: newOrg.id,
        actor_id: currentUser.id,
        action: 'organization.create',
        resource_type: 'Organization',
        resource_id: newOrg.id,
        metadata: { name: newOrg.name, slug: newOrg.slug },
        created_at: new Date().toISOString()
      },
      ...prev
    ]);

    return newOrg;
  };

  const createInitialCompany = (data: { name: string; slug: string; departmentName: string }) => {
    triggerLoader();
    const orgId = `org_${Date.now()}`;
    const deptId = `dept_${Date.now()}`;
    const boardId = `brd_${Date.now()}`;
    const chanId = `chan_${Date.now()}`;

    const newOrg: Organization = {
      id: orgId,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    };

    const newMembership: OrganizationMembership = {
      id: `mem_${Date.now()}`,
      organization_id: orgId,
      user_id: currentUser.id,
      role: 'ORGANIZATION_OWNER',
      department_id: deptId,
      status: 'ACTIVE',
      joined_at: new Date().toISOString(),
      user: currentUser,
      organization: newOrg
    };

    const newDept: Department = {
      id: deptId,
      organization_id: orgId,
      name: data.departmentName || 'General Operations',
      description: 'Primary operational department',
      manager_id: currentUser.id,
      created_at: new Date().toISOString()
    };

    const newBoard: Board = {
      id: boardId,
      organization_id: orgId,
      department_id: deptId,
      name: `${data.name} Main Board`,
      description: `Agile workflows and tasks for ${data.name}`,
      columns: DEFAULT_BOARD_COLUMNS.map(col => ({ ...col, board_id: boardId }))
    };

    const newChannel: Channel = {
      id: chanId,
      organization_id: orgId,
      name: 'general',
      type: 'PUBLIC',
      description: 'General workspace discussion and announcements',
      created_by: currentUser.id,
      created_at: new Date().toISOString()
    };

    const initialAudit: AuditLog = {
      id: `aud_${Date.now()}`,
      organization_id: orgId,
      actor_id: currentUser.id,
      action: 'organization.create',
      resource_type: 'Organization',
      resource_id: orgId,
      metadata: { name: data.name, slug: data.slug },
      created_at: new Date().toISOString()
    };

    const nextOrgs = [newOrg, ...organizations];
    const nextMems = [newMembership, ...memberships];
    const nextDepts = [newDept, ...departments];
    const nextChannels = [newChannel, ...channels];

    setOrganizations(nextOrgs);
    setCurrentOrgState(newOrg);
    setMemberships(nextMems);
    setDepartments(nextDepts);
    setBoard(newBoard);
    setTasks([]);
    setTeams([]);
    setChannels(nextChannels);
    setActiveChannel(newChannel);
    setAuditLogs([initialAudit]);
    setCurrentUserState(prev => ({ ...prev, role: 'ORGANIZATION_OWNER' }));

    try {
      localStorage.setItem('crosstech_orgs', JSON.stringify(nextOrgs));
      localStorage.setItem('crosstech_memberships', JSON.stringify(nextMems));
      localStorage.setItem('crosstech_depts', JSON.stringify(nextDepts));
      localStorage.setItem('crosstech_teams', JSON.stringify([]));
      localStorage.setItem('crosstech_tasks', JSON.stringify([]));
      localStorage.setItem('crosstech_channels', JSON.stringify(nextChannels));
    } catch (e) {
      console.warn('Failed to save company to localStorage:', e);
    }

    createOrgInSupabase({
      userId: currentUser.id,
      email: currentUser.email,
      fullName: currentUser.full_name,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      departmentName: data.departmentName
    }).then(res => {
      if (res?.org) {
        console.log('Saved new organization to Supabase:', res.org.name);
        setOrganizations(prev => {
          const updated = prev.map(o => (o.id === orgId ? { ...o, id: res.org.id } : o));
          try { localStorage.setItem('crosstech_orgs', JSON.stringify(updated)); } catch {}
          return updated;
        });
        setCurrentOrgState(prev => (prev.id === orgId ? { ...prev, id: res.org.id } : prev));
        if (res.dept) {
          setDepartments(prev => {
            const updated = prev.map(d => (d.id === deptId ? { ...d, id: res.dept.id, organization_id: res.org.id } : d));
            try { localStorage.setItem('crosstech_depts', JSON.stringify(updated)); } catch {}
            return updated;
          });
        }
        if (res.mem) {
          setMemberships(prev => {
            const updated = prev.map(m => (m.organization_id === orgId ? { ...m, id: res.mem.id, organization_id: res.org.id } : m));
            try { localStorage.setItem('crosstech_memberships', JSON.stringify(updated)); } catch {}
            return updated;
          });
        }
      }
    }).catch(err => {
      console.warn('Failed to persist created org to Supabase:', err);
    });

    return newOrg;
  };

  const addDepartment = (dept: { name: string; description: string; manager_id?: string }) => {
    triggerLoader();
    const tempId = `dept_${Date.now()}`;
    const targetOrgId = currentOrg.id || '0a3faf5c-a66c-411f-96f9-36c3d138a5b8';

    const newDept: Department = {
      id: tempId,
      organization_id: targetOrgId,
      name: dept.name,
      description: dept.description,
      manager_id: dept.manager_id,
      teams_count: 0,
      members_count: 1,
      created_at: new Date().toISOString()
    };
    
    setDepartments(prev => {
      const next = [...prev, newDept];
      try { localStorage.setItem('crosstech_depts', JSON.stringify(next)); } catch {}
      return next;
    });

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        organization_id: targetOrgId,
        actor_id: currentUser.id,
        action: 'department.create',
        resource_type: 'Department',
        resource_id: newDept.id,
        metadata: { name: newDept.name },
        created_at: new Date().toISOString()
      },
      ...prev
    ]);

    // Persist to Supabase
    createDepartmentInSupabase({
      orgId: targetOrgId,
      name: dept.name,
      description: dept.description,
      managerId: dept.manager_id,
      userId: currentUser.id
    }).then(res => {
      if (res?.dept) {
        setDepartments(prev => {
          const updated = prev.map(d => (d.id === tempId ? { ...d, id: res.dept.id, organization_id: res.dept.organization_id } : d));
          try { localStorage.setItem('crosstech_depts', JSON.stringify(updated)); } catch {}
          return updated;
        });
        if (res.channel) {
          setChannels(prev => {
            const nextChans = [...prev, res.channel];
            try { localStorage.setItem('crosstech_channels', JSON.stringify(nextChans)); } catch {}
            return nextChans;
          });
        }
      }
    }).catch(err => {
      console.warn('Failed to save department to Supabase:', err);
    });

    return newDept;
  };

  const addTeam = (team: { name: string; description: string; department_id: string; lead_id?: string }) => {
    triggerLoader();
    const tempId = `team_${Date.now()}`;
    const targetOrgId = currentOrg.id || '0a3faf5c-a66c-411f-96f9-36c3d138a5b8';
    const dept = departments.find(d => d.id === team.department_id);

    const newTeam: Team = {
      id: tempId,
      organization_id: targetOrgId,
      department_id: team.department_id,
      department_name: dept?.name || 'General',
      name: team.name,
      description: team.description,
      lead_id: team.lead_id,
      members_count: 1,
      created_at: new Date().toISOString()
    };
    
    setTeams(prev => {
      const next = [...prev, newTeam];
      try { localStorage.setItem('crosstech_teams', JSON.stringify(next)); } catch {}
      return next;
    });

    // Update dept teams_count
    setDepartments(prev => {
      const updated = prev.map(d => (d.id === team.department_id ? { ...d, teams_count: (d.teams_count || 0) + 1 } : d));
      try { localStorage.setItem('crosstech_depts', JSON.stringify(updated)); } catch {}
      return updated;
    });

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        organization_id: targetOrgId,
        actor_id: currentUser.id,
        action: 'team.create',
        resource_type: 'Team',
        resource_id: newTeam.id,
        metadata: { name: newTeam.name, department: dept?.name },
        created_at: new Date().toISOString()
      },
      ...prev
    ]);

    // Persist to Supabase
    createTeamInSupabase({
      orgId: targetOrgId,
      departmentId: team.department_id,
      name: team.name,
      description: team.description,
      leadId: team.lead_id
    }).then(res => {
      if (res?.id) {
        setTeams(prev => {
          const updated = prev.map(t => (t.id === tempId ? { ...t, id: res.id, organization_id: res.organization_id } : t));
          try { localStorage.setItem('crosstech_teams', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }
    }).catch(err => {
      console.warn('Failed to save team to Supabase:', err);
    });

    return newTeam;
  };

  const deleteDepartment = async (deptId: string): Promise<boolean> => {
    const isOwnerOrAdmin =
      effectiveRole === 'ORGANIZATION_OWNER' ||
      effectiveRole === 'ORGANIZATION_ADMIN' ||
      currentUser.role === 'ORGANIZATION_OWNER' ||
      currentUser.role === 'ORGANIZATION_ADMIN' ||
      currentUserMembership?.role === 'ORGANIZATION_OWNER' ||
      currentUserMembership?.role === 'ORGANIZATION_ADMIN';

    if (!isOwnerOrAdmin) {
      console.warn('Unauthorized: only Organization Owners and Admins can delete departments');
      return false;
    }

    triggerLoader();
    const targetDept = departments.find(d => d.id === deptId);

    const updatedDepts = departments.filter(d => d.id !== deptId);
    const updatedTeams = teams.filter(t => t.department_id !== deptId);
    const updatedChannels = channels.filter(c => c.department_id !== deptId);

    setDepartments(updatedDepts);
    setTeams(updatedTeams);
    setChannels(updatedChannels);

    try {
      localStorage.setItem('crosstech_depts', JSON.stringify(updatedDepts));
      localStorage.setItem('crosstech_teams', JSON.stringify(updatedTeams));
      localStorage.setItem('crosstech_channels', JSON.stringify(updatedChannels));
    } catch {}

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        organization_id: currentOrg.id,
        actor_id: currentUser.id,
        action: 'department.delete',
        resource_type: 'Department',
        resource_id: deptId,
        metadata: { name: targetDept?.name },
        created_at: new Date().toISOString()
      },
      ...prev
    ]);

    return await deleteDepartmentInSupabase(deptId);
  };

  const deleteTeam = async (teamId: string): Promise<boolean> => {
    const isOwnerOrAdmin =
      effectiveRole === 'ORGANIZATION_OWNER' ||
      effectiveRole === 'ORGANIZATION_ADMIN' ||
      currentUser.role === 'ORGANIZATION_OWNER' ||
      currentUser.role === 'ORGANIZATION_ADMIN' ||
      currentUserMembership?.role === 'ORGANIZATION_OWNER' ||
      currentUserMembership?.role === 'ORGANIZATION_ADMIN';

    if (!isOwnerOrAdmin) {
      console.warn('Unauthorized: only Organization Owners and Admins can delete teams');
      return false;
    }

    triggerLoader();
    const targetTeam = teams.find(t => t.id === teamId);
    const updatedTeams = teams.filter(t => t.id !== teamId);
    setTeams(updatedTeams);

    if (targetTeam?.department_id) {
      setDepartments(prev => {
        const next = prev.map(d =>
          d.id === targetTeam.department_id
            ? { ...d, teams_count: Math.max(0, (d.teams_count || 1) - 1) }
            : d
        );
        try { localStorage.setItem('crosstech_depts', JSON.stringify(next)); } catch {}
        return next;
      });
    }

    try {
      localStorage.setItem('crosstech_teams', JSON.stringify(updatedTeams));
    } catch {}

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        organization_id: currentOrg.id,
        actor_id: currentUser.id,
        action: 'team.delete',
        resource_type: 'Team',
        resource_id: teamId,
        metadata: { name: targetTeam?.name, department_id: targetTeam?.department_id },
        created_at: new Date().toISOString()
      },
      ...prev
    ]);

    return await deleteTeamInSupabase(teamId);
  };

  const addTask = (task: {
    title: string;
    description?: string;
    column_id: string;
    priority: Task['priority'];
    assigned_to?: string;
    due_date?: string;
    department_id?: string;
  }) => {
    triggerLoader();
    const newTask: Task = {
      id: `tsk_${Date.now()}`,
      organization_id: currentOrg.id,
      department_id: task.department_id || currentUserMembership?.department_id || 'dept_tech',
      board_id: board.id,
      column_id: task.column_id,
      title: task.title,
      description: task.description,
      created_by: currentUser.id,
      assigned_to: task.assigned_to,
      priority: task.priority,
      position: tasks.length * 1000 + 1000,
      due_date: task.due_date,
      created_at: new Date().toISOString(),
      comments: []
    };
    setTasks(prev => [newTask, ...prev]);

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        organization_id: currentOrg.id,
        actor_id: currentUser.id,
        action: 'task.create',
        resource_type: 'Task',
        resource_id: newTask.id,
        metadata: { title: newTask.title, priority: newTask.priority },
        created_at: new Date().toISOString()
      },
      ...prev
    ]);

    return newTask;
  };

  const moveTask = (taskId: string, targetColId: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, column_id: targetColId, updated_at: new Date().toISOString() } : t))
    );

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        organization_id: currentOrg.id,
        actor_id: currentUser.id,
        action: 'task.move',
        resource_type: 'Task',
        resource_id: taskId,
        metadata: { target_column: targetColId },
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
    );
  };

  const deleteTask = (taskId: string) => {
    triggerLoader();
    setTasks(prev => prev.filter(t => t.id !== taskId));
    if (activeTaskForModal?.id === taskId) {
      setActiveTaskForModal(null);
    }
  };

  const addTaskComment = (taskId: string, content: string) => {
    const comment = {
      id: `cm_${Date.now()}`,
      task_id: taskId,
      user_id: currentUser.id,
      user: currentUser,
      content,
      created_at: new Date().toISOString()
    };

    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, comments: [...(t.comments || []), comment] } : t))
    );

    if (activeTaskForModal?.id === taskId) {
      setActiveTaskForModal(prev => (prev ? { ...prev, comments: [...(prev.comments || []), comment] } : null));
    }
  };

  const addChannel = (channel: { name: string; type: Channel['type']; description?: string; department_id?: string; team_id?: string }) => {
    triggerLoader();
    const newChan: Channel = {
      id: `chn_${Date.now()}`,
      organization_id: currentOrg.id,
      name: channel.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      type: channel.type,
      description: channel.description,
      department_id: channel.department_id,
      team_id: channel.team_id,
      unread_count: 0
    };
    setChannels(prev => [...prev, newChan]);
    setActiveChannel(newChan);
    return newChan;
  };

  const sendMessage = (content: string, replyToId?: string) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      channel_id: activeChannel.id,
      sender_id: currentUser.id,
      sender: currentUser,
      content,
      reply_to_id: replyToId,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMsg]);
    return newMsg;
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const createInvitation = (inv: { email: string; role: UserRole; department_id?: string; team_id?: string }) => {
    triggerLoader();
    const deptObj = departments.find(d => d.id === inv.department_id);
    const payload = {
      tok: `tok_${Math.random().toString(36).substring(2, 8)}`,
      org_id: currentOrg.id,
      org_name: currentOrg.name,
      org_slug: currentOrg.slug,
      dept_id: inv.department_id || '',
      dept_name: deptObj?.name || '',
      team_id: inv.team_id || '',
      email: inv.email,
      role: inv.role,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000
    };
    const token = typeof window !== 'undefined'
      ? btoa(unescape(encodeURIComponent(JSON.stringify(payload)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
      : `tok_${Date.now()}`;

    const newInv: Invitation = {
      id: `inv_${Date.now()}`,
      organization_id: currentOrg.id,
      organization_name: currentOrg.name,
      department_id: inv.department_id,
      department_name: deptObj?.name,
      team_id: inv.team_id,
      email: inv.email,
      role: inv.role,
      token_hash: token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      invited_by: currentUser.id,
      created_at: new Date().toISOString()
    };
    setInvitations(prev => {
      const next = [newInv, ...prev];
      try { localStorage.setItem('crosstech_invitations', JSON.stringify(next)); } catch {}
      return next;
    });

    setAuditLogs(prev => [
      {
        id: `aud_${Date.now()}`,
        organization_id: currentOrg.id,
        actor_id: currentUser.id,
        action: 'member.invite',
        resource_type: 'Invitation',
        resource_id: newInv.id,
        metadata: { email: newInv.email, role: newInv.role, department: deptObj?.name },
        created_at: new Date().toISOString()
      },
      ...prev
    ]);

    return newInv;
  };

  const acceptInvitation = (token: string, userOverride?: Partial<User>) => {
    triggerLoader();
    const activeUserId = userOverride?.id || currentUser.id;
    const activeUserEmail = userOverride?.email || currentUser.email;
    const activeUserName = userOverride?.full_name || currentUser.full_name || 'Team Member';
    const activeUserAvatar = userOverride?.avatar_url || currentUser.avatar_url;

    // Decode token or lookup in invitations
    const decoded = decodeInviteToken(token);
    const foundInv = invitations.find(i => i.token_hash === token);

    const orgId = decoded?.org_id || foundInv?.organization_id;
    const orgName = decoded?.org_name || foundInv?.organization_name || 'CrossTech Workspace';
    const orgSlug = decoded?.org_slug || 'workspace';
    const role: UserRole = decoded?.role || foundInv?.role || 'TEAM_MEMBER';
    const deptId = decoded?.dept_id || foundInv?.department_id;
    const deptName = decoded?.dept_name || foundInv?.department_name || 'General Operations';
    const teamId = decoded?.team_id || foundInv?.team_id;

    if (!orgId) {
      return { success: false, error: 'Invalid or expired invitation token.' };
    }

    const orgRecord: Organization = {
      id: orgId,
      name: orgName,
      slug: orgSlug,
      created_at: new Date().toISOString()
    };
    setOrganizations(prev => {
      const exists = prev.some(o => o.id === orgId);
      const next = exists ? prev : [orgRecord, ...prev];
      try { localStorage.setItem('crosstech_orgs', JSON.stringify(next)); } catch {}
      return next;
    });

    if (deptId) {
      const deptRecord: Department = {
        id: deptId,
        organization_id: orgId,
        name: deptName,
        created_at: new Date().toISOString()
      };
      setDepartments(prev => {
        const exists = prev.some(d => d.id === deptId);
        const next = exists ? prev : [deptRecord, ...prev];
        try { localStorage.setItem('crosstech_depts', JSON.stringify(next)); } catch {}
        return next;
      });
    }

    const newMembership: OrganizationMembership = {
      id: `mem_${Date.now()}`,
      organization_id: orgId,
      user_id: activeUserId,
      role: role,
      department_id: deptId,
      team_id: teamId,
      status: 'ACTIVE',
      joined_at: new Date().toISOString(),
      user: {
        id: activeUserId,
        email: activeUserEmail,
        full_name: activeUserName,
        avatar_url: activeUserAvatar,
        status: 'ACTIVE'
      },
      organization: orgRecord
    };

    setMemberships(prev => {
      const filtered = prev.filter(m => !(m.organization_id === orgId && (m.user_id === activeUserId || m.user?.email === activeUserEmail)));
      const next = [newMembership, ...filtered];
      try { localStorage.setItem('crosstech_memberships', JSON.stringify(next)); } catch {}
      return next;
    });

    setCurrentOrgState(orgRecord);
    setCurrentUserState(prev => ({
      ...prev,
      id: activeUserId,
      email: activeUserEmail,
      full_name: activeUserName,
      avatar_url: activeUserAvatar,
      role: role
    }));

    setInvitations(prev => {
      const next = prev.map(i => (i.token_hash === token ? { ...i, accepted_at: new Date().toISOString() } : i));
      try { localStorage.setItem('crosstech_invitations', JSON.stringify(next)); } catch {}
      return next;
    });

    try {
      localStorage.setItem('crosstech_current_org', JSON.stringify(orgRecord));
      localStorage.removeItem('crosstech_pending_invite');
    } catch {}

    return { success: true, organization: orgRecord, role };
  };

  // Auto-enroll invited employees if there is a pending invite or matching email invitation
  useEffect(() => {
    if (!currentUser.email || currentUser.id === 'usr_init') return;
    try {
      const pendingToken = localStorage.getItem('crosstech_pending_invite');
      if (pendingToken) {
        acceptInvitation(pendingToken, currentUser);
        return;
      }
      const match = invitations.find(
        i => i.email.toLowerCase() === currentUser.email.toLowerCase() && !i.accepted_at
      );
      if (match) {
        acceptInvitation(match.token_hash, currentUser);
      }
    } catch (e) {
      console.warn('Auto invite enrollment check error:', e);
    }
  }, [currentUser.id, currentUser.email, invitations]);

  return (
    <AppContext.Provider
      value={{
        organizations,
        userOrganizations,
        currentOrg,
        hasActiveOrganization,
        isInitialLoading,
        setCurrentOrg,
        createOrganization,
        createInitialCompany,
        users,
        currentUser: { ...currentUser, role: effectiveRole },
        memberships,
        currentUserMembership,
        setCurrentUserRole,
        switchUser,
        updateMemberRole,
        updateMemberDepartment,
        removeMember,
        addEmployee,
        departments,
        addDepartment,
        deleteDepartment,
        teams,
        addTeam,
        deleteTeam,
        board,
        tasks,
        addTask,
        moveTask,
        updateTask,
        deleteTask,
        addTaskComment,
        channels,
        activeChannel,
        setActiveChannel,
        addChannel,
        messages,
        sendMessage,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        auditLogs,
        invitations,
        createInvitation,
        acceptInvitation,
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isInviteModalOpen,
        setIsInviteModalOpen,
        isCreateOrgModalOpen,
        setIsCreateOrgModalOpen,
        isCreateDeptModalOpen,
        setIsCreateDeptModalOpen,
        isCreateTeamModalOpen,
        setIsCreateTeamModalOpen,
        isTaskModalOpen,
        setIsTaskModalOpen,
        activeTaskForModal,
        setActiveTaskForModal,
        isLoading,
        triggerLoader
      }}
    >
      {isClerkConfigured && (
        <ClerkUserSync
          onSync={handleClerkUserSync}
          onDoneLoading={() => setIsInitialLoading(false)}
        />
      )}
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
