import { supabase, isSupabaseConfigured } from './supabase';
import { Organization, OrganizationMembership, Department, Team, Task, TaskPriority, Board, BoardColumn, Channel, Message, User, UserRole, Invitation } from './types';

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
  messages?: Message[];
  invitations?: Invitation[];
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
      // Check if user was invited to an organization
      const { data: pendingInvs } = await supabase
        .from('invitations')
        .select('*')
        .ilike('email', dbUser.email)
        .is('accepted_at', null)
        .order('created_at', { ascending: false });

      if (pendingInvs && pendingInvs.length > 0) {
        for (const inv of pendingInvs) {
          const { data: invMem } = await supabase
            .from('organization_memberships')
            .upsert({
              organization_id: inv.organization_id,
              user_id: dbUser.id,
              role: inv.role || 'TEAM_MEMBER',
              status: 'ACTIVE'
            }, { onConflict: 'organization_id,user_id' })
            .select()
            .single();

          if (invMem) {
            userMems.push(invMem);

            if (inv.department_id) {
              await supabase
                .from('department_memberships')
                .upsert({
                  department_id: inv.department_id,
                  user_id: dbUser.id,
                  role: inv.role === 'DEPARTMENT_MANAGER' ? 'MANAGER' : 'MEMBER'
                }, { onConflict: 'department_id,user_id' });
            }

            if (inv.team_id) {
              await supabase
                .from('team_memberships')
                .upsert({
                  team_id: inv.team_id,
                  user_id: dbUser.id,
                  role: inv.role === 'TEAM_LEAD' ? 'LEAD' : 'MEMBER'
                }, { onConflict: 'team_id,user_id' });
            }

            await supabase
              .from('invitations')
              .update({ accepted_at: new Date().toISOString() })
              .eq('id', inv.id);
          }
        }
      }
    }

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
        // Enrolled as standard TEAM_MEMBER
        const { data: autoMem } = await supabase
          .from('organization_memberships')
          .insert({
            organization_id: existingOrgs[0].id,
            user_id: dbUser.id,
            role: 'TEAM_MEMBER',
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
        channels: [],
        invitations: []
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
    const allUserIds = Array.from(usersMap.keys());

    // 2c. Fetch department and team memberships for these users
    const { data: deptMems } = await supabase
      .from('department_memberships')
      .select('*')
      .in('user_id', allUserIds);

    const { data: teamMems } = await supabase
      .from('team_memberships')
      .select('*')
      .in('user_id', allUserIds);

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

    // 6. Fetch Tasks with Boards and Comments
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*, boards(*), task_comments(*, users(*))')
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

    // 8b. Fetch Messages for these channels
    const channelIds = (channelsData || []).map((c: any) => c.id);
    let messagesData: any[] = [];
    if (channelIds.length > 0) {
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, channel_id, sender_id, content, reply_to_id, attachments, created_at, users(id, full_name, email, avatar_url)')
        .in('channel_id', channelIds)
        .order('created_at', { ascending: true });
      messagesData = msgs || [];
    }

    // 9. Fetch Invitations
    const { data: invsData } = await supabase
      .from('invitations')
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
      memberships: (allMemsData || userMems || []).map((m: any) => {
        const uDept = (deptMems || []).find((dm: any) => dm.user_id === m.user_id);
        const uTeam = (teamMems || []).find((tm: any) => tm.user_id === m.user_id);
        return {
          id: m.id,
          organization_id: m.organization_id,
          user_id: m.user_id,
          role: m.role as UserRole,
          department_id: uDept?.department_id || m.department_id,
          team_id: uTeam?.team_id || m.team_id,
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
        };
      }),
      departments: deptsData || [],
      teams: teamsData || [],
      tasks: (tasksData || []).map((t: any) => ({
        id: t.id,
        organization_id: t.organization_id,
        board_id: t.board_id,
        column_id: t.column_id,
        department_id: t.boards?.department_id || undefined,
        team_id: t.boards?.team_id || undefined,
        title: t.title,
        description: t.description || '',
        created_by: t.created_by,
        assigned_to: t.assigned_to,
        priority: t.priority || 'MEDIUM',
        position: t.position || 1000,
        due_date: t.due_date,
        created_at: t.created_at,
        updated_at: t.updated_at,
        comments: (t.task_comments || []).map((c: any) => ({
          id: c.id,
          task_id: c.task_id,
          user_id: c.user_id,
          content: c.content,
          created_at: c.created_at,
          user: c.users ? {
            id: c.users.id,
            email: c.users.email,
            full_name: c.users.full_name,
            avatar_url: c.users.avatar_url
          } : undefined
        }))
      })),
      boards: (boardsData || []).map((b: any) => ({
        ...b,
        columns: (b.board_columns || []).sort((c1: any, c2: any) => (c1.position || 0) - (c2.position || 0))
      })),
      channels: channelsData || [],
      messages: (messagesData || []).map((m: any) => ({
        id: m.id,
        channel_id: m.channel_id,
        sender_id: m.sender_id,
        content: m.content,
        reply_to_id: m.reply_to_id,
        attachments: m.attachments,
        created_at: m.created_at,
        sender: m.users ? {
          id: m.users.id,
          email: m.users.email,
          full_name: m.users.full_name,
          avatar_url: m.users.avatar_url
        } : undefined
      })),
      invitations: (invsData || []).map((i: any) => ({
        id: i.id,
        organization_id: i.organization_id,
        department_id: i.department_id,
        team_id: i.team_id,
        email: i.email,
        role: i.role as UserRole,
        token_hash: i.token_hash,
        expires_at: i.expires_at,
        accepted_at: i.accepted_at,
        invited_by: i.invited_by,
        created_at: i.created_at
      }))
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

    if (team) {
      try {
        const { data: teamBoard } = await supabase
          .from('boards')
          .insert({
            organization_id: validOrgId,
            department_id: validDeptId,
            team_id: team.id,
            name: `${params.name} Sprint Board`,
            description: `Sprint board for ${params.name}`
          })
          .select()
          .single();

        if (teamBoard) {
          await supabase.from('board_columns').insert([
            { board_id: teamBoard.id, name: 'Backlog', position: 0, wip_limit: 15 },
            { board_id: teamBoard.id, name: 'To Do', position: 1, wip_limit: 8 },
            { board_id: teamBoard.id, name: 'In Progress', position: 2, wip_limit: 5 },
            { board_id: teamBoard.id, name: 'Review', position: 3, wip_limit: 4 },
            { board_id: teamBoard.id, name: 'Done', position: 4, wip_limit: 0 }
          ]);
        }
      } catch (bErr) {
        console.warn('Failed to create board for new team:', bErr);
      }

      // Also create channel for new team
      try {
        await supabase
          .from('channels')
          .insert({
            organization_id: validOrgId,
            department_id: validDeptId,
            team_id: team.id,
            name: params.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            type: 'PUBLIC',
            description: `Team pod stream for ${params.name}`
          });
      } catch (cErr) {
        console.warn('Failed to create channel for new team:', cErr);
      }
    }

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

export async function addEmployeeInSupabase(params: {
  orgId: string;
  email: string;
  fullName: string;
  role: UserRole;
  departmentId?: string;
  teamId?: string;
}) {
  if (!isSupabaseConfigured || !supabase || !params.orgId || !params.email) return null;
  try {
    let validOrgId = params.orgId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validOrgId)) {
      const { data: firstOrg } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
      if (firstOrg) validOrgId = firstOrg.id;
    }

    // 1. Resolve or create user in public.users
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', params.email.toLowerCase().trim())
      .maybeSingle();

    let dbUserId = existingUser?.id;
    if (!dbUserId) {
      const { data: newUser, error: createErr } = await supabase
        .from('users')
        .insert({
          email: params.email.toLowerCase().trim(),
          full_name: params.fullName || 'Employee',
          status: 'ACTIVE'
        })
        .select('id')
        .single();
      if (createErr || !newUser) {
        console.warn('Failed to insert user for employee in Supabase:', createErr);
        return null;
      }
      dbUserId = newUser.id;
    }

    // 2. Upsert membership in organization_memberships
    const { data: mem, error: memErr } = await supabase
      .from('organization_memberships')
      .upsert({
        organization_id: validOrgId,
        user_id: dbUserId,
        role: params.role,
        status: 'ACTIVE'
      }, { onConflict: 'organization_id,user_id' })
      .select()
      .single();

    if (memErr) console.warn('Supabase employee membership upsert error:', memErr);

    // 3. Department membership
    if (params.departmentId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.departmentId)) {
      await supabase
        .from('department_memberships')
        .upsert({
          department_id: params.departmentId,
          user_id: dbUserId,
          role: params.role === 'DEPARTMENT_MANAGER' ? 'MANAGER' : 'MEMBER'
        }, { onConflict: 'department_id,user_id' });
    }

    // 4. Team membership
    if (params.teamId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.teamId)) {
      await supabase
        .from('team_memberships')
        .upsert({
          team_id: params.teamId,
          user_id: dbUserId,
          role: params.role === 'TEAM_LEAD' ? 'LEAD' : 'MEMBER'
        }, { onConflict: 'team_id,user_id' });
    }

    return { dbUserId, membership: mem };
  } catch (err) {
    console.warn('addEmployeeInSupabase error:', err);
    return null;
  }
}

export async function updateMemberRoleInSupabase(
  orgId: string,
  userId: string,
  newRole: UserRole
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !orgId || !userId) return false;
  try {
    const { error } = await supabase
      .from('organization_memberships')
      .update({ role: newRole })
      .eq('organization_id', orgId)
      .eq('user_id', userId);

    if (error) {
      console.warn('updateMemberRoleInSupabase error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('updateMemberRoleInSupabase exception:', err);
    return false;
  }
}

export async function updateMemberDepartmentInSupabase(
  orgId: string,
  userId: string,
  departmentId?: string,
  teamId?: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !orgId || !userId) return false;
  try {
    const { data: orgDepts } = await supabase
      .from('departments')
      .select('id')
      .eq('organization_id', orgId);

    const deptIds = (orgDepts || []).map((d: any) => d.id);
    if (deptIds.length > 0) {
      await supabase
        .from('department_memberships')
        .delete()
        .eq('user_id', userId)
        .in('department_id', deptIds);
    }

    if (departmentId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(departmentId)) {
      await supabase
        .from('department_memberships')
        .upsert({
          department_id: departmentId,
          user_id: userId,
          role: 'MEMBER'
        }, { onConflict: 'department_id,user_id' });
    }

    if (teamId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teamId)) {
      await supabase
        .from('team_memberships')
        .upsert({
          team_id: teamId,
          user_id: userId,
          role: 'MEMBER'
        }, { onConflict: 'team_id,user_id' });
    }

    return true;
  } catch (err) {
    console.warn('updateMemberDepartmentInSupabase exception:', err);
    return false;
  }
}

export async function removeMemberInSupabase(
  orgId: string,
  userId: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !orgId || !userId) return false;
  try {
    await supabase
      .from('organization_memberships')
      .delete()
      .eq('organization_id', orgId)
      .eq('user_id', userId);

    return true;
  } catch (err) {
    console.warn('removeMemberInSupabase exception:', err);
    return false;
  }
}

export async function createInvitationInSupabase(inv: {
  organization_id: string;
  department_id?: string;
  team_id?: string;
  email: string;
  role: string;
  token_hash: string;
  expires_at?: string;
  invited_by?: string;
}) {
  if (!isSupabaseConfigured || !supabase || !inv.organization_id || !inv.email) return null;
  try {
    let validOrgId = inv.organization_id;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validOrgId)) {
      const { data: firstOrg } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
      if (firstOrg) validOrgId = firstOrg.id;
    }

    let validDeptId = inv.department_id;
    if (validDeptId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validDeptId)) {
      validDeptId = undefined;
    }
    let validTeamId = inv.team_id;
    if (validTeamId && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validTeamId)) {
      validTeamId = undefined;
    }
    let validInvitedBy = inv.invited_by;
    if (validInvitedBy && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(validInvitedBy)) {
      validInvitedBy = undefined;
    }

    const { data, error } = await supabase
      .from('invitations')
      .insert({
        organization_id: validOrgId,
        department_id: validDeptId || null,
        team_id: validTeamId || null,
        email: inv.email.toLowerCase().trim(),
        role: inv.role,
        token_hash: inv.token_hash,
        expires_at: inv.expires_at || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        invited_by: validInvitedBy || null
      })
      .select()
      .single();

    if (error) console.warn('createInvitationInSupabase error:', error);
    return data;
  } catch (err) {
    console.warn('createInvitationInSupabase exception:', err);
    return null;
  }
}

export async function acceptInvitationInSupabase(
  token: string,
  userId: string,
  userEmail: string
) {
  if (!isSupabaseConfigured || !supabase || !token) return null;
  try {
    const { data: inv } = await supabase
      .from('invitations')
      .select('*')
      .eq('token_hash', token)
      .maybeSingle();

    if (!inv) return null;

    let dbUserId = userId;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail.toLowerCase())
        .maybeSingle();
      if (user) dbUserId = user.id;
    }

    if (dbUserId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dbUserId)) {
      await supabase
        .from('organization_memberships')
        .upsert({
          organization_id: inv.organization_id,
          user_id: dbUserId,
          role: inv.role,
          status: 'ACTIVE'
        }, { onConflict: 'organization_id,user_id' });

      if (inv.department_id) {
        await supabase
          .from('department_memberships')
          .upsert({
            department_id: inv.department_id,
            user_id: dbUserId,
            role: inv.role === 'DEPARTMENT_MANAGER' ? 'MANAGER' : 'MEMBER'
          }, { onConflict: 'department_id,user_id' });
      }

      if (inv.team_id) {
        await supabase
          .from('team_memberships')
          .upsert({
            team_id: inv.team_id,
            user_id: dbUserId,
            role: inv.role === 'TEAM_LEAD' ? 'LEAD' : 'MEMBER'
          }, { onConflict: 'team_id,user_id' });
      }

      await supabase
        .from('invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', inv.id);
    }

    return inv;
  } catch (err) {
    console.warn('acceptInvitationInSupabase exception:', err);
    return null;
  }
}

export async function fetchMessagesFromSupabase(channelId?: string): Promise<Message[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    let query = supabase
      .from('messages')
      .select('id, channel_id, sender_id, content, reply_to_id, attachments, created_at, users(id, full_name, email, avatar_url)')
      .order('created_at', { ascending: true });

    if (channelId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (isUuid.test(channelId)) {
        query = query.eq('channel_id', channelId);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.warn('fetchMessagesFromSupabase error:', error);
      return [];
    }

    return (data || []).map((m: any) => {
      const u: any = Array.isArray(m.users) ? m.users[0] : m.users;
      return {
        id: m.id,
        channel_id: m.channel_id,
        sender_id: m.sender_id,
        content: m.content,
        reply_to_id: m.reply_to_id,
        attachments: m.attachments,
        created_at: m.created_at,
        sender: u ? {
          id: u.id,
          email: u.email,
          full_name: u.full_name,
          avatar_url: u.avatar_url
        } : undefined
      };
    });
  } catch (err) {
    console.warn('fetchMessagesFromSupabase exception:', err);
    return [];
  }
}

export async function fetchTasksFromSupabase(orgId?: string): Promise<Task[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    let query = supabase
      .from('tasks')
      .select('*, boards(id, department_id, team_id), task_comments(*, users(*))')
      .order('position', { ascending: true });

    if (orgId) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (isUuid.test(orgId)) {
        query = query.eq('organization_id', orgId);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.warn('fetchTasksFromSupabase error:', error);
      return [];
    }

    return (data || []).map((t: any) => ({
      id: t.id,
      organization_id: t.organization_id,
      board_id: t.board_id,
      column_id: t.column_id,
      department_id: t.boards?.department_id || undefined,
      team_id: t.boards?.team_id || undefined,
      title: t.title,
      description: t.description || '',
      created_by: t.created_by,
      assigned_to: t.assigned_to,
      priority: t.priority || 'MEDIUM',
      position: t.position || 1000,
      due_date: t.due_date,
      created_at: t.created_at,
      updated_at: t.updated_at,
      comments: (t.task_comments || []).map((c: any) => ({
        id: c.id,
        task_id: c.task_id,
        user_id: c.user_id,
        content: c.content,
        created_at: c.created_at,
        user: c.users ? {
          id: c.users.id,
          email: c.users.email,
          full_name: c.users.full_name,
          avatar_url: c.users.avatar_url
        } : undefined
      }))
    }));
  } catch (err) {
    console.warn('fetchTasksFromSupabase exception:', err);
    return [];
  }
}

export async function sendMessageInSupabase(
  channelId: string,
  senderId: string,
  content: string,
  replyToId?: string,
  senderEmail?: string,
  channelName?: string
): Promise<Message | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let validSenderId = senderId;
    if (!isUuid.test(validSenderId)) {
      const { data: u } = await supabase
        .from('users')
        .select('id')
        .or(`clerk_id.eq.${senderId},email.eq.${(senderEmail || '').toLowerCase()}`)
        .limit(1)
        .maybeSingle();
      if (u?.id) validSenderId = u.id;
    }

    let validChannelId = channelId;
    if (!isUuid.test(validChannelId)) {
      if (channelName) {
        const { data: namedCh } = await supabase
          .from('channels')
          .select('id')
          .eq('name', channelName.toLowerCase().trim())
          .limit(1)
          .maybeSingle();
        if (namedCh?.id) validChannelId = namedCh.id;
      }
      if (!isUuid.test(validChannelId)) {
        const { data: ch } = await supabase
          .from('channels')
          .select('id')
          .eq('name', 'general')
          .limit(1)
          .maybeSingle();
        if (ch?.id) validChannelId = ch.id;
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        channel_id: validChannelId,
        sender_id: validSenderId,
        content,
        reply_to_id: replyToId && isUuid.test(replyToId) ? replyToId : null
      })
      .select('id, channel_id, sender_id, content, reply_to_id, attachments, created_at, users(id, full_name, email, avatar_url)')
      .single();

    if (error) {
      console.warn('sendMessageInSupabase error:', error);
      return null;
    }

    const msgData: any = data;
    const senderUser: any = Array.isArray(msgData?.users) ? msgData.users[0] : msgData?.users;

    return {
      id: msgData.id,
      channel_id: msgData.channel_id,
      sender_id: msgData.sender_id,
      content: msgData.content,
      reply_to_id: msgData.reply_to_id,
      attachments: msgData.attachments,
      created_at: msgData.created_at,
      sender: senderUser ? {
        id: senderUser.id,
        email: senderUser.email,
        full_name: senderUser.full_name,
        avatar_url: senderUser.avatar_url
      } : undefined
    };
  } catch (err) {
    console.warn('sendMessageInSupabase exception:', err);
    return null;
  }
}

export async function createChannelInSupabase(channel: {
  orgId: string;
  name: string;
  type?: Channel['type'];
  description?: string;
  deptId?: string;
  teamId?: string;
  createdBy?: string;
}): Promise<Channel | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const { data, error } = await supabase
      .from('channels')
      .insert({
        organization_id: channel.orgId,
        name: channel.name.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        type: channel.type || 'PUBLIC',
        description: channel.description || null,
        department_id: channel.deptId && isUuid.test(channel.deptId) ? channel.deptId : null,
        team_id: channel.teamId && isUuid.test(channel.teamId) ? channel.teamId : null,
        created_by: channel.createdBy && isUuid.test(channel.createdBy) ? channel.createdBy : null
      })
      .select('*')
      .single();

    if (error) {
      console.warn('createChannelInSupabase error:', error);
      return null;
    }

    return {
      id: data.id,
      organization_id: data.organization_id,
      department_id: data.department_id,
      team_id: data.team_id,
      name: data.name,
      type: data.type,
      description: data.description,
      created_by: data.created_by,
      created_at: data.created_at
    };
  } catch (err) {
    console.warn('createChannelInSupabase exception:', err);
    return null;
  }
}

export async function createTaskInSupabase(params: {
  orgId: string;
  boardId?: string;
  columnId?: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDate?: string;
  createdBy?: string;
  teamId?: string;
  deptId?: string;
  position?: number;
}): Promise<Task | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  try {
    let validOrgId = params.orgId;
    if (!isUuid.test(validOrgId)) {
      const { data: firstOrg } = await supabase.from('organizations').select('id').limit(1).maybeSingle();
      if (firstOrg) validOrgId = firstOrg.id;
    }

    // Resolve Board
    let targetBoardId: string | null = null;
    let targetBoard: any = null;

    if (params.boardId && isUuid.test(params.boardId)) {
      const { data: b } = await supabase.from('boards').select('*, board_columns(*)').eq('id', params.boardId).maybeSingle();
      if (b) {
        targetBoardId = b.id;
        targetBoard = b;
      }
    }

    // Resolve Team ID if slug, name or UUID is provided
    let validTeamId: string | null = null;
    if (params.teamId && isUuid.test(params.teamId)) {
      validTeamId = params.teamId;
    } else if (params.teamId) {
      const cleanTeam = params.teamId.replace(/^team_/, '').toLowerCase();
      const { data: dbTeams } = await supabase.from('teams').select('id, name, department_id').eq('organization_id', validOrgId);
      const matched = (dbTeams || []).find((t: any) =>
        t.id === params.teamId ||
        t.name.toLowerCase().includes(cleanTeam) ||
        cleanTeam.includes(t.name.toLowerCase())
      );
      if (matched) validTeamId = matched.id;
    }

    // Resolve Dept ID if slug, name or UUID is provided
    let validDeptId: string | null = null;
    if (params.deptId && isUuid.test(params.deptId)) {
      validDeptId = params.deptId;
    } else if (params.deptId) {
      const cleanDept = params.deptId.replace(/^dept_/, '').toLowerCase();
      const { data: dbDepts } = await supabase.from('departments').select('id, name').eq('organization_id', validOrgId);
      const matched = (dbDepts || []).find((d: any) =>
        d.id === params.deptId ||
        d.name.toLowerCase().includes(cleanDept) ||
        cleanDept.includes(d.name.toLowerCase())
      );
      if (matched) validDeptId = matched.id;
    }

    // If no board found and teamId is provided, find or create team's board
    if (!targetBoardId && validTeamId) {
      const { data: tb } = await supabase.from('boards').select('*, board_columns(*)').eq('team_id', validTeamId).maybeSingle();
      if (tb) {
        targetBoardId = tb.id;
        targetBoard = tb;
      } else {
        const { data: teamObj } = await supabase.from('teams').select('name, department_id').eq('id', validTeamId).maybeSingle();
        const { data: newTeamB } = await supabase.from('boards').insert({
          organization_id: validOrgId,
          department_id: teamObj?.department_id || validDeptId || null,
          team_id: validTeamId,
          name: `${teamObj?.name || 'Team'} Sprint Board`,
          description: `Sprint board for ${teamObj?.name || 'team'}`
        }).select().single();

        if (newTeamB) {
          targetBoardId = newTeamB.id;
          const { data: cols } = await supabase.from('board_columns').insert([
            { board_id: newTeamB.id, name: 'Backlog', position: 0, wip_limit: 15 },
            { board_id: newTeamB.id, name: 'To Do', position: 1, wip_limit: 8 },
            { board_id: newTeamB.id, name: 'In Progress', position: 2, wip_limit: 5 },
            { board_id: newTeamB.id, name: 'Review', position: 3, wip_limit: 4 },
            { board_id: newTeamB.id, name: 'Done', position: 4, wip_limit: 0 }
          ]).select();
          targetBoard = { ...newTeamB, board_columns: cols || [] };
        }
      }
    }

    // If no board found and deptId is provided, find department's board
    if (!targetBoardId && validDeptId) {
      const { data: db } = await supabase.from('boards').select('*, board_columns(*)').eq('department_id', validDeptId).maybeSingle();
      if (db) {
        targetBoardId = db.id;
        targetBoard = db;
      }
    }

    // If still no board found, find any board for organization or create one
    if (!targetBoardId) {
      const { data: ob } = await supabase.from('boards').select('*, board_columns(*)').eq('organization_id', validOrgId).limit(1).maybeSingle();
      if (ob) {
        targetBoardId = ob.id;
        targetBoard = ob;
      } else {
        const { data: createdB } = await supabase.from('boards').insert({
          organization_id: validOrgId,
          name: 'Main Kanban Board',
          description: 'Organization Sprint Board'
        }).select().single();
        if (createdB) {
          targetBoardId = createdB.id;
          const { data: cols } = await supabase.from('board_columns').insert([
            { board_id: createdB.id, name: 'Backlog', position: 0, wip_limit: 15 },
            { board_id: createdB.id, name: 'To Do', position: 1, wip_limit: 8 },
            { board_id: createdB.id, name: 'In Progress', position: 2, wip_limit: 5 },
            { board_id: createdB.id, name: 'Review', position: 3, wip_limit: 4 },
            { board_id: createdB.id, name: 'Done', position: 4, wip_limit: 0 }
          ]).select();
          targetBoard = { ...createdB, board_columns: cols || [] };
        }
      }
    }

    if (!targetBoardId) return null;

    // Resolve column
    let targetColId: string | null = null;
    const boardCols = targetBoard?.board_columns || [];

    if (params.columnId && isUuid.test(params.columnId)) {
      targetColId = params.columnId;
    } else if (params.columnId && boardCols.length > 0) {
      const cleanSlug = (params.columnId || '').toLowerCase().replace(/^col_/, '').replace(/[^a-z0-9]/g, '');
      const matched = boardCols.find((c: any) =>
        c.id === params.columnId ||
        (c.name || '').toLowerCase().replace(/^col_/, '').replace(/[^a-z0-9]/g, '') === cleanSlug ||
        (c.id || '').toLowerCase().replace(/^col_/, '').replace(/[^a-z0-9]/g, '') === cleanSlug
      );
      if (matched) targetColId = matched.id;
    }

    if (!targetColId && boardCols.length > 0) {
      targetColId = boardCols[0].id;
    }

    // Resolve assigned_to
    let validAssignedTo: string | null = null;
    if (params.assignedTo && isUuid.test(params.assignedTo)) {
      validAssignedTo = params.assignedTo;
    } else if (params.assignedTo) {
      const { data: u } = await supabase.from('users').select('id').or(`clerk_id.eq.${params.assignedTo},email.eq.${params.assignedTo}`).maybeSingle();
      if (u) validAssignedTo = u.id;
    }

    // Resolve created_by
    let validCreatedBy: string | null = null;
    if (params.createdBy && isUuid.test(params.createdBy)) {
      validCreatedBy = params.createdBy;
    } else if (params.createdBy) {
      const { data: cu } = await supabase.from('users').select('id').or(`clerk_id.eq.${params.createdBy},email.eq.${params.createdBy}`).maybeSingle();
      if (cu) validCreatedBy = cu.id;
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        organization_id: validOrgId,
        board_id: targetBoardId,
        column_id: targetColId,
        title: params.title,
        description: params.description || null,
        priority: params.priority || 'MEDIUM',
        position: params.position || 1000,
        due_date: params.dueDate || null,
        assigned_to: validAssignedTo,
        created_by: validCreatedBy
      })
      .select('*, boards(*)')
      .single();

    if (error) {
      console.warn('createTaskInSupabase error:', error);
      return null;
    }

    return {
      id: task.id,
      organization_id: task.organization_id,
      board_id: task.board_id,
      column_id: task.column_id,
      department_id: task.boards?.department_id || params.deptId,
      team_id: task.boards?.team_id || params.teamId,
      title: task.title,
      description: task.description || '',
      created_by: task.created_by,
      assigned_to: task.assigned_to,
      priority: task.priority,
      position: task.position,
      due_date: task.due_date,
      created_at: task.created_at,
      updated_at: task.updated_at,
      comments: []
    };
  } catch (err) {
    console.warn('createTaskInSupabase exception:', err);
    return null;
  }
}

export async function updateTaskInSupabase(
  taskId: string,
  updates: Partial<Task>
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!isUuid.test(taskId)) return false;

  try {
    const payload: any = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.due_date !== undefined) payload.due_date = updates.due_date || null;
    if (updates.position !== undefined) payload.position = updates.position;

    if (updates.assigned_to !== undefined) {
      if (updates.assigned_to && isUuid.test(updates.assigned_to)) {
        payload.assigned_to = updates.assigned_to;
      } else if (!updates.assigned_to) {
        payload.assigned_to = null;
      }
    }

    if (updates.column_id !== undefined && isUuid.test(updates.column_id)) {
      payload.column_id = updates.column_id;
    }

    const { error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', taskId);

    if (error) {
      console.warn('updateTaskInSupabase error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('updateTaskInSupabase exception:', err);
    return false;
  }
}

export async function moveTaskInSupabase(
  taskId: string,
  targetColId: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!isUuid.test(taskId)) return false;

  try {
    let resolvedColId = targetColId;
    if (!isUuid.test(targetColId)) {
      const { data: t } = await supabase.from('tasks').select('board_id').eq('id', taskId).maybeSingle();
      if (t?.board_id) {
        const { data: cols } = await supabase.from('board_columns').select('*').eq('board_id', t.board_id);
        const cleanSlug = (targetColId || '').toLowerCase().replace(/^col_/, '').replace(/[^a-z0-9]/g, '');
        const matched = (cols || []).find((c: any) =>
          c.id === targetColId ||
          (c.name || '').toLowerCase().replace(/^col_/, '').replace(/[^a-z0-9]/g, '') === cleanSlug ||
          (c.id || '').toLowerCase().replace(/^col_/, '').replace(/[^a-z0-9]/g, '') === cleanSlug
        );
        if (matched) resolvedColId = matched.id;
      }
    }

    const { error } = await supabase
      .from('tasks')
      .update({
        column_id: resolvedColId,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      console.warn('moveTaskInSupabase error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('moveTaskInSupabase exception:', err);
    return false;
  }
}

export async function deleteTaskInSupabase(taskId: string, title?: string, orgId?: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  try {
    if (isUuid.test(taskId)) {
      await supabase.from('tasks').delete().eq('id', taskId);
    }
    if (title) {
      let query = supabase.from('tasks').delete().ilike('title', title.trim());
      if (orgId && isUuid.test(orgId)) {
        query = query.eq('organization_id', orgId);
      }
      await query;
    }
    return true;
  } catch (err) {
    console.warn('deleteTaskInSupabase exception:', err);
    return false;
  }
}

export async function addTaskCommentInSupabase(
  taskId: string,
  userId: string,
  content: string
): Promise<any> {
  if (!isSupabaseConfigured || !supabase) return null;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!isUuid.test(taskId)) return null;

  try {
    let validUserId = userId;
    if (!isUuid.test(userId)) {
      const { data: u } = await supabase.from('users').select('id').or(`clerk_id.eq.${userId},email.eq.${userId}`).maybeSingle();
      if (u) validUserId = u.id;
    }

    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        user_id: validUserId,
        content
      })
      .select('*, users(*)')
      .single();

    if (error) {
      console.warn('addTaskCommentInSupabase error:', error);
      return null;
    }
    return data;
  } catch (err) {
    console.warn('addTaskCommentInSupabase exception:', err);
    return null;
  }
}

let isSyncingTasksRunning = false;

export async function syncLocalTasksToSupabase(tasks: Task[], orgId: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase || !tasks || tasks.length === 0) return;
  if (isSyncingTasksRunning) return;
  isSyncingTasksRunning = true;

  try {
    const { data: existing } = await supabase
      .from('tasks')
      .select('id, title')
      .eq('organization_id', orgId);

    const existingTitles = new Set((existing || []).map((e: any) => e.title?.toLowerCase().trim()));

    // Check deleted task titles and IDs in localStorage
    let deletedSet: string[] = [];
    if (typeof window !== 'undefined') {
      try {
        const savedDeleted = localStorage.getItem('crosstech_deleted_task_ids');
        if (savedDeleted) deletedSet = JSON.parse(savedDeleted);
      } catch {}
    }

    for (const t of tasks) {
      const titleLower = t.title?.toLowerCase().trim();
      if (deletedSet.includes(t.id) || (titleLower && deletedSet.includes(titleLower))) {
        continue;
      }
      if (titleLower && !existingTitles.has(titleLower)) {
        existingTitles.add(titleLower);
        await createTaskInSupabase({
          orgId,
          boardId: t.board_id,
          columnId: t.column_id,
          title: t.title,
          description: t.description,
          priority: t.priority,
          assignedTo: t.assigned_to,
          dueDate: t.due_date,
          createdBy: t.created_by,
          teamId: t.team_id,
          deptId: t.department_id,
          position: t.position
        });
      }
    }
  } catch (err) {
    console.warn('syncLocalTasksToSupabase exception:', err);
  } finally {
    isSyncingTasksRunning = false;
  }
}


