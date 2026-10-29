import { Link as RouterLink } from 'react-router-dom';
import { Box, ButtonBase, CircularProgress, IconButton, InputAdornment, Skeleton, TextField, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import { useSelector } from 'react-redux';
import CompanyAvatar from '../../components/CompanyAvatar';
import { HeaderTile, LibraryFont, useLibraryPalette } from '../dashboard/components/libraryStyle';

// Phone layout of the Companies page. It follows the phone Problems page (MobileProblems): same
// page padding, back button, pill search, centred header, divider-separated rows and type sizes.
// The page itself scrolls (infinite scroll), and there is no top navigation bar on phones.

const TRACKING = '0.03em';

const readinessColor = (pct) => (pct < 40 ? '#EF4444' : pct < 70 ? '#F59E0B' : '#10B981');
const plural = (n, word) => `${n.toLocaleString('en-IN')} ${n === 1 ? word : `${word}s`}`;

function CompanyRow({ c, onOpen }) {
  const pal = useLibraryPalette();
  const hasReadiness = c.readiness !== null && c.readiness !== undefined && c.readiness > 0;
  const details = c.roadmap
    ? [plural(c.count || 0, 'question'), c.minutes ? `${c.minutes} min` : null, plural(c.sections || 0, 'section')].filter(Boolean).join(' · ')
    : plural(c.count || 0, 'question');

  return (
    <ButtonBase
      onClick={onOpen}
      aria-label={`Open ${c.name}`}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '12px',
        py: 1.25,
        textAlign: 'left',
        fontFamily: 'inherit',
        color: 'inherit',
        borderBottom: `1px solid ${pal.divider}`,
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <CompanyAvatar name={c.name} logoUrl={c.logoUrl} size={48} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontSize: 16, lineHeight: '24px', letterSpacing: TRACKING }}>
          {c.name}
        </Typography>
        <Typography noWrap sx={{ fontSize: 14, lineHeight: '20px', letterSpacing: TRACKING, color: pal.muted, fontVariantNumeric: 'tabular-nums' }}>
          {details}
        </Typography>
      </Box>
      {hasReadiness && (
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: readinessColor(c.readiness), fontVariantNumeric: 'tabular-nums' }}>
          {c.readiness}%
        </Typography>
      )}
      <ChevronRightRoundedIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
    </ButtonBase>
  );
}

function SkeletonRows({ count = 8 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: '12px', py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Skeleton variant="rounded" width={48} height={48} sx={{ borderRadius: '14px' }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="55%" />
            <Skeleton variant="text" width="35%" />
          </Box>
        </Box>
      ))}
    </>
  );
}

export default function MobilePrepCompanies({ loading, list, shown, hasMore, query, onQuery, onOpen, sentinelRef }) {
  const pal = useLibraryPalette();
  const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
  return (
    <LibraryFont>
    <Box sx={{ pt: 'calc(8px + env(safe-area-inset-top))' }}>
      {/* Back + search */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton component={RouterLink} to={isAuthenticated ? '/dashboard' : '/'} aria-label="Back to dashboard" sx={{ width: 44, height: 44, ml: -1, color: pal.text }}>
          <ArrowBackRoundedIcon />
        </IconButton>
        <TextField
          fullWidth
          size="small"
          placeholder="Search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          slotProps={{
            htmlInput: { 'aria-label': 'Search companies' },
            input: {
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton size="small" aria-label="Clear search" onClick={() => onQuery('')}>
                    <ClearRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': { borderRadius: 999, height: 44, bgcolor: pal.player, fontSize: 18, letterSpacing: TRACKING, px: '16px' },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
          }}
        />
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <HeaderTile>
          <BusinessRoundedIcon sx={{ fontSize: 28 }} />
        </HeaderTile>
        <Typography component="h1" noWrap sx={{ mt: 1.5, fontWeight: 700, fontSize: 26, lineHeight: '32px' }}>
          Companies
        </Typography>
        <Typography sx={{ fontSize: 17, lineHeight: '24px', letterSpacing: TRACKING, color: pal.muted }}>Questions asked by each company</Typography>
      </Box>

      {/* List */}
      <Box sx={{ mt: 3, borderTop: `1px solid ${pal.divider}` }}>
        {loading ? (
          <SkeletonRows />
        ) : shown.length === 0 ? (
          <Box sx={{ py: 7, px: 2, textAlign: 'center' }}>
            <Typography sx={{ fontWeight: 800 }}>{query ? 'No companies match your search' : 'No companies yet'}</Typography>
            {query && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Try a different name.
              </Typography>
            )}
          </Box>
        ) : (
          <>
            {shown.map((c) => (
              <CompanyRow key={c.key} c={c} onOpen={() => onOpen(c)} />
            ))}
            <Box ref={sentinelRef} aria-hidden sx={{ height: 1 }} />
            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={22} />
              </Box>
            )}
          </>
        )}
      </Box>

      {!loading && list.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
          Company names and logos belong to their owners and are shown only to identify each company.
        </Typography>
      )}
    </Box>
    </LibraryFont>
  );
}
