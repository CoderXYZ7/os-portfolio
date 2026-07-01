import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer } from 'node:http';
import { createProjectsRouter } from '../src/routes/projects.js';
import { createContentRouter } from '../src/routes/content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesRoot = path.join(__dirname, 'fixtures', 'scan-root');
const projectsDir = path.join(fixturesRoot, 'projects');

// Minimal stub store — avoids hitting the filesystem in route tests.
function makeStore() {
  return {
    getProjects: () => [
      { slug: 'has-readme', title: 'Has Readme', tags: ['example'], featured: false, thumbnail: null },
    ],
    getProject: (slug) => {
      if (slug === 'has-readme') {
        return {
          slug: 'has-readme',
          title: 'Has Readme',
          tags: ['example'],
          techStack: [],
          featured: false,
          repoUrl: null,
          liveUrl: null,
          date: null,
          bodyHtml: '<p>Hello</p>',
          images: [],
          thumbnail: null,
        };
      }
      return null;
    },
    getAbout: () => '<h1>About</h1><p>Placeholder</p>',
    getContact: () => [{ label: 'Email', value: 'a@b.com', href: 'mailto:a@b.com' }],
  };
}

let server;
let baseUrl;

beforeAll(async () => {
  const store = makeStore();
  const app = express();
  app.use('/api/projects', createProjectsRouter(store, projectsDir));
  app.use('/api/content', createContentRouter(store));

  await new Promise((resolve) => {
    server = createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

// ── Projects routes ───────────────────────────────────────────────────────────

describe('GET /api/projects', () => {
  it('returns a JSON array of project summaries', async () => {
    const res = await fetch(`${baseUrl}/api/projects`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].slug).toBe('has-readme');
    expect(body[0].title).toBe('Has Readme');
    expect(body[0].thumbnail).toBeNull();
  });
});

describe('GET /api/projects/:slug', () => {
  it('returns the full project object for a known slug', async () => {
    const res = await fetch(`${baseUrl}/api/projects/has-readme`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe('has-readme');
    expect(body.bodyHtml).toContain('<p>Hello</p>');
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await fetch(`${baseUrl}/api/projects/does-not-exist`);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('project not found');
  });
});

describe('GET /api/projects/:slug/images/:filename', () => {
  it('serves an image file that exists in the project images folder', async () => {
    // has-readme fixture has no images folder, so use full-project from fixtures directly.
    // Wire a second app instance pointing at fixtures root.
    const store2 = makeStore();
    const app2 = express();
    const fixturesDir = path.join(__dirname, 'fixtures');
    app2.use('/api/projects', createProjectsRouter(store2, fixturesDir));

    const server2 = await new Promise((resolve) => {
      const s = createServer(app2);
      s.listen(0, '127.0.0.1', () => resolve(s));
    });
    const { port } = server2.address();
    const url2 = `http://127.0.0.1:${port}`;

    const res = await fetch(`${url2}/api/projects/full-project/images/01-hero.png`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/png/);

    await new Promise((r) => server2.close(r));
  });

  it('returns 404 for an image that does not exist', async () => {
    const res = await fetch(`${baseUrl}/api/projects/has-readme/images/missing.png`);
    expect(res.status).toBe(404);
  });
});

// ── Content routes ────────────────────────────────────────────────────────────

describe('GET /api/content/about', () => {
  it('returns { html: string }', async () => {
    const res = await fetch(`${baseUrl}/api/content/about`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.html).toBe('string');
    expect(body.html).toContain('<h1>About</h1>');
  });
});

describe('GET /api/content/contact', () => {
  it('returns an array of contact entries', async () => {
    const res = await fetch(`${baseUrl}/api/content/contact`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].label).toBe('Email');
  });
});
