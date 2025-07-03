# 📄 Product Requirements Document (PRD)

## 1. **Product Name**

**loopd** – A cross-platform productivity app that tracks and limits app usage.

---

## 2. **Summary**

loopd helps users stay productive by tracking desktop app usage, blocking distracting apps, and syncing usage data across devices.

---

## 3. **Objectives**

* Track which apps the user is using and for how long.
* Allow users to define apps they want to block.
* Show a custom overlay screen with options when a blocked app is opened.
* Enable "Emergency Override" for special use cases.
* Sync user data and preferences across devices via Supabase.

---

## 4. **Key Features**

| Feature              | Description                                                          |
| -------------------- | -------------------------------------------------------------------- |
| App Usage Tracking   | Log time spent on each app in the background                         |
| App Blocking         | Block defined apps by showing fullscreen overlay with action options |
| Emergency Override   | Temporarily allow access to a blocked app                            |
| Dashboard            | Display app usage stats, block list, and override history            |
| Cross-device Sync    | Supabase stores usage data, blocked apps, and override logs          |
| Auth & User Accounts | Supabase handles login, session storage, and account management      |

---

## 5. **User Stories**

### As a user:

* I want to see how much time I spend on different apps each day.
* I want to block certain apps during work hours.
* I want to override blocks when I really need access.
* I want my data to stay in sync across my devices.

---

## 6. **User Flows**

### 🟢 App Usage Flow

1. User logs in
2. Background service starts tracking app usage
3. Usage data displayed on dashboard in real time

### 🔴 App Blocking Flow

1. Blocked app detected
2. Show fullscreen overlay with "Close App" or "Override"
3. Log user's choice and act accordingly

---

## 7. **Requirements**

### Functional

* ✅ Track current active app and duration
* ✅ Allow user to define a block list
* ✅ Block apps with fullscreen UI
* ✅ Sync logs and preferences with Supabase
* ✅ Display real-time usage in frontend

### Non-Functional

* 🔒 Secure (RLS on Supabase, local encryption optional)
* 🚀 Fast and low-resource (Rust-based tracking)
* 💻 Cross-platform (Windows, macOS, Linux/X11)

---

## 8. **KPIs / Success Metrics**

* % daily active users (DAU)
* Average app usage reduced over time
* Number of override events vs blocks
* Time spent in focused apps vs distractions

---

## 🤝 Contributing

We welcome contributions! Please fork the repository, create a feature branch, and open a pull request with your changes. For major changes, please open an issue first to discuss what you would like to change.

---

## 💬 Contact & Feedback

- For questions or feedback, please open an issue on GitHub.
- Join the [Tauri Discord](https://discord.gg/tauri) for community support.

---

_Last updated: 2025-07-03_
