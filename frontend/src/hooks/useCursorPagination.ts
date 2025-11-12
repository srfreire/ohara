import { useState, useCallback } from 'react'
import type { PaginationMeta } from '../types/api'

/**
 * Options for useCursorPagination hook
 */
interface UseCursorPaginationOptions<T> {
  /**
   * Function to fetch data with cursor pagination
   */
  fetchFn: (cursor?: string) => Promise<{ data: T[]; pagination: PaginationMeta }>

  /**
   * Initial data (optional)
   */
  initialData?: T[]
}

/**
 * Return type for useCursorPagination hook
 */
interface UseCursorPaginationResult<T> {
  data: T[]
  isLoading: boolean
  hasMore: boolean
  error: Error | null
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  pagination: PaginationMeta | null
}

/**
 * Custom hook for cursor-based pagination (without infinite scroll)
 * Use this when you want manual "Load More" buttons instead of automatic infinite scroll
 *
 * @example
 * ```tsx
 * const { data, isLoading, loadMore, hasMore } = useCursorPagination({
 *   fetchFn: async (cursor) => {
 *     const result = await get_comments({ cursor, limit: 25, documentId: docId })
 *     return { data: result.comments, pagination: result.pagination }
 *   }
 * })
 *
 * // In your JSX:
 * {hasMore && <button onClick={loadMore}>Load More</button>}
 * ```
 */
export function useCursorPagination<T>({
  fetchFn,
  initialData = []
}: UseCursorPaginationOptions<T>): UseCursorPaginationResult<T> {
  const [data, setData] = useState<T[]>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)

  /**
   * Load more data with next cursor
   */
  const loadMore = useCallback(async () => {
    if (isLoading || !pagination?.has_more) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await fetchFn(pagination.next_cursor || undefined)
      setData(prev => [...prev, ...result.data])
      setPagination(result.pagination)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading more data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn, pagination, isLoading])

  /**
   * Refresh data (reset to first page)
   */
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setData([])

    try {
      const result = await fetchFn()
      setData(result.data)
      setPagination(result.pagination)
    } catch (err) {
      setError(err as Error)
      console.error('Error refreshing data:', err)
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn])

  return {
    data,
    isLoading,
    hasMore: pagination?.has_more ?? false,
    error,
    loadMore,
    refresh,
    pagination
  }
}
