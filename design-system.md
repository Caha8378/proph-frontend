# PROPH DESIGN SYSTEM v2.0
**Basketball recruiting platform | Mobile-first | Dark mode exclusive | Coach & Player journeys**

---

## 🎨 Color Palette

### Brand Colors
```css
proph-yellow:     #FFEC3C  /* Primary CTA, stats, highlights, active states */
proph-black:      #0A0A0A  /* App background */
proph-grey:       #1C1C1E  /* Card backgrounds, modal backgrounds */
proph-grey-light: #2C2C2E  /* Hover states, secondary backgrounds */
proph-white:      #FFFFFF  /* Primary text */
proph-grey-text:  #A1A1A6  /* Secondary text, labels, icons */
```

### Accent Colors (Use Sparingly)
```css
proph-purple:      #8B5CF6  /* Links, secondary accents - RARE USE */
proph-success:     #10B981  /* Accept button ONLY - minimal use */
proph-error:       #EF4444  /* Reject button ONLY - minimal use */
```

### Color Philosophy Update
- **Primary palette: Yellow + Black + Grey** - 95% of UI uses only these
- **Green/Red**: ONLY for coach application actions (Accept/Reject buttons)
- **NO status colors elsewhere**: No green "Accepted" badges, no red "Rejected" states
- **Status indicators**: Use yellow/grey borders, not traffic light colors
- **Yellow = Action & Attention**: All CTAs, active states, important stats

---

## 📐 Typography Scale
```tsx
// Headings
text-4xl font-black       // Hero headlines (home pages)
text-3xl font-black       // Page titles, position titles
text-2xl font-black       // Card titles, emphasis
text-xl font-bold         // Section headers, modal titles
text-lg font-bold         // Subsections

// Body & UI
text-base font-bold       // Primary info (no labels style)
text-sm font-semibold     // Secondary info, button text
text-xs font-medium       // Labels, meta data, nav labels
text-[10px] font-black    // Micro labels (stat abbreviations)
text-[9px] font-black     // Ultra-compact (stat labels in tight spaces)

// Special Cases
letter-spacing: '-2px'    // Proph logo ONLY
tracking-tight            // Position titles on posting cards
tracking-wide             // Section headers (uppercase)
```

### Font Family
- **Primary**: Inter (Google Fonts)
- **Weights used**: 400, 500, 600, 700, 800, 900
- **Fallback**: sans-serif

---

## 📏 Spacing & Layout

### Card Dimensions (Fixed)
```tsx
PlayerCard:    w-[315px] h-[540px]  // 10% smaller than original
PostingCard:   w-full (responsive)   // Vertical cards
```

### Spacing Scale
```tsx
p-6         // Standard card padding
p-4         // Compact card/modal padding
p-3         // Tight sections (PlayerCard info)
gap-1.5     // Very tight (stat grids)
gap-2       // Tight (pills, small grids)
gap-3       // Normal (button groups)
gap-4       // Comfortable (info sections)
space-y-2.5 // Vertical sections (compact)
space-y-3   // Vertical sections (modal)
space-y-4   // Vertical sections (standard)
mb-2        // Section spacing (compact)
mb-3        // Section spacing (standard)
```

### Layout Patterns
- **Modals**: `max-w-md w-full` (adapts to mobile)
- **Pages**: `max-w-2xl mx-auto` (centered content column)
- **Card corners**: `rounded-2xl` (cards), `rounded-xl` (nested), `rounded-lg` (pills/buttons)
- **Full-width CTAs**: Always `w-full` on mobile, `py-3` minimum height

---

## 🏗️ Architecture Decisions

### Pages vs Modals

**MODALS (Query Params):**
- Player Profiles: `/?player=marcus-123`
- Why: Fast, preserves context, shareable
- Opens in CoachHome, PlayerHome, or AnonymousHome
- SEO not critical (players share links directly)

**FULL PAGES (Routes):**
- Postings: `/posting/duke-point-guard`
- Why: SEO-critical, coaches want postings found via Google
- Shareable on social media (Twitter, Instagram)
- Works for anonymous users (drives signups)

**RULE OF THUMB:**
- Content that needs SEO = Page
- Quick views in-app = Modal (optional)
- Shareable recruiting content = Page

---

## 👥 User Roles & Contexts

### Anonymous Users (Not Logged In)
- **Home**: AnonymousHome.tsx (landing page with value prop)
- **Can view**: Player profiles (limited), Posting pages (full)
- **CTA**: "Sign Up to Apply" or "Sign In"
- **Redirects**: Store intended destination in `?redirect=...`

### Players (Logged In)
- **Home**: PlayerHome.tsx
- **Can view**: Full player profiles, posting pages with personalization
- **Actions**: Apply, Save, Share
- **Special**: Own profile shows analytics (views, applications)

### Coaches (Logged In)
- **Home**: CoachHome.tsx
- **Can view**: Player profiles (with contact), own postings (with analytics)
- **Actions**: Review Applications, Edit Posting, Accept/Reject
- **Special**: Own postings show performance metrics

---

## 🧩 Core Components Library

### 1️⃣ PlayerCard (PlayerCardFinal1.tsx) ✅

**Dimensions**: `w-[315px] h-[540px]` (scaled down 10%)

**Props**:
```tsx
interface PlayerCardProps {
  player: PlayerProfile;
  flippable?: boolean;      // default true
  visitOnClick?: boolean;   // default false - opens modal instead
  onVisit?: (player: PlayerProfile) => void;
}
```

**FRONT Structure**:
```
┌─────────────────────────────────────┐
│ Proph (top-left, yellow glow)      │
│                                     │
│ [PHOTO - 60% height]               │
│ [Gradient scrim]                   │
│ Marcus Johnson                     │ ← text-xl font-black
│ Point Guard • Class of 2025        │ ← text-xs
├─────────────────────────────────────┤
│ [YELLOW STRIP]                     │
│ YOUR PROPH: D1 - Power 5          │ ← text-xl font-black
├─────────────────────────────────────┤
│ Lincoln High    6'2"               │ ← text-sm, NO labels
│ Chicago, IL                        │
│ ─────────────────────              │
│  22.4    4.2    8.1                │ ← text-base, yellow
│  PPG     RPG    APG                │ ← text-[9px]
└─────────────────────────────────────┘
```

**BACK Structure**:
```
┌─────────────────────────────────────┐
│ Proph                              │
│                                     │
│ SEASON STATS                       │
│ [4-column grid: PPG/RPG/APG/STL   │
│  FG%/3PT%/FT%/BLK]                │
│                                     │
│ [View Highlights] ← Yellow CTA     │
│                                     │
│ PLAYING STYLE                      │
│ Similar to: Chris Paul, Kyrie...   │
│                                     │
│ ACADEMIC INFO (Coaches only)       │
│ GPA: 3.8 • SAT: 1250               │
│                                     │
│ CONTACT (Coaches only)             │
│ email • phone                      │
└─────────────────────────────────────┘
```

**Key Styling**:
- Logo: `text-proph-yellow text-xl` with `textShadow + letterSpacing: -2px`
- Yellow strip: `bg-proph-yellow py-2.5 px-3`
- Stats grid: `grid-cols-4 gap-1.5`, cells `p-1.5 bg-proph-black`
- All padding reduced by ~20% from original

---

### 2️⃣ PlayerAccordion (PlayerAccordion.tsx) ✅

**Purpose**: Showcase 3 player cards (left, center, right) with navigation

**Props**:
```tsx
interface PlayerAccordionProps {
  players: PlayerProfile[];
  autoRotate?: boolean;
  autoRotateInterval?: number;
  onPlayerClick?: (player: PlayerProfile) => void; // Opens modal
}
```

**Behavior**:
- Shows 3 cards: left (faded), center (active), right (faded)
- Arrow buttons + dots at TOP (between header and cards)
- `mb-3` spacing between controls and cards
- Click center card → Opens PlayerProfileModal (if onPlayerClick provided)
- Click side cards → Opens modal (not navigate accordion)
- Card wrappers: `max-w-[calc(100vw-32px)] sm:max-w-sm` (responsive)

**No far-right card** - Only 3 cards visible max

---

### 3️⃣ PlayerProfileModal (PlayerProfileModal.tsx) ✅

**Trigger**: Query param `/?player=marcus-123`

**Layout**:
```
┌─────────────────────────────────────┐
│ [←] Marcus Johnson            [X]  │ ← Header
├─────────────────────────────────────┤
│                                     │
│   [PlayerCard - Flippable]         │ ← Centered
│                                     │
├─────────────────────────────────────┤
│ [Share Profile]                    │ ← Action buttons
│ [View Team Page] (future)          │
└─────────────────────────────────────┘
```

**Styling**:
- Backdrop: `bg-black/80 backdrop-blur-sm` (iOS style)
- Modal: `bg-proph-grey rounded-2xl max-w-md`
- Animations: `fadeIn + slideUp` (300ms)
- ESC key + backdrop click closes
- Query param cleared on close

**Role-based content**:
- Anonymous: Basic profile, "Sign Up to Contact"
- Player (own): Shows analytics, Edit button
- Player (other): Shows profile, Share button
- Coach: Shows contact info, "Invite to Apply" (future)

---

### 4️⃣ PostingCard (Horizontal Variant) ✅

**Used on**: Browse pages, recommendations

**Structure**:
```
┌─────────────────────────────────────┐
│ [School Logo] Duke University      │
│ D1                                  │
│                                     │
│ POINT GUARD                        │ ← text-3xl font-black
│                                     │
│ 6'0"+ • Class 2025 • 3.5 GPA      │ ← Pills
│ Dec 19 • 12 applications           │ ← Meta
│                                     │
│ [APPLY NOW] ← Yellow CTA           │
└─────────────────────────────────────┘
```

**Actions**:
- Click card → Navigate to `/posting/:id`
- Click Apply → Opens ApplyModal (player) or navigate to posting page

---

### 5️⃣ PostingDetailPage (PostingDetailPage.tsx) ✅

**Route**: `/posting/:id` (SEO-friendly)

**Layout**:
```
┌─────────────────────────────────────┐
│ [Proph Logo]          [Sign In]    │ ← Header
├─────────────────────────────────────┤
│ [School Logo + Name]               │
│                                     │
│ POINT GUARD (huge)                 │ ← Yellow banner
│                                     │
│ Requirements:                      │
│ • Height: 6'0"+                    │
│ • Class: 2025                      │
│ • GPA: 3.5+                        │
│                                     │
│ About This Position:               │
│ [Optional description text]        │
│                                     │
│ Deadline: Dec 19 • 12 applied      │
├─────────────────────────────────────┤
│ [PRIMARY ACTION] ← Role-based      │
│ [Share Posting]                    │
└─────────────────────────────────────┘
```

**Role-based actions**:
```tsx
// Anonymous
[Sign Up to Apply] → Redirect to signup with ?redirect=/posting/:id

// Player
[Apply to This Position] → Opens ApplyModal

// Coach (own posting)
[Review Applications] → Navigate to /coach/applications?posting=:id
[Edit Posting] → Opens EditPostingModal

// Coach (other posting)
[Share Posting] (only)
```

**Description field**: Optional 500-char textarea in CreatePostingModal

---

### 6️⃣ ApplicationCard (Coach View) ✅

**Used on**: Review Applications page

**Layout**:
```
┌─────────────────────────────────────┐
│ [Player Photo] Marcus Johnson      │
│ Point Guard • Class of 2025        │
│ Lincoln High • 6'2" • Chicago, IL  │
│                                     │
│ 22.4 PPG  4.2 RPG  8.1 APG        │
│                                     │
│ Applied 11 months ago              │
├─────────────────────────────────────┤
│ [View Profile] [Accept] [Reject]   │ ← Inline buttons
└─────────────────────────────────────┘
```

**Button styling** (Flat & Sharp):
```tsx
// View Profile - Yellow
className="flex-1 bg-proph-yellow text-proph-black font-semibold text-sm py-2.5 px-4 rounded-lg"

// Accept - Green (ONLY place we use green)
className="flex-1 bg-proph-success text-white font-semibold text-sm py-2.5 px-4 rounded-lg"

// Reject - Red (ONLY place we use red)
className="flex-1 bg-proph-error text-white font-semibold text-sm py-2.5 px-4 rounded-lg"
```

**Status indicators** (top border):
```tsx
// Pending
className="border-t-4 border-proph-yellow"

// Accepted
className="border-t-4 border-proph-success"

// Rejected
className="border-t-4 border-proph-error"
```

**Buttons are inline (1/3 width each)** - No stacked layout

---

### 7️⃣ CoachHome (CoachHome.tsx) ✅

**Route**: `/` (when logged in as coach)

**Sections**:
1. Header (logo + bell)
2. Search bar (universal: players, schools, coaches)
   - Shows dropdown with results (max 10)
   - NO full search results page
3. "Grow Your Program" cards:
   - Create New Posting → Navigate to `/coach/postings` + open modal
   - Review Applications → Navigate to `/coach/applications`
4. Player Accordion (Discover Recruits)
   - 3 cards, auto-rotate
   - Click card → Opens PlayerProfileModal via `?player=:id`

**Bottom Nav**: Home, Postings (Edit icon), Applications, My Team

---

### 8️⃣ Postings Page (Coach) ✅

**Route**: `/coach/postings`

**Header**: `[School Logo] Duke Basketball Postings`

**Layout**:
```
┌─────────────────────────────────────┐
│ [Duke Logo] Duke Basketball        │
├─────────────────────────────────────┤
│ [+ Create New Posting] ← HUGE      │
├─────────────────────────────────────┤
│ ACTIVE (2)                         │
│ [PostingCard]                      │
│ • 12 apps • Expires Dec 19         │
│ [Go Review Applications] [Edit] [×]│
│                                     │
│ [PostingCard]                      │
│ • 8 apps • Expires Dec 14          │
│ [Go Review Applications] [Edit] [×]│
│                                     │
│ EXPIRED (1)                        │
│ [PostingCard]                      │
│ [Go Review Applications] [Edit] [×]│
└─────────────────────────────────────┘
```

**Actions**:
- Create New Posting → Opens CreatePostingModal
- Go Review Applications → Navigate to `/coach/applications?posting=:id&status=all`
- Edit → Opens EditPostingModal
- Delete → Confirmation then delete

---

### 9️⃣ Applications Page (Coach) ✅

**Route**: `/coach/applications`

**Filters** (Multi-select chips):
```
Status: [Pending] [Accepted] [Rejected] ← Click to toggle
Posting: [All] [Point Guard - Duke] [Shooting Guard - Duke]
```

**Default state**:
- From bottom nav: All filters inactive (empty state)
- From "Review Applications": Posting + all statuses selected
- Empty state: "Select at least one status to view applications"

**Layout**:
```
┌─────────────────────────────────────┐
│ Review Applications                 │
│ Status: [Pending] [Accepted]       │ ← Multi-select
│ Posting: [Point Guard - Duke]      │
├─────────────────────────────────────┤
│ Point Guard - Duke (8 apps)        │ ← Grouped
│ [ApplicationCard] ← Yellow border  │
│ [ApplicationCard] ← Green border   │
│                                     │
│ Shooting Guard - Duke (4 apps)     │
│ [ApplicationCard] ← Yellow border  │
└─────────────────────────────────────┘
```

**Accept/Reject flow**:
- Accept → Opens AcceptConfirmationModal (optional message)
- Reject → Instant (or confirmation modal)
- App moves to correct tab immediately (page refresh)

---

### 🔟 AnonymousHome (AnonymousHome.tsx) ✅

**Route**: `/` (when not logged in)

**Purpose**: Landing page with value prop + signup CTAs

**Layout**:
```
┌─────────────────────────────────────┐
│ [Proph]              [Sign In] [Sign Up] │
├─────────────────────────────────────┤
│ The Smartest Path to                │
│ College Basketball                  │
│                                     │
│ Data-driven recruiting for D2/D3    │
│                                     │
│ [I'm a Player] [I'm a Coach]       │
│                                     │
│ [Features Grid]                    │
│ • Algorithmic Evaluation           │
│ • Direct Connections               │
│ • Affordable & Transparent         │
└─────────────────────────────────────┘
```

**Handles query params**:
- `?player=marcus-123` → Opens PlayerProfileModal on top of landing

---

## 🎯 Design Principles (Updated)

### 1. **Minimal Color Palette**
- **95% of UI**: Yellow, Black, Grey only
- **Green/Red**: ONLY for Accept/Reject buttons (coach actions)
- **No traffic light status colors**: Use borders, not badges
- **Yellow for attention**: CTAs, active states, stats

### 2. **Pages for SEO, Modals for Speed**
- Postings = Full pages (SEO)
- Player profiles = Query param modals (speed)
- In-app navigation = Prefer modals (preserves context)

### 3. **Mobile-First, Fixed Dimensions**
- Design for 375px width
- PlayerCard: Fixed 315×540px
- Cards responsive with `max-w-[calc(100vw-32px)]`

### 4. **Flat & Sharp Buttons**
- `rounded-lg` (not rounded-xl for buttons anymore)
- Smaller padding: `py-2.5` (was py-4)
- Tighter text: `text-sm font-semibold`
- Inline layout for actions (1/3 width each)

### 5. **No Labels Style**
- PlayerCard: School and height side-by-side, NO "School:" label
- Stats: Numbers prominent, labels tiny (`text-[9px]`)
- Info hierarchy through size, not labels

### 6. **Dark Always, Contrast Critical**
- Page: `bg-proph-black`
- Cards: `bg-proph-grey`
- Text on photos: Gradient scrim + drop shadow ALWAYS
- Minimum 4.5:1 contrast ratio

---

## 🛠️ Component Checklist

### Building New Components:

**✅ DO:**
- Start with `bg-proph-black` (page) or `bg-proph-grey` (card)
- Use `text-proph-white` / `text-proph-grey-text` for text
- Make CTAs `bg-proph-yellow text-proph-black font-bold`
- Use `rounded-2xl` (cards), `rounded-lg` (buttons/pills)
- Add hover: `hover:bg-proph-yellow/90`
- Fixed dimensions for cards (315×540 for PlayerCard)
- Query params for modals: `?player=:id`
- Full routes for SEO pages: `/posting/:id`

**❌ DON'T:**
- Use slate/gray/zinc/neutral (only proph colors)
- Use white/light backgrounds
- Add green/red except Accept/Reject buttons
- Create percentage match scores (use "Great Fit" labels)
- Make buttons too big (py-2.5, not py-4)
- Stack buttons (use inline `flex gap-2`)
- Use labels when values are self-explanatory

---

## 🔧 Tech Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4 (custom proph colors)
- **Icons**: Lucide React
- **Routing**: React Router v6
- **State**: React hooks (useState, useEffect)
- **Build**: Vite
- **Font**: Inter (Google Fonts)

---

## 📋 Quick Reference

### Common Patterns:

**Modal Structure**:
```tsx
<div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
  <div className="max-w-md mx-auto bg-proph-grey rounded-2xl">
    <header className="border-b border-proph-grey-text/20 p-4">
      [←] Title [X]
    </header>
    <div className="p-6">{content}</div>
    <footer className="border-t border-proph-grey-text/20 p-4">
      {actions}
    </footer>
  </div>
</div>
```

**Button Styles**:
```tsx
// Primary CTA
"bg-proph-yellow text-proph-black font-bold py-3 px-6 rounded-lg"

// Secondary
"bg-proph-grey-light text-proph-white font-semibold py-3 px-6 rounded-lg"

// Accept (green - rare)
"bg-proph-success text-white font-semibold py-2.5 px-4 rounded-lg"

// Reject (red - rare)
"bg-proph-error text-white font-semibold py-2.5 px-4 rounded-lg"
```

**Card Template**:
```tsx
<div className="bg-proph-grey rounded-2xl p-6 border border-proph-grey-text/20">
  {content}
</div>
```

---

**Last Updated**: October 30, 2025 - Added PostingDetailPage, ApplicationCard redesign, query param modals, minimal color palette