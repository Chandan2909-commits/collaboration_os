'use client';

import React, { useState } from 'react';
import { X, UserPlus, Check, Copy } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { UserRole } from '@/lib/types';

export function InviteModal() {
  const {
    isInviteModalOpen,
    setIsInviteModalOpen,
    createInvitation,
    addEmployee,
    departments,
    teams
  } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('TEAM_MEMBER');
  const [departmentId, setDepartmentId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isInviteModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const inv = createInvitation({
      email: email.trim(),
      role,
      department_id: departmentId || undefined,
      team_id: teamId || undefined
    });

    const empName = fullName.trim() || email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    addEmployee({
      full_name: empName,
      email: email.trim(),
      role,
      department_id: departmentId || undefined,
      team_id: teamId || undefined
    });

    const fullUrl = `${window.location.origin}/invite/${inv.token_hash}`;
    setGeneratedLink(fullUrl);
  };

  const copyToClipboard = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setRole('TEAM_MEMBER');
    setDepartmentId('');
    setTeamId('');
    setGeneratedLink('');
    setIsInviteModalOpen(false);
  };

  const filteredTeams = departmentId
    ? teams.filter(t => t.department_id === departmentId)
    : teams;

  return (
    <div className="modal-overlay" onClick={resetForm}>
      <div
        className="modal-card-container"
        style={{ maxWidth: '520px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus style={{ width: 18, height: 18, color: '#1e1e1e' }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>
              Invite Team Member
            </h4>
          </div>
          <button
            type="button"
            onClick={resetForm}
            className="btn-ghost"
            style={{ padding: '4px' }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {generatedLink ? (
          <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 700 }}>
                <Check style={{ width: 18, height: 18 }} />
                <span>Invitation Generated Successfully!</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: '#047857', marginTop: '6px' }}>
                Secure token has been generated. The employee can use this direct link to set up their password and activate their account.
              </p>
            </div>

            <div>
              <label className="settings-label">Unique Invitation Link</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  className="settings-input font-mono"
                  style={{ fontSize: '0.75rem', background: '#f8fafc' }}
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="btn btn-primary"
                  style={{ flexShrink: 0 }}
                >
                  {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="modal-card-footer" style={{ margin: '12px -1.5rem -1.5rem -1.5rem' }}>
              <button type="button" className="btn btn-primary" onClick={resetForm}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="settings-label">Employee Full Name</label>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="e.g. Maya Patel"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="settings-label">Employee Email Address</label>
                <input
                  type="email"
                  className="settings-input"
                  placeholder="colleague@crosstech.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="settings-label">Role Assignment</label>
                <select
                  className="settings-input"
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                >
                  <option value="TEAM_MEMBER">Team Member (Standard Contributor)</option>
                  <option value="TEAM_LEAD">Team Lead (Team Admin & Department Creation)</option>
                  <option value="DEPARTMENT_MANAGER">Department Manager (Manage Teams & Departments)</option>
                  <option value="ORGANIZATION_ADMIN">Organization Admin</option>
                  <option value="ORGANIZATION_OWNER">Super Owner (Organization Owner - Full Access & Deletion)</option>
                </select>
              </div>

              <div className="settings-grid-2">
                <div>
                  <label className="settings-label">Department Scope (Optional)</label>
                  <select
                    className="settings-input"
                    value={departmentId}
                    onChange={e => {
                      setDepartmentId(e.target.value);
                      setTeamId('');
                    }}
                  >
                    <option value="">-- All / Unassigned --</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="settings-label">Team Scope (Optional)</label>
                  <select
                    className="settings-input"
                    value={teamId}
                    onChange={e => setTeamId(e.target.value)}
                  >
                    <option value="">-- All / Unassigned --</option>
                    {filteredTeams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                💡 As recommended in <code className="font-mono" style={{ color: '#1d4ed8' }}>brain.md</code>: We never send raw passwords in plaintext emails. A cryptographically secure random one-time token link is generated for the invited user.
              </p>
            </div>

            <div className="modal-card-footer">
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Generate Secure Invitation
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
