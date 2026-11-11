import { Fab } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { navActiveColor } from '../../../components/navbar/navLinkStyles';
import { SIZES } from '../../../app/design/designTokens';

// The only "New plan" action of the Study Plan page: a round button at the bottom right. On phones it sits above the tab bar.
const fabSx = (theme) => ({
  position: 'fixed',
  right: { xs: theme.spacing(2), md: theme.spacing(3) },
  bottom: { xs: `calc(${SIZES.bottomNavHeight}px + ${theme.spacing(3)} + env(safe-area-inset-bottom))`, md: theme.spacing(3) },
  bgcolor: navActiveColor(theme),
  color: theme.palette.common.white,
  '&:hover': { bgcolor: navActiveColor(theme) },
});

export default function NewPlanButton({ onClick }) {
  return (
    <Fab aria-label="New plan" onClick={onClick} sx={fabSx}>
      <AddRoundedIcon />
    </Fab>
  );
}
