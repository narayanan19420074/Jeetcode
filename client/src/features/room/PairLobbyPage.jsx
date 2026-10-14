import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, Stack, Typography, Button, Select, MenuItem, TextField, Divider, CircularProgress, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import { roomApi } from '../../api/roomApi';
import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';

export default function PairLobbyPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const [mode, setMode] = useState('code'); // code | aptitude
  const [language, setLanguage] = useState('javascript');
  const [patterns, setPatterns] = useState([]);
  const [patternSlug, setPatternSlug] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // aptitude rooms: only the topics this user has unlocked
  useEffect(() => {
    if (mode !== 'aptitude' || !isAuthenticated || patterns.length) return;
    aptitudeApi
      .listPatterns()
      .then(({ data }) => {
        const open = (data.data.items || []).filter((p) => p.progress?.unlocked !== false);
        setPatterns(open);
        setPatternSlug((cur) => cur || open[0]?.slug || '');
      })
      .catch((e) => setError(extractErrorMessage(e)));
  }, [mode, isAuthenticated, patterns.length]);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const { data } = await roomApi.create(mode === 'aptitude' ? { kind: 'aptitude', patternSlug } : { language });
      navigate(`/room/${data.data.roomId}`);
    } catch (e) {
      setError(extractErrorMessage(e));
      setBusy(false);
    }
  };

  const join = () => {
    const id = code.trim().split('/').filter(Boolean).pop();
    if (id) navigate(`/room/${id.replace('#', '')}`);
  };

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 6, px: 2 }}>
      <Typography variant="h4" sx={{ mb: 0.5 }}>Pair Room</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Friend ah invite pannu — rendu perum same code (illa aptitude question), chat, video/audio la.
      </Typography>

      <Stack spacing={2}>
        <ToggleButtonGroup exclusive fullWidth size="small" value={mode} onChange={(_, v) => v && setMode(v)}>
          <ToggleButton value="code">Code</ToggleButton>
          <ToggleButton value="aptitude">Aptitude</ToggleButton>
        </ToggleButtonGroup>

        {mode === 'code' && (
          <Stack direction="row" spacing={1}>
            <Select size="small" value={language} onChange={(e) => setLanguage(e.target.value)} sx={{ minWidth: 140 }}>
              <MenuItem value="javascript">JavaScript</MenuItem>
              <MenuItem value="python">Python</MenuItem>
              <MenuItem value="cpp">C++</MenuItem>
            </Select>
            <Button fullWidth variant="contained" disableElevation onClick={create} disabled={busy} startIcon={busy ? <CircularProgress size={16} /> : <GroupAddRoundedIcon />}>
              Create room
            </Button>
          </Stack>
        )}

        {mode === 'aptitude' && (
          isAuthenticated ? (
            <Stack direction="row" spacing={1}>
              <Select size="small" displayEmpty value={patternSlug} onChange={(e) => setPatternSlug(e.target.value)} sx={{ minWidth: 140, flex: 1 }}>
                {patterns.length === 0 && <MenuItem value="">Loading topics…</MenuItem>}
                {patterns.map((p) => (
                  <MenuItem key={p.slug} value={p.slug}>{p.title}</MenuItem>
                ))}
              </Select>
              <Button variant="contained" disableElevation onClick={create} disabled={busy || !patternSlug} startIcon={busy ? <CircularProgress size={16} /> : <GroupAddRoundedIcon />}>
                Create room
              </Button>
            </Stack>
          ) : (
            <Alert severity="info">Aptitude room create panna login pannunga. Friend-ku account vendam, link la join pannalaam.</Alert>
          )
        )}
        {error && <Alert severity="error">{error}</Alert>}

        <Divider>or</Divider>

        <Stack direction="row" spacing={1}>
          <TextField size="small" fullWidth placeholder="Room code or invite link" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && join()} />
          <Button variant="outlined" onClick={join} disabled={!code.trim()}>Join</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
