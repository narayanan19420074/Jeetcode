import { useMediaQuery } from '@mui/material';
import { useParams } from 'react-router-dom';
import MobilePatternDetail, { MobilePatternError, MobilePatternSkeleton } from './components/MobilePatternDetail';
import usePatternDetail from './patternDetail/common/usePatternDetail';
import PatternDesktopView from './patternDetail/desktop/PatternDesktopView';

// Phone screen: unchanged, it only receives the values from the shared hook.
function PatternPhoneView({ detail }) {
  const { slug, data, error, learn, lines, goLearn, goPractice, goTest, openAttempt, openBookmarks } = detail;
  if (error && !data) return <MobilePatternError message={error} />;
  if (!data) return <MobilePatternSkeleton />;
  return (
    <MobilePatternDetail
      slug={slug}
      data={data}
      error={error}
      hasLearn={learn.hasLearn}
      learnLine={lines.learn}
      learnDone={learn.learnDone}
      learnTotal={learn.learnTotal}
      testLine={lines.test}
      practiceLine={lines.practice}
      onLearn={goLearn}
      onPractice={goPractice}
      onTest={goTest}
      onOpenAttempt={openAttempt}
      onOpenBookmarks={openBookmarks}
    />
  );
}

// Thin entry of /aptitude/:slug: phones and small tablets get their own layout (the site navbar is hidden there, see MainLayout).
export default function AptitudePatternDetailPage() {
  const { slug } = useParams();
  const detail = usePatternDetail(slug);
  const isPhone = useMediaQuery((theme) => theme.breakpoints.down('md'), { noSsr: true });
  return isPhone ? <PatternPhoneView detail={detail} /> : <PatternDesktopView detail={detail} />;
}
