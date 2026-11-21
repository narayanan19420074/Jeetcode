import { Box, Paper, Stack, Typography } from '@mui/material';
import AchievementBadge from '../AchievementBadge';
import { SectionTitle, cardSx } from './YouParts';

const scrollRowSx = { display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5, mx: -0.5, px: 0.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } };

export default function YouAchievements({ badges, earnedCount }) {
  return (
    <Paper variant="outlined" sx={{ ...cardSx, mt: 1.5 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
        <SectionTitle>Achievements</SectionTitle>
        <Typography variant="caption" color="text.secondary">
          {earnedCount}/{badges.length} earned
        </Typography>
      </Stack>
      <Box sx={scrollRowSx}>
        {badges.map(({ key, ...badge }) => (
          <AchievementBadge key={key} {...badge} />
        ))}
      </Box>
    </Paper>
  );
}
