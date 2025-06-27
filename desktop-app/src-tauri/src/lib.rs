mod usage;

use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
    thread,
    time::Duration,
};
use tauri::{Manager, State, Emitter};
use chrono::Local;

type UsageMap = Arc<Mutex<HashMap<String, u64>>>;

#[tauri::command]
fn get_usage_summary(usage_times: State<UsageMap>) -> Vec<(String, u64)> {
    let usage = usage_times.lock().unwrap();
    usage.iter().map(|(k, v)| (k.clone(), *v)).collect()
}

fn start_tracking(usage_times: UsageMap, app_handle: tauri::AppHandle) {
    thread::spawn(move || {
        let mut current_app: Option<String> = None;
        let mut last_switch_time: chrono::DateTime<Local> = Local::now();

        loop {
            // Update the usage tracker
            {
                let mut tracker = usage::USAGE_TRACKER.lock().unwrap();
                if let Err(e) = tracker.update() {
                    log::warn!("Failed to update usage tracker: {}", e);
                }
                
                // Check if app has changed and update tracking
                if let Some(app_name) = tracker.get_current_app() {
                    if current_app.as_ref() != Some(&app_name) {
                        // Record usage for previous app
                        if let Some(prev_app) = &current_app {
                            let elapsed = (Local::now() - last_switch_time).num_seconds() as u64;
                            let mut usage = usage_times.lock().unwrap();
                            *usage.entry(prev_app.clone()).or_insert(0) += elapsed;
                        }
                        
                        // Start tracking new app
                        current_app = Some(app_name.clone());
                        last_switch_time = Local::now();
                        app_handle.emit("switched", &app_name).ok();
                    }
                }
            }
            
            thread::sleep(Duration::from_secs(1));
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Arc::new(Mutex::new(HashMap::<String, u64>::new())))
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            
            // Start background usage tracking task
            let usage_times = app.state::<UsageMap>().inner().clone();
            let app_handle = app.handle().clone();
            start_tracking(usage_times, app_handle);
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_usage_summary,
            usage::get_active_app,
            usage::get_active_app_with_title,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
