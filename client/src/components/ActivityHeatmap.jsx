import { Box, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function ActivityHeatmap({ data }) {
  const theme = useTheme();
  const base = theme.palette.mode === 'dark' ? theme.tokens.slate700 : theme.tokens.slate200;
  const accent = theme.tokens.emerald;

  const colorFor = (count) => {
    if (count === 0) return base;
    const alphas = ['33', '66', '99', 'CC', 'FF'];
    const idx = Math.min(count, alphas.length - 1);
    return `${accent}${alphas[idx]}`;
  };

  const weeks = [];
  for (let i = 0; i < data.length; i += 7) weeks.push(data.slice(i, i + 7));

  return (
    <Box sx={{ display: 'flex', gap: 0.6, overflowX: 'auto', py: 1 }}>
      {weeks.map((week, wi) => (
        <Box key={wi} sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          {week.map((cell) => (
            <Tooltip key={cell.day} title={`${cell.submissions} submission${cell.submissions === 1 ? '' : 's'}`}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: 0.6,
                  bgcolor: colorFor(cell.submissions),
                }}
              />
            </Tooltip>
          ))}
        </Box>
      ))}
    </Box>
  );
}
