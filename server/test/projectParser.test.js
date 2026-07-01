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
