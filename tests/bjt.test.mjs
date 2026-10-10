import test from 'node:test';
import assert from 'node:assert/strict';
import {bjtPhysics,earlyVoltage,vbeTemperature,ebersMoll,solveStage,outputCurve,simpleSwitch,follower,dividerBias,baseResistorBias,smallSignal,ceGain,phaseSplitter,VT300} from '../src/engine/bjt.mjs';
const near=(a,b,tol=1e-6)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),a+' vs '+b);

test('short-base physics: beta from emitter efficiency and transport, 60 mV per decade, Early effect',()=>{
 const d=bjtPhysics();assert.ok(d.beta>150&&d.beta<350,'beta '+d.beta);
 near(d.alpha,d.beta/(d.beta+1),1e-3);near(d.ic/d.ib,d.beta);
 // Charge-control check: collector current = stored base charge / transit time.
 near(d.charge/d.tauF,d.ic,1e-9);
 const up=bjtPhysics({vbe:.65+VT300*Math.log(10)});near(up.ic/d.ic,10,.01);
 assert.ok(bjtPhysics({vcb:20}).w<d.w&&bjtPhysics({vcb:20}).ic>d.ic);
 const va=earlyVoltage();assert.ok(va>10&&va<1000,'VA '+va);
 assert.ok(bjtPhysics({wb:.4e-6}).beta>d.beta);
});
test('V_BE temperature coefficient near -2.1 mV/K',()=>{
 const slope=(vbeTemperature({t:301})-vbeTemperature({t:299}))/2;near(slope,-2.13e-3,.01);near(vbeTemperature({t:300}),.65);
});
test('Ebers–Moll stage satisfies KVL/KCL in cutoff, active and saturation',()=>{
 for(const vbb of [0,1,2,5])for(const rc of [0,1e3,10e3]){
  const p={vbb,rb:47e3,vcc:10,rc,re:220},d=solveStage(p);
  near(d.ie,d.ic+d.ib,1e-9);near(p.vbb-d.ib*p.rb,d.vb,1e-9);near(d.vb-d.vbe,d.ve,1e-6);near(d.ve,d.ie*p.re,1e-6);near(d.vc,p.vcc-d.ic*p.rc,1e-6);
  const em=ebersMoll({vbe:d.vbe,vbc:d.vbc});near(em.ic,d.ic,1e-9);
 }
 assert.equal(solveStage({vbb:0,rb:1e4,vcc:10,rc:1e3}).region,'cutoff');
 assert.equal(solveStage({vbb:1.5,rb:1e5,vcc:10,rc:1e3}).region,'active');
 const sat=solveStage({vbb:5,rb:1e3,vcc:10,rc:1e3});assert.equal(sat.region,'saturation');assert.ok(sat.vce>0&&sat.vce<.3,'vce '+sat.vce);
});
test('active-region current gain and Early slope',()=>{
 const a=outputCurve({ib:10e-6,vce:5}),b=outputCurve({ib:10e-6,vce:10});
 near(a.ib,10e-6,1e-3);near(a.ic/a.ib,150*(1+5/100),.02);
 near((b.ic-a.ic)/5,a.ic/(100+5),.03);
});
test('simple models: switch saturation, follower clipping, bias stability',()=>{
 const s=simpleSwitch({vin:5,rb:4.3e3,vcc:12,rc:120,beta:100});assert.equal(s.region,'saturation');near(s.ic,11.8/120);
 const f=follower({vin:-15,re:1e3,rl:1e3,vee:10});near(f.out,-5);assert.equal(f.on,false);near(follower({vin:3}).out,2.35);
 const lo=dividerBias({beta:50}),hi=dividerBias({beta:500});assert.ok(hi.ic/lo.ic<1.25);
 const blo=baseResistorBias({beta:50}),bhi=baseResistorBias({beta:500});assert.ok(bhi.saturated&&!blo.saturated);
 near(dividerBias({temp:75}).vbe,.545);
});
test('small-signal relations and stage gains',()=>{
 const s=smallSignal({ic:1e-3});near(s.re,VT300/1e-3);near(s.gm*s.re,1);near(s.rpi,100*s.re);near(s.ro,1e5);
 const g=ceGain({ic:1e-3,rc:10e3,re:1e3});near(g.gain,-10e3/(1e3+s.re));near(g.zin,101*(1e3+s.re));
 near(ceGain({ic:1e-3,rc:10e3,re:1e3,bypassed:true}).gain,-10e3*1e-3/VT300);
 const p=phaseSplitter({rc:4.7e3,re:4.7e3});assert.ok(Math.abs(p.collector+p.emitter)<1e-12);assert.ok(p.emitter<1&&p.emitter>.99);
});
test('saturation voltage matches the closed-form Ebers–Moll expression',()=>{
 for(const ib of [.3e-3,1e-3,3e-3]){
  const d=solveStage({vbb:ib*1e6+.7,rb:1e6,vcc:12,rc:1200,betaF:150,betaR:2,va:Infinity}),fb=d.ic/d.ib,ar=2/3;
  assert.equal(d.region,'saturation');near(d.vce,VT300*Math.log((1/ar+fb/2)/(1-fb/150)),1e-4);
 }
});

test('follower with source resistance conserves emitter current and base-drive voltage',()=>{
 for(const vin of [-12,-3,0,5])for(const rs of [0,1e3,10e3]){
  const re=1e3,rl=2e3,vee=10,beta=100,d=follower({vin,re,rl,vee,beta,rs});
  const ie=(d.out+vee)/re+d.out/rl;
  near(d.iout,ie,1e-9);
  if(d.on)near(vin-ie/(beta+1)*rs-d.out,.65,1e-9);
  else near(ie,0,1e-9);
 }
 assert.ok(follower({vin:3,rs:10e3}).out<follower({vin:3,rs:0}).out);
});
