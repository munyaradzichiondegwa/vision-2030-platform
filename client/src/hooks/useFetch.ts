import { useState, useEffect } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { handleError } from '../utils/errorHandler';

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useFetch = <T = any>(
  url: string, 
  config?: AxiosRequestConfig
): UseFetchReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response: AxiosResponse<T> = await axios.get(url, config);
      setData(response.data);
    } catch (err) {
      const processedError = handleError(err);
      setError(processedError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};