import { Box, ButtonBase, Typography } from '@mui/material';
import BackIconButton from '../../../../components/BackIconButton';
import { LIGHT_CARD_MUTED_OPACITY, LIGHT_CARD_SELECTED_BG, lightCardSx } from '../../../dashboard/components/rail/lightCardStyles';
import { LIB_TRACKING, libSectionTitleSx } from '../../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES } from '../../../../app/design/designTokens';

// Topics with no questions yet show no count; the learner can still open them to read.
const topicCount = (topic) => (topic.total === 0 ? '' : `${topic.solved}/${topic.total}`);

function TopicRow({ topic, selected, onPick }) {
  return (
    <ButtonBase
      onClick={() => onPick(topic.slug)}
      aria-current={selected ? 'page' : undefined}
      sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, width: SIZES.fill, px: 1.5, py: 1, borderRadius: RADII_PX.card, textAlign: 'left', fontFamily: 'inherit', letterSpacing: LIB_TRACKING, bgcolor: selected ? LIGHT_CARD_SELECTED_BG : 'transparent', opacity: selected ? 1 : LIGHT_CARD_MUTED_OPACITY }}
    >
      <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: selected ? FONT_WEIGHTS.bold : FONT_WEIGHTS.medium }}>{topic.title}</Typography>
      <Typography variant="caption" sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{topicCount(topic)}</Typography>
    </ButtonBase>
  );
}

// Left column of the desktop topic and practice pages: the back icon (it goes to the Aptitude home unless `backTo` says otherwise) and a white card listing the topics of this pattern.
// Picking a topic opens its learn content in the middle.
export default function TopicsNav({ topics, activeSlug, onPick, backTo = '/aptitude', backLabel = 'Back to Aptitude' }) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box><BackIconButton to={backTo} label={backLabel} /></Box>
      <Box
        component="nav"
        aria-label="Topics"
        sx={[...lightCardSx, (theme) => ({ p: 1, display: 'flex', flexDirection: 'column', gap: 0.5, overflowY: 'auto', maxHeight: `calc(100vh - ${SIZES.desktopFrame.stickyTop}px - ${theme.spacing(10)})` })]}
      >
        <Typography component="h2" sx={[libSectionTitleSx, { px: 1.5, pt: 1, pb: 0.5 }]}>Topics</Typography>
        {topics.map((topic) => <TopicRow key={topic.slug} topic={topic} selected={topic.slug === activeSlug} onPick={onPick} />)}
      </Box>
    </Box>
  );
}
