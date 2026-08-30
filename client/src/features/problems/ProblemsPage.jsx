import { Container, Typography } from '@mui/material';
import ProblemExplorer from '../../components/ProblemExplorer';

export default function ProblemsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        Problems
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Browse, filter, and jump straight into any problem.
      </Typography>

      <ProblemExplorer pageSize={20} />
    </Container>
  );
}
