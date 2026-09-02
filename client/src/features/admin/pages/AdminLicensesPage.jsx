import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import { adminApi } from '../../../api/adminApi';
import { extractErrorMessage } from '../../../api/apiClient';

// Admin generates one key at a time — either lifetime or a fixed number
// of days from the moment of activation (not from generation), matching
// how License.expiresAt is written to User.proExpiresAt on activate.
const DURATION_PRESETS = [
  { value: 'lifetime', label: 'Lifetime' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
  { value: '365', label: '1 year' },
];

export default function AdminLicensesPage() {
  const [duration, setDuration] = useState('lifetime');
  const [note, setNote] = useState('');
  const [generating, setGenerating] = useState(false);
  const [lastGeneratedKey, setLastGeneratedKey] = useState(null);
  const [error, setError] = useState(null);

  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLicenses = useCallback(() => {
    setLoading(true);
    adminApi
      .listLicenses()
      .then(({ data }) => setLicenses(data.data.items))
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadLicenses();
  }, [loadLicenses]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      // duration is a days-from-now offset computed client-side; the
      // backend just stores whatever absolute expiresAt it's given.
      const expiresAt =
        duration === 'lifetime' ? null : new Date(Date.now() + Number(duration) * 86400000).toISOString();
      const { data } = await adminApi.generateLicense({ count: 1, expiresAt, note: note || undefined });
      setLastGeneratedKey(data.data.items[0]);
      setNote('');
      loadLicenses();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (key) => {
    navigator.clipboard?.writeText(key);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
        License Keys
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Generate Pro activation keys and track who has redeemed them.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <VpnKeyRoundedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Generate a key
              </Typography>
            </Stack>

            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Duration
            </Typography>
            <ToggleButtonGroup
              value={duration}
              exclusive
              onChange={(e, v) => v && setDuration(v)}
              size="small"
              sx={{ mb: 2, flexWrap: 'wrap' }}
            >
              {DURATION_PRESETS.map((p) => (
                <ToggleButton key={p.value} value={p.value} sx={{ fontWeight: 600, textTransform: 'none' }}>
                  {p.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <TextField
              fullWidth
              size="small"
              label="Note (optional, admin-only)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Trichy college outreach"
              sx={{ mb: 2 }}
            />

            <Button
              fullWidth
              variant="contained"
              disableElevation
              onClick={handleGenerate}
              disabled={generating}
              sx={{ fontWeight: 700 }}
            >
              {generating ? <CircularProgress size={20} color="inherit" /> : 'Generate key'}
            </Button>

            {lastGeneratedKey && (
              <Paper
                variant="outlined"
                sx={{ mt: 2.5, p: 2, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{lastGeneratedKey}</Typography>
                <Tooltip title="Copy">
                  <IconButton size="small" onClick={() => handleCopy(lastGeneratedKey)}>
                    <ContentCopyRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Paper>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Issued keys
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : licenses.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No keys generated yet.
              </Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Key</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Redeemed by</TableCell>
                    <TableCell align="right">Expires</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {licenses.map((l) => (
                    <TableRow key={l._id} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{l.key}</TableCell>
                      <TableCell>
                        <Chip
                          label={l.isUsed ? 'Used' : 'Unused'}
                          size="small"
                          color={l.isUsed ? 'default' : 'success'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{l.usedBy ? `${l.usedBy.name} (@${l.usedBy.handle})` : '—'}</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>
                        {l.expiresAt ? new Date(l.expiresAt).toLocaleDateString() : 'Lifetime'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
