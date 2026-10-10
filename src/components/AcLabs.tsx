import {M,htmlSub} from './MathText';
import {useState} from 'react';
import {C,add,mul,polar,mag,phase,db,network,phasorSum,powerWave,correction,loadedRC,poleResponse,bandResponse,notchResponse,resonance,lcResponse,acThevenin,supplyImpedance} from '../engine/ac.mjs';
import Plot from './Plot';
import {Control,Readouts,f} from './LabControls';
import {PhasorDiagram,eng,engText,logspace,green,orange,gray,ink} from './Parts';
import * as S from './Schematic';
type Z={re:number;im:number};
function Head({title,reset}:{title:string;reset:()=>void}){return <div className="lab-heading"><div><span className="live-dot"/><span className="tiny-label">{htmlSub(title)}</span></div><button onClick={reset}>Reset ↺</button></div>}
const pts=(fn:(x:number)=>number,a:number,b:number,n=240):[number,number][]=>Array.from({length:n+1},(_,k)=>{const x=a+(b-a)*k/n;return [x,fn(x)]});
const complexText=(z:Z,unit:string)=>engText(z.re,unit)+(z.im<0?' − j':' + j')+engText(Math.abs(z.im),unit);
const decades=(a:number,b:number)=>Array.from({length:b-a+1},(_,k)=>10**(a+k));

/* ---------- Chapter: phasors ---------- */
export function PhasorLab(){
 const [a2,setA2]=useState(.8),[p2,setP2]=useState(60),[wt,setWt]=useState(30);
 const s=phasorSum({a1:1,p1:0,a2,p2}),turn=polar(1,wt),rot=(z:Z)=>mul(z,turn);
 const v1=rot(polar(1,0)),v2=rot(polar(a2,p2)),sum=rot(s.sum),now=s.at(wt*Math.PI/180),sumPhase=s.amplitude<1e-12?null:s.phase;
 const reset=()=>{setA2(.8);setP2(60);setWt(30)};
 return <div className="lab" aria-label="Phasor addition experiment"><Head title="ROTATING ARROWS · ADDED TIP TO TAIL" reset={reset}/>
 <div className="horizontal-controls"><Control label="Amplitude of V_2 (V_1 = 1)" value={a2} onChange={setA2} min={0} max={2} step={.05} unit="V"/><Control label="Phase of V_2 relative to V_1" value={p2} onChange={setP2} min={-180} max={180} step={5} unit="°"/><Control label="Rotation angle ωt" value={wt} onChange={setWt} min={0} max={720} step={5} unit="°"/></div>
 <Readouts values={[['SUM AMPLITUDE',f(s.amplitude,3),'V'],['SUM PHASE',sumPhase===null?'undefined':f(sumPhase,1),sumPhase===null?'':'°'],['INSTANTANEOUS SUM',f(sumPhase===null?0:now,3),'V']]}/>
 <div className="plot-area split-plots"><div><h4>Complex plane at ωt = {f(wt,0)}°</h4><PhasorDiagram vectors={[{...v2,color:orange,dashed:true,width:1.4},{...v1,color:green,label:'V_1'},{...v2,from:v1,color:orange,label:'V_2'},{...sum,color:ink,label:'Sum'}]} circle={s.amplitude} scale={Math.max(1,a2,s.amplitude)*1.05} points={[{re:sum.re,im:0,color:ink},{re:v1.re,im:0,color:green}]} description={'Phasor V1 of length 1 and V2 of length '+f(a2,2)+' at '+p2+' degrees, rotated together by '+wt+' degrees. Their sum has length '+f(s.amplitude,3)+'. Dots on the real axis are the instantaneous values.'}/></div>
 <div><Plot curves={[{name:'v_1 = cos ωt',color:green,points:pts(t=>Math.cos(t*Math.PI/180),0,720)},{name:'v_2',color:orange,points:pts(t=>a2*Math.cos((t+p2)*Math.PI/180),0,720)},{name:'v_1 + v_2',color:ink,points:pts(t=>s.at(t*Math.PI/180),0,720)}]} xRange={[0,720]} xTicks={[0,180,360,540,720]} yRange={[-3,3]} xLabel="ωt / DEGREES" yLabel="INSTANTANEOUS VALUE / V" point={[wt,now]} description={'Two cosines and their sum over two periods. The sum is a single cosine with amplitude '+f(s.amplitude,3)+(sumPhase===null?'; the sum cancels and its phase is undefined.':' and phase '+f(sumPhase,1)+' degrees.')}/></div></div>
 <p className="plot-summary" style={{padding:'0 25px 16px'}}>Each signal is the real part of its rotating arrow: v(t) = Re{'{'}V e<sup>jωt</sup>{'}'}. Because both arrows rotate at the same rate, the shape of the triangle never changes—only its orientation. The dots are the projections onto the real axis.</p>
 <div className="lab-prompt"><strong>Explore.</strong> Set <M t="V_2"/> = 1 at 180°: the sum vanishes at every instant. Set 90°: the sum is √2 ≈ 1.414 at 45°. Then sweep ωt and watch the projection trace the time graph.</div></div>;
}

/* ---------- Chapter: impedance ---------- */
type Topo='series-rc'|'series-rl'|'series-rlc'|'parallel-rc'|'parallel-rlc';
const topoNames:Record<Topo,string>={'series-rc':'Series RC','series-rl':'Series RL','series-rlc':'Series RLC','parallel-rc':'Parallel RC','parallel-rlc':'Parallel RLC'};
function TwoTerminal({topology,values}:{topology:Topo;values:{r:string;l:string;c:string}}){
 const parts=(topology.endsWith('rlc')?['r','l','c']:topology.endsWith('rl')?['r','l']:['r','c']) as ('r'|'l'|'c')[];
 const series=topology.startsWith('series'),xs=parts.length===3?(series?[170,300,430]:[220,350,480]):(series?[200,370]:[260,420]);
 const Part=({k,a,b,label}:{k:'r'|'l'|'c';a:S.Pt;b:S.Pt;label?:string})=>k==='r'?<S.Res a={a} b={b} label={label}/>:k==='l'?<S.Ind a={a} b={b} label={label}/>:<S.Cap a={a} b={b} label={label}/>;
 return <S.Schematic height={260} description={topoNames[topology]+' network seen between two terminals: '+parts.map(p=>values[p]).join(', ')}>
  <S.Terminal at={[60,series?70:60]}/><S.Terminal at={[60,210]}/>
  {series?<>{parts.map((p,i)=>{const a:S.Pt=[xs[i]-50,70],b:S.Pt=[xs[i]+50,70];return <g key={p}><Part k={p} a={a} b={b} label={values[p]}/>{i===0&&<S.Wire pts={[[60,70],a]}/>}{i>0&&<S.Wire pts={[[xs[i-1]+50,70],a]}/>}</g>})}<S.Wire pts={[[xs.at(-1)!+50,70],[540,70],[540,210],[60,210]]}/></>
  :<><S.Wire pts={[[60,60],[xs.at(-1)!,60]]}/><S.Wire pts={[[60,210],[xs.at(-1)!,210]]}/>{parts.map((p,i)=><g key={p}><Part k={p} a={[xs[i],60]} b={[xs[i],210]} label={values[p]}/>{i<parts.length-1&&<><S.Dot at={[xs[i],60]}/><S.Dot at={[xs[i],210]}/></>}</g>)}</>}
  <S.Text x={80} y={150} kind="output">Z</S.Text><path d="M95 145 h30 m-7 -5 l7 5 l-7 5" stroke={green} strokeWidth="1.8" fill="none"/>
 </S.Schematic>;
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
 <div className="lab-prompt"><strong>Explore.</strong> In series RC, find the frequency where the green curve crosses 1.41 × R: there the phase is −45° and <M t="X_C"/> = R. In series RLC, find the minimum. Switch to parallel RLC: the same L and C now make a maximum.</div></div>;
}

/* ---------- Chapter: power ---------- */
export function PowerLab(){
 const [r,setR]=useState(100),[x,setX]=useState(100);
 const d=powerWave({vrms:10,r,x,hz:50}),vp=10*Math.SQRT2,ip=d.irms*Math.SQRT2,lo=d.p-d.apparent,hi=d.p+d.apparent;
 const reset=()=>{setR(100);setX(100)};
 return <div className="lab" aria-label="Power in a reactive load"><Head title="v × i, AVERAGED" reset={reset}/>
 <S.Schematic height={210} description={'10 volt RMS, 50 hertz source drives a '+r+' ohm resistor in series with a '+(x>=0?'inductive':'capacitive')+' reactance of '+Math.abs(x)+' ohms.'}>
  <S.Source kind="ac" a={[90,170]} b={[90,90]} label="10 V RMS"/><S.Wire pts={[[90,90],[90,40],[190,40]]}/><S.Res a={[190,40]} b={[290,40]} value={'R = '+r+' Ω'}/><S.Wire pts={[[290,40],[370,40]]}/>
  {x>=0?<S.Ind a={[370,40]} b={[470,40]} value={'X = +'+x+' Ω (inductive)'}/>:<S.Cap a={[370,40]} b={[470,40]} value={'X = '+x+' Ω (capacitive)'}/>}<S.Wire pts={[[470,40],[520,40],[520,170],[90,170]]}/>
 </S.Schematic>
 <div className="horizontal-controls"><Control label="Resistance R" value={r} onChange={setR} min={10} max={300} step={5} unit="Ω"/><Control label="Reactance X (− capacitive, + inductive)" value={x} onChange={setX} min={-300} max={300} step={5} unit="Ω"/></div>
 <Readouts values={[['REAL POWER P',f(d.p,3),'W'],['REACTIVE POWER Q',f(d.q,3),'var'],['POWER FACTOR',f(d.pf,3),x>0?'lagging':x<0?'leading':'']]}/>
 <div className="plot-area"><h4>Current {x>0?'lags':x<0?'leads':'is in phase with'} voltage by {f(Math.abs(d.angle),1)}°</h4><Plot curves={[{name:'v / Vpeak',color:gray,dashed:true,points:pts(t=>d.vt(t/1000)/vp,0,40)},{name:'i / Ipeak',color:green,points:pts(t=>d.it(t/1000)/ip,0,40)}]} xRange={[0,40]} yRange={[-1.1,1.1]} xLabel="TIME / ms" yLabel="NORMALIZED VALUE" description={'Voltage and current normalized to their peaks; current is shifted by '+f(d.angle,1)+' degrees.'}/>
 <div className="split-plots"><div><h4>Power triangle</h4><PhasorDiagram vectors={[{re:d.p,im:0,color:green,label:'P'},{re:0,im:d.q,from:{re:d.p,im:0},color:orange,label:'jQ'},{re:d.p,im:d.q,color:ink,label:'S'}]} xLabel="P / W" yLabel="Q / var" description={'Real power '+f(d.p,3)+' watts, reactive power '+f(d.q,3)+' var, apparent power '+f(d.apparent,3)+' volt-amperes.'}/></div>
 <div><Plot curves={[{name:'p(t) = v·i',color:orange,points:pts(t=>d.pt(t/1000),0,40)},{name:'Average P',color:green,dashed:true,points:[[0,d.p],[40,d.p]]},{name:'Zero',color:gray,points:[[0,0],[40,0]]}]} xRange={[0,40]} yRange={[Math.min(0,lo)*1.1-.01,hi*1.1]} xLabel="TIME / ms" yLabel="INSTANTANEOUS POWER / W" description={'Instantaneous power oscillates at twice the line frequency between '+f(lo,3)+' and '+f(hi,3)+' watts around an average of '+f(d.p,3)+' watts.'}/></div></div>
 <p className="plot-summary">I = {f(d.irms*1000,1)} mA RMS; apparent power S = <M t="V_{\mathrm{rms}} I_{\mathrm{rms}}"/> = {f(d.apparent,3)} VA. Instantaneous power swings by ±S around P at twice the line frequency; it is negative whenever v and i have opposite signs, meaning energy flows back to the source. Ideal reactance; 50 Hz.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Set R = 10 Ω and X = ±300 Ω: large current flows yet almost no average power. Set X = 0: p(t) never goes negative and PF = 1.</div></div>;
}
export function CorrectionLab(){
 const [uf,setUf]=useState(0);const base={vrms:230,hz:50,r:20,l:.05},d=correction({...base,c:uf*1e-6}),ideal=correction(base).ideal*1e6;
 return <div className="lab" aria-label="Power factor correction experiment"><Head title="CANCEL THE REACTIVE CURRENT LOCALLY" reset={()=>setUf(0)}/>
 <S.Schematic height={230} description={'230 volt RMS 50 hertz source feeds a 20 ohm plus 50 millihenry load with a '+f(uf,0)+' microfarad capacitor in parallel.'}>
  <S.Source kind="ac" a={[90,160]} b={[90,90]} label="230 V"/><S.Wire pts={[[90,90],[90,50],[520,50],[520,65]]}/><S.Res a={[520,65]} b={[520,125]} label="20 Ω"/><S.Ind a={[520,125]} b={[520,195]} label="50 mH"/>
  <S.Wire pts={[[520,195],[520,200],[90,200],[90,160]]}/><S.Cap a={[400,50]} b={[400,200]} label={f(uf,0)+' µF'} flipLabel/><S.Dot at={[400,50]}/><S.Dot at={[400,200]}/><S.CurrentArrow at={[220,50]} dir="right" label="I_line"/>
 </S.Schematic>
 <div className="horizontal-controls"><Control label="Correction capacitance" value={uf} onChange={setUf} min={0} max={250} step={1} unit="µF"/></div>
 <Readouts values={[['LINE CURRENT',f(mag(d.line),2),'A RMS'],['POWER FACTOR',f(d.pf,3),d.q>1e-6?'lagging':d.q<-1e-6?'leading':''],['REACTIVE POWER',f(d.q,0),'var']]}/>
 <div className="plot-area split-plots"><div><h4>Currents, voltage as reference</h4><PhasorDiagram vectors={[{...d.load,color:orange,label:'I load'},{...d.cap,from:d.load,color:ink,label:'I cap'},{...d.line,color:green,label:'I line',side:-1}]} scale={Math.max(mag(d.load),mag(d.line),mag(add(d.load,d.cap)))*1.05} description={'Load current '+f(mag(d.load),2)+' amps lagging. Capacitor current '+f(mag(d.cap),2)+' amps leading by 90 degrees. Line current '+f(mag(d.line),2)+' amps.'}/></div>
 <div><Plot curves={[{name:'Line current',color:green,points:pts(c=>mag(correction({...base,c:c*1e-6}).line),0,250)},{name:'Load current (unchanged)',color:orange,dashed:true,points:[[0,mag(d.load)],[250,mag(d.load)]]}]} xRange={[0,250]} yRange={[0,Math.max(12,mag(d.line)*1.1)]} xLabel="CORRECTION CAPACITANCE / µF" yLabel="RMS CURRENT / A" point={[uf,mag(d.line)]} description={'Line current is minimized at about '+f(ideal,1)+' microfarads, where it equals the in-phase part of the load current.'}/></div></div>
 <p className="plot-summary">Real power stays {f(d.p,0)} W at every setting. The ideal correction is {f(ideal,1)} µF. Beyond it, the circuit becomes net capacitive and line current rises again. Ideal sinusoidal source and capacitor; no harmonics.</p>
 <div className="lab-prompt"><strong>Explore.</strong> Raise C slowly. The load current is untouched, but the line no longer has to carry its reactive part back and forth.</div></div>;
}

/* ---------- Chapter: RC filters ---------- */
function RCSection({high,loaded,r,c,rl}:{high:boolean;loaded:boolean;r:string;c:string;rl:string}){
 return <S.Schematic height={250} description={(high?'High-pass: series capacitor '+c+', shunt resistor '+r:'Low-pass: series resistor '+r+', shunt capacitor '+c)+(loaded?', with load '+rl:', unloaded')+'.'}>
  <S.Source kind="ac" a={[85,190]} b={[85,110]} label="V_in"/><S.Wire pts={[[85,110],[85,50],[225,50]]}/>{high?<S.Cap a={[225,50]} b={[325,50]} label={c}/>:<S.Res a={[225,50]} b={[325,50]} label={r}/>}
  <S.Wire pts={[[325,50],[loaded?540:420,50]]}/>{high?<S.Res a={[400,50]} b={[400,215]} label={r}/>:<S.Cap a={[400,50]} b={[400,215]} label={c}/>}
  {loaded?<><S.Res a={[540,50]} b={[540,215]} label={rl} color={orange}/><S.Dot at={[400,215]}/></>:<S.Terminal at={[420,50]}/>}<S.Wire pts={[[loaded?540:400,215],[85,215],[85,190]]}/>
  <S.Dot at={[400,50]} color={green}/><S.Ground at={[200,215]}/><S.Text x={412} y={38} kind="output">V_out</S.Text>
 </S.Schematic>;
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
 <Readouts values={[['CORNER f_3dB',...eng(fc,'Hz')],['GAIN AT TEST f',f(db(h),2),'dB'],['PHASE AT TEST f',f(phase(h),1),'°']]}/>
 <div className="plot-area"><h4>Magnitude: flat, a corner, then 20 dB per decade</h4><Plot curves={[{name:'Exact |H|',color:green,points:freqs.map(v=>[v,db(H(v))])},{name:'Straight-line asymptotes',color:orange,dashed:true,points:freqs.map(v=>[v,20*Math.log10(g0)+(high?Math.min(0,20*Math.log10(v/fc)):Math.min(0,-20*Math.log10(v/fc)))])}]} xRange={[1,1e6]} yRange={[-80,0]} xScale="log" xTicks={decades(0,6)} xLabel="FREQUENCY / Hz · LOG" yLabel="GAIN / dB" point={[hz,db(h)]} description={'Bode magnitude of the '+(high?'high':'low')+'-pass filter. Corner at '+engText(fc,'Hz')+'. At the test frequency the gain is '+f(db(h),2)+' decibels.'}/>
 <Plot curves={[{name:'Phase of H',color:orange,points:freqs.map(v=>[v,phase(H(v))])}]} xRange={[1,1e6]} yRange={[-90,90]} xScale="log" xTicks={decades(0,6)} xLabel="FREQUENCY / Hz · LOG" yLabel="PHASE / DEGREES" point={[hz,phase(h)]} description={'Phase moves through '+(high?'+45':'−45')+' degrees at the corner, approaching '+(high?'+90 below':'−90 above')+' it.'}/>
 <Plot curves={[{name:'Input',color:gray,dashed:true,points:pts(t=>Math.sin(2*Math.PI*t),0,2)},{name:'Output',color:green,points:pts(t=>mag(h)*Math.sin(2*Math.PI*t+phase(h)*Math.PI/180),0,2)}]} xRange={[0,2]} yRange={[-1.1,1.1]} xLabel="TIME / PERIODS OF THE TEST FREQUENCY" yLabel="VOLTAGE / V" description={'At the test frequency the output is '+f(mag(h),3)+' times the input, shifted '+f(phase(h),1)+' degrees.'}/>
 <p className="plot-summary">At the test frequency, |H| = {f(mag(h),4)} and f/<M t="f_{3\mathrm{dB}}"/> = {f(hz/fc,3)}. {htmlSub(loaded?(high?'The load sits in parallel with R, so the corner rises to 1/(2π(R∥R_L)C).':'The load forms a divider with R (DC gain '+f(20*Math.log10(g0),2)+' dB) and its parallel combination with R sets the corner.'):'Unloaded output, ideal source.')} Steady-state sine response; the start-up transient is omitted.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Put the test frequency at the corner: −3.01 dB and ±45°. Move it one decade beyond: about −20 dB and nearly ±90°. Then connect a 10 kΩ load to the low-pass and see both the DC gain and the corner change.</div></div>;
}

/* ---------- Chapter: poles, band-pass and notch ---------- */
type PoleMode='poles'|'bandpass'|'notch';
function Buffer({x,y}:{x:number;y:number}){return <g data-pins={x+','+y+' '+(x+30)+','+y}><polygon points={`${x},${y-18} ${x},${y+18} ${x+30},${y}`} fill="var(--white)" stroke={ink} strokeWidth="1.8"/><text x={x+9} y={y+4} className="symbol-value">×1</text></g>}
function PoleCircuit({mode,count,loaded}:{mode:PoleMode;count:number;loaded:boolean}){
 if(mode==='poles')return <S.Schematic height={220} description={count+' identical RC low-pass sections, each followed by a unity-gain buffer.'}>
  <S.Terminal at={[50,80]} label="in" side="above"/>
  {Array.from({length:count},(_,i)=>{const x=50+i*140;return <g key={i}><S.Res a={[x,80]} b={[x+80,80]}/><S.Wire pts={[[x+80,80],[x+105,80]]}/><S.Cap a={[x+95,80]} b={[x+95,175]}/><S.Ground at={[x+95,175]}/><Buffer x={x+105} y={80}/><S.Dot at={[x+95,80]}/>{i<count-1&&<S.Wire pts={[[x+135,80],[x+140,80]]}/>}</g>})}
  <S.Wire pts={[[50+count*140-5,80],[50+count*140+10,80]]}/><S.Terminal at={[50+count*140+10,80]} label="out" side="above"/></S.Schematic>;
 if(mode==='bandpass')return <S.Schematic height={220} description={'High-pass section: series C then shunt R. '+(loaded?'Connected directly':'Through a buffer')+' to a low-pass section: series R then shunt C.'}>
  <S.Terminal at={[60,70]} label="in" side="above"/><S.Wire pts={[[60,70],[90,70]]}/><S.Cap a={[90,70]} b={[150,70]} value="sets f_low"/><S.Wire pts={[[150,70],[loaded?260:215,70]]}/><S.Res a={[190,70]} b={[190,180]}/><S.Ground at={[190,180]}/>
  {!loaded&&<><Buffer x={215} y={70}/><S.Wire pts={[[245,70],[260,70]]}/></>}<S.Res a={[260,70]} b={[340,70]} value="sets f_high"/><S.Wire pts={[[340,70],[460,70]]}/><S.Cap a={[380,70]} b={[380,180]}/><S.Ground at={[380,180]}/>
  <S.Dot at={[190,70]}/><S.Dot at={[380,70]} color={green}/><S.Terminal at={[460,70]} label="out" side="above"/>
  <S.Text x={300} y={208} anchor="middle" kind="value">{loaded?'equal resistors, no buffer: sections interact':'buffer isolates the sections'}</S.Text></S.Schematic>;
 return <S.Schematic height={290} description="Twin-T notch. Upper T: two series capacitors C with a resistor R/2 from their junction to ground. Lower T: two series resistors R with a capacitor 2C from their junction to ground. Both T networks join the same input and output.">
  <S.Terminal at={[60,150]} label="in"/><S.Wire pts={[[60,150],[150,150]]}/><S.Wire pts={[[150,110],[150,190]]}/><S.Wire pts={[[450,110],[450,190]]}/><S.Wire pts={[[450,150],[540,150]]}/><S.Terminal at={[540,150]} label="out" side="right"/>
  <S.Wire pts={[[150,110],[190,110]]}/><S.Cap a={[190,110]} b={[250,110]} label="C"/><S.Wire pts={[[250,110],[350,110]]}/><S.Cap a={[350,110]} b={[410,110]} label="C"/><S.Wire pts={[[410,110],[450,110]]}/>
  <S.Res a={[300,110]} b={[300,40]} label="R/2"/><path d="M300 40 v-8 m-13 0 h26 m-21 -6 h16 m-11 -6 h6" stroke={ink} strokeWidth="1.8" fill="none"/>
  <S.Wire pts={[[150,190],[180,190]]}/><S.Res a={[180,190]} b={[260,190]} value="R"/><S.Wire pts={[[260,190],[340,190]]}/><S.Res a={[340,190]} b={[420,190]} value="R"/><S.Wire pts={[[420,190],[450,190]]}/>
  <S.Cap a={[300,190]} b={[300,260]} label="2C"/><S.Ground at={[300,260]}/>
  <S.Dot at={[150,150]}/><S.Dot at={[450,150]} color={green}/><S.Dot at={[300,110]}/><S.Dot at={[300,190]}/></S.Schematic>;
}
export function PoleLab(){
 const [mode,setMode]=useState<PoleMode>('poles'),[count,setCount]=useState(2),[fc,setFc]=useState(1000),[low,setLow]=useState(100),[highF,setHighF]=useState(10000),[loaded,setLoaded]=useState(false),[f0,setF0]=useState(1000);
 const hi=Math.max(low,highF),freqs=logspace(0,6,361);
 const H=(v:number)=>mode==='poles'?poleResponse({hz:v,fc,count}):mode==='bandpass'?bandResponse({hz:v,low,high:hi,loaded}):notchResponse({hz:v,f0});
 const ph=(v:number)=>mode==='poles'?-count*Math.atan(v/fc)*180/Math.PI:phase(H(v));
 const reset=()=>{setMode('poles');setCount(2);setFc(1000);setLow(100);setHighF(10000);setLoaded(false);setF0(1000)};
 const center=Math.sqrt(low*hi),peak=db(H(center));
 const readouts:[string,string,string][]=mode==='poles'?[['ULTIMATE SLOPE',f(-6.02*count,1),'dB/octave'],['GAIN AT fc',f(db(H(fc)),2),'dB'],['GAIN AT 10 fc',f(db(H(10*fc)),1),'dB']]:mode==='bandpass'?[['CENTER √(f_L f_H)',...eng(center,'Hz')],['GAIN AT CENTER',f(peak,2),'dB'],['−3 dB WIDTH',...eng(bandwidth(H,peak,center),'Hz')]]:[['NOTCH f_0',...eng(f0,'Hz')],['GAIN AT 2f_0',f(db(H(2*f0)),2),'dB'],['GAIN AT 1.1f_0',f(db(H(1.1*f0)),1),'dB']];
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
 <div className="lab-prompt"><strong>Explore.</strong> {htmlSub(mode==='poles'?'Go from 1 to 4 poles. At fc each pole gives −3 dB, so four give −12 dB: the corner softens as poles stack.':mode==='bandpass'?'Move the two corners together, then remove the buffer. The dashed curve is what you would get if the sections did not interact.':'Compare the gain at 2f_0 with the depth at f_0. A passive notch removes one frequency but also disturbs a wide neighborhood.')}</div></div>;
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
 <S.Schematic height={230} description={'1 volt sine source drives series '+r+' ohms, '+engText(p.l,'H')+' and '+engText(p.c,'F')+'.'}>
  <S.Source kind="ac" a={[90,170]} b={[90,100]} label="1 V"/><S.Wire pts={[[90,100],[90,50],[160,50]]}/><S.Res a={[160,50]} b={[260,50]} label={'R = '+r+' Ω'} value="V_R"/><S.Wire pts={[[260,50],[300,50]]}/>
  <S.Ind a={[300,50]} b={[400,50]} label={'L = '+engText(p.l,'H')} value="V_L"/><S.Wire pts={[[400,50],[480,50]]}/><S.Cap a={[480,50]} b={[480,200]} label={'C = '+engText(p.c,'F')} value="V_C"/><S.Wire pts={[[480,200],[90,200],[90,170]]}/>
 </S.Schematic>
 <div className="horizontal-controls"><Control label="Inductance L" value={mh} onChange={setMh} min={-1} max={2} step={.02} log unit="mH"/><Control label="Capacitance C" value={nf} onChange={setNf} min={0} max={3} step={.02} log unit="nF"/><Control label="Series resistance R" value={r} onChange={setR} min={0} max={3} step={.02} log unit="Ω"/><Control label="Drive frequency" value={hz} onChange={setHz} min={2} max={6} step={.01} log unit="Hz"/></div>
 <Readouts values={[['RESONANCE f_0',...eng(d.f0,'Hz')],['QUALITY FACTOR Q',f(d.q,2),''],['|V_C| AT DRIVE f',f(mag(d.vc),mag(d.vc)<10?3:2),'V']]}/>
 <div className="plot-area split-plots"><div><h4>Voltage phasors, current as reference</h4><PhasorDiagram vectors={[{...rot(d.vr),color:green,label:'V_R',side:-1},{...rot(d.vl),from:rot(d.vr),color:orange,label:'V_L'},{...rot(d.vc),from:rot(d.vr),color:gray,label:'V_C'},{...rot(add(d.vl,d.vc)),from:rot(d.vr),color:ink,width:1.4,dashed:true},{...rot(C(1,0)),color:ink,dashed:true,width:1.6,label:'V_in',side:-1}]} description={'Resistor voltage '+f(mag(d.vr),3)+', inductor '+f(mag(d.vl),3)+', capacitor '+f(mag(d.vc),3)+' volts. V_L and V_C are drawn from the tip of V_R; their dashed net plus V_R equals the 1 volt source.'}/></div>
 <div><Plot curves={[{name:'|I| in mA',color:green,points:freqs.map(v=>[v,mag(resonance({...p,hz:v}).i)*1000])},{name:'Half-power level',color:gray,dashed:true,points:[[100,707.1/r],[1e6,707.1/r]]}]} xRange={[100,1e6]} yRange={[0,1100/r]} xScale="log" xTicks={decades(2,6)} xLabel="FREQUENCY / Hz · LOG" yLabel="CURRENT / mA" point={[hz,mag(d.i)*1000]} description={'Current peaks at '+f(1000/r,2)+' milliamps at resonance; half-power bandwidth '+engText(d.bw,'Hz')+'.'}/></div></div>
 <p className="plot-summary" style={{padding:'0 25px 16px'}}>Bandwidth between half-power points: {engText(d.bw,'Hz')} = <M t="f_0"/>/Q. At resonance |<M t="V_L"/>| = |<M t="V_C"/>| = Q × 1 V = {f(d.q,2)} V even though the source supplies only 1 V. Ideal L and C; R represents every loss in the loop.</p>
 <div className="lab-prompt"><strong>Explore.</strong> Put the drive exactly at resonance and lower R: the current peak rises and narrows, and <M t="V_C"/> grows. Detune slightly: <M t="V_L"/> and <M t="V_C"/> no longer cancel, their dashed net appears, and <M t="V_{\mathrm{in}}"/> tilts away from the current.</div></div>;
}
export function LCFilterLab(){
 const [uh,setUh]=useState(100),[uf,setUf]=useState(10),[rl,setRl]=useState(10),[rs,setRs]=useState(.1);
 const l=uh*1e-6,c=uf*1e-6,H=(v:number)=>lcResponse({hz:v,l,c,rs,rl}),a0=1+rs/rl,a1=rs*c+l/rl,q=Math.sqrt(a0*l*c)/a1,f0=Math.sqrt(a0/(l*c))/(2*Math.PI),freqs=logspace(1,7,481);
 const fp=q>Math.SQRT1_2?f0*Math.sqrt(1-1/(2*q*q)):0;
 if(fp>=10&&fp<=1e7)freqs.push(fp);freqs.sort((a,b)=>a-b);
 const dc=-20*Math.log10(a0),peak=Math.max(dc,...freqs.map(v=>db(H(v))));
 const reset=()=>{setUh(100);setUf(10);setRl(10);setRs(.1)};
 return <div className="lab" aria-label="LC low-pass filter experiment"><Head title="TWO REACTANCES · 12 dB PER OCTAVE" reset={reset}/>
 <S.Schematic height={230} description={'Source with '+rs+' ohm resistance feeds series '+uh+' microhenry inductor, shunt '+uf+' microfarad capacitor, and '+rl+' ohm load.'}>
  <S.Source kind="ac" a={[90,170]} b={[90,100]} label="V_in"/><S.Wire pts={[[90,100],[90,50],[150,50]]}/><S.Res a={[150,50]} b={[240,50]} label={'R_s = '+engText(rs,'Ω')}/><S.Wire pts={[[240,50],[270,50]]}/>
  <S.Ind a={[270,50]} b={[370,50]} label={engText(l,'H')}/><S.Wire pts={[[370,50],[540,50]]}/><S.Cap a={[430,50]} b={[430,200]} label={engText(c,'F')}/><S.Res a={[540,50]} b={[540,200]} label={engText(rl,'Ω')} value="load"/>
  <S.Wire pts={[[540,200],[90,200],[90,170]]}/><S.Dot at={[430,50]} color={green}/><S.Dot at={[430,200]}/><S.Text x={445} y={40} kind="output">V_out</S.Text>
 </S.Schematic>
 <div className="horizontal-controls"><Control label="Inductance" value={uh} onChange={setUh} min={0} max={3} step={.02} log unit="µH"/><Control label="Capacitance" value={uf} onChange={setUf} min={-2} max={2} step={.02} log unit="µF"/><Control label="Load resistance" value={rl} onChange={setRl} min={0} max={3} step={.02} log unit="Ω"/><Control label="Source resistance" value={rs} onChange={setRs} min={-2} max={1} step={.02} log unit="Ω"/></div>
 <Readouts values={[['NATURAL f_n',...eng(f0,'Hz')],['CHARACTERISTIC √(L/C)',...eng(Math.sqrt(l/c),'Ω')],['PEAKING ABOVE DC',f(peak-dc,2),'dB']]}/>
 <div className="plot-area"><h4>Flat, a possible peak, then −40 dB per decade</h4><Plot curves={[{name:'LC filter',color:green,points:freqs.map(v=>[v,db(H(v))])},{name:'One RC pole, same corner',color:gray,dashed:true,points:freqs.map(v=>[v,dc-10*Math.log10(1+(v/f0)**2)])},{name:'−40 dB/decade asymptote',color:orange,dashed:true,points:freqs.map(v=>[v,dc-40*Math.max(0,Math.log10(v/f0))])}]} xRange={[10,1e7]} yRange={[-90,30]} xScale="log" xTicks={decades(1,7)} xLabel="FREQUENCY / Hz · LOG" yLabel="GAIN / dB" description={'LC low-pass response with natural frequency '+engText(f0,'Hz')+' and quality factor '+f(q,2)+'. Peaking '+f(peak-dc,2)+' decibels.'}/>
 <p className="plot-summary">Q = {f(q,2)} after normalizing the denominator 1 + <M t="R_s/R_L"/> − ω²LC + jω(<M t="R_s"/>C + L/<M t="R_L"/>). {htmlSub(q>Math.SQRT1_2?'Q above 0.707 produces a peak above the DC gain, near f_n.':'Q at or below 0.707 gives no peak above the DC gain.')} Ideal L and C; inductor DC resistance and capacitor ESR would add damping. The same corner with one RC pole falls only 20 dB per decade.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Raise the load resistance toward 1 kΩ (a lightly loaded supply filter): the resonant peak grows. Then lower <M t="R_L"/> toward √(L/C): damping increases. For a nearly ideal source, <M t="R_L=\sqrt{L/C}/\sqrt2"/> gives the flat Butterworth response.</div></div>;
}

/* ---------- Chapter: generalized Thévenin and capacitor applications ---------- */
export function SupplyLab(){
 const [uf,setUf]=useState(1),[esl,setEsl]=useState(2),[ls,setLs]=useState(200),[esr,setEsr]=useState(.01),[bypassed,setBypassed]=useState(true);
 const p={rs:.02,ls:ls*1e-9,c:uf*1e-6,esr,esl:esl*1e-9},Z=(v:number,b=bypassed)=>mag(supplyImpedance({...p,hz:v,bypassed:b})),freqs=logspace(3,9,481);
 // Anti-resonance: the largest interior local maximum of the bypassed impedance (not the ESL-dominated sweep end).
 let worst=0,where=0;const zs=freqs.map(v=>Z(v,true));for(let k=1;k<zs.length-1;k++)if(zs[k]>zs[k-1]&&zs[k]>=zs[k+1]&&zs[k]>worst){worst=zs[k];where=freqs[k];}
 const reset=()=>{setUf(1);setEsl(2);setLs(200);setEsr(.01);setBypassed(true)};
 return <div className="lab" aria-label="Bypass capacitor experiment"><Head title="WHAT THE LOAD SEES LOOKING BACK" reset={reset}/>
 <S.Schematic height={230} description={'Supply with 20 milliohm resistance and '+ls+' nanohenry wiring inductance feeds a load. '+(bypassed?'A '+uf+' microfarad bypass capacitor with ESR and ESL sits at the load.':'No bypass capacitor.')}>
  <S.Source a={[80,170]} b={[80,100]} label="supply"/><S.Wire pts={[[80,100],[80,50],[150,50]]}/><S.Res a={[150,50]} b={[240,50]} label="20 mΩ"/><S.Wire pts={[[240,50],[270,50]]}/><S.Ind a={[270,50]} b={[370,50]} label={f(ls,0)+' nH wiring'}/>
  <S.Wire pts={[[370,50],[520,50]]}/>{bypassed?<S.Cap a={[420,50]} b={[420,200]} label={engText(uf*1e-6,'F')} value="+ ESR, ESL" flipLabel/>:<S.Text x={395} y={145} kind="value" anchor="middle">No local C</S.Text>}
  <S.CurrentSource a={[520,50]} b={[520,200]} label="load" value="pulsed"/><S.Wire pts={[[520,200],[80,200],[80,170]]}/><S.Dot at={[420,50]} color={green}/>{bypassed&&<S.Dot at={[420,200]}/>}
 </S.Schematic>
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
 <S.Schematic height={230} description={equivalent?'Equivalent source '+f(mag(d.vth),3)+' volts at '+f(phase(d.vth),1)+' degrees in series with Z_th = '+complexText(d.zth,'ohms')+' drives the load.':'1 volt sine source through resistor '+rk+' kiloohms to a node with capacitor '+nf+' nanofarads to ground and load '+rlk+' kiloohms.'}>
  {equivalent?<><S.Source kind="ac" a={[90,170]} b={[90,100]} label={'V_th = '+f(mag(d.vth),3)+' V'} value={'∠'+f(phase(d.vth),1)+'°'}/><S.Wire pts={[[90,100],[90,50],[200,50]]}/>
    <g data-pins="200,50 300,50"><rect x="200" y="35" width="100" height="30" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><S.Text x={250} y={55} anchor="middle" kind="value">Z_th</S.Text><S.Text x={250} y={88} anchor="middle">{complexText(d.zth,'Ω')}</S.Text></g><S.Wire pts={[[300,50],[520,50]]}/></>
  :<><S.Source kind="ac" a={[90,170]} b={[90,100]} label="1 V"/><S.Wire pts={[[90,100],[90,50],[200,50]]}/><S.Res a={[200,50]} b={[300,50]} label={rk+' kΩ'}/><S.Wire pts={[[300,50],[520,50]]}/>
    <S.Cap a={[400,50]} b={[400,200]} label={engText(p.c,'F')} flipLabel/><S.Dot at={[400,50]}/><S.Dot at={[400,200]}/></>}
  <S.Res a={[520,50]} b={[520,200]} label={'R_L = '+engText(p.rl,'Ω')}/><S.Wire pts={[[520,200],[90,200],[90,170]]}/><S.Dot at={[520,50]} color={green}/><S.Text x={470} y={38} kind="output">V_out</S.Text>
 </S.Schematic>
 <div className="horizontal-controls"><Control label="Series resistance R" value={rk} onChange={setRk} min={-1} max={2} step={.02} log unit="kΩ"/><Control label="Shunt capacitance C" value={nf} onChange={setNf} min={0} max={3} step={.02} log unit="nF"/><Control label="Load resistance" value={rlk} onChange={setRlk} min={-1} max={2} step={.02} log unit="kΩ"/><Control label="Frequency" value={hz} onChange={setHz} min={1} max={5} step={.02} log unit="Hz"/></div>
 <Readouts values={[['|V_th|',f(mag(d.vth),3),'V'],['|Z_th|',...eng(mag(d.zth),'Ω')],['|V_out| LOADED',f(mag(d.out),3),'V']]}/>
 <div className="plot-area"><h4>Open-circuit and loaded output across frequency</h4><Plot curves={[{name:'|V_th| (no load)',color:orange,dashed:true,points:freqs.map(v=>[v,mag(acThevenin({...p,hz:v}).vth)])},{name:'|V_out| with load',color:green,points:freqs.map(v=>[v,mag(acThevenin({...p,hz:v}).out)])}]} xRange={[10,1e5]} yRange={[0,1.05]} xScale="log" xTicks={decades(1,5)} xLabel="FREQUENCY / Hz · LOG" yLabel="AMPLITUDE / V" point={[hz,mag(d.out)]} description={'At '+engText(hz,'Hz')+' the open-circuit voltage is '+f(mag(d.vth),3)+' volts and the loaded output '+f(mag(d.out),3)+' volts.'}/>
 <p className="plot-summary"><M t="Z_{\mathrm{th}}"/> = R ∥ (1/jωC) = {complexText(d.zth,'Ω')}. <M t="V_{\mathrm{out}}"/> = <M t="V_{\mathrm{th}}"/> · <M t="R_L"/>/(<M t="Z_{\mathrm{th}}"/> + <M t="R_L"/>) = {f(mag(d.out),3)} V ∠{f(phase(d.out),1)}°. The equivalent is valid at one frequency at a time: change the frequency and both <M t="V_{\mathrm{th}}"/> and <M t="Z_{\mathrm{th}}"/> change.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Switch views at several frequencies: the load voltage is identical in both. At low frequency <M t="Z_{\mathrm{th}}"/> → R; well above the corner <M t="Z_{\mathrm{th}}"/> becomes small and capacitive, so the load matters less.</div></div>;
}
