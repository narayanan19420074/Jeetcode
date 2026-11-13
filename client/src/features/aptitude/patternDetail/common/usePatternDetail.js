import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aptitudeApi } from '../../../../api/aptitudeApi';
import { extractErrorMessage } from '../../../../api/apiClient';
import { getLessonsForPattern, getTopicBySlug } from '../../../learn/content';
import { moduleXp, rankForXp } from '../../components/gamification';
import { buildStudyLines } from './patternLines';

function usePatternData(slug) {
  const [state, setState] = useState({ data: null, error: null });
  useEffect(() => {
    let cancelled = false;
    setState({ data: null, error: null });
    aptitudeApi
      .getPattern(slug)
      .then(({ data: res }) => !cancelled && setState({ data: res.data, error: null }))
      .catch((err) => !cancelled && setState({ data: null, error: extractErrorMessage(err) }));
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return state;
}

// Seconds left on an unfinished test; it ticks only while such a test exists.
function useRemainingSeconds(activeTest) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!activeTest) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activeTest]);
  return activeTest ? Math.max(0, (new Date(activeTest.expiresAt).getTime() - now) / 1000) : 0;
}

// Patterns with authored lessons use the in-module Learn page; the others fall back to the older topic page.
function useLearnProgress(slug, data) {
  const lessons = getLessonsForPattern(slug);
  const hasLegacyLearn = Boolean(getTopicBySlug(slug));
  const completedLessonIds = useMemo(() => {
    const done = new Set(data?.progress.completedSubsections ?? []);
    return new Set((lessons ?? []).filter((lesson) => done.has(lesson.id)).map((lesson) => lesson.id));
  }, [data, lessons]);
  return { lessons, hasLegacyLearn, hasLearn: Boolean(lessons) || hasLegacyLearn, learnTotal: lessons?.length ?? 0, learnDone: completedLessonIds.size, completedLessonIds };
}

// The alien the learner has earned in this topic grows with the topic's XP.
const deriveRank = (data, learnDone) => {
  const xp = moduleXp({ practice: data.practice, progress: data.progress, learnDone, pattern: data.pattern });
  return { xp, rank: rankForXp(xp) };
};

function usePatternActions(slug, data, lessons) {
  const navigate = useNavigate();
  // Without an explicit topic, practice resumes at the recommended one once the learner has started practising.
  const defaultTopic = () => {
    const { totals, bySubPattern, recommendedSubPattern } = data.practice;
    return totals.attempted > 0 ? bySubPattern.find((sub) => sub.slug === recommendedSubPattern)?.slug : undefined;
  };
  const goPractice = (sub) => {
    const topic = typeof sub === 'string' ? sub : defaultTopic();
    navigate(`/aptitude/${slug}/practice${topic ? `?subPattern=${topic}` : ''}`);
  };
  const goLearn = () => navigate(lessons ? `/aptitude/${slug}/learn` : `/learn/${slug}`);
  const goTest = () => navigate(data.activeTest ? `/aptitude/${slug}/test/${data.activeTest.attemptId}` : `/aptitude/${slug}/test`);
  return { goPractice, goLearn, goTest, openAttempt: (id) => navigate(`/aptitude/${slug}/results/${id}`), openBookmarks: () => navigate(`/aptitude/${slug}/practice?status=bookmarked`) };
}

// Everything the topic page needs, shared by the phone and desktop layouts.
export default function usePatternDetail(slug) {
  const { data, error } = usePatternData(slug);
  const learn = useLearnProgress(slug, data);
  const remainingSec = useRemainingSeconds(data?.activeTest);
  const actions = usePatternActions(slug, data, learn.lessons);
  const ready = data ? { lines: buildStudyLines(data, learn, remainingSec), ...deriveRank(data, learn.learnDone) } : {};
  return { slug, data, error, learn, ...ready, ...actions };
}
