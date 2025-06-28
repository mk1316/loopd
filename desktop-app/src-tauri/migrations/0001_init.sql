-- Initial schema for app usage tracking
-- Supports future multi-user, multi-device sync with Supabase

-- Devices table: one row per installation
CREATE TABLE devices (
    id            TEXT PRIMARY KEY,      -- UUID generated on first run
    user_id       TEXT,                  -- Supabase uid (nullable until login)
    name          TEXT,                  -- e.g. "John's MacBook"
    os            TEXT,                  -- win32 / darwin / linux
    created_at    INTEGER NOT NULL,      -- unix epoch seconds (UTC)
    updated_at    INTEGER NOT NULL       -- unix epoch seconds (UTC)
);

-- Sessions table: one contiguous period in one app window
CREATE TABLE sessions (
    id              TEXT PRIMARY KEY,    -- UUID
    device_id       TEXT NOT NULL,
    user_id         TEXT,                -- redundant but handy for queries
    app_name        TEXT NOT NULL,
    window_title    TEXT,
    start_time      INTEGER NOT NULL,    -- unix epoch seconds (UTC)
    end_time        INTEGER,             -- NULL until session closes
    duration_sec    INTEGER,             -- cached for fast aggregates
    synced          INTEGER NOT NULL DEFAULT 0,  -- 0 = local only, 1 = pushed to cloud
    created_at      INTEGER NOT NULL,    -- unix epoch seconds (UTC)
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Indexes for performance
CREATE INDEX idx_sessions_device_id ON sessions(device_id);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_app_name ON sessions(app_name);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_sessions_synced ON sessions(synced);

-- View for daily usage summary
CREATE VIEW usage_summary AS
SELECT
    date(start_time, 'unixepoch') AS day,
    app_name,
    SUM(duration_sec) AS total_seconds
FROM sessions
WHERE duration_sec IS NOT NULL
GROUP BY day, app_name
ORDER BY day DESC, total_seconds DESC;

-- View for current session (for real-time tracking)
CREATE VIEW current_session AS
SELECT
    s.*,
    d.name as device_name,
    d.os as device_os
FROM sessions s
JOIN devices d ON s.device_id = d.id
WHERE s.end_time IS NULL
ORDER BY s.start_time DESC
LIMIT 1; 