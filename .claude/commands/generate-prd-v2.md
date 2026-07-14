---
description: Generate a comprehensive PRD document from client input file with UI/UX design specifications
argument-hint: Path to client answer file (e.g., /path/to/client-answers.md or .pdf or .txt)
---

You are a PRD (Product Requirement Document) generator. Your task is to create a comprehensive PRD document based on the client input file containing answers to the questionnaire.

---

## Workflow Overview

1. Read and validate input file
2. Analyze client answers
3. Check for existing PRD (ask update vs new)
4. Generate PRD document
5. Validate PRD against input (1:1 verification)
6. Generate additional questions list
7. Ask user about UX analysis
8. (If yes) Generate UX flow improvements
9. **[NEW] Ask user about Design Specification analysis**
10. **[NEW] (If yes) Analyze design inspirations and generate design specifications**
11. Save file and report results

---

## Step 1: Read and Validate Input File

Read the file path from `$ARGUMENTS`.

**Supported formats**: .md, .pdf, .txt, or any text-based file

**Validation checks**:
1. File path is provided
2. File exists and is readable
3. File is not empty

**If validation fails**, output error and stop:
```
Error: [specific error message]
Usage: /generate-prd /path/to/client-answers.md
```

---

## Step 2: Analyze Client Answers

Parse the client answer file and extract information for each question category:

### 2.1 Basic Information
- App Name (CRITICAL - required for file naming)
- App Type (Web / App / Dashboard)
- Deadline
- User Types and their roles/permissions
- User Relationships (1:1, 1:N, independent)

### 2.2 Design Reference
- Reference apps and points to reference
- Unique selling points / differentiators
- Preferred main color
- Preferred font

### 2.3 Features
- Main features per user type
- Main feature module flows (Actor -> Action -> Result)
- Authentication method (login, signup fields)
- Communication features (chat, video call, push notifications)

### 2.4 Data
- Data to collect (forms, surveys, logs)
- Data to export (CSV downloads)

### 2.5 Technical
- 3rd party integrations
- Domain terminology

### 2.6 Other
- Additional important information

**For missing or unclear items**: Mark as "TBD - Client confirmation needed" AND add to the Additional Questions section.

---

## Step 3: Check for Existing PRD

After extracting the App Name:

1. Check `.claude-project/prd/` directory for existing PRD files matching the app name
2. If found, ask user:
   ```
   Existing PRD found: [filename]
   Would you like to:
   1. Update the existing PRD (changes will be logged)
   2. Create a new PRD
   ```
3. If updating: Load existing PRD content for comparison and change tracking
4. If creating new: Proceed with fresh PRD generation

---

## Step 4: Generate PRD Document

Create the PRD following this structure:

```markdown
# [App Name] PRD ([Date: YYYY-MM-DD])

---

# Part 1: Basic Information

## Title
[App Name]

## Terminology

| Term | Definition |
|------|------------|
| [Term 1] | [Definition] |
| [Term 2] | [Definition] |

## Project Information

### Description
[Project description in 2-3 sentences]

### Goals
1. [Goal 1]
2. [Goal 2]
3. [Goal 3]

### User Types
- **[User Type 1]**: [Description and permissions]
- **[User Type 2]**: [Description and permissions]
- **Admin**: [Description and permissions]

### User Relationships
[Describe relationships between user types - 1:1, 1:N, etc.]

### Project Type
- [Platform 1] - [Tech Stack]
- [Platform 2] - [Tech Stack]

## System Modules (Step-by-step Flows)

### Module 1 - [Feature Name]
1. [Actor] does [Action]
2. [Actor] does [Action]
3. [Result]

### Module 2 - [Feature Name]
1. ...

## 3rd Party API List
- [Service Name]: [Purpose]

---

# Part 2: User Application PRD

## User Types: [User Type 1], [User Type 2]
[Special notes if any]

## 1. Common

### Splash Page
- Design: [Status]

### Login Page
- **Input**:
  - [Field 1]
  - [Field 2]
- **Next Action**:
  - [Validation rules]
  - [Error handling]
  - [Success response]

### Forgot Password Page
- **Main**
  - Input: [Fields]
- **Reset Password Page**
  - [Process description]

### Sign Up Page
- **Input**:
  - [Field 1] (required/optional)
  - [Field 2]
- **Rules**:
  - [Rule 1]
  - [Rule 2]

## 2. [User Type 1]

### 2.1 Navigation Menu
1. [Tab 1]
2. [Tab 2]
3. [Tab 3]
4. [Tab 4]

### 2.2 Page Architecture & Feature Specification

#### 1. [Tab 1] Tab

**Main Page**
1) [Component 1]
   - [Feature details]
   - [Status display]
   - [Buttons/Actions]

2) [Component 2]
   - ...

**[Sub-page Name] Page**
- [Feature description]
- [Component list]

#### 2. [Tab 2] Tab
...

## 3. [User Type 2]

### 3.1 Navigation Menu
1. [Tab 1]
2. [Tab 2]
3. [Tab 3]

### 3.2 Page Architecture & Feature Specification
...

---

# Part 3: Admin Dashboard PRD

## Page Architecture & Feature Specification

### Dashboard Page
[Configure dashboard based on core app features]

**Card Components**
- [Key statistics managed in the app]

**Additional Components (based on app features)**
- [Components needed - calendar, charts, notifications, etc.]

## User Management

[Management pages for each user type - create based on app's User Types]

### [User Type] Management Page

**Main Page**
1. Top Area:
   - Filters: [Filter options]
   - Search: [Search fields]
   - Create button → Creation Modal
   - Action button: [Actions]

2. List Item Component:
   - [Fields]
   - [Action column]

3. Bulk Action: [Bulk operations - if needed]
4. Sort Order: [Sorting options]

**Creation Modal**
- Input fields: [Fields]
- Create button / Cancel button

**Detail Drawer**
- Header Info: [Display information]
- Sub-tabs: [Sub-tabs - if needed]

## Feature Management

[Management pages for each core feature - create based on app features]

### [Feature Name] Management Page

**Main Page**
- List Component: [List items]
- Search: [Search options]
- Actions: [Actions]

**Detail/Edit View**
- [Detail information]
- [Editable items]

## Export / Data Download (if applicable)

**Data Download**
- [Downloadable data - based on collected data in the app]
- Format: CSV
- Filter: All time / Custom date range

---

# **[NEW] Part 4: UI/UX Design Specifications**

## **4.1 Design Philosophy**

### Core Design Direction
- **Design Style**: [Modern / Minimalist / Bold / Playful / Professional / etc.]
- **Visual Approach**: [Unique visual direction distinct from reference apps]
- **Design Differentiation**: [How this design differs from competitors/references]

### Design Principles for This Project
1. [Principle 1 - e.g., "Clarity over decoration"]
2. [Principle 2 - e.g., "Consistent but unique"]
3. [Principle 3 - e.g., "Accessibility-first approach"]

---

## **4.2 Color Palette (Project-Specific)**

> **CRITICAL**: Use a distinct primary and secondary color set that is different from existing or reference products.

### Primary Colors
- **Primary Color**: [Hex Code] - [Color Name]
  - Usage: Primary actions, CTAs, links, focus states
  - Rationale: [Why this color was chosen for this project]

- **Primary Hover**: [Hex Code]
- **Primary Active**: [Hex Code]
- **Primary Disabled**: [Hex Code]

### Secondary Colors
- **Secondary Color**: [Hex Code] - [Color Name]
  - Usage: Secondary actions, accents, highlights
  - Rationale: [Why this color complements the primary]

- **Secondary Hover**: [Hex Code]
- **Secondary Active**: [Hex Code]

### Semantic Colors
- **Success**: [Hex Code] - [Usage context]
- **Warning**: [Hex Code] - [Usage context]
- **Error**: [Hex Code] - [Usage context]
- **Info**: [Hex Code] - [Usage context]

### Neutral Palette
- **Background Primary**: [Hex Code]
- **Background Secondary**: [Hex Code]
- **Surface**: [Hex Code]
- **Border**: [Hex Code]
- **Text Primary**: [Hex Code]
- **Text Secondary**: [Hex Code]
- **Text Disabled**: [Hex Code]

### Color Contrast & Accessibility
- [ ] All text meets WCAG AA (4.5:1 contrast ratio)
- [ ] Interactive elements meet WCAG AAA (7:1 contrast ratio)
- [ ] Color is not the only means of conveying information

### Color Differentiation from References
| Reference App | Their Primary Color | Our Primary Color | Differentiation |
|--------------|-------------------|------------------|-----------------|
| [App 1] | [Hex] | [Hex] | [How it's different] |
| [App 2] | [Hex] | [Hex] | [How it's different] |

---

## **4.3 Typography (Project-Specific)**

> **CRITICAL**: Choose a unique font family and consistent text hierarchy.

### Font Family Selection
- **Primary Font**: [Font Name]
  - Type: [Sans-serif / Serif / Display]
  - Rationale: [Why this font was chosen]
  - License: [Google Fonts / Adobe Fonts / Custom]
  - Fallback: [System font fallback]

- **Secondary Font** (if applicable): [Font Name]
  - Usage: [Headings / Accent text / Code]
  - Rationale: [Why this complements primary]

- **Monospace Font** (if applicable): [Font Name]
  - Usage: [Code blocks / Data tables / Technical content]

### Typography Scale & Hierarchy

| Element | Font | Size | Weight | Line Height | Letter Spacing | Usage |
|---------|------|------|--------|-------------|----------------|-------|
| H1 | [Font] | [px/rem] | [weight] | [value] | [value] | Hero sections, page titles |
| H2 | [Font] | [px/rem] | [weight] | [value] | [value] | Section headings |
| H3 | [Font] | [px/rem] | [weight] | [value] | [value] | Sub-sections |
| H4 | [Font] | [px/rem] | [weight] | [value] | [value] | Component titles |
| H5 | [Font] | [px/rem] | [weight] | [value] | [value] | Small headings |
| Body Large | [Font] | [px/rem] | [weight] | [value] | [value] | Prominent body text |
| Body | [Font] | [px/rem] | [weight] | [value] | [value] | Default body text |
| Body Small | [Font] | [px/rem] | [weight] | [value] | [value] | Secondary information |
| Caption | [Font] | [px/rem] | [weight] | [value] | [value] | Labels, metadata |
| Overline | [Font] | [px/rem] | [weight] | [value] | [value] | Eyebrow text, categories |

### Responsive Typography
- **Mobile (< 640px)**: [Scaling strategy]
- **Tablet (640px - 1024px)**: [Scaling strategy]
- **Desktop (> 1024px)**: [Full scale]

### Typography Differentiation
- **Why this font is unique**: [Explanation]
- **Different from reference apps**: [How it differs from competitors]

---

## **4.4 UI Components & Style (Project-Specific)**

> **CRITICAL**: Define button styles, card layouts, icon style, spacing, and border radius clearly.

### Button Styles

#### Primary Button
- **Background**: [Primary Color]
- **Text Color**: [Hex]
- **Height**: [px]
- **Padding**: [Horizontal] × [Vertical]
- **Border Radius**: [px]
- **Font Size**: [px/rem]
- **Font Weight**: [weight]
- **Shadow**: [CSS shadow value]
- **States**:
  - Hover: [Changes]
  - Active: [Changes]
  - Disabled: [Changes]
  - Loading: [Spinner position and style]

#### Secondary Button
- **Background**: [Color]
- **Text Color**: [Hex]
- **Border**: [Width] solid [Color]
- **Height**: [px]
- **Padding**: [Horizontal] × [Vertical]
- **Border Radius**: [px]
- **States**: [Define all states]

#### Tertiary/Ghost Button
- **Background**: Transparent
- **Text Color**: [Primary Color]
- **States**: [Define all states]

#### Icon Button
- **Size**: [px × px]
- **Border Radius**: [px]
- **Icon Size**: [px]
- **States**: [Define all states]

### Card Layouts

#### Standard Card
- **Background**: [Color]
- **Padding**: [All sides or Top/Right/Bottom/Left]
- **Border**: [Width] solid [Color] OR none
- **Border Radius**: [px]
- **Shadow**: [CSS shadow - default state]
- **Shadow (Hover)**: [CSS shadow - hover state]
- **Transition**: [Duration and easing]

#### Variants
- **Elevated Card**: [Specifications]
- **Outlined Card**: [Specifications]
- **Interactive Card**: [Specifications with hover/active states]

### Form Input Components

#### Text Input
- **Height**: [px]
- **Padding**: [Horizontal] × [Vertical]
- **Border**: [Width] solid [Color]
- **Border Radius**: [px]
- **Font Size**: [px/rem]
- **Background**: [Color]
- **States**:
  - Default: [Specifications]
  - Focus: [Border color, shadow/ring]
  - Error: [Border color, icon, message style]
  - Disabled: [Opacity, cursor]
  - Filled: [Appearance when has value]

#### Textarea
- **Min Height**: [px]
- **Max Height**: [px] or auto
- **Resize**: [none / vertical / both]
- [Other specs same as Text Input]

#### Select/Dropdown
- **Height**: [px]
- **Dropdown Max Height**: [px]
- **Option Padding**: [Horizontal] × [Vertical]
- **Option Hover**: [Background color]
- **Option Selected**: [Background, font weight]
- [Other specs]

#### Checkbox & Radio
- **Size**: [px × px]
- **Border**: [Width] solid [Color]
- **Border Radius**: [px for checkbox] / [50% for radio]
- **Checked State**: [Background, checkmark/dot style]
- **Focus Ring**: [Color, width]

#### Toggle/Switch
- **Width**: [px]
- **Height**: [px]
- **Border Radius**: [Full rounded]
- **Knob Size**: [px]
- **Transition**: [Duration]
- **On State**: [Background color]
- **Off State**: [Background color]

### Icon Style

- **Icon Library**: [Lucide / Heroicons / Material Icons / Feather / Custom]
- **Icon Style**: [Outlined / Filled / Duotone / Line]
- **Stroke Width**: [px]
- **Default Sizes**:
  - Small: [px]
  - Medium: [px]
  - Large: [px]
  - XLarge: [px]
- **Color Usage**:
  - Default: [Color]
  - Interactive: [Color with hover state]
  - Disabled: [Color]

### Spacing System (Project-Specific)

- **Base Unit**: [4px / 8px]
- **Scale**:
  - xs: [px] - [Usage]
  - sm: [px] - [Usage]
  - md: [px] - [Usage]
  - lg: [px] - [Usage]
  - xl: [px] - [Usage]
  - 2xl: [px] - [Usage]
  - 3xl: [px] - [Usage]
  - 4xl: [px] - [Usage]

- **Component Spacing**:
  - Between form fields: [px]
  - Between sections: [px]
  - Card internal spacing: [px]
  - Page margins: [px]
  - Grid gaps: [px]

### Border Radius System

- **None**: 0px - [Usage]
- **Small**: [px] - [Usage: inputs, small buttons]
- **Medium**: [px] - [Usage: cards, modals]
- **Large**: [px] - [Usage: large cards, containers]
- **XLarge**: [px] - [Usage: special elements]
- **Full**: 9999px / 50% - [Usage: pills, avatars]

### Shadow System

- **Elevation 1** (Subtle): [CSS shadow] - [Usage: cards at rest]
- **Elevation 2** (Medium): [CSS shadow] - [Usage: dropdowns, hover states]
- **Elevation 3** (High): [CSS shadow] - [Usage: modals, popovers]
- **Elevation 4** (Highest): [CSS shadow] - [Usage: sticky elements]

---

## **4.5 Layout & Grid System (Project-Specific)**

> **CRITICAL**: Use a different layout structure and content alignment.

### Grid System
- **Container Max Width**: [px]
- **Grid Columns**: [12 / 16 / 24 / Custom]
- **Column Gap**: [px]
- **Row Gap**: [px]
- **Breakpoints**:
  - Mobile: [px and below]
  - Tablet: [px to px]
  - Desktop: [px and above]
  - Large Desktop: [px and above] (if applicable)

### Layout Patterns

#### Page Layout Structure
```
[Define the unique layout structure]
Example:
┌─────────────────────────────────────┐
│         Header (sticky/fixed)        │
├──────┬──────────────────────────────┤
│ Side │    Main Content Area         │
│ Nav  │                              │
│      │                              │
└──────┴──────────────────────────────┘
```

- **Header Height**: [px]
- **Sidebar Width**: [px collapsed] / [px expanded]
- **Main Content Max Width**: [px]
- **Content Padding**: [Top] [Right] [Bottom] [Left]

#### Content Alignment Strategy
- **Default Text Alignment**: [Left / Center / Justified]
- **Heading Alignment**: [Left / Center]
- **Form Alignment**: [Left / Center]
- **CTA Alignment**: [Left / Center / Right]

#### Responsive Layout Behavior
- **Mobile**: [Layout description - stacked, bottom nav, etc.]
- **Tablet**: [Layout description - hybrid, collapsible sidebar]
- **Desktop**: [Layout description - full sidebar, multi-column]

### Component Layout Patterns

#### Card Grid
- **Columns**: [1 mobile / 2 tablet / 3-4 desktop]
- **Gap**: [px]
- **Aspect Ratio** (if fixed): [ratio]

#### List Layout
- **Item Height**: [Fixed px / Auto]
- **Item Spacing**: [px]
- **Divider Style**: [Border / Space / None]

#### Form Layout
- **Field Width**: [Full / Fixed px]
- **Label Position**: [Top / Left / Floating]
- **Field Spacing**: [px between fields]
- **Multi-column** (desktop): [Yes/No, how many columns]

### Layout Differentiation
- **Why this layout is unique**: [Explanation]
- **Different from reference apps**: [How structure differs]

---

## **4.6 Interactive States & Animations**

### Hover States
- **Transition Duration**: [ms]
- **Easing Function**: [ease / ease-in-out / cubic-bezier()]
- **Common Hover Effects**:
  - Buttons: [Transform, color, shadow changes]
  - Cards: [Shadow lift, scale, border]
  - Links: [Underline, color, weight]

### Active/Pressed States
- **Transform**: [Scale, translate]
- **Duration**: [ms]
- **Visual Feedback**: [Color darken, shadow reduce]

### Focus States
- **Focus Ring Color**: [Primary color or custom]
- **Focus Ring Width**: [px]
- **Focus Ring Offset**: [px]
- **Focus Ring Style**: [Solid / Dashed / Custom]

### Loading States
- **Spinner Style**: [Circular / Linear / Dots / Custom]
- **Spinner Size**: [Small / Medium / Large px values]
- **Spinner Color**: [Primary / Context-based]
- **Skeleton Screen**: [Yes/No, style if yes]
- **Loading Overlay**: [Opacity, backdrop blur]

### Disabled States
- **Opacity**: [Value]
- **Cursor**: not-allowed
- **Visual Treatment**: [Grayscale, opacity, or custom]

### Animation Principles
1. **Duration Range**: [Fast: 100-200ms, Medium: 200-300ms, Slow: 300-500ms]
2. **Easing**: [Default easing function]
3. **Reduced Motion**: [Respect prefers-reduced-motion]

### Micro-interactions
- **Success Feedback**: [Animation style - checkmark, confetti, etc.]
- **Error Shake**: [Yes/No, if yes specify]
- **Page Transitions**: [Fade / Slide / None]
- **Modal Animations**: [Fade in, slide up, scale]

---

## **4.7 Responsive Design Strategy**

### Mobile-First Approach
- [ ] Design mobile first, then scale up
- [ ] Touch targets minimum 44px × 44px
- [ ] Bottom navigation for primary actions
- [ ] Swipe gestures: [Where and for what]

### Breakpoint-Specific Behaviors

#### Mobile (< 640px)
- Navigation: [Bottom bar / Hamburger / Other]
- Typography: [Scaling strategy]
- Layout: [Single column, stacked]
- Images: [Full width or specific width]
- Spacing: [Reduced spacing values]

#### Tablet (640px - 1024px)
- Navigation: [Hybrid approach]
- Typography: [Scaling strategy]
- Layout: [2 columns where applicable]
- Spacing: [Medium spacing values]

#### Desktop (> 1024px)
- Navigation: [Sidebar / Top nav / Both]
- Typography: [Full scale]
- Layout: [Multi-column, max width containers]
- Spacing: [Full spacing scale]

### Responsive Images
- **Mobile**: [Max width, aspect ratio]
- **Tablet**: [Max width, aspect ratio]
- **Desktop**: [Max width, aspect ratio]
- **Loading Strategy**: [Lazy loading, srcset, etc.]

---

## **4.8 Component Library & Patterns**

### Reusable Components (To Be Designed)

List all reusable components that need to be created:

1. **Navigation Components**
   - [ ] Header/Navbar
   - [ ] Sidebar (if applicable)
   - [ ] Bottom Navigation (mobile)
   - [ ] Breadcrumbs
   - [ ] Tabs

2. **Data Display Components**
   - [ ] Card (with variants)
   - [ ] List Item
   - [ ] Table
   - [ ] Badge/Chip
   - [ ] Avatar
   - [ ] Stat Card
   - [ ] Timeline

3. **Form Components**
   - [ ] Text Input
   - [ ] Textarea
   - [ ] Select/Dropdown
   - [ ] Checkbox
   - [ ] Radio Button
   - [ ] Toggle/Switch
   - [ ] Date Picker
   - [ ] File Upload
   - [ ] Search Input

4. **Feedback Components**
   - [ ] Alert/Notification
   - [ ] Toast/Snackbar
   - [ ] Modal/Dialog
   - [ ] Tooltip
   - [ ] Progress Bar
   - [ ] Skeleton Loader
   - [ ] Empty State
   - [ ] Error State

5. **Action Components**
   - [ ] Button (all variants)
   - [ ] Icon Button
   - [ ] Floating Action Button
   - [ ] Dropdown Menu
   - [ ] Pagination

### Pattern Consistency Rules
1. [Rule 1 - e.g., "All cards use same shadow and border radius"]
2. [Rule 2 - e.g., "All form inputs have consistent height and padding"]
3. [Rule 3 - e.g., "All icons from same family with same stroke width"]

---

## **4.9 Accessibility Requirements**

### Color Contrast
- [ ] Text contrast ratio: Minimum 4.5:1 (WCAG AA)
- [ ] Large text contrast: Minimum 3:1
- [ ] Interactive elements: Minimum 3:1 against background
- [ ] Don't rely on color alone for information

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Clear focus indicators on all focusable elements
- [ ] Logical tab order
- [ ] Skip to main content link
- [ ] Keyboard shortcuts (if applicable): [List shortcuts]

### Screen Reader Support
- [ ] Semantic HTML usage
- [ ] ARIA labels where needed
- [ ] Alt text for all images
- [ ] Form labels properly associated
- [ ] Error messages announced
- [ ] Loading states announced

### Touch & Click Targets
- [ ] Minimum touch target: 44px × 44px
- [ ] Adequate spacing between interactive elements
- [ ] Avoid accidental interactions

### Motion & Animation
- [ ] Respect prefers-reduced-motion
- [ ] No auto-playing videos with sound
- [ ] Pause/stop controls for animations over 5 seconds

---

## **4.10 Design Deliverables Checklist**

### Design Files Required
- [ ] Figma/Sketch/Adobe XD file with all screens
- [ ] Component library with variants
- [ ] Design system documentation
- [ ] Style guide PDF/document
- [ ] Prototype links (for key user flows)

### Asset Deliverables
- [ ] Logo (all sizes and formats: SVG, PNG)
- [ ] Icon set (SVG format)
- [ ] Illustrations (if applicable)
- [ ] Images (optimized for web)
- [ ] Favicon set (all sizes)

### Documentation Deliverables
- [ ] Design tokens (JSON/YAML)
- [ ] Color palette documentation
- [ ] Typography scale documentation
- [ ] Spacing system documentation
- [ ] Component usage guidelines
- [ ] Responsive behavior documentation
- [ ] Animation specifications
- [ ] Accessibility annotations

### Developer Handoff
- [ ] Design specs (measurements, colors, fonts)
- [ ] Interactive prototype
- [ ] Asset export (organized folders)
- [ ] Design QA checklist
- [ ] Design review meeting scheduled

---

# Additional Questions (Client Confirmation Required)

## Required Clarifications
| # | Question | Context |
|:-:|:---------|:--------|
| 1 | [Question 1] | [Why this is needed] |

## Recommended Clarifications
| # | Question | Context |
|:-:|:---------|:--------|
| 1 | [Question 1] | [Why this is needed] |

## **[NEW] Design-Specific Questions**
| # | Question | Context |
|:-:|:---------|:--------|
| 1 | [Design preference/clarification] | [Why this affects design decisions] |

---

# Feature Change Log

## Version X.X (YYYY-MM-DD)

| Change Type | Before | After | Source |
|:-----------|:-------|:------|:-------|
| **Feature Replaced** | [Previous feature] | [New feature] | [Source document] |
| **Feature Extended** | [Existing feature] | [Added details] | [Source document] |
| **Feature Removed** | [Removed feature] | - | [Source document] |

### Change Details
#### [Change Title]
- **Source Document**: [Document name]
- **Change Description**: [Detailed description]

---

# UX Flow Improvement Suggestions (Optional)

UX flow issues identified during PRD creation:

## Suggestions
| # | Current Flow | Issue | Suggestion | Priority |
|:-:|:------------|:------|:-----------|:--------:|
| 1 | [Current flow] | [Issue] | [Improvement suggestion] | High/Medium/Low |

### Suggestion Details
#### Suggestion 1: [Suggestion Title]
- **Current**: [Current state]
- **Issue**: [Problem]
- **Suggestion**: [Improvement approach]
- **Expected Benefit**: [Benefit]

---

# **[NEW] Design Inspiration Analysis**

## Analyzed Design References

### Reference 1: [Website/App Name]
- **URL**: [URL if applicable]
- **Analysis Method**: [Playwright browse / Screenshot analysis / Figma file]
- **Key Design Elements Observed**:
  - Color Palette: [Colors used]
  - Typography: [Fonts used]
  - Layout Style: [Layout approach]
  - Component Style: [Button, card styles observed]
  - Unique Elements: [What stands out]

**What to Adopt (with modification)**:
- [Element 1]: [How to adapt it differently]
- [Element 2]: [How to adapt it differently]

**What to Avoid**:
- [Element 1]: [Why and what to do instead]
- [Element 2]: [Why and what to do instead]

### Reference 2: [Website/App Name]
[Same structure as above]

### Reference 3: [Website/App Name]
[Same structure as above]

## Design Differentiation Strategy

Based on the analyzed references, here's how this project will be visually distinct:

| Design Aspect | Reference Apps Common Approach | Our Unique Approach |
|--------------|-------------------------------|---------------------|
| Color Palette | [Common colors in references] | [Our distinct choice] |
| Typography | [Common fonts in references] | [Our unique font] |
| Layout | [Common layout pattern] | [Our different structure] |
| Component Style | [Common button/card style] | [Our unique style] |
| Visual Style | [Common design style] | [Our unique direction] |

---

```

---

## Step 5: Validate PRD Against Input (1:1 Verification)

After generating the PRD, perform validation against the input file:

### 5.1 User Types Verification (CRITICAL)
- [ ] All user types from input are included in Part 1 User Types
- [ ] Each user type's permissions are accurately reflected
- [ ] User relationships (1:1, 1:N) are correct
- [ ] **Part 2 Section Mapping**: All user types (except Admin) have separate sections in Part 2
- [ ] Each user type section has Navigation Menu and Page Architecture defined

### 5.2 Feature Verification
- [ ] All main features from input are included in PRD
- [ ] Module flows match the input file
- [ ] Navigation menu structure matches input

### 5.3 Authentication Verification
- [ ] All login methods are included (ID/PW, OAuth types, etc.)
- [ ] Signup required/optional fields are correct
- [ ] Social login options are all included (Apple, Google, Kakao, etc.)

### 5.4 Tech Stack Verification
- [ ] All 3rd party APIs/integrations are included
- [ ] Platforms (iOS, Android, Web) are correct
- [ ] Backend tech stack is correct

### 5.5 Terminology Verification
- [ ] All domain terms from input are in Terminology section
- [ ] Terms are used consistently throughout the PRD

### 5.6 Screen/Page Verification
- [ ] All screens mentioned in input are included in PRD
- [ ] Each screen's components (items) are included without omission
- [ ] Both key screens and basic screens are reflected

### **5.7 Design Specifications Verification (NEW)**
- [ ] Color palette is defined and distinct from reference apps
- [ ] Typography scale is complete and unique
- [ ] UI component styles are clearly specified
- [ ] Layout and grid system is documented
- [ ] Spacing and border radius systems are defined
- [ ] All design elements support project differentiation

### 5.8 Feature Update Verification (When Updating Existing PRD - CRITICAL)

When updating an existing PRD with new input:

- [ ] **Feature Replacement Check**: Does new input replace existing features?
  - Example: "My Collection" → "Art Feed" - replace all My Collection content with Art Feed
  - Old feature name should be completely replaced with new feature name
- [ ] **Feature Extension vs Replacement**:
  - Replacement: Existing feature completely changes to new feature
  - Extension: New details added to existing feature
- [ ] **Navigation Menu Update**: Update navigation menu when feature names change
- [ ] **Terminology Sync**: New feature names reflected in Terminology
- [ ] **Change Log Recording**: Record all changes in "Feature Change Log" section

### Feature Update Rules:
1. **New input takes priority**: New document content takes priority over existing PRD
2. **Explicit replacement**: If different feature is specified at same location (e.g., Home Tab), treat as replacement
3. **No arbitrary additions**: Do not add details not in the input document
4. **Document changes**: Record change history in PRD's "Feature Change Log" section

### PRD Writing Principles (CRITICAL - Must Follow):

#### 1. Reference Only Input Resources
- **No re-referencing old PRD**: When updating PRD, do not reference previously written PRD content
- **Use only new input file**: Base PRD only on PDF, documents, images provided by user
- **No accumulation**: If previous PRD details are not in new input file, delete or move to question list

#### 2. Handling Ambiguous Items
- **No guessing**: Never guess content not specified in input file
- **All ambiguous items → Question list**: If even slightly unclear, don't write in PRD, add to question list
- **Empty sections allowed**: If no information, mark as "TBD - Client confirmation needed"

#### 3. Source Tracking
- **All content must be traceable**: Every feature/screen/flow in PRD must be traceable to input file source
- **Content without source = Delete**: Content that cannot cite a source should not be included in PRD

#### Example:
```
Wrong:
- Keep "Collection Detail Page" because it was in previous PRD
- Add "read receipts, reply feature" when PDF only says "DM feature"

Correct:
- No mention of "Collection Detail Page" in new PDF → Delete or move to question list
- PDF only says "DM feature" → Write only "DM feature", add details to question list
  - Question: "DM feature details - Read receipts? Reply enabled? Notification method?"
```

### Validation Result Handling:
1. **If omissions found**: Immediately fix PRD
2. **If inconsistencies found**: Fix PRD based on input file
3. **If ambiguous**: Add to Additional Questions list

### Validation Complete Output:
```markdown
## Validation Results

### Modified Items
- [Item 1]: [Before] → [After]
- [Item 2]: [Before] → [After]

### Validation Complete
- Total items verified: [N]
- Items modified: [N]
- Items moved to questions: [N]
```

---

## Step 6: Generate Additional Questions

When generating the question list, include ALL unclear features:

### Question Generation Rules (CRITICAL):

1. **Feature details undefined**: Only feature name exists, no detailed behavior
   - Example: "DM feature" → "DM notification method? Read receipts? Reply enabled?"

2. **Data flow undefined**: Unclear where data flows from/to
   - Example: "Share Collection" → "URL format when sharing? Non-member access allowed?"

3. **Conditions/branches undefined**: Unclear behavior under specific conditions
   - Example: "Recognition Fail" → "How many seconds until fail? Retry limit?"

4. **UI/UX details undefined**: Unclear screen component behavior
   - Example: "Artist Page Stats" → "Clicking Followers shows list? Or just number?"

5. **Permissions/access undefined**: Unclear who can access what features
   - Example: "Delete Comment" → "Author only? Artist too? Admin only?"

6. **External integration undefined**: Unclear 3rd party integration details
   - Example: "Kakao Login" → "What profile info to retrieve? Friend list?"

7. **[NEW] Design preferences undefined**: Unclear design direction or preferences
   - Example: "Modern design" → "What specific modern style? Minimalist? Bold? Gradient-heavy?"

8. **[NEW] Brand identity unclear**: Missing brand guidelines or visual direction
   - Example: "Professional look" → "Industry-specific professional (legal, tech, creative)? Examples?"

---

## Step 7: Ask About UX Analysis

After completing the PRD and validation, ask the user:

```
PRD generation complete. Would you like to include UX flow analysis?

This will analyze:
- Navigation flow issues
- User journey optimization
- Information architecture
- Common UX problem patterns

[Yes] / [No]
```

If user selects **Yes**, proceed with UX analysis below.
If user selects **No**, skip to Step 9.

---

## Step 8: UX Flow Analysis (If Requested)

### 8.1 Navigation Flow Verification
- [ ] Back/close available from all pages?
- [ ] No dead-end pages? (pages with nowhere to go)
- [ ] Deep depth screens (3+ levels)? → Suggest shortcuts
- [ ] Frequently used features require too many tab changes?

### 8.2 User Journey Verification
- [ ] Steps to reach core features appropriate? (recommend 3 or less)
- [ ] Clear path to new user's first success (Aha moment)?
- [ ] Recovery path when errors occur?
- [ ] Clear next action from empty states?

### 8.3 Information Architecture Verification
- [ ] Related features grouped in same area?
- [ ] Same feature not scattered across multiple places?
- [ ] Structure matches user mental model?

### 8.4 Common UX Problem Patterns
1. **Orphan Pages**: Important pages with only one access path
   - Suggestion: Add multiple entry points
2. **Hidden Features**: Core features hard to discover
   - Suggestion: Guide in onboarding or adjust placement
3. **Broken Flows**: Need to navigate away mid-task
   - Suggestion: Inline handling or change to modal
4. **Excessive Confirmations**: Too many unnecessary confirmation steps
   - Suggestion: Consolidate steps or add skip option
5. **Context Loss**: Data loss when going back
   - Suggestion: Auto-save or confirmation dialog

### Improvement Suggestion Rules:
- Content not in input file → Mark as **suggestion** (no arbitrary additions)
- Show priority: High (core feature related) / Medium (convenience) / Low (nice-to-have)
- Show implementation complexity: Simple / Medium / Complex
- State rationale: Why it's a problem, which users are affected

---

## **Step 9: Ask About Design Specification Analysis (NEW)**

After completing UX analysis (or if skipped), ask the user:

```
Would you like to include Design Specification analysis with design inspiration research?

This will:
- Analyze design reference websites/apps using Playwright browser automation
- Review any provided design screenshots or Figma files
- Generate unique color palettes different from references
- Define typography and component styles distinct from competitors
- Create a comprehensive design system for this project
- Ensure visual differentiation from reference products

[Yes] / [No]
```

If user selects **Yes**, proceed with Design Specification Analysis.
If user selects **No**, skip to Step 11.

---

## **Step 10: Design Specification Analysis (NEW - If Requested)**

### **10.1 Collect Design Inspiration Resources**

Ask the user to provide:

```
Please provide design inspiration resources:

1. Reference website URLs (for Playwright analysis)
   - Example: https://example.com, https://competitor.com

2. Design screenshot images (if any)
   - Supported formats: PNG, JPG, WebP

3. Figma/Design files or links (if any)
   - Figma public links or exported images

4. Specific design preferences (if any)
   - Preferred design style: Modern, Minimalist, Bold, Playful, etc.
   - Colors to avoid or embrace
   - Any brand guidelines

Enter resources or type 'skip' to proceed with defaults:
```

### **10.2 Analyze Design References Using Playwright (If URLs Provided)**

For each reference website URL provided:

1. **Navigate to the website** using Playwright MCP tools
   - Use `mcp__playwright__browser_navigate` to visit URL
   - Handle any login/credentials if requested by user

2. **Take screenshots** of key pages
   - Use `mcp__playwright__browser_take_screenshot` for visual reference
   - Capture: Homepage, Main feature pages, Component examples

3. **Analyze design elements** using Playwright
   - Use `mcp__playwright__browser_snapshot` for accessibility tree
   - Use `mcp__playwright__browser_evaluate` to extract:
     - Computed CSS colors (primary, secondary, background)
     - Font families and sizes
     - Border radius values
     - Spacing/padding patterns
     - Button styles, card styles

4. **Document findings**:
   ```markdown
   ### Reference: [Website Name]
   - **URL**: [URL]
   - **Primary Color**: [Extracted hex color]
   - **Secondary Color**: [Extracted hex color]
   - **Font Family**: [Extracted font]
   - **Button Border Radius**: [px value]
   - **Card Shadow**: [CSS shadow value]
   - **Layout Pattern**: [Description]
   ```

### **10.3 Analyze Design Screenshots (If Images Provided)**

For each screenshot image:

1. **Read the image file** using Read tool
2. **Visual analysis**:
   - Identify color palette (dominant colors)
   - Observe typography style and hierarchy
   - Note component styles (buttons, cards, inputs)
   - Identify layout patterns and grid usage
   - Observe spacing and visual rhythm

3. **Document observations**:
   ```markdown
   ### Screenshot Analysis: [Image Name]
   - **Dominant Colors**: [List colors observed]
   - **Typography Style**: [Observations]
   - **Component Style**: [Modern/Rounded/Sharp/Minimal/etc.]
   - **Layout**: [Grid-based/Fluid/Asymmetric/etc.]
   - **Notable Elements**: [Unique design choices]
   ```

### **10.4 Analyze Figma Files (If Provided)**

If Figma links or exported files are provided:

1. **For Figma public links**:
   - Use Playwright to navigate to Figma link
   - Take screenshots of design frames
   - Note design tokens if visible in the file

2. **For Figma exported images**:
   - Analyze using Read tool (same as screenshot analysis)

3. **Document Figma insights**:
   ```markdown
   ### Figma File Analysis: [File Name]
   - **Design System Observed**: [Yes/No]
   - **Component Library**: [Observed components]
   - **Color Tokens**: [If visible]
   - **Typography Tokens**: [If visible]
   - **Key Takeaways**: [What to learn from this]
   ```

### **10.5 Generate Unique Design Specifications**

Based on all analyzed references, create DISTINCT design specifications:

#### Color Palette Generation
```markdown
**Strategy**: Differentiate from reference apps

Reference Apps Primary Colors:
- [App 1]: [#HEX]
- [App 2]: [#HEX]
- [App 3]: [#HEX]

**Our Unique Primary Color**: [#HEX - Different from all references]
**Rationale**: [Why this color suits the project and differs from competitors]

**Our Secondary Color**: [#HEX]
**Rationale**: [Why this complements primary and is unique]
```

#### Typography Selection
```markdown
**Strategy**: Choose fonts different from references

Reference Apps Fonts:
- [App 1]: [Font name]
- [App 2]: [Font name]
- [App 3]: [Font name]

**Our Primary Font**: [Font Name - Different from references]
**Rationale**: [Why this font suits the project tone]

**Typography Scale**: [Define complete hierarchy]
```

#### Component Style Definition
```markdown
**Strategy**: Create distinct component appearance

Reference Apps Button Style:
- [App 1]: [Radius, style]
- [App 2]: [Radius, style]

**Our Button Style**:
- Border Radius: [Different value]
- Style: [Unique approach]
- Rationale: [Why this fits our design direction]

[Repeat for cards, inputs, etc.]
```

#### Layout System Design
```markdown
**Strategy**: Use different layout structure

Reference Apps Layout:
- [App 1]: [Layout pattern]
- [App 2]: [Layout pattern]

**Our Layout Structure**: [Different approach]
**Grid System**: [Unique grid definition]
**Rationale**: [Why this layout serves the project better]
```

### **10.6 Populate Part 4: UI/UX Design Specifications**

Fill in all sections of Part 4 with the generated unique design specifications:
- 4.2 Color Palette → Unique colors with rationale
- 4.3 Typography → Unique fonts with complete scale
- 4.4 UI Components & Style → All component specs
- 4.5 Layout & Grid System → Unique layout structure
- 4.6 Interactive States → Complete interaction design
- 4.7 Responsive Design → Responsive strategies
- 4.8 Component Library → Component checklist
- 4.9 Accessibility → Accessibility requirements
- 4.10 Design Deliverables → Deliverables checklist

### **10.7 Add Design Inspiration Analysis Section**

Populate the "Design Inspiration Analysis" section with:
- All analyzed references (websites, screenshots, Figma)
- Key observations from each reference
- Design differentiation strategy table
- Clear documentation of how this project will be visually unique

### **10.8 Add Design-Specific Questions**

If any design aspects are unclear after analysis, add to "Design-Specific Questions":

```markdown
## Design-Specific Questions
| # | Question | Context |
|:-:|:---------|:--------|
| 1 | Should the design lean more [Style A] or [Style B]? | Current references show mixed styles |
| 2 | Any colors to specifically avoid due to brand competitors? | Want to ensure maximum differentiation |
| 3 | Preference for border radius: Sharp corners or rounded? | References show varying approaches |
```

---

## **Step 11: Save File and Report (Updated)**

### 11.1 Create Output Directory
```bash
mkdir -p .claude-project/prd
```

### 11.2 Save File
Filename format: `[AppName]_PRD_[YYMMDD].md`
- Sanitize app name: Replace spaces with underscores, remove special characters
- Example: `ActivityCoaching_PRD_260112.md`

Location: `.claude-project/prd/`

### 11.3 Report Results
```markdown
## PRD Generation Complete

### Output
- File: `.claude-project/prd/[filename].md`
- Mode: [New / Update]

### Summary
- Sections included: [list]
- Validation: [N] items verified, [N] modified
- Additional questions: [N] items
- UX suggestions: [N] items (or "Skipped")
- **[NEW] Design specifications: [Complete / Skipped]**
- **[NEW] Design references analyzed: [N] websites, [N] screenshots, [N] Figma files**

### Next Steps
1. Review the Additional Questions section
2. **[NEW] Review the Design Specifications in Part 4**
3. **[NEW] Review the Design Inspiration Analysis section**
4. Send questions to client for clarification
5. Update PRD with client responses using `/generate-prd` again
6. **[NEW] Use `/prd-to-design-guide` to convert PRD to comprehensive Design Guide**
```

---

## Error Handling

- **File not found**:
  ```
  Error: File not found at [path]
  Please check the file path and try again.
  Usage: /generate-prd /path/to/client-answers.md
  ```

- **Empty file**:
  ```
  Error: The input file is empty.
  Please provide a file with client answers.
  ```

- **Missing app name**:
  ```
  Error: App Name not found in the input file.
  App Name is required to generate the PRD.
  Please ensure the input file includes the App Name.
  ```

- **Read error**:
  ```
  Error: Unable to read the file at [path]
  Please check file permissions and try again.
  ```

- **[NEW] Playwright browser not available**:
  ```
  Warning: Playwright browser not available for design analysis.
  Proceeding with manual design specification entry.
  Design references will be noted but not automatically analyzed.
  ```

- **[NEW] Design reference URL inaccessible**:
  ```
  Warning: Cannot access [URL]
  Reason: [Error reason - e.g., requires login, timeout, etc.]
  Proceeding with available references only.
  ```

---

## Client Question List Reference

The following questions should be answered by the client. PMs can use this list when gathering requirements:

```
=== Basic Info ===
1. App Name:

2. App Type (Web / App / Dashboard):

3. Deadline:

4. All User Types:

5. User Roles & Permissions (what can each user do?):

6. User Relationships (1:1, 1:N, independent, etc.):

=== Design Reference ===
7. Reference App:
   - Points to reference for development:

8. What makes your app special (Difference between your service and other services already launched):

9. Preferred Main Color:

10. Preferred Font:

**[NEW] 11. Design Inspiration Resources:**
   - Reference website URLs (for analysis):
   - Design screenshots or mockups (if any):
   - Figma/Design files (if any):
   - Specific design style preference:

**[NEW] 12. Design Differentiation:**
   - What design styles to avoid (competitors using):
   - What design elements to emphasize:
   - Any brand guidelines or existing visual identity:

=== Features ===
13. Main Features (per user type):

14. Main Feature Module Flow (User A does -> What changes -> Result) for MVP:

15. Authentication Method:
    - Login: (ID/PW, Social login, Phone verification, etc.)
    - Signup required fields:
    - Signup optional fields:

16. Communication Features:
    - Chat: (Yes/No)
    - Video call: (Zoom, etc.)
    - Push notifications: (Yes/No)

=== Data ===
17. Data to Collect (forms, surveys, logs, etc.):

18. Data to Export (CSV downloads - what data needs to be downloadable?):

=== Technical ===
19. 3rd Party Integrations (SMS, payment, maps, analytics, etc.):

20. Domain Terminology (special terms that need definition):

=== Other ===
21. Is there any additional important information we should be aware of?
```

---

## Usage Examples

**Create new PRD from markdown:**
```
/generate-prd /Users/user/Documents/client-answers.md
```

**Create new PRD from PDF:**
```
/generate-prd /Users/user/Documents/client-requirements.pdf
```

**Create new PRD from text file:**
```
/generate-prd /path/to/requirements.txt
```

---

## **Integration with PRD to Design Guide (NEW)**

After generating a PRD with Design Specifications (Part 4):

1. The PRD now contains all necessary design information for conversion
2. Part 4 provides the design system foundation
3. Design Inspiration Analysis shows competitive differentiation
4. Use `/prd-to-design-guide [PRD-file-path]` to convert into detailed Design Guide
5. Design Guide will inherit color palette, typography, and component specs from PRD Part 4
6. Design Guide will expand on component library and create detailed page designs

**Workflow**:
```
Client Input → /generate-prd → PRD with Design Specs → /prd-to-design-guide → Comprehensive Design Guide
```

---

## Notes

- Single file contains Part 1, 2, 3, **[NEW] 4** (all sections)
- Sections can be added/removed based on project characteristics
- Part 3 (Admin Dashboard) can be omitted for projects without admin dashboard
- **[NEW] Part 4 (UI/UX Design Specifications) can be omitted if design analysis is skipped**
- User type count is flexible per project
- Unclear content is output in **Additional Questions** section at the end
- When updating existing PRD, changes are tracked in **Feature Change Log**
- **[NEW] Design references are analyzed using Playwright MCP when URLs are provided**
- **[NEW] Design specifications ensure visual uniqueness from reference apps**
- **[NEW] PRD now serves as single source of truth for both development AND design**
