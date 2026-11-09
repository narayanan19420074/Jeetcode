import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import useCommunityFeed from './useCommunityFeed';

// State shared by the phone and desktop feed views: active tab, the feed itself and the compose dialog.
export default function useCommunityPage() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [category, setCategory] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const feed = useCommunityFeed(category);

  // Writing needs an account; guests are sent to sign in and come back here.
  const openCompose = () => {
    if (!isAuthenticated) return navigate('/login', { state: { from: { pathname } } });
    setComposeOpen(true);
  };

  return { category, setCategory, feed, composeOpen, openCompose, closeCompose: () => setComposeOpen(false) };
}
