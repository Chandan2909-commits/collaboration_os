'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Hash,
  Lock,
  Plus,
  Send,
  Paperclip,
  Smile,
  Building2,
  UsersRound,
  User,
  Info
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
    addChannel
  } = useApp();

  const [inputContent, setInputContent] = useState('');
  const [isAddChannelOpen, setIsAddChannelOpen] = useState(false);
  const [newChanName, setNewChanName] = useState('');
  const [newChanType, setNewChanType] = useState<Channel['type']>('PUBLIC');
  const [newChanDesc, setNewChanDesc] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channelMessages = messages.filter(m => {
    if (m.channel_id === activeChannel.id) return true;
    if (
      (activeChannel.name === 'general' || activeChannel.id === 'chan_general' || activeChannel.id === '569319cf-f386-493d-9749-db01a5fef87a') &&
      (m.channel_id === 'chan_general' || m.channel_id === '569319cf-f386-493d-9749-db01a5fef87a')
    ) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [channelMessages.length]);

  const orgChannels = channels.filter(c => !c.department_id && !c.team_id && c.type !== 'DIRECT');
  const deptChannels = channels.filter(c => c.department_id && !c.team_id);
  const teamChannels = channels.filter(c => c.team_id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;
    sendMessage(inputContent.trim());
    setInputContent('');
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim()) return;
    addChannel({
      name: newChanName.trim(),
      type: newChanType,
      description: newChanDesc.trim()
    });
    setNewChanName('');
    setNewChanDesc('');
    setIsAddChannelOpen(false);
  };

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
      {/* Left Channels & DMs Sidebar (280px) */}
      <div
        style={{
          width: '280px',
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
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare style={{ width: 16, height: 16, color: '#1e1e1e' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Channels & Streams</h3>
          </div>
          <button
            type="button"
            onClick={() => setIsAddChannelOpen(true)}
            className="btn-ghost"
            title="Create Channel"
            style={{ padding: '4px', color: '#1d4ed8' }}
          >
            <Plus style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Channels List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {/* Org Wide Channels */}
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
              Organization Channels
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

          {/* Department Channels */}
          {deptChannels.length > 0 && (
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
                Department Channels
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {deptChannels.map(c => {
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
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 style={{ width: 13, height: 13, color: isActive ? '#ffffff' : '#64748b' }} />
                        <span>{c.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
                  padding: '0 8px 6px'
                }}
              >
                Team Pod Streams
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {teamChannels.map(c => {
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
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <UsersRound style={{ width: 13, height: 13, color: isActive ? '#ffffff' : '#64748b' }} />
                        <span>{c.name}</span>
                      </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Hash style={{ width: 18, height: 18, color: '#1e1e1e' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
                {activeChannel.name}
              </h3>
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
              <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                {activeChannel.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Real-time Subscribed
            </span>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
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
          {channelMessages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                This is the start of #{activeChannel.name}
              </div>
              <p style={{ fontSize: '0.8125rem' }}>Send a message to kick off the collaboration stream.</p>
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
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
            }}
          >
            <input
              type="text"
              placeholder={`Message #${activeChannel.name}...`}
              value={inputContent}
              onChange={e => setInputContent(e.target.value)}
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
              disabled={!inputContent.trim()}
              className="btn btn-primary"
              style={{
                padding: '6px 14px',
                fontSize: '0.75rem',
                opacity: inputContent.trim() ? 1 : 0.6
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
            style={{ maxWidth: '440px' }}
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
                      placeholder="e.g. backend-sprint-sync"
                      value={newChanName}
                      onChange={e => setNewChanName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="settings-label">Channel Scope / Visibility</label>
                  <select
                    className="settings-input"
                    value={newChanType}
                    onChange={e => setNewChanType(e.target.value as Channel['type'])}
                  >
                    <option value="PUBLIC">Public (Visible to all tenant members)</option>
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
