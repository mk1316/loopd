use anyhow::Result;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{Pool, Sqlite, Row};
use tauri::State;
use uuid::Uuid;
use crate::Db;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Device {
    pub id: String,
    pub user_id: Option<String>,
    pub name: String,
    pub os: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub device_id: String,
    pub user_id: Option<String>,
    pub app_name: String,
    pub window_title: String,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration_sec: Option<i64>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageSummary {
    pub day: String,
    pub app_name: String,
    pub total_seconds: i64,
}

pub struct Database {
    pool: Pool<Sqlite>,
}

impl Database {
    pub fn new(pool: Pool<Sqlite>) -> Self {
        Self { pool }
    }

    pub async fn initialize_device(&self, device_name: String, os: String) -> Result<String, sqlx::Error> {
        let device_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        // Check if device already exists
        let existing_device = sqlx::query("SELECT id FROM devices LIMIT 1")
            .fetch_optional(&self.pool)
            .await?;

        if existing_device.is_none() {
            // Insert new device
            sqlx::query(
                "INSERT INTO devices (id, name, os, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
            )
            .bind(&device_id)
            .bind(&device_name)
            .bind(&os)
            .bind(now)
            .bind(now)
            .execute(&self.pool)
            .await?;
        } else {
            // Use existing device ID
            let row = sqlx::query("SELECT id FROM devices LIMIT 1")
                .fetch_one(&self.pool)
                .await?;
            return Ok(row.get("id"));
        }

        Ok(device_id)
    }

    pub async fn initialize_device_with_id(&self, device_id: String, device_name: String, os: String) -> Result<String, sqlx::Error> {
        let now = Utc::now();

        // Check if device already exists
        let existing_device = sqlx::query("SELECT id FROM devices WHERE id = ?")
            .bind(&device_id)
            .fetch_optional(&self.pool)
            .await?;

        if existing_device.is_none() {
            // Insert new device with the provided ID
            sqlx::query(
                "INSERT INTO devices (id, name, os, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
            )
            .bind(&device_id)
            .bind(&device_name)
            .bind(&os)
            .bind(now)
            .bind(now)
            .execute(&self.pool)
            .await?;
            println!("[DB] Created device with persistent ID: {}", device_id);
        } else {
            println!("[DB] Device already exists with ID: {}", device_id);
        }

        Ok(device_id)
    }

    pub async fn end_current_session(&self, device_id: &str) -> Result<(), sqlx::Error> {
        let now = Utc::now();

        println!("[DB] Ending session for device_id: {}", device_id);

        // First, get the current session to calculate duration
        let session_row = sqlx::query(
            "SELECT start_time FROM sessions WHERE device_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1"
        )
        .bind(device_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = session_row {
            let start_time: DateTime<Utc> = row.get("start_time");
            let duration_sec = (now - start_time).num_seconds();

            println!("[DB] Session duration: {} seconds", duration_sec);

            let res = sqlx::query(
                "UPDATE sessions SET end_time = ?, duration_sec = ? WHERE device_id = ? AND end_time IS NULL"
            )
            .bind(now)
            .bind(duration_sec)
            .bind(device_id)
            .execute(&self.pool)
            .await;
            if let Err(e) = &res {
                println!("[DB] Error ending session: {}", e);
            }
            res?;
        } else {
            println!("[DB] No active session found to end");
        }

        Ok(())
    }

    pub async fn start_new_session(&self, device_id: &str, app_name: String, window_title: String) -> Result<String, sqlx::Error> {
        println!("[DB] Starting new session for device_id: {}, app: {}, title: {}", device_id, app_name, window_title);
        let session_id = Uuid::new_v4().to_string();
        let now = Utc::now();

        println!("[DB] Starting new session for device_id: {}, app: {}", device_id, app_name);

        let res = sqlx::query(
            "INSERT INTO sessions (id, device_id, user_id, app_name, window_title, start_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&session_id)
        .bind(device_id)
        .bind::<Option<String>>(None)
        .bind(&app_name)
        .bind(&window_title)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await;
        if let Err(e) = &res {
            println!("[DB] Error starting new session: {}", e);
        }

        res?;
        Ok(session_id)
    }

    pub async fn update_current_session(&self, device_id: &str, app_name: String, window_title: String) -> Result<(), sqlx::Error> {
        let now = Utc::now();

        // End current session with proper duration calculation
        let session_row = sqlx::query(
            "SELECT start_time FROM sessions WHERE device_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1"
        )
        .bind(device_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = session_row {
            let start_time: DateTime<Utc> = row.get("start_time");
            let duration_sec = (now - start_time).num_seconds();

            sqlx::query(
                "UPDATE sessions SET end_time = ?, duration_sec = ? WHERE device_id = ? AND end_time IS NULL"
            )
            .bind(now)
            .bind(duration_sec)
            .bind(device_id)
            .execute(&self.pool)
            .await?;
        }

        // Start new session
        let session_id = Uuid::new_v4().to_string();
        sqlx::query(
            "INSERT INTO sessions (id, device_id, user_id, app_name, window_title, start_time, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&session_id)
        .bind(device_id)
        .bind::<Option<String>>(None)
        .bind(&app_name)
        .bind(&window_title)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_usage_summary(&self) -> Result<Vec<UsageSummary>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT day, app_name, total_seconds FROM usage_summary ORDER BY day DESC, total_seconds DESC"
        )
        .fetch_all(&self.pool)
        .await?;

        let mut summaries = Vec::new();
        for row in rows {
            summaries.push(UsageSummary {
                day: row.get("day"),
                app_name: row.get("app_name"),
                total_seconds: row.get("total_seconds"),
            });
        }

        Ok(summaries)
    }

    pub async fn get_usage_summary_days(&self, days: i64) -> Result<Vec<UsageSummary>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT day, app_name, total_seconds FROM usage_summary WHERE day >= date('now', '-{} days') ORDER BY day DESC, total_seconds DESC"
        )
        .bind(days)
        .fetch_all(&self.pool)
        .await?;

        let mut summaries = Vec::new();
        for row in rows {
            summaries.push(UsageSummary {
                day: row.get("day"),
                app_name: row.get("app_name"),
                total_seconds: row.get("total_seconds"),
            });
        }

        Ok(summaries)
    }

    pub async fn get_current_session(&self, device_id: &str) -> Result<Option<Session>, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, device_id, user_id, app_name, window_title, start_time, end_time, duration_sec, created_at FROM sessions WHERE device_id = ? AND end_time IS NULL ORDER BY start_time DESC LIMIT 1"
        )
        .bind(device_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            Ok(Some(Session {
                id: row.get("id"),
                device_id: row.get("device_id"),
                user_id: row.get("user_id"),
                app_name: row.get("app_name"),
                window_title: row.get("window_title"),
                start_time: row.get("start_time"),
                end_time: row.get("end_time"),
                duration_sec: row.get("duration_sec"),
                created_at: row.get("created_at"),
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn get_device(&self, device_id: &str) -> Result<Option<Device>, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, user_id, name, os, created_at, updated_at FROM devices WHERE id = ?"
        )
        .bind(device_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            Ok(Some(Device {
                id: row.get("id"),
                user_id: row.get("user_id"),
                name: row.get("name"),
                os: row.get("os"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn get_first_device(&self) -> Result<Option<Device>, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, user_id, name, os, created_at, updated_at FROM devices LIMIT 1"
        )
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = row {
            Ok(Some(Device {
                id: row.get("id"),
                user_id: row.get("user_id"),
                name: row.get("name"),
                os: row.get("os"),
                created_at: row.get("created_at"),
                updated_at: row.get("updated_at"),
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn get_sessions(&self, device_id: &str, limit: Option<i64>) -> Result<Vec<Session>, sqlx::Error> {
        let limit = limit.unwrap_or(100);
        let rows = sqlx::query(
            "SELECT id, device_id, user_id, app_name, window_title, start_time, end_time, duration_sec, created_at FROM sessions WHERE device_id = ? ORDER BY start_time DESC LIMIT ?"
        )
        .bind(device_id)
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;

        let mut sessions = Vec::new();
        for row in rows {
            sessions.push(Session {
                id: row.get("id"),
                device_id: row.get("device_id"),
                user_id: row.get("user_id"),
                app_name: row.get("app_name"),
                window_title: row.get("window_title"),
                start_time: row.get("start_time"),
                end_time: row.get("end_time"),
                duration_sec: row.get("duration_sec"),
                created_at: row.get("created_at"),
            });
        }

        Ok(sessions)
    }

    pub async fn set_user_id(&self, device_id: &str, user_id: String) -> Result<(), sqlx::Error> {
        let now = Utc::now();
        sqlx::query(
            "UPDATE devices SET user_id = ?, updated_at = ? WHERE id = ?"
        )
        .bind(&user_id)
        .bind(now)
        .bind(device_id)
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    pub async fn clear_all_data(&self) -> Result<(), sqlx::Error> {
        println!("[DB] Clearing all usage data from database");
        
        // Clear all sessions (but keep devices)
        let sessions_deleted = sqlx::query("DELETE FROM sessions")
            .execute(&self.pool)
            .await?;
        println!("[DB] Deleted {} sessions", sessions_deleted.rows_affected());
        
        // Note: We do NOT delete devices to preserve the persistent device ID
        println!("[DB] All usage data cleared successfully (device ID preserved)");
        Ok(())
    }
}

// Tauri commands
#[tauri::command]
pub async fn get_usage_summary(
    db: State<'_, Db>,
) -> Result<Vec<UsageSummary>, String> {
    db.get_usage_summary()
        .await
        .map_err(|e| format!("Failed to get usage summary: {}", e))
}

#[tauri::command]
pub async fn get_usage_summary_command(
    db: State<'_, Db>,
) -> Result<Vec<UsageSummary>, String> {
    db.get_usage_summary()
        .await
        .map_err(|e| format!("Failed to get usage summary: {}", e))
}

#[tauri::command]
pub async fn get_usage_summary_for_period_command(
    db: State<'_, Db>,
    days: i64,
) -> Result<Vec<UsageSummary>, String> {
    db.get_usage_summary_days(days)
        .await
        .map_err(|e| format!("Failed to get usage summary: {}", e))
}

#[tauri::command]
pub async fn get_current_session_command(
    db: State<'_, Db>,
    device_id: String,
) -> Result<Option<Session>, String> {
    db.get_current_session(&device_id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn clear_all_data_command(
    db: State<'_, Db>,
) -> Result<(), String> {
    db.clear_all_data()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn clear_all_data_and_reset_command(
    db: State<'_, Db>,
) -> Result<(), String> {
    // First clear all data
    db.clear_all_data()
        .await
        .map_err(|e| e.to_string())?;
    
    // Then reset the tracking system
    crate::reset_tracking(&db)
        .await
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

#[tauri::command]
pub fn get_app_device_id(app_handle: tauri::AppHandle) -> String {
    crate::get_or_create_device_id(&app_handle)
} 