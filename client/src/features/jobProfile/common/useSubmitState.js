import { useState } from 'react';
import { describeError } from '../../settings/components/SettingsUi';

// Tracks one save: the button is disabled while it runs, and a failure stays visible inside the dialog.
// On success the caller closes the dialog, so nothing is reset here.
export default function useSubmitState() {
  const [state, setState] = useState({ saving: false, submitError: '' });

  const run = async (task) => {
    setState({ saving: true, submitError: '' });
    try {
      await task();
    } catch (error) {
      setState({ saving: false, submitError: describeError(error) });
    }
  };

  return { ...state, run };
}
