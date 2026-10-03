import { useLayoutEffect, useRef, useState } from 'react';
import { Container, Typography } from '@mui/material';
import ProblemExplorer from '../../components/ProblemExplorer';

// The page itself never scrolls: the container is sized to exactly the space
// left under the navbar / banner, and only the problem list inside scrolls.
export default function ProblemsPage() {
  const ref = useRef(null);
  const [height, setHeight] = useState(null);

  useLayoutEffect(() => {
    const measure = () => {
      if (!ref.current) return;
      const top = ref.current.getBoundingClientRect().top + window.scrollY;
      setHeight(Math.max(window.innerHeight - top, 360));
    };
    measure();
    window.addEventListener('resize', measure);
    // The free-access banner loads async and pushes the page down.
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro) ro.observe(document.body);
    return () => {
      window.removeEventListener('resize', measure);
      if (ro) ro.disconnect();
    };
  }, []);

  return (
    <Container
      ref={ref}
      maxWidth="lg"
      sx={{
        height: height ?? 'auto',
        display: 'flex',
        flexDirection: 'column',
        py: { xs: 1.5, sm: 3 },
        overflow: 'hidden',
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 800, mb: { xs: 1.5, sm: 2 }, flexShrink: 0 }}>
        Problems
      </Typography>

      <ProblemExplorer pageSize={20} />
    </Container>
  );
}
