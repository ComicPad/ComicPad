import { useState, useCallback } from 'react';

/**
 * Custom hook to manage loading states
 * @param {boolean} initialState - Initial loading state
 * @returns {Object} Loading state and handlers
 */
export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState(null);

  const startLoading = useCallback((message = '') => {
    setIsLoading(true);
    setLoadingMessage(message);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  const setLoadingError = useCallback((error) => {
    setError(error);
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
    setError(null);
  }, []);

  return {
    isLoading,
    loadingMessage,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    reset
  };
};

/**
 * Custom hook to wrap async functions with loading state
 * @param {Function} asyncFunction - The async function to wrap
 * @returns {Object} Wrapped function and loading state
 */
export const useAsyncAction = (asyncFunction) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    execute,
    isLoading,
    error,
    data,
    reset
  };
};

/**
 * Custom hook to manage multiple loading states
 * Useful when you have multiple async operations on a single page
 */
export const useMultipleLoading = () => {
  const [loadingStates, setLoadingStates] = useState({});

  const setLoading = useCallback((key, value) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(state => state === true);
  }, [loadingStates]);

  const isLoading = useCallback((key) => {
    return loadingStates[key] === true;
  }, [loadingStates]);

  const reset = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    loadingStates,
    reset
  };
};

export default useLoading;
