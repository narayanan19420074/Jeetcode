import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom';
import { useMediaQuery } from '@mui/material';
import { SETTINGS_ITEMS, DEFAULT_SECTION } from './settingsNav';
import { SECTIONS } from './common/settingsSections';
import useSettingsGroups from './common/useSettingsGroups';
import SettingsDesktopView from './desktop/SettingsDesktopView';
import PhoneMenu from './mobile/PhoneMenu';
import PhoneSectionPage from './mobile/PhoneSectionPage';

// Thin entry: phones land on the settings list and open one section per screen; desktop jumps straight into a section.
export default function SettingsPage() {
  const user = useSelector((state) => state.auth.user);
  const section = useParams()['*']?.split('/')[0] || '';
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const menu = useSettingsGroups();

  if (!user) return null;
  if (isPhone && !section) return <PhoneMenu user={user} {...menu} />;
  if (!SECTIONS[section]) return <Navigate to={isPhone ? '/settings' : `/settings/${DEFAULT_SECTION}`} replace />;
  const current = SETTINGS_ITEMS.find((item) => item.key === section);
  if (isPhone) return <PhoneSectionPage section={section} current={current} />;
  return <SettingsDesktopView section={section} current={current} {...menu} />;
}
