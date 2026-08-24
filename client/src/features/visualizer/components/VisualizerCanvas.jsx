import { Box, Typography } from '@mui/material';

export default function VisualizerCanvas({ category, step, graph }) {
  if (!step) return null;
  if (category === 'graph') return <GraphCanvas step={step} graph={graph} />;
  if (category === 'tree') return <TreeCanvas step={step} />;
  if (category === 'dp') return step.dp ? <KnapsackCanvas step={step} /> : <FibonacciCanvas step={step} />;
  return <ArrayCanvas step={step} />;
}

function ArrayCanvas({ step }) {
  const { array, comparingIndices = [], swappedIndices = [], sortedIndices = [], foundIndex, pivotIndex, midIndex, rangeIndices } = step;
  const n = array.length;
  const max = Math.max(...array.map((item) => item.value), 1);
  const barWidthPct = 100 / n;

  const colorFor = (idx) => {
    if (foundIndex === idx) return 'success.main';
    if (pivotIndex === idx) return 'warning.main';
    if (midIndex === idx) return 'secondary.main';
    if (swappedIndices.includes(idx)) return 'error.main';
    if (comparingIndices.includes(idx)) return 'warning.main';
    if (sortedIndices.includes(idx)) return 'success.main';
    if (rangeIndices && (idx < rangeIndices[0] || idx > rangeIndices[1])) return 'action.disabledBackground';
    return 'primary.main';
  };

  return (
    <Box sx={{ position: 'relative', height: 240, width: '100%', px: 2 }}>
      {array.map((item, idx) => (
        <Box
          // Keying by the element's stable id (not its current index) is what
          // makes this a real slide animation — React keeps the same DOM node
          // as the element moves, so the browser can transition `left` instead
          // of destroying and recreating a bar at the new position.
          key={item.id}
          sx={{
            position: 'absolute',
            bottom: 28,
            left: `calc(${idx * barWidthPct}% + 3px)`,
            width: `calc(${barWidthPct}% - 6px)`,
            height: `${(item.value / max) * 190 + 12}px`,
            bgcolor: colorFor(idx),
            borderRadius: 1,
            transition: 'left 0.35s ease, height 0.2s ease, background-color 0.2s ease',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: -22,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: (t) => t.typography.monospace.fontFamily,
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              fontSize: '0.7rem',
            }}
          >
            {item.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function GraphCanvas({ step, graph }) {
  const { visitedNodes = [], currentNode, visitedEdges = [], distances } = step;
  const key = (a, b) => [a, b].sort().join('-');
  const visitedEdgeSet = new Set(visitedEdges.map(([a, b]) => key(a, b)));

  return (
    <Box sx={{ overflowX: 'auto', py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', minWidth: 380 }}>
        <svg viewBox="0 0 440 260" width="100%" style={{ maxWidth: 440, minWidth: 340 }}>
          {graph.edges.map(({ from, to, weight }) => {
            const a = graph.nodes.find((n) => n.id === from);
            const b = graph.nodes.find((n) => n.id === to);
            const active = visitedEdgeSet.has(key(from, to));
            return (
              <g key={`${from}-${to}`}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={active ? '#10B981' : '#94A3B8'} strokeWidth={active ? 3 : 1.5} />
                <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 4} fontSize="11" fill="#64748B" textAnchor="middle">{weight}</text>
              </g>
            );
          })}
          {graph.nodes.map((n) => {
            const isVisited = visitedNodes.includes(n.id);
            const isCurrent = currentNode === n.id;
            return (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={18} fill={isCurrent ? '#F59E0B' : isVisited ? '#10B981' : '#3B82F6'} stroke="#fff" strokeWidth={2} />
                <text x={n.x} y={n.y + 4} fontSize="13" fontWeight="700" fill="#fff" textAnchor="middle">{n.id}</text>
                {distances && distances[n.id] !== undefined && (
                  <text x={n.x} y={n.y + 32} fontSize="11" fill="#64748B" textAnchor="middle">
                    {distances[n.id] === Infinity ? '∞' : distances[n.id]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </Box>
    </Box>
  );
}

function TreeCanvas({ step }) {
  const { nodes = [], edges = [], highlightId, comparingId, currentId, visitedIds = [] } = step;

  if (nodes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <Typography variant="body2" color="text.secondary">Empty tree — insertions will appear here</Typography>
      </Box>
    );
  }

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs) - 26;
  const maxX = Math.max(...xs) + 26;
  const maxY = Math.max(...ys) + 30;
  const width = maxX - minX;
  const height = maxY;

  const nodeColor = (value) => {
    if (highlightId === value || currentId === value) return '#F59E0B';
    if (comparingId === value) return '#F59E0B';
    if (visitedIds.includes(value)) return '#10B981';
    return '#3B82F6';
  };

  return (
    <Box sx={{ overflowX: 'auto', py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', minWidth: Math.max(width, 260) }}>
        <svg viewBox={`${minX} 0 ${width} ${height}`} width="100%" style={{ maxWidth: Math.max(width, 260) }}>
          {edges.map(({ from, to }) => {
            const a = nodes.find((n) => n.value === from);
            const b = nodes.find((n) => n.value === to);
            if (!a || !b) return null;
            return <line key={`${from}-${to}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#94A3B8" strokeWidth={1.5} />;
          })}
          {nodes.map((n) => (
            <g key={n.value}>
              <circle cx={n.x} cy={n.y} r={16} fill={nodeColor(n.value)} stroke="#fff" strokeWidth={2} />
              <text x={n.x} y={n.y + 4} fontSize="12" fontWeight="700" fill="#fff" textAnchor="middle">{n.value}</text>
            </g>
          ))}
        </svg>
      </Box>
    </Box>
  );
}

function FibonacciCanvas({ step }) {
  const { memo = [], highlightIdx } = step;
  return (
    <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', justifyContent: 'center', py: 2 }}>
      {memo.map((val, idx) => (
        <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 44 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: idx === highlightIdx ? 'warning.main' : val !== null ? 'success.main' : 'action.disabledBackground',
              color: '#fff',
              fontWeight: 700,
              fontFamily: (t) => t.typography.monospace.fontFamily,
              transition: 'all 0.2s ease',
            }}
          >
            {val ?? '—'}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: (t) => t.typography.monospace.fontFamily }}>
            fib({idx})
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function KnapsackCanvas({ step }) {
  const { dp = [], currentCell } = step;
  const [curRow, curCol] = currentCell || [-1, -1];

  return (
    <Box sx={{ overflowX: 'auto', py: 2, display: 'flex', justifyContent: 'center' }}>
      <Box
        component="table"
        sx={{
          borderCollapse: 'collapse',
          fontFamily: (t) => t.typography.monospace.fontFamily,
          fontSize: '0.8rem',
        }}
      >
        <tbody>
          {dp.map((row, r) => (
            <Box component="tr" key={r}>
              {row.map((cell, c) => (
                <Box
                  component="td"
                  key={c}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    width: 34,
                    height: 34,
                    textAlign: 'center',
                    bgcolor: r === curRow && c === curCol ? 'warning.main' : 'transparent',
                    color: r === curRow && c === curCol ? '#fff' : 'text.primary',
                    fontWeight: r === curRow && c === curCol ? 700 : 400,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cell}
                </Box>
              ))}
            </Box>
          ))}
        </tbody>
      </Box>
    </Box>
  );
}
