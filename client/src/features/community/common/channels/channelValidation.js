import { CHANNEL_NAME_MIN } from './channelKinds';

// The server enforces the same limits; checking here only saves a round trip.
export const validateChannelDraft = ({ name }) =>
  name.trim().length < CHANNEL_NAME_MIN ? `Enter a name of at least ${CHANNEL_NAME_MIN} characters.` : '';
