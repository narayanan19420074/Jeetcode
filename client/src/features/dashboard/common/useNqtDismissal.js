import useStoredValue from './useStoredValue';

const NQT_DISMISS_KEY = 'jeetcode.dismissed.nqtCard';

// The NQT card on the phone home can be dismissed for good on this device.
export default function useNqtDismissal() {
  const [flag, storeFlag] = useStoredValue(NQT_DISMISS_KEY);
  return { nqtDismissed: flag === '1', dismissNqt: () => storeFlag('1') };
}
