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
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
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
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import BackToDashboard from '../../components/BackToDashboard';
import { studyPlanApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';
import { DIFF_COLOR, tint } from '../dashboard/dashboardUtils';
import FriendPicker from './FriendPicker';
import { daysLeftInfo, daysTile, fmtDay, fmtRange, itemLink, localKey, paceLabel, planTheme, relDay, relTime, shareUrl } from './planUtils';

// Phone layout of the Study Plan screens (plans list and open plan). It follows the phone Store,
// Problems and Leaderboard pages: same page padding, 44px icon buttons, centred header, 1.25rem
// section titles, tinted pills and rounded panels. The page itself scrolls and there is no top
// navigation bar on phones. The plan builder keeps its own layout inside the same page padding.

const ACCENT = '#6366F1';

// Each plan keeps its own colour (same stable pick as the wide-screen cards, see planTheme).
const PLAN_ACCENT = { indigo: '#6366F1', teal: '#14B8A6', rose: '#F43F5E', ocean: '#3B82F6', plum: '#A855F7', ember: '#F97316' };
const accentFor = (id) => PLAN_ACCENT[planTheme(id).name] || ACCENT;
const TONE = { info: '#3B82F6', success: 'var(--jc-easy)', warning: 'var(--jc-medium)', error: 'var(--jc-hard)' };

const SHORT_DIFF = { Easy: 'Easy', Medium: 'Med.', Hard: 'Hard' };

const scrollRow = {
  display: 'flex',
  gap: 0.75,
  overflowX: 'auto',
  mx: -1.75,
  px: 1.75,
  pb: 0.5,
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
};

const pillBtn = { height: 44, px: 2.5, borderRadius: 999, fontWeight: 800, fontSize: '0.95rem', textTransform: 'none', whiteSpace: 'nowrap', flexShrink: 0 };
const solidBtn = (c) => ({ ...pillBtn, bgcolor: c, color: '#fff', '&:hover': { bgcolor: `color-mix(in srgb, ${c} 85%, #000)` } });
const tintBtn = (c) => ({ ...pillBtn, bgcolor: tint(c, 20), color: c, '&:hover': { bgcolor: tint(c, 30) } });
const tintIcon = (c) => (t) => ({ width: 44, height: 44, flexShrink: 0, bgcolor: tint(c, t.palette.mode === 'dark' ? 16 : 9), color: c });
const panelSx = (c) => (t) => ({
  p: 1.75,
  borderRadius: '26px',
  background: `linear-gradient(160deg, ${tint(c, t.palette.mode === 'dark' ? 20 : 15)} 0%, ${tint(c, 4)} 62%, transparent 100%)`,
  border: `1px solid ${tint(c, 24)}`,
});

// Page padding shared by every phone Study Plan screen.
export function MobileShell({ children }) {
  return <Box sx={{ px: 1.75, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>{children}</Box>;
}

function SectionTitle({ children }) {
  return (
    <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.01em', mb: 1.5 }}>
      {children}
    </Typography>
  );
}

function Pill({ color, children }) {
  return (
    <Typography component="span" sx={{ px: 1.1, py: 0.35, borderRadius: 99, fontSize: '0.75rem', fontWeight: 800, lineHeight: 1.2, color, bgcolor: tint(color, 16), whiteSpace: 'nowrap' }}>
      {children}
    </Typography>
  );
}

function IconTile({ accent, size = 44, children }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: size > 60 ? '26px' : '15px',
        display: 'grid',
        placeItems: 'center',
        color: '#fff',
        background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 60%, #000))`,
        boxShadow: size > 60 ? `0 14px 26px -12px ${accent}` : `0 8px 18px -8px ${accent}`,
      }}
    >
      {children}
    </Box>
  );
}

function Sheet({ open, onClose, title, children }) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: '24px 24px 0 0', maxHeight: '90dvh', pb: 'env(safe-area-inset-bottom)' } } }}
    >
      <Box sx={{ px: 1.75, pt: 1.25, pb: 2 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
            {title}
          </Typography>
          <IconButton onClick={onClose} aria-label={`Close ${title.toLowerCase()}`} sx={{ width: 44, height: 44 }}>
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        {children}
      </Box>
    </Drawer>
  );
}

function PillTabs({ label, options, value, onChange, accent = ACCENT }) {
  return (
    <Box sx={{ ...scrollRow }} role="tablist" aria-label={label}>
      {options.map(([v, text]) => {
        const on = v === value;
        return (
          <ButtonBase
            key={v}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(v)}
            sx={(t) => ({
              flexShrink: 0,
              height: 40,
              px: 2,
              borderRadius: 999,
              fontFamily: 'inherit',
              fontSize: '0.9rem',
              fontWeight: on ? 800 : 700,
              whiteSpace: 'nowrap',
              color: on ? accent : t.palette.text.secondary,
              bgcolor: on ? tint(accent, 20) : 'transparent',
            })}
          >
            {text}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

// ---------- plans list ----------

function PlanTile({ plan, today, onOpen, onAddFriend, onDelete }) {
  const s = plan.summary;
  const accent = accentFor(plan.id);
  const complete = s.status === 'completed';
  const behind = s.status === 'behind';
  const left = daysLeftInfo(s, today);
  const todayItems = plan.today || [];
  const todayLeft = Math.max(0, s.todayTotal - s.todayDone);

  let message;
  if (complete) message = 'Plan complete. Every question is solved.';
  else if (s.status === 'upcoming') message = `Starts ${fmtDay(s.startDate)}.`;
  else if (s.todayTotal === 0) message = behind ? `${s.overdue} overdue. Catch up today.` : 'Nothing scheduled today.';
  else if (todayLeft === 0) message = "Today's goal is done.";
  else message = `${todayLeft} to solve today${s.overdue ? `, ${s.overdue} overdue` : ''}`;

  const cta = complete ? 'Review plan' : s.done > 0 ? 'Continue plan' : 'Start plan';

  return (
    <Box component="article" sx={panelSx(accent)}>
      <ButtonBase
        onClick={onOpen}
        aria-label={`Open ${plan.title}`}
        sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}
      >
        <IconTile accent={accent}>
          <SchoolRoundedIcon sx={{ fontSize: 24 }} />
        </IconTile>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography component="h3" sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.01em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }}>
            {plan.title}
          </Typography>
          <Typography noWrap variant="caption" color="text.secondary">
            {fmtRange(s.startDate, s.endDate)}
          </Typography>
        </Box>
        <ChevronRightRoundedIcon sx={{ color: 'text.secondary', flexShrink: 0 }} />
      </ButtonBase>

      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
        <Pill color={left.tone === 'primary' ? accent : TONE[left.tone] || accent}>{left.text}</Pill>
        {behind && s.overdue > 0 && <Pill color={TONE.error}>{s.overdue} overdue</Pill>}
        {s.streak > 0 && (
          <Stack direction="row" sx={{ alignItems: 'center' }} aria-label={`${s.streak}-day streak`}>
            <LocalFireDepartmentRoundedIcon sx={{ fontSize: 17, color: 'warning.main' }} />
            <Typography component="span" sx={{ fontSize: '0.8rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}>
              {s.streak}d
            </Typography>
          </Stack>
        )}
        <AvatarGroup max={3} sx={{ ml: 'auto', '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 11, fontWeight: 700, border: '2px solid', borderColor: 'background.paper' } }}>
          {plan.members.map((m) => (
            <Avatar key={m.id} src={m.avatarUrl || undefined} alt={m.name}>
              {m.name?.[0]?.toUpperCase()}
            </Avatar>
          ))}
        </AvatarGroup>
      </Stack>

      <Box sx={{ mt: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 0.75 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', fontVariantNumeric: 'tabular-nums' }}>
            {s.done}
            <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              /{s.total} solved
            </Box>
          </Typography>
          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: accent, fontVariantNumeric: 'tabular-nums' }}>{s.percent}%</Typography>
        </Stack>
        <Box role="progressbar" aria-label="Plan progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.percent} sx={{ height: 8, borderRadius: 99, bgcolor: tint(accent, 20), overflow: 'hidden' }}>
          <Box sx={{ width: `${Math.max(s.percent, 3)}%`, height: '100%', borderRadius: 99, bgcolor: accent, transition: 'width .5s' }} />
        </Box>
      </Box>

      <Typography sx={{ mt: 1.5, fontSize: '0.9rem', fontWeight: 700 }}>{message}</Typography>
      {!complete &&
        todayItems.slice(0, 3).map((it) => (
          <Typography key={it.id} noWrap color="text.secondary" sx={{ fontSize: '0.85rem', mt: 0.3, textDecoration: it.done ? 'line-through' : 'none' }}>
            {it.done ? 'Done: ' : it.overdue ? 'Overdue: ' : ''}
            {it.title}
          </Typography>
        ))}
      {!complete && todayItems.length > 3 && (
        <Typography color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.3 }}>
          +{todayItems.length - 3} more
        </Typography>
      )}

      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 1.75 }}>
        <Button onClick={onOpen} fullWidth disableElevation variant="contained" startIcon={<PlayArrowRoundedIcon />} sx={{ ...solidBtn(accent), flex: 1, height: 48 }}>
          {cta}
        </Button>
        <IconButton aria-label={`Add friends to ${plan.title}`} onClick={(e) => onAddFriend(e.currentTarget, plan)} sx={tintIcon(accent)}>
          <PersonAddRoundedIcon />
        </IconButton>
        <IconButton aria-label={plan.isOwner ? `Delete ${plan.title}` : `Leave ${plan.title}`} onClick={() => onDelete(plan)} sx={tintIcon('#E11D48')}>
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
        <BackToDashboard sx={{ width: 44, height: 44, border: 'none', bgcolor: 'transparent' }} />
        <Stack direction="row" sx={{ gap: 0.75 }}>
          <IconButton onClick={() => setFriendsOpen(true)} aria-label="Friends" aria-haspopup="dialog" sx={tintIcon(ACCENT)}>
            <GroupsRoundedIcon />
          </IconButton>
          <IconButton
            onClick={() => {
              setNotesOpen(true);
              onOpenNotes();
            }}
            aria-label={notes.unread > 0 ? `Notifications, ${notes.unread} new` : 'Notifications'}
            aria-haspopup="dialog"
            sx={tintIcon(ACCENT)}
          >
            <Badge color="error" badgeContent={notes.unread} max={9}>
              <NotificationsRoundedIcon />
            </Badge>
          </IconButton>
        </Stack>
      </Stack>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconTile accent={ACCENT} size={84}>
            <SchoolRoundedIcon sx={{ fontSize: 44 }} />
          </IconTile>
        </Box>
        <Typography component="h1" noWrap sx={{ mt: 1.75, fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          Study Plan
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1rem', mt: 0.25 }}>
          {sub}
        </Typography>
        <Button onClick={onNew} disableElevation variant="contained" startIcon={<AddRoundedIcon />} sx={{ ...solidBtn(ACCENT), height: 48, px: 3.5, mt: 2 }}>
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
        <Box sx={(t) => ({ ...panelSx(invite.error ? '#E11D48' : ACCENT)(t), mt: 2.5 })}>
          {invite.error ? (
            <>
              <Typography color="error" sx={{ fontSize: '0.95rem' }}>
                {invite.error}
              </Typography>
              <Button onClick={onDismissInvite} fullWidth disableElevation variant="contained" sx={{ ...tintBtn('#E11D48'), mt: 1.5, height: 48 }}>
                Dismiss
              </Button>
            </>
          ) : (
            <>
              <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                {invite.owner ? `@${invite.owner.handle} invited you to` : 'You are invited to'}
              </Typography>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.2, letterSpacing: '-0.01em', overflowWrap: 'anywhere' }}>{invite.title}</Typography>
              <Typography color="text.secondary" sx={{ fontSize: '0.85rem', mt: 0.4 }}>
                {invite.taskCount} questions, {fmtRange(invite.startDate, invite.endDate)}, {invite.memberCount} member{invite.memberCount === 1 ? '' : 's'}
              </Typography>
              {invite.isFull ? (
                <Typography sx={{ mt: 1.5, fontWeight: 800, color: 'warning.main' }}>This plan is full</Typography>
              ) : (
                <Button onClick={onAccept} disabled={joining} fullWidth disableElevation variant="contained" sx={{ ...solidBtn(ACCENT), mt: 1.5, height: 48 }}>
                  {joining ? 'Joining…' : 'Join plan'}
                </Button>
              )}
              <Button onClick={onDismissInvite} disabled={joining} fullWidth sx={{ ...tintBtn(ACCENT), mt: 1, height: 44, bgcolor: 'transparent' }}>
                Not now
              </Button>
            </>
          )}
        </Box>
      )}

      {/* Plans */}
      <Box component="section" aria-label="Your plans" sx={{ mt: 3.5 }}>
        {plans && plans.length > 0 && <SectionTitle>Your plans</SectionTitle>}
        {plans === null ? (
          <Stack spacing={1.5}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} variant="rounded" height={250} sx={{ borderRadius: '26px' }} />
            ))}
          </Stack>
        ) : plans.length === 0 ? (
          <Box sx={{ py: 5, px: 2, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 800 }}>No plans yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              Pick questions, set a finish date and add friends.
            </Typography>
            <Button variant="outlined" onClick={onNew} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
              Create a plan
            </Button>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {plans.map((p) => (
              <PlanTile key={p.id} plan={p} today={today} onOpen={() => onOpenPlan(p.id)} onAddFriend={onAddFriend} onDelete={onDelete} />
            ))}
          </Stack>
        )}
      </Box>

      {/* Friends and invite code */}
      <Sheet open={friendsOpen} onClose={() => setFriendsOpen(false)} title="Friends">
        {friends === null && <Skeleton variant="rounded" height={56} sx={{ borderRadius: '16px' }} />}
        {friends?.length === 0 && (
          <Box sx={{ pb: 1 }}>
            <Typography color="text.secondary" sx={{ fontSize: '0.95rem' }}>
              No friends yet.
            </Typography>
            <Button
              onClick={() => {
                setFriendsOpen(false);
                onFindFriends();
              }}
              disableElevation
              variant="contained"
              sx={{ ...tintBtn(ACCENT), mt: 1.25, height: 44 }}
            >
              Find friends
            </Button>
          </Box>
        )}
        {friends?.map((f) => (
          <Stack key={f.userId} direction="row" sx={{ alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}>
            <Avatar src={f.avatarUrl || undefined} alt={f.name} sx={{ width: 40, height: 40, fontWeight: 800 }}>
              {f.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>
                {f.name}
              </Typography>
              {f.handle && (
                <Typography noWrap color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                  @{f.handle}
                </Typography>
              )}
            </Box>
          </Stack>
        ))}

        <Typography component="h3" sx={{ fontWeight: 800, fontSize: '1rem', mt: 2.5, mb: 1 }}>
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
            sx={(t) => ({
              '& .MuiOutlinedInput-root': { borderRadius: 999, height: 48, bgcolor: tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9) },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
            })}
          />
          <IconButton
            onClick={() => {
              onJoinCode();
              setFriendsOpen(false);
            }}
            aria-label="Find plan"
            sx={{ ...tintIcon(ACCENT), width: 48, height: 48 }}
          >
            <GroupAddRoundedIcon />
          </IconButton>
        </Stack>
      </Sheet>

      {/* Notifications */}
      <Sheet open={notesOpen} onClose={() => setNotesOpen(false)} title="Notifications">
        {notes.items.length === 0 ? (
          <Typography color="text.secondary" sx={{ fontSize: '0.95rem', pb: 1 }}>
            Nothing new.
          </Typography>
        ) : (
          notes.items.map((n) => (
            <ButtonBase
              key={n.id}
              onClick={() => {
                setNotesOpen(false);
                onOpenPlan(n.plan.id);
              }}
              sx={(t) => ({
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
                color: 'inherit',
                bgcolor: n.read ? 'transparent' : tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9),
              })}
            >
              <Avatar src={n.actor.avatarUrl || undefined} alt={n.actor.name} sx={{ width: 40, height: 40, fontWeight: 800 }}>
                {n.actor.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontSize: '0.95rem', lineHeight: 1.35 }}>
                  <b>{n.actor.name}</b> added you to <b>{n.plan.title}</b>
                </Typography>
                <Typography color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.25 }}>
                  {relTime(n.createdAt)}
                </Typography>
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
        <Box aria-hidden sx={(t) => ({ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, border: `2px solid ${t.palette.text.disabled}` })} />
      )}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.35, overflowWrap: 'anywhere', color: item.done ? 'text.secondary' : 'text.primary' }}>{item.title}</Typography>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
          <Pill color={diffColor}>{SHORT_DIFF[item.difficulty] || item.difficulty}</Pill>
          <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>
            {item.type === 'problem' ? 'Coding' : 'Aptitude'}
          </Typography>
          {item.overdue && !item.done && <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--jc-hard)' }}>Overdue</Typography>}
          {doers.length > 0 && (
            <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 20, height: 20, fontSize: 10, fontWeight: 700, border: '2px solid', borderColor: 'background.paper' } }}>
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
        <Pill color="var(--jc-easy)">Solved</Pill>
      ) : interactive ? (
        <Typography component="span" sx={{ flexShrink: 0, px: 1.75, py: 0.8, borderRadius: 999, fontSize: '0.85rem', fontWeight: 800, color: accent, bgcolor: tint(accent, 20) }}>
          Solve
        </Typography>
      ) : null}
    </>
  );

  const rowSx = (t) => ({
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
    borderBottom: `1px solid ${t.palette.divider}`,
  });

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
    <IconButton onClick={onBack} aria-label="Back to plans" sx={{ width: 44, height: 44 }}>
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
        <Skeleton variant="rounded" height={170} sx={{ mt: 1, borderRadius: '26px' }} />
        <Skeleton variant="rounded" height={260} sx={{ mt: 1.5, borderRadius: '26px' }} />
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
        <Stack direction="row" sx={{ gap: 0.75 }}>
          <IconButton onClick={(e) => setPickerEl(e.currentTarget)} aria-label="Add friends" sx={tintIcon(accent)}>
            <PersonAddRoundedIcon />
          </IconButton>
          <IconButton onClick={copy} aria-label="Copy invite link" sx={tintIcon(copied ? '#16A34A' : accent)}>
            {copied ? <CheckRoundedIcon /> : <LinkRoundedIcon />}
          </IconButton>
          {plan.isOwner && (
            <IconButton onClick={() => onEdit(plan)} aria-label="Edit plan" sx={tintIcon(accent)}>
              <EditRoundedIcon />
            </IconButton>
          )}
          <IconButton onClick={() => setConfirm(plan.isOwner ? 'delete' : 'leave')} aria-label={plan.isOwner ? 'Delete plan' : 'Leave plan'} sx={tintIcon('#E11D48')}>
            {plan.isOwner ? <DeleteOutlineRoundedIcon /> : <ExitToAppRoundedIcon />}
          </IconButton>
        </Stack>
      </Stack>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IconTile accent={accent} size={84}>
            <SchoolRoundedIcon sx={{ fontSize: 44 }} />
          </IconTile>
        </Box>
        <Typography component="h1" sx={{ mt: 1.75, fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.15, letterSpacing: '-0.01em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }}>
          {plan.title}
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1rem', mt: 0.25 }}>
          {fmtRange(s.startDate, s.endDate)}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Progress */}
      <Box sx={(t) => ({ ...panelSx(accent)(t), mt: 2.5 })}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>
              Solved
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.15, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
              {s.done}
              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '1.25rem' }}>
                /{s.total}
              </Box>
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right', minWidth: 0 }}>
            <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>
              {tile.label || 'Status'}
            </Typography>
            <Typography sx={{ fontWeight: 800, fontSize: tile.big.length > 3 ? '1.5rem' : '1.9rem', lineHeight: 1.15, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', color: tile.urgent ? 'var(--jc-medium)' : 'text.primary' }}>{tile.big}</Typography>
          </Box>
        </Stack>
        <Box role="progressbar" aria-label="Plan progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.percent} sx={{ mt: 1.5, height: 8, borderRadius: 99, bgcolor: tint(accent, 20), overflow: 'hidden' }}>
          <Box sx={{ width: `${Math.max(s.percent, 3)}%`, height: '100%', borderRadius: 99, bgcolor: accent, transition: 'width .5s' }} />
        </Box>
        <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
          <Pill color={accent}>{s.percent}%</Pill>
          <Pill color={accent}>{s.todayTotal > 0 ? `Today ${s.todayDone}/${s.todayTotal}` : 'Nothing today'}</Pill>
          {s.streak > 0 && <Pill color="#F59E0B">{s.streak}-day streak</Pill>}
          {s.status !== 'completed' && s.status !== 'upcoming' && <Pill color={paceColor}>{pace.text}</Pill>}
        </Stack>
      </Box>

      {/* Questions / friends */}
      <Box sx={{ mt: 2.5 }}>
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
          {days.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No questions in this plan.
            </Typography>
          )}
          {days.map((d) => {
            const doneCount = d.items.filter((i) => i.done).length;
            const all = doneCount === d.items.length;
            return (
              <Box key={d.date} component="section" aria-label={relDay(d.date, today)} sx={{ mt: 2 }}>
                <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography component="h2" sx={{ fontWeight: 800, fontSize: '1.05rem', color: d.date === today ? accent : 'text.primary' }}>
                    {relDay(d.date, today)}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums', color: all ? 'var(--jc-easy)' : 'text.secondary' }}>
                    {doneCount}/{d.items.length}
                  </Typography>
                </Stack>
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                  {d.items.map((it) => (
                    <TaskRow key={it.id} item={it} accent={accent} doers={it.doneBy.map((u) => membersById.get(u)).filter((m) => m && !m.isMe)} />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      ) : (
        <Box sx={{ mt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
          {plan.members.map((m) => {
            const barColor = m.status === 'completed' ? 'var(--jc-easy)' : m.status === 'behind' ? 'var(--jc-hard)' : accent;
            return (
              <Stack key={m.userId} direction="row" sx={{ alignItems: 'center', gap: 1.5, py: 1.25, px: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Avatar src={m.avatarUrl || undefined} alt={m.name} sx={{ width: 44, height: 44, fontWeight: 800 }}>
                  {m.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
                    <Typography noWrap sx={{ fontWeight: 700, fontSize: '1rem' }}>
                      {m.isMe ? 'You' : m.name}
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>
                      {m.done}/{m.total}
                    </Typography>
                  </Stack>
                  <Box role="progressbar" aria-label={`${m.name} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={m.percent} sx={{ mt: 0.75, height: 6, borderRadius: 99, bgcolor: tint(barColor, 20), overflow: 'hidden' }}>
                    <Box sx={{ width: `${m.percent}%`, height: '100%', borderRadius: 99, bgcolor: barColor }} />
                  </Box>
                </Box>
                {plan.isOwner && !m.isOwner && (
                  <IconButton onClick={() => setConfirm({ remove: m })} aria-label={`Remove ${m.name}`} sx={{ width: 44, height: 44 }}>
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
