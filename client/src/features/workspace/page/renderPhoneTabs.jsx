import DiscussionPanel from '../community/DiscussionPanel';
import PhonePanel from '../PhonePanel';
import SolutionsPanel from '../community/SolutionsPanel';
import SubmissionsPanel from '../SubmissionsPanel';

export function renderPhoneTabs(c) {
  const { handleSendToEditor, isAuthenticated, isMobile, mobileView, mountedTabs, navigate, setShareOpen, slug, solutionsRefresh, submitResult } = c;
  return (
      <>
      {/* Phone: Solutions / Discussion / Submissions sit next to the Code tab */}
      {isMobile && mountedTabs[1] && (
        <PhonePanel bg="transparent" show={mobileView === 'solutions'}>
          <SolutionsPanel slug={slug} refreshKey={solutionsRefresh} onShare={() => setShareOpen(true)} onSendToEditor={handleSendToEditor} />
        </PhonePanel>
      )}
      {isMobile && mountedTabs[2] && (
        <PhonePanel bg="transparent" show={mobileView === 'discussion'}>
          <DiscussionPanel slug={slug} />
        </PhonePanel>
      )}
      {isMobile && mountedTabs[3] && (
        <PhonePanel bg="transparent" show={mobileView === 'submissions'}>
          <SubmissionsPanel
            slug={slug}
            isAuthenticated={isAuthenticated}
            refreshKey={submitResult?._id ?? 0}
            onLoad={handleSendToEditor}
            onSignIn={() => navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } })}
          />
        </PhonePanel>
      )}
      </>
  );
}
