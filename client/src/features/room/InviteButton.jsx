import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import { useSnackbar } from 'notistack';
import { roomApi } from '../../api/roomApi';
import { extractErrorMessage } from '../../api/apiClient';
import { WsIconButton } from '../workspace/wsUi';

// Drop into the WorkspacePage toolbar: creates a room seeded with the current code.
export default function InviteButton({ problem, language, code, size = 'md' }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [busy, setBusy] = useState(false);

  const invite = async () => {
    if (!problem || busy) return;
    setBusy(true);
    try {
      const starters = problem.starterCode || {};
      const { data } = await roomApi.create({
        language,
        problemSlug: problem.slug,
        title: problem.title,
        starters: { javascript: starters.javascript, python: starters.python, cpp: starters.cpp },
        initialCode: code,
      });
      navigate(`/room/${data.data.roomId}`);
    } catch (e) {
      enqueueSnackbar(extractErrorMessage(e), { variant: 'error' });
      setBusy(false);
    }
  };

  return (
    <WsIconButton title="Code together with a friend" size={size} onClick={invite} disabled={busy || !problem} aria-label="Invite a friend">
      {busy ? <CircularProgress size={16} /> : <GroupAddRoundedIcon />}
    </WsIconButton>
  );
}
