import {chapters} from '../src/curriculum/chapters.ts';
import {readdir, readFile, stat} from 'node:fs/promises';
import {resolve, join, dirname} from 'node:path';

const root = resolve(process.argv[2] || 'dist');
const base = '/electronics';
let pages = 0, references = 0;
const problems = [];
async function exists(path) {
  try { return (await stat(path)).isFile(); } catch { return false; }
}
async function check(url, source) {
  if (!url || /^(?:#|data:|https?:|mailto:|\/\/)/.test(url)) return;
  let target;
  const path = decodeURIComponent(url.split(/[?#]/)[0]);
  if (path.startsWith('/')) {
    if (!path.startsWith(base + '/')) {
      problems.push(`${source}: URL escapes the notebook: ${url}`);
      return;
    }
    target = join(root, path.slice(base.length));
  } else target = resolve(dirname(source), path);
  references++;
  if (!await exists(target) && !await exists(join(target, 'index.html'))) {
    problems.push(`${source}: missing local target: ${url}`);
  }
}
async function walk(dir) {
  for (const entry of await readdir(dir, {withFileTypes:true})) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) { await walk(file); continue; }
    if (!/\.(html|css)$/.test(file)) continue;
    const content = await readFile(file, 'utf8');
    if (entry.name.endsWith('.html')) {
      pages++;
      for (const match of content.matchAll(/(?:href|src|component-url|renderer-url)="([^"]+)"/g)) {
        await check(match[1], file);
      }
    } else {
      for (const match of content.matchAll(/url\(["']?([^"')]+)["']?\)/g)) await check(match[1], file);
    }
  }
}
await walk(root);
if (pages !== chapters.length*2) problems.push(`Expected ${chapters.length*2} chapter/practice pages; found ${pages}.`);
for (const c of chapters) for (const href of [c.href,c.practice]) if (!await exists(join(root,href,'index.html'))) problems.push(`Missing curriculum page: ${href}`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else console.log(`${pages} pages, ${references} local links/assets checked; all stay under ${base} and resolve.`);
