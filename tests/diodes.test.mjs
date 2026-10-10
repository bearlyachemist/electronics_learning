import test from 'node:test';
import assert from 'node:assert/strict';
import {junction,diodePoint,rectifier,zener,regulator,limiter,flyback} from '../src/engine/diodes.mjs';
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol*Math.max(1,Math.abs(b)),a+' vs '+b);
test('depletion charge neutrality, voltage triangle, and differential capacitance',()=>{
 const na=1e22,nd=4e22,area=1e-8,d=junction({na,nd,area,bias:-3});
 near(na*d.xp,nd*d.xn);near(d.field*d.width/2,d.built+3);
 const h=.0001,q=1.602176634e-19;
 const charge=v=>q*na*area*junction({na,nd,area,bias:-v}).xp;
 assert.ok(Math.abs((charge(3+h)-charge(3-h))/(2*h)/d.capacitance-1)<1e-7);
 assert.ok(junction({bias:-5}).width>junction().width);
});
test('diode operating point satisfies both physical law and KVL across controls',()=>{
 for(const vs of [0,.1,5,10])for(const r of [100,1000,10000])for(const n of [1,1.5,2]){
 const d=diodePoint({vs,r,n});near(d.voltage+r*d.current,vs);
 near(1e-12*Math.expm1(d.voltage/(n*.025852)),d.current,1e-12);
 assert.ok(d.voltage>=0&&d.voltage<=vs);assert.ok(d.current>=0);
 }
});
test('rectifier periodic charge balance, complementarity and timestep convergence',()=>{
 for(const bridge of [true,false]){
 const cfg={bridge,rl:500,c:470e-6},d=rectifier(cfg),last=d.points.slice(1001);
 const dt=1/50000,net=last.reduce((sum,p)=>sum+(p.current-p.v/500)*dt,0);
 near(net,470e-6*(last.at(-1).v-d.points[1000].v),1e-12);
 assert.ok(Math.abs(net)<1e-8);
 for(const p of last){assert.ok(p.v>=0&&p.current>=0);if(p.current>0)near(p.drive-p.v,10*p.current);else assert.ok(p.drive<=p.v+1e-10);}
 const finer=rectifier({...cfg,steps:2000});
 assert.ok(Math.abs(finer.ripple-d.ripple)<.003);assert.ok(Math.abs(finer.mean-d.mean)<.01);
 assert.ok(d.peakCurrent>d.mean/500);
 }
 assert.ok(rectifier({bridge:false}).ripple>rectifier({bridge:true}).ripple);
});
test('zener KCL and power balance in regulated and unregulated states',()=>{
 for(const vin of [4,9,18])for(const load of [0,.01,.04]){
 const d=zener({vin,load});const actualLoad=d.out>0?load:d.feed;
 near(d.feed,d.iz+actualLoad);near(vin*d.feed,d.pr+d.pz+d.out*actualLoad);
 }
 near(zener({vin:12,load:.01}).iz,(12-5.1)/330-.01);
 assert.equal(zener({vin:4,load:.04}).out,0);
});
test('series regulator dropout and thermal example',()=>{
 near(regulator({vin:5.3}).out,4.8);
 const d=regulator({vin:12,load:.25,theta:50,ambient:40});near(d.power,1.75);near(d.tj,127.5);
});
test('limiter preserves unclipped signal and signed current paths',()=>{
 near(limiter({vin:2,r:4700}).out,2);near(limiter({vin:10,r:4700}).current,6.4/4700);
 near(limiter({vin:-10,r:4700}).out,-.3);near(limiter({vin:-10,r:4700}).current,-9.7/4700);
});
test('flyback obeys ODE, one-way stop, and independently integrated energy',()=>{
 for(const clamp of [.7,24,36]){
 const d=flyback({clamp}),t=d.stop*.3,h=1e-9;
 const i=flyback({clamp,t}).current,slope=(flyback({clamp,t:t+h}).current-flyback({clamp,t:t-h}).current)/(2*h);
 near(.1*slope+120*i+clamp,0,1e-7);assert.equal(flyback({clamp,t:d.stop*1.01}).current,0);
 let ec=0,er=0;const steps=10000,dt=d.stop/steps;
 for(let k=0;k<steps;k++){const v=flyback({clamp,t:(k+.5)*dt}).current;ec+=clamp*v*dt;er+=120*v*v*dt;}
 near(ec,d.clampEnergy,1e-10);near(ec+er,d.energy,1e-10);
 }
 assert.ok(flyback({clamp:24}).stop<flyback().stop);
});
test('invalid physical parameters fail explicitly',()=>{
 assert.throws(()=>junction({bias:2}),RangeError);assert.throws(()=>diodePoint({r:0}),RangeError);
 assert.throws(()=>rectifier({c:0}),RangeError);assert.throws(()=>flyback({clamp:0}),RangeError);
});

