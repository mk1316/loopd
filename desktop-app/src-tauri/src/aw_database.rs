use chrono::{DateTime, Datelike, Utc};
use serde_json::Value as JsonValue;
use sqlx::{Pool, Sqlite, Row};
use std::collections::HashMap;

use crate::aw_models::{Bucket, Event, GetEventsParams, Heartbeat};

/// ActivityWatch-compatible database operations
pub struct AwDatabase {
    pool: Pool<Sqlite>,
}

impl AwDatabase {
    pub fn new(pool: Pool<Sqlite>) -> Self {
        Self { pool }
    }

    // ========== Bucket Operations ==========

    /// Get all buckets
    pub async fn get_buckets(&self) -> Result<HashMap<String, Bucket>, sqlx::Error> {
        let rows = sqlx::query(
            "SELECT id, name, type, client, hostname, created, data, last_updated FROM buckets"
        )
        .fetch_all(&self.pool)
        .await?;

        let mut buckets = HashMap::new();
        for row in rows {
            let id: String = row.get("id");
            let bucket = Bucket {
                id: id.clone(),
                name: row.get("name"),
                bucket_type: row.get("type"),
                client: row.get("client"),
                hostname: row.get("hostname"),
                created: parse_datetime(row.get("created")),
                data: row.get::<Option<String>, _>("data")
                    .and_then(|s| serde_json::from_str(&s).ok()),
                last_updated: row.get::<Option<String>, _>("last_updated")
                    .map(|s| parse_datetime(&s)),
            };
            buckets.insert(id, bucket);
        }

        Ok(buckets)
    }

    /// Get a single bucket by ID
    pub async fn get_bucket(&self, bucket_id: &str) -> Result<Option<Bucket>, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, name, type, client, hostname, created, data, last_updated FROM buckets WHERE id = ?"
        )
        .bind(bucket_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(|r| Bucket {
            id: r.get("id"),
            name: r.get("name"),
            bucket_type: r.get("type"),
            client: r.get("client"),
            hostname: r.get("hostname"),
            created: parse_datetime(r.get("created")),
            data: r.get::<Option<String>, _>("data")
                .and_then(|s| serde_json::from_str(&s).ok()),
            last_updated: r.get::<Option<String>, _>("last_updated")
                .map(|s| parse_datetime(&s)),
        }))
    }

    /// Create a new bucket
    pub async fn create_bucket(&self, bucket: &Bucket) -> Result<(), sqlx::Error> {
        let data_json = bucket.data.as_ref()
            .map(|d| serde_json::to_string(d).unwrap_or_else(|_| "{}".to_string()));

        sqlx::query(
            "INSERT INTO buckets (id, name, type, client, hostname, created, data, last_updated)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(&bucket.id)
        .bind(&bucket.name)
        .bind(&bucket.bucket_type)
        .bind(&bucket.client)
        .bind(&bucket.hostname)
        .bind(bucket.created.to_rfc3339())
        .bind(&data_json)
        .bind(bucket.last_updated.map(|dt| dt.to_rfc3339()))
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    /// Create bucket if it doesn't exist, return existing or new bucket
    pub async fn get_or_create_bucket(&self, bucket: &Bucket) -> Result<Bucket, sqlx::Error> {
        if let Some(existing) = self.get_bucket(&bucket.id).await? {
            return Ok(existing);
        }
        self.create_bucket(bucket).await?;
        Ok(bucket.clone())
    }

    /// Delete a bucket and all its events
    pub async fn delete_bucket(&self, bucket_id: &str) -> Result<(), sqlx::Error> {
        // Events are deleted via CASCADE
        sqlx::query("DELETE FROM buckets WHERE id = ?")
            .bind(bucket_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    /// Update bucket's last_updated timestamp
    pub async fn update_bucket_last_updated(&self, bucket_id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("UPDATE buckets SET last_updated = ? WHERE id = ?")
            .bind(Utc::now().to_rfc3339())
            .bind(bucket_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    // ========== Event Operations ==========

    /// Get events from a bucket with optional filtering
    pub async fn get_events(
        &self,
        bucket_id: &str,
        params: &GetEventsParams,
    ) -> Result<Vec<Event>, sqlx::Error> {
        let mut query = String::from(
            "SELECT id, bucket_id, timestamp, duration, data FROM events WHERE bucket_id = ?"
        );

        if params.start.is_some() {
            query.push_str(" AND timestamp >= ?");
        }
        if params.end.is_some() {
            query.push_str(" AND timestamp <= ?");
        }

        query.push_str(" ORDER BY timestamp DESC");

        if params.limit.is_some() {
            query.push_str(" LIMIT ?");
        }

        let mut q = sqlx::query(&query).bind(bucket_id);

        if let Some(start) = &params.start {
            q = q.bind(start.to_rfc3339());
        }
        if let Some(end) = &params.end {
            q = q.bind(end.to_rfc3339());
        }
        if let Some(limit) = params.limit {
            q = q.bind(limit);
        }

        let rows = q.fetch_all(&self.pool).await?;

        let events = rows.iter().map(|r| Event {
            id: Some(r.get("id")),
            bucket_id: Some(r.get("bucket_id")),
            timestamp: parse_datetime(r.get("timestamp")),
            duration: r.get("duration"),
            data: serde_json::from_str(r.get::<&str, _>("data")).unwrap_or(JsonValue::Null),
        }).collect();

        Ok(events)
    }

    /// Get a single event by ID
    pub async fn get_event(&self, bucket_id: &str, event_id: i64) -> Result<Option<Event>, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, bucket_id, timestamp, duration, data FROM events WHERE bucket_id = ? AND id = ?"
        )
        .bind(bucket_id)
        .bind(event_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(|r| Event {
            id: Some(r.get("id")),
            bucket_id: Some(r.get("bucket_id")),
            timestamp: parse_datetime(r.get("timestamp")),
            duration: r.get("duration"),
            data: serde_json::from_str(r.get::<&str, _>("data")).unwrap_or(JsonValue::Null),
        }))
    }

    /// Insert multiple events into a bucket
    pub async fn insert_events(&self, bucket_id: &str, events: &[Event]) -> Result<Vec<Event>, sqlx::Error> {
        let mut inserted = Vec::new();

        for event in events {
            let data_json = serde_json::to_string(&event.data).unwrap_or_else(|_| "{}".to_string());

            let result = sqlx::query(
                "INSERT INTO events (bucket_id, timestamp, duration, data) VALUES (?, ?, ?, ?)"
            )
            .bind(bucket_id)
            .bind(event.timestamp.to_rfc3339())
            .bind(event.duration)
            .bind(&data_json)
            .execute(&self.pool)
            .await?;

            let mut new_event = event.clone();
            new_event.id = Some(result.last_insert_rowid());
            new_event.bucket_id = Some(bucket_id.to_string());
            inserted.push(new_event);
        }

        // Update bucket's last_updated
        self.update_bucket_last_updated(bucket_id).await?;

        Ok(inserted)
    }

    /// Insert a single event
    pub async fn insert_event(&self, bucket_id: &str, event: &Event) -> Result<Event, sqlx::Error> {
        let events = self.insert_events(bucket_id, &[event.clone()]).await?;
        Ok(events.into_iter().next().unwrap())
    }

    /// Delete an event
    pub async fn delete_event(&self, bucket_id: &str, event_id: i64) -> Result<bool, sqlx::Error> {
        let result = sqlx::query("DELETE FROM events WHERE bucket_id = ? AND id = ?")
            .bind(bucket_id)
            .bind(event_id)
            .execute(&self.pool)
            .await?;
        Ok(result.rows_affected() > 0)
    }

    /// Get event count for a bucket
    pub async fn get_event_count(&self, bucket_id: &str) -> Result<i64, sqlx::Error> {
        let row = sqlx::query("SELECT COUNT(*) as count FROM events WHERE bucket_id = ?")
            .bind(bucket_id)
            .fetch_one(&self.pool)
            .await?;
        Ok(row.get("count"))
    }

    /// Heartbeat - merge with last event if data matches and within pulsetime
    pub async fn heartbeat(
        &self,
        bucket_id: &str,
        heartbeat: &Heartbeat,
        pulsetime: f64,
    ) -> Result<Event, sqlx::Error> {
        // Get the last event in this bucket
        let last_event = sqlx::query(
            "SELECT id, bucket_id, timestamp, duration, data FROM events
             WHERE bucket_id = ? ORDER BY timestamp DESC LIMIT 1"
        )
        .bind(bucket_id)
        .fetch_optional(&self.pool)
        .await?;

        if let Some(row) = last_event {
            let last_id: i64 = row.get("id");
            let last_timestamp: String = row.get("timestamp");
            let last_timestamp = parse_datetime(&last_timestamp);
            let last_duration: f64 = row.get("duration");
            let last_data: String = row.get("data");
            let last_data: JsonValue = serde_json::from_str(&last_data).unwrap_or(JsonValue::Null);

            // Calculate end time of last event
            let last_end = last_timestamp + chrono::Duration::milliseconds((last_duration * 1000.0) as i64);

            // Check if heartbeat is within pulsetime of last event's end
            let time_diff = (heartbeat.timestamp - last_end).num_milliseconds() as f64 / 1000.0;

            // If data matches and within pulsetime, merge
            if time_diff <= pulsetime && last_data == heartbeat.data {
                // Extend the last event
                let new_duration = (heartbeat.timestamp - last_timestamp).num_milliseconds() as f64 / 1000.0 + heartbeat.duration;

                sqlx::query("UPDATE events SET duration = ? WHERE id = ?")
                    .bind(new_duration)
                    .bind(last_id)
                    .execute(&self.pool)
                    .await?;

                // Update bucket's last_updated
                self.update_bucket_last_updated(bucket_id).await?;

                return Ok(Event {
                    id: Some(last_id),
                    bucket_id: Some(bucket_id.to_string()),
                    timestamp: last_timestamp,
                    duration: new_duration,
                    data: last_data,
                });
            }
        }

        // Otherwise, insert as new event
        self.insert_event(bucket_id, &heartbeat.clone().to_event()).await
    }

    // ========== Query Operations ==========

    /// Get usage summary for a time period
    pub async fn get_usage_summary(
        &self,
        bucket_id: &str,
        start: Option<DateTime<Utc>>,
        end: Option<DateTime<Utc>>,
    ) -> Result<Vec<(String, f64)>, sqlx::Error> {
        let mut query = String::from(
            "SELECT json_extract(data, '$.app') as app, SUM(duration) as total
             FROM events WHERE bucket_id = ?"
        );

        if start.is_some() {
            query.push_str(" AND timestamp >= ?");
        }
        if end.is_some() {
            query.push_str(" AND timestamp <= ?");
        }

        query.push_str(" GROUP BY app ORDER BY total DESC");

        let mut q = sqlx::query(&query).bind(bucket_id);

        if let Some(start) = start {
            q = q.bind(start.to_rfc3339());
        }
        if let Some(end) = end {
            q = q.bind(end.to_rfc3339());
        }

        let rows = q.fetch_all(&self.pool).await?;

        let summary = rows.iter().map(|r| {
            let app: Option<String> = r.get("app");
            let total: f64 = r.get("total");
            (app.unwrap_or_else(|| "Unknown".to_string()), total)
        }).collect();

        Ok(summary)
    }

    /// Get the current/latest event from a bucket
    pub async fn get_current_event(&self, bucket_id: &str) -> Result<Option<Event>, sqlx::Error> {
        let row = sqlx::query(
            "SELECT id, bucket_id, timestamp, duration, data FROM events
             WHERE bucket_id = ? ORDER BY timestamp DESC LIMIT 1"
        )
        .bind(bucket_id)
        .fetch_optional(&self.pool)
        .await?;

        Ok(row.map(|r| Event {
            id: Some(r.get("id")),
            bucket_id: Some(r.get("bucket_id")),
            timestamp: parse_datetime(r.get("timestamp")),
            duration: r.get("duration"),
            data: serde_json::from_str(r.get::<&str, _>("data")).unwrap_or(JsonValue::Null),
        }))
    }

    // ========== Key-Value Operations ==========

    /// Get a value from the key-value store
    pub async fn get_setting(&self, key: &str) -> Result<Option<String>, sqlx::Error> {
        let row = sqlx::query("SELECT value FROM key_value WHERE key = ?")
            .bind(key)
            .fetch_optional(&self.pool)
            .await?;
        Ok(row.map(|r| r.get("value")))
    }

    /// Set a value in the key-value store
    pub async fn set_setting(&self, key: &str, value: &str) -> Result<(), sqlx::Error> {
        sqlx::query(
            "INSERT OR REPLACE INTO key_value (key, value, updated_at) VALUES (?, ?, ?)"
        )
        .bind(key)
        .bind(value)
        .bind(Utc::now().to_rfc3339())
        .execute(&self.pool)
        .await?;
        Ok(())
    }

    /// Delete a setting
    pub async fn delete_setting(&self, key: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM key_value WHERE key = ?")
            .bind(key)
            .execute(&self.pool)
            .await?;
        Ok(())
    }
}

/// Helper to parse datetime from SQLite string
fn parse_datetime(s: &str) -> DateTime<Utc> {
    DateTime::parse_from_rfc3339(s)
        .map(|dt| dt.with_timezone(&Utc))
        .unwrap_or_else(|_| {
            // Try parsing as SQLite datetime format
            chrono::NaiveDateTime::parse_from_str(s, "%Y-%m-%d %H:%M:%S")
                .map(|ndt| DateTime::from_naive_utc_and_offset(ndt, Utc))
                .unwrap_or_else(|_| Utc::now())
        })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_datetime() {
        let rfc3339 = "2024-01-15T10:30:00Z";
        let dt = parse_datetime(rfc3339);
        assert_eq!(dt.year(), 2024);

        let sqlite_format = "2024-01-15 10:30:00";
        let dt = parse_datetime(sqlite_format);
        assert_eq!(dt.year(), 2024);
    }
}
