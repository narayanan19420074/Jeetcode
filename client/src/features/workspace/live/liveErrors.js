import { extractErrorMessage } from '../../../api/apiClient';

const MIC_BLOCKED_MESSAGE = 'Microphone access is blocked. Allow the microphone for this site and try again.';
const MIC_MISSING_MESSAGE = 'No microphone was found on this device.';

// Turns any failure of a live session (permission, network, server) into one message the learner can act on.
export function describeLiveError(error) {
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') return MIC_BLOCKED_MESSAGE;
  if (error?.name === 'NotFoundError') return MIC_MISSING_MESSAGE;
  return extractErrorMessage(error);
}
