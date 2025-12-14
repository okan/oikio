import { useState, useCallback } from 'react'
interface AsyncOperationState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}
interface AsyncOperationReturn<T> extends AsyncOperationState<T> {
  execute: (operation: () => Promise<T>) => Promise<T>
  reset: () => void
  setError: (error: string | null) => void
}
export function useAsyncOperation<T = unknown>(): AsyncOperationReturn<T> {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    isLoading: false,
    error: null,
  })
  const execute = useCallback(async (operation: () => Promise<T>): Promise<T> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const result = await operation()
      setState({ data: result, isLoading: false, error: null })
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }))
      throw err
    }
  }, [])
  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null })
  }, [])
  const setError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, error }))
  }, [])
  return {
    ...state,
    execute,
    reset,
    setError,
  }
}
export function useMultipleAsyncOperations() {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const executeAll = useCallback(
    async <T>(operations: (() => Promise<T>)[]): Promise<PromiseSettledResult<T>[]> => {
      setIsLoading(true)
      setErrors([])
      try {
        const results = await Promise.allSettled(operations.map((op) => op()))
        const newErrors = results
          .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
          .map((result) =>
            result.reason instanceof Error ? result.reason.message : 'An error occurred'
          )
        setErrors(newErrors)
        return results
      } finally {
        setIsLoading(false)
      }
    },
    []
  )
  const reset = useCallback(() => {
    setIsLoading(false)
    setErrors([])
  }, [])
  return {
    isLoading,
    errors,
    hasErrors: errors.length > 0,
    executeAll,
    reset,
  }
}
