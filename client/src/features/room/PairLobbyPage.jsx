import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Alert, Box, Button, Chip, CircularProgress, Divider, InputAdornment, MenuItem, Paper, Select, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { wsSurface } from '../workspace/workspaceTheme';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
import { roomApi } from '../../api/roomApi';
import { aptitudeApi } from '../../api/aptitudeApi';
import { extractErrorMessage } from '../../api/apiClient';

const FEATURES = [
  { icon: <CodeRoundedIcon />, label: 'Shared editor' },
  { icon: <ChatBubbleOutlineRoundedIcon />, label: 'Live chat' },
  { icon: <VideocamRoundedIcon />, label: 'Video & audio' },
  { icon: <PlayArrowRoundedIcon />, label: 'Run together' },
  { icon: <KeyboardRoundedIcon />, label: 'Phone keys & auto-indent' },
];

function SectionLabel({ children }) {
  return (
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase' }}>
      {children}
    </Typography>
  );
}

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

  const createButton = (disabled) => (
    <Button
      fullWidth
      size="large"
      variant="contained"
      disableElevation
      onClick={create}
      disabled={busy || disabled}
      startIcon={busy ? <CircularProgress size={18} color="inherit" /> : <GroupAddRoundedIcon />}
      sx={{ height: 48, borderRadius: '14px', fontWeight: 700, textTransform: 'none' }}
    >
      Create room
    </Button>
  );

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', mt: { xs: 2, md: 6 }, mb: 4, px: 2 }}>
      <Paper variant="outlined" sx={{ borderRadius: '20px', p: { xs: 2.5, sm: 3.5 } }}>
        <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Box sx={(t) => ({ width: 48, height: 48, borderRadius: '16px', display: 'grid', placeItems: 'center', bgcolor: wsSurface(t).raised, color: 'primary.main' })}>
            <GroupAddRoundedIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Pair Room</Typography>
            <Typography variant="body2" color="text.secondary">Solve problems together, in real time.</Typography>
          </Box>
        </Stack>

        <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
          Invite a friend to work in the same editor or aptitude question, with built-in chat and video or audio calling.
        </Typography>

        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mb: 3 }}>
          {FEATURES.map((f) => (
            <Chip
              key={f.label}
              icon={f.icon}
              label={f.label}
              size="small"
              sx={(t) => ({ fontWeight: 600, bgcolor: wsSurface(t).raised, color: 'text.primary', '& .MuiChip-icon': { color: t.palette.primary.main, fontSize: 17 } })}
            />
          ))}
        </Stack>

        <SectionLabel>Start a new room</SectionLabel>
        <Stack spacing={1.75}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={mode}
            onChange={(_, v) => v && setMode(v)}
            sx={(t) => ({
              p: 0.5,
              gap: 0.5,
              borderRadius: 999,
              bgcolor: wsSurface(t).raised,
              '& .MuiToggleButtonGroup-grouped': {
                border: 0,
                borderRadius: '999px !important',
                py: 0.9,
                gap: 0.75,
                fontWeight: 700,
                textTransform: 'none',
                color: 'text.secondary',
                '& svg': { fontSize: 19 },
                '&.Mui-selected': { bgcolor: 'background.paper', color: 'primary.main', boxShadow: `0 1px 3px ${alpha(t.palette.common.black, 0.18)}` },
                '&.Mui-selected:hover': { bgcolor: 'background.paper' },
              },
            })}
          >
            <ToggleButton value="code"><CodeRoundedIcon />Code</ToggleButton>
            <ToggleButton value="aptitude"><CalculateRoundedIcon />Aptitude</ToggleButton>
          </ToggleButtonGroup>

          {mode === 'code' && (
            <>
              <Select
                fullWidth
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                startAdornment={<CodeRoundedIcon sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />}
                sx={{ height: 48, borderRadius: '14px', fontWeight: 600 }}
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
              </Select>
              {createButton(false)}
            </>
          )}

          {mode === 'aptitude' &&
            (isAuthenticated ? (
              <>
                <Select
                  fullWidth
                  displayEmpty
                  value={patternSlug}
                  onChange={(e) => setPatternSlug(e.target.value)}
                  startAdornment={<CalculateRoundedIcon sx={{ fontSize: 20, mr: 1, color: 'primary.main' }} />}
                  sx={{ height: 48, borderRadius: '14px', fontWeight: 600 }}
                >
                  {patterns.length === 0 && <MenuItem value="">Loading topics…</MenuItem>}
                  {patterns.map((p) => (
                    <MenuItem key={p.slug} value={p.slug}>{p.title}</MenuItem>
                  ))}
                </Select>
                {createButton(!patternSlug)}
              </>
            ) : (
              <Alert severity="info" sx={{ borderRadius: '14px' }}>
                Sign in to create an aptitude room. Your friend doesn&apos;t need an account — they can join with the invite link.
              </Alert>
            ))}

          {error && <Alert severity="error" sx={{ borderRadius: '14px' }}>{error}</Alert>}
        </Stack>

        <Divider sx={{ my: 3, color: 'text.secondary', fontSize: '0.8rem', fontWeight: 700 }}>OR JOIN A ROOM</Divider>

        <Stack direction="row" spacing={1}>
          <TextField
            fullWidth
            placeholder="Room code or invite link"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && join()}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
                sx: { height: 48, borderRadius: '14px' },
              },
            }}
          />
          <Button variant="outlined" onClick={join} disabled={!code.trim()} startIcon={<LoginRoundedIcon />} sx={{ height: 48, px: 2.5, borderRadius: '14px', fontWeight: 700, textTransform: 'none', flexShrink: 0 }}>
            Join
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
