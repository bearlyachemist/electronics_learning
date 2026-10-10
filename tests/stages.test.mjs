import test from 'node:test';
import assert from 'node:assert/strict';
import {mirror,mirrorRout,diffPair,diffGains,pushPull,pushPullCycle,compound,sharing,nodal,follower,ceFrequency} from '../src/engine/stages.mjs';
import {C,mag,phase,div} from '../src/engine/ac.mjs';
import {VT300} from '../src/engine/bjt.mjs';
const near=(a,b,tol=1e-6)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),a+' vs '+b);

test('mirror errors match their closed forms with the Early effect removed',()=>{
 const base={va:Infinity,beta:100,vout:5};
 const b=mirror({...base});near(b.iout/b.iref,1/(1+2/100),1e-6);
 const h=mirror({...base,type:'helper'});near(h.iout/h.iref,1/(1+2/(100*101)),2e-4);
 const w=mirror({...base,type:'wilson'});near(w.iout/w.iref,1-2/(100*100+2*100+2),2e-4);
 // Widlar: I_out R = V_T ln(I_ref/I_out) for large beta.
 const wd=mirror({va:Infinity,beta:1e6,type:'widlar',re:5e3,r:14.3e3});near(wd.iout*5e3,VT300*Math.log(wd.ic1/wd.iout),1e-4);
 // Area ratio 3 gives three times the current.
 near(mirror({va:Infinity,beta:1e6,area:3}).iout/mirror({va:Infinity,beta:1e6}).iref,3,1e-4);
});
test('Early effect: basic mirror error ~ (Vout − VBE)/VA; degeneration and Wilson raise output resistance',()=>{
 const m=mirror({vout:10,beta:1e6});near(m.iout/m.iref,1+(10-m.vb)/100,.01);
 const rb=mirrorRout({}),rd=mirrorRout({re:1e3}),rw=mirrorRout({type:'wilson'});
 near(rb,100/mirror({}).iout,.06);assert.ok(rd>10*rb);assert.ok(rw>20*rb);
});
test('differential pair: tanh law, current conservation and degeneration',()=>{
 for(const vd of [-.1,-.02,0,.01,.05]){const d=diffPair({vd});near(d.i1+d.i2,1e-3);near(d.i1-d.i2,1e-3*Math.tanh(vd/(2*VT300)),1e-9);}
 const d=diffPair({vd:.05,re:1e3});near(VT300*Math.log(d.i1/d.i2)+(d.i1-d.i2)*1e3,.05,1e-9);
 const g=diffGains({itail:1e-3,rc:10e3,rtail:10e3});near(g.ad,10e3/(2*2*VT300/1e-3));assert.ok(g.cmrr>150&&g.cmrr<250);
 near(diffGains({}).activeLoad,100/(2*VT300));
});
test('push–pull: class B crossover, AB bias current, feedback, efficiency bound',()=>{
 assert.ok(Math.abs(pushPull({vin:.2}).vout)<.01);near(pushPull({vin:5}).vout,5-.5,.06);
 const b=pushPullCycle({amp:3,mode:'B'}),ab=pushPullCycle({amp:3,mode:'AB',re:.47}),fb=pushPullCycle({amp:3,mode:'feedback'});
 assert.ok(ab.thd<b.thd/3&&fb.thd<b.thd/3,'thd '+[b.thd,ab.thd,fb.thd]);assert.ok(ab.quiescent>1e-3);
 const full=pushPullCycle({amp:15,mode:'B',vsat:.0001,n:512});assert.ok(full.efficiency<Math.PI/4+.01&&full.efficiency>.6,'eff '+full.efficiency);
 for(const c of [b,ab,fb])assert.ok(c.pSupply>=c.pLoad);
});
test('compound pairs: Darlington gain ~ beta1·beta2; both pairs saturate near V_BE + V_CE(sat); Sziklai needs one V_BE in',()=>{
 const d=compound({type:'darlington',ib:2e-6,rc:12});near(d.gain,150*51+150,.08);
 const ds=compound({type:'darlington',ib:2e-3,rc:12}),ss=compound({type:'sziklai',ib:2e-3,rc:12}),s1=compound({type:'single',ib:40e-3,rc:12});
 assert.ok(ds.vce>.6&&ds.vce<1,'darl '+ds.vce);assert.ok(ss.vce>.6&&ss.vce<1,'szik '+ss.vce);assert.ok(s1.vce<.3);
 assert.ok(ds.vin>1.2&&ss.vin<.85,'inputs '+ds.vin+' '+ss.vin);
});
test('paralleled transistors: ballast resistors equalize; thermal runaway without them',()=>{
 const same=sharing({dvbe:0});near(same.i1,same.i2,1e-6);
 const bare=sharing({re:0,theta:.5,vce:10}),bal=sharing({re:.5,theta:.5,vce:10});
 assert.ok(bal.ratio<bare.ratio,'ratio '+bare.ratio+' '+bal.ratio);
 assert.ok(sharing({re:0,theta:8,vce:10}).hogging);assert.ok(!sharing({re:.5,theta:8,vce:10}).hogging);
});
test('nodal solver and frequency models',()=>{
 // RC low-pass by nodal analysis equals 1/(1 + jωRC).
 const w=2*Math.PI*1000,v=nodal(1,[{type:'i',node:1,value:1/1000},{type:'y',a:1,b:0,y:C(1/1000,w*1e-7)}]);near(mag(v[1]),1/Math.hypot(1,w*1e-4),1e-9);
 const plain=follower({}),boot=follower({bootstrapped:true});assert.ok(mag(boot.zin)>10*mag(plain.zin));near(mag(plain.gain),7500/(7500+VT300/1e-3),1e-3);
 const lo=ceFrequency({hz:1}),g0=mag(lo.gain);near(g0,lo.gm*10e3*lo.rpi/(lo.rpi+1e3),1e-3);
 // Exact −3 dB frequency close to the Miller estimate.
 let f=1;for(const hz of Array.from({length:400},(_,k)=>10**(3+5*k/400)))if(mag(ceFrequency({hz}).gain)>g0/Math.SQRT2)f=hz;
 assert.ok(f/lo.millerPole>.7&&f/lo.millerPole<1.3,'f '+f+' miller '+lo.millerPole);
 assert.ok(mag(ceFrequency({hz:f*3,cascode:true}).gain)>2*mag(ceFrequency({hz:f*3}).gain));
});
