import { Box, Stack, Typography } from '@mui/material';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../../../app/design/designTokens';
import { LIB_ACCENT, LIB_TRACKING } from '../../../../dashboard/components/libraryStyle';
import { PersonAvatar } from '../../../../friends/friendsUi';
import { LibNudgeLine } from '../../../../friends/chat/ChatBubbles';
import { clock } from '../../../../friends/chat/chatShared';
import PairRoomInvitationCard from './PairRoomInvitationCard';

function SentTick({ isSeen }) {
  const Tick = isSeen ? DoneAllRoundedIcon : DoneRoundedIcon;
  return <Tick aria-label={isSeen ? 'Seen' : 'Sent'} sx={{ alignSelf: 'flex-end', flexShrink: 0, fontSize: FONT_SIZES.title, color: isSeen ? LIB_ACCENT : 'var(--lib-muted)' }} />;
}

function SenderHeading({ name, sentAt }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1 }}>
      <Typography noWrap sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING, fontWeight: FONT_WEIGHTS.bold }}>{name}</Typography>
      <Typography sx={{ flexShrink: 0, fontSize: FONT_SIZES.body, color: 'var(--lib-muted)' }}>· {clock(sentAt)}</Typography>
    </Stack>
  );
}

function MessageContent({ message, isMine, friend }) {
  if (message.kind === 'room') return <PairRoomInvitationCard message={message} isMine={isMine} friend={friend} />;
  if (message.kind === 'nudge') return <Box sx={{ display: 'flex', flexDirection: 'column' }}><LibNudgeLine m={message} mine={isMine} friend={friend} /></Box>;
  return <Typography sx={{ fontSize: FONT_SIZES.title, lineHeight: '24px', letterSpacing: LIB_TRACKING, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message.text}</Typography>;
}

// One message in the LinkedIn layout: the sender's photo, name and time on the first message of a run, then the text.
// Pair room invitations and streak nudges are shown as cards in the same column.
export default function ChatMessageRow({ item, friend, me }) {
  const { message, continuesRun } = item;
  const isMine = message.from === me?.id;
  const sender = isMine ? me : friend;
  return (
    <Stack direction="row" sx={{ gap: 1.5, mt: continuesRun ? 0.5 : 2 }}>
      <Box sx={{ width: SIZES.avatar.md, flexShrink: 0 }}>{!continuesRun && <PersonAvatar person={sender} size={SIZES.avatar.md} />}</Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        {!continuesRun && <SenderHeading name={sender.name} sentAt={message.createdAt} />}
        <MessageContent message={message} isMine={isMine} friend={friend} />
      </Box>
      {isMine && message.kind === 'text' && <SentTick isSeen={Boolean(message.readAt)} />}
    </Stack>
  );
}
