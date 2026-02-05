use std::collections::HashMap;
use std::sync::Arc;
use chrono::{DateTime, Utc, Duration};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use crate::aw_database::AwDatabase;
use crate::aw_models::Event;

/// Query result type
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum QueryResult {
    Events(Vec<Event>),
    Summary(Vec<(String, f64)>),
    Categories(HashMap<String, f64>),
    Number(f64),
    String(String),
    Value(Value),
}

/// Category rule for classifying events
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CategoryRule {
    pub name: String,
    #[serde(default)]
    pub categories: Vec<String>, // Hierarchical categories like ["Work", "Development"]
    pub rule: CategoryRuleType,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum CategoryRuleType {
    #[serde(rename = "regex")]
    Regex {
        #[serde(default)]
        ignore_case: bool,
        pattern: String
    },
    #[serde(rename = "glob")]
    Glob { pattern: String },
    #[serde(rename = "exact")]
    Exact { app: Option<String>, title: Option<String> },
}

/// Query request structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryRequest {
    pub query: Vec<String>, // Query statements
    pub timeperiods: Vec<String>, // Time periods in format "start/end"
}

/// Query context for executing queries
pub struct QueryContext {
    db: Arc<AwDatabase>,
    variables: HashMap<String, QueryResult>,
    start: DateTime<Utc>,
    end: DateTime<Utc>,
}

impl QueryContext {
    pub fn new(db: Arc<AwDatabase>, start: DateTime<Utc>, end: DateTime<Utc>) -> Self {
        Self {
            db,
            variables: HashMap::new(),
            start,
            end,
        }
    }

    /// Execute a simple query and return results
    pub async fn execute(&mut self, query: &str) -> Result<QueryResult, String> {
        let query = query.trim();

        // Handle variable assignment
        if let Some(eq_pos) = query.find('=') {
            let var_name = query[..eq_pos].trim();
            let expr = query[eq_pos + 1..].trim();
            let result = self.evaluate(expr).await?;
            self.variables.insert(var_name.to_string(), result.clone());
            return Ok(result);
        }

        // Handle return statement
        if query.starts_with("RETURN") || query.starts_with("return") {
            let expr = query[6..].trim();
            return self.evaluate(expr).await;
        }

        self.evaluate(query).await
    }

    /// Evaluate an expression
    async fn evaluate(&mut self, expr: &str) -> Result<QueryResult, String> {
        let expr = expr.trim();

        // Check for function calls
        if let Some(paren_start) = expr.find('(') {
            let func_name = &expr[..paren_start];
            let args_end = expr.rfind(')').ok_or("Missing closing parenthesis")?;
            let args_str = &expr[paren_start + 1..args_end];

            return self.call_function(func_name, args_str).await;
        }

        // Check for variable reference
        if let Some(result) = self.variables.get(expr) {
            return Ok(result.clone());
        }

        // Try parsing as JSON value
        if let Ok(value) = serde_json::from_str::<Value>(expr) {
            return Ok(QueryResult::Value(value));
        }

        Err(format!("Unknown expression: {}", expr))
    }

    /// Call a built-in function
    async fn call_function(&mut self, name: &str, args_str: &str) -> Result<QueryResult, String> {
        match name.to_lowercase().as_str() {
            "query_bucket" | "flood" => {
                // query_bucket(bucket_id) - Get events from a bucket
                let bucket_id = args_str.trim().trim_matches('"');
                let events = self.db.get_events(
                    bucket_id,
                    Some(self.start),
                    Some(self.end),
                    None
                ).await.map_err(|e| e.to_string())?;
                Ok(QueryResult::Events(events))
            }
            "filter_keyvals" => {
                // filter_keyvals(events, key, values) - Filter events by data key
                let args = self.parse_args(args_str)?;
                if args.len() < 3 {
                    return Err("filter_keyvals requires 3 arguments".to_string());
                }
                let events = self.get_events_from_arg(&args[0]).await?;
                let key = args[1].trim_matches('"');
                let values: Vec<&str> = args[2].trim_matches(|c| c == '[' || c == ']')
                    .split(',')
                    .map(|s| s.trim().trim_matches('"'))
                    .collect();

                let filtered: Vec<Event> = events.into_iter()
                    .filter(|e| {
                        if let Some(val) = e.data.get(key) {
                            values.iter().any(|v| {
                                val.as_str().map(|s| s.contains(v)).unwrap_or(false)
                            })
                        } else {
                            false
                        }
                    })
                    .collect();
                Ok(QueryResult::Events(filtered))
            }
            "exclude_keyvals" => {
                // exclude_keyvals(events, key, values) - Exclude events by data key
                let args = self.parse_args(args_str)?;
                if args.len() < 3 {
                    return Err("exclude_keyvals requires 3 arguments".to_string());
                }
                let events = self.get_events_from_arg(&args[0]).await?;
                let key = args[1].trim_matches('"');
                let values: Vec<&str> = args[2].trim_matches(|c| c == '[' || c == ']')
                    .split(',')
                    .map(|s| s.trim().trim_matches('"'))
                    .collect();

                let filtered: Vec<Event> = events.into_iter()
                    .filter(|e| {
                        if let Some(val) = e.data.get(key) {
                            !values.iter().any(|v| {
                                val.as_str().map(|s| s.contains(v)).unwrap_or(false)
                            })
                        } else {
                            true
                        }
                    })
                    .collect();
                Ok(QueryResult::Events(filtered))
            }
            "merge_events_by_keys" => {
                // merge_events_by_keys(events, keys) - Merge consecutive events with same keys
                let args = self.parse_args(args_str)?;
                if args.len() < 2 {
                    return Err("merge_events_by_keys requires 2 arguments".to_string());
                }
                let events = self.get_events_from_arg(&args[0]).await?;
                let keys: Vec<&str> = args[1].trim_matches(|c| c == '[' || c == ']')
                    .split(',')
                    .map(|s| s.trim().trim_matches('"'))
                    .collect();

                let merged = self.merge_events_by_keys(events, &keys);
                Ok(QueryResult::Events(merged))
            }
            "sort_by_duration" => {
                // sort_by_duration(events) - Sort events by duration descending
                let args = self.parse_args(args_str)?;
                if args.is_empty() {
                    return Err("sort_by_duration requires 1 argument".to_string());
                }
                let mut events = self.get_events_from_arg(&args[0]).await?;
                events.sort_by(|a, b| b.duration.partial_cmp(&a.duration).unwrap_or(std::cmp::Ordering::Equal));
                Ok(QueryResult::Events(events))
            }
            "sort_by_timestamp" => {
                // sort_by_timestamp(events) - Sort events by timestamp
                let args = self.parse_args(args_str)?;
                if args.is_empty() {
                    return Err("sort_by_timestamp requires 1 argument".to_string());
                }
                let mut events = self.get_events_from_arg(&args[0]).await?;
                events.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));
                Ok(QueryResult::Events(events))
            }
            "limit_events" => {
                // limit_events(events, count) - Limit number of events
                let args = self.parse_args(args_str)?;
                if args.len() < 2 {
                    return Err("limit_events requires 2 arguments".to_string());
                }
                let events = self.get_events_from_arg(&args[0]).await?;
                let limit: usize = args[1].trim().parse().map_err(|_| "Invalid limit")?;
                Ok(QueryResult::Events(events.into_iter().take(limit).collect()))
            }
            "sum_durations" => {
                // sum_durations(events) - Sum all event durations
                let args = self.parse_args(args_str)?;
                if args.is_empty() {
                    return Err("sum_durations requires 1 argument".to_string());
                }
                let events = self.get_events_from_arg(&args[0]).await?;
                let total: f64 = events.iter().map(|e| e.duration).sum();
                Ok(QueryResult::Number(total))
            }
            "categorize" => {
                // categorize(events, categories) - Categorize events using rules
                let args = self.parse_args(args_str)?;
                if args.len() < 2 {
                    return Err("categorize requires 2 arguments".to_string());
                }
                let events = self.get_events_from_arg(&args[0]).await?;
                let rules: Vec<CategoryRule> = serde_json::from_str(&args[1])
                    .map_err(|e| format!("Invalid category rules: {}", e))?;

                let categorized = self.categorize_events(&events, &rules);
                Ok(QueryResult::Categories(categorized))
            }
            "summarize_by_app" | "summarize_events" => {
                // summarize_by_app(events) - Summarize events by app name
                let args = self.parse_args(args_str)?;
                if args.is_empty() {
                    return Err("summarize_by_app requires 1 argument".to_string());
                }
                let events = self.get_events_from_arg(&args[0]).await?;

                let mut summary: HashMap<String, f64> = HashMap::new();
                for event in events {
                    let app = event.data.get("app")
                        .and_then(|v| v.as_str())
                        .unwrap_or("Unknown")
                        .to_string();
                    *summary.entry(app).or_insert(0.0) += event.duration;
                }

                let mut sorted: Vec<(String, f64)> = summary.into_iter().collect();
                sorted.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
                Ok(QueryResult::Summary(sorted))
            }
            "concat" => {
                // concat(events1, events2, ...) - Concatenate event lists
                let args = self.parse_args(args_str)?;
                let mut all_events = Vec::new();
                for arg in args {
                    let events = self.get_events_from_arg(&arg).await?;
                    all_events.extend(events);
                }
                Ok(QueryResult::Events(all_events))
            }
            "nop" => {
                // nop() - No operation, returns empty events
                Ok(QueryResult::Events(vec![]))
            }
            _ => Err(format!("Unknown function: {}", name))
        }
    }

    /// Parse function arguments
    fn parse_args(&self, args_str: &str) -> Result<Vec<String>, String> {
        let mut args = Vec::new();
        let mut current = String::new();
        let mut depth = 0;
        let mut in_string = false;
        let mut escape = false;

        for c in args_str.chars() {
            if escape {
                current.push(c);
                escape = false;
                continue;
            }

            match c {
                '\\' => escape = true,
                '"' => {
                    in_string = !in_string;
                    current.push(c);
                }
                '(' | '[' | '{' if !in_string => {
                    depth += 1;
                    current.push(c);
                }
                ')' | ']' | '}' if !in_string => {
                    depth -= 1;
                    current.push(c);
                }
                ',' if !in_string && depth == 0 => {
                    args.push(current.trim().to_string());
                    current = String::new();
                }
                _ => current.push(c),
            }
        }

        if !current.trim().is_empty() {
            args.push(current.trim().to_string());
        }

        Ok(args)
    }

    /// Get events from an argument (variable reference or expression)
    async fn get_events_from_arg(&mut self, arg: &str) -> Result<Vec<Event>, String> {
        let arg = arg.trim();

        // Check if it's a variable reference
        if let Some(QueryResult::Events(events)) = self.variables.get(arg) {
            return Ok(events.clone());
        }

        // Try to evaluate as expression
        match self.evaluate(arg).await? {
            QueryResult::Events(events) => Ok(events),
            _ => Err(format!("Expected events, got other type for: {}", arg))
        }
    }

    /// Merge consecutive events with same key values
    fn merge_events_by_keys(&self, events: Vec<Event>, keys: &[&str]) -> Vec<Event> {
        if events.is_empty() {
            return events;
        }

        let mut merged = Vec::new();
        let mut current = events[0].clone();

        for event in events.into_iter().skip(1) {
            let same_keys = keys.iter().all(|key| {
                current.data.get(*key) == event.data.get(*key)
            });

            if same_keys {
                // Extend duration
                current.duration += event.duration;
            } else {
                merged.push(current);
                current = event;
            }
        }

        merged.push(current);
        merged
    }

    /// Categorize events using rules
    fn categorize_events(&self, events: &[Event], rules: &[CategoryRule]) -> HashMap<String, f64> {
        let mut categories: HashMap<String, f64> = HashMap::new();

        for event in events {
            let app = event.data.get("app").and_then(|v| v.as_str()).unwrap_or("");
            let title = event.data.get("title").and_then(|v| v.as_str()).unwrap_or("");

            let mut matched = false;
            for rule in rules {
                if self.matches_rule(app, title, &rule.rule) {
                    let category = if rule.categories.is_empty() {
                        rule.name.clone()
                    } else {
                        rule.categories.join(" > ")
                    };
                    *categories.entry(category).or_insert(0.0) += event.duration;
                    matched = true;
                    break;
                }
            }

            if !matched {
                *categories.entry("Uncategorized".to_string()).or_insert(0.0) += event.duration;
            }
        }

        categories
    }

    /// Check if app/title matches a rule
    fn matches_rule(&self, app: &str, title: &str, rule: &CategoryRuleType) -> bool {
        match rule {
            CategoryRuleType::Regex { pattern, ignore_case } => {
                let regex = if *ignore_case {
                    regex::RegexBuilder::new(pattern)
                        .case_insensitive(true)
                        .build()
                } else {
                    regex::Regex::new(pattern)
                };
                match regex {
                    Ok(re) => re.is_match(app) || re.is_match(title),
                    Err(_) => false,
                }
            }
            CategoryRuleType::Glob { pattern } => {
                let pattern = pattern.replace("*", ".*").replace("?", ".");
                if let Ok(re) = regex::Regex::new(&pattern) {
                    re.is_match(app) || re.is_match(title)
                } else {
                    false
                }
            }
            CategoryRuleType::Exact { app: rule_app, title: rule_title } => {
                let app_match = rule_app.as_ref().map(|a| a == app).unwrap_or(true);
                let title_match = rule_title.as_ref().map(|t| t == title).unwrap_or(true);
                app_match && title_match
            }
        }
    }
}

/// Parse a time period string "start/end" into two DateTime values
pub fn parse_timeperiod(period: &str) -> Result<(DateTime<Utc>, DateTime<Utc>), String> {
    let parts: Vec<&str> = period.split('/').collect();
    if parts.len() != 2 {
        return Err("Invalid time period format, expected 'start/end'".to_string());
    }

    let start = DateTime::parse_from_rfc3339(parts[0])
        .map_err(|e| format!("Invalid start time: {}", e))?
        .with_timezone(&Utc);

    let end = DateTime::parse_from_rfc3339(parts[1])
        .map_err(|e| format!("Invalid end time: {}", e))?
        .with_timezone(&Utc);

    Ok((start, end))
}

/// Execute a query request
pub async fn execute_query(
    db: Arc<AwDatabase>,
    request: QueryRequest,
) -> Result<Vec<QueryResult>, String> {
    let mut results = Vec::new();

    for period in &request.timeperiods {
        let (start, end) = parse_timeperiod(period)?;
        let mut ctx = QueryContext::new(db.clone(), start, end);

        let mut last_result = QueryResult::Events(vec![]);
        for statement in &request.query {
            last_result = ctx.execute(statement).await?;
        }
        results.push(last_result);
    }

    Ok(results)
}

// ========== Tauri Commands ==========

#[tauri::command]
pub async fn aw_query(
    aw_db: tauri::State<'_, crate::AwDb>,
    query: Vec<String>,
    timeperiods: Vec<String>,
) -> Result<Vec<Value>, String> {
    let request = QueryRequest { query, timeperiods };
    let results = execute_query(aw_db.inner().clone(), request).await?;

    // Convert results to JSON values
    let json_results: Vec<Value> = results.into_iter().map(|r| {
        match r {
            QueryResult::Events(events) => serde_json::to_value(events).unwrap_or(Value::Null),
            QueryResult::Summary(summary) => serde_json::to_value(summary).unwrap_or(Value::Null),
            QueryResult::Categories(cats) => serde_json::to_value(cats).unwrap_or(Value::Null),
            QueryResult::Number(n) => json!(n),
            QueryResult::String(s) => json!(s),
            QueryResult::Value(v) => v,
        }
    }).collect();

    Ok(json_results)
}

#[tauri::command]
pub async fn aw_categorize(
    aw_db: tauri::State<'_, crate::AwDb>,
    bucket_id: String,
    rules: Vec<CategoryRule>,
    start: Option<String>,
    end: Option<String>,
) -> Result<HashMap<String, f64>, String> {
    let start_dt = start.as_ref()
        .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
        .map(|dt| dt.with_timezone(&Utc))
        .unwrap_or_else(|| Utc::now() - Duration::days(1));

    let end_dt = end.as_ref()
        .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
        .map(|dt| dt.with_timezone(&Utc))
        .unwrap_or_else(Utc::now);

    let events = aw_db.get_events(&bucket_id, Some(start_dt), Some(end_dt), None)
        .await
        .map_err(|e| e.to_string())?;

    let ctx = QueryContext::new(aw_db.inner().clone(), start_dt, end_dt);
    Ok(ctx.categorize_events(&events, &rules))
}

#[tauri::command]
pub async fn aw_summarize(
    aw_db: tauri::State<'_, crate::AwDb>,
    bucket_id: String,
    group_by: String,
    start: Option<String>,
    end: Option<String>,
) -> Result<Vec<(String, f64)>, String> {
    let start_dt = start.as_ref()
        .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
        .map(|dt| dt.with_timezone(&Utc))
        .unwrap_or_else(|| Utc::now() - Duration::days(1));

    let end_dt = end.as_ref()
        .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
        .map(|dt| dt.with_timezone(&Utc))
        .unwrap_or_else(Utc::now);

    let events = aw_db.get_events(&bucket_id, Some(start_dt), Some(end_dt), None)
        .await
        .map_err(|e| e.to_string())?;

    let mut summary: HashMap<String, f64> = HashMap::new();
    for event in events {
        let key = event.data.get(&group_by)
            .and_then(|v| v.as_str())
            .unwrap_or("Unknown")
            .to_string();
        *summary.entry(key).or_insert(0.0) += event.duration;
    }

    let mut sorted: Vec<(String, f64)> = summary.into_iter().collect();
    sorted.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    Ok(sorted)
}
