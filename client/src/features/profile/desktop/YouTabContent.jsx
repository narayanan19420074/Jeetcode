import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Chip, CircularProgress, Stack, Typography, alpha } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import { DIFF_COLOR, STATUS_COLOR } from '../../dashboard/dashboardUtils';
import { COLOR_PALETTE, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import { timeAgo } from '../common/youFormat';
import { ListRow } from './YouParts';

const TABS = [
  { key: 'lists', label: 'My Lists' },
  { key: 'subs', label: 'Submissions' },
];

export function YouTabs({ tab, onTab }) {
  return (
    <Stack direction="row" spacing={1} sx={{ mt: 2.5, mb: 1 }}>
      {TABS.map(({ key, label }) => (
        <Chip key={key} label={label} onClick={() => onTab(key)} color={tab === key ? 'primary' : 'default'} variant={tab === key ? 'filled' : 'outlined'} sx={{ fontWeight: FONT_WEIGHTS.bold, px: 0.5, height: SIZES.chipHeight, borderRadius: RADII_PX.pill }} />
      ))}
    </Stack>
  );
}

function ListIconTile({ isFavorite }) {
  const favoriteColor = COLOR_PALETTE.amber[500];
  return (
    <Box
      sx={(theme) => ({
        width: SIZES.listTile,
        height: SIZES.listTile,
        borderRadius: RADII_PX.card,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        bgcolor: isFavorite ? alpha(favoriteColor, 0.16) : alpha(theme.palette.primary.main, 0.12),
        color: isFavorite ? favoriteColor : 'primary.main',
      })}
    >
      {isFavorite ? <StarRoundedIcon /> : <FormatListBulletedRoundedIcon />}
    </Box>
  );
}

export function YouListsTab({ lists }) {
  const navigate = useNavigate();
  return (
    <Box>
      {lists.map((list) => (
        <ListRow
          key={list.id}
          onClick={() => navigate(`/dashboard?view=list&list=${list.id}`)}
          title={list.name}
          subtitle={`${list.items.length} ${list.items.length === 1 ? 'Question' : 'Questions'}`}
          leading={<ListIconTile isFavorite={list.id === 'favorite'} />}
        />
      ))}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Star a problem to save it. Lists are kept on this device.
      </Typography>
    </Box>
  );
}

function SubmissionRow({ submission }) {
  const navigate = useNavigate();
  const { problem } = submission;
  return (
    <ListRow
      onClick={() => navigate(`/workspace/${problem.slug}`)}
      title={problem.title}
      subtitle={
        <>
          <Box component="span" sx={{ color: DIFF_COLOR[problem.difficulty], fontWeight: FONT_WEIGHTS.bold }}>
            {problem.difficulty}
          </Box>
          {` · ${timeAgo(submission.createdAt)}`}
        </>
      }
      trailing={
        <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, color: STATUS_COLOR[submission.status] || 'text.secondary', textAlign: 'right', maxWidth: SIZES.statusLabelMaxWidth }}>
          {submission.status}
        </Typography>
      }
    />
  );
}

function SubmissionsFooter({ subs, onLoad }) {
  if (subs.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
        <CircularProgress size={SIZES.iconSize.medium} />
      </Box>
    );
  }
  if (subs.error) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Couldn’t load submissions.
        </Typography>
        <Button onClick={() => onLoad(Math.max(1, subs.page + 1), subs.page === 0)}>Retry</Button>
      </Box>
    );
  }
  if (subs.items.length === 0) return <NoSubmissions />;
  if (subs.total !== null && subs.items.length < subs.total) {
    return (
      <Box sx={{ textAlign: 'center', pt: 1.5 }}>
        <Button onClick={() => onLoad(subs.page + 1)}>Load more</Button>
      </Box>
    );
  }
  return null;
}

function NoSubmissions() {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography sx={{ fontWeight: FONT_WEIGHTS.bold }}>No submissions yet</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Solve your first problem and it shows up here.
      </Typography>
      <Button component={RouterLink} to="/problems" variant="contained" disableElevation>
        Browse problems
      </Button>
    </Box>
  );
}

export function YouSubmissionsTab({ subs, onLoad }) {
  return (
    <Box>
      {subs.items.filter((submission) => submission.problem?.slug).map((submission) => (
        <SubmissionRow key={submission._id} submission={submission} />
      ))}
      <SubmissionsFooter subs={subs} onLoad={onLoad} />
    </Box>
  );
}
