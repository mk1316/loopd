// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use std::sync::Arc;
use sqlx::SqlitePool;
use app_lib::{database::Database, start_tracking};
use std::path::PathBuf;
use tauri_plugin_sql::{Builder, Migration, MigrationKind};

fn main() {
    // Define SQL migrations for the plugin
    let migrations = vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: include_str!("../migrations/0001_init.sql"),
        kind: MigrationKind::Up,
    }];

    let tauri_builder = tauri::Builder::default()
        .plugin(
            Builder::default()
                .add_migrations("sqlite:usage.db", migrations)
                .build(),
        );

    tauri_builder
        .setup(|app| {
            tauri::async_runtime::block_on(async {
                // ----------------------------------------------------------------------------
                // Resolve an **absolute** path for the SQLite database in the user's data dir
                // ----------------------------------------------------------------------------
                let mut db_dir: PathBuf = app
                    .path()
                    .app_data_dir()
                    .expect("failed to resolve app data directory");

                // Ensure the directory exists
                if let Err(e) = std::fs::create_dir_all(&db_dir) {
                    eprintln!("Failed to create data directory: {e}");
                }

                db_dir.push("usage.db");

                let db_path = db_dir;

                // Build a sqlx connection string that matches the plugin connection string
                // The plugin will resolve "sqlite:usage.db" relative to AppConfig, so we do the same.
                let db_url = format!("sqlite://{}", db_path.to_string_lossy());

                // Connect the pool (will create the file if missing)
                let pool = SqlitePool::connect(&db_url)
                    .await
                    .expect("Failed to connect to SQLite database");

                // Run runtime migrations (plugin will also run them, but running twice is idempotent)
                let _ = sqlx::migrate!("./migrations").run(&pool).await;

                // Wrap the Database in an Arc so it can be shared safely
                let db = Arc::new(Database::new(pool));

                // Make the Database available as managed state for commands
                app.manage(db.clone());

                // Start background tracking, passing the same Arc
                start_tracking(db.clone(), app.handle().clone());
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            app_lib::usage::get_active_app,
            app_lib::usage::get_active_app_with_title,
            app_lib::database::get_usage_summary,
            app_lib::database::get_usage_summary_command,
            app_lib::database::get_usage_summary_for_period_command,
            app_lib::database::get_current_session_command,
            app_lib::database::get_sessions_command,
            app_lib::database::clear_all_data_command,
            app_lib::database::clear_all_data_and_reset_command,
            app_lib::database::get_app_device_id,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
