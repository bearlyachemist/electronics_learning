import {cp, readFile, mkdir, rm} from 'node:fs/promises';
import {resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const notebook = fileURLToPath(new URL('../', import.meta.url));
if (!process.argv[2]) throw new Error('Usage: node scripts/stage-hosted.mjs /path/to/hebert.phd');
const host = resolve(process.argv[2]);
const pkg = JSON.parse(await readFile(join(host, 'package.json'), 'utf8'));
if (pkg.name !== 'hebert-phd') throw new Error('Destination must be the hebert.phd website checkout.');
const source = join(notebook, 'dist');
const html = await readFile(join(source, 'index.html'), 'utf8');
if (!html.includes('href="/electronics/"') || !html.includes('/electronics/_astro/')) {
  throw new Error('Run npm run build:hosted and npm run check:hosted before staging.');
}
const target = join(host, 'public', 'electronics');
let oldHtml;
try { oldHtml = await readFile(join(target, 'index.html'), 'utf8'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
if (oldHtml && !oldHtml.includes('The Analog Notebook')) {
  throw new Error('Refusing to replace an unrelated electronics directory.');
}
// Only the generated notebook is replaced. The homepage and its source are untouched.
await rm(target, {recursive:true, force:true});
await mkdir(target, {recursive:true});
await cp(source, target, {recursive:true});
console.log(`Notebook staged at ${target}. Commit public/electronics in the host repository to publish.`);
