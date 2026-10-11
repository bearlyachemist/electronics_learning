import {useState} from 'react';
import {bias,mirror,follower,differential,csGain,cascode} from '../engine/mos-analog.mjs';
import {noise} from '../engine/opamp.mjs';
import {Control,Readouts,f} from './LabControls';
import {M} from './MathText';
import Plot from './Plot';
const green='var(--accent)',orange='var(--orange)',gray='var(--muted)';
const points=(fn:(x:number)=>number,lo:number,hi:number):[number,number][]=>Array.from({length:151},(_,i)=>{const x=lo+(hi-lo)*i/150;return [x,fn(x)];});
export function MosLab({kind='bias'}:{kind?:'bias'|'mirror'|'follower'|'differential'|'gain'|'noise'}){
 const [gate,G]=useState(2),[rs,RS]=useState(0),[current,I]=useState(1),[out,O]=useState(2),[lambda,L]=useState(.02),[body,B]=useState(.4),[diff,D]=useState(0),[cm,CM]=useState(2.5),[load,R]=useState(10);
 if(kind==='mirror'){
  const p=mirror({iref:current*.001,vout:out,lambda,rs});
  return <div className="lab" aria-label="MOS mirror operating points"><div className="lab-heading"><span className="tiny-label">COMPLIANCE AND FINITE OUTPUT RESISTANCE</span></div>
  <div className="horizontal-controls"><Control label="Reference current" value={current} onChange={I} min={.1} max={2} step={.1} unit="mA"/><Control label="Output drain voltage" value={out} onChange={O} min={0} max={5} step={.05} unit="V"/><Control label="Channel-length modulation" value={lambda} onChange={L} min={0} max={.1} step={.005} unit="1/V"/><Control label="Each source resistor" value={rs} onChange={RS} min={0} max={1000} step={50} unit="Ω"/></div>
  <Readouts values={[["I_OUT",f(p.id*1000),'mA'],['Ratio error',f(100*p.error),'%'],['Output device',p.region,'']]}/>
  <div className="plot-area"><Plot curves={[{name:'Actual mirror current',color:green,points:points(v=>mirror({iref:current*.001,vout:v,lambda,rs}).id*1000,0,5)},{name:'Requested reference current',color:orange,dashed:true,points:[[0,current],[5,current]]}]} xRange={[0,5]} yRange={[0,current*1.5]} point={[out,p.id*1000]} xLabel="Output voltage / V" yLabel="Output current / mA" description="Current falls below compliance and slopes upward with drain voltage in saturation"/></div>
  <p className="lab-prompt"><M t="k=2\,\mathrm{mA/V^2},\ V_T=1\,\mathrm V"/>. Both reference and output devices use the same region-aware channel law. Bulk follows each source, so source resistance introduces no body effect here. Mismatch, temperature and leakage are excluded.</p></div>;
 }
 if(kind==='follower'){
  const p=follower({vg:gate+1,ibias:current*.001,rl:load*1000,gamma:body,lambda});
  return <div className="lab" aria-label="MOS follower operating points"><div className="lab-heading"><span className="tiny-label">BIAS, BODY EFFECT AND LOADING</span></div>
  <div className="horizontal-controls"><Control label="Gate voltage" value={gate+1} onChange={v=>G(v-1)} min={1} max={5} step={.05} unit="V"/><Control label="Ideal sink current" value={current} onChange={I} min={0} max={2} step={.1} unit="mA"/><Control label="Load resistance" value={load} onChange={R} min={1} max={100} unit="kΩ"/><Control label="Body coefficient" value={body} onChange={B} min={0} max={.8} step={.05} unit="√V"/></div>
  <Readouts values={[["V_S",p.valid?f(p.vs):'No bias solution','V'],['Local gain',p.valid?f(p.gain,3):'—','V/V'],['Device',p.region,'']]}/>
  <div className="plot-area"><Plot curves={[{name:'Bulk grounded',color:green,points:points(v=>follower({vg:v,ibias:current*.001,rl:load*1000,gamma:body}).vs,1,5)},{name:'Bulk follows source',color:orange,dashed:true,points:points(v=>follower({vg:v,ibias:current*.001,rl:load*1000,gamma:0}).vs,1,5)}]} xRange={[1,5]} yRange={[0,4]} xLabel="Gate voltage / V" yLabel="Source output / V" description="Compare source-follower transfer curves and missing operating points with and without bulk effect"/></div>
  <p className="lab-prompt">5 V drain supply, <M t="k=2\,\mathrm{mA/V^2},\ V_{T0}=1\,\mathrm V,\ 2\phi_F=0.6\,\mathrm V"/>. The sink is ideal down to ground. A real current sink imposes additional compliance. Blank curve segments mean the commanded sink cannot be supplied at any nonnegative output.</p></div>;
 }
 if(kind==='differential'){
  const p=differential({vdiff:diff,vc:cm,rs,tail:current*.002});
  return <div className="lab" aria-label="MOS differential operating points"><div className="lab-heading"><span className="tiny-label">CURRENT STEERING NEEDS HEADROOM</span></div>
  <div className="horizontal-controls"><Control label="Differential input" value={diff} onChange={D} min={-2} max={2} step={.02} unit="V"/><Control label="Common-mode input" value={cm} onChange={CM} min={.5} max={5.5} step={.05} unit="V"/><Control label="Tail current" value={current*2} onChange={v=>I(v/2)} min={.2} max={4} step={.2} unit="mA"/><Control label="Each source resistor" value={rs} onChange={RS} min={0} max={1000} step={50} unit="Ω"/></div>
  <Readouts values={[["I_1",f(p.i1*1000),'mA'],['I_2',f(p.i2*1000),'mA'],['Headroom',p.valid?'Both conducting branches valid':'Square-law prediction outside compliance','']]}/>
  <div className="plot-area"><Plot curves={[{name:'Branch 1',color:green,points:points(v=>differential({vdiff:v,vc:cm,rs,tail:current*.002}).i1*1000,-2,2)},{name:'Branch 2',color:orange,points:points(v=>differential({vdiff:v,vc:cm,rs,tail:current*.002}).i2*1000,-2,2)}]} xRange={[-2,2]} yRange={[0,current*2.1]} xLabel="Differential input / V" yLabel="Ideal branch current / mA" description="Exact matched square-law current steering with a separate compliance indicator"/></div>
  <p className="lab-prompt">5 V supply, 1 kΩ drain loads, <M t="k=2\,\mathrm{mA/V^2},\ V_T=1\,\mathrm V"/>, tail requires 0.3 V. The curves show the ideal fixed-tail steering law even when compliance fails; the indicator prevents interpreting that law as the actual failed-bias current. Body effect and channel-length modulation are excluded.</p></div>;
 }
 if(kind==='noise'){
  const gm=Math.sqrt(2*.002*current*.001),en=Math.sqrt(4*1.380649e-23*300*(2/3)/gm),p=noise({en,inNoise:0,rs:load*1000});
  return <div className="lab" aria-label="MOS current and noise tradeoff"><div className="lab-heading"><span className="tiny-label">WHITE CHANNEL NOISE AND SOURCE RESISTANCE</span></div><div className="horizontal-controls"><Control label="Drain current" value={current} onChange={I} min={.05} max={2} step={.05} unit="mA"/><Control label="Source resistance" value={load} onChange={R} min={1} max={100} unit="kΩ"/></div><Readouts values={[["g_m",f(gm*1000),'mS'],['Channel voltage noise',f(en*1e9),'nV/√Hz'],['Combined input noise',f(p.rms*1e6),'μV rms']]}/><div className="plot-area"><Plot curves={[{name:'Source + channel noise',color:green,points:points(i=>noise({en:Math.sqrt(4*1.380649e-23*300*(2/3)/Math.sqrt(2*.002*i*.001)),inNoise:0,rs:load*1000}).rms*1e6,.05,2)}]} xRange={[.05,2]} yRange={[0,p.rms*2e6]} xLabel="Drain current / mA" yLabel="Input noise over 10 kHz / μV rms" description="Increasing MOS bias reduces white channel voltage noise but cannot remove source resistor noise"/></div><p className="lab-prompt">Long-channel saturation estimate at 300 K, <M t="\gamma_n=2/3"/>; integrate a rectangular 10 kHz white-noise band. Flicker noise, induced gate noise, bias-generator noise and feedback-resistor noise are excluded. These local noise parameters do not establish a feasible DC bias circuit.</p></div>;
 }
 if(kind==='gain'){
  // Time-domain common-source stage: every sample is a full region-aware DC solution, so clipping and curvature are exact in this model.
  const amp=diff===0?.1:Math.abs(diff),rd=load*200,N=128;
  const wave=Array.from({length:N+1},(_,i)=>{const t=i/N*2,v=amp*Math.sin(2*Math.PI*t);return [t,bias({vg:gate+v,rd,rs:0,lambda})] as const;});
  const q=bias({vg:gate,rd,rs:0,lambda}),g=csGain({gm:q.gm,gds:q.gds,rd});
  let c1=0,c2=0;wave.slice(0,N/2).forEach(([t,p])=>{const th=2*Math.PI*t;c1+=p.vd*Math.sin(th);c2+=p.vd*Math.cos(2*th);});
  const vds=wave.map(([,p])=>p.vd),hi=Math.max(...vds)-q.vd,lo=q.vd-Math.min(...vds),bad=wave.some(([,p])=>p.region!=='saturation');
  return <div className="lab" aria-label="Common-source waveform and distortion"><div className="lab-heading"><span className="tiny-label">A REAL SINE THROUGH THE SQUARE LAW</span></div>
  <div className="horizontal-controls"><Control label="Gate bias" value={gate} onChange={G} min={1.3} max={3} step={.05} unit="V"/><Control label="Input peak" value={amp} onChange={D} min={.01} max={.6} step={.01} unit="V"/><Control label="Drain resistor" value={rd/1000} onChange={v=>R(v*5)} min={1} max={4} step={.1} unit="kΩ"/></div>
  <Readouts values={[["Small-signal gain",f(g),'V/V'],['2nd harmonic',f(100*Math.abs(c2/c1),2),'%'],['Swing down / up',`${f(lo,2)} / ${f(hi,2)}`+(bad?' · leaves saturation':''),'V']]}/>
  <div className="plot-area"><Plot curves={[{name:'Drain voltage',color:green,points:wave.map(([t,p])=>[t,p.vd] as [number,number])},{name:'Linear prediction',color:orange,dashed:true,points:wave.map(([t])=>[t,q.vd+g*amp*Math.sin(2*Math.PI*t)] as [number,number])}]} xRange={[0,2]} yRange={[0,5]} xLabel="Time / periods" yLabel="Drain voltage / V" description="Common-source output waveform compared with its small-signal prediction"/></div>
  <p className="lab-prompt">5 V supply, grounded source, <M t="k=2\,\mathrm{mA/V^2},\ V_T=1\,\mathrm V,\ \lambda=0.02\,\mathrm{V^{-1}}"/>. Each point of the waveform is a full region-aware solution, so the flattened negative peaks (gate high, drain low) show the square law and then triode, and the flat top shows cutoff. Predict the second harmonic as <M t="a/4u"/> before reading it; the reading is about 15% lower, because as the current rises the drain voltage falls and channel-length modulation trims the current back, a small built-in negative feedback.</p></div>;
 }
 const p=bias({vg:gate,rs,lambda,gamma:body}),gain=csGain({gm:p.gm,gmb:p.gmb,gds:p.gds,rd:2000,rs});
 return <div className="lab" aria-label="MOS common-source bias atlas"><div className="lab-heading"><span className="tiny-label">THE BIAS POINT COMES BEFORE THE GAIN</span></div><div className="horizontal-controls"><Control label="Gate bias" value={gate} onChange={G} min={.4} max={4.5} step={.05} unit="V"/><Control label="Source resistance" value={rs} onChange={RS} min={0} max={1000} step={50} unit="Ω"/><Control label="Body coefficient" value={body} onChange={B} min={0} max={.8} step={.05} unit="√V"/></div><Readouts values={[["I_D",f(p.id*1000),'mA'],['V_DS',f(p.vds),'V'],['Region / local gain',`${p.region} / ${f(gain)}`,'V/V']]}/><div className="plot-area"><Plot curves={[{name:'Drain output',color:green,points:points(v=>bias({vg:v,rs,gamma:body,lambda}).vd,.4,4.5)}]} xRange={[.4,4.5]} yRange={[0,5]} point={[gate,p.vd]} xLabel="Gate bias / V" yLabel="Drain output / V" description="DC common-source transfer crosses cutoff, saturation and the triode region"/></div><p className="lab-prompt">5 V supply, <M t="R_D=2\,\mathrm{k\Omega},\ k=2\,\mathrm{mA/V^2},\ V_{T0}=1\,\mathrm V,\ \lambda=0.02\,\mathrm{V^{-1}}"/>. The region-aware load-line solution includes source feedback and grounded-bulk effect. The displayed gain is a local derivative, including in triode; it is not a saturation-only formula used outside its domain.</p></div>;
}

const rg=(r:string)=>r==='ohmic'?'triode':r;
export function MosCases({kind='bias'}:{kind?:'bias'|'mirror'|'ratio'|'degenerated'|'follower'|'current-follower'|'differential'|'diff-degenerated'|'cascode'|'active'|'diode'}){
 let headers:string[],rows:string[][];
 if(['mirror','ratio','degenerated'].includes(kind)){
  headers=[kind==='ratio'?'Available V_SD / V':'Output drain / V','Current / mA','Ratio error','Region'];rows=[.2,2,4].map(v=>{const p=mirror({vout:v,ratio:kind==='ratio'?2:1,rs:kind==='degenerated'?500:0});return [f(v),f(p.id*1000,3),f(p.error*100)+'%',rg(p.region)];});
 }else if(kind==='follower'||kind==='current-follower'){
  headers=['Gate / V','Source / V','Current / mA','Incremental gain'];rows=[2,3,4].map(v=>{const p=follower({vg:v,ibias:kind==='current-follower'?.0005:0,rl:kind==='current-follower'?10000:2000,gamma:.4});return [f(v),p.valid?f(p.vs,3):'not feasible',p.valid?f(p.id*1000,3):'—',p.valid?f(p.gain,3):'—'];});
 }else if(kind==='differential'||kind==='diff-degenerated'){
  headers=['Differential input / V','I₁ / mA','I₂ / mA','Drain difference / V'];rows=[-.8,0,.8].map(v=>{const p=differential({vdiff:v,rs:kind==='diff-degenerated'?500:0});return [f(v),f(p.i1*1000,3),f(p.i2*1000,3),f(p.out,3)];});
 }else if(kind==='cascode'){
  headers=['Current / mA','Overdrive / V','Output resistance','Unloaded gain'];rows=[.25,.5,1].map(i=>{const u=Math.sqrt(2*i*.001/.002),gm=.002*u,ro=1/(.02*i*.001),p=cascode({gm1:gm,gm2:gm,ro1:ro,ro2:ro});return [f(i),f(u,3),f(p.rout/1e6,2)+' MΩ',f(p.gain,0)];});
 }else if(kind==='active'){
  headers=['AC-coupled load','Effective resistance','Gain','Output pole with 10 pF'];rows=[Infinity,100000,10000].map(r=>{const rout=1/(2/50000+1/r);return [r===Infinity?'Open':f(r/1000,0)+' kΩ',f(rout/1000,2)+' kΩ',f(-.002*rout),f(1/(2*Math.PI*rout*10e-12)/1000,1)+' kHz'];});
 }else if(kind==='diode'){
  headers=['Load k / input k','Load overdrive / V','DC output / V','Ideal local gain'];rows=[.25,1,4].map(r=>{const u=Math.sqrt(2*.001/(.002*r)),gm=.002*r*u;return [f(r),f(u,3),f(5-1-u,3),f(-.002/gm,3)];});
 }else{
  headers=['Gate / V','Current / mA','Drain / V','Saturation margin / V','Region'];rows=[1.5,2,3].map(v=>{const p=bias({vg:v,lambda:0});return [f(v),f(p.id*1000,3),f(p.vd,3),f(p.margin,3),rg(p.region)];});
 }
 return <div className="operating-points"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>;
}
