'use client';

import React from 'react';
import { CheckCheck, CheckCircle2, MessageSquare, UserPlus, FileText, Bell } from 'lucide-react';
import { useApp } from '@/lib/AppContext';

export function NotificationCenter({ onClose }: { onClose: () => void }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  const getIcon = (type: string) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return <CheckCircle2 style={{ width: 14, height: 14, color: '#1d4ed8' }} />;
      case 'MESSAGE':
        return <MessageSquare style={{ width: 14, height: 14, color: '#10b981' }} />;
      case 'INVITATION':
        return <UserPlus style={{ width: 14, height: 14, color: '#7c3aed' }} />;
      default:
        return <FileText style={{ width: 14, height: 14, color: '#f59e0b' }} />;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '340px',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.14)',
        zIndex: 2000,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          background: '#fafafa'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Bell style={{ width: 14, height: 14, color: '#111827' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#111827' }}>
            Notifications
          </span>
        </div>
        <button
          type="button"
          onClick={markAllNotificationsRead}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.6875rem',
            color: '#1d4ed8',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <CheckCheck style={{ width: 12, height: 12 }} />
          <span>Mark all read</span>
        </button>
      </div>

      <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.8125rem' }}>
            No notifications yet
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 16px',
                borderBottom: '1px solid #f1f5f9',
                background: n.is_read ? '#ffffff' : '#f8fafc',
                cursor: 'pointer',
                transition: 'background 150ms ease'
              }}
            >
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {getIcon(n.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827' }}>
                    {n.title}
                  </span>
                  {!n.is_read && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#2563eb'
                      }}
                    />
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#475569', margin: '2px 0 0 0', lineHeight: 1.3 }}>
                  {n.message}
                </p>
                <span style={{ fontSize: '0.625rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
