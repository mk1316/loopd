//! DEPRECATED: This module is being replaced by neon.rs for cloud sync.
//! Supabase sync will be removed in a future version.
//! Please migrate to use the Neon cloud sync functionality instead.

use anyhow::Result;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupabaseSession {
    pub id: String,
    pub device_id: String,
    pub user_id: String,
    pub app_name: String,
    pub window_title: Option<String>,
    pub duration_seconds: i64,
    pub start_time: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupabaseResponse<T> {
    pub data: Option<T>,
    pub error: Option<SupabaseError>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SupabaseError {
    pub message: String,
    pub details: Option<String>,
    pub hint: Option<String>,
    pub code: Option<String>,
}

pub struct SupabaseClient {
    client: Client,
    url: String,
    anon_key: String,
    user_token: Option<String>,
}

impl SupabaseClient {
    pub fn new(url: String, anon_key: String) -> Self {
        let client = Client::new();
        Self {
            client,
            url,
            anon_key,
            user_token: None,
        }
    }

    pub fn set_user_token(&mut self, token: String) {
        self.user_token = Some(token);
    }

    pub fn clear_user_token(&mut self) {
        self.user_token = None;
    }

    async fn make_request<T>(&self, endpoint: &str, method: &str, body: Option<Value>) -> Result<T>
    where
        T: for<'de> Deserialize<'de> + Default,
    {
        let url = format!("{}/rest/v1/{}", self.url, endpoint);
        
        let mut request_builder = self.client.request(
            method.parse().unwrap(),
            &url
        );

        // Add headers
        request_builder = request_builder
            .header("apikey", &self.anon_key)
            .header("Content-Type", "application/json")
            .header("Prefer", "resolution=merge-duplicates");

        // Add authorization header if user token is available
        if let Some(token) = &self.user_token {
            request_builder = request_builder.header("Authorization", &format!("Bearer {}", token));
        }

        // Add body if provided
        if let Some(body_data) = body {
            request_builder = request_builder.json(&body_data);
        }

        let response = request_builder.send().await?;
        let status = response.status();
        let text = response.text().await?;

        if !status.is_success() {
            return Err(anyhow::anyhow!("Supabase request failed: {}", text));
        }

        if text.trim().is_empty() {
            // If the response is empty, return a default value
            return Ok(T::default());
        }

        match serde_json::from_str::<T>(&text) {
            Ok(data) => Ok(data),
            Err(_) => Ok(T::default()),
        }
    }

    pub async fn upload_sessions(&self, sessions: Vec<SupabaseSession>) -> Result<()> {
        if sessions.is_empty() {
            return Ok(());
        }

        let endpoint = "app_usage_logs";
        let body = serde_json::to_value(sessions)?;
        
        // Use upsert with conflict resolution on the primary key
        let _: Vec<Value> = self.make_request(&format!("{}?on_conflict=id", endpoint), "POST", Some(body)).await?;
        Ok(())
    }

    pub async fn fetch_user_sessions(&self, user_id: &str, limit: Option<i64>) -> Result<Vec<SupabaseSession>> {
        let mut endpoint = format!("app_usage_logs?user_id=eq.{}", user_id);
        
        if let Some(limit_val) = limit {
            endpoint.push_str(&format!("&limit={}", limit_val));
        }
        
        endpoint.push_str("&order=start_time.desc");

        let sessions: Vec<SupabaseSession> = self.make_request(&endpoint, "GET", None).await?;
        Ok(sessions)
    }

    pub async fn test_connection(&self) -> Result<()> {
        let endpoint = "app_usage_logs?limit=1";
        let _: Vec<Value> = self.make_request(endpoint, "GET", None).await?;
        Ok(())
    }

    pub async fn check_existing_sessions(&self, session_ids: Vec<String>) -> Result<Vec<String>> {
        if session_ids.is_empty() {
            return Ok(vec![]);
        }

        // Create a filter for existing session IDs
        let filter = session_ids.iter()
            .map(|id| format!("id.eq.{}", id))
            .collect::<Vec<_>>()
            .join(",");
        
        let endpoint = format!("app_usage_logs?select=id&or=({})", filter);
        
        let response: Vec<Value> = self.make_request(&endpoint, "GET", None).await?;
        
        // Extract existing IDs from response
        let existing_ids: Vec<String> = response.iter()
            .filter_map(|item| item.get("id"))
            .filter_map(|id| id.as_str())
            .map(|s| s.to_string())
            .collect();
            
        Ok(existing_ids)
    }
} 