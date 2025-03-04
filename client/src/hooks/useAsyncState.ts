import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

function useAsyncState<T>(
  asyncFunction: () => Promise<T>,
  initialData: T | null = null
) {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      const result = await asyncFunction();
      setState({
        data: result,
        loading: false,
        error: null
      });
      return result;
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error : new Error(String(error))
      });
      throw error;
    }
  }, [asyncFunction]);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null
    });
  }, [initialData]);

  return {
    ...state,
    execute,
    reset
  };
}

export default useAsyncState;