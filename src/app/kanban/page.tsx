'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Kanban,
  Plus,
  Clock,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Filter,
  Shield,
  Trash2,
  CheckCircle2,
  UsersRound,
  Building2,
  Search,
  Sparkles,
  Info
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { SignatureHero } from '@/components/layout/SignatureHero';
import { Task, TaskPriority, BoardColumn } from '@/lib/types';
import { isOwnerOrAdminRole } from '@/lib/rbac';
import { DEFAULT_BOARD_COLUMNS } from '@/lib/store';

function KanbanPageContent() {
  const {
    board,
    boards,
    tasks,
    users,
    departments,
    teams,
    currentUser,
    currentUserMembership,
    moveTask,
    deleteTask,
    setIsTaskModalOpen,
    setActiveTaskForModal
  } = useApp();

  const searchParams = useSearchParams();
  const urlTeamId = searchParams?.get('teamId');
  const urlDeptId = searchParams?.get('deptId');

  const isExecutive = isOwnerOrAdminRole(currentUser.role);
  const isDeptManager = currentUser.role === 'DEPARTMENT_MANAGER';
  const userDeptId = currentUserMembership?.department_id || departments[0]?.id;
  const userTeamId = currentUserMembership?.team_id;
  const userTeam = teams.find(t => t.id === userTeamId);
  const userDept = departments.find(d => d.id === userDeptId);

  // Available teams for this user:
  // Admin: all teams
  // Dept Manager: teams in their department
  // Team Member / Lead: their own team
  const availableTeams = useMemo(() => {
    if (isExecutive) return teams;
    if (isDeptManager && userDeptId) return teams.filter(t => t.department_id === userDeptId);
    if (userTeamId) return teams.filter(t => t.id === userTeamId);
    return teams;
  }, [isExecutive, isDeptManager, userDeptId, userTeamId, teams]);

  // Initial team selection
  const [selectedTeamId, setSelectedTeamId] = useState<string>(() => {
    if (urlTeamId && teams.some(t => t.id === urlTeamId)) return urlTeamId;
    if (isExecutive) return 'ALL';
    if (isDeptManager) return 'ALL';
    return userTeamId || (availableTeams[0]?.id || 'ALL');
  });

  // Department filter (mostly for executive view)
  const [selectedDeptId, setSelectedDeptId] = useState<string>(() => {
    if (urlDeptId && departments.some(d => d.id === urlDeptId)) return urlDeptId;
    if (isExecutive) return 'ALL';
    return userDeptId || departments[0]?.id || 'ALL';
  });

  // Filters
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync if URL query param changes
  useEffect(() => {
    if (urlTeamId && teams.some(t => t.id === urlTeamId)) {
      setSelectedTeamId(urlTeamId);
      const targetTeam = teams.find(t => t.id === urlTeamId);
      if (targetTeam?.department_id) {
        setSelectedDeptId(targetTeam.department_id);
      }
    }
  }, [urlTeamId, teams]);

  // Resolve active team and active department
  const activeTeamId = isExecutive || isDeptManager ? selectedTeamId : (userTeamId || selectedTeamId);
  const activeTeam = teams.find(t => t.id === activeTeamId);

  const activeDeptId = isExecutive
    ? selectedDeptId
    : isDeptManager
      ? (userDeptId || 'ALL')
      : (activeTeam?.department_id || userDeptId || 'ALL');

  // Find active board
  const activeBoard = useMemo(() => {
    if (activeTeamId !== 'ALL') {
      const found = boards.find(b => b.team_id === activeTeamId);
      if (found) return found;
    }
    if (activeDeptId !== 'ALL') {
      const found = boards.find(b => b.department_id === activeDeptId && !b.team_id);
      if (found) return found;
    }
    return board || boards[0];
  }, [activeTeamId, activeDeptId, boards, board]);

  const columns: BoardColumn[] = useMemo(() => {
    if (activeBoard?.columns && activeBoard.columns.length > 0) {
      return [...activeBoard.columns].sort((a, b) => (a.position || 0) - (b.position || 0));
    }
    if (board?.columns && board.columns.length > 0) {
      return [...board.columns].sort((a, b) => (a.position || 0) - (b.position || 0));
    }
    return DEFAULT_BOARD_COLUMNS;
  }, [activeBoard, board]);

  // Column matching helper (robust to ID/slug variations)
  const isTaskInColumn = (task: Task, col: BoardColumn): boolean => {
    if (task.column_id === col.id) return true;
    const colSlug = col.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const taskColSlug = (task.column_id || '').toLowerCase().replace(/^col_/, '').replace(/[^a-z0-9]/g, '_');
    if (colSlug === taskColSlug || `col_${colSlug}` === task.column_id?.toLowerCase()) return true;
    return false;
  };

  // Filter tasks strictly by team, department, priority, assignee, search
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      // 1. Team Scoping
      if (activeTeamId !== 'ALL') {
        const matchesTeam = t.team_id === activeTeamId;
        const matchesBoard = activeBoard && t.board_id === activeBoard.id;
        if (!matchesTeam && !matchesBoard) return false;
      } else if (!isExecutive && !isDeptManager && userTeamId) {
        // Non-executives are strictly scoped to their team if assigned
        if (t.team_id && t.team_id !== userTeamId) return false;
      }

      // 2. Department Scoping
      if (activeDeptId !== 'ALL') {
        if (t.department_id && t.department_id !== activeDeptId) return false;
      }

      // 3. Priority Filter
      if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;

      // 4. Assignee Filter
      if (filterAssignee !== 'ALL' && t.assigned_to !== filterAssignee) return false;

      // 5. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc) return false;
      }

      return true;
    });
  }, [tasks, activeTeamId, activeBoard, isExecutive, isDeptManager, userTeamId, activeDeptId, filterPriority, filterAssignee, searchQuery]);

  const priorityStyles: Record<TaskPriority, { bg: string; color: string; border: string; label: string }> = {
    URGENT: { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca', label: 'Urgent' },
    HIGH: { bg: '#ffedd5', color: '#c2410c', border: '#fed7aa', label: 'High' },
    MEDIUM: { bg: '#fef9c3', color: '#854d0e', border: '#fef08a', label: 'Medium' },
    LOW: { bg: '#eff6ff', color: '#1d4ed8', border: '#dbeafe', label: 'Low' }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      moveTask(taskId, targetColId);
    }
  };

  const handleDeleteTaskPrompt = (e: React.MouseEvent, taskId: string, taskTitle: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to permanently delete task "${taskTitle}"?`)) {
      deleteTask(taskId);
    }
  };

  const completedCount = useMemo(() => {
    const doneCol = columns.find(c => c.name.toLowerCase() === 'done');
    if (!doneCol) return 0;
    return filteredTasks.filter(t => isTaskInColumn(t, doneCol)).length;
  }, [columns, filteredTasks]);

  // Dynamic Page Title
  const pageTitle = activeTeam
    ? `${activeTeam.name} Kanban Board`
    : activeDeptId !== 'ALL'
      ? `${departments.find(d => d.id === activeDeptId)?.name || 'Department'} Sprint Board`
      : 'All Teams Kanban Board';

  const pageDescription = activeTeam
    ? `Dedicated agile workflow for ${activeTeam.name}. Tasks remain permanently preserved on the board until deleted.`
    : isExecutive
      ? 'Executive multi-team overview. Super Owners and Admins can inspect and manage all team boards across the organization.'
      : 'Agile sprint execution engine with fractional drag-and-drop column sorting and persistent task retention.';

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Signature Hero Card */}
      <SignatureHero
        tag="Collaborative Sprint Engine"
        title={pageTitle}
        description={pageDescription}
        primaryAction={{
          label: 'Create Sprint Task',
          icon: <Plus style={{ width: 14, height: 14 }} />,
          onClick: () => {
            setActiveTaskForModal(null);
            setIsTaskModalOpen(true);
          }
        }}
      />

      {/* Role-Based Scope & Team Switcher */}
      {isExecutive ? (
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Executive Header & Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles style={{ width: 16, height: 16, color: '#1d4ed8' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a' }}>
                Executive Board Oversight (All Teams Accessible)
              </span>
            </div>

            {/* Department Dropdown for Admin */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 style={{ width: 14, height: 14, color: '#64748b' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Department:</span>
              <select
                className="settings-input"
                style={{ height: '32px', fontSize: '0.75rem', width: 'auto', padding: '0 8px' }}
                value={selectedDeptId}
                onChange={e => setSelectedDeptId(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Tabs Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              type="button"
              onClick={() => setSelectedTeamId('ALL')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: selectedTeamId === 'ALL' ? '1px solid #1e1e1e' : '1px solid #e2e8f0',
                background: selectedTeamId === 'ALL' ? '#1e1e1e' : '#ffffff',
                color: selectedTeamId === 'ALL' ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              <span>🌟 All Teams Overview</span>
              <span style={{ opacity: 0.8, fontSize: '0.6875rem' }}>({tasks.length})</span>
            </button>

            {availableTeams
              .filter(t => selectedDeptId === 'ALL' || t.department_id === selectedDeptId)
              .map(team => {
                const isSelected = selectedTeamId === team.id;
                const teamTasksCount = tasks.filter(t => t.team_id === team.id).length;
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => setSelectedTeamId(team.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 14px',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      border: isSelected ? '1px solid #1d4ed8' : '1px solid #e2e8f0',
                      background: isSelected ? '#1d4ed8' : '#ffffff',
                      color: isSelected ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <UsersRound style={{ width: 13, height: 13 }} />
                    <span>{team.name}</span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: '9999px',
                        background: isSelected ? '#3b82f6' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        fontSize: '0.6875rem'
                      }}
                    >
                      {teamTasksCount}
                    </span>
                  </button>
                );
              })}
          </div>
        </div>
      ) : isDeptManager ? (
        <div className="card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#0f172a', fontWeight: 700 }}>
              <Building2 style={{ width: 16, height: 16, color: '#7c3aed' }} />
              <span>Department Manager View: {userDept?.name || 'Department'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              type="button"
              onClick={() => setSelectedTeamId('ALL')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: selectedTeamId === 'ALL' ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                background: selectedTeamId === 'ALL' ? '#7c3aed' : '#ffffff',
                color: selectedTeamId === 'ALL' ? '#ffffff' : '#475569'
              }}
            >
              All Department Teams
            </button>
            {availableTeams.map(team => {
              const isSelected = selectedTeamId === team.id;
              const count = tasks.filter(t => t.team_id === team.id).length;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setSelectedTeamId(team.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: isSelected ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                    background: isSelected ? '#7c3aed' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#475569'
                  }}
                >
                  {team.name} ({count})
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            padding: '12px 18px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            color: '#334155',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield style={{ width: 18, height: 18, color: '#1d4ed8', flexShrink: 0 }} />
            <div style={{ fontSize: '0.8125rem' }}>
              <strong>Team Kanban Board:</strong> Viewing tasks scoped to{' '}
              <strong>{userTeam?.name || userDept?.name || 'Your Team'}</strong>.
              Completed tasks stay on the board permanently until deleted.
            </div>
          </div>

          {availableTeams.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Switch Team:</span>
              <select
                className="settings-input"
                style={{ height: '30px', fontSize: '0.75rem', padding: '0 8px', width: 'auto' }}
                value={selectedTeamId}
                onChange={e => setSelectedTeamId(e.target.value)}
              >
                {availableTeams.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 14,
                height: 14,
                color: '#94a3b8'
              }}
            />
            <input
              type="text"
              className="settings-input"
              style={{ height: '34px', fontSize: '0.75rem', paddingLeft: '32px' }}
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8125rem', fontWeight: 600 }}>
            <Filter style={{ width: 14, height: 14 }} />
            <span>Filters:</span>
          </div>

          {/* Priority Filter */}
          <select
            className="settings-input"
            style={{ width: '140px', height: '34px', fontSize: '0.75rem', padding: '0 8px' }}
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent Blocker</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Assignee Filter */}
          <select
            className="settings-input"
            style={{ width: '160px', height: '34px', fontSize: '0.75rem', padding: '0 8px' }}
            value={filterAssignee}
            onChange={e => setFilterAssignee(e.target.value)}
          >
            <option value="ALL">All Assignees</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a' }}>
            <CheckCircle2 style={{ width: 13, height: 13 }} />
            <span>{completedCount} Completed (Retained)</span>
          </div>
          <span>Showing {filteredTasks.length} of {tasks.length} tasks</span>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns.length}, minmax(280px, 1fr))`,
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '16px',
          alignItems: 'start'
        }}
      >
        {columns.map((col, colIdx) => {
          const colTasks = filteredTasks.filter(t => isTaskInColumn(t, col));
          const isOverWip = col.wip_limit && col.wip_limit > 0 && colTasks.length > col.wip_limit;
          const isDoneCol = col.name.toLowerCase() === 'done';

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.id)}
              style={{
                background: isDoneCol ? '#f0fdf4' : '#f8fafc',
                border: isDoneCol ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '540px',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: isDoneCol ? '#166534' : '#0f172a', margin: 0 }}>
                    {col.name}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      background: isOverWip ? '#fee2e2' : isDoneCol ? '#dcfce7' : '#e2e8f0',
                      color: isOverWip ? '#ef4444' : isDoneCol ? '#16a34a' : '#475569'
                    }}
                  >
                    {colTasks.length}
                    {col.wip_limit ? ` / ${col.wip_limit}` : ''}
                  </span>
                </div>

                <button
                  type="button"
                  title={`Add Task to ${col.name}`}
                  onClick={() => {
                    setActiveTaskForModal(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="btn-ghost"
                  style={{ padding: '4px', color: '#64748b' }}
                >
                  <Plus style={{ width: 15, height: 15 }} />
                </button>
              </div>

              {/* Informational Subtext for Done Column */}
              {isDoneCol && (
                <div
                  style={{
                    fontSize: '0.6875rem',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: '#dcfce7',
                    borderRadius: '6px'
                  }}
                >
                  <Info style={{ width: 11, height: 11, flexShrink: 0 }} />
                  <span>Tasks stay here permanently until deleted</span>
                </div>
              )}

              {/* Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {colTasks.length === 0 ? (
                  <div
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '12px',
                      padding: '32px 14px',
                      textAlign: 'center',
                      color: '#94a3b8',
                      fontSize: '0.75rem'
                    }}
                  >
                    Drag tasks here
                  </div>
                ) : (
                  colTasks.map(task => {
                    const assignee = users.find(u => u.id === task.assigned_to);
                    const prio = priorityStyles[task.priority] || priorityStyles.LOW;
                    const taskTeam = teams.find(t => t.id === task.team_id);
                    const taskDept = departments.find(d => d.id === task.department_id);

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={e => handleDragStart(e, task.id)}
                        onClick={() => {
                          setActiveTaskForModal(task);
                          setIsTaskModalOpen(true);
                        }}
                        className="card card-hover"
                        style={{
                          padding: '14px',
                          cursor: 'grab',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          border: isDoneCol ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          background: isDoneCol ? '#ffffff' : '#ffffff'
                        }}
                      >
                        {/* Priority Badge & Card Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span
                            style={{
                              fontSize: '0.625rem',
                              fontWeight: 800,
                              padding: '2px 7px',
                              borderRadius: '9999px',
                              background: prio.bg,
                              color: prio.color,
                              border: `1px solid ${prio.border}`,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em'
                            }}
                          >
                            {prio.label}
                          </span>

                          {/* Quick movement & Delete buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={e => e.stopPropagation()}>
                            {colIdx > 0 && (
                              <button
                                type="button"
                                title="Move Left"
                                onClick={() => moveTask(task.id, columns[colIdx - 1].id)}
                                style={{
                                  padding: '2px',
                                  borderRadius: '4px',
                                  background: '#f1f5f9',
                                  border: '1px solid #e2e8f0',
                                  color: '#64748b',
                                  cursor: 'pointer'
                                }}
                              >
                                <ChevronLeft style={{ width: 12, height: 12 }} />
                              </button>
                            )}
                            {colIdx < columns.length - 1 && (
                              <button
                                type="button"
                                title="Move Right"
                                onClick={() => moveTask(task.id, columns[colIdx + 1].id)}
                                style={{
                                  padding: '2px',
                                  borderRadius: '4px',
                                  background: '#f1f5f9',
                                  border: '1px solid #e2e8f0',
                                  color: '#64748b',
                                  cursor: 'pointer'
                                }}
                              >
                                <ChevronRight style={{ width: 12, height: 12 }} />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Delete Task"
                              onClick={e => handleDeleteTaskPrompt(e, task.id, task.title)}
                              style={{
                                padding: '2px',
                                borderRadius: '4px',
                                background: '#fff1f2',
                                border: '1px solid #fecdd3',
                                color: '#e11d48',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 style={{ width: 12, height: 12 }} />
                            </button>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <div
                            style={{
                              fontSize: '0.84375rem',
                              fontWeight: 700,
                              color: isDoneCol ? '#334155' : '#0f172a',
                              lineHeight: 1.35,
                              textDecoration: isDoneCol ? 'line-through' : 'none'
                            }}
                          >
                            {task.title}
                          </div>
                          {task.description && (
                            <p
                              style={{
                                fontSize: '0.75rem',
                                color: '#64748b',
                                marginTop: '4px',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Team and Department Badge */}
                        {(taskTeam || taskDept) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {taskTeam && (
                              <span
                                style={{
                                  fontSize: '0.625rem',
                                  fontWeight: 700,
                                  padding: '1px 6px',
                                  borderRadius: '6px',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #dbeafe',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '3px'
                                }}
                              >
                                <UsersRound style={{ width: 10, height: 10 }} />
                                <span>{taskTeam.name}</span>
                              </span>
                            )}
                            {taskDept && !taskTeam && (
                              <span
                                style={{
                                  fontSize: '0.625rem',
                                  fontWeight: 700,
                                  padding: '1px 6px',
                                  borderRadius: '6px',
                                  background: '#f8fafc',
                                  color: '#475569',
                                  border: '1px solid #e2e8f0'
                                }}
                              >
                                {taskDept.name}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer: Due date, comments, assignee */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTop: '1px solid #f1f5f9',
                            paddingTop: '8px',
                            marginTop: '2px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.6875rem', color: '#64748b' }}>
                            {task.due_date && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Clock style={{ width: 11, height: 11 }} />
                                <span>{new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                              </div>
                            )}

                            {(task.comments?.length || 0) > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <MessageSquare style={{ width: 11, height: 11 }} />
                                <span>{task.comments?.length}</span>
                              </div>
                            )}
                          </div>

                          {/* Assignee Avatar */}
                          {assignee ? (
                            <div
                              className="avatar"
                              title={assignee.full_name}
                              style={{ width: 22, height: 22, fontSize: '9.5px', background: '#1e1e1e' }}
                            >
                              {assignee.full_name.charAt(0)}
                            </div>
                          ) : (
                            <div
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: '50%',
                                border: '1px dashed #cbd5e1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '9px',
                                color: '#94a3b8'
                              }}
                            >
                              ?
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
          Loading Kanban Sprint Board...
        </div>
      }
    >
      <KanbanPageContent />
    </Suspense>
  );
}
