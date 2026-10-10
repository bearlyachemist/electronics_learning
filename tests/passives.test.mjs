import test from 'node:test';
import assert from 'node:assert/strict';
import {capacitor,rc,filter,capacitorImpedance,inductor,transformer} from '../src/engine/passives.mjs';
const near=(a,b,tol=1e-9)=>assert.ok(Math.abs(a-b)<tol,String(a)+' != '+b);
test('capacitor charge, nonzero initial voltage, and energy balance',()=>{
 const d=capacitor({current:.002,c:10e-6,t:.005,v0:2});
 near(d.voltage,3);near(d.charge,30e-6);near(d.energy-.5*10e-6*4,25e-6);
 const h=1e-7,plus=capacitor({current:.002,c:10e-6,t:.005+h,v0:2}),minus=capacitor({current:.002,c:10e-6,t:.005-h,v0:2});
 near((plus.energy-minus.energy)/(2*h),.002*d.voltage);
 near(capacitor({current:0,c:1e-6,t:1,v0:3}).voltage,3);
});
test('RC initial/final conditions, discharge, and node differential equation',()=>{
 for(const vin of [0,5])for(const v0 of [0,2,5]){
 const p={vin,v0,r:10000,c:10e-6};
 near(rc({...p,t:0}).voltage,v0);
 near(rc({...p,t:3}).voltage,vin,1e-10);
 const t=.07,h=1e-6,d=rc({...p,t});
 const slope=(rc({...p,t:t+h}).voltage-rc({...p,t:t-h}).voltage)/(2*h);
 near(slope*p.c,d.current);near((vin-d.voltage)/p.r,d.current);
 }
});
test('filter complementarity and approximation error from complex arithmetic',()=>{
 for(const hz of [10,100,1591.5494309189535,20000,100000]){
 const p={r:10000,c:10e-9,hz},hi=filter({...p,kind:'highpass'}),lo=filter({...p,kind:'lowpass'});
 near(hi.re+lo.re,1);near(hi.im+lo.im,0);
 for(const d of [hi,lo])near(Math.hypot(-d.re,d.approxIm-d.im)/d.gain,d.relativeError,1e-8);
 }
 near(filter({kind:'lowpass',r:10000,c:10e-9,hz:1/(2*Math.PI*.0001)}).gain,Math.SQRT1_2);
});
test('real capacitor has ESR minimum and opposite phase signs around resonance',()=>{
 const p={c:1e-6,esr:.1,esl:10e-9},fr=1/(2*Math.PI*Math.sqrt(p.c*p.esl));
 near(capacitorImpedance({...p,hz:fr}).magnitude,.1);near(capacitorImpedance({...p,hz:fr}).phase,0,1e-10);
 assert.ok(capacitorImpedance({...p,hz:fr/10}).phase<0);
 assert.ok(capacitorImpedance({...p,hz:fr*10}).phase>0);
});
test('inductor initial/final behavior and clamp energy conservation',()=>{
 const p={l:.01,r:100,vin:5,clamp:12};
 near(inductor({...p,t:0}).current,0);near(inductor({...p,t:0}).voltage,5);
 const start=inductor({...p,t:0,off:true});near(start.current,.05);near(start.energy,12.5e-6);
 near(inductor({...p,t:start.stop*1.1,off:true}).current,0);
 near(.5*p.clamp*start.current*start.stop,start.energy);
 const t=.00003,h=1e-9,d=inductor({...p,t});
 near(p.l*(inductor({...p,t:t+h}).current-inductor({...p,t:t-h}).current)/(2*h),d.voltage,1e-8);
});
test('transformer power, reflected impedance, and flux scaling',()=>{
 for(const ns of [25,50,100,200])for(const rl of [10,100,1000]){
 const p={vp:12,np:100,ns,rl,hz:10000,area:25e-6},d=transformer(p);
 near(d.vs*d.is,p.vp*d.ip);near(p.vp/d.ip,d.reflected);
 near(transformer({...p,hz:5000}).bpeak,2*d.bpeak);
 near(transformer({...p,ns:ns*2}).power,4*d.power);
 }
});
test('reject invalid passive model parameters',()=>{
 assert.throws(()=>rc({vin:5,v0:0,r:0,c:1,t:0}));
 assert.throws(()=>capacitor({current:1,c:1,t:-1}));
 assert.throws(()=>filter({kind:'unknown',r:1,c:1,hz:1}));
 assert.throws(()=>transformer({vp:1,np:1,ns:1,rl:0,hz:1,area:1}));
});

