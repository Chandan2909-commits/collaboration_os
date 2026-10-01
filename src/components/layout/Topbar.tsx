'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Layers, ChevronDown, Bell, Plus, ShieldCheck } from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { getRoleBadgeStyle } from '@/lib/rbac';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { isClerkConfigured } from '@/lib/clerk';

export function Topbar() {
  const {
    currentOrg,
    userOrganizations,
    setCurrentOrg,
    currentUser,
    notifications,
    isLoading,
    setIsCreateOrgModalOpen
  } = useApp();

  const [isWsDropdownOpen, setIsWsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const wsDropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const badgeStyle = getRoleBadgeStyle(currentUser.role);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(event.target as Node)) {
        setIsWsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      style={{
        height: '56px',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        margin: '12px 16px 0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 18px',
        zIndex: 1000,
        flexShrink: 0,
        position: 'sticky',
        top: '12px',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.02)',
        background: '#ffffff',
        overflow: 'visible'
      }}
    >
      {/* Running Progress Loader Line */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '16px',
          overflow: 'hidden',
          pointerEvents: 'none'
        }}
      >
        <div id="topbar-loader-line" className={isLoading ? 'loading' : ''} />
      </div>

      {/* Left: Logo & Workspace Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Brand Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            textDecoration: 'none',
            cursor: 'pointer',
            paddingRight: '4px'
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: '#111827',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              flexShrink: 0
            }}
          >
            <Layers style={{ width: 16, height: 16, color: '#ffffff' }} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.0625rem',
              color: '#111827',
              letterSpacing: '-0.03em'
            }}
          >
            CrossTech<span style={{ fontWeight: 800, color: '#1d4ed8' }}>OS</span>
          </span>
        </Link>

        {/* Hairline Divider */}
        <div style={{ width: '1px', height: '22px', background: '#e5e7eb', margin: '0 2px' }} />

        {/* Workspace Pill Button & Dropdown */}
        <div style={{ position: 'relative' }} ref={wsDropdownRef}>
          <button
            type="button"
            onClick={() => setIsWsDropdownOpen(prev => !prev)}
            id="workspace-switcher-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '5px 12px 5px 8px',
              background: '#f4f5f7',
              border: '1px solid #e5e7eb',
              borderRadius: '9999px',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: '#1e1e1e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '9.5px',
                fontWeight: 700
              }}
            >
              {(currentOrg?.name || 'C').charAt(0).toUpperCase()}
            </div>
            <span
              style={{
                fontWeight: 600,
                fontSize: '0.8125rem',
                color: '#111827',
                maxWidth: '140px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {currentOrg?.name || 'CrossTech Enterprise'}
            </span>
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '9999px',
                background: badgeStyle.bg,
                color: badgeStyle.color,
                border: `1px solid ${badgeStyle.border}`,
                textTransform: 'uppercase'
              }}
            >
              {badgeStyle.label}
            </span>
            <ChevronDown
              style={{
                width: 13,
                height: 13,
                color: '#6b7280',
                transform: isWsDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 150ms ease'
              }}
            />
          </button>

          {/* Workspace Dropdown Menu */}
          {isWsDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: '270px',
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '14px',
                boxShadow: '0 12px 32px rgba(15,23,42,0.12)',
                padding: '6px',
                zIndex: 2000
              }}
            >
              <div
                style={{
                  padding: '6px 10px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}
              >
                Workspaces ({userOrganizations.length})
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '4px 0' }}>
                {userOrganizations.map(org => {
                  const isSelected = org.id === currentOrg.id;
                  return (
                    <div
                      key={org.id}
                      onClick={() => {
                        setCurrentOrg(org);
                        setIsWsDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: isSelected ? '#f8fafc' : 'transparent',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.8125rem',
                        color: isSelected ? '#1d4ed8' : '#111827'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '6px',
                            background: isSelected ? '#1d4ed8' : '#e2e8f0',
                            color: isSelected ? '#ffffff' : '#334155',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 700
                          }}
                        >
                          {org.name.charAt(0)}
                        </div>
                        <span>{org.name}</span>
                      </div>
                      {isSelected && (
                        <span style={{ fontSize: '0.6875rem', color: '#1d4ed8', fontWeight: 700 }}>
                          Active
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '4px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsWsDropdownOpen(false);
                    setIsCreateOrgModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#1d4ed8',
                    cursor: 'pointer'
                  }}
                >
                  <Plus style={{ width: 14, height: 14 }} />
                  <span>Create New Organization</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Verified Role Badge, Notification Bell & User Capsule */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Verified User Role Pill */}
        <div
          title={`Your permission level in ${currentOrg.name}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            background: badgeStyle.bg,
            border: `1px solid ${badgeStyle.border}`,
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: badgeStyle.color,
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}
        >
          <ShieldCheck style={{ width: 13, height: 13 }} />
          <span>{badgeStyle.label}</span>
        </div>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            type="button"
            onClick={() => setIsNotifOpen(prev => !prev)}
            style={{
              position: 'relative',
              width: '34px',
              height: '34px',
              border: '1px solid #e5e7eb',
              background: '#f4f5f7',
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Bell style={{ width: 15, height: 15, color: '#111827' }} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  minWidth: '16px',
                  height: '16px',
                  padding: '0 4px',
                  background: '#2563eb',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  fontSize: '9.5px',
                  fontWeight: 800,
                  border: '2px solid #ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && <NotificationCenter onClose={() => setIsNotifOpen(false)} />}
        </div>

        {/* Auth Controls & User Capsule */}
        {isClerkConfigured ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  style={{
                    padding: '6px 13px',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#111827',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  style={{
                    padding: '6px 14px',
                    background: '#1d4ed8',
                    border: 'none',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(29,78,216,0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: { width: '30px', height: '30px' }
                  }
                }}
              />
            </SignedIn>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 12px 4px 6px',
              background: '#f4f5f7',
              border: '1px solid #e5e7eb',
              borderRadius: '9999px'
            }}
          >
            <div
              className="avatar"
              style={{
                width: '24px',
                height: '24px',
                fontSize: '10px'
              }}
            >
              {currentUser.full_name.charAt(0).toUpperCase()}
            </div>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: '#111827',
                maxWidth: '120px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {currentUser.full_name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
