import { useState, useCallback } from 'react';

export function useAsync<T, E = Error>() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<E | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (asyncFunction: () => Promise<T>) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (e) {
      const error = e as E;
      console.error('Async operation failed:', error);
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, error, data, execute };
}
