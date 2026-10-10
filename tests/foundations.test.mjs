import test from 'node:test';
import assert from 'node:assert/strict';
import {thevenin,diode,thermal,VT,IS} from '../src/engine/foundations.mjs';
const near=(actual,expected,tol=1e-9)=>assert.ok(Math.abs(actual-expected)<tol,`${actual} != ${expected}`);
test('two-source network matches independent nodal solution and conserves power',()=>{
 for(const v1 of [4,12,20])for(const v2 of [0,3,6])for(const rl of [1000,4000,20000,Infinity]){
 const d=thevenin({v1,v2,r1:3000,r2:6000,rl});
 const direct=(v1/3000+v2/6000)/(1/3000+1/6000+(rl===Infinity?0:1/rl));
 near(d.out,direct);near(d.i1+d.i2,d.il);
 near(v1*d.i1+v2*d.i2,d.i1*d.i1*3000+d.i2*d.i2*6000+d.out*d.il);
 }
 const d=thevenin({v1:12,v2:3,r1:3000,r2:6000,rl:4000});near(d.vth,9);near(d.rth,2000);near(d.out,6);
});
test('diode tangent agrees with central finite difference of the full exponential',()=>{
 for(const iq of [1e-5,.001,.01]){
 const d=diode({iq});const h=1e-7;
 const iv=v=>IS*Math.expm1(v/VT);
 near((iv(d.vq+h)-iv(d.vq-h))/(2*h),1/d.rd,1e-8);
 near(diode({iq,dv:0}).exact,0);
 assert.ok(diode({iq,dv:.02}).error>diode({iq,dv:.001}).error);
 }
 near(diode({iq:.001}).rd,25.85,1e-6);
});
test('thermal initial condition, steady state, and differential energy balance',()=>{
 const args={current:.05,resistance:100,theta:100,capacity:2,ambient:25};
 near(thermal({...args,time:0}).temperature,25);
 const d=thermal({...args,time:400});near(d.power,.25);near(d.tau,200);near(d.steady,50);near(d.temperature,46.61661791908468);
 const h=.001;
 const slope=(thermal({...args,time:400+h}).temperature-thermal({...args,time:400-h}).temperature)/(2*h);
 near(args.capacity*slope,d.power-(d.temperature-args.ambient)/args.theta);
 near(thermal({...args,current:0,time:100}).temperature,25);
 near(thermal({...args,capacity:4,time:400}).steady,d.steady);
});
test('reject unphysical model inputs',()=>{
 assert.throws(()=>thevenin({v1:1,v2:2,r1:0,r2:1}));
 assert.throws(()=>diode({iq:0}));
 assert.throws(()=>thermal({current:1,resistance:1,theta:1,capacity:0,ambient:25,time:0}));
});

