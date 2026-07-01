import { useEffect, useMemo, useRef, useState } from 'react'

const REFETCH_AFTER_SCHEDULE_MS = 2_000
const POLL_INTERVAL_MS = 5_000
const POLL_BURST_MS = 30_000

type ScheduledPostLike = {
  status: string
  scheduledAt: string | null
}

/**
 * Returns ms until refetch should fire for the nearest scheduled post.
 * Past-due scheduled posts trigger immediately (0 ms).
 */
export function getScheduledRefetchDelayMs(
  posts: ScheduledPostLike[],
  now = Date.now(),
): number | null {
  const scheduledTimes = posts
    .filter((post) => post.status === 'scheduled' && post.scheduledAt)
    .map((post) => new Date(post.scheduledAt!).getTime())
    .filter((time) => !Number.isNaN(time))

  if (scheduledTimes.length === 0) {
    return null
  }

  const nearestScheduledAt = Math.min(...scheduledTimes)
  return Math.max(nearestScheduledAt + REFETCH_AFTER_SCHEDULE_MS - now, 0)
}

function toScheduledPosts(scheduledKey: string): ScheduledPostLike[] {
  if (!scheduledKey) {
    return []
  }

  return scheduledKey.split('|').map((scheduledAt) => ({
    status: 'scheduled',
    scheduledAt,
  }))
}

/**
 * Refetches post data when scheduled posts are due:
 * timeout at scheduledAt + 2s, then polling every 5s for 30s.
 */
export function useScheduledPostsRefetch(
  posts: ScheduledPostLike[],
  refetch: () => void | Promise<unknown>,
): void {
  const refetchRef = useRef(refetch)
  refetchRef.current = refetch
  const [burstGeneration, setBurstGeneration] = useState(0)

  const scheduledKey = useMemo(
    () =>
      posts
        .filter((post) => post.status === 'scheduled' && post.scheduledAt)
        .map((post) => post.scheduledAt!)
        .sort()
        .join('|'),
    [posts],
  )

  useEffect(() => {
    if (!scheduledKey) {
      return
    }

    const delayMs = getScheduledRefetchDelayMs(toScheduledPosts(scheduledKey))
    if (delayMs === null) {
      return
    }

    let pollIntervalId: ReturnType<typeof setInterval> | undefined
    let pollStopTimeoutId: ReturnType<typeof setTimeout> | undefined

    const startPollingBurst = (): void => {
      void refetchRef.current()

      pollIntervalId = setInterval(() => {
        void refetchRef.current()
      }, POLL_INTERVAL_MS)

      pollStopTimeoutId = setTimeout(() => {
        if (pollIntervalId) {
          clearInterval(pollIntervalId)
        }
        setBurstGeneration((value) => value + 1)
      }, POLL_BURST_MS)
    }

    const timeoutId = setTimeout(startPollingBurst, delayMs)

    return () => {
      clearTimeout(timeoutId)
      if (pollIntervalId) {
        clearInterval(pollIntervalId)
      }
      if (pollStopTimeoutId) {
        clearTimeout(pollStopTimeoutId)
      }
    }
  }, [scheduledKey, burstGeneration])
}
