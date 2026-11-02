import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { LIB_TRACKING, libSectionTitleSx, useLibraryPalette } from '../../components/libraryStyle';
import { panelSx, pillButtonSx } from './problemsStyles';

const savedLabel = (count) => (count === 1 ? '1 saved problem' : `${count} saved problems`);

// Entry point to the learner's saved problem lists.
export default function ListsPanel({ savedCount }) {
  const palette = useLibraryPalette();
  return (
    <Box sx={panelSx(palette)}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <StarRoundedIcon sx={{ color: 'warning.main' }} />
        <Typography component="h2" sx={libSectionTitleSx}>My lists</Typography>
      </Stack>
      <Typography sx={{ mt: 1, fontSize: 15, letterSpacing: LIB_TRACKING, color: palette.muted }}>{savedLabel(savedCount)}</Typography>
      <Button component={RouterLink} to="/dashboard?view=list&list=favorite" fullWidth disableElevation sx={[pillButtonSx(false, palette), { mt: 2 }]}>
        Open my lists
      </Button>
    </Box>
  );
}
