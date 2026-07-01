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
