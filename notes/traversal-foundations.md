# Traversal Foundations — 2026-10-01

## Current Learning Priority

The learner reports weak DFS/BFS fundamentals. Observed gaps involve translating reasoning into code: invoking recursive helpers, propagating boolean results, returning false after exhausted branches, sharing visited within one search but resetting it between searches, and allocating adjacency lists for 1-based labels.

Pattern recognition is developing: the learner correctly recognized that an existing path plus a new edge creates a cycle. Course Schedule I and II were reported completed using Kahn's BFS topological sort, which the learner finds easier to understand. Redundant Connection was practiced using repeated DFS with substantial guidance; acceptance and independent mastery are not confirmed.

## Practice Plan

Use TypeScript and complete one function at a time in `solutions/traversal-practice.ts`.

1. DFS reachability: trace the call stack and visited set, then implement target search.
2. Connected components: share visited across traversals and start at each unvisited node.
3. BFS shortest distance: mark visited when enqueuing and use a moving queue head.

For each drill: trace by hand, implement independently, check cycles and disconnected or isolated nodes, derive time and space costs, and explain the approach aloud. Give progressive hints; provide full solutions only when requested. Reattempt on a later day without looking at prior code before calling a pattern mastered.

## Start Here

Graph: `0 — 1 — 3`, with another edge `0 — 2` and isolated node 4.

Search from 0 to 3. After entering 0 and then 1, what is visited? Why should 1 skip neighbor 0? Implement only DFS reachability first.

A single traversal targets O(V + E) time and O(V) auxiliary space excluding graph storage. Explain what each return means and why visited prevents repeated traversal. Defer Union-Find and Dijkstra until these mechanics are comfortable.