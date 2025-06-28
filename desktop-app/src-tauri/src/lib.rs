// Imports
pub mod usage;
pub mod database;

use chrono::Local;
use std::sync::Arc;
use tauri::Emitter;
use crate::database::Database;
use crate::usage::UsageTracker;
use tokio::time::sleep;

type Db = Arc<Database>;

// Start tracking usage
pub fn start_tracking(db: Db, app_handle: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut current_app: Option<String> = None;
        let mut last_switch_time: chrono::DateTime<Local> = Local::now();

        // Wait for database initialization and get device ID
        let device_id = loop {
            // Try to get the first device from the database
            if let Ok(Some(device)) = db.get_first_device().await {
                break device.id;
            }
            
            // If no device found, wait a bit and try again
            log::info!("Waiting for database initialization...");
            sleep(std::time::Duration::from_millis(500)).await;
        };

        // Create and store the usage tracker
        {
            let mut tracker_guard = usage::USAGE_TRACKER.lock().unwrap();
            *tracker_guard = Some(UsageTracker::new(device_id.clone()));
        }

        log::info!("Started tracking with device ID: {}", device_id);

        loop {
            // Update tracker and get action
            let action = {
                let mut tracker_guard = usage::USAGE_TRACKER.lock().unwrap();
                if let Some(tracker) = tracker_guard.as_mut() {
                    tracker.update()
                } else {
                    Ok(usage::UpdateAction::None)
                }
            };

            // Handle the action
            if let Ok(action) = action {
                match action {
                    usage::UpdateAction::StartSession { app_name, window_title } => {
                        // Check if app has changed
                        if current_app.as_ref() != Some(&app_name) {
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
