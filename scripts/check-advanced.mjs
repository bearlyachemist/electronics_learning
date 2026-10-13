// Verify the topology and content of the generated expansion, beyond pin connectivity.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import katex from 'katex';
import {advancedChapters} from '../src/curriculum/advanced-chapters.ts';
const root=process.argv[2]||'dist';
const practice=JSON.parse(await readFile('src/content/advanced-practice.json','utf8'));
for(const c of advancedChapters){
 const html=await readFile(join(root,c.id,'index.html'),'utf8');
 for(const [id] of c.sections)assert.ok(html.includes(`id="${id}"`),`${c.id}: missing section ${id}`);
 assert.ok(!html.includes('katex-error'),`${c.id}: malformed rendered math`);
 assert.equal(practice[c.id].length,3,`${c.id}: missing practice`);
 for(const p of practice[c.id])for(const s of [p.prompt,p.hint,...p.solution.flatMap(s=>[s.text||'',s.note||'',s.answer||''])]){
  assert.ok(!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(s),`${c.id}: invalid text control character`);
  for(const m of s.matchAll(/\$([^$]+)\$/g))katex.renderToString(m[1],{throwOnError:true});
 }
}
function nets(svg){
 const point=s=>s.split(',').map(Number),key=p=>p.join(','),parent=new Map();
 const find=k=>{if(!parent.has(k))parent.set(k,k);if(parent.get(k)!==k)parent.set(k,find(parent.get(k)));return parent.get(k);};
 const union=(a,b)=>parent.set(find(key(a)),find(key(b)));
 const groups=n=>[...svg.matchAll(new RegExp(n+'="([^"]+)"','g'))].map(m=>m[1].split(' ').map(point));
 const wires=groups('data-wire'),pins=groups('data-pins').flat(),dots=groups('data-junction').flat();
 const on=(p,a,b)=>Math.abs((p[0]-a[0])*(b[1]-a[1])-(p[1]-a[1])*(b[0]-a[0]))<.001&&p[0]>=Math.min(a[0],b[0])&&p[0]<=Math.max(a[0],b[0])&&p[1]>=Math.min(a[1],b[1])&&p[1]<=Math.max(a[1],b[1]);
 const all=[...pins,...dots,...wires.flat()];
 for(const w of wires){for(const p of w)union(w[0],p);for(const p of all)if(w.some((q,i)=>i>0&&on(p,w[i-1],q)))union(w[0],p);}
 return (a,b)=>find(key(a))===find(key(b));
}
async function firstSvg(id){const h=await readFile(join(root,id,'index.html'),'utf8');return [...h.matchAll(/<svg[\s\S]*?<\/svg>/g)].map(x=>x[0]).find(x=>x.includes('data-pins'));}
const pm=nets(await firstSvg('mos-ratioed-mirrors'));
assert.ok(pm([220,270],[440,270]),'PMOS gates must be shared');
assert.ok(pm([220,270],[264,310]),'PMOS reference gate must join its drain');
assert.ok(!pm([220,270],[264,230]),'PMOS reference gate must not short to source');
assert.ok(!pm([440,270],[484,310]),'PMOS output drain must not join gate bus');
const wide=nets(await firstSvg('mos-wide-swing-mirror'));
assert.ok(wide([220,270],[440,270]),'Wide-swing lower gates must copy reference');
assert.ok(!wide([440,130],[440,270]),'Cascode bias must be independent of mirror gate');
for(const id of ['mos-two-stage-amplifier','opamp-bjt-internals','opamp-cmos-internals']){
 const n=nets(await firstSvg(id)),b=id==='opamp-bjt-internals',d=b?442:444,out=b?622:624;
 assert.ok(n([d,170],[580,225]),`${id}: first-stage output must drive second-stage input`);
 assert.ok(!n([d,170],[out,170]),`${id}: compensation capacitor must not be bypassed`);
 assert.ok(!n([d,170],[out,420]),`${id}: first-stage output must not join ground`);
}
const servo=nets(await firstSvg('opamp-current-servo'));
assert.ok(servo([318,200],[514,310]),'Servo minus input must sense resistor voltage');
assert.ok(!servo([318,170],[514,310]),'Servo command must be a distinct plus-input net');
const ina=nets(await firstSvg('opamp-instrumentation'));
assert.ok(!ina([160,195],[160,305]),'INA gain resistor must separate minus nodes');
console.log(`${advancedChapters.length} chapters: section targets, 114 practice problems, strict math and critical transistor/feedback net relationships verified.`);
