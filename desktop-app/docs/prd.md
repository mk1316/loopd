# 📄 Product Requirements Document (PRD) - loopd Desktop App

## 1. **Product Name**

**loopd** – A cross-platform desktop productivity app that tracks app usage, blocks distracting applications, and provides insights to help users stay focused.

---

## 2. **Summary**

loopd helps users understand and control their digital habits by tracking desktop app usage in real-time, blocking distracting apps with customizable rules, and providing detailed insights into time spent across applications. The app runs as a Tauri-based desktop application with local SQLite storage and optional Supabase cloud synchronization.

---

## 3. **Objectives**

* **Usage Tracking**: Automatically track which desktop applications users are using and for how long
* **App Blocking**: Allow users to define and enforce blocking rules for distracting applications
* **Insights & Analytics**: Provide detailed usage statistics and trends to help users understand their digital habits
* **Cross-Device Sync**: Enable optional cloud synchronization of usage data and blocking rules via Supabase
* **Privacy-First**: Prioritize local data storage with optional cloud sync for user control

---

## 4. **Key Features**

| Feature              | Status | Description                                                          |
| -------------------- | ------ | -------------------------------------------------------------------- |
| Real-time App Tracking | ✅ | Background tracking of active applications with session management |
| Usage Analytics | ✅ | Daily, weekly, and custom period usage summaries with detailed breakdowns |
| Block Rules Management | ✅ | Create, edit, and manage blocking rules for applications |
| App Blocking | ✅ | Overlay blocking screen with override capabilities |
| Local Data Storage | ✅ | SQLite database for secure local data persistence |
| Cross-device Sync | ✅ | Optional Supabase integration for cloud synchronization |
| Authentication | ✅ | Supabase Auth integration for user accounts |
| Timeline View | ✅ | Detailed timeline of app usage sessions |
| Device Management | ✅ | Multi-device support with device identification |
| Data Export/Clear | ✅ | Local data management and clearing capabilities |

---

## 5. **User Stories**

### As a user:

* I want to see how much time I spend on different applications each day, week, and month
* I want to block certain applications during specific time windows or after daily usage limits
* I want to override blocks when I really need access to a blocked application
* I want my usage data and blocking rules to sync across my devices (optional)
* I want to view detailed timelines of my app usage to understand my patterns
* I want to clear my usage data when needed for privacy
* I want the app to run quietly in the background without interrupting my workflow

---

## 6. **User Flows**

### 🟢 App Usage Tracking Flow

1. User launches the loopd desktop app
2. App automatically starts tracking active applications in the background
3. Usage data is stored locally in SQLite database
4. Real-time usage statistics are displayed in the dashboard
5. Optional: Data syncs to Supabase cloud storage

### 🔴 App Blocking Flow

1. User creates blocking rules for specific applications
2. App monitors for blocked applications being launched
3. When blocked app is detected, overlay blocking screen appears
4. User can either close the app or request an override
5. Override attempts are logged and can be reviewed later

### 📊 Analytics & Insights Flow

1. User navigates to timeline or analytics views
2. App displays usage data with filtering options (date ranges, apps)
3. User can drill down into specific sessions and time periods
4. Usage patterns and trends are visualized for better understanding

---

## 7. **Technical Requirements**

### Functional Requirements

* ✅ **Real-time App Tracking**: Monitor active applications using OS-specific APIs
* ✅ **Session Management**: Track app usage sessions with start/end times
* ✅ **Block Rules Engine**: Evaluate and enforce user-defined blocking rules
* ✅ **Local Data Storage**: SQLite database for secure local data persistence
* ✅ **Cloud Synchronization**: Optional Supabase integration for cross-device sync
* ✅ **User Authentication**: Supabase Auth for user account management
* ✅ **Cross-platform Support**: Windows, macOS, and Linux compatibility
* ✅ **Background Operation**: Tray/minimized mode for non-intrusive operation

### Non-Functional Requirements

* 🔒 **Security**: Local data encryption, secure cloud sync, privacy-first design
* 🚀 **Performance**: Low resource usage, efficient background operation
* 💻 **Reliability**: Graceful error handling, data recovery, offline functionality
* 🔄 **Scalability**: Efficient data storage, optimized queries, minimal memory footprint

---

## 8. **Data Architecture**

### Local Storage (SQLite)
- **Devices**: Device identification and metadata
- **Sessions**: App usage sessions with timing data
- **Block Rules**: User-defined blocking rules and configurations
- **Block Overrides**: Log of override attempts and reasons

### Cloud Storage (Supabase - Optional)
- **User Accounts**: Authentication and user management
- **Usage Data**: Synced usage sessions and statistics
- **Block Rules**: Cross-device rule synchronization
- **Device Management**: Multi-device coordination

---

## 9. **KPIs / Success Metrics**

* **User Engagement**: Daily active users, session duration, feature adoption
* **Productivity Impact**: Reduction in distracting app usage, increased focus time
* **User Satisfaction**: App ratings, user feedback, retention rates
* **Technical Performance**: App stability, sync reliability, resource usage

---

## 10. **Future Enhancements**

### Phase 2 Features
* **Website Blocking**: Extend blocking to web browsers and specific websites
* **Advanced Analytics**: Machine learning insights, productivity scoring
* **Team Features**: Shared blocking rules, team analytics
* **Mobile Companion**: Mobile app for cross-platform insights

### Phase 3 Features
* **Focus Modes**: Predefined productivity configurations
* **Integration APIs**: Third-party app integrations
* **Advanced Reporting**: Custom reports, data export options
* **Gamification**: Productivity challenges, achievements, streaks

---

## 11. **Success Criteria**

* **MVP Success**: Stable app tracking, reliable blocking, user adoption
* **Growth Metrics**: Increasing user base, positive feedback, feature usage
* **Technical Excellence**: High app stability, efficient performance, secure data handling
* **User Value**: Measurable productivity improvements, user satisfaction, retention