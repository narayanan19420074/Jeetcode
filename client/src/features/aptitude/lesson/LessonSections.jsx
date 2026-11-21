import { Box, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, alpha } from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { BORDER_WIDTHS, FONTS, FONT_SIZES, FONT_WEIGHTS, RADII_PX } from '../../../app/design/designTokens';

const mono = { fontFamily: FONTS.mono };

export function Eyebrow({ children, color = 'primary.main', icon: Icon }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1 }}>
      <Icon sx={{ fontSize: FONT_SIZES.title, color }} />
      <Typography variant="caption" sx={{ fontWeight: FONT_WEIGHTS.bold, letterSpacing: '0.1em', color, fontSize: FONT_SIZES.micro }}>{children}</Typography>
    </Stack>
  );
}

export function KeyIdea({ paragraphs }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: RADII_PX.card, borderLeft: `${BORDER_WIDTHS.accent}px solid`, borderLeftColor: 'primary.main' }}>
      <Eyebrow icon={LightbulbRoundedIcon}>THE KEY IDEA</Eyebrow>
      <Stack spacing={1.25}>{paragraphs.map((text) => <Typography key={text} sx={{ lineHeight: 1.75 }}>{text}</Typography>)}</Stack>
    </Paper>
  );
}

export function Formulas({ formulas }) {
  return (
    <Box>
      <Eyebrow icon={BoltRoundedIcon}>FORMULAS TO REMEMBER</Eyebrow>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5 }}>
        {formulas.map((formula) => (
          <Paper key={formula.label} variant="outlined" sx={{ p: 2, borderRadius: RADII_PX.card, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: FONT_WEIGHTS.bold }}>{formula.label}</Typography>
            <Typography sx={{ ...mono, fontWeight: FONT_WEIGHTS.bold, fontSize: FONT_SIZES.body, mt: 0.5, lineHeight: 1.6 }}>{formula.expr}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

// Every second column holds a value, so it is set in the code font.
export function LessonTable({ table }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: RADII_PX.card, overflow: 'hidden' }}>
      <Table size="small">
        <TableHead>
          <TableRow>{table.columns.map((column) => <TableCell key={column} sx={{ fontWeight: FONT_WEIGHTS.bold }}>{column}</TableCell>)}</TableRow>
        </TableHead>
        <TableBody>
          {table.rows.map((row) => (
            <TableRow key={row.join('|')}>
              {row.map((cell, column) => <TableCell key={column} sx={column % 2 === 1 ? { ...mono, fontWeight: FONT_WEIGHTS.bold } : undefined}>{cell}</TableCell>)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

export function ExamShortcuts({ shortcuts }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: RADII_PX.card, bgcolor: (theme) => alpha(theme.palette.warning.main, 0.07), borderColor: (theme) => alpha(theme.palette.warning.main, 0.5) }}>
      <Eyebrow color="warning.main" icon={BoltRoundedIcon}>EXAM SHORTCUTS</Eyebrow>
      <Stack spacing={1}>{shortcuts.map((text) => <Typography key={text} variant="body2" sx={{ lineHeight: 1.7 }}>• {text}</Typography>)}</Stack>
    </Paper>
  );
}

export function CommonTraps({ traps }) {
  return (
    <Box>
      <Eyebrow color="error.main" icon={WarningAmberRoundedIcon}>COMMON TRAPS</Eyebrow>
      <Stack spacing={1.25}>
        {traps.map((item) => (
          <Paper key={item.trap} variant="outlined" sx={{ p: 2, borderRadius: RADII_PX.card, borderColor: (theme) => alpha(theme.palette.error.main, 0.4) }}>
            <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHTS.bold, color: 'error.main' }}>✗ {item.trap}</Typography>
            <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.65 }}>✓ {item.fix}</Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
