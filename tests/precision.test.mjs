import test from 'node:test';
import assert from 'node:assert/strict';
import {feedbackNetwork} from '../src/engine/precision.mjs';
import {C,sub,mul,div,mag} from '../src/engine/ac.mjs';
import {readFileSync,readdirSync} from 'node:fs';
import katex from 'katex';
const close=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
test('complex feedback divider obeys node KCL at unequal time constants',()=>{
 for(const cf of [0,2e-12,10e-12,30e-12])for(const hz of [0,1e3,1e6,1e8]){
 const {beta,zf,yg}=feedbackNetwork({hz,rf:100000,rg:10000,cf,cin:100e-12});
 close(mag(sub(div(sub(C(1),beta),zf),mul(beta,yg))),0);
 }
});
test('matching arm time constants gives constant feedback at all frequencies',()=>{
 for(const hz of [0,1000,1e6,1e9]){const {ng}=feedbackNetwork({hz,rf:100000,rg:10000,cf:10e-12,cin:100e-12});close(ng.re,11);close(ng.im,0);}
});
test('new precision teaching equations parse in strict KaTeX',()=>{
 for(const file of readdirSync('src/content/advanced').filter(x=>x.startsWith('opamp-')&&x.endsWith('.mdx'))){
 const s=readFileSync('src/content/advanced/'+file,'utf8'),a=s.indexOf('<section id="precision-depth">');if(a<0)continue;
 const block=s.slice(a,s.indexOf('</section>',a));
 for(const m of block.matchAll(/String\.raw`([^`]+)`|(?<!\$)\$([^$\n]+)\$(?!\$)/g))katex.renderToString(m[1]??m[2],{throwOnError:true,strict:'error'});
 }
});

test('TAOE topic map includes every numbered subsection and resolves to a real expanded chapter',()=>{
 const rows=JSON.parse(readFileSync('src/content/opamp-coverage.json','utf8'));
 const counts={4:[3,7,6,4,7,7,0,4,3],5:[2,2,0,1,1,3,6,7,2,12,4,5,0,4,5,13,5]};
 assert.equal(rows.length,26);const seen=new Set();
 for(const [parent,list] of Object.entries(counts))for(let i=0;i<list.length;i++){
 const section=`${parent}.${i+1}`,row=rows.find(r=>r.section===section);assert.ok(row,section);
 assert.deepEqual(row.subsections,Array.from({length:list[i]},(_,n)=>`${section}.${n+1}`));
 for(const id of row.chapters){seen.add(id);const s=readFileSync(`src/content/advanced/${id}.mdx`,'utf8');assert.ok(s.includes(id==='opamp-active-filters'?'id="model"':'id="precision-depth"'),id);}
 }
 assert.equal(seen.size,18);
});
