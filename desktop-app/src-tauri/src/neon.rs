use anyhow::Result;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use chrono::{DateTime, Utc};

use crate::aw_models::Event;

/// Neon event record for cloud storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NeonEvent {
    pub id: Option<i64>,
    pub bucket_id: String,
    pub device_id: String,
    pub timestamp: String,
    pub duration: f64,
    pub data: Value,
    pub synced_at: Option<String>,
}

impl NeonEvent {
    pub fn from_event(event: &Event, bucket_id: &str, device_id: &str) -> Self {
        Self {
            id: event.id,
            bucket_id: bucket_id.to_string(),
            device_id: device_id.to_string(),
            timestamp: event.timestamp.to_rfc3339(),
            duration: event.duration,
            data: event.data.clone(),
            synced_at: None,
        }
    }
}

/// Neon bucket record for cloud storage
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NeonBucket {
    pub id: String,
    pub device_id: String,
    pub name: Option<String>,
    pub bucket_type: String,
    pub client: String,
    pub hostname: String,
    pub created: String,
    pub data: Option<Value>,
}

/// Neon client for cloud sync using Neon's serverless driver HTTP API
pub struct NeonClient {
    client: Client,
    connection_string: String,
}

impl NeonClient {
    pub fn new(connection_string: String) -> Self {
        let client = Client::new();
        Self {
            client,
            connection_string,
        }
    }

    /// Build the Neon HTTP API URL from the connection string
    /// Extracts just the host from postgres://user:pass@host/database?params
    /// and constructs https://host/sql
    fn build_neon_api_url(&self) -> Result<String> {
        let conn = &self.connection_string;

        // Remove protocol prefix
        let without_protocol = conn
            .strip_prefix("postgres://")
            .or_else(|| conn.strip_prefix("postgresql://"))
            .ok_or_else(|| anyhow::anyhow!("Invalid connection string: missing postgres:// prefix"))?;

        // Find the host - it comes after optional user:pass@ and before /database or ?params
        let after_auth = if let Some(at_pos) = without_protocol.find('@') {
            &without_protocol[at_pos + 1..]
        } else {
            without_protocol
        };

        // Extract just the host (before any / or ?)
        let host = after_auth
            .split('/')
            .next()
            .and_then(|s| s.split('?').next())
            .ok_or_else(|| anyhow::anyhow!("Invalid connection string: couldn't extract host"))?;

        Ok(format!("https://{}/sql", host))
    }

    /// Execute a SQL query via Neon's HTTP API
    async fn execute(&self, query: &str, params: &[Value]) -> Result<Vec<Value>> {
        // Neon serverless driver uses a specific HTTP endpoint
        // Format: https://<endpoint-host>/sql
        // Connection string format: postgres://user:pass@host/database?params
        // We need to extract just the host and use https://host/sql
        let url = self.build_neon_api_url()?;

        let body = serde_json::json!({
            "query": query,
            "params": params
        });

        let response = self.client
            .post(&url)
            .header("Content-Type", "application/json")
            .header("Neon-Connection-String", &self.connection_string)
            .json(&body)
            .send()
            .await?;

        let status = response.status();
        let text = response.text().await?;

        if !status.is_success() {
            return Err(anyhow::anyhow!("Neon request failed: {}", text));
        }

        let result: Value = serde_json::from_str(&text)?;

        // Extract rows from response
        if let Some(rows) = result.get("rows").and_then(|r| r.as_array()) {
            Ok(rows.clone())
        } else {
            Ok(vec![])
        }
    }

    /// Initialize the database schema
    pub async fn init_schema(&self) -> Result<()> {
        // Create buckets table
        self.execute(
            r#"
            CREATE TABLE IF NOT EXISTS buckets (
                id TEXT PRIMARY KEY,
                device_id TEXT NOT NULL,
                name TEXT,
                bucket_type TEXT NOT NULL,
                client TEXT NOT NULL,
                hostname TEXT NOT NULL,
                created TIMESTAMPTZ NOT NULL,
                data JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW()
            )
            "#,
            &[],
        ).await?;

        // Create events table
        self.execute(
            r#"
            CREATE TABLE IF NOT EXISTS events (
                id BIGSERIAL PRIMARY KEY,
                local_id BIGINT,
                bucket_id TEXT NOT NULL REFERENCES buckets(id) ON DELETE CASCADE,
                device_id TEXT NOT NULL,
                timestamp TIMESTAMPTZ NOT NULL,
                duration DOUBLE PRECISION NOT NULL DEFAULT 0,
                data JSONB NOT NULL,
                synced_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(bucket_id, device_id, local_id)
            )
            "#,
            &[],
        ).await?;

        // Create indexes
        self.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_bucket_id ON events(bucket_id)",
            &[],
        ).await?;

        self.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)",
            &[],
        ).await?;

        self.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_device_id ON events(device_id)",
            &[],
        ).await?;

        Ok(())
    }

    /// Test the connection
    pub async fn test_connection(&self) -> Result<()> {
        self.execute("SELECT 1", &[]).await?;
        Ok(())
    }

    /// Sync a bucket to Neon
    pub async fn sync_bucket(&self, bucket: &NeonBucket) -> Result<()> {
        self.execute(
            r#"
            INSERT INTO buckets (id, device_id, name, bucket_type, client, hostname, created, data)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                data = EXCLUDED.data
            "#,
            &[
                Value::String(bucket.id.clone()),
                Value::String(bucket.device_id.clone()),
                bucket.name.clone().map(Value::String).unwrap_or(Value::Null),
                Value::String(bucket.bucket_type.clone()),
                Value::String(bucket.client.clone()),
                Value::String(bucket.hostname.clone()),
                Value::String(bucket.created.clone()),
                bucket.data.clone().unwrap_or(Value::Null),
            ],
        ).await?;
        Ok(())
    }

    /// Sync events to Neon
    pub async fn sync_events(&self, events: &[NeonEvent]) -> Result<usize> {
        if events.is_empty() {
            return Ok(0);
        }

        let mut synced = 0;
        for event in events {
            let result = self.execute(
                r#"
                INSERT INTO events (local_id, bucket_id, device_id, timestamp, duration, data)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (bucket_id, device_id, local_id) DO UPDATE SET
                    duration = EXCLUDED.duration,
                    data = EXCLUDED.data
                "#,
                &[
                    event.id.map(|id| Value::Number(id.into())).unwrap_or(Value::Null),
                    Value::String(event.bucket_id.clone()),
                    Value::String(event.device_id.clone()),
                    Value::String(event.timestamp.clone()),
                    Value::Number(serde_json::Number::from_f64(event.duration).unwrap_or(serde_json::Number::from(0))),
                    event.data.clone(),
                ],
            ).await;

            if result.is_ok() {
                synced += 1;
            }
        }

        Ok(synced)
    }

    /// Get events from Neon for a specific device
    pub async fn get_events(
        &self,
        device_id: &str,
        bucket_id: Option<&str>,
        start: Option<DateTime<Utc>>,
        end: Option<DateTime<Utc>>,
        limit: Option<i64>,
    ) -> Result<Vec<NeonEvent>> {
        let mut query = String::from(
            "SELECT local_id as id, bucket_id, device_id, timestamp, duration, data, synced_at FROM events WHERE device_id = $1"
        );
        let mut params: Vec<Value> = vec![Value::String(device_id.to_string())];
        let mut param_idx = 2;

        if let Some(bid) = bucket_id {
            query.push_str(&format!(" AND bucket_id = ${}", param_idx));
            params.push(Value::String(bid.to_string()));
            param_idx += 1;
        }

        if let Some(s) = start {
            query.push_str(&format!(" AND timestamp >= ${}", param_idx));
            params.push(Value::String(s.to_rfc3339()));
            param_idx += 1;
        }

        if let Some(e) = end {
            query.push_str(&format!(" AND timestamp <= ${}", param_idx));
            params.push(Value::String(e.to_rfc3339()));
            param_idx += 1;
        }

        query.push_str(" ORDER BY timestamp DESC");

        if let Some(l) = limit {
            query.push_str(&format!(" LIMIT {}", l));
        }

        let rows = self.execute(&query, &params).await?;

        let events: Vec<NeonEvent> = rows.iter().filter_map(|row| {
            serde_json::from_value(row.clone()).ok()
        }).collect();

        Ok(events)
    }

    /// Get buckets for a device
    pub async fn get_buckets(&self, device_id: &str) -> Result<Vec<NeonBucket>> {
        let rows = self.execute(
            "SELECT id, device_id, name, bucket_type, client, hostname, created, data FROM buckets WHERE device_id = $1",
            &[Value::String(device_id.to_string())],
        ).await?;

        let buckets: Vec<NeonBucket> = rows.iter().filter_map(|row| {
            serde_json::from_value(row.clone()).ok()
        }).collect();

        Ok(buckets)
    }

    /// Get last sync timestamp for a device
    pub async fn get_last_sync(&self, device_id: &str) -> Result<Option<DateTime<Utc>>> {
        let rows = self.execute(
            "SELECT MAX(synced_at) as last_sync FROM events WHERE device_id = $1",
            &[Value::String(device_id.to_string())],
        ).await?;

        if let Some(row) = rows.first() {
            if let Some(last_sync) = row.get("last_sync").and_then(|v| v.as_str()) {
                if let Ok(dt) = DateTime::parse_from_rfc3339(last_sync) {
                    return Ok(Some(dt.with_timezone(&Utc)));
                }
            }
        }

        Ok(None)
    }

    /// Delete events older than a certain date
    pub async fn delete_old_events(&self, device_id: &str, before: DateTime<Utc>) -> Result<u64> {
        let rows = self.execute(
            "DELETE FROM events WHERE device_id = $1 AND timestamp < $2 RETURNING id",
            &[
                Value::String(device_id.to_string()),
                Value::String(before.to_rfc3339()),
            ],
        ).await?;

        Ok(rows.len() as u64)
    }
}

// ========== Tauri Commands ==========

#[tauri::command]
pub async fn neon_test_connection(connection_string: String) -> Result<(), String> {
    let client = NeonClient::new(connection_string);
    client.test_connection().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn neon_init_schema(connection_string: String) -> Result<(), String> {
    let client = NeonClient::new(connection_string);
    client.init_schema().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn neon_sync_events(
    connection_string: String,
    events: Vec<NeonEvent>,
) -> Result<usize, String> {
    let client = NeonClient::new(connection_string);
    client.sync_events(&events).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn neon_sync_bucket(
    connection_string: String,
    bucket: NeonBucket,
) -> Result<(), String> {
    let client = NeonClient::new(connection_string);
    client.sync_bucket(&bucket).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn neon_get_events(
    connection_string: String,
    device_id: String,
    bucket_id: Option<String>,
    start: Option<String>,
    end: Option<String>,
    limit: Option<i64>,
) -> Result<Vec<NeonEvent>, String> {
    let client = NeonClient::new(connection_string);

    let start_dt = start.and_then(|s| DateTime::parse_from_rfc3339(&s).ok().map(|dt| dt.with_timezone(&Utc)));
    let end_dt = end.and_then(|s| DateTime::parse_from_rfc3339(&s).ok().map(|dt| dt.with_timezone(&Utc)));

    client.get_events(&device_id, bucket_id.as_deref(), start_dt, end_dt, limit)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn neon_get_buckets(
    connection_string: String,
    device_id: String,
) -> Result<Vec<NeonBucket>, String> {
    let client = NeonClient::new(connection_string);
    client.get_buckets(&device_id).await.map_err(|e| e.to_string())
}
