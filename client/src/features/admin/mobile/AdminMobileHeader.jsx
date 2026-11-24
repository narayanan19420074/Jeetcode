import { Box } from '@mui/material';
import AdminAccountMenu from '../common/AdminAccountMenu';
import AdminBrand from '../common/AdminBrand';
import ThemeModeButton from '../common/ThemeModeButton';
import { SIZES } from '../../../app/design/designTokens';
import { libIconBtnSx } from '../../dashboard/components/libraryStyle';

const headerSx = (theme) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: SIZES.iconButton.mobile,
  px: { xs: 2, sm: 3 },
  pt: `calc(env(safe-area-inset-top) + ${theme.spacing(1.5)})`,
});

// Top of every admin page on a phone, like the learner home header: the product name on the left, the theme
// switch (a round tonal button) and the account menu on the right. It scrolls away with the page.
export default function AdminMobileHeader() {
  return (
    <Box sx={headerSx}>
      <AdminBrand />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ThemeModeButton sx={libIconBtnSx} />
        <AdminAccountMenu />
      </Box>
    </Box>
  );
}
