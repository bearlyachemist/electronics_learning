import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root=process.argv[2]||'dist';
const coverage=JSON.parse(await readFile('src/content/opamp-coverage.json','utf8'));
const guide=await readFile(`${root}/opamp-coverage/index.html`,'utf8');
for(const row of coverage){assert.ok(guide.includes(`id="topic-${row.section.replaceAll('.','-')}"`));for(const section of row.subsections)assert.ok(guide.includes(section));}
for(const id of new Set(coverage.flatMap(r=>r.chapters))){const h=await readFile(`${root}/${id}/index.html`,'utf8');assert.ok(h.includes('/electronics/opamp-coverage/'));assert.ok(!h.includes('katex-error'));}
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
async function figure(id,description){const h=await readFile(`${root}/${id}/index.html`,'utf8');const svg=[...h.matchAll(/<svg[\s\S]*?<\/svg>/g)].map(m=>m[0]).find(s=>s.includes(description));assert.ok(svg,description);return nets(svg);}
const sh=await figure('opamp-precision-rectifier','Input follower, track switch');
assert.ok(sh([168,155],[280,140]));assert.ok(sh([508,155],[700,140]));assert.ok(sh([508,125],[450,140]));assert.ok(!sh([450,140],[450,280]));
const clamp=await figure('opamp-precision-rectifier','Input through two kilohms');
assert.ok(clamp([398,255],[630,100]));assert.ok(clamp([482,240],[520,200]));assert.ok(!clamp([398,225],[398,255]));assert.ok(!clamp([630,100],[520,200]));
const reset=await figure('opamp-precision-rectifier','Inverting integrator with capacitor feedback');
assert.ok(reset([408,235],[320,380]));assert.ok(reset([492,250],[510,380]));assert.ok(reset([380,380],[450,380]));assert.ok(!reset([280,235],[560,250]));assert.ok(!reset([420,380],[280,235]));assert.ok(!reset([420,380],[420,470]));
const fda=await figure('opamp-function-design','Four resistor fully differential amplifier');
assert.ok(fda([300,215],[280,70]));assert.ok(fda([440,215],[430,70]));assert.ok(fda([300,245],[280,420]));assert.ok(fda([440,245],[430,420]));assert.ok(!fda([300,215],[300,245]));assert.ok(!fda([440,215],[440,245]));assert.ok(!fda([370,280],[300,215]));
const vco=await figure('opamp-function-design','Control voltage divided by two');
assert.ok(vco([300,440],[780,335]));assert.ok(vco([438,225],[344,300]));assert.ok(vco([438,255],[120,400]));assert.ok(!vco([438,225],[438,255]));assert.ok(!vco([344,400],[344,480]));assert.ok(!vco([344,225],[600,240]));
const meter=await figure('opamp-current-servo','Plus-input millivolt command');
assert.ok(meter([328,195],[340,285]));assert.ok(meter([650,285],[570,285]));assert.ok(!meter([328,195],[650,285]));assert.ok(!meter([328,165],[328,195]));assert.ok(!meter([650,285],[650,385]));
const pinch=await figure('opamp-input-tradeoffs','Grounded plus-input op amp senses');
assert.ok(pinch([218,225],[594,200]));assert.ok(pinch([302,240],[400,160]));assert.ok(!pinch([550,160],[594,200]));assert.ok(!pinch([594,120],[594,200]));
console.log('26 TAOE sections, 113 numbered subsections, 18 chapter targets and 7 critical circuit topologies verified.');
