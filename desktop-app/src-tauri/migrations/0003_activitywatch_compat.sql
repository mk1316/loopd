-- ActivityWatch-compatible data model
-- Buckets are containers for events from a specific watcher on a specific host
-- Events store the actual activity data with flexible JSON data field

-- Buckets table: one bucket per watcher per host
CREATE TABLE IF NOT EXISTS buckets (
    id          TEXT PRIMARY KEY,         -- e.g., "aw-watcher-window_hostname"
    name        TEXT,                     -- human-readable name (optional)
    type        TEXT NOT NULL,            -- event type: "currentwindow", "afkstatus", "web.tab.current", etc.
    client      TEXT NOT NULL,            -- client/watcher name: "aw-watcher-window", "loopd", etc.
    hostname    TEXT NOT NULL,            -- device hostname
    created     TEXT NOT NULL,            -- ISO8601 timestamp
    data        TEXT,                     -- optional JSON metadata
    last_updated TEXT                     -- ISO8601 timestamp of last event
);

-- Indexes for buckets
CREATE INDEX IF NOT EXISTS idx_buckets_hostname ON buckets(hostname);
CREATE INDEX IF NOT EXISTS idx_buckets_type ON buckets(type);
CREATE INDEX IF NOT EXISTS idx_buckets_client ON buckets(client);

-- Events table: ActivityWatch-compatible events
CREATE TABLE IF NOT EXISTS events (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,  -- auto-incrementing ID
    bucket_id   TEXT NOT NULL,                      -- reference to buckets.id
    timestamp   TEXT NOT NULL,                      -- ISO8601 timestamp (UTC)
    duration    REAL NOT NULL DEFAULT 0,            -- duration in seconds (float)
    data        TEXT NOT NULL,                      -- JSON object with event data
    FOREIGN KEY (bucket_id) REFERENCES buckets(id) ON DELETE CASCADE
);

-- Indexes for events - critical for query performance
CREATE INDEX IF NOT EXISTS idx_events_bucket_id ON events(bucket_id);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_bucket_timestamp ON events(bucket_id, timestamp);

-- Key-value store for settings and metadata
CREATE TABLE IF NOT EXISTS key_value (
    key         TEXT PRIMARY KEY,
    value       TEXT,
    updated_at  TEXT NOT NULL              -- ISO8601 timestamp
);

-- Migrate existing sessions to events format
-- First, create a default bucket for existing data
-- Note: Using strftime to produce RFC3339/ISO8601 format with 'T' separator and 'Z' suffix
INSERT OR IGNORE INTO buckets (id, name, type, client, hostname, created, data, last_updated)
SELECT
    'aw-watcher-window_' || COALESCE(
        (SELECT name FROM devices LIMIT 1),
        'localhost'
    ),
    'Window Activity',
    'currentwindow',
    'loopd',
    COALESCE(
        (SELECT name FROM devices LIMIT 1),
        'localhost'
    ),
    strftime('%Y-%m-%dT%H:%M:%SZ', 'now'),
    '{}',
    strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE EXISTS (SELECT 1 FROM sessions LIMIT 1);

-- Migrate sessions to events
-- Using strftime for RFC3339 format to ensure proper timestamp comparison with new events
INSERT OR IGNORE INTO events (bucket_id, timestamp, duration, data)
SELECT
    'aw-watcher-window_' || COALESCE(
        (SELECT name FROM devices LIMIT 1),
        'localhost'
    ),
    strftime('%Y-%m-%dT%H:%M:%SZ', start_time, 'unixepoch'),
    COALESCE(duration_sec, 0),
    json_object('app', app_name, 'title', COALESCE(window_title, ''))
FROM sessions
WHERE duration_sec IS NOT NULL;

-- Create view for easy querying of window events
CREATE VIEW IF NOT EXISTS window_events AS
SELECT
    e.id,
    e.bucket_id,
    e.timestamp,
    e.duration,
    json_extract(e.data, '$.app') as app,
    json_extract(e.data, '$.title') as title,
    e.data
FROM events e
JOIN buckets b ON e.bucket_id = b.id
WHERE b.type = 'currentwindow';

-- Create view for daily usage summary (ActivityWatch compatible)
CREATE VIEW IF NOT EXISTS aw_usage_summary AS
SELECT
    date(timestamp) AS day,
    json_extract(data, '$.app') AS app_name,
    SUM(duration) AS total_seconds
FROM events e
JOIN buckets b ON e.bucket_id = b.id
WHERE b.type = 'currentwindow'
GROUP BY day, app_name
ORDER BY day DESC, total_seconds DESC;
