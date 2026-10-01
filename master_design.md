# OutreachOS — Definitive Design System & UI Reference Specification

> **The Master Architectural & UI/UX Blueprint**  
> *Engineered from the OutreachOS Production Codebase (`v2.0` ONIX Executive Light-Mode)*  
> This specification is an exhaustive, line-by-line, pixel-by-pixel reference guide. It contains the exact tokens, CSS rules, HTML templates, mathematical SVG formulas, animation keyframes, and JavaScript interaction handlers required to clone the design language and aesthetics of OutreachOS into any modern SaaS product.

---

## Table of Contents

1. [Master Element & Architecture Inventory](#1-master-element--architecture-inventory)
2. [The "ONIX Premium Executive" Color System & Light-Mode Palette](#2-the-onix-premium-executive-color-system--light-mode-palette)
3. [Typography Architecture & Font Engine](#3-typography-architecture--font-engine)
4. [Universal Ultra-Slim Custom Scrollbars](#4-universal-ultra-slim-custom-scrollbars)
5. [The Floating Island Macro Layout Architecture](#5-the-floating-island-macro-layout-architecture)
6. [The Topbar Navigation Header & Running Loader](#6-the-topbar-navigation-header--running-loader)
7. [The Collapsible Navigation Sidebar](#7-the-collapsible-navigation-sidebar)
8. [The Signature Dark-Blue Gradient Hero Card System](#8-the-signature-dark-blue-gradient-hero-card-system)
9. [Nested Settings Navigation System](#9-nested-settings-navigation-system)
10. [Spotlight Command Center (`⌘K` Palette)](#10-spotlight-command-center-k-palette)
11. [Card Architecture, Containers & Module Hierarchy](#11-card-architecture-containers--module-hierarchy)
12. [Button Primitives & Micro-Interaction Physics](#12-button-primitives--micro-interaction-physics)
13. [Modal Dialog Architecture & Spring Animation](#13-modal-dialog-architecture--spring-animation)
14. [Pure Vector SVG Infographics & Dashboard Visualizations](#14-pure-vector-svg-infographics--dashboard-visualizations)
    - 14.1 [Dual Cubic Bézier Multi-Curve Trend Chart](#141-dual-cubic-bézier-multi-curve-trend-chart)
    - 14.2 [180° Speedometer Deliverability Dial Gauge](#142-180-speedometer-deliverability-dial-gauge)
    - 14.3 [Horizontal Step-Down Conversion Funnel](#143-horizontal-step-down-conversion-funnel)
    - 14.4 [Sentiment & Delivery Outcome Donut Ring](#144-sentiment--delivery-outcome-donut-ring)
    - 14.5 [High-Precision Circular Progress Rings](#145-high-precision-circular-progress-rings)
15. [Motion Design, Easing Physics & Animation Suite](#15-motion-design-easing-physics--animation-suite)
16. [How to Replicate This Design System in a New SaaS Product](#16-how-to-replicate-this-design-system-in-a-new-saas-product)

---

## 1. Master Element & Architecture Inventory

Every UI component in OutreachOS has been extracted from the live codebase and cataloged below:

| Component / Element | Source File in Codebase | Key Design Traits & Identifying Class/Id |
| :--- | :--- | :--- |
| **Global Theme Tokens** | `src/styles/variables.css` | `:root` variables: Onyx `#1e1e1e`, Deep Blue `#1d4ed8`, Canvas `#f8f9fa` |
| **Typography Engine** | `src/styles/typography.css` | Montserrat 800/700 headings, Inter body (`13.5px`, `-0.011em` tracking), JetBrains Mono |
| **Custom Scrollbars** | `src/styles/reset.css` | Ultra-slim `5px` width, transparent track, pill thumb `rgba(148, 163, 184, 0.35)` |
| **Macro Layout** | `src/layouts/app-layout.js` | Floating Island pattern: Sticky Topbar + Left Floating Sidebar + Scrollable View |
| **Sticky Topbar** | `src/components/topbar/topbar.js` | Height `56px`, Radius `16px`, Margin `12px 16px 0 16px`, Border `#e5e7eb`, Shadow `0 2px 8px rgba(15,23,42,0.02)` |
| **Running Progress Loader** | `src/styles/components.css` | `#topbar-loader-line`: `linear-gradient(90deg, #3b82f6, #6366f1, #06b6d4, #3b82f6)` |
| **Workspace Dropdown** | `src/components/topbar/topbar.js` | `#workspace-switcher-btn`: Pill capsule, initial avatar, role badge, chevron rotation |
| **Collapsible Sidebar** | `src/components/sidebar/sidebar.js` | Width `224px` -> `64px`, Radius `20px`, Easing `250ms cubic-bezier(0.16, 1, 0.3, 1)` |
| **Sidebar Nav Items** | `src/styles/components.css` | `.sidebar-nav-link`: Pill `9999px`, Active `#1e1e1e` with white text & `0 4px 12px` shadow |
| **Command Center (`⌘K`)** | `src/components/command-palette/command-palette.js` | Backdrop blur `4px`, overlay `rgba(0,0,0,0.7)`, instant search, `<kbd>` styling |
| **Signature Hero Card** | `src/styles/components.css`, `src/layouts/workspace-layout.js` | `.panel-hero-card`: Gradient `135deg, #0b1120 0%, #111827 42%, #172554 100%`, Radial glow `::before` |
| **Hero Action Buttons** | `src/styles/components.css` | `.btn-hero-primary`: Pure white pill `#ffffff`, text `#0f172a`, shadow `0 4px 14px` |
| **Nested Settings Nav** | `src/views/settings/settings-view.js`, `src/styles/components.css` | `.settings-container`: 2-Pane split (`.settings-sidebar` 250px + `.settings-content-pane`) |
| **Settings Nav Buttons** | `src/styles/components.css` | `.settings-nav-btn`: Radius `10px`, Active `#0f172a` with white text & badge contrast |
| **Standard SaaS Cards** | `src/styles/components.css`, `src/components/card/card.js` | `.card`: Radius `16px`, Border `#e5e7eb`, Background `#ffffff`, Shadow `0 1px 2px` |
| **Button Primitives** | `src/styles/components.css` | Base `.btn`: Full pill `9999px`, active scale `0.95`, icon hover scale `1.05` |
| **Modal Dialog System** | `src/components/modal/modal-manager.js`, `src/styles/components.css` | `.modal-card-container`: Spring animation, sticky header, scrollable body, sticky footer |
| **Dual Bézier Trend Chart**| `src/components/charts/svg-charts.js` | Pure SVG `renderDualLineChart()`: Cubic Bézier math, dual area gradient fills, hover dots |
| **Speedometer Gauge** | `src/components/charts/svg-charts.js` | Pure SVG `renderSpeedometerGauge()`: 180° semi-circular arc, needle pointer, metallic hub |
| **Conversion Funnel** | `src/components/charts/svg-charts.js` | Pure SVG `renderConversionFunnel()`: 5-step proportional horizontal bars with stage numbers |
| **Sentiment Donut** | `src/components/charts/svg-charts.js` | Pure SVG `renderSentimentDonut()`: Annular slice arcs (`dPath`), legend pill columns |
| **Motion Physics** | `src/styles/animations.css` | `@keyframes pageEnter`, `@keyframes modalSpring`, `@keyframes runningLoader` |

---

## 2. The "ONIX Premium Executive" Color System & Light-Mode Palette

OutreachOS utilizes the **ONIX Premium Executive Light-Mode** color architecture. It differs fundamentally from generic SaaS themes by utilizing **deep charcoal/onyx blacks (`#1e1e1e`, `#111827`, `#0f172a`)** for primary interactive surfaces and contrast elements, while keeping backgrounds crisp off-white and pure white. 

A single **deep sapphire blue (`#1d4ed8` / `#2563eb`)** is reserved strictly as a surprise accent and focus element.

### 2.1 Complete `:root` Token Definition (`src/styles/variables.css`)

```css
:root {
  /* ============================================================
     Surfaces & Canvas (Light Mode High Contrast)
     ============================================================ */
  --background: #ffffff;             /* Pure white base */
  --foreground: #111827;             /* Near-black primary text */
  --bg-app: #f8f9fa;                 /* Cool crisp light canvas */
  --bg-surface: #ffffff;             /* Card surface */
  --bg-surface-hover: #f4f5f7;       /* Interactive row hover */
  --bg-sidebar: #ffffff;             /* Sidebar surface */

  /* ============================================================
     Brand & Contrast (Onyx Black Engine)
     ============================================================ */
  --primary: #1e1e1e;                /* Onyx Black (Brand Identity / Main CTAs) */
  --primary-foreground: #ffffff;     /* Crisp white text on Onyx */
  --secondary: #f4f5f7;              /* Light neutral fill */
  --secondary-foreground: #1e1e1e;   /* Dark text on light buttons */
  --color-brand: #1e1e1e;
  --color-brand-hover: #111111;
  --color-brand-light: #f4f5f7;
  --color-brand-glow: rgba(0, 0, 0, 0.08);

  /* ============================================================
     The Single Surprise Highlight Accent (Sapphire / Royal Blue)
     ============================================================ */
  --color-accent: #1d4ed8;           /* Deep Blue highlight */
  --color-accent-hover: #1e40af;     /* Hover state */
  --color-accent-light: #eff6ff;     /* Soft blue background badge tint */
  --color-accent-glow: rgba(29, 78, 216, 0.15);
  --ring: #1d4ed8;                   /* Accessible focus ring */

  /* ============================================================
     Text Hierarchy
     ============================================================ */
  --text-primary: #111827;          /* H1-H4 & Primary table headers */
  --text-secondary: #475569;        /* Slate 600 - Standard body text */
  --text-muted: #6b7280;            /* Slate 500 - Subtitles & descriptions */
  --text-disabled: #9ca3af;         /* Slate 400 - Disabled placeholders */
  --text-inverse: #ffffff;          /* White text */

  /* ============================================================
     Borders & Dividers
     ============================================================ */
  --border: #e5e7eb;                /* Standard hairline border */
  --border-subtle: #e5e7eb;
  --border-strong: #d1d5db;         /* Active/hovered borders */
  --input: #e5e7eb;

  /* ============================================================
     Status Indicators (Strictly Reserved for Status Badges)
     ============================================================ */
  --color-success: #10b981;         /* Emerald Green */
  --color-success-light: #ecfdf5;
  --color-warning: #f59e0b;         /* Amber Gold */
  --color-warning-light: #fef3c7;
  --color-danger: #ef4444;          /* Crimson Red */
  --color-danger-light: #fee2e2;
  --destructive: #ef4444;
  --destructive-foreground: #ffffff;
  --color-info: #1d4ed8;            /* Sky/Deep Blue */
  --color-info-light: #eff6ff;

  /* ============================================================
     Geometry & Soft Radius Scale
     ============================================================ */
  --radius-xs: 6px;
  --radius-sm: 8px;
  --radius-md: 16px;                /* Standard card radius */
  --radius: 16px;
  --radius-lg: 24px;                /* Floating containers */
  --radius-xl: 32px;
  --radius-pill: 9999px;            /* Full capsule buttons & avatars */

  /* ============================================================
     Spacing Scale
     ============================================================ */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* ============================================================
     Ambient Multi-Stop Shadow System
     ============================================================ */
  --shadow-2xs: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  --shadow-xs: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 4px 0 rgba(15, 23, 42, 0.03);
  --shadow-md: 0 8px 30px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.01);
  --shadow-lg: 0 16px 40px rgba(15, 23, 42, 0.06), 0 4px 8px rgba(15, 23, 42, 0.02);
  --shadow-xl: 0 32px 64px rgba(15, 23, 42, 0.08), 0 8px 16px rgba(15, 23, 42, 0.03);
  --shadow-brand: 0 4px 12px rgba(0, 0, 0, 0.12);

  /* ============================================================
     Z-Index Hierarchy
     ============================================================ */
  --z-app: 1;
  --z-sidebar: 10;
  --z-topbar: 20;
  --z-dropdown: 30;
  --z-overlay: 9999;
  --z-drawer: 10001;
  --z-modal: 10002;
  --z-toast: 10005;
}
```

---

## 3. Typography Architecture & Font Engine

OutreachOS pairs **Montserrat** for executive, high-impact headings with **Inter** for ultra-legible high-density data tables and body text, and **JetBrains Mono** for technical identifiers, emails, and code.

### 3.1 Google Fonts Import

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Montserrat:wght@600;700;800;900&display=swap" rel="stylesheet">
```

### 3.2 Typography Tokens & Hierarchy Table (`src/styles/typography.css`)

| Element / Class | Font Family | Size (rem / px) | Weight | Line Height | Letter Spacing | Color Variable |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `h1` / Page Header | `'Montserrat'` | `1.875rem` (30px) | `800` (ExtraBold) | `1.15` | `-0.03em` | `var(--text-primary)` |
| `h2` / Section Header | `'Montserrat'` | `1.5rem` (24px) | `800` (ExtraBold) | `1.2` | `-0.025em` | `var(--text-primary)` |
| `h3` / Card Header | `'Montserrat'` | `1.25rem` (20px) | `700` (Bold) | `1.25` | `-0.02em` | `var(--text-primary)` |
| `h4` / Modal Title | `'Montserrat'` | `1.125rem` (18px) | `700` (Bold) | `1.3` | `-0.015em` | `var(--text-primary)` |
| `body` / Standard Text| `'Inter'` | `0.84375rem` (13.5px)| `400` / `500` | `1.5` | `-0.011em` | `var(--text-secondary)` |
| `.page-subtitle` | `'Inter'` | `0.8125rem` (13px) | `500` (Medium) | `1.4` | `normal` | `var(--text-muted)` |
| `.panel-hero-tag` | `'Inter'` | `0.6875rem` (11px) | `700` (Bold) | `1.0` | `+0.06em` (caps) | `#e2e8f0` |
| `code` / `.font-mono` | `'JetBrains Mono'` | `0.8125rem` (13px) | `500` (Medium) | `1.4` | `normal` | `var(--color-accent)` |

### 3.3 Global Typography Rules (`src/styles/typography.css`)

```css
body {
  font-family: var(--font-family-body);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  background-color: var(--bg-app);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  letter-spacing: -0.011em;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-heading);
  color: var(--text-primary);
  line-height: 1.2;
  letter-spacing: -0.025em;
  margin: 0;
}

h1 {
  font-size: 1.875rem; /* 30px */
  font-weight: 800;    /* ExtraBold */
  line-height: 1.15;
  letter-spacing: -0.03em;
}

h2 {
  font-size: 1.5rem;   /* 24px */
  font-weight: 800;    /* ExtraBold */
  line-height: 1.2;
  letter-spacing: -0.025em;
}

h3 {
  font-size: 1.25rem;  /* 20px */
  font-weight: 700;    /* Bold */
  line-height: 1.25;
  letter-spacing: -0.02em;
}

h4 {
  font-size: 1.125rem; /* 18px */
  font-weight: 700;    /* Bold */
  line-height: 1.3;
}

p {
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}
```

---

## 4. Universal Ultra-Slim Custom Scrollbars

OutreachOS eliminates ugly OS-native scrollbars in favor of a **5-pixel linear minimalist scrollbar** that remains invisible until scrolled, preventing layout shifts.

### 4.1 Production CSS (`src/styles/reset.css`)

```css
/* Universal Ultra-Slim SaaS Scrollbars (Linear / Vercel Aesthetic) */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.4) transparent;
}

*::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.35);
  border-radius: 9999px;
  border: 1px solid transparent;
}

*::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.6);
}
```

---

## 5. The Floating Island Macro Layout Architecture

OutreachOS does not stick panels directly to the browser edge. Instead, it employs the **Floating Island Architecture**:
1. The **Topbar** is a floating card pinned `12px` from the top, with `16px` lateral margins and `16px` border-radius.
2. The **Sidebar** is an isolated floating capsule with `20px` border-radius, floating `12px` above the bottom and `16px` from the left edge.
3. The **Main Content Area** scrolls independently with custom margins (`18px 28px 32px 24px`).

```
+------------------------------------------------------------------------+
|  [Floating Topbar Header: 56px, radius: 16px, margin: 12px 16px]       |
+------------------------------------------------------------------------+
| [Floating     | [Main Content View: Scrollable Canvas]                 |
|  Sidebar:     |                                                        |
|  224px / 64px |  +---------------------------------------------------+ |
|  radius: 20px |  | Signature Hero Card (Gradient, radius: 16px)     | |
|  margin:      |  +---------------------------------------------------+ |
|  12px 0 12px  |                                                        |
|  16px]        |  +----------------+ +----------------+ +-------------+ |
|               |  | KPI Card 1     | | KPI Card 2     | | KPI Card 3  | |
|               |  +----------------+ +----------------+ +-------------+ |
+---------------+--------------------------------------------------------+
```

### 5.1 Macro Layout Code (`src/layouts/app-layout.js`)

```javascript
import { renderSidebar } from '../components/sidebar/sidebar.js';
import { renderTopbar } from '../components/topbar/topbar.js';

export function renderAppLayout(contentHtml) {
  return `
    <div style="display: flex; flex-direction: column; height: 100%; width: 100%; background-color: var(--bg-app); position: relative; overflow: hidden;">
      
      <!-- Full-Width Sticky Floating Topbar -->
      ${renderTopbar()}

      <!-- Main Body: Sidebar + Dynamic Content -->
      <div style="display: flex; flex: 1; position: relative; min-height: 0; overflow: hidden;">
        
        <!-- Floating Left Sidebar -->
        ${renderSidebar()}

        <!-- Dynamic View Content Container -->
        <main id="main-content" style="flex: 1; padding: 18px 28px 32px 24px; min-width: 0; overflow-y: auto;">
          ${contentHtml}
        </main>
      </div>
    </div>
  `;
}
```

---

## 6. The Topbar Navigation Header & Running Loader

The Topbar houses the brand logo mark, the workspace switcher dropdown, the global progress indicator line, the notification bell, and user avatar.

### 6.1 Topbar Running Gradient Loader Line (`src/styles/components.css`)

When background API requests or page transitions occur, a running gradient loader animation activates along the bottom edge of the topbar:

```css
#topbar-loader-line {
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 3px;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  background: linear-gradient(90deg, #3b82f6, #6366f1, #06b6d4, #3b82f6);
  background-size: 200% 100%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
  z-index: 100;
}

#topbar-loader-line.loading {
  opacity: 1;
  animation: runningLoader 1s linear infinite;
}

@keyframes runningLoader {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### 6.2 Topbar JavaScript Triggers

```javascript
window.startTopbarLoading = function() {
  const line = document.getElementById('topbar-loader-line');
  if (line) line.classList.add('loading');
};

window.stopTopbarLoading = function() {
  const line = document.getElementById('topbar-loader-line');
  if (line) {
    setTimeout(() => line.classList.remove('loading'), 300);
  }
};
```

### 6.3 Complete Topbar Structure & Markup (`src/components/topbar/topbar.js`)

```javascript
export function renderTopbar() {
  const userObj = store.get('user');
  const userName = userObj?.user_metadata?.full_name || userObj?.email?.split('@')[0] || 'User';
  const org = store.get('organization') || { name: 'My Workspace', id: '' };
  const userRole = store.get('userRole') || 'member';
  const workspaces = store.get('userWorkspaces') || [];

  const roleColorMap = {
    owner:  { bg: '#1e1e1e', color: '#ffffff', border: '#1e1e1e' },
    admin:  { bg: '#eff6ff', color: '#1d4ed8', border: '#dbeafe' },
    member: { bg: '#f4f5f7', color: '#374151', border: '#e5e7eb' },
    viewer: { bg: '#f8fafc', color: '#64748b', border: '#e5e7eb' }
  };
  const badgeStyle = roleColorMap[userRole] || roleColorMap.member;

  return `
    <header style="height: 56px; border: 1px solid #e5e7eb; border-radius: 16px; margin: 12px 16px 0 16px; display: flex; align-items: center; justify-content: space-between; padding: 0 18px; z-index: 1000; flex-shrink: 0; position: sticky; top: 12px; box-shadow: 0 2px 8px rgba(15, 23, 42, 0.02); background: #ffffff; overflow: visible;">
      
      <!-- Running Progress Line -->
      <div style="position: absolute; inset: 0; border-radius: 16px; overflow: hidden; pointer-events: none;">
        <div id="topbar-loader-line"></div>
      </div>

      <!-- Left: Logo & Workspace Switcher -->
      <div style="display: flex; align-items: center; gap: 12px;">
        
        <!-- Logo Mark -->
        <a href="#/dashboard" style="display: flex; align-items: center; gap: 9px; text-decoration: none; cursor: pointer; padding-right: 4px;">
          <div style="width: 28px; height: 28px; border-radius: 8px; background: #111827; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.15); flex-shrink: 0;">
            <i data-lucide="layers" style="width: 16px; height: 16px; color: #ffffff;"></i>
          </div>
          <span style="font-family: var(--font-heading); font-weight: 800; font-size: 1.0625rem; color: #111827; letter-spacing: -0.03em;">
            Outreach<span style="font-weight: 800; color: #1d4ed8;">OS</span>
          </span>
        </a>

        <!-- Hairline Divider -->
        <div style="width: 1px; height: 22px; background: #e5e7eb; margin: 0 2px;"></div>

        <!-- Workspace Pill Button & Dropdown -->
        <div style="position: relative;" id="topbar-workspace-dropdown-wrapper">
          <button 
            type="button" 
            onclick="window.toggleWorkspaceDropdown(event)" 
            id="workspace-switcher-btn"
            style="display: flex; align-items: center; gap: 8px; padding: 5px 12px 5px 8px; background: #f4f5f7; border: 1px solid #e5e7eb; border-radius: 9999px; cursor: pointer; transition: all 150ms ease;"
            onmouseover="this.style.background='#e5e7eb';"
            onmouseout="this.style.background='#f4f5f7';"
          >
            <div style="width: 20px; height: 20px; border-radius: 50%; background: #1e1e1e; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 9.5px; font-weight: 700;">
              ${(org.name || 'W').charAt(0).toUpperCase()}
            </div>
            <span style="font-weight: 600; font-size: 0.8125rem; color: #111827; max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${org.name || 'My Workspace'}
            </span>
            <span style="font-size: 0.6875rem; font-weight: 700; padding: 2px 7px; border-radius: 9999px; background: ${badgeStyle.bg}; color: ${badgeStyle.color}; border: 1px solid ${badgeStyle.border}; text-transform: uppercase;">
              ${userRole}
            </span>
            <i data-lucide="chevron-down" style="width: 13px; height: 13px; color: #6b7280; transition: transform 150ms ease;" id="ws-chevron-icon"></i>
          </button>

          <!-- Dropdown Menu -->
          <div 
            id="workspace-dropdown-menu" 
            style="display: none; position: absolute; top: calc(100% + 6px); left: 0; width: 260px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 8px 30px rgba(15,23,42,0.08); padding: 6px; z-index: 2000;"
          >
            <div style="padding: 4px 8px 6px; font-size: 0.6875rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb;">
              Your Workspaces (${workspaces.length})
            </div>
            <div style="max-height: 200px; overflow-y: auto; padding: 4px 0;">
              ${workspaces.map(w => `
                <div onclick="window.selectWorkspace('${w.org_id}')" style="display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-radius: 8px; cursor: pointer;">
                  <span style="font-size: 0.8125rem; font-weight: 500;">${w.org_name}</span>
                  <span style="font-size: 0.6875rem; padding: 1px 4px; border-radius: 4px; background: #f4f5f7;">${w.role}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

      </div>

      <!-- Right: Notification Bell & User Capsule -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <button onclick="window.toggleNotificationCenter()" class="btn-ghost" style="position: relative; width: 34px; height: 34px; border: 1px solid #e5e7eb; background: #f4f5f7; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; cursor: pointer;">
          <i data-lucide="bell" style="width: 15px; height: 15px; color: #111827;"></i>
          <span id="topbar-notif-badge" style="display: none; position: absolute; top: -3px; right: -3px; min-width: 16px; height: 16px; padding: 0 4px; background: #2563eb; color: #ffffff; border-radius: 9999px; font-size: 9.5px; font-weight: 800; border: 2px solid #ffffff;"></span>
        </button>

        <div style="display: flex; align-items: center; gap: 8px; padding: 4px 12px 4px 6px; background: #f4f5f7; border: 1px solid #e5e7eb; border-radius: 9999px;">
          <div class="avatar" style="width: 24px; height: 24px; font-size: 10px;">${userName.charAt(0).toUpperCase()}</div>
          <span style="font-size: 0.8125rem; font-weight: 600; color: #111827; max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${userName}</span>
          <button onclick="window.handleLogout()" title="Logout" style="background: none; border: none; cursor: pointer; color: #6b7280; display: flex; align-items: center;">
            <i data-lucide="log-out" style="width: 13px; height: 13px;"></i>
          </button>
        </div>
      </div>

    </header>
  `;
}
```

---

## 7. The Collapsible Navigation Sidebar

The sidebar provides instant collapse and expand animations with **zero page re-renders** by manipulating CSS transitions and inline visibility.

### 7.1 Geometry & Easing Specifications (`src/components/sidebar/sidebar.js`)

- **Expanded Width**: `224px`
- **Collapsed Width**: `64px`
- **Container Height**: `calc(100% - 24px)`
- **Margin**: `12px 0 12px 16px`
- **Border Radius**: `20px` (Generous smooth curvature)
- **Transition**: `width 250ms cubic-bezier(0.16, 1, 0.3, 1)`
- **Active Navigation Pill**:
  - `background: #1e1e1e !important;` (Pure Onyx)
  - `color: #ffffff !important;`
  - `border-radius: 9999px !important;`
  - `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;`
  - `font-weight: 700 !important;`

### 7.2 Sidebar Implementation Code

```javascript
export function renderSidebar() {
  const isCollapsed = store.get('sidebarCollapsed') ?? (localStorage.getItem('sidebar_collapsed') === 'true');
  const activeRoute = store.get('activeRoute') || '#/dashboard';
  const sidebarWidth = isCollapsed ? '64px' : '224px';

  const navItems = [
    { label: 'Dashboard',       icon: 'layout-dashboard', path: '#/dashboard' },
    { label: 'Campaigns',       icon: 'workflow',          path: '#/campaigns' },
    { label: 'Mailbox',         icon: 'inbox',             path: '#/mailbox' },
    { label: 'Databases',       icon: 'database',          path: '#/databases' },
    { label: 'Sender Pools',    icon: 'send',              path: '#/sender-pools' },
    { label: 'Email Templates', icon: 'file-text',         path: '#/templates' },
    { label: 'Prompt Library',  icon: 'sparkles',          path: '#/prompts' },
    { label: 'Settings',        icon: 'settings',          path: '#/settings' }
  ];

  return `
    <aside id="main-sidebar" class="sidebar-aside ${isCollapsed ? 'collapsed' : ''}" style="width: ${sidebarWidth}; height: calc(100% - 24px); margin: 12px 0 12px 16px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03); display: flex; flex-direction: column; flex-shrink: 0; z-index: var(--z-sidebar); transition: width 250ms cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden;">
      
      <!-- Toggle Header -->
      <div style="padding: 14px 14px 10px 14px; display: flex; align-items: center; justify-content: ${isCollapsed ? 'center' : 'space-between'};">
        <span class="sidebar-text-label" style="font-family: var(--font-heading); font-size: 0.6875rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; display: ${isCollapsed ? 'none' : 'inline-block'};">Navigation</span>
        <button id="sidebar-toggle-btn" onclick="window.toggleSidebar()" class="btn-ghost" style="padding: 5px; border-radius: 8px; cursor: pointer; border: 1px solid #e5e7eb; background: #f8fafc; display: flex; align-items: center; justify-content: center; color: #6b7280;">
          <i id="sidebar-toggle-icon" data-lucide="${isCollapsed ? 'panel-left-open' : 'panel-left-close'}" style="width: 14px; height: 14px;"></i>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav style="flex: 1; padding: 4px 8px 0 8px; overflow-y: auto;">
        <ul style="display: flex; flex-direction: column; gap: 2px; list-style: none; padding: 0; margin: 0;">
          ${navItems.map(item => {
            const isActive = activeRoute === item.path || (item.path !== '#/dashboard' && activeRoute.startsWith(item.path));
            return `
              <li style="position: relative;" class="sidebar-nav-item">
                <a href="${item.path}" class="sidebar-nav-link ${isActive ? 'sidebar-item-active' : ''}" style="display: flex; align-items: center; justify-content: ${isCollapsed ? 'center' : 'flex-start'}; gap: 10px; padding: 8px 14px; border-radius: 9999px; font-size: 0.8125rem; font-weight: ${isActive ? '700' : '500'}; text-decoration: none; transition: all 150ms ease; ${isActive ? 'background: #1e1e1e; color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.12);' : 'color: #374151;'}">
                  <i data-lucide="${item.icon}" style="width: 16px; height: 16px; flex-shrink: 0; color: ${isActive ? '#ffffff' : '#6b7280'};"></i>
                  <span class="sidebar-text-label" style="display: ${isCollapsed ? 'none' : 'inline-block'};">${item.label}</span>
                </a>
              </li>
            `;
          }).join('')}
        </ul>
      </nav>

      <!-- Bottom Command Center (⌘K) Trigger -->
      <div style="padding: 8px; border-top: 1px solid #e5e7eb; margin-top: auto; display: flex; flex-direction: column; gap: 6px; background: #ffffff;">
        <button onclick="window.openCommandPalette()" style="width: 100%; display: flex; align-items: center; justify-content: ${isCollapsed ? 'center' : 'space-between'}; padding: 6px 8px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 0.75rem; color: #64748b; cursor: pointer;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i data-lucide="command" style="width: 13px; height: 13px;"></i>
            <span class="sidebar-text-label" style="display: ${isCollapsed ? 'none' : 'inline-block'};">Search...</span>
          </div>
          <kbd class="sidebar-text-label" style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 3px; padding: 0 4px; font-size: 0.625rem; font-family: var(--font-mono); display: ${isCollapsed ? 'none' : 'inline-block'};">⌘K</kbd>
        </button>
      </div>

    </aside>
  `;
}

// Client-Side DOM Toggle (Zero Network Calls, Instant Animation)
window.toggleSidebar = function() {
  const current = store.get('sidebarCollapsed') ?? (localStorage.getItem('sidebar_collapsed') === 'true');
  const next = !current;
  store.set('sidebarCollapsed', next);
  localStorage.setItem('sidebar_collapsed', String(next));

  const sidebarEl = document.getElementById('main-sidebar');
  if (sidebarEl) {
    sidebarEl.style.width = next ? '64px' : '224px';
    sidebarEl.classList.toggle('collapsed', next);

    const labels = sidebarEl.querySelectorAll('.sidebar-text-label');
    labels.forEach(lbl => {
      lbl.style.display = next ? 'none' : 'inline-block';
    });

    const toggleIcon = document.getElementById('sidebar-toggle-icon');
    if (toggleIcon) {
      toggleIcon.setAttribute('data-lucide', next ? 'panel-left-open' : 'panel-left-close');
      toggleIcon.style.transform = next ? 'rotate(180deg)' : 'rotate(0deg)';
      if (window.lucide) window.lucide.createIcons();
    }
  }
};
```

---

## 8. The Signature Dark-Blue Gradient Hero Card System

The **Signature Hero Card** (`.panel-hero-card`) represents the visual centerpiece of OutreachOS. It anchors every primary workspace panel (Campaigns, Databases, Sender Pools, Templates, Settings) with an executive dark card framed by a 3-stop linear gradient, a radial glow flare, and high-contrast white pill action buttons.

### 8.1 The Exact CSS Rules (`src/styles/components.css`)

```css
/* ============================================================
   ONIX GLOBAL HERO CARD (Subtle Dark Blue Gradient System)
   ============================================================ */
.panel-hero-card {
  position: relative;
  background: linear-gradient(135deg, #0b1120 0%, #111827 42%, #172554 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px 28px;
  color: #ffffff;
  box-shadow: 0 12px 32px -4px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(29, 78, 216, 0.15);
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 20px;
  overflow: hidden;
}

/* Ambient Radial Glow in Top Right Corner */
.panel-hero-card::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -10%;
  width: 340px;
  height: 340px;
  background: radial-gradient(circle, rgba(29, 78, 216, 0.2) 0%, rgba(29, 78, 216, 0) 70%);
  pointer-events: none;
  border-radius: 50%;
}

/* Uppercase Micro Pill Badge */
.panel-hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 700;
  color: #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

/* Montserrat 800 ExtraBold Heading */
.panel-hero-title {
  font-family: var(--font-heading, 'Montserrat', sans-serif);
  font-size: 1.625rem; /* 26px */
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.025em;
  line-height: 1.2;
  margin: 0;
}

/* Inter 400 Subtitle Description */
.panel-hero-desc {
  font-family: var(--font-sans, 'Inter', sans-serif);
  font-size: 0.875rem; /* 14px */
  color: #94a3b8;
  font-weight: 400;
  margin: 6px 0 0 0;
  line-height: 1.45;
  max-width: 680px;
}

/* Action Button Container */
.panel-hero-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  align-self: center;
}

/* Pure White Pill CTA Button */
.panel-hero-card .btn-hero-primary,
.panel-hero-card .btn-primary {
  background: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #ffffff !important;
  border-radius: 9999px !important;
  font-weight: 700 !important;
  padding: 8px 18px !important;
  font-size: 13px !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2) !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
  text-decoration: none !important;
}

.panel-hero-card .btn-hero-primary:hover,
.panel-hero-card .btn-primary:hover {
  background: #f1f5f9 !important;
  color: #0f172a !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25) !important;
}

/* Translucent Glass Secondary Button */
.panel-hero-card .btn-hero-secondary,
.panel-hero-card .btn-secondary,
.panel-hero-card .btn-outline,
.panel-hero-card .btn-ghost {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 9999px !important;
  font-weight: 600 !important;
  padding: 8px 16px !important;
  font-size: 13px !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 6px !important;
  cursor: pointer !important;
  backdrop-filter: blur(8px) !important;
  transition: all 0.15s ease !important;
  text-decoration: none !important;
}

.panel-hero-card .btn-hero-secondary:hover,
.panel-hero-card .btn-secondary:hover,
.panel-hero-card .btn-outline:hover,
.panel-hero-card .btn-ghost:hover {
  background: rgba(255, 255, 255, 0.18) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
  transform: translateY(-1px) !important;
}
```

### 8.2 Standardized Workspace Layout Integration (`src/layouts/workspace-layout.js`)

```javascript
export function renderWorkspaceLayout({ title, description, primaryActionHtml = '', toolbarHtml = '', contentHtml, tagBadge = '', hideHero = false }) {
  const autoTag = tagBadge || (
    title.includes('Campaign') ? 'Workflows' :
    title.includes('Database') ? 'Datasets' :
    title.includes('Sender') ? 'Infrastructure' :
    title.includes('Template') ? 'Templates' :
    title.includes('Prompt') ? 'Prompts' :
    title.includes('Settings') ? 'Settings' : 'OutreachOS'
  );

  return `
    <div class="animate-page-enter" style="display: flex; flex-direction: column; gap: 1.25rem; width: 100%;">
      
      <!-- Signature Hero Card System -->
      ${!hideHero ? `
        <div class="panel-hero-card">
          <div style="flex: 1; max-width: 720px; z-index: 1;">
            <div class="panel-hero-tag">
              <i data-lucide="sparkles" style="width: 12px; height: 12px;"></i>
              <span>${autoTag}</span>
            </div>
            <h1 class="panel-hero-title">${title}</h1>
            ${description ? `<p class="panel-hero-desc">${description}</p>` : ''}
          </div>

          ${primaryActionHtml ? `
            <div class="panel-hero-actions" style="z-index: 1;">
              ${primaryActionHtml}
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Main Panel Body -->
      <div>
        ${contentHtml}
      </div>
    </div>
  `;
}
```

---

## 9. Nested Settings Navigation System

When opening Settings, OutreachOS switches from a simple card stack to a **2-Pane Split Architecture**:
- A dedicated **Left Configuration Sub-navigation Sidebar** (`250px` width) with pill tab buttons and status counter badges.
- A **Right Scrollable Content Canvas** displaying 2-column balanced form cards.

### 9.1 The Settings CSS Rules (`src/styles/components.css`)

```css
/* Settings 2-Pane Container */
.settings-container {
  display: flex;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  min-height: 620px;
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05);
}

/* Left Sub-navigation Sidebar */
.settings-sidebar {
  width: 250px;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  padding: 20px 14px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.settings-nav-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Tab Button */
.settings-nav-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 10px;
  padding: 10px 14px;
  border: 1px solid transparent;
  cursor: pointer;
  background: transparent;
  color: #475569;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: left;
}

.settings-nav-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

/* Active Onyx Tab State */
.settings-nav-btn.active {
  background: #0f172a !important;
  color: #ffffff !important;
  border-color: #0f172a;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.18);
}

.settings-nav-btn.active i {
  color: #ffffff !important;
}

/* Pill Count Badge inside Tab */
.settings-nav-badge {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 9999px;
  background: #e2e8f0;
  color: #475569;
}

.settings-nav-btn.active .settings-nav-badge {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

/* Right Content Canvas */
.settings-content-pane {
  flex: 1;
  padding: 28px 36px;
  overflow-y: auto;
  background: #ffffff;
}

/* Settings Form Card */
.settings-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px 28px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  margin-bottom: 24px;
  transition: border-color 0.15s ease;
}

.settings-card:hover {
  border-color: #cbd5e1;
}

.settings-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.settings-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #475569;
  text-transform: uppercase;
}

.settings-input {
  height: 42px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 13.5px;
  font-weight: 500;
  padding: 0 14px;
  color: #0f172a;
  outline: none;
  transition: all 0.15s ease;
  width: 100%;
}

.settings-input:focus {
  background: #ffffff;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}
```

### 9.2 Settings Tab Switching Logic (`src/views/settings/settings-view.js`)

```javascript
window.switchSettingsTab = function(tab) {
  window.__settingsTab = tab; // 'org' | 'ai' | 'team'
  window.refreshView();
};
```

---

## 10. Spotlight Command Center (`⌘K` Palette)

The Command Center provides instant spotlight search across all campaigns, lead databases, sender pools, templates, and routes.

### 10.1 Keybinding Listeners (`src/components/command-palette/command-palette.js`)

```javascript
document.addEventListener('keydown', (e) => {
  // Listen for Ctrl+K or Cmd+K
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (document.getElementById('cmd-palette-root')) {
      window.closeCommandPalette();
    } else {
      window.openCommandPalette();
    }
  }

  // Close on Escape key
  if (e.key === 'Escape' && document.getElementById('cmd-palette-root')) {
    window.closeCommandPalette();
  }
});
```

### 10.2 Command Center Template & DOM Injection

```javascript
export function renderCommandPaletteModal() {
  return `
    <div id="cmd-palette-backdrop" style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: var(--z-modal); display: flex; align-items: flex-start; justify-content: center; padding-top: 100px;" onclick="window.closeCommandPalette(event)">
      <div class="animate-fade-in" style="width: 100%; max-width: 540px; background: #ffffff; border: 1px solid #d1d5db; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.25);" onclick="event.stopPropagation()">
        
        <!-- Search Header -->
        <div style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">
          <i data-lucide="search" style="width: 18px; height: 18px; color: #1e1e1e;"></i>
          <input
            id="cmd-search-input"
            type="text"
            placeholder="Type a command or search workspace..."
            style="flex: 1; font-size: 15px; background: none; border: none; color: #111827; outline: none;"
            oninput="window.handleCommandSearch(this.value)"
            autofocus
          />
          <kbd style="background: #f4f5f7; border: 1px solid #d1d5db; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-family: var(--font-mono); color: #6b7280;">ESC</kbd>
        </div>

        <!-- Filterable Results List -->
        <div id="cmd-results-list" style="max-height: 320px; overflow-y: auto; padding: 8px;">
          ${renderDefaultCommandItems()}
        </div>
      </div>
    </div>
  `;
}
```

---

## 11. Card Architecture, Containers & Module Hierarchy

OutreachOS organizes all data within a strict 3-tier card hierarchy:

### 11.1 The 3 Card Archetypes

1. **Standard Data Card (`.card`)**:
   - `background: #ffffff;`
   - `border: 1px solid #e5e7eb;`
   - `border-radius: 16px;`
   - `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);`
   - Hover state subtly transitions border color: `color-mix(in srgb, var(--border) 60%, var(--foreground) 40%)`.
2. **Interactive Module Card (`.card-module`)**:
   - Features higher elevation on hover: `transform: translateY(-2px); box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);`.
3. **Hero Card (`.panel-hero-card`)**:
   - Dark blue gradient with radial glow flare.

### 11.2 KPI Card 4-Grid Implementation (`src/views/dashboard/dashboard-view.js`)

```html
<div class="grid grid-cols-4 gap-4">
  <div class="card" style="padding: 1.25rem;">
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
      <span style="font-size: 0.8125rem; font-weight: 500; color: #6b7280;">Outbound Dispatched</span>
      <i data-lucide="send" style="width: 16px; height: 16px; color: #2563eb;"></i>
    </div>
    <div style="font-size: 1.625rem; font-weight: 800; color: #111827; letter-spacing: -0.02em;">
      1,248
    </div>
    <p style="font-size: 0.75rem; color: #6b7280; margin: 0.25rem 0 0 0;">Across all campaigns</p>
  </div>
</div>
```

---

## 12. Button Primitives & Micro-Interaction Physics

Every interactive button in OutreachOS provides **tactile physical feedback**:
- On press (`:active`), elements scale down to `0.95`.
- On hover, internal icons pop slightly to `scale(1.05)`.
- All buttons use pill geometry (`border-radius: 9999px`).

### 12.1 Button Styling Rules (`src/styles/components.css`)

```css
/* Base Button Engine */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 9999px;
  font-family: var(--font-family-body);
  font-weight: 700;
  font-size: 0.875rem;
  line-height: 1;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid transparent;
  outline: none;
  white-space: nowrap;
  user-select: none;
  box-sizing: border-box;
}

/* Micro-Motion Feedback */
.btn:active:not(:disabled) {
  transform: scale(0.95);
}

.btn:hover i {
  transform: scale(1.05);
  transition: transform 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* Focus Ring */
.btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #1d4ed8;
}

/* Variant 1: Primary Onyx */
.btn-primary,
.btn-default {
  background: #1e1e1e !important;
  color: #ffffff !important;
  border: 1px solid #1e1e1e !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
}

.btn-primary:hover:not(:disabled) {
  background: #111111 !important;
  border-color: #111111 !important;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22) !important;
}

/* Variant 2: Secondary Light */
.btn-secondary {
  background: #f4f5f7 !important;
  color: #1e1e1e !important;
  border: 1px solid #e5e7eb !important;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb !important;
  color: #111111 !important;
}

/* Variant 3: Outline White */
.btn-outline {
  border: 1px solid #e5e7eb !important;
  background: #ffffff !important;
  color: #1e1e1e !important;
}

.btn-outline:hover:not(:disabled) {
  background: #f4f5f7 !important;
  border-color: #d1d5db !important;
}

/* Variant 4: Ghost */
.btn-ghost {
  background: transparent !important;
  color: #374151 !important;
}

.btn-ghost:hover:not(:disabled) {
  background: #f4f5f7 !important;
  color: #111827 !important;
}

/* Variant 5: Destructive */
.btn-destructive,
.btn-danger {
  background: #ef4444 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.18) !important;
}
```

---

## 13. Modal Dialog Architecture & Spring Animation

Modals are rendered dynamically through a single global state container (`src/components/modal/modal-manager.js`).

### 13.1 Key Modals Features
1. **Backdrop Blur**: `rgba(0, 0, 0, 0.7)` with `backdrop-filter: blur(4px)`.
2. **Spring Physics**: Opens with `@keyframes modalSpring` (scales from `0.92` to `1.0`).
3. **Tri-Zone Layout**:
   - Header with bold Montserrat title and close `X` button.
   - Body with vertical auto-overflow and slim custom scrollbars.
   - Sticky Bottom Footer with Cancel and Primary Submit buttons.
4. **Keyboard Accessibility**: Closes instantly when pressing `Escape`.

```css
@keyframes modalSpring {
  0%   { opacity: 0; transform: scale(0.92) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-card-container {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 32px 64px rgba(15, 23, 42, 0.18);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 2.5rem);
  overflow: hidden;
  position: relative;
  width: 100%;
  animation: modalSpring 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.modal-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-card-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 14px 24px;
  border-top: 1px solid #e2e8f0;
  gap: 10px;
  background: #fafafa;
}
```

---

## 14. Pure Vector SVG Infographics & Dashboard Visualizations

OutreachOS **avoids external charting libraries (like Chart.js or Recharts)** which cause slow bundle load times and blurry canvas rendering on Retina screens. All charts are rendered as **pure, responsive SVG vectors** (`src/components/charts/svg-charts.js`).

---

### 14.1 Dual Cubic Bézier Multi-Curve Trend Chart

Renders volume trends across two series (e.g. Dispatched vs Delivered) with smooth cubic Bézier splines, soft gradient area fills, and interactive node tooltips.

```javascript
// Mathematical Cubic Bézier Path Formula
function getBezierPath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}
```

---

### 14.2 180° Speedometer Deliverability Dial Gauge

A 180-degree semi-circular dial gauge indicating deliverability score and sender reputation.

```
          . - ~ ~ ~ - .
      . '   /       \   ' .
    /      /  NEEDLE  \     \
   |  0%  |     /\     | 100%|
   \      \    /  \    /     /
     ' .   ' . HUB . '   . '
```

```javascript
export function renderSpeedometerGauge({
  score = 98.4,
  maxScore = 100,
  size = 230,
  id = `speedo-${Math.random().toString(36).substr(2, 6)}`
}) {
  const clampedScore = Math.max(0, Math.min(maxScore, Number(score) || 0));
  const pct = clampedScore / maxScore; // 0 to 1

  const cx = size / 2;
  const cy = size * 0.58;
  const radius = size * 0.42;
  const strokeWidth = 14;
  const needleAngle = -180 + pct * 180;
  const arcLength = Math.PI * radius;

  return `
    <svg width="${size}" height="${Math.round(size * 0.62)}" viewBox="0 0 ${size} ${Math.round(size * 0.62)}">
      <defs>
        <linearGradient id="${id}-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="45%" stop-color="#f59e0b" />
          <stop offset="75%" stop-color="#3b82f6" />
          <stop offset="100%" stop-color="#10b981" />
        </linearGradient>
      </defs>

      <!-- Gray Track -->
      <path d="M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}"
        fill="none" stroke="#f1f5f9" stroke-width="${strokeWidth}" stroke-linecap="round" />

      <!-- Active Gradient Arc -->
      <path d="M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}"
        fill="none" stroke="url(#${id}-grad)" stroke-width="${strokeWidth}" stroke-linecap="round"
        stroke-dasharray="${arcLength}" stroke-dashoffset="${arcLength * (1 - pct)}" />

      <!-- Needle Pointer -->
      <g transform="rotate(${needleAngle} ${cx} ${cy})">
        <line x1="${cx}" y1="${cy}" x2="${cx + radius - 6}" y2="${cy}" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
        <circle cx="${cx + radius - 6}" cy="${cy}" r="3" fill="#10b981" />
      </g>

      <!-- Center Metallic Pivot -->
      <circle cx="${cx}" cy="${cy}" r="8" fill="#0f172a" stroke="#ffffff" stroke-width="2.5" />
    </svg>
  `;
}
```

---

### 14.3 Horizontal Step-Down Conversion Funnel

Calculates pipeline conversion drop-off across 5 stages:
1. **Targeted Contacts** (`100%`)
2. **Dispatched & Delivered** (`98%`)
3. **Opened Inboxes** (`60%`)
4. **Replies Received** (`22%`)
5. **Opportunities Booked** (`8%`)

```html
<div style="width: 100%; height: 9px; background: #f1f5f9; border-radius: 6px; overflow: hidden;">
  <div style="width: 60%; height: 100%; background: #2563eb; border-radius: 6px; transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);"></div>
</div>
```

---

### 14.4 Sentiment & Delivery Outcome Donut Ring

Generates SVG annular slice arcs using pure trigonometry:
```javascript
const x1 = cx + radius * Math.cos((Math.PI * startAngle) / 180);
const y1 = cy + radius * Math.sin((Math.PI * startAngle) / 180);
const x2 = cx + radius * Math.cos((Math.PI * endAngle) / 180);
const y2 = cy + radius * Math.sin((Math.PI * endAngle) / 180);
const dPath = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
```

---

### 14.5 High-Precision Circular Progress Rings

Features SVG gradient strokes, rounded caps, and ambient drop-shadow glow:

```javascript
export function renderProgressRing({ pct = 0, size = 80, strokeWidth = 7 }) {
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - pct / 100);

  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform: rotate(-90deg);">
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#f1f5f9" stroke-width="${strokeWidth}" />
      <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#1e1e1e" stroke-width="${strokeWidth}"
        stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" />
    </svg>
  `;
}
```

---

## 15. Motion Design, Easing Physics & Animation Suite

OutreachOS relies on a single **signature physics curve** for UI motion:  
`cubic-bezier(0.16, 1, 0.3, 1)` (Linear spring deceleration without jarring oscillations).

### 15.1 Complete Keyframes (`src/styles/animations.css`)

```css
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes modalSpring {
  0%   { opacity: 0; transform: scale(0.92) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

@keyframes runningLoader {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

.animate-page-enter {
  animation: pageEnter 380ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in {
  animation: fadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-modal-spring {
  animation: modalSpring 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

---

## 16. How to Replicate This Design System in a New SaaS Product

To replicate the OutreachOS aesthetic in a sister product:

1. **Step 1: Install the Typography**:
   Import `Montserrat:wght@600;700;800;900`, `Inter:wght@400;500;600;700`, and `JetBrains Mono:wght@400;500;600`.
2. **Step 2: Copy Global CSS Tokens**:
   Copy `:root` variables from Section 2 into `src/styles/variables.css`.
3. **Step 3: Apply the 5px Ultra-Slim Scrollbar**:
   Add the webkit scrollbar rules from Section 4 to your root reset stylesheet.
4. **Step 4: Scaffold the Floating Island Shell**:
   Use `renderAppLayout()` to position the floating Topbar (`56px`, radius `16px`) and Sidebar (`224px`/`64px`, radius `20px`).
5. **Step 5: Enforce the Signature Hero Card**:
   Apply `.panel-hero-card` with `linear-gradient(135deg, #0b1120 0%, #111827 42%, #172554 100%)` and radial flare `::before` at the top of every primary view.
6. **Step 6: Enforce Button Physics**:
   Use `.btn` with full pill geometry (`9999px`) and active press scale `0.95`.
7. **Step 7: Render Pure SVG Infographics**:
   Use `svg-charts.js` for dual-curve cubic Bézier trends, speedometer dials, and funnels. Zero chart dependencies required.
