// LeetCode 207: Course Schedule
// Each prerequisite [a, b] creates the directed edge b -> a.

function canFinish(numCourses: number, prerequisites: number[][]): boolean {
  const graph: number[][] = Array.from({ length: numCourses }, () => []);

  for (const [course, prerequisite] of prerequisites) {
    graph[prerequisite].push(course);
  }

  // 0 = unvisited, 1 = visiting (current DFS path), 2 = done
  const state: number[] = Array(numCourses).fill(0);

  // Return true if a cycle is reachable from this course.
  function hasCycle(course: number): boolean {
    // TODO: Handle visiting and done courses.
    if(state[course] === 1) return true;
    else if(state[course] === 2) return false;
    // TODO: Mark this course visiting, then explore its neighbors.
    // TODO: If a neighbor reports a cycle, propagate that result.
    // TODO: After all neighbors are checked, mark this course done.
    throw new Error("Implement hasCycle");
  }

  // Check every course because the graph may be disconnected.
  for (let course = 0; course < numCourses; course++) {
    if (hasCycle(course)) return false;
  }

  return true;
}

// After implementing DFS, trace these cases:
// canFinish(4, [[1, 0], [2, 0], [3, 1], [3, 2]]) => true
// canFinish(4, [[1, 0], [2, 0], [3, 1], [3, 2], [0, 3]]) => false
// canFinish(3, []) => true
// canFinish(1, [[0, 0]]) => false
