import test from 'node:test';
import assert from 'node:assert/strict';
import {shortDipole} from '../src/engine/antennas.mjs';
const close=(a,b,t=1e-10)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
test('short dipole integrates its current distribution and conserves accepted power',()=>{
 const p=shortDipole(),u=shortDipole({distribution:'uniform'});
 // Independently integrate the far-field power over solid angle using midpoint quadrature.
 const eta=120*Math.PI,I=2,length=.15,lambda=3e8/27e6,n=10000;
 let power=0;
 for(let j=0;j<n;j++){
  const theta=(j+.5)*Math.PI/n;
  const field=eta*I*(length/2)*Math.sin(theta)/(2*lambda);
  power+=field**2/(2*eta)*2*Math.PI*Math.sin(theta)*Math.PI/n;
 }
 close(power/(I**2/2),p.radiationResistance,1e-9);
 close(u.radiationResistance,4*p.radiationResistance);
 close(p.efficiency*(p.radiationResistance+3),p.radiationResistance);
 for(const loss of [.03,.3,3]){
  const a=shortDipole({loss,gamma:.5});
  close(a.realizedGain/a.gain,.75);
  assert.ok(a.efficiency>0&&a.efficiency<1);
 }
 close(shortDipole({loss:0}).efficiency,1);
 close(shortDipole({gamma:1}).realizedGain,0);
 assert.equal(shortDipole({length:.5,frequency:100e6}).valid,false);
});
test('short dipole rejects unsupported distributions and nonphysical inputs',()=>{
 for(const x of [{length:0},{frequency:NaN},{loss:-1},{gamma:1.1},{distribution:'half-wave'}])assert.throws(()=>shortDipole(x),RangeError);
});
