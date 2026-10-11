import test from 'node:test';
import assert from 'node:assert/strict';
import {closedLoop,dcErrors,noise,sallenKey,tia} from '../src/engine/opamp.mjs';
import {C,sub,mul,div,mag} from '../src/engine/ac.mjs';
const close=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
test('finite-gain response reconstructs the amplifier error and noise-gain bandwidth',()=>{
 for(const hz of [0,100,10000,1e6]){const p=closedLoop({hz});close(mag(sub(p.h,mul(p.a,sub(C(1),div(p.h,C(11)))))),0);}
 const low=closedLoop().magnitude,corner=closedLoop({hz:1e6/11}).magnitude;close(corner/low,Math.SQRT1_2,1e-4);
 close(closedLoop({signalGain:-10}).magnitude,10/(1+11/100000));
});
test('DC error solution satisfies divider KCL, and output limits are explicit',()=>{
 const p=dcErrors({vin:.2,vos:.001,ibPlus:20e-9,ibMinus:30e-9,rsource:10000});
 const vm=p.out/11-30e-9*(100000*10000/110000),vp=.2+.001-20e-9*10000;
 close(p.out,100000*(vp-vm),1e-8);assert.equal(dcErrors({vin:1}).clipped,true);
});
test('Sallen-Key follows both capacitor KCL equations and distinguishes unstable gain',()=>{
 for(const hz of [0,1000,10000]){const p=sallenKey({hz,gain:1.5});const s=C(0,2*Math.PI*hz),vb=div(p.h,C(1.5)),va=mul(vb,C(1,2*Math.PI*hz*1e-4));
  const nodeA= sub(C(1),va);const rhs=mul(C(10000),sub(div(sub(va,vb),C(10000)),mul(s,mul(C(10e-9),sub(p.h,va)))));close(mag(sub(nodeA,rhs)),0);
 }
 close(sallenKey({gain:1}).q,.5);assert.equal(sallenKey({gain:3.1}).stable,false);
});
test('TIA noise gain and feedback reconstruct summing-node KCL',()=>{
 for(const hz of [0,100,10000]){const p=tia({hz});const a=div(C(1e5),C(1,hz/10)),vm=div(mul(C(-1),p.h),a),s=C(0,2*Math.PI*hz),yf=C(1e-6,2*Math.PI*hz*10e-12);
  const leaving= sub(mul(vm,mul(s,C(50e-12))),mul(sub(p.h,vm),yf));close(mag(sub(leaving,C(1))),0,1e-7);
 }
});
test('uncorrelated noise sums power and scales with square-root bandwidth',()=>{
 const p=noise(),q=noise({bw:40000});close(q.rms,2*p.rms);close(p.density*p.density,25e-18+p.resistor*p.resistor+p.current*p.current);
});
test('unequal Sallen-Key parts obey both node equations, including gain feedback',()=>{
 const r1=12000,r2=18000,c1=22e-9,c2=10e-9,gain=1.4;
 for(const hz of [0,37,1000,17000]){
  const p=sallenKey({hz,r1,r2,c1,c2,gain}),s=C(0,2*Math.PI*hz),y=div(p.h,C(gain)),x=mul(y,C(1,2*Math.PI*hz*r2*c2));
  close(mag(sub(div(sub(x,y),C(r2)),mul(s,mul(C(c2),y)))),0,1e-12);
  close(mag(sub(div(sub(C(1),x),C(r1)),sub(div(sub(x,y),C(r2)),mul(s,mul(C(c1),sub(p.h,x)))))),0,1e-12);
 }
});
test('Sallen-Key cutoff, peak and integrated white-noise bandwidth are distinct',()=>{
 for(const q of [.5,Math.SQRT1_2,2]){
  const gain=3-1/q,f0=sallenKey({gain}).f0;
  const x=Math.sqrt((2-1/q**2+Math.sqrt((1/q**2-2)**2+4))/2);
  close(sallenKey({gain,hz:x*f0}).magnitude/gain,Math.SQRT1_2);
  // Numerical integral is independent of the closed-form bandwidth derivation.
  const dx=.0005,n=200000;let sum=0;
  for(let i=0;i<n;i++){const z=(i+.5)*dx;sum+=dx/((1-z*z)**2+(z/q)**2);}
  close(sum,Math.PI*q/2,4e-7);
 }
 const p=sallenKey({gain:2.5}),peak=sallenKey({gain:2.5,hz:p.f0*Math.sqrt(1-1/(2*p.q**2))});
 close(peak.magnitude/2.5,2/Math.sqrt(1-1/16));
});
