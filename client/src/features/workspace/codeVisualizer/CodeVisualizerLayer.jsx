import { Dialog } from '@mui/material';
import { useDispatch } from 'react-redux';
import { SIZES } from '../../../app/design/designTokens';
import { setLanguage } from '../workspaceSlice';
import CaseSelector from './common/CaseSelector';
import useStepPlayer from './common/useStepPlayer';
import useTraceRequest from './common/useTraceRequest';
import useVisualizerModel from './common/useVisualizerModel';
import { LiteralsContext } from './common/ValueView';
import VisualizerBody from './common/VisualizerBody';
import VisualizerHeader from './common/VisualizerHeader';
import { canVisualize } from './visualizerLanguages';

const desktopPaperSx = { width: SIZES.fill, maxWidth: SIZES.codeVisualizer.dialogMaxWidth, height: SIZES.codeVisualizer.dialogHeight };

// Left and right arrows step through the trace; the slider handles its own arrow keys.
function createStepKeyHandler(player) {
  return (event) => {
    if (event.target.getAttribute?.('role') === 'slider') return;
    if (event.key === 'ArrowRight') player.next();
    if (event.key === 'ArrowLeft') player.previous();
  };
}

// Full-screen on phones, a large dialog on desktop. Runs the learner's code on a sample case and replays it step by step.
export default function CodeVisualizerLayer({ open, onClose, isMobile, slug, language, code }) {
  const dispatch = useDispatch();
  const request = useTraceRequest({ open, problemSlug: slug, language, code });
  const player = useStepPlayer(request.trace?.steps.length ?? 0, request.trace);
  const model = useVisualizerModel(request.trace, player.stepIndex);
  const caseSelector = <CaseSelector caseCount={request.caseCount} caseIndex={request.caseIndex} onSelect={request.selectCase} />;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth={false}
      fullWidth
      onKeyDown={createStepKeyHandler(player)}
      aria-labelledby="code-visualizer-title"
      slotProps={{ paper: { sx: isMobile ? undefined : desktopPaperSx } }}
    >
      <LiteralsContext.Provider value={model.literals}>
        <VisualizerHeader language={language} caseSelector={canVisualize(language) ? caseSelector : null} onClose={onClose} />
        <VisualizerBody
          supported={canVisualize(language)}
          request={request}
          onSelectLanguage={(id) => dispatch(setLanguage(id))}
          code={code}
          isMobile={isMobile}
          model={model}
          player={player}
        />
      </LiteralsContext.Provider>
    </Dialog>
  );
}
