// src/app/components/thread/thread-list.tsx
"use client";

import { useEffect, useState, useCallback } from "react";

import { fetchAllThreadsAction } from "@/lib/actions/thread";
import { getSupabaseRealtimeMetrics } from "@/lib/actions/supabase-metrics"; // New import
import { ThreadWithUserAndTags, ThreadSortOrder } from "@/types/thread";

import { ThreadCard } from "./thread-card";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { supabase } from "@/lib/db/supabase";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";

import { useLocale } from '../../contexts/index';

// Constants for Realtime limits
const REALTIME_CONNECTION_LIMIT = 200;
const REALTIME_THRESHOLD_PERCENTAGE = 0.8; // 80%
const REALTIME_WARNING_THRESHOLD =
  REALTIME_CONNECTION_LIMIT * REALTIME_THRESHOLD_PERCENTAGE;
const METRICS_POLLING_INTERVAL = 30 * 1000; // Poll every 30 seconds
const RETRY_CONNECTION_INTERVAL = 5 * 60 * 1000; // Retry every 5 minutes

export const ThreadList = () => {
  const { locale } = useLocale();
  const [threads, setThreads] = useState<ThreadWithUserAndTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<ThreadSortOrder>("newest");
  const [showRealtimeWarning, setShowRealtimeWarning] = useState(false); // New state for warning
  const [realtimeEnabled, setRealtimeEnabled] = useState(true);
  const [showRetryOption, setShowRetryOption] = useState(false);

  const fetchAllThreads = useCallback(async (take: number, cursor?: string, replace: boolean = false) => {
    setLoading(true);
    const response = await fetchAllThreadsAction(sortOrder, take, cursor);
    if (response.success) {
      if (replace) {
        setThreads(response.data.threads);
      } else {
        setThreads((prevThreads) => [...prevThreads, ...response.data.threads]);
      }
      setHasMore(response.data.hasMore);
      setNextCursor(response.data.threads[response.data.threads.length - 1]?.id);
    } else {
      console.error("Failed to fetch threads:", response.error);
      setHasMore(false);
    }
    setLoading(false);
  }, [sortOrder]);

  useEffect(() => {
    setThreads([]); // Clear threads on sort order change
    setNextCursor(undefined); // Reset cursor
    setHasMore(true); // Assume more data initially
    fetchAllThreads(10, undefined, true); // Initial load of 10 threads, replacing any existing ones

    if (!realtimeEnabled) return; // Realtimeが無効化されている場合は処理しない

    const subscription = supabase
      .channel("thread")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Thread" },
        () => {
          setThreads([]); // Clear threads on real-time update
          setNextCursor(undefined); // Reset cursor
          setHasMore(true); // Assume more data initially
          fetchAllThreads(10, undefined, true); // Reload initial 10 threads, replacing any existing ones
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Tag" },
        () => {
          setThreads([]); // Clear threads on real-time update
          setNextCursor(undefined); // Reset cursor
          setHasMore(true); // Assume more data initially
          fetchAllThreads(10, undefined, true); // Reload initial 10 threads, replacing any existing ones
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [realtimeEnabled, fetchAllThreads, sortOrder]);

  // Effect for monitoring Supabase Realtime metrics
  useEffect(() => {
    const fetchRealtimeMetrics = async () => {
      const response = await getSupabaseRealtimeMetrics();
      if (response.success) {
        if (response.data.activeConnections >= REALTIME_WARNING_THRESHOLD) {
          setShowRealtimeWarning(true);
          setRealtimeEnabled(false); // Realtimeを無効化
          setShowRetryOption(true); // 再試行オプションを表示
        } else {
          setShowRealtimeWarning(false);
          if (!realtimeEnabled) {
            setRealtimeEnabled(true); // 必要に応じてRealtimeを再有効化
          }
        }
      } else {
        console.error("Failed to fetch realtime metrics:", response.error);
        // Optionally, you might want to show a warning if metrics can't be fetched
      }
    };

    // Fetch immediately and then set up polling
    fetchRealtimeMetrics();
    const intervalId = setInterval(
      fetchRealtimeMetrics,
      METRICS_POLLING_INTERVAL
    );

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, [realtimeEnabled]); // fetchAllThreadsを依存関係から削除

  // Effect for retrying connection when showRetryOption is true
  useEffect(() => {
    if (!showRetryOption) return;

    const retryInterval = setInterval(() => {
      // 接続数が閾値以下であればRealtimeを再有効化
      getSupabaseRealtimeMetrics().then((response) => {
        if (
          response.success &&
          response.data.activeConnections < REALTIME_WARNING_THRESHOLD
        ) {
          setRealtimeEnabled(true);
          setShowRetryOption(false);
          clearInterval(retryInterval);
        }
      });
    }, RETRY_CONNECTION_INTERVAL);

    return () => clearInterval(retryInterval);
  }, [showRetryOption]); // fetchAllThreadsを依存関係から削除

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchAllThreads(10, nextCursor);
        }
      },
      { threshold: 1.0 }
    );

    const observerTarget = document.getElementById("observer-target");
    if (observerTarget) {
      observer.observe(observerTarget);
    }

    return () => {
      if (observerTarget) {
        observer.unobserve(observerTarget);
      }
    };
  }, [hasMore, loading, nextCursor, fetchAllThreads]);

  const pinnedThreads = threads.filter((thread) => thread.isPinned);
  const unpinnedThreads = threads.filter((thread) => !thread.isPinned);

  return (
    <>
      {showRealtimeWarning && (
        <div className="mb-4 p-3 rounded-md bg-yellow-100 border border-yellow-400 text-yellow-800">
          <h4 className="font-bold">Realtime Usage Warning</h4>
          <p>
            Supabase Realtime connections are approaching the free tier limit.
            Realtime updates may become unreliable.
          </p>
          {showRetryOption && (
            <button
              className="mt-2 text-blue-600 hover:underline"
              onClick={() => {
                // 手動での再接続を試みる
                getSupabaseRealtimeMetrics().then((response) => {
                  if (
                    response.success &&
                    response.data.activeConnections < REALTIME_WARNING_THRESHOLD
                  ) {
                    setRealtimeEnabled(true);
                    setShowRetryOption(false);
                  }
                });
              }}
            >
              Try reconnecting to Realtime
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Spinner className="h-12 w-12" />
        </div>
      ) : threads.length === 0 ? (
        <Empty>
          <EmptyTitle>No Threads Found</EmptyTitle>
          <EmptyDescription>Be the first to create one!</EmptyDescription>
        </Empty>
      ) : (
        <div className="mt-4">
          <div className="flex justify-end mb-4">
            <ButtonGroup>
              <Button
                variant={sortOrder === "newest" ? "default" : "outline"}
                onClick={() => setSortOrder("newest")}
              >
                {locale("sort.newest")}
              </Button>
              <Button
                variant={sortOrder === "oldest" ? "default" : "outline"}
                onClick={() => setSortOrder("oldest")}
              >
                {locale("sort.oldest")}
              </Button>
              <Button
                variant={sortOrder === "most_comments" ? "default" : "outline"}
                onClick={() => setSortOrder("most_comments")}
              >
                {locale("sort.most_comments")}
              </Button>
              <Button
                variant={
                  sortOrder === "most_comments_last_week"
                    ? "default"
                    : "outline"
                }
                onClick={() => setSortOrder("most_comments_last_week")}
              >
                {locale("sort.most_comments_last_week")}
              </Button>
            </ButtonGroup>
          </div>
          {pinnedThreads.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-3">Pinned Threads</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pinnedThreads.map((thread) => (
                  <ThreadCard
                    key={thread.id}
                    thread={thread}
                    isPinnedCard={true}
                  />
                ))}
              </div>
            </div>
          )}

          {unpinnedThreads.length > 0 && (
            <div>
              {pinnedThreads.length > 0 && (
                <h3 className="text-xl font-bold mb-3">All Threads</h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {unpinnedThreads.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            </div>
          )}
          <div id="observer-target" className="h-1"></div>
          {loading && (
            <div className="flex justify-center items-center h-48">
              <Spinner className="h-12 w-12" />
            </div>
          )}
        </div>
      )}
    </>
  );
};
