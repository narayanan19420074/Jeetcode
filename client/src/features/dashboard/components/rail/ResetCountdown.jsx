import { useEffect, useState } from 'react';
import { Tooltip, Typography } from '@mui/material';
import { formatCountdown, msUntilDayEnd } from '../../dashboardUtils';
import { SOFT } from './railTokens';

export default function ResetCountdown() {
  const [ms, setMs] = useState(() => msUntilDayEnd());
  useEffect(() => {
    const id = setInterval(() => setMs(msUntilDayEnd()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <Tooltip title="Streak days change at midnight IST">
      <Typography role="timer" variant="caption" sx={{ color: SOFT, fontVariantNumeric: 'tabular-nums', cursor: 'default' }}>
        Today ends in {formatCountdown(ms)}
      </Typography>
    </Tooltip>
  );
}
