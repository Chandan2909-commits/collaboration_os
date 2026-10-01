'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  UsersRound,
  ArrowRight,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  Trash2
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { SignatureHero } from '@/components/layout/SignatureHero';

export default function DepartmentsPage() {
  const {
    departments,
    deleteDepartment,
    teams,
    users,
    currentUser,
    currentUserMembership,
    setIsCreateDeptModalOpen,
    setIsCreateTeamModalOpen
  } = useApp();

  const isOwnerOrAdmin =
    currentUser.role === 'ORGANIZATION_OWNER' ||
    currentUser.role === 'ORGANIZATION_ADMIN' ||
    currentUserMembership?.role === 'ORGANIZATION_OWNER' ||
    currentUserMembership?.role === 'ORGANIZATION_ADMIN';

  const [deletingDeptId, setDeletingDeptId] = useState<string | null>(null);

  const handleDeleteDepartment = async (deptId: string, deptName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${deptName}"?\n\nThis will permanently delete the department, its assigned teams, and discussions.`)) {
      return;
    }
    setDeletingDeptId(deptId);
    try {
      await deleteDepartment(deptId);
    } catch (err) {
      console.error('Failed to delete department:', err);
    } finally {
      setDeletingDeptId(null);
    }
  };

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Signature Hero Card */}
      <SignatureHero
        tag="Organizational Hierarchy"
        title="Departments & Divisions"
        description="Structured division of responsibilities across the enterprise. Each department contains dedicated managers, cross-functional teams, isolated channels, and scoped permissions."
        primaryAction={{
          label: 'Create Department',
          icon: <Plus style={{ width: 14, height: 14 }} />,
          onClick: () => setIsCreateDeptModalOpen(true)
        }}
        secondaryAction={{
          label: 'Create Team',
          icon: <UsersRound style={{ width: 14, height: 14 }} />,
          onClick: () => setIsCreateTeamModalOpen(true)
        }}
      />

      {/* Departments Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
        {departments.map(dept => {
          const deptTeams = teams.filter(t => t.department_id === dept.id);
          const manager = users.find(u => u.id === dept.manager_id);

          return (
            <div key={dept.id} className="card card-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: '#1e1e1e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff'
                      }}
                    >
                      <Building2 style={{ width: 20, height: 20 }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{dept.name}</h3>
                      <span style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        Created {new Date(dept.created_at || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: '#f4f5f7',
                      color: '#334155',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    {dept.members_count || 12} Members
                  </span>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.84375rem', color: '#475569', marginBottom: '18px', lineHeight: 1.5 }}>
                  {dept.description}
                </p>

                {/* Department Manager Info Box */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: '#f8fafc',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    marginBottom: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      className="avatar"
                      style={{ width: 26, height: 26, fontSize: '11px', background: '#1d4ed8' }}
                    >
                      {manager?.full_name?.charAt(0) || 'M'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827' }}>
                        {manager?.full_name || 'Designated Manager'}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>
                        {manager?.email || 'manager@crosstech.io'}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      textTransform: 'uppercase'
                    }}
                  >
                    Dept Manager
                  </span>
                </div>

                {/* Sub-teams list */}
                <div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: '#94a3b8',
                      marginBottom: '8px',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Assigned Teams ({deptTeams.length})
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {deptTeams.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        No teams created yet.
                      </span>
                    ) : (
                      deptTeams.map(t => (
                        <span
                          key={t.id}
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            color: '#334155'
                          }}
                        >
                          {t.name}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div
                style={{
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '16px',
                  marginTop: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Link
                  href={`/teams?dept=${dept.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: '#1d4ed8'
                  }}
                >
                  <span>Explore Teams</span>
                  <ArrowRight style={{ width: 14, height: 14 }} />
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link href="/chat" className="btn btn-secondary btn-sm">
                    <MessageSquare style={{ width: 13, height: 13 }} />
                    <span>Channel</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsCreateTeamModalOpen(true)}
                    className="btn btn-outline btn-sm"
                  >
                    <Plus style={{ width: 13, height: 13 }} />
                    <span>Add Team</span>
                  </button>
                  {isOwnerOrAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                      disabled={deletingDeptId === dept.id}
                      title="Delete Department (Admin Only)"
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
                        cursor: deletingDeptId === dept.id ? 'not-allowed' : 'pointer',
                        transition: 'all 150ms ease'
                      }}
                    >
                      <Trash2 style={{ width: 12, height: 12 }} />
                      <span>{deletingDeptId === dept.id ? 'Deleting...' : 'Delete'}</span>
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
