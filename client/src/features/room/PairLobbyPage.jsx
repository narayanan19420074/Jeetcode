import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Typography, Button, Select, MenuItem, TextField, Divider, CircularProgress, Alert } from '@mui/material';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import { roomApi } from '../../api/roomApi';
import { extractErrorMessage } from '../../api/apiClient';

export default function PairLobbyPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const { data } = await roomApi.create({ language });
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
        Friend ah invite pannu — rendu perum same code, chat, video/audio la.
      </Typography>

      <Stack spacing={2}>
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
