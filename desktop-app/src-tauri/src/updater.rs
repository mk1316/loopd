use tauri::{AppHandle, Emitter};
use tauri_plugin_updater::UpdaterExt;
use serde_json;

#[tauri::command]
pub async fn check_for_updates(app_handle: AppHandle) -> Result<(), String> {
    let update = app_handle
        .updater_builder()
        .build()
        .map_err(|e| format!("Failed to build updater: {}", e))?
        .check()
        .await
        .map_err(|e| format!("Failed to check for updates: {}", e))?;

    if let Some(update) = update {
        println!("Update available: {}", update.version);
        app_handle.emit("update-available", &serde_json::json!({
            "version": update.version,
            "date": update.date.map(|d| d.to_string()),
            "body": update.body
        })).map_err(|e| format!("Failed to emit update event: {}", e))?;
    } else {
        println!("No updates available");
        app_handle.emit("no-update-available", ()).map_err(|e| format!("Failed to emit no-update event: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn install_update(app_handle: AppHandle) -> Result<(), String> {
    let update = app_handle
        .updater_builder()
        .build()
        .map_err(|e| format!("Failed to build updater: {}", e))?
        .check()
        .await
        .map_err(|e| format!("Failed to check for updates: {}", e))?;

    if let Some(update) = update {
        println!("Installing update: {}", update.version);
        
        update
            .download_and_install(
                |chunk, total| {
                    println!("Downloaded chunk: {} / {:?}", chunk, total);
                },
                || {
                    println!("Download finished");
                }
            )
            .await
            .map_err(|e| format!("Failed to install update: {}", e))?;
        
        app_handle.emit("update-installed", ()).map_err(|e| format!("Failed to emit installed event: {}", e))?;
    } else {
        return Err("No update available to install".to_string());
    }
    
    Ok(())
}

#[tauri::command]
pub async fn get_current_version() -> Result<String, String> {
    Ok(env!("CARGO_PKG_VERSION").to_string())
}

pub fn setup_updater_events(_app_handle: AppHandle) {
    // The updater events are handled automatically by the plugin
    // No additional setup needed for Tauri v2
    println!("Updater events setup (automatic in Tauri v2)");
} 