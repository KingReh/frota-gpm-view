import { useState, useEffect, useCallback } from 'react';

// Custom event to sync state across hook instances
const LOCAL_STORAGE_EVENT = 'local-storage-update';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Read initial value
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch custom event to notify other instances
        window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_EVENT, { detail: { key, value: valueToStore } }));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    const handleStorageChange = (e: any) => {
      // Handle native storage event (cross-tab) or custom event (same-tab)
      if (
        (e.type === 'storage' && e.key === key) ||
        (e.type === LOCAL_STORAGE_EVENT && e.detail.key === key)
      ) {
        setStoredValue(readValue());
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener(LOCAL_STORAGE_EVENT, handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener(LOCAL_STORAGE_EVENT, handleStorageChange);
      };
    }
  }, [key, readValue]);

  return [storedValue, setValue];
}
