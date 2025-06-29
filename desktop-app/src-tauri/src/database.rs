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

    // Sync-related methods
    pub async fn get_unsynced_sessions(&self, device_id: &str) -> Result<Vec<Session>, sqlx::Error> {
        println!("[DB] Getting unsynced sessions for device: {}", device_id);
        
        let rows = sqlx::query(
            "SELECT id, device_id, user_id, app_name, window_title, start_time, end_time, duration_sec, created_at 
             FROM sessions 
             WHERE device_id = ? AND synced = 0 AND duration_sec IS NOT NULL 
             ORDER BY start_time ASC"
        )
        .bind(device_id)
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

        println!("[DB] Found {} unsynced sessions", sessions.len());
        Ok(sessions)
    }

    pub async fn mark_sessions_synced(&self, session_ids: Vec<String>) -> Result<(), sqlx::Error> {
        if session_ids.is_empty() {
            return Ok(());
        }

        println!("[DB] Marking {} sessions as synced", session_ids.len());
        
        // Create placeholders for the IN clause
        let placeholders: String = session_ids.iter()
            .map(|_| "?")
            .collect::<Vec<_>>()
            .join(",");
        
        let query = format!("UPDATE sessions SET synced = 1 WHERE id IN ({})", placeholders);
        
        let mut query_builder = sqlx::query(&query);
        for id in &session_ids {
            query_builder = query_builder.bind(id);
        }
        
        query_builder.execute(&self.pool).await?;
        println!("[DB] Successfully marked {} sessions as synced", session_ids.len());
        Ok(())
    }

    pub async fn sync_to_supabase(&self, device_id: &str, user_id: &str, supabase_url: &str, supabase_key: &str, access_token: &str) -> Result<(), Box<dyn std::error::Error>> {
        println!("[DB] Starting sync to Supabase for device: {}, user: {}", device_id, user_id);
        
        // Get unsynced sessions
        let unsynced_sessions = self.get_unsynced_sessions(device_id).await?;
        
        if unsynced_sessions.is_empty() {
            println!("[DB] No unsynced sessions to sync");
            return Ok(());
        }

        // Create Supabase client and upload sessions
        let mut supabase_client = crate::supabase::SupabaseClient::new(
            supabase_url.to_string(),
            supabase_key.to_string(),
        );
        
        // Set the user's access token for authenticated requests
        supabase_client.set_user_token(access_token.to_string());

        // Get session IDs to check for existing records
        let session_ids: Vec<String> = unsynced_sessions.iter()
            .map(|s| s.id.clone())
            .collect();
        
        // Check which sessions already exist in Supabase
        let existing_ids = match supabase_client.check_existing_sessions(session_ids.clone()).await {
            Ok(ids) => ids,
            Err(e) => {
                println!("[DB] Failed to check existing sessions: {}", e);
                // If we can't check, assume none exist and proceed
                vec![]
            }
        };
        
        // Filter out sessions that already exist
        let new_sessions: Vec<&Session> = unsynced_sessions.iter()
            .filter(|s| !existing_ids.contains(&s.id))
            .collect();
            
        if new_sessions.is_empty() {
            println!("[DB] All sessions already exist in Supabase, marking as synced");
            // Mark all sessions as synced since they already exist
            self.mark_sessions_synced(session_ids).await?;
            return Ok(());
        }
        
        let new_sessions_count = new_sessions.len();
        println!("[DB] Found {} new sessions to sync ({} already exist)", 
                new_sessions_count, existing_ids.len());

        // Convert local sessions to Supabase format (only new ones)
        let mut supabase_sessions = Vec::new();
        for session in &new_sessions {
            let supabase_session = crate::supabase::SupabaseSession {
                id: session.id.clone(),
                device_id: session.device_id.clone(),
                user_id: user_id.to_string(),
                app_name: session.app_name.clone(),
                window_title: Some(session.window_title.clone()),
                duration_seconds: session.duration_sec.unwrap_or(0),
                start_time: session.start_time.to_rfc3339(),
                created_at: session.created_at.to_rfc3339(),
            };
            supabase_sessions.push(supabase_session);
        }

        match supabase_client.upload_sessions(supabase_sessions).await {
            Ok(_) => {
                println!("[DB] Successfully uploaded {} sessions to Supabase", new_sessions_count);
                
                // Mark ALL sessions as synced (both existing and new ones)
                // This includes the 168 existing sessions + 4 new sessions = 172 total
                let total_synced = session_ids.len();
                self.mark_sessions_synced(session_ids).await?;
                
                println!("[DB] Sync completed successfully - marked {} total sessions as synced", total_synced);
                Ok(())
            }
            Err(e) => {
                println!("[DB] Failed to upload sessions to Supabase: {}", e);
                Err(e.into())
            }
        }
    }

    /// Patch all open sessions for a device by setting their end_time and duration_sec to the provided end_time
    pub async fn patch_open_sessions_with_end_time(&self, device_id: &str, end_time: DateTime<Utc>) -> Result<(), sqlx::Error> {
        // Get all open sessions for this device
        let rows = sqlx::query("SELECT id, start_time FROM sessions WHERE device_id = ? AND end_time IS NULL")
            .bind(device_id)
            .fetch_all(&self.pool)
            .await?;
        for row in rows {
            let id: String = row.get("id");
            let start_time: DateTime<Utc> = row.get("start_time");
            let duration_sec = (end_time - start_time).num_seconds();
            sqlx::query("UPDATE sessions SET end_time = ?, duration_sec = ? WHERE id = ?")
                .bind(end_time)
                .bind(duration_sec)
                .bind(&id)
                .execute(&self.pool)
                .await?;
        }
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
    println!("[CMD] clear_all_data_and_reset_command called");
    
    // First clear all data
    println!("[CMD] Clearing all data...");
    db.clear_all_data()
        .await
        .map_err(|e| e.to_string())?;
    
    // Then reset the tracking system
    println!("[CMD] Resetting tracking system...");
    crate::reset_tracking(&db)
        .await
        .map_err(|e| e.to_string())?;
    
    println!("[CMD] clear_all_data_and_reset_command completed successfully");
    Ok(())
}

#[tauri::command]
pub fn get_app_device_id(app_handle: tauri::AppHandle) -> String {
    crate::get_or_create_device_id(&app_handle)
}

#[tauri::command]
pub async fn get_sessions_command(
    db: State<'_, Db>,
    device_id: String,
    limit: Option<i64>,
) -> Result<Vec<Session>, String> {
    db.get_sessions(&device_id, limit)
        .await
        .map_err(|e| format!("Failed to get sessions: {}", e))
}

// New sync-related commands
#[tauri::command]
pub async fn sync_data_command(
    db: State<'_, Db>,
    device_id: String,
    user_id: String,
    supabase_url: String,
    supabase_key: String,
    access_token: String,
) -> Result<(), String> {
    println!("[CMD] sync_data_command called for device: {}, user: {}", device_id, user_id);
    
    db.sync_to_supabase(&device_id, &user_id, &supabase_url, &supabase_key, &access_token)
        .await
        .map_err(|e| format!("Failed to sync data: {}", e))
}

#[tauri::command]
pub async fn get_unsynced_sessions_command(
    db: State<'_, Db>,
    device_id: String,
) -> Result<Vec<Session>, String> {
    println!("[CMD] get_unsynced_sessions_command called for device: {}", device_id);
    
    db.get_unsynced_sessions(&device_id)
        .await
        .map_err(|e| format!("Failed to get unsynced sessions: {}", e))
}

#[tauri::command]
pub async fn test_supabase_connection_command(
    supabase_url: String,
    supabase_key: String,
) -> Result<(), String> {
    println!("[CMD] test_supabase_connection_command called");
    
    let supabase_client = crate::supabase::SupabaseClient::new(
        supabase_url,
        supabase_key,
    );
    
    supabase_client.test_connection()
        .await
        .map_err(|e| format!("Failed to test Supabase connection: {}", e))
}

#[tauri::command]
pub async fn patch_open_sessions_with_end_time(
    db: State<'_, Db>,
    device_id: String,
    end_time: String,
) -> Result<(), String> {
    // Parse end_time as RFC3339 string
    let end_time = chrono::DateTime::parse_from_rfc3339(&end_time)
        .map_err(|e| format!("Invalid end_time: {}", e))?
        .with_timezone(&Utc);
    db.patch_open_sessions_with_end_time(&device_id, end_time)
        .await
        .map_err(|e| format!("Failed to patch open sessions: {}", e))
} 