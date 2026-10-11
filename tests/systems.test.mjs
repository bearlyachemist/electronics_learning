import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import katex from 'katex';
import {systemsChapters} from '../src/curriculum/systems-chapters.ts';
import {buck,boost,reflection,quantize,codeStep,alias,acquisition,jitterSNR,friis,deltaSigma} from '../src/engine/systems.mjs';
const close=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
test('converter power stages satisfy volt-second and average power balance',()=>{
 for(const vin of [6,12,24]){const p=buck({vin});close((vin-5)*p.duty-5*(1-p.duty),0);close(vin*p.duty,5);}
 for(const vin of [3,5,9]){const p=boost({vin});close(vin*p.duty+(vin-12)*(1-p.duty),0);close(vin*p.input,12*.5);}
});
test('reflection boundaries obey terminal V/I and repeated bounces approach the DC divider',()=>{
 for(const rs of [10,50,100])for(const zl of [10,50,200]){const p=reflection({rs,zl});close(p.first/(p.launch*(1-p.gl)/50),zl);let v=0,w=p.launch;for(let n=0;n<100;n++){v+=w*(1+p.gl);w*=p.gl*p.gs;}close(v,p.final);}
});
test('sampling aliases, bounded quantization, settling and jitter have independent limiting cases',()=>{
 close(alias(7000,10000),3000);close(alias(17000,10000),3000);close(alias(-7000,10000),3000);
 for(const bits of [4,12,16]){const q=codeStep(3.3,bits);assert.equal(quantize(3.3,3.3,bits),2**bits-1);assert.equal(quantize(-1,3.3,bits),0);for(const v of [.01,.731,2.3])assert.ok(v-quantize(v,3.3,bits)*q>=0&&v-quantize(v,3.3,bits)*q<q);close(Math.exp(-acquisition(bits,1000,1e-9)/(1000*1e-9)),1/2**(bits+1));}
 close(jitterSNR(1e6,1e-12)-jitterSNR(10e6,1e-12),20);
});
test('cascade noise includes front-end loss and a delta-sigma accumulator balances charge',()=>{
 close(friis([{nf:3,gain:-3},{nf:2,gain:20}]).nf,5);
 for(const x of [-.9,-.25,0,.37,.9]){const p=deltaSigma(x,4096);assert.ok(Math.abs(p.state)<=1);close(p.state,4096*(x-p.mean),1e-8);assert.ok(Math.abs(x-p.mean)<=1/4096);}
});
test('systems chapters have strict math, complete sections and independent practice',()=>{
 const practice=JSON.parse(readFileSync('src/content/systems-practice.json','utf8'));
 assert.deepEqual(Object.keys(practice).sort(),systemsChapters.map(c=>c.id).sort());
 for(const c of systemsChapters){const s=readFileSync(`src/content/systems/${c.id}.mdx`,'utf8');assert.ok(s.split(/\s+/).length>800,`${c.id}: reading depth`);assert.equal(practice[c.id].length,3);for(const [anchor] of c.sections)assert.ok(s.includes(`id="${anchor}"`),`${c.id}: ${anchor}`);for(const m of s.matchAll(/String\.raw`([^`]+)`|(?<!\$)\$([^$\n]+)\$(?!\$)/g))katex.renderToString(m[1]??m[2],{throwOnError:true,strict:'error'});for(const p of practice[c.id]){assert.ok(p.hint&&p.solution.length);for(const part of p.solution){if(part.tex)katex.renderToString(part.tex,{throwOnError:true,strict:'error'});}}
 }
});
