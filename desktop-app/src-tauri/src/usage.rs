use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use anyhow::{Result, Context};
use log::info;
use once_cell::sync::Lazy;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppUsage {
    pub app_name: String,
    pub window_title: Option<String>,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub duration_seconds: Option<u64>,
}

pub struct UsageTracker {
    current_app: Option<String>,
    current_window_title: Option<String>,
    app_start_time: Option<DateTime<Utc>>,
    session_data: Arc<Mutex<HashMap<String, AppUsage>>>,
    last_check: Instant,
    check_interval: Duration,
}

impl UsageTracker {
    pub fn new() -> Self {
        Self {
            current_app: None,
            current_window_title: None,
            app_start_time: None,
            session_data: Arc::new(Mutex::new(HashMap::new())),
            last_check: Instant::now(),
            check_interval: Duration::from_secs(1),
        }
    }

    pub fn update(&mut self) -> Result<()> {
        if self.last_check.elapsed() < self.check_interval {
            return Ok(());
        }

        let (app_name, window_title) = get_active_app_info()?;
        
        if self.current_app.as_ref() != Some(&app_name) {
            // App changed, record the previous app usage
            if let Some(prev_app) = &self.current_app {
                if let Some(start_time) = self.app_start_time {
                    let duration = Utc::now().signed_duration_since(start_time);
                    let app_usage = AppUsage {
                        app_name: prev_app.clone(),
                        window_title: self.current_window_title.clone(),
                        start_time,
                        end_time: Some(Utc::now()),
                        duration_seconds: Some(duration.num_seconds() as u64),
                    };
                    
                    let mut session_data = self.session_data.lock().unwrap();
                    session_data.insert(prev_app.clone(), app_usage);
                    
                    info!("App usage recorded: {} for {} seconds", prev_app, duration.num_seconds());
                }
            }
            
            // Start tracking new app
            self.current_app = Some(app_name.clone());
            self.current_window_title = window_title.clone();
            self.app_start_time = Some(Utc::now());
            
            info!("Now tracking app: {}", app_name);
        }
        
        self.last_check = Instant::now();
        Ok(())
    }

    pub fn get_current_app(&self) -> Option<String> {
        self.current_app.clone()
    }
}

#[tauri::command]
pub fn get_active_app() -> Result<String, String> {
    let (app_name, _) = get_active_app_info()
        .map_err(|e| format!("Failed to get active app: {}", e))?;
    Ok(app_name)
}

#[tauri::command]
pub fn get_active_app_with_title() -> Result<(String, Option<String>), String> {
    get_active_app_info()
        .map_err(|e| format!("Failed to get active app info: {}", e))
}

fn get_active_app_info() -> Result<(String, Option<String>)> {
    #[cfg(target_os = "windows")]
    {
        get_active_app_windows()
    }
    
    #[cfg(target_os = "macos")]
    {
        get_active_app_macos()
    }
    
    #[cfg(target_os = "linux")]
    {
        get_active_app_linux()
    }
    
    #[cfg(not(any(target_os = "windows", target_os = "macos", target_os = "linux")))]
    {
        Err(anyhow::anyhow!("Unsupported operating system"))
    }
}

#[cfg(target_os = "windows")]
fn get_active_app_windows() -> Result<(String, Option<String>)> {
    use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextW, GetWindowThreadProcessId};
    use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_LIMITED_INFORMATION};
    use windows::Win32::System::ProcessStatus::GetModuleFileNameExW;
    use windows::Win32::Foundation::{CloseHandle, HMODULE};

    unsafe {
        let foreground_window = GetForegroundWindow();
        if foreground_window.0 == 0 {
            return Err(anyhow::anyhow!("Failed to get foreground window"));
        }

        // Get window title
        let mut title_buffer = [0u16; 512];
        let title_length = GetWindowTextW(foreground_window, &mut title_buffer);
        let window_title = if title_length > 0 {
            let title = String::from_utf16_lossy(&title_buffer[..title_length as usize]);
            Some(title)
        } else {
            None
        };

        // Get process ID
        let mut process_id = 0u32;
        GetWindowThreadProcessId(foreground_window, Some(&mut process_id));
        
        if process_id == 0 {
            return Err(anyhow::anyhow!("Failed to get process ID"));
        }

        // Get process handle
        let process_handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, process_id)
            .context("Failed to open process")?;

        // Get executable path
        let mut path_buffer = [0u16; 512];
        let path_length = GetModuleFileNameExW(process_handle, HMODULE(0), &mut path_buffer);
        
        CloseHandle(process_handle);

        if path_length == 0 {
            return Err(anyhow::anyhow!("Failed to get module filename"));
        }

        let executable_path = String::from_utf16_lossy(&path_buffer[..path_length as usize]);
        let app_name = std::path::Path::new(&executable_path)
            .file_name()
            .and_then(|name| name.to_str())
            .unwrap_or("unknown")
            .to_string();

        Ok((app_name, window_title))
    }
}

#[cfg(target_os = "macos")]
fn get_active_app_macos() -> Result<(String, Option<String>)> {
    use cocoa::appkit::NSWorkspace;
    use cocoa::base::{id, nil};
    use cocoa::foundation::NSString;
    use objc::runtime::{Object, Class};
    use objc::{msg_send, sel, sel_impl};

    unsafe {
        let workspace: id = msg_send![class!(NSWorkspace), sharedWorkspace];
        let active_app: id = msg_send![workspace, frontmostApplication];
        
        if active_app == nil {
            return Err(anyhow::anyhow!("No active application found"));
        }

        let app_name: id = msg_send![active_app, localizedName];
        let app_name_str = NSString::UTF8String(app_name);
        let app_name = app_name_str.to_string();

        // Get window title (this is more complex on macOS)
        let window_title = get_active_window_title_macos();

        Ok((app_name, window_title))
    }
}

#[cfg(target_os = "macos")]
fn get_active_window_title_macos() -> Option<String> {
    use cocoa::appkit::{NSApplication, NSWindow, NSWindowList};
    use cocoa::base::{id, nil};
    use cocoa::foundation::NSString;
    use objc::runtime::{Object, Class};
    use objc::{msg_send, sel, sel_impl};

    unsafe {
        let app: id = msg_send![class!(NSApplication), sharedApplication];
        let windows: id = msg_send![app, windows];
        
        if windows == nil {
            return None;
        }

        let count: usize = msg_send![windows, count];
        for i in 0..count {
            let window: id = msg_send![windows, objectAtIndex: i];
            let is_key: bool = msg_send![window, isKeyWindow];
            
            if is_key {
                let title: id = msg_send![window, title];
                if title != nil {
                    let title_str = NSString::UTF8String(title);
                    return Some(title_str.to_string());
                }
            }
        }
        
        None
    }
}

#[cfg(target_os = "linux")]
fn get_active_app_linux() -> Result<(String, Option<String>)> {
    use x11rb::connection::Connection;
    use x11rb::protocol::xproto::{Atom, Window, get_property, get_input_focus};
    use x11rb::protocol::xproto::{get_window_attributes, get_property_reply};
    use x11rb::rust_connection::RustConnection;
    use std::collections::HashMap;

    let (conn, screen_num) = RustConnection::connect(None)
        .context("Failed to connect to X11 server")?;
    let screen = &conn.setup().roots[screen_num];

    // Get active window
    let focus_reply = get_input_focus(&conn)
        .context("Failed to get input focus")?
        .reply()
        .context("Failed to get input focus reply")?;
    
    let active_window = focus_reply.focus;
    if active_window == Window::none() {
        return Err(anyhow::anyhow!("No active window found"));
    }

    // Get window title
    let window_title = get_window_title_linux(&conn, active_window)?;

    // Get process name (this requires reading from /proc)
    let process_name = get_process_name_from_window_linux(&conn, active_window)?;

    Ok((process_name, window_title))
}

#[cfg(target_os = "linux")]
fn get_window_title_linux(conn: &RustConnection, window: Window) -> Result<Option<String>> {
    use x11rb::protocol::xproto::{get_property, get_property_reply};
    use x11rb::protocol::xproto::AtomEnum;

    let title_reply = get_property(
        conn,
        false,
        window,
        AtomEnum::WM_NAME,
        AtomEnum::STRING,
        0,
        1024,
    )
    .context("Failed to get window title property")?
    .reply()
    .context("Failed to get window title reply")?;

    if title_reply.value.is_empty() {
        return Ok(None);
    }

    let title = String::from_utf8_lossy(&title_reply.value).to_string();
    Ok(Some(title))
}

#[cfg(target_os = "linux")]
fn get_process_name_from_window_linux(conn: &RustConnection, window: Window) -> Result<String> {
    use x11rb::protocol::xproto::{get_property, get_property_reply};
    use x11rb::protocol::xproto::AtomEnum;
    use std::fs;
    use std::path::Path;

    // Try to get PID from window properties
    let pid_reply = get_property(
        conn,
        false,
        window,
        AtomEnum::_NET_WM_PID,
        AtomEnum::CARDINAL,
        0,
        1,
    )
    .context("Failed to get window PID property")?
    .reply();

    if let Ok(reply) = pid_reply {
        if !reply.value.is_empty() {
            let pid_bytes = &reply.value[0..4];
            let pid = u32::from_ne_bytes([pid_bytes[0], pid_bytes[1], pid_bytes[2], pid_bytes[3]]);
            
            // Read process name from /proc
            let proc_path = format!("/proc/{}/comm", pid);
            if let Ok(comm) = fs::read_to_string(&proc_path) {
                return Ok(comm.trim().to_string());
            }
        }
    }

    // Fallback: try to get from executable path
    let executable_reply = get_property(
        conn,
        false,
        window,
        AtomEnum::_NET_WM_PID,
        AtomEnum::STRING,
        0,
        1024,
    )
    .context("Failed to get window executable property")?
    .reply();

    if let Ok(reply) = executable_reply {
        if !reply.value.is_empty() {
            let executable = String::from_utf8_lossy(&reply.value);
            if let Some(file_name) = Path::new(&executable).file_name() {
                if let Some(name) = file_name.to_str() {
                    return Ok(name.to_string());
                }
            }
        }
    }

    Ok("unknown".to_string())
}

pub static USAGE_TRACKER: Lazy<Arc<Mutex<UsageTracker>>> =
    Lazy::new(|| Arc::new(Mutex::new(UsageTracker::new())));