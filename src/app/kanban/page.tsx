'use client';

import React, { useState } from 'react';
import {
  Kanban,
  Plus,
  Clock,
  MessageSquare,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  Filter,
  Shield
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { SignatureHero } from '@/components/layout/SignatureHero';
import { Task, TaskPriority } from '@/lib/types';

export default function KanbanPage() {
  const {
    board,
    tasks,
    users,
    departments,
    currentUser,
    currentUserMembership,
    moveTask,
    setIsTaskModalOpen,
    setActiveTaskForModal
  } = useApp();

  const isExecutive = currentUser.role === 'ORGANIZATION_OWNER' || currentUser.role === 'ORGANIZATION_ADMIN';
  const userDeptId = currentUserMembership?.department_id || departments[0]?.id;
  const userDept = departments.find(d => d.id === userDeptId);

  // If executive: can choose department (or 'ALL')
  const [selectedDeptId, setSelectedDeptId] = useState<string>(isExecutive ? 'ALL' : (userDeptId || departments[0]?.id || ''));
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');

  const activeDeptId = isExecutive ? selectedDeptId : (userDeptId || departments[0]?.id || '');

  const columns = board.columns || [];

  const filteredTasks = tasks.filter(t => {
    // Strict Department Scoping
    if (activeDeptId !== 'ALL' && t.department_id && t.department_id !== activeDeptId) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (filterAssignee !== 'ALL' && t.assigned_to !== filterAssignee) return false;
    return true;
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

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Signature Hero Card */}
      <SignatureHero
        tag="Collaborative Sprint Engine"
        title="Kanban Board & Workflows"
        description="Agile project boards with fractional drag-and-drop column sorting, WIP limits, priority matrix, and tenant-scoped assignments."
        primaryAction={{
          label: 'Create Sprint Task',
          icon: <Plus style={{ width: 14, height: 14 }} />,
          onClick: () => {
            setActiveTaskForModal(null);
            setIsTaskModalOpen(true);
          }
        }}
      />

      {/* Department Scoping: Executive Switcher or Employee Isolation Banner */}
      {isExecutive ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button
            type="button"
            onClick={() => setSelectedDeptId('ALL')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedDeptId === 'ALL' ? '1px solid #1e1e1e' : '1px solid #e2e8f0',
              background: selectedDeptId === 'ALL' ? '#1e1e1e' : '#ffffff',
              color: selectedDeptId === 'ALL' ? '#ffffff' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            All Departments ({tasks.length})
          </button>
          {departments.map(d => {
            const isSelected = selectedDeptId === d.id;
            const count = tasks.filter(t => t.department_id === d.id).length;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDeptId(d.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid #1d4ed8' : '1px solid #e2e8f0',
                  background: isSelected ? '#1d4ed8' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  transition: 'all 0.15s ease'
                }}
              >
                {d.name} ({count})
              </button>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            color: '#1e40af'
          }}
        >
          <Shield style={{ width: 18, height: 18, color: '#1d4ed8', flexShrink: 0 }} />
          <div style={{ fontSize: '0.8125rem' }}>
            <strong>Department Isolated:</strong> You are viewing tasks strictly scoped to <strong>{userDept?.name || 'Your Department'}</strong>. Cross-department boards are restricted to preserve operational privacy.
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '0.8125rem', fontWeight: 600 }}>
            <Filter style={{ width: 14, height: 14 }} />
            <span>Filters:</span>
          </div>

          {/* Priority Filter */}
          <select
            className="settings-input"
            style={{ width: '150px', height: '34px', fontSize: '0.75rem', padding: '0 8px' }}
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
            style={{ width: '170px', height: '34px', fontSize: '0.75rem', padding: '0 8px' }}
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

        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          Showing {filteredTasks.length} of {tasks.length} total tasks
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns.length}, minmax(260px, 1fr))`,
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '16px',
          alignItems: 'start'
        }}
      >
        {columns.map((col, colIdx) => {
          const colTasks = filteredTasks.filter(t => t.column_id === col.id);
          const isOverWip = col.wip_limit && col.wip_limit > 0 && colTasks.length > col.wip_limit;

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.id)}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '520px'
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>
                    {col.name}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      background: isOverWip ? '#fee2e2' : '#e2e8f0',
                      color: isOverWip ? '#ef4444' : '#475569'
                    }}
                  >
                    {colTasks.length}
                    {col.wip_limit ? ` / ${col.wip_limit}` : ''}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTaskForModal(null);
                    setIsTaskModalOpen(true);
                  }}
                  className="btn-ghost"
                  style={{ padding: '2px', color: '#64748b' }}
                >
                  <Plus style={{ width: 15, height: 15 }} />
                </button>
              </div>

              {/* Tasks List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {colTasks.length === 0 ? (
                  <div
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '12px',
                      padding: '28px 14px',
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
                    const prio = getPriorityStyle(task.priority);

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
                          gap: '10px'
                        }}
                      >
                        {/* Priority Badge */}
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

                          {/* Quick movement controls */}
                          <div style={{ display: 'flex', gap: '2px' }} onClick={e => e.stopPropagation()}>
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
                                  color: '#64748b'
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
                                  color: '#64748b'
                                }}
                              >
                                <ChevronRight style={{ width: 12, height: 12 }} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.35 }}>
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
