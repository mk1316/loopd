use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value as JsonValue;

/// ActivityWatch-compatible Bucket
/// A bucket is a container for events from a specific watcher on a specific host
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bucket {
    pub id: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    #[serde(rename = "type")]
    pub bucket_type: String,
    pub client: String,
    pub hostname: String,
    pub created: DateTime<Utc>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<JsonValue>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub last_updated: Option<DateTime<Utc>>,
}

impl Bucket {
    /// Create a new bucket with standard naming convention
    pub fn new(bucket_type: &str, client: &str, hostname: &str) -> Self {
        let id = format!("{}_{}", client, hostname);
        Self {
            id,
            name: None,
            bucket_type: bucket_type.to_string(),
            client: client.to_string(),
            hostname: hostname.to_string(),
            created: Utc::now(),
            data: None,
            last_updated: None,
        }
    }

    /// Create a window watcher bucket
    pub fn window_bucket(hostname: &str) -> Self {
        Self::new("currentwindow", "aw-watcher-window", hostname)
    }

    /// Create an AFK watcher bucket
    pub fn afk_bucket(hostname: &str) -> Self {
        Self::new("afkstatus", "aw-watcher-afk", hostname)
    }

    /// Create a loopd window watcher bucket
    pub fn loopd_window_bucket(hostname: &str) -> Self {
        Self::new("currentwindow", "loopd", hostname)
    }
}

/// ActivityWatch-compatible Event
/// Events store the actual activity data with flexible JSON data field
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bucket_id: Option<String>,
    pub timestamp: DateTime<Utc>,
    pub duration: f64,
    pub data: JsonValue,
}

impl Event {
    /// Create a new event
    pub fn new(timestamp: DateTime<Utc>, duration: f64, data: JsonValue) -> Self {
        Self {
            id: None,
            bucket_id: None,
            timestamp,
            duration,
            data,
        }
    }

    /// Create a window event
    pub fn window_event(timestamp: DateTime<Utc>, duration: f64, app: &str, title: &str) -> Self {
        Self::new(
            timestamp,
            duration,
            serde_json::json!({
                "app": app,
                "title": title
            }),
        )
    }

    /// Create an AFK event
    pub fn afk_event(timestamp: DateTime<Utc>, duration: f64, is_afk: bool) -> Self {
        Self::new(
            timestamp,
            duration,
            serde_json::json!({
                "status": if is_afk { "afk" } else { "not-afk" }
            }),
        )
    }
}

/// Window event data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WindowEventData {
    pub app: String,
    pub title: String,
}

/// AFK event data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AfkEventData {
    pub status: String, // "afk" or "not-afk"
}

/// Web tab event data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WebTabEventData {
    pub url: String,
    pub title: String,
    #[serde(default)]
    pub audible: bool,
    #[serde(default)]
    pub incognito: bool,
}

/// Editor activity event data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EditorEventData {
    pub file: String,
    pub project: String,
    pub language: String,
}

/// Bucket export format (bucket with all events)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BucketExport {
    #[serde(flatten)]
    pub bucket: Bucket,
    pub events: Vec<Event>,
}

/// Query parameters for getting events
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct GetEventsParams {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub start: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub end: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub limit: Option<i64>,
}

/// Heartbeat request - used for efficient event submission
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Heartbeat {
    pub timestamp: DateTime<Utc>,
    pub duration: f64,
    pub data: JsonValue,
}

impl Heartbeat {
    /// Convert heartbeat to event
    pub fn to_event(self) -> Event {
        Event::new(self.timestamp, self.duration, self.data)
    }
}

/// Info response for the API
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerInfo {
    pub hostname: String,
    pub version: String,
    pub testing: bool,
    pub device_id: String,
}

/// Standard bucket types as constants
pub mod bucket_types {
    pub const CURRENT_WINDOW: &str = "currentwindow";
    pub const AFK_STATUS: &str = "afkstatus";
    pub const WEB_TAB: &str = "web.tab.current";
    pub const EDITOR_ACTIVITY: &str = "app.editor.activity";
}

/// Standard client names
pub mod clients {
    pub const LOOPD: &str = "loopd";
    pub const AW_WATCHER_WINDOW: &str = "aw-watcher-window";
    pub const AW_WATCHER_AFK: &str = "aw-watcher-afk";
    pub const AW_WATCHER_WEB: &str = "aw-watcher-web";
    pub const AWATCHER: &str = "awatcher";
}
