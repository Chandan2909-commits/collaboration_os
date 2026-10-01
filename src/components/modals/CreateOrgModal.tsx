'use client';

import React, { useState } from 'react';
import { X, Building } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export function CreateOrgModal() {
  const { isCreateOrgModalOpen, setIsCreateOrgModalOpen, createOrganization } = useApp();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  if (!isCreateOrgModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createOrganization(name.trim(), slug.trim());
    setName('');
    setSlug('');
    setIsCreateOrgModalOpen(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setIsCreateOrgModalOpen(false)}>
      <div
        className="modal-card-container"
        style={{ maxWidth: '480px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building style={{ width: 18, height: 18, color: '#1e1e1e' }} />
            <h4 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Create Organization</h4>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOrgModalOpen(false)}
            className="btn-ghost"
            style={{ padding: '4px' }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="settings-label">Organization Name</label>
              <input
                type="text"
                className="settings-input"
                placeholder="e.g. Acme Global Technologies"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  if (!slug || slug === name.toLowerCase().replace(/[^a-z0-9]/g, '-')) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }
                }}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="settings-label">Workspace URL Slug</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>app.crosstech.io/</span>
                <input
                  type="text"
                  className="settings-input"
                  placeholder="acme-global"
                  value={slug}
                  onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="modal-card-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateOrgModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Organization
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
