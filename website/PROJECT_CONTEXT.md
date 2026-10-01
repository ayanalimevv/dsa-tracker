# Project context: Margin DSA tracker

## Purpose

Margin is a small, client-side study tracker for learning data structures and algorithms. It has a topic roadmap, staged confidence tracking, a NeetCode 150 problem list, notes, theme switching, and local JSON backup/import.

## Stack and entry points

- Vanilla JavaScript ES modules; no framework or external runtime dependencies.
- `index.html` is the page shell and loads `app.js`.
- `app.js` renders the interface and handles interactions.
- `curriculum.js` contains topic and source data.
- `problems.json` is the app's curated problem list; `source-problems.json` is also present as source data.
- `model.js` defines local state, validation, progress, and stage-selection helpers.
- `cloud.js`, `supabase-config.js`, and `supabase-schema.sql` provide optional account sync; see `README.md` for setup.
- `server.mjs` serves the app locally; `build.mjs` copies static assets into `dist/`.
- `package.json` scripts: `npm run dev`, `npm start`, `npm run check`, and `npm run build`.

## Current state

- The project files are in `C:\ayan\dsa tracker\website`.
- There is no Git repository metadata in this folder, so Git history/status cannot be used to recover prior work.
- `style.css` is present and provides the responsive light and dark interface.
- Typography uses Inter with system sans fallbacks and larger text for readability.
- New users start with empty progress at Arrays & Hashing. Existing local backups remain importable.
- The UI now has focused routes for Home, Roadmap, Topics, Lessons, Practice, individual Problems, Revisit, and Settings. The sidebar collapses with its button or `Ctrl+\`.
- Each problem stores a short revision note in `state.problemNotes[slug]`. Old version 1 backups without `problemNotes` still import.
- The `#notes` page shows every question in a table with filters, result dropdowns, and inline notes. It edits the same `problemNotes` data as individual problem pages.
- Home recommends the next question from the furthest attempted problem in the curated order. Browsing topics no longer changes this recommendation. Overall practiced count appears in the sidebar.
- The time estimate accepts hours per day and shows remaining study days; its fixed assumptions are shown in the popup.
- The site contains 18 topics, 77 curated learning stages, and 150 NeetCode practice problems. All 150 appear in at least one stage.
- The user chose Supabase email sign-in for optional cloud progress. The integration is coded but not active until a project URL and publishable key are entered in `supabase-config.js` and the SQL schema is applied.
- Syntax and static build checks passed on October 1, 2026. Browser access to `http://localhost:5173` was rejected by automatic permission review, so a visual browser pass could not be completed.

## Resume guidance

1. Read this file and inspect the current project files before editing; there is no Git history to rely on.
2. Read `TODO.md` and `README.md` for the build state and Supabase setup.
3. `app.js` fetches `problems.json` at runtime, and `build.mjs` copies the static assets into `dist/`.
4. The project defines `npm run check` and `npm run build`. A live Supabase round trip and visual browser review remain unverified until a project is connected and browser access is available.
