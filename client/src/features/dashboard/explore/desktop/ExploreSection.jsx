import { Stack, Typography } from '@mui/material';
import { libSectionTitleSx } from '../../components/libraryStyle';

export default function ExploreSection({ title, children }) {
  return (
    <Stack spacing={1.5} component="section" aria-label={title}>
      <Typography component="h2" sx={libSectionTitleSx}>{title}</Typography>
      {children}
    </Stack>
  );
}
