'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Building2,
  UsersRound,
  Kanban,
  MessageSquare,
  UserPlus,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export function CommandPalette() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    departments,
    teams,
    tasks,
    channels,
    setIsInviteModalOpen,
    setIsCreateOrgModalOpen,
    setIsCreateDeptModalOpen,
    setIsCreateTeamModalOpen
  } = useApp();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const navigateTo = (path: string) => {
    setIsCommandPaletteOpen(false);
    router.push(path);
  };

  const q = query.toLowerCase();

  const navItems = [
    { label: 'Overview Dashboard', path: '/', icon: Kanban, category: 'Navigation' },
    { label: 'Departments & Hierarchy', path: '/departments', icon: Building2, category: 'Navigation' },
    { label: 'Teams & Leads', path: '/teams', icon: UsersRound, category: 'Navigation' },
    { label: 'Kanban Sprint Board', path: '/kanban', icon: Kanban, category: 'Navigation' },
    { label: 'Channels & Direct Messages', path: '/chat', icon: MessageSquare, category: 'Navigation' },
    { label: 'Members & RBAC Directory', path: '/members', icon: UsersRound, category: 'Navigation' }
  ].filter(i => i.label.toLowerCase().includes(q));

  const filteredDepts = departments
    .filter(d => d.name.toLowerCase().includes(q))
    .slice(0, 3);

  const filteredTeams = teams
    .filter(t => t.name.toLowerCase().includes(q))
    .slice(0, 3);

  const filteredTasks = tasks
    .filter(t => t.title.toLowerCase().includes(q))
    .slice(0, 4);

  return (
    <div
      id="cmd-palette-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 10002,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '100px'
      }}
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#ffffff',
          border: '1px solid #d1d5db',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 18px',
            borderBottom: '1px solid #e5e7eb'
          }}
        >
          <Search style={{ width: 18, height: 18, color: '#1e1e1e' }} />
          <input
            id="cmd-search-input"
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search workspace..."
            style={{
              flex: 1,
              fontSize: '15px',
              background: 'none',
              border: 'none',
              color: '#111827',
              outline: 'none',
              fontFamily: 'Inter, sans-serif'
            }}
            autoFocus
          />
          <kbd
            style={{
              background: '#f4f5f7',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              color: '#6b7280'
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '360px', overflowY: 'auto', padding: '8px' }}>
          {/* Quick Actions */}
          <div style={{ padding: '6px 10px', fontSize: '0.6875rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
            Quick Actions
          </div>
          <div
            onClick={() => {
              setIsCommandPaletteOpen(false);
              setIsInviteModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.84375rem',
              color: '#111827'
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <UserPlus style={{ width: 15, height: 15, color: '#1d4ed8' }} />
              <span>Invite New Team Member</span>
            </div>
            <ArrowRight style={{ width: 13, height: 13, color: '#94a3b8' }} />
          </div>

          <div
            onClick={() => {
              setIsCommandPaletteOpen(false);
              setIsCreateDeptModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.84375rem',
              color: '#111827'
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
            onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Plus style={{ width: 15, height: 15, color: '#1d4ed8' }} />
              <span>Create New Department</span>
            </div>
            <ArrowRight style={{ width: 13, height: 13, color: '#94a3b8' }} />
          </div>

          {/* Navigation */}
          {navItems.length > 0 && (
            <>
              <div style={{ padding: '10px 10px 4px', fontSize: '0.6875rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                Navigation
              </div>
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.path}
                    onClick={() => navigateTo(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.84375rem',
                      color: '#111827'
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon style={{ width: 15, height: 15, color: '#64748b' }} />
                      <span>{item.label}</span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>Jump to</span>
                  </div>
                );
              })}
            </>
          )}

          {/* Tasks */}
          {filteredTasks.length > 0 && (
            <>
              <div style={{ padding: '10px 10px 4px', fontSize: '0.6875rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
                Tasks
              </div>
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => navigateTo('/kanban')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.84375rem',
                    color: '#111827'
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1d4ed8' }} />
                    <span style={{ maxWidth: '380px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.title}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{task.priority}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
