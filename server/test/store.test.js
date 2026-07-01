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
