import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {chapters} from '../src/curriculum/chapters.ts';
import studies from '../src/content/synthesis.json' with {type:'json'};
const root=process.argv[2]||'dist';
let cases=0;
for(const c of chapters){
 const file=join(root,c.href,'index.html');
 const html=await readFile(file,'utf8');
 if(!studies[c.id]||!html.includes('id="synthesis"')||!html.includes(`${c.href}#synthesis`))throw new Error(`${c.id}: study or navigation target missing`);
 if(html.includes('katex-error'))throw new Error(`${c.id}: rendered math error`);
 cases+=studies[c.id].rows.length;
 for(const [id] of c.sections)if(!html.includes(`id="${id}"`))throw new Error(`${c.id}: section ${id} missing`);
}
console.log(`${chapters.length} published synthesis studies, ${cases} cases, all chapter/section targets and rendered math verified.`);
