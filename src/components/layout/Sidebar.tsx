'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  UsersRound,
  Kanban,
  MessageSquare,
  UserCheck,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Command
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, setIsCommandPaletteOpen, currentOrg } = useApp();

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/' },
    { label: 'Departments', icon: Building2, href: '/departments' },
    { label: 'Teams', icon: UsersRound, href: '/teams' },
    { label: 'Kanban Boards', icon: Kanban, href: '/kanban' },
    { label: 'Channels & Chat', icon: MessageSquare, href: '/chat' },
    { label: 'Members & Roles', icon: UserCheck, href: '/members' },
    { label: 'Settings & Audit', icon: Settings, href: '/settings' }
  ];

  return (
    <aside
      id="main-sidebar"
      style={{
        width: sidebarCollapsed ? '64px' : '224px',
        height: 'calc(100% - 24px)',
        margin: '12px 0 12px 16px',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        zIndex: 10,
        transition: 'width 250ms cubic-bezier(0.16, 1, 0.3, 1)',
        overflow: 'hidden'
      }}
    >
      {/* Toggle Header */}
      <div
        style={{
          padding: '14px 14px 10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between'
        }}
      >
        {!sidebarCollapsed && (
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '0.6875rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94a3b8'
            }}
          >
            Navigation
          </span>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{
            padding: '5px',
            borderRadius: '8px',
            cursor: 'pointer',
            border: '1px solid #e5e7eb',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#6b7280'
          }}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen style={{ width: 14, height: 14 }} />
          ) : (
            <PanelLeftClose style={{ width: 14, height: 14 }} />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '4px 8px 0 8px', overflowY: 'auto' }}>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '4px', listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map(item => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <li key={item.href} style={{ position: 'relative' }}>
                <Link
                  href={item.href}
                  title={sidebarCollapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                    gap: '10px',
                    padding: '8px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: 'none',
                    transition: 'all 150ms ease',
                    background: isActive ? '#1e1e1e' : 'transparent',
                    color: isActive ? '#ffffff' : '#374151',
                    boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.12)' : 'none'
                  }}
                >
                  <Icon
                    style={{
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                      color: isActive ? '#ffffff' : '#6b7280'
                    }}
                  />
                  {!sidebarCollapsed && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Command Center (⌘K) Trigger */}
      <div
        style={{
          padding: '8px',
          borderTop: '1px solid #e5e7eb',
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          background: '#ffffff'
        }}
      >
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
            padding: '6px 8px',
            background: '#f8fafc',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '0.75rem',
            color: '#64748b',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Command style={{ width: 13, height: 13 }} />
            {!sidebarCollapsed && <span>Search...</span>}
          </div>
          {!sidebarCollapsed && (
            <kbd
              style={{
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '3px',
                padding: '0 4px',
                fontSize: '0.625rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              ⌘K
            </kbd>
          )}
        </button>
      </div>
    </aside>
  );
}
