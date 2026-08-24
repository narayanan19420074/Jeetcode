export const defaultGraph = {
  nodes: [
    { id: 'A', x: 80, y: 60 }, { id: 'B', x: 220, y: 40 }, { id: 'C', x: 360, y: 60 },
    { id: 'D', x: 80, y: 200 }, { id: 'E', x: 220, y: 220 }, { id: 'F', x: 360, y: 200 },
    { id: 'G', x: 220, y: 130 },
  ],
  edges: [
    { from: 'A', to: 'B', weight: 4 }, { from: 'A', to: 'D', weight: 2 },
    { from: 'B', to: 'C', weight: 5 }, { from: 'B', to: 'G', weight: 1 },
    { from: 'D', to: 'G', weight: 3 }, { from: 'D', to: 'E', weight: 6 },
    { from: 'G', to: 'C', weight: 2 }, { from: 'G', to: 'E', weight: 2 },
    { from: 'C', to: 'F', weight: 3 }, { from: 'E', to: 'F', weight: 4 },
  ],
};

function buildAdjacency(graph) {
  const adj = {};
  graph.nodes.forEach((n) => (adj[n.id] = []));
  graph.edges.forEach(({ from, to, weight }) => {
    adj[from].push({ node: to, weight });
    adj[to].push({ node: from, weight }); // undirected
  });
  return adj;
}

export function bfsSteps(graph, startId) {
  const adj = buildAdjacency(graph);
  const steps = [];
  let visits = 0, edgeChecks = 0;
  const visited = new Set([startId]);
  const visitedEdges = [];
  const queue = [startId];

  const record = (current, description) =>
    steps.push({ visitedNodes: [...visited], currentNode: current, frontierNodes: [...queue], visitedEdges: [...visitedEdges], opsCount: { visits, edgeChecks }, description });

  record(null, `Start BFS at ${startId}`);

  while (queue.length) {
    const node = queue.shift();
    visits++;
    record(node, `Visiting ${node}`);
    for (const { node: neighbor } of adj[node]) {
      edgeChecks++;
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        visitedEdges.push([node, neighbor]);
        record(node, `Discovered ${neighbor} from ${node}`);
      }
    }
  }
  record(null, 'BFS complete');
  return steps;
}

export function dfsSteps(graph, startId) {
  const adj = buildAdjacency(graph);
  const steps = [];
  let visits = 0, edgeChecks = 0;
  const visited = new Set();
  const visitedEdges = [];

  const record = (current, stackTrace, description) =>
    steps.push({ visitedNodes: [...visited], currentNode: current, frontierNodes: [...stackTrace], visitedEdges: [...visitedEdges], opsCount: { visits, edgeChecks }, description });

  function dfs(node, parent, stackTrace) {
    visited.add(node);
    visits++;
    if (parent) visitedEdges.push([parent, node]);
    record(node, stackTrace, `Visiting ${node}`);
    for (const { node: neighbor } of adj[node]) {
      edgeChecks++;
      if (!visited.has(neighbor)) dfs(neighbor, node, [...stackTrace, neighbor]);
    }
  }

  dfs(startId, null, [startId]);
  record(null, [], 'DFS complete');
  return steps;
}

export function dijkstraSteps(graph, startId) {
  const adj = buildAdjacency(graph);
  const steps = [];
  let visits = 0, edgeChecks = 0;
  const distances = {};
  graph.nodes.forEach((n) => (distances[n.id] = Infinity));
  distances[startId] = 0;
  const visited = new Set();
  const visitedEdges = [];

  const record = (current, description) =>
    steps.push({ visitedNodes: [...visited], currentNode: current, distances: { ...distances }, visitedEdges: [...visitedEdges], opsCount: { visits, edgeChecks }, description });

  record(null, `Start Dijkstra at ${startId} — all distances infinity except start`);

  while (visited.size < graph.nodes.length) {
    let current = null, currentDist = Infinity;
    for (const n of graph.nodes) {
      if (!visited.has(n.id) && distances[n.id] < currentDist) { current = n.id; currentDist = distances[n.id]; }
    }
    if (current === null) break;
    visited.add(current);
    visits++;
    record(current, `Visiting ${current} (distance ${currentDist})`);

    for (const { node: neighbor, weight } of adj[current]) {
      edgeChecks++;
      const newDist = distances[current] + weight;
      if (newDist < distances[neighbor]) {
        distances[neighbor] = newDist;
        visitedEdges.push([current, neighbor]);
        record(current, `Relaxed ${neighbor}: new distance ${newDist}`);
      }
    }
  }
  record(null, 'Dijkstra complete');
  return steps;
}
