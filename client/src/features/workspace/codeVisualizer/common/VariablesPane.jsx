import { Box, Chip, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { FONT_SIZES, FONTS, RADII_PX } from '../../../../app/design/designTokens';
import ValueView from './ValueView';
import { valueToText } from './traceHelpers';

function VariableRow({ name, value, isChanged }) {
  return (
    <Box
      sx={(theme) => ({
        display: 'flex',
        gap: 1.5,
        alignItems: 'flex-start',
        px: 1,
        py: 0.5,
        borderRadius: RADII_PX.badge,
        bgcolor: isChanged ? alpha(theme.palette.warning.main, 0.16) : 'transparent',
      })}
    >
      <Typography sx={{ fontFamily: FONTS.mono, fontSize: FONT_SIZES.body, flex: '0 0 30%', overflowWrap: 'anywhere' }}>{name}</Typography>
      <ValueView value={value} />
    </Box>
  );
}

function FrameCard({ frame, isCurrent, frameIndex, changed }) {
  return (
    <Box sx={{ border: 1, borderColor: isCurrent ? 'primary.main' : 'divider', borderRadius: RADII_PX.control, p: 1, opacity: isCurrent ? 1 : 0.8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <Typography variant="subtitle2" sx={{ fontFamily: FONTS.mono }}>
          {frame.fn}()
        </Typography>
        {isCurrent && <Chip size="small" color="primary" label="Running" />}
      </Box>
      {frame.vars.length === 0 && (
        <Typography variant="caption" color="text.secondary">
          No variables yet
        </Typography>
      )}
      {frame.vars.map(([name, value]) => (
        <VariableRow key={name} name={name} value={value} isChanged={changed.has(`${frameIndex}|${name}`)} />
      ))}
    </Box>
  );
}

function ReturnBanner({ step, literals }) {
  if (step.event !== 'return') return null;
  return (
    <Chip color="success" variant="outlined" label={`Returns ${valueToText(step.ret, literals)}`} sx={{ alignSelf: 'flex-start', fontFamily: FONTS.mono }} />
  );
}

// Every active call (the call stack) with its variables. The innermost call is listed first.
export default function VariablesPane({ step, changed, literals }) {
  if (!step) return null;
  const frames = step.stack.map((frame, frameIndex) => ({ frame, frameIndex })).reverse();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1.5 }}>
      <ReturnBanner step={step} literals={literals} />
      {frames.map(({ frame, frameIndex }) => (
        <FrameCard key={frameIndex} frame={frame} frameIndex={frameIndex} isCurrent={frameIndex === step.stack.length - 1} changed={changed} />
      ))}
    </Box>
  );
}
