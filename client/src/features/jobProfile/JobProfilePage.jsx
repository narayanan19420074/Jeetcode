import { useMediaQuery, useTheme } from '@mui/material';
import JobProfileDialogs from './common/JobProfileDialogs';
import useJobProfileEditor from './common/useJobProfileEditor';
import JobProfileDesktopView from './desktop/JobProfileDesktopView';
import JobProfileMobileView from './mobile/JobProfileMobileView';

// Thin entry: loads the profile once and picks the phone or desktop layout.
export default function JobProfilePage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const editor = useJobProfileEditor();
  const View = isMobile ? JobProfileMobileView : JobProfileDesktopView;

  return (
    <>
      <View editor={editor} />
      <JobProfileDialogs editor={editor} />
    </>
  );
}
