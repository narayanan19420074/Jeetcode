import { useCallback, useState } from 'react';

const readStoredValue = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStoredValue = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable (private mode): the card simply stays hidden until reload.
  }
};

// A value remembered on this device, used for the cards a person dismissed.
export default function useStoredValue(key) {
  const [value, setValue] = useState(() => readStoredValue(key));
  const store = useCallback(
    (next) => {
      writeStoredValue(key, next);
      setValue(next);
    },
    [key]
  );
  return [value, store];
}
