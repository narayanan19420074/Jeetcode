import { Alert, Box, Button } from '@mui/material';
import { useLibraryPalette } from '../../dashboard/components/libraryStyle';
import { RADII_PX, SIZES } from '../../../app/design/designTokens';
import { cardSx } from './lbLook';
import { PlayerRow } from './PlayerRow';
import { EmptyList, SkeletonRow, TableHead } from './TableParts';

const SKELETON_ROWS = 7;
const SKELETON_MORE_ROWS = 2;

function Rows({ board, rowProps }) {
  const { listRows, me, topPlayerId } = board;
  return listRows.map((row) => <PlayerRow key={row.userId} row={row} isMe={me?.userId === row.userId} top={topPlayerId === row.userId} {...rowProps} />);
}

function TableBody({ board, rowProps }) {
  const { firstLoad, loading, rows, error, sentinel, hasMore } = board;
  const isEmpty = !loading && rows.length === 0 && !error;
  return (
    <>
      {firstLoad && Array.from({ length: SKELETON_ROWS }, (_, i) => <SkeletonRow key={i} index={i} />)}
      <Rows board={board} rowProps={rowProps} />
      {isEmpty && <EmptyList q={board.q} scope={board.scope} period={board.period} onClearSearch={() => board.setSearch('')} onShowEveryone={board.showEveryone} onShowAllTime={() => board.onPeriod('all')} />}
      {hasMore && <Box ref={sentinel} sx={{ height: SIZES.leaderboard.scrollSentinel }} />}
      {loading && rows.length > 0 && Array.from({ length: SKELETON_MORE_ROWS }, (_, i) => <SkeletonRow key={`more-${i}`} index={i} />)}
    </>
  );
}

// The only part of the board that scrolls: the table. More players load as the bottom comes into view.
export default function BoardList({ board, layout }) {
  const pal = useLibraryPalette();
  const rowProps = { track: board.track, wide: layout.wide, onPick: board.onPick };
  const onScroll = (event) => {
    const el = event.currentTarget;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < SIZES.leaderboard.loadMoreDistance) board.askMore();
  };
  return (
    <Box ref={board.scroller} className="autohide-scroll" onScroll={onScroll} sx={{ flex: 1, minHeight: SIZES.flexShrinkMinHeight, overflowY: board.firstLoad ? 'hidden' : 'auto', overflowX: 'hidden', overscrollBehavior: 'contain' }}>
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        {board.error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={board.reload}>Retry</Button>}>{board.error}</Alert>}
        <Box sx={[cardSx(pal), { overflow: 'clip', borderRadius: RADII_PX.card }]}>
          <TableHead track={board.track} wide={layout.wide} />
          <TableBody board={board} rowProps={rowProps} />
        </Box>
      </Box>
    </Box>
  );
}
