# 🚀 Step-by-Step Setup Guide

## 🔧 Step 5: Set Up Rust Backend (App Tracking)

### Inside `src-tauri/src/`, create:

* `usage.rs`: Polls active window/process (per OS)
* `block.rs`: App blocking logic
* `sync.rs`: Queues and sends data to Supabase (via REST or from frontend)

Register commands in `main.rs`:

```rust
mod usage;
mod block;
mod sync;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            usage::get_active_app,
            block::should_block,
            block::override_block,
            sync::push_usage
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Example command:

```rust
#[tauri::command]
pub fn get_active_app() -> String {
    // OS-specific logic: Windows (GetForegroundWindow), macOS (NSWorkspace), etc.
    "Notion.exe".into()
}
```

---

## 🔄 Step 6: Real-Time Rust → Frontend Data Flow

In `usage.rs`, emit event:

```rust
window.emit("usage_update", usage_info)?;
```

In React:

```ts
useEffect(() => {
  listen("usage_update", (event) => {
    setUsageData(event.payload)
  });
}, []);
```

---

## 🚫 Step 7: App Blocking + Emergency Override

1. Rust polls foreground app
2. If in blocklist, emits `"block_trigger"`
3. Frontend:

   * Shows full-screen modal or spawns new Tauri window with:

     * “App Blocked”
     * \[Close App] → Rust kills process
     * \[Override] → Add to temporary override table

Create Tauri secondary window:

```ts
await appWindow.createWindow("blocker", {
  url: "/blocker",
  alwaysOnTop: true,
  fullscreen: true,
});
```

---

## 📊 Step 8: Dashboard + UI

Create pages:

* `/dashboard`: Shows current app usage
* `/settings`: Configure blocked apps
* `/auth`: Login / Register
* `/blocker`: Full-screen block UI

Use Supabase client to fetch logs:

```ts
const { data } = await supabase.from("app_usage_logs").select("*").eq("user_id", user.id);
```

---

## 🧪 Step 9: Test & Package

```bash
# Dev
npm run dev & tauri dev

# Build
npm run build
npx tauri build
```

---

## 🎁 Step 10: Optional Improvements

* ✅ Store data locally in SQLite before syncing
* 🔁 Sync overrides to Supabase
* ⏱ Rate-limit overrides or add timers
* 🔔 Notifications/reminders
* 🧪 Unit tests for tracking logic

---

## ✅ Summary Timeline

| Step | Task                               | Tools                 |
| ---- | ---------------------------------- | --------------------- |
| 0    | Install dependencies               | Rust, Node, Tauri     |
| 1    | Create app skeleton (Tauri + Next) | CLI                   |
| 2    | Set up UI (Tailwind, ShadCN)       | Tailwind, ShadCN      |
| 3    | Set up Supabase project            | Supabase              |
| 4    | Configure auth + schema            | Supabase SQL Editor   |
| 5    | Implement Rust commands            | `src-tauri/src`       |
| 6    | Add event communication            | Tauri `emit` + React  |
| 7    | Build block UI & override system   | React + Rust          |
| 8    | Sync & display data                | Supabase API          |
| 9    | Test, debug, and package           | `tauri dev` / `build` |
