# Beads UI - UX Overhaul Design

## Overview

Complete visual overhaul of the Beads dashboard webapp with a GitHub/GitLab-inspired aesthetic: dense, professional, and data-heavy. Features a hybrid navigation system with collapsible sidebar and contextual top bar, using a neutral color palette with orange/amber accent.

## Design Principles

- **Dense but readable**: Maximize information density without sacrificing clarity
- **Professional aesthetic**: GitHub/GitLab style - clean, functional, developer-focused
- **Subtle accent**: Orange/amber (#f59e0b) for highlights, not overwhelming
- **Theme support**: Full light/dark mode toggle

---

## Section 1: Layout Structure

### Collapsible Sidebar (Left, 240px expanded / 64px collapsed)

```
┌──────────────────┐
│  ◆ Beads    [<]  │  ← Logo + collapse toggle
├──────────────────┤
│  ⌂ Dashboard     │
│  ☰ Issues        │
│  ⬡ Graph         │
├──────────────────┤
│  ─────────────   │
│  ⚙ Settings      │
│  ◐ Theme         │
└──────────────────┘
```

- Icons always visible, labels hide when collapsed
- Active item has amber left border + subtle background
- Collapse state persisted in localStorage

### Global Top Bar (Fixed, 48px height)

```
┌────────────────────────────────────────────────────────────────┐
│  [≡]  Beads Dashboard    │  🔍 Search (⌘K)  │  [+] New  │ 👤  │
└────────────────────────────────────────────────────────────────┘
```

- Hamburger toggles sidebar on mobile
- Command palette search (Cmd+K opens modal)
- Quick-create button always accessible
- User avatar/menu for settings

### Contextual Sub-header (Per-page, 40px)

```
┌────────────────────────────────────────────────────────────────┐
│  Dashboard  ›  Overview          [Last 7 days ▾]  [↻ Refresh] │
└────────────────────────────────────────────────────────────────┘
```

- Breadcrumb navigation on left
- Page-specific actions on right
- Sticky below top bar

---

## Section 2: Dashboard Page

### Header Bar
- Title "Dashboard" on left
- Date range selector (Today / 7 days / 30 days / Custom) on right
- Refresh button with last-updated timestamp

### Stats Row (4 cards, horizontal)

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ Open        │ In Progress │ Blocked     │ Closed      │
│ 12          │ 4           │ 2           │ 47          │
│ ↑ 3 this wk │ ↓ 1 this wk │ — unchanged │ ↑ 8 this wk │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

- Amber accent on "Blocked" card border (attention indicator)
- Subtle background tint matching status color
- Click navigates to filtered list

### Main Grid (2 columns)

**Left column (60%):**
- **Burndown Chart** - Clean line chart with grid, no 3D effects
- Area fill with 10% opacity amber
- Tooltip shows exact values on hover

**Right column (40%):**
- **Issues by Type** - Horizontal stacked bar (not pie)
- **Assignee Workload** - Horizontal bars, sorted by count
- GitHub-style muted colors with amber highlight for overloaded

### Bottom Section
- **Blocked Issues Table** - Compact rows showing:
  - Issue ID (monospace, clickable)
  - Title (truncated)
  - Blocked by (badge with count)
  - Days blocked (red if > 3 days)

---

## Section 3: List Page

### Filter Bar (horizontal, compact)

```
┌──────────────────────────────────────────────────────────────────┐
│ 🔍 Search issues...    [Status ▾] [Type ▾] [Priority ▾] [Assignee ▾] │
│                                                          Clear all │
└──────────────────────────────────────────────────────────────────┘
```

- Filters as dropdown pills, show active count badge
- Active filters shown as removable chips below
- "Clear all" link when filters active

### Table Design (GitHub Issues style)

```
┌────┬────────────────────────────────────┬────────┬──────┬─────────┐
│    │ Title                              │ Status │ Pri  │ Assignee│
├────┼────────────────────────────────────┼────────┼──────┼─────────┤
│ □  │ 🐛 Fix login timeout               │ ● Open │ P1   │ @james  │
│    │ #eg6 · 2 blockers · updated 2h ago │        │      │         │
├────┼────────────────────────────────────┼────────┼──────┼─────────┤
│ □  │ ✨ Add dark mode toggle            │ ◐ WIP  │ P2   │ —       │
│    │ #eg7 · auth · updated 1d ago       │        │      │         │
└────┴────────────────────────────────────┴────────┴──────┴─────────┘
```

- Checkbox column for bulk actions
- Type icon prefix (🐛 bug, ✨ feature, 📋 task)
- Two-line rows: Title on top, metadata below (ID, labels, relative time)
- Status as colored dot + text
- Priority as P0-P4 badge (P0/P1 in amber/red)
- Hover row highlights with subtle background
- Click row opens slide-out panel

### Bulk Actions Bar (appears when items selected)

```
┌──────────────────────────────────────────────────────────────────┐
│ 3 selected    [Set Status ▾] [Set Priority ▾] [Close] [Delete]  │
└──────────────────────────────────────────────────────────────────┘
```

### Pagination
- Bottom of table: "Showing 1-25 of 64" with page controls
- Or infinite scroll with "Load more" button

---

## Section 4: Dependency Graph

### Toolbar (horizontal, above canvas)

```
┌──────────────────────────────────────────────────────────────────┐
│ [Fit View] [Zoom +] [Zoom -]  │  Layout: [Force ▾]  │  Filter by │
│                               │                      │  status... │
└──────────────────────────────────────────────────────────────────┘
```

- Zoom controls grouped left
- Layout selector (Force-directed / Hierarchical / Radial)
- Optional status filter to reduce noise

### Node Design

```
    ┌─────────────────────┐
    │ ● #eg6              │  ← Status dot + ID
    │ Fix login timeout   │  ← Title (truncated)
    │ P1 · @james         │  ← Priority + Assignee
    └─────────────────────┘
```

- Rounded rectangle, 160px wide
- Left border colored by status (amber for blocked)
- White/dark background based on theme
- Subtle shadow on hover
- Click opens detail panel

### Edge Design
- Solid lines with arrowheads showing direction
- "Blocks" edges: source → target (arrow points to blocked issue)
- Muted gray by default, amber when highlighting blocked paths
- Animate on hover to show flow direction

### Interaction
- Drag nodes to reposition
- Double-click node to center and zoom
- Right-click context menu: "View Details", "Add Dependency", "Remove"
- Shift+click to multi-select nodes

### Legend (bottom-right corner)

```
┌─────────────────────┐
│ ● Open  ◐ WIP      │
│ ⊘ Blocked  ✓ Done  │
│ ──→ blocks         │
└─────────────────────┘
```

### Empty State
- "No dependencies yet" with illustration
- "Add dependencies from issue detail panel"

---

## Section 5: Issue Detail Panel

### Slide-out Sheet (right side, 480px wide)

```
┌────────────────────────────────────────────────────────┐
│  ← Back                                    [⋯] [✕]    │
├────────────────────────────────────────────────────────┤
│  🐛 #test-beads-eg6                                   │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Fix login timeout issue                          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Status        Priority       Assignee                │
│  [● Open ▾]    [P1 ▾]        [@james ▾]              │
│                                                        │
│  Type          Labels                                  │
│  [Bug ▾]       [auth] [urgent] [+]                    │
│                                                        │
├────────────────────────────────────────────────────────┤
│  Description                                    [Edit] │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Users are experiencing timeouts when...          │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
├────────────────────────────────────────────────────────┤
│  Dependencies                                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Blocked by (2)                                   │ │
│  │  └ #eg7 Add auth middleware        ● Open       │ │
│  │  └ #eg8 Update session handler     ◐ WIP        │ │
│  │                                                  │ │
│  │ Blocks (1)                                       │ │
│  │  └ #eg9 Deploy to production       ● Open       │ │
│  └──────────────────────────────────────────────────┘ │
│  [+ Add dependency]                                    │
│                                                        │
├────────────────────────────────────────────────────────┤
│  Activity                                              │
│  • Created 3 days ago                                  │
│  • Status changed to Open 2 days ago                   │
│  • Assigned to @james 1 day ago                        │
│                                                        │
├────────────────────────────────────────────────────────┤
│  [Close Issue]                        [Delete]        │
└────────────────────────────────────────────────────────┘
```

### Behavior
- Inline editing: Click any field to edit, auto-saves on blur
- Title is editable text field (larger font)
- Dropdowns for status/priority/type/assignee
- Labels as chips with [x] to remove, [+] to add
- Dependencies are clickable links (opens that issue)
- "Close Issue" prompts for optional reason
- "Delete" requires confirmation dialog
- [⋯] menu: "Copy ID", "Copy Link", "View in Graph"

---

## Section 6: Color System & Theming

### Base Palette

| Token | Light Theme | Dark Theme |
|-------|-------------|------------|
| Background | #ffffff | #0d1117 |
| Surface | #f6f8fa | #161b22 |
| Border | #d0d7de | #30363d |
| Text Primary | #1f2328 | #e6edf3 |
| Text Muted | #656d76 | #8b949e |

### Accent (Orange/Amber)

| Token | Value | Usage |
|-------|-------|-------|
| Primary | #f59e0b | Buttons, links, highlights |
| Hover | #d97706 | Button hover states |
| Subtle Light | #fef3c7 | Light theme backgrounds |
| Subtle Dark | #422006 | Dark theme backgrounds |

### Status Colors

| Status | Light BG | Dark BG | Dot/Badge |
|--------|----------|---------|-----------|
| Open | #ddf4ff | #1f3d5c | #2da44e (green) |
| In Progress | #fff8c5 | #3d3117 | #bf8700 (yellow) |
| Blocked | #ffebe9 | #3d1f20 | #f85149 (red) |
| Closed | #f6f8fa | #21262d | #8b949e (gray) |

### Priority Badges

| Priority | Style |
|----------|-------|
| P0 (Critical) | Red background, white text |
| P1 (High) | Amber background, dark text |
| P2 (Medium) | Gray background, dark text |
| P3 (Low) | Subtle gray, muted text |
| P4 (Backlog) | Ghost style, border only |

### Typography

| Element | Font | Weight |
|---------|------|--------|
| UI Text | Inter | 400 |
| Headings | Inter | 600 |
| Code/IDs | JetBrains Mono | 400 |

---

## Section 7: Implementation Approach

### Phase 1: Foundation
- Update Tailwind config with new color tokens
- Create CSS variables for theme switching
- Build core UI primitives (Badge, StatusDot, Card variants)
- Implement collapsible sidebar component

### Phase 2: Layout Shell
- New App layout with sidebar + top bar + content area
- Command palette (Cmd+K) with search
- Breadcrumb navigation
- Theme toggle in top bar

### Phase 3: Dashboard Overhaul
- Replace pie chart with horizontal stacked bar
- New stat cards with trend indicators
- Redesigned burndown chart (cleaner, area fill)
- Compact blocked issues table

### Phase 4: List Page Overhaul
- GitHub-style two-line table rows
- Dropdown filter pills with chips
- Bulk selection and actions bar
- Pagination controls

### Phase 5: Graph Page Overhaul
- New node design (rounded cards with status border)
- Improved edge styling with animations
- Toolbar with layout/zoom controls
- Legend overlay

### Phase 6: Detail Panel Overhaul
- Wider slide-out sheet (480px)
- Inline editable fields
- Dependencies section with links
- Activity timeline

### Phase 7: Polish
- Loading skeletons (not spinners)
- Empty states with illustrations
- Keyboard navigation
- Responsive breakpoints

---

## Technical Notes

### CSS Variables Structure

```css
:root {
  --color-bg: #ffffff;
  --color-surface: #f6f8fa;
  --color-border: #d0d7de;
  --color-text: #1f2328;
  --color-text-muted: #656d76;
  --color-accent: #f59e0b;
  --color-accent-hover: #d97706;
  /* ... status colors ... */
}

[data-theme="dark"] {
  --color-bg: #0d1117;
  --color-surface: #161b22;
  --color-border: #30363d;
  --color-text: #e6edf3;
  --color-text-muted: #8b949e;
  /* ... */
}
```

### Component Library

New/modified shadcn components needed:
- `StatusBadge` - Status dot + label
- `PriorityBadge` - P0-P4 styled badges
- `IssueCard` - Graph node component
- `FilterPill` - Dropdown filter with chip
- `CollapsibleSidebar` - Navigation sidebar
- `CommandPalette` - Cmd+K search modal

---

## Verification Checklist

- [ ] Theme toggle works in all views
- [ ] Sidebar collapses/expands smoothly
- [ ] Command palette opens with Cmd+K
- [ ] Dashboard stats link to filtered list
- [ ] List bulk actions work correctly
- [ ] Graph nodes are draggable
- [ ] Detail panel inline editing saves
- [ ] All colors match spec in both themes
- [ ] Loading skeletons appear during fetch
- [ ] Responsive layout works on tablet/mobile
