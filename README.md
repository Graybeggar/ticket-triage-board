# Ticket Triage Board

A small React app that models the first screen a support agent actually needs:
a queue that answers "what is on fire, what is overdue, and what do I open next"
without hunting.

## What it does

- Live queue summary: open tickets, urgent tickets still open, overdue count,
  and resolved count, all updating as statuses change.
- Fourteen sample tickets with realistic subjects, requesters, categories,
  priorities, and problem descriptions.
- Search by subject, requester, or ticket ID, plus filters for status and
  priority and three sort orders (priority then oldest, oldest, newest).
- Overdue flags computed from per-priority response targets
  (Urgent 8h, High 24h, Normal 72h, Low 120h).
- A detail panel for the selected ticket with its facts and one-click status
  changes (New, In Progress, Waiting, Resolved).
- A proper empty state that tells the user why nothing matches and what to try.

## Design decisions (the UI/UX part)

- Priority is color AND text, never color alone, so the queue stays readable
  for color-blind users and in grayscale printouts.
- The most dangerous numbers (urgent open, overdue) sit at the top and use the
  same words everywhere: the chips in the list, the detail panel, and the
  summary always agree.
- Filters are labeled selects and a labeled search box, keyboard reachable,
  with a visible focus ring.
- The layout is one column on narrow screens and two on wide ones, and the
  detail panel sticks while the list scrolls on desktop.

## Run it

```bash
npm install
npm run dev      # local dev server
npm run build    # production build in dist/
```

Sample data lives in `src/data/tickets.js`; ages are stored as hours before
"now" so the overdue logic always demonstrates itself.
