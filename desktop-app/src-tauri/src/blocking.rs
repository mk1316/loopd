use anyhow::Result;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::Db;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockRule {
    pub id: String,
    pub device_id: String,
    pub user_id: Option<String>,
    pub app_name: String,
    pub block_type: BlockType,
    pub time_window_start: Option<String>, // HH:MM format
    pub time_window_end: Option<String>,   // HH:MM format
    pub daily_limit_minutes: Option<i32>,
    pub strictness: Strictness,
    pub enabled: bool,
    pub synced: bool,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum BlockType {
    Time,
    Usage,
}

impl std::fmt::Display for BlockType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            BlockType::Time => write!(f, "time"),
            BlockType::Usage => write!(f, "usage"),
        }
    }
}

impl std::str::FromStr for BlockType {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "time" => Ok(BlockType::Time),
            "usage" => Ok(BlockType::Usage),
            _ => Err(format!("Unknown block type: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Strictness {
    Hard,
    Soft,
}

impl std::fmt::Display for Strictness {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Strictness::Hard => write!(f, "hard"),
            Strictness::Soft => write!(f, "soft"),
        }
    }
}

impl std::str::FromStr for Strictness {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "hard" => Ok(Strictness::Hard),
            "soft" => Ok(Strictness::Soft),
            _ => Err(format!("Unknown strictness: {}", s)),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockOverride {
    pub id: String,
    pub device_id: String,
    pub user_id: Option<String>,
    pub rule_id: String,
    pub app_name: String,
    pub override_time: DateTime<Utc>,
    pub override_reason: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockStatus {
    pub is_blocked: bool,
    pub rule: Option<BlockRule>,
    pub reason: String,
    pub can_override: bool,
}



// Tauri commands
#[tauri::command]
pub async fn create_block_rule_command(
    db: State<'_, Db>,
    device_id: String,
    app_name: String,
    block_type: String,
    time_window_start: Option<String>,
    time_window_end: Option<String>,
    daily_limit_minutes: Option<i32>,
    strictness: String,
) -> Result<String, String> {
    let block_type = block_type.parse().map_err(|e| format!("Invalid block type: {}", e))?;
    let strictness = strictness.parse().map_err(|e| format!("Invalid strictness: {}", e))?;

    db.create_block_rule(
        &device_id,
        app_name,
        block_type,
        time_window_start,
        time_window_end,
        daily_limit_minutes,
        strictness,
    )
    .await
    .map_err(|e| format!("Failed to create block rule: {}", e))
}

#[tauri::command]
pub async fn get_block_rules_command(
    db: State<'_, Db>,
    device_id: String,
) -> Result<Vec<BlockRule>, String> {
    db.get_block_rules(&device_id)
        .await
        .map_err(|e| format!("Failed to get block rules: {}", e))
}

#[tauri::command]
pub async fn update_block_rule_command(
    db: State<'_, Db>,
    rule_id: String,
    app_name: Option<String>,
    time_window_start: Option<String>,
    time_window_end: Option<String>,
    daily_limit_minutes: Option<i32>,
    strictness: Option<String>,
    enabled: Option<bool>,
) -> Result<(), String> {
    let strictness = strictness.map(|s| s.parse()).transpose()
        .map_err(|e| format!("Invalid strictness: {}", e))?;

    db.update_block_rule(
        &rule_id,
        app_name,
        time_window_start,
        time_window_end,
        daily_limit_minutes,
        strictness,
        enabled,
    )
    .await
    .map_err(|e| format!("Failed to update block rule: {}", e))
}

#[tauri::command]
pub async fn delete_block_rule_command(
    db: State<'_, Db>,
    rule_id: String,
) -> Result<(), String> {
    db.delete_block_rule(&rule_id)
        .await
        .map_err(|e| format!("Failed to delete block rule: {}", e))
}

#[tauri::command]
pub async fn evaluate_block_status_command(
    db: State<'_, Db>,
    device_id: String,
    app_name: String,
) -> Result<BlockStatus, String> {
    db.evaluate_block_status(&device_id, &app_name)
        .await
        .map_err(|e| format!("Failed to evaluate block status: {}", e))
}

#[tauri::command]
pub async fn record_block_override_command(
    db: State<'_, Db>,
    device_id: String,
    rule_id: String,
    app_name: String,
    override_reason: Option<String>,
) -> Result<String, String> {
    db.record_block_override(&device_id, &rule_id, &app_name, override_reason)
        .await
        .map_err(|e| format!("Failed to record block override: {}", e))
}

#[tauri::command]
pub async fn get_block_overrides_command(
    db: State<'_, Db>,
    device_id: String,
    limit: Option<i64>,
) -> Result<Vec<BlockOverride>, String> {
    db.get_block_overrides(&device_id, limit)
        .await
        .map_err(|e| format!("Failed to get block overrides: {}", e))
} 