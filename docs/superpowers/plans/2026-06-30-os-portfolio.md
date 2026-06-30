# Simulated-OS Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a self-hosted portfolio that boots like a computer into a windowed desktop, where projects are folders on disk (README.md + images) discovered live by a file-watching backend, and rendered as an industrial/NASA-punk themed simulated OS.

**Architecture:** Two independent apps in one repo — `/server` (Express REST API + WebSocket + chokidar file watcher, the "content engine" that turns `/projects` and `/content` folders into JSON) and `/client` (React + Vite SPA, the "OS" — boot sequence, windowed desktop, project/terminal/about/contact apps). No SSR; backend only serves data and images.

**Tech Stack:** Node.js + Express + chokidar + gray-matter + remark + ws (backend); React + Vite + Tailwind + react-rnd (frontend); Vitest for unit tests on both sides.

## Global Constraints

- No SSR — fully client-rendered SPA. (spec: Architecture)
- No CMS/admin UI — content is authored as files on disk only. (spec: Non-goals)
- No contact-form email sending — Contact app renders static links only. (spec: Non-goals)
- No e2e test framework (Playwright etc.) for v1. (spec: Non-goals, Testing approach)
- No window-layout persistence across reloads — every visit is a fresh boot. (spec: Non-goals)
- Terminal app is flavor only — not a required parallel navigation path. (spec: Non-goals, Terminal app)
- Self-hosted deployment target (Docker/VPS) — backend assumes a persistent, writable-by-you filesystem, not ephemeral serverless storage. (spec: Architecture)
- File-watcher rescans are debounced ~300ms to coalesce rapid saves. (spec: Backend)
- Palette: graphite `~#2a2d2f`, dirty off-white `~#e4e1d8`, primary accent orange `~#ff6a00`, secondary accent blue `~#3aa0ff`, sparse amber/red for status only. (spec: Visual design system)
- Typography: monospace UI/body font (JetBrains Mono or IBM Plex Mono), stenciled/industrial display face for boot logo and major headers, uppercase letter-spaced labels for window titles/buttons. (spec: Visual design system)
- Hard edges only — no rounded corners, no blurred drop-shadows (offset hard shadows only). (spec: Visual design system)
- Folder with no `README.md` → skipped, warning logged, never crashes the scan. Malformed frontmatter → fallback to folder-name title, log warning. Missing/empty `images/` → no carousel rendered. (spec: Content model, Error handling)

---

## File Structure

```
/server
  package.json
  src/
    store.js                 -- ContentStore: in-memory state + refresh()
    projectParser.js          -- parses one project folder -> project record
    contentParser.js           -- parses about.md / contact.json
    watcher.js                  -- chokidar setup, debounce, triggers store.refresh() + broadcast
    ws.js                        -- WebSocket server + broadcast helper
    routes/
      projects.js                -- GET /api/projects, GET /api/projects/:slug, image static serving
      content.js                  -- GET /api/content/about, GET /api/content/contact
    index.js                       -- wires store+watcher+ws+routes, starts HTTP server
  test/
    projectParser.test.js
    contentParser.test.js
  projects/                        -- sample project folders (dev content)
    example-project/
      README.md
      images/
  content/
    about.md
    contact.json

/client
  package.json
  vite.config.js
  tailwind.config.js
  src/
    main.jsx
    App.jsx
    api/
      client.js                 -- fetch wrappers
      useWebSocket.js             -- WS connection hook
    boot/
      BootSequence.jsx
      bootLines.js
    desktop/
      Desktop.jsx
      DesktopIcon.jsx
      StatusBar.jsx
      useProjects.js              -- fetch + live-refresh project summaries
    windows/
      WindowManagerContext.jsx     -- open/close/focus/minimize state
      Window.jsx                    -- generic window chrome (react-rnd wrapper)
      ProjectWindow.jsx
      ImageCarousel.jsx
      useCarouselIndex.js            -- pure index-math hook
      AboutWindow.jsx
      ContactWindow.jsx
      TerminalWindow.jsx
      terminalCommands.js             -- pure command parser/dispatcher
    styles/
      theme.css                       -- CSS variables for palette/fonts
      effects.css                      -- scanlines, grain, glitch, HUD corners
  test/
    terminalCommands.test.js
    useCarouselIndex.test.js
```

---

### Task 1: Backend scaffold + ContentStore skeleton

**Files:**
- Create: `server/package.json`
- Create: `server/src/store.js`
- Test: `server/test/store.test.js`

**Interfaces:**
- Produces: `class ContentStore { constructor(projectsDir, contentDir); async refresh(); getProjects(); getProject(slug); getAbout(); getContact(); }` — `getProjects()`/`getProject`/`getAbout`/`getContact` all return `null`/`[]` defaults until `refresh()` has populated state at least once.

- [ ] **Step 1: Create `server/package.json`**

```json
{
  "name": "portfolio-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "node --watch src/index.js",
    "start": "node src/index.js",
    "test": "vitest run"
  },
  "dependencies": {
    "chokidar": "^3.6.0",
    "express": "^4.19.2",
    "gray-matter": "^4.0.3",
    "remark": "^15.0.1",
    "remark-html": "^16.0.1",
    "ws": "^8.17.0"
  },
  "devDependencies": {
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `cd server && npm install`
Expected: `node_modules` created, no errors.

- [ ] **Step 3: Write the failing test for the store skeleton**

```js
// server/test/store.test.js
import { describe, it, expect } from 'vitest';
import { ContentStore } from '../src/store.js';

describe('ContentStore skeleton', () => {
  it('returns empty defaults before refresh() is called', () => {
    const store = new ContentStore('/tmp/does-not-matter-yet', '/tmp/does-not-matter-yet');
    expect(store.getProjects()).toEqual([]);
    expect(store.getProject('anything')).toBeNull();
    expect(store.getAbout()).toBeNull();
    expect(store.getContact()).toEqual([]);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd server && npx vitest run test/store.test.js`
Expected: FAIL — `Cannot find module '../src/store.js'`

- [ ] **Step 5: Write minimal implementation**

```js
// server/src/store.js
export class ContentStore {
  constructor(projectsDir, contentDir) {
    this.projectsDir = projectsDir;
    this.contentDir = contentDir;
    this.projects = [];
    this.about = null;
    this.contact = [];
  }

  async refresh() {
    // populated in Task 4 once projectParser/contentParser exist
  }

  getProjects() {
    return this.projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      tags: p.tags,
      featured: p.featured,
      thumbnail: p.images[0] ?? null,
    }));
  }

  getProject(slug) {
    return this.projects.find((p) => p.slug === slug) ?? null;
  }

  getAbout() {
    return this.about;
  }

  getContact() {
    return this.contact;
  }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd server && npx vitest run test/store.test.js`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add server/package.json server/src/store.js server/test/store.test.js
git commit -m "feat(server): scaffold ContentStore skeleton"
```

---

### Task 2: Project folder parser

**Files:**
- Create: `server/src/projectParser.js`
- Test: `server/test/projectParser.test.js`
- Create fixtures: `server/test/fixtures/full-project/README.md`, `server/test/fixtures/full-project/images/01-hero.png`, `server/test/fixtures/full-project/images/02-dash.png`, `server/test/fixtures/no-frontmatter-project/README.md`, `server/test/fixtures/no-images-project/README.md`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `async function parseProjectFolder(folderPath, slug)` returning a project record `{ slug, title, tags, techStack, repoUrl, liveUrl, date, featured, bodyHtml, images }` or `null` if no `README.md` exists. `images` is a sorted array of filenames (strings) found in `<folderPath>/images/`, `[]` if that subfolder is missing.

- [ ] **Step 1: Create fixture project folders**

```bash
mkdir -p server/test/fixtures/full-project/images
mkdir -p server/test/fixtures/no-frontmatter-project
mkdir -p server/test/fixtures/no-images-project
mkdir -p server/test/fixtures/no-readme-project
```

```markdown
<!-- server/test/fixtures/full-project/README.md -->
---
title: Full Project
tags: [rust, cli]
techStack: [Rust, Tokio]
repoUrl: https://github.com/you/full-project
liveUrl: https://example.com
date: 2026-04-01
featured: true
---

This is the **description** body.
```

```markdown
<!-- server/test/fixtures/no-frontmatter-project/README.md -->
Just a plain description, no frontmatter at all.
```

```markdown
<!-- server/test/fixtures/no-images-project/README.md -->
---
title: No Images Project
---

Has no images folder.
```

Create two empty placeholder files so the images dir round-trips through git (content doesn't matter, parser only reads filenames):

```bash
touch server/test/fixtures/full-project/images/01-hero.png
touch server/test/fixtures/full-project/images/02-dash.png
```

- [ ] **Step 2: Write the failing tests**

```js
// server/test/projectParser.test.js
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseProjectFolder } from '../src/projectParser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(__dirname, 'fixtures');

describe('parseProjectFolder', () => {
  it('parses frontmatter, body, and ordered images', async () => {
    const project = await parseProjectFolder(path.join(fixtures, 'full-project'), 'full-project');
    expect(project.slug).toBe('full-project');
    expect(project.title).toBe('Full Project');
    expect(project.tags).toEqual(['rust', 'cli']);
    expect(project.techStack).toEqual(['Rust', 'Tokio']);
    expect(project.repoUrl).toBe('https://github.com/you/full-project');
    expect(project.liveUrl).toBe('https://example.com');
    expect(project.date).toBe('2026-04-01');
    expect(project.featured).toBe(true);
    expect(project.bodyHtml).toContain('<strong>description</strong>');
    expect(project.images).toEqual(['01-hero.png', '02-dash.png']);
  });

  it('falls back to folder-name title and empty metadata when frontmatter is missing', async () => {
    const project = await parseProjectFolder(
      path.join(fixtures, 'no-frontmatter-project'),
      'no-frontmatter-project'
    );
    expect(project.title).toBe('No Frontmatter Project');
    expect(project.tags).toEqual([]);
    expect(project.techStack).toEqual([]);
    expect(project.repoUrl).toBeNull();
    expect(project.liveUrl).toBeNull();
    expect(project.date).toBeNull();
    expect(project.featured).toBe(false);
    expect(project.bodyHtml).toContain('Just a plain description');
  });

  it('returns an empty images array when the images folder is missing', async () => {
    const project = await parseProjectFolder(path.join(fixtures, 'no-images-project'), 'no-images-project');
    expect(project.images).toEqual([]);
  });

  it('returns null when README.md is missing', async () => {
    const project = await parseProjectFolder(path.join(fixtures, 'no-readme-project'), 'no-readme-project');
    expect(project).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd server && npx vitest run test/projectParser.test.js`
Expected: FAIL — `Cannot find module '../src/projectParser.js'`

- [ ] **Step 4: Write implementation**

```js
// server/src/projectParser.js
import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

function folderNameToTitle(slug) {
  return slug
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

async function listImages(imagesDir) {
  try {
    const entries = await fs.readdir(imagesDir);
    return entries.filter((name) => !name.startsWith('.')).sort();
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function parseProjectFolder(folderPath, slug) {
  const readmePath = path.join(folderPath, 'README.md');
  let raw;
  try {
    raw = await fs.readFile(readmePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.warn(`[projectParser] skipping "${slug}": no README.md found`);
      return null;
    }
    throw err;
  }

  let frontmatter = {};
  let body = raw;
  try {
    const parsed = matter(raw);
    frontmatter = parsed.data ?? {};
    body = parsed.content;
  } catch (err) {
    console.warn(`[projectParser] malformed frontmatter in "${slug}", falling back to plain body: ${err.message}`);
  }

  const bodyHtml = String(await remark().use(remarkHtml).process(body));
  const images = await listImages(path.join(folderPath, 'images'));

  return {
    slug,
    title: frontmatter.title ?? folderNameToTitle(slug),
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    techStack: Array.isArray(frontmatter.techStack) ? frontmatter.techStack : [],
    repoUrl: frontmatter.repoUrl ?? null,
    liveUrl: frontmatter.liveUrl ?? null,
    date: frontmatter.date ?? null,
    featured: Boolean(frontmatter.featured),
    bodyHtml,
    images,
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd server && npx vitest run test/projectParser.test.js`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add server/src/projectParser.js server/test/projectParser.test.js server/test/fixtures
git commit -m "feat(server): parse project folders into project records"
```

---

### Task 3: About/contact content parser

**Files:**
- Create: `server/src/contentParser.js`
- Test: `server/test/contentParser.test.js`
- Create fixtures: `server/test/fixtures/content/about.md`, `server/test/fixtures/content/contact.json`

**Interfaces:**
- Consumes: nothing from earlier tasks (uses `remark`/`remarkHtml` same as Task 2).
- Produces: `async function parseAboutMarkdown(filePath)` returns `string` (HTML) or `null` if file missing. `async function parseContactJson(filePath)` returns `Array<{label, value, href}>` or `[]` if file missing/invalid JSON.

- [ ] **Step 1: Create fixtures**

```bash
mkdir -p server/test/fixtures/content
```

```markdown
<!-- server/test/fixtures/content/about.md -->
# About Me

I build **rugged** software.
```

```json
// server/test/fixtures/content/contact.json
[
  { "label": "Email", "value": "you@example.com", "href": "mailto:you@example.com" },
  { "label": "GitHub", "value": "github.com/you", "href": "https://github.com/you" }
]
```

- [ ] **Step 2: Write the failing tests**

```js
// server/test/contentParser.test.js
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAboutMarkdown, parseContactJson } from '../src/contentParser.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(__dirname, 'fixtures', 'content');

describe('parseAboutMarkdown', () => {
  it('renders markdown to HTML', async () => {
    const html = await parseAboutMarkdown(path.join(fixtures, 'about.md'));
    expect(html).toContain('<strong>rugged</strong>');
  });

  it('returns null when the file is missing', async () => {
    const html = await parseAboutMarkdown(path.join(fixtures, 'missing.md'));
    expect(html).toBeNull();
  });
});

describe('parseContactJson', () => {
  it('parses a list of contact entries', async () => {
    const entries = await parseContactJson(path.join(fixtures, 'contact.json'));
    expect(entries).toEqual([
      { label: 'Email', value: 'you@example.com', href: 'mailto:you@example.com' },
      { label: 'GitHub', value: 'github.com/you', href: 'https://github.com/you' },
    ]);
  });

  it('returns an empty array when the file is missing', async () => {
    const entries = await parseContactJson(path.join(fixtures, 'missing.json'));
    expect(entries).toEqual([]);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd server && npx vitest run test/contentParser.test.js`
Expected: FAIL — `Cannot find module '../src/contentParser.js'`

- [ ] **Step 4: Write implementation**

```js
// server/src/contentParser.js
import fs from 'node:fs/promises';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

export async function parseAboutMarkdown(filePath) {
  let raw;
  try {
    raw = await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }
  return String(await remark().use(remarkHtml).process(raw));
}

export async function parseContactJson(filePath) {
  let raw;
  try {
    raw = await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn(`[contentParser] malformed contact.json at "${filePath}": ${err.message}`);
    return [];
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd server && npx vitest run test/contentParser.test.js`
Expected: PASS (4 tests)

- [ ] **Step 6: Commit**

```bash
git add server/src/contentParser.js server/test/contentParser.test.js server/test/fixtures/content
git commit -m "feat(server): parse about.md and contact.json"
```

---

### Task 4: Wire ContentStore.refresh() to the parsers

**Files:**
- Modify: `server/src/store.js`
- Test: `server/test/store.test.js`

**Interfaces:**
- Consumes: `parseProjectFolder(folderPath, slug)` from Task 2, `parseAboutMarkdown(filePath)`/`parseContactJson(filePath)` from Task 3.
- Produces: `store.refresh()` now actually scans `projectsDir` (one subfolder = one project, skips folders where `parseProjectFolder` returns `null`) and `contentDir/about.md` + `contentDir/contact.json`, populating `getProjects()`/`getProject()`/`getAbout()`/`getContact()`.

- [ ] **Step 1: Write the failing test**

```js
// server/test/store.test.js  (append to existing file from Task 1)
import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ContentStore } from '../src/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('ContentStore skeleton', () => {
  it('returns empty defaults before refresh() is called', () => {
    const store = new ContentStore('/tmp/does-not-matter-yet', '/tmp/does-not-matter-yet');
    expect(store.getProjects()).toEqual([]);
    expect(store.getProject('anything')).toBeNull();
    expect(store.getAbout()).toBeNull();
    expect(store.getContact()).toEqual([]);
  });
});

describe('ContentStore.refresh()', () => {
  it('scans the fixtures/scan-root projects and content directories', async () => {
    const projectsDir = path.join(__dirname, 'fixtures', 'scan-root', 'projects');
    const contentDir = path.join(__dirname, 'fixtures', 'scan-root', 'content');
    const store = new ContentStore(projectsDir, contentDir);

    await store.refresh();

    const summaries = store.getProjects();
    expect(summaries.map((p) => p.slug).sort()).toEqual(['has-readme']);
    expect(summaries[0].thumbnail).toBeNull();

    const full = store.getProject('has-readme');
    expect(full.title).toBe('Has Readme');
    expect(full.bodyHtml).toContain('Hello');

    expect(store.getAbout()).toContain('Scan Root About');
    expect(store.getContact()).toEqual([{ label: 'Email', value: 'a@b.com', href: 'mailto:a@b.com' }]);
  });
});
```

- [ ] **Step 2: Create scan-root fixtures**

```bash
mkdir -p server/test/fixtures/scan-root/projects/has-readme
mkdir -p server/test/fixtures/scan-root/projects/no-readme-skip-me
mkdir -p server/test/fixtures/scan-root/content
```

```markdown
<!-- server/test/fixtures/scan-root/projects/has-readme/README.md -->
---
title: Has Readme
---

Hello world.
```

(`no-readme-skip-me` is left with no `README.md` to verify it's skipped.)

```markdown
<!-- server/test/fixtures/scan-root/content/about.md -->
# Scan Root About
```

```json
// server/test/fixtures/scan-root/content/contact.json
[{ "label": "Email", "value": "a@b.com", "href": "mailto:a@b.com" }]
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd server && npx vitest run test/store.test.js`
Expected: FAIL — `summaries` is `[]` because `refresh()` is still a no-op.

- [ ] **Step 4: Implement `refresh()`**

```js
// server/src/store.js
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseProjectFolder } from './projectParser.js';
import { parseAboutMarkdown, parseContactJson } from './contentParser.js';

export class ContentStore {
  constructor(projectsDir, contentDir) {
    this.projectsDir = projectsDir;
    this.contentDir = contentDir;
    this.projects = [];
    this.about = null;
    this.contact = [];
  }

  async refresh() {
    this.projects = await this.#scanProjects();
    this.about = await parseAboutMarkdown(path.join(this.contentDir, 'about.md'));
    this.contact = await parseContactJson(path.join(this.contentDir, 'contact.json'));
  }

  async #scanProjects() {
    let entries;
    try {
      entries = await fs.readdir(this.projectsDir, { withFileTypes: true });
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }

    const folders = entries.filter((e) => e.isDirectory());
    const parsed = await Promise.all(
      folders.map((dir) => parseProjectFolder(path.join(this.projectsDir, dir.name), dir.name))
    );
    return parsed.filter((p) => p !== null);
  }

  getProjects() {
    return this.projects.map((p) => ({
      slug: p.slug,
      title: p.title,
      tags: p.tags,
      featured: p.featured,
      thumbnail: p.images[0] ?? null,
    }));
  }

  getProject(slug) {
    return this.projects.find((p) => p.slug === slug) ?? null;
  }

  getAbout() {
    return this.about;
  }

  getContact() {
    return this.contact;
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd server && npx vitest run test/store.test.js`
Expected: PASS (2 tests)

- [ ] **Step 6: Commit**

```bash
git add server/src/store.js server/test/store.test.js server/test/fixtures/scan-root
git commit -m "feat(server): wire ContentStore.refresh() to scan projects and content"
```

---

### Task 5: REST routes for projects and content + image static serving

**Files:**
- Create: `server/src/routes/projects.js`
- Create: `server/src/routes/content.js`
- Create: `server/src/index.js`
- Manual test only (this task wires HTTP, verified by running the server)

**Interfaces:**
- Consumes: `ContentStore` from Task 4.
- Produces: `createProjectsRouter(store, projectsDir)` and `createContentRouter(store)`, both returning an Express `Router`. `index.js` exports nothing (entry point) but is structured so Task 6/7 can import `store` wiring patterns from it.

- [ ] **Step 1: Create the projects router**

```js
// server/src/routes/projects.js
import express from 'express';
import path from 'node:path';

export function createProjectsRouter(store, projectsDir) {
  const router = express.Router();

  router.get('/', (req, res) => {
    res.json(store.getProjects());
  });

  router.get('/:slug', (req, res) => {
    const project = store.getProject(req.params.slug);
    if (!project) {
      res.status(404).json({ error: 'project not found' });
      return;
    }
    res.json(project);
  });

  router.use('/:slug/images', (req, res, next) => {
    const slug = req.params.slug;
    express.static(path.join(projectsDir, slug, 'images'))(req, res, next);
  });

  return router;
}
```

- [ ] **Step 2: Create the content router**

```js
// server/src/routes/content.js
import express from 'express';

export function createContentRouter(store) {
  const router = express.Router();

  router.get('/about', (req, res) => {
    res.json({ html: store.getAbout() });
  });

  router.get('/contact', (req, res) => {
    res.json(store.getContact());
  });

  return router;
}
```

- [ ] **Step 3: Create the server entry point**

```js
// server/src/index.js
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ContentStore } from './store.js';
import { createProjectsRouter } from './routes/projects.js';
import { createContentRouter } from './routes/content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECTS_DIR = process.env.PROJECTS_DIR ?? path.join(__dirname, '..', 'projects');
const CONTENT_DIR = process.env.CONTENT_DIR ?? path.join(__dirname, '..', 'content');
const PORT = process.env.PORT ?? 4000;

const store = new ContentStore(PROJECTS_DIR, CONTENT_DIR);

const app = express();
app.use(cors());
app.use('/api/projects', createProjectsRouter(store, PROJECTS_DIR));
app.use('/api/content', createContentRouter(store));

await store.refresh();

const server = app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});

export { server, store, PROJECTS_DIR, CONTENT_DIR };
```

- [ ] **Step 4: Add `cors` dependency**

```bash
cd server && npm install cors
```

- [ ] **Step 5: Create sample dev content so the server has something to serve**

```bash
mkdir -p server/projects/example-project/images
mkdir -p server/content
```

```markdown
<!-- server/projects/example-project/README.md -->
---
title: Example Project
tags: [example]
techStack: [Node.js]
featured: true
---

This is a placeholder project so the dev server has content to show.
```

```markdown
<!-- server/content/about.md -->
# About

Placeholder about page — replace with real bio.
```

```json
// server/content/contact.json
[{ "label": "Email", "value": "you@example.com", "href": "mailto:you@example.com" }]
```

- [ ] **Step 6: Run the server manually and verify the API**

Run: `cd server && npm run dev` (in background/separate terminal)
Then: `curl http://localhost:4000/api/projects`
Expected: JSON array containing one entry with `"slug":"example-project"`.

Then: `curl http://localhost:4000/api/projects/example-project`
Expected: JSON object with `"bodyHtml"` containing the placeholder text.

Then: `curl http://localhost:4000/api/content/about`
Expected: `{"html":"<h1>About</h1>..."}`

Stop the dev server (Ctrl-C) before continuing.

- [ ] **Step 7: Commit**

```bash
git add server/src/routes server/src/index.js server/package.json server/package-lock.json server/projects server/content
git commit -m "feat(server): expose REST API for projects and content"
```

---

### Task 6: WebSocket broadcast server

**Files:**
- Create: `server/src/ws.js`
- Modify: `server/src/index.js`

**Interfaces:**
- Consumes: the `http.Server` instance returned by `app.listen()` (Task 5).
- Produces: `createWsServer(httpServer)` returns `{ broadcast(message) }`, where `broadcast` JSON-stringifies `message` and sends it to every currently-open client connection.

- [ ] **Step 1: Implement the WS server**

```js
// server/src/ws.js
import { WebSocketServer } from 'ws';

export function createWsServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  function broadcast(message) {
    const payload = JSON.stringify(message);
    for (const client of wss.clients) {
      if (client.readyState === client.OPEN) {
        client.send(payload);
      }
    }
  }

  return { wss, broadcast };
}
```

- [ ] **Step 2: Wire it into `index.js`**

```js
// server/src/index.js  (replace the bottom section, from `const server = app.listen` onward)
import { createWsServer } from './ws.js';

const server = app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});

const { broadcast } = createWsServer(server);

export { server, store, broadcast, PROJECTS_DIR, CONTENT_DIR };
```

- [ ] **Step 3: Manually verify the WS endpoint accepts connections**

Run: `cd server && npm run dev` (background)
Then, in a separate shell: `npx wscat -c ws://localhost:4000/ws` (installs on the fly via npx) — or skip if `wscat` isn't available and instead verify via the browser console in Task 17's manual check.
Expected: connection opens without error, no immediate close.

Stop the dev server before continuing.

- [ ] **Step 4: Commit**

```bash
git add server/src/ws.js server/src/index.js
git commit -m "feat(server): add WebSocket broadcast server"
```

---

### Task 7: File watcher wired to refresh + broadcast

**Files:**
- Create: `server/src/watcher.js`
- Modify: `server/src/index.js`

**Interfaces:**
- Consumes: `store.refresh()` (Task 4), `broadcast(message)` (Task 6).
- Produces: `createWatcher(store, broadcast, { projectsDir, contentDir, debounceMs })` returns the live `chokidar.FSWatcher` instance (so it can be closed in tests/shutdown).

- [ ] **Step 1: Implement the watcher with debounce**

```js
// server/src/watcher.js
import chokidar from 'chokidar';

export function createWatcher(store, broadcast, { projectsDir, contentDir, debounceMs = 300 }) {
  let timer = null;

  const scheduleRefresh = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      await store.refresh();
      broadcast({ type: 'changed' });
    }, debounceMs);
  };

  const watcher = chokidar.watch([projectsDir, contentDir], {
    ignoreInitial: true,
  });

  watcher.on('add', scheduleRefresh);
  watcher.on('change', scheduleRefresh);
  watcher.on('unlink', scheduleRefresh);
  watcher.on('addDir', scheduleRefresh);
  watcher.on('unlinkDir', scheduleRefresh);

  return watcher;
}
```

- [ ] **Step 2: Wire it into `index.js`**

```js
// server/src/index.js  (add import + call near the bottom, after `const { broadcast } = createWsServer(server);`)
import { createWatcher } from './watcher.js';

const { broadcast } = createWsServer(server);
const watcher = createWatcher(store, broadcast, { projectsDir: PROJECTS_DIR, contentDir: CONTENT_DIR });

export { server, store, broadcast, watcher, PROJECTS_DIR, CONTENT_DIR };
```

- [ ] **Step 3: Manually verify live updates end-to-end**

Run: `cd server && npm run dev` (background)
In another shell:
```bash
mkdir -p server/projects/second-example
cat > server/projects/second-example/README.md <<'EOF'
---
title: Second Example
---
Added live.
EOF
sleep 1
curl http://localhost:4000/api/projects
```
Expected: the JSON array now contains both `example-project` and `second-example` — confirming the watcher triggered a rescan without restarting the server.

Clean up the test folder and stop the dev server:
```bash
rm -rf server/projects/second-example
```

- [ ] **Step 4: Commit**

```bash
git add server/src/watcher.js server/src/index.js
git commit -m "feat(server): watch projects/content dirs and rescan on change"
```

---

### Task 8: Frontend scaffold + design system tokens

**Files:**
- Create: `client/package.json`, `client/vite.config.js`, `client/tailwind.config.js`, `client/postcss.config.js`, `client/index.html`
- Create: `client/src/main.jsx`, `client/src/App.jsx`
- Create: `client/src/styles/theme.css`, `client/src/styles/effects.css`

**Interfaces:**
- Produces: a running Vite dev server proxying `/api` and `/ws` to `http://localhost:4000`, with Tailwind theme tokens (`graphite`, `dirty-white`, `accent-orange`, `accent-blue`) and `effects.css` classes (`.crt-scanlines`, `.grain`, `.hud-corners`) available globally.

- [ ] **Step 1: Scaffold the Vite app**

Run: `cd client && npm create vite@latest . -- --template react` (choose to overwrite/merge into the empty `client` dir if prompted)
Then: `npm install`
Then: `npm install -D tailwindcss postcss autoprefixer`
Then: `npm install react-rnd`
Then: `npx tailwindcss init -p`

- [ ] **Step 2: Configure the Vite dev proxy**

```js
// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
      '/ws': { target: 'ws://localhost:4000', ws: true },
    },
  },
});
```

- [ ] **Step 3: Configure Tailwind theme tokens**

```js
// client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#2a2d2f',
        'dirty-white': '#e4e1d8',
        'accent-orange': '#ff6a00',
        'accent-blue': '#3aa0ff',
        'accent-amber': '#d9a441',
        'accent-red': '#c4453a',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
        display: ['"Big Shoulders"', 'sans-serif'],
      },
      borderRadius: {
        none: '0px',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Add base/effects styles**

```css
/* client/src/styles/theme.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  background-color: theme('colors.graphite');
  color: theme('colors.dirty-white');
  font-family: theme('fontFamily.mono');
}

* {
  border-radius: 0 !important;
}
```

```css
/* client/src/styles/effects.css */
.crt-scanlines::after {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.12) 0px,
    rgba(0, 0, 0, 0.12) 1px,
    transparent 1px,
    transparent 3px
  );
  z-index: 9999;
}

.grain {
  position: relative;
}
.grain::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}

.hud-corners {
  position: relative;
}
.hud-corners::before,
.hud-corners::after {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  border: 2px solid theme('colors.accent-orange');
}
.hud-corners::before {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}
.hud-corners::after {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

.glitch-hover:hover {
  animation: glitch-flicker 180ms steps(2, end) 1;
}
@keyframes glitch-flicker {
  0% { opacity: 1; transform: translateX(0); }
  25% { opacity: 0.6; transform: translateX(-1px); }
  50% { opacity: 1; transform: translateX(1px); }
  75% { opacity: 0.7; transform: translateX(0); }
  100% { opacity: 1; transform: translateX(0); }
}
```

- [ ] **Step 5: Wire entry point**

```jsx
// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/theme.css';
import './styles/effects.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```jsx
// client/src/App.jsx
function App() {
  return (
    <div className="crt-scanlines grain min-h-screen">
      <p className="p-4">Portfolio booting...</p>
    </div>
  );
}

export default App;
```

- [ ] **Step 6: Run dev server and verify visually**

Run: `cd client && npm run dev` (background)
Open `http://localhost:5173` in a browser (or via the `run`/`verify` workflow).
Expected: graphite background, dirty-white monospace text, faint scanline overlay visible, "Portfolio booting..." text shown.

Stop the dev server before continuing.

- [ ] **Step 7: Commit**

```bash
git add client/package.json client/package-lock.json client/vite.config.js client/tailwind.config.js client/postcss.config.js client/index.html client/src
git commit -m "feat(client): scaffold Vite/React app with industrial theme tokens"
```

---

### Task 9: API client + project-fetching hook

**Files:**
- Create: `client/src/api/client.js`
- Create: `client/src/desktop/useProjects.js`
- Test: `client/test/client.test.js` (uses a mocked `fetch`)

**Interfaces:**
- Produces: `fetchProjects()`, `fetchProject(slug)`, `fetchAbout()`, `fetchContact()` (all `async`, hit `/api/...`, throw on non-2xx). `useProjects()` returns `{ projects, loading, error, refresh }`.

- [ ] **Step 1: Write the failing test for the API client**

```js
// client/test/client.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchProjects, fetchProject, fetchAbout, fetchContact } from '../src/api/client.js';

beforeEach(() => {
  global.fetch = vi.fn();
});

describe('api client', () => {
  it('fetchProjects calls /api/projects and returns JSON', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => [{ slug: 'a' }] });
    const result = await fetchProjects();
    expect(global.fetch).toHaveBeenCalledWith('/api/projects');
    expect(result).toEqual([{ slug: 'a' }]);
  });

  it('fetchProject calls /api/projects/:slug', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ slug: 'a' }) });
    const result = await fetchProject('a');
    expect(global.fetch).toHaveBeenCalledWith('/api/projects/a');
    expect(result).toEqual({ slug: 'a' });
  });

  it('throws when the response is not ok', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 404 });
    await expect(fetchProject('missing')).rejects.toThrow('404');
  });

  it('fetchAbout calls /api/content/about', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => ({ html: '<p>hi</p>' }) });
    const result = await fetchAbout();
    expect(global.fetch).toHaveBeenCalledWith('/api/content/about');
    expect(result).toEqual({ html: '<p>hi</p>' });
  });

  it('fetchContact calls /api/content/contact', async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => [] });
    const result = await fetchContact();
    expect(global.fetch).toHaveBeenCalledWith('/api/content/contact');
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Install Vitest for the client and add a test script**

```bash
cd client && npm install -D vitest
```

```json
// client/package.json  (add to "scripts")
"test": "vitest run"
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `cd client && npx vitest run test/client.test.js`
Expected: FAIL — `Cannot find module '../src/api/client.js'`

- [ ] **Step 4: Implement the API client**

```js
// client/src/api/client.js
async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request to ${url} failed with ${res.status}`);
  }
  return res.json();
}

export function fetchProjects() {
  return getJson('/api/projects');
}

export function fetchProject(slug) {
  return getJson(`/api/projects/${slug}`);
}

export function fetchAbout() {
  return getJson('/api/content/about');
}

export function fetchContact() {
  return getJson('/api/content/contact');
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd client && npx vitest run test/client.test.js`
Expected: PASS (5 tests)

- [ ] **Step 6: Implement `useProjects` hook**

```js
// client/src/desktop/useProjects.js
import { useCallback, useEffect, useState } from 'react';
import { fetchProjects } from '../api/client.js';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { projects, loading, error, refresh };
}
```

- [ ] **Step 7: Commit**

```bash
git add client/src/api client/src/desktop/useProjects.js client/test/client.test.js client/package.json client/package-lock.json
git commit -m "feat(client): add API client and useProjects hook"
```

---

### Task 10: WebSocket hook for live updates

**Files:**
- Create: `client/src/api/useWebSocket.js`

**Interfaces:**
- Consumes: nothing from earlier tasks directly (used by `useProjects`/`Desktop` in Task 16).
- Produces: `useWebSocket(onMessage)` returns `{ connected: boolean }`, calling `onMessage(parsedJson)` for every message received, auto-reconnecting with backoff on close.

- [ ] **Step 1: Implement the hook**

```js
// client/src/api/useWebSocket.js
import { useEffect, useRef, useState } from 'react';

export function useWebSocket(onMessage) {
  const [connected, setConnected] = useState(false);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    let socket;
    let retryDelay = 1000;
    let retryTimer;
    let cancelled = false;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      socket = new WebSocket(`${protocol}//${window.location.host}/ws`);

      socket.addEventListener('open', () => {
        retryDelay = 1000;
        setConnected(true);
      });

      socket.addEventListener('message', (event) => {
        try {
          onMessageRef.current?.(JSON.parse(event.data));
        } catch {
          // ignore malformed messages
        }
      });

      socket.addEventListener('close', () => {
        setConnected(false);
        if (cancelled) return;
        retryTimer = setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 15000);
      });
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      socket?.close();
    };
  }, []);

  return { connected };
}
```

- [ ] **Step 2: Manually verify reconnect behavior is sane**

This hook has no pure logic worth unit testing in isolation (it's all browser `WebSocket` event wiring); it will be exercised end-to-end in Task 16's manual verification once the backend is running alongside it.

- [ ] **Step 3: Commit**

```bash
git add client/src/api/useWebSocket.js
git commit -m "feat(client): add WebSocket hook with auto-reconnect"
```

---

### Task 11: Boot sequence

**Files:**
- Create: `client/src/boot/bootLines.js`
- Create: `client/src/boot/BootSequence.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Produces: `<BootSequence onComplete={() => void} />` — plays the scripted lines with a typewriter effect, then calls `onComplete`. Skippable via any keypress or click. `App.jsx` uses `sessionStorage.getItem('booted')` to skip replay within the same tab session.

- [ ] **Step 1: Define the scripted boot lines**

```js
// client/src/boot/bootLines.js
export const BOOT_LINES = [
  'BIOS (C) RUGGED SYSTEMS -- POST v4.2',
  'CHECKING MEMORY............. 65536K OK',
  'CHECKING DISK 0.............. OK',
  'LOADING KERNEL MODULES:',
  '  linux.ko ........... OK',
  '  ai.ko ............... OK',
  '  coffee.ko ........... OK',
  '  rust_safety.ko ...... OK',
  'MOUNTING /home/portfolio ... OK',
  '',
  'login: visitor',
  'Welcome.',
];
```

- [ ] **Step 2: Implement the boot sequence component**

```jsx
// client/src/boot/BootSequence.jsx
import { useEffect, useState } from 'react';
import { BOOT_LINES } from './bootLines.js';

const LINE_DELAY_MS = 220;

export default function BootSequence({ onComplete }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= BOOT_LINES.length) {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), LINE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visibleCount, onComplete]);

  useEffect(() => {
    function skip() {
      onComplete();
    }
    window.addEventListener('keydown', skip);
    window.addEventListener('click', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('click', skip);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black text-accent-orange font-mono p-6 text-sm">
      {BOOT_LINES.slice(0, visibleCount).map((line, i) => (
        <div key={i}>{line || ' '}</div>
      ))}
      <span className="animate-pulse">_</span>
    </div>
  );
}
```

- [ ] **Step 3: Wire into App with session-skip logic**

```jsx
// client/src/App.jsx
import { useState } from 'react';
import BootSequence from './boot/BootSequence.jsx';

function App() {
  const [booted, setBooted] = useState(() => sessionStorage.getItem('booted') === 'true');

  function handleBootComplete() {
    sessionStorage.setItem('booted', 'true');
    setBooted(true);
  }

  if (!booted) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <div className="crt-scanlines grain min-h-screen">
      <p className="p-4">Desktop goes here.</p>
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Manually verify in browser**

Run: `cd client && npm run dev` (background), open `http://localhost:5173`.
Expected: boot lines type out one by one in orange-on-black, then transitions to "Desktop goes here." Reloading the page within the same tab skips straight to the desktop placeholder (since `sessionStorage` is set); opening a fresh private/incognito tab replays the boot.

Stop the dev server before continuing.

- [ ] **Step 5: Commit**

```bash
git add client/src/boot client/src/App.jsx
git commit -m "feat(client): add boot sequence"
```

---

### Task 12: Window manager (open/close/focus/minimize)

**Files:**
- Create: `client/src/windows/WindowManagerContext.jsx`
- Create: `client/src/windows/Window.jsx`

**Interfaces:**
- Produces: `<WindowManagerProvider>` + `useWindowManager()` returning `{ windows, openWindow(id, title, content), closeWindow(id), focusWindow(id), minimizeWindow(id), restoreWindow(id) }`, where `windows` is `Array<{ id, title, content: ReactNode, zIndex, minimized }>`. `openWindow` is a no-op (just focuses) if a window with that `id` is already open. `<Window>` is the draggable/resizable chrome component consuming one entry from `windows`.

- [ ] **Step 1: Implement the context/provider**

```jsx
// client/src/windows/WindowManagerContext.jsx
import { createContext, useCallback, useContext, useRef, useState } from 'react';

const WindowManagerContext = createContext(null);

export function WindowManagerProvider({ children }) {
  const [windows, setWindows] = useState([]);
  const zCounter = useRef(10);

  const openWindow = useCallback((id, title, content) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === id);
      if (existing) {
        zCounter.current += 1;
        return prev.map((w) =>
          w.id === id ? { ...w, minimized: false, zIndex: zCounter.current } : w
        );
      }
      zCounter.current += 1;
      return [...prev, { id, title, content, zIndex: zCounter.current, minimized: false }];
    });
  }, []);

  const closeWindow = useCallback((id) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const focusWindow = useCallback((id) => {
    zCounter.current += 1;
    const z = zCounter.current;
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: z } : w)));
  }, []);

  const minimizeWindow = useCallback((id) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  }, []);

  const restoreWindow = useCallback((id) => {
    zCounter.current += 1;
    const z = zCounter.current;
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: false, zIndex: z } : w))
    );
  }, []);

  return (
    <WindowManagerContext.Provider
      value={{ windows, openWindow, closeWindow, focusWindow, minimizeWindow, restoreWindow }}
    >
      {children}
    </WindowManagerContext.Provider>
  );
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext);
  if (!ctx) throw new Error('useWindowManager must be used within a WindowManagerProvider');
  return ctx;
}
```

- [ ] **Step 2: Implement the Window chrome component**

```jsx
// client/src/windows/Window.jsx
import { Rnd } from 'react-rnd';
import { useWindowManager } from './WindowManagerContext.jsx';

export default function Window({ id, title, zIndex, children }) {
  const { closeWindow, focusWindow, minimizeWindow } = useWindowManager();

  return (
    <Rnd
      default={{ x: 80, y: 80, width: 480, height: 360 }}
      minWidth={280}
      minHeight={180}
      bounds="window"
      style={{ zIndex }}
      onDragStart={() => focusWindow(id)}
      onResizeStart={() => focusWindow(id)}
      className="border-2 border-accent-orange bg-graphite shadow-[6px_6px_0_rgba(0,0,0,0.6)]"
    >
      <div
        className="flex items-center justify-between bg-accent-orange text-graphite px-2 py-1 cursor-move uppercase tracking-wide text-xs font-bold"
        onMouseDown={() => focusWindow(id)}
      >
        <span>{title}</span>
        <div className="flex gap-1">
          <button
            className="px-2 border border-graphite"
            onClick={() => minimizeWindow(id)}
            aria-label="minimize"
          >
            _
          </button>
          <button
            className="px-2 border border-graphite bg-accent-red text-dirty-white"
            onClick={() => closeWindow(id)}
            aria-label="close"
          >
            X
          </button>
        </div>
      </div>
      <div className="p-3 overflow-auto h-[calc(100%-2rem)] text-sm" onMouseDown={() => focusWindow(id)}>
        {children}
      </div>
    </Rnd>
  );
}
```

- [ ] **Step 3: Manually verify with a throwaway test window in App.jsx**

Temporarily render a provider + one window in `App.jsx` to confirm dragging/resizing/close/minimize work, e.g.:

```jsx
<WindowManagerProvider>
  <TestOpener />
  {windows.map((w) => !w.minimized && <Window key={w.id} id={w.id} title={w.title} zIndex={w.zIndex}>{w.content}</Window>)}
</WindowManagerProvider>
```

Run: `cd client && npm run dev`, open the browser, drag/resize/close a window.
Expected: window drags and resizes smoothly, close removes it, minimize hides it. Revert this temporary wiring afterward — Task 13 replaces it with the real desktop.

- [ ] **Step 4: Commit**

```bash
git add client/src/windows/WindowManagerContext.jsx client/src/windows/Window.jsx
git commit -m "feat(client): add window manager and draggable/resizable window chrome"
```

---

### Task 13: Desktop shell (icons + status bar)

**Files:**
- Create: `client/src/desktop/Desktop.jsx`
- Create: `client/src/desktop/DesktopIcon.jsx`
- Create: `client/src/desktop/StatusBar.jsx`
- Modify: `client/src/App.jsx`

**Interfaces:**
- Consumes: `useProjects()` (Task 9), `useWebSocket()` (Task 10), `useWindowManager()` (Task 12).
- Produces: `<Desktop>` renders icon grid (projects + fixed Terminal/About/Contact icons) + `<StatusBar connected={boolean} />`, and is the only thing `App.jsx` renders once booted. Double-clicking an icon calls `openWindow(...)`.

- [ ] **Step 1: Implement `DesktopIcon`**

```jsx
// client/src/desktop/DesktopIcon.jsx
export default function DesktopIcon({ label, onOpen }) {
  return (
    <button
      onDoubleClick={onOpen}
      className="hud-corners glitch-hover flex flex-col items-center gap-1 w-24 p-2 text-center text-xs uppercase tracking-wide hover:text-accent-orange focus:outline-none focus:text-accent-orange"
    >
      <div className="w-10 h-10 border-2 border-dirty-white" />
      <span>{label}</span>
    </button>
  );
}
```

- [ ] **Step 2: Implement `StatusBar`**

```jsx
// client/src/desktop/StatusBar.jsx
import { useEffect, useState } from 'react';

// Cosmetic only — not real system metrics. Oscillates within a plausible
// band so it reads as "alive" rather than randomly jittering every tick.
function useFakeMetric(base, amplitude, periodMs) {
  const [value, setValue] = useState(base);
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const t = (Date.now() - start) / periodMs;
      setValue(Math.round(base + amplitude * Math.sin(t * Math.PI * 2)));
    }, 1200);
    return () => clearInterval(timer);
  }, [base, amplitude, periodMs]);
  return value;
}

export default function StatusBar({ connected }) {
  const [now, setNow] = useState(new Date());
  const cpu = useFakeMetric(38, 15, 9000);
  const mem = useFakeMetric(54, 8, 13000);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between bg-graphite border-t-2 border-dirty-white px-3 py-1 text-xs uppercase tracking-wide z-[10000]">
      <div className="flex items-center gap-4">
        <span className={connected ? 'text-accent-blue' : 'text-accent-red'}>
          SIGNAL: {connected ? 'LOCKED' : 'LOST'}
        </span>
        <span>CPU {cpu}%</span>
        <span>MEM {mem}%</span>
      </div>
      <span>{now.toLocaleTimeString()}</span>
    </div>
  );
}
```

- [ ] **Step 3: Implement `Desktop`**

```jsx
// client/src/desktop/Desktop.jsx
import { useProjects } from './useProjects.js';
import { useWebSocket } from '../api/useWebSocket.js';
import { useWindowManager } from '../windows/WindowManagerContext.jsx';
import Window from '../windows/Window.jsx';
import DesktopIcon from './DesktopIcon.jsx';
import StatusBar from './StatusBar.jsx';

export default function Desktop() {
  const { projects, refresh } = useProjects();
  const { connected } = useWebSocket((msg) => {
    if (msg.type === 'changed') refresh();
  });
  const { windows, openWindow, restoreWindow } = useWindowManager();

  function openProject(slug, title) {
    openWindow(`project:${slug}`, title, <div>Project content placeholder for {slug}</div>);
  }

  const minimizedWindows = windows.filter((w) => w.minimized);

  return (
    <div className="crt-scanlines grain min-h-screen pb-8">
      <div className="flex flex-wrap gap-2 p-4">
        {projects.map((p) => (
          <DesktopIcon key={p.slug} label={p.title} onOpen={() => openProject(p.slug, p.title)} />
        ))}
        <DesktopIcon label="Terminal" onOpen={() => openWindow('terminal', 'Terminal', <div>Terminal placeholder</div>)} />
        <DesktopIcon label="About Me" onOpen={() => openWindow('about', 'About Me', <div>About placeholder</div>)} />
        <DesktopIcon label="Contact" onOpen={() => openWindow('contact', 'Contact', <div>Contact placeholder</div>)} />
      </div>

      {windows.map(
        (w) =>
          !w.minimized && (
            <Window key={w.id} id={w.id} title={w.title} zIndex={w.zIndex}>
              {w.content}
            </Window>
          )
      )}

      {minimizedWindows.length > 0 && (
        <div className="fixed bottom-7 left-0 right-0 flex gap-1 px-3 z-[9999]">
          {minimizedWindows.map((w) => (
            <button
              key={w.id}
              onClick={() => restoreWindow(w.id)}
              className="border-2 border-accent-orange bg-graphite text-accent-orange text-[10px] uppercase tracking-wide px-2 py-1"
            >
              {w.title}
            </button>
          ))}
        </div>
      )}

      <StatusBar connected={connected} />
    </div>
  );
}
```

- [ ] **Step 4: Wire into App**

```jsx
// client/src/App.jsx
import { useState } from 'react';
import BootSequence from './boot/BootSequence.jsx';
import Desktop from './desktop/Desktop.jsx';
import { WindowManagerProvider } from './windows/WindowManagerContext.jsx';

function App() {
  const [booted, setBooted] = useState(() => sessionStorage.getItem('booted') === 'true');

  function handleBootComplete() {
    sessionStorage.setItem('booted', 'true');
    setBooted(true);
  }

  if (!booted) {
    return <BootSequence onComplete={handleBootComplete} />;
  }

  return (
    <WindowManagerProvider>
      <Desktop />
    </WindowManagerProvider>
  );
}

export default App;
```

- [ ] **Step 5: Manually verify with backend running**

Run backend: `cd server && npm run dev` (background)
Run frontend: `cd client && npm run dev` (background)
Open `http://localhost:5173`, skip/wait through boot.
Expected: desktop shows an icon for `example-project` plus Terminal/About Me/Contact icons; double-clicking opens a placeholder window; status bar shows `SIGNAL: LOCKED` and a live clock.

Stop both dev servers before continuing.

- [ ] **Step 6: Commit**

```bash
git add client/src/desktop client/src/App.jsx
git commit -m "feat(client): add desktop shell with icons and status bar"
```

---

### Task 14: Project window + image carousel

**Files:**
- Create: `client/src/windows/useCarouselIndex.js`
- Create: `client/src/windows/ImageCarousel.jsx`
- Create: `client/src/windows/ProjectWindow.jsx`
- Modify: `client/src/desktop/Desktop.jsx`
- Test: `client/test/useCarouselIndex.test.js`

**Interfaces:**
- Produces: `useCarouselIndex(length)` returns `{ index, next(), prev(), goTo(i) }`, wrapping around at both ends (and safely returns `index: 0` with no-op `next`/`prev` when `length` is 0). `<ImageCarousel slug images={string[]} />`. `<ProjectWindow slug={string} />` fetches full detail via `fetchProject(slug)` on mount and renders `bodyHtml` + `<ImageCarousel>`.

- [ ] **Step 1: Write the failing test for carousel index math**

```js
// client/test/useCarouselIndex.test.js
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCarouselIndex } from '../src/windows/useCarouselIndex.js';

describe('useCarouselIndex', () => {
  it('starts at 0 and wraps forward', () => {
    const { result } = renderHook(() => useCarouselIndex(3));
    expect(result.current.index).toBe(0);
    act(() => result.current.next());
    expect(result.current.index).toBe(1);
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.index).toBe(0);
  });

  it('wraps backward', () => {
    const { result } = renderHook(() => useCarouselIndex(3));
    act(() => result.current.prev());
    expect(result.current.index).toBe(2);
  });

  it('goTo jumps to a specific index', () => {
    const { result } = renderHook(() => useCarouselIndex(3));
    act(() => result.current.goTo(2));
    expect(result.current.index).toBe(2);
  });

  it('is a safe no-op when length is 0', () => {
    const { result } = renderHook(() => useCarouselIndex(0));
    expect(result.current.index).toBe(0);
    act(() => result.current.next());
    expect(result.current.index).toBe(0);
  });
});
```

- [ ] **Step 2: Install testing-library for hook tests**

```bash
cd client && npm install -D @testing-library/react jsdom
```

```js
// client/vite.config.js  (add `test` block)
export default defineConfig({
  plugins: [react()],
  server: { /* ...unchanged... */ },
  test: { environment: 'jsdom' },
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `cd client && npx vitest run test/useCarouselIndex.test.js`
Expected: FAIL — `Cannot find module '../src/windows/useCarouselIndex.js'`

- [ ] **Step 4: Implement `useCarouselIndex`**

```js
// client/src/windows/useCarouselIndex.js
import { useState } from 'react';

export function useCarouselIndex(length) {
  const [index, setIndex] = useState(0);

  if (length <= 0) {
    return { index: 0, next: () => {}, prev: () => {}, goTo: () => {} };
  }

  return {
    index,
    next: () => setIndex((i) => (i + 1) % length),
    prev: () => setIndex((i) => (i - 1 + length) % length),
    goTo: (i) => setIndex(((i % length) + length) % length),
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd client && npx vitest run test/useCarouselIndex.test.js`
Expected: PASS (4 tests)

- [ ] **Step 6: Implement `ImageCarousel`**

```jsx
// client/src/windows/ImageCarousel.jsx
import { useCarouselIndex } from './useCarouselIndex.js';

export default function ImageCarousel({ slug, images }) {
  const { index, next, prev, goTo } = useCarouselIndex(images.length);

  if (images.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="relative border-2 border-dirty-white">
        <img
          src={`/api/projects/${slug}/images/${images[index]}`}
          alt={`${slug} screenshot ${index + 1}`}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={prev}
          className="absolute left-0 top-0 bottom-0 px-2 bg-graphite/70 text-accent-orange"
          aria-label="previous image"
        >
          ‹
        </button>
        <button
          onClick={next}
          className="absolute right-0 top-0 bottom-0 px-2 bg-graphite/70 text-accent-orange"
          aria-label="next image"
        >
          ›
        </button>
      </div>
      <div className="flex justify-center gap-1 mt-1">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 border border-dirty-white ${i === index ? 'bg-accent-orange' : ''}`}
            aria-label={`go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Implement `ProjectWindow`**

```jsx
// client/src/windows/ProjectWindow.jsx
import { useEffect, useState } from 'react';
import { fetchProject } from '../api/client.js';
import ImageCarousel from './ImageCarousel.jsx';

export default function ProjectWindow({ slug }) {
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchProject(slug)
      .then((data) => !cancelled && setProject(data))
      .catch((err) => !cancelled && setError(err));
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (error) return <div className="text-accent-red">Failed to load project.</div>;
  if (!project) return <div>Loading...</div>;

  return (
    <div>
      {project.tags.length > 0 && (
        <div className="flex gap-1 mb-2 text-[10px] uppercase">
          {project.tags.map((tag) => (
            <span key={tag} className="border border-accent-blue px-1 text-accent-blue">
              {tag}
            </span>
          ))}
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: project.bodyHtml }} />
      <ImageCarousel slug={slug} images={project.images} />
      <div className="flex gap-3 mt-3 text-accent-blue underline text-xs">
        {project.repoUrl && (
          <a href={project.repoUrl} target="_blank" rel="noreferrer">
            REPO
          </a>
        )}
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noreferrer">
            LIVE
          </a>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Wire into Desktop's `openProject`**

```jsx
// client/src/desktop/Desktop.jsx  (replace the placeholder openProject function and its import)
import ProjectWindow from '../windows/ProjectWindow.jsx';

// ...inside Desktop():
function openProject(slug, title) {
  openWindow(`project:${slug}`, title, <ProjectWindow slug={slug} />);
}
```

- [ ] **Step 9: Manually verify in browser**

With both dev servers running, double-click the `example-project` icon.
Expected: window opens showing the rendered markdown body; since the sample project has no `images/` contents, no carousel renders (confirms the "missing images → no carousel" fallback). Add a real image to `server/projects/example-project/images/` and reopen the window to confirm the carousel appears with working prev/next/dot navigation.

- [ ] **Step 10: Commit**

```bash
git add client/src/windows/useCarouselIndex.js client/src/windows/ImageCarousel.jsx client/src/windows/ProjectWindow.jsx client/src/desktop/Desktop.jsx client/test/useCarouselIndex.test.js client/vite.config.js client/package.json client/package-lock.json
git commit -m "feat(client): render project detail with image carousel"
```

---

### Task 15: About and Contact windows

**Files:**
- Create: `client/src/windows/AboutWindow.jsx`
- Create: `client/src/windows/ContactWindow.jsx`
- Modify: `client/src/desktop/Desktop.jsx`

**Interfaces:**
- Consumes: `fetchAbout()`, `fetchContact()` (Task 9).
- Produces: `<AboutWindow />`, `<ContactWindow />` — self-contained, fetch their own data on mount.

- [ ] **Step 1: Implement `AboutWindow`**

```jsx
// client/src/windows/AboutWindow.jsx
import { useEffect, useState } from 'react';
import { fetchAbout } from '../api/client.js';

export default function AboutWindow() {
  const [html, setHtml] = useState(null);

  useEffect(() => {
    fetchAbout().then((data) => setHtml(data.html));
  }, []);

  if (html === null) return <div>Loading...</div>;
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

- [ ] **Step 2: Implement `ContactWindow`**

```jsx
// client/src/windows/ContactWindow.jsx
import { useEffect, useState } from 'react';
import { fetchContact } from '../api/client.js';

export default function ContactWindow() {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    fetchContact().then(setEntries);
  }, []);

  if (entries === null) return <div>Loading...</div>;
  if (entries.length === 0) return <div>No contact info configured.</div>;

  return (
    <ul className="space-y-2">
      {entries.map((entry) => (
        <li key={entry.label}>
          <span className="uppercase text-accent-blue text-xs">{entry.label}:</span>{' '}
          <a href={entry.href} className="underline" target="_blank" rel="noreferrer">
            {entry.value}
          </a>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 3: Wire into Desktop**

```jsx
// client/src/desktop/Desktop.jsx  (replace the About Me / Contact placeholder onOpen handlers)
import AboutWindow from '../windows/AboutWindow.jsx';
import ContactWindow from '../windows/ContactWindow.jsx';

// ...replace the two corresponding <DesktopIcon> elements:
<DesktopIcon label="About Me" onOpen={() => openWindow('about', 'About Me', <AboutWindow />)} />
<DesktopIcon label="Contact" onOpen={() => openWindow('contact', 'Contact', <ContactWindow />)} />
```

- [ ] **Step 4: Manually verify in browser**

With both dev servers running, open the About Me and Contact windows.
Expected: About Me shows the rendered `about.md` heading/body; Contact shows the one configured email link, clickable as `mailto:`.

- [ ] **Step 5: Commit**

```bash
git add client/src/windows/AboutWindow.jsx client/src/windows/ContactWindow.jsx client/src/desktop/Desktop.jsx
git commit -m "feat(client): add About Me and Contact windows"
```

---

### Task 16: Terminal app

**Files:**
- Create: `client/src/windows/terminalCommands.js`
- Create: `client/src/windows/TerminalWindow.jsx`
- Modify: `client/src/desktop/Desktop.jsx`
- Test: `client/test/terminalCommands.test.js`

**Interfaces:**
- Consumes: `ProjectSummary[]` shape `{ slug, title, tags, featured, thumbnail }` (Task 9), `openProject(slug, title)` callback (Task 13/14).
- Produces: `executeCommand(input, env)` (pure) returns `{ lines: string[], clearScreen: boolean }`, where `env = { projects, openProject }`. `<TerminalWindow projects={...} openProject={...} />` is the interactive REPL UI wrapping it.

- [ ] **Step 1: Write the failing tests for the command parser**

```js
// client/test/terminalCommands.test.js
import { describe, it, expect, vi } from 'vitest';
import { executeCommand } from '../src/windows/terminalCommands.js';

const env = {
  projects: [
    { slug: 'example-project', title: 'Example Project', tags: ['demo'], featured: true, thumbnail: null },
  ],
  openProject: vi.fn(),
};

describe('executeCommand', () => {
  it('help lists available commands', () => {
    const result = executeCommand('help', env);
    expect(result.lines.join('\n')).toContain('ls');
    expect(result.lines.join('\n')).toContain('open <project>');
  });

  it('ls lists project slugs', () => {
    const result = executeCommand('ls', env);
    expect(result.lines).toEqual(['example-project']);
  });

  it('projects lists titles and tags', () => {
    const result = executeCommand('projects', env);
    expect(result.lines.join('\n')).toContain('Example Project');
    expect(result.lines.join('\n')).toContain('demo');
  });

  it('whoami returns a fixed identity line', () => {
    const result = executeCommand('whoami', env);
    expect(result.lines).toEqual(['visitor@portfolio']);
  });

  it('open <project> calls env.openProject with the matching slug and title', () => {
    const result = executeCommand('open example-project', env);
    expect(env.openProject).toHaveBeenCalledWith('example-project', 'Example Project');
    expect(result.lines.join('\n')).toContain('Opening');
  });

  it('open <unknown> reports an error without calling openProject', () => {
    env.openProject.mockClear();
    const result = executeCommand('open nope', env);
    expect(env.openProject).not.toHaveBeenCalled();
    expect(result.lines.join('\n')).toContain('not found');
  });

  it('clear sets clearScreen true', () => {
    const result = executeCommand('clear', env);
    expect(result.clearScreen).toBe(true);
  });

  it('unknown command returns an error line', () => {
    const result = executeCommand('frobnicate', env);
    expect(result.lines.join('\n')).toContain('command not found');
  });

  it('empty input returns no lines', () => {
    const result = executeCommand('   ', env);
    expect(result.lines).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd client && npx vitest run test/terminalCommands.test.js`
Expected: FAIL — `Cannot find module '../src/windows/terminalCommands.js'`

- [ ] **Step 3: Implement `executeCommand`**

```js
// client/src/windows/terminalCommands.js
const HELP_LINES = [
  'help              show this list',
  'ls                list project slugs',
  'projects          list projects with tags',
  'cat <project>     show a project description',
  'open <project>    open a project window',
  'about             open the About Me window',
  'whoami            who you are',
  'clear             clear the screen',
];

export function executeCommand(rawInput, env) {
  const input = rawInput.trim();
  if (input === '') return { lines: [], clearScreen: false };

  const [cmd, ...rest] = input.split(/\s+/);
  const arg = rest.join(' ');

  switch (cmd) {
    case 'help':
      return { lines: HELP_LINES, clearScreen: false };

    case 'ls':
      return { lines: env.projects.map((p) => p.slug), clearScreen: false };

    case 'projects':
      return {
        lines: env.projects.map((p) => `${p.slug.padEnd(20)} ${p.title}  [${p.tags.join(', ')}]`),
        clearScreen: false,
      };

    case 'whoami':
      return { lines: ['visitor@portfolio'], clearScreen: false };

    case 'about':
      return { lines: ['Opening About Me...'], clearScreen: false };

    case 'open': {
      const project = env.projects.find((p) => p.slug === arg);
      if (!project) {
        return { lines: [`open: project "${arg}" not found`], clearScreen: false };
      }
      env.openProject(project.slug, project.title);
      return { lines: [`Opening ${project.title}...`], clearScreen: false };
    }

    case 'clear':
      return { lines: [], clearScreen: true };

    case 'sudo':
      return { lines: ['Nice try.'], clearScreen: false };

    default:
      return { lines: [`${cmd}: command not found`], clearScreen: false };
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd client && npx vitest run test/terminalCommands.test.js`
Expected: PASS (9 tests)

- [ ] **Step 5: Implement `TerminalWindow`**

```jsx
// client/src/windows/TerminalWindow.jsx
import { useState } from 'react';
import { executeCommand } from './terminalCommands.js';

export default function TerminalWindow({ projects, openProject }) {
  const [history, setHistory] = useState(['Type "help" to get started.']);
  const [input, setInput] = useState('');
  const [pastCommands, setPastCommands] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  function runInput() {
    const result = executeCommand(input, { projects, openProject });
    setHistory((h) => (result.clearScreen ? [] : [...h, `> ${input}`, ...result.lines]));
    if (input.trim() !== '') setPastCommands((p) => [...p, input]);
    setHistoryIndex(-1);
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      runInput();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (pastCommands.length === 0) return;
      const nextIndex = historyIndex === -1 ? pastCommands.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(pastCommands[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= pastCommands.length) {
        setHistoryIndex(-1);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(pastCommands[nextIndex]);
      }
    }
  }

  return (
    <div className="font-mono text-xs h-full flex flex-col">
      <div className="flex-1 overflow-auto whitespace-pre-wrap">
        {history.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
      <div className="flex items-center gap-1 border-t border-dirty-white pt-1">
        <span className="text-accent-orange">$</span>
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent outline-none text-dirty-white"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Wire into Desktop**

```jsx
// client/src/desktop/Desktop.jsx  (replace the Terminal placeholder onOpen handler)
import TerminalWindow from '../windows/TerminalWindow.jsx';

// ...replace the Terminal <DesktopIcon>:
<DesktopIcon
  label="Terminal"
  onOpen={() => openWindow('terminal', 'Terminal', <TerminalWindow projects={projects} openProject={openProject} />)}
/>
```

- [ ] **Step 7: Manually verify in browser**

With both dev servers running, open the Terminal window and try `help`, `ls`, `projects`, `open example-project` (confirms it opens the matching project window), `clear`, an unknown command, and up/down arrow command recall.
Expected: all behave as implemented above; `open example-project` opens (or focuses) the same project window that double-clicking the desktop icon would.

- [ ] **Step 8: Commit**

```bash
git add client/src/windows/terminalCommands.js client/src/windows/TerminalWindow.jsx client/src/desktop/Desktop.jsx client/test/terminalCommands.test.js
git commit -m "feat(client): add flavor terminal app with mock command interpreter"
```

---

### Task 17: End-to-end live-update verification

**Files:**
- No new files — this task is verification-only, exercising everything built in Tasks 1-16 together.

**Interfaces:**
- Consumes: the full running stack (server watcher/broadcast from Tasks 6-7, client WS hook + `useProjects.refresh` from Tasks 9-10/13).

- [ ] **Step 1: Start both servers**

Run: `cd server && npm run dev` (background)
Run: `cd client && npm run dev` (background)
Open `http://localhost:5173`, skip the boot sequence.

- [ ] **Step 2: Add a new project folder while the page is open, without reloading**

```bash
mkdir -p server/projects/live-demo/images
cat > server/projects/live-demo/README.md <<'EOF'
---
title: Live Demo
tags: [demo]
featured: false
---

Added without a page reload.
EOF
```

Expected (in the open browser tab, no manual refresh): within ~1 second a new "Live Demo" icon appears on the desktop, and the status bar's SIGNAL indicator stays `LOCKED` throughout (confirming the WS push triggered `useProjects().refresh()` rather than requiring a reload).

- [ ] **Step 3: Remove the project and confirm it disappears live**

```bash
rm -rf server/projects/live-demo
```

Expected: the "Live Demo" icon disappears from the desktop within ~1 second, without a page reload.

- [ ] **Step 4: Verify disconnect/reconnect status**

Stop the backend (`Ctrl-C` the `server` dev process) while the browser tab is open.
Expected: status bar SIGNAL flips to `LOST` (red) within a few seconds.
Restart the backend (`cd server && npm run dev`).
Expected: SIGNAL flips back to `LOCKED` (blue) without reloading the page, and the desktop's project list is still accurate.

- [ ] **Step 5: Run the full test suites one more time as a final gate**

Run: `cd server && npm test`
Expected: all backend tests pass.
Run: `cd client && npm test`
Expected: all frontend tests pass.

- [ ] **Step 6: Stop both dev servers**

```bash
# Ctrl-C both background processes, or:
pkill -f "node --watch src/index.js"
```

No commit for this task — it's verification only, confirming Tasks 1-16 integrate correctly end-to-end.

---

## After this plan

Not in scope here, but natural next steps once this is working: writing real project content (replace `server/projects/example-project` and `server/content/*` placeholders with your actual projects/bio/links), a `Dockerfile`/`docker-compose.yml` for the self-hosted deployment, the orange/blue chromatic-aberration sliver on window open/close transitions (spec'd as a nice-to-have, skipped here since it needs real mount/unmount animation handling that isn't justified until the rest of the feel is tuned), and refining the boot/glitch timing and exact palette hex values visually once you can see it running.
