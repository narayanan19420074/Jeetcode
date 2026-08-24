// Pure step-generator functions for BST insert + traversals.
// Layout trick: assigning x by inorder-position and y by depth gives a
// clean, non-overlapping tree drawing for free — no separate layout library needed.

function computeLayout(root) {
  const nodes = [];
  const edges = [];
  const spacingX = 44;
  const spacingY = 60;
  let xCounter = 0;

  function inorder(node, depth) {
    if (!node) return;
    inorder(node.left, depth + 1);
    const x = xCounter * spacingX + 30;
    const y = depth * spacingY + 30;
    node.x = x;
    node.y = y;
    nodes.push({ value: node.value, x, y, depth });
    xCounter++;
    inorder(node.right, depth + 1);
  }
  inorder(root, 0);

  function collectEdges(node) {
    if (!node) return;
    if (node.left) { edges.push({ from: node.value, to: node.left.value }); collectEdges(node.left); }
    if (node.right) { edges.push({ from: node.value, to: node.right.value }); collectEdges(node.right); }
  }
  collectEdges(root);

  return { nodes, edges };
}

function insertNode(root, value) {
  if (!root) return { value, left: null, right: null };
  if (value < root.value) root.left = insertNode(root.left, value);
  else if (value > root.value) root.right = insertNode(root.right, value);
  return root;
}

function buildBST(values) {
  const unique = [...new Set(values)];
  let root = null;
  unique.forEach((v) => { root = insertNode(root, v); });
  return { root, unique };
}

export function bstInsertSteps(inputValues) {
  const unique = [...new Set(inputValues)];
  const skipped = inputValues.length - unique.length;
  let root = null;
  const steps = [];
  let comparisons = 0;

  const record = (highlightId, comparingId, description) => {
    const { nodes, edges } = computeLayout(root);
    steps.push({ nodes, edges, highlightId, comparingId, opsCount: { comparisons }, description });
  };

  record(null, null, skipped > 0 ? `Starting insert — ${skipped} duplicate value(s) skipped (BST needs unique keys)` : 'Empty tree');

  unique.forEach((value) => {
    if (!root) {
      root = { value, left: null, right: null };
      record(value, null, `Inserted ${value} as root`);
      return;
    }
    let curr = root;
    while (true) {
      comparisons++;
      record(null, curr.value, `Comparing ${value} with ${curr.value}`);
      if (value < curr.value) {
        if (!curr.left) { curr.left = { value, left: null, right: null }; record(value, curr.value, `${value} < ${curr.value} — inserted as left child`); break; }
        curr = curr.left;
      } else {
        if (!curr.right) { curr.right = { value, left: null, right: null }; record(value, curr.value, `${value} > ${curr.value} — inserted as right child`); break; }
        curr = curr.right;
      }
    }
  });

  record(null, null, 'BST built');
  return steps;
}

export function bstTraversalSteps(inputValues, type) {
  const { root } = buildBST(inputValues);
  const { nodes, edges } = computeLayout(root);
  const steps = [];
  const visited = [];

  const record = (currentId, description) =>
    steps.push({ nodes, edges, visitedIds: [...visited], currentId, opsCount: { visited: visited.length }, description });

  record(null, `Start ${type} traversal`);

  function traverse(node) {
    if (!node) return;
    if (type === 'preorder') { visited.push(node.value); record(node.value, `Visit ${node.value}`); }
    traverse(node.left);
    if (type === 'inorder') { visited.push(node.value); record(node.value, `Visit ${node.value}`); }
    traverse(node.right);
    if (type === 'postorder') { visited.push(node.value); record(node.value, `Visit ${node.value}`); }
  }
  traverse(root);

  record(null, `Traversal complete: [${visited.join(', ')}]`);
  return steps;
}
