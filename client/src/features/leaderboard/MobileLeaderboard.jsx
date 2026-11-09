import { Alert, Box, Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../app/design/designTokens';
import { LibraryFont, PageHeader, libBackBtnSx, libIconBtnSx, libSearchSx } from '../dashboard/components/libraryStyle';
import { Link as RouterLink } from 'react-router-dom';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { useState } from 'react';
import { PERIODS, SCOPES, TRACKS } from './mobileLeaderboard/leaderboardConfig';
import { FilterSheet, SectionTitle } from './mobileLeaderboard/LeaderboardFilters';
import { MyRank, PlayerSheet } from './mobileLeaderboard/RankAndPlayerSheet';
import { PlayerRow, SkeletonRows } from './mobileLeaderboard/PlayerRows';

// Phone layout of the Leaderboard in the Library look (same as the phone Problems, Home and You pages):
// Roboto type, warm surface, 16px page padding, 40px icon buttons, centred header tile, 18px section
// titles, cream pills and panels, and divider-separated rows. The page itself scrolls (infinite scroll); there is no top
// navigation bar on phones. A tapped player opens in a bottom sheet.

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
        <Typography color="var(--lib-muted)" sx={{ mt: 2, fontSize: FONT_SIZES.bodyLg, textAlign: 'center' }}>
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
              <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>
                {q ? `No player matches "${q}"` : scope === 'friends' ? 'No friends on this board yet' : 'No one has scored in this period yet'}
              </Typography>
              <Typography variant="body2" color="var(--lib-muted)" sx={{ mt: 0.5, mb: 2 }}>
                {q ? 'Check the spelling or search by @handle.' : 'Solve a question to take the first spot.'}
              </Typography>
              <Stack direction="row" sx={{ justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                {q && (
                  <Button variant="outlined" onClick={() => setSearch('')} sx={{ borderRadius: RADII_PX.pill, textTransform: 'none', fontWeight: FONT_WEIGHTS.bold }}>
                    Clear search
                  </Button>
                )}
                {!q && scope === 'friends' && (
                  <Button variant="outlined" onClick={showEveryone} sx={{ borderRadius: RADII_PX.pill, textTransform: 'none', fontWeight: FONT_WEIGHTS.bold }}>
                    Show everyone
                  </Button>
                )}
                {!q && period !== 'all' && (
                  <Button variant="outlined" onClick={() => onPeriod('all')} sx={{ borderRadius: RADII_PX.pill, textTransform: 'none', fontWeight: FONT_WEIGHTS.bold }}>
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
