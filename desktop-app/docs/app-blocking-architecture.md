# App Blocking Architecture

## Overview
This document outlines the architecture and implementation plan for the app blocking feature in the Loopd desktop application. The goal is to block usage of certain applications based on user-defined rules, such as time-of-day restrictions and daily usage limits. The blocking mechanism will overlay a block screen on the target app, and the system will work cross-platform (Windows, macOS, Linux). Rules and usage data will be stored locally and synced to Supabase for cross-device consistency. The app will run in tray/minimized mode.

**Integration with Existing App Tracking:** The app blocking feature will integrate with the existing `useAppTracking` hook and usage tracking system, leveraging the current app monitoring, session tracking, and usage data collection infrastructure.

---

## 1. Requirements
- **Block apps by name** using:
  - Time-of-day rules (e.g., block from 9am–5pm)
  - Daily usage limits (e.g., block after 1 hour/day)
- **Blocking method:** Overlay a block screen (not kill process)
- **Strictness:** User-selectable per rule (e.g., hard block, soft block/override)
- **Cross-platform:** Windows, macOS, Linux
- **Rule storage:** Local (for offline) and sync with Supabase (for cross-device)
- **App runs in tray/minimized mode**

---

## 2. High-Level Architecture

### A. Frontend (React/Next.js in Tauri)
- UI for:
  - Creating/editing block rules (app name, time, usage, strictness)
  - Viewing current blocks and usage stats
  - Selecting strictness level
- Tray icon/menu for quick access and status

### B. Backend (Rust in Tauri)
- **Process Monitoring:**
  - Cross-platform process list (using sysinfo or similar)
  - Track running apps by name
  - Track daily usage per app (store locally, sync to Supabase)
- **Rule Evaluation:**
  - Check if current time or usage triggers a block
  - Determine strictness and block state
- **Overlay Block Screen:**
  - Create a transparent, always-on-top window over the blocked app
  - Show reason, strictness, and (if allowed) override option
- **Tray/Minimized Mode:**
  - Minimize to tray, restore from tray, show status

### C. Sync Layer
- **Local Storage:** Store rules and usage in SQLite or JSON
- **Supabase Sync:** Push/pull rules and usage data for cross-device consistency

---

## 3. Key Implementation Details

### A. Process Monitoring & Usage Tracking
- **Leverage Existing Infrastructure:** Use the existing `useAppTracking` hook and backend commands for process monitoring and usage tracking
- **Extend Current Logic:** Enhance the existing app tracking to include block rule evaluation
- **Integration Points:**
  - Use existing `get_active_app` command for current app detection
  - Use existing `get_usage_summary` for daily usage data
  - Use existing session tracking for detailed app usage history
  - Extend the existing refresh interval (currently 15 seconds) for block rule evaluation
- **Block Rule Evaluation:** Check if current app and usage data trigger any block rules
- Store usage data locally and sync to Supabase (existing functionality)

### B. Rule Evaluation
- **Integration with useAppTracking:** Extend the existing hook to include block rule evaluation
- **Evaluation Logic:**
  - For the current active app (from `get_active_app`):
    - Check if current time is within a block window, or usage exceeds limit
    - Evaluate strictness: hard block (no override), soft block (allow override with warning)
  - **Performance:** Leverage existing refresh intervals to avoid additional polling overhead
- **State Management:** Add block status to the existing app tracking state

### C. Overlay Block Screen
- When an app is blocked:
  - Create an always-on-top, click-blocking window over the app
  - Show block reason, strictness, and override if allowed
- Cross-platform: Use Tauri's window API to create/manage overlays

### D. Tray/Minimized Mode
- Use Tauri's tray API to:
  - Minimize app to tray
  - Show status (e.g., "Blocking 2 apps")
  - Restore main window from tray

### E. Sync with Supabase
- On rule/usage change, sync to Supabase
- On app start, pull latest rules/usage from Supabase
- Handle merge conflicts (e.g., last-write-wins or prompt user)

---

## 4. Data Models

### Block Rule
```ts
{
  id: string,
  appName: string,
  blockType: 'time' | 'usage',
  timeWindow?: { start: string, end: string }, // e.g., { start: "09:00", end: "17:00" }
  dailyLimitMinutes?: number,
  strictness: 'hard' | 'soft',
  enabled: boolean,
  createdAt: string,
  updatedAt: string
}
```

### Usage Record
```ts
{
  appName: string,
  date: string, // YYYY-MM-DD
  minutesUsed: number
}
```

### Extended App Tracking State
```ts
// Extend existing AppState interface
interface AppState {
  usage: UsageSummary[];
  sessions: Session[];
  currentApp: string;
  lastUpdate: string;
  deviceId: string;
  isClearing: boolean;
  // New blocking-related state
  blockRules: BlockRule[];
  currentBlockStatus: {
    isBlocked: boolean;
    rule?: BlockRule;
    reason: string;
    canOverride: boolean;
  } | null;
  isBlockingEnabled: boolean;
}
```

---

## 5. IPC/Communication
- **Extend Existing Commands:** Add new Tauri commands for block rule management
- **Frontend to Backend:**
  - Rule CRUD operations (create, read, update, delete block rules)
  - Block status queries
  - Override requests for soft blocks
- **Backend to Frontend:**
  - Block events (when an app becomes blocked/unblocked)
  - Usage updates (existing functionality)
  - Sync status (existing functionality)
- **Event System:** Use existing Tauri event system for real-time updates

---

## 6. Implementation Steps
1. **Extend Data Models:** Add block rule types and extend existing app tracking state
2. **Enhance useAppTracking Hook:** Integrate block rule evaluation into existing tracking logic
3. **Add Backend Commands:** Create new Tauri commands for block rule management
4. **Implement Overlay Window Logic:** Create block screen overlay using Tauri window API
5. **Build Rule Evaluation Engine:** Integrate with existing usage tracking for rule evaluation
6. **Create Frontend UI:** Add block rule management interface and status display
7. **Implement Supabase Sync:** Extend existing sync for block rules
8. **Add Tray/Minimized Mode:** Integrate with existing app lifecycle management

---

## 7. Potential Challenges
- **Overlaying windows reliably on all platforms** (may need platform-specific tweaks)
- **Accurate process/app name matching** (handle edge cases, e.g., multiple processes)
- **Ensuring overlays can't be easily bypassed** (harder on some OSes)
- **Syncing usage data with minimal conflicts** (existing challenge)
- **Performance impact** of adding block evaluation to existing tracking loops
- **State synchronization** between existing app tracking and new blocking logic
- **Backward compatibility** with existing usage tracking data and UI

---

## 8. Example User Flow
1. User adds a rule: "Block Discord from 8am–10pm, hard block."
2. User launches Discord at 9am.
3. Existing `useAppTracking` hook detects Discord as current app via `get_active_app`.
4. Block rule evaluation triggers (integrated into existing tracking loop).
5. Overlay window appears above Discord, blocking interaction.
6. User tries to override, but strictness is "hard" so override is not allowed.
7. Usage continues to be tracked via existing session system and synced to Supabase.
8. User closes Discord, overlay disappears, tracking continues normally.

---

## 9. Integration Points with Existing System

### Existing Components to Extend
- **`useAppTracking` hook:** Add block rule evaluation and status
- **`get_active_app` command:** Continue using for current app detection
- **`get_usage_summary` command:** Continue using for daily usage limits
- **Session tracking:** Continue using for detailed usage history
- **Supabase sync:** Extend for block rule synchronization
- **Tauri event system:** Use existing `switched` event for app changes

### New Components to Create
- **Block rule management:** CRUD operations for rules
- **Overlay window system:** Block screen display
- **Rule evaluation engine:** Logic for time and usage-based blocking
- **Block status UI:** Display current blocking state 