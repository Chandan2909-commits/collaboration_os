'use client';

import React, { useState, useEffect } from 'react';
import { X, Kanban, MessageSquare, Trash2, Send, CheckCircle } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { Task, TaskPriority } from '@/lib/types';

export function TaskModal() {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    activeTaskForModal,
    setActiveTaskForModal,
    board,
    users,
    departments,
    teams,
    currentUser,
    currentUserMembership,
    addTask,
    updateTask,
    deleteTask,
    addTaskComment
  } = useApp();

  const isEditing = Boolean(activeTaskForModal);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [columnId, setColumnId] = useState(board.columns?.[0]?.id || 'col_backlog');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (activeTaskForModal) {
      setTitle(activeTaskForModal.title);
      setDescription(activeTaskForModal.description || '');
      setDepartmentId(activeTaskForModal.department_id || currentUserMembership?.department_id || departments[0]?.id || '');
      setTeamId(activeTaskForModal.team_id || currentUserMembership?.team_id || '');
      setColumnId(activeTaskForModal.column_id);
      setPriority(activeTaskForModal.priority);
      setAssignedTo(activeTaskForModal.assigned_to || '');
      setDueDate(
        activeTaskForModal.due_date
          ? activeTaskForModal.due_date.split('T')[0]
          : ''
      );
    } else {
      setTitle('');
      setDescription('');
      const defaultDept = currentUserMembership?.department_id || departments[0]?.id || '';
      setDepartmentId(defaultDept);
      setTeamId(currentUserMembership?.team_id || '');
      setColumnId(board.columns?.[0]?.id || 'col_backlog');
      setPriority('MEDIUM');
      setAssignedTo(users[0]?.id || '');
      setDueDate('');
    }
  }, [activeTaskForModal, board.columns, users, currentUserMembership, departments]);

  if (!isTaskModalOpen) return null;

  const handleClose = () => {
    setIsTaskModalOpen(false);
    setActiveTaskForModal(null);
  };

  const isDoneColumn =
    columnId === 'col_done' ||
    Boolean(board.columns?.find(c => c.id === columnId && c.name.toLowerCase() === 'done'));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing && activeTaskForModal) {
      updateTask(activeTaskForModal.id, {
        title: title.trim(),
        description: description.trim(),
        column_id: columnId,
        priority,
        assigned_to: assignedTo || undefined,
        due_date: dueDate ? `${dueDate}T18:00:00Z` : undefined,
        department_id: departmentId || undefined,
        team_id: teamId || undefined
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim(),
        column_id: columnId,
        priority,
        assigned_to: assignedTo || undefined,
        due_date: dueDate ? `${dueDate}T18:00:00Z` : undefined,
        department_id: departmentId || undefined,
        team_id: teamId || undefined
      });
    }

    handleClose();
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeTaskForModal) return;
    addTaskComment(activeTaskForModal.id, newComment.trim());
    setNewComment('');
  };

  const handleDelete = () => {
    if (!activeTaskForModal) return;
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(activeTaskForModal.id);
      handleClose();
    }
  };

  const priorityColors: Record<TaskPriority, { bg: string; color: string }> = {
    LOW: { bg: '#eff6ff', color: '#1d4ed8' },
    MEDIUM: { bg: '#fef9c3', color: '#854d0e' },
    HIGH: { bg: '#ffedd5', color: '#c2410c' },
    URGENT: { bg: '#fee2e2', color: '#b91c1c' }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal-card-container"
        style={{ maxWidth: '620px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Kanban style={{ width: 18, height: 18, color: '#1e1e1e' }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
              {isEditing ? 'Task Details & Activity' : 'Create Sprint Task'}
            </h4>
          </div>
          <button type="button" onClick={handleClose} className="btn-ghost" style={{ padding: '4px' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="settings-label">Task Title</label>
              <input
                type="text"
                className="settings-input"
                placeholder="e.g. Architect distributed Supabase tenant RLS engine"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="settings-label">Description</label>
              <textarea
                className="settings-input"
                style={{ height: '80px', padding: '10px 14px', resize: 'vertical' }}
                placeholder="Task context, acceptance criteria, links..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="settings-grid-2">
              <div>
                <label className="settings-label">Column / Status</label>
                <select
                  className="settings-input"
                  value={columnId}
                  onChange={e => setColumnId(e.target.value)}
                >
                  {(board.columns || []).map(col => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="settings-label">Priority Level</label>
                <select
                  className="settings-input"
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent (Blocker)</option>
                </select>
              </div>
            </div>

            {/* Permanent Retention Notice for Completed Tasks */}
            {isDoneColumn && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  color: '#166534',
                  fontSize: '0.8125rem',
                  fontWeight: 500
                }}
              >
                <CheckCircle style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0 }} />
                <span>
                  <strong>Completed Task:</strong> This task stays on the sprint board permanently until you or an admin explicitly deletes it.
                </span>
              </div>
            )}

            <div className="settings-grid-2">
              <div>
                <label className="settings-label">Target Department</label>
                <select
                  className="settings-input"
                  value={departmentId}
                  onChange={e => {
                    const newDept = e.target.value;
                    setDepartmentId(newDept);
                    const deptTeams = teams.filter(t => t.department_id === newDept);
                    if (!deptTeams.some(t => t.id === teamId)) {
                      setTeamId(deptTeams[0]?.id || '');
                    }
                  }}
                >
                  <option value="">-- No Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="settings-label">Target Team (Kanban Board)</label>
                <select
                  className="settings-input"
                  value={teamId}
                  onChange={e => setTeamId(e.target.value)}
                >
                  <option value="">-- All / General Board --</option>
                  {teams
                    .filter(t => !departmentId || t.department_id === departmentId)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="settings-grid-2">
              <div>
                <label className="settings-label">Assignee</label>
                <select
                  className="settings-input"
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                >
                  <option value="">-- Unassigned --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="settings-label">Due Date</label>
                <input
                  type="date"
                  className="settings-input"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Comments Thread (when editing) */}
            {isEditing && activeTaskForModal && (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <MessageSquare style={{ width: 14, height: 14, color: '#64748b' }} />
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111827' }}>
                    Activity & Comments ({activeTaskForModal.comments?.length || 0})
                  </span>
                </div>

                <div
                  style={{
                    maxHeight: '160px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '12px'
                  }}
                >
                  {(activeTaskForModal.comments || []).length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      No comments yet. Start the conversation.
                    </div>
                  ) : (
                    activeTaskForModal.comments?.map(cm => (
                      <div
                        key={cm.id}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '8px 12px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                            {cm.user?.full_name || 'Team Member'}
                          </span>
                          <span style={{ fontSize: '0.625rem', color: '#94a3b8' }}>
                            {new Date(cm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: '#334155', margin: '4px 0 0 0' }}>
                          {cm.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="settings-input"
                    placeholder="Leave a comment or update..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddComment}
                    className="btn btn-secondary"
                    style={{ flexShrink: 0 }}
                  >
                    <Send style={{ width: 14, height: 14 }} />
                    <span>Send</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-card-footer" style={{ justifyContent: 'space-between' }}>
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-destructive btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 style={{ width: 14, height: 14 }} />
                <span>Delete Task</span>
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {isEditing ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
