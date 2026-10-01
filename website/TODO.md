# Margin build checklist

- [x] Review the official NeetCode 150, 250, and roadmap references.
- [x] Refine the learning sequence and make the next step clear for each topic.
- [x] Build the minimal responsive interface and restore `style.css`.
- [x] Improve typography with a clearer font, larger small text, and stronger text contrast.
- [x] Split the dense interface into focused Home, Roadmap, Topic, Lesson, Practice, Problem, Revisit, and Settings pages.
- [x] Add a Notion-inspired sidebar that collapses and has a separate Topics toggle.
- [x] Save a short revision note for every individual problem, including old-backup compatibility.
- [x] Simplify time estimates to study hours per day and estimated study days.
- [x] Recommend the next question from saved problem progress, independently of topic browsing.
- [x] Show overall question progress in the sidebar and make its topic list scroll.
- [x] Add a single table of all question notes with topic and saved-note dropdowns, search, and inline editing.
- [x] Make progress tracking work from an empty user state, including backup/import.
- [x] Add a roadmap-time popup with adjustable learning hours, problem pace, and weekly study hours.
- [x] Add optional cloud sync without embedding a shared credential in the site.
- [x] Verify JavaScript syntax, static build, and complete problem-to-stage coverage; update project handoff notes.
- [ ] Add the Supabase project URL and publishable key, then check live sign-in and sync.
- [ ] Complete a visual browser review when access to the local site is available.

Cloud sync code and SQL are ready. Connecting a real Supabase project still requires its project URL and publishable key. Browser permission review rejected access to the local site in this session, so visual review is pending.

## Product decisions

- Use NeetCode 150 as the linked practice list. NeetCode 250 is an optional extension for complete beginners.
- The 18 topics and their staged order are a curated learning path based on the official roadmap, not an official NeetCode syllabus.
- Keep the primary screen focused on one next action. Use separate pages for topic steps and each problem.
- Save locally by default. Cloud sync is optional and must be explicitly connected by each user.

## References

- [NeetCode 150](https://neetcode.io/practice/practice/neetcode150)
- [NeetCode 250](https://neetcode.io/practice/practice/neetcode250)
- [NeetCode roadmap](https://neetcode.io/roadmap)
- [NeetCode Course Schedule II explanation](https://neetcode.io/solutions/course-schedule-ii)
- [Notion sidebar navigation](https://www.notion.com/help/navigate-with-the-sidebar)
