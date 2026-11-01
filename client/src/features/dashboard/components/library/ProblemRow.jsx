import { Link as RouterLink } from 'react-router-dom';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import { DIFF_COLOR } from '../../dashboardUtils';
import { ACC_W, PAD_X, STAR_W } from './libraryConstants';
import useLibraryStyles from './libraryStyles';

const LINK_SX = {
  flex: 1,
  minWidth: 0,
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  px: PAD_X,
  color: 'inherit',
  textDecoration: 'none',
  '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2, borderRadius: '8px' },
};

// The phone Library look shows an empty dash for problems that are not solved yet.
function StatusIcon({ solved, cream }) {
  if (solved) return <CheckCircleRoundedIcon sx={{ fontSize: 20, color: 'success.main' }} titleAccess="Solved" />;
  if (cream) return <RemoveRoundedIcon sx={{ fontSize: 20, color: 'text.secondary', opacity: 0.6 }} titleAccess="Not solved yet" />;
  return <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 20, color: 'action.disabled' }} titleAccess="Not solved yet" />;
}

function ProblemBadges({ isDaily, locked }) {
  return (
    <>
      {isDaily && (
        <Tooltip title="Today's challenge">
          <EventRoundedIcon sx={{ fontSize: 17, color: 'primary.main', flexShrink: 0 }} />
        </Tooltip>
      )}
      {locked && (
        <Tooltip title="Pro problem">
          <LockRoundedIcon sx={{ fontSize: 15, color: 'warning.main', flexShrink: 0 }} />
        </Tooltip>
      )}
    </>
  );
}

function ProblemTitle({ problem, index, styles }) {
  return (
    <Typography variant="body2" noWrap sx={styles.title}>
      <Box component="span" sx={{ color: 'text.secondary', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
        {index}.
      </Box>{' '}
      {problem.title}
    </Typography>
  );
}

function ProblemStats({ problem, styles }) {
  return (
    <>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={[{ display: { xs: 'none', sm: 'block' }, width: ACC_W, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }, styles.acceptance]}
      >
        {(problem.acceptanceRate ?? 0).toFixed(1)}%
      </Typography>
      <Typography variant="body2" sx={styles.difficulty(DIFF_COLOR[problem.difficulty] || 'var(--jc-pending)')}>
        {problem.difficulty}
      </Typography>
    </>
  );
}

function StarCell({ problem, saved, onStar }) {
  return (
    <Box sx={{ width: STAR_W, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
      <Tooltip title={saved ? 'Saved to a list' : 'Save to a list'}>
        <IconButton
          className="row-star"
          size="small"
          onClick={(e) => onStar(e.currentTarget, problem)}
          aria-label={saved ? `Manage lists for ${problem.title}` : `Save ${problem.title} to a list`}
          sx={{ opacity: saved ? 1 : { xs: 0.6, md: 0 }, '&:focus-visible': { opacity: 1 } }}
        >
          {saved ? <StarRoundedIcon fontSize="small" sx={{ color: 'warning.main' }} /> : <StarBorderRoundedIcon fontSize="small" />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function ProblemRow({ p, index, isDaily, saved, onStar }) {
  const styles = useLibraryStyles();
  return (
    <Box sx={[{ display: 'flex', alignItems: 'center' }, styles.row]}>
      <Box component={RouterLink} to={`/workspace/${p.slug}`} sx={[LINK_SX, styles.rowLink]}>
        <Box sx={{ display: 'flex', flexShrink: 0 }}>
          <StatusIcon solved={p.solvedByMe} cream={styles.cream} />
        </Box>
        <ProblemTitle problem={p} index={index} styles={styles} />
        <ProblemBadges isDaily={isDaily} locked={p.locked} />
        <Box sx={{ flex: 1 }} />
        <ProblemStats problem={p} styles={styles} />
      </Box>
      <StarCell problem={p} saved={saved} onStar={onStar} />
    </Box>
  );
}
