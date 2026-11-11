import { useCallback, useEffect, useMemo, useState } from 'react';
import { prepApi } from '../../../api/prepApi';
import { EXAMS } from '../examsData';
import { upcomingEvents } from './examSchedule';

const normalize = (text) => String(text || '').trim().toLowerCase();

// State shared by the phone and desktop Exams views: the prep tracks (for the dates and progress that come from them),
// the chosen exam type, the exams to list and the upcoming dates.
export default function useExamsPage() {
  const [tracks, setTracks] = useState(null);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    prepApi.listCompanies().then(({ data }) => setTracks(data.data.items || [])).catch(() => setTracks([]));
  }, []);

  const trackFor = useCallback(
    (exam) => (tracks || []).find((track) => track.slug === exam.trackSlug || normalize(track.name) === normalize(exam.short)) || null,
    [tracks]
  );
  const exams = useMemo(() => EXAMS.filter((exam) => category === 'all' || exam.category === category), [category]);
  const upcoming = useMemo(() => upcomingEvents(EXAMS, trackFor), [trackFor]);

  return { tracks, category, setCategory, exams, upcoming, trackFor };
}
