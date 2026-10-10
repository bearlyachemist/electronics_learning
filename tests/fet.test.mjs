import test from 'node:test';
import assert from 'node:assert/strict';
import {channel,jfet,selfBias,stage,gateLoading,bodyThreshold,wien,switchLoss,sharing,gateTrace} from '../src/engine/fet.mjs';
const close=(a,b,t=1e-9)=>assert.ok(Math.abs(a-b)<t, a+' != '+b);
test('MOS region boundaries are continuous and cutoff is zero',()=>{
 close(channel(3,1,.004,2).id,.002);
 close(channel(3,1-1e-7,.004,2).id,channel(3,1+1e-7,.004,2).id,1e-8);
 close(channel(1,8,.004,2).id,0);
 assert.equal(channel(3,.1,.004,2).region,'ohmic');
});
test('gm and gds match finite difference in both conducting regions',()=>{
 for(const d of [.3,3]){const m=channel(3,d,.004,2,.02),h=1e-6;
 close(m.gm,(channel(3+h,d,.004,2,.02).id-channel(3-h,d,.004,2,.02).id)/(2*h));
 close(m.gds,(channel(3,d+h,.004,2,.02).id-channel(3,d-h,.004,2,.02).id)/(2*h));}
});
test('JFET normalized values and reverse-gate domain',()=>{
 close(jfet(0,8).id,.008);close(jfet(-2,8).id,.002);close(jfet(-2,8).gm,.002);
 close(jfet(-4,8).id,0);assert.throws(()=>jfet(.1,8),RangeError);
});
test('self bias satisfies KVL and channel law across compliance',()=>{
 for(const vdd of [3,12,20])for(const rs of [0,500,2000])for(const rd of [0,100,1000,4000]){
 const b=selfBias({vdd,rs,rd});close(b.vds+b.id*(rs+rd),vdd);
 close(b.vgs,-b.id*rs);close(b.id,jfet(b.vgs,b.vds).id);
 assert.ok(b.vds>=0&&b.id>=0);
 }
 close(selfBias({rs:1000,rd:3300,vdd:15}).id,.002);
 assert.equal(selfBias({vdd:3,rs:500,rd:4000}).region,'ohmic');
});
test('gain degeneration and follower limits',()=>{
 close(stage(.002,3300,100000,1000).gain,-2.129719264,1e-8);
 assert.ok(Math.abs(stage(.002,3300,100000,1000).gain)<Math.abs(stage(.002,3300,100000,0).gain));
 close(stage(.004,4000,4000).follower,8/9);
 assert.ok(bodyThreshold(1,.5,.6,2)>1);
});
test('Wien network peaks at one third with zero phase',()=>{
 const f=1/(2*Math.PI*1e4*1e-8),p=wien(f,1e4,1e-8);
 close(p.magnitude,1/3);close(p.phase,0);
 assert.ok(wien(f*.1,1e4,1e-8).phase>0);
 assert.ok(wien(f*10,1e4,1e-8).phase<0);
});
test('switching power scales correctly and gate loss stays separate',()=>{
 const p=switchLoss({r:.024});close(p.conduction,.3);close(p.overlap,.3);close(p.driver,.03);
 close(switchLoss({f:200000}).overlap,2*p.overlap);
});
test('parallel branches conserve current and share according to resistance',()=>{
 const a=sharing(20,.02,.03);close(a.i1,12);close(a.i2,8);
 const b=sharing(20,.02,.03,100);close(b.i1+b.i2,20);assert.ok(b.i1<a.i1);
 const c=sharing(20,.02,.03,25,25,.004,.03);assert.ok(Math.abs(c.i1-c.i2)<Math.abs(a.i1-a.i2));
});
test('charge trace is continuous at both plateau boundaries',()=>{
 close(gateTrace(8,8,10,30),4);close(gateTrace(18,8,10,30),4);
 close(gateTrace(30,8,10,30),10);close(gateTrace(0,8,10,30),0);
});


test('gate loading equals incremental charge at both capacitor terminals',()=>{
 for(const rs of [0,470,2000]){
 const gm=.004,rd=4700,rl=10000,cgs=10e-12,cgd=3e-12,vg=.001;
 // Independently solve DC incremental source/drain voltages from KCL.
 const id=gm*vg/(1+gm*rs),vs=id*rs,vd=-id/(1/rd+1/rl);
 const charge=cgs*(vg-vs)+cgd*(vg-vd),d=gateLoading({gm,rd,rl,rs,cgs,cgd});
 close(d.cin,charge/vg,1e-22);
 }
 const boot=gateLoading({gm:.004,rd:4700,rl:10000,rs:470,cgs:10e-12,cgd:0});
 assert.ok(boot.cin<10e-12,'source motion must reduce gate-source loading');
});
