---
description: Convert PRD with Design Specs directly to AURA.build design prompts and auto-execute on AURA platform
argument-hint: "<prd-file> [--template <type>] [--auto-execute]"
---

# PRD to AURA Design Prompts & Auto-Execution

Converts a Product Requirements Document (PRD) with Design Specifications (Part 4) directly into structured design prompts for AURA.build and automatically executes them on the AURA platform with intelligent component/template selection.

---

## Workflow Position

```
PRD v2 (with Design Specs) → /prd-to-aura-prompts → Design Prompts → Auto-Execute on AURA.build
```

**Streamlined path:** Direct from PRD to AURA execution, bypassing Design Guide step.

---

## Usage

```bash
/prd-to-aura-prompts <prd-file>
/prd-to-aura-prompts <prd-file> --template saas
/prd-to-aura-prompts <prd-file> --auto-execute
/prd-to-aura-prompts <prd-file> --template fintech --auto-execute
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| `<prd-file>` | Path to PRD markdown file (preferably v2 with Part 4) | (required) |
| `--template <type>` | Template preset (saas, fintech, etc.) | auto-detect from PRD |
| `--auto-execute` | Automatically execute on AURA.build after generation | false (manual review) |
| `--output <file>` | Output file path for prompts | `./[project]-aura-prompts.md` |

---

## **HOW TO USE**

| Phase | Action |
|-------|--------|
| 1 | Extract project info and design specs from PRD (Part 4 if available) |
| 2 | Map PRD features to reference apps → select template preset |
| 3 | **[NEW]** Extract unique design system from PRD Part 4 (colors, typography, components) |
| 4 | Convert PRD pages to AURA design prompt briefs |
| 5 | Design all states: Empty, Loading, Loaded, Error, Offline |
| 6 | Add modals, dropdowns, notifications for each page |
| 7 | Include responsive variants (Mobile, Tablet, Desktop) |
| 8 | **[NEW]** If `--auto-execute`: Navigate to AURA.build, login, and execute prompts |
| 9 | **[NEW]** Auto-select matching components and templates from AURA library |

---

## **EXTRACTION TABLES**

### Project Info (From PRD)

| Extract | From PRD | Variable | Fallback |
|---------|----------|----------|----------|
| Project Name | Title / Part 1 Title | `[PROJECT_NAME]` | "Untitled Project" |
| Type | Part 1 Project Type | `[APP_TYPE]` | "Web Application" |
| Platform | Part 1 Platform | `[PLATFORM]` | "Web" |
| User Types | Part 1 User Types | `[USERS]` | "User, Admin" |
| Total Pages | Part 2 + Part 3 | `[PAGE_COUNT]` | Count from sections |
| Timeline | Part 1 Timeline | `[TIMELINE]` | "TBD" |

### **[NEW] Design Specs Extraction (From PRD Part 4)**

| Extract | From PRD Part 4 | Variable | Fallback |
|---------|----------------|----------|----------|
| Primary Color | 4.2 Color Palette → Primary Color | `[PRIMARY_COLOR]` | Template default |
| Secondary Color | 4.2 Color Palette → Secondary Color | `[SECONDARY_COLOR]` | Template default |
| Font Family | 4.3 Typography → Primary Font | `[FONT_FAMILY]` | Template default |
| Card Radius | 4.4 UI Components → Border Radius | `[CARD_RADIUS]` | Template default |
| Button Height | 4.4 UI Components → Button Height | `[BUTTON_HEIGHT]` | 48px |
| Layout Style | 4.5 Layout & Grid System | `[LAYOUT_STYLE]` | "Standard grid" |
| Icon Library | 4.4 UI Components → Icon Library | `[ICON_LIBRARY]` | "Lucide" |
| Design Style | 4.1 Design Philosophy | `[DESIGN_STYLE]` | Template default |

**Priority:** If PRD has Part 4 (Design Specifications), use those values. Otherwise, fall back to template presets.

### Feature → Reference Mapping

| PRD Feature | Reference App | Pattern | AURA Components |
|-------------|---------------|---------|-----------------|
| Upvoting, ranking | Product Hunt | Vote button, card layout | Card, Badge, Button |
| Threaded comments | Reddit | Nested replies, vertical lines | Comment Tree, Avatar |
| Professional feed | LinkedIn | Card-based, achievement feel | Feed Card, Profile Card |
| Dashboard, analytics | Stripe, Linear | Clean stats, minimal | Stat Card, Chart, Table |
| Stories, timeline | Instagram, Twitter | Social feed | Media Card, Timeline |
| Kanban, drag-drop | Trello, Asana | Task management | Kanban Board, Card |
| Chat, messaging | Slack, Discord | Message UI | Chat Bubble, Input |
| E-commerce, cart | Amazon, Shopify | Shopping flow | Product Card, Cart |
| Finance, budgeting | Mint, YNAB | Budget tracking | Budget Card, Graph |
| Health tracking | Apple Health, Fitbit | Wellness UI | Health Card, Progress |

### Template Presets (Fallback if no Part 4)

| Template | Design System | Best For | Keywords |
|----------|---------------|----------|----------|
| `saas` | Dark zinc-950, violet accent, Inter | SaaS, dashboards, B2B | dashboard, analytics, subscription |
| `ecommerce` | Light white, emerald accent, Plus Jakarta | Online stores, marketplaces | shop, cart, checkout, product |
| `landing` | Bold slate-900, amber accent, Poppins | Marketing, portfolios | landing, marketing, showcase |
| `social` | Modern zinc-900, pink accent, SF Pro | Social apps, community | feed, profile, posts, messaging |
| `mobile-app` | Minimal neutral-950, blue accent, System UI | Mobile-first apps | app, mobile, iOS, Android |
| `admin` | Functional gray-100, slate accent, Inter | Admin panels, CMS | admin, management, CRM |
| `fintech` | Secure slate-950, green accent, IBM Plex | Finance, banking | banking, payments, wallet, budget |
| `healthcare` | Clean blue-50, sky accent, Open Sans | Medical, wellness | health, medical, appointments |
| `education` | Engaging white, purple accent, Nunito | Learning platforms | courses, learning, students |

---

## **OUTPUT FORMAT**

### Frontmatter Template

```yaml
---
project_name: "[PROJECT_NAME]"
total_pages: [PAGE_COUNT]
template: "[TEMPLATE_TYPE]"
design_system:
  type: "[APP_TYPE]"
  style: "[DESIGN_STYLE]"
  industry: "[INDUSTRY]"
  primary_color: "[PRIMARY_HEX]"
  secondary_color: "[SECONDARY_HEX]"
  primary_bg: "[PRIMARY_BG]"
  accent: "[ACCENT_COLOR]"
  effects: "[EFFECTS]"
  font: "[FONT_FAMILY]"
  icons: "[ICON_LIBRARY]"
  card_radius: "[CARD_RADIUS]"
  button_height: "[BUTTON_HEIGHT]"
  layout_style: "[LAYOUT_STYLE]"
source_prd: "[PRD_FILE_PATH]"
has_design_specs: [true/false]
aura_execution:
  auto_execute: [true/false]
  components_selected: []
  templates_selected: []
---
```

### Design System Section

```markdown
# [PROJECT_NAME] AURA Design Prompts

AURA.build design prompts generated from [PROJECT_NAME] PRD (Version 2 with Design Specifications).

---

## Design System

[PROJECT_NAME] - [APP_TYPE] for [INDUSTRY].
Style: [DESIGN_STYLE] with [PRIMARY_HEX] primary and [SECONDARY_HEX] secondary.

**Design Differentiation:**
[If PRD Part 4 exists, include differentiation strategy from Part 4.1]

**Colors:**
- Primary: [PRIMARY_HEX] ([COLOR_NAME]) - buttons, links, CTAs
- Secondary: [SECONDARY_HEX] ([COLOR_NAME]) - hover states
- Primary Light: [PRIMARY_LIGHT_HEX] - light backgrounds
- Success: [SUCCESS_HEX] - confirmations, positive
- Warning: [WARNING_HEX] - caution states
- Error: [ERROR_HEX] - errors, destructive
- Background: [BG_HEX]
- Surface: [SURFACE_HEX]
- Text Primary: [TEXT_PRIMARY_HEX]
- Text Secondary: [TEXT_SECONDARY_HEX]
- Border: [BORDER_HEX]

**Typography:**
- Font Family: [FONT_FAMILY]
- Secondary Font: [SECONDARY_FONT] (if applicable)
- Monospace: [MONO_FONT]
- Scale: H1=[H1_SIZE]px, H2=[H2_SIZE]px, H3=[H3_SIZE]px, Body=[BODY_SIZE]px, Small=[SMALL_SIZE]px, Caption=[CAPTION_SIZE]px
- Weights: 400 (body), 500 (labels/buttons), 600 (headings), 700 (titles)

**Component Styling:**
- Card Radius: [CARD_RADIUS]px
- Button Radius: [BTN_RADIUS]px
- Input Radius: [INPUT_RADIUS]px
- Button Height: [BUTTON_HEIGHT]px
- Input Height: [INPUT_HEIGHT]px
- Shadow: [SHADOW_SPEC]
- Icons: [ICON_LIBRARY] ([ICON_STYLE] style, [STROKE_WIDTH]px stroke)

**Layout & Grid:**
- Grid System: [GRID_COLUMNS] columns
- Container Max Width: [MAX_WIDTH]px
- Column Gap: [COL_GAP]px
- Row Gap: [ROW_GAP]px
- Layout Style: [LAYOUT_STYLE]

**Spacing:**
- Base Unit: [BASE_UNIT]px
- xs: [XS]px, sm: [SM]px, md: [MD]px, lg: [LG]px, xl: [XL]px, 2xl: [2XL]px

**Unique Design Elements:**
[If PRD Part 4 exists, list unique visual elements that differentiate from competitors]
```

---

## **PAGE PROMPT TEMPLATE**

```markdown
---

## Page: [NN]-[page-slug]
name: [Page Name]
category: [auth/user/core/admin/marketing]
user_type: [User Type from PRD]
aura_components: [List of AURA components to use]
aura_templates: [AURA template if applicable]

### SCREEN OVERVIEW
Create a [page type] page for "[PROJECT_NAME]" - [brief description from PRD].

Purpose:
- [Purpose 1 from PRD]
- [Purpose 2 from PRD]

### LAYOUT INSTRUCTIONS
**OVERALL LAYOUT:**
- Pattern: [Layout pattern from PRD Part 4.5 if available]
- Grid: [Grid specification]
- Mobile: [Mobile behavior from PRD Part 4.7]
- Tablet: [Tablet behavior from PRD Part 4.7]
- Desktop: [Desktop behavior from PRD Part 4.7]

**[SECTION 1 NAME]:**
- [Element 1 from PRD Part 2/3]
- [Element 2]
- Component: [AURA component name]

**[SECTION 2 NAME]:**
- [Element 1]
- [Element 2]
- Component: [AURA component name]

### KEY FEATURES
- [Feature 1 from PRD]
- [Feature 2 from PRD]
- Empty state: [Description from PRD + CTA]
- Loading state: [Skeleton/Spinner from PRD Part 4.6]
- Error state: [Error handling from PRD]
- Interactive states: [From PRD Part 4.6]

### MAIN ACTIONS
| Action | Trigger | Behavior | Component |
|--------|---------|----------|-----------|
| [Action 1] | [Button/Click/etc.] | [Result: modal, navigation, toast] | [AURA component] |
| [Modal trigger] | [Button click] | Open [Modal Name] modal | Modal |
| [Dropdown trigger] | [Click element] | Show [Dropdown type] | Dropdown |
| [Success action] | [After submit] | Toast: "[Message]" | Toast |

### DESIGN SPECIFICATIONS
- Primary Color: [PRIMARY_HEX] for CTAs and active states
- Typography: [FONT_FAMILY] with scale from design system
- Icons: [ICON_LIBRARY] ([ICON_STYLE] style)
- Shadows: [SHADOW_SPEC] on interactive elements
- Border Radius: [CARD_RADIUS]px for cards, [BTN_RADIUS]px for buttons
- Spacing: [SPACING_SPEC] between sections

### ACCESSIBILITY (From PRD Part 4.9)
- Color contrast: [CONTRAST_RATIO from PRD]
- Keyboard navigation: [KEYBOARD_NAV from PRD]
- Touch targets: [TOUCH_TARGET_SIZE from PRD]
- Screen reader: [ARIA labels, semantic HTML]
```

---

## **[NEW] AURA.BUILD AUTO-EXECUTION WORKFLOW**

When `--auto-execute` flag is used:

### Step 1: Navigate to AURA.build

```
Use Playwright MCP tools:
1. Navigate to https://www.aura.build/
2. Take screenshot to check login state
3. If not logged in:
   - Ask user: "AURA.build requires login. Please provide credentials or login manually."
   - Wait for user to provide credentials or confirm manual login
   - If credentials provided: Use Playwright to login
   - If manual login: Wait for user confirmation
4. Once logged in, proceed to Step 2
```

### Step 2: Check AURA Project Setup

```
1. Navigate to AURA dashboard/projects
2. Check if project already exists
3. If not:
   - Create new project with [PROJECT_NAME]
   - Set project type to [APP_TYPE]
   - Configure design system settings
```

### Step 3: Input Design System

```
For each design prompt page:
1. Navigate to AURA prompt input area
2. Paste the complete page prompt
3. Include design system specifications
4. Set model selection to best available (GPT-4, Claude, etc.)
```

### Step 4: **[CRITICAL] Intelligent Component Selection**

```
For each page prompt:
1. Navigate to AURA Components library
2. Search components using keywords from page features:
   - Extract keywords from page "KEY FEATURES" and "LAYOUT INSTRUCTIONS"
   - Examples: "card", "button", "form", "table", "chart", "navigation"
3. For each keyword:
   - Use Playwright to search component library
   - Evaluate search results:
     ✓ IF component matches PRD requirements perfectly:
       → Select component, add to page
     ✗ IF component is generic and doesn't match unique design:
       → Skip component, rely on prompt description
4. Only select components that:
   - Match the unique design style from PRD Part 4
   - Fit the specific layout requirements
   - Support the color/typography specifications
5. If no perfect match found:
   - Skip component selection
   - Let AURA generate from prompt description only
```

### Step 5: **[CRITICAL] Intelligent Template Selection**

```
For each page prompt:
1. Navigate to AURA Templates library
2. Search templates using:
   - Page category (auth, dashboard, landing, etc.)
   - App type keywords
   - Industry keywords
3. Evaluate each template result:
   ✓ IF template matches:
     - Layout structure from PRD Part 4.5
     - Design style from PRD Part 4.1
     - Component arrangement from PRD Part 2/3
     - Visual uniqueness requirements
     → Select template as starting point
   ✗ IF template is generic or doesn't align with PRD:
     - Produces generic output
     - Conflicts with unique design direction
     - Misses key PRD requirements
     → Skip template completely
     → Generate from scratch using prompt only
4. **Prefer no template over wrong template**
5. Document decision: "Template [name] selected" or "No template - generating from prompt"
```

### Step 6: Generate and Review

```
1. Click "Generate" on AURA.build
2. Wait for generation to complete
3. Take screenshot of result
4. Compare with PRD requirements:
   - Colors match Part 4.2?
   - Typography matches Part 4.3?
   - Layout matches Part 4.5?
   - Components match Part 2/3?
5. If major mismatches:
   - Refine prompt
   - Regenerate
6. Once satisfactory:
   - Save page design
   - Move to next page
```

### Step 7: Iterate Through All Pages

```
Repeat Steps 3-6 for:
1. All auth pages (login, signup, etc.)
2. All user pages (dashboard, profile, etc.)
3. All core feature pages
4. All admin pages (if applicable)
5. All modals
6. All overlays (dropdowns, toasts)
```

### Step 8: Final Report

```
Generate execution report:
- Pages generated: [N] / [TOTAL]
- Components selected: [List]
- Templates used: [List] or "None - generated from prompts"
- Components skipped: [List] with reasons
- Templates skipped: [List] with reasons
- Adjustments made: [List of refinements]
- Screenshots saved: [Paths]
- AURA project link: [URL]
```

---

## **COMPONENT & TEMPLATE SELECTION RULES**

### Selection Criteria (MUST ALL BE TRUE)

| Criterion | Check | Action if False |
|-----------|-------|-----------------|
| **Design Match** | Component/template matches PRD Part 4 design style | Skip - use prompt only |
| **Layout Alignment** | Component/template fits PRD Part 4.5 layout structure | Skip - use prompt only |
| **Color Compatibility** | Component/template supports PRD Part 4.2 colors | Skip - use prompt only |
| **Feature Coverage** | Component/template includes PRD Part 2/3 features | Skip - use prompt only |
| **Uniqueness** | Component/template supports differentiation (Part 4.1) | Skip - use prompt only |

### When to SKIP Components/Templates

```
❌ SKIP if:
1. Component is too generic (basic card when PRD requires unique style)
2. Template layout conflicts with PRD Part 4.5 specifications
3. Component hardcodes colors that clash with PRD Part 4.2
4. Template produces "cookie-cutter" output not aligned with PRD
5. Component missing key features from PRD Part 2/3
6. Template requires significant modifications to match PRD
7. When in doubt - better to generate from prompt than use wrong component

✓ SELECT if:
1. Component perfectly matches PRD design specifications
2. Template aligns with PRD layout and structure
3. Component is highly customizable to PRD specs
4. Template serves as perfect starting point with minor tweaks
5. Component/template accelerates development without compromising uniqueness
```

### Component Search Keywords (Auto-Generated from PRD)

```
Extract from PRD Part 2/3:
- Page type → "dashboard", "landing", "form", "table", "feed"
- Features → "upvote", "comment", "chart", "stats", "calendar"
- UI elements → "card", "button", "modal", "dropdown", "navigation"
- Interactions → "drag-drop", "infinite-scroll", "filter", "search"

Use these as search queries in AURA Components library
```

---

## **FULL FLOW DESIGN**

### Screen Types

| Screen Type | Description | Variants | AURA Components |
|-------------|-------------|----------|-----------------|
| List/Browse | Grid or list of items | Empty, Loading, Loaded, Filtered | Card Grid, List, Skeleton |
| Detail | Single item view | Default, Editing, Read-only | Detail Card, Tabs, Button |
| Form | Data entry | New, Edit, Review | Form, Input, Select, Button |
| Dashboard | Overview with stats | Default, Loading | Stat Card, Chart, Table |
| Settings | Configuration options | Sections, Nested | Form, Toggle, Select |

### Screen States (Design All)

| State | Description | Elements | AURA Component |
|-------|-------------|----------|----------------|
| Empty | No data yet | Illustration, message, CTA button | Empty State |
| Loading | Fetching data | Skeleton cards or spinner | Skeleton, Spinner |
| Loaded | Data displayed | Full content | [Content components] |
| Error | Failed to load | Error message, retry button | Alert, Button |
| Offline | No connection | Offline indicator, cached data | Banner, Badge |
| Partial | Some data loaded | Mixed skeleton + content | Skeleton + Content |

### Overlay Components

| Type | Trigger | Size | Close Method | AURA Component |
|------|---------|------|--------------|----------------|
| Modal | Button click | S/M/L/Fullscreen | X, Outside click, ESC | Modal, Dialog |
| Drawer | Menu tap | 280px / 80% | Swipe, X, Outside | Drawer, Sheet |
| Bottom Sheet | Action tap | Auto height | Swipe down, X | Bottom Sheet |
| Dropdown | Click trigger | Auto | Outside click | Dropdown, Popover |
| Toast | Action complete | Auto width | Auto-dismiss, X | Toast, Snackbar |

---

## **MODAL PROMPT TEMPLATES**

[Same as original PRD-TO-DESIGN-PROMPTS.md - Confirmation, Form, Info, Success modals]

---

## **DROPDOWN TEMPLATES**

[Same as original PRD-TO-DESIGN-PROMPTS.md - User Menu, Notifications, Filter, Select dropdowns]

---

## **NOTIFICATION COMPONENTS**

### Toast Notifications

| Type | Position | Duration | Style | Icon | AURA Component |
|------|----------|----------|-------|------|----------------|
| Success | Top-right | 3s auto | Green accent | Check circle | Toast (success) |
| Error | Top-right | 5s manual | Red accent | X circle | Toast (error) |
| Warning | Top-right | 4s auto | Amber accent | Alert triangle | Toast (warning) |
| Info | Top-right | 4s auto | Blue accent | Info circle | Toast (info) |

---

## **CONVERSION PROCESS**

### Step 1: Extract Project Info
```
From PRD Part 1:
- Title → [PROJECT_NAME]
- App type → [APP_TYPE]
- Industry/audience → [INDUSTRY]
- Page count → Count Part 2 + Part 3 pages
```

### Step 2: **[NEW] Extract Design Specifications**
```
From PRD Part 4 (if exists):
- 4.1 Design Philosophy → [DESIGN_STYLE], [DIFFERENTIATION]
- 4.2 Color Palette → [PRIMARY], [SECONDARY], [SEMANTIC_COLORS]
- 4.3 Typography → [FONT_FAMILY], [SCALE]
- 4.4 UI Components → [BUTTON_SPECS], [CARD_SPECS], [ICON_LIBRARY]
- 4.5 Layout & Grid → [GRID_SYSTEM], [LAYOUT_STRUCTURE]
- 4.6 Interactive States → [HOVER], [FOCUS], [LOADING]
- 4.7 Responsive → [BREAKPOINTS], [MOBILE], [TABLET], [DESKTOP]
- 4.9 Accessibility → [CONTRAST], [KEYBOARD_NAV], [TOUCH_TARGETS]

If Part 4 doesn't exist:
- Fall back to template presets
- Or prompt user for design preferences
```

### Step 3: Select Template (Only if no Part 4)
```
1. Scan PRD Part 2/3 for keywords (dashboard, cart, feed, etc.)
2. Match to template preset
3. Apply template design system
4. Or use --template flag to override
```

### Step 4: Generate Design System Section
```
Priority:
1. Use PRD Part 4 specifications (highest priority)
2. Fall back to template colors if Part 4 missing
3. Ensure uniqueness from competitors (Part 4.1 differentiation)
4. Include all design tokens for AURA
```

### Step 5: Convert Pages
```
For each page in PRD Part 2 (User) and Part 3 (Admin):
1. Create page prompt with numbered slug (01-login, 02-dashboard, etc.)
2. Add SCREEN OVERVIEW from PRD page description
3. Convert features to LAYOUT INSTRUCTIONS
4. Map PRD Part 4.6 states to KEY FEATURES
5. Map actions to MAIN ACTIONS table with AURA components
6. Include DESIGN SPECIFICATIONS from Part 4
7. Add ACCESSIBILITY requirements from Part 4.9
```

### Step 6: Add Modals
```
For each action in PRD Part 2/3:
- Create actions → Form modal with AURA Form components
- Edit actions → Form modal with AURA Form components
- Delete actions → Confirmation modal with AURA Dialog
- Success feedback → Success modal or Toast
```

### Step 7: **[NEW] Prepare AURA Component Mapping
```
For each page:
1. Extract feature keywords
2. Map to potential AURA components
3. Document component search queries
4. Prepare selection criteria checklist
```

### Step 8: **[NEW] Auto-Execute on AURA (if flag set)**
```
1. Login to AURA.build via Playwright
2. Create/open project
3. For each page prompt:
   a. Input design prompt
   b. Search and evaluate components (smart selection)
   c. Search and evaluate templates (skip if not perfect match)
   d. Select best model
   e. Generate design
   f. Review and refine
   g. Save and screenshot
4. Generate execution report
```

---

## **PLAYWRIGHT MCP COMMANDS FOR AURA EXECUTION**

### Login Flow

```javascript
// Navigate to AURA.build
await mcp__playwright__browser_navigate({ url: "https://www.aura.build/" });

// Take screenshot to check state
await mcp__playwright__browser_take_screenshot({
  filename: "aura-homepage.png"
});

// Check if login required
const snapshot = await mcp__playwright__browser_snapshot();

// If login needed, ask user for credentials
// Then fill login form
await mcp__playwright__browser_fill_form({
  fields: [
    { name: "Email", type: "textbox", ref: "[email-input-ref]", value: "[USER_EMAIL]" },
    { name: "Password", type: "textbox", ref: "[password-input-ref]", value: "[USER_PASSWORD]" }
  ]
});

// Click login button
await mcp__playwright__browser_click({
  element: "Login button",
  ref: "[login-button-ref]"
});
```

### Component Search & Selection

```javascript
// Navigate to Components library
await mcp__playwright__browser_navigate({
  url: "https://www.aura.build/components"
});

// Search for component (e.g., "dashboard card")
await mcp__playwright__browser_type({
  element: "Search input",
  ref: "[search-input-ref]",
  text: "dashboard card"
});

// Take screenshot of results
await mcp__playwright__browser_take_screenshot({
  filename: "component-search-dashboard-card.png"
});

// Evaluate results using snapshot
const componentResults = await mcp__playwright__browser_snapshot();

// Decision logic:
// IF component matches PRD specs:
//   Click to select component
// ELSE:
//   Skip and document reason
```

### Template Search & Selection

```javascript
// Navigate to Templates library
await mcp__playwright__browser_navigate({
  url: "https://www.aura.build/templates"
});

// Search for template (e.g., "dashboard layout")
await mcp__playwright__browser_type({
  element: "Search input",
  ref: "[search-input-ref]",
  text: "dashboard layout"
});

// Take screenshot
await mcp__playwright__browser_take_screenshot({
  filename: "template-search-dashboard.png"
});

// Evaluate templates
const templateResults = await mcp__playwright__browser_snapshot();

// Decision logic:
// IF template aligns with PRD Part 4.5 layout AND Part 4.1 design style:
//   Click to select template
// ELSE IF template is generic or conflicts with PRD:
//   Skip template completely
//   Document: "No template selected - generating from prompt for uniqueness"
```

### Prompt Input & Generation

```javascript
// Navigate to prompt input
await mcp__playwright__browser_click({
  element: "New design prompt",
  ref: "[new-prompt-button-ref]"
});

// Input the complete page prompt
await mcp__playwright__browser_type({
  element: "Prompt textarea",
  ref: "[prompt-textarea-ref]",
  text: `[COMPLETE_PAGE_PROMPT_FROM_CONVERSION]`
});

// Select best model (if dropdown available)
await mcp__playwright__browser_select_option({
  element: "Model selector",
  ref: "[model-select-ref]",
  values: ["Claude Sonnet 4.5"] // or "GPT-4", etc.
});

// Click generate
await mcp__playwright__browser_click({
  element: "Generate button",
  ref: "[generate-button-ref]"
});

// Wait for generation
await mcp__playwright__browser_wait_for({
  text: "Generation complete"
});

// Take screenshot of result
await mcp__playwright__browser_take_screenshot({
  filename: "[page-name]-generated.png",
  fullPage: true
});
```

---

## **ERROR HANDLING**

| Error | Cause | Solution |
|-------|-------|----------|
| File not found | Invalid PRD path | Verify the PRD file path exists |
| No pages found | PRD lacks Part 2/3 sections | Ensure PRD has User/Admin sections |
| Invalid template | Unknown `--template` value | Use valid preset or omit for auto-detect |
| Missing project name | PRD has no title | Add Title to PRD Part 1 |
| Empty output | PRD has no extractable content | Check PRD follows v2 format |
| **[NEW]** Part 4 missing | PRD lacks Design Specifications | Use template fallback or generate PRD v2 |
| **[NEW]** AURA login failed | Incorrect credentials | Re-enter credentials or login manually |
| **[NEW]** Component not found | Search returned no results | Skip component, use prompt only |
| **[NEW]** Template mismatch | Template doesn't align with PRD | Skip template, generate from scratch |

---

## **TIPS**

1. **Prefer PRD v2 with Part 4** - Always use PRD generated by `/generate-prd` v2 for best results
2. **Design Specs First** - Part 4 design specifications ensure unique, non-generic output
3. **Smart Component Selection** - Only select components that perfectly match PRD requirements
4. **Skip Bad Templates** - Better to have no template than wrong template producing generic designs
5. **Review Before Auto-Execute** - Use `--auto-execute` only after reviewing generated prompts
6. **Document Decisions** - Always document why components/templates were selected or skipped
7. **Differentiation Matters** - Prioritize PRD Part 4.1 differentiation strategy in all selections
8. **Test Login First** - Manually verify AURA.build login before using `--auto-execute`
9. **Incremental Generation** - Generate and review pages incrementally, not all at once
10. **Screenshot Everything** - Take screenshots at each step for debugging and validation

---

## **CHECKLIST**

### Before Execution
- [ ] PRD file exists and is readable
- [ ] PRD has Part 4 (Design Specifications) or template specified
- [ ] Project name extracted from PRD
- [ ] Page count calculated from PRD Part 2 + Part 3
- [ ] Design system extracted (Part 4 or template fallback)

### Prompt Generation
- [ ] All pages from PRD Part 2 (User) converted
- [ ] All pages from PRD Part 3 (Admin) converted
- [ ] All modals for create/edit/delete actions included
- [ ] All states (empty, loading, error) designed
- [ ] All dropdowns and toasts specified
- [ ] Responsive variants included (mobile, tablet, desktop)
- [ ] Accessibility requirements from Part 4.9 included
- [ ] Design differentiation from Part 4.1 emphasized

### AURA Auto-Execution (if --auto-execute)
- [ ] AURA.build login successful
- [ ] Project created/selected on AURA
- [ ] For each page prompt:
  - [ ] Prompt input complete with design specs
  - [ ] Best model selected
  - [ ] Components searched with keywords
  - [ ] Components evaluated against PRD criteria
  - [ ] Only matching components selected (or skipped)
  - [ ] Templates searched by category
  - [ ] Templates evaluated against PRD layout/style
  - [ ] Only perfect templates selected (or skipped)
  - [ ] Generation triggered
  - [ ] Result reviewed against PRD
  - [ ] Screenshot saved
  - [ ] Design saved to project
- [ ] Execution report generated
- [ ] All decisions documented

---

## **RELATED COMMANDS**

| Command | Description | Relationship |
|---------|-------------|--------------|
| `/generate-prd` (v2) | Generate PRD with Design Specs (Part 4) | Prerequisite (input) |
| `/prd-to-design-guide` | Generate detailed Design Guide | Alternative path |
| `/design-guide-to-prompt` | Convert Design Guide to prompts | Alternative (longer) path |

---

## **WORKFLOW DIAGRAM**

```
Client Input
    ↓
/generate-prd (v2) → PRD with Part 4 (Design Specs)
    ↓
/prd-to-aura-prompts → Design Prompts File
    ↓
    ├─→ Manual Review → Copy to AURA.build manually
    │
    └─→ --auto-execute
            ↓
        Playwright MCP
            ↓
        ├─→ Login to AURA.build
        ├─→ Create/Select Project
        ├─→ For each page:
        │     ├─→ Input prompt with design specs
        │     ├─→ Search components → Smart selection
        │     ├─→ Search templates → Skip if not perfect
        │     ├─→ Select best model
        │     └─→ Generate & review
        └─→ Final Report
                ↓
        Fully Designed Project on AURA.build
```

---

**Version:** 2.0 | **Format:** PRD v2 Compatible + AURA Auto-Execution + Smart Component/Template Selection
