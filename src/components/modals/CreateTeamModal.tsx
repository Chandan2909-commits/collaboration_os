'use client';

import React, { useState } from 'react';
import { X, UsersRound } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export function CreateTeamModal() {
  const { isCreateTeamModalOpen, setIsCreateTeamModalOpen, addTeam, departments, users, isOwnerOrAdmin } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [leadId, setLeadId] = useState(users[0]?.id || '');

  if (!isCreateTeamModalOpen || !isOwnerOrAdmin) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addTeam({
      name: name.trim(),
      description: description.trim(),
      department_id: departmentId || departments[0]?.id,
      lead_id: leadId
    });
    setName('');
    setDescription('');
    setIsCreateTeamModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCreateTeamModalOpen(false)}>
      <div
        className="modal-card-container"
        style={{ maxWidth: '500px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UsersRound style={{ width: 18, height: 18, color: '#1e1e1e' }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Create New Team</h4>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateTeamModalOpen(false)}
            className="btn-ghost"
            style={{ padding: '4px' }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="settings-label">Parent Department</label>
              <select
                className="settings-input"
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="settings-label">Team Name</label>
              <input
                type="text"
                className="settings-input"
                placeholder="e.g. Distributed Consensus Engine"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="settings-label">Team Description</label>
              <textarea
                className="settings-input"
                style={{ height: '70px', padding: '10px 14px', resize: 'vertical' }}
                placeholder="Team charter and technical domain..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="settings-label">Team Lead</label>
              <select
                className="settings-input"
                value={leadId}
                onChange={e => setLeadId(e.target.value)}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-card-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateTeamModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
