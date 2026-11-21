import { Box, ButtonBase, LinearProgress, Typography } from '@mui/material';
import BackIconButton from '../../../../components/BackIconButton';
import { LIB_TRACKING, useLibraryPalette } from '../../../dashboard/components/libraryStyle';
import { FONT_SIZES, FONT_WEIGHTS, RADII_PX, SIZES, withAlpha } from '../../../../app/design/designTokens';

const SELECTED_ROW_ALPHA = 0.05;

// Topics with no questions yet show no count; the learner can still open them to read.
const topicCount = (topic) => (topic.total === 0 ? '' : `${topic.solved}/${topic.total}`);

const TRACK_ALPHA = 0.1;

// How far the learner is in a topic, as a thin bar under its name (shown only when the topic has questions).
function TopicProgress({ topic, pal }) {
  if (topic.total === 0) return null;
  return <LinearProgress variant="determinate" color="success" value={(topic.solved / topic.total) * 100} aria-label={`${topic.solved} of ${topic.total} solved`} sx={{ height: SIZES.progressBarHeight, borderRadius: RADII_PX.pill, bgcolor: withAlpha(pal.text, TRACK_ALPHA) }} />;
}

function TopicRow({ topic, selected, onPick, pal }) {
  return (
    <ButtonBase
      onClick={() => onPick(topic.slug)}
      aria-current={selected ? 'page' : undefined}
      sx={{ display: 'grid', gridTemplateColumns: '1fr', justifyItems: 'stretch', gap: 0.75, width: SIZES.fill, px: 1.5, py: 1.25, borderRadius: RADII_PX.card, textAlign: 'left', fontFamily: 'inherit', letterSpacing: LIB_TRACKING, color: selected ? pal.text : pal.muted, bgcolor: selected ? withAlpha(pal.text, SELECTED_ROW_ALPHA) : 'transparent', '&:hover': { bgcolor: withAlpha(pal.text, SELECTED_ROW_ALPHA) } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        <Typography sx={{ fontSize: FONT_SIZES.body, fontWeight: selected ? FONT_WEIGHTS.semibold : FONT_WEIGHTS.medium, color: 'inherit' }}>{topic.title}</Typography>
        <Typography variant="caption" sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums', color: pal.muted }}>{topicCount(topic)}</Typography>
      </Box>
      <TopicProgress topic={topic} pal={pal} />
    </ButtonBase>
  );
}

// Left column of the desktop topic and practice pages: the back icon (it goes to the Aptitude home unless `backTo` says
// otherwise) and a soft grey menu card listing the topics of this pattern: a centred title with a hairline under it, and
// rows where the open topic has a slightly darker fill. Picking a topic opens its content in the middle.
export default function TopicsNav({ topics, activeSlug, onPick, backTo = '/aptitude', backLabel = 'Back to Aptitude' }) {
  const pal = useLibraryPalette();
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box><BackIconButton to={backTo} label={backLabel} /></Box>
      <Box
        component="nav"
        aria-label="Topics"
        sx={(theme) => ({ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5, overflowY: 'auto', borderRadius: RADII_PX.dialog, bgcolor: pal.chip, border: `1px solid ${pal.border}`, maxHeight: `calc(100vh - ${SIZES.desktopFrame.stickyTop}px - ${theme.spacing(10)})` })}
      >
        <Typography component="h2" sx={{ textAlign: 'center', fontSize: FONT_SIZES.body, fontWeight: FONT_WEIGHTS.bold, color: pal.text, pt: 0.5, pb: 1.5, mb: 0.5, borderBottom: `1px solid ${pal.divider}` }}>Topics</Typography>
        {topics.map((topic) => <TopicRow key={topic.slug} topic={topic} selected={topic.slug === activeSlug} onPick={onPick} pal={pal} />)}
      </Box>
    </Box>
  );
}
