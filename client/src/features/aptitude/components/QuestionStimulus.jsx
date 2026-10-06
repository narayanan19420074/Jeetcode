import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';

// Shared stimulus for DI / reasoning / comprehension questions
// ("Refer to the table below…"). Renders text and tables; bar/line/pie sets
// fall back to a data table so they still work without a chart library.
function chartToTable(set) {
  const series = set.chart?.series ?? [];
  if (series.length === 0) return null;
  const labels = series[0].data.map((d) => d.label);
  return {
    columns: [set.chart?.xLabel || '', ...series.map((s) => s.name)],
    rows: labels.map((label, i) => [label, ...series.map((s) => s.data[i]?.value ?? '')]),
  };
}

export default function QuestionStimulus({ set }) {
  if (!set) return null;
  const table = set.type === 'table' ? set.table : set.type === 'text' ? null : chartToTable(set);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
      {set.title && (
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
          {set.title}
        </Typography>
      )}
      {set.type === 'text' && (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>
          {set.text}
        </Typography>
      )}
      {table && (
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {table.columns.map((c, i) => (
                  <TableCell key={i} sx={{ fontWeight: 700 }}>
                    {c}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {table.rows.map((r, ri) => (
                <TableRow key={ri}>
                  {r.map((cell, ci) => (
                    <TableCell key={ci}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
}
