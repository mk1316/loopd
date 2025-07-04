use tauri::{AppHandle, Manager};
use tauri_plugin_updater::{Updater, UpdaterEvent};

#[tauri::command]
pub async fn check_for_updates(app_handle: AppHandle) -> Result<(), String> {
    let updater = Updater::new(&app_handle).map_err(|e| format!("Failed to create updater: {}", e))?;
    
    // Check for updates
    match updater.check().await {
        Ok(update) => {
            if let Some(update) = update {
                println!("Update available: {}", update.version);
                // Emit event to frontend
                app_handle.emit("update-available", &update).map_err(|e| format!("Failed to emit update event: {}", e))?;
            } else {
                println!("No updates available");
                app_handle.emit("no-update-available", ()).map_err(|e| format!("Failed to emit no-update event: {}", e))?;
            }
        }
        Err(e) => {
            println!("Error checking for updates: {}", e);
            app_handle.emit("update-error", &e.to_string()).map_err(|e| format!("Failed to emit error event: {}", e))?;
        }
    }
    
    Ok(())
}

#[tauri::command]
pub async fn install_update(app_handle: AppHandle) -> Result<(), String> {
    let updater = Updater::new(&app_handle).map_err(|e| format!("Failed to create updater: {}", e))?;
    
    // Install the update
    match updater.download_and_install().await {
        Ok(_) => {
            println!("Update installed successfully");
            app_handle.emit("update-installed", ()).map_err(|e| format!("Failed to emit installed event: {}", e))?;
        }
        Err(e) => {
            println!("Error installing update: {}", e);
            app_handle.emit("update-error", &e.to_string()).map_err(|e| format!("Failed to emit error event: {}", e))?;
        }
    }
    
    Ok(())
}

#[tauri::command]
pub async fn get_current_version() -> Result<String, String> {
    Ok(env!("CARGO_PKG_VERSION").to_string())
}

pub fn setup_updater_events(app_handle: AppHandle) {
    let updater = match Updater::new(&app_handle) {
        Ok(u) => u,
        Err(e) => {
            eprintln!("Failed to create updater: {}", e);
            return;
        }
    };

    // Listen for updater events
    updater.listen(move |event| {
        match event {
            UpdaterEvent::UpdateAvailable(update) => {
                println!("Update available: {}", update.version);
                app_handle.emit("update-available", &update).ok();
            }
            UpdaterEvent::UpdateDownloaded(update) => {
                println!("Update downloaded: {}", update.version);
                app_handle.emit("update-downloaded", &update).ok();
            }
            UpdaterEvent::UpdateInstalled(update) => {
                println!("Update installed: {}", update.version);
                app_handle.emit("update-installed", &update).ok();
            }
            UpdaterEvent::Error(error) => {
                println!("Updater error: {}", error);
                app_handle.emit("update-error", &error.to_string()).ok();
            }
        }
    });
} 