import { Box, IconButton, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { SIZES } from '../../../../app/design/designTokens';
import { languageLabel } from '../../languages';

// Title, the sample case switch and the close button.
export default function VisualizerHeader({ language, caseSelector, onClose }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, minHeight: SIZES.appBarHeight.mobile, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ flex: 1, minWidth: SIZES.flexShrinkMinWidth, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography id="code-visualizer-title" variant="h6" component="h2">
          Visualize code
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {languageLabel(language)}
        </Typography>
        {caseSelector}
      </Box>
      <IconButton onClick={onClose} aria-label="Close visualizer">
        <CloseRoundedIcon />
      </IconButton>
    </Box>
  );
}
