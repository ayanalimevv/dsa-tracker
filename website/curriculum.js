// Topic categories and practice metadata: NeetCode 150.
// The smaller learning stages below are our suggested progression, not an official NeetCode ordering.
const s = (name, description, examples, complexity, cue) => ({ name, description, examples: examples.split('|'), complexity, cue });
export const topics = [
{id:'arrays',name:'Arrays & Hashing',icon:'▦',group:'Foundations',requires:[],summary:'Store, count, and look things up.',steps:[
s('Hash sets & frequency maps','Use a set for membership and a map for counts or positions.','contains-duplicate|valid-anagram|two-sum','Expected O(n) time · O(n) space','Need to remember what you have already seen?'),
s('Grouping & encoding','Choose a canonical key. Make boundaries unambiguous when encoding strings.','group-anagrams|encode-and-decode-strings','O(total input size) for fixed-alphabet keys','Different inputs share the same signature.'),
s('Prefix & suffix products','Reuse accumulated work on each side of an index.','product-of-array-except-self','O(n) time · O(1) auxiliary space excluding output','Each answer depends on everything except itself.'),
s('Sequence boundaries','Start a run only when its predecessor is absent.','longest-consecutive-sequence|valid-sudoku','Longest sequence: expected O(n) time · O(n) space','Unordered input, but consecutive values matter.') ]},
{id:'pointers',name:'Two Pointers',icon:'↔',group:'Foundations',requires:['arrays'],summary:'Move with a reason, not a guess.',steps:[
s('Opposite-end scanning','Compare the ends and move inward while preserving the invariant.','valid-palindrome','O(n) time · O(1) space','Pair positions from opposite ends.'),
s('Sorted pair search','Sorted order tells you which pointer can safely move.','two-sum-ii-input-array-is-sorted|3sum','Pair search O(n); 3Sum O(n²) after sorting','A sum is too small or too large.'),
s('Boundary reasoning','Prove why discarding the shorter boundary cannot lose the optimum.','container-with-most-water','O(n) time · O(1) space','The weaker boundary limits the answer.'),
s('Running boundary maxima','Track left and right maxima to determine trapped water.','trapping-rain-water','O(n) time · O(1) space with two pointers','Water depends on boundaries on both sides.') ]},
{id:'window',name:'Sliding Window',icon:'▤',group:'Foundations',requires:['arrays','pointers'],summary:'Keep only the range that matters.',steps:[
s('Running optimum','Track the best earlier value before evaluating the current one.','best-time-to-buy-and-sell-stock','O(n) time · O(1) space','One pass can retain the best past candidate.'),
s('Variable-size windows','Expand the right side; shrink until the window is valid.','longest-substring-without-repeating-characters|longest-repeating-character-replacement','O(n) time; alphabet-dependent space','A contiguous range must satisfy a constraint.'),
s('Fixed-size frequency windows','Update outgoing and incoming character counts.','permutation-in-string','O(n + m) time · O(alphabet) space','Compare counts across equal-length ranges.'),
s('Minimum coverage','Track required counts and shrink while coverage remains complete.','minimum-window-substring','O(n + m) time · O(alphabet) space','Find the smallest range containing a multiset.'),
s('Monotonic deque','Discard candidates that can never become a window maximum.','sliding-window-maximum','O(n) amortized time · O(k) space','Need a maximum as old values leave the window.') ]},
{id:'stack',name:'Stack',icon:'≡',group:'Foundations',requires:['arrays'],summary:'Resolve the most recent unfinished work.',steps:[
s('Matching & evaluation','Use last-in, first-out for nested structure and operands.','valid-parentheses|evaluate-reverse-polish-notation','O(n) time · O(n) space','The latest opening or operand is resolved first.'),
s('Augmented stacks','Store an invariant alongside each value to answer minimum queries.','min-stack','O(1) per operation · O(n) space','Need both stack behavior and a fast aggregate.'),
s('Monotonic stacks','Pop unresolved candidates when a better boundary arrives.','daily-temperatures|car-fleet','Temperatures O(n); car fleet O(n log n)','Find the next larger value or merge ordered groups.'),
s('Boundary spans','Use a monotonic stack to find a bar’s maximal width.','largest-rectangle-in-histogram','O(n) amortized time · O(n) space','A smaller value closes earlier candidates.') ]},
{id:'binary',name:'Binary Search',icon:'⌖',group:'Foundations',requires:['arrays'],summary:'Discard half. Keep the invariant.',steps:[
s('Sorted search','Choose closed or half-open bounds and stick to that convention.','binary-search|search-a-2d-matrix','O(log n) time · O(1) space','Sorted order lets you discard half the range.'),
s('Search on the answer','Binary search a monotone feasibility predicate.','koko-eating-bananas','O(n log M) time · O(1) space','If one candidate works, every larger one works.'),
s('Rotated arrays','Identify which half is sorted before choosing a side.','find-minimum-in-rotated-sorted-array|search-in-rotated-sorted-array','O(log n) time for distinct values','Sorted order is broken at a single pivot.'),
s('Partitions & time keys','Search insertion boundaries or a valid partition of two arrays.','time-based-key-value-store|median-of-two-sorted-arrays','Time lookup O(log k); median O(log min(m,n))','Locate a boundary rather than an exact value.') ]},
{id:'linked',name:'Linked List',icon:'⌁',group:'Structures',requires:['pointers'],summary:'Think in links, not indices.',steps:[
s('Pointer rewiring','Save the next node before changing a link.','reverse-linked-list|merge-two-sorted-lists','O(n) time · O(1) auxiliary space iteratively','The structure changes while you traverse.'),
s('Fast & slow pointers','Different speeds reveal cycles and middle nodes, even when array values act as links.','linked-list-cycle|reorder-list|remove-nth-node-from-end-of-list|find-the-duplicate-number','O(n) time · O(1) auxiliary space','Need a gap, midpoint, or repeated position.'),
s('Carry & identity maps','Track carry for arithmetic and node identity for deep copies.','add-two-numbers|copy-list-with-random-pointer','O(n) time; copied nodes need O(n) output space','Links can refer to nodes outside the next chain.'),
s('Caches & multi-list operations','Combine a map with a doubly linked list, or merge sorted lists.','lru-cache|merge-k-sorted-lists|reverse-nodes-in-k-group','LRU expected O(1); k-way merge O(N log k)','Need fast lookup plus ordered removal.') ]},
{id:'trees',name:'Trees',icon:'♧',group:'Structures',requires:['stack','linked'],summary:'Let each subtree answer a small question.',steps:[
s('Recursive DFS','Define what a subtree returns before writing recursion.','invert-binary-tree|maximum-depth-of-binary-tree|same-tree|subtree-of-another-tree','O(n) time · O(h) stack space','A node combines answers from its children.'),
s('Postorder aggregation','Return height or gain; update the global answer separately.','diameter-of-binary-tree|balanced-binary-tree|binary-tree-maximum-path-sum','O(n) time · O(h) stack space','The answer needs completed child results.'),
s('Level-order BFS','Process one queue layer at a time.','binary-tree-level-order-traversal|binary-tree-right-side-view|count-good-nodes-in-binary-tree','BFS O(n) time · O(w) queue space; good nodes uses DFS','Distance from the root or a path invariant matters.'),
s('BST ordering','Use strict bounds or sorted inorder order.','validate-binary-search-tree|kth-smallest-element-in-a-bst|lowest-common-ancestor-of-a-binary-search-tree','O(n) worst case · O(h) stack space','Left and right subtrees constrain valid values.'),
s('Build & serialize','Preserve enough structure to reconstruct the tree.','construct-binary-tree-from-preorder-and-inorder-traversal|serialize-and-deserialize-binary-tree','O(n) time and space with index maps','Traversal order alone may need nulls or another traversal.') ]},
{id:'heap',name:'Heap / Priority Queue',icon:'△',group:'Structures',requires:['trees'],summary:'Keep the next best candidate close.',steps:[
s('Heap operations','Understand the heap property, push, pop, and linear-time heapify.','kth-largest-element-in-a-stream|last-stone-weight','Push/pop O(log n); heapify O(n)','Repeatedly take the smallest or largest item.'),
s('Top-k selection','Keep k candidates instead of sorting the entire input.','top-k-frequent-elements|k-closest-points-to-origin|kth-largest-element-in-an-array','O(n log k) time · O(k) space with a bounded heap','Only a small subset of the ranking matters.'),
s('Scheduling & streams','Choose the next available task or candidate by priority.','task-scheduler|design-twitter','Implementation dependent; heap operations O(log n)','Repeated decisions depend on a changing priority.'),
s('Two heaps','Balance lower and upper halves to maintain a median.','find-median-from-data-stream','Insert O(log n); median O(1); space O(n)','Need the center of a growing stream.') ]},
{id:'backtracking',name:'Backtracking',icon:'⑂',group:'Structures',requires:['trees'],summary:'Choose. Explore. Undo.',steps:[
s('Decision trees','Define choices and base cases, then undo each mutation.','subsets|permutations|combination-sum|generate-parentheses','Output sensitive; subsets O(n·2ⁿ), permutations O(n·n!)','Enumerate valid choices, rather than one answer.'),
s('Duplicate control','Sort when useful and skip equivalent choices at the same depth.','subsets-ii|combination-sum-ii','Exponential worst case; output dominates','Repeated values must not create repeated answers.'),
s('Partition & constraints','Prune partial candidates as soon as they become invalid.','palindrome-partitioning|letter-combinations-of-a-phone-number','Exponential worst case · O(n) recursion depth','Build an answer incrementally under constraints.'),
s('Board search','Track path-local visited cells or occupied columns and diagonals.','word-search|n-queens','Word search O(RC·4ᴸ) upper bound; queens exponential','Choices depend on the current path or board.') ]},
{id:'tries',name:'Tries',icon:'⋔',group:'Structures',requires:['trees','arrays'],summary:'Share the prefixes. Branch on letters.',steps:[
s('Prefix tree operations','Store children and an end-of-word marker separately.','implement-trie-prefix-tree','Insert/search O(L) time','Many strings share the same beginning.'),
s('Wildcard search','Explore all children only when a wildcard requires it.','design-add-and-search-words-data-structure','O(L) without wildcards; exponential branching with them','A character may match several branches.'),
s('Trie-guided board search','Prune board paths that are not dictionary prefixes.','word-search-ii','Exponential worst case; trie prunes impossible prefixes','Search many words on the same board.') ]},
{id:'graphs',name:'Graphs',icon:'⌘',group:'Connections',requires:['trees','backtracking'],summary:'Visit carefully. Understand what connects.',steps:[
s('DFS on grids','Treat each cell as a node. Mark it before exploring its neighbors.','number-of-islands|max-area-of-island','O(RC) time · O(RC) worst-case stack/visited','Count or measure connected regions in a grid.'),
s('DFS on node graphs','Build or read neighbors. Map each original node to one copied node.','clone-graph','O(V + E) time · O(V) auxiliary space','A graph has cycles or shared neighbors, so identity matters.'),
s('BFS & shortest distance','Mark nodes when enqueuing. First discovery is shortest with equal-cost edges.','rotting-oranges|walls-and-gates|word-ladder','O(V + E) on explicit graphs; implicit neighbor generation adds cost','Minimum steps or spread from multiple sources.'),
s('Components & boundaries','Restart from unvisited nodes; reverse the search from useful boundaries.','pacific-atlantic-water-flow|surrounded-regions|number-of-connected-components-in-an-undirected-graph','O(V + E) time · O(V) auxiliary space','Count disconnected groups or reach a boundary.'),
s('Cycles & topological sort','For directed graphs use recursion states or Kahn’s indegree queue. A topo order exists only for a DAG.','course-schedule|course-schedule-ii','O(V + E) time · O(V) auxiliary space','Dependencies must be resolved before a node.'),
s('Union-Find connectivity','Track components using path compression and union by size or rank.','redundant-connection|graph-valid-tree','O((V + E) α(V)) time · O(V) space','Edges arrive and you need to detect an existing connection.') ]},
{id:'advanced',name:'Advanced Graphs',icon:'◇',group:'Connections',requires:['graphs','heap'],summary:'Add weights, ordering, and structure.',steps:[
s('Dijkstra’s algorithm','Relax edges using a min-heap. Requires nonnegative edge weights.','network-delay-time|swim-in-rising-water','O((V + E) log V) with a heap','Find cheapest paths, or a monotone bottleneck path.'),
s('Minimum spanning trees','Connect every vertex at minimum total cost with Prim or Kruskal.','min-cost-to-connect-all-points','Dense Prim O(V²); Kruskal O(E log E)','Connect all points, rather than find one route.'),
s('Bounded relaxations','Use a previous-round distance snapshot to enforce a hop limit.','cheapest-flights-within-k-stops','O(K·E) time · O(V) space','A cheapest route also has a stop constraint.'),
s('Ordering & Eulerian trails','Use topological ordering for letter constraints; Hierholzer for using every ticket.','alien-dictionary|reconstruct-itinerary','Topo O(V + E); itinerary O(E log E) with sorting','Ordering constraints and edge-covering routes are distinct.') ]},
{id:'dp1',name:'1-D Dynamic Programming',icon:'▥',group:'Optimization',requires:['backtracking'],summary:'Remember the answer to a smaller problem.',steps:[
s('State & recurrence','Start with recursion; define a state and cache repeated subproblems.','climbing-stairs|min-cost-climbing-stairs','O(n) time · O(1) space after compression','The same suffix or prefix is solved repeatedly.'),
s('Take or skip','Choose between taking the current item and preserving a neighboring constraint.','house-robber|house-robber-ii','O(n) time · O(1) compressed space','Adjacent choices are mutually exclusive.'),
s('Strings & segmentation','Define prefix or suffix states; handle empty and invalid states precisely.','decode-ways|word-break|palindromic-substrings|longest-palindromic-substring','Often O(n²); decoding O(n)','A string can be partitioned into smaller valid pieces.'),
s('Amounts & combinations','Distinguish reachable amounts, minimum counts, and subsets.','coin-change|partition-equal-subset-sum','Coin change O(amount·coins); subset O(n·sum)','An amount or capacity defines the state.'),
s('Sequence & product states','Track subsequence endings or both minimum and maximum products.','longest-increasing-subsequence|maximum-product-subarray','LIS O(n²) DP or O(n log n); product O(n)','The best ending state matters more than all history.') ]},
{id:'dp2',name:'2-D Dynamic Programming',icon:'▧',group:'Optimization',requires:['dp1'],summary:'Two coordinates. One precise state.',steps:[
s('Grid states','Each cell combines earlier reachable cells. Initialize boundaries explicitly.','unique-paths','O(RC) time · O(C) compressed space','Two positions determine the remaining work.'),
s('Two-string alignment','Decide what dp[i][j] means before choosing transitions.','longest-common-subsequence|edit-distance|interleaving-string|distinct-subsequences','O(mn) time; often O(min(m,n)) compressed space','Compare or align two prefixes or suffixes.'),
s('Counting & target states','Loop order determines whether order matters and whether items can repeat.','coin-change-ii|target-sum','Pseudo-polynomial time in target or sum','Count combinations or signed assignments.'),
s('State machines & DAGs','Add holding/cooldown states; memoize paths in an acyclic increasing graph.','best-time-to-buy-and-sell-stock-with-cooldown|longest-increasing-path-in-a-matrix','Cooldown O(n); matrix O(RC)','Current permissions or directed dependencies are part of the state.'),
s('Intervals & pattern matching','Choose a split inside an interval; handle wildcard transitions.','burst-balloons|regular-expression-matching','Balloons O(n³); regex O(mn)','The transition combines ranges or optional pattern pieces.') ]},
{id:'greedy',name:'Greedy',icon:'↗',group:'Optimization',requires:['arrays','dp1'],summary:'Make a local choice. Prove it safe.',steps:[
s('Running best','Reset a harmful prefix, keeping the best sum seen.','maximum-subarray','O(n) time · O(1) space','A negative prefix cannot improve a later sum.'),
s('Reachability & layers','Maintain farthest reachable positions; count jumps by frontier layers.','jump-game|jump-game-ii','O(n) time · O(1) space','Only the farthest reachable boundary matters.'),
s('Feasibility invariants','Track a surplus or consume consecutive groups in sorted order.','gas-station|hand-of-straights|merge-triplets-to-form-target-triplet','Gas/triplets O(n); grouping typically O(n log n)','A failed prefix eliminates a group of candidates.'),
s('Partitions & balance ranges','Close a partition only after all its characters; bound possible open counts.','partition-labels|valid-parenthesis-string','O(n) time · alphabet or constant space','Maintain a proof that future choices remain possible.') ]},
{id:'intervals',name:'Intervals',icon:'⊟',group:'Optimization',requires:['arrays','greedy'],summary:'Sort the boundaries. Handle overlap.',steps:[
s('Merge & insert','Define whether touching endpoints overlap before merging.','merge-intervals|insert-interval','Merge O(n log n); insert O(n) on sorted intervals','Intervals overlap or a new interval changes the union.'),
s('Scheduling','For maximum non-overlap, prefer the earliest finishing interval.','non-overlapping-intervals|meeting-rooms','O(n log n) time from sorting','Discard conflicts while preserving the most future room.'),
s('Concurrent resources','Sweep endpoints or keep active end times in a min-heap.','meeting-rooms-ii','O(n log n) time · O(n) space','Need the peak number of simultaneous events.'),
s('Offline interval queries','Sort queries and manage eligible intervals with a heap.','minimum-interval-to-include-each-query','O((n + q) log n + q log q) time','Many point queries ask for the best covering interval.') ]},
{id:'math',name:'Math & Geometry',icon:'∠',group:'More patterns',requires:['arrays'],summary:'Model the rules before writing loops.',steps:[
s('Matrix traversal','Track layer boundaries or transpose and reverse.','rotate-image|spiral-matrix|set-matrix-zeroes','O(RC) time; auxiliary space depends on method','Indices and boundaries describe a geometric operation.'),
s('Digit arithmetic','Implement carry and position values explicitly.','plus-one|multiply-strings','Plus one O(n); multiplication O(mn)','Numbers are represented as digits rather than machine integers.'),
s('Cycles & fast powers','Use cycle detection for repeated states; square to halve an exponent.','happy-number|powx-n','Power O(log |n|) time','Repeated transformation or an exponent can be reduced.'),
s('Counting representation','Derive contributions from each value instead of simulating all choices.','detect-squares','Query O(number of stored candidate points)','Equal side lengths and frequencies determine the count.') ]},
{id:'bits',name:'Bit Manipulation',icon:'◧',group:'More patterns',requires:['arrays','math'],summary:'Small operations. Useful invariants.',steps:[
s('Masks & set bits','Use shifts and masks; clear the lowest set bit with n & (n − 1).','number-of-1-bits|counting-bits|reverse-bits','O(word width) for fixed-width integers','Need to inspect or count binary positions.'),
s('XOR cancellation','Equal values cancel and zero is the identity.','single-number|missing-number','O(n) time · O(1) space','Values occur in pairs except one.'),
s('Carry & signed bounds','Separate sum bits from carry bits; understand 32-bit coercion in JS/TS.','sum-of-two-integers','O(word width) time · O(1) space','Arithmetic can be expressed with bitwise operations.'),
s('Width & reversal','Process only valid digits and reject signed 32-bit overflow.','reverse-integer','O(number of digits) time · O(1) space','Fixed-width numeric bounds are part of correctness.') ]}
];
export const groups = ['Foundations','Structures','Connections','Optimization','More patterns'];
export const sources = [
 {title:'NeetCode 150 · topic & problem reference',url:'https://neetcode.io/practice/practice/neetcode150'},
 {title:'NeetCode roadmap · topic dependencies',url:'https://neetcode.io/roadmap'},
 {title:'NeetCode official problem metadata',url:'https://github.com/neetcode-gh/leetcode/blob/main/.problemSiteData.json'},
 {title:'NeetCode 250 · extended beginner practice',url:'https://neetcode.io/practice/practice/neetcode250'}
];
