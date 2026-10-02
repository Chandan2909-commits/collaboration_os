'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  UsersRound,
  Kanban,
  MessageSquare,
  UserPlus,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { SignatureHero } from '@/components/layout/SignatureHero';
import { DualBezierChart, SpeedometerGauge, CircularProgressRing } from '@/components/charts/SvgCharts';
import { TaskPriority } from '@/lib/types';

export default function DashboardOverviewPage() {
  const {
    currentOrg,
    currentUser,
    currentUserMembership,
    memberships,
    departments,
    teams,
    tasks,
    channels,
    auditLogs,
    moveTask,
    setIsInviteModalOpen,
    setIsTaskModalOpen,
    isOwnerOrAdmin
  } = useApp();

  const isExecutive = isOwnerOrAdmin;
  const isManager = !isExecutive && currentUser.role === 'DEPARTMENT_MANAGER';
  const isEmployee = !isExecutive && !isManager;

  // Department scoping
  const userDeptId = currentUserMembership?.department_id;
  const userDepartment = departments.find(d => d.id === userDeptId) || departments[0];

  // Scoped tasks
  const myTasks = tasks.filter(t => t.assigned_to === currentUser.id);
  const myDeptTasks = tasks.filter(t => t.department_id === (userDeptId || departments[0]?.id));

  // Executive stats
  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.column_id === 'col_in_progress').length;
  const doneTasks = tasks.filter(t => t.column_id === 'col_done').length;
  const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const velocityScore = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 1000) / 10 : 0;

  // Manager stats
  const deptTotalTasks = myDeptTasks.length;
  const deptDoneTasks = myDeptTasks.filter(t => t.column_id === 'col_done').length;
  const deptCompletionRate = deptTotalTasks > 0 ? Math.round((deptDoneTasks / deptTotalTasks) * 100) : 0;
  const deptVelocityScore = deptTotalTasks > 0 ? Math.round((deptDoneTasks / deptTotalTasks) * 1000) / 10 : 0;
  const deptTeams = teams.filter(t => t.department_id === userDeptId);

  // Real Weekly Task Trend Calculation
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const createdDaily = [0, 0, 0, 0, 0, 0, 0];
  const resolvedDaily = [0, 0, 0, 0, 0, 0, 0];
  let priorCreated = 0;
  let priorResolved = 0;

  tasks.forEach(t => {
    const cDate = t.created_at ? new Date(t.created_at) : null;
    if (cDate && !isNaN(cDate.getTime())) {
      if (cDate < monday) {
        priorCreated += 1;
      } else {
        const d = cDate.getDay();
        const idx = d === 0 ? 6 : d - 1;
        if (idx >= 0 && idx < 7) {
          createdDaily[idx] += 1;
        }
      }
    }

    if (t.column_id === 'col_done') {
      const rDate = t.updated_at ? new Date(t.updated_at) : (cDate || null);
      if (rDate && !isNaN(rDate.getTime())) {
        if (rDate < monday) {
          priorResolved += 1;
        } else {
          const d = rDate.getDay();
          const idx = d === 0 ? 6 : d - 1;
          if (idx >= 0 && idx < 7) {
            resolvedDaily[idx] += 1;
          }
        }
      }
    }
  });

  let accCreated = priorCreated;
  let accResolved = priorResolved;
  const seriesA = createdDaily.map(cnt => {
    accCreated += cnt;
    return accCreated;
  });
  const seriesB = resolvedDaily.map(cnt => {
    accResolved += cnt;
    return accResolved;
  });

  const getPriorityStyle = (priority: TaskPriority) => {
    switch (priority) {
      case 'URGENT':
        return { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca', label: 'Urgent' };
      case 'HIGH':
        return { bg: '#ffedd5', color: '#c2410c', border: '#fed7aa', label: 'High' };
      case 'MEDIUM':
        return { bg: '#fef9c3', color: '#854d0e', border: '#fef08a', label: 'Medium' };
      case 'LOW':
      default:
        return { bg: '#eff6ff', color: '#1d4ed8', border: '#dbeafe', label: 'Low' };
    }
  };

  const getColumnName = (colId: string) => {
    switch (colId) {
      case 'col_backlog': return 'Backlog';
      case 'col_todo': return 'To Do';
      case 'col_in_progress': return 'In Progress';
      case 'col_review': return 'In Review';
      case 'col_done': return 'Done';
      default: return 'Active';
    }
  };

  /* ==============================================================================
     1. EMPLOYEE & CONTRIBUTOR VIEW (Strictly Scoped: No Executive Metrics)
     ============================================================================== */
  if (isEmployee) {
    const employeeInProgress = myTasks.filter(t => t.column_id === 'col_in_progress').length;
    const employeeDone = myTasks.filter(t => t.column_id === 'col_done').length;
    const deptChannels = channels.filter(c => !c.department_id || c.department_id === userDeptId);

    return (
      <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Contributor Hero */}
        <SignatureHero
          tag="Contributor Workspace"
          title={`Welcome back, ${currentUser.full_name}`}
          description={`Assigned to ${userDepartment?.name || 'CrossTech'}. Track your active sprint deliverables, update task progress, and collaborate in team channels.`}
          primaryAction={{
            label: 'View Kanban Board',
            icon: <Kanban style={{ width: 14, height: 14 }} />,
            onClick: () => {
              window.location.href = '/kanban';
            }
          }}
          secondaryAction={{
            label: 'Team Channels',
            icon: <MessageSquare style={{ width: 14, height: 14 }} />,
            onClick: () => {
              window.location.href = '/chat';
            }
          }}
        />

        {/* 4-Card Contributor KPI Grid */}
        <div className="grid grid-cols-4 gap-4">
          <div className="card card-hover" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280' }}>
                Assigned To Me
              </span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ListTodo style={{ width: 15, height: 15, color: '#1d4ed8' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', fontFamily: 'Montserrat, sans-serif' }}>
              {myTasks.length}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Sprint tasks in your queue
            </p>
          </div>

          <div className="card card-hover" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280' }}>
                In Progress
              </span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity style={{ width: 15, height: 15, color: '#d97706' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', fontFamily: 'Montserrat, sans-serif' }}>
              {employeeInProgress}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Currently being executed
            </p>
          </div>

          <div className="card card-hover" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280' }}>
                Completed Tasks
              </span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 style={{ width: 15, height: 15, color: '#059669' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', fontFamily: 'Montserrat, sans-serif' }}>
              {employeeDone}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Finished this sprint cycle
            </p>
          </div>

          <div className="card card-hover" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280' }}>
                My Department
              </span>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 style={{ width: 15, height: 15, color: '#7c3aed' }} />
              </div>
            </div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Montserrat, sans-serif' }}>
              {userDepartment?.name || 'Engineering'}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Role: {currentUser.role === 'TEAM_LEAD' ? 'Team Lead' : 'Team Member'}
            </p>
          </div>
        </div>

        {/* 2-Pane Contributor Dashboard Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
          {/* Left: My Sprint Focus Tasks */}
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>My Sprint Focus & Tasks</h3>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
                  Direct deliverables assigned to your account. Advance states as you make progress.
                </p>
              </div>
              <Link href="/kanban" className="btn btn-secondary btn-sm">
                Open Kanban Board
              </Link>
            </div>

            {myTasks.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
                <CheckCircle2 style={{ width: 36, height: 36, color: '#10b981', margin: '0 auto 8px auto' }} />
                <div style={{ fontWeight: 600, color: '#111827' }}>All Caught Up!</div>
                <div style={{ fontSize: '0.8125rem' }}>No pending tasks assigned to you right now. Check your department board.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myTasks.map(task => {
                  const pStyle = getPriorityStyle(task.priority);
                  return (
                    <div
                      key={task.id}
                      style={{
                        padding: '14px 16px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              background: pStyle.bg,
                              color: pStyle.color,
                              border: `1px solid ${pStyle.border}`
                            }}
                          >
                            {pStyle.label}
                          </span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                            {task.title}
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            background: '#eff6ff',
                            color: '#1d4ed8'
                          }}
                        >
                          {getColumnName(task.column_id)}
                        </span>
                      </div>

                      {task.description && (
                        <p style={{ fontSize: '0.8125rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                          {task.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                          <Clock style={{ width: 13, height: 13 }} />
                          <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'End of Sprint'}</span>
                        </div>

                        {/* Quick State Advance Buttons */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {task.column_id !== 'col_in_progress' && task.column_id !== 'col_done' && (
                            <button
                              type="button"
                              onClick={() => moveTask(task.id, 'col_in_progress')}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.6875rem' }}
                            >
                              Start Work
                            </button>
                          )}
                          {task.column_id === 'col_in_progress' && (
                            <button
                              type="button"
                              onClick={() => moveTask(task.id, 'col_review')}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.6875rem' }}
                            >
                              Submit for Review
                            </button>
                          )}
                          {task.column_id !== 'col_done' && (
                            <button
                              type="button"
                              onClick={() => moveTask(task.id, 'col_done')}
                              className="btn btn-primary btn-sm"
                              style={{ padding: '2px 8px', fontSize: '0.6875rem', background: '#059669' }}
                            >
                              Mark Done
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Department Collaboration & Streams */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare style={{ width: 16, height: 16, color: '#1d4ed8' }} />
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>Team Channels</h4>
                </div>
                <Link href="/chat" style={{ fontSize: '0.75rem', color: '#1d4ed8', fontWeight: 600 }}>
                  View All
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {deptChannels.slice(0, 4).map(chan => (
                  <Link
                    key={chan.id}
                    href="/chat"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      textDecoration: 'none',
                      color: '#0f172a',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>#{chan.name}</span>
                    <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                      {chan.department_id ? 'Dept Channel' : 'Org-wide'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0 0 10px 0' }}>
                Department Focus
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                {userDepartment?.description || 'Collaborate with your team members on tasks and sprint deliverables.'}
              </p>
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: '#64748b' }}>Assigned Pods:</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>{teams.filter(t => t.department_id === userDeptId).length} Teams</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==============================================================================
     2. DEPARTMENT MANAGER VIEW
     ============================================================================== */
  if (isManager) {
    return (
      <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <SignatureHero
          tag="Department Operations"
          title={`${userDepartment?.name || 'Department'} Overview`}
          description={`Operational command for ${userDepartment?.name}. Manage department teams, monitor sprint tasks, and allocate pod deliverables.`}
          primaryAction={{
            label: 'Create Dept Task',
            icon: <Plus style={{ width: 14, height: 14 }} />,
            onClick: () => setIsTaskModalOpen(true)
          }}
          secondaryAction={{
            label: 'Department Kanban',
            icon: <Kanban style={{ width: 14, height: 14 }} />,
            onClick: () => {
              window.location.href = '/kanban';
            }
          }}
        />

        <div className="grid grid-cols-4 gap-4">
          <div className="card card-hover" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280' }}>Dept Active Tasks</span>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111827', fontFamily: 'Montserrat, sans-serif' }}>
              {deptTotalTasks}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Scoped to {userDepartment?.name}
            </p>
          </div>

          <div className="card card-hover" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280' }}>Department Teams</span>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111827', fontFamily: 'Montserrat, sans-serif' }}>
              {deptTeams.length}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Specialized engineering squads
            </p>
          </div>

          <div className="card card-hover" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280' }}>Completion Rate</span>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#059669', fontFamily: 'Montserrat, sans-serif' }}>
              {deptCompletionRate}%
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              {deptDoneTasks} of {deptTotalTasks} tasks resolved
            </p>
          </div>

          <div className="card card-hover" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280' }}>Department Channels</span>
            <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111827', fontFamily: 'Montserrat, sans-serif' }}>
              {channels.filter(c => c.department_id === userDeptId).length}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              Team communication streams
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px' }}>
          <div className="card" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Department Teams & Pods</h3>
              <Link href="/kanban" className="btn btn-secondary btn-sm">Sprint Board</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {deptTeams.map(t => (
                <div key={t.id} style={{ padding: '12px 14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.description}</div>
                  </div>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', background: '#e2e8f0' }}>
                    {(memberships || []).filter(m => m.team_id === t.id).length || 1} {((memberships || []).filter(m => m.team_id === t.id).length || 1) === 1 ? 'member' : 'members'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '22px 24px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px' }}>Department Sprint Velocity</h3>
            <SpeedometerGauge score={deptVelocityScore} label={deptTotalTasks > 0 ? "Department Health" : "No Tasks Active"} />
          </div>
        </div>
      </div>
    );
  }

  /* ==============================================================================
     3. EXECUTIVE & OWNER VIEW (Full Platform Metrics & Growth Insights)
     ============================================================================== */
  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Signature Dark-Blue Gradient Hero Card */}
      <SignatureHero
        tag="Executive Tenant Overview"
        title={currentOrg?.name || 'CrossTech Collaboration OS'}
        description={`Hierarchical organization structure: ${departments.length} Departments, ${teams.length} Specialized Teams, and isolated Supabase PostgreSQL tenancy.`}
        primaryAction={{
          label: 'Create Task',
          icon: <Plus style={{ width: 14, height: 14 }} />,
          onClick: () => setIsTaskModalOpen(true)
        }}
        secondaryAction={{
          label: 'Invite Member',
          icon: <UserPlus style={{ width: 14, height: 14 }} />,
          onClick: () => setIsInviteModalOpen(true)
        }}
      />

      {/* KPI 4-Card Grid from master_design.md */}
      <div className="grid grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="card card-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280' }}>
              Departments
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 style={{ width: 15, height: 15, color: '#1d4ed8' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', fontFamily: 'Montserrat, sans-serif' }}>
            {departments.length}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
            Engineering, Product, Ops & Growth
          </p>
        </div>

        {/* KPI 2 */}
        <div className="card card-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280' }}>
              Specialized Teams
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UsersRound style={{ width: 15, height: 15, color: '#7c3aed' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', fontFamily: 'Montserrat, sans-serif' }}>
            {teams.length}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
            Led by assigned Team Leads
          </p>
        </div>

        {/* KPI 3 */}
        <div className="card card-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280' }}>
              Sprint Tasks Active
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Kanban style={{ width: 15, height: 15, color: '#15803d' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', fontFamily: 'Montserrat, sans-serif' }}>
            {tasks.length}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
            {inProgressTasks} In Progress • {doneTasks} Done
          </p>
        </div>

        {/* KPI 4 */}
        <div className="card card-hover" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#6b7280' }}>
              Channels & Streams
            </span>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare style={{ width: 15, height: 15, color: '#b45309' }} />
            </div>
          </div>
          <div style={{ fontSize: '1.625rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', fontFamily: 'Montserrat, sans-serif' }}>
            {channels.length}
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
            Org, Dept & Team scoped
          </p>
        </div>
      </div>

      {/* Middle Row: Pure Vector SVG Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* Left: Dual Cubic Bézier Trend Chart */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp style={{ width: 16, height: 16, color: '#1d4ed8' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                  Sprint Velocity & Task Delivery Trend
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px' }}>
                Pure Vector Cubic Bézier spline: Tasks Dispatched vs Tasks Completed
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#1d4ed8' }} />
                <span style={{ color: '#475569', fontWeight: 600 }}>Tasks Created ({totalTasks})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ color: '#475569', fontWeight: 600 }}>Resolved ({doneTasks})</span>
              </div>
            </div>
          </div>
          <DualBezierChart seriesA={seriesA} seriesB={seriesB} labels={weekDays} />
        </div>

        {/* Right: 180° Speedometer Dial & Health */}
        <div className="card" style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Activity style={{ width: 16, height: 16, color: '#10b981' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Sprint Velocity</h3>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Deliverability & Throughput</span>
          </div>

          <SpeedometerGauge score={velocityScore} label={totalTasks > 0 ? "Deliverability Health" : "No Tasks Active"} />

          <div style={{ width: '100%', borderTop: '1px solid #e5e7eb', marginTop: '16px', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CircularProgressRing pct={completionRate} size={50} strokeWidth={5} strokeColor="#10b981" />
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111827' }}>Sprint Done</div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{doneTasks} of {totalTasks} tasks</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Departments Directory & Live Audit Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
        {/* Left: Department Hierarchy Preview */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 style={{ width: 16, height: 16, color: '#1e1e1e' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Active Departments</h3>
            </div>
            <Link
              href="/departments"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#1d4ed8'
              }}
            >
              <span>View All</span>
              <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {departments.map(dept => (
              <div
                key={dept.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  transition: 'border-color 150ms ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                    {dept.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    Manager: {dept.manager_id ? 'Assigned' : 'Unassigned'} • {dept.teams_count || 0} Teams
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: '#e2e8f0',
                      color: '#475569'
                    }}
                  >
                    {(memberships || []).filter(m => m.department_id === dept.id).length || 1} {((memberships || []).filter(m => m.department_id === dept.id).length || 1) === 1 ? 'member' : 'members'}
                  </span>
                  <Link
                    href="/departments"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 10px' }}
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Live Audit & RBAC Trail */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck style={{ width: 16, height: 16, color: '#1e1e1e' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Live Audit Log</h3>
            </div>
            <Link
              href="/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#1d4ed8'
              }}
            >
              <span>Full Audit Trail</span>
              <ArrowRight style={{ width: 12, height: 12 }} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {auditLogs.slice(0, 5).map(log => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: '#fafafa',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#1e1e1e',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '9px',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  ✓
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="font-mono" style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#1d4ed8' }}>
                      {log.action}
                    </span>
                    <span style={{ fontSize: '0.625rem', color: '#94a3b8' }}>
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#334155', marginTop: '2px' }}>
                    {log.resource_type}: {JSON.stringify(log.metadata)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
