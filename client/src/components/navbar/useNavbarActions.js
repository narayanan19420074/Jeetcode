import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../features/auth/authSlice';

// State and handlers shared by the top bar, the phone menu and the account dropdown.
// Every navigation closes the phone menu first so it never stays open over the next page.
export default function useNavbarActions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);
  const goTo = (path) => () => {
    closeDrawer();
    navigate(path);
  };
  const logout = async () => {
    closeDrawer();
    await dispatch(logoutUser());
    navigate('/');
  };
  const openLicenseModal = () => {
    closeDrawer();
    setLicenseModalOpen(true);
  };

  return {
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer,
    licenseModalOpen,
    closeLicenseModal: () => setLicenseModalOpen(false),
    openLicenseModal,
    goToProfile: goTo('/you'),
    goToSettings: goTo('/settings'),
    goToHelp: goTo('/help'),
    logout,
  };
}
