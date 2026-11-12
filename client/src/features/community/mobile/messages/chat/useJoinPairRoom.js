import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { roomApi } from '../../../../../api/roomApi';

// Pair rooms are temporary, so the room is checked before joining; an expired room shows a message instead of an empty page.
export default function useJoinPairRoom(roomId) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [isChecking, setIsChecking] = useState(false);

  const join = async () => {
    setIsChecking(true);
    try {
      await roomApi.get(roomId);
      navigate(`/room/${roomId}`);
    } catch {
      enqueueSnackbar('That room has expired. Ask for a fresh invitation.', { variant: 'info' });
      setIsChecking(false);
    }
  };

  return { join, isChecking };
}
