// Imports
pub mod usage;
pub mod database;

use chrono::Local;
use std::sync::Arc;
use tauri::{Emitter, Manager};
use crate::database::Database;
use crate::usage::UsageTracker;
use tokio::time::sleep;
use std::fs;
use std::path::PathBuf;
use uuid::Uuid;

/// Shared database handle stored in Tauri `State`.
/// Keeping this alias public ensures we always use the same type everywhere
/// and avoid the mismatching-type runtime panic described in the Tauri docs.
pub type Db = Arc<Database>;

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

// Reset tracking system - clears current tracker and creates new device
pub async fn reset_tracking(db: &Db) -> Result<String, Box<dyn std::error::Error>> {
    println!("[TRACKER] Resetting tracking system...");
    
    // Clear the current tracker
    {
        let mut tracker_guard = usage::USAGE_TRACKER.lock().unwrap();
        *tracker_guard = None;
    }
    
    // Create a new device
    let device_id = db.initialize_device("Desktop App".to_string(), "Windows".to_string()).await?;
    println!("[TRACKER] Created new device: {}", device_id);
    
    // Create and store the new usage tracker
    {
        let mut tracker_guard = usage::USAGE_TRACKER.lock().unwrap();
        *tracker_guard = Some(UsageTracker::new(device_id.clone()));
    }
    
    println!("[TRACKER] Tracking system reset successfully");
    Ok(device_id)
}

// Start tracking usage
pub fn start_tracking(db: Db, app_handle: tauri::AppHandle) {
    println!("[TRACKER] start_tracking: tracker started");
    tauri::async_runtime::spawn(async move {
        let mut current_app: Option<String> = None;
        let mut last_switch_time: chrono::DateTime<Local> = Local::now();

        // Get the persistent device ID
        let device_id = get_or_create_device_id(&app_handle);
        println!("[TRACKER] Using persistent device ID: {}", device_id);

        // Initialize device in database with the persistent ID
        match db.initialize_device_with_id(device_id.clone(), "Desktop App".to_string(), "Windows".to_string()).await {
            Ok(_) => println!("[TRACKER] Device initialized in database"),
            Err(e) => {
                println!("[TRACKER] Failed to initialize device: {}", e);
                return;
            }
        }

        // Create and store the usage tracker
        {
            let mut tracker_guard = usage::USAGE_TRACKER.lock().unwrap();
            *tracker_guard = Some(UsageTracker::new(device_id.clone()));
        }

        log::info!("Started tracking with device ID: {}", device_id);

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

                            // Handle database operations in a separate task
                            let db_clone = db.clone();
                            let device_id = device_id.clone();
                            tauri::async_runtime::spawn(async move {
                                // End previous session
                                if let Err(e) = db_clone.end_current_session(&device_id).await {
                                    log::warn!("Failed to end session: {}", e);
                                }

                                // Start new session
                                let title_str = window_title.clone().unwrap_or_default();
                                if let Err(e) = db_clone.start_new_session(
                                    &device_id,
                                    app_name.clone(),
                                    title_str,
                                ).await {
                                    log::warn!("Failed to start session: {}", e);
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
                        // No action needed
                    }
                }
            } else if let Err(e) = action {
                log::warn!("Failed to update usage tracker: {}", e);
            }

            sleep(std::time::Duration::from_secs(1)).await;
        }
    });
}
