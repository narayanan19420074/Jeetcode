import { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import { apiClient } from '../api/apiClient';

export default function FreeAccessBanner() {
  const [until, setUntil] = useState(null);

  useEffect(() => {
    apiClient
      .get('/health')
      .then((res) => {
        const d = res.data?.freeAccessUntil ? new Date(res.data.freeAccessUntil) : null;
        if (d && d > new Date()) setUntil(d);
      })
      .catch(() => {});
  }, []);

  if (!until) return null;

  const dateText = until.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <Alert severity="success" icon={false} sx={{ borderRadius: 0, justifyContent: 'center', py: 0.5 }}>
      🎉 Launch offer: Login pannina ellaarukkum <b>Pro free</b> till {dateText}!
    </Alert>
  );
}
