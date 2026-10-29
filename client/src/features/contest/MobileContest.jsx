import { useRef, useState } from 'react';
import { Alert, Box, Button, ButtonBase, Checkbox, FormControlLabel, IconButton, Skeleton, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BackToDashboard from '../../components/BackToDashboard';
import { tint } from '../dashboard/dashboardUtils';
import { fmtDate, fmtDuration, fmtStart, inr, useCountdown } from './contestUtils';

// Phone layout of the Contest page. It follows the phone Problems, Store and You pages: same page padding,
// 44px back button, centred header, pill tabs and buttons, 1.25rem section titles and divider-separated rows.
// Two screens: the list (upcoming / past with winners) and the contest details (rules and apply).
// There is no top navigation bar on phones, and the 3D podium is replaced by a plain top 10 list.

const ACCENT = '#6366F1';
const ORANGE = '#F97316';
const STATUS = { live: ['Live', '#16A34A'], upcoming: ['Upcoming', ORANGE], ended: ['Ended', '#64748B'] };
const pad = (n) => String(n).padStart(2, '0');
const mono = { fontFamily: '"JetBrains Mono","Fira Code",monospace', fontVariantNumeric: 'tabular-nums' };

const solidBtn = { height: 48, borderRadius: 999, fontWeight: 800, fontSize: '1rem', textTransform: 'none', bgcolor: ACCENT, color: '#fff', '&:hover': { bgcolor: `color-mix(in srgb, ${ACCENT} 85%, #000)` } };
const tintBtn = { ...solidBtn, bgcolor: tint(ACCENT, 20), color: ACCENT, '&:hover': { bgcolor: tint(ACCENT, 30) } };

function SectionTitle({ children, id }) {
  return (
    <Typography id={id} component="h2" sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15, letterSpacing: '-0.01em', mb: 1.5 }}>
      {children}
    </Typography>
  );
}

function StatusTag({ status }) {
  const [label, color] = STATUS[status] || STATUS.ended;
  return (
    <Typography component="span" sx={{ px: 1, py: 0.4, borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800, lineHeight: 1.2, color, bgcolor: tint(color, 16) }}>
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
          <Typography sx={{ ...mono, fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1 }}>{pad(v)}</Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
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
      sx={(t) => ({
        borderRadius: '26px',
        p: 1.75,
        background: `linear-gradient(160deg, ${tint(ORANGE, t.palette.mode === 'dark' ? 20 : 15)} 0%, ${tint(ORANGE, 4)} 62%, transparent 100%)`,
        border: `1px solid ${tint(ORANGE, 24)}`,
      })}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
        <StatusTag status={status} />
        <Typography color="text.secondary" noWrap sx={{ fontSize: '0.82rem', minWidth: 0 }}>
          {fmtStart(contest.startsAt)}
        </Typography>
      </Stack>
      <Typography component="h3" sx={{ mt: 1, fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.2, letterSpacing: '-0.01em', overflowWrap: 'anywhere' }}>
        {contest.title}
      </Typography>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mt: 1.5 }}>
        <Box sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '15px', display: 'grid', placeItems: 'center', color: '#fff', background: `linear-gradient(135deg, ${ORANGE}, color-mix(in srgb, ${ORANGE} 60%, #000))`, boxShadow: `0 8px 18px -8px ${ORANGE}` }}>
          <EmojiEventsRoundedIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ ...mono, fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.15 }}>{inr(contest.prizePool)}</Typography>
          <Typography color="text.secondary" sx={{ fontSize: '0.82rem' }}>
            {contest.tagline || 'Cash prize pool'}
          </Typography>
        </Box>
      </Stack>

      <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>
        {contest.problemCount} {contest.difficulty} problems · {fmtDuration(contest.durationMinutes)} · {contest.applicants.toLocaleString('en-IN')} applied
      </Typography>

      {!past && contest.status === 'upcoming' && <Countdown contest={contest} />}
      {action}
    </Box>
  );
}

function WinnerRow({ w }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, pl: 0.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-of-type': { borderBottom: 'none' } }}>
      <Typography sx={{ ...mono, width: 40, height: 40, flexShrink: 0, display: 'grid', placeItems: 'center', borderRadius: '14px', fontWeight: 800, fontSize: '1rem', color: w.rank <= 3 ? ORANGE : 'text.secondary', bgcolor: tint(w.rank <= 3 ? ORANGE : ACCENT, 16) }}>
        {w.rank}
      </Typography>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.35 }}>
          {w.name}
        </Typography>
        <Typography noWrap color="text.secondary" sx={{ fontSize: '0.82rem', mt: 0.2, fontVariantNumeric: 'tabular-nums' }}>
          {w.solved ?? 0} solved
        </Typography>
      </Box>
      {w.prize ? <Typography sx={{ ...mono, fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>{inr(w.prize)}</Typography> : null}
    </Box>
  );
}

function Rule({ rule, index }) {
  return (
    <Box sx={(t) => ({ py: 1.75, px: rule.highlight ? 1.5 : 0.5, borderBottom: rule.highlight ? 'none' : '1px solid', borderColor: 'divider', ...(rule.highlight && { my: 1, borderRadius: '20px', bgcolor: tint(ORANGE, t.palette.mode === 'dark' ? 16 : 10) }) })}>
      <Typography component="h3" sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.3, mb: 1 }}>
        {index + 1}. {rule.title}
      </Typography>
      <Box component="ol" sx={{ m: 0, pl: 2.5, display: 'grid', gap: 0.9 }}>
        {rule.items.map((text) => (
          <Typography key={text} component="li" sx={{ fontSize: '0.92rem', lineHeight: 1.65, '&::marker': { fontWeight: 700, color: 'text.secondary' } }}>
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

  const page = { px: 1.75, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' };

  // ---------------------------------------------------------------- Details
  if (detail && contest) {
    const upcoming = contest.status === 'upcoming';
    const past = contest.status === 'ended';
    const goApply = () => applyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const cta = upcoming ? (contest.applied ? 'You are in' : 'Apply now') : 'Rules & details';
    return (
      <Box sx={page}>
        <IconButton onClick={onClose} aria-label="All contests" sx={{ width: 44, height: 44 }}>
          <ArrowBackRoundedIcon />
        </IconButton>

        <Box sx={{ mt: 1 }}>
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

        <Box component="section" aria-labelledby="contest-rules" sx={{ mt: 3 }}>
          <SectionTitle id="contest-rules">Contest rules</SectionTitle>
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            {contest.rules.map((rule, i) => (
              <Rule key={rule.id} rule={rule} index={i} />
            ))}
          </Box>
        </Box>

        <Box component="section" ref={applyRef} aria-labelledby="contest-apply" sx={{ mt: 3, scrollMarginTop: 16 }}>
          <SectionTitle id="contest-apply">Apply</SectionTitle>
          {contest.applied ? (
            <Stack spacing={1.5}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                <CheckCircleRoundedIcon sx={{ color: 'var(--jc-easy)' }} />
                <Typography sx={{ fontWeight: 700 }}>You are in. See you on {fmtStart(contest.startsAt)}.</Typography>
              </Stack>
              {upcoming && (
                <Button onClick={onWithdraw} disabled={busy} color="inherit" sx={{ alignSelf: 'flex-start', borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
                  Withdraw application
                </Button>
              )}
            </Stack>
          ) : !upcoming ? (
            <Typography color="text.secondary">Applications are closed.</Typography>
          ) : !isAuthenticated ? (
            <Stack spacing={1.5}>
              <Typography color="text.secondary">Sign in to apply. It is free.</Typography>
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
    );
  }

  // ---------------------------------------------------------------- List
  return (
    <Box sx={page}>
      <BackToDashboard sx={{ width: 44, height: 44, border: 'none', bgcolor: 'transparent' }} />

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Box
          sx={{
            width: 84,
            height: 84,
            mx: 'auto',
            borderRadius: '26px',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            background: `linear-gradient(135deg, ${ACCENT}, color-mix(in srgb, ${ACCENT} 60%, #000))`,
            boxShadow: `0 14px 26px -12px ${ACCENT}`,
          }}
        >
          <EmojiEventsRoundedIcon sx={{ fontSize: 44 }} />
        </Box>
        <Typography component="h1" sx={{ mt: 1.75, fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          Contests
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1rem', mt: 0.25 }}>
          Compete, rank and win prizes
        </Typography>
      </Box>

      <Box role="tablist" aria-label="Contests" sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, mt: 2.5 }}>
        {[['upcoming', 'Upcoming'], ['past', 'Past']].map(([key, label]) => {
          const on = tab === key;
          return (
            <ButtonBase
              key={key}
              role="tab"
              aria-selected={on}
              onClick={() => setTab(key)}
              sx={(t) => ({ height: 40, px: 2, gap: 0.75, borderRadius: 999, fontFamily: 'inherit', fontSize: '0.9rem', fontWeight: on ? 800 : 700, color: on ? ACCENT : t.palette.text.secondary, bgcolor: on ? tint(ACCENT, 20) : 'transparent' })}
            >
              {label}
              <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums', opacity: 0.8 }}>{counts[key]}</Box>
            </ButtonBase>
          );
        })}
      </Box>

      <Box role="tabpanel" sx={{ mt: 2 }}>
        {shown === null && <Skeleton variant="rounded" height={260} sx={{ borderRadius: '26px' }} />}
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
            <Typography sx={{ fontWeight: 800 }}>No upcoming contests</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>The next one will be announced here.</Typography>
          </Box>
        ))}

        {ready && tab === 'past' && (counts.past ? (
          <>
            <ContestPanel
              contest={shown}
              past
              action={
                <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: '0.82rem' }}>
                  Ended {fmtDate(shown.startsAt)}
                </Typography>
              }
            />
            <Box component="section" aria-labelledby="contest-top" sx={{ mt: 3 }}>
              <SectionTitle id="contest-top">Top 10</SectionTitle>
              {shown.winners?.length ? (
                <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
                  {shown.winners.slice(0, 10).map((w) => (
                    <WinnerRow key={w.rank} w={w} />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">Results appear once rankings are verified.</Typography>
              )}
            </Box>
          </>
        ) : (
          <Box sx={{ py: 7, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 800 }}>No past contests yet</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Finished contests and their winners will show up here.</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
