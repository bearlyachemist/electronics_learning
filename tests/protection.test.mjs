import test from 'node:test';
import assert from 'node:assert/strict';
import {polarity,hotPlug,boostCycle,bypassRC} from '../src/engine/protection.mjs';
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),a+' vs '+b);

test('reverse-polarity topologies: power balance and reversed behavior',()=>{
 for(const topology of ['series','shunt','pmos','bridge'])for(const load of [0,.5,2]){
  const d=polarity({topology,load});
  if(d.out>0)near(12*load,d.delivered+d.loss);
 }
 near(polarity({topology:'series',load:1}).loss,.45);near(polarity({topology:'pmos',load:2}).loss,.08);
 assert.equal(polarity({topology:'series',reversed:true}).out,0);assert.equal(polarity({topology:'pmos',reversed:true}).out,0);
 near(polarity({topology:'shunt',reversed:true}).fault,(12-.45)/.05);
 near(polarity({topology:'bridge',reversed:true}).out,12-.9);
});
test('undamped hot-plug approaches twice the input; analytic second-order comparison',()=>{
 const p={vin:12,l:10e-6,c:22e-6,r:.05,rl:1e6};
 const d=hotPlug({...p,steps:40000});
 const z0=Math.sqrt(p.l/p.c),zeta=p.r/(2*z0),wd=Math.sqrt(1-zeta*zeta)/Math.sqrt(p.l*p.c);
 const analyticPeak=12*(1+Math.exp(-zeta*Math.PI/Math.sqrt(1-zeta*zeta)));
 near(d.peakV,analyticPeak,2e-3);assert.ok(d.peakV>20);
 // Peak current near V/Z0 when lightly damped.
 near(d.peakI,12/z0*Math.exp(-zeta*Math.atan(Math.sqrt(1-zeta*zeta)/zeta)/Math.sqrt(1-zeta*zeta)),5e-3);
 assert.ok(wd>0);
});
test('hot-plug KVL/KCL residuals and bypass diode clamp',()=>{
 const p={vin:12,l:10e-6,c:22e-6,r:.05,rl:50,steps:20000};
 const d=hotPlug({...p,diode:true});
 assert.ok(d.peakV<=12.7+1e-9);assert.ok(d.clampCharge>0);
 for(const pt of d.points)assert.ok(pt.id>=0);
 const plain=hotPlug(p);assert.ok(plain.peakV>d.peakV+5);
 // Final value tends to the resistive divider.
 const long=hotPlug({...p,r:1,end:.02,steps:20000});near(long.points.at(-1).v,12*50/51,1e-4);
});
test('boost cycle energy conservation and inductor current shape',()=>{
 const d=boostCycle();
 near(d.ipk,.5);near(d.stored,.5*100e-6*.25);
 near(d.eIn,d.eOut+d.eDiode,1e-12);
 near(d.eIn-5*d.ipk*d.toff/2,d.stored,1e-12);
 near(d.current(10e-6),.5,1e-9);assert.equal(d.current(d.period*.99),0);assert.equal(d.continuous,false);
 assert.throws(()=>boostCycle({vin:13}),RangeError);
});
test('diode-bypassed RC discharges quickly to near vf, then slowly',()=>{
 const base={vs:5,r1:100e3,r2:100e3,c:1e-6},slow=bypassRC({...base,charging:false,diode:false,t:.01}),fast=bypassRC({...base,charging:false,t:.01});
 assert.ok(fast.v<slow.v);near(slow.v,5*Math.exp(-.1));
 const x=bypassRC({...base,charging:false,t:0});near(x.v,5);
 const crossing=bypassRC({...base,charging:false,t:x.tCross});near(crossing.v,.6,1e-9);
 near(bypassRC({...base,t:.1}).v,5*(1-Math.exp(-1)));
});
