import { Box } from '@mui/material';
import { SIZES } from '../../../../app/design/designTokens';
import VisualizerDesktopView from '../desktop/VisualizerDesktopView';
import VisualizerMobileView from '../mobile/VisualizerMobileView';
import CodePane from './CodePane';
import TraceNotices from './TraceNotices';
import { ErrorStatus, LoadingStatus, UnsupportedLanguageStatus } from './VisualizerStatus';

// A trace with no steps (the program failed before reaching the learner's code) still shows the code and the error.
function CodeOnly({ code, trace }) {
  return (
    <Box sx={{ flex: 1, minHeight: SIZES.flexShrinkMinHeight, overflow: 'auto' }}>
      <CodePane code={code} errorLine={trace.errorLine} />
    </Box>
  );
}

function ReadyBody({ code, trace, isMobile, model, player }) {
  const View = isMobile ? VisualizerMobileView : VisualizerDesktopView;
  return (
    <>
      <TraceNotices trace={trace} />
      {trace.steps.length === 0 ? <CodeOnly code={code} trace={trace} /> : <View code={code} trace={trace} model={model} player={player} />}
    </>
  );
}

// Picks what fills the dialog: unsupported language, loading, an error, or the trace itself.
export default function VisualizerBody({ supported, request, onSelectLanguage, ...readyProps }) {
  if (!supported) return <UnsupportedLanguageStatus onSelectLanguage={onSelectLanguage} />;
  if (request.status === 'error') return <ErrorStatus message={request.error} onRetry={request.retry} />;
  if (request.status !== 'ready') return <LoadingStatus />;
  return <ReadyBody trace={request.trace} {...readyProps} />;
}
