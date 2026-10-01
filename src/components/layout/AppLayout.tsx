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
  const { hasActiveOrganization } = useApp();
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
