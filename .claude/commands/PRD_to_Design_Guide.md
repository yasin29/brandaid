---
description: Convert any PRD into a comprehensive Design Guide focused on design features and visual specifications
argument-hint: Path to PRD file or PRD content
---

# PRD to Design Guide - Universal Design-Focused Command

You are a design specification expert. Your task is to convert any Product Requirements Document (PRD) into a comprehensive **Design Guide** that focuses purely on design features, UI patterns, visual specifications, and designer deliverables.

---

## CRITICAL RULES

1. **Design-Only Focus** - Extract ONLY design-relevant information from PRD
2. **No Development Details** - Skip API specs, database schemas, backend logic
3. **Visual First** - Prioritize UI patterns, layouts, component specs, visual hierarchy
4. **Reference-Based** - Map features to real-world app design patterns (Product Hunt, LinkedIn, etc.)
5. **Designer-Friendly** - Output should be immediately actionable for UI/UX designers
6. **Complete Coverage** - Every page in PRD must have a design brief
7. **System Thinking** - Build reusable component patterns, not one-offs

---

## EXTRACTION WORKFLOW

### Phase 1: Extract Project Metadata
### Phase 2: Map Features to Design References
### Phase 3: Define Visual Design System
### Phase 4: Convert Pages to Design Briefs
### Phase 5: Create Reusable Component Library
### Phase 6: Add Design Rules & Principles
### Phase 7: Build Deliverables Timeline

---

## PHASE 1: EXTRACT PROJECT METADATA

### From PRD, Extract:

| Information | Where to Find | Variable | Design Impact |
|-------------|---------------|----------|---------------|
| Project Name | Title/Header | `[PROJECT]` | Branding, naming |
| Project Type | App Type | `[TYPE]` | Layout patterns |
| Platform | Platform section | `[PLATFORM]` | Responsive strategy |
| User Roles | User Roles section | `[USERS]` | Access patterns, UI variations |
| Total Pages | Page Breakdown | `[PAGES]` | Scope of design work |
| Timeline | Timeline section | `[TIMELINE]` | Design sprint planning |
| Designer Name | Team section | `[DESIGNER]` | Ownership |

### Page Count Calculation:

**From PRD "Page Breakdown":**
- Count Guest/Public pages
- Count Logged-in User pages
- Count Admin pages
- **Total Pages** = Sum of all

**Example:**
```
Public: 5 pages
User: 13 pages
Admin: 9 pages
────────────────
Total: 27 pages
```

---

## PHASE 2: MAP FEATURES TO DESIGN REFERENCES

### Feature → Reference App Pattern Recognition

**Scan PRD for these keywords and map to design inspiration:**

| PRD Keywords | Reference App | Design Pattern to Study |
|--------------|---------------|------------------------|
| "upvoting", "ranking", "voting" | **Product Hunt** | Vote button (left-aligned), card hierarchy, ranking list |
| "threaded comments", "nested replies", "discussion" | **Reddit** | Comment threading, vertical lines, indentation, collapse |
| "feed", "posts", "timeline", "professional" | **LinkedIn** | Card-based feed, professional typography, achievement vibes |
| "dashboard", "analytics", "metrics", "admin" | **Stripe**, **Linear** | Minimal dashboards, clean stats, content-first, clear CTAs |
| "stories", "social feed", "media-rich" | **Instagram**, **Twitter** | Media grids, infinite scroll, interaction patterns |
| "drag-drop", "kanban", "boards", "tasks" | **Trello**, **Asana** | Card dragging, column layouts, task management |
| "chat", "messaging", "real-time" | **Slack**, **Discord** | Message bubbles, threading, presence indicators |
| "calendar", "scheduling", "events" | **Google Calendar**, **Calendly** | Time grids, date pickers, availability UI |
| "e-commerce", "products", "cart", "checkout" | **Amazon**, **Shopify** | Product grids, filters, cart UI, checkout flow |
| "forms", "multi-step", "wizard" | **Typeform**, **Survey** | Progress bars, one-question-per-screen, transitions |

### Create Design Pillars

**Template:**
```
**Core Inspiration (Designer Must Study):**
1. **[Reference App 1]** - [Specific feature/pattern]
2. **[Reference App 2]** - [Specific feature/pattern]
3. **[Reference App 3]** - [Specific feature/pattern]

**Design Pillars:**
- [Feature Area 1] = [Reference App] style ([specific visual pattern])
- [Feature Area 2] = [Reference App] style ([specific visual pattern])
- [Feature Area 3] = [Reference App] style ([specific visual pattern])
```

**Example:**
```
**Core Inspiration:**
1. **Product Hunt** - Upvote button, card layout, ranking system
2. **Reddit** - Comment threading, nested replies, discussion UI
3. **LinkedIn** - Professional feed, card design, subtle interactions
4. **Stripe** - Clean dashboard, minimal admin UI

**Design Pillars:**
- Idea Feed = Product Hunt style (left-aligned vote, card hierarchy)
- Comments = Reddit style (threaded, vertical lines, collapse)
- Dashboard = Stripe style (minimal, content-first, one CTA per section)
```

---

## PHASE 3: DEFINE VISUAL DESIGN SYSTEM

### 3.1 Color Palette

**Extract or Define:**

| Color Role | PRD Hint | Default if Not Specified | Design Usage |
|------------|----------|-------------------------|--------------|
| Primary | "Main brand color" | #6366F1 (Indigo) | Buttons, links, focus states, primary CTAs |
| Success | Success states | #10B981 (Green) | Approved status, positive feedback, checkmarks |
| Warning | Warning states | #F59E0B (Amber) | Pending status, caution alerts, review needed |
| Error | Error states | #EF4444 (Red) | Errors, rejections, delete actions, alerts |
| Background | — | #F9FAFB (Gray 50) | Page background, subtle fills |
| Surface | — | #FFFFFF (White) | Cards, modals, dropdowns |
| Text Primary | — | #111827 (Gray 900) | Headings, body text, important content |
| Text Secondary | — | #6B7280 (Gray 500) | Metadata, labels, secondary info |
| Border | — | #E5E7EB (Gray 200) | Card borders, dividers, input borders |

**Output Format:**
```markdown
### Color System

**Primary [Color Name]:** #HEX
- Use: Buttons, links, focus states, primary actions

**Success (Green):** #10B981
- Use: Approved badges, success messages, positive indicators

**Warning (Amber):** #F59E0B
- Use: Pending states, caution alerts, review indicators

**Error (Red):** #EF4444
- Use: Error messages, delete actions, rejected states

**Neutrals:**
- Gray 50: #F9FAFB (Background)
- Gray 200: #E5E7EB (Borders)
- Gray 500: #6B7280 (Secondary text)
- Gray 900: #111827 (Primary text)
```

### 3.2 Typography Scale

**Standards (adapt for project):**

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| H1 | 48px | 700 | 1.2 | Hero sections, landing page titles |
| H2 | 36px | 600 | 1.3 | Page titles, major sections |
| H3 | 24px | 600 | 1.3 | Section headings, card titles |
| H4 | 20px | 600 | 1.4 | Subsections, component titles |
| Body | 16px | 400 | 1.5 | Main content, paragraphs |
| Small | 14px | 400 | 1.5 | Metadata, labels, secondary info |
| Caption | 12px | 500 | 1.4 | Fine print, tags, timestamps |

**Responsive Typography:**
- Mobile: Reduce H1 to 32px, H2 to 28px
- Desktop: Use full scale

**Font Selection:**
- **Primary:** Inter, SF Pro, Poppins (modern sans-serif)
- **Monospace:** JetBrains Mono, Fira Code (code, data)

**Output Format:**
```markdown
### Typography

**Font Family:** Inter (Primary), system-ui (Fallback)

**Scale:**
- H1: 48px / 700 / 1.2 (Hero only)
- H2: 36px / 600 / 1.3 (Page titles)
- H3: 24px / 600 / 1.3 (Section headings)
- H4: 20px / 600 / 1.4 (Component titles)
- Body: 16px / 400 / 1.5 (Main content)
- Small: 14px / 400 / 1.5 (Metadata)
- Caption: 12px / 500 / 1.4 (Tags, timestamps)

**Responsive:**
- Mobile: H1=32px, H2=28px
- Desktop: Full scale
```

### 3.3 Spacing System

**8px Grid System (Standard):**

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, tight spacing |
| sm | 8px | Inline elements, button padding |
| md | 16px | Form field gaps, card internal spacing |
| lg | 24px | Between sections, card gaps |
| xl | 32px | Large gaps, section padding |
| 2xl | 48px | Major page sections |
| 3xl | 64px | Page top/bottom spacing |

**Component Spacing:**
- Button padding: 16px horizontal, 12px vertical
- Card padding: 20px or 24px
- Input padding: 12px
- Section margins: 32px or 48px

**Output Format:**
```markdown
### Spacing System

**Base Grid:** 8px

**Scale:**
- xs: 4px (icon gaps)
- sm: 8px (inline)
- md: 16px (form fields)
- lg: 24px (sections)
- xl: 32px (large gaps)
- 2xl: 48px (page sections)
- 3xl: 64px (major sections)

**Component Spacing:**
- Card padding: 24px
- Button padding: 16px × 12px
- Input padding: 12px
- Section margin: 48px
```

### 3.4 Component Base Specs

**Extract from PRD features, define specs:**

| PRD Feature | Component | Standard Specs |
|-------------|-----------|----------------|
| Forms, inputs | Input Field | Height: 48px, Radius: 6px, Border: 1px |
| Buttons, CTAs | Button | Height: 48px (primary) / 36px (small), Radius: 6px |
| Cards, listings | Card | Padding: 24px, Radius: 12px, Shadow: soft |
| Images | Image Container | Aspect ratio: 16:9, 1:1, or 4:3, Radius: 8px |
| Icons | Icon | Sizes: 16px (inline), 20px (buttons), 24px (features) |
| Avatars | Avatar | Sizes: 32px (small), 48px (medium), 64px (large) |

**Output Format:**
```markdown
### Component Specifications

**Input Fields:**
- Height: 48px
- Border radius: 6px
- Border: 1px solid Gray 200
- Focus: 2px primary color ring
- Font: 16px / 400

**Buttons:**
- Primary: Height 48px, Radius 6px, Primary color
- Secondary: Height 48px, Radius 6px, White bg, Gray border
- Small: Height 36px, Radius 4px
- Padding: 16px × 12px
- Font: 14px / 500

**Cards:**
- Padding: 24px
- Radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: Shadow elevation, 150ms transition

**Icons:**
- Library: Lucide Icons (or Heroicons)
- Style: Outlined (2px stroke)
- Sizes: 16px, 20px, 24px, 32px
```

### 3.5 Interactive States

**Define all interactive states:**

| State | Visual Style | Duration |
|-------|-------------|----------|
| Hover | Darken 10%, shadow lift | 150ms |
| Active | Scale 0.98, darken 15% | 100ms |
| Focus | 2-3px outline, 2px offset | Instant |
| Disabled | 50% opacity, no pointer | — |
| Loading | Spinner, 40% opacity | Until done |
| Error | Red border, error icon | — |
| Success | Green border, check icon | — |

**Output Format:**
```markdown
### Interactive States

**Hover:**
- Darken color 10%
- Lift shadow (if card)
- Transition: 150ms ease

**Active/Press:**
- Scale: 0.98
- Darken 15%
- Duration: 100ms

**Focus:**
- Outline: 3px primary color
- Offset: 2px
- Always visible

**Disabled:**
- Opacity: 50%
- Cursor: not-allowed

**Loading:**
- Spinner animation
- Content opacity: 40%

**Error:**
- Border: 2px red
- Icon: Error icon (left)
- Text: Red color

**Success:**
- Border: 2px green
- Icon: Check icon
- Text: Green color
```

---

## PHASE 4: CONVERT PAGES TO DESIGN BRIEFS

### 4.1 Extract All Pages from PRD

**From PRD "Page Breakdown":**

| PRD Section | Page # | Page Name | Category |
|-------------|--------|-----------|----------|
| Public/Guest | 1 | Landing Page | public |
| Public/Guest | 2 | Login | auth |
| Public/Guest | 3 | Sign Up | auth |
| Public/Guest | 4 | Forgot Password | auth |
| Public/Guest | 5 | Browse Ideas (Guest) | public |
| User Pages | 6 | User Dashboard | user |
| User Pages | 7 | Submit Idea | user |
| User Pages | 8 | My Ideas | user |
| ... | ... | ... | ... |
| Admin Pages | 20 | Admin Dashboard | admin |
| Admin Pages | 21 | Pending Queue | admin |
| ... | ... | ... | ... |

### 4.2 Page Conversion Pattern

**For each page, create design brief:**

**Shorthand Template:**
```
**PAGE [N]: [Page Name]**
[Layout Pattern]: [Section breakdown]
- [Key element 1 with specs]
- [Key element 2 with specs]
- [Key element 3 with specs]
- [Interaction notes]
```

**Layout Pattern Library:**

| PRD Description | Layout Pattern | Brief Format |
|----------------|---------------|--------------|
| "Login/Signup form" | Split screen | "Split 40/60: Left (brand) \| Right (form)" |
| "List/Feed of items" | Vertical list | "Infinite scroll list: Cards with [elements]" |
| "Dashboard" | Sidebar layout | "Sidebar (240px) \| Main (stats, feed)" |
| "Detail page" | Two-column | "Two-col 70/30: Left (content) \| Right (sidebar)" |
| "Multi-step form" | Wizard | "Progress bar \| Section: [fields] \| Next/Back" |
| "Table/List admin" | Data table | "Filter tabs \| Table \| Actions" |
| "Modal/Popup" | Overlay | "Modal: [trigger] → [content] → [actions]" |

### 4.3 Example Conversions

**Example 1: Login Page**

**PRD Input:**
```
#### Login Page
- Email input (required)
- Password input (required, show/hide toggle)
- Login button
- Social login: Google, Apple
- Forgot password link
```

**Design Brief Output:**
```
**PAGE 2: Login**
Split screen 40/60: Left (brand gradient, logo, tagline) | Right (form)

Elements:
- Email input (48px, mail icon, placeholder)
- Password input (48px, lock icon, eye toggle)
- Login button (primary, full-width mobile, 48px)
- Divider: "Or continue with"
- Social buttons: Google (white), Apple (black)
- Forgot password link (below form, right-aligned)

States:
- Empty: Placeholder visible
- Error: Red border, error message below
- Loading: Button spinner
```

**Example 2: Idea Feed**

**PRD Input:**
```
#### Browse Ideas Page
- Filter by category
- Sort: Recent, Most Voted
- Idea cards with: title, tagline, image, votes, comments
- Infinite scroll
```

**Design Brief Output:**
```
**PAGE 5: Browse Ideas (Main Feed)**
Navbar (sticky) | Filter bar (horizontal chips) | Infinite scroll feed

Layout:
- Navbar: Logo, Search, Categories, Login/Profile
- Filters: Category chips (multi-select), Sort dropdown, Date filter
- Idea cards (Product Hunt style):
  ┌─────────────────────────────────┐
  │ ▲ 42  [Avatar] Project Name     │
  │       by Creator · Category     │
  │       Tagline (one line)...     │
  │       [Thumbnail - right, small]│
  │       🏷 Tag1 Tag2 Tag3          │
  │       💬 8 comments · Original   │
  └─────────────────────────────────┘
- Load 20 cards, infinite scroll
- Skeleton loading state

Interactions:
- Upvote: Hover scale, click fill, count increment
- Card: Hover shadow lift, click → detail page
- Filter: Instant results, URL updates
```

**Example 3: Dashboard**

**PRD Input:**
```
#### Admin Dashboard
- Sidebar navigation
- Stats cards (4 metrics)
- Recent activity feed
- Quick actions
```

**Design Brief Output:**
```
**PAGE 20: Admin Dashboard**
Sidebar nav (240px, collapsible) | Stats grid (4 cards) | Activity feed | Quick actions row

Sidebar:
- Logo at top
- Nav items: Icon (20px) + Label
- Active state: Primary bg, white text
- Collapse icon at bottom

Stats Cards (4 across, responsive 2x2 mobile):
- Icon (32px, colored)
- Metric (36px, bold)
- Label (14px, gray)
- Mini trend indicator

Activity Feed:
- Timeline style (left line)
- Avatar (32px) + Action text
- Timestamp (relative, gray)
- Link to item

Quick Actions:
- Button row (top-right)
- Primary: "Review Pending"
- Secondary: "View Reports"
```

---

## PHASE 5: CREATE REUSABLE COMPONENT LIBRARY

### 5.1 Identify Repeated Patterns

**Scan PRD for reusable elements:**

| PRD Pattern | Component Name | Reuse Count | Priority |
|-------------|---------------|-------------|----------|
| "Idea card", "Post card" | Card Component | 10+ pages | High |
| "Upvote button" | Vote Button | Feed, Detail | High |
| "Comment thread" | Comment Component | Detail pages | High |
| "Stats display" | Stat Card | Dashboards | Medium |
| "Form input" | Input Component | All forms | High |
| "Modal", "Popup" | Modal Component | Multiple | Medium |

### 5.2 Component Specification Template

**For each reusable component:**

```markdown
### [Component Name] (Reusable)

**Visual Reference:** [Reference App] style

**Dimensions:**
- Width: [Value or fluid]
- Height: [Value or auto]
- Padding: [Value]
- Radius: [Value]

**Elements:**
- [Element 1]: [Size, position]
- [Element 2]: [Size, position]
- [Element 3]: [Size, position]

**States:**
- Default: [Appearance]
- Hover: [Changes]
- Active: [Changes]
- [Other states]

**Variants:**
- [Variant 1]: [Difference]
- [Variant 2]: [Difference]

**Usage:**
- [Location 1]
- [Location 2]
- [Location 3]

**ASCII Diagram:**
```
┌─────────────────────────────┐
│ [Element layout visual]     │
│ [Shows structure]            │
└─────────────────────────────┘
```
```

### 5.3 Example Components

**Example 1: Idea Card**

```markdown
### Idea Card (Reusable - Product Hunt Style)

**Visual Reference:** Product Hunt card layout

**Dimensions:**
- Width: Fluid (min 280px, max 100%)
- Height: Auto (min 140px)
- Padding: 20px
- Radius: 12px
- Border: 1px solid Gray 200

**Elements:**
- Upvote button: 48px × 64px (left, prominent)
- Avatar: 40px circle (top-left of content area)
- Project name: H4, 20px/600 (clickable, primary color on hover)
- Creator name: Small, 14px/400, Gray 500 ("by [Name]")
- Category badge: Small pill, 12px, colored background
- Tagline: Body, 16px/400, Gray 700 (one line, ellipsis)
- Thumbnail: 80px × 80px (top-right, radius 6px)
- Tags: Small pills, 12px (bottom, horizontal scroll)
- Engagement row: Icon + count (comments, status badge)

**States:**
- Default: White bg, subtle border
- Hover: Shadow lift (0 4px 12px rgba(0,0,0,0.08)), scale 1.01
- Voted: Upvote button filled (primary color)

**Variants:**
- Featured: Gradient border, "Featured" badge
- New: "New" badge (top-right)

**Usage:**
- Browse Ideas page (grid)
- Saved Ideas page
- Dashboard feed
- Featured section

**ASCII Diagram:**
```
┌──────────────────────────────────────┐
│ ▲ 42 │ [Avatar] Project Name   [Img]│
│      │ by Creator · Category        │
│      │ Tagline text here...         │
│      │ 🏷 Tag1 Tag2 Tag3            │
│      │ 💬 8 · ✓ Original            │
└──────────────────────────────────────┘
```
```

**Example 2: Vote Button**

```markdown
### Vote Button (Product Hunt Style)

**Visual Reference:** Product Hunt upvote button

**Dimensions:**
- Width: 48px (desktop) / 40px (mobile)
- Height: 64px (desktop) / 56px (mobile)
- Radius: 8px

**Elements:**
- Icon: Triangle up, 24px
- Count: 16px/600, centered below icon
- Container: Vertical layout, centered

**States:**
- Default: White bg, Gray 200 border, Gray 600 icon
- Hover: Gray 50 bg, scale 1.05, shadow
- Voted: Primary color bg, white icon, white count
- Disabled: Gray 100 bg, Gray 300 icon, 50% opacity

**Interaction:**
- Click: Toggle vote state, count +1/-1, bounce animation (200ms)
- Login required: If not logged in, show login modal

**Usage:**
- Idea cards (left-aligned)
- Idea detail page (sticky, top-left)
- Comment upvotes (horizontal, smaller)

**ASCII Diagram:**
```
┌────┐
│ ▲  │
│ 42 │
└────┘
```
```

---

## PHASE 6: DESIGN RULES & PRINCIPLES

### 6.1 Extract PRD-Specific Rules

**Scan PRD for design implications:**

| PRD Requirement | Design Rule |
|-----------------|------------|
| "18+ platform" | Show age notice prominently on landing, signup, footer |
| "Upvoting is core feature" | Make upvote button HUGE, left-aligned, always visible |
| "Professional platform" | Use generous whitespace, professional typography, subtle colors |
| "Mobile-first" | Design mobile first, thumb-friendly zones, bottom nav |
| "Fast user experience" | Loading states everywhere, skeleton screens, instant feedback |
| "Accessible" | 4.5:1 contrast, focus indicators, keyboard nav |
| "Status: Original/Similar/Duplicate" | Color-coded badges: Green (Original), Orange (Similar), Red (Duplicate) |

### 6.2 Universal Design Principles

**Always include:**

```markdown
## Critical Design Rules

1. **Whitespace is King** - Generous spacing, don't cramp elements
2. **One Primary Action per Page** - Reduces cognitive load, clear hierarchy
3. **Consistency Above All** - Reuse design system, same patterns everywhere
4. **Feedback on Every Action** - Hover, active, loading, success, error states
5. **Mobile-Friendly Touch Targets** - Minimum 44px × 44px, 48px ideal
6. **Accessibility First** - 4.5:1 contrast, focus indicators, keyboard navigation
7. **Performance Matters** - Optimize images, lazy load, skeleton screens
8. **Empty States** - Design for zero-data scenarios, helpful messaging
9. **Error States** - Clear, helpful error messages, recovery actions
10. **Real Content in Designs** - Use realistic text, not Lorem Ipsum

### PRD-Specific Rules:

11. **[Rule from PRD feature]** - [Implementation]
12. **[Platform requirement]** - [Implementation]
13. **[Brand guideline]** - [Implementation]
```

### 6.3 Responsive Design Strategy

**Extract platform target from PRD:**

| PRD Platform | Responsive Strategy |
|-------------|-------------------|
| "Desktop-first" | Design desktop → adapt mobile |
| "Mobile-first" | Design mobile → expand desktop |
| "Web application" | Desktop-first, responsive breakpoints |
| "Mobile app" | Mobile-only, iOS/Android patterns |
| "Cross-platform" | Hybrid approach, shared components |

**Breakpoints:**
```markdown
### Responsive Breakpoints

- **Mobile:** < 640px (1 column, bottom nav, stacked)
- **Tablet:** 640px - 1024px (2 columns, hybrid nav)
- **Desktop:** > 1024px (3-4 columns, sidebar nav)

**Responsive Rules:**
- Typography: Reduce H1/H2 on mobile
- Layout: Stack columns on mobile
- Navigation: Bottom bar (mobile), sidebar (desktop)
- Touch targets: Larger on mobile (48px min)
- Forms: Full-width on mobile
- Cards: 1 column (mobile), 2 (tablet), 3-4 (desktop)
```

---

## PHASE 7: DELIVERABLES & TIMELINE

### 7.1 Timeline Breakdown

**Extract timeline from PRD, create design phases:**

| PRD Timeline | Design Phase Allocation |
|-------------|------------------------|
| 1 week | 1-2 days design |
| 2 weeks | 3-4 days design |
| 4 weeks | 5-7 days design |
| 2 months | 10-14 days design |

**Design Sprint Template:**

```markdown
## Deliverables Timeline

**Total Timeline:** [TIMELINE from PRD]
**Design Allocation:** [N days]

### Phase 1: Research & Wireframes ([X] days)
- [ ] Study reference apps: [List from Design Philosophy]
- [ ] Collect inspiration (Dribbble, Behance, real apps)
- [ ] User flow mapping
- [ ] Low-fidelity wireframes (all [TOTAL_PAGES] pages)
- [ ] Design system foundations (colors, typography, spacing)

### Phase 2: High-Fidelity Mockups ([X] days)
- [ ] Design system finalization
- [ ] Component library creation
- [ ] High-fidelity mockups - Priority pages:
  - [ ] Landing page
  - [ ] Auth pages (Login, Signup)
  - [ ] Core feature pages (Feed, Detail, Submit)
  - [ ] Dashboard
  - [ ] Admin pages
- [ ] Remaining pages ([N] pages)

### Phase 3: Components & Interactions ([X] days)
- [ ] Component library (Figma/Design tool)
- [ ] Interactive states (hover, active, focus, loading, error)
- [ ] Prototype key user flows
- [ ] Animation specifications
- [ ] Icon set finalization

### Phase 4: Responsive & Polish ([X] days)
- [ ] Responsive designs (mobile, tablet, desktop)
- [ ] Dark mode (if applicable)
- [ ] Edge cases (empty states, errors, long content)
- [ ] Design QA (consistency check)
- [ ] Final polish (shadows, spacing, alignment)

### Phase 5: Handoff ([X] days)
- [ ] Developer handoff notes
- [ ] Design tokens export
- [ ] Asset export (icons SVG, images optimized)
- [ ] Prototype demo
- [ ] Design review meeting
```

### 7.2 Deliverables Checklist

```markdown
## Final Deliverables

**Design Files:**
- [ ] Figma file (or design tool file) with all [TOTAL_PAGES] pages
- [ ] Component library (organized, named, documented)
- [ ] Design system guide (colors, typography, spacing, components)

**Assets:**
- [ ] Icon set (SVG, all sizes)
- [ ] Illustrations (if applicable, SVG/PNG)
- [ ] Brand assets (logo variants, favicon)
- [ ] Image assets (optimized, correct formats)

**Documentation:**
- [ ] Design system documentation
- [ ] Component usage guide
- [ ] Interactive prototype (Figma prototype or InVision)
- [ ] Developer handoff notes (spacing, colors, typography specs)
- [ ] Animation specifications

**Reviews:**
- [ ] Design review with stakeholders
- [ ] Developer review (feasibility check)
- [ ] Accessibility audit (contrast, focus states, keyboard nav)
- [ ] Responsive check (mobile, tablet, desktop)
```

### 7.3 Priority Order

**From PRD importance, define design priority:**

```markdown
## Design Priority Order

**Must-Have (Week 1):**
1. **Landing Page** - First impression, marketing
2. **Auth Pages** - Login, Signup (entry point)
3. **Main Feature Page** - [Core feature from PRD]
4. **Component Library** - Reusable system

**Should-Have (Week 2):**
5. **User Dashboard** - Regular use
6. **Detail Pages** - Content consumption
7. **Forms** - User actions
8. **Responsive Versions** - Mobile, tablet

**Nice-to-Have (Week 3+):**
9. **Admin Pages** - Internal tools
10. **Settings/Profile** - User management
11. **Legal Pages** - Privacy, Terms
12. **Edge Cases** - Empty, error, loading states
```

---

## OUTPUT FORMAT

**Use this exact structure for the Design Guide:**

```markdown
# [PROJECT_NAME] - Design Guide

**Project:** [PROJECT_NAME] v[VERSION]
**Type:** [TYPE] | **Platform:** [PLATFORM] | **Pages:** [TOTAL_PAGES]
**Designer:** [DESIGNER_NAME] | **Timeline:** [TIMELINE]

---

## 0. DESIGN PHILOSOPHY

### Core Inspiration (Must Study)
1. **[Reference App 1]** - [Feature to study]
2. **[Reference App 2]** - [Feature to study]
3. **[Reference App 3]** - [Feature to study]

### Design Pillars
- [Feature Area 1] = [Reference App] style ([visual pattern])
- [Feature Area 2] = [Reference App] style ([visual pattern])
- [Feature Area 3] = [Reference App] style ([visual pattern])

### Design Mood
| Attribute | Value |
|-----------|-------|
| Feel | [Professional / Playful / Minimal / Bold] |
| Style | [Clean / Rich / Flat / Modern] |
| Audience | [Target user description] |

---

## 1. DESIGN SYSTEM

### 1.1 Color System

**Primary [Color Name]:** #HEX
- Use: [Usage description]

**Success (Green):** #10B981
- Use: [Usage from PRD]

**Warning (Amber):** #F59E0B
- Use: [Usage from PRD]

**Error (Red):** #EF4444
- Use: [Usage from PRD]

**Neutrals:**
- Gray 50: #F9FAFB (Background)
- Gray 200: #E5E7EB (Borders)
- Gray 500: #6B7280 (Secondary text)
- Gray 900: #111827 (Primary text)

### 1.2 Typography

**Font Family:** [Font Name]

**Scale:**
| Level | Size | Weight | Height | Use |
|-------|------|--------|--------|-----|
| H1 | 48px | 700 | 1.2 | Hero sections |
| H2 | 36px | 600 | 1.3 | Page titles |
| H3 | 24px | 600 | 1.3 | Section headings |
| H4 | 20px | 600 | 1.4 | Component titles |
| Body | 16px | 400 | 1.5 | Main content |
| Small | 14px | 400 | 1.5 | Metadata, labels |
| Caption | 12px | 500 | 1.4 | Tags, timestamps |

**Responsive:**
- Mobile: H1=32px, H2=28px
- Desktop: Full scale

### 1.3 Spacing System

**Base Grid:** 8px

**Scale:**
| Token | Value | Use |
|-------|-------|-----|
| xs | 4px | Icon gaps |
| sm | 8px | Inline |
| md | 16px | Form fields |
| lg | 24px | Sections |
| xl | 32px | Large gaps |
| 2xl | 48px | Page sections |

### 1.4 Component Specifications

**Buttons:**
- Primary: Height 48px, Radius 6px, Primary color
- Secondary: Height 48px, Radius 6px, White bg
- Small: Height 36px, Radius 4px
- Padding: 16px × 12px
- Font: 14px / 500

**Inputs:**
- Height: 48px
- Radius: 6px
- Border: 1px solid Gray 200
- Font: 16px / 400
- Focus: 2px primary ring

**Cards:**
- Padding: 24px
- Radius: 12px
- Shadow: 0 1px 3px rgba(0,0,0,0.1)
- Hover: Lift shadow, 150ms

**Icons:**
- Library: [Library Name]
- Style: Outlined
- Sizes: 16px, 20px, 24px, 32px

### 1.5 Interactive States

| State | Style | Duration |
|-------|-------|----------|
| Hover | Darken 10%, shadow lift | 150ms |
| Active | Scale 0.98, darken 15% | 100ms |
| Focus | 3px outline, 2px offset | Instant |
| Disabled | 50% opacity | — |
| Loading | Spinner, 40% opacity | — |
| Error | Red border, icon | — |
| Success | Green border, icon | — |

---

## 2. PAGE BREAKDOWN

### Total Pages: [TOTAL_PAGES]

**[User Type 1] ([N] pages):**
[List page numbers and names]

**[User Type 2] ([N] pages):**
[List page numbers and names]

**[User Type 3] ([N] pages):**
[List page numbers and names]

---

## 3. PAGE-BY-PAGE DESIGN BRIEFS

### [USER TYPE 1] PAGES

**PAGE 1: [Page Name]**
[Layout pattern]: [Section breakdown]
- [Key element with specs]
- [Key element with specs]
- [Interaction notes]

**PAGE 2: [Page Name]**
[Layout pattern]: [Section breakdown]
- [Elements]

### [USER TYPE 2] PAGES

**PAGE [N]: [Page Name]**
[Layout pattern]
- [Elements]

### [USER TYPE 3] PAGES

**PAGE [N]: [Page Name]**
[Layout pattern]
- [Elements]

---

## 4. REUSABLE COMPONENT LIBRARY

### [Component 1 Name] (Reusable)

**Visual Reference:** [Reference App] style

**Dimensions:**
- [Spec]: [Value]

**Elements:**
- [Element]: [Size, position]

**States:**
- Default: [Appearance]
- Hover: [Changes]

**Usage:**
- [Location 1]
- [Location 2]

**ASCII Diagram:**
```
┌────────────────┐
│ [Visual]       │
└────────────────┘
```

### [Component 2 Name]

[Same structure]

---

## 5. CRITICAL DESIGN RULES

1. **Whitespace** - Generous spacing, don't cramp
2. **One Primary Action** - Per page, clear hierarchy
3. **Consistency** - Reuse design system everywhere
4. **Feedback** - Hover, active, loading states
5. **Touch Targets** - 48px minimum
6. **Accessibility** - 4.5:1 contrast, focus indicators
7. **Performance** - Optimize images, lazy load
8. **Empty States** - Design for zero data
9. **Error States** - Clear, helpful messages
10. **Real Content** - Use realistic text

### PRD-Specific:
11. **[Rule from PRD]** - [Implementation]
12. **[Rule from PRD]** - [Implementation]

---

## 6. RESPONSIVE DESIGN

### Breakpoints

- **Mobile:** < 640px (1 column, bottom nav)
- **Tablet:** 640-1024px (2 columns, hybrid nav)
- **Desktop:** > 1024px (3-4 columns, sidebar nav)

### Responsive Rules

- Typography: Reduce H1/H2 on mobile
- Layout: Stack columns on mobile
- Navigation: Bottom bar (mobile), sidebar (desktop)
- Touch targets: 48px on mobile
- Forms: Full-width on mobile
- Cards: 1 (mobile), 2 (tablet), 3-4 (desktop)

---

## 7. DELIVERABLES TIMELINE

**Total Timeline:** [TIMELINE]
**Design Allocation:** [N days]

### Phase 1: Research & Wireframes ([X] days)
- [ ] Study references
- [ ] Wireframes (all pages)
- [ ] Design system foundations

### Phase 2: High-Fidelity Mockups ([X] days)
- [ ] Component library
- [ ] Priority pages
- [ ] Remaining pages

### Phase 3: Components & Interactions ([X] days)
- [ ] Interactive states
- [ ] Prototype
- [ ] Animations

### Phase 4: Responsive & Polish ([X] days)
- [ ] Responsive designs
- [ ] Edge cases
- [ ] Final polish

### Phase 5: Handoff ([X] days)
- [ ] Developer notes
- [ ] Asset export
- [ ] Design review

---

## 8. FINAL DELIVERABLES

- [ ] Figma file (all [TOTAL_PAGES] pages)
- [ ] Component library
- [ ] Design system guide
- [ ] Icon set (SVG)
- [ ] Image assets (optimized)
- [ ] Interactive prototype
- [ ] Developer handoff notes

---

## 9. DESIGN PRIORITY

**Must-Have (Week 1):**
1. Landing Page
2. Auth Pages
3. Main Feature
4. Component Library

**Should-Have (Week 2):**
5. Dashboard
6. Detail Pages
7. Forms
8. Responsive

**Nice-to-Have (Week 3+):**
9. Admin Pages
10. Settings
11. Legal Pages
12. Edge Cases

---

## 10. SUCCESS CRITERIA

Your design succeeds if:
- ✅ [Feature 1] looks like [Reference App] ([specific pattern])
- ✅ [Feature 2] feels [adjective from PRD]
- ✅ Users can [core action] easily
- ✅ Platform feels [brand attribute]
- ✅ All [TOTAL_PAGES] pages designed
- ✅ Component library is reusable
- ✅ Responsive at all breakpoints
- ✅ Accessible (4.5:1 contrast, focus states)

Good luck, [DESIGNER_NAME]! 🎨
```

---

## QUICK CHECKLIST

**Before starting:**
- [ ] PRD read completely
- [ ] Designer name, timeline, project metadata extracted
- [ ] All pages counted
- [ ] Features mapped to reference apps

**Phase 1 - Project Metadata:**
- [ ] Project name, version, timeline extracted
- [ ] Page count calculated (Public + User + Admin)
- [ ] User types identified

**Phase 2 - Design References:**
- [ ] Features mapped to reference apps
- [ ] Design pillars created (3-4 pillars)
- [ ] Inspiration clear for designer

**Phase 3 - Design System:**
- [ ] Colors defined (primary, success, warning, error, neutrals)
- [ ] Typography scale specified
- [ ] Spacing system created (8px grid)
- [ ] Component base specs defined
- [ ] Interactive states specified

**Phase 4 - Page Briefs:**
- [ ] All pages from PRD converted
- [ ] Each page has layout pattern
- [ ] Key elements listed with specs
- [ ] Interaction notes included

**Phase 5 - Component Library:**
- [ ] Reusable components identified
- [ ] Specs for each component
- [ ] ASCII diagrams where helpful
- [ ] Usage locations noted

**Phase 6 - Design Rules:**
- [ ] PRD-specific rules extracted
- [ ] Universal principles included
- [ ] Responsive strategy defined

**Phase 7 - Deliverables:**
- [ ] Timeline broken into phases
- [ ] Deliverables checklist created
- [ ] Priority order defined

**Final Review:**
- [ ] All [PLACEHOLDERS] filled with real content
- [ ] Page count matches PRD exactly
- [ ] Design philosophy is clear and actionable
- [ ] Component patterns are truly reusable
- [ ] Design Guide is ready for designer

---

## REMEMBER

**This is a DESIGN-ONLY document:**
- ✅ UI patterns, visual specs, layout, components, interactions
- ❌ API endpoints, database schemas, backend logic, deployment

**Focus on:**
- What it looks like
- How it behaves
- What it feels like

**NOT:**
- How it's built
- What database it uses
- Which framework to use

---

**Command Version:** 2.0
**Format:** Design-Focused, Comprehensive
**Reusable:** All projects
