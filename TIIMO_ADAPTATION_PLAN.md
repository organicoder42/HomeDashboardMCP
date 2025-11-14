# Tiimo Dashboard Adaptation Plan

**Project**: HomeDashboardMCP
**Date**: November 2025
**Goal**: Transform MCP dashboard into Tiimo-inspired visual planner while preserving all MCP functionality

---

## 🎯 Tiimo Research Summary

**Tiimo** is a visual daily planner designed for neurodivergent users (ADHD, autism, executive dysfunction).

### Key Characteristics:
- 🎨 **Visual Timeline**: Color-coded schedule with clear daily overview
- 🔄 **Drag & Drop**: Intuitive task reordering
- ⏱️ **Countdown Timers**: Visual time anchors for task transitions
- 🎨 **Customization**: Rich color palette, icons, and layouts
- 🤖 **AI Co-Planner**: Breaks down tasks, estimates time
- 📊 **Progress Tracking**: Visual indicators and mood check-ins
- ♿ **Accessibility First**: Reduces friction, built on executive functioning research
- 📱 **Clean UI**: Minimalist, focus-friendly design

### Target Users:
- People with ADHD
- Individuals with autism
- Anyone with executive dysfunction
- People seeking visual task management
- Users who struggle with traditional planners

---

## 📋 Implementation Phases

### **Phase 1: Visual Timeline & Layout** 🎨

**Goal**: Transform from card-list to visual timeline

#### Components to Build:
1. **Timeline View Component**
   - Replace grid layout with vertical timeline
   - Add time slots/blocks (show task order)
   - Color-coded task blocks based on category/priority
   - Drag-and-drop reordering (using @dnd-kit/core)
   - Today's focus view with past/upcoming sections
   - Smooth scroll and animations

2. **Color System Enhancement**
   - Expand from basic status colors to vibrant Tiimo-style palette
   - 8-10 customizable colors per category
   - Soft, rounded corners and gradient accents
   - Add color picker component for categories
   - Color themes: Calm (blues/purples), Energetic (orange/yellow), Nature (greens), Custom

3. **Icon System**
   - Add icon library (lucide-react)
   - Icons for common task types:
     - Work: 💼 Briefcase, Computer, Target
     - Health: 🏃 Running, Heart, Apple
     - Leisure: 🎮 Game, Book, Music
     - Household: 🏠 Home, Cleaning, Cooking
     - Social: 👥 Users, Phone, Calendar
   - Visual markers alongside text
   - Icon picker component

#### MCP Integration:
- Add `color` field (string, hex color) to database schema
- Add `icon` field (string, icon name) to database schema
- Update `write_dashboard_entry` to accept color/icon
- Update `update_dashboard_entry` to modify color/icon

#### Files to Modify:
- `db/schema.ts` - Add color/icon fields
- `components/dashboard/dashboard-entries.tsx` - New timeline component
- `app/dashboard/page.tsx` - Updated layout
- `lib/mcp-tools.ts` - Add color/icon to tool schemas

---

### **Phase 2: Timer & Progress Features** ⏱️

#### Components to Build:
1. **Countdown Timer Widget**
   - Per-task timer component
   - Visual countdown (circular progress ring using react-circular-progressbar)
   - Duration estimation field
   - Start/pause/complete actions
   - Sound/notification options (optional)
   - Timer state persistence

2. **Progress Indicators**
   - Visual progress bars per task
   - Daily completion percentage widget
   - Weekly streak tracking
   - Animated transitions (framer-motion)
   - Celebration animations on completion

3. **Time Blocking**
   - Add optional start/end time fields
   - Visual time-of-day indicators
   - Morning/afternoon/evening sections
   - Duration estimates
   - Time conflict detection

#### MCP Integration:
- Add `duration` field (integer, minutes)
- Add `startTime` field (timestamp, optional)
- Add `endTime` field (timestamp, optional)
- Add `timerState` field (JSON: {running: bool, elapsed: int, pausedAt: timestamp})
- New MCP tools:
  - `start_task_timer(id)` - Start timer for a task
  - `pause_task_timer(id)` - Pause timer
  - `complete_task_timer(id)` - Mark task complete and stop timer

#### Files to Create:
- `components/timer/countdown-timer.tsx`
- `components/timer/progress-ring.tsx`
- `components/widgets/daily-progress.tsx`
- `lib/timer-utils.ts`

#### Files to Modify:
- `db/schema.ts` - Add timer fields
- `lib/mcp-tools.ts` - Add timer tools
- `app/api/mcp/route.ts` - Implement timer handlers

---

### **Phase 3: Enhanced Interactivity** 🎯

#### Components to Build:
1. **Drag & Drop**
   - @dnd-kit/core integration
   - Draggable task cards
   - Drop zones for reordering
   - Visual feedback during drag
   - Touch-friendly on mobile
   - Smooth animations

2. **Quick Actions**
   - Inline edit mode for task fields
   - Quick status toggle buttons
   - Priority adjustment buttons
   - Swipe actions on mobile (swipe left for complete, right for delete)
   - Keyboard shortcuts:
     - `n` - New task
     - `e` - Edit selected task
     - `d` - Delete selected task
     - `Space` - Toggle timer
     - `Arrow keys` - Navigate tasks

3. **Focus Mode**
   - Single-task focus view
   - Hide distractions (sidebar, filters)
   - Timer integration
   - Break reminders (Pomodoro-style)
   - Full-screen option
   - Zen mode with calming background

#### MCP Integration:
- Add `order` field (integer) for task sequencing
- New MCP tool:
  - `reorder_tasks(taskIds: number[])` - Update task order
- Update existing tools to respect order field

#### Files to Create:
- `components/dnd/draggable-task.tsx`
- `components/dnd/droppable-timeline.tsx`
- `components/focus/focus-mode.tsx`
- `hooks/useKeyboardShortcuts.ts`

---

### **Phase 4: AI & Mood Features** 🤖

#### Components to Build:
1. **AI Task Breakdown** (Optional - requires AI integration)
   - "Break down task" button on complex tasks
   - Uses MCP to create subtasks automatically
   - Time estimation suggestions
   - Could integrate with Claude API via MCP
   - Smart prioritization

2. **Mood Check-ins**
   - Simple mood selector widget (5 emoji states)
     - 😢 Struggling
     - 😟 Difficult
     - 😐 Okay
     - 🙂 Good
     - 😊 Great
   - Log mood with timestamps
   - Show mood patterns on dashboard
   - Mood-based task suggestions
   - Note field for context

3. **Smart Suggestions**
   - Suggest task priorities based on patterns
   - Recommend break times based on work duration
   - Highlight overdue items
   - Energy level tracking (link tasks to mood)
   - Best time of day suggestions per task type

#### MCP Integration:
- New database table: `mood_entries`
  - id (integer, primary key)
  - mood (string: struggling/difficult/okay/good/great)
  - note (text, optional)
  - energy_level (integer, 1-5)
  - timestamp (integer)
- New MCP tools:
  - `log_mood(mood, note?, energy_level?)` - Record mood
  - `get_mood_history(limit?, days?)` - Retrieve mood data
  - `break_down_task(id)` - AI-powered task breakdown
  - `get_task_suggestions()` - Get smart recommendations

#### Files to Create:
- `components/mood/mood-picker.tsx`
- `components/mood/mood-history.tsx`
- `components/ai/task-breakdown.tsx`
- `db/mood-schema.ts`

---

### **Phase 5: Customization & Accessibility** ♿

#### Components to Build:
1. **Theme System**
   - Light/dark mode toggle
   - High contrast mode for accessibility
   - Custom color themes (user-defined)
   - Font size options (small/medium/large)
   - Dyslexia-friendly font option (OpenDyslexic)
   - Reduced motion option
   - Theme presets: Default, Calm, Energetic, Nature, Contrast

2. **Widget System**
   - Modular dashboard widgets
   - Widget types:
     - Today's Focus (current task)
     - Upcoming Tasks (next 3-5)
     - Mood History (last 7 days)
     - Progress Stats (completion rate)
     - Time Tracking (hours logged)
     - Streak Counter (consecutive days)
   - Rearrangeable layout (drag & drop)
   - Show/hide widgets
   - Widget size options (small/medium/large)

3. **Accessibility**
   - ARIA labels on all interactive elements
   - Full keyboard navigation
   - Screen reader optimization
   - Skip to content links
   - Clear focus indicators (visible ring)
   - Sufficient color contrast (WCAG AA minimum)
   - Alt text for icons
   - Semantic HTML

#### MCP Integration:
- New database table: `user_preferences`
  - id (integer, primary key)
  - theme (string: light/dark/high-contrast)
  - font_size (string: small/medium/large)
  - reduced_motion (boolean)
  - dyslexia_font (boolean)
  - color_scheme (JSON: custom colors)
  - widget_layout (JSON: widget positions)
- New MCP tools:
  - `update_preferences(preferences)` - Update user settings
  - `get_preferences()` - Retrieve user settings

#### Files to Create:
- `components/theme/theme-switcher.tsx`
- `components/widgets/widget-container.tsx`
- `components/widgets/today-focus.tsx`
- `components/widgets/upcoming-tasks.tsx`
- `components/widgets/mood-widget.tsx`
- `components/widgets/stats-widget.tsx`
- `hooks/useTheme.ts`
- `lib/accessibility-utils.ts`

---

### **Phase 6: Enhanced Database Schema** 💾

#### New Fields for `dashboard_entries`:
```typescript
{
  // Existing fields
  id: integer (primary key)
  title: text
  content: text
  status: text (pending|in_progress|completed|cancelled)
  priority: text (low|medium|high|urgent)
  category: text
  tags: text (JSON array)
  createdAt: integer (timestamp)
  updatedAt: integer (timestamp)

  // NEW FIELDS
  color: text (hex color, e.g., "#8B5CF6")
  icon: text (icon name, e.g., "briefcase")
  duration: integer (estimated minutes)
  startTime: integer (timestamp, optional)
  endTime: integer (timestamp, optional)
  order: integer (sequence number for ordering)
  timerState: text (JSON: {running, elapsed, pausedAt})
  completedAt: integer (timestamp when marked complete)
  mood: text (mood when completed)
  parentId: integer (for subtasks, references parent task id)
  energyLevel: integer (1-5, estimated energy required)
}
```

#### New Tables:

**`mood_entries`**:
```typescript
{
  id: integer (primary key)
  mood: text (struggling|difficult|okay|good|great)
  note: text (optional context)
  energy_level: integer (1-5)
  timestamp: integer
}
```

**`user_preferences`**:
```typescript
{
  id: integer (primary key)
  theme: text (light|dark|high-contrast)
  font_size: text (small|medium|large)
  reduced_motion: integer (boolean)
  dyslexia_font: integer (boolean)
  color_scheme: text (JSON object)
  widget_layout: text (JSON array)
  updated_at: integer (timestamp)
}
```

#### Migration Strategy:
- Add new fields with default values for backwards compatibility
- Existing entries will have:
  - `color`: default based on category/priority
  - `icon`: default "circle" icon
  - `duration`: null (can be estimated)
  - `order`: assigned based on createdAt
- Create new tables with initial seeding
- Run migration: `npm run db:generate && npm run db:push`

---

## 🚀 Implementation Priority

### **Quick Win (Week 1)** - Core Visual Redesign:
- [ ] Timeline layout with vertical flow
- [ ] Expanded color palette (8-10 colors)
- [ ] Icon system integration (lucide-react)
- [ ] Better visual hierarchy
- [ ] Rounded corners and modern styling
- [ ] Color and icon pickers

**Estimated Effort**: 15-20 hours

### **Core Features (Week 2-3)** - Interactivity:
- [ ] Drag & drop reordering (@dnd-kit)
- [ ] Countdown timers with circular progress
- [ ] Progress indicators and daily stats
- [ ] Time blocking with start/end times
- [ ] Quick action buttons
- [ ] Keyboard shortcuts

**Estimated Effort**: 25-30 hours

### **Polish (Week 3-4)** - UX Enhancements:
- [ ] Mood check-in system
- [ ] Theme customization (light/dark/contrast)
- [ ] Widget system (modular dashboard)
- [ ] Accessibility improvements (ARIA, keyboard nav)
- [ ] Focus mode
- [ ] Animations (framer-motion)

**Estimated Effort**: 20-25 hours

### **Advanced (Week 4+)** - AI & Analytics:
- [ ] AI task breakdown (Claude integration)
- [ ] Smart suggestions based on patterns
- [ ] Analytics dashboard with charts
- [ ] Mood pattern analysis
- [ ] Energy level tracking
- [ ] Productivity insights

**Estimated Effort**: 30-40 hours

---

## 🎨 Design Mockup Concept

### Desktop View:
```
┌─────────────────────────────────────────────────────────────┐
│  🏠 Tiimo Dashboard            🌙 Theme  ⚙️ Settings  👤 User │
├─────────────────────────────────────────────────────────────┤
│  Today: Wednesday, Nov 14, 2025                😊 How are you? │
│  ──────────────────────────────────────────────────────────  │
│                                                               │
│  ┌─────────────────────────────┐  ┌──────────────────────┐  │
│  │ Timeline                    │  │ Today's Focus        │  │
│  │                             │  │                      │  │
│  │  Morning ☀️                 │  │ 💼 Review PRs        │  │
│  │  ┌────────────────────────┐ │  │ [⏱️ 32:15 / 45:00]   │  │
│  │  │ 🏃 Morning Routine  ✓  │ │  │ ████████░░░░ 71%    │  │
│  │  │ 30 minutes         🟣  │ │  │                      │  │
│  │  │ Completed at 8:30am    │ │  │ [Pause] [Complete]  │  │
│  │  └────────────────────────┘ │  └──────────────────────┘  │
│  │                             │                             │
│  │  ┌────────────────────────┐ │  ┌──────────────────────┐  │
│  │  │ 💼 Review PRs      ▶️  │ │  │ Progress Today       │  │
│  │  │ 45 minutes         🔵  │ │  │ ═══════════░░░  75%  │  │
│  │  │ In progress...         │ │  │ 3/4 tasks completed  │  │
│  │  │ ████████░░░░░░  60%    │ │  │                      │  │
│  │  └────────────────────────┘ │  │ 🔥 3 day streak!     │  │
│  │                             │  └──────────────────────┘  │
│  │  Afternoon 🌤️              │                             │
│  │  ┌────────────────────────┐ │  ┌──────────────────────┐  │
│  │  │ 🛠️ Fix dashboard bug   │ │  │ Mood This Week       │  │
│  │  │ 60 minutes         🟠  │ │  │ 😊 😊 😐 🙂 😊 😊 🙂 │  │
│  │  │ High priority          │ │  │ Mon-----------------Sun │  │
│  │  └────────────────────────┘ │  └──────────────────────┘  │
│  │                             │                             │
│  │  Evening 🌙                 │                             │
│  │  ┌────────────────────────┐ │                             │
│  │  │ 📚 Read documentation  │ │                             │
│  │  │ 30 minutes         🟢  │ │                             │
│  │  └────────────────────────┘ │                             │
│  │                             │                             │
│  │  + Add task                 │                             │
│  └─────────────────────────────┘                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile View:
```
┌─────────────────────┐
│ 🏠  Tiimo   🌙  ☰  │
├─────────────────────┤
│ Wed, Nov 14         │
│ 😊 How are you?     │
├─────────────────────┤
│                     │
│ [Today's Focus]     │
│ ┌─────────────────┐ │
│ │ 💼 Review PRs   │ │
│ │ ⏱️ 32:15/45:00  │ │
│ │ ████████░░ 71%  │ │
│ │ [⏸️] [✓]        │ │
│ └─────────────────┘ │
│                     │
│ Morning ☀️          │
│ ┌─────────────────┐ │
│ │ 🏃 Routine   ✓ │ │
│ │ 8:30am      🟣 │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 💼 PRs      ▶️  │ │
│ │ In progress 🔵 │ │
│ └─────────────────┘ │
│                     │
│ Afternoon 🌤️       │
│ ┌─────────────────┐ │
│ │ 🛠️ Fix bug  🟠 │ │
│ └─────────────────┘ │
│                     │
│     + Add Task      │
│                     │
├─────────────────────┤
│ 📊 3/4  🔥3 days   │
└─────────────────────┘
```

---

## ✅ Preserving MCP Functionality

### Backwards Compatibility:
All existing MCP tools remain fully functional:

1. **`write_dashboard_entry`** ✅
   - All existing parameters work
   - New optional parameters: color, icon, duration, startTime, endTime, order, energyLevel
   - Defaults provided for new fields

2. **`get_dashboard_entries`** ✅
   - Returns new fields in response
   - Filtering and limiting unchanged
   - New optional filters: hasTimer, orderBy

3. **`update_dashboard_entry`** ✅
   - All existing parameters work
   - Can update new fields (color, icon, etc.)
   - Partial updates supported

4. **`delete_dashboard_entry`** ✅
   - Unchanged functionality
   - Also deletes related subtasks if parentId exists

### New MCP Tools:

5. **`reorder_tasks`**
   - Parameters: `taskIds: number[]` (ordered array)
   - Updates order field for all tasks
   - Example: `reorder_tasks([3, 1, 5, 2])` sets order

6. **`start_task_timer`**
   - Parameters: `id: number`
   - Starts timer, updates timerState
   - Returns current timer state

7. **`pause_task_timer`**
   - Parameters: `id: number`
   - Pauses timer, saves elapsed time
   - Returns current timer state

8. **`complete_task_timer`**
   - Parameters: `id: number`
   - Marks task as completed
   - Stops timer and records completedAt
   - Optional: prompts for mood

9. **`log_mood`**
   - Parameters: `mood: string`, `note?: string`, `energy_level?: number`
   - Records mood entry
   - Returns mood entry with timestamp

10. **`get_mood_history`**
    - Parameters: `limit?: number`, `days?: number`
    - Retrieves mood entries
    - Returns array of mood data

11. **`break_down_task`** (Future - AI integration)
    - Parameters: `id: number`
    - Uses AI to break task into subtasks
    - Creates multiple entries with parentId
    - Returns array of created subtasks

12. **`get_task_suggestions`** (Future - AI integration)
    - Parameters: none
    - Analyzes patterns and returns suggestions
    - Returns array of recommendations

### MCP API Endpoint:
- Endpoint: `/api/mcp` (unchanged)
- Method: POST (unchanged)
- Authentication: API key via `X-API-Key` header (existing)
- Response format: JSON-RPC 2.0 (unchanged)

---

## 🛠️ Technology Stack Additions

### New Dependencies:
```json
{
  "@dnd-kit/core": "^6.1.0",              // Drag and drop
  "@dnd-kit/sortable": "^8.0.0",          // Sortable lists
  "@dnd-kit/utilities": "^3.2.2",         // DnD utilities
  "react-circular-progressbar": "^2.1.0", // Timer UI
  "lucide-react": "^0.400.0",             // Icon system
  "framer-motion": "^11.0.0",             // Animations
  "zustand": "^4.5.0",                    // State management
  "recharts": "^2.10.0",                  // Analytics charts
  "date-fns": "^3.0.0"                    // Date utilities
}
```

### Existing Dependencies (Keep):
- `next`: ^15.0.0
- `react`: ^19.0.0
- `@libsql/client`: ^0.6.0 (Turso)
- `drizzle-orm`: ^0.30.0
- `tailwindcss`: ^3.4.0
- `typescript`: ^5.0.0
- `zod`: ^3.23.0

### Install Commands:
```bash
cd dashboard-mcp
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-circular-progressbar
npm install lucide-react
npm install framer-motion
npm install zustand
npm install recharts
npm install date-fns
```

---

## 📁 New File Structure

```
dashboard-mcp/
├── app/
│   ├── api/
│   │   ├── mcp/route.ts              # [MODIFY] Add new tools
│   │   ├── entries/route.ts          # [MODIFY] Add new fields
│   │   ├── mood/route.ts             # [NEW] Mood API
│   │   └── preferences/route.ts      # [NEW] User preferences API
│   ├── dashboard/
│   │   └── page.tsx                  # [MODIFY] New layout
│   └── page.tsx                      # [KEEP] Home redirect
├── components/
│   ├── dashboard/
│   │   ├── dashboard-entries.tsx     # [MODIFY] Timeline view
│   │   ├── timeline-view.tsx         # [NEW] Main timeline
│   │   ├── task-card.tsx             # [NEW] Individual task card
│   │   └── task-filters.tsx          # [NEW] Filter component
│   ├── timer/
│   │   ├── countdown-timer.tsx       # [NEW] Timer component
│   │   ├── progress-ring.tsx         # [NEW] Circular progress
│   │   └── timer-controls.tsx        # [NEW] Start/pause buttons
│   ├── mood/
│   │   ├── mood-picker.tsx           # [NEW] Mood selector
│   │   ├── mood-history.tsx          # [NEW] Mood chart
│   │   └── mood-widget.tsx           # [NEW] Dashboard widget
│   ├── dnd/
│   │   ├── draggable-task.tsx        # [NEW] Draggable wrapper
│   │   └── droppable-timeline.tsx    # [NEW] Drop zone
│   ├── theme/
│   │   ├── theme-switcher.tsx        # [NEW] Theme toggle
│   │   └── color-picker.tsx          # [NEW] Color selector
│   ├── widgets/
│   │   ├── widget-container.tsx      # [NEW] Widget wrapper
│   │   ├── today-focus.tsx           # [NEW] Current task
│   │   ├── upcoming-tasks.tsx        # [NEW] Next tasks
│   │   ├── stats-widget.tsx          # [NEW] Progress stats
│   │   └── streak-widget.tsx         # [NEW] Streak counter
│   ├── icons/
│   │   └── icon-picker.tsx           # [NEW] Icon selector
│   └── focus/
│       └── focus-mode.tsx            # [NEW] Focus view
├── db/
│   ├── schema.ts                     # [MODIFY] Add new fields/tables
│   └── client.ts                     # [KEEP] Turso client
├── lib/
│   ├── mcp-tools.ts                  # [MODIFY] Add new tools
│   ├── timer-utils.ts                # [NEW] Timer logic
│   ├── mood-utils.ts                 # [NEW] Mood helpers
│   └── accessibility-utils.ts        # [NEW] A11y helpers
├── hooks/
│   ├── useTimer.ts                   # [NEW] Timer hook
│   ├── useDragDrop.ts                # [NEW] DnD hook
│   ├── useKeyboardShortcuts.ts       # [NEW] Keyboard nav
│   └── useTheme.ts                   # [NEW] Theme hook
├── styles/
│   ├── globals.css                   # [MODIFY] Theme variables
│   └── animations.css                # [NEW] Custom animations
└── types/
    ├── dashboard.ts                  # [NEW] Type definitions
    ├── mood.ts                       # [NEW] Mood types
    └── theme.ts                      # [NEW] Theme types
```

---

## 🎨 Color Palette (Tiimo-Inspired)

### Primary Colors:
```css
--purple: #8B5CF6    /* Primary actions, focus */
--blue: #3B82F6      /* Work, productivity */
--green: #10B981     /* Health, wellness */
--orange: #F59E0B    /* High priority, urgent */
--pink: #EC4899      /* Personal, social */
--teal: #14B8A6      /* Learning, growth */
--indigo: #6366F1    /* Creative tasks */
--red: #EF4444       /* Critical, urgent */
```

### Status Colors:
```css
--completed: #10B981   /* Green */
--in-progress: #3B82F6 /* Blue */
--pending: #F59E0B     /* Orange */
--cancelled: #6B7280   /* Gray */
```

### Neutral Colors:
```css
--gray-50: #F9FAFB
--gray-100: #F3F4F6
--gray-200: #E5E7EB
--gray-300: #D1D5DB
--gray-400: #9CA3AF
--gray-500: #6B7280
--gray-600: #4B5563
--gray-700: #374151
--gray-800: #1F2937
--gray-900: #111827
```

### Theme Presets:

**Calm Theme (Default)**:
- Background: Soft blues and purples
- Accents: Teal, indigo
- Use for: General productivity

**Energetic Theme**:
- Background: Warm oranges and yellows
- Accents: Red, pink
- Use for: High-energy tasks

**Nature Theme**:
- Background: Greens and earth tones
- Accents: Teal, green
- Use for: Wellness, outdoor tasks

**High Contrast Theme** (Accessibility):
- Background: Pure white or pure black
- Accents: High contrast colors
- Use for: Visual accessibility

---

## 📊 Success Metrics

### User Experience:
- [ ] Reduced time to add a task (< 10 seconds)
- [ ] Increased task completion rate
- [ ] Positive user feedback on visual design
- [ ] Improved accessibility scores (Lighthouse)
- [ ] Mobile-friendly (responsive on all devices)

### Technical:
- [ ] All existing MCP tools functional
- [ ] New MCP tools working correctly
- [ ] Page load time < 2 seconds
- [ ] No console errors
- [ ] 90+ Lighthouse score
- [ ] TypeScript strict mode with no errors

### Accessibility (WCAG AA):
- [ ] Color contrast ratio > 4.5:1
- [ ] Full keyboard navigation
- [ ] Screen reader compatible
- [ ] ARIA labels on all interactive elements
- [ ] Focus indicators visible

---

## 🚧 Implementation Checklist

### Phase 1 (Week 1):
- [ ] Install new dependencies (@dnd-kit, lucide-react, etc.)
- [ ] Update database schema (add color, icon, order fields)
- [ ] Run database migration
- [ ] Create timeline view component
- [ ] Add color palette and theme system
- [ ] Integrate icon system (lucide-react)
- [ ] Build color picker component
- [ ] Build icon picker component
- [ ] Update MCP tools with new fields
- [ ] Test MCP backwards compatibility
- [ ] Update UI to use new timeline layout

### Phase 2 (Week 2):
- [ ] Add timer fields to schema (duration, startTime, timerState)
- [ ] Build countdown timer component
- [ ] Build circular progress ring
- [ ] Implement timer controls (start/pause/complete)
- [ ] Add daily progress widget
- [ ] Add time blocking functionality
- [ ] Create new MCP timer tools
- [ ] Test timer persistence
- [ ] Add timer to timeline cards

### Phase 3 (Week 3):
- [ ] Integrate @dnd-kit for drag and drop
- [ ] Create draggable task cards
- [ ] Create droppable timeline zones
- [ ] Implement reorder_tasks MCP tool
- [ ] Add quick action buttons
- [ ] Implement keyboard shortcuts
- [ ] Build focus mode component
- [ ] Add swipe actions for mobile
- [ ] Test drag and drop on touch devices

### Phase 4 (Week 4):
- [ ] Create mood_entries table
- [ ] Build mood picker component
- [ ] Build mood history visualization
- [ ] Add mood widget to dashboard
- [ ] Implement log_mood MCP tool
- [ ] Implement get_mood_history MCP tool
- [ ] Add mood check-in prompts
- [ ] Build mood analytics
- [ ] (Optional) Start AI integration planning

### Phase 5 (Week 5):
- [ ] Create user_preferences table
- [ ] Build theme switcher component
- [ ] Implement light/dark/high-contrast themes
- [ ] Add font size controls
- [ ] Add dyslexia-friendly font option
- [ ] Build widget system architecture
- [ ] Create individual widget components
- [ ] Implement widget drag-and-drop layout
- [ ] Add accessibility audit
- [ ] Fix all accessibility issues

### Testing:
- [ ] Test all MCP tools with Claude Desktop
- [ ] Test all MCP tools with Claude Code CLI
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test with screen readers
- [ ] Test keyboard navigation
- [ ] Test in light and dark modes
- [ ] Performance testing (Lighthouse)
- [ ] Cross-browser testing

### Documentation:
- [ ] Update README.md with new features
- [ ] Update CLAUDE.md with new tools
- [ ] Add ACCESSIBILITY.md guide
- [ ] Create user guide with screenshots
- [ ] Document all new MCP tools
- [ ] Add code comments for complex logic

---

## 🎯 Next Steps

The plan is comprehensive and ready for implementation. Suggested approach:

1. **Start with Phase 1** (Visual Timeline & Layout) for immediate visual impact
2. **Proceed sequentially** through phases for logical feature buildout
3. **Test MCP compatibility** after each phase
4. **Gather feedback** after Phases 1-2 before proceeding

**Recommended First Step**: Update database schema and begin timeline view component.

---

## 📚 References

- **Tiimo App**: https://www.tiimoapp.com/
- **@dnd-kit Documentation**: https://docs.dndkit.com/
- **Lucide Icons**: https://lucide.dev/
- **Framer Motion**: https://www.framer.com/motion/
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Turso Database**: https://turso.tech/
- **Drizzle ORM**: https://orm.drizzle.team/

---

**Document Version**: 1.0
**Last Updated**: November 14, 2025
**Status**: Ready for Implementation
**Estimated Total Effort**: 110-155 hours (spread across 5+ weeks)
