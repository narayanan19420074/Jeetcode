import { Box } from '@mui/material';
import { SIZES } from '../../../app/design/designTokens';
import { tierFor } from '../tiers';
import SideHero, { EmptyHero } from './SideHero';
import { FocusCard, SignInCard, TierStrip } from './SideCards';

// Side panel of the board: the selected player, how to climb, and the tier ladder. It never scrolls inside.
export default function LeaderboardSidePanel({ row, me, isAuthenticated, meta, period, track, onTrack, points, learners, topPercent, loading, short }) {
  const isMe = Boolean(me && row && row.userId === me.userId);
  return (
    <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, minHeight: SIZES.flexShrinkMinHeight, height: SIZES.fill, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {!isAuthenticated && <SignInCard />}
      {row
        ? <SideHero row={row} isMe={isMe} track={track} points={points} learners={learners} topPercent={topPercent} loading={loading} />
        : <EmptyHero loading={loading} />}
      <FocusCard me={me} neighbors={meta?.neighbors} ranked={Boolean(meta?.me) || loading} isAuthenticated={isAuthenticated} period={period} points={points} track={track} onTrack={onTrack} />
      {!short && row && <TierStrip currentKey={tierFor(row.score).tier.key} />}
    </Box>
  );
}
