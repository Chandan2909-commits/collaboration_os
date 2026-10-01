import { supabase, isSupabaseConfigured } from './supabase';
import { Organization, OrganizationMembership, Department, Team, Task, Board, Channel, User, UserRole } from './types';

export interface WorkspaceData {
  user?: User;
  users?: User[];
  organizations: Organization[];
  memberships: OrganizationMembership[];
  departments: Department[];
  teams: Team[];
  tasks: Task[];
  boards: Board[];
  channels: Channel[];
}

export async function syncUserAndFetchWorkspace(
  email: string,
  clerkId?: string,
  fullName?: string,
  avatarUrl?: string
): Promise<WorkspaceData | null> {
  if (!isSupabaseConfigured || !supabase || !email) {
    return null;
  }

  try {
    // 1. Find or upsert user in Supabase
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email.toLowerCase()},clerk_id.eq.${clerkId || 'none'}`)
      .limit(1)
      .maybeSingle();

    let dbUser: any = existingUser;

    if (!dbUser) {
      const { data: newUser, error: createErr } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          clerk_id: clerkId || null,
          full_name: fullName || 'Workspace Member',
          avatar_url: avatarUrl || null,
          status: 'ACTIVE'
        })
        .select()
        .single();

      if (!createErr && newUser) {
        dbUser = newUser;
      }
    } else if (clerkId && (!dbUser.clerk_id || dbUser.clerk_id !== clerkId)) {
      // Update clerk_id if missing or changed
      await supabase
        .from('users')
        .update({ clerk_id: clerkId, avatar_url: avatarUrl || dbUser.avatar_url, full_name: fullName || dbUser.full_name })
        .eq('id', dbUser.id);
      dbUser.clerk_id = clerkId;
    }

    if (!dbUser) return null;

    // 2. Fetch memberships for this user
    const { data: memsData } = await supabase
      .from('organization_memberships')
      .select('*')
      .eq('user_id', dbUser.id);

    let userMems = memsData || [];

    if (userMems.length === 0) {
      // Check if user created an organization
      const { data: ownedOrgs } = await supabase
        .from('organizations')
        .select('*')
        .eq('created_by', dbUser.id);

      if (ownedOrgs && ownedOrgs.length > 0) {
        for (const org of ownedOrgs) {
          const { data: createdMem } = await supabase
            .from('organization_memberships')
            .insert({
              organization_id: org.id,
              user_id: dbUser.id,
              role: 'ORGANIZATION_OWNER',
              status: 'ACTIVE'
            })
            .select()
            .single();
          if (createdMem) userMems.push(createdMem);
        }
      }
    }

    if (userMems.length === 0) {
      // Check if any organization exists in the system (e.g. CrossTech Solutions)
      const { data: existingOrgs } = await supabase
        .from('organizations')
        .select('*')
        .limit(1);

      if (existingOrgs && existingOrgs.length > 0) {
        const { data: autoMem } = await supabase
          .from('organization_memberships')
          .insert({
            organization_id: existingOrgs[0].id,
            user_id: dbUser.id,
            role: 'ORGANIZATION_OWNER',
            status: 'ACTIVE'
          })
          .select()
          .single();
        if (autoMem) userMems.push(autoMem);
      }
    }

    if (userMems.length === 0) {
      return {
        user: {
          id: dbUser.id,
          clerk_id: dbUser.clerk_id,
          email: dbUser.email,
          full_name: dbUser.full_name,
          avatar_url: dbUser.avatar_url,
          status: dbUser.status
        },
        users: [{
          id: dbUser.id,
          clerk_id: dbUser.clerk_id,
          email: dbUser.email,
          full_name: dbUser.full_name,
          avatar_url: dbUser.avatar_url,
          status: dbUser.status
        }],
        organizations: [],
        memberships: [],
        departments: [],
        teams: [],
        tasks: [],
        boards: [],
        channels: []
      };
    }

    const orgIds = userMems.map((m: any) => m.organization_id);

    // 2b. Fetch all memberships with user details across user's organizations
    const { data: allMemsData } = await supabase
      .from('organization_memberships')
      .select('*, users(*)')
      .in('organization_id', orgIds);

    const usersMap = new Map<string, User>();
    usersMap.set(dbUser.id, {
      id: dbUser.id,
      clerk_id: dbUser.clerk_id,
      email: dbUser.email,
      full_name: dbUser.full_name,
      avatar_url: dbUser.avatar_url,
      status: dbUser.status
    });

    (allMemsData || []).forEach((m: any) => {
      if (m.users) {
        usersMap.set(m.users.id, {
          id: m.users.id,
          clerk_id: m.users.clerk_id,
          email: m.users.email,
          full_name: m.users.full_name,
          avatar_url: m.users.avatar_url,
          status: m.users.status
        });
      }
    });

    const allUsers = Array.from(usersMap.values());

    // 3. Fetch Organizations
    const { data: orgsData } = await supabase
      .from('organizations')
      .select('*')
      .in('id', orgIds);

    // 4. Fetch Departments
    const { data: deptsData } = await supabase
      .from('departments')
      .select('*')
      .in('organization_id', orgIds);

    // 5. Fetch Teams
    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .in('organization_id', orgIds);

    // 6. Fetch Tasks
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .in('organization_id', orgIds);

    // 7. Fetch Boards with columns
    const { data: boardsData } = await supabase
      .from('boards')
      .select('*, board_columns(*)')
      .in('organization_id', orgIds);

    // 8. Fetch Channels
    const { data: channelsData } = await supabase
      .from('channels')
      .select('*')
      .in('organization_id', orgIds);

    return {
      user: {
        id: dbUser.id,
        clerk_id: dbUser.clerk_id,
        email: dbUser.email,
        full_name: dbUser.full_name,
        avatar_url: dbUser.avatar_url,
        status: dbUser.status
      },
      users: allUsers,
      organizations: orgsData || [],
      memberships: (allMemsData || userMems || []).map((m: any) => ({
        id: m.id,
        organization_id: m.organization_id,
        user_id: m.user_id,
        role: m.role as UserRole,
        department_id: m.department_id,
        team_id: m.team_id,
        status: m.status,
        joined_at: m.joined_at,
        user: m.users ? {
          id: m.users.id,
          email: m.users.email,
          full_name: m.users.full_name,
          avatar_url: m.users.avatar_url,
          status: m.users.status
        } : {
          id: dbUser.id,
          email: dbUser.email,
          full_name: dbUser.full_name,
          avatar_url: dbUser.avatar_url,
          status: dbUser.status
        }
      })),
      departments: deptsData || [],
      teams: teamsData || [],
      tasks: tasksData || [],
      boards: (boardsData || []).map((b: any) => ({
        ...b,
        columns: (b.board_columns || []).sort((c1: any, c2: any) => (c1.position || 0) - (c2.position || 0))
      })),
      channels: channelsData || []
    };
  } catch (err) {
    console.warn('Supabase workspace sync error:', err);
    return null;
  }
}

export async function createOrgInSupabase(params: {
  userId?: string;
  email?: string;
  fullName?: string;
  name: string;
  slug: string;
  departmentName?: string;
}) {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    // Resolve UUID for user
    let dbUserId: string | null = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.userId || '');
    if (isUuid) {
      dbUserId = params.userId!;
    } else if (params.email) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', params.email.toLowerCase())
        .maybeSingle();
      if (existingUser) {
        dbUserId = existingUser.id;
      } else {
        const { data: newUser } = await supabase
          .from('users')
          .insert({
            email: params.email.toLowerCase(),
            clerk_id: params.userId || null,
            full_name: params.fullName || 'Workspace Owner',
            status: 'ACTIVE'
          })
          .select('id')
          .single();
        if (newUser) dbUserId = newUser.id;
      }
    }

    if (!dbUserId) {
      console.warn('Could not resolve database user UUID for org creation');
      return null;
    }

    // 1. Create Org
    const { data: org, error: orgErr } = await supabase
      .from('organizations')
      .insert({
        name: params.name,
        slug: params.slug,
        created_by: dbUserId
      })
      .select()
      .single();

    if (orgErr || !org) throw orgErr;

    // 2. Create Membership
    const { data: mem, error: memErr } = await supabase
      .from('organization_memberships')
      .insert({
        organization_id: org.id,
        user_id: dbUserId,
        role: 'ORGANIZATION_OWNER',
        status: 'ACTIVE'
      })
      .select()
      .single();

    if (memErr) console.warn('Membership insert error:', memErr);

    // 3. Create Department
    const { data: dept } = await supabase
      .from('departments')
      .insert({
        organization_id: org.id,
        name: params.departmentName || 'Engineering & Operations',
        description: 'Core operational department',
        manager_id: dbUserId
      })
      .select()
      .single();

    // 4. Create Board
    const { data: board } = await supabase
      .from('boards')
      .insert({
        organization_id: org.id,
        department_id: dept?.id,
        name: `${params.name} Main Board`,
        description: 'Sprint tracking and tasks',
        created_by: dbUserId
      })
      .select()
      .single();

    // 5. Board Columns
    if (board) {
      await supabase.from('board_columns').insert([
        { board_id: board.id, name: 'Backlog', position: 0, wip_limit: 15 },
        { board_id: board.id, name: 'To Do', position: 1, wip_limit: 8 },
        { board_id: board.id, name: 'In Progress', position: 2, wip_limit: 5 },
        { board_id: board.id, name: 'Review', position: 3, wip_limit: 4 },
        { board_id: board.id, name: 'Done', position: 4, wip_limit: 0 }
      ]);
    }

    // 6. Channel
    await supabase.from('channels').insert({
      organization_id: org.id,
      name: 'general',
      type: 'PUBLIC',
      description: 'Company-wide announcements and discussion',
      created_by: dbUserId
    });

    return { org, mem, dept, board };
  } catch (err) {
    console.warn('Error creating org in Supabase:', err);
    return null;
  }
}

export async function createDepartmentInSupabase(params: {
  orgId: string;
  name: string;
  description?: string;
  managerId?: string;
  userId?: string;
}) {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    let validManagerId: string | null = null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.managerId || '');
    if (isUuid) {
      validManagerId = params.managerId!;
    } else if (params.userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.userId)) {
      validManagerId = params.userId;
    } else {
      const lookupVal = params.managerId || params.userId;
      if (lookupVal) {
        const { data: matchedUser } = await supabase
          .from('users')
          .select('id')
          .or(`clerk_id.eq.${lookupVal},email.eq.${lookupVal}`)
          .maybeSingle();
        if (matchedUser) validManagerId = matchedUser.id;
      }
      if (!validManagerId) {
        const { data: firstUser } = await supabase.from('users').select('id').limit(1).maybeSingle();
        if (firstUser) validManagerId = firstUser.id;
      }
    }

    let validOrgId = params.orgId;
    const isOrgUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validOrgId);
    if (!isOrgUuid) {
      const { data: firstOrg } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
      if (firstOrg) validOrgId = firstOrg.id;
    }

    if (!validOrgId) return null;

    // 1. Insert department
    const { data: dept, error: deptErr } = await supabase
      .from('departments')
      .insert({
        organization_id: validOrgId,
        name: params.name,
        description: params.description || '',
        manager_id: validManagerId
      })
      .select()
      .single();

    if (deptErr || !dept) {
      console.warn('Supabase department insert warning:', deptErr);
      return null;
    }

    // 2. Create board for department
    const { data: board } = await supabase
      .from('boards')
      .insert({
        organization_id: validOrgId,
        department_id: dept.id,
        name: `${params.name} Board`,
        description: `Agile workflows for ${params.name}`,
        created_by: validManagerId
      })
      .select()
      .single();

    let columnsData: any[] = [];
    if (board) {
      const { data: cols } = await supabase.from('board_columns').insert([
        { board_id: board.id, name: 'Backlog', position: 0, wip_limit: 15 },
        { board_id: board.id, name: 'To Do', position: 1, wip_limit: 8 },
        { board_id: board.id, name: 'In Progress', position: 2, wip_limit: 5 },
        { board_id: board.id, name: 'Review', position: 3, wip_limit: 4 },
        { board_id: board.id, name: 'Done', position: 4, wip_limit: 0 }
      ]).select();
      if (cols) columnsData = cols;
    }

    // 3. Create channel for department (channels_type_check allows 'PUBLIC', 'PRIVATE', 'DIRECT', 'GROUP')
    const chanSlug = params.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const { data: channel } = await supabase
      .from('channels')
      .insert({
        organization_id: validOrgId,
        department_id: dept.id,
        name: chanSlug || 'dept-general',
        type: 'PUBLIC',
        description: `Discussions for ${params.name}`,
        created_by: validManagerId
      })
      .select()
      .single();

    return {
      dept,
      board: board ? { ...board, columns: columnsData } : undefined,
      channel
    };
  } catch (err) {
    console.warn('Error creating department in Supabase:', err);
    return null;
  }
}

export async function createTeamInSupabase(params: {
  orgId: string;
  departmentId: string;
  name: string;
  description?: string;
  leadId?: string;
}) {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    let validLeadId: string | null = null;
    if (params.leadId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.leadId)) {
      validLeadId = params.leadId;
    }

    let validOrgId = params.orgId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validOrgId)) {
      const { data: firstOrg } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
      if (firstOrg) validOrgId = firstOrg.id;
    }

    let validDeptId = params.departmentId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validDeptId)) {
      const { data: matchedDept } = await supabase
        .from('departments')
        .select('id')
        .eq('organization_id', validOrgId)
        .limit(1)
        .maybeSingle();
      if (matchedDept) validDeptId = matchedDept.id;
    }

    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        organization_id: validOrgId,
        department_id: validDeptId,
        name: params.name,
        description: params.description || '',
        lead_id: validLeadId
      })
      .select()
      .single();

    if (error) console.warn('Supabase team insert error:', error);
    return team;
  } catch (err) {
    console.warn('Failed to insert team in Supabase:', err);
    return null;
  }
}

export async function deleteDepartmentInSupabase(deptId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !deptId) return false;

  try {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', deptId);

    if (error) {
      console.warn('Failed to delete department in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error deleting department in Supabase:', err);
    return false;
  }
}

export async function deleteTeamInSupabase(teamId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !teamId) return false;

  try {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) {
      console.warn('Failed to delete team in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Error deleting team in Supabase:', err);
    return false;
  }
}
