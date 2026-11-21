import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import { LIB_ACCENT, useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../app/design/designTokens';
import BoardHeader from './BoardHeader';
import BoardList from './BoardList';
import { PinnedPlayerRow } from './PlayerRow';
import { iconButtonSx } from './lbLook';
import useBoardLayout from './useBoardLayout';

// The signed-in player's own position stays pinned under the list, so it is always in view.
function PinnedRank({ board, layout }) {
  const pal = useLibraryPalette();
  const { me, meInList, scrollToMe, onPick, track } = board;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', pr: 1.5, borderRadius: RADII_PX.card, border: `1px solid ${alpha(LIB_ACCENT, 0.4)}`, bgcolor: alpha(LIB_ACCENT, 0.08) }}>
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth }}>
        <PinnedPlayerRow row={me} track={track} wide={layout.wide} onPick={onPick} />
      </Box>
      {meInList && (
        <Tooltip title="Find me in the list">
          <IconButton onClick={scrollToMe} aria-label="Scroll to my row" sx={iconButtonSx(pal)}>
            <MyLocationRoundedIcon sx={{ fontSize: FONT_SIZES.heading }} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}

function NotRankedHint({ board }) {
  const pal = useLibraryPalette();
  const { isAuthenticated, meta, loading, period } = board;
  if (!isAuthenticated || !meta || meta.me || loading) return null;
  return (
    <Typography sx={{ px: 1, fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.medium, color: pal.muted }}>
      Solve a question{period === 'all' ? '' : ' in this period'} to enter the leaderboard.
    </Typography>
  );
}

// Desktop board: filters on the page, then the top player and the table. Rows open the player in the side panel.
export default function LeaderboardBoard(props) {
  const layout = useBoardLayout(props.boardW, props.boardH);
  return (
    <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, minHeight: SIZES.flexShrinkMinHeight, height: SIZES.fill, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <BoardHeader layout={layout} {...props} />
      <BoardList board={props} layout={layout} />
      {props.me && <PinnedRank board={props} layout={layout} />}
      <NotRankedHint board={props} />
    </Box>
  );
}
