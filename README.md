# CrossTech Collaboration OS

> **Enterprise-Grade Multi-Tenant RBAC Collaboration Operating System**  
> Engineered from the specifications in `brain.md` and styled strictly according to the **ONIX Executive Light-Mode** design system in `master_design.md`.

---

## 🏛️ 1. Multi-Tenant Organizational Hierarchy

CrossTech Collaboration OS implements a strict five-tier authorization hierarchy:

```
                         ┌──────────────────────────┐
                         │       Your Platform      │
                         │      Multi-Tenant SaaS   │
                         └────────────┬─────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
        Organization A          Organization B          Organization C
              │                       │                       │
       ┌──────┼──────┐          ┌─────┼─────┐          ┌─────┼─────┐
       │      │      │          │     │     │          │     │     │
     Tech  Product  Ops        Tech  Sales  Finance    HR  Engineering
       │
       ├──────────────┐
       │              │
     Frontend      Backend
       │              │
    Members        Members
```

### Key Architectural Tenets:
1. **Tenant Isolation**: Every resource table (`departments`, `teams`, `boards`, `tasks`, `channels`, `messages`, `audit_logs`) is scoped with `organization_id` and reinforced via Supabase PostgreSQL Row Level Security (RLS).
2. **Membership-Driven Roles (No Global Roles in Users)**: Roles are assigned per membership (`OrganizationMembership`), allowing users to have scoped privileges across organizations without privilege escalation.
3. **Scoped RBAC Roles**:
   - `PLATFORM_ADMIN`: Global platform superuser
   - `ORGANIZATION_OWNER`: Organization-wide superuser
   - `ORGANIZATION_ADMIN`: Organization administrator
   - `DEPARTMENT_MANAGER`: Scoped manager for a specific department and its sub-teams
   - `TEAM_LEAD`: Pod leader for sprints, tasks, and team channels
   - `TEAM_MEMBER`: Standard team contributor

---

## 🎨 2. ONIX Executive Design System & Tokens (`master_design.md`)

CrossTech Collaboration OS meticulously replicates the exact visual language, mathematical curves, and layout paradigms of the **ONIX Executive Light-Mode** design system:

- **Typography**:
  - Headings: `Montserrat` (800 ExtraBold, 700 Bold) with tight negative tracking (`-0.03em`)
  - Body & Data Tables: `Inter` (13.5px / 0.84375rem, `-0.011em` tracking)
  - Code & Identifiers: `JetBrains Mono`
- **Color Engine**:
  - Brand & Primary: Onyx Black (`#1e1e1e`, `#111827`, `#0f172a`)
  - Accent Highlight: Deep Sapphire Blue (`#1d4ed8` / `#2563eb`)
  - Canvas: Cool off-white (`#f8f9fa`) and pure white cards (`#ffffff`)
- **Macro Layout**:
  - **Floating Island Pattern**: Floating Topbar (`56px`, radius `16px`, margin `12px 16px 0 16px`) + Floating Collapsible Sidebar (`224px` <-> `64px`, radius `20px`) + Independent Scrollable Content Pane.
  - **Running Progress Loader**: Animated multi-stop gradient loader along the bottom edge of the topbar during state transitions.
  - **Universal 5px Ultra-Slim Scrollbars**: Minimalist pill thumb with zero layout shift.
- **Signature Dark-Blue Gradient Hero Card**:
  - `linear-gradient(135deg, #0b1120 0%, #111827 42%, #172554 100%)` with top-right radial glow flare (`rgba(29, 78, 216, 0.25)`), uppercase micro tag pill badge, pure white pill CTA button (`#ffffff`), and translucent glass secondary buttons.
- **Micro-Interaction Physics**:
  - Button press feedback (`:active { transform: scale(0.95); }`) and icon pop (`:hover i { transform: scale(1.05); }`).
- **Pure Vector SVG Visualizations**:
  - Dual Cubic Bézier trend charts (Dispatched vs Completed tasks).
  - 180° Speedometer sprint velocity and deliverability dial gauge.
  - High-precision circular progress rings.
- **Nested 2-Pane Settings**:
  - 250px left sub-navigation sidebar + right form canvas.
- **Spotlight Command Center (`⌘K`)**:
  - Fast keyboard-accessible modal search across all routes, departments, teams, and sprint tasks.

---

## 💾 3. Supabase Database Schema

The complete PostgreSQL migration script is provided in `supabase/schema.sql`. It includes:

1. `users` (ID, Clerk ID, email, name, avatar, status)
2. `organizations` (ID, name, slug, logo, created_by)
3. `organization_memberships` (user_id, organization_id, role, status)
4. `departments` (ID, organization_id, name, description, manager_id)
5. `department_memberships` (department_id, user_id, role)
6. `teams` (ID, organization_id, department_id, name, description, lead_id)
7. `team_memberships` (team_id, user_id, role)
8. `invitations` (ID, organization_id, department_id, team_id, email, role, token_hash, expires_at)
9. `boards` & `board_columns` (Kanban boards with customizable column positions and WIP limits)
10. `tasks` & `task_comments` (Tasks with priority matrix, assignees, fractional positions, comments)
11. `channels`, `channel_members` & `messages` (Real-time channels, DMs, threads)
12. `notifications` (User notification events, read status)
13. `audit_logs` (Immutable enterprise audit trail: WHO, WHAT, WHEN, WHERE)

### Applying Schema to Supabase:
1. Open your Supabase Dashboard: [https://app.supabase.com](https://app.supabase.com)
2. Go to the **SQL Editor**.
3. Paste the contents of [`supabase/schema.sql`](file:///s:/work/CrossTech-work/crosstech%20applications/Crosstech_collaboration_os/supabase/schema.sql) and click **Run**.

---

## 🔐 4. Clerk Authentication Integration

Authentication is powered by **Clerk**:
1. Sign-up, Sign-in, Session Management, and OAuth (Google, Microsoft, GitHub, SAML).
2. Configure keys in `.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. **Local RBAC Simulator**: When live keys are not configured, the app includes an interactive persona simulator in the topbar dropdown (switch between Chandan as Owner, Rahul/Priya as Dept Managers, and Vikram as Team Lead) to test permissions and features instantly without external dependencies!

---

## 🚀 5. Getting Started & Running Locally

### Prerequisites:
- Node.js `v18+` or `v20+` (tested on Node v24)
- npm `v9+`

### Installation:
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build:
```bash
npm run build
npm start
```

---

## 🗺️ 6. Application Routes

| Route | View | Description |
| :--- | :--- | :--- |
| `/` | **Overview Dashboard** | Executive KPI cards, pure SVG Bézier trend chart, speedometer velocity dial, department roster, live audit trail |
| `/departments` | **Departments Hierarchy** | Department cards, manager assignments, sub-teams lists, member counts |
| `/teams` | **Teams & Pods** | Cross-functional engineering & product teams, department filtering pills, team leads |
| `/kanban` | **Kanban Sprint Boards** | Drag-and-drop tasks, WIP limits, priority pills (Urgent, High, Medium, Low), comments thread |
| `/chat` | **Channels & Streams** | Org-wide channels, department channels, team streams, and real-time message composer |
| `/members` | **Members & RBAC Directory** | Member roster with role badges, department assignments, and pending invitations management |
| `/settings` | **Settings & Audit Trail** | 2-Pane nested settings for Organization profile, Supabase status, Clerk IdP, and full enterprise audit logs |
| `/invite/[token]` | **Invitation Acceptance** | Public token landing page for invited employees to set passwords and activate accounts |
| `/api/health` | **System Health API** | Status check for Supabase, Clerk, and system hierarchy |
