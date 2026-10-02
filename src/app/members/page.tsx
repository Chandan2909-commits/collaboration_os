'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  UserPlus,
  Mail,
  Shield,
  Copy,
  Check,
  Search,
  Building2,
  Trash2,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { SignatureHero } from '@/components/layout/SignatureHero';
import { getRoleBadgeStyle, isOrganizationCreator } from '@/lib/rbac';
import { UserRole } from '@/lib/types';

export default function MembersPage() {
  const {
    users,
    memberships,
    currentUser,
    currentOrg,
    invitations,
    departments,
    teams,
    updateMemberRole,
    updateMemberDepartment,
    removeMember,
    setIsInviteModalOpen,
    isOwnerOrAdmin
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  if (!isOwnerOrAdmin) {
    return (
      <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '16px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#dc2626' }}>
          <ShieldAlert style={{ width: 28, height: 28 }} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Access Restricted</h2>
        <p style={{ fontSize: '0.9375rem', color: '#64748b', maxWidth: '440px', lineHeight: 1.6, marginBottom: '24px' }}>
          Only the Super Owner and Organization Admins have permission to view and manage directory members and access roles.
        </p>
        <Link href="/" className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '9999px' }}>
          Return to Overview
        </Link>
      </div>
    );
  }

  // Multi-Tenant Isolation: Only show members who belong to currentOrg!
  const orgMemberships = memberships.filter(m => m.organization_id === currentOrg.id);
  const orgUsers = users.filter(u => orgMemberships.some(m => m.user_id === u.id));

  const filteredUsers = orgUsers.filter(u => {
    return (
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const copyInviteLink = (token: string) => {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Signature Hero Card */}
      <SignatureHero
        tag="Tenant Directory & RBAC"
        title="Members, Roles & Permissions"
        description={`Active personnel enrolled in ${currentOrg.name}. Roles, department assignments, and access policies are strictly governed by the Organization Owner.`}
        primaryAction={
          isOwnerOrAdmin
            ? {
                label: 'Add / Invite Employee',
                icon: <UserPlus style={{ width: 14, height: 14 }} />,
                onClick: () => setIsInviteModalOpen(true)
              }
            : undefined
        }
      />

      {/* Permission Lock Notice for non-admins */}
      {!isOwnerOrAdmin && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '0.8125rem',
            color: '#64748b'
          }}
        >
          <Lock style={{ width: 14, height: 14, color: '#1d4ed8' }} />
          <span>
            You are viewing the member directory in read-only mode. Role changes and employee invitations are reserved for the Organization Owner.
          </span>
        </div>
      )}

      {/* Filter and Search Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, maxWidth: '420px' }}>
          <Search style={{ width: 16, height: 16, color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search members by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.84375rem',
              color: '#0f172a',
              background: 'transparent'
            }}
          />
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
          {filteredUsers.length} active members enrolled in {currentOrg.name}
        </div>
      </div>

      {/* Members Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '14px 18px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Member
              </th>
              <th style={{ padding: '14px 18px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Assigned RBAC Role
              </th>
              <th style={{ padding: '14px 18px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Department Assignment
              </th>
              <th style={{ padding: '14px 18px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Status
              </th>
              <th style={{ padding: '14px 18px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Owner Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => {
              const mem = orgMemberships.find(m => m.user_id === u.id);
              const isCreator = isOrganizationCreator(currentOrg, u);
              const userRole: UserRole = isCreator ? 'ORGANIZATION_OWNER' : (mem?.role || 'TEAM_MEMBER');
              const roleStyle = getRoleBadgeStyle(userRole);
              const dept = departments.find(d => d.id === mem?.department_id);
              const isSelf = u.id === currentUser.id;

              return (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: '1px solid #f1f5f9',
                    transition: 'background 120ms ease'
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseOut={e => (e.currentTarget.style.background = '#ffffff')}
                >
                  {/* Member Name & Email */}
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        className="avatar"
                        style={{
                          width: 32,
                          height: 32,
                          fontSize: '12px',
                          background: userRole === 'ORGANIZATION_OWNER' ? '#1e1e1e' : '#1d4ed8'
                        }}
                      >
                        {u.full_name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{u.full_name}</span>
                          {isSelf && <span style={{ fontSize: '0.6875rem', color: '#1d4ed8', fontWeight: 600 }}>(You)</span>}
                          {isCreator && (
                            <span
                              style={{
                                fontSize: '0.625rem',
                                fontWeight: 800,
                                color: '#b45309',
                                background: '#fef3c7',
                                border: '1px solid #fde68a',
                                padding: '1px 6px',
                                borderRadius: '4px'
                              }}
                            >
                              CREATOR
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* RBAC Role Column: Permanent for Creator, Interactive Select for Others */}
                  <td style={{ padding: '14px 18px' }}>
                    {isCreator ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          padding: '4px 11px',
                          borderRadius: '9999px',
                          background: '#1e1e1e',
                          color: '#ffffff',
                          border: '1px solid #1e1e1e',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                        title="The organization creator must always remain as the Super Owner."
                      >
                        <Shield style={{ width: 11, height: 11, color: '#fbbf24' }} />
                        <span>Super Owner (Permanent)</span>
                      </span>
                    ) : isOwnerOrAdmin && !isSelf ? (
                      <select
                        value={userRole}
                        onChange={e => updateMemberRole(u.id, e.target.value as UserRole)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          background: roleStyle.bg,
                          color: roleStyle.color,
                          border: `1px solid ${roleStyle.border}`,
                          cursor: 'pointer',
                          outline: 'none',
                          textTransform: 'uppercase'
                        }}
                      >
                        <option value="ORGANIZATION_ADMIN">Organization Admin</option>
                        <option value="DEPARTMENT_MANAGER">Department Manager</option>
                        <option value="TEAM_LEAD">Team Lead</option>
                        <option value="TEAM_MEMBER">Team Member</option>
                      </select>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '9999px',
                          background: roleStyle.bg,
                          color: roleStyle.color,
                          border: `1px solid ${roleStyle.border}`,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {roleStyle.label}
                      </span>
                    )}
                  </td>

                  {/* Department Assignment Column */}
                  <td style={{ padding: '14px 18px', fontSize: '0.8125rem' }}>
                    {isOwnerOrAdmin && !isSelf ? (
                      <select
                        value={mem?.department_id || ''}
                        onChange={e => updateMemberDepartment(u.id, e.target.value || undefined)}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          border: '1px solid #e2e8f0',
                          background: '#ffffff',
                          color: '#111827',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="">Platform Leadership</option>
                        {departments.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ fontWeight: 500, color: '#475569' }}>
                        {dept?.name || 'Platform Leadership'}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: '#059669'
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                      <span>Active</span>
                    </span>
                  </td>

                  {/* Actions Column */}
                  <td style={{ padding: '14px 18px' }}>
                    {isCreator ? (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          color: '#475569',
                          background: '#f1f5f9',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Lock style={{ width: 11, height: 11, color: '#64748b' }} />
                        <span>Permanent</span>
                      </span>
                    ) : isOwnerOrAdmin && !isSelf ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove ${u.full_name} from ${currentOrg.name}?`)) {
                            removeMember(u.id);
                          }
                        }}
                        className="btn btn-outline btn-sm"
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.6875rem',
                          color: '#dc2626',
                          borderColor: '#fecaca',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Trash2 style={{ width: 12, height: 12 }} />
                        <span>Remove</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {isSelf ? 'Self' : 'Member'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pending Invitations Section (Owner & Admin Only) */}
      {isOwnerOrAdmin && (
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail style={{ width: 16, height: 16, color: '#1d4ed8' }} />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                  Pending Invitations ({invitations.length})
                </h3>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                Activation links generated for invited employees. Only visible to Organization Owners.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <UserPlus style={{ width: 13, height: 13 }} />
              <span>Invite Employee</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {invitations.map(inv => {
              const roleStyle = getRoleBadgeStyle(inv.role);
              const isCopied = copiedToken === inv.token_hash;

              return (
                <div
                  key={inv.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Mail style={{ width: 16, height: 16, color: '#64748b' }} />
                    <div>
                      <div style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#0f172a' }}>
                        {inv.email}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                        Token: <code className="font-mono">{inv.token_hash}</code> • Expires in 7 days
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: roleStyle.bg,
                        color: roleStyle.color,
                        textTransform: 'uppercase'
                      }}
                    >
                      {roleStyle.label}
                    </span>

                    <button
                      type="button"
                      onClick={() => copyInviteLink(inv.token_hash)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      {isCopied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
                      <span>{isCopied ? 'Copied' : 'Copy Invite Link'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
