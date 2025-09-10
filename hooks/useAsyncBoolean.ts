import { useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage-backed boolean state hook
export function useAsyncBoolean(key: string, defaultValue = false): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState<boolean>(defaultValue);

  useEffect(() => {
    // Load the value from AsyncStorage on mount
    const fetchData = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (storedValue !== null) {
          setValue(storedValue === 'true');
        } else {
          setValue(defaultValue); // Use default value if nothing is found in AsyncStorage
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage', error);
        setValue(defaultValue); // Fallback to default if an error occurs
      }
    };

    fetchData();
  }, [key, defaultValue]);

  const set = useCallback((v: boolean) => {
    setValue(v); // Update local state
    AsyncStorage.setItem(key, v ? 'true' : 'false'); // Persist state in AsyncStorage
  }, [key]);

  return [value, set];
}
