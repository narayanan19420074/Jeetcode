import { useLayoutEffect, useRef, useState } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import { TOPIC_ROW_H } from './libraryConstants';
import useLibraryStyles from './libraryStyles';
import { COLOR_PALETTE, FONT_WEIGHTS } from '../../../../app/design/designTokens';

const FADE_MASK = `linear-gradient(to right, ${COLOR_PALETTE.black} calc(100% - 130px), transparent calc(100% - 40px))`;

// True when the tags need more than one line, so the "Expand" toggle is needed.
function useTopicOverflow(listRef, tags) {
  const [overflowing, setOverflowing] = useState(false);
  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return undefined;
    const measure = () => setOverflowing(el.scrollHeight > TOPIC_ROW_H + 4);
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [listRef, tags]);
  return overflowing;
}

function TopicChip({ tag, count, on, onToggle }) {
  const styles = useLibraryStyles();
  return (
    <ButtonBase onClick={() => onToggle(tag)} aria-pressed={on} sx={styles.topicChip(on)}>
      <Typography variant="body2" sx={styles.topicLabel(on)}>
        {tag}
      </Typography>
      <Box sx={styles.topicCount(on)}>{count}</Box>
    </ButtonBase>
  );
}

function ExpandToggle({ expanded, onToggle }) {
  const Icon = expanded ? KeyboardDoubleArrowUpRoundedIcon : KeyboardDoubleArrowDownRoundedIcon;
  const placement = expanded ? { display: 'flex', ml: 'auto', mt: 0.25 } : { position: 'absolute', top: 0, right: 0 };
  return (
    <ButtonBase onClick={onToggle} aria-expanded={expanded} sx={{ gap: 0.25, height: TOPIC_ROW_H, fontFamily: 'inherit', color: 'text.secondary', ...placement }}>
      <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.bold }}>
        {expanded ? 'Collapse' : 'Expand'}
      </Typography>
      <Icon fontSize="small" />
    </ButtonBase>
  );
}

// One line of topic chips that fades out at the right edge; "Expand" shows every topic.
const listSx = (gap, expanded, collapsed) => ({
  display: 'flex',
  flexWrap: 'wrap',
  ...gap,
  overflow: 'hidden',
  maxHeight: expanded ? 'none' : TOPIC_ROW_H,
  pr: collapsed ? 12 : 0,
  maskImage: collapsed ? FADE_MASK : 'none',
  WebkitMaskImage: collapsed ? FADE_MASK : 'none',
});

export default function TopicRow({ tags, selected, onToggle }) {
  const styles = useLibraryStyles();
  const listRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const overflowing = useTopicOverflow(listRef, tags);

  if (!tags.length) return null;
  return (
    <Box sx={{ position: 'relative' }}>
      <Box ref={listRef} sx={listSx(styles.topicGap, expanded, !expanded && overflowing)}>
        {tags.map(({ tag, count }) => (
          <TopicChip key={tag} tag={tag} count={count} on={selected.includes(tag)} onToggle={onToggle} />
        ))}
      </Box>
      {overflowing && <ExpandToggle expanded={expanded} onToggle={() => setExpanded((v) => !v)} />}
    </Box>
  );
}
