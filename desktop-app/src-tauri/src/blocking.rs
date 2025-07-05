use anyhow::Result;
use chrono::{DateTime, Utc, Local, NaiveTime};
use serde::{Deserialize, Serialize};
use tauri::State;
use crate::Db;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use log::{info, error};
use once_cell::sync::Lazy;

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

// Blocking system state
pub struct BlockingSystem {
    pub rules: Vec<BlockRule>,
    pub active_overrides: HashMap<String, DateTime<Utc>>,
    _last_evaluation: Instant,
    _evaluation_interval: Duration,
    pub device_id: String,
}

impl BlockingSystem {
    pub fn new(device_id: String) -> Self {
        Self {
            rules: Vec::new(),
            active_overrides: HashMap::new(),
            _last_evaluation: Instant::now(),
            _evaluation_interval: Duration::from_millis(500), // High-speed evaluation
            device_id,
        }
    }

    pub fn update_rules(&mut self, rules: Vec<BlockRule>) {
        self.rules = rules.into_iter()
            .filter(|rule| rule.enabled)
            .collect();
        info!("Updated blocking rules: {} active rules", self.rules.len());
    }

    pub async fn evaluate_app(&mut self, app_name: &str, db: &Db) -> Result<Option<BlockStatus>> {
        // Remove rate limiting for continuous evaluation
        // if self.last_evaluation.elapsed() < self.evaluation_interval {
        //     return Ok(None);
        // }

        // self.last_evaluation = Instant::now();

        // Check for active overrides first
        if let Some(override_time) = self.active_overrides.get(app_name) {
            let override_duration = Duration::from_secs(300); // 5 minutes
            if Utc::now() - *override_time < chrono::Duration::seconds(override_duration.as_secs() as i64) {
                return Ok(None); // App is temporarily allowed
            } else {
                // Override expired, remove it
                self.active_overrides.remove(app_name);
            }
        }

        // Check each rule
        info!("[BLOCKING] Evaluating {} rules for app: {}", self.rules.len(), app_name);
        for rule in &self.rules {
            info!("[BLOCKING] Checking rule: {} (app: {}, type: {})", rule.id, rule.app_name, rule.block_type);
            if rule.app_name.to_lowercase() == app_name.to_lowercase() {
                info!("[BLOCKING] Rule matches app name, evaluating...");
                let should_block = match rule.block_type {
                    BlockType::Time => {
                        let result = self.evaluate_time_rule(rule)?;
                        info!("[BLOCKING] Time rule evaluation result: {}", result);
                        result
                    },
                    BlockType::Usage => {
                        let result = self.evaluate_usage_rule(rule, db).await?;
                        info!("[BLOCKING] Usage rule evaluation result: {}", result);
                        result
                    },
                };

                if should_block {
                    info!("[BLOCKING] App should be blocked!");
                    let can_override = matches!(rule.strictness, Strictness::Soft);
                    let reason = self.generate_block_reason(rule)?;
                    
                    return Ok(Some(BlockStatus {
                        is_blocked: true,
                        rule: Some(rule.clone()),
                        reason,
                        can_override,
                    }));
                } else {
                    info!("[BLOCKING] App should not be blocked");
                }
            } else {
                info!("[BLOCKING] Rule app name '{}' doesn't match current app '{}'", rule.app_name, app_name);
            }
        }

        Ok(None)
    }

    fn evaluate_time_rule(&self, rule: &BlockRule) -> Result<bool> {
        if let (Some(start_str), Some(end_str)) = (&rule.time_window_start, &rule.time_window_end) {
            let now = Local::now().time();
            
            let start_time = NaiveTime::parse_from_str(start_str, "%H:%M")
                .map_err(|e| anyhow::anyhow!("Invalid start time format: {}", e))?;
            let end_time = NaiveTime::parse_from_str(end_str, "%H:%M")
                .map_err(|e| anyhow::anyhow!("Invalid end time format: {}", e))?;

            info!("[BLOCKING] Time evaluation - Now: {}, Start: {}, End: {}", now, start_time, end_time);

            // Handle time ranges that cross midnight
            let is_blocked = if start_time <= end_time {
                now >= start_time && now <= end_time
            } else {
                now >= start_time || now <= end_time
            };

            info!("[BLOCKING] Time evaluation result: {}", is_blocked);
            Ok(is_blocked)
        } else {
            info!("[BLOCKING] Time rule missing start or end time");
            Ok(false)
        }
    }

    async fn evaluate_usage_rule(&self, rule: &BlockRule, db: &Db) -> Result<bool> {
        if let Some(daily_limit) = rule.daily_limit_minutes {
            let usage_minutes = db.get_daily_usage_minutes(&self.device_id, &rule.app_name).await?;
            Ok(usage_minutes >= daily_limit as i64)
        } else {
            Ok(false)
        }
    }

    fn generate_block_reason(&self, rule: &BlockRule) -> Result<String> {
        match rule.block_type {
            BlockType::Time => {
                if let (Some(start), Some(end)) = (&rule.time_window_start, &rule.time_window_end) {
                    Ok(format!("Time-based block: {} - {}", start, end))
                } else {
                    Ok("Time-based block".to_string())
                }
            }
            BlockType::Usage => {
                if let Some(limit) = rule.daily_limit_minutes {
                    Ok(format!("Daily usage limit reached: {} minutes", limit))
                } else {
                    Ok("Usage-based block".to_string())
                }
            }
        }
    }

    pub fn add_override(&mut self, app_name: String) {
        self.active_overrides.insert(app_name, Utc::now());
    }

    pub fn remove_override(&mut self, app_name: &str) {
        self.active_overrides.remove(app_name);
    }
}

// Global blocking system instance
pub static BLOCKING_SYSTEM: Lazy<Arc<Mutex<BlockingSystem>>> = Lazy::new(|| {
    Arc::new(Mutex::new(BlockingSystem::new("default".to_string())))
});

// Process termination functions
#[cfg(target_os = "windows")]
pub fn terminate_process(app_name: &str) -> Result<()> {
    use windows::Win32::System::ProcessStatus::EnumProcesses;
    use windows::Win32::System::Threading::{OpenProcess, TerminateProcess, PROCESS_TERMINATE};
    use windows::Win32::Foundation::CloseHandle;

    unsafe {
        let mut processes = [0u32; 1024];
        let mut bytes_returned = 0u32;
        
        if EnumProcesses(processes.as_mut_ptr(), std::mem::size_of_val(&processes) as u32, &mut bytes_returned).is_ok() {
            let process_count = bytes_returned / std::mem::size_of::<u32>() as u32;
            
            for i in 0..process_count {
                let process_id = processes[i as usize];
                if process_id == 0 { continue; }
                
                // Get process name
                if let Ok(process_name) = get_process_name(process_id) {
                    if process_name.to_lowercase().contains(&app_name.to_lowercase()) {
                        if let Ok(handle) = OpenProcess(PROCESS_TERMINATE, false, process_id) {
                            let _ = TerminateProcess(handle, 0);
                            let _ = CloseHandle(handle);
                            info!("Terminated process: {} (PID: {})", process_name, process_id);
                        }
                    }
                }
            }
        }
    }
    
    Ok(())
}

#[cfg(target_os = "macos")]
pub fn terminate_process(app_name: &str) -> Result<()> {
    use std::process::Command;
    
    let output = Command::new("pgrep")
        .arg("-f")
        .arg(app_name)
        .output()?;
    
    if output.status.success() {
        let pids: Vec<&str> = std::str::from_utf8(&output.stdout)?
            .lines()
            .filter(|line| !line.is_empty())
            .collect();
        
        for pid in pids {
            let _ = Command::new("kill")
                .arg("-9")
                .arg(pid)
                .output();
            info!("Terminated process: {} (PID: {})", app_name, pid);
        }
    }
    
    Ok(())
}

#[cfg(target_os = "linux")]
pub fn terminate_process(app_name: &str) -> Result<()> {
    use std::process::Command;
    
    let output = Command::new("pgrep")
        .arg("-f")
        .arg(app_name)
        .output()?;
    
    if output.status.success() {
        let pids: Vec<&str> = std::str::from_utf8(&output.stdout)?
            .lines()
            .filter(|line| !line.is_empty())
            .collect();
        
        for pid in pids {
            let _ = Command::new("kill")
                .arg("-9")
                .arg(pid)
                .output();
            info!("Terminated process: {} (PID: {})", app_name, pid);
        }
    }
    
    Ok(())
}

#[cfg(target_os = "windows")]
fn get_process_name(process_id: u32) -> Result<String> {
    use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION};
    use windows::Win32::System::ProcessStatus::GetModuleFileNameExA;
    use windows::Win32::Foundation::CloseHandle;
    
    unsafe {
        if let Ok(handle) = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, process_id) {
            let mut filename = [0u8; 260];
            let len = GetModuleFileNameExA(handle, None, &mut filename);
            let _ = CloseHandle(handle);
            
            if len > 0 {
                let path = String::from_utf8_lossy(&filename[..len as usize]);
                let name = path.split('\\').last().unwrap_or("unknown").to_string();
                return Ok(name);
            }
        }
    }
    
    Ok("unknown".to_string())
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
    info!("[BLOCKING] Deleting block rule with ID: {}", rule_id);
    
    match db.delete_block_rule(&rule_id).await {
        Ok(_) => {
            info!("[BLOCKING] Successfully deleted block rule: {}", rule_id);
            Ok(())
        }
        Err(e) => {
            error!("[BLOCKING] Failed to delete block rule {}: {}", rule_id, e);
            Err(format!("Failed to delete block rule: {}", e))
        }
    }
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

// New commands for enhanced blocking
#[tauri::command]
pub async fn terminate_blocked_app_command(app_name: String) -> Result<(), String> {
    terminate_process(&app_name)
        .map_err(|e| format!("Failed to terminate process: {}", e))
}

#[tauri::command]
pub async fn add_block_override_command(app_name: String) -> Result<(), String> {
    let mut system = BLOCKING_SYSTEM.lock().map_err(|e| format!("Failed to lock blocking system: {}", e))?;
    system.add_override(app_name);
    Ok(())
}

#[tauri::command]
pub async fn remove_block_override_command(app_name: String) -> Result<(), String> {
    let mut system = BLOCKING_SYSTEM.lock().map_err(|e| format!("Failed to lock blocking system: {}", e))?;
    system.remove_override(&app_name);
    Ok(())
}

#[tauri::command]
pub async fn refresh_blocking_rules_command(
    db: State<'_, Db>,
    device_id: String,
) -> Result<(), String> {
    let rules = db.get_block_rules(&device_id)
        .await
        .map_err(|e| format!("Failed to get block rules: {}", e))?;
    
    let mut system = BLOCKING_SYSTEM.lock().map_err(|e| format!("Failed to lock blocking system: {}", e))?;
    system.update_rules(rules);
    Ok(())
} 