use chrono::{DateTime, Utc};
use serde_json::Value as JsonValue;
use std::collections::HashMap;
use std::sync::Arc;
use tauri::State;

use crate::aw_database::AwDatabase;
use crate::aw_models::{Bucket, Event, GetEventsParams, Heartbeat, ServerInfo};

/// Shared AW database handle
pub type AwDb = Arc<AwDatabase>;

// ========== Info Commands ==========

/// Get server info
#[tauri::command]
pub async fn aw_get_info(app_handle: tauri::AppHandle) -> Result<ServerInfo, String> {
    let device_id = crate::get_or_create_device_id(&app_handle);
    let hostname = gethostname::gethostname()
        .to_string_lossy()
        .to_string();

    Ok(ServerInfo {
        hostname,
        version: env!("CARGO_PKG_VERSION").to_string(),
        testing: cfg!(debug_assertions),
        device_id,
    })
}

// ========== Bucket Commands ==========

/// Get all buckets
#[tauri::command]
pub async fn aw_get_buckets(
    aw_db: State<'_, AwDb>,
) -> Result<HashMap<String, Bucket>, String> {
    aw_db.get_buckets()
        .await
        .map_err(|e| format!("Failed to get buckets: {}", e))
}

/// Get a single bucket by ID
#[tauri::command]
pub async fn aw_get_bucket(
    aw_db: State<'_, AwDb>,
    bucket_id: String,
) -> Result<Bucket, String> {
    aw_db.get_bucket(&bucket_id)
        .await
        .map_err(|e| format!("Failed to get bucket: {}", e))?
        .ok_or_else(|| format!("Bucket not found: {}", bucket_id))
}

/// Create a new bucket
#[tauri::command]
pub async fn aw_create_bucket(
    aw_db: State<'_, AwDb>,
    bucket_id: String,
    bucket_type: String,
    client: String,
    hostname: String,
) -> Result<Bucket, String> {
    let bucket = Bucket {
        id: bucket_id,
        name: None,
        bucket_type,
        client,
        hostname,
        created: Utc::now(),
        data: None,
        last_updated: None,
    };

    aw_db.get_or_create_bucket(&bucket)
        .await
        .map_err(|e| format!("Failed to create bucket: {}", e))
}

/// Delete a bucket
#[tauri::command]
pub async fn aw_delete_bucket(
    aw_db: State<'_, AwDb>,
    bucket_id: String,
) -> Result<(), String> {
    aw_db.delete_bucket(&bucket_id)
        .await
        .map_err(|e| format!("Failed to delete bucket: {}", e))
}

// ========== Event Commands ==========

/// Get events from a bucket
#[tauri::command]
pub async fn aw_get_events(
    aw_db: State<'_, AwDb>,
    bucket_id: String,
    start: Option<String>,
    end: Option<String>,
    limit: Option<i64>,
) -> Result<Vec<Event>, String> {
    let params = GetEventsParams {
        start: start.and_then(|s| DateTime::parse_from_rfc3339(&s).ok().map(|dt| dt.with_timezone(&Utc))),
        end: end.and_then(|s| DateTime::parse_from_rfc3339(&s).ok().map(|dt| dt.with_timezone(&Utc))),
        limit,
    };

    aw_db.get_events(&bucket_id, &params)
        .await
        .map_err(|e| format!("Failed to get events: {}", e))
}

/// Get a single event
#[tauri::command]
pub async fn aw_get_event(
    aw_db: State<'_, AwDb>,
    bucket_id: String,
    event_id: i64,
) -> Result<Event, String> {
    aw_db.get_event(&bucket_id, event_id)
        .await
        .map_err(|e| format!("Failed to get event: {}", e))?
        .ok_or_else(|| format!("Event not found: {}", event_id))
}

/// Insert events into a bucket
#[tauri::command]
pub async fn aw_insert_events(
    aw_db: State<'_, AwDb>,
    bucket_id: String,
    events: Vec<Event>,
) -> Result<Vec<Event>, String> {
    aw_db.insert_events(&bucket_id, &events)
        .await
        .map_err(|e| format!("Failed to insert events: {}", e))
}

/// Delete an event
#[tauri::command]
pub async fn aw_delete_event(
    aw_db: State<'_, AwDb>,
    bucket_id: String,
    event_id: i64,
) -> Result<bool, String> {
    aw_db.delete_event(&bucket_id, event_id)
        .await
        .map_err(|e| format!("Failed to delete event: {}", e))
}

/// Get event count for a bucket
#[tauri::command]
pub async fn aw_get_event_count(
    aw_db: State<'_, AwDb>,
    bucket_id: String,
) -> Result<i64, String> {
    aw_db.get_event_count(&bucket_id)
        .await
        .map_err(|e| format!("Failed to get event count: {}", e))
}

// ========== Heartbeat Command ==========

/// Submit a heartbeat event (merges with last event if data matches)
#[tauri::command]
pub async fn aw_heartbeat(
    aw_db: State<'_, AwDb>,
    bucket_id: String,
    timestamp: String,
    duration: f64,
    data: JsonValue,
    pulsetime: f64,
) -> Result<Event, String> {
    let timestamp = DateTime::parse_from_rfc3339(&timestamp)
        .map_err(|e| format!("Invalid timestamp: {}", e))?
        .with_timezone(&Utc);

    let heartbeat = Heartbeat {
        timestamp,
        duration,
        data,
    };

    aw_db.heartbeat(&bucket_id, &heartbeat, pulsetime)
        .await
        .map_err(|e| format!("Failed to process heartbeat: {}", e))
}

// ========== Query Commands ==========

/// Get usage summary for a bucket
#[tauri::command]
pub async fn aw_get_usage_summary(
    aw_db: State<'_, AwDb>,
    bucket_id: String,
    start: Option<String>,
    end: Option<String>,
) -> Result<Vec<(String, f64)>, String> {
    let start = start.and_then(|s| DateTime::parse_from_rfc3339(&s).ok().map(|dt| dt.with_timezone(&Utc)));
    let end = end.and_then(|s| DateTime::parse_from_rfc3339(&s).ok().map(|dt| dt.with_timezone(&Utc)));

    aw_db.get_usage_summary(&bucket_id, start, end)
        .await
        .map_err(|e| format!("Failed to get usage summary: {}", e))
}

/// Get current/latest event from a bucket
#[tauri::command]
pub async fn aw_get_current_event(
    aw_db: State<'_, AwDb>,
    bucket_id: String,
) -> Result<Option<Event>, String> {
    aw_db.get_current_event(&bucket_id)
        .await
        .map_err(|e| format!("Failed to get current event: {}", e))
}

// ========== Settings Commands ==========

/// Get a setting value
#[tauri::command]
pub async fn aw_get_setting(
    aw_db: State<'_, AwDb>,
    key: String,
) -> Result<Option<String>, String> {
    aw_db.get_setting(&key)
        .await
        .map_err(|e| format!("Failed to get setting: {}", e))
}

/// Set a setting value
#[tauri::command]
pub async fn aw_set_setting(
    aw_db: State<'_, AwDb>,
    key: String,
    value: String,
) -> Result<(), String> {
    aw_db.set_setting(&key, &value)
        .await
        .map_err(|e| format!("Failed to set setting: {}", e))
}

// ========== Export Commands ==========

/// Export a bucket with all its events
#[tauri::command]
pub async fn aw_export_bucket(
    aw_db: State<'_, AwDb>,
    bucket_id: String,
) -> Result<crate::aw_models::BucketExport, String> {
    let bucket = aw_db.get_bucket(&bucket_id)
        .await
        .map_err(|e| format!("Failed to get bucket: {}", e))?
        .ok_or_else(|| format!("Bucket not found: {}", bucket_id))?;

    let events = aw_db.get_events(&bucket_id, &GetEventsParams::default())
        .await
        .map_err(|e| format!("Failed to get events: {}", e))?;

    Ok(crate::aw_models::BucketExport { bucket, events })
}

/// Export all buckets with events
#[tauri::command]
pub async fn aw_export_all(
    aw_db: State<'_, AwDb>,
) -> Result<HashMap<String, crate::aw_models::BucketExport>, String> {
    let buckets = aw_db.get_buckets()
        .await
        .map_err(|e| format!("Failed to get buckets: {}", e))?;

    let mut exports = HashMap::new();
    for (id, bucket) in buckets {
        let events = aw_db.get_events(&id, &GetEventsParams::default())
            .await
            .map_err(|e| format!("Failed to get events: {}", e))?;

        exports.insert(id.clone(), crate::aw_models::BucketExport { bucket, events });
    }

    Ok(exports)
}
