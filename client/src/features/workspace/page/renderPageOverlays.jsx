import AiAssistantLayer from '../AiAssistantLayer';
import CodeVisualizerLayer from '../codeVisualizer/CodeVisualizerLayer';
import ConfirmDialog from '../ConfirmDialog';
import PhoneProblemDescription from '../PhoneProblemDescription';
import PhoneProblemList from '../PhoneProblemList';
import ProblemListDrawer from '../ProblemListDrawer';
import ProblemSheet from '../ProblemSheet';
import ShareSolutionDialog from '../community/ShareSolutionDialog';
import { languageLabel } from '../languages';

export function renderPageOverlays(c) {
  const { activeLanguage, aiMenuOpen, applySolution, closeDesc, code, descOpen, goToProblem, handleShared, isAuthenticated, isMobile, listOpen, navigate, pendingLoad, problem, setAiMenuOpen, setListOpen, setPendingLoad, setShareOpen, setVisualizerOpen, shareOpen, showTags, slug, submitResult, visualizerOpen } = c;
  return (
      <>
      {/* Phone: the problem statement slides up as a sheet */}
      <ProblemSheet open={descOpen} onClose={closeDesc}>
        <PhoneProblemDescription problem={problem} showTags={showTags} />
      </ProblemSheet>

      {isMobile ? (
        <PhoneProblemList open={listOpen} onOpen={() => setListOpen(true)} onClose={() => setListOpen(false)} currentSlug={slug} onSelect={goToProblem} />
      ) : (
        <ProblemListDrawer open={listOpen} onClose={() => setListOpen(false)} currentSlug={slug} onSelect={goToProblem} />
      )}

      <ShareSolutionDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        slug={slug}
        defaultSubmissionId={submitResult?._id}
        onShared={handleShared}
      />

      <ConfirmDialog
        open={Boolean(pendingLoad)}
        title="Replace your code?"
        text={`Your current ${languageLabel(pendingLoad?.language)} code in the editor will be replaced with this solution.`}
        confirmLabel="Replace"
        onCancel={() => setPendingLoad(null)}
        onConfirm={() => applySolution(pendingLoad)}
      />

      <CodeVisualizerLayer open={visualizerOpen} onClose={() => setVisualizerOpen(false)} isMobile={isMobile} slug={slug} language={activeLanguage} code={code} />

      <AiAssistantLayer
        isMobile={isMobile}
        menuOpen={aiMenuOpen}
        onCloseMenu={() => setAiMenuOpen(false)}
        problemId={problem?._id}
        slug={slug}
        language={activeLanguage}
        code={code}
        isAuthenticated={isAuthenticated}
        onSignIn={() => navigate('/login', { state: { from: { pathname: `/workspace/${slug}` } } })}
      />
      </>
  );
}
