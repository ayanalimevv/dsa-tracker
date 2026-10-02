# Margin

A minimal DSA learning tracker. Home prioritizes due reviews, then the earliest unattempted question in the selected topic or full learning path; browsing topics does not change the plan. Roadmap, topic, lesson, practice, and problem pages each keep one task in focus. Every problem has its own short revision note and progress status. The Notes page shows all 150 questions and tricks in an editable table with topic and saved-note dropdowns. Revisit shows due and upcoming reviews. Record fresh attempts with Solved independently, Needed help, or Try again; the optional note remains editable afterwards.

## Run

```sh
npm run dev
```

Open `http://localhost:5173`. To make a static copy, run `npm run build` and publish the contents of `dist/`.

Progress saves in this browser. Open **Settings** to export or import a JSON backup. The **Time estimate** asks for study hours per day and estimates the remaining study days using 1 hour per learning step and 45 minutes per problem.

The sidebar opens and closes with the top-left button or `Ctrl+\` (`Cmd+\` on macOS). Its topic section scrolls separately, and the sidebar shows overall question progress.

## Enable Supabase account sync

1. Create a Supabase project and run [`supabase-schema.sql`](supabase-schema.sql) in its SQL editor. The table uses row level security so signed-in users can read and update only their own progress.
2. Copy the project URL and **publishable** key into [`supabase-config.js`](supabase-config.js). Never use a secret or `service_role` key in browser code.
3. In Supabase Authentication URL settings, set the site URL and allow the site origin as a redirect URL. For local development, allow `http://localhost:5173`.
4. Keep email/password authentication enabled. With email confirmation enabled, users confirm the email before signing in. Configure SMTP before production use.
5. Run `npm run build` again before publishing. Account sign-in and sync then appear in Settings.

If device and account copies differ and both contain progress, sync compares their attempt and note counts and asks which copy to keep. Download the recovery file containing both copies before choosing. Importing that file lets you select either copy. Local saving remains available if cloud access is interrupted; the top bar shows save/sync status.

## Content sources

- [NeetCode 150](https://neetcode.io/practice/practice/neetcode150): the 150 linked practice problems and 18 topic groups.
- [NeetCode 250](https://neetcode.io/practice/practice/neetcode250): an extended beginner list. The site currently links the 150.
- [NeetCode roadmap](https://neetcode.io/roadmap): topic order reference.
- [Course Schedule II explanation](https://neetcode.io/solutions/course-schedule-ii): graph prerequisites and topological order reference.

The 77 learning stages are a curated path, not an official NeetCode syllabus.

## Daily practice

Set a 15, 30, or 60 minute study budget and choose a focus topic in Home or Settings. Experienced learners can record existing results in Notes. Time is a planning aid, not a timer or a completion promise.

Independent attempts schedule reviews after 1, 3, 7, then 14 days. Needing help or choosing Try again schedules a review for the following day. Existing attempted questions without dated history are due immediately so old backups remain useful. Reviews take priority across topics. Counts distinguish attempted questions, current independent results, and questions with an independent attempt at least a day after their first attempt. These are self-reported results, not verified mastery.

Changing a result in Notes records an attempt when the value changes. Choosing Not started corrects a mistaken entry and clears its attempt history. Use the problem page buttons to record repeated attempts with the same result.

## Validate

```sh
npm run check
npm test
npm run build
```

Tests cover recommendations, review intervals, progress counting and older backups. No external dependencies are required.

## Host on Vercel

Import the GitHub repository. Set Framework Preset to Other, Root Directory to `website`, Build Command to `npm run check && npm test && npm run build`, and Output Directory to `dist`. `vercel.json` provides the build/output defaults. The site uses hash routes, so no route rewrites are needed.

Optional cloud sync also requires the Supabase schema, project URL, publishable key, and the deployed URL in Authentication Site URL and redirect settings. Account sync and LeetCode submission fetching are separate features; LeetCode sync is not implemented.
