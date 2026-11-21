import { Link as RouterLink } from 'react-router-dom';
import { Avatar, Box, Chip, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ProBadge from '../../../components/ProBadge';
import { FONT_SIZES, FONT_WEIGHTS, SIZES } from '../../../app/design/designTokens';
import { initialsFromName, socialUrl } from '../common/youFormat';

export function YouSettingsLink() {
  return (
    <Stack direction="row" sx={{ justifyContent: 'flex-end', mb: 0.5 }}>
      <Tooltip title="Settings">
        <IconButton component={RouterLink} to="/settings" aria-label="Settings">
          <SettingsRoundedIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

export function YouIdentity({ user }) {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', mb: 2 }}>
      <Avatar src={user.avatarUrl || undefined} alt="" sx={{ width: SIZES.profileAvatar, height: SIZES.profileAvatar, fontSize: FONT_SIZES.displayLg, fontWeight: FONT_WEIGHTS.bold, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
        {initialsFromName(user.name)}
      </Avatar>
      <Box sx={{ minWidth: SIZES.flexShrinkMinWidth, flex: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography sx={{ fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.display, lineHeight: 1.2, wordBreak: 'break-word' }}>{user.name}</Typography>
          {user.isPro && <ProBadge />}
        </Stack>
        <Typography color="text.secondary">@{user.handle}</Typography>
        {user.bio && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            {user.bio}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function SocialIconLinks({ user, socials }) {
  return socials.map(({ key, icon: Icon, base, label }) => (
    <Tooltip key={key} title={label}>
      <IconButton size="small" component={Link} href={socialUrl(base, user.socials[key])} target="_blank" rel="noopener noreferrer" aria-label={label}>
        <Icon fontSize="small" />
      </IconButton>
    </Tooltip>
  ));
}

export function YouLinks({ user, socials }) {
  if (!user.location && !user.company && !user.website && socials.length === 0) return null;
  return (
    <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: 2, alignItems: 'center' }}>
      {user.location && <Chip size="small" icon={<PlaceRoundedIcon />} label={user.location} />}
      {user.company && <Chip size="small" icon={<ApartmentRoundedIcon />} label={user.company} />}
      {user.website && <Chip size="small" icon={<LinkRoundedIcon />} label="Website" component="a" href={socialUrl('https://', user.website)} target="_blank" rel="noopener noreferrer" clickable />}
      <SocialIconLinks user={user} socials={socials} />
    </Stack>
  );
}
