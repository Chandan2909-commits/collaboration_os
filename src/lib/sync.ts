import { supabase, isSupabaseConfigured } from './supabase';
import { Organization, OrganizationMembership, Department, Team, Task, Board, Channel, User, UserRole } from './types';

export interface WorkspaceData {
  user?: User;
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
    const { data: memsData, error: memsErr } = await supabase
      .from('organization_memberships')
      .select('*')
      .eq('user_id', dbUser.id);

    if (memsErr || !memsData || memsData.length === 0) {
      return {
        user: {
          id: dbUser.id,
          clerk_id: dbUser.clerk_id,
          email: dbUser.email,
          full_name: dbUser.full_name,
          avatar_url: dbUser.avatar_url,
          status: dbUser.status
        },
        organizations: [],
        memberships: [],
        departments: [],
        teams: [],
        tasks: [],
        boards: [],
        channels: []
      };
    }

    const orgIds = memsData.map((m: any) => m.organization_id);

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
      organizations: orgsData || [],
      memberships: memsData.map((m: any) => ({
        id: m.id,
        organization_id: m.organization_id,
        user_id: m.user_id,
        role: m.role as UserRole,
        department_id: m.department_id,
        team_id: m.team_id,
        status: m.status,
        joined_at: m.joined_at,
        user: {
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
