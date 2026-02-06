// Imports
pub mod usage;
pub mod database;
pub mod supabase;
pub mod blocking;
pub mod updater;
pub mod aw_models;
pub mod aw_database;
pub mod aw_commands;
pub mod aw_server;
pub mod aw_query;
pub mod neon;

use blocking::BLOCKING_SYSTEM;

use chrono::Local;
use std::sync::Arc;
use std::fs;
use tauri::{Emitter, Manager};
use crate::database::Database;
use crate::usage::UsageTracker;
use tokio::time::sleep;
use uuid::Uuid;
use tauri_plugin_store::Builder as StorePluginBuilder;

/// Shared database handle stored in Tauri `State`.
/// Keeping this alias public ensures we always use the same type everywhere
/// and avoid the mismatching-type runtime panic described in the Tauri docs.
pub type Db = Arc<Database>;

/// Shared ActivityWatch database handle
pub type AwDb = Arc<aw_database::AwDatabase>;

// Get or create persistent device ID stored in app data directory
pub fn get_or_create_device_id(app_handle: &tauri::AppHandle) -> String {
    let app_dir = app_handle.path().app_data_dir().expect("Failed to get app data dir");
    let device_id_path = app_dir.join("device_id.txt");

    if device_id_path.exists() {
        fs::read_to_string(&device_id_path)
            .expect("Failed to read device_id.txt")
            .trim()
            .to_string()
    } else {
        let new_id = Uuid::new_v4().to_string();
        fs::create_dir_all(&app_dir).expect("Failed to create app data dir");
        fs::write(&device_id_path, &new_id).expect("Failed to write device_id.txt");
        println!("[DEVICE] Created new persistent device ID: {}", new_id);
        new_id
    }
}

// Reset tracking system - clears current tracker and resets the existing device
pub async fn reset_tracking(db: &Db) -> Result<String, Box<dyn std::error::Error>> {
    println!("[TRACKER] Resetting tracking system...");
    
    // Clear the current tracker
    {
        let mut tracker_guard = usage::USAGE_TRACKER.lock().unwrap();
        *tracker_guard = None;
    }
    
    // Get the first device (should be the persistent one)
    let device = db.get_first_device().await?;
    let device_id = if let Some(device) = device {
        println!("[TRACKER] Using existing device: {}", device.id);
        device.id
    } else {
        // Fallback: create a new device if none exists
        println!("[TRACKER] No device found, creating new one");
        db.initialize_device("Desktop App".to_string(), "macOS".to_string()).await?
    };
    
    // Create and store the new usage tracker with the existing device ID
    {
        let mut tracker_guard = usage::USAGE_TRACKER.lock().unwrap();
        *tracker_guard = Some(UsageTracker::new(device_id.clone()));
    }
    
    println!("[TRACKER] Tracking system reset successfully");
    Ok(device_id)
}

// Start tracking usage
pub fn start_tracking(db: Db, aw_db: AwDb, app_handle: tauri::AppHandle) {
    println!("[TRACKER] start_tracking: tracker started");
    tauri::async_runtime::spawn(async move {
        let mut current_app: Option<String> = None;
        let mut last_switch_time: chrono::DateTime<Local> = Local::now();

        // Get the persistent device ID and hostname
        let device_id = get_or_create_device_id(&app_handle);
        let hostname = gethostname::gethostname()
            .to_string_lossy()
            .to_string();
        println!("[TRACKER] Using persistent device ID: {}", device_id);
        println!("[TRACKER] Hostname: {}", hostname);

        // Initialize device in database with the persistent ID
        match db.initialize_device_with_id(device_id.clone(), "Desktop App".to_string(), "macOS".to_string()).await {
            Ok(_) => println!("[TRACKER] Device initialized in database"),
            Err(e) => {
                println!("[TRACKER] Failed to initialize device: {}", e);
                return;
            }
        }

        // Initialize ActivityWatch bucket for window tracking
        let bucket_id = format!("aw-watcher-window_{}", hostname);
        let bucket = aw_models::Bucket {
            id: bucket_id.clone(),
            name: Some("Window Activity".to_string()),
            bucket_type: aw_models::bucket_types::CURRENT_WINDOW.to_string(),
            client: aw_models::clients::LOOPD.to_string(),
            hostname: hostname.clone(),
            created: chrono::Utc::now(),
            data: None,
            last_updated: None,
        };
        match aw_db.get_or_create_bucket(&bucket).await {
            Ok(_) => println!("[TRACKER] AW bucket initialized: {}", bucket_id),
            Err(e) => println!("[TRACKER] Failed to initialize AW bucket: {}", e),
        }

        // Create and store the usage tracker
        {
            let mut tracker_guard = usage::USAGE_TRACKER.lock().unwrap();
            *tracker_guard = Some(UsageTracker::new(device_id.clone()));
        }

        // Initialize blocking system with device ID
        {
            let mut blocking_guard = BLOCKING_SYSTEM.lock().unwrap();
            *blocking_guard = blocking::BlockingSystem::new(device_id.clone());
        }

        // Load initial blocking rules
        let rules = db.get_block_rules(&device_id).await.unwrap_or_else(|e| {
            log::warn!("Failed to load blocking rules: {}", e);
            Vec::new()
        });
        {
            let mut blocking_guard = BLOCKING_SYSTEM.lock().unwrap();
            blocking_guard.update_rules(rules);
        }

        log::info!("Started tracking with device ID: {}", device_id);

        // Start the blocking evaluation loop in a separate task
        let blocking_db = db.clone();
        let blocking_app_handle = app_handle.clone();
        let _blocking_device_id = device_id.clone();
        tauri::async_runtime::spawn(async move {
            loop {
                // Get current active app
                let current_app = {
                    let tracker_guard = usage::USAGE_TRACKER.lock().unwrap();
                    if let Some(tracker) = tracker_guard.as_ref() {
                        tracker.get_current_app()
                    } else {
                        None
                    }
                };

                if let Some(app_name) = current_app {
                    // Evaluate blocking for the current app
                    let block_status = {
                        let blocking_data = {
                            let blocking_guard = BLOCKING_SYSTEM.lock().unwrap();
                            (blocking_guard.device_id.clone(), blocking_guard.rules.clone(), blocking_guard.active_overrides.clone())
                        };
                        
                        // Now evaluate without holding the mutex
                        let (device_id, rules, active_overrides) = blocking_data;
                        let mut temp_blocking_system = blocking::BlockingSystem::new(device_id);
                        temp_blocking_system.update_rules(rules);
                        for (app, _time) in active_overrides {
                            temp_blocking_system.add_override(app);
                        }
                        
                        temp_blocking_system.evaluate_app(&app_name, &blocking_db).await
                    };

                    if let Ok(Some(block_status)) = block_status {
                        if block_status.is_blocked {
                            log::info!("App blocked: {} - {}", app_name, block_status.reason);
                            
                            // Emit blocking event to frontend
                            blocking_app_handle.emit("app_blocked", &block_status).ok();
                            
                            // Terminate the process if it's a hard block
                            if let Some(rule) = &block_status.rule {
                                if matches!(rule.strictness, blocking::Strictness::Hard) {
                                    if let Err(e) = blocking::terminate_process(&app_name) {
                                        log::warn!("Failed to terminate blocked app {}: {}", app_name, e);
                                    }
                                }
                            }
                        } else {
                            // No block is active, emit unblock event
                            blocking_app_handle.emit("app_unblocked", &app_name).ok();
                        }
                    }
                }

                // Sleep for a short interval before next evaluation
                sleep(std::time::Duration::from_millis(100)).await;
            }
        });

        loop {
            println!("[TRACKER] Background loop iteration");
            // Update tracker and get action
            let action = {
                let mut tracker_guard = usage::USAGE_TRACKER.lock().unwrap();
                println!("[TRACKER] Got tracker lock, tracker exists: {}", tracker_guard.is_some());
                if let Some(tracker) = tracker_guard.as_mut() {
                    println!("[TRACKER] Calling tracker.update()");
                    tracker.update()
                } else {
                    println!("[TRACKER] No tracker found!");
                    Ok(usage::UpdateAction::None)
                }
            };
            println!("[TRACKER] Action result: {:?}", action);

            // Handle the action
            if let Ok(action) = action {
                match action {
                    usage::UpdateAction::StartSession { app_name, window_title } => {
                        // Exclude LockApp from being recorded
                        if app_name == "LockApp" {
                            println!("[TRACKER] Skipping LockApp session");
                            continue;
                        }
                        // Check if app has changed
                        if current_app.as_ref() != Some(&app_name) {
                            println!("[TRACKER] App switch detected: {:?} -> {:?}", current_app, app_name);
                            // Record usage for previous app
                            if let Some(prev_app) = &current_app {
                                let elapsed = (Local::now() - last_switch_time).num_seconds() as u64;
                                log::info!("App switched from {} to {} after {} seconds", prev_app, app_name, elapsed);
                            }

                            // Start tracking new app
                            current_app = Some(app_name.clone());
                            last_switch_time = Local::now();
                            app_handle.emit("switched", &app_name).ok();

                            // Evaluate blocking for the new app
                            let app_name_for_blocking = app_name.clone();
                            let db_clone = db.clone();
                            let app_handle_clone = app_handle.clone();
                            tauri::async_runtime::spawn(async move {
                                // Evaluate blocking status - get the blocking system data first, then evaluate
                                let block_status = {
                                    let blocking_data = {
                                        let blocking_guard = BLOCKING_SYSTEM.lock().unwrap();
                                        (blocking_guard.device_id.clone(), blocking_guard.rules.clone(), blocking_guard.active_overrides.clone())
                                    };
                                    
                                    // Now evaluate without holding the mutex
                                    let (device_id, rules, active_overrides) = blocking_data;
                                    let mut temp_blocking_system = blocking::BlockingSystem::new(device_id);
                                    temp_blocking_system.update_rules(rules);
                                    for (app, _time) in active_overrides {
                                        temp_blocking_system.add_override(app);
                                    }
                                    
                                    temp_blocking_system.evaluate_app(&app_name_for_blocking, &db_clone).await
                                };

                                if let Ok(Some(block_status)) = block_status {
                                    if block_status.is_blocked {
                                        log::info!("App blocked: {} - {}", app_name_for_blocking, block_status.reason);
                                        
                                        // Emit blocking event to frontend
                                        app_handle_clone.emit("app_blocked", &block_status).ok();
                                        
                                        // Terminate the process if it's a hard block
                                        if let Some(rule) = &block_status.rule {
                                            if matches!(rule.strictness, blocking::Strictness::Hard) {
                                                if let Err(e) = blocking::terminate_process(&app_name_for_blocking) {
                                                    log::warn!("Failed to terminate blocked app {}: {}", app_name_for_blocking, e);
                                                }
                                            }
                                        }
                                    }
                                }
                            });

                            // Handle database operations in a separate task
                            let db_clone = db.clone();
                            let aw_db_clone = aw_db.clone();
                            let device_id = device_id.clone();
                            let bucket_id_clone = bucket_id.clone();
                            tauri::async_runtime::spawn(async move {
                                // End previous session (legacy)
                                if let Err(e) = db_clone.end_current_session(&device_id).await {
                                    log::warn!("Failed to end session: {}", e);
                                }

                                // Start new session (legacy)
                                let title_str = window_title.clone().unwrap_or_default();
                                if let Err(e) = db_clone.start_new_session(
                                    &device_id,
                                    app_name.clone(),
                                    title_str.clone(),
                                ).await {
                                    log::warn!("Failed to start session: {}", e);
                                }

                                // Send heartbeat to ActivityWatch bucket
                                let heartbeat = aw_models::Heartbeat {
                                    timestamp: chrono::Utc::now(),
                                    duration: 0.0, // Initial duration, will be extended by subsequent heartbeats
                                    data: serde_json::json!({
                                        "app": app_name,
                                        "title": title_str
                                    }),
                                };
                                // Use 10 minute pulsetime for merging consecutive events
                                if let Err(e) = aw_db_clone.heartbeat(&bucket_id_clone, &heartbeat, 600.0).await {
                                    log::warn!("Failed to send AW heartbeat: {}", e);
                                }
                            });
                        }
                    }
                    usage::UpdateAction::EndSession => {
                        // Handle end session
                        let db_clone = db.clone();
                        let device_id = device_id.clone();
                        tauri::async_runtime::spawn(async move {
                            if let Err(e) = db_clone.end_current_session(&device_id).await {
                                log::warn!("Failed to end session: {}", e);
                            }
                        });
                    }
                    usage::UpdateAction::None => {
                        // Send heartbeat to keep current event alive
                        if let Some(current_app_name) = &current_app {
                            let aw_db_clone = aw_db.clone();
                            let bucket_id_clone = bucket_id.clone();
                            let expected_app = current_app_name.clone();
                            tauri::async_runtime::spawn(async move {
                                // Get fresh app and title together to ensure consistency
                                // This prevents mismatched app/title if user switches apps mid-heartbeat
                                let active = match crate::usage::get_active_app_with_title().await {
                                    Ok(active) => active,
                                    Err(e) => {
                                        log::debug!("Skipping heartbeat - couldn't get window info: {}", e);
                                        return;
                                    }
                                };

                                // Verify the app hasn't changed - if it has, skip heartbeat
                                // The change will be detected on the next tracking cycle
                                if active.name != expected_app {
                                    log::debug!("Skipping heartbeat - app changed from {} to {}", expected_app, active.name);
                                    return;
                                }

                                let heartbeat = aw_models::Heartbeat {
                                    timestamp: chrono::Utc::now(),
                                    duration: 0.0, // Duration is calculated from timestamp diff during merge
                                    data: serde_json::json!({
                                        "app": active.name,
                                        "title": active.title
                                    }),
                                };
                                // Use 10 minute pulsetime for merging consecutive events
                                if let Err(e) = aw_db_clone.heartbeat(&bucket_id_clone, &heartbeat, 600.0).await {
                                    log::warn!("Failed to send AW heartbeat: {}", e);
                                }
                            });
                        }

                        // Evaluate blocking for current app even when no change
                        if let Some(current_app_name) = &current_app {
                            let app_name = current_app_name.clone();
                            let db_clone = db.clone();
                            let app_handle_clone = app_handle.clone();
                            tauri::async_runtime::spawn(async move {
                                let block_status = {
                                    let blocking_data = {
                                        let blocking_guard = BLOCKING_SYSTEM.lock().unwrap();
                                        (blocking_guard.device_id.clone(), blocking_guard.rules.clone(), blocking_guard.active_overrides.clone())
                                    };
                                    
                                    // Now evaluate without holding the mutex
                                    let (device_id, rules, active_overrides) = blocking_data;
                                    let mut temp_blocking_system = blocking::BlockingSystem::new(device_id);
                                    temp_blocking_system.update_rules(rules);
                                    for (app, _time) in active_overrides {
                                        temp_blocking_system.add_override(app);
                                    }
                                    
                                    temp_blocking_system.evaluate_app(&app_name, &db_clone).await
                                };

                                if let Ok(Some(block_status)) = block_status {
                                    if block_status.is_blocked {
                                        log::info!("Current app blocked: {} - {}", app_name, block_status.reason);
                                        app_handle_clone.emit("app_blocked", &block_status).ok();
                                        
                                        if let Some(rule) = &block_status.rule {
                                            if matches!(rule.strictness, blocking::Strictness::Hard) {
                                                if let Err(e) = blocking::terminate_process(&app_name) {
                                                    log::warn!("Failed to terminate blocked app {}: {}", app_name, e);
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            } else if let Err(e) = action {
                log::warn!("Failed to update usage tracker: {}", e);
            }

            sleep(std::time::Duration::from_secs(1)).await;
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(StorePluginBuilder::default().build())
        // ... existing plugins and setup ...
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
