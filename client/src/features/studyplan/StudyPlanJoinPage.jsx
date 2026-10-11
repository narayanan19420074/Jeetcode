import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Paper, Typography, Button, Stack, Chip, CircularProgress, Alert, Box } from '@mui/material';
import { studyPlanApi } from '../../api/studyPlanApi';
import { extractErrorMessage } from '../../api/apiClient';

// Opened from an invite link: /plans/join/:code (route is behind ProtectedRoute,
// so logged-out visitors sign in first and then land back here).
export default function StudyPlanJoinPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    studyPlanApi.previewJoin(code).then(({ data }) => setPreview(data.data)).catch((err) => setError(extractErrorMessage(err)));
  }, [code]);

  const join = async () => {
    setJoining(true);
    try {
      const { data } = await studyPlanApi.join(code);
      navigate(`/plans/${data.data.id}`, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err));
      setJoining(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {!preview && !error && <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>}
      {preview && (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
          <Typography variant="overline" color="text.secondary">
            {preview.owner ? `@${preview.owner.handle} invited you to` : 'You are invited to'}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>{preview.title}</Typography>
          {preview.description && <Typography color="text.secondary" sx={{ mb: 1 }}>{preview.description}</Typography>}
          <Stack direction="row" spacing={1} sx={{ my: 2 }}>
            <Chip label={`${preview.durationDays} days`} variant="outlined" />
            <Chip label={`${preview.taskCount} tasks`} variant="outlined" />
            <Chip label={`${preview.memberCount} member${preview.memberCount === 1 ? '' : 's'}`} variant="outlined" />
          </Stack>
          {preview.alreadyMember ? (
            <Button variant="contained" disableElevation onClick={() => navigate(`/plans/${preview.id}`)}>Open plan</Button>
          ) : preview.isFull ? (
            <Alert severity="warning">This plan is full.</Alert>
          ) : (
            <Button variant="contained" disableElevation disabled={joining} onClick={join} sx={{ fontWeight: 700 }}>
              {joining ? 'Joining…' : 'Join plan'}
            </Button>
          )}
        </Paper>
      )}
    </Container>
  );
}
