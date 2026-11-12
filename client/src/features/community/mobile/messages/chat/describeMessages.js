import { dayLabel } from '../../../../friends/friendsUi';

// Decides how each message is drawn. A new day gets a date divider. Text messages from the same person in a row form
// one run that shares a single avatar, name and time (as in LinkedIn), so only its first message shows them.
export default function describeMessages(messages) {
  let previousDay = '';
  return messages.map((message, index) => {
    const day = dayLabel(message.createdAt);
    const startsDay = day !== previousDay;
    previousDay = day;
    const previous = messages[index - 1];
    const continuesRun = !startsDay && previous?.from === message.from && previous.kind === 'text' && message.kind === 'text';
    return { message, day, startsDay, continuesRun };
  });
}
