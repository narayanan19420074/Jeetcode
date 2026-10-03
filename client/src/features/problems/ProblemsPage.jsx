import { Container } from '@mui/material';
import ProblemExplorer from '../../components/ProblemExplorer';

// The page scrolls normally. The old version measured the viewport and
// locked the container to a fixed height with overflow hidden, which let
// the filters eat all the space and left the problem list with ~0px.
export default function ProblemsPage() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 }, pb: { xs: 4, sm: 6 } }}>
      <ProblemExplorer pageSize={20} title="Problems" />
    </Container>
  );
}
