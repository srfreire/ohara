import { useState, useEffect, useRef, useCallback } from 'react'
import type { PaginationMeta } from '../types/api'

/**
 * Options for useInfiniteScroll hook
 */
interface UseInfiniteScrollOptions<T> {
  /**
   * Function to fetch data with cursor pagination
   * Should return { data, pagination }
   */
  fetchFn: (cursor?: string) => Promise<{ data: T[]; pagination: PaginationMeta }>

  /**
   * Initial data (optional)
   */
  initialData?: T[]

  /**
   * Dependencies array for refetching data (similar to useEffect)
   */
  deps?: any[]

  /**
   * Enable/disable infinite scroll
   */
  enabled?: boolean

  /**
   * Threshold in pixels from bottom to trigger load more
   */
  threshold?: number
}

/**
 * Return type for useInfiniteScroll hook
 */
interface UseInfiniteScrollResult<T> {
  data: T[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  error: Error | null
  loadMore: () => void
  refresh: () => void
  observerRef: (node: HTMLElement | null) => void
}

/**
 * Custom hook for infinite scroll with cursor-based pagination
 *
 * @example
 * ```tsx
 * const { data, isLoading, observerRef, hasMore } = useInfiniteScroll({
 *   fetchFn: async (cursor) => {
 *     const result = await get_documents({ cursor, limit: 25 })
 *     return { data: result.documents, pagination: result.pagination }
 *   }
 * })
 * ```
 */
export function useInfiniteScroll<T>({
  fetchFn,
  initialData = [],
  deps = [],
  enabled = true,
  threshold = 100
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollResult<T> {
  const [data, setData] = useState<T[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)

  const observerTarget = useRef<HTMLElement | null>(null)
  const observer = useRef<IntersectionObserver | null>(null)

  /**
   * Load initial data
   */
  const loadInitialData = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchFn()
      setData(result.data)
      setCursor(result.pagination.next_cursor)
      setHasMore(result.pagination.has_more)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading initial data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn, enabled, ...deps])

  /**
   * Load more data
   */
  const loadMore = useCallback(async () => {
    if (!enabled || isLoadingMore || !hasMore || !cursor) return

    setIsLoadingMore(true)
    setError(null)

    try {
      const result = await fetchFn(cursor)
      setData(prev => [...prev, ...result.data])
      setCursor(result.pagination.next_cursor)
      setHasMore(result.pagination.has_more)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading more data:', err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [fetchFn, cursor, hasMore, isLoadingMore, enabled, ...deps])

  /**
   * Refresh data (reset to page 1)
   */
  const refresh = useCallback(() => {
    setCursor(null)
    setData([])
    setHasMore(true)
    loadInitialData()
  }, [loadInitialData])

  /**
   * Set up intersection observer for infinite scroll
   */
  useEffect(() => {
    if (!enabled) return

    const options = {
      root: null,
      rootMargin: `${threshold}px`,
      threshold: 0.1
    }

    observer.current = new IntersectionObserver((entries) => {
      const target = entries[0]
      if (target.isIntersecting && hasMore && !isLoadingMore) {
        loadMore()
      }
    }, options)

    if (observerTarget.current) {
      observer.current.observe(observerTarget.current)
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect()
      }
    }
  }, [hasMore, isLoadingMore, loadMore, enabled, threshold])

  /**
   * Load initial data on mount or when deps change
   */
  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  /**
   * Ref callback for the observer target element
   */
  const observerRef = useCallback((node: HTMLElement | null) => {
    observerTarget.current = node
  }, [])

  return {
    data,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    loadMore,
    refresh,
    observerRef
  }
}
