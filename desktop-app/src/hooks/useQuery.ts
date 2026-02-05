import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import type { AWEvent } from '@/types';

/**
 * Category rule for classifying events
 */
export interface CategoryRule {
  name: string;
  categories?: string[]; // Hierarchical categories like ["Work", "Development"]
  rule: CategoryRuleType;
}

export type CategoryRuleType =
  | { type: 'regex'; pattern: string; ignore_case?: boolean }
  | { type: 'glob'; pattern: string }
  | { type: 'exact'; app?: string; title?: string };

/**
 * Query result types
 */
export type QueryResult = AWEvent[] | [string, number][] | Record<string, number> | number | string;

/**
 * Hook for running ActivityWatch-compatible queries
 */
export function useQuery() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Run a query with the ActivityWatch query language
   * @param query Array of query statements
   * @param timeperiods Array of time periods in "start/end" ISO format
   */
  const runQuery = useCallback(async (
    query: string[],
    timeperiods: string[]
  ): Promise<QueryResult[]> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<QueryResult[]>('aw_query', { query, timeperiods });
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Categorize events using rules
   * @param bucketId The bucket to get events from
   * @param rules Array of category rules
   * @param start Optional start time (ISO string)
   * @param end Optional end time (ISO string)
   */
  const categorize = useCallback(async (
    bucketId: string,
    rules: CategoryRule[],
    start?: string,
    end?: string
  ): Promise<Record<string, number>> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<Record<string, number>>('aw_categorize', {
        bucketId,
        rules,
        start,
        end,
      });
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(errorMsg);
      return {};
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Summarize events by a specific field
   * @param bucketId The bucket to get events from
   * @param groupBy The field to group by (e.g., "app", "title")
   * @param start Optional start time (ISO string)
   * @param end Optional end time (ISO string)
   */
  const summarize = useCallback(async (
    bucketId: string,
    groupBy: string,
    start?: string,
    end?: string
  ): Promise<[string, number][]> => {
    try {
      setLoading(true);
      setError(null);
      return await invoke<[string, number][]>('aw_summarize', {
        bucketId,
        groupBy,
        start,
        end,
      });
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get events from a bucket for a time period
   */
  const getEventsForPeriod = useCallback(async (
    bucketId: string,
    start: string,
    end: string
  ): Promise<AWEvent[]> => {
    const query = [
      `events = query_bucket("${bucketId}")`,
      'RETURN events'
    ];
    const timeperiod = `${start}/${end}`;
    const results = await runQuery(query, [timeperiod]);
    return (results[0] as AWEvent[]) || [];
  }, [runQuery]);

  /**
   * Get usage summary (time per app) for a time period
   */
  const getUsageSummary = useCallback(async (
    bucketId: string,
    start: string,
    end: string
  ): Promise<[string, number][]> => {
    const query = [
      `events = query_bucket("${bucketId}")`,
      'merged = merge_events_by_keys(events, ["app"])',
      'summary = summarize_by_app(merged)',
      'RETURN summary'
    ];
    const timeperiod = `${start}/${end}`;
    const results = await runQuery(query, [timeperiod]);
    return (results[0] as [string, number][]) || [];
  }, [runQuery]);

  /**
   * Get total active time for a period
   */
  const getTotalTime = useCallback(async (
    bucketId: string,
    start: string,
    end: string
  ): Promise<number> => {
    const query = [
      `events = query_bucket("${bucketId}")`,
      'total = sum_durations(events)',
      'RETURN total'
    ];
    const timeperiod = `${start}/${end}`;
    const results = await runQuery(query, [timeperiod]);
    return (results[0] as number) || 0;
  }, [runQuery]);

  /**
   * Filter events by app name
   */
  const filterByApp = useCallback(async (
    bucketId: string,
    appNames: string[],
    start: string,
    end: string
  ): Promise<AWEvent[]> => {
    const appsJson = JSON.stringify(appNames);
    const query = [
      `events = query_bucket("${bucketId}")`,
      `filtered = filter_keyvals(events, "app", ${appsJson})`,
      'RETURN filtered'
    ];
    const timeperiod = `${start}/${end}`;
    const results = await runQuery(query, [timeperiod]);
    return (results[0] as AWEvent[]) || [];
  }, [runQuery]);

  /**
   * Exclude events by app name
   */
  const excludeApps = useCallback(async (
    bucketId: string,
    appNames: string[],
    start: string,
    end: string
  ): Promise<AWEvent[]> => {
    const appsJson = JSON.stringify(appNames);
    const query = [
      `events = query_bucket("${bucketId}")`,
      `filtered = exclude_keyvals(events, "app", ${appsJson})`,
      'RETURN filtered'
    ];
    const timeperiod = `${start}/${end}`;
    const results = await runQuery(query, [timeperiod]);
    return (results[0] as AWEvent[]) || [];
  }, [runQuery]);

  /**
   * Get top apps by usage time
   */
  const getTopApps = useCallback(async (
    bucketId: string,
    start: string,
    end: string,
    limit: number = 10
  ): Promise<[string, number][]> => {
    const query = [
      `events = query_bucket("${bucketId}")`,
      'merged = merge_events_by_keys(events, ["app"])',
      'sorted = sort_by_duration(merged)',
      `limited = limit_events(sorted, ${limit})`,
      'summary = summarize_by_app(limited)',
      'RETURN summary'
    ];
    const timeperiod = `${start}/${end}`;
    const results = await runQuery(query, [timeperiod]);
    return (results[0] as [string, number][]) || [];
  }, [runQuery]);

  return {
    // State
    loading,
    error,

    // Raw query
    runQuery,

    // Higher-level functions
    categorize,
    summarize,
    getEventsForPeriod,
    getUsageSummary,
    getTotalTime,
    filterByApp,
    excludeApps,
    getTopApps,
  };
}
