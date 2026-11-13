import { formatClock } from '../../components/aptitudeUi';

// One-line status of each study option, shown on both the phone rows and the desktop cards.
const learnLine = ({ lessons, learnDone, learnTotal, hasLegacyLearn }) => {
  if (lessons) return `${learnDone}/${learnTotal} lessons`;
  return hasLegacyLearn ? 'Concepts and worked examples' : 'Coming soon';
};

// An unfinished test is shown first because the timer keeps running until it is submitted.
const testLine = ({ activeTest, progress, pattern, testPlan }, remainingSec) => {
  if (activeTest) return `In progress · ${activeTest.answeredCount}/${activeTest.totalCount} · ${formatClock(remainingSec)} left`;
  if (progress.attemptsCount > 0) {
    const passed = progress.bestScore >= pattern.passPercentage ? ' · passed' : '';
    return `Best ${progress.bestScore}%${passed} · ${testPlan.questionCount} Qs · ${pattern.timeLimitMinutes} min`;
  }
  return `${testPlan.questionCount} Qs · ${pattern.timeLimitMinutes} min · pass ${pattern.passPercentage}%`;
};

export const buildStudyLines = (data, learn, remainingSec) => ({
  learn: learnLine(learn),
  practice: `${data.practice.totals.solved}/${data.practice.totals.total} solved`,
  test: testLine(data, remainingSec),
});
