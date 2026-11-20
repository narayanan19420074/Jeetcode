import { Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import { LANG_LABEL, LANG_COLOR } from '../Markdown';
import { FONT_WEIGHTS, FONT_SIZES, SIZES } from '../../../../app/design/designTokens';
import { useFlatLook } from './flatLook';

// Desktop workspace look: the same facts as the chips below, written as plain icon + text with no fill.
function FlatMeta({ icon, label, color = 'text.secondary' }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5, color, '& svg': { fontSize: FONT_SIZES.iconCompact } }}>
      {icon}
      <Typography component="span" sx={{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold, color: 'inherit' }}>
        {label}
      </Typography>
    </Stack>
  );
}

function languageDot(language) {
  return <FiberManualRecordRoundedIcon style={{ color: LANG_COLOR[language] }} sx={{ fontSize: `${FONT_SIZES.caption} !important` }} />;
}

export function LangChip({ language }) {
  const flat = useFlatLook();
  if (flat) return <FlatMeta icon={languageDot(language)} label={LANG_LABEL[language] || language} />;
  return (
    <Chip
      size="small"
      label={LANG_LABEL[language] || language}
      icon={languageDot(language)}
      sx={{ height: 28, fontWeight: FONT_WEIGHTS.semibold, bgcolor: 'action.hover' }}
    />
  );
}

export function MetricChip({ icon, label }) {
  const flat = useFlatLook();
  if (flat) return <FlatMeta icon={icon} label={label} />;
  return <Chip size="small" icon={icon} label={label} sx={{ height: 28, fontWeight: FONT_WEIGHTS.semibold, bgcolor: 'action.hover', '& .MuiChip-icon': { fontSize: FONT_SIZES.title } }} />;
}

export function AcceptedBadge() {
  const flat = useFlatLook();
  if (flat) return <FlatMeta icon={<CheckCircleRoundedIcon />} label="Accepted" color="success.main" />;
  return (
    <Chip
      size="small"
      icon={<CheckCircleRoundedIcon />}
      label="Accepted"
      sx={(t) => ({ height: 26, fontWeight: FONT_WEIGHTS.bold, color: 'success.main', bgcolor: alpha(t.palette.success.main, 0.12), '& .MuiChip-icon': { color: 'success.main', fontSize: FONT_SIZES.title } })}
    />
  );
}

// Marks the signed-in user's own posts and comments.
export function YouTag() {
  const flat = useFlatLook();
  if (flat) {
    return (
      <Typography component="span" color="text.secondary" sx={{ fontSize: FONT_SIZES.caption, fontWeight: FONT_WEIGHTS.semibold }}>
        (You)
      </Typography>
    );
  }
  return <Chip size="small" label="You" color="primary" variant="outlined" sx={{ height: SIZES.chipHeightTiny, fontSize: FONT_SIZES.micro, fontWeight: FONT_WEIGHTS.semibold }} />;
}
