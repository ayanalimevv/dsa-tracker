# Margin

A minimal DSA learning tracker. Home suggests the next question from saved problem progress; browsing topics does not change it. Roadmap, topic, lesson, practice, and problem pages each keep one task in focus. Every problem has its own short revision note and progress status. The Notes page shows all 150 questions and tricks in an editable table with topic and saved-note dropdowns. Revisit collects problems marked for another attempt.

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

The first cloud connection asks which copy to keep if the browser and account both have progress. Later sessions load the newer copy for the same account. Local saving remains available if cloud access is interrupted.

## Content sources

- [NeetCode 150](https://neetcode.io/practice/practice/neetcode150): the 150 linked practice problems and 18 topic groups.
- [NeetCode 250](https://neetcode.io/practice/practice/neetcode250): an extended beginner list. The site currently links the 150.
- [NeetCode roadmap](https://neetcode.io/roadmap): topic order reference.
- [Course Schedule II explanation](https://neetcode.io/solutions/course-schedule-ii): graph prerequisites and topological order reference.

The 77 learning stages are a curated path, not an official NeetCode syllabus.
