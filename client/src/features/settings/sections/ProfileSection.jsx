import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Avatar, Box, Button, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useSnackbar } from 'notistack';
import { usersApi } from '../../../api/usersApi';
import { userUpdated } from '../../auth/authSlice';
import { Card, CardBody, PageTitle, describeError, initialsFromName } from '../components/SettingsUi';

const SOCIALS = [
  { key: 'github', label: 'GitHub', prefix: 'github.com/' },
  { key: 'linkedin', label: 'LinkedIn', prefix: 'linkedin.com/in/' },
  { key: 'x', label: 'X (Twitter)', prefix: 'x.com/' },
  { key: 'leetcode', label: 'LeetCode', prefix: 'leetcode.com/u/' },
];

const fromUser = (u) => ({
  name: u.name || '',
  bio: u.bio || '',
  location: u.location || '',
  company: u.company || '',
  website: u.website || '',
  avatarUrl: u.avatarUrl || '',
  socials: { github: '', linkedin: '', x: '', leetcode: '', ...(u.socials || {}) },
});

export default function ProfileSection() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const user = useSelector((s) => s.auth.user);
  const [form, setForm] = useState(() => fromUser(user));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const saved = useMemo(() => fromUser(user), [user]);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setSocial = (k) => (e) => setForm((f) => ({ ...f, socials: { ...f.socials, [k]: e.target.value.trim() } }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { data } = await usersApi.updateProfile({
        name: form.name,
        bio: form.bio,
        location: form.location,
        company: form.company,
        website: form.website,
        avatarUrl: form.avatarUrl || null,
        socials: form.socials,
      });
      dispatch(userUpdated(data.data));
      setForm(fromUser(data.data));
      enqueueSnackbar('Profile updated', { variant: 'success' });
    } catch (err) {
      setError(describeError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <PageTitle title="Public profile" description="This is how you appear around JeetCode. Everything here is optional except your name." />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'minmax(0,1fr) 200px' }, gap: 3, alignItems: 'start', mb: 3 }}>
        {/* Fields */}
        <Stack spacing={2.25} sx={{ order: { xs: 2, sm: 1 } }}>
          <TextField label="Name" value={form.name} onChange={set('name')} required fullWidth slotProps={{ htmlInput: { maxLength: 80 } }} helperText="Shown in the navigation bar and on your dashboard." />
          <TextField label="Email" value={user.email || ''} fullWidth disabled helperText="Your sign-in email. It isn't shown publicly." />
          <TextField
            label="Bio"
            value={form.bio}
            onChange={set('bio')}
            fullWidth
            multiline
            minRows={3}
            slotProps={{ htmlInput: { maxLength: 160 } }}
            placeholder="Tell people a little about yourself"
            helperText={`${form.bio.length}/160`}
          />
          <TextField label="Location" value={form.location} onChange={set('location')} fullWidth slotProps={{ htmlInput: { maxLength: 60 } }} placeholder="Coimbatore, India" />
          <TextField label="College / Company" value={form.company} onChange={set('company')} fullWidth slotProps={{ htmlInput: { maxLength: 60 } }} />
          <TextField label="Website" value={form.website} onChange={set('website')} fullWidth placeholder="https://" slotProps={{ htmlInput: { maxLength: 200, inputMode: 'url' } }} />
        </Stack>

        {/* Avatar */}
        <Box sx={{ order: { xs: 1, sm: 2 } }}>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
            Profile picture
          </Typography>
          <Stack direction={{ xs: 'row', sm: 'column' }} sx={{ alignItems: { xs: 'center', sm: 'stretch' }, gap: 1.5 }}>
            <Avatar src={form.avatarUrl || undefined} alt="Profile picture preview" sx={{ width: { xs: 88, sm: 168 }, height: { xs: 88, sm: 168 }, fontSize: { xs: 30, sm: 56 }, fontWeight: 700, bgcolor: 'primary.main', color: 'primary.contrastText', border: '1px solid', borderColor: 'divider' }}>
              {initialsFromName(form.name)}
            </Avatar>
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<GitHubIcon />}
                disabled={!form.socials.github}
                onClick={() => setForm((f) => ({ ...f, avatarUrl: `https://github.com/${f.socials.github}.png` }))}
                sx={{ color: 'text.primary', borderColor: 'divider' }}
              >
                Use GitHub photo
              </Button>
              <Button size="small" color="inherit" disabled={!form.avatarUrl} onClick={() => setForm((f) => ({ ...f, avatarUrl: '' }))}>
                Remove photo
              </Button>
            </Stack>
          </Stack>
          <TextField
            size="small"
            label="Image URL"
            value={form.avatarUrl}
            onChange={set('avatarUrl')}
            fullWidth
            placeholder="https://…"
            sx={{ mt: 1.5 }}
            helperText="Paste a link to an image. Blank shows your initials."
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        </Box>
      </Box>

      <Card title="Social accounts" description="Link your coding profiles. Just the username — we add the rest.">
        <CardBody>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {SOCIALS.map((s) => (
              <TextField
                key={s.key}
                label={s.label}
                value={form.socials[s.key]}
                onChange={setSocial(s.key)}
                fullWidth
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>{s.prefix}</Typography></InputAdornment> }, htmlInput: { maxLength: 100 } }}
              />
            ))}
          </Box>
        </CardBody>
      </Card>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Button type="submit" variant="contained" disableElevation disabled={!dirty || saving || form.name.trim().length < 2} sx={{ fontWeight: 700, px: 3 }}>
          {saving ? <CircularProgress size={22} color="inherit" /> : 'Update profile'}
        </Button>
        {dirty && !saving && (
          <Button color="inherit" onClick={() => setForm(saved)}>
            Discard changes
          </Button>
        )}
        <Typography variant="body2" color="text.secondary" sx={{ ml: { sm: 'auto' } }}>
          Want a different username? <RouterLink to="/settings/account" style={{ color: 'inherit', fontWeight: 600 }}>Change it in Account</RouterLink>
        </Typography>
      </Stack>
    </Box>
  );
}
