'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, ShieldCheck, Check, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useApp, decodeInviteToken } from '@/lib/AppContext';
import { useUser } from '@clerk/nextjs';
import { getRoleBadgeStyle } from '@/lib/rbac';

export default function InviteAcceptPage() {
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  const { invitations, acceptInvitation, currentUser } = useApp();
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();

  const [isAccepted, setIsAccepted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Decode token or lookup in invitations
  const decoded = decodeInviteToken(token);
  const foundInv = invitations.find(i => i.token_hash === token);

  const orgName = decoded?.org_name || foundInv?.organization_name || 'CrossTech Workspace';
  const role = decoded?.role || foundInv?.role || 'TEAM_MEMBER';
  const deptName = decoded?.dept_name || foundInv?.department_name || 'General Operations';
  const invitedEmail = decoded?.email || foundInv?.email || '';

  const badgeStyle = getRoleBadgeStyle(role);

  // Store pending invite token in localStorage so login/signup automatically knows about it
  useEffect(() => {
    if (token) {
      try {
        localStorage.setItem('crosstech_pending_invite', token);
      } catch (e) {
        console.warn('Could not store pending invite:', e);
      }
    }
  }, [token]);

  // Auto-accept if user is signed in with Clerk
  const handleAcceptInvite = () => {
    if (!token) return;

    const userOverride = clerkUser
      ? {
          id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || invitedEmail,
          full_name: clerkUser.fullName || clerkUser.firstName || 'Employee',
          avatar_url: clerkUser.imageUrl
        }
      : currentUser.email
      ? currentUser
      : undefined;

    const res = acceptInvitation(token, userOverride);
    if (res.success) {
      setIsAccepted(true);
      setTimeout(() => {
        router.push('/');
      }, 1200);
    } else {
      setErrorMsg(res.error || 'Failed to accept invitation.');
    }
  };

  // If user is already signed in, we can offer one-click accept
  const isUserAuthenticated = isSignedIn || Boolean(currentUser?.id && currentUser.id !== 'usr_init');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#f8fafc',
        padding: '24px 16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 1px 1px rgba(0,0,0,0.02)',
          padding: '36px 32px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Accent top gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #1d4ed8 0%, #3b82f6 50%, #10b981 100%)'
          }}
        />

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #bfdbfe',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1d4ed8',
              marginBottom: '14px',
              boxShadow: '0 4px 12px rgba(29, 78, 216, 0.12)'
            }}
          >
            <Building2 style={{ width: 24, height: 24 }} />
          </div>

          <div
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: '18px',
              letterSpacing: '-0.02em',
              color: '#1e1e1e',
              marginBottom: '6px'
            }}
          >
            CrossTech<span style={{ color: '#1d4ed8' }}>OS</span>
          </div>

          <h2
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: '#0f172a',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0'
            }}
          >
            Workspace Invitation
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
            You've been invited to join <strong style={{ color: '#0f172a' }}>{orgName}</strong>
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '0.8125rem',
              marginBottom: '18px'
            }}
          >
            {errorMsg}
          </div>
        )}

        {isAccepted ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                border: '1px solid #a7f3d0'
              }}
            >
              <Check style={{ width: 30, height: 30 }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Welcome to {orgName}!
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Your account has been enrolled as <strong>{badgeStyle.label}</strong> in <strong>{deptName}</strong>. Loading your workspace...
            </p>
          </div>
        ) : (
          <div>
            {/* Invitation Details Capsule */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px 18px',
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Organization:</span>
                <strong style={{ fontSize: '0.875rem', color: '#0f172a' }}>{orgName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Target Department:</span>
                <strong style={{ fontSize: '0.875rem', color: '#1d4ed8' }}>{deptName}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Assigned Scope / Role:</span>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: badgeStyle.bg,
                    color: badgeStyle.color,
                    border: `1px solid ${badgeStyle.border}`,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  {badgeStyle.label}
                </span>
              </div>

              {invitedEmail && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Invited Email:</span>
                  <span style={{ fontSize: '0.8125rem', color: '#334155', fontFamily: 'monospace' }}>{invitedEmail}</span>
                </div>
              )}
            </div>

            {/* If user is already authenticated */}
            {isUserAuthenticated ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    fontSize: '0.8125rem',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <ShieldCheck style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <span>
                    Authenticated as <strong>{clerkUser?.fullName || currentUser.full_name || 'You'}</strong> ({clerkUser?.primaryEmailAddress?.emailAddress || currentUser.email})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAcceptInvite}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '13px 20px',
                    borderRadius: '8px',
                    background: '#1d4ed8',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>Accept Invite & Join Workspace</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </button>
              </div>
            ) : (
              /* If user is NOT authenticated yet */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 4px 0', textAlign: 'center' }}>
                  Please sign in or create an employee account to accept this invitation:
                </p>

                <Link
                  href={`/sign-up?redirect_url=${encodeURIComponent(`/invite/${token}`)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    background: '#1d4ed8',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(29, 78, 216, 0.25)',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  <UserPlus style={{ width: 16, height: 16 }} />
                  <span>Sign Up & Join as Employee</span>
                </Link>

                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent(`/invite/${token}`)}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '11px 18px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    color: '#111827',
                    border: '1px solid #cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  <LogIn style={{ width: 16, height: 16 }} />
                  <span>Already have an account? Sign In</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
