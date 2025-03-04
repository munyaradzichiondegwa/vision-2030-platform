import { useState, useEffect } from 'react';

function usePersistentState<T>(
  key: string, 
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // Read from localStorage on initial load
  const [state, setState] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return initialValue;
    }
  });

  // Write to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;