'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/AppContext';
import { Building2, Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export function CompanyOnboarding() {
  const { currentUser, createInitialCompany, isLoading } = useApp();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [departmentName, setDepartmentName] = useState('Engineering & Operations');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    createInitialCompany({
      name: name.trim(),
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      departmentName: departmentName.trim() || 'General Operations'
    });
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 1px 1px rgba(0,0,0,0.02)',
          padding: '40px 36px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle accent bar at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #1e1e1e 100%)'
          }}
        />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #bfdbfe',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1d4ed8',
              marginBottom: '16px',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.12)'
            }}
          >
            <Building2 style={{ width: 28, height: 28 }} />
          </div>

          <h1
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: '1.625rem',
              color: '#111827',
              letterSpacing: '-0.03em',
              margin: '0 0 8px 0'
            }}
          >
            Create Your Company Workspace
          </h1>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#64748b',
              margin: 0,
              lineHeight: 1.5
            }}
          >
            Welcome, <strong style={{ color: '#111827' }}>{currentUser.full_name || 'Founder'}</strong>! Set up your organization to establish department hierarchy, invite team members, and manage collaborative Kanban boards.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Company Name */}
          <div>
            <label
              htmlFor="org-name"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '6px'
              }}
            >
              Company / Organization Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              id="org-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. CrossTech Labs, Acme Innovations"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9375rem',
                color: '#111827',
                outline: 'none',
                transition: 'border-color 0.15s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Workspace Slug */}
          <div>
            <label
              htmlFor="org-slug"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '6px'
              }}
            >
              Workspace Slug <span style={{ color: '#94a3b8', fontWeight: 500 }}>(subdomain / path)</span>
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                overflow: 'hidden'
              }}
            >
              <span
                style={{
                  padding: '11px 12px',
                  fontSize: '0.8125rem',
                  color: '#64748b',
                  background: '#f1f5f9',
                  borderRight: '1px solid #cbd5e1',
                  fontWeight: 500
                }}
              >
                app.crosstech.io/
              </span>
              <input
                id="org-slug"
                type="text"
                required
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="acme-innovations"
                style={{
                  flex: 1,
                  padding: '11px 12px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '0.875rem',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Initial Department */}
          <div>
            <label
              htmlFor="dept-name"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '6px'
              }}
            >
              Initial Department
            </label>
            <input
              id="dept-name"
              type="text"
              required
              value={departmentName}
              onChange={e => setDepartmentName(e.target.value)}
              placeholder="e.g. Engineering & Operations"
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.875rem',
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '4px 0 0 0' }}>
              You can create more departments and invite specialized teams once inside.
            </p>
          </div>

          {/* Owner Role Card */}
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#1d4ed8',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8125rem'
                }}
              >
                {(currentUser.full_name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111827' }}>
                  {currentUser.full_name || 'You'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  {currentUser.email}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '9999px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}
            >
              <ShieldCheck style={{ width: 12, height: 12 }} />
              <span>Owner & Founder</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!name.trim() || isSubmitting || isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '13px 20px',
              borderRadius: '8px',
              background: !name.trim() ? '#94a3b8' : '#1d4ed8',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9375rem',
              cursor: !name.trim() ? 'not-allowed' : 'pointer',
              boxShadow: !name.trim() ? 'none' : '0 4px 12px rgba(29, 78, 216, 0.25)',
              transition: 'all 0.15s ease',
              marginTop: '8px'
            }}
          >
            {isSubmitting ? (
              <span>Creating Organization...</span>
            ) : (
              <>
                <span>Launch Company & Workspace</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </>
            )}
          </button>
        </form>

        {/* Feature checklist */}
        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid #f1f5f9',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px',
            fontSize: '0.75rem',
            color: '#64748b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 style={{ width: 14, height: 14, color: '#10b981' }} />
            <span>Strict multi-tenant isolation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 style={{ width: 14, height: 14, color: '#10b981' }} />
            <span>Department-scoped Kanban</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 style={{ width: 14, height: 14, color: '#10b981' }} />
            <span>Owner RBAC governance</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 style={{ width: 14, height: 14, color: '#10b981' }} />
            <span>Supabase realtime sync</span>
          </div>
        </div>
      </div>
    </div>
  );
}
