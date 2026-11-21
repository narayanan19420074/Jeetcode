import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import XIcon from '@mui/icons-material/X';

const SOCIAL_NETWORKS = [
  { key: 'github', icon: GitHubIcon, base: 'https://github.com/', label: 'GitHub' },
  { key: 'linkedin', icon: LinkedInIcon, base: 'https://www.linkedin.com/in/', label: 'LinkedIn' },
  { key: 'x', icon: XIcon, base: 'https://x.com/', label: 'X' },
];

// Only the networks the user filled in are shown.
export const socialLinksOf = (user) => SOCIAL_NETWORKS.filter((network) => user.socials?.[network.key]);
