'use client';

import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export function CreateDeptModal() {
  const { isCreateDeptModalOpen, setIsCreateDeptModalOpen, addDepartment, users, currentUser } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (isCreateDeptModalOpen) {
      setManagerId(currentUser?.id || users[0]?.id || '');
      setIsSubmitting(false);
    }
  }, [isCreateDeptModalOpen, currentUser?.id, users]);

  if (!isCreateDeptModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      addDepartment({
        name: name.trim(),
        description: description.trim(),
        manager_id: managerId || currentUser?.id || undefined
      });
      setName('');
      setDescription('');
      setIsCreateDeptModalOpen(false);
    } catch (err) {
      console.error('Error creating department:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCreateDeptModalOpen(false)}>
      <div
        className="modal-card-container"
        style={{ maxWidth: '500px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 style={{ width: 18, height: 18, color: '#1e1e1e' }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Create Department</h4>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateDeptModalOpen(false)}
            className="btn-ghost"
            style={{ padding: '4px' }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="settings-label">Department Name</label>
              <input
                type="text"
                className="settings-input"
                placeholder="e.g. Artificial Intelligence & Data Science"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="settings-label">Description & Mission</label>
              <textarea
                className="settings-input"
                style={{ height: '70px', padding: '10px 14px', resize: 'vertical' }}
                placeholder="Core responsibilities and charter..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="settings-label">Department Manager</label>
              <select
                className="settings-input"
                value={managerId || currentUser?.id || ''}
                onChange={e => setManagerId(e.target.value)}
              >
                {currentUser && !users.some(u => u.id === currentUser.id) && (
                  <option value={currentUser.id}>
                    {currentUser.full_name} ({currentUser.email || 'Workspace Owner'})
                  </option>
                )}
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
              onClick={() => setIsCreateDeptModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !name.trim()}
            >
              {isSubmitting ? 'Creating...' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
