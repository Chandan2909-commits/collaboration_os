'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Hash,
  Lock,
  Plus,
  Send,
  Building2,
  UsersRound,
  Shield,
  ShieldCheck,
  Filter,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useApp } from '@/lib/AppContext';
import { Channel } from '@/lib/types';

export default function ChatPage() {
  const {
    channels,
    activeChannel,
    setActiveChannel,
    messages,
    sendMessage,
    currentUser,
    users,
    addChannel,
    departments,
    teams,
    currentUserMembership,
    isOwnerOrAdmin
  } = useApp();

  const [inputContent, setInputContent] = useState('');
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [newChanName, setNewChanName] = useState('');
  const [newChanType, setNewChanType] = useState<Channel['type']>('PUBLIC');
  const [newChanDesc, setNewChanDesc] = useState('');
  const [newChanDeptId, setNewChanDeptId] = useState<string>('');
  const [adminDeptFilter, setAdminDeptFilter] = useState<string>('ALL');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Executive status: Super Owner and Admin can view all departments & messages
  const isExecutive = isOwnerOrAdmin;

  // Department and team of the current user
  const userDeptId = currentUserMembership?.department_id || (currentUser as any).department_id;
  const userTeamId = currentUserMembership?.team_id || (currentUser as any).team_id;
  const userDept = departments.find(d => d.id === userDeptId);
  const userTeam = teams.find(t => t.id === userTeamId);

  // Check whether the current user is authorized to access a channel
  const canUserAccessChannel = (c: Channel): boolean => {
    // Admin and Owner can view ALL messages across all departments
    if (isExecutive) return true;

    // Public Organization-wide channels (e.g. #general) are accessible to all tenant members
    if (!c.department_id && !c.team_id) return true;

    // Direct Messages
    if (c.type === 'DIRECT') return true;

    // Department channel: only accessible if user belongs to this department
    if (c.department_id && !c.team_id) {
      return Boolean(userDeptId && c.department_id === userDeptId);
    }

    // Team channel: accessible if team belongs to user's department or is their assigned team
    if (c.team_id) {
      if (userTeamId && c.team_id === userTeamId) return true;
      if (userDeptId && c.department_id === userDeptId) return true;
      return false;
    }

    return false;
  };

  const isCurrentChannelAccessible = canUserAccessChannel(activeChannel);

  // Organization-wide Channels (e.g., #general, #announcements)
  const orgChannels = useMemo(() => {
    return channels.filter(c => !c.department_id && !c.team_id && c.type !== 'DIRECT');
  }, [channels]);

  // Department Channels
  const deptChannels = useMemo(() => {
    return channels.filter(c => {
      if (!c.department_id || c.team_id) return false;
      if (isExecutive) {
        if (adminDeptFilter !== 'ALL') {
          return c.department_id === adminDeptFilter;
        }
        return true;
      }
      return Boolean(userDeptId && c.department_id === userDeptId);
    });
  }, [channels, isExecutive, adminDeptFilter, userDeptId]);

  // Team Pod Channels
  const teamChannels = useMemo(() => {
    return channels.filter(c => {
      if (!c.team_id) return false;
      if (isExecutive) {
        if (adminDeptFilter !== 'ALL') {
          return c.department_id === adminDeptFilter;
        }
        return true;
      }
      return Boolean(
        (userDeptId && c.department_id === userDeptId) ||
        (userTeamId && c.team_id === userTeamId)
      );
    });
  }, [channels, isExecutive, adminDeptFilter, userDeptId, userTeamId]);

  // If activeChannel is not accessible to this user, switch to first accessible channel
  useEffect(() => {
    if (!canUserAccessChannel(activeChannel)) {
      const firstAccessible =
        orgChannels[0] ||
        deptChannels[0] ||
        channels.find(c => canUserAccessChannel(c));

      if (firstAccessible) {
        setActiveChannel(firstAccessible);
      }
    }
  }, [activeChannel, channels, orgChannels, deptChannels, isExecutive, userDeptId]);

  // Filter messages for active channel
  const channelMessages = messages.filter(m => {
    if (m.channel_id === activeChannel.id) return true;
    if (
      (activeChannel.name === 'general' ||
        activeChannel.id === 'chan_general' ||
        activeChannel.id === '569319cf-f386-493d-9749-db01a5fef87a') &&
      (m.channel_id === 'chan_general' ||
        m.channel_id === '569319cf-f386-493d-9749-db01a5fef87a')
    ) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim() || !isCurrentChannelAccessible) return;
    sendMessage(inputContent.trim());
    setInputContent('');
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim()) return;

    // Admins can select any department or org-wide; regular users are pinned to their department
    const targetDeptId = isExecutive
      ? newChanDeptId || undefined
      : userDeptId || undefined;

    addChannel({
      name: newChanName.trim(),
      type: newChanType,
      description: newChanDesc.trim(),
      department_id: targetDeptId
    });

    setNewChanName('');
    setNewChanDesc('');
    setNewChanDeptId('');
    setIsAddChannelOpen(false);
  };

  const activeChannelDept = departments.find(d => d.id === activeChannel.department_id);
  const activeChannelTeam = teams.find(t => t.id === activeChannel.team_id);

  return (
    <div
      className="animate-page-enter"
      style={{
        display: 'flex',
        height: 'calc(100vh - 120px)',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)'
      }}
    >
      {/* Left Channels & DMs Sidebar (290px) */}
      <div
        style={{
          width: '290px',
          background: '#f8fafc',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: '16px 18px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare style={{ width: 16, height: 16, color: '#1e1e1e' }} />
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0 }}>Channels & Streams</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewChanDeptId(userDeptId || '');
                setIsAddChannelOpen(true);
              }}
              className="btn-ghost"
              title="Create Channel"
              style={{ padding: '4px', color: '#1d4ed8' }}
            >
              <Plus style={{ width: 16, height: 16 }} />
            </button>
          </div>

          {/* Department Scoping Banner */}
          {isExecutive ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '8px 10px',
                borderRadius: '8px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck style={{ width: 13, height: 13, color: '#059669', flexShrink: 0 }} />
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#065f46' }}>
                  Admin / Owner: Viewing All Departments
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter style={{ width: 11, height: 11, color: '#047857' }} />
                <select
                  value={adminDeptFilter}
                  onChange={e => setAdminDeptFilter(e.target.value)}
                  style={{
                    flex: 1,
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: '#065f46',
                    background: '#ffffff',
                    border: '1px solid #6ee7b7',
                    borderRadius: '5px',
                    padding: '3px 6px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">All Departments (Executive View)</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                borderRadius: '8px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe'
              }}
            >
              <Building2 style={{ width: 13, height: 13, color: '#1d4ed8', flexShrink: 0 }} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#1e40af', lineHeight: 1.2 }}>
                  {userDept ? userDept.name : 'General Workspace'}
                </div>
                <div style={{ fontSize: '0.625rem', color: '#3b82f6' }}>
                  Restricted to your department channels
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Channels List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {/* Org Wide Channels */}
          {orgChannels.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0 8px 6px'
                }}
              >
                Organization Wide
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {orgChannels.map(c => {
                  const isActive = activeChannel.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveChannel(c)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 700 : 500,
                        background: isActive ? '#1e1e1e' : 'transparent',
                        color: isActive ? '#ffffff' : '#374151',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 120ms ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Hash style={{ width: 14, height: 14, color: isActive ? '#ffffff' : '#64748b' }} />
                        <span>{c.name}</span>
                      </div>
                      {c.unread_count && c.unread_count > 0 && !isActive ? (
                        <span
                          style={{
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '9999px',
                            background: '#1d4ed8',
                            color: '#ffffff'
                          }}
                        >
                          {c.unread_count}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Department Channels */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '0.6875rem',
                fontWeight: 800,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '0 8px 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>
                {isExecutive && adminDeptFilter === 'ALL'
                  ? 'All Department Channels'
                  : userDept
                    ? `${userDept.name} Channels`
                    : 'Department Channels'}
              </span>
              <Building2 style={{ width: 11, height: 11, color: '#94a3b8' }} />
            </div>

            {deptChannels.length === 0 ? (
              <div style={{ padding: '8px 10px', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                No department channels found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {deptChannels.map(c => {
                  const isActive = activeChannel.id === c.id;
                  const cDept = departments.find(d => d.id === c.department_id);

                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveChannel(c)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 700 : 500,
                        background: isActive ? '#1e1e1e' : 'transparent',
                        color: isActive ? '#ffffff' : '#374151',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <Building2
                          style={{
                            width: 13,
                            height: 13,
                            color: isActive ? '#ffffff' : '#64748b',
                            flexShrink: 0
                          }}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.name}
                        </span>
                      </div>

                      {isExecutive && cDept && adminDeptFilter === 'ALL' && (
                        <span
                          style={{
                            fontSize: '0.5625rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: isActive ? '#334155' : '#f1f5f9',
                            color: isActive ? '#94a3b8' : '#64748b',
                            textTransform: 'uppercase',
                            marginLeft: '6px',
                            flexShrink: 0
                          }}
                        >
                          {cDept.name.split(' ')[0]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Team Channels */}
          {teamChannels.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0 8px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>Team Pod Streams</span>
                <UsersRound style={{ width: 11, height: 11, color: '#94a3b8' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {teamChannels.map(c => {
                  const isActive = activeChannel.id === c.id;
                  const cTeam = teams.find(t => t.id === c.team_id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveChannel(c)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 12px',
                        borderRadius: '8px',
                        fontSize: '0.8125rem',
                        fontWeight: isActive ? 700 : 500,
                        background: isActive ? '#1e1e1e' : 'transparent',
                        color: isActive ? '#ffffff' : '#374151',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <UsersRound
                          style={{
                            width: 13,
                            height: 13,
                            color: isActive ? '#ffffff' : '#64748b',
                            flexShrink: 0
                          }}
                        />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.name}
                        </span>
                      </div>
                      {cTeam && isExecutive && (
                        <span
                          style={{
                            fontSize: '0.5625rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: isActive ? '#334155' : '#f1f5f9',
                            color: isActive ? '#94a3b8' : '#64748b',
                            marginLeft: '6px',
                            flexShrink: 0
                          }}
                        >
                          Team
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Chat Conversation View */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Channel Active Header */}
        <div
          style={{
            padding: '14px 24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Hash style={{ width: 18, height: 18, color: '#1e1e1e' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {activeChannel.name}
              </h3>

              {activeChannelDept && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Building2 style={{ width: 11, height: 11 }} />
                  {activeChannelDept.name}
                </span>
              )}

              {activeChannelTeam && (
                <span
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: '#faf5ff',
                    border: '1px solid #e9d5ff',
                    color: '#7e22ce',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <UsersRound style={{ width: 11, height: 11 }} />
                  {activeChannelTeam.name}
                </span>
              )}

              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  background: '#f1f5f9',
                  color: '#475569',
                  textTransform: 'uppercase'
                }}
              >
                {activeChannel.type}
              </span>
            </div>

            {activeChannel.description && (
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', margin: 0 }}>
                {activeChannel.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isExecutive ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  fontSize: '0.6875rem',
                  fontWeight: 700
                }}
              >
                <ShieldCheck style={{ width: 13, height: 13, color: '#059669' }} />
                <span>Executive Oversight • All Messages Visible</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Department Synced</span>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
              </div>
            )}
          </div>
        </div>

        {/* Messages Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {!isCurrentChannelAccessible ? (
            <div
              style={{
                margin: 'auto',
                maxWidth: '460px',
                textAlign: 'center',
                padding: '32px 24px',
                background: '#fff1f2',
                borderRadius: '12px',
                border: '1px solid #fecdd3'
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  color: '#e11d48'
                }}
              >
                <Lock style={{ width: 22, height: 22 }} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#9f1239', margin: '0 0 6px' }}>
                Department Access Restricted
              </h4>
              <p style={{ fontSize: '0.8125rem', color: '#be123c', lineHeight: 1.5, margin: '0 0 16px' }}>
                This channel belongs to {activeChannelDept?.name || 'another department'}. As per tenant privacy
                guidelines, you can only view discussions in your assigned department ({userDept?.name || 'General'}).
                Organization Owners and Admins retain full oversight across all channels.
              </p>
              <button
                type="button"
                onClick={() => {
                  const fallback = orgChannels[0] || deptChannels[0];
                  if (fallback) setActiveChannel(fallback);
                }}
                className="btn btn-secondary btn-sm"
              >
                Return to Authorized Channels
              </button>
            </div>
          ) : channelMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                This is the start of #{activeChannel.name}
              </div>
              <p style={{ fontSize: '0.8125rem' }}>
                {activeChannelDept
                  ? `Dedicated discussion stream for ${activeChannelDept.name}.`
                  : 'Send a message to kick off the collaboration stream.'}
              </p>
            </div>
          ) : (
            channelMessages.map(msg => {
              const sender = users.find(u => u.id === msg.sender_id) || msg.sender;
              const isCurrentUser = msg.sender_id === currentUser.id;

              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}
                >
                  <div
                    className="avatar"
                    style={{
                      width: 34,
                      height: 34,
                      fontSize: '13px',
                      background: isCurrentUser ? '#1d4ed8' : '#1e1e1e'
                    }}
                  >
                    {sender?.full_name?.charAt(0) || 'U'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '0.84375rem', fontWeight: 700, color: '#0f172a' }}>
                        {sender?.full_name || 'Team Contributor'}
                      </span>
                      <span style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: '0.84375rem',
                        color: '#334155',
                        marginTop: '4px',
                        lineHeight: 1.5,
                        wordBreak: 'break-word'
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Message Bar */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e7eb', background: '#fafafa' }}>
          <form
            onSubmit={handleSend}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '9999px',
              padding: '6px 14px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              opacity: isCurrentChannelAccessible ? 1 : 0.6
            }}
          >
            <input
              type="text"
              placeholder={
                isCurrentChannelAccessible
                  ? `Message #${activeChannel.name}...`
                  : 'Access restricted: you cannot send messages in this department'
              }
              value={inputContent}
              onChange={e => setInputContent(e.target.value)}
              disabled={!isCurrentChannelAccessible}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: '0.84375rem',
                color: '#0f172a',
                background: 'transparent',
                fontFamily: 'Inter, sans-serif'
              }}
            />

            <button
              type="submit"
              disabled={!inputContent.trim() || !isCurrentChannelAccessible}
              className="btn btn-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.75rem',
                opacity: inputContent.trim() && isCurrentChannelAccessible ? 1 : 0.6
              }}
            >
              <Send style={{ width: 13, height: 13 }} />
              <span>Send</span>
            </button>
          </form>
          <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '6px', textAlign: 'center' }}>
            Supported formats: Markdown, attachments, @mentions, and real-time thread replies.
          </div>
        </div>
      </div>

      {/* Create Channel Modal */}
      {isAddChannelOpen && (
        <div className="modal-overlay" onClick={() => setIsAddChannelOpen(false)}>
          <div
            className="modal-card-container"
            style={{ maxWidth: '460px' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-card-header">
              <h4 style={{ fontSize: '1.125rem', fontWeight: 700, margin: 0 }}>Create Channel</h4>
              <button
                type="button"
                onClick={() => setIsAddChannelOpen(false)}
                className="btn-ghost"
                style={{ padding: '4px' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateChannel}>
              <div className="modal-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="settings-label">Channel Name</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#64748b', fontWeight: 700 }}>#</span>
                    <input
                      type="text"
                      className="settings-input"
                      placeholder="e.g. quarterly-sprint-sync"
                      value={newChanName}
                      onChange={e => setNewChanName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Department Selection */}
                <div>
                  <label className="settings-label">Department / Scope</label>
                  {isExecutive ? (
                    <select
                      className="settings-input"
                      value={newChanDeptId}
                      onChange={e => setNewChanDeptId(e.target.value)}
                    >
                      <option value="">Organization Wide (All Company Members)</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.id}>
                          Department: {d.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div
                      style={{
                        padding: '9px 12px',
                        background: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.8125rem',
                        color: '#334155',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <Building2 style={{ width: 14, height: 14, color: '#1d4ed8' }} />
                      <span>
                        Assigned to <strong>{userDept?.name || 'General Workspace'}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="settings-label">Channel Visibility</label>
                  <select
                    className="settings-input"
                    value={newChanType}
                    onChange={e => setNewChanType(e.target.value as Channel['type'])}
                  >
                    <option value="PUBLIC">Public (Visible to authorized department members)</option>
                    <option value="PRIVATE">Private (Restricted invite-only)</option>
                  </select>
                </div>

                <div>
                  <label className="settings-label">Description / Topic</label>
                  <input
                    type="text"
                    className="settings-input"
                    placeholder="Topic or channel purpose..."
                    value={newChanDesc}
                    onChange={e => setNewChanDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-card-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddChannelOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
