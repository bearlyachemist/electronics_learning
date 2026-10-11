import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chapters} from '../src/curriculum/chapters.ts';
const notes=JSON.parse(readFileSync('src/content/practical-notes.json'));
const root=process.argv[2]||'dist';
for(const [id,note] of Object.entries(notes)){
 const chapter=chapters.find(c=>c.id===id);assert.ok(chapter,id);
 const html=readFileSync(`${root}/${id==='dividers'?'':id+'/'}index.html`,'utf8');
 assert.equal((html.match(/id="book-notes"/g)||[]).length,1,id);
 assert.ok(html.replace(/’/g,"'").includes(note.title),`${id}: missing title`);
 assert.ok(html.includes('#book-notes'),`${id}: missing navigation link`);
 assert.ok(!html.includes('katex-error'),`${id}: malformed rendered math`);
}
// Wire-only nets deliberately do not join the terminals through a component.
function nets(svg){
 const groups=attr=>[...svg.matchAll(new RegExp(attr+'="([^"]+)"','g'))].map(m=>m[1].split(' ').map(p=>p.split(',').map(Number)));
 const wires=groups('data-wire'),all=[...groups('data-pins').flat(),...groups('data-junction').flat(),...wires.flat()],parents=new Map();
 const key=p=>p.join(','),find=k=>{if(!parents.has(k))parents.set(k,k);if(parents.get(k)!==k)parents.set(k,find(parents.get(k)));return parents.get(k);};
 const union=(a,b)=>parents.set(find(key(a)),find(key(b)));
 const on=(p,a,b)=>Math.abs((p[0]-a[0])*(b[1]-a[1])-(p[1]-a[1])*(b[0]-a[0]))<1e-6&&p[0]>=Math.min(a[0],b[0])&&p[0]<=Math.max(a[0],b[0])&&p[1]>=Math.min(a[1],b[1])&&p[1]<=Math.max(a[1],b[1]);
 for(const w of wires){for(const p of w)union(w[0],p);for(const p of all)if(w.some((a,i)=>i>0&&on(p,w[i-1],a)))union(w[0],p);}
 return (a,b)=>find(key(a))===find(key(b));
}
function diagram(id,label){const html=readFileSync(`${root}/${id}/index.html`,'utf8');return [...html.matchAll(/<svg[\s\S]*?<\/svg>/g)].map(x=>x[0]).find(s=>s.includes(label));}
const multiplier=nets(diagram('emitter-follower','Input supply directly feeds'));
assert.ok(multiplier([70,60],[377,115]),'Filter collector must take input supply directly');
assert.ok(multiplier([335,155],[285,155]),'Filter capacitor must connect to base');
assert.ok(multiplier([377,195],[580,205]),'Filter output must be emitter');
assert.ok(!multiplier([335,155],[70,60]),'Base filtering resistor must not be bypassed');
assert.ok(!multiplier([335,155],[285,270]),'Base capacitor must not be shorted');
const folded=nets(diagram('mos-mirror-loaded-differential','A bias current source'));
assert.ok(folded([424,110],[215,85]),'Folding PMOS source and input current must share X');
assert.ok(folded([424,190],[635,245]),'Folding PMOS drain must reach output');
assert.ok(!folded([424,110],[424,190]),'Folding transistor must not be bypassed');
assert.ok(!folded([380,150],[424,110]),'Independent PMOS cascode bias must not join source');
console.log(`${Object.keys(notes).length} published practical extensions, navigation links and both new circuit net relationships verified.`);
