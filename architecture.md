# 📄 Architecture Document: loopd - App Tracker & Blocker

## 1. **Overview**

**loopd** is a cross-platform desktop application that monitors app usage, blocks specific applications, and syncs usage data across devices. Built with **Tauri (Rust backend)** and a **Next.js (React, Tailwind, ShadCN) frontend**, using **Supabase** for authentication and backend services.

---

## 2. **System Components**

### 2.1 Frontend (Tauri + Next.js)

* **Tech**: React, Next.js, TypeScript, Tailwind CSS, ShadCN UI
* **Responsibilities**:

  * Render real-time app usage data
  * Display full-screen overlay for blocked apps
  * Provide UI for authentication, stats, and override controls
  * Communicate with Rust backend via Tauri commands/events

---

### 2.2 Backend (Tauri + Rust)

* **Tech**: Rust + Tauri command API
* **Responsibilities**:

  * Monitor active window/process
  * Detect blocked apps
  * Emit real-time events to frontend
  * Terminate blocked processes (if needed)
  * Manage temporary overrides
  * Handle OS-specific permissions (e.g., macOS Accessibility)

---

### 2.3 Supabase (Backend-as-a-Service)

* **Tech**: Supabase Auth, Postgres DB, Edge Functions (optional)
* **Responsibilities**:

  * User authentication (email, OAuth)
  * Store app usage logs
  * Store blocked app lists and override entries
  * Sync data across user's devices
  * (Optional) Trigger functions or alerts

---

## 3. **Data Flow**

### App Usage Tracking

```text
[OS API] → Rust Plugin → Event Emission → React UI
                     ↘        ↘
               Local buffer   Supabase Sync
```

### App Blocking

```text
[Blocked App Detected] → Rust emits event
                         ↓
             Tauri spawns fullscreen window OR React modal
             "App Blocked – [Close] [Override]"
```

---

## 4. **Database Schema (Supabase)**

```sql
-- users are managed by Supabase Auth

app_usage_logs (
  id UUID PK,
  user_id UUID FK,
  app_name TEXT,
  duration_seconds INTEGER,
  start_time TIMESTAMP,
  created_at TIMESTAMP
)

blocked_apps (
  id UUID PK,
  user_id UUID FK,
  app_name TEXT,
  created_at TIMESTAMP
)

overrides (
  id UUID PK,
  user_id UUID FK,
  app_name TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
)
```

---

## 5. **App Blocking Implementation**

### Method:

* Poll active app (every 1–2s)
* If app matches `blocked_apps`, and not in `overrides`, trigger block
* Show fullscreen Tauri window OR frontend modal
* On "Close App" → Rust kills the process
* On "Override" → Insert `overrides` entry (with expiry)

---

## 6. **Permissions Required**

| OS      | Permissions                          |
| ------- | ------------------------------------ |
| Windows | None by default, admin for some apps |
| macOS   | Accessibility + Screen Recording     |
| Linux   | X11 support; Wayland limited         |

---

## 7. **Tech Stack Summary**

| Layer          | Stack                                        |
| -------------- | -------------------------------------------- |
| Frontend       | React, Next.js, TypeScript, Tailwind, ShadCN |
| Backend        | Tauri 2.0 + Rust                             |
| Auth & Storage | Supabase (Auth + Postgres + Realtime)        |
| Communication  | Tauri `invoke`, `emit`, Supabase sync        |
| Blocking UI    | React Modal or Tauri fullscreen window       |

---

## 8. **Future Enhancements**

* App categories and focus goals
* Pomodoro-style productivity timers
* Sync block schedule across devices
* Notifications/reminders

---
