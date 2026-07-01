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
