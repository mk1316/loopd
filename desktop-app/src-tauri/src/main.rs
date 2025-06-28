// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_sql::{Builder, Migration, MigrationKind};
use tauri::Manager;
use std::sync::Arc;
use sqlx::SqlitePool;
use app_lib::{database::Database, start_tracking};

fn main() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create_initial_tables",
            sql: include_str!("../migrations/0001_init.sql"),
            kind: MigrationKind::Up,
        }
    ];

    tauri::Builder::default()
        .plugin(
            Builder::default()
                .add_migrations("sqlite:usage.db", migrations)
                .build(),
        )
        .setup(|app| {
            // Initialize database in an async context
            tauri::async_runtime::block_on(async {
                // Initialize a sqlx pool to the same SQLite database the plugin is using
                let pool = SqlitePool::connect_lazy("sqlite:usage.db")
                    .expect("Failed to create database pool");
                let db = Arc::new(Database::new(pool));

                // Store database in Tauri state so commands can access it if needed
                app.manage(db.clone());

                // Start background tracking
                start_tracking(db, app.handle().clone());
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            app_lib::usage::get_active_app,
            app_lib::usage::get_active_app_with_title,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
