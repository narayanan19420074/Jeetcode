import { Box, ButtonBase, CircularProgress, IconButton, InputAdornment, Skeleton, TextField, Typography } from '@mui/material';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import BackToDashboard from '../../components/BackToDashboard';
import CompanyAvatar from '../../components/CompanyAvatar';
import { tint } from '../dashboard/dashboardUtils';

// Phone layout of the Companies page. It follows the phone Problems page (MobileProblems): same
// page padding, back button, pill search, centred header, divider-separated rows and type sizes.
// The page itself scrolls (infinite scroll), and there is no top navigation bar on phones.

const ACCENT = '#14B8A6';

const readinessColor = (pct) => (pct < 40 ? '#EF4444' : pct < 70 ? '#F59E0B' : '#10B981');
const plural = (n, word) => `${n.toLocaleString('en-IN')} ${n === 1 ? word : `${word}s`}`;

function CompanyRow({ c, onOpen }) {
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
        gap: 1.5,
        py: 1.5,
        pl: 0.5,
        textAlign: 'left',
        fontFamily: 'inherit',
        color: 'inherit',
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <CompanyAvatar name={c.name} logoUrl={c.logoUrl} size={48} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography noWrap sx={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.35 }}>
          {c.name}
        </Typography>
        <Typography noWrap variant="body2" color="text.secondary" sx={{ mt: 0.4, fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums' }}>
          {details}
        </Typography>
      </Box>
      {hasReadiness && (
        <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: readinessColor(c.readiness), fontVariantNumeric: 'tabular-nums' }}>
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
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.5, pl: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
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
  return (
    <Box sx={{ pt: 'calc(8px + env(safe-area-inset-top))' }}>
      {/* Back + search */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <BackToDashboard sx={{ width: 44, height: 44, border: 'none', bgcolor: 'transparent' }} />
        <TextField
          fullWidth
          size="small"
          placeholder="Search companies"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          slotProps={{
            htmlInput: { 'aria-label': 'Search companies' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton size="small" aria-label="Clear search" onClick={() => onQuery('')}>
                    <ClearRoundedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
          sx={(t) => ({
            '& .MuiOutlinedInput-root': { borderRadius: 999, height: 48, bgcolor: tint(ACCENT, t.palette.mode === 'dark' ? 16 : 9) },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
          })}
        />
      </Box>

      {/* Header */}
      <Box sx={{ textAlign: 'center', mt: 2.5 }}>
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
          <BusinessRoundedIcon sx={{ fontSize: 44 }} />
        </Box>
        <Typography component="h1" noWrap sx={{ mt: 1.75, fontWeight: 800, fontSize: '1.9rem', lineHeight: 1.15, letterSpacing: '-0.01em' }}>
          Companies
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1rem', mt: 0.25 }}>
          Questions asked by each company
        </Typography>
      </Box>

      {/* List */}
      <Box sx={{ mt: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
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
  );
}
