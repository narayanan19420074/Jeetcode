import { useCallback, useState } from 'react';

// Phone workspace: show or hide the tags (difficulty, topics, companies) under the problem name
// and inside the problem sheet. Remembered on this device.
const KEY = 'jeetcode-workspace-tags';

const read = () => {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
};

export default function useChipsPref() {
  const [show, setShow] = useState(read);
  const toggle = useCallback(() => {
    const next = !show;
    setShow(next);
    try {
      localStorage.setItem(KEY, next ? 'on' : 'off');
    } catch {
      // Storage unavailable: the choice still applies until the page reloads.
    }
  }, [show]);
  return [show, toggle];
}
