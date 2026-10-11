import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import katex from 'katex';
import {squareSeries,allPass,stateVariable,railGmSplit} from '../src/engine/practical.mjs';
import {C,add,sub,scale,mul,mag} from '../src/engine/ac.mjs';
const close=(a,b,eps=1e-9)=>assert.ok(Math.abs(a-b)<eps,`${a} versus ${b}`);
const notes=JSON.parse(readFileSync('src/content/practical-notes.json'));
test('42 practical extensions have unique anchors, real target sections, strict math and figure imports',()=>{
 assert.equal(Object.keys(notes).length,42);
 for(const [id,n] of Object.entries(notes)){
  let s;try{s=readFileSync(`src/content/${id}.mdx`,'utf8');}catch{s=readFileSync(`src/content/advanced/${id}.mdx`,'utf8');}
  assert.equal((s.match(/id="book-notes"/g)||[]).length,1,id);
  const section=s.match(new RegExp(`<section id="${n.section}">([\\s\\S]*?)</section>`))[1];
  assert.ok(section.includes(`id="book-notes">${n.title}`),id);
  const block=section.slice(section.indexOf('<h3 id="book-notes">')).split('<p className="reference-note">')[0];
  for(const m of block.matchAll(/\$([^$]+)\$/g))katex.renderToString(m[1],{throwOnError:true,strict:'error'});
  for(const m of block.matchAll(/String\.raw`([^`]+)`/g))katex.renderToString(m[1],{throwOnError:true,strict:'error'});
  for(const figure of n.figures){assert.ok(s.includes(`<${figure}/>`),id);assert.ok(s.includes(figure+'} from')||s.includes(figure+','),id);}
 }
});
test('square-wave Fourier coefficients conserve mean-square voltage and phase symmetry',()=>{
 const n=31,steps=10000;let rms=0;
 for(let k=0;k<steps;k++){const t=(k+.5)/steps,v=squareSeries(t,n);rms+=v*v/steps;close(squareSeries(t+.5,n),-v,1e-12);}
 const coefficientEnergy=Array.from({length:n},(_,k)=>8/(Math.PI**2*(2*k+1)**2)).reduce((a,b)=>a+b,0);
 close(rms,coefficientEnergy,1e-12);assert.ok(rms<1&&rms>.99);
 close(Math.sqrt(8/Math.PI**2),.9003163161571061);
});
test('all-pass preserves magnitude but has the frequency-dependent delay of its phase',()=>{
 for(const x of [.01,.1,1,10,100]){
  const r=allPass(x);close(r.magnitude,1);const dx=x*1e-5;
  const derivative=(allPass(x+dx).phase-allPass(x-dx).phase)/(2*dx)*Math.PI/180;
  close(-derivative,r.delayInTau,1e-8);
 }
 close(allPass(1).phase,-90);close(allPass(1).delayInTau,1);
});
test('state-variable frequency responses obey both integrator equations and summer KCL',()=>{
 for(const q of [.5,Math.SQRT1_2,2,5])for(const x of [.01,.1,1,3,100]){
  const {hp,bp,lp,notch}=stateVariable(x,q),jw=C(0,x);
  close(mag(sub(mul(jw,bp),hp)),0,1e-10);close(mag(sub(mul(jw,lp),bp)),0,1e-10);
  close(mag(sub(add(add(hp,scale(bp,1/q)),lp),C(1))),0,1e-10);
  close(mag(sub(notch,add(hp,lp))),0);if(x===1){close(mag(bp),q);close(mag(lp),q);close(mag(hp),q);close(mag(notch),0);}
 }
});
test('rail-pair square-law current sharing gives a hill despite constant total current',()=>{
 close(railGmSplit(0),1);close(railGmSplit(1),1);close(railGmSplit(.5),Math.SQRT2);
 for(const x of [.01,.1,.3,.7,.9]){close(railGmSplit(x),railGmSplit(1-x));assert.ok(railGmSplit(x)>1);}
});
test('additional design budgets preserve charge, RMS loss, reference ratios and shot-noise units',()=>{
 const q=1.602176634e-19,kb=1.380649e-23;
 close(100e3*100e-9*Math.log(2)*1e3,6.9314718056,1e-9);
 close((100e3+500)*20e-12*Math.log(8192)*1e6,18.11193582803137,1e-9);
 close((1+1/12)*.3,.325);close(.5*100e-6*1.5**2*1e6,112.5);
 close(1.25*(1+720/240)+50e-6*720,5.036);
 close(20e-12*3.3**2*10e6*.5*1e3,1.089);
 close(Math.sqrt(2*q*1e-6)*1e12,.566,.0005);
 close(Math.sqrt(4*kb*300/1e6)*1e12,.129,.0005);
 close(2*2*(10.1/20.1)-2,.009950248756219,1e-12);
 close((2*(1-1/Math.sqrt(4)))**2/(2*.002*1000**2),250e-6);
 close(.75*.02/1.5,.01);close(1.2*2/3,.8);
});
test('invalid extension model inputs fail instead of emitting broken plot numbers',()=>{
 for(const fn of [()=>squareSeries(0,0),()=>allPass(-1),()=>stateVariable(1,0),()=>railGmSplit(2)])assert.throws(fn,RangeError);
});
