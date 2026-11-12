import { Link as RouterLink } from 'react-router-dom';
import { Box } from '@mui/material';
import { jobProfilePathOf } from '../../jobProfile/common/jobProfilePaths';

const linkSx = { color: 'inherit', textDecoration: 'none' };

// Opens the author's Job profile. Anonymous posts have no author, so their avatar and name are plain content.
export default function AuthorLink({ author, children, sx }) {
  if (!author) return <Box sx={sx}>{children}</Box>;
  return (
    <Box component={RouterLink} to={jobProfilePathOf(author._id)} sx={{ ...linkSx, ...sx }}>
      {children}
    </Box>
  );
}
