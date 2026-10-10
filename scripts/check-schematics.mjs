// Connectivity lint for schematics drawn with src/components/Schematic.tsx.
// Run after `npm run build`: it reads every page in dist/, finds each schematic SVG, and reports
//   • wire ends that touch no pin, junction or other wire (a dangling wire), and
//   • part pins that touch no wire or other pin (a floating terminal).
// Usage: node scripts/check-schematics.mjs [dist]
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join,relative} from 'node:path';

const root=process.argv[2]??'dist',TOL=0.75;
const walk=d=>readdirSync(d).flatMap(f=>{const p=join(d,f);return statSync(p).isDirectory()?walk(p):p.endsWith('.html')?[p]:[];});
const pts=s=>s.trim().split(/\s+/).map(p=>p.split(',').map(Number));
const attrs=(svg,name)=>[...svg.matchAll(new RegExp(name+'="([^"]*)"','g'))].map(m=>pts(m[1]));
const near=(a,b)=>Math.abs(a[0]-b[0])<=TOL&&Math.abs(a[1]-b[1])<=TOL;
function onSegment(p,a,b){
  const [dx,dy]=[b[0]-a[0],b[1]-a[1]],L2=dx*dx+dy*dy;
  if(L2===0)return near(p,a);
  const t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L2));
  return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)<=TOL;
}
const onWire=(p,w)=>w.some((q,i)=>i>0&&onSegment(p,w[i-1],q));

export function lintSvg(svg){
  const wires=attrs(svg,'data-wire'),parts=attrs(svg,'data-pins'),dots=attrs(svg,'data-junction').flat(),problems=[];
  const allPins=parts.flat();
  wires.forEach((w,i)=>[w[0],w[w.length-1]].forEach(end=>{
    const ok=allPins.some(p=>near(p,end))||dots.some(d=>near(d,end))||wires.some((o,j)=>j!==i&&onWire(end,o));
    if(!ok)problems.push(`dangling wire end at (${end})`);
  }));
  parts.forEach((ps,i)=>ps.forEach(p=>{
    const ok=wires.some(w=>onWire(p,w))||parts.some((o,j)=>j!==i&&o.some(q=>near(p,q)));
    if(!ok)problems.push(`unconnected pin at (${p})`);
  }));
  return problems;
}

if(import.meta.url===`file://${process.argv[1]}`){
  let checked=0,legacy=0,failures=0;
  for(const file of walk(root)){
    const html=readFileSync(file,'utf8');
    for(const m of html.matchAll(/<svg[\s\S]*?<\/svg>/g)){
      const svg=m[0];
      if(!/data-(wire|pins)=/.test(svg)){if(/class="(wide-circuit|circuit-svg)"|support-figure/.test(svg)||/<path d="M[\d. ]+[HV]/.test(svg))legacy++;continue;}
      checked++;
      const problems=lintSvg(svg);
      if(problems.length){failures++;const label=(svg.match(/aria-label="([^"]{0,70})/)||[])[1];console.log(`✗ ${relative(root,file)} — ${label}…\n    ${[...new Set(problems)].join('\n    ')}`);}
    }
  }
  console.log(`${checked} schematic(s) checked, ${failures} with problems; ${legacy} legacy drawing(s) not yet on Schematic.tsx.`);
  process.exit(failures?1:0);
}
