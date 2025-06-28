// Imports
use anyhow::Result;
use chrono::{DateTime, Utc};
use log::info;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

/// Strips the file extension from an app name for cross-platform compatibility
fn strip_app_extension(app_name: &str) -> String {
    if let Some(last_dot) = app_name.rfind('.') {
        if last_dot > 0 {
            return app_name[..last_dot].to_string();
        }
    }
    app_name.to_string()
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppUsage {
    pub app_name: String,
    pub window_title: Option<String>,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration_seconds: Option<u64>,
}

#[derive(Debug)]
pub enum UpdateAction {
    None,
    EndSession,
    StartSession { app_name: String, window_title: Option<String> },
}

pub struct UsageTracker {
    current_app: Option<String>,
    current_window_title: Option<String>,
    app_start_time: Option<DateTime<Utc>>,
    device_id: String,
    last_check: Instant,
    check_interval: Duration,
}

impl UsageTracker {
    pub fn new(device_id: String) -> Self {
        Self {
            current_app: None,
            current_window_title: None,
            app_start_time: None,
            device_id,
            last_check: Instant::now(),
            check_interval: Duration::from_secs(1),
        }
    }

    pub fn update(&mut self) -> Result<UpdateAction> {
        println!("[TRACKER] UsageTracker::update called");
        if self.last_check.elapsed() < self.check_interval {
            println!("[TRACKER] Check interval not elapsed yet, returning None");
            return Ok(UpdateAction::None);
        }

        let (app_name, window_title) = get_active_app_info()?;
        println!("[TRACKER] Detected app: '{}', title: '{:?}', current: '{:?}'", app_name, window_title, self.current_app);

        if self.current_app.as_ref() != Some(&app_name) {
            println!("[TRACKER] App changed! Previous: '{:?}', New: '{}'", self.current_app, app_name);
            // App changed, record the previous app usage
            if let Some(prev_app) = &self.current_app {
                info!(
                    "App usage recorded: {} for {} seconds",
                    prev_app,
                    self.app_start_time
                        .map(|start| (Utc::now() - start).num_seconds())
                        .unwrap_or(0)
                );
            }

            // Start tracking new app
            self.current_app = Some(app_name.clone());
            self.current_window_title = window_title.clone();
            self.app_start_time = Some(Utc::now());

            info!("Now tracking app: {}", app_name);
            
            // Return action to start new session
            return Ok(UpdateAction::StartSession {
                app_name,
                window_title,
            });
        }

        println!("[TRACKER] No app change detected, returning None");
        self.last_check = Instant::now();
        Ok(UpdateAction::None)
    }

    pub fn get_current_app(&self) -> Option<String> {
        self.current_app.clone()
    }

    pub fn get_device_id(&self) -> &str {
        &self.device_id
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActiveApp {
    pub name: String,
    pub title: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum UpdateResult {
    NoChange,
    AppChanged { old_app: ActiveApp, new_app: ActiveApp },
    SessionStarted { app: ActiveApp },
    SessionEnded { app: ActiveApp },
}

pub struct AppTracker {
    current_app: Option<ActiveApp>,
}

impl AppTracker {
    pub fn new() -> Result<Self> {
        Ok(Self {
            current_app: None,
        })
    }

    pub async fn track_current_app(&self) -> Result<UpdateResult> {
        let new_app = get_active_app_with_title().await.map_err(anyhow::Error::msg)?;
        
        match &self.current_app {
            None => {
                // First time tracking
                info!("Started tracking app: {} - {}", new_app.name, new_app.title);
                Ok(UpdateResult::SessionStarted { app: new_app })
            }
            Some(current) => {
                if current.name != new_app.name || current.title != new_app.title {
                    let old_app = current.clone();
                    info!("App changed from {} - {} to {} - {}", 
                          old_app.name, old_app.title, new_app.name, new_app.title);
                    Ok(UpdateResult::AppChanged { old_app, new_app })
                } else {
                    Ok(UpdateResult::NoChange)
                }
            }
        }
    }
}

/// Returns (application name, optional window title) synchronously.
/// This is used by the synchronous [`UsageTracker`] logic.
fn get_active_app_info() -> Result<(String, Option<String>)> {
    println!("[TRACKER] get_active_app_info called");
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextA, GetWindowThreadProcessId};
        use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION};
        use windows::Win32::System::ProcessStatus::GetModuleFileNameExA;
        use windows::Win32::Foundation::CloseHandle;

        unsafe {
            let hwnd = GetForegroundWindow();
            let mut process_id = 0u32;
            GetWindowThreadProcessId(hwnd, Some(&mut process_id));

            if process_id == 0 {
                println!("[TRACKER] Failed to get process ID");
                return Err(anyhow::anyhow!("Failed to get process ID"));
            }

            println!("[TRACKER] Got process ID: {}", process_id);

            // OpenProcess returns Result<HANDLE, Error>
            let process_handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, process_id)?;

            let mut filename = [0u8; 260];
            let len = GetModuleFileNameExA(process_handle, None, &mut filename);
            // SAFETY: handle was obtained successfully
            let _ = CloseHandle(process_handle);

            if len == 0 {
                return Err(anyhow::anyhow!("Failed to get module filename"));
            }

            let path = String::from_utf8_lossy(&filename[..len as usize]);
            let app_name = strip_app_extension(&path.split('\\').last().unwrap_or("unknown").to_string());

            // Get window title
            let mut title_buf = [0u8; 512];
            let title_len = GetWindowTextA(hwnd, &mut title_buf);
            let window_title = if title_len > 0 {
                Some(String::from_utf8_lossy(&title_buf[..title_len as usize]).to_string())
            } else {
                None
            };

            println!("[TRACKER] Final result - app: '{}', title: '{:?}'", app_name, window_title);
            return Ok((app_name, window_title));
        }
    }

    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::NSWorkspace;
        use cocoa::base::id;

        unsafe {
            let workspace: id = msg_send![class!(NSWorkspace), sharedWorkspace];
            let app: id = msg_send![workspace, frontmostApplication];
            let bundle_id: id = msg_send![app, bundleIdentifier];

            if bundle_id.is_null() {
                return Err(anyhow::anyhow!("Failed to get bundle identifier"));
            }

            let bundle_str = cocoa::foundation::NSString::UTF8String(bundle_id);
            let app_name = strip_app_extension(bundle_str.split('.').last().unwrap_or("unknown").to_string());

            let name: id = msg_send![app, localizedName];
            let window_title = if !name.is_null() {
                Some(cocoa::foundation::NSString::UTF8String(name))
            } else {
                None
            };

            return Ok((app_name, window_title));
        }
    }

    #[cfg(target_os = "linux")]
    {
        use std::process::Command;

        // Active window id
        let output = Command::new("xprop")
            .args(["-root", "-notype", "_NET_ACTIVE_WINDOW"])
            .output()?;

        let window_id = String::from_utf8_lossy(&output.stdout)
            .trim()
            .split(' ')
            .last()
            .unwrap_or("0");

        // WM_CLASS gives application name
        let output_class = Command::new("xprop")
            .args(["-id", window_id, "WM_CLASS"])
            .output()?;
        let app_name = strip_app_extension(&String::from_utf8_lossy(&output_class.stdout)
            .trim()
            .split('"')
            .nth(1)
            .unwrap_or("unknown")
            .to_string());

        // WM_NAME gives window title
        let output_title = Command::new("xprop")
            .args(["-id", window_id, "WM_NAME"])
            .output()?;
        let window_title = String::from_utf8_lossy(&output_title.stdout)
            .trim()
            .split('"')
            .nth(1)
            .map(|s| s.to_string());

        return Ok((app_name, window_title));
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err(anyhow::anyhow!("Unsupported operating system"))
    }
}

/// Get the currently active application name
#[tauri::command]
pub async fn get_active_app() -> Result<String, String> {
    println!("[CMD] get_active_app called");
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowThreadProcessId};
        use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION};
        use windows::Win32::System::ProcessStatus::GetModuleFileNameExA;
        use windows::Win32::Foundation::CloseHandle;

        unsafe {
            let hwnd = GetForegroundWindow();
            let mut process_id = 0u32;
            GetWindowThreadProcessId(hwnd, Some(&mut process_id));

            if process_id == 0 {
                return Err("Failed to get process ID".to_string());
            }

            let process_handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, process_id);
            let process_handle = match process_handle {
                Ok(h) => h,
                Err(_) => return Err("Failed to open process".to_string()),
            };

            let mut filename = [0u8; 260];
            let len = GetModuleFileNameExA(process_handle, None, &mut filename);
            let _ = CloseHandle(process_handle);

            if len == 0 {
                return Err("Failed to get module filename".to_string());
            }

            let path = String::from_utf8_lossy(&filename[..len as usize]);
            let app_name = strip_app_extension(&path.split('\\').last().unwrap_or("unknown").to_string());
            Ok(app_name)
        }
    }

    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::NSWorkspace;
        use cocoa::base::id;
        use objc::runtime::Object;

        unsafe {
            let workspace: id = msg_send![class!(NSWorkspace), sharedWorkspace];
            let app: id = msg_send![workspace, frontmostApplication];
            let bundle_id: id = msg_send![app, bundleIdentifier];
            
            if bundle_id.is_null() {
                return Err("Failed to get bundle identifier".to_string());
            }

            let bundle_str = cocoa::foundation::NSString::UTF8String(bundle_id);
            let app_name = strip_app_extension(bundle_str.split('.').last().unwrap_or("unknown").to_string());
            Ok(app_name)
        }
    }

    #[cfg(target_os = "linux")]
    {
        use std::process::Command;

        let output = Command::new("xprop")
            .args(["-root", "-notype", "_NET_ACTIVE_WINDOW"])
            .output()
            .map_err(|e| format!("Failed to execute xprop: {}", e))?;

        let window_id = String::from_utf8_lossy(&output.stdout)
            .trim()
            .split(' ')
            .last()
            .unwrap_or("0");

        let output = Command::new("xprop")
            .args(["-id", window_id, "WM_CLASS"])
            .output()
            .map_err(|e| format!("Failed to get window class: {}", e))?;

        let class = strip_app_extension(&String::from_utf8_lossy(&output.stdout)
            .trim()
            .split('"')
            .nth(1)
            .unwrap_or("unknown")
            .to_string());

        Ok(class)
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err("Unsupported operating system".to_string())
    }
}

/// Get the currently active application name and window title
#[tauri::command]
pub async fn get_active_app_with_title() -> Result<ActiveApp, String> {
    let app_name = get_active_app().await?;
    
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextA};

        unsafe {
            let hwnd = GetForegroundWindow();
            let mut title = [0u8; 512];
            let len = GetWindowTextA(hwnd, &mut title);
            
            let window_title = if len > 0 {
                String::from_utf8_lossy(&title[..len as usize]).to_string()
            } else {
                "Unknown".to_string()
            };

            Ok(ActiveApp {
                name: app_name,
                title: window_title,
            })
        }
    }

    #[cfg(target_os = "macos")]
    {
        use cocoa::appkit::NSWorkspace;
        use cocoa::base::id;
        use objc::runtime::Object;

        unsafe {
            let workspace: id = msg_send![class!(NSWorkspace), sharedWorkspace];
            let app: id = msg_send![workspace, frontmostApplication];
            let name: id = msg_send![app, localizedName];
            
            let window_title = if !name.is_null() {
                cocoa::foundation::NSString::UTF8String(name)
            } else {
                "Unknown".to_string()
            };

            Ok(ActiveApp {
                name: app_name,
                title: window_title,
            })
        }
    }

    #[cfg(target_os = "linux")]
    {
        use std::process::Command;

        let output = Command::new("xprop")
            .args(["-root", "-notype", "_NET_ACTIVE_WINDOW"])
            .output()
            .map_err(|e| format!("Failed to execute xprop: {}", e))?;

        let window_id = String::from_utf8_lossy(&output.stdout)
            .trim()
            .split(' ')
            .last()
            .unwrap_or("0");

        let output = Command::new("xprop")
            .args(["-id", window_id, "WM_NAME"])
            .output()
            .map_err(|e| format!("Failed to get window name: {}", e))?;

        let window_title = String::from_utf8_lossy(&output.stdout)
            .trim()
            .split('"')
            .nth(1)
            .unwrap_or("Unknown")
            .to_string();

        Ok(ActiveApp {
            name: app_name,
            title: window_title,
        })
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err("Unsupported operating system".to_string())
    }
}

pub static USAGE_TRACKER: Lazy<Arc<Mutex<Option<UsageTracker>>>> =
    Lazy::new(|| Arc::new(Mutex::new(None)));
