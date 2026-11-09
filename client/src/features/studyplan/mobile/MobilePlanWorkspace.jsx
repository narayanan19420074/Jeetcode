import { useState } from 'react';
import { Alert, Box, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { tint } from '../../dashboard/dashboardUtils';
import { PageHeader, libBackBtnSx, libIconBtnSx } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, RADII_PX } from '../../../app/design/designTokens';
import FriendPicker from '../FriendPicker';
import PlanConfirmDialog from '../common/PlanConfirmDialog';
import { usePlanWorkspace } from '../common/usePlanWorkspace';
import { MUTED, accentFor } from './mobileStyle';
import { PillTabs } from './MobileUi';
import QuestionRow from './QuestionRow';
import MobileMembersGrid from './MobileMembersGrid';

// Back arrow, add-friend, copy-link, edit and delete / leave buttons of an open plan.
function WorkspaceActions({ plan, copied, onBack, onAddFriends, onCopy, onEdit, onDeleteOrLeave }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <IconButton onClick={onBack} aria-label="Back to plans" sx={libBackBtnSx}>
        <ArrowBackRoundedIcon />
      </IconButton>
      <Stack direction="row" sx={{ gap: 1 }}>
        <IconButton onClick={(e) => onAddFriends(e.currentTarget)} aria-label="Add friends" sx={libIconBtnSx}>
          <PersonAddAlt1RoundedIcon />
        </IconButton>
        <IconButton onClick={onCopy} aria-label="Copy invite link" sx={libIconBtnSx}>
          {copied ? <CheckRoundedIcon sx={{ color: 'var(--jc-easy)' }} /> : <LinkRoundedIcon />}
        </IconButton>
        {plan.isOwner && (
          <IconButton onClick={onEdit} aria-label="Edit plan" sx={libIconBtnSx}>
            <EditRoundedIcon />
          </IconButton>
        )}
        <IconButton
          onClick={onDeleteOrLeave}
          aria-label={plan.isOwner ? 'Delete plan' : 'Leave plan'}
          sx={(t) => ({ ...libIconBtnSx, color: t.palette.error.main, bgcolor: tint(t.palette.error.main, 12), '&:hover': { bgcolor: tint(t.palette.error.main, 20) } })}
        >
          {plan.isOwner ? <DeleteOutlineRoundedIcon /> : <ExitToAppRoundedIcon />}
        </IconButton>
      </Stack>
    </Stack>
  );
}

// Loading skeleton or load error, before the plan arrives.
function WorkspacePlaceholder({ error, onBack }) {
  return (
    <Box>
      <IconButton onClick={onBack} aria-label="Back to plans" sx={libBackBtnSx}>
        <ArrowBackRoundedIcon />
      </IconButton>
      {error ? (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Skeleton variant="rounded" height={150} sx={{ mt: 1, borderRadius: RADII_PX.card }} />
          <Skeleton variant="rounded" height={240} sx={{ mt: 1.5, borderRadius: RADII_PX.card }} />
        </>
      )}
    </Box>
  );
}

// Questions tab: every question with the friends who already solved it.
function QuestionsPanel({ plan, membersById }) {
  return (
    <Box sx={{ mt: 1 }} role="tabpanel" aria-label="Questions">
      {plan.items.length === 0 && <Typography sx={{ py: 4, textAlign: 'center', fontSize: FONT_SIZES.title, color: MUTED }}>No questions in this plan.</Typography>}
      {plan.items.map((it, i) => (
        <QuestionRow key={it.id} item={it} index={i + 1} doers={it.doneBy.map((u) => membersById.get(u)).filter((m) => m && !m.isMe)} />
      ))}
    </Box>
  );
}

export function MobilePlanWorkspace({ id, friends, onBack, onEdit, onGone, onChanged, onFindFriends, notify }) {
  const { plan, error, setError, copied, copy, confirm, setConfirm, busy, membersById, memberIds, addFriend, runConfirm } = usePlanWorkspace({ id, onChanged, onGone, notify });
  const [panel, setPanel] = useState('questions');
  const [pickerEl, setPickerEl] = useState(null);

  if (!plan) return <WorkspacePlaceholder error={error} onBack={onBack} />;

  return (
    <Box>
      <WorkspaceActions
        plan={plan} copied={copied} onBack={onBack} onAddFriends={setPickerEl} onCopy={copy}
        onEdit={() => onEdit(plan)} onDeleteOrLeave={() => setConfirm(plan.isOwner ? 'delete' : 'leave')}
      />

      <PageHeader icon={SchoolRoundedIcon} title={plan.title} />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mt: 3 }}>
        <PillTabs
          label="Plan sections"
          accent={accentFor(plan.id)}
          value={panel}
          onChange={setPanel}
          options={[
            ['questions', `Questions · ${plan.summary.total}`],
            ['friends', `Friends · ${plan.members.length}`],
          ]}
        />
      </Box>

      {panel === 'questions' ? (
        <QuestionsPanel plan={plan} membersById={membersById} />
      ) : (
        <MobileMembersGrid plan={plan} accent={accentFor(plan.id)} onRemoveMember={(member) => setConfirm({ remove: member })} />
      )}

      <FriendPicker anchorEl={pickerEl} onClose={() => setPickerEl(null)} friends={friends} memberIds={memberIds} onAdd={addFriend} onFindFriends={onFindFriends} />
      <PlanConfirmDialog confirm={confirm} busy={busy} onClose={() => setConfirm(null)} onConfirm={runConfirm} />
    </Box>
  );
}
