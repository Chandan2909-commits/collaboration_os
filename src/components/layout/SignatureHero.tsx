'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface SignatureHeroProps {
  tag?: string;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
}

export function SignatureHero({
  tag = 'CrossTech OS',
  title,
  description,
  primaryAction,
  secondaryAction
}: SignatureHeroProps) {
  return (
    <div className="panel-hero-card">
      <div style={{ flex: 1, maxWidth: '720px', zIndex: 1 }}>
        <div className="panel-hero-tag">
          <Sparkles style={{ width: 12, height: 12 }} />
          <span>{tag}</span>
        </div>
        <h1 className="panel-hero-title">{title}</h1>
        {description && <p className="panel-hero-desc">{description}</p>}
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="panel-hero-actions" style={{ zIndex: 1 }}>
          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="btn-hero-secondary"
            >
              {secondaryAction.icon}
              <span>{secondaryAction.label}</span>
            </button>
          )}

          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="btn-hero-primary"
            >
              {primaryAction.icon}
              <span>{primaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
