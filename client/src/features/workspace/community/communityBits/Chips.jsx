import { Chip } from '@mui/material';
import { alpha } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';
import { LANG_LABEL, LANG_COLOR } from '../Markdown';
import { FONT_WEIGHTS, FONT_SIZES } from '../../../../app/design/designTokens';

export function LangChip({ language }) {
  return (
    <Chip
      size="small"
      label={LANG_LABEL[language] || language}
      icon={<FiberManualRecordRoundedIcon style={{ color: LANG_COLOR[language] }} sx={{ fontSize: `${FONT_SIZES.caption} !important` }} />}
      sx={{ height: 28, fontWeight: FONT_WEIGHTS.semibold, bgcolor: 'action.hover' }}
    />
  );
}

export function MetricChip({ icon, label }) {
  return <Chip size="small" icon={icon} label={label} sx={{ height: 28, fontWeight: FONT_WEIGHTS.semibold, bgcolor: 'action.hover', '& .MuiChip-icon': { fontSize: FONT_SIZES.title } }} />;
}

export function AcceptedBadge() {
  return (
    <Chip
      size="small"
      icon={<CheckCircleRoundedIcon />}
      label="Accepted"
      sx={(t) => ({ height: 26, fontWeight: FONT_WEIGHTS.bold, color: 'success.main', bgcolor: alpha(t.palette.success.main, 0.12), '& .MuiChip-icon': { color: 'success.main', fontSize: FONT_SIZES.title } })}
    />
  );
}
