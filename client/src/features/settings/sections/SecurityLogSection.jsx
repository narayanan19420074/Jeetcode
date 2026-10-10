import { useEffect, useState } from 'react';
import { Alert, Box, Skeleton, Stack, Tooltip, Typography } from '@mui/material';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { usersApi } from '../../../api/usersApi';
import { Card, PageTitle, describeError, formatDateTime, relativeTime } from '../components/SettingsUi';

const EVENTS = {
  login: { label: 'Signed in', icon: LoginRoundedIcon },
  password_changed: { label: 'Password changed', icon: KeyRoundedIcon },
  password_set: { label: 'Password set', icon: KeyRoundedIcon },
  handle_changed: { label: 'Username changed', icon: BadgeRoundedIcon },
  session_revoked: { label: 'Signed out a device', icon: LogoutRoundedIcon },
  sessions_revoked_all: { label: 'Signed out all other devices', icon: LogoutRoundedIcon },
  data_exported: { label: 'Exported account data', icon: DownloadRoundedIcon },
};

export default function SecurityLogSection() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    usersApi
      .securityLog()
      .then(({ data }) => setItems(data.data))
      .catch((err) => {
        setError(describeError(err));
        setItems([]);
      });
  }, []);

  return (
    <Box>
      <PageTitle title="Security log" description="Recent security-related activity on your account (last 50 events)." />
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Card>
        {items === null && (
          <Box sx={{ p: 3 }}>
            <Skeleton height={44} />
            <Skeleton height={44} />
            <Skeleton height={44} />
          </Box>
        )}
        {items?.length === 0 && !error && (
          <Typography color="text.secondary" sx={{ p: 3 }}>
            Nothing recorded yet.
          </Typography>
        )}
        {items?.map((e, i) => {
          const def = EVENTS[e.type] || { label: e.type, icon: HistoryRoundedIcon };
          const Icon = def.icon;
          return (
            <Stack key={`${e.at}-${i}`} direction="row" sx={{ gap: 2, px: { xs: 2, sm: 3 }, py: 1.75, alignItems: 'center', borderBottom: i === items.length - 1 ? 'none' : '1px solid', borderColor: 'divider' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '10px', display: 'grid', placeItems: 'center', bgcolor: 'action.hover', flexShrink: 0 }}>
                <Icon fontSize="small" />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {def.label}
                  {e.detail && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ fontWeight: 400 }}>
                      {' '}
                      · {e.detail}
                    </Typography>
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {e.device}
                  {e.ip ? ` · ${e.ip}` : ''}
                </Typography>
              </Box>
              <Tooltip title={formatDateTime(e.at)}>
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                  {relativeTime(e.at)}
                </Typography>
              </Tooltip>
            </Stack>
          );
        })}
      </Card>
    </Box>
  );
}
