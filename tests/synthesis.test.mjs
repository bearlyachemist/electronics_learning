import test from 'node:test';
import assert from 'node:assert/strict';
import katex from 'katex';
import studies from '../src/content/synthesis.json' with {type:'json'};
import {chapters} from '../src/curriculum/chapters.ts';
import {bias,diodeVoltage,csGain,commonGate} from '../src/engine/mos-analog.mjs';
import {closedLoop,sallenKey,tia} from '../src/engine/opamp.mjs';
const kb=1.380649e-23,T=300,ut=.02585;
const n=s=>Number(s.replaceAll('−','-').match(/[-+]?\d+(?:\.\d+)?/)[0]);
function check(id,column,expected,scale=1){
 const rows=studies[id].rows;assert.equal(rows.length,3);
 expected.forEach((e,i)=>{
  if(e===null)return;
  const factor=Array.isArray(scale)?scale[i]:scale,text=rows[i][column].replaceAll('−','-');
  const literal=text.match(/[-+]?\d+(?:\.\d+)?/)[0],decimals=(literal.split('.')[1]||'').length;
  const got=n(text)*factor,rounding=.500001*10**(-decimals)*factor;
  assert.ok(Math.abs(got-e)<=Math.max(rounding,Math.abs(e)*1e-9,1e-12),`${id} row ${i+1}: ${got} differs from ${e} beyond displayed rounding`);
 });
}

test('every chapter has an original synthesis study, three cases, strict math and valid cross-links',()=>{
 assert.deepEqual(Object.keys(studies).sort(),chapters.map(c=>c.id).sort());
 const hrefs=new Set(chapters.map(c=>c.href));
 for(const [id,s] of Object.entries(studies)){
  assert.equal(s.rows.length,3,id);assert.ok(s.title&&s.setup&&s.analysis.length>=2&&s.limits&&s.sources,id);
  for(const row of s.rows)assert.equal(row.length,s.columns.length,id);
  for(const [href] of s.connections)assert.ok(hrefs.has(href),`${id}: ${href}`);
  katex.renderToString(s.equation,{throwOnError:true});
  for(const text of [s.setup,...s.analysis,s.limits,...s.columns,...s.rows.flat()]){
   assert.ok(!/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(text),`${id}: invalid control character`);
   for(const m of text.matchAll(/\$([^$]+)\$/g))katex.renderToString(m[1],{throwOnError:true});
  }
 }
});

test('foundation and passive design-case arithmetic follows charge, energy and exact response laws',()=>{
 check('dividers',2,[1e4,1e5,1e6].map(r=>Math.log(8192)*r/2*20e-12),1e-6);
 check('thevenin',1,[1000,2000,10000].map(r=>8*r/(r+2000/3)));
 check('small-signal',1,[.0001,.001,.01].map(i=>ut/i));
 check('power',1,[.01,.1,.5].map(d=>d*400/100),[.001,.001,1]);
 check('capacitors',1,[1e-6,10e-6,100e-6].map(c=>.02*100e-6/c));
 check('rc-circuits',2,[.01,.001,1/131072].map(e=>10e-6*Math.log(1/e)),1e-6);
 check('differentiators',1,[1e-6,10e-6,100e-6].map(t=>10e-6/t*(1-Math.exp(-t/10e-6))));
 check('integrators',1,[1,10,100].map(x=>x/Math.hypot(1,x)));
 check('real-capacitors',1,[1e4,1/(2*Math.PI*Math.sqrt(5e-9*10e-6)),1e7].map(f=>Math.hypot(.1,2*Math.PI*f*5e-9-1/(2*Math.PI*f*10e-6))));
 check('inductors',1,[.0005,.001,.002].map(t=>12*t/.1),.001);
 check('transformers',1,[10,100,1000].map(r=>4/r),[1,.001,.001]);
 check('semiconductors',2,[0,3,10].map(v=>{const c=100e-12/Math.sqrt(1+v/.7)+20e-12;return 1/(2*Math.PI*Math.sqrt(10e-6*c));}),1e6);
 check('diodes',1,[.5,.7,.9].map(v=>(5-v)/430),.001);
 check('rectifiers',1,[470e-6,.001,.0022].map(c=>.05/(100*c)));
 check('regulators',1,[.03,.3,.7],[.001,.001,.001]);
 check('diode-applications',1,[20e-6,100e-6,500e-6].map(rc=>1-Math.exp(-5e-6/rc)),.01);
 check('diode-protection',1,[.7,12,24].map(v=>.05*.1/v),.001);
 check('protection-circuits',1,[0,.5,1]);
});

test('AC and BJT design-case arithmetic includes loading, nonlinear steering and feedback',()=>{
 check('phasors',1,[1e3,1e4,1e5].map(f=>-360*f*2e-6));
 check('impedance',2,[.001,0,0],[.001,1,1]);
 check('reactive-power',2,[0,22e-6,750/(2*Math.PI*50*230**2)].map(c=>Math.hypot(1000,750-2*Math.PI*50*c*230**2)/230));
 check('rc-filters',1,[1000/Math.sqrt(10**.05-1),20000/Math.sqrt(10**3-1),null],1000);
 check('poles',1,[.1,1,10].map(x=>1/Math.hypot(1-x*x,3*x)));
 check('resonance',1,[10,100,Math.sqrt(.01/1e-7)].map(r=>Math.sqrt(.01/1e-7)/r));
 check('ac-thevenin',2,[1e-6,10e-6,10e-6].map(c=>.05*1e-6/c),.001);
 check('transistor-physics',2,[.99,.995,.999].map(a=>a*a/(1-a*a)));
 check('bjt',1,[10,20,50].map(b=>.12/b),.001);
 check('emitter-follower',1,[0,10000,100000].map(r=>(100/.03868+r)/101));
 check('bjt-biasing',1,[50,100,200].map(b=>1.3/(1000+10000/(b+1))),.001);
 check('bjt-small-signal',1,[0,100,1000].map(r=>-.03868*4000/(1+.03868*r)));
 check('current-sources',1,[50000,500000,5000000].map(r=>6/r),1e-6);
 check('common-emitter',1,[.0005,.001,.0015].map(i=>10-i*4000));
 check('transconductance',1,[.0001/ut,2*.0001/.1,2*.0001/.4],.001);
 check('ebers-moll',2,[.99/.01,.5/.5,null]);
 check('current-mirrors',1,[1,4,9].map(N=>1/(1+(N+1)/100)));
 check('differential-amplifiers',1,[.001,.01,.05].map(v=>.0002*Math.tanh(v/(2*ut))),1e-6);
 check('push-pull',2,[2,20/Math.PI,10].map(v=>20*v/(Math.PI*8)-v*v/16));
 check('darlington',1,[.001,.1/5150,null],[.001,1e-6,1]);
 check('bootstrapping',2,[1e6,1e7,100000/Math.hypot(1-.99*Math.cos(Math.PI/18),.99*Math.sin(Math.PI/18))],[1e6,1e6,1000]);
 check('current-sharing',1,[0,.1,.5].map(r=>.01/(r+ut)),[1,.001,.001]);
 check('miller-effect',1,[-1,-10,-100].map(a=>10+2*(1-a)));
 check('negative-feedback',1,[9,99,999].map(t=>1/(1+t)),.01);
 check('transistor-feedback',1,[.01,.02,.04].map(g=>-g*5000/(1+g*500)));
 check('regulated-supplies',1,[10e-6,47e-6,220e-6].map(c=>.1*20e-6/c),.001);
 check('temperature-control',1,[30,40,50].map(t=>.2*(t-20)));
 check('bjt-logic',1,[1,3,5].map(N=>(5+.47*N*.7)/(1+.47*N)));
});

test('FET cases enforce headroom, sampled acquisition and converter mode assumptions',()=>{
 check('fet-physics',1,[.1,.5,1.5].map(d=>d<1?.002*(d-d*d/2):.001),.001);
 check('jfet-bias',1,[[.004,2],[.008,2],[.008,4]].map(([iss,p])=>{const a=iss*1e6/(p*p),b=-2*iss*1000/p-1,c=iss;return(-b-Math.sqrt(b*b-4*a*c))/(2*a);}),.001);
 check('jfet-amplifiers',1,[.001,.002,.004].map(g=>-g*10000/(1+g*1000)));
 check('fet-dynamics',1,[1e-12,100e-12,10e-9].map(i=>i*1e7),[1e-6,.001,.001]);
 check('fet-switches',1,[10e-6/(1000*Math.log(8192)),1e-9*.001/.001,null],1e-9);
 check('mosfet-physics',1,[0,.5,2].map(v=>.4*(Math.sqrt(.6+v)-Math.sqrt(.6))),[1,.001,.001]);
 check('mosfet-linear',2,[1,3,1.1]);
 check('mosfet-power',1,[1e4,1e5,1e6].map(f=>.5*12*2*100e-9*f),[.001,.001,1]);
 check('power-fet-circuits',1,[.05,.2,1].map(i=>i-(12-5)*(5/12)/(100e-6*1e5)/2));
 check('parallel-mosfets',2,[0,.02,.1].map(r=>{const i=10*(.06+r)/(.1+2*r);return r*(i*i+(10-i)**2);}));
});

test('advanced MOS cases agree with independent local models and complete budgets',()=>{
 check('mos-bias-atlas',2,[4.5,5,5.5].map(v=>bias({vdd:v,vg:.4*v,lambda:0}).vd));
 check('mos-diode-load',2,[.001,.004,.016].map(k=>3.3-.7-Math.sqrt(.001/k)));
 check('mos-current-mirror',2,[3.3,5,6].map(v=>.001*((-1+Math.sqrt(1+20*(v-1)))/10)**2),.001);
 check('mos-ratioed-mirrors',1,[100e-6,200e-6,600e-6],1e-6);
 check('mos-source-degeneration',1,[1e-6,10e-6,100e-6].map(c=>1/(2*Math.PI*500*c)));
 check('mos-cascode-mirror',1,[Infinity,500000,50000].map(r=>1/(1/5e6+1/r)*20e-12),1e-6);
 check('mos-wide-swing-mirror',1,[-.08,0,.08].map(v=>.1+v),.001);
 check('mos-common-source',2,[.005,.020,.050].map(a=>a/(4*.4)),.01);
 check('mos-active-load',1,[1e-6,10e-6,100e-6].map(i=>i*25000),[.001,.001,1]);
 check('mos-source-follower',1,[Infinity,10000,1000].map(r=>.002/(.002+.0004+.00002+1/r)));
 check('mos-current-loaded-follower',2,[1e-12,10e-12,100e-12].map(i=>i*500*Math.sqrt(10000)),1e-6);
 check('mos-common-gate',2,[.002,.01,.02].map(g=>commonGate({gm:g,gds:0,rd:1000}).gain/(1+50*g)));
 check('mos-cascode-amplifier',2,[.2,.4,.8].map(u=>3.3-4*u));
 check('mos-differential-pair',1,[.02,.1,.2].map(a=>a*a/(32*.5*.5)),.01);
 check('mos-differential-range',1,[80,100,120].map(d=>2/10**(d/20)),1e-6);
 check('mos-mirror-loaded-differential',1,[10e-12,100e-12,1e-9].map(c=>.001/(2*Math.PI*c)),[1e6,1e6,1000]);
 check('mos-differential-degeneration',2,[0,500,2000].map(r=>Math.sqrt(8*kb*T*r)),[1,1e-9,1e-9]);
 check('mos-complementary-output',2,[1e3,1e4,1e5].map(f=>Math.hypot(.002,2*Math.PI*f*1e-8*2)),.001);
 check('mos-two-stage-amplifier',1,[.002/(2*Math.PI*50e-12),null,.002/(2*Math.PI*50e-12)],1e6);
 check('mos-noise-design',1,[10,1,.1].map(lo=>5e-9*Math.sqrt(1000-lo+100*Math.log(1000/lo))),1e-9);
});

test('op amp application cases keep noise gain, range and reference errors distinct',()=>{
 check('opamp-ideal',1,[1,10,100].map(g=>closedLoop({noiseGain:g,signalGain:g}).magnitude));
 check('opamp-dc-errors',2,[0,25,50].map(dt=>100*(10e-6+.2e-6*dt+10e-6)+.0001),.001);
 check('opamp-ac-limits',1,[.01,1,4].map(v=>v/.5e6),1e-6);
 check('opamp-bjt-internals',1,[10e-6,50e-6,100e-6].map(i=>Math.sqrt(2*1.602176634e-19*i/200)),1e-12);
 check('opamp-cmos-internals',2,[.0001,.001,.01].map(i=>3.3-i*50));
 check('opamp-input-tradeoffs',2,[10,100,1000].map(f=>5e-9*Math.sqrt(Math.PI*f/2)),1e-9);
 check('opamp-noninverting',2,[2e-6,10e-6,50e-6].map(tc=>10/11*tc*50),.01);
 check('opamp-inverting-summing',2,[1,2,4].map(N=>2e6/(1+N)),1e6);
 check('opamp-difference',1,[80,100,120].map(d=>10/10**(d/20)),.001);
 check('opamp-instrumentation',2,[175,1e4,1e6].map(r=>200*100e-12*r),[1e-6,.001,.001]);
 check('opamp-transimpedance',1,[0,1e4,1e5].map(hz=>{const w=2*Math.PI*hz,x=w*1e6*5e-12;return Math.hypot(1+10*x*x/(1+x*x),10*x/(1+x*x));}));
 check('opamp-integrator',2,[10e-6,100e-6,.001].map(v=>2*.001/v));
 check('opamp-differentiator',1,[100,1000,5000].map(b=>10e-9*2*Math.PI*100e-6/Math.sqrt(3)*b**1.5),[1e-9,1e-9,1e-6]);
 check('opamp-active-filters',1,[1000,2000,5000].map(f=>10*Math.log10(1+(f/1000)**8)));
 check('opamp-precision-rectifier',2,[1/Math.SQRT2,Math.PI/(2*Math.SQRT2),Math.PI/(4*Math.SQRT2)]);
 check('opamp-current-servo',1,[.01,.1,1].map(r=>1/(10+r)),.001);
 check('opamp-load-stability',2,[10,100,1000].map(r=>Math.log(1000)*r*1e-9),[1e-9,1e-6,1e-6]);
 check('opamp-function-design',2,[12,16,20].map(N=>3.3/(2**N*100*Math.sqrt(12))),1e-6);
});
