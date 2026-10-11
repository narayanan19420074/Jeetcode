// Everything Blip says about *what* each algorithm does, in plain English.
// Kept apart from the tour engine so lessons can be improved without touching
// any UI code.

// 2-4 short sentences per algorithm. Each sentence is spoken (and captioned)
// on its own, so keep them self-contained.
export const ALGO_LESSONS = {
  bubbleSort: {
    idea: 'Bubble sort is the simplest way to sort. It looks at two neighbours at a time. If the left one is bigger, they swap places. Do that again and again, and the biggest values slowly bubble up to the right end.',
    watch: 'After every full pass, one more bar on the right turns green. That bar is already in its final place.',
  },
  mergeSort: {
    idea: 'Merge sort follows a divide and conquer plan. It splits the array in half, again and again, until every piece has just one item. Then it merges the pieces back together, always picking the smaller front value first.',
    watch: 'Watch how the small sorted groups join into bigger and bigger sorted groups.',
  },
  quickSort: {
    idea: 'Quick sort picks one value as the pivot. Then it moves smaller values to the left of the pivot, and bigger values to the right. After that, the pivot is in its final spot, and we repeat the same trick on both sides.',
    watch: 'Keep an eye on the pivot bar. Once it lands, everything on its left is smaller and everything on its right is bigger.',
  },
  heapSort: {
    idea: 'Heap sort first arranges the numbers into a max heap, where every parent is bigger than its children. That puts the biggest value on top. Then it repeatedly takes the top value, moves it to the end, and repairs the heap.',
    watch: 'Watch the sorted part grow from the right side, one biggest value at a time.',
  },
  linearSearch: {
    idea: 'Linear search is the most honest search. It starts at the first item and checks them one by one until it finds your target. If it reaches the end, the value is not there.',
    watch: 'The bar being checked lights up. When the target is found, it turns green and the search stops.',
  },
  binarySearch: {
    idea: 'Binary search is much faster, but it needs a sorted array. It looks at the middle value. If your target is smaller, it throws away the right half. If it is bigger, it throws away the left half. Then it repeats on what is left.',
    watch: 'Faded bars have been thrown away. The search area shrinks by half every single step.',
  },
  bfs: {
    idea: 'Breadth first search explores a graph level by level. It starts at one node, visits all its neighbours first, then the neighbours of those neighbours. It uses a queue, so the node that was discovered first is visited first.',
    watch: 'Notice how the search spreads outwards like a ripple in water.',
  },
  dfs: {
    idea: 'Depth first search does the opposite. It goes as deep as possible down one path. When it hits a dead end, it backtracks to the last place that still has unexplored neighbours. It uses a stack to remember where to come back to.',
    watch: 'Notice how it dives down one branch before it ever looks at the others.',
  },
  dijkstra: {
    idea: "Dijkstra's algorithm finds the shortest path from one starting node to every other node in a weighted graph. It always visits the closest unvisited node next. Then it checks whether going through that node gives a shorter route to its neighbours.",
    watch: 'The small numbers under each node are the best distances found so far. Watch them shrink when a shorter route is discovered.',
  },
  bstInsert: {
    idea: 'A binary search tree keeps smaller values on the left and bigger values on the right. To insert a number, we start at the root and compare. Smaller goes left, bigger goes right, until we find an empty spot.',
    watch: 'Each insert is a short walk from the top down to a free place.',
  },
  bstInorder: {
    idea: 'Inorder traversal visits the left subtree first, then the node itself, then the right subtree. For a binary search tree, that visits the values in sorted order.',
    watch: 'Look at the order of the highlighted nodes. It comes out perfectly sorted.',
  },
  bstPreorder: {
    idea: 'Preorder traversal visits the node first, then the left subtree, then the right subtree. It is handy for copying a tree, because parents always come before their children.',
    watch: 'Each node is visited before anything below it.',
  },
  bstPostorder: {
    idea: 'Postorder traversal visits the left subtree, then the right subtree, and only then the node itself. It is useful for deleting a tree, because children are always handled before their parent.',
    watch: 'Each node is visited only after everything below it is finished.',
  },
  fibonacci: {
    idea: 'Fibonacci numbers are built by adding the previous two. A naive solution repeats the same work again and again. Memoization fixes that. We store every answer the first time we compute it, and reuse it later.',
    watch: 'Watch the cache fill up. A cache hit means we skipped a whole chunk of repeated work.',
  },
  knapsack: {
    idea: 'In the knapsack problem you have items with a weight and a value, and a bag that can only carry so much. For each item and each capacity, the algorithm decides whether taking the item beats skipping it, and stores the best answer in a table.',
    watch: 'The highlighted cell is the one being filled. The bottom right cell holds the final answer.',
  },
};

// What the colours mean on the stage, by category / algorithm.
export function stageLesson(algoKey, category) {
  if (category === 'sorting') {
    return [
      'This is the stage. Every bar is one number, and a taller bar means a bigger number.',
      'Amber bars are being compared right now. Red bars have just swapped places. Green bars are finished and already in their final position.',
    ];
  }
  if (category === 'searching') {
    return algoKey === 'binarySearch'
      ? [
          'This is the stage. Every bar is one number, and a taller bar means a bigger number.',
          'The purple bar is the middle value we are checking. Faded bars were thrown away. Green means the target was found.',
        ]
      : [
          'This is the stage. Every bar is one number, and a taller bar means a bigger number.',
          'The amber bar is the one being checked right now. When the target is found, it turns green.',
        ];
  }
  if (category === 'graph') {
    return [
      'This is the stage. Circles are nodes, and the lines between them are connections.',
      algoKey === 'dijkstra'
        ? 'The numbers on the lines are distances. Blue nodes are waiting, amber is the one being processed, and green nodes are done.'
        : 'Blue nodes are waiting, the amber node is the one being visited, and green nodes are already finished.',
    ];
  }
  if (category === 'tree') {
    return [
      'This is the stage. Every circle is a value in the tree, and the lines connect parents to their children.',
      'Amber marks the node being looked at. Green marks nodes that are done.',
    ];
  }
  return [
    'This is the stage, where the table or the cache is drawn.',
    'Amber marks the cell being worked on right now. Green cells already hold a stored answer.',
  ];
}

/* ------------------------------------------------------------------ */
/* Step-by-step commentary                                               */
/* ------------------------------------------------------------------ */

const val = (step, i) => step.array?.[Number(i)]?.value;

// [regex on step.description, (match, step) => spoken sentence]
const PATTERNS = [
  [/^Start: unsorted array$/, () => 'This is our starting point, a completely unsorted array.'],
  [/^Comparing index (\d+) and (\d+)$/, (m, s) => `Compare ${val(s, m[1])} with ${val(s, m[2])}.`],
  [/^Swapped index (\d+) and (\d+)$/, (m, s) => `Swap ${val(s, m[1])} and ${val(s, m[2])}, so they end up in the right order.`],
  [/^Comparing left\[\d+\]=(\d+) vs right\[\d+\]=(\d+)$/, (m) => `Compare ${m[1]} from the left half with ${m[2]} from the right half. The smaller one goes first.`],
  [/^Placed (\d+) at index (\d+)$/, (m) => `Place ${m[1]} into position ${Number(m[2]) + 1}.`],
  [/^Copying remaining (left|right) value (\d+)$/, (m) => `One side is empty, so copy the leftover ${m[2]} from the ${m[1]} half.`],
  [/^Comparing arr\[\d+\]=(\d+) with pivot=(\d+)$/, (m) => `Is ${m[1]} smaller than the pivot, ${m[2]}?`],
  [/^Placed pivot at index (\d+)$/, () => 'The pivot lands in its final place. Smaller values are on its left, bigger values on its right.'],
  [/^Comparing (left|right) child idx/, () => 'Check a child, to see whether it is bigger than its parent.'],
  [/^Max-heap built$/, () => 'The max heap is ready. The biggest value now sits at the top.'],
  [/^Moved max to index (\d+)$/, (m) => `Move the biggest value to position ${Number(m[1]) + 1}. That one is finished.`],
  [/^Sorted!$/, () => 'Sorted! Every bar is in the right place, and they all turned green.'],

  [/^Searching for (\d+)$/, (m) => `We are looking for ${m[1]}.`],
  [/^Checking index (\d+) \(value (\d+)\)$/, (m) => `Check position ${Number(m[1]) + 1}. It holds ${m[2]}.`],
  [/^Checking mid index (\d+) \(value (\d+)\)$/, (m) => `Look at the middle value, ${m[2]}.`],
  [/^Found (\d+) at index (\d+)!$/, (m) => `Found it! ${m[1]} is at position ${Number(m[2]) + 1}.`],
  [/^(\d+) not found in array$/, (m) => `${m[1]} is not in the array.`],
  [/^Array sorted first/, () => 'Binary search needs sorted data, so the array is sorted first.'],

  [/^Start BFS at (\w+)$/, (m) => `Start at node ${m[1]}. We explore level by level.`],
  [/^Start DFS at (\w+)$/, (m) => `Start at node ${m[1]}. We will dive deep first.`],
  [/^Visiting (\w+) \(distance (\d+)\)$/, (m) => `Visit node ${m[1]}. It is the closest unvisited node, at distance ${m[2]}.`],
  [/^Visiting (\w+)$/, (m) => `Visit node ${m[1]}.`],
  [/^Discovered (\w+) from (\w+)$/, (m) => `Node ${m[1]} is discovered from ${m[2]}, and waits in the queue.`],
  [/^Relaxed (\w+): new distance (\d+)$/, (m) => `Found a shorter route to ${m[1]}. Its distance is now ${m[2]}.`],
  [/^Start Dijkstra at (\w+)/, (m) => `Start at node ${m[1]}. Its distance is zero, and every other node is unknown, so infinity.`],
  [/^(BFS|DFS|Dijkstra) complete$/, () => 'Every node has been visited. That is the whole graph covered.'],

  [/^Empty tree$/, () => 'We begin with an empty tree.'],
  [/^Starting insert/, () => 'We begin with an empty tree. Duplicate values are skipped, because a search tree needs unique keys.'],
  [/^Inserted (\d+) as root$/, (m) => `${m[1]} becomes the root, the very top of the tree.`],
  [/^Comparing (\d+) with (\d+)$/, (m) => `Compare ${m[1]} with ${m[2]}. ${Number(m[1]) < Number(m[2]) ? 'It is smaller, so we go left.' : 'It is bigger, so we go right.'}`],
  [/^(\d+) < (\d+) — inserted as left child$/, (m) => `There is a free spot, so ${m[1]} becomes the left child of ${m[2]}.`],
  [/^(\d+) > (\d+) — inserted as right child$/, (m) => `There is a free spot, so ${m[1]} becomes the right child of ${m[2]}.`],
  [/^BST built$/, () => 'The tree is built.'],
  [/^Start (inorder|preorder|postorder) traversal$/, (m) => `Start the ${m[1]} traversal from the root.`],
  [/^Visit (\d+)$/, (m) => `Visit ${m[1]}.`],
  [/^Traversal complete/, () => 'Traversal complete. The order you just saw is the result.'],

  [/^Computing Fibonacci\((\d+)\) with memoization$/, (m) => `We want Fibonacci of ${m[1]}, and we will remember every answer we compute.`],
  [/^Base case: fib\((\d+)\) = (\d+)$/, (m) => `Base case. Fibonacci of ${m[1]} is simply ${m[2]}.`],
  [/^Cache hit: fib\((\d+)\) already computed = (\d+)$/, (m) => `Cache hit! Fibonacci of ${m[1]} is already stored, it is ${m[2]}. No extra work needed.`],
  [/^Computing fib\((\d+)\) = fib\((\d+)\) \+ fib\((\d+)\)$/, (m) => `To get Fibonacci of ${m[1]}, we add Fibonacci of ${m[2]} and Fibonacci of ${m[3]}.`],
  [/^Stored fib\((\d+)\) = (\d+)$/, (m) => `Store it. Fibonacci of ${m[1]} is ${m[2]}.`],
  [/^Done: fib\((\d+)\) = (\d+)$/, (m) => `Done! Fibonacci of ${m[1]} is ${m[2]}.`],

  [/^Building DP table: (\d+) items, capacity (\d+)$/, (m) => `We build a table for ${m[1]} items and a bag capacity of ${m[2]}.`],
  [/^Item (\d+) \(w=(\d+), v=(\d+)\) fits in (\d+) — max\(take=(\d+), skip=(\d+)\) = (\d+)$/, (m) => `Item ${m[1]} fits. Taking it is worth ${m[5]}, skipping it is worth ${m[6]}. We keep the better one, ${m[7]}.`],
  [/^Item (\d+) \(w=(\d+)\) too heavy for capacity (\d+) — carry forward (\d+)$/, (m) => `Item ${m[1]} is too heavy for capacity ${m[3]}, so we carry forward the previous best, ${m[4]}.`],
  [/^Done: max value with capacity (\d+) = (\d+)$/, (m) => `Done! The best value we can carry is ${m[2]}.`],
];

/**
 * Turn one recorded step into something Blip can say. Falls back to the raw
 * description so a new algorithm never leaves Blip speechless.
 */
export function narrateStep(step) {
  const d = step?.description;
  if (!d) return null;
  for (const [re, fn] of PATTERNS) {
    const m = d.match(re);
    if (m) return fn(m, step);
  }
  return d.replace(/[→—]/g, ',');
}
