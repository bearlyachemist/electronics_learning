import test from 'node:test';
import assert from 'node:assert/strict';
import {C,add,mul,div,mag,phase,polar,parallel,db,impedance,power,rcResponse,bandResponse,notchResponse,poleResponse,resonance,lcResponse,acThevenin,network,phasorSum,powerWave,correction,loadedRC,supplyImpedance,tank} from '../src/engine/ac.mjs';
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),a+' vs '+b);
const cnear=(a,b,tol=1e-9)=>{near(a.re,b.re,tol);near(a.im,b.im,tol);};

test('complex arithmetic: polar form multiplies magnitudes and adds angles',()=>{
 const a=polar(2,30),b=polar(3,45),p=mul(a,b);near(mag(p),6);near(phase(p),75);
 cnear(mul(div(a,b),b),a);assert.throws(()=>div(C(1),C(0)),RangeError);
});
test('reactances follow 1/(wC) and wL; series and parallel combinations obey limits',()=>{
 const r=1000,l=.01,c=1e-6;
 for(const hz of [10,159.15494309189535,1e4,1e6]){
  const w=2*Math.PI*hz,n=t=>network({topology:t,r,l,c,hz});
  near(n('c').magnitude,1/(w*c));near(n('c').phase,-90);near(n('l').magnitude,w*l);near(n('l').phase,90);
  cnear(n('series-rlc').z,impedance({r,l,c,hz}));
  // Parallel admittances add.
  cnear(n('parallel-rlc').admittance,C(1/r,w*c-1/(w*l)),1e-8);
  cnear(n('parallel-rc').admittance,add(div(C(1),C(r)),div(C(1),n('c').z)),1e-8);
  assert.ok(n('parallel-rc').magnitude<=Math.min(r,1/(w*c))+1e-9);
 }
 near(network({topology:'series-rc',r:1000,c:1e-6,hz:1/(2*Math.PI*1e-3)}).phase,-45);
 const f0=1/(2*Math.PI*Math.sqrt(.01*1e-6));near(network({topology:'parallel-rlc',r:1000,l:.01,c:1e-6,hz:f0}).magnitude,1000,1e-8);
});
test('phasor addition equals time-domain addition',()=>{
 for(const [a1,p1,a2,p2] of [[1,0,1,90],[3,20,2,-130],[1,0,1,180]]){
  const s=phasorSum({a1,p1,a2,p2});
  for(const t of [0,.3,1.7,4]) near(s.at(t),s.amplitude*Math.cos(t+s.phase*Math.PI/180),1e-12);
 }
 near(phasorSum({a1:1,p1:0,a2:1,p2:90}).amplitude,Math.SQRT2);
});
test('reactive power: S = V I*, P = I^2 R and averaged instantaneous power',()=>{
 for(const x of [-300,-50,0,80,500]){
  const d=powerWave({vrms:10,r:100,x,hz:50});
  near(d.p,d.irms**2*100);near(d.q,d.irms**2*x);near(d.apparent,10*d.irms);
  let avg=0;const n=20000;for(let k=0;k<n;k++)avg+=d.pt((k+.5)/(n*50))/n;near(avg,d.p,1e-6);
 }
 assert.ok(power({x:100}).angle>0&&power({x:-100}).angle<0);
});
test('power-factor correction cancels reactive power at the ideal capacitance',()=>{
 const base={vrms:230,hz:50,r:20,l:.05},ideal=correction(base).ideal,d=correction({...base,c:ideal});
 near(d.q,0,1e-7);near(d.pf,1);near(d.p,correction(base).p);
 assert.ok(mag(d.line)<mag(correction(base).line));cnear(d.load,correction(base).load);
});
test('first-order RC filters: corner, asymptotes, complementarity, and loading',()=>{
 const lo=rcResponse({hz:1000,fc:1000}),hi=rcResponse({hz:1000,fc:1000,high:true});
 near(mag(lo),Math.SQRT1_2);near(phase(lo),-45);near(phase(hi),45);cnear(add(lo,hi),C(1));
 near(db(rcResponse({hz:1e9,fc:1000}))-db(rcResponse({hz:1e8,fc:1000})),-20,1e-5);
 const r=10e3,c=10e-9,fc=1/(2*Math.PI*r*c);cnear(loadedRC({r,c,hz:fc}),rcResponse({hz:fc,fc}));
 near(mag(loadedRC({r,c,rl:r,hz:1e-3})),.5,1e-6);near(mag(loadedRC({r,c,rl:r,hz:1/(2*Math.PI*(r/2)*c),high:true})),Math.SQRT1_2,1e-9);
});
test('cascaded poles, band-pass loading, and the twin-T notch',()=>{
 for(const count of [1,2,3,4]){
  const s=db(poleResponse({hz:2e5,fc:100,count}))-db(poleResponse({hz:1e5,fc:100,count}));near(s,-6.0206*count,1e-3);
  near(phase(poleResponse({hz:100,fc:100,count})),-45*count>-180?-45*count:-45*count+360);
 }
 near(mag(bandResponse({hz:1000,low:1000,high:1000})),.5);near(mag(bandResponse({hz:1000,low:1000,high:1000,loaded:true})),1/3);
 near(mag(notchResponse({hz:1000,f0:1000})),0);near(mag(notchResponse({hz:1e-3,f0:1000})),1,1e-5);
});
test('series resonance: phase zero, current V/R, voltage magnification Q, half-power bandwidth',()=>{
 const p={r:10,l:.01,c:1e-6},d0=resonance({...p,hz:1});const f0=d0.f0;
 const d=resonance({...p,hz:f0});near(phase(d.z),0,1e-8);near(mag(d.i),.1);near(mag(d.vl),d.q*1,1e-8);cnear(add(d.vl,d.vc),C(0),1e-8);
 // Half-power points satisfy |Z| = sqrt(2) R; their separation equals R/(2 pi L).
 const bw=d.bw,fl=-bw/2+Math.sqrt(bw*bw/4+f0*f0),fh=fl+bw;
 near(mag(impedance({...p,hz:fl})),Math.SQRT2*10,1e-8);near(mag(impedance({...p,hz:fh})),Math.SQRT2*10,1e-8);
 const t=tank({l:100e-6,c:1e-9,rw:5});near(mag(tank({l:100e-6,c:1e-9,rw:5,hz:t.f0}).z),t.rd,2e-3);
});
test('LC low-pass DC gain, high-frequency slope, and AC Thevenin equivalence',()=>{
 near(mag(lcResponse({hz:1e-4,rs:10,rl:1000})),1000/1010,1e-8);
 near(db(lcResponse({hz:2e6}))-db(lcResponse({hz:1e6})),-12.04,2e-3);
 for(const hz of [10,1591.5,1e5]){
  const p={hz,r:1000,c:100e-9,rl:1000,vs:1},d=acThevenin(p);
  // Direct nodal solution of source–R–node–(C || RL).
  const zc=C(0,-1/(2*Math.PI*hz*100e-9)),zp=parallel(zc,C(1000));cnear(d.out,div(zp,add(C(1000),zp)),1e-9);
 }
});
test('bypass capacitor lowers supply impedance near its useful band',()=>{
 for(const hz of [1e4,1e5,1e6]) assert.ok(mag(supplyImpedance({hz}))<mag(supplyImpedance({hz,bypassed:false})));
 near(mag(supplyImpedance({hz:1e-3,bypassed:false})),.2,1e-6);
});
test('invalid AC parameters fail explicitly',()=>{
 assert.throws(()=>network({topology:'mystery'}),RangeError);assert.throws(()=>network({hz:0}),RangeError);
 assert.throws(()=>correction({c:-1}),RangeError);assert.throws(()=>loadedRC({rl:0}),RangeError);
});
