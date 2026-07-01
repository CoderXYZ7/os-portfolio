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
    date: frontmatter.date instanceof Date ? frontmatter.date.toISOString().split('T')[0] : (frontmatter.date ?? null),
    featured: Boolean(frontmatter.featured),
    bodyHtml,
    images,
  };
}
