use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value as JsonValue};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};

use crate::aw_database::AwDatabase;
use crate::aw_models::{Bucket, BucketExport, Event, GetEventsParams, Heartbeat, ServerInfo};
use crate::aw_query::{QueryRequest, execute_query};

/// Shared state for the API server
#[derive(Clone)]
pub struct AppState {
    pub aw_db: Arc<AwDatabase>,
    pub hostname: String,
    pub device_id: String,
}

/// Start the ActivityWatch-compatible REST API server
pub async fn start_server(aw_db: Arc<AwDatabase>, hostname: String, device_id: String, port: u16) {
    let state = AppState {
        aw_db,
        hostname,
        device_id,
    };

    // Build CORS layer - allow all origins for local development
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // Build the router with all ActivityWatch API routes
    let app = Router::new()
        // Info endpoint
        .route("/api/0/info", get(get_info))
        // Bucket endpoints
        .route("/api/0/buckets", get(get_buckets))
        .route("/api/0/buckets/", get(get_buckets))
        .route("/api/0/buckets/:bucket_id", get(get_bucket))
        .route("/api/0/buckets/:bucket_id", post(create_bucket))
        .route("/api/0/buckets/:bucket_id", delete(delete_bucket))
        // Event endpoints
        .route("/api/0/buckets/:bucket_id/events", get(get_events))
        .route("/api/0/buckets/:bucket_id/events", post(insert_events))
        .route("/api/0/buckets/:bucket_id/events/:event_id", get(get_event))
        .route("/api/0/buckets/:bucket_id/events/:event_id", delete(delete_event))
        .route("/api/0/buckets/:bucket_id/events/count", get(get_event_count))
        // Heartbeat endpoint
        .route("/api/0/buckets/:bucket_id/heartbeat", post(heartbeat))
        // Export endpoints
        .route("/api/0/buckets/:bucket_id/export", get(export_bucket))
        .route("/api/0/export", get(export_all))
        // Query endpoint
        .route("/api/0/query", post(query))
        .route("/api/0/query/", post(query))
        // Add CORS and state
        .layer(cors)
        .with_state(state);

    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    println!("[AW-SERVER] Starting ActivityWatch-compatible server on http://{}", addr);

    // Start the server
    let listener = tokio::net::TcpListener::bind(addr).await;
    match listener {
        Ok(listener) => {
            if let Err(e) = axum::serve(listener, app).await {
                eprintln!("[AW-SERVER] Server error: {}", e);
            }
        }
        Err(e) => {
            eprintln!("[AW-SERVER] Failed to bind to {}: {}", addr, e);
            eprintln!("[AW-SERVER] Port {} may already be in use (perhaps by aw-server?)", port);
        }
    }
}

// ========== Info Endpoint ==========

async fn get_info(State(state): State<AppState>) -> Json<ServerInfo> {
    Json(ServerInfo {
        hostname: state.hostname,
        version: env!("CARGO_PKG_VERSION").to_string(),
        testing: cfg!(debug_assertions),
        device_id: state.device_id,
    })
}

// ========== Bucket Endpoints ==========

async fn get_buckets(
    State(state): State<AppState>,
) -> Result<Json<HashMap<String, Bucket>>, (StatusCode, String)> {
    state.aw_db
        .get_buckets()
        .await
        .map(Json)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
}

async fn get_bucket(
    State(state): State<AppState>,
    Path(bucket_id): Path<String>,
) -> Result<Json<Bucket>, (StatusCode, String)> {
    match state.aw_db.get_bucket(&bucket_id).await {
        Ok(Some(bucket)) => Ok(Json(bucket)),
        Ok(None) => Err((StatusCode::NOT_FOUND, format!("Bucket not found: {}", bucket_id))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

#[derive(Debug, Deserialize)]
struct CreateBucketRequest {
    client: String,
    #[serde(rename = "type")]
    bucket_type: String,
    hostname: String,
    #[serde(default)]
    name: Option<String>,
    #[serde(default)]
    data: Option<JsonValue>,
}

async fn create_bucket(
    State(state): State<AppState>,
    Path(bucket_id): Path<String>,
    Json(body): Json<CreateBucketRequest>,
) -> Result<Json<Bucket>, (StatusCode, String)> {
    let bucket = Bucket {
        id: bucket_id,
        name: body.name,
        bucket_type: body.bucket_type,
        client: body.client,
        hostname: body.hostname,
        created: Utc::now(),
        data: body.data,
        last_updated: None,
    };

    state.aw_db
        .get_or_create_bucket(&bucket)
        .await
        .map(Json)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
}

async fn delete_bucket(
    State(state): State<AppState>,
    Path(bucket_id): Path<String>,
) -> Result<StatusCode, (StatusCode, String)> {
    state.aw_db
        .delete_bucket(&bucket_id)
        .await
        .map(|_| StatusCode::OK)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
}

// ========== Event Endpoints ==========

#[derive(Debug, Deserialize, Default)]
struct GetEventsQuery {
    start: Option<String>,
    end: Option<String>,
    limit: Option<i64>,
}

async fn get_events(
    State(state): State<AppState>,
    Path(bucket_id): Path<String>,
    Query(query): Query<GetEventsQuery>,
) -> Result<Json<Vec<Event>>, (StatusCode, String)> {
    let params = GetEventsParams {
        start: query.start.and_then(|s| DateTime::parse_from_rfc3339(&s).ok().map(|dt| dt.with_timezone(&Utc))),
        end: query.end.and_then(|s| DateTime::parse_from_rfc3339(&s).ok().map(|dt| dt.with_timezone(&Utc))),
        limit: query.limit,
    };

    state.aw_db
        .get_events(&bucket_id, &params)
        .await
        .map(Json)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
}

async fn get_event(
    State(state): State<AppState>,
    Path((bucket_id, event_id)): Path<(String, i64)>,
) -> Result<Json<Event>, (StatusCode, String)> {
    match state.aw_db.get_event(&bucket_id, event_id).await {
        Ok(Some(event)) => Ok(Json(event)),
        Ok(None) => Err((StatusCode::NOT_FOUND, format!("Event not found: {}", event_id))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

async fn insert_events(
    State(state): State<AppState>,
    Path(bucket_id): Path<String>,
    Json(events): Json<Vec<Event>>,
) -> Result<Json<Vec<Event>>, (StatusCode, String)> {
    state.aw_db
        .insert_events(&bucket_id, &events)
        .await
        .map(Json)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
}

async fn delete_event(
    State(state): State<AppState>,
    Path((bucket_id, event_id)): Path<(String, i64)>,
) -> Result<StatusCode, (StatusCode, String)> {
    match state.aw_db.delete_event(&bucket_id, event_id).await {
        Ok(true) => Ok(StatusCode::OK),
        Ok(false) => Err((StatusCode::NOT_FOUND, format!("Event not found: {}", event_id))),
        Err(e) => Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    }
}

async fn get_event_count(
    State(state): State<AppState>,
    Path(bucket_id): Path<String>,
) -> Result<Json<i64>, (StatusCode, String)> {
    state.aw_db
        .get_event_count(&bucket_id)
        .await
        .map(Json)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
}

// ========== Heartbeat Endpoint ==========

#[derive(Debug, Deserialize)]
struct HeartbeatQuery {
    #[serde(default = "default_pulsetime")]
    pulsetime: f64,
}

fn default_pulsetime() -> f64 {
    5.0
}

#[derive(Debug, Deserialize)]
struct HeartbeatRequest {
    timestamp: String,
    duration: f64,
    data: JsonValue,
}

async fn heartbeat(
    State(state): State<AppState>,
    Path(bucket_id): Path<String>,
    Query(query): Query<HeartbeatQuery>,
    Json(body): Json<HeartbeatRequest>,
) -> Result<Json<Event>, (StatusCode, String)> {
    let timestamp = DateTime::parse_from_rfc3339(&body.timestamp)
        .map_err(|e| (StatusCode::BAD_REQUEST, format!("Invalid timestamp: {}", e)))?
        .with_timezone(&Utc);

    let heartbeat = Heartbeat {
        timestamp,
        duration: body.duration,
        data: body.data,
    };

    state.aw_db
        .heartbeat(&bucket_id, &heartbeat, query.pulsetime)
        .await
        .map(Json)
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))
}

// ========== Export Endpoints ==========

async fn export_bucket(
    State(state): State<AppState>,
    Path(bucket_id): Path<String>,
) -> Result<Json<BucketExport>, (StatusCode, String)> {
    let bucket = match state.aw_db.get_bucket(&bucket_id).await {
        Ok(Some(b)) => b,
        Ok(None) => return Err((StatusCode::NOT_FOUND, format!("Bucket not found: {}", bucket_id))),
        Err(e) => return Err((StatusCode::INTERNAL_SERVER_ERROR, e.to_string())),
    };

    let events = state.aw_db
        .get_events(&bucket_id, &GetEventsParams::default())
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    Ok(Json(BucketExport { bucket, events }))
}

async fn export_all(
    State(state): State<AppState>,
) -> Result<Json<HashMap<String, BucketExport>>, (StatusCode, String)> {
    let buckets = state.aw_db
        .get_buckets()
        .await
        .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

    let mut exports = HashMap::new();
    for (id, bucket) in buckets {
        let events = state.aw_db
            .get_events(&id, &GetEventsParams::default())
            .await
            .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;

        exports.insert(id, BucketExport { bucket, events });
    }

    Ok(Json(exports))
}

// ========== Query Endpoint ==========

async fn query(
    State(state): State<AppState>,
    Json(request): Json<QueryRequest>,
) -> Result<Json<Vec<JsonValue>>, (StatusCode, String)> {
    let results = execute_query(state.aw_db.clone(), request)
        .await
        .map_err(|e| (StatusCode::BAD_REQUEST, e))?;

    // Convert results to JSON values
    let json_results: Vec<JsonValue> = results.into_iter().map(|r| {
        match r {
            crate::aw_query::QueryResult::Events(events) => serde_json::to_value(events).unwrap_or(JsonValue::Null),
            crate::aw_query::QueryResult::Summary(summary) => serde_json::to_value(summary).unwrap_or(JsonValue::Null),
            crate::aw_query::QueryResult::Categories(cats) => serde_json::to_value(cats).unwrap_or(JsonValue::Null),
            crate::aw_query::QueryResult::Number(n) => json!(n),
            crate::aw_query::QueryResult::String(s) => json!(s),
            crate::aw_query::QueryResult::Value(v) => v,
        }
    }).collect();

    Ok(Json(json_results))
}
