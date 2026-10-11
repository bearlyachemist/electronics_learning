import test from 'node:test';
import assert from 'node:assert/strict';
import {bias,mirror,csGain,follower,commonGate,cascode,differential} from '../src/engine/mos-analog.mjs';
import {channel} from '../src/engine/fet.mjs';
const close=(a,b,t=1e-8)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
test('MOS bias intersects the load line and satisfies the channel law in all regions',()=>{
 for(const vg of [.5,1.5,2.5,4.5])for(const rs of [0,500]){
  const p=bias({vg,rs,rd:2000,gamma:.4,lambda:.03});
  close(p.vds+p.id*(2000+rs),5);close(p.vgs+p.id*rs,vg);
  close(p.id,channel(p.vgs,p.vds,.002,p.vth,.03).id);
 }
});
test('MOS mirror ratio, matched drain voltages and lost compliance',()=>{
 const p=mirror({lambda:0,ratio:3});close(p.id,.003);
 const ref=mirror();close(mirror({vout:ref.vref}).id,.001);
 assert.ok(mirror({vout:.1}).id<.001);assert.equal(mirror({vout:.1}).region,'ohmic');
 for(const rs of [100,500]){const m=mirror({rs,vout:3});close(m.id,channel(m.vref-m.id*rs,3-m.id*rs,.002,1,.02).id);}
});
test('CS gain agrees with independently differenced DC points including bulk effect',()=>{
 for(const rs of [0,300,1000]){const args={vg:2,rd:2000,rs,gamma:.4,lambda:.03};const p=bias(args),h=1e-5;
  assert.equal(p.region,'saturation');const derivative=(bias({...args,vg:args.vg+h}).vd-bias({...args,vg:args.vg-h}).vd)/(2*h);
  close(csGain({gm:p.gm,gmb:p.gmb,gds:p.gds,rd:2000,rs}),derivative,1e-6);
 }
});
test('follower gain matches DC slope, has nonzero output resistance and rejects impossible bias',()=>{
 const args={vg:3,ibias:.0002,rl:10000,gamma:.4,lambda:.03},p=follower(args),h=1e-5;
 close(p.id,.0002+p.vs/10000);close(p.gain,(follower({...args,vg:3+h}).vs-follower({...args,vg:3-h}).vs)/(2*h),1e-6);
 assert.ok(p.rout>0);assert.equal(follower({vg:.5,ibias:.001}).valid,false);
});
test('common gate and cascode meet node KCL for independent voltage test',()=>{
 const gm=.002,go=.00002,r=10000,p=commonGate({gm,gds:go,rd:r});
 close(p.gain/r+go*(p.gain-1)-gm,0);close(1/p.rin,gm+go-go*p.gain);
 const c=cascode({gm1:gm,gm2:gm,ro1:1/go,ro2:1/go});
 const x=go/(gm+2*go),outCurrent=go*(1-x)-gm*x;close(c.rout,1/outCurrent,1e-4);
});
test('differential pair conserves tail current, follows gate KVL, and flags invalid headroom',()=>{
 for(const rs of [0,500])for(const vdiff of [-3,-.8,0,.8,3]){
  const p=differential({rs,vdiff});close(p.i1+p.i2,.002);
  if(p.i1&&p.i2)close(Math.sqrt(2*p.i1/.002)-Math.sqrt(2*p.i2/.002)+(p.i1-p.i2)*rs,vdiff);
  close(p.out,p.d2-p.d1);
 }
 const h=1e-6,p=differential();close((differential({vdiff:h}).out-differential({vdiff:-h}).out)/(2*h),p.gmDiff*1000,1e-6);
 assert.equal(differential({vc:.8}).valid,false);assert.equal(differential({vc:5.2}).valid,false);
});
