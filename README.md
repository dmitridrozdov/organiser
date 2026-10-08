# Almanac

A private, two-person task organiser: tasks with due dates, priority, tags,
assignment, and per-task comments. Built with Next.js (App Router),
TypeScript, Convex, and Tailwind.

## 1. Install

```bash
npm install
```

## 2. Set up Convex

```bash
npx convex dev
```

The first run will ask you to log in / create a free Convex account and
create a project. It will then write `NEXT_PUBLIC_CONVEX_URL` into
`.env.local` for you and keep running, syncing the `convex/` folder to your
deployment. Leave this running in its own terminal tab while you develop.

## 3. Create the two accounts

In a second terminal (with `convex dev` still running), run this once,
filling in real names, usernames, and passwords:

```bash
npx convex run seed:setupAccounts '{
  "wifeName": "Ada", "wifeUsername": "ada", "wifePassword": "choose-a-password",
  "bossName": "Sam", "bossUsername": "sam", "bossPassword": "choose-a-password"
}'
```

It refuses to run a second time if accounts already exist, so your
passwords are safe from being accidentally overwritten. To change a
password later, delete the relevant row in the `users` table from the
[Convex dashboard](https://dashboard.convex.dev) (`npx convex dashboard`)
and re-run the command above for that person, or add a small one-off
mutation to update the `passwordHash` field.

## 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000` and sign in with one of the accounts you
just created.

## Design

Light theme with a charcoal (`#26272B`) accent for the UI chrome — buttons,
active states, the current-time line — and a serif (Fraunces) wordmark.
Tasks carry their own color (8-swatch palette) so the calendar itself stays
colorful even though the surrounding UI is neutral.

**Light/dark toggle**: the little sun/moon button (bottom of the sidebar,
top-right corner of the login screen) switches the whole app, login
included — there's one theme system (CSS variables in `app/globals.css`,
toggled via a `dark` class on `<html>`), not two separate designs. The
choice is saved to `localStorage` and restored on the next visit with no
flash of the wrong theme.

Tasks live on a real week calendar, Outlook-style:
- 7-day grid with hour rows, defaults to the current week, scrolled to 7am
- **Today / ‹ / ›** to navigate weeks
- Drag a task up/down to change its time, or across columns to move it to
  another day (snaps to 15-minute increments)
- Click an empty slot to create a task starting at that time
- Click a task to open the full editor: date, time, duration, color,
  priority, tags, assignee, and the comment thread

> **Note on upgrading from an earlier version of this app:** the task
> schema changed (`dueDate` → `startTime` + `durationMinutes` + `color`,
> and most recently a new required `allDay` field). If you already
> created test tasks under an older schema, `convex dev` will refuse to
> push until they're gone — delete them from the `tasks` table in the
> [Convex dashboard](https://dashboard.convex.dev) (`npx convex dashboard`)
> first.

Durations go up to 7 hours, and a task can be marked **All day** (checkbox
in the new-task dialog and the detail panel) — it then shows as a chip in
the all-day row above the hour grid instead of a timed block.

## Private tasks

One account can be given the ability to create **private** tasks, which the
other account never sees — not on the calendar, not in search, not even in
the API (it's enforced in the Convex functions, not just hidden in the UI).
Private tasks are drawn with diagonal stripes, a dashed outline and a lock
icon. Grant the ability once from your terminal:

```bash
npx convex run seed:grantPrivate '{"username": "natasha"}'
```

Then she'll see a "Private" checkbox in the new-task dialog and task editor.
Private tasks can't be assigned to anyone else.

## How it works

- **Auth**: deliberately simple — two accounts, no signup flow. Passwords
  are SHA-256 hashed before being stored or compared (see `convex/lib.ts`
  and `convex/auth.ts`). Every task/comment function on the backend takes
  the session token and verifies it before touching data, so the API
  can't be used by anyone without a valid session — but this is not
  bank-grade security, just enough for a private tool between two people
  you trust.
- **Data model**: `convex/schema.ts` — `users`, `sessions`, `tasks`,
  `comments`.
- **UI**: `app/page.tsx` is the shell; `components/` holds the sidebar,
  task list/row, new-task dialog, and the slide-over detail panel with
  comments.

## Where to go from here

Ideas if you want to extend it later:
- Due-date reminders (a Convex scheduled function + email/SMS)
- Drag-and-drop status changes
- Activity log per task
- File attachments on comments (Convex file storage)
