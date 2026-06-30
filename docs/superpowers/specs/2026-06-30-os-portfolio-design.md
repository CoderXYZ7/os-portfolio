# Simulated-OS Portfolio — Design

## Goal

A personal developer portfolio that presents itself as a simulated computer: a boot sequence drops the visitor into a windowed desktop where projects, an "About Me," and a "Contact" app are all things you open like programs. New projects are added by simply dropping a folder (README.md + images) into a watched directory on the server — no rebuild, no redeploy. The aesthetic is industrial/rugged/NASA-punk: graphite, dirty white, bright orange and blue accents, monospace fonts, scanlines, hard edges.

## Non-goals

- No CMS/admin UI for editing projects — content is authored by hand as files on disk.
- No contact-form email sending — Contact app is just styled links (mailto, GitHub, LinkedIn, etc.).
- No e2e test framework (Playwright) for v1.
- No persistence of window layout across page reloads — every visit is a fresh "boot."
- Terminal app is flavor only — it is not a required parallel navigation path; the desktop icons are the primary UX.

## Architecture

```
/server          Express API + WebSocket server + file-watcher (content engine)
/client          React + Vite frontend (the simulated OS)
/projects         Project folders (the content) — watched live
/content          about.md, contact.json — watched live
```

Two independent processes (API server, Vite dev server / static build), no SSR. The whole experience is client-rendered; the backend's only job is turning a folder of files into JSON + serving images.

### Backend (content engine)

- **Express** serves the REST API and static image files.
- **chokidar** watches `/projects` and `/content` recursively.
- **gray-matter** parses YAML frontmatter out of each `README.md`.
- **remark** (or `marked`) renders the markdown body to HTML.
- **ws** runs a WebSocket server; on any filesystem change, the watcher (debounced ~300ms to coalesce rapid saves) triggers a rescan and broadcasts `projects:changed` (or `content:changed`) to all connected clients.

In-memory project list is rebuilt on every rescan (no database — the filesystem *is* the database). Rebuild is cheap enough at portfolio scale (tens of projects, not thousands) to do a full rescan rather than incremental updates.

**API surface**
- `GET /api/projects` — list of project summaries (title, slug, tags, featured, first image as thumbnail).
- `GET /api/projects/:slug` — full detail (rendered HTML body, ordered image list, links).
- `GET /api/projects/:slug/images/:filename` — static image serving.
- `GET /api/content/about` — rendered `about.md`.
- `GET /api/content/contact` — parsed `contact.json`.
- `WS /ws` — emits `{ type: "projects:changed" }` / `{ type: "content:changed" }`.

### Frontend (the OS)

- **React + Vite**, **Tailwind** for styling with a custom theme (palette/fonts below), **react-rnd** for draggable/resizable windows (styled fully custom, not its default chrome).
- On load: fetch `/api/projects` once, fetch content once. Open a WebSocket connection; on `*:changed` events, silently refetch and diff the icon set (animate new icons spawning, removed icons despawning) — no reload, no toast.
- A shared `openProjectWindow(slug)` function is the single code path used by both desktop double-click and the terminal's `open <project>` command — no duplicated window-opening logic.

## Content model

Project folder contract:

```
/projects/<slug>/
  README.md
  images/
    01-hero.png
    02-dashboard.png
```

`README.md` frontmatter (all fields optional except none are strictly required — every field has a fallback):

```yaml
---
title: My Cool App
tags: [rust, cli, networking]
techStack: [Rust, Tokio, SQLite]
repoUrl: https://github.com/you/my-cool-app
liveUrl: https://example.com
date: 2026-04-01
featured: true
---
Markdown description body.
```

Fallback rules:
- No frontmatter at all → title derived from folder name (kebab-case → Title Case), no tags/links/date.
- No `images/` folder, or empty → window renders with no carousel section.
- Images ordered by filename sort — author controls carousel order via numeric prefixes (`01-`, `02-`...).
- Folder with no `README.md` → skipped entirely, warning logged server-side, never appears on the desktop.

`/content/about.md` — plain markdown (no frontmatter needed), rendered in the About Me window.
`/content/contact.json` — flat list of `{ label, value, href }` entries (email, GitHub, LinkedIn, etc.) rendered as a styled link list.

## UX flow

### Boot sequence

Plays once per browser tab session (`sessionStorage` flag — replays on a fresh visit/new tab, skipped on subsequent in-tab navigation). Skippable via keypress or click at any point.

1. Brief power-on flicker on black.
2. Typewriter-paced BIOS/POST-style lines: memory check, disk check, "loading kernel modules" (themed module names reflecting real skills, e.g. `ai.ko`, `linux.ko`), ASCII/stencil-style name logo.
3. `login:` prompt auto-fills, "Welcome" line, then a CRT-style power-on warp/scale transition into the desktop.

### Desktop shell

- Icon grid: one icon per project (newest/featured first) + fixed icons for Terminal, About Me, Contact.
- Status bar (top or bottom): clock, fake CPU/mem ticker (flavor), a "SIGNAL" indicator that reflects real WebSocket connection state (pulses green when connected, dims/reds out on disconnect — flavor with a real meaning underneath).
- Double-click icon → opens a window: title bar (close/minimize/maximize), draggable/resizable body, click-to-focus z-index stacking, minimize sends to a bottom dock.
- Project window body: rendered markdown description + custom image carousel (arrow buttons, dot indicators, keyboard arrow + swipe support, lazy-loaded images).
- About Me window: renders `about.md`.
- Contact window: renders `contact.json` as a styled link list (mailto/external links only, no form submission).

### Terminal app (flavor only)

Mock command interpreter, no real shell execution. Commands: `help`, `ls`, `cat <file>`, `whoami`, `about`, `projects`, `open <project>`, `clear` (+ a joke `sudo` easter egg). Command history via up/down arrows. `open <project>` calls the same `openProjectWindow(slug)` used by desktop icons.

## Visual design system

**Palette**
- Graphite dark panels (`~#2a2d2f`), dirty/warm off-white (`~#e4e1d8`) for text/light surfaces.
- Primary accent: bright orange (`~#ff6a00`) for actions/highlights.
- Secondary accent: blue (`~#3aa0ff`) for links/info/SIGNAL indicator.
- Sparse amber (warning) / red (close/error) accents used only for status meaning, not decoration.

**Typography**
- Monospace UI/body font (JetBrains Mono or IBM Plex Mono).
- Stenciled/industrial display face for boot logo and major headers.
- Uppercase, letter-spaced labels for window titles and buttons.

**Texture & effects**
- Low-opacity CRT scanline overlay across the viewport.
- Fine grain/noise texture on panels.
- HUD bracket-corner accents (┌ ┐ └ ┘) on windows/panels; rivet/bolt details on title bars.
- Brief glitch flicker on interactive hover; orange/blue chromatic-aberration sliver on window open/close transitions.
- Hard edges throughout: no rounded corners, no blurred shadows — offset hard-drop-shadows only.

## Error handling

- Malformed frontmatter YAML → log warning, fall back to folder-name title, treat remaining content as plain body. Never crashes the scan.
- Folder with no `README.md` → skipped, warning logged.
- Missing/empty `images/` → no carousel section rendered.
- Unreadable/corrupt image → skipped from carousel, logged.
- WebSocket disconnect → silent retry with backoff; SIGNAL indicator reflects state; no user-facing error modal.

## Testing approach

- **Backend**: Vitest unit tests for the content-engine — frontmatter parsing, slug generation, image-folder scanning/ordering, markdown rendering, debounced-rescan-on-change behavior, fallback rules above.
- **Frontend**: light smoke tests for pure logic only (terminal command parser, carousel index math). Boot sequence/drag/glitch/visual feel is verified manually in-browser (via the run/verify workflow) rather than automated — low value-per-effort for hand-tuned animation/timing work.
- No e2e framework for v1.

## Open items deferred to implementation

- Exact hex values / font choices may be refined visually during implementation against this palette description.
- Number of/specific BIOS joke lines, kernel module names, and terminal easter eggs are creative details filled in during implementation, consistent with "industrial NASA-punk, Linux/AI-loving developer" framing above.
