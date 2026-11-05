import { Box, Typography } from '@mui/material';
import { SIZES } from '../../../../app/design/designTokens';
import CodePane from '../common/CodePane';
import OutputPane from '../common/OutputPane';
import StepControls from '../common/StepControls';
import VariablesPane from '../common/VariablesPane';
import { describeStep } from '../common/traceHelpers';

function PaneTitle({ children }) {
  return (
    <Typography variant="overline" color="text.secondary" sx={{ px: 1.5, pt: 1, display: 'block' }}>
      {children}
    </Typography>
  );
}

const columnSx = { flex: 1, minWidth: SIZES.flexShrinkMinWidth, minHeight: SIZES.flexShrinkMinHeight, display: 'flex', flexDirection: 'column' };

// Desktop layout: code on the left; call stack with variables, then input and output, on the right.
export default function VisualizerDesktopView({ code, trace, model, player }) {
  const { step, literals, changed, output } = model;
  return (
    <>
      <Box sx={{ ...columnSx, flexDirection: 'row' }}>
        <Box sx={{ ...columnSx, borderRight: 1, borderColor: 'divider' }}>
          <PaneTitle>Code</PaneTitle>
          <CodePane code={code} activeLine={step?.line} errorLine={trace.errorLine} />
        </Box>
        <Box sx={columnSx}>
          <PaneTitle>Call stack and variables</PaneTitle>
          <Box sx={{ flex: 1, minHeight: SIZES.flexShrinkMinHeight, overflow: 'auto' }}>
            <VariablesPane step={step} changed={changed} literals={literals} />
          </Box>
          <Box sx={{ borderTop: 1, borderColor: 'divider', maxHeight: SIZES.codeVisualizer.outputMaxHeight, overflow: 'auto' }}>
            <OutputPane input={trace.input} output={output} />
          </Box>
        </Box>
      </Box>
      <StepControls player={player} stepCount={trace.steps.length} description={describeStep(step, literals)} />
    </>
  );
}
