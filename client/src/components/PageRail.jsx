import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { usersApi } from '../api/usersApi';
import RightRail from '../features/dashboard/components/RightRail';

// Default right sidebar for every page: the same streak + calendar card as the dashboard.
export default function PageRail() {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setActivity([]);
      return;
    }
    usersApi.activity().then(({ data }) => setActivity(data.data)).catch(() => {});
  }, [isAuthenticated]);

  return <RightRail user={user} isAuthenticated={isAuthenticated} activity={activity} />;
}
