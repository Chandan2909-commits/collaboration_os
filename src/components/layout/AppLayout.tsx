'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../command/CommandPalette';
import { CreateOrgModal } from '../modals/CreateOrgModal';
import { CreateDeptModal } from '../modals/CreateDeptModal';
import { CreateTeamModal } from '../modals/CreateTeamModal';
import { InviteModal } from '../modals/InviteModal';
import { TaskModal } from '../modals/TaskModal';

import { useApp } from '@/lib/AppContext';
import { CompanyOnboarding } from '../onboarding/CompanyOnboarding';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hasActiveOrganization, isInitialLoading } = useApp();
  const isAuthPage = pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up') || pathname?.startsWith('/invite');

  if (isAuthPage) {
    return (
      <div
        style={{
          width: '100vw',
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflowY: 'auto'
        }}
      >
        {children}
      </div>
    );
  }

  // Show clean branded loading indicator while validating user & fetching workspace
  if (isInitialLoading) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#090d16',
          color: '#ffffff'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '20px',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45)'
            }}
          >
            CT
          </div>
          <span style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>CrossTech OS</span>
        </div>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: '3px solid rgba(255, 255, 255, 0.12)',
            borderTopColor: '#3b82f6',
            animation: 'ctSpin 0.75s linear infinite',
            marginBottom: '14px'
          }}
        />
        <style>{`@keyframes ctSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 500, letterSpacing: '0.01em' }}>Connecting to your workspace...</p>
      </div>
    );
  }

  // If authenticated but has not created/joined an organization yet
  if (!hasActiveOrganization) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          width: '100vw',
          backgroundColor: '#f8fafc',
          overflowY: 'auto'
        }}
      >
        <Topbar />
        <main style={{ flex: 1, padding: '20px 24px 40px 24px' }}>
          <CompanyOnboarding />
        </main>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--bg-app)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Full-Width Sticky Floating Topbar */}
      <Topbar />

      {/* Main Body: Sidebar + Dynamic Content Canvas */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          position: 'relative',
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        {/* Floating Left Sidebar */}
        <Sidebar />

        {/* Dynamic View Content Container */}
        <main
          id="main-content"
          style={{
            flex: 1,
            padding: '18px 28px 32px 24px',
            minWidth: 0,
            overflowY: 'auto'
          }}
        >
          {children}
        </main>
      </div>

      {/* Global Modals & Command Center */}
      <CommandPalette />
      <CreateOrgModal />
      <CreateDeptModal />
      <CreateTeamModal />
      <InviteModal />
      <TaskModal />
    </div>
  );
}
