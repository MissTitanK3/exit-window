# Exit Window

Exit Window is a private, offline-first readiness instrument. It helps you plan and track everything needed to open an “exit window” (move, relocation, emergency departure) without sending data to any server.

## What it does

- Summarizes readiness across comms, housing, cash runway, healthcare, dependents, legal, and more.
- Runs a deterministic evaluation to surface hard blockers, soft blockers, and the earliest plausible window.
- Tracks risk boundaries, fallback plans, and stabilization (“holding”) mode when you need to pause.
- Captures snapshots, scoped notes, and exports an offline pack for print/save.
- Works offline by default: no external network calls are allowed, and data stays in your browser.

## Tech stack

- Next.js 16 (App Router) + React 19
- Zustand stores for local state persistence
- Serwist for the service worker build (`service-worker/sw.ts` → `public/sw.js`)
- TypeScript + ESLint

## Getting started

Prereqs: Node 18+ and pnpm (recommended).

Install dependencies:

```bash
pnpm install
```

Run the app in dev (no service worker in dev to avoid HMR loops):

```bash
pnpm dev
```

Open <http://localhost:3000>.

Type-check/lint:

```bash
pnpm lint
```

Build for production (includes service worker) and serve:

```bash
pnpm build
pnpm start
```

## Offline and privacy model

- No backend: everything is client-side; data lives in `localStorage` under the key `exit-window-store` (and per-slice keys via `makeStorageKey`). Clear that key to reset.
- External fetches are blocked by a guard; only same-origin requests are allowed. No first-party APIs are called.
- Serwist builds a single worker from `service-worker/sw.ts` and registers it in production (see `serwist.config.ts`). Only local assets are cached; no external domains are contacted.
- In development, any existing service workers are unregistered on load to keep hot-reload stable.
- A “Quick wipe” button lives at the top of the app to clear all Exit Window data stored locally.

## Evaluation logic (short version)

- Hard blockers: legal blockers, healthcare at risk, unsupported dependents, or cash runway under 1 month.
- Soft blockers: tight runway (<3 months), unstable income, housing notice/lock-in/unknown timing, unknown legal/healthcare/dependents status.
- If no hard blockers remain, the earliest window is based on housing timing (lease end + notice if present). Output includes reasons and ordered steps.

## Project map

- `app/` – layout and main surface (action cards, drawers, evaluation summary, exports, notes, snapshots).
- `features/` – UI modules (constraints, evaluation, risk boundaries, stability mode, pre-departure, exports, notes, snapshots).
- `domain/` – pure logic for constraints and evaluation.
- `state/` – Zustand stores and hydration helpers.
- `persistence/` – localStorage wrapper.
- `service-worker/` – Serwist entry; compiled to `public/sw.js` during build.

## Release checklist

- pnpm lint
- pnpm build
- In one terminal, run `pnpm start`; in another, run `pnpm sw:check` (requires Playwright, defaults to <http://localhost:3000>).
- Manually load the app, toggle devtools offline mode, and confirm the UI still renders (cached by the service worker).
- Use the Quick wipe control to clear local data and confirm a clean rehydration.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).

## Contributing

Issues and PRs are welcome. Please keep the offline-only/privacy guarantees intact when adding features (no external network calls; keep data local by default).
