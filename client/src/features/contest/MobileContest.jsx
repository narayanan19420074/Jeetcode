import { useRef, useState } from 'react';
import { Alert, Box, Button, ButtonBase, Checkbox, FormControlLabel, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Link as RouterLink } from 'react-router-dom';
import { tint } from '../dashboard/dashboardUtils';
import {
  LIB_ACCENT,
  LIB_TRACKING,
  LibraryFont,
  PageHeader,
  libBackBtnSx,
  libChipSx,
  libSectionTitleSx,
  libSolidBtnSx,
  libTintBtnSx,
} from '../dashboard/components/libraryStyle';
import { fmtDate, fmtDuration, fmtStart, inr, useCountdown } from './contestUtils';

// Phone layout of the Contest page in the Library look (same as the phone Problems, Home and You pages): Roboto type,
// warm surface, 16px page padding, 44px back button, centred header tile, pill tabs and buttons, 18px section titles
// and divider-separated rows.
// Two screens: the list (upcoming / past with winners) and the contest details (rules and apply).
// There is no top navigation bar on phones, and the 3D podium is replaced by a plain top 10 list.

const ACCENT = LIB_ACCENT;
const ORANGE = '#F97316';
const STATUS = { live: ['Live', '#16A34A'], upcoming: ['Upcoming', ORANGE], ended: ['Ended', '#64748B'] };
const pad = (n) => String(n).padStart(2, '0');
const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };

const solidBtn = libSolidBtnSx;
const tintBtn = libTintBtnSx;

function SectionTitle({ children, id }) {
  return (
    <Typography id={id} component="h2" sx={{ ...libSectionTitleSx, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

function StatusTag({ status }) {
  const [label, color] = STATUS[status] || STATUS.ended;
  return (
    <Typography component="span" sx={{ px: 1, py: 0.4, borderRadius: '10px', fontSize: 13, fontWeight: 500, lineHeight: 1.2, color, bgcolor: tint(color, 16) }}>
      {label}
    </Typography>
  );
}

function Countdown({ contest }) {
  const { d, h, m, s } = useCountdown(contest.startsAt, contest.serverTime);
  return (
    <Box role="timer" aria-label={`Starts in ${d} days ${h} hours ${m} minutes`} sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.75, mt: 1.75 }}>
      {[[d, 'days'], [h, 'hrs'], [m, 'min'], [s, 'sec']].map(([v, label]) => (
        <Box key={label} sx={(t) => ({ py: 0.9, borderRadius: '14px', textAlign: 'center', bgcolor: tint(ORANGE, t.palette.mode === 'dark' ? 16 : 10) })}>
          <Typography sx={{ ...mono, fontWeight: 700, fontSize: 20, lineHeight: 1.1 }}>{pad(v)}</Typography>
          <Typography color="var(--lib-muted)" sx={{ fontSize: '0.72rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// One contest as a rounded panel (same shape as the sections on the phone Dashboard).
function ContestPanel({ contest, past, action }) {
  const status = past ? 'ended' : contest.status;
  return (
    <Box
      component="section"
      aria-label={contest.title}
      sx={{ borderRadius: '20px', p: 2, bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <StatusTag status={status} />
        <Typography color="var(--lib-muted)" noWrap sx={{ fontSize: 14, letterSpacing: LIB_TRACKING, minWidth: 0 }}>
          {fmtStart(contest.startsAt)}
        </Typography>
      </Stack>
      <Typography component="h3" sx={{ mt: 1, fontWeight: 700, fontSize: 20, lineHeight: '28px', overflowWrap: 'anywhere' }}>
        {contest.title}
      </Typography>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mt: 1.5 }}>
        <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '15px', display: 'grid', placeItems: 'center', color: '#fff', background: `linear-gradient(135deg, ${ORANGE}, color-mix(in srgb, ${ORANGE} 60%, #000))`, boxShadow: `0 8px 18px -8px ${ORANGE}` }}>
          <EmojiEventsRoundedIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ ...mono, fontWeight: 700, fontSize: 20, lineHeight: '28px' }}>{inr(contest.prizePool)}</Typography>
          <Typography color="var(--lib-muted)" sx={{ fontSize: 14, letterSpacing: LIB_TRACKING }}>
            {contest.tagline || 'Cash prize pool'}
          </Typography>
        </Box>
      </Stack>

      <Typography color="var(--lib-muted)" sx={{ mt: 1.5, fontSize: 14, letterSpacing: LIB_TRACKING, fontVariantNumeric: 'tabular-nums' }}>
        {contest.problemCount} {contest.difficulty} problems · {fmtDuration(contest.durationMinutes)} · {contest.applicants.toLocaleString('en-IN')} applied
      </Typography>

      {!past && contest.status === 'upcoming' && <Countdown contest={contest} />}
      {action}
    </Box>
  );
}

function WinnerRow({ w }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', py: 1.25, pl: 0.5, borderBottom: '1px solid', borderColor: 'var(--lib-divider)', '&:last-of-type': { borderBottom: 'none' } }}>
      <Typography sx={{ ...mono, width: 48, height: 48, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: '14px', fontWeight: 700, fontSize: '1rem', color: w.rank <= 3 ? ORANGE : 'var(--lib-chip-text)', bgcolor: w.rank <= 3 ? tint(ORANGE, 16) : 'var(--lib-chip)' }}>
        {w.rank}
      </Typography>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING }}>
          {w.name}
        </Typography>
        <Typography noWrap color="var(--lib-muted)" sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, fontVariantNumeric: 'tabular-nums' }}>
          {w.solved ?? 0} solved
        </Typography>
      </Box>
      {w.prize ? <Typography sx={{ ...mono, fontWeight: 700, fontSize: '0.95rem', flexShrink: 0 }}>{inr(w.prize)}</Typography> : null}
    </Box>
  );
}

function Rule({ rule, index }) {
  return (
    <Box sx={(t) => ({ py: 1.75, px: rule.highlight ? 1.5 : 0.5, borderBottom: rule.highlight ? 'none' : '1px solid', borderColor: 'var(--lib-divider)', ...(rule.highlight && { my: 1, borderRadius: '16px', bgcolor: tint(ORANGE, t.palette.mode === 'dark' ? 16 : 10) }) })}>
      <Typography component="h3" sx={{ fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING, mb: 1 }}>
        {index + 1}. {rule.title}
      </Typography>
      <Box component="ol" sx={{ m: 0, pl: 2.5, display: 'grid', gap: 0.9 }}>
        {rule.items.map((text) => (
          <Typography key={text} component="li" sx={{ fontSize: '0.92rem', lineHeight: 1.65, '&::marker': { fontWeight: 500, color: 'var(--lib-muted)' } }}>
            {text}
          </Typography>
        ))}
      </Box>
    </Box>
  );
}

export default function MobileContest({ contest, shown, detail, isAuthenticated, accepted, setAccepted, busy, onOpen, onClose, onApply, onWithdraw, onLogin }) {
  const [tab, setTab] = useState('upcoming');
  const applyRef = useRef(null);
  const ready = Boolean(shown);
  const ended = ready && shown.status === 'ended';
  const counts = { upcoming: ready && !ended ? 1 : 0, past: ended ? 1 : 0 };

  const page = { px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' };

  // ---------------------------------------------------------------- Details
  if (detail && contest) {
    const upcoming = contest.status === 'upcoming';
    const past = contest.status === 'ended';
    const goApply = () => applyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const cta = upcoming ? (contest.applied ? 'You are in' : 'Apply now') : 'Rules & details';
    return (
      <LibraryFont>
      <Box sx={page}>
        <IconButton onClick={onClose} aria-label="All contests" sx={libBackBtnSx}>
          <ArrowBackRoundedIcon />
        </IconButton>

        <Box sx={{ mt: 2 }}>
          <ContestPanel
            contest={contest}
            past={past}
            action={
              <Button onClick={goApply} fullWidth disableElevation variant="contained" sx={{ ...(upcoming && !contest.applied ? solidBtn : tintBtn), mt: 1.75 }}>
                {cta}
              </Button>
            }
          />
        </Box>

        <Alert severity="warning" icon={false} sx={{ mt: 2, borderRadius: '20px', fontWeight: 600 }}>
          No AI, no outside help. Every solution must be your own work. Cheaters are disqualified and lose any prize.
        </Alert>

        <Box component="section" aria-labelledby="contest-rules" sx={{ mt: 4 }}>
          <SectionTitle id="contest-rules">Contest rules</SectionTitle>
          <Box sx={{ borderTop: '1px solid', borderColor: 'var(--lib-divider)' }}>
            {contest.rules.map((rule, i) => (
              <Rule key={rule.id} rule={rule} index={i} />
            ))}
          </Box>
        </Box>

        <Box component="section" ref={applyRef} aria-labelledby="contest-apply" sx={{ mt: 4, scrollMarginTop: 16 }}>
          <SectionTitle id="contest-apply">Apply</SectionTitle>
          {contest.applied ? (
            <Stack spacing={1.5}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <CheckCircleRoundedIcon sx={{ color: 'var(--jc-easy)' }} />
                <Typography sx={{ fontWeight: 500, letterSpacing: LIB_TRACKING }}>You are in. See you on {fmtStart(contest.startsAt)}.</Typography>
              </Stack>
              {upcoming && (
                <Button onClick={onWithdraw} disabled={busy} color="inherit" sx={{ alignSelf: 'flex-start', borderRadius: 999, textTransform: 'none', fontWeight: 500, fontSize: 16 }}>
                  Withdraw application
                </Button>
              )}
            </Stack>
          ) : !upcoming ? (
            <Typography color="var(--lib-muted)">Applications are closed.</Typography>
          ) : !isAuthenticated ? (
            <Stack spacing={1.5}>
              <Typography color="var(--lib-muted)">Sign in to apply. It is free.</Typography>
              <Button onClick={onLogin} fullWidth disableElevation variant="contained" sx={solidBtn}>
                Sign in to apply
              </Button>
            </Stack>
          ) : (
            <>
              <FormControlLabel
                control={<Checkbox checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />}
                label={<Typography sx={{ fontSize: '0.92rem', lineHeight: 1.6 }}>I have read the rules above. I will not use AI or any outside help, and I accept that cheating means disqualification and loss of any prize.</Typography>}
                sx={{ alignItems: 'flex-start', m: 0, mb: 1.5, '& .MuiCheckbox-root': { pt: 0.25, ml: -0.75 } }}
              />
              <Button onClick={onApply} disabled={!accepted || busy} fullWidth disableElevation variant="contained" sx={solidBtn}>
                {busy ? 'Applying…' : 'Apply for the contest'}
              </Button>
            </>
          )}
        </Box>
      </Box>
      </LibraryFont>
    );
  }

  // ---------------------------------------------------------------- List
  return (
    <LibraryFont>
    <Box sx={page}>
      <IconButton component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} aria-label="Back to dashboard" sx={libBackBtnSx}>
        <ArrowBackRoundedIcon />
      </IconButton>

      <PageHeader icon={EmojiEventsRoundedIcon} title="Contests" subtitle="Compete, rank and win prizes" />

      <Box role="tablist" aria-label="Contests" sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 3 }}>
        {[['upcoming', 'Upcoming'], ['past', 'Past']].map(([key, label]) => {
          const on = tab === key;
          return (
            <ButtonBase
              key={key}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(key)}
              sx={libChipSx(on)}
            >
              {label}
              <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums', opacity: 0.8 }}>{counts[key]}</Box>
            </ButtonBase>
          );
        })}
      </Box>

      <Box role="tabpanel" sx={{ mt: 2 }}>
        {shown === null && <Skeleton variant="rounded" height={260} sx={{ borderRadius: '20px' }} />}
        {shown === false && <Alert severity="error">Could not load contests. Please try again in a moment.</Alert>}

        {ready && tab === 'upcoming' && (counts.upcoming ? (
          <ContestPanel
            contest={shown}
            action={
              <Button onClick={() => onOpen(shown)} fullWidth disableElevation variant="contained" sx={{ ...(shown.status === 'upcoming' && shown.applied ? tintBtn : solidBtn), mt: 1.75 }}>
                {shown.applied ? 'You are in' : shown.status === 'live' ? 'View contest' : 'View and apply'}
              </Button>
            }
          />
        ) : (
          <Box sx={{ py: 7, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 700 }}>No upcoming contests</Typography>
            <Typography variant="body2" color="var(--lib-muted)" sx={{ mt: 0.5 }}>The next one will be announced here.</Typography>
          </Box>
        ))}

        {ready && tab === 'past' && (counts.past ? (
          <>
            <ContestPanel
              contest={shown}
              past
              action={
                <Typography color="var(--lib-muted)" sx={{ mt: 1.5, fontSize: 14 }}>
                  Ended {fmtDate(shown.startsAt)}
                </Typography>
              }
            />
            <Box component="section" aria-labelledby="contest-top" sx={{ mt: 4 }}>
              <SectionTitle id="contest-top">Top 10</SectionTitle>
              {shown.winners?.length ? (
                <Box sx={{ borderTop: '1px solid', borderColor: 'var(--lib-divider)' }}>
                  {shown.winners.slice(0, 10).map((w) => (
                    <WinnerRow key={w.rank} w={w} />
                  ))}
                </Box>
              ) : (
                <Typography color="var(--lib-muted)">Results appear once rankings are verified.</Typography>
              )}
            </Box>
          </>
        ) : (
          <Box sx={{ py: 7, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 700 }}>No past contests yet</Typography>
            <Typography variant="body2" color="var(--lib-muted)" sx={{ mt: 0.5 }}>Finished contests and their winners will show up here.</Typography>
          </Box>
        ))}
      </Box>
    </Box>
    </LibraryFont>
  );
}
