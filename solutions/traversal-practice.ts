// Nodes use 0-based indices. Complete one exercise at a time.
const practiceGraph: number[][] = [[1, 2], [0, 3], [0], [1], []];

// Exercise 1: Search from start to target.
// Each search gets a fresh visited set shared by its recursive calls.
function hasPathDFS(graph: number[][], start: number, target: number): boolean {
  throw new Error("TODO: implement DFS reachability");
}

// Exercise 2: Count connected components in an undirected graph.
function countComponents(graph: number[][]): number {
  throw new Error("TODO: implement component counting");
}

// Exercise 3: Minimum edges to target; return -1 if unreachable.
// Use a queue with a moving head index.
function shortestDistanceBFS(graph: number[][], start: number, target: number): number {
  throw new Error("TODO: implement shortest-path BFS");
}

// Manual checks after implementing the corresponding function:
// hasPathDFS(practiceGraph, 0, 3) => true
// hasPathDFS(practiceGraph, 0, 4) => false
// hasPathDFS(practiceGraph, 4, 4) => true
// countComponents(practiceGraph) => 2
// countComponents([]) => 0
// shortestDistanceBFS(practiceGraph, 0, 3) => 2
// shortestDistanceBFS(practiceGraph, 0, 4) => -1
// shortestDistanceBFS(practiceGraph, 4, 4) => 0
// Also check a triangle: [[1, 2], [0, 2], [0, 1]].