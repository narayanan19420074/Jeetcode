import { Box, Chip, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import DifficultyChip from '../../components/DifficultyChip';
import { wsSurface } from './workspaceTheme';
import { WS, mono } from './wsTokens';

const compact = (n) => {
  if (n == null) return null;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(n);
};

function Stat({ label, value }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'baseline', gap: 0.6 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 700, ...mono }}>
        {value}
      </Typography>
    </Stack>
  );
}

function Tag({ label }) {
  return (
    <Chip
      label={label}
      size="small"
      sx={(t) => ({
        height: 24,
        borderRadius: '6px',
        fontWeight: 600,
        fontSize: '0.72rem',
        color: 'text.secondary',
        bgcolor: wsSurface(t).raised,
      })}
    />
  );
}

function TagRow({ title, items }) {
  if (!items?.length) return null;
  return (
    <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', width: 74, flexShrink: 0 }}>
        {title}
      </Typography>
      {items.map((t) => (
        <Tag key={t} label={t} />
      ))}
    </Stack>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', mb: 1.25 }}>{children}</Typography>
  );
}

function ExampleBlock({ index, example }) {
  const rows = [
    ['Input', example.input],
    ['Output', example.output],
  ];
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', mb: 0.75 }}>Example {index + 1}</Typography>
      <Box sx={(t) => ({ p: 1.5, borderRadius: `${WS.radius + 2}px`, bgcolor: wsSurface(t).raised })}>
        {rows.map(([label, value]) => (
          <Typography key={label} sx={{ ...mono, fontSize: '0.8rem', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            <Box component="span" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              {label}:{' '}
            </Box>
            {value}
          </Typography>
        ))}
        {example.explanation && (
          <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
            <Box component="span" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Explanation:{' '}
            </Box>
            {example.explanation}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// Problem statement: title, meta, tags, description, examples, constraints.
// Shared by the desktop left pane and the phone drawer.
export default function ProblemDescription({ problem }) {
  const acceptance = problem.totalSubmissions > 0 ? ((problem.acceptedSubmissions / problem.totalSubmissions) * 100).toFixed(1) : null;

  return (
    <>
      <Typography sx={{ fontWeight: 800, fontSize: '1.3rem', lineHeight: 1.3, letterSpacing: '-0.01em', mb: 1.25 }}>{problem.title}</Typography>

      <Stack direction="row" sx={{ alignItems: 'center', flexWrap: 'wrap', columnGap: 2, rowGap: 0.75, mb: 2.25 }}>
        <DifficultyChip difficulty={problem.difficulty} />
        {acceptance != null && <Stat label="Acceptance" value={`${acceptance}%`} />}
        {problem.totalSubmissions > 0 && <Stat label="Submissions" value={compact(problem.totalSubmissions)} />}
        {problem.likes > 0 && <Stat label="Likes" value={compact(problem.likes)} />}
      </Stack>

      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mb: 3, lineHeight: 1.8 }}>
        {problem.description}
      </Typography>

      {problem.examples?.length > 0 && (
        <Box sx={{ mb: 1 }}>
          {problem.examples.map((ex, i) => (
            <ExampleBlock key={i} index={i} example={ex} />
          ))}
        </Box>
      )}

      {problem.constraints?.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <SectionTitle>Constraints</SectionTitle>
          <Stack component="ul" sx={{ gap: 0.75, m: 0, pl: 2.25 }}>
            {problem.constraints.map((c, i) => (
              <Typography key={i} component="li" variant="body2" sx={{ lineHeight: 1.6, '&::marker': { color: 'text.disabled' } }}>
                <Box
                  component="code"
                  sx={(t) => ({
                    ...mono,
                    fontSize: '0.78rem',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: '6px',
                    wordBreak: 'break-word',
                    bgcolor: wsSurface(t).raised,
                  })}
                >
                  {c}
                </Box>
              </Typography>
            ))}
          </Stack>
        </Box>
      )}

      {(problem.tags?.length > 0 || problem.companies?.length > 0) && (
        <Box
          sx={(t) => ({ pt: 2, mt: 1, borderTop: `1px solid ${alpha(t.palette.divider, 1)}` })}
        >
          <TagRow title="Topics" items={problem.tags} />
          <TagRow title="Companies" items={problem.companies} />
        </Box>
      )}
    </>
  );
}
