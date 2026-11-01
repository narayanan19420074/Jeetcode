import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studyPlanApi } from '../../../../api/studyPlanApi';
import { daysLeftInfo } from '../../../studyplan/planUtils';

// Unfinished plans grouped by their last day, so the calendar can mark it with a "P".
const groupPlansByEndDate = (plans) => {
  const map = new Map();
  plans.forEach((p) => {
    const end = p.summary?.endDate;
    if (!end || p.summary.status === 'completed') return;
    const entry = { id: p.id, title: p.title, left: daysLeftInfo(p.summary).text };
    map.set(end, [...(map.get(end) || []), entry]);
  });
  return map;
};

function useStudyPlans(isAuthenticated) {
  const [plans, setPlans] = useState([]);
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let alive = true;
    studyPlanApi
      .list()
      .then(({ data }) => alive && setPlans(data.data || []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [isAuthenticated]);
  return plans;
}

// Tapping a day with a plan opens that plan; when several plans end the same day, pick one from a menu first.
export default function useStudyPlanMarks(isAuthenticated, onNavigate) {
  const navigate = useNavigate();
  const plans = useStudyPlans(isAuthenticated);
  const plansByDate = useMemo(() => groupPlansByEndDate(plans), [plans]);
  const [planMenu, setPlanMenu] = useState(null); // { anchor, plans }

  const openPlan = (id) => {
    setPlanMenu(null);
    onNavigate?.();
    navigate(`/dashboard?view=plans&plan=${encodeURIComponent(id)}`);
  };
  const onOpenPlans = (list, anchor) => (list.length === 1 ? openPlan(list[0].id) : setPlanMenu({ anchor, plans: list }));
  return { plansByDate, planMenu, closePlanMenu: () => setPlanMenu(null), openPlan, onOpenPlans };
}
