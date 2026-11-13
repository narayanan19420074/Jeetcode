import { useEffect, useState } from 'react';
import { usersApi } from '../../../api/usersApi';

// Days on which the signed-in person submitted a solution; they are the green days of the streak calendar. Guests have none.
export default function useActivityDays(isAuthenticated) {
  const [activity, setActivity] = useState([]);
  useEffect(() => {
    if (!isAuthenticated) {
      setActivity([]);
      return;
    }
    usersApi.activity().then(({ data }) => setActivity(data.data)).catch(() => {});
  }, [isAuthenticated]);
  return activity;
}
