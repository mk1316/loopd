-- Block rules table for app blocking feature
CREATE TABLE block_rules (
    id              TEXT PRIMARY KEY,    -- UUID
    device_id       TEXT NOT NULL,
    user_id         TEXT,                -- redundant but handy for queries
    app_name        TEXT NOT NULL,       -- app to block
    block_type      TEXT NOT NULL,       -- 'time' or 'usage'
    time_window_start TEXT,              -- HH:MM format for time-based rules
    time_window_end TEXT,                -- HH:MM format for time-based rules
    daily_limit_minutes INTEGER,         -- minutes for usage-based rules
    strictness      TEXT NOT NULL,       -- 'hard' or 'soft'
    enabled         INTEGER NOT NULL DEFAULT 1,  -- 0 = disabled, 1 = enabled
    synced          INTEGER NOT NULL DEFAULT 0,  -- 0 = local only, 1 = pushed to cloud
    created_at      INTEGER NOT NULL,    -- unix epoch seconds (UTC)
    updated_at      INTEGER NOT NULL,    -- unix epoch seconds (UTC)
    FOREIGN KEY (device_id) REFERENCES devices(id)
);

-- Indexes for performance
CREATE INDEX idx_block_rules_device_id ON block_rules(device_id);
CREATE INDEX idx_block_rules_user_id ON block_rules(user_id);
CREATE INDEX idx_block_rules_app_name ON block_rules(app_name);
CREATE INDEX idx_block_rules_enabled ON block_rules(enabled);
CREATE INDEX idx_block_rules_synced ON block_rules(synced);

-- Block overrides table for tracking override attempts
CREATE TABLE block_overrides (
    id              TEXT PRIMARY KEY,    -- UUID
    device_id       TEXT NOT NULL,
    user_id         TEXT,
    rule_id         TEXT NOT NULL,       -- reference to block_rules.id
    app_name        TEXT NOT NULL,       -- app that was blocked
    override_time   INTEGER NOT NULL,    -- unix epoch seconds (UTC)
    override_reason TEXT,                -- user-provided reason for override
    created_at      INTEGER NOT NULL,    -- unix epoch seconds (UTC)
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (rule_id) REFERENCES block_rules(id)
);

-- Indexes for block overrides
CREATE INDEX idx_block_overrides_device_id ON block_overrides(device_id);
CREATE INDEX idx_block_overrides_rule_id ON block_overrides(rule_id);
CREATE INDEX idx_block_overrides_override_time ON block_overrides(override_time); 