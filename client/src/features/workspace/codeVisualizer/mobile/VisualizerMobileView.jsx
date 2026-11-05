import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import { SIZES } from '../../../../app/design/designTokens';
import CodePane from '../common/CodePane';
import OutputPane from '../common/OutputPane';
import StepControls from '../common/StepControls';
import VariablesPane from '../common/VariablesPane';
import { describeStep } from '../common/traceHelpers';

// Phone layout: code on top, a Variables / Output switch below it, controls pinned to the bottom (thumb reach).
export default function VisualizerMobileView({ code, trace, model, player }) {
  const [tab, setTab] = useState('variables');
  const { step, literals, changed, output } = model;
  return (
    <>
      <Box sx={{ height: SIZES.codeVisualizer.phoneCodeHeight, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}>
        <CodePane code={code} activeLine={step?.line} errorLine={trace.errorLine} />
      </Box>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="fullWidth">
        <Tab value="variables" label="Variables" />
        <Tab value="output" label="Output" />
      </Tabs>
      <Box sx={{ flex: 1, minHeight: SIZES.flexShrinkMinHeight, overflow: 'auto' }}>
        {tab === 'variables' ? <VariablesPane step={step} changed={changed} literals={literals} /> : <OutputPane input={trace.input} output={output} />}
      </Box>
      <StepControls player={player} stepCount={trace.steps.length} description={describeStep(step, literals)} />
    </>
  );
}
