import test from 'node:test';
import assert from 'node:assert/strict';
import {divider,toleranceBounds} from '../src/engine/divider.mjs';
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-10, `${a} != ${b}`);
test('unloaded divider and independent loaded hand calculation',()=> {
 near(divider({vin:10,r1:10000,r2:10000}).out,5);
 near(divider({vin:10,r1:10000,r2:10000,rl:10000}).out,10/3);
});
test('KCL, energy conservation and Thevenin equivalence across scales',()=>{
 for (const r1 of [100,4700,1000000]) for (const r2 of [220,10000,470000]) for (const rl of [100,10000,1e7,Infinity]) {
 const d=divider({vin:12,r1,r2,rl});
 near(d.i1,d.i2+d.il);
 near(12*d.i1,d.p1+d.p2+d.pl);
 near(d.out,rl===Infinity?d.vth:d.vth*rl/(d.rth+rl));
 }
});
test('loading limits and equal resistor tolerance corners',()=>{
 near(divider({vin:10,r1:10000,r2:10000,rl:1e-9}).out,0);
 const b=toleranceBounds(10,10000,10000,.01); near(b.min,4.95); near(b.max,5.05);
});
test('reject invalid values',()=>{assert.throws(()=>divider({vin:10,r1:0,r2:100}));});

