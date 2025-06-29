# Loopd: Roadmap & Priorities

This document outlines the development roadmap and immediate priorities for the Loopd application, building upon the existing project documentation and current codebase status.

---

### **Phase 1: Solidify Cloud Integration (Immediate Priority)**

The immediate goal is to complete the cloud integration, as it's the critical foundation for all multi-device and premium features.

**1. Finalize the Authentication Flow**
   *   **Task:** Thoroughly test the user authentication journey. Ensure that sign-up, login, logout, and session management are seamless and robust.
   *   **Key Files:**
        *   `desktop-app/src/components/CustomAuthForm.tsx`
        *   `webclient/src/components/CustomAuthForm.tsx`
        *   `desktop-app/src/contexts/UserContext.tsx`
   *   **Goal:** A user can create an account, log in, and their session state is reliably managed throughout the application.

**2. Implement and Verify Protected Routes**
   *   **Task:** While `ProtectedRoute.tsx` exists, ensure it's correctly implemented across all necessary pages in both the desktop and web clients to prevent unauthorized access.
   *   **Key Files:**
        *   `desktop-app/src/components/ProtectedRoute.tsx`
        *   `desktop-app/src/app/timeline/page.tsx` (and other protected pages)
   *   **Goal:** Non-authenticated users are redirected to the login page when trying to access protected content like the timeline.

**3. Build the Data Synchronization Service (Core Task)**
   *   **Task:** This is the most critical step. Implement the service within the Tauri backend that syncs local usage data to Supabase. Your local database schema is already prepared for this with a `synced` column.
   *   **Key File:** `desktop-app/src-tauri/src/database.rs`
   *   **Action Items:**
        1.  Create a function (e.g., `sync_to_supabase`) that reads records where `synced = 0` from the local SQLite database.
        2.  Batch these records and send them to the `app_usage_logs` table in Supabase.
        3.  Upon successful upload, update the local records to `synced = 1`.
        4.  Implement robust error handling, especially for offline scenarios.

**4. Display Cloud-Synced Data**
   *   **Task:** Adjust the frontend components to fetch and display data from Supabase for logged-in users, allowing them to see a unified view of their activity across all devices.
   *   **Key Files:**
        *   `desktop-app/src/app/timeline/page.tsx`
        *   `webclient/src/components/timeline-page.tsx`
   *   **Goal:** A user logged into the web client can see the application usage tracked by the desktop client.

---

### **Phase 2: App Blocking System (Next Priority)**

Once cloud sync is operational, you can move on to the next major user-facing feature.

**1. Implement Backend Blocking Logic**
   *   **Task:** Create the core app-blocking functionality in the Rust backend.
   *   **Key File:** `desktop-app/src-tauri/src/block.rs` (as planned in your docs)
   *   **Action Items:**
        1.  Develop a function to check if an active application is on the user's blocklist.
        2.  Implement the OS-level function to terminate the blocked process.

**2. Create the Blocklist Management UI**
   *   **Task:** Build the user interface that allows users to add or remove applications from their blocklist. This will interact with the `blocked_apps` table in Supabase.
   *   **Goal:** A user can define and persist their list of applications to block.

**3. Design the Blocking Overlay**
   *   **Task:** Implement the fullscreen overlay that appears when a user attempts to access a blocked application. As your documents note, this will likely require careful management of a new Tauri window.
   *   **Goal:** A non-intrusive but clear overlay informs the user that an application is blocked. 