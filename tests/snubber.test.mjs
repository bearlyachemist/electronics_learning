import test from 'node:test';
import assert from 'node:assert/strict';
test('two-period parasitic extraction reconstructs three independent capacitor measurements',()=>{
 const lp=12.665147955292222e-9,cp=200e-12;
 const t1=2*Math.PI*Math.sqrt(lp*cp);
 for(const added of [200e-12,600e-12,1e-9]){
  const t2=2*Math.PI*Math.sqrt(lp*(cp+added));
  const l=(t2*t2-t1*t1)/(4*Math.PI**2*added),c=added/((t2/t1)**2-1);
  assert.ok(Math.abs(l/lp-1)<1e-12);assert.ok(Math.abs(c/cp-1)<1e-12);
 }
});
test('RC edge-loss integration gives half CV squared for each charge event',()=>{
 const c=600e-12,v=12,n=50000;
 for(const r of [1,4,10]){
  const dt=20*r*c/n;let energy=0;
  for(let j=0;j<n;j++){const t=(j+.5)*dt,i=v/r*Math.exp(-t/(r*c));energy+=i*i*r*dt;}
  assert.ok(Math.abs(energy/(.5*c*v*v)-1)<1e-7);
 }
});
