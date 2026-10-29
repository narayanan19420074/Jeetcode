import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  ButtonBase,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  IconButton,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ExitToAppRoundedIcon from '@mui/icons-material/ExitToAppRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { studyPlanApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFF_COLOR, tint } from '../dashboard/dashboardUtils';
import { LIB_TRACKING, LibraryFont, PageHeader, libBackBtnSx, libIconBtnSx, libPanelSx, libSectionTitleSx, libSolidBtnSx, libTintBtnSx, useLibraryPalette } from '../dashboard/components/libraryStyle';
import FriendPicker from './FriendPicker';
import { daysLeftInfo, daysTile, fmtDay, fmtRange, itemLink, localKey, paceLabel, planTheme, relDay, relTime, shareUrl } from './planUtils';

// Phone layout of the Study Plan screens (plans list and open plan) in the Library look
// (same as the phone Home, Problems, Store and Friends pages): Roboto type, warm surface,
// 16px page gutter, centred header tile, cream panels and divider-separated rows.
// Plan card sizes: 20px corner radius, 16px padding, 72px progress disc, 44px action buttons.
// The page itself scrolls and there is no top navigation bar on phones.
// The plan builder keeps its own layout inside the same page padding.

const ACCENT = '#6366F1';

// Each plan keeps its own colour (same stable pick as the wide-screen cards, see planTheme).
const PLAN_ACCENT = { indigo: '#6366F1', teal: '#14B8A6', rose: '#F43F5E', ocean: '#3B82F6', plum: '#A855F7', ember: '#F97316' };
const accentFor = (id) => PLAN_ACCENT[planTheme(id).name] || ACCENT;
const TONE = { info: '#3B82F6', success: 'var(--jc-easy)', warning: 'var(--jc-medium)', error: 'var(--jc-hard)' };

const SHORT_DIFF = { Easy: 'Easy', Medium: 'Med.', Hard: 'Hard' };

const MUTED = 'var(--lib-muted)';
const DIVIDER = 'var(--lib-divider)';

const solidBtn = (c) => ({ ...libSolidBtnSx, bgcolor: c, '&:hover': { bgcolor: `color-mix(in srgb, ${c} 85%, #000)` } });

// 44px round action button. Inside a cream card it sits on the page colour so it stays visible in both modes.
const cardIconSx = { ...libIconBtnSx, width: 44, height: 44, bgcolor: 'var(--lib-bg)', '&:hover': { bgcolor: 'var(--lib-bg)', filter: 'brightness(0.97)' } };
const dangerIconSx = (t) => ({
  ...cardIconSx,
  color: t.palette.error.main,
  bgcolor: tint(t.palette.error.main, 12),
  '&:hover': { bgcolor: tint(t.palette.error.main, 20) },
});

// Page padding shared by every phone Study Plan screen.
export function MobileShell({ children }) {
  return (
    <LibraryFont>
      <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>{children}</Box>
    </LibraryFont>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography component="h2" sx={{ ...libSectionTitleSx, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

// Small label chip. A colour tints it; without one it is neutral.
function Chip({ color, children }) {
  return (
    <Typography
      component="span"
      sx={{
        px: '12px',
        height: 28,
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        letterSpacing: LIB_TRACKING,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
        color: color || 'var(--lib-chip-text)',
        bgcolor: color ? tint(color, 16) : 'var(--lib-bg)',
      }}
    >
      {children}
    </Typography>
  );
}

// Filled progress disc: the coloured sector grows clockwise with the percentage solved.
function PlanDisc({ percent, accent, size = 72 }) {
  const pct = Math.max(0, Math.min(100, Math.round(percent || 0)));
  return (
    <Box
      role="img"
      aria-label={`${pct}% solved`}
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: `conic-gradient(${accent} ${pct}%, ${tint(accent, 18)} 0)`,
      }}
    >
      <Box sx={{ width: size * 0.6, height: size * 0.6, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'var(--lib-bg)' }}>
        <Typography component="span" sx={{ fontSize: size * 0.2, lineHeight: 1, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--lib-text)' }}>
          {pct}%
        </Typography>
      </Box>
    </Box>
  );
}

function Sheet({ open, onClose, title, children }) {
  const pal = useLibraryPalette();
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: '24px 24px 0 0', maxHeight: '90dvh', pb: 'env(safe-area-inset-bottom)', bgcolor: pal.bg, backgroundImage: 'none' } } }}
    >
      <LibraryFont>
        <Box sx={{ px: 2, pt: 1.25, pb: 2 }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography component="h2" sx={{ ...libSectionTitleSx, color: 'var(--lib-text)' }}>
              {title}
            </Typography>
            <IconButton onClick={onClose} aria-label={`Close ${title.toLowerCase()}`} sx={libIconBtnSx}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          {children}
        </Box>
      </LibraryFont>
    </Drawer>
  );
}

function PillTabs({ label, options, value, onChange, accent = ACCENT }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }} role="tablist" aria-label={label}>
      {options.map(([v, text]) => {
        const on = v === value;
        return (
          <ButtonBase
            key={v}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(v)}
            sx={{
              flexShrink: 0,
              height: 34,
              px: '14px',
              borderRadius: 999,
              fontFamily: 'inherit',
              fontSize: 15,
              letterSpacing: LIB_TRACKING,
              whiteSpace: 'nowrap',
              bgcolor: on ? accent : 'var(--lib-chip)',
              color: on ? '#fff' : 'var(--lib-chip-text)',
            }}
          >
            {text}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

// ---------- plans list ----------

function PlanCard({ plan, today, onOpen, onAddFriend, onDelete }) {
  const s = plan.summary;
  const accent = accentFor(plan.id);
  const complete = s.status === 'completed';
  const behind = s.status === 'behind';
  const left = daysLeftInfo(s, today);
  const todayLeft = Math.max(0, s.todayTotal - s.todayDone);
  const leftColor = left.tone === 'primary' ? accent : TONE[left.tone] || accent;

  let message;
  if (complete) message = 'Plan complete. Every question is solved.';
  else if (s.status === 'upcoming') message = `Starts ${fmtDay(s.startDate)}.`;
  else if (s.todayTotal === 0) message = behind ? `${s.overdue} overdue. Catch up today.` : 'Nothing scheduled today.';
  else if (todayLeft === 0) message = "Today's goal is done.";
  else message = `${todayLeft} to solve today${s.overdue ? `, ${s.overdue} overdue` : ''}`;

  const cta = complete ? 'Review' : s.done > 0 ? 'Continue' : 'Start';

  return (
    <Box component="article" sx={{ ...libPanelSx, p: 2 }}>
      <ButtonBase
        onClick={onOpen}
        aria-label={`Open ${plan.title}`}
        sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 2, textAlign: 'left', fontFamily: 'inherit', color: 'var(--lib-text)' }}
      >
        <PlanDisc percent={s.percent} accent={accent} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography component="h3" sx={{ fontSize: 18, lineHeight: '24px', fontWeight: 700, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }}>
            {plan.title}
          </Typography>
          <Typography noWrap sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: MUTED }}>
            {fmtRange(s.startDate, s.endDate)}
          </Typography>
        </Box>
      </ButtonBase>

      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
        <Chip color={leftColor}>{left.text}</Chip>
        <Chip>
          {s.total} {s.total === 1 ? 'Question' : 'Questions'}
        </Chip>
        <Chip>{s.done} Solved</Chip>
        {s.streak > 0 && (
          <Stack direction="row" sx={{ alignItems: 'center' }} aria-label={`${s.streak}-day streak`}>
            <LocalFireDepartmentRoundedIcon sx={{ fontSize: 18, color: 'warning.main' }} />
            <Typography component="span" sx={{ fontSize: 13, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
              {s.streak}d
            </Typography>
          </Stack>
        )}
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1.5 }}>
        <Typography sx={{ minWidth: 0, flex: 1, fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: behind && !complete ? 'var(--jc-hard)' : MUTED }}>{message}</Typography>
        <AvatarGroup max={3} sx={{ flexShrink: 0, '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 11, fontWeight: 700, border: '2px solid', borderColor: 'var(--lib-chip)' } }}>
          {plan.members.map((m) => (
            <Avatar key={m.id} src={m.avatarUrl || undefined} alt={m.name}>
              {m.name?.[0]?.toUpperCase()}
            </Avatar>
          ))}
        </AvatarGroup>
      </Stack>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 2 }}>
        <Button onClick={onOpen} disableElevation variant="contained" startIcon={<PlayArrowRoundedIcon />} sx={{ ...solidBtn(accent), flex: 1, minWidth: 0, height: 44, fontSize: 16 }}>
          {cta}
        </Button>
        <IconButton aria-label={`Add friends to ${plan.title}`} onClick={(e) => onAddFriend(e.currentTarget, plan)} sx={cardIconSx}>
          <PersonAddAlt1RoundedIcon />
        </IconButton>
        <IconButton aria-label={plan.isOwner ? `Delete ${plan.title}` : `Leave ${plan.title}`} onClick={() => onDelete(plan)} sx={dangerIconSx}>
          {plan.isOwner ? <DeleteOutlineRoundedIcon /> : <ExitToAppRoundedIcon />}
        </IconButton>
      </Stack>
    </Box>
  );
}

export function MobilePlans({
  plans,
  friends,
  notes,
  error,
  onDismissError,
  invite,
  joining,
  onAccept,
  onDismissInvite,
  dueToday,
  today,
  onNew,
  onOpenPlan,
  onAddFriend,
  onDelete,
  onFindFriends,
  codeInput,
  setCodeInput,
  codeError,
  onJoinCode,
  onOpenNotes,
}) {
  const [friendsOpen, setFriendsOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const sub =
    plans && plans.length > 0
      ? `${plans.length} plan${plans.length === 1 ? '' : 's'}, ${dueToday > 0 ? `${dueToday} question${dueToday === 1 ? '' : 's'} to solve today` : 'nothing due today'}`
      : 'Schedule questions and study with friends';

  return (
    <>
      {/* Back + friends + notifications */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton component={RouterLink} to="/dashboard" aria-label="Back to dashboard" sx={libBackBtnSx}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <Stack direction="row" sx={{ gap: 1 }}>
          <IconButton onClick={() => setFriendsOpen(true)} aria-label="Friends" aria-haspopup="dialog" sx={libIconBtnSx}>
            <GroupsRoundedIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              setNotesOpen(true);
              onOpenNotes();
            }}
            aria-label={notes.unread > 0 ? `Notifications, ${notes.unread} new` : 'Notifications'}
            aria-haspopup="dialog"
            sx={libIconBtnSx}
          >
            <Badge color="error" badgeContent={notes.unread} max={9}>
              <NotificationsRoundedIcon />
            </Badge>
          </IconButton>
        </Stack>
      </Stack>

      {/* Header */}
      <PageHeader icon={SchoolRoundedIcon} title="Study Plan" subtitle={sub} />
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button onClick={onNew} disableElevation variant="contained" startIcon={<AddRoundedIcon />} sx={libSolidBtnSx}>
          New plan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={onDismissError} sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Invite link */}
      {invite && (
        <Box sx={{ ...libPanelSx, p: 2, mt: 3 }}>
          {invite.error ? (
            <>
              <Typography color="error" sx={{ fontSize: 16 }}>
                {invite.error}
              </Typography>
              <Button onClick={onDismissInvite} fullWidth disableElevation variant="contained" sx={{ ...libTintBtnSx, bgcolor: 'var(--lib-bg)', mt: 1.5 }}>
                Dismiss
              </Button>
            </>
          ) : (
            <>
              <Typography sx={{ fontSize: 14, color: MUTED, letterSpacing: LIB_TRACKING }}>{invite.owner ? `@${invite.owner.handle} invited you to` : 'You are invited to'}</Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 18, lineHeight: '24px', overflowWrap: 'anywhere' }}>{invite.title}</Typography>
              <Typography sx={{ fontSize: 14, color: MUTED, letterSpacing: LIB_TRACKING, mt: 0.5 }}>
                {invite.taskCount} questions, {fmtRange(invite.startDate, invite.endDate)}, {invite.memberCount} member{invite.memberCount === 1 ? '' : 's'}
              </Typography>
              {invite.isFull ? (
                <Typography sx={{ mt: 1.5, fontWeight: 700, color: 'warning.main' }}>This plan is full</Typography>
              ) : (
                <Button onClick={onAccept} disabled={joining} fullWidth disableElevation variant="contained" sx={{ ...libSolidBtnSx, mt: 1.5 }}>
                  {joining ? 'Joining…' : 'Join plan'}
                </Button>
              )}
              <Button onClick={onDismissInvite} disabled={joining} fullWidth sx={{ ...libTintBtnSx, bgcolor: 'transparent', mt: 1 }}>
                Not now
              </Button>
            </>
          )}
        </Box>
      )}

      {/* Plans */}
      <Box component="section" aria-label="Your plans" sx={{ mt: 4 }}>
        {plans && plans.length > 0 && <SectionTitle>Your plans</SectionTitle>}
        {plans === null ? (
          <Stack spacing={1.5}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={214} sx={{ borderRadius: '20px' }} />
            ))}
          </Stack>
        ) : plans.length === 0 ? (
          <Box sx={{ py: 5, px: 2, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 18 }}>No plans yet</Typography>
            <Typography sx={{ fontSize: 16, color: MUTED, mt: 0.5, mb: 2 }}>Pick questions, set a finish date and add friends.</Typography>
            <Button onClick={onNew} disableElevation variant="contained" sx={libTintBtnSx}>
              Create a plan
            </Button>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {plans.map((p) => (
              <PlanCard key={p.id} plan={p} today={today} onOpen={() => onOpenPlan(p.id)} onAddFriend={onAddFriend} onDelete={onDelete} />
            ))}
          </Stack>
        )}
      </Box>

      {/* Friends and invite code */}
      <Sheet open={friendsOpen} onClose={() => setFriendsOpen(false)} title="Friends">
        {friends === null && <Skeleton variant="rounded" height={56} sx={{ borderRadius: '16px' }} />}
        {friends?.length === 0 && (
          <Box sx={{ pb: 1 }}>
            <Typography sx={{ fontSize: 16, color: MUTED }}>No friends yet.</Typography>
            <Button
              onClick={() => {
                setFriendsOpen(false);
                onFindFriends();
              }}
              disableElevation
              variant="contained"
              sx={{ ...libTintBtnSx, mt: 1.5 }}
            >
              Find friends
            </Button>
          </Box>
        )}
        {friends?.map((f) => (
          <Stack key={f.userId} direction="row" sx={{ alignItems: 'center', gap: 1.5, py: 1, borderBottom: `1px solid ${DIVIDER}`, '&:last-of-type': { borderBottom: 'none' } }}>
            <Avatar src={f.avatarUrl || undefined} alt={f.name} sx={{ width: 40, height: 40, fontWeight: 700 }}>
              {f.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: 16, lineHeight: '22px', letterSpacing: LIB_TRACKING }}>
                {f.name}
              </Typography>
              {f.handle && (
                <Typography noWrap sx={{ fontSize: 14, lineHeight: '18px', color: MUTED }}>
                  @{f.handle}
                </Typography>
              )}
            </Box>
          </Stack>
        ))}

        <Typography component="h3" sx={{ ...libSectionTitleSx, mt: 3, mb: 1 }}>
          Join a plan
        </Typography>
        <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Paste an invite link"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onJoinCode()}
            error={Boolean(codeError)}
            helperText={codeError || undefined}
            slotProps={{ htmlInput: { 'aria-label': 'Invite link or code' } }}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: 999, height: 48, bgcolor: 'var(--lib-player)', fontSize: 16, letterSpacing: LIB_TRACKING },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
            }}
          />
          <IconButton
            onClick={() => {
              onJoinCode();
              setFriendsOpen(false);
            }}
            aria-label="Find plan"
            sx={{ ...libIconBtnSx, width: 48, height: 48 }}
          >
            <GroupAddRoundedIcon />
          </IconButton>
        </Stack>
      </Sheet>

      {/* Notifications */}
      <Sheet open={notesOpen} onClose={() => setNotesOpen(false)} title="Notifications">
        {notes.items.length === 0 ? (
          <Typography sx={{ fontSize: 16, color: MUTED, pb: 1 }}>Nothing new.</Typography>
        ) : (
          notes.items.map((n) => (
            <ButtonBase
              key={n.id}
              onClick={() => {
                setNotesOpen(false);
                onOpenPlan(n.plan.id);
              }}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                gap: 1.5,
                px: 1,
                py: 1.25,
                mb: 0.5,
                borderRadius: '16px',
                textAlign: 'left',
                fontFamily: 'inherit',
                color: 'var(--lib-text)',
                bgcolor: n.read ? 'transparent' : 'var(--lib-chip)',
              }}
            >
              <Avatar src={n.actor.avatarUrl || undefined} alt={n.actor.name} sx={{ width: 40, height: 40, fontWeight: 700 }}>
                {n.actor.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: 16, lineHeight: '22px', letterSpacing: LIB_TRACKING }}>
                  <b>{n.actor.name}</b> added you to <b>{n.plan.title}</b>
                </Typography>
                <Typography sx={{ fontSize: 14, color: MUTED, mt: 0.25 }}>{relTime(n.createdAt)}</Typography>
              </Box>
            </ButtonBase>
          ))
        )}
      </Sheet>
    </>
  );
}

// ---------- open plan ----------

function TaskRow({ item, doers, accent }) {
  const link = itemLink(item);
  const interactive = !item.done && Boolean(link);
  const diffColor = DIFF_COLOR[item.difficulty] || 'var(--jc-pending)';

  const body = (
    <>
      {item.done ? (
        <Box sx={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: 'var(--jc-easy)', color: '#fff' }}>
          <CheckRoundedIcon sx={{ fontSize: 18 }} />
        </Box>
      ) : item.overdue ? (
        <ErrorOutlineRoundedIcon aria-label="Overdue" sx={{ fontSize: 28, color: 'var(--jc-hard)', flexShrink: 0 }} />
      ) : (
        <Box aria-hidden sx={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, border: `2px solid ${MUTED}`, opacity: 0.6 }} />
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 16, lineHeight: '22px', letterSpacing: LIB_TRACKING, overflowWrap: 'anywhere', color: item.done ? MUTED : 'var(--lib-text)' }}>{item.title}</Typography>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
          <Chip color={diffColor}>{SHORT_DIFF[item.difficulty] || item.difficulty}</Chip>
          <Typography component="span" sx={{ fontSize: 14, color: MUTED, letterSpacing: LIB_TRACKING }}>
            {item.type === 'problem' ? 'Coding' : 'Aptitude'}
          </Typography>
          {item.overdue && !item.done && (
            <Typography component="span" sx={{ fontSize: 14, fontWeight: 500, color: 'var(--jc-hard)' }}>
              Overdue
            </Typography>
          )}
          {doers.length > 0 && (
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: 10, fontWeight: 700, border: '2px solid', borderColor: 'var(--lib-bg)' } }}>
              {doers.map((m) => (
                <Avatar key={m.userId} src={m.avatarUrl || undefined} alt={m.name}>
                  {m.name?.[0]?.toUpperCase()}
                </Avatar>
              ))}
            </AvatarGroup>
          )}
        </Stack>
      </Box>
      {item.done ? (
        <Chip color="var(--jc-easy)">Solved</Chip>
      ) : interactive ? (
        <Typography component="span" sx={{ flexShrink: 0, px: '14px', height: 34, display: 'inline-flex', alignItems: 'center', borderRadius: 999, fontSize: 15, fontWeight: 500, letterSpacing: LIB_TRACKING, color: '#fff', bgcolor: accent }}>
          Solve
        </Typography>
      ) : null}
    </>
  );

  const rowSx = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 1.5,
    py: 1.5,
    px: 0.5,
    textAlign: 'left',
    fontFamily: 'inherit',
    color: 'inherit',
    borderBottom: `1px solid ${DIVIDER}`,
  };

  return interactive ? (
    <ButtonBase component={RouterLink} to={link} sx={rowSx}>
      {body}
    </ButtonBase>
  ) : (
    <Box sx={rowSx}>{body}</Box>
  );
}

export function MobilePlanWorkspace({ id, friends, onBack, onEdit, onGone, onChanged, onFindFriends, notify }) {
  const today = localKey();
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [panel, setPanel] = useState('questions');
  const [pickerEl, setPickerEl] = useState(null);
  const [confirm, setConfirm] = useState(null); // 'delete' | 'leave' | { remove: member }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await studyPlanApi.get(id);
      setPlan(data.data);
      setError('');
      onChanged?.();
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, [id, onChanged]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Progress comes from real solves, so refresh when the learner comes back from solving something.
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    const timer = setInterval(onVisible, 60000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(timer);
    };
  }, [load]);

  const membersById = useMemo(() => new Map((plan?.members || []).map((m) => [m.userId, m])), [plan]);
  const memberIds = useMemo(() => new Set((plan?.members || []).map((m) => m.userId)), [plan]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(plan.shareCode));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      notify?.('Could not copy. Allow clipboard access and try again.');
    }
  };

  const addFriend = async (f) => {
    try {
      await studyPlanApi.addMember(id, f.userId);
      notify?.(`${f.name} added`);
      await load();
    } catch (err) {
      notify?.(extractErrorMessage(err));
    }
  };

  const runConfirm = async () => {
    setBusy(true);
    try {
      if (confirm === 'delete') {
        await studyPlanApi.remove(id);
        onGone();
        return;
      }
      if (confirm === 'leave') {
        await studyPlanApi.leave(id);
        onGone();
        return;
      }
      await studyPlanApi.removeMember(id, confirm.remove.userId);
      setConfirm(null);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  };

  const backBtn = (
    <IconButton onClick={onBack} aria-label="Back to plans" sx={libBackBtnSx}>
      <ArrowBackRoundedIcon />
    </IconButton>
  );

  if (!plan) {
    return error ? (
      <Box>
        {backBtn}
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      </Box>
    ) : (
      <Box>
        {backBtn}
        <Skeleton variant="rounded" height={150} sx={{ mt: 1, borderRadius: '20px' }} />
        <Skeleton variant="rounded" height={240} sx={{ mt: 1.5, borderRadius: '20px' }} />
      </Box>
    );
  }

  const s = plan.summary;
  const accent = accentFor(plan.id);
  const tile = daysTile(s, today);
  const pace = paceLabel(s.pace);
  const paceColor = s.pace > 0 ? 'var(--jc-easy)' : s.pace < 0 ? 'var(--jc-hard)' : '#64748B';
  const confirmText =
    confirm === 'delete'
      ? 'This removes the plan for everyone. Questions you solved stay solved.'
      : confirm === 'leave'
        ? 'You will be removed from this plan. You can rejoin with the invite link.'
        : confirm
          ? `${confirm.remove.name} will be removed from this plan.`
          : '';
  const confirmTitle = confirm === 'delete' ? 'Delete plan?' : confirm === 'leave' ? 'Leave plan?' : 'Remove member?';

  // Questions grouped by day, in schedule order.
  const days = [];
  plan.items.forEach((it) => {
    const last = days[days.length - 1];
    if (last && last.date === it.date) last.items.push(it);
    else days.push({ date: it.date, items: [it] });
  });

  return (
    <Box>
      {/* Back + actions */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        {backBtn}
        <Stack direction="row" sx={{ gap: 1 }}>
          <IconButton onClick={(e) => setPickerEl(e.currentTarget)} aria-label="Add friends" sx={libIconBtnSx}>
            <PersonAddAlt1RoundedIcon />
          </IconButton>
          <IconButton onClick={copy} aria-label="Copy invite link" sx={libIconBtnSx}>
            {copied ? <CheckRoundedIcon sx={{ color: 'var(--jc-easy)' }} /> : <LinkRoundedIcon />}
          </IconButton>
          {plan.isOwner && (
            <IconButton onClick={() => onEdit(plan)} aria-label="Edit plan" sx={libIconBtnSx}>
              <EditRoundedIcon />
            </IconButton>
          )}
          <IconButton
            onClick={() => setConfirm(plan.isOwner ? 'delete' : 'leave')}
            aria-label={plan.isOwner ? 'Delete plan' : 'Leave plan'}
            sx={(t) => ({ ...libIconBtnSx, color: t.palette.error.main, bgcolor: tint(t.palette.error.main, 12), '&:hover': { bgcolor: tint(t.palette.error.main, 20) } })}
          >
            {plan.isOwner ? <DeleteOutlineRoundedIcon /> : <ExitToAppRoundedIcon />}
          </IconButton>
        </Stack>
      </Stack>

      {/* Header */}
      <PageHeader icon={SchoolRoundedIcon} title={plan.title} subtitle={fmtRange(s.startDate, s.endDate)} />

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Progress */}
      <Box sx={{ ...libPanelSx, p: 2, mt: 3 }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
          <PlanDisc percent={s.percent} accent={accent} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: MUTED }}>Solved</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 26, lineHeight: '32px', fontVariantNumeric: 'tabular-nums' }}>
              {s.done}
              <Box component="span" sx={{ color: MUTED, fontWeight: 400, fontSize: 18 }}>
                /{s.total}
              </Box>
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, color: MUTED }}>{tile.label || 'Status'}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: tile.big.length > 3 ? 20 : 26, lineHeight: '32px', fontVariantNumeric: 'tabular-nums', color: tile.urgent ? 'var(--jc-medium)' : 'var(--lib-text)' }}>{tile.big}</Typography>
          </Box>
        </Stack>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
          <Chip color={accent}>{s.todayTotal > 0 ? `Today ${s.todayDone}/${s.todayTotal}` : 'Nothing today'}</Chip>
          {s.streak > 0 && <Chip color="#F59E0B">{s.streak}-day streak</Chip>}
          {s.status !== 'completed' && s.status !== 'upcoming' && <Chip color={paceColor}>{pace.text}</Chip>}
        </Stack>
      </Box>

      {/* Questions / friends */}
      <Box sx={{ mt: 3 }}>
        <PillTabs
          label="Plan sections"
          accent={accent}
          value={panel}
          onChange={setPanel}
          options={[
            ['questions', `Questions · ${s.total}`],
            ['friends', `Friends · ${plan.members.length}`],
          ]}
        />
      </Box>

      {panel === 'questions' ? (
        <Box sx={{ mt: 1 }}>
          {days.length === 0 && <Typography sx={{ py: 4, textAlign: 'center', fontSize: 16, color: MUTED }}>No questions in this plan.</Typography>}
          {days.map((d) => {
            const doneCount = d.items.filter((i) => i.done).length;
            const all = doneCount === d.items.length;
            return (
              <Box key={d.date} component="section" aria-label={relDay(d.date, today)} sx={{ mt: 2 }}>
                <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography component="h2" sx={{ ...libSectionTitleSx, fontSize: 16, color: d.date === today ? accent : 'var(--lib-text)' }}>
                    {relDay(d.date, today)}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: all ? 'var(--jc-easy)' : MUTED }}>
                    {doneCount}/{d.items.length}
                  </Typography>
                </Stack>
                <Box sx={{ borderTop: `1px solid ${DIVIDER}` }}>
                  {d.items.map((it) => (
                    <TaskRow key={it.id} item={it} accent={accent} doers={it.doneBy.map((u) => membersById.get(u)).filter((m) => m && !m.isMe)} />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Box sx={{ mt: 1, borderTop: `1px solid ${DIVIDER}` }}>
          {plan.members.map((m) => {
            const barColor = m.status === 'completed' ? 'var(--jc-easy)' : m.status === 'behind' ? 'var(--jc-hard)' : accent;
            return (
              <Stack key={m.userId} direction="row" sx={{ alignItems: 'center', gap: 1.5, py: 1.25, px: 0.5, borderBottom: `1px solid ${DIVIDER}` }}>
                <Avatar src={m.avatarUrl || undefined} alt={m.name} sx={{ width: 44, height: 44, fontWeight: 700 }}>
                  {m.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
                    <Typography noWrap sx={{ fontSize: 16, lineHeight: '22px', letterSpacing: LIB_TRACKING }}>
                      {m.isMe ? 'You' : m.name}
                    </Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: 14, fontVariantNumeric: 'tabular-nums', color: MUTED }}>
                      {m.done}/{m.total}
                    </Typography>
                  </Stack>
                  <Box role="progressbar" aria-label={`${m.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={m.percent} sx={{ mt: 0.75, height: 6, borderRadius: 99, bgcolor: tint(barColor, 20), overflow: 'hidden' }}>
                    <Box sx={{ width: `${m.percent}%`, height: '100%', borderRadius: 99, bgcolor: barColor }} />
                  </Box>
                </Box>
                {plan.isOwner && !m.isOwner && (
                  <IconButton onClick={() => setConfirm({ remove: m })} aria-label={`Remove ${m.name}`} sx={{ width: 44, height: 44, color: MUTED }}>
                    <PersonRemoveRoundedIcon />
                  </IconButton>
                )}
              </Stack>
            );
          })}
        </Box>
      )}

      <FriendPicker anchorEl={pickerEl} onClose={() => setPickerEl(null)} friends={friends} memberIds={memberIds} onAdd={addFriend} onFindFriends={onFindFriends} />

      <Dialog open={Boolean(confirm)} onClose={() => !busy && setConfirm(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{confirmTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmText}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm(null)} disabled={busy}>
            Cancel
          </Button>
          <Button color="error" variant="contained" disableElevation onClick={runConfirm} disabled={busy} sx={{ fontWeight: 700 }}>
            {confirm === 'delete' ? 'Delete' : confirm === 'leave' ? 'Leave' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
