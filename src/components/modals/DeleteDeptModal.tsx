'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, X, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export function DeleteDeptModal() {
  const {
    isDeleteDeptModalOpen,
    closeDeleteDeptModal,
    deptToDelete,
    deleteDepartment,
    teams
  } = useApp();

  const [confirmInput, setConfirmInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isDeleteDeptModalOpen) {
      setConfirmInput('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isDeleteDeptModalOpen, deptToDelete?.id]);

  if (!isDeleteDeptModalOpen || !deptToDelete) {
    return null;
  }

  const isConfirmed = confirmInput.trim().toLowerCase() === 'delete';
  const assignedTeams = teams.filter(t => t.department_id === deptToDelete.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const success = await deleteDepartment(deptToDelete.id);
      if (success) {
        closeDeleteDeptModal();
      } else {
        setError('Failed to delete department. Verify you are logged in as the Super Owner.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred while deleting the department.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeDeleteDeptModal}>
      <div
        className="modal-card-container"
        style={{
          maxWidth: '520px',
          border: '1px solid #fecdd3',
          boxShadow: '0 25px 50px -12px rgba(225, 29, 72, 0.15)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-card-header" style={{ background: '#fff1f2', borderBottom: '1px solid #fecdd3' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#e11d48'
              }}
            >
              <Trash2 style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: '#9f1239' }}>
                Delete Department
              </h4>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Super Owner Authorization Required
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={closeDeleteDeptModal}
            className="btn-ghost"
            style={{ padding: '4px', color: '#9f1239' }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Target Department Info Card */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b' }}>
                Department to be deleted
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                {deptToDelete.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#64748b' }}>
                <span>• {assignedTeams.length} Assigned Teams</span>
                <span>• {deptToDelete.members_count || 0} Members</span>
              </div>
            </div>

            {/* Warning Message Box */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#9a3412'
              }}
            >
              <AlertTriangle style={{ width: 18, height: 18, flexShrink: 0, marginTop: '2px', color: '#ea580c' }} />
              <div style={{ fontSize: '0.8125rem', lineHeight: 1.5 }}>
                <strong style={{ fontWeight: 700 }}>Warning:</strong> This action cannot be undone. Permanently deleting this department will also remove all its assigned teams, Kanban boards, and departmental communication channels.
              </div>
            </div>

            {/* Confirmation Instruction */}
            <div>
              <label
                className="settings-label"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#1e293b',
                  fontSize: '0.84375rem',
                  fontWeight: 700,
                  marginBottom: '8px'
                }}
              >
                <span>Please type the word</span>
                <span
                  style={{
                    background: '#fee2e2',
                    color: '#e11d48',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    letterSpacing: '0.05em'
                  }}
                >
                  delete
                </span>
                <span>to confirm:</span>
              </label>

              <input
                type="text"
                className="settings-input"
                autoFocus
                placeholder='Type "delete" to confirm'
                value={confirmInput}
                onChange={e => setConfirmInput(e.target.value)}
                style={{
                  borderColor: isConfirmed ? '#10b981' : confirmInput.length > 0 ? '#f43f5e' : '#cbd5e1',
                  background: isConfirmed ? '#f0fdf4' : '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  letterSpacing: '0.02em',
                  transition: 'all 150ms ease'
                }}
              />

              {/* Status Helper Text */}
              <div style={{ marginTop: '6px', minHeight: '20px' }}>
                {isConfirmed ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#059669'
                    }}
                  >
                    <CheckCircle2 style={{ width: 14, height: 14 }} />
                    <span>Confirmation keyword matched. You may now delete.</span>
                  </div>
                ) : confirmInput.length > 0 ? (
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e11d48' }}>
                    Type the exact word &quot;delete&quot; to unlock the delete button.
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Type &quot;delete&quot; in the field above to proceed.
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldAlert style={{ width: 14, height: 14 }} />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="modal-card-footer" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeDeleteDeptModal}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
              disabled={!isConfirmed || isSubmitting}
              style={{
                background: isConfirmed && !isSubmitting ? '#e11d48' : '#fda4af',
                color: '#ffffff',
                border: 'none',
                fontWeight: 700,
                padding: '8px 16px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: isConfirmed && !isSubmitting ? 'pointer' : 'not-allowed',
                transition: 'all 150ms ease',
                boxShadow: isConfirmed ? '0 2px 6px rgba(225, 29, 72, 0.3)' : 'none'
              }}
            >
              <Trash2 style={{ width: 14, height: 14 }} />
              <span>{isSubmitting ? 'Deleting Department...' : 'Delete Department'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
