import { Alert, Box, TextField, Typography } from '@mui/material';
import { Card, PageTitle, Row, SwitchRow, usePreferences } from '../components/SettingsUi';

export default function NotificationsSection() {
  const { prefs, set } = usePreferences();
  const n = prefs.notifications;
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <Box>
      <PageTitle title="Notifications" description="Choose which emails you'd like from JeetCode." />

      <Alert severity="info" variant="outlined" sx={{ mb: 3, borderColor: 'divider' }}>
        Your choices are saved to your account now. Email delivery isn't switched on yet, so nothing is sent until it is — your preferences will be honoured from the first email.
      </Alert>

      <Card title="Email me about">
        <SwitchRow title="Streak reminders" description="A nudge if you haven't practised yet today and your streak is at risk." checked={n.streakReminder} onChange={(v) => set('notifications', { streakReminder: v, timezone: n.timezone || browserTz })} />
        {n.streakReminder && (
          <Row
            title="Reminder time"
            description={`Local time in ${n.timezone || browserTz}.`}
            control={
              <TextField
                type="time"
                size="small"
                value={n.reminderTime}
                onChange={(e) => e.target.value && set('notifications', { reminderTime: e.target.value, timezone: n.timezone || browserTz })}
                slotProps={{ htmlInput: { 'aria-label': 'Reminder time' } }}
                sx={{ width: 150 }}
              />
            }
          />
        )}
        <SwitchRow title="Weekly progress digest" description="Problems solved, aptitude scores and streak, once a week." checked={n.weeklyDigest} onChange={(v) => set('notifications', { weeklyDigest: v })} />
        <SwitchRow title="Achievements" description="Badges, rank-ups and level clears." checked={n.achievements} onChange={(v) => set('notifications', { achievements: v })} />
        <SwitchRow title="Product updates" description="New features and occasional announcements." checked={n.productUpdates} onChange={(v) => set('notifications', { productUpdates: v })} />
      </Card>

      <Card title="Always on">
        <SwitchRow title="Security alerts" badge="Required" description="New sign-ins, password and username changes. These can't be turned off." checked disabled onChange={() => {}} />
      </Card>
      <Typography variant="caption" color="text.secondary">
        Emails go to your account address. You can change what you receive at any time.
      </Typography>
    </Box>
  );
}
