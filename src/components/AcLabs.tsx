import {useState} from 'react';
import {C,add,mul,polar,mag,phase,db,network,phasorSum,powerWave,correction,loadedRC,poleResponse,bandResponse,notchResponse,resonance,lcResponse,acThevenin,supplyImpedance} from '../engine/ac.mjs';
import Plot from './Plot';
import {Control,Readouts,f} from './LabControls';
import {Wires,Res,Cap,Ind,Source,Ground,Dot,Label,PhasorDiagram,eng,engText,logspace,green,orange,gray,ink} from './Parts';
type Z={re:number;im:number};
function Head({title,reset}:{title:string;reset:()=>void}){return <div className="lab-heading"><div><span className="live-dot"/><span className="tiny-label">{title}</span></div><button onClick={reset}>Reset ↺</button></div>}
const pts=(fn:(x:number)=>number,a:number,b:number,n=240):[number,number][]=>Array.from({length:n+1},(_,k)=>{const x=a+(b-a)*k/n;return [x,fn(x)]});
const complexText=(z:Z,unit:string)=>engText(z.re,unit)+(z.im<0?' − j':' + j')+engText(Math.abs(z.im),unit);
const decades=(a:number,b:number)=>Array.from({length:b-a+1},(_,k)=>10**(a+k));

/* ---------- Chapter: phasors ---------- */
export function PhasorLab(){
 const [a2,setA2]=useState(.8),[p2,setP2]=useState(60),[wt,setWt]=useState(30);
 const s=phasorSum({a1:1,p1:0,a2,p2}),turn=polar(1,wt),rot=(z:Z)=>mul(z,turn);
 const v1=rot(polar(1,0)),v2=rot(polar(a2,p2)),sum=rot(s.sum),now=s.at(wt*Math.PI/180);
 const reset=()=>{setA2(.8);setP2(60);setWt(30)};
 return <div className="lab" aria-label="Phasor addition experiment"><Head title="ROTATING ARROWS · ADDED TIP TO TAIL" reset={reset}/>
 <div className="horizontal-controls"><Control label="Amplitude of V₂ (V₁ = 1)" value={a2} onChange={setA2} min={0} max={2} step={.05} unit="V"/><Control label="Phase of V₂ relative to V₁" value={p2} onChange={setP2} min={-180} max={180} step={5} unit="°"/><Control label="Rotation angle ωt" value={wt} onChange={setWt} min={0} max={720} step={5} unit="°"/></div>
 <Readouts values={[['SUM AMPLITUDE',f(s.amplitude,3),'V'],['SUM PHASE',f(s.phase,1),'°'],['INSTANTANEOUS SUM',f(now,3),'V']]}/>
 <div className="plot-area split-plots"><div><h4>Complex plane at ωt = {f(wt,0)}°</h4><PhasorDiagram vectors={[{...v2,color:orange,dashed:true,width:1.4},{...v1,color:green,label:'V₁'},{...v2,from:v1,color:orange,label:'V₂'},{...sum,color:ink,label:'Sum'}]} circle={s.amplitude} scale={Math.max(1,a2,s.amplitude)*1.05} points={[{re:sum.re,im:0,color:ink},{re:v1.re,im:0,color:green}]} description={'Phasor V1 of length 1 and V2 of length '+f(a2,2)+' at '+p2+' degrees, rotated together by '+wt+' degrees. Their sum has length '+f(s.amplitude,3)+'. Dots on the real axis are the instantaneous values.'}/></div>
 <div><Plot curves={[{name:'v₁ = cos ωt',color:green,points:pts(t=>Math.cos(t*Math.PI/180),0,720)},{name:'v₂',color:orange,points:pts(t=>a2*Math.cos((t+p2)*Math.PI/180),0,720)},{name:'v₁ + v₂',color:ink,points:pts(t=>s.at(t*Math.PI/180),0,720)}]} xRange={[0,720]} xTicks={[0,180,360,540,720]} yRange={[-3,3]} xLabel="ωt / DEGREES" yLabel="INSTANTANEOUS VALUE / V" point={[wt,now]} description={'Two cosines and their sum over two periods. The sum is a single cosine with amplitude '+f(s.amplitude,3)+' and phase '+f(s.phase,1)+' degrees.'}/></div></div>
 <p className="plot-summary" style={{padding:'0 25px 16px'}}>Each signal is the real part of its rotating arrow: v(t) = Re{'{'}V e<sup>jωt</sup>{'}'}. Because both arrows rotate at the same rate, the shape of the triangle never changes—only its orientation. The dots are the projections onto the real axis.</p>
 <div className="lab-prompt"><strong>Explore.</strong> Set V₂ = 1 at 180°: the sum vanishes at every instant. Set 90°: the sum is √2 ≈ 1.414 at 45°. Then sweep ωt and watch the projection trace the time graph.</div></div>;
}

/* ---------- Chapter: impedance ---------- */
type Topo='series-rc'|'series-rl'|'series-rlc'|'parallel-rc'|'parallel-rlc';
const topoNames:Record<Topo,string>={'series-rc':'Series RC','series-rl':'Series RL','series-rlc':'Series RLC','parallel-rc':'Parallel RC','parallel-rlc':'Parallel RLC'};
function TwoTerminal({topology,values}:{topology:Topo;values:{r:string;l:string;c:string}}){
 const parts=(topology.endsWith('rlc')?['r','l','c']:topology.endsWith('rl')?['r','l']:['r','c']) as ('r'|'l'|'c')[];
 const series=topology.startsWith('series'),xs=parts.length===3?(series?[170,300,430]:[220,350,480]):(series?[200,370]:[260,420]);
 const Part=({k,x,y,v}:{k:'r'|'l'|'c';x:number;y:number;v?:boolean})=>k==='r'?<Res x={x} y={y} v={v}/>:k==='l'?<Ind x={x} y={y} v={v}/>:<Cap x={x} y={y} v={v}/>;
 return <svg className="wide-circuit" viewBox="0 0 640 260" role="img" aria-label={topoNames[topology]+' network seen between two terminals: '+parts.map(p=>values[p]).join(', ')}>
  <circle cx="60" cy={series?70:60} r="5" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><circle cx="60" cy="210" r="5" fill="var(--white)" stroke={ink} strokeWidth="1.8"/>
  {series?<><Wires d={'M65 70 H'+(xs[0]-30)+xs.slice(1).map((x,i)=>' M'+(xs[i]+30)+' 70 H'+(x-30)).join('')+' M'+(xs.at(-1)!+30)+' 70 H540 V210 H65'}/>{parts.map((p,i)=><g key={p}><Part k={p} x={xs[i]} y={70}/><Label x={xs[i]} y={40} anchor="middle">{values[p]}</Label></g>)}</>
  :<><Wires d={'M65 60 H'+xs.at(-1)+' M65 210 H'+xs.at(-1)+xs.map(x=>' M'+x+' 60 V105 M'+x+' 165 V210').join('')}/>{parts.map((p,i)=><g key={p}><Part k={p} x={xs[i]} y={135} v/><Label x={xs[i]+26} y={140}>{values[p]}</Label>{i<parts.length-1&&<><Dot x={xs[i]} y={60}/><Dot x={xs[i]} y={210}/></>}</g>)}</>}
  <Label x={80} y={145} kind="output">Z</Label><path d="M95 140 h30 m-7 -5 l7 5 l-7 5" stroke={green} strokeWidth="1.8" fill="none"/>
 </svg>;
}
export function ImpedanceLab(){
 const [topology,setTopology]=useState<Topo>('series-rc'),[r,setR]=useState(1000),[mh,setMh]=useState(10),[uf,setUf]=useState(.1),[hz,setHz]=useState(1000);
 const p={r,l:mh/1000,c:uf*1e-6},net=network({topology,...p,hz}),d={...net,z:net.z as Z},uses=(k:string)=>topology.includes(k);
 const freqs=logspace(1,6),series=topology.startsWith('series');
 const reset=()=>{setTopology('series-rc');setR(1000);setMh(10);setUf(.1);setHz(1000)};
 return <div className="lab" aria-label="Impedance explorer"><Head title="ONE COMPLEX NUMBER PER FREQUENCY" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Network">{(Object.keys(topoNames) as Topo[]).map(t=><button key={t} aria-pressed={topology===t} onClick={()=>setTopology(t)}>{topoNames[t]}</button>)}</div>
 <TwoTerminal topology={topology} values={{r:engText(r,'Ω'),l:engText(p.l,'H'),c:engText(p.c,'F')}}/>
 <div className="horizontal-controls"><Control label="Resistance R" value={r} onChange={setR} min={1} max={4} step={.02} log unit="Ω"/>{uses('l')&&<Control label="Inductance L" value={mh} onChange={setMh} min={-1} max={2} step={.02} log unit="mH"/>}{uses('c')&&<Control label="Capacitance C" value={uf} onChange={setUf} min={-3} max={1} step={.02} log unit="µF"/>}<Control label="Frequency" value={hz} onChange={setHz} min={1} max={6} step={.02} log unit="Hz"/></div>
 <Readouts values={[['MAGNITUDE |Z|',...eng(d.magnitude,'Ω')],['PHASE ∠Z',f(d.phase,1),'°'],['REACTIVE PART X',...eng(d.z.im,'Ω')]]}/>
 <div className="plot-area split-plots"><div><h4>Z in the complex plane</h4><PhasorDiagram vectors={[{re:d.z.re,im:0,color:gray,label:series?'R':'Re Z'},{re:0,im:d.z.im,from:{re:d.z.re,im:0},color:orange,label:series?'jX':'j Im Z'},{...d.z,color:green,label:'Z'}]} description={'At '+engText(hz,'Hz')+', Z = '+complexText(d.z,'Ω')+', magnitude '+engText(d.magnitude,'Ω')+' at '+f(d.phase,1)+' degrees.'}/></div>
 <div><Plot curves={[{name:'|Z|',color:green,points:freqs.map(v=>[v,network({topology,...p,hz:v}).magnitude])},{name:'R',color:gray,dashed:true,points:[[10,r],[1e6,r]]},...(uses('l')?[{name:'X_L = ωL',color:orange,dashed:true,points:freqs.map(v=>[v,2*Math.PI*v*p.l] as [number,number])}]:[]),...(uses('c')?[{name:'X_C = 1/ωC',color:ink,dashed:true,points:freqs.map(v=>[v,1/(2*Math.PI*v*p.c)] as [number,number])}]:[])]} xRange={[10,1e6]} yRange={[.1,1e7]} xScale="log" yScale="log" xTicks={decades(1,6)} xLabel="FREQUENCY / Hz · LOG" yLabel="IMPEDANCE MAGNITUDE / Ω · LOG" point={[hz,d.magnitude]} description={'Impedance magnitude across frequency for the '+topoNames[topology]+' network; the selected point is '+engText(d.magnitude,'Ω')+'.'}/></div></div>
 <p className="plot-summary" style={{padding:'0 25px 16px'}}>Z = {complexText(d.z,'Ω')}. Admittance Y = 1/Z = {complexText(d.admittance,'S')}. {series?'In series, impedances add, so the largest term dominates |Z|.':'In parallel, admittances add, so the smallest impedance dominates |Z|.'} Ideal components; no ESR, winding resistance or self-resonance.</p>
 <div className="lab-prompt"><strong>Explore.</strong> In series RC, find the frequency where the green curve crosses 1.41 × R: there the phase is −45° and X_C = R. In series RLC, find the minimum. Switch to parallel RLC: the same L and C now make a maximum.</div></div>;
}

/* ---------- Chapter: power ---------- */
export function PowerLab(){
 const [r,setR]=useState(100),[x,setX]=useState(100);
 const d=powerWave({vrms:10,r,x,hz:50}),vp=10*Math.SQRT2,ip=d.irms*Math.SQRT2,lo=d.p-d.apparent,hi=d.p+d.apparent;
 const reset=()=>{setR(100);setX(100)};
 return <div className="lab" aria-label="Power in a reactive load"><Head title="v × i, AVERAGED" reset={reset}/>
 <svg className="wide-circuit" viewBox="0 0 640 210" role="img" aria-label={'10 volt RMS, 50 hertz source drives a '+r+' ohm resistor in series with a '+(x>=0?'inductive':'capacitive')+' reactance of '+Math.abs(x)+' ohms.'}>
  <Wires d="M90 80 V40 H210 M270 40 H390 M450 40 H520 V170 H90 V130"/><Source x={90} y={105} ac label="10 V RMS"/><Res x={240} y={40}/>{x>=0?<Ind x={420} y={40}/>:<Cap x={420} y={40}/>}
  <Label x={240} y={80} anchor="middle">R = {r} Ω</Label><Label x={420} y={80} anchor="middle">{x>=0?'X = +'+x+' Ω (inductive)':'X = '+x+' Ω (capacitive)'}</Label>
 </svg>
 <div className="horizontal-controls"><Control label="Resistance R" value={r} onChange={setR} min={10} max={300} step={5} unit="Ω"/><Control label="Reactance X (− capacitive, + inductive)" value={x} onChange={setX} min={-300} max={300} step={5} unit="Ω"/></div>
 <Readouts values={[['REAL POWER P',f(d.p,3),'W'],['REACTIVE POWER Q',f(d.q,3),'var'],['POWER FACTOR',f(d.pf,3),x>0?'lagging':x<0?'leading':'']]}/>
 <div className="plot-area"><h4>Current {x>0?'lags':x<0?'leads':'is in phase with'} voltage by {f(Math.abs(d.angle),1)}°</h4><Plot curves={[{name:'v / Vpeak',color:gray,dashed:true,points:pts(t=>d.vt(t/1000)/vp,0,40)},{name:'i / Ipeak',color:green,points:pts(t=>d.it(t/1000)/ip,0,40)}]} xRange={[0,40]} yRange={[-1.1,1.1]} xLabel="TIME / ms" yLabel="NORMALIZED VALUE" description={'Voltage and current normalized to their peaks; current is shifted by '+f(d.angle,1)+' degrees.'}/>
 <div className="split-plots"><div><h4>Power triangle</h4><PhasorDiagram vectors={[{re:d.p,im:0,color:green,label:'P'},{re:0,im:d.q,from:{re:d.p,im:0},color:orange,label:'jQ'},{re:d.p,im:d.q,color:ink,label:'S'}]} xLabel="P / W" yLabel="Q / var" description={'Real power '+f(d.p,3)+' watts, reactive power '+f(d.q,3)+' var, apparent power '+f(d.apparent,3)+' volt-amperes.'}/></div>
 <div><Plot curves={[{name:'p(t) = v·i',color:orange,points:pts(t=>d.pt(t/1000),0,40)},{name:'Average P',color:green,dashed:true,points:[[0,d.p],[40,d.p]]},{name:'Zero',color:gray,points:[[0,0],[40,0]]}]} xRange={[0,40]} yRange={[Math.min(0,lo)*1.1-.01,hi*1.1]} xLabel="TIME / ms" yLabel="INSTANTANEOUS POWER / W" description={'Instantaneous power oscillates at twice the line frequency between '+f(lo,3)+' and '+f(hi,3)+' watts around an average of '+f(d.p,3)+' watts.'}/></div></div>
 <p className="plot-summary">I = {f(d.irms*1000,1)} mA RMS; apparent power S = Vrms·Irms = {f(d.apparent,3)} VA. Instantaneous power swings by ±S around P at twice the line frequency; it is negative whenever v and i have opposite signs, meaning energy flows back to the source. Ideal reactance; 50 Hz.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Set R = 10 Ω and X = ±300 Ω: large current flows yet almost no average power. Set X = 0: p(t) never goes negative and PF = 1.</div></div>;
}
export function CorrectionLab(){
 const [uf,setUf]=useState(0);const base={vrms:230,hz:50,r:20,l:.05},d=correction({...base,c:uf*1e-6}),ideal=correction(base).ideal*1e6;
 return <div className="lab" aria-label="Power factor correction experiment"><Head title="CANCEL THE REACTIVE CURRENT LOCALLY" reset={()=>setUf(0)}/>
 <svg className="wide-circuit" viewBox="0 0 640 230" role="img" aria-label={'230 volt RMS 50 hertz source feeds a 20 ohm plus 50 millihenry load with a '+f(uf,0)+' microfarad capacitor in parallel.'}>
  <Wires d="M90 92 V50 H520 V75 M90 142 V200 H520 V175 M400 50 V95 M400 155 V200"/><Source x={90} y={117} ac label="230 V"/><Res x={520} y={105} v/><Ind x={520} y={150} v/>
  <path d="M520 135 V120" stroke={ink} strokeWidth="1.8"/><Cap x={400} y={125} v/><Dot x={400} y={50}/><Dot x={400} y={200}/>
  <Label x={545} y={110}>20 Ω</Label><Label x={545} y={160}>50 mH</Label><Label x={330} y={130} anchor="end">{f(uf,0)} µF</Label><Label x={200} y={35} kind="output">I line →</Label>
 </svg>
 <div className="horizontal-controls"><Control label="Correction capacitance" value={uf} onChange={setUf} min={0} max={250} step={1} unit="µF"/></div>
 <Readouts values={[['LINE CURRENT',f(mag(d.line),2),'A RMS'],['POWER FACTOR',f(d.pf,3),d.q>1e-6?'lagging':d.q<-1e-6?'leading':''],['REACTIVE POWER',f(d.q,0),'var']]}/>
 <div className="plot-area split-plots"><div><h4>Currents, voltage as reference</h4><PhasorDiagram vectors={[{...d.load,color:orange,label:'I load'},{...d.cap,from:d.load,color:ink,label:'I cap'},{...d.line,color:green,label:'I line',side:-1}]} scale={Math.max(mag(d.load),mag(d.line),mag(add(d.load,d.cap)))*1.05} description={'Load current '+f(mag(d.load),2)+' amps lagging. Capacitor current '+f(mag(d.cap),2)+' amps leading by 90 degrees. Line current '+f(mag(d.line),2)+' amps.'}/></div>
 <div><Plot curves={[{name:'Line current',color:green,points:pts(c=>mag(correction({...base,c:c*1e-6}).line),0,250)},{name:'Load current (unchanged)',color:orange,dashed:true,points:[[0,mag(d.load)],[250,mag(d.load)]]}]} xRange={[0,250]} yRange={[0,Math.max(12,mag(d.line)*1.1)]} xLabel="CORRECTION CAPACITANCE / µF" yLabel="RMS CURRENT / A" point={[uf,mag(d.line)]} description={'Line current is minimized at about '+f(ideal,1)+' microfarads, where it equals the in-phase part of the load current.'}/></div></div>
 <p className="plot-summary">Real power stays {f(d.p,0)} W at every setting. The ideal correction is {f(ideal,1)} µF. Beyond it, the circuit becomes net capacitive and line current rises again. Ideal sinusoidal source and capacitor; no harmonics.</p>
 <div className="lab-prompt"><strong>Explore.</strong> Raise C slowly. The load current is untouched, but the line no longer has to carry its reactive part back and forth.</div></div>;
}

/* ---------- Chapter: RC filters ---------- */
function RCSection({high,loaded,r,c,rl}:{high:boolean;loaded:boolean;r:string;c:string;rl:string}){
 return <svg className="wide-circuit" viewBox="0 0 640 250" role="img" aria-label={(high?'High-pass: series capacitor '+c+', shunt resistor '+r:'Low-pass: series resistor '+r+', shunt capacitor '+c)+(loaded?', with load '+rl:', unloaded')+'.'}>
  <Wires d={'M85 105 V50 H245 M305 50 H'+(loaded?540:420)+' M400 50 V105 M400 165 V215 M85 155 V215 H'+(loaded?540:400)+(loaded?' M540 50 V105 M540 165 V215':'')}/>
  <Source x={85} y={130} ac label="Vin"/>{high?<Cap x={275} y={50}/>:<Res x={275} y={50}/>}{high?<Res x={400} y={135} v/>:<Cap x={400} y={135} v/>}{loaded&&<><Res x={540} y={135} v/><Label x={562} y={140}>{rl}</Label><Dot x={400} y={215}/></>}
  <Dot x={400} y={50} color={green}/><Ground x={85} y={215}/><Label x={275} y={28} anchor="middle">{high?c:r}</Label><Label x={425} y={140}>{high?r:c}</Label><Label x={412} y={40} kind="output">Vout</Label>
 </svg>;
}
export function BodeLab(){
 const [high,setHigh]=useState(false),[rk,setRk]=useState(10),[nf,setNf]=useState(10),[loaded,setLoaded]=useState(false),[rlk,setRlk]=useState(10),[hz,setHz]=useState(1000);
 const r=rk*1e3,c=nf*1e-9,rl=loaded?rlk*1e3:Infinity,H=(v:number)=>loadedRC({r,c,rl,hz:v,high});
 const reff=loaded?1/(1/r+1/rl):r,fc=1/(2*Math.PI*reff*c),g0=high?1:loaded?rl/(r+rl):1,h=H(hz),freqs=logspace(0,6,301);
 const reset=()=>{setHigh(false);setRk(10);setNf(10);setLoaded(false);setRlk(10);setHz(1000)};
 return <div className="lab" aria-label="RC filter Bode plot experiment"><Head title="MAGNITUDE AND PHASE ON LOG AXES" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Filter type"><button aria-pressed={!high} onClick={()=>setHigh(false)}>Low-pass</button><button aria-pressed={high} onClick={()=>setHigh(true)}>High-pass</button></div>
 <RCSection high={high} loaded={loaded} r={engText(r,'Ω')} c={engText(c,'F')} rl={engText(rlk*1e3,'Ω')}/>
 <div className="horizontal-controls"><Control label="Resistance R" value={rk} onChange={setRk} min={0} max={2} step={.02} log unit="kΩ"/><Control label="Capacitance C" value={nf} onChange={setNf} min={0} max={3} step={.02} log unit="nF"/><Control label="Test frequency" value={hz} onChange={setHz} min={0} max={6} step={.02} log unit="Hz"/>{loaded&&<Control label="Load resistance" value={rlk} onChange={setRlk} min={0} max={3} step={.02} log unit="kΩ"/>}<label className="check"><input type="checkbox" checked={loaded} onChange={e=>setLoaded(e.target.checked)}/> Connect a resistive load</label></div>
 <Readouts values={[['CORNER f₃dB',...eng(fc,'Hz')],['GAIN AT TEST f',f(db(h),2),'dB'],['PHASE AT TEST f',f(phase(h),1),'°']]}/>
 <div className="plot-area"><h4>Magnitude: flat, a corner, then 20 dB per decade</h4><Plot curves={[{name:'Exact |H|',color:green,points:freqs.map(v=>[v,db(H(v))])},{name:'Straight-line asymptotes',color:orange,dashed:true,points:freqs.map(v=>[v,20*Math.log10(g0)+(high?Math.min(0,20*Math.log10(v/fc)):Math.min(0,-20*Math.log10(v/fc)))])}]} xRange={[1,1e6]} yRange={[-80,0]} xScale="log" xTicks={decades(0,6)} xLabel="FREQUENCY / Hz · LOG" yLabel="GAIN / dB" point={[hz,db(h)]} description={'Bode magnitude of the '+(high?'high':'low')+'-pass filter. Corner at '+engText(fc,'Hz')+'. At the test frequency the gain is '+f(db(h),2)+' decibels.'}/>
 <Plot curves={[{name:'Phase of H',color:orange,points:freqs.map(v=>[v,phase(H(v))])}]} xRange={[1,1e6]} yRange={[-90,90]} xScale="log" xTicks={decades(0,6)} xLabel="FREQUENCY / Hz · LOG" yLabel="PHASE / DEGREES" point={[hz,phase(h)]} description={'Phase moves through '+(high?'+45':'−45')+' degrees at the corner, approaching '+(high?'+90 below':'−90 above')+' it.'}/>
 <Plot curves={[{name:'Input',color:gray,dashed:true,points:pts(t=>Math.sin(2*Math.PI*t),0,2)},{name:'Output',color:green,points:pts(t=>mag(h)*Math.sin(2*Math.PI*t+phase(h)*Math.PI/180),0,2)}]} xRange={[0,2]} yRange={[-1.1,1.1]} xLabel="TIME / PERIODS OF THE TEST FREQUENCY" yLabel="VOLTAGE / V" description={'At the test frequency the output is '+f(mag(h),3)+' times the input, shifted '+f(phase(h),1)+' degrees.'}/>
 <p className="plot-summary">At the test frequency, |H| = {f(mag(h),4)} and f/f₃dB = {f(hz/fc,3)}. {loaded?(high?'The load sits in parallel with R, so the corner rises to 1/(2π(R∥Rₗ)C).':'The load forms a divider with R (DC gain '+f(20*Math.log10(g0),2)+' dB) and its parallel combination with R sets the corner.'):'Unloaded output, ideal source.'} Steady-state sine response; the start-up transient is omitted.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Put the test frequency at the corner: −3.01 dB and ±45°. Move it one decade beyond: about −20 dB and nearly ±90°. Then connect a 10 kΩ load to the low-pass and see both the DC gain and the corner change.</div></div>;
}

/* ---------- Chapter: poles, band-pass and notch ---------- */
type PoleMode='poles'|'bandpass'|'notch';
function Buffer({x,y}:{x:number;y:number}){return <g><polygon points={`${x},${y-18} ${x},${y+18} ${x+30},${y}`} fill="var(--white)" stroke={ink} strokeWidth="1.8"/><text x={x+9} y={y+4} className="symbol-value">×1</text></g>}
function PoleCircuit({mode,count,loaded}:{mode:PoleMode;count:number;loaded:boolean}){
 if(mode==='poles')return <svg className="wide-circuit" viewBox="0 0 640 220" role="img" aria-label={count+' identical RC low-pass sections, each followed by a unity-gain buffer.'}>
  {Array.from({length:count},(_,i)=>{const x=50+i*140;return <g key={i}><Wires d={`M${x} 80 H${x+15} M${x+75} 80 H${x+105} M${x+95} 80 V105 M${x+95} 165 V175 M${x+135} 80 H${x+140}`}/><Res x={x+45} y={80}/><Cap x={x+95} y={135} v/><Ground x={x+95} y={175}/><Buffer x={x+105} y={80}/><Dot x={x+95} y={80}/></g>})}
  <Label x={40} y={65} anchor="end" kind="output">in</Label><Label x={50+count*140} y={65} kind="output">out</Label></svg>;
 if(mode==='bandpass')return <svg className="wide-circuit" viewBox="0 0 640 220" role="img" aria-label={'High-pass section: series C then shunt R. '+(loaded?'Connected directly':'Through a buffer')+' to a low-pass section: series R then shunt C.'}>
  <Wires d={'M60 70 H90 M150 70 H'+(loaded?270:215)+(loaded?'':' M245 70 H270')+' M330 70 H460 M190 70 V105 M190 165 V180 M380 70 V105 M380 165 V180'}/><Cap x={120} y={70}/><Res x={190} y={135} v/><Res x={300} y={70}/><Cap x={380} y={135} v/><Ground x={190} y={180}/><Ground x={380} y={180}/>{!loaded&&<Buffer x={215} y={70}/>}<Dot x={190} y={70}/><Dot x={380} y={70} color={green}/>
  <Label x={50} y={75} anchor="end" kind="output">in</Label><Label x={470} y={75} kind="output">out</Label><Label x={120} y={45} anchor="middle" kind="value">sets f_low</Label><Label x={300} y={45} anchor="middle" kind="value">sets f_high</Label><Label x={300} y={205} anchor="middle" kind="value">{loaded?'equal resistors, no buffer: sections interact':'buffer isolates the sections'}</Label></svg>;
 return <svg className="wide-circuit" viewBox="0 0 640 290" role="img" aria-label="Twin-T notch. Upper T: two series capacitors C with a resistor R/2 from their junction to ground. Lower T: two series resistors R with a capacitor 2C from their junction to ground. Both T networks join the same input and output.">
  <Wires d="M60 150 H150 M150 110 V190 M150 110 H190 M250 110 H350 M410 110 H450 M150 190 H190 M250 190 H350 M410 190 H450 M450 110 V190 M450 150 H540 M300 110 V100 M300 190 V200"/>
  <Cap x={220} y={110}/><Cap x={380} y={110}/><Res x={300} y={70} v/><Res x={220} y={190}/><Res x={380} y={190}/><Cap x={300} y={230} v/><Ground x={300} y={260}/>
  <path d="M300 40 v-10 m-14 0 h28 m-23 -6 h18 m-12 -6 h6" stroke={ink} strokeWidth="1.5" fill="none"/><Dot x={150} y={150}/><Dot x={450} y={150} color={green}/><Dot x={300} y={110}/><Dot x={300} y={190}/>
  <Label x={220} y={140} anchor="middle">C</Label><Label x={380} y={140} anchor="middle">C</Label><Label x={322} y={75}>R/2</Label><Label x={220} y={170} anchor="middle">R</Label><Label x={380} y={170} anchor="middle">R</Label><Label x={325} y={235}>2C</Label><Label x={50} y={155} anchor="end" kind="output">in</Label><Label x={550} y={155} kind="output">out</Label></svg>;
}
export function PoleLab(){
 const [mode,setMode]=useState<PoleMode>('poles'),[count,setCount]=useState(2),[fc,setFc]=useState(1000),[low,setLow]=useState(100),[highF,setHighF]=useState(10000),[loaded,setLoaded]=useState(false),[f0,setF0]=useState(1000);
 const hi=Math.max(low,highF),freqs=logspace(0,6,361);
 const H=(v:number)=>mode==='poles'?poleResponse({hz:v,fc,count}):mode==='bandpass'?bandResponse({hz:v,low,high:hi,loaded}):notchResponse({hz:v,f0});
 const ph=(v:number)=>mode==='poles'?-count*Math.atan(v/fc)*180/Math.PI:phase(H(v));
 const reset=()=>{setMode('poles');setCount(2);setFc(1000);setLow(100);setHighF(10000);setLoaded(false);setF0(1000)};
 const center=Math.sqrt(low*hi),peak=db(H(center));
 const readouts:[string,string,string][]=mode==='poles'?[['ULTIMATE SLOPE',f(-6.02*count,1),'dB/octave'],['GAIN AT fc',f(db(H(fc)),2),'dB'],['GAIN AT 10 fc',f(db(H(10*fc)),1),'dB']]:mode==='bandpass'?[['CENTER √(f_L f_H)',...eng(center,'Hz')],['GAIN AT CENTER',f(peak,2),'dB'],['−3 dB WIDTH',...eng(bandwidth(H,peak,center),'Hz')]]:[['NOTCH f₀',...eng(f0,'Hz')],['GAIN AT 2f₀',f(db(H(2*f0)),2),'dB'],['GAIN AT 1.1f₀',f(db(H(1.1*f0)),1),'dB']];
 return <div className="lab" aria-label="Poles, band-pass and notch experiment"><Head title="STACK CORNERS · SHAPE A BAND" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Filter"><button aria-pressed={mode==='poles'} onClick={()=>setMode('poles')}>Cascade poles</button><button aria-pressed={mode==='bandpass'} onClick={()=>setMode('bandpass')}>RC band-pass</button><button aria-pressed={mode==='notch'} onClick={()=>setMode('notch')}>Twin-T notch</button></div>
 <PoleCircuit mode={mode} count={count} loaded={loaded}/>
 <div className="horizontal-controls">{mode==='poles'&&<><Control label="Number of buffered poles" value={count} onChange={v=>setCount(Math.round(v))} min={1} max={4} step={1} unit=""/><Control label="Corner of each section" value={fc} onChange={setFc} min={1} max={5} step={.02} log unit="Hz"/></>}
 {mode==='bandpass'&&<><Control label="High-pass corner f_L" value={low} onChange={setLow} min={1} max={5} step={.02} log unit="Hz"/><Control label="Low-pass corner f_H" value={highF} onChange={setHighF} min={1} max={5} step={.02} log unit="Hz"/><label className="check"><input type="checkbox" checked={loaded} onChange={e=>setLoaded(e.target.checked)}/> Remove buffer (equal R)</label></>}
 {mode==='notch'&&<Control label="Notch frequency" value={f0} onChange={setF0} min={1} max={5} step={.02} log unit="Hz"/>}</div>
 <Readouts values={readouts}/>
 <div className="plot-area"><h4>{mode==='poles'?'Each pole adds 6 dB/octave and 90° of eventual lag':mode==='bandpass'?'A high-pass and a low-pass in cascade':'A deep null with gentle shoulders'}</h4><Plot curves={[{name:'Exact |H|',color:green,points:freqs.map(v=>[v,db(H(v))])},...(mode==='poles'?[{name:'Asymptotes',color:orange,dashed:true,points:freqs.map(v=>[v,-20*count*Math.max(0,Math.log10(v/fc))] as [number,number])}]:mode==='bandpass'?[{name:'Product of isolated sections',color:orange,dashed:true,points:freqs.map(v=>[v,db(bandResponse({hz:v,low,high:hi}))] as [number,number])}]:[])]} xRange={[1,1e6]} yRange={[-80,0]} xScale="log" xTicks={decades(0,6)} xLabel="FREQUENCY / Hz · LOG" yLabel="GAIN / dB" description={'Magnitude response for the selected '+mode+' filter.'}/>
 <Plot curves={[{name:'Phase',color:orange,points:freqs.map(v=>[v,ph(v)])}]} xRange={[1,1e6]} yRange={mode==='poles'?[-360,0]:[-90,90]} xScale="log" xTicks={decades(0,6)} xLabel="FREQUENCY / Hz · LOG" yLabel="PHASE / DEGREES" description="Phase response for the selected filter."/>
 <p className="plot-summary">{mode==='poles'?'Buffers make the sections independent, so responses multiply and decibels add. Without buffers, later sections load earlier ones and the corners separate.':mode==='bandpass'?(loaded?'Without the buffer, the second section loads the first. With equal corners the peak falls from −6.02 dB to −9.54 dB.':'With widely separated corners, the passband approaches 0 dB. Close corners overlap and lower the peak: equal corners give −6.02 dB.'):'Ideal twin-T with exact R, R/2, C, 2C; unloaded, ideal source. Its Q is only 1/4. Component mismatch leaves a finite null.'}</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> {mode==='poles'?'Go from 1 to 4 poles. At fc each pole gives −3 dB, so four give −12 dB: the corner softens as poles stack.':mode==='bandpass'?'Move the two corners together, then remove the buffer. The dashed curve is what you would get if the sections did not interact.':'Compare the gain at 2f₀ with the depth at f₀. A passive notch removes one frequency but also disturbs a wide neighborhood.'}</div></div>;
}
function bandwidth(H:(v:number)=>Z,peak:number,center:number){
 const target=peak-3.0103,solve=(a:number,b:number)=>{for(let k=0;k<80;k++){const m=Math.sqrt(a*b);if((db(H(m))>target)===(db(H(a))>target))a=m;else b=m;}return Math.sqrt(a*b);};
 return solve(center,center*1e4)-solve(center/1e4,center);
}

/* ---------- Chapter: resonance and LC filters ---------- */
export function ResonanceLab(){
 const [mh,setMh]=useState(10),[nf,setNf]=useState(100),[r,setR]=useState(47),[hz,setHz]=useState(4500);
 const p={r,l:mh/1000,c:nf*1e-9},d=resonance({...p,hz}),freqs=logspace(2,6,481);
 // Rotate every phasor so the loop current lies along the real axis.
 const toCurrent=polar(1,-phase(d.i)),rot=(z:Z)=>mul(z,toCurrent);
 if(!freqs.includes(d.f0)){freqs.push(d.f0);freqs.sort((a,b)=>a-b);}
 const reset=()=>{setMh(10);setNf(100);setR(47);setHz(4500)};
 return <div className="lab" aria-label="Series resonance experiment"><Head title="REACTANCES CANCEL · VOLTAGES DO NOT" reset={reset}/>
 <svg className="wide-circuit" viewBox="0 0 640 230" role="img" aria-label={'1 volt sine source drives series '+r+' ohms, '+engText(p.l,'H')+' and '+engText(p.c,'F')+'.'}>
  <Wires d="M90 92 V50 H180 M240 50 H320 M380 50 H480 V105 M480 165 V200 H90 V142"/><Source x={90} y={117} ac label="1 V"/><Res x={210} y={50}/><Ind x={350} y={50}/><Cap x={480} y={135} v/>
  <Label x={210} y={28} anchor="middle">R = {r} Ω</Label><Label x={350} y={28} anchor="middle">L = {engText(p.l,'H')}</Label><Label x={505} y={140}>C = {engText(p.c,'F')}</Label><Label x={210} y={88} anchor="middle" kind="value">V_R</Label><Label x={350} y={88} anchor="middle" kind="value">V_L</Label><Label x={505} y={162} kind="value">V_C</Label>
 </svg>
 <div className="horizontal-controls"><Control label="Inductance L" value={mh} onChange={setMh} min={-1} max={2} step={.02} log unit="mH"/><Control label="Capacitance C" value={nf} onChange={setNf} min={0} max={3} step={.02} log unit="nF"/><Control label="Series resistance R" value={r} onChange={setR} min={0} max={3} step={.02} log unit="Ω"/><Control label="Drive frequency" value={hz} onChange={setHz} min={2} max={6} step={.01} log unit="Hz"/></div>
 <Readouts values={[['RESONANCE f₀',...eng(d.f0,'Hz')],['QUALITY FACTOR Q',f(d.q,2),''],['|V_C| AT DRIVE f',f(mag(d.vc),mag(d.vc)<10?3:2),'V']]}/>
 <div className="plot-area split-plots"><div><h4>Voltage phasors, current as reference</h4><PhasorDiagram vectors={[{...rot(d.vr),color:green,label:'V_R',side:-1},{...rot(d.vl),from:rot(d.vr),color:orange,label:'V_L'},{...rot(d.vc),from:rot(d.vr),color:gray,label:'V_C'},{...rot(add(d.vl,d.vc)),from:rot(d.vr),color:ink,width:1.4,dashed:true},{...rot(C(1,0)),color:ink,dashed:true,width:1.6,label:'Vin',side:-1}]} description={'Resistor voltage '+f(mag(d.vr),3)+', inductor '+f(mag(d.vl),3)+', capacitor '+f(mag(d.vc),3)+' volts. V_L and V_C are drawn from the tip of V_R; their dashed net plus V_R equals the 1 volt source.'}/></div>
 <div><Plot curves={[{name:'|I| in mA',color:green,points:freqs.map(v=>[v,mag(resonance({...p,hz:v}).i)*1000])},{name:'Half-power level',color:gray,dashed:true,points:[[100,707.1/r],[1e6,707.1/r]]}]} xRange={[100,1e6]} yRange={[0,1100/r]} xScale="log" xTicks={decades(2,6)} xLabel="FREQUENCY / Hz · LOG" yLabel="CURRENT / mA" point={[hz,mag(d.i)*1000]} description={'Current peaks at '+f(1000/r,2)+' milliamps at resonance; half-power bandwidth '+engText(d.bw,'Hz')+'.'}/></div></div>
 <p className="plot-summary" style={{padding:'0 25px 16px'}}>Bandwidth between half-power points: {engText(d.bw,'Hz')} = f₀/Q. At resonance |V_L| = |V_C| = Q × 1 V = {f(d.q,2)} V even though the source supplies only 1 V. Ideal L and C; R represents every loss in the loop.</p>
 <div className="lab-prompt"><strong>Explore.</strong> Put the drive exactly at resonance and lower R: the current peak rises and narrows, and V_C grows. Detune slightly: V_L and V_C no longer cancel, their dashed net appears, and Vin tilts away from the current.</div></div>;
}
export function LCFilterLab(){
 const [uh,setUh]=useState(100),[uf,setUf]=useState(10),[rl,setRl]=useState(10),[rs,setRs]=useState(.1);
 const l=uh*1e-6,c=uf*1e-6,H=(v:number)=>lcResponse({hz:v,l,c,rs,rl}),f0=1/(2*Math.PI*Math.sqrt(l*c)),freqs=logspace(1,7,481);
 freqs.push(f0*Math.sqrt(1+rs/rl));freqs.sort((a,b)=>a-b);
 const a0=1+rs/rl,a1=rs*c+l/rl,q=Math.sqrt(a0*l*c)/a1,dc=db(H(1e-3)),peak=Math.max(...freqs.map(v=>db(H(v))));
 const reset=()=>{setUh(100);setUf(10);setRl(10);setRs(.1)};
 return <div className="lab" aria-label="LC low-pass filter experiment"><Head title="TWO REACTANCES · 12 dB PER OCTAVE" reset={reset}/>
 <svg className="wide-circuit" viewBox="0 0 640 230" role="img" aria-label={'Source with '+rs+' ohm resistance feeds series '+uh+' microhenry inductor, shunt '+uf+' microfarad capacitor, and '+rl+' ohm load.'}>
  <Wires d="M90 92 V50 H170 M230 50 H290 M350 50 H540 V105 M430 50 V105 M430 165 V200 M540 165 V200 H90 V142"/><Source x={90} y={117} ac label="Vin"/><Res x={200} y={50}/><Ind x={320} y={50}/><Cap x={430} y={135} v/><Res x={540} y={135} v/><Dot x={430} y={50} color={green}/><Dot x={430} y={200}/>
  <Label x={200} y={28} anchor="middle">Rs = {engText(rs,'Ω')}</Label><Label x={320} y={28} anchor="middle">{engText(l,'H')}</Label><Label x={455} y={140}>{engText(c,'F')}</Label><Label x={562} y={140}>{engText(rl,'Ω')}</Label><Label x={445} y={40} kind="output">Vout</Label>
 </svg>
 <div className="horizontal-controls"><Control label="Inductance" value={uh} onChange={setUh} min={0} max={3} step={.02} log unit="µH"/><Control label="Capacitance" value={uf} onChange={setUf} min={-2} max={2} step={.02} log unit="µF"/><Control label="Load resistance" value={rl} onChange={setRl} min={0} max={3} step={.02} log unit="Ω"/><Control label="Source resistance" value={rs} onChange={setRs} min={-2} max={1} step={.02} log unit="Ω"/></div>
 <Readouts values={[['NATURAL f₀',...eng(f0,'Hz')],['CHARACTERISTIC √(L/C)',...eng(Math.sqrt(l/c),'Ω')],['PEAKING ABOVE DC',f(peak-dc,2),'dB']]}/>
 <div className="plot-area"><h4>Flat, a possible peak, then −40 dB per decade</h4><Plot curves={[{name:'LC filter',color:green,points:freqs.map(v=>[v,db(H(v))])},{name:'One RC pole, same corner',color:gray,dashed:true,points:freqs.map(v=>[v,dc-10*Math.log10(1+(v/f0)**2)])},{name:'−40 dB/decade asymptote',color:orange,dashed:true,points:freqs.map(v=>[v,dc-40*Math.max(0,Math.log10(v/f0))])}]} xRange={[10,1e7]} yRange={[-90,30]} xScale="log" xTicks={decades(1,7)} xLabel="FREQUENCY / Hz · LOG" yLabel="GAIN / dB" description={'LC low-pass response with natural frequency '+engText(f0,'Hz')+' and quality factor '+f(q,2)+'. Peaking '+f(peak-dc,2)+' decibels.'}/>
 <p className="plot-summary">Q ≈ {f(q,2)} from the denominator 1 + Rs/Rₗ − ω²LC + jω(RsC + L/Rₗ). {q>.707?'Q above 0.707 produces a peak: the filter amplifies near f₀.':'Q at or below 0.707 gives no peak.'} Ideal L and C; inductor DC resistance and capacitor ESR would add damping. The same corner with one RC pole falls only 20 dB per decade.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Raise the load resistance toward 1 kΩ (a lightly loaded supply filter): the resonant peak grows. Then match Rₗ to √(L/C) and the peak nearly disappears.</div></div>;
}

/* ---------- Chapter: generalized Thévenin and capacitor applications ---------- */
export function SupplyLab(){
 const [uf,setUf]=useState(1),[esl,setEsl]=useState(2),[ls,setLs]=useState(200),[esr,setEsr]=useState(.01),[bypassed,setBypassed]=useState(true);
 const p={rs:.02,ls:ls*1e-9,c:uf*1e-6,esr,esl:esl*1e-9},Z=(v:number,b=bypassed)=>mag(supplyImpedance({...p,hz:v,bypassed:b})),freqs=logspace(3,9,481);
 // Anti-resonance: the largest interior local maximum of the bypassed impedance (not the ESL-dominated sweep end).
 let worst=0,where=0;const zs=freqs.map(v=>Z(v,true));for(let k=1;k<zs.length-1;k++)if(zs[k]>zs[k-1]&&zs[k]>=zs[k+1]&&zs[k]>worst){worst=zs[k];where=freqs[k];}
 const reset=()=>{setUf(1);setEsl(2);setLs(200);setEsr(.01);setBypassed(true)};
 return <div className="lab" aria-label="Bypass capacitor experiment"><Head title="WHAT THE LOAD SEES LOOKING BACK" reset={reset}/>
 <svg className="wide-circuit" viewBox="0 0 640 230" role="img" aria-label={'Supply with 20 milliohm resistance and '+ls+' nanohenry wiring inductance feeds a load. '+(bypassed?'A '+uf+' microfarad bypass capacitor with ESR and ESL sits at the load.':'No bypass capacitor.')}>
  <Wires d="M80 92 V50 H170 M230 50 H290 M350 50 H520 V105 M520 165 V200 H80 V142"/><Wires d="M420 50 V105 M420 165 V200" color={bypassed?ink:gray} dashed={!bypassed}/><Source x={80} y={117} label="Supply"/><Res x={200} y={50}/><Ind x={320} y={50}/>{bypassed?<Cap x={420} y={135} v/>:null}
  <circle cx="520" cy="135" r="25" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><path d="M520 150 V120 m-5 7 l5 -7 l5 7" stroke={ink} strokeWidth="1.8" fill="none"/>
  <Label x={200} y={28} anchor="middle">20 mΩ</Label><Label x={320} y={28} anchor="middle">{f(ls,0)} nH wiring</Label><Label x={400} y={135} anchor="end">{bypassed?engText(uf*1e-6,'F'):'no bypass'}</Label><Label x={400} y={157} anchor="end" kind="value">{bypassed?'+ ESR, ESL':''}</Label><Label x={555} y={140}>load</Label><Label x={555} y={160} kind="value">current steps</Label><Dot x={420} y={50} color={green}/>
 </svg>
 <div className="horizontal-controls"><Control label="Bypass capacitance" value={uf} onChange={setUf} min={-2} max={2} step={.02} log unit="µF"/><Control label="Capacitor ESL" value={esl} onChange={setEsl} min={.5} max={10} step={.1} unit="nH"/><Control label="Capacitor ESR" value={esr} onChange={setEsr} min={-3} max={0} step={.02} log unit="Ω"/><Control label="Supply wiring inductance" value={ls} onChange={setLs} min={1} max={3} step={.02} log unit="nH"/><label className="check"><input type="checkbox" checked={bypassed} onChange={e=>setBypassed(e.target.checked)}/> Fit bypass capacitor</label></div>
 <Readouts values={[['|Z| AT 1 MHz, BARE',...eng(Z(1e6,false),'Ω')],['|Z| AT 1 MHz, BYPASSED',...eng(Z(1e6,true),'Ω')],where?['ANTI-RESONANCE PEAK',...eng(worst,'Ω')]:['ANTI-RESONANCE PEAK','none','']]}/>
 <div className="plot-area"><h4>A bypass capacitor is a low impedance placed close to the load</h4><Plot curves={[{name:'Supply alone',color:orange,dashed:true,points:freqs.map(v=>[v,Z(v,false)])},...(bypassed?[{name:'With bypass capacitor',color:green,points:freqs.map(v=>[v,Z(v,true)] as [number,number])}]:[])]} xRange={[1e3,1e9]} yRange={[1e-4,1e4]} xScale="log" yScale="log" xTicks={decades(3,9)} xLabel="FREQUENCY / Hz · LOG" yLabel="IMPEDANCE SEEN BY LOAD / Ω · LOG" description={'Supply impedance rises with frequency because of wiring inductance. The bypass capacitor lowers it, except near an anti-resonance'+(where?' peak of '+engText(worst,'Ω')+' at '+engText(where,'Hz'):'')+'.'}/>
 <p className="plot-summary">{where?<>The bypassed network peaks at {engText(worst,'Ω')} near {engText(where,'Hz')}: a 100 mA load current component at that frequency would produce about {engText(worst*.1,'V')}. </>:'No anti-resonance peak in this range. '}The peak is a parallel resonance between wiring inductance and the bypass capacitor; ESR and source resistance damp it. Lumped model: no plane capacitance, via inductance or regulator feedback.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Lower ESR to 1 mΩ: the anti-resonance peak sharpens. Raise it to 0.1 Ω: the peak is damped but the minimum floor rises. Increase ESL and see the high-frequency side climb—capacitance no longer matters there.</div></div>;
}
export function ACTheveninLab(){
 const [rk,setRk]=useState(1),[nf,setNf]=useState(100),[rlk,setRlk]=useState(1),[hz,setHz]=useState(1000),[equivalent,setEquivalent]=useState(false);
 const p={r:rk*1e3,c:nf*1e-9,rl:rlk*1e3,vs:1},d=acThevenin({...p,hz}),freqs=logspace(1,5);
 const reset=()=>{setRk(1);setNf(100);setRlk(1);setHz(1000);setEquivalent(false)};
 return <div className="lab" aria-label="AC Thévenin equivalent experiment"><Head title="ONE PORT · ONE FREQUENCY · TWO NUMBERS" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Circuit view"><button aria-pressed={!equivalent} onClick={()=>setEquivalent(false)}>Original network</button><button aria-pressed={equivalent} onClick={()=>setEquivalent(true)}>Thévenin equivalent at {engText(hz,'Hz')}</button></div>
 <svg className="wide-circuit" viewBox="0 0 640 230" role="img" aria-label={equivalent?'Equivalent source '+f(mag(d.vth),3)+' volts at '+f(phase(d.vth),1)+' degrees in series with Zth = '+complexText(d.zth,'ohms')+' drives the load.':'1 volt sine source through resistor '+rk+' kiloohms to a node with capacitor '+nf+' nanofarads to ground and load '+rlk+' kiloohms.'}>
  {equivalent?<><Wires d="M90 92 V50 H200 M300 50 H520 V105 M520 165 V200 H90 V142"/><Source x={90} y={117} ac label={'Vth = '+f(mag(d.vth),3)+' V ∠'+f(phase(d.vth),1)+'°'}/><rect x="200" y="35" width="100" height="30" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><Label x={250} y={55} anchor="middle" kind="value">Zth</Label><Label x={250} y={88} anchor="middle">{complexText(d.zth,'Ω')}</Label></>
  :<><Wires d="M90 92 V50 H220 M280 50 H520 V105 M400 50 V105 M400 165 V200 M520 165 V200 H90 V142"/><Source x={90} y={117} ac label="1 V"/><Res x={250} y={50}/><Cap x={400} y={135} v/><Dot x={400} y={50}/><Dot x={400} y={200}/><Label x={250} y={28} anchor="middle">{rk} kΩ</Label><Label x={380} y={140} anchor="end">{engText(p.c,'F')}</Label></>}
  <Res x={520} y={135} v/><Label x={545} y={140}>Rₗ = {engText(p.rl,'Ω')}</Label><Dot x={520} y={50} color={green}/><Label x={470} y={38} kind="output">Vout</Label>
 </svg>
 <div className="horizontal-controls"><Control label="Series resistance R" value={rk} onChange={setRk} min={-1} max={2} step={.02} log unit="kΩ"/><Control label="Shunt capacitance C" value={nf} onChange={setNf} min={0} max={3} step={.02} log unit="nF"/><Control label="Load resistance" value={rlk} onChange={setRlk} min={-1} max={2} step={.02} log unit="kΩ"/><Control label="Frequency" value={hz} onChange={setHz} min={1} max={5} step={.02} log unit="Hz"/></div>
 <Readouts values={[['|Vth|',f(mag(d.vth),3),'V'],['|Zth|',...eng(mag(d.zth),'Ω')],['|Vout| LOADED',f(mag(d.out),3),'V']]}/>
 <div className="plot-area"><h4>Open-circuit and loaded output across frequency</h4><Plot curves={[{name:'|Vth| (no load)',color:orange,dashed:true,points:freqs.map(v=>[v,mag(acThevenin({...p,hz:v}).vth)])},{name:'|Vout| with load',color:green,points:freqs.map(v=>[v,mag(acThevenin({...p,hz:v}).out)])}]} xRange={[10,1e5]} yRange={[0,1.05]} xScale="log" xTicks={decades(1,5)} xLabel="FREQUENCY / Hz · LOG" yLabel="AMPLITUDE / V" point={[hz,mag(d.out)]} description={'At '+engText(hz,'Hz')+' the open-circuit voltage is '+f(mag(d.vth),3)+' volts and the loaded output '+f(mag(d.out),3)+' volts.'}/>
 <p className="plot-summary">Zth = R ∥ (1/jωC) = {complexText(d.zth,'Ω')}. Vout = Vth · Rₗ/(Zth + Rₗ) = {f(mag(d.out),3)} V ∠{f(phase(d.out),1)}°. The equivalent is valid at one frequency at a time: change the frequency and both Vth and Zth change.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Switch views at several frequencies: the load voltage is identical in both. At low frequency Zth → R; well above the corner Zth becomes small and capacitive, so the load matters less.</div></div>;
}
