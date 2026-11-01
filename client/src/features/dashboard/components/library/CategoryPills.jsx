import { Box, ButtonBase, IconButton, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { sameSet } from './libraryConstants';
import useLibraryStyles from './libraryStyles';
import usePillScroller from './usePillScroller';

const ROW_SX = {
  display: 'flex',
  gap: 1,
  width: '100%',
  minWidth: 0,
  py: 0.5,
  overflowX: 'auto',
  overflowY: 'hidden',
  touchAction: 'pan-x pan-y',
  overscrollBehaviorX: 'contain',
  WebkitOverflowScrolling: 'touch',
  scrollbarWidth: 'none',
  '&::-webkit-scrollbar': { display: 'none' },
  userSelect: 'none',
};

const arrowSx = (dir) => (t) => ({
  display: { xs: 'none', sm: 'inline-flex' },
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  [dir < 0 ? 'left' : 'right']: 0,
  zIndex: 2,
  bgcolor: t.palette.background.paper,
  border: `1px solid ${t.palette.divider}`,
  '&:hover': { bgcolor: t.palette.background.paper },
});

function ScrollArrow({ dir, onNudge }) {
  const Icon = dir < 0 ? ChevronLeftRoundedIcon : ChevronRightRoundedIcon;
  return (
    <IconButton size="small" aria-label={dir < 0 ? 'Scroll topics left' : 'Scroll topics right'} onClick={() => onNudge(dir)} sx={arrowSx(dir)}>
      <Icon fontSize="small" />
    </IconButton>
  );
}

function Pill({ active, onClick, dotColor, children }) {
  const styles = useLibraryStyles();
  return (
    <ButtonBase onClick={onClick} aria-pressed={active} sx={styles.pill(active)}>
      {dotColor && <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor }} />}
      <Typography variant="body2" sx={styles.pillText}>
        {children}
      </Typography>
    </ButtonBase>
  );
}

// "All Topics" plus one pill per group of related tags (Arrays & Hashing, Strings, ...).
export default function CategoryPills({ groups, selectedTags, onSelect, onClear }) {
  const { ref, edges, noTags, nudge, rowHandlers } = usePillScroller(groups, selectedTags);
  return (
    <Box sx={{ position: 'relative', width: '100%', minWidth: 0, maxWidth: '100%' }}>
      {edges.left && <ScrollArrow dir={-1} onNudge={nudge} />}
      <Box ref={ref} role="group" aria-label="Topic groups" {...rowHandlers} sx={ROW_SX}>
        <Pill active={noTags} onClick={onClear}>
          All Topics
        </Pill>
        {groups.map((g) => (
          <Pill key={g.key} active={sameSet(selectedTags, g.tags)} onClick={() => onSelect(g)} dotColor={g.color}>
            {g.label}
          </Pill>
        ))}
      </Box>
      {edges.right && <ScrollArrow dir={1} onNudge={nudge} />}
    </Box>
  );
}
