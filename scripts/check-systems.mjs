import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {systemsChapters} from '../src/curriculum/systems-chapters.ts';
import {chapters} from '../src/curriculum/chapters.ts';
import {parts,partOf} from '../src/curriculum/parts.ts';
const root=process.argv[2]||'dist';
const guide=await readFile(`${root}/systems-coverage/index.html`,'utf8');
const contents=await readFile(`${root}/contents/index.html`,'utf8');
for(const p of parts)assert.ok(contents.includes(`id="part-${p.id}"`),p.id);
for(const c of chapters)assert.ok(contents.includes(`href="/electronics${c.href}"`),c.id);
for(const c of systemsChapters){
 const h=await readFile(`${root}${c.href}index.html`,'utf8');
 const practice=await readFile(`${root}${c.practice}index.html`,'utf8');
 assert.ok(guide.includes(`href="/electronics${c.href}"`),c.id);
 assert.ok(guide.includes(`href="/electronics${c.practice}"`),c.practice);
 assert.ok(h.includes(`CHAPTER ${c.number}</span>`),c.id);
 assert.ok(h.includes(`PART ${partOf(c.number).numeral} /`),c.id);
 for(const [anchor] of c.sections)assert.ok(h.includes(`id="${anchor}"`),`${c.id}#${anchor}`);
 assert.ok(h.includes('id="synthesis"'),c.id);
 assert.ok(!h.includes('katex-error')&&!practice.includes('katex-error'),c.id);
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
async function figure(id,description){
 const h=await readFile(`${root}/${id}/index.html`,'utf8');
 const svg=[...h.matchAll(/<svg[\s\S]*?<\/svg>/g)].map(m=>m[0]).find(s=>s.includes(description));
 assert.ok(svg,description);return nets(svg);
}
for(const [id,description] of [['power-buck-converters','Asynchronous buck power stage'],['power-boost-isolated','Boost power stage']]){
 const n=await figure(id,description);
 assert.ok(n([430,70],[620,70]));assert.ok(n([260,200],[590,200]));
 assert.ok(!n([80,70],[260,70]));assert.ok(!n([260,70],[430,70]));assert.ok(!n([430,70],[430,200]));assert.ok(!n([260,70],[260,200]));
}
const match=await figure('rf-impedance-matching','Series 1.378 microhenry');
assert.ok(match([280,70],[460,70]));assert.ok(match([80,190],[460,190]));assert.ok(!match([80,70],[280,70]));assert.ok(!match([280,70],[280,190]));
const ladder=await figure('dac-architectures-output','Four rungs of 2R');
assert.ok(ladder([40,70],[100,70]));
for(const x of [100,250,400,550]){
 assert.ok(!ladder([x,70],[x,210]));assert.ok(!ladder([x,70],[680,70]));
 if(x<550)assert.ok(!ladder([x,70],[x+150,70]));
}
const snub=await figure('power-control-layout','An edge drives parasitic series inductance');
assert.ok(snub([300,70],[520,70]));assert.ok(snub([80,240],[520,240]));
assert.ok(!snub([80,70],[300,70]));assert.ok(!snub([300,70],[300,240]));assert.ok(!snub([520,70],[520,155]));assert.ok(!snub([520,155],[520,240]));
const tank=await figure('oscillators-pll','A parallel LC tank with loss conductance');
assert.ok(tank([100,60],[520,60]));assert.ok(tank([100,190],[520,190]));assert.ok(!tank([100,60],[100,190]));
console.log(`${systemsChapters.length} systems chapters, guide/contents links, reading/practice math and 6 critical circuit topologies verified.`);
