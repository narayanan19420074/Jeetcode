import GuestBanner from '../common/GuestBanner';
import ProblemLibrary from '../components/ProblemLibrary';
import PromoCarousel from '../components/PromoCarousel';
import DesktopResumeCard from './DesktopResumeCard';

// Library view on wide screens: promo cards, the resume card and the problem library.
// The topic filters live inside the library's filter panel, so the page has no topic rows.
export default function DesktopLibraryContent({ dashboard }) {
  const { isAuthenticated, promoCards, resume, progress, featured, preset, listsApi } = dashboard;
  return (
    <>
      {!isAuthenticated && <GuestBanner />}
      <PromoCarousel cards={promoCards} />
      {resume && <DesktopResumeCard resume={resume} />}
      <ProblemLibrary isAuthenticated={isAuthenticated} progress={progress} dailyId={featured?._id} preset={preset} listsApi={listsApi} topicsInFilter />
    </>
  );
}
