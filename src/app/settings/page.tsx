'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building,
  Database,
  Shield,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Server,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { SignatureHero } from '@/components/layout/SignatureHero';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isClerkConfigured } from '@/lib/clerk';

export default function SettingsPage() {
  const { currentOrg, currentUser, auditLogs, isOwnerOrAdmin } = useApp();
  const [activeTab, setActiveTab] = useState<'org' | 'db' | 'auth' | 'audit' | 'plan'>('org');

  const [orgName, setOrgName] = useState(currentOrg.name);
  const [orgSlug, setOrgSlug] = useState(currentOrg.slug);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOwnerOrAdmin) {
    return (
      <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '24px' }}>
        <div style={{ width: 56, height: 56, borderRadius: '16px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#dc2626' }}>
          <ShieldAlert style={{ width: 28, height: 28 }} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Access Restricted</h2>
        <p style={{ fontSize: '0.9375rem', color: '#64748b', maxWidth: '440px', lineHeight: 1.6, marginBottom: '24px' }}>
          Only the Super Owner and Organization Admins have permission to access infrastructure settings and audit logs.
        </p>
        <Link href="/" className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '9999px' }}>
          Return to Overview
        </Link>
      </div>
    );
  }

  const handleSaveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="animate-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Signature Hero Card */}
      <SignatureHero
        tag="Tenant Infrastructure"
        title="Settings & Audit Center"
        description="Configure organization metadata, verify Supabase PostgreSQL connection status, review Clerk authentication keys, and inspect enterprise audit logs."
      />

      {/* 2-Pane Nested Settings Container from master_design.md */}
      <div className="settings-container">
        {/* Left Sub-nav Sidebar (250px) */}
        <aside className="settings-sidebar">
          <ul className="settings-nav-list">
            <li>
              <button
                type="button"
                className={`settings-nav-btn ${activeTab === 'org' ? 'active' : ''}`}
                onClick={() => setActiveTab('org')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building style={{ width: 15, height: 15 }} />
                  <span>Organization</span>
                </div>
              </button>
            </li>

            {isOwnerOrAdmin && (
              <>
                <li>
                  <button
                    type="button"
                    className={`settings-nav-btn ${activeTab === 'db' ? 'active' : ''}`}
                    onClick={() => setActiveTab('db')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Database style={{ width: 15, height: 15 }} />
                      <span>Supabase Database</span>
                    </div>
                    <span className="settings-nav-badge">SQL</span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className={`settings-nav-btn ${activeTab === 'auth' ? 'active' : ''}`}
                    onClick={() => setActiveTab('auth')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Shield style={{ width: 15, height: 15 }} />
                      <span>Clerk Authentication</span>
                    </div>
                    <span className="settings-nav-badge">Auth</span>
                  </button>
                </li>

                <li>
                  <button
                    type="button"
                    className={`settings-nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('audit')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileText style={{ width: 15, height: 15 }} />
                      <span>Audit Logs</span>
                    </div>
                    <span className="settings-nav-badge">{auditLogs.length}</span>
                  </button>
                </li>
              </>
            )}

            <li>
              <button
                type="button"
                className={`settings-nav-btn ${activeTab === 'plan' ? 'active' : ''}`}
                onClick={() => setActiveTab('plan')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CreditCard style={{ width: 15, height: 15 }} />
                  <span>Enterprise Plan</span>
                </div>
                <span className="settings-nav-badge">PRO</span>
              </button>
            </li>
          </ul>

          <div style={{ padding: '12px', background: '#f1f5f9', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
              Tenant ID
            </div>
            <code className="font-mono" style={{ fontSize: '0.6875rem', color: '#1d4ed8', wordBreak: 'break-all' }}>
              {currentOrg.id}
            </code>
          </div>
        </aside>

        {/* Right Content Canvas */}
        <main className="settings-content-pane">
          {/* TAB 1: ORGANIZATION */}
          {activeTab === 'org' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
                Organization Profile
              </h3>
              <p style={{ fontSize: '0.84375rem', color: '#64748b', marginBottom: '24px' }}>
                Manage your primary enterprise identity and public slug.
              </p>

              <form onSubmit={handleSaveOrg}>
                <div className="settings-card">
                  <div className="settings-grid-2">
                    <div>
                      <label className="settings-label">Organization Name</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={orgName}
                        onChange={e => setOrgName(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label className="settings-label">Workspace URL Slug</label>
                      <input
                        type="text"
                        className="settings-input"
                        value={orgSlug}
                        onChange={e => setOrgSlug(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <label className="settings-label">Contact Email</label>
                    <input
                      type="email"
                      className="settings-input"
                      defaultValue="admin@crosstech.io"
                    />
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button type="submit" className="btn btn-primary">
                      Save Profile Changes
                    </button>
                    {isSaved && (
                      <span style={{ fontSize: '0.8125rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 style={{ width: 14, height: 14 }} /> Saved successfully
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: SUPABASE DATABASE */}
          {activeTab === 'db' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
                Supabase PostgreSQL Database
              </h3>
              <p style={{ fontSize: '0.84375rem', color: '#64748b', marginBottom: '24px' }}>
                Multi-tenant schema, Row-Level Security (RLS), and database connection health.
              </p>

              <div className="settings-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Server style={{ width: 20, height: 20, color: '#10b981' }} />
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
                        Connection Status
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {isSupabaseConfigured
                          ? 'Connected to Live Supabase Instance'
                          : 'Development Mode (Local Reactive Store Active)'}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: isSupabaseConfigured ? '#ecfdf5' : '#eff6ff',
                      color: isSupabaseConfigured ? '#059669' : '#1d4ed8'
                    }}
                  >
                    {isSupabaseConfigured ? 'CONNECTED' : 'STANDALONE DEV READY'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Migration Schema:</span>
                    <code className="font-mono" style={{ color: '#1d4ed8' }}>supabase/schema.sql</code>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b' }}>Multi-Tenant Isolation:</span>
                    <span style={{ fontWeight: 600, color: '#111827' }}>PostgreSQL RLS with organization_id</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: '#64748b' }}>Realtime Channels:</span>
                    <span style={{ fontWeight: 600, color: '#10b981' }}>Enabled for messages & tasks</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLERK AUTHENTICATION */}
          {activeTab === 'auth' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
                Clerk Authentication
              </h3>
              <p style={{ fontSize: '0.84375rem', color: '#64748b', marginBottom: '24px' }}>
                Identity Provider (IdP), OAuth connections, and session management.
              </p>

              <div className="settings-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck style={{ width: 20, height: 20, color: '#1d4ed8' }} />
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a' }}>
                        Clerk Next.js Provider
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {isClerkConfigured
                          ? 'Clerk Live Credentials Activated'
                          : 'Built-in Dev Persona Simulator Active'}
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: isClerkConfigured ? '#ecfdf5' : '#eff6ff',
                      color: isClerkConfigured ? '#059669' : '#1d4ed8'
                    }}
                  >
                    {isClerkConfigured ? 'LIVE IDP' : 'RBAC SIMULATOR'}
                  </span>
                </div>

                <p style={{ fontSize: '0.8125rem', color: '#475569', lineHeight: 1.5 }}>
                  Configure your production Clerk publishable key and secret key in <code className="font-mono">.env.local</code>. Once configured, sessions and JWT tokens automatically sync into Supabase user records.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
                Enterprise Audit Trail
              </h3>
              <p style={{ fontSize: '0.84375rem', color: '#64748b', marginBottom: '24px' }}>
                Immutable historical record of WHO did WHAT, WHEN, and WHERE within this tenant.
              </p>

              <div className="card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px 16px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Action
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Resource
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Details
                      </th>
                      <th style={{ padding: '12px 16px', fontSize: '0.6875rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Timestamp
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8' }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.8125rem', fontWeight: 600, color: '#111827' }}>
                          {log.resource_type}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.75rem', color: '#475569' }}>
                          {JSON.stringify(log.metadata)}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '0.6875rem', color: '#94a3b8' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PLAN */}
          {activeTab === 'plan' && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
                Subscription & Tenant Limits
              </h3>
              <p style={{ fontSize: '0.84375rem', color: '#64748b', marginBottom: '24px' }}>
                Enterprise Tier with unlimited departments, teams, and channels.
              </p>

              <div className="settings-card">
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  Enterprise SaaS License
                </div>
                <div style={{ fontSize: '0.84375rem', color: '#475569', marginBottom: '16px' }}>
                  Unlimited members • Supabase Dedicated Schema • 99.99% Uptime SLA • Priority 24/7 Support
                </div>
                <button type="button" className="btn btn-secondary">
                  Manage Billing Portal
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
