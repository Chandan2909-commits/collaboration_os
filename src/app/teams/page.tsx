'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UsersRound,
  Plus,
  Building2,
  Kanban,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { SignatureHero } from '@/components/layout/SignatureHero';

export default function TeamsPage() {
  const {
    teams,
    deleteTeam,
    departments,
    users,
    tasks,
    currentUser,
    currentUserMembership,
    setIsCreateTeamModalOpen,
    setIsInviteModalOpen
  } = useApp();

  const isOwnerOrAdmin =
    currentUser.role === 'ORGANIZATION_OWNER' ||
    currentUser.role === 'ORGANIZATION_ADMIN' ||
    currentUserMembership?.role === 'ORGANIZATION_OWNER' ||
    currentUserMembership?.role === 'ORGANIZATION_ADMIN';

  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!window.confirm(`Are you sure you want to delete the "${teamName}" team?`)) {
      return;
    }
    setDeletingTeamId(teamId);
    try {
      await deleteTeam(teamId);
    } catch (err) {
      console.error('Failed to delete team:', err);
    } finally {
      setDeletingTeamId(null);
    }
  };

  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');

  const filteredTeams =
    selectedDeptId === 'ALL'
      ? teams
      : teams.filter(t => t.department_id === selectedDeptId);

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Signature Hero Card */}
      <SignatureHero
        tag="Cross-Functional Units"
        title="Teams & Specializations"
        description="Autonomous pods executing sprints, managing focused Kanban boards, and maintaining domain-specific discussions. Nested strictly under parent departments."
        primaryAction={{
          label: 'Create Team',
          icon: <Plus style={{ width: 14, height: 14 }} />,
          onClick: () => setIsCreateTeamModalOpen(true)
        }}
        secondaryAction={{
          label: 'Invite Member',
          icon: <UsersRound style={{ width: 14, height: 14 }} />,
          onClick: () => setIsInviteModalOpen(true)
        }}
      />

      {/* Department Filter Pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          type="button"
          onClick={() => setSelectedDeptId('ALL')}
          style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.8125rem',
            fontWeight: selectedDeptId === 'ALL' ? 700 : 500,
            background: selectedDeptId === 'ALL' ? '#1e1e1e' : '#ffffff',
            color: selectedDeptId === 'ALL' ? '#ffffff' : '#475569',
            border: '1px solid #e5e7eb',
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
        >
          All Departments ({teams.length})
        </button>
        {departments.map(d => {
          const isSelected = selectedDeptId === d.id;
          const count = teams.filter(t => t.department_id === d.id).length;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => setSelectedDeptId(d.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: isSelected ? 700 : 500,
                background: isSelected ? '#1e1e1e' : '#ffffff',
                color: isSelected ? '#ffffff' : '#475569',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
            >
              {d.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Teams Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
        {filteredTeams.map(team => {
          const lead = users.find(u => u.id === team.lead_id);
          const dept = departments.find(d => d.id === team.department_id);

          return (
            <div
              key={team.id}
              className="card card-hover"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        textTransform: 'uppercase',
                        marginBottom: '6px'
                      }}
                    >
                      <Building2 style={{ width: 11, height: 11 }} />
                      <span>{dept?.name || 'Department'}</span>
                    </span>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{team.name}</h3>
                  </div>

                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '9999px',
                      background: '#f4f5f7',
                      color: '#475569',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    {team.members_count || 6} Members
                  </span>
                </div>

                <p style={{ fontSize: '0.84375rem', color: '#475569', lineHeight: 1.5, marginBottom: '16px' }}>
                  {team.description}
                </p>

                {/* Team Lead Box */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="avatar" style={{ width: 24, height: 24, fontSize: '10px', background: '#15803d' }}>
                      {lead?.full_name?.charAt(0) || 'L'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827' }}>
                        {lead?.full_name || 'Designated Lead'}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        {lead?.email || 'lead@crosstech.io'}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#f0fdf4',
                      color: '#15803d',
                      textTransform: 'uppercase'
                    }}
                  >
                    Team Lead
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Link
                  href="/kanban"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#1d4ed8'
                  }}
                >
                  <Kanban style={{ width: 14, height: 14 }} />
                  <span>Sprint Board</span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link href="/chat" className="btn btn-secondary btn-sm">
                    <MessageSquare style={{ width: 13, height: 13 }} />
                    <span>Team Chat</span>
                  </Link>
                  {isOwnerOrAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTeam(team.id, team.name)}
                      disabled={deletingTeamId === team.id}
                      title="Delete Team (Admin Only)"
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1px solid #fecdd3',
                        background: '#fff1f2',
                        color: '#e11d48',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: deletingTeamId === team.id ? 'not-allowed' : 'pointer',
                        transition: 'all 150ms ease'
                      }}
                    >
                      <Trash2 style={{ width: 12, height: 12 }} />
                      <span>{deletingTeamId === team.id ? 'Deleting...' : 'Delete'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
