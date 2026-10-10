import test from 'node:test';
import assert from 'node:assert/strict';
import {feedback,loopResponse,loopMargins,degenerated,supply,thermalControl,logicGate} from '../src/engine/feedback.mjs';
const near=(a,b,eps=1e-8)=>assert.ok(Math.abs(a-b)<=eps*Math.max(1,Math.abs(b)),a+' vs '+b);
test('feedback reconstruction, disturbance rejection, and differential sensitivity',()=>{
 const a=1000,b=.1,x=.1,d=.4,p=feedback({a,b,input:x,disturbance:d});near(p.out,a*p.error+d);near(p.error,x-b*p.out);near(p.gain,1000/101);
 const h=.01,dg=(feedback({a:a+h,b}).gain-feedback({a:a-h,b}).gain)/(2*h);near(dg*a/p.gain,p.sensitivity);
 near(p.out-feedback({a,b,input:x}).out,d/(1+a*b));
});
test('three-pole crossover agrees with unity gain and Routh boundary',()=>{
 for(const p2 of [100,1000,10000,100000])for(const b of [.01,.1,1]){
 const m=loopMargins({p2,b});near(loopResponse({p2,b,hz:m.cross}).mag,1);
 assert.equal(m.stable,m.margin>0);
 }
 assert.equal(loopMargins({p2:1000,b:1}).stable,false);assert.equal(loopMargins().stable,true);
});
test('emitter degeneration obeys exponential KVL and its tangent',()=>{
 for(const re of [0,100,1000]){
 for(const vin of [-.03,0,.03]){const d=degenerated({re,vin});near(.02585*Math.log(d.ic/.001)+(d.ic-.001)*1.01*re,vin,1e-12);}
 const h=1e-7,g=(degenerated({re,vin:h}).out-degenerated({re,vin:-h}).out)/(2*h);near(g,degenerated({re}).gain,1e-7);
 }
 assert.ok(Math.abs(degenerated({re:100}).gain)<Math.abs(degenerated({re:0}).gain));
});
test('supply satisfies voltage-loop KVL and changes constraint at dropout and limit',()=>{
 const d=supply({vin:12,rl:100});near(d.out,1000*(1-.2*d.out)-2*d.current,1e-10);assert.equal(d.mode,'voltage regulation');
 const drop=supply({vin:4});near(drop.out,3);assert.equal(drop.mode,'dropout');
 const lim=supply({rl:10,imax:.2});near(lim.out,2);near(lim.current,.2);assert.equal(lim.mode,'current limit');
 near(lim.power+lim.out*lim.current,12*lim.current);near(lim.tj,25+40*lim.power);
});
test('thermal P equilibrium and PI error removal with energy conservation',()=>{
 const p=thermalControl({mode:'P'});near(p.temp,45,1e-7);
 const pi=thermalControl({mode:'PI'});near(pi.temp,50,1e-6);
 for(const d of [p,pi]){near(d.energy-d.loss,d.cth*(d.temp-20),1e-8);assert.ok(d.points.every(p=>p.p>=0&&p.p<=10));}
});
test('thermal integration converges and thermostat switches both ways',()=>{
 const cfg={mode:'PI',lag:30,kp:.5,ki:.01};
 const a=thermalControl(cfg),b=thermalControl({...cfg,dt:.05});assert.ok(Math.abs(a.temp-b.temp)<.03);
 const t=thermalControl({mode:'thermostat'});assert.ok(t.points.some(p=>p.p===0));assert.ok(t.points.some(p=>p.p===10));assert.ok(t.temp>48&&t.temp<52);
});
test('truth tables and loaded low-state current budget are separate',()=>{
 for(const a of [false,true])for(const b of [false,true]){
 assert.equal(logicGate({a,b,kind:'NOR'}).on,a||b);assert.equal(logicGate({a,b,kind:'NAND'}).on,a&&b);
 }
 const empty=logicGate({a:true,b:true,kind:'NAND'}),loaded=logicGate({a:true,b:true,kind:'NAND',fanout:1});
 assert.ok(empty.passes);assert.ok(!loaded.passes);near(loaded.ic-empty.ic,.00041);
});
test('invalid model parameters are rejected',()=>{
 assert.throws(()=>feedback({b:0}),RangeError);assert.throws(()=>degenerated({re:-1}),RangeError);assert.throws(()=>supply({rl:0}),RangeError);assert.throws(()=>thermalControl({lag:-1}),RangeError);
});

