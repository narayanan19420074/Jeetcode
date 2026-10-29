import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  ButtonBase,
  Drawer,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ArrowDropUpRoundedIcon from '@mui/icons-material/ArrowDropUpRounded';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import { Link as RouterLink } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import {
  LIB_ACCENT,
  LIB_TRACKING,
  LibraryFont,
  PageHeader,
  libBackBtnSx,
  libChipSx,
  libIconBtnSx,
  libSearchSx,
  libSectionTitleSx,
  libSolidBtnSx,
  libTintBtnSx,
  useLibraryPalette,
} from '../dashboard/components/libraryStyle';
import { DIFF_COLOR, tint } from '../dashboard/dashboardUtils';
import { tierFor } from './tiers';
import { APT_COLOR, MEDAL, PT, grad } from './lbShared';

// Phone layout of the Leaderboard in the Library look (same as the phone Problems, Home and You pages):
// Roboto type, warm surface, 16px page padding, 40px icon buttons, centred header tile, 18px section
// titles, cream pills and panels, and divider-separated rows. The page itself scrolls (infinite scroll); there is no top
// navigation bar on phones. A tapped player opens in a bottom sheet.

const ACCENT = LIB_ACCENT;

const TRACKS = [
  ['overall', 'Overall'],
  ['coding', 'Coding'],
  ['aptitude', 'Aptitude'],
];
const PERIODS = [
  ['all', 'All-time'],
  ['week', 'Weekly'],
  ['month', 'Monthly'],
];
const SCOPES = [
  ['global', 'Everyone'],
  ['friends', 'Friends'],
];


const num = (n) => (n ?? 0).toLocaleString('en-IN');

function SectionTitle({ children }) {
  return (
    <Typography component="h2" sx={{ ...libSectionTitleSx, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

// ---------- controls ----------

// A group of options as wrapping pills (used inside the filter sheet).
function FilterGroup({ label, options, value, onChange, disabled = () => false }) {
  return (
    <Box component="section" aria-label={label} sx={{ mt: 2.5 }}>
      <Typography component="h3" sx={{ fontWeight: 700, fontSize: 16, lineHeight: '24px', mb: 1 }}>
        {label}
      </Typography>
      <Box role="radiogroup" aria-label={label} sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {options.map(([v, text]) => {
          const on = v === value;
          return (
            <ButtonBase
              key={v}
              role="radio"
              aria-checked={on}
              disabled={disabled(v)}
              onClick={() => onChange(v)}
              sx={libChipSx(on)}
            >
              {text}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

// Everyone / Friends, Overall / Coding / Aptitude and All-time / Weekly / Monthly live in one sheet.
function FilterSheet({ open, onClose, isAuthenticated, track, period, scope, onTrack, onPeriod, onScope, onReset, isDefault }) {
  const pal = useLibraryPalette();
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: '26px 26px 0 0', maxHeight: '90dvh', backgroundImage: 'none', bgcolor: pal.bg, color: pal.text } } }}
    >
      <LibraryFont>
      <Box sx={{ px: 2, pt: 1, pb: 'calc(16px + env(safe-area-inset-bottom))' }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
          <IconButton onClick={onClose} aria-label="Close filters" sx={{ width: 44, height: 44, ml: -1, color: pal.text }}>
            <KeyboardArrowDownRoundedIcon />
          </IconButton>
          <Typography component="h2" sx={{ flex: 1, ...libSectionTitleSx }}>
            Filters
          </Typography>
          <Button onClick={onReset} disabled={isDefault} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 500, fontSize: 16, color: ACCENT }}>
            Reset
          </Button>
        </Stack>

        <FilterGroup label="Leaderboard" options={SCOPES} value={scope} onChange={onScope} disabled={(v) => v === 'friends' && !isAuthenticated} />
        {!isAuthenticated && (
          <Typography color="var(--lib-muted)" sx={{ fontSize: 14, mt: 0.75 }}>
            Sign in to compare with friends.
          </Typography>
        )}
        <FilterGroup label="Track" options={TRACKS} value={track} onChange={onTrack} />
        <FilterGroup label="Period" options={PERIODS} value={period} onChange={onPeriod} />

        <Button onClick={onClose} fullWidth disableElevation variant="contained" sx={{ ...libSolidBtnSx, mt: 3 }}>
          Done
        </Button>
      </Box>
      </LibraryFont>
    </Drawer>
  );
}

// ---------- row pieces ----------

function RankTile({ rank, size = 40 }) {
  const m = MEDAL[rank];
  return (
    <Box
      sx={() => ({
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '12px',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        fontSize: rank > 999 ? '0.75rem' : '0.95rem',
        fontVariantNumeric: 'tabular-nums',
        ...(m ? { color: m.text, background: grad(m) } : { color: 'var(--lib-chip-text)', bgcolor: 'var(--lib-chip)' }),
      })}
    >
      {rank}
    </Box>
  );
}

function YouTag() {
  return (
    <Typography component="span" sx={{ flexShrink: 0, px: 1, py: 0.3, borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, lineHeight: 1.2, color: ACCENT, bgcolor: tint(ACCENT, 16) }}>
      You
    </Typography>
  );
}

// Rank change since last week (all-time, everyone board only; the server sends null otherwise).
function Move({ row }) {
  if (row.isNew) {
    return (
      <Typography component="span" sx={{ px: 0.8, py: 0.1, borderRadius: 99, fontSize: '0.68rem', fontWeight: 800, color: ACCENT, bgcolor: tint(ACCENT, 16) }}>
        New
      </Typography>
    );
  }
  const m = row.movement;
  if (m === null || m === undefined || m === 0) return null;
  const up = m > 0;
  const Icon = up ? ArrowDropUpRoundedIcon : ArrowDropDownRoundedIcon;
  return (
    <Box
      component="span"
      aria-label={`${up ? 'Up' : 'Down'} ${Math.abs(m)} since last week`}
      sx={{ display: 'inline-flex', alignItems: 'center', color: up ? 'var(--jc-easy)' : 'var(--jc-hard)', fontSize: '0.75rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}
    >
      <Icon sx={{ fontSize: 20, mx: -0.5 }} />
      {Math.abs(m)}
    </Box>
  );
}

function PlayerRow({ row, isMe, onPick }) {
  const { tier } = tierFor(row.score);
  return (
    <Box
      id={isMe ? 'lb-me' : undefined}
      sx={(t) => ({
        borderBottom: '1px solid',
        borderColor: 'var(--lib-divider)',
        '&:last-of-type': { borderBottom: 'none' },
        ...(isMe && { bgcolor: tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9), borderRadius: '16px', borderColor: 'transparent' }),
      })}
    >
      <ButtonBase
        onClick={() => onPick(row)}
        sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', py: 1.25, px: 0.5, textAlign: 'left', fontFamily: 'inherit', color: 'inherit' }}
      >
        <RankTile rank={row.rank} />
        <Avatar
          src={row.avatarUrl || undefined}
          alt={row.name}
          sx={{ width: 44, height: 44, flexShrink: 0, fontSize: '1rem', fontWeight: 800, border: `2px solid ${tint(tier.color, 70)}` }}
        >
          {row.name?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 500, fontSize: 16, lineHeight: '24px', letterSpacing: LIB_TRACKING, minWidth: 0 }}>
              {row.name}
            </Typography>
            {isMe && <YouTag />}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'var(--lib-muted)', minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: LIB_TRACKING, minWidth: 0 }}>
              @{row.handle}
            </Typography>
            {row.streak > 0 && (
              <Box component="span" aria-label={`${row.streak}-day streak`} sx={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>
                <LocalFireDepartmentRoundedIcon sx={{ fontSize: 15, color: 'warning.main' }} />
                <Typography component="span" sx={{ fontSize: '0.8rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {row.streak}d
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>
        <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, lineHeight: '24px', fontVariantNumeric: 'tabular-nums' }}>{num(row.score)}</Typography>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, color: 'var(--lib-muted)' }}>
            <Move row={row} />
            <Typography component="span" sx={{ fontSize: '0.72rem', fontWeight: 700 }}>
              pts
            </Typography>
          </Stack>
        </Box>
      </ButtonBase>
    </Box>
  );
}

function SkeletonRows({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '12px', py: 1.5, px: 0.5, borderBottom: '1px solid', borderColor: 'var(--lib-divider)' }}>
          <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: '12px' }} />
          <Skeleton variant="circular" width={44} height={44} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={`${45 + ((i * 17) % 35)}%`} />
            <Skeleton variant="text" width="30%" />
          </Box>
          <Skeleton variant="text" width={44} />
        </Box>
      ))}
    </>
  );
}

// ---------- your position ----------

function MyRank({ me, canFind, onOpen, onFind }) {
  const { tier, next, progress, toNext } = tierFor(me.score);
  return (
    <Box
      sx={{ mt: 3, p: 2, borderRadius: '20px', bgcolor: 'var(--lib-chip)', border: '1px solid var(--lib-border)' }}
    >
      <ButtonBase
        onClick={onOpen}
        aria-label="Open your player details"
        sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, fontFamily: 'inherit', color: 'inherit', textAlign: 'left' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography color="var(--lib-muted)" sx={{ fontSize: 14, letterSpacing: LIB_TRACKING }}>
            Your rank
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 28, lineHeight: '34px', fontVariantNumeric: 'tabular-nums' }}>#{num(me.rank)}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right', minWidth: 0 }}>
          <Typography color="var(--lib-muted)" sx={{ fontSize: 14, letterSpacing: LIB_TRACKING }}>
            Points
          </Typography>
          <Typography sx={{ fontWeight: 700, fontSize: 28, lineHeight: '34px', fontVariantNumeric: 'tabular-nums' }}>{num(me.score)}</Typography>
        </Box>
        <ChevronRightRoundedIcon sx={{ color: 'var(--lib-muted)', flexShrink: 0 }} />
      </ButtonBase>

      <Box sx={{ mt: 1.5 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, color: tier.color, fontWeight: 700, fontSize: 15 }}>
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 18 }} />
            {tier.name}
          </Stack>
          <Typography color="var(--lib-muted)" sx={{ fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
            {next ? `${num(toNext)} points to ${next.name}` : 'Top level reached'}
          </Typography>
        </Stack>
        <Box
          role="progressbar"
          aria-label={next ? `Progress to ${next.name}` : 'Top level reached'}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          sx={{ mt: 1, height: 5, borderRadius: 99, bgcolor: tint(tier.color, 20), overflow: 'hidden' }}
        >
          <Box sx={{ width: `${Math.max(progress, 3)}%`, height: '100%', borderRadius: 99, bgcolor: tier.color, transition: 'width .5s' }} />
        </Box>
      </Box>

      {canFind && (
        <Button onClick={onFind} fullWidth disableElevation variant="contained" startIcon={<MyLocationRoundedIcon />} sx={{ ...libTintBtnSx, mt: 1.5, bgcolor: 'var(--lib-player)' }}>
          Find me in the list
        </Button>
      )}
    </Box>
  );
}

// ---------- player details sheet ----------

function PlayerSheet({ row, onClose }) {
  const pal = useLibraryPalette();
  const open = Boolean(row);
  const info = row ? tierFor(row.score) : null;
  const tiles = row
    ? [
        ['Easy', row.easy, PT.easy, DIFF_COLOR.Easy],
        ['Medium', row.medium, PT.medium, DIFF_COLOR.Medium],
        ['Hard', row.hard, PT.hard, DIFF_COLOR.Hard],
        ['Aptitude', row.aptitude, PT.aptitude, APT_COLOR],
      ]
    : [];

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { borderRadius: '24px 24px 0 0', maxHeight: '90dvh', pb: 'env(safe-area-inset-bottom)', backgroundImage: 'none', bgcolor: pal.bg, color: pal.text } } }}
    >
      {row && info && (
        <LibraryFont>
        <Box sx={{ px: 2, pt: 1.25, pb: 2 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
            <Avatar src={row.avatarUrl || undefined} alt={row.name} sx={{ width: 52, height: 52, fontSize: '1.2rem', fontWeight: 800, border: `2px solid ${tint(info.tier.color, 70)}` }}>
              {row.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography component="h2" noWrap sx={{ ...libSectionTitleSx }}>
                {row.name}
              </Typography>
              <Typography noWrap color="var(--lib-muted)" sx={{ fontSize: 14, letterSpacing: LIB_TRACKING }}>
                @{row.handle}
                {row.company ? `, ${row.company}` : ''}
              </Typography>
            </Box>
            <IconButton onClick={onClose} aria-label="Close player details" sx={{ ...libIconBtnSx, bgcolor: pal.player, color: pal.text }}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
            {[`Rank #${num(row.rank)}`, `${num(row.score)} points`, ...(row.streak > 0 ? [`${row.streak}-day streak`] : [])].map((text) => (
              <Typography key={text} component="span" sx={{ px: 1.25, py: 0.4, borderRadius: 99, fontSize: 14, fontWeight: 500, color: ACCENT, bgcolor: tint(ACCENT, 16), fontVariantNumeric: 'tabular-nums' }}>
                {text}
              </Typography>
            ))}
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, mt: 2 }}>
            {tiles.map(([label, n, pts, color]) => (
              <Box key={label} sx={{ p: 1, textAlign: 'center', minWidth: 0, borderRadius: '16px', bgcolor: tint(color, 14), border: `1px solid ${tint(color, 30)}` }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.2, color, fontVariantNumeric: 'tabular-nums' }}>{n}</Typography>
                <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.78rem' }}>
                  {label}
                </Typography>
                <Typography noWrap color="var(--lib-muted)" sx={{ fontSize: '0.72rem', fontVariantNumeric: 'tabular-nums' }}>
                  {n * pts} pts
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, color: info.tier.color, fontWeight: 700, fontSize: 15 }}>
                <WorkspacePremiumRoundedIcon sx={{ fontSize: 20 }} />
                {info.tier.name}
              </Stack>
              <Typography color="var(--lib-muted)" sx={{ fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>
                {info.next ? `${num(info.toNext)} points to ${info.next.name}` : 'Top level reached'}
              </Typography>
            </Stack>
            <Box
              role="progressbar"
              aria-label={info.next ? `Progress to ${info.next.name}` : 'Top level reached'}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={info.progress}
              sx={{ mt: 1, height: 8, borderRadius: 99, bgcolor: tint(info.tier.color, 20), overflow: 'hidden' }}
            >
              <Box sx={{ width: `${Math.max(info.progress, 4)}%`, height: '100%', borderRadius: 99, bgcolor: info.tier.color }} />
            </Box>
            <Typography color="var(--lib-muted)" sx={{ fontSize: 14, mt: 1 }}>
              {row.recent} solved in the last 7 days
            </Typography>
          </Box>
        </Box>
        </LibraryFont>
      )}
    </Drawer>
  );
}

// ---------- the page ----------

export default function MobileLeaderboard({
  isAuthenticated,
  track,
  period,
  scope,
  onTrack,
  onPeriod,
  onScope,
  search,
  setSearch,
  q,
  rows,
  meta,
  me,
  loading,
  firstLoad,
  error,
  reload,
  hasMore,
  sentinel,
  scrollToMe,
  showEveryone,
}) {
  const [sheetRow, setSheetRow] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const label = (list, v) => list.find(([k]) => k === v)?.[1];
  const isDefault = track === 'overall' && period === 'all' && scope === 'global';
  const summary = [label(TRACKS, track), label(PERIODS, period), label(SCOPES, scope)].join(' · ');
  const meInList = Boolean(me && rows.some((r) => r.userId === me.userId));
  const total = meta?.total ?? rows.length;

  return (
    <LibraryFont>
    <Box sx={{ px: 2, pt: 'calc(8px + env(safe-area-inset-top))', pb: 2, maxWidth: 640, mx: 'auto' }}>
      {/* Back + filters */}
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} aria-label="Back to dashboard" sx={libBackBtnSx}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <IconButton
          onClick={() => setFiltersOpen(true)}
          aria-label={isDefault ? 'Filters' : `Filters: ${summary}`}
          aria-haspopup="dialog"
          sx={libIconBtnSx}
        >
          <Box sx={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
            <TuneRoundedIcon />
            {!isDefault && <Box aria-hidden sx={{ position: 'absolute', top: -6, right: -8, width: 9, height: 9, borderRadius: '50%', bgcolor: 'error.main' }} />}
          </Box>
        </IconButton>
      </Stack>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search players"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          htmlInput: { 'aria-label': 'Search players' },
          input: {
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')} aria-label="Clear search">
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          },
        }}
        sx={libSearchSx}
      />

      {/* Header */}
      <PageHeader icon={EmojiEventsRoundedIcon} title="Leaderboard" subtitle={summary} />

      {/* Your position */}
      {me && <MyRank me={me} canFind={meInList} onOpen={() => setSheetRow(me)} onFind={scrollToMe} />}
      {isAuthenticated && meta && !meta.me && !loading && (
        <Typography color="var(--lib-muted)" sx={{ mt: 2, fontSize: 15, textAlign: 'center' }}>
          Solve a question{period === 'all' ? '' : ' in this period'} to enter the leaderboard.
        </Typography>
      )}

      {/* Rankings */}
      <Box component="section" aria-label="Rankings" sx={{ mt: 4 }}>
        <SectionTitle>Rankings</SectionTitle>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 1.5 }}
            action={
              <Button color="inherit" size="small" onClick={reload}>
                Try again
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Box sx={{ borderTop: '1px solid', borderColor: 'var(--lib-divider)' }}>
          {firstLoad ? (
            <SkeletonRows />
          ) : rows.length === 0 && !error ? (
            <Box sx={{ py: 7, px: 2, textAlign: 'center' }}>
              <Typography sx={{ fontWeight: 700 }}>
                {q ? `No player matches "${q}"` : scope === 'friends' ? 'No friends on this board yet' : 'No one has scored in this period yet'}
              </Typography>
              <Typography variant="body2" color="var(--lib-muted)" sx={{ mt: 0.5, mb: 2 }}>
                {q ? 'Check the spelling or search by @handle.' : 'Solve a question to take the first spot.'}
              </Typography>
              <Stack direction="row" sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                {q && (
                  <Button variant="outlined" onClick={() => setSearch('')} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
                    Clear search
                  </Button>
                )}
                {!q && scope === 'friends' && (
                  <Button variant="outlined" onClick={showEveryone} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
                    Show everyone
                  </Button>
                )}
                {!q && period !== 'all' && (
                  <Button variant="outlined" onClick={() => onPeriod('all')} sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 700 }}>
                    Show all-time
                  </Button>
                )}
              </Stack>
            </Box>
          ) : (
            <>
              <Box aria-busy={loading}>
                {rows.map((r) => (
                  <PlayerRow key={r.userId} row={r} isMe={me?.userId === r.userId} onPick={setSheetRow} />
                ))}
              </Box>
              {hasMore && <Box ref={sentinel} aria-hidden sx={{ height: 1 }} />}
              {loading && rows.length > 0 && <SkeletonRows count={3} />}
            </>
          )}
        </Box>

        {rows.length > 0 && !firstLoad && (
          <Typography variant="caption" color="var(--lib-muted)" sx={{ display: 'block', textAlign: 'center', mt: 1.5, fontVariantNumeric: 'tabular-nums' }}>
            Showing {rows.length} of {total}
          </Typography>
        )}
      </Box>

      <FilterSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        isAuthenticated={isAuthenticated}
        track={track}
        period={period}
        scope={scope}
        onTrack={onTrack}
        onPeriod={onPeriod}
        onScope={onScope}
        isDefault={isDefault}
        onReset={() => {
          onTrack('overall');
          onPeriod('all');
          onScope('global');
        }}
      />
      <PlayerSheet row={sheetRow} onClose={() => setSheetRow(null)} />
    </Box>
    </LibraryFont>
  );
}
