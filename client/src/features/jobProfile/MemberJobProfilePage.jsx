import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
import useMemberJobProfile from './common/useMemberJobProfile';
import { OWN_JOB_PROFILE_PATH } from './common/jobProfilePaths';
import JobProfileDesktopView from './desktop/JobProfileDesktopView';
import JobProfileMobileView from './mobile/JobProfileMobileView';

function MemberJobProfileScreen({ userId }) {
  const isMobile = useMediaQuery(useTheme().breakpoints.down('md'));
  const viewer = useMemberJobProfile(userId);
  const View = isMobile ? JobProfileMobileView : JobProfileDesktopView;
  return <View editor={viewer} />;
}

// Another member's Job profile, opened from their name or photo in the Community feed. Opening your own
// profile this way leads to the editable page instead.
export default function MemberJobProfilePage() {
  const { userId } = useParams();
  const ownId = useSelector((state) => state.auth.user?.id);
  if (userId === ownId) return <Navigate to={OWN_JOB_PROFILE_PATH} replace />;
  return <MemberJobProfileScreen userId={userId} />;
}
