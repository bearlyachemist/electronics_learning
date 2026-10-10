import {useState} from 'react';
import {capacitor,rc,filter,capacitorImpedance,inductor,transformer} from '../engine/passives.mjs';
import Plot from './Plot';
import {Control,Readouts,f} from './LabControls';
import {Schematic,Wire,Res,Cap,Ind,Source,CurrentSource,Ground,Dot,Terminal,Text,green,orange,gray,ink,type Pt} from './Schematic';
import {Tx,htmlSub} from './MathText';
const samples=(fn:(x:number)=>number,end:number,count=161):[number,number][]=>Array.from({length:count},(_,i)=>{const x=i/(count-1)*end;return [x,fn(x)]});
const number=(v:number)=>Number(v.toPrecision(4)).toString();
function Head({title,reset}:{title:string;reset:()=>void}){return <div className="lab-heading"><div><span className="live-dot"/><span className="tiny-label">{htmlSub(title)}</span></div><button onClick={reset}>Reset ↺</button></div>}
function Circuit({kind,source,series='',element,node,clamp=false}:{kind:'cap'|'lowpass'|'highpass'|'inductor';source:string;series?:string;element:string;node:string;clamp?:boolean}) {
 const N:Pt=[405,50],bot:Pt=[405,230];
 return <Schematic width={640} height={280} description={source+'. '+(series?series+' in series. ':'')+element+'. '+node}>
  {kind==='cap'?<CurrentSource a={[85,215]} b={[85,125]} label={source}/>
   :clamp?<Source a={[85,125]} b={[85,215]} label={source}/>
   :<Source kind={/sine/.test(source)?'ac':'dc'} a={[85,215]} b={[85,125]} label={source}/>}
  {kind==='cap'||clamp?<><Wire pts={[[85,125],[85,50],N]}/>{clamp&&<Text x={245} y={36} anchor="middle" kind="value">{series}</Text>}</>
   :<><Wire pts={[[85,125],[85,50],[200,50]]}/>
     {kind==='highpass'?<Cap a={[200,50]} b={[310,50]} label={series}/>:<Res a={[200,50]} b={[310,50]} label={series}/>}
     <Wire pts={[[310,50],N]}/></>}
  {kind==='highpass'?<Res a={N} b={bot} label={element}/>:kind==='inductor'?<Ind a={N} b={bot} label={element}/>:<Cap a={N} b={bot} label={element}/>}
  <Wire pts={[bot,[85,230],[85,215]]}/><Ground at={[245,230]}/><Dot at={N} color={green}/>
  <Text x={425} y={32} kind="output">{node}</Text>
 </Schematic>;
}
export function CapacitorLab(){
 const [uf,setUf]=useState(100),[ma,setMa]=useState(1),[ms,setMs]=useState(100);
 const calc=(time:number)=>capacitor({current:ma/1000,c:uf*1e-6,t:time/1000});
 const d=calc(ms),end=calc(200).voltage,pad=Math.max(.1,Math.abs(end)*.1);
 return <div className="lab" aria-label="Constant-current capacitor experiment"><Head title="CHARGE → VOLTAGE → ENERGY" reset={()=>{setUf(100);setMa(1);setMs(100)}}/>
 <Circuit kind="cap" source={'I = '+f(ma,1)+' mA'} element={'C = '+number(uf)+' µF'} node={'V = '+f(d.voltage)+' V'}/>
 <div className="horizontal-controls"><Control label="Charging current" value={ma} onChange={setMa} min={-5} max={5} step={.1} unit="mA"/><Control label="Capacitance" value={uf} onChange={setUf} min={1} max={3} step={.05} log unit="µF"/><Control label="Elapsed time" value={ms} onChange={setMs} min={0} max={200} unit="ms"/></div>
 <Readouts values={[['VOLTAGE',f(d.voltage),'V'],['SIGNED PLATE CHARGE',f(d.charge*1e6),'µC'],['STORED ENERGY',f(d.energy*1e6),'µJ']]}/>
 <div className="plot-area"><h4>Constant current makes a straight voltage ramp</h4><Plot curves={[{name:'Capacitor voltage',color:green,points:samples(t=>calc(t).voltage,200)}]} xRange={[0,200]} yRange={[Math.min(0,end)-pad,Math.max(0,end)+pad]} xLabel="TIME / ms" yLabel="CAPACITOR VOLTAGE / V" point={[ms,d.voltage]} description={'Starting from zero volts, slope is '+f(d.slope)+' volts per second. At '+ms+' milliseconds voltage is '+f(d.voltage)+' volts.'}/><p className="plot-summary">Initial voltage is 0 V. Negative current charges the opposite polarity; stored energy remains nonnegative. Ideal constant C and unlimited-compliance current source; real voltage and polarity ratings are not modeled. The vertical scale follows the selected values.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Double capacitance at fixed current and time. Voltage halves. Then compare doubling time: voltage doubles and stored energy quadruples.</div></div>;
}
export function RCLab(){
 const [rk,setRk]=useState(10),[uf,setUf]=useState(10),[nt,setNt]=useState(1),[discharge,setDischarge]=useState(false);
 const tau=rk*1000*uf*1e-6,vin=discharge?0:5,v0=discharge?5:0;
 const calc=(t:number)=>rc({vin,v0,r:rk*1000,c:uf*1e-6,t});
 const d=calc(nt*tau);
 return <div className="lab" aria-label="RC transient experiment"><Head title="ONE TIME CONSTANT · TWO DIRECTIONS" reset={()=>{setRk(10);setUf(10);setNt(1);setDischarge(false)}}/>
 <div className="view-buttons" role="group" aria-label="RC initial condition"><button aria-pressed={!discharge} onClick={()=>setDischarge(false)}>Charge: 0 → 5 V</button><button aria-pressed={discharge} onClick={()=>setDischarge(true)}>Discharge: 5 → 0 V</button></div>
 <Circuit kind="lowpass" source={'V_s = '+vin+' V'} series={'R = '+number(rk)+' kΩ'} element={'C = '+number(uf)+' µF'} node={'V = '+f(d.voltage)+' V'}/>
 <div className="horizontal-controls"><Control label="Resistance" value={rk} onChange={setRk} min={0} max={2} step={.05} log unit="kΩ"/><Control label="Capacitance" value={uf} onChange={setUf} min={0} max={2} step={.05} log unit="µF"/><Control label="Elapsed time" value={nt} onChange={setNt} min={0} max={5} step={.1} unit="τ"/></div>
 <Readouts values={[['TIME CONSTANT',number(tau*1000),'ms'],['CAPACITOR VOLTAGE',f(d.voltage,3),'V'],['CURRENT INTO C',f(d.current*1000,3),'mA']]}/>
 <div className="plot-area"><h4>The remaining difference decays exponentially</h4><Plot curves={[{name:'Capacitor voltage',color:green,points:samples(t=>calc(t/1000).voltage,5*tau*1000)},{name:'Final source voltage',color:gray,dashed:true,points:[[0,vin],[5*tau*1000,vin]]}]} xRange={[0,5*tau*1000]} yRange={[-.25,5.5]} xLabel="TIME AFTER SWITCHING / ms" yLabel="VOLTAGE / V" point={[nt*tau*1000,d.voltage]} description={'At '+f(nt)+' time constants, capacitor voltage '+f(d.voltage,3)+' volts and current into the capacitor '+f(d.current*1000,3)+' milliamps.'}/><p className="plot-summary">At {f(nt*tau*1000)} ms the error from the final voltage is {f(Math.abs(vin-d.voltage),3)} V. The graph always spans five time constants; changing R or C changes its time scale. Ideal source, no external load, constant capacitance.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Switch to discharge. Capacitor voltage stays positive while current becomes negative. Doubling R halves the initial current and doubles the time constant.</div></div>;
}
export function FilterLab({kind}:{kind:'highpass'|'lowpass'}){
 const high=kind==='highpass',initial=high?100:20000;
 const [hz,setHz]=useState(initial),[rk,setRk]=useState(10),[detail,setDetail]=useState(true);
 const d=filter({kind,r:rk*1000,c:10e-9,hz});
 const exact=samples(t=>d.re*Math.sin(2*Math.PI*t)+d.im*Math.cos(2*Math.PI*t),2,241);
 const approx=samples(t=>d.approxIm*Math.cos(2*Math.PI*t),2,241);
 const peak=Math.max(d.gain,Math.abs(d.approxIm),detail?0:1)*1.15;
 return <div className="lab" aria-label={high?'RC differentiator experiment':'RC integrator experiment'}><Head title={high?'EXACT HIGH-PASS vs DERIVATIVE':'EXACT LOW-PASS vs INTEGRAL'} reset={()=>{setHz(initial);setRk(10);setDetail(true)}}/>
 <Circuit kind={kind} source="1 V peak sine" series={high?'C = 10 nF':'R = '+number(rk)+' kΩ'} element={high?'R = '+number(rk)+' kΩ':'C = 10 nF'} node="V_out"/>
 <div className="horizontal-controls"><Control label="Input frequency" value={hz} onChange={setHz} min={1} max={5} step={.02} log unit="Hz"/><Control label="Resistance" value={rk} onChange={setRk} min={0} max={2} step={.05} log unit="kΩ"/></div>
 <Readouts values={[['FREQUENCY / CUTOFF',f(d.x,3),'×'],['EXACT GAIN',f(d.gain,4),'V/V'],['EXACT PHASE',f(d.phase,1),'°']]}/>
 <div className="view-buttons" role="group" aria-label="Waveform display"><button aria-pressed={detail} onClick={()=>setDetail(true)}>Output detail</button><button aria-pressed={!detail} onClick={()=>setDetail(false)}>Include input</button></div>
 <div className="plot-area"><h4>{high?'A derivative leads a sine by 90°':'An integral lags a sine by 90°'}</h4><Plot curves={[...(!detail?[{name:'Input: 1 V peak',color:gray,dashed:true,points:samples(t=>Math.sin(2*Math.PI*t),2,241)}]:[]),{name:'Exact RC output',color:green,points:exact},{name:high?'RC × derivative':'Integral / RC',color:orange,dashed:true,points:approx}]} xRange={[0,2]} yRange={[-peak,peak]} xLabel="TIME / INPUT PERIODS" yLabel="VOLTAGE / V" description={'Cutoff '+f(d.fc,1)+' hertz. Exact gain '+f(d.gain,4)+' and phase '+f(d.phase,1)+' degrees. Relative complex-response approximation error '+f(d.relativeError*100,1)+' percent.'}/><p className="plot-summary">Cutoff: {f(d.fc,1)} Hz. Exact output: {f(d.gain,4)} V peak. Approximation: {f(Math.abs(d.approxIm),4)} V peak. Relative complex-response error: <strong>{f(d.relativeError*100,1)}%</strong>. This combines gain and phase error; it is not an amplitude-only percentage.</p><p className="plot-summary">Steady-state sine response, ideal source, unloaded output. One horizontal unit is {number(1000/hz)} ms. The vertical axis rescales; {detail?'the input is hidden to make the output comparison visible.':'the dashed gray trace is the input.'} The initial-condition transient is not shown.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> {high?'Move far below cutoff, then toward it. The derivative approximation improves at low frequency, where the output is also small.':'Move far above cutoff, then toward it. The integral approximation improves at high frequency, where the passive circuit strongly attenuates the signal.'}</div></div>;
}
export function RealCapLab(){
 const [uf,setUf]=useState(1),[esr,setEsr]=useState(.1),[nh,setNh]=useState(10),[hz,setHz]=useState(1e6);
 const calc=(frequency:number)=>capacitorImpedance({c:uf*1e-6,esr,esl:nh*1e-9,hz:frequency}),d=calc(hz);
 const frequencies=Array.from({length:241},(_,i)=>10**(2+6*i/240));frequencies.push(d.resonance);frequencies.sort((a,b)=>a-b);
 const points:[number,number][]=frequencies.filter(v=>v>=100&&v<=1e8).map(v=>[v,calc(v).magnitude]);
 return <div className="lab" aria-label="Real capacitor impedance experiment"><Head title="CAPACITANCE + ESR + ESL" reset={()=>{setUf(1);setEsr(.1);setNh(10);setHz(1e6)}}/>
 <Schematic width={640} height={175} description="Two-terminal series model: ESR, then ESL, then ideal capacitance. Leakage and dielectric absorption omitted.">
  <Terminal at={[45,80]}/><Wire pts={[[45,80],[90,80]]}/><Res a={[90,80]} b={[200,80]} label="ESR" value={f(esr,2)+' Ω'}/>
  <Wire pts={[[200,80],[250,80]]}/><Ind a={[250,80]} b={[360,80]} label="ESL" value={nh+' nH'}/><Wire pts={[[360,80],[410,80]]}/>
  <Cap a={[410,80]} b={[520,80]} label="C" value={number(uf)+' µF'}/><Wire pts={[[520,80],[595,80]]}/><Terminal at={[595,80]}/>
 </Schematic>
 <div className="horizontal-controls"><Control label="Capacitance" value={uf} onChange={setUf} min={-2} max={1} step={.05} log unit="µF"/><Control label="Series resistance ESR" value={esr} onChange={setEsr} min={-2} max={0} step={.05} log unit="Ω"/><Control label="Series inductance ESL" value={nh} onChange={setNh} min={1} max={50} unit="nH"/><Control label="Probe frequency" value={hz} onChange={setHz} min={2} max={8} step={.05} log unit="Hz"/></div>
 <Readouts values={[['SELF-RESONANCE',f(d.resonance/1e6,3),'MHz'],['IMPEDANCE',number(d.magnitude),'Ω'],['PHASE',f(d.phase,1),'°']]}/>
 <div className="plot-area"><h4>Above resonance, this model becomes inductive</h4><Plot curves={[{name:'Series C + ESR + ESL',color:green,points},{name:'Ideal capacitance alone',color:orange,dashed:true,points:frequencies.filter(v=>v>=100&&v<=1e8).map(v=>[v,calc(v).ideal])}]} xRange={[100,1e8]} yRange={[.005,2e5]} xScale="log" yScale="log" xTicks={[1e2,1e3,1e4,1e5,1e6,1e7,1e8]} xLabel="FREQUENCY / Hz · LOG SCALE" yLabel="IMPEDANCE MAGNITUDE / Ω · LOG SCALE" point={[hz,d.magnitude]} description={'At '+number(hz)+' hertz, impedance magnitude '+number(d.magnitude)+' ohms and phase '+f(d.phase,1)+' degrees. Series resonance '+f(d.resonance/1e6,3)+' megahertz.'}/><p className="plot-summary">At exact series resonance the reactive terms cancel and |Z| = ESR = {f(esr,3)} Ω. Both axes are logarithmic; k and M mean ×1,000 and ×1,000,000. Constant lumped parameters are illustrative, not a fit to a selected part. Leakage, dielectric absorption, voltage dependence, and distributed effects are omitted.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Raise ESL: resonance moves lower. Raise ESR: the minimum becomes shallower. A larger nominal C does not guarantee lower impedance at every frequency.</div></div>;
}
export function InductorLab(){
 const [mh,setMh]=useState(10),[r,setR]=useState(100),[off,setOff]=useState(false),[fraction,setFraction]=useState(.5),[clamp,setClamp]=useState(12);
 const l=mh/1000,tau=l/r,stop=l*(5/r)/clamp,end=off?stop*1.2:tau*5;
 const calc=(t:number)=>inductor({l,r,vin:5,t,off,clamp}),d=calc(fraction*end);
 return <div className="lab" aria-label="Inductor energizing and turn-off experiment"><Head title="VOLTAGE CHANGES CURRENT" reset={()=>{setMh(10);setR(100);setOff(false);setFraction(.5);setClamp(12)}}/>
 <div className="view-buttons" role="group" aria-label="Inductor circuit mode"><button aria-pressed={!off} onClick={()=>setOff(false)}>Energize RL</button><button aria-pressed={off} onClick={()=>setOff(true)}>Clamped turn-off</button></div>
 <Circuit kind="inductor" source={off?number(clamp)+' V clamp':'5 V source'} series={off?'R and supply disconnected':'R = '+r+' Ω'} element={'L = '+mh+' mH'} node={'I = '+f(d.current*1000,2)+' mA'} clamp={off}/>
 <div className="horizontal-controls"><Control label="Inductance" value={mh} onChange={setMh} min={1} max={100} unit="mH"/><Control label="Charging resistance" value={r} onChange={setR} min={10} max={200} step={5} unit="Ω"/><Control label="Clamp voltage magnitude" value={clamp} onChange={setClamp} min={1} max={50} unit="V"/><Control label="Position in time window" value={fraction} onChange={setFraction} min={0} max={1} step={.01} unit="fraction"/></div>
 <Readouts values={[['INDUCTOR CURRENT',f(d.current*1000,2),'mA'],['INDUCTOR VOLTAGE',f(d.voltage,2),'V'],['MAGNETIC ENERGY',f(d.energy*1e6,2),'µJ']]}/>
 <div className="plot-area"><h4>{off?'A larger opposing voltage removes current faster':'Current approaches the DC limit'}</h4><Plot curves={[{name:'Inductor current',color:green,points:samples(t=>calc(t/1000).current*1000,end*1000)}]} xRange={[0,end*1000]} yRange={[0,(5/r)*1100]} xLabel="TIME / ms" yLabel="INDUCTOR CURRENT / mA" point={[fraction*end*1000,d.current*1000]} description={'Current '+f(d.current*1000,2)+' milliamps at '+number(fraction*end*1000)+' milliseconds. Inductor voltage '+f(d.voltage,2)+' volts.'}/><p className="plot-summary">{off?'Turn-off begins after the RL circuit has reached steady current '+f(5000/r,2)+' mA. The isolated inductor sees a constant opposing clamp voltage until current reaches zero at '+number(stop*1000)+' ms; the ideal one-way clamp then stops conducting. It is not a continuing reverse-voltage source.':'The inductor starts with zero current. Time constant L/R = '+number(tau*1000)+' ms, final current = '+f(5000/r,2)+' mA. The clamp setting has no effect in this mode.'} Linear inductance; no winding resistance, saturation, parasitic capacitance, or core loss.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Switch to turn-off, then increase clamp voltage. The energy initially stored is unchanged, but it is removed in less time. The graph rescales its time axis.</div></div>;
}
export function TransformerLab(){
 const [vp,setVp]=useState(12),[ns,setNs]=useState(50),[rl,setRl]=useState(100),[khz,setKhz]=useState(10);
 const d=transformer({vp,np:100,ns,rl,hz:khz*1000,area:25e-6}),peak=Math.max(vp,d.vs)*Math.SQRT2*1.15;
 return <div className="lab" aria-label="Transformer turns and load experiment"><Head title="TURNS · CURRENT · REFLECTED LOAD" reset={()=>{setVp(12);setNs(50);setRl(100);setKhz(10)}}/>
 <Schematic width={640} height={285} description={'Ideal transformer. Primary 100 turns, secondary '+ns+' turns. '+vp+' volts RMS primary gives '+f(d.vs)+' volts RMS secondary, feeding '+number(rl)+' ohms. Dots at both top terminals mean in-phase winding voltages.'}>
  <Source kind="ac" a={[75,200]} b={[75,110]} label={vp+' V RMS'}/><Wire pts={[[75,110],[75,60],[235,60]]}/><Wire pts={[[235,200],[75,200]]}/>
  <Ind a={[235,60]} b={[235,200]}/><Ind a={[350,200]} b={[350,60]}/>
  <path d="M283 72 V188 M299 72 V188" stroke={ink} strokeWidth="1.8"/><circle cx="222" cy="92" r="3.5" fill={ink}/><circle cx="363" cy="92" r="3.5" fill={ink}/>
  <Text x={215} y={44} anchor="middle">N_p = 100</Text><Text x={370} y={44} anchor="middle">N_s = {ns}</Text>
  <Wire pts={[[350,60],[485,60]]}/><Res a={[485,60]} b={[485,200]} label={number(rl)+' Ω'} value="load"/><Wire pts={[[485,200],[350,200]]}/>
  <Text x={372} y={250} kind="output">V_s = {f(d.vs)} V RMS</Text>
 </Schematic>
 <div className="horizontal-controls"><Control label="Primary voltage" value={vp} onChange={setVp} min={2} max={24} unit="V RMS"/><Control label="Secondary turns" value={ns} onChange={setNs} min={25} max={200} step={5} unit="turns"/><Control label="Secondary load" value={rl} onChange={setRl} min={1} max={3} step={.05} log unit="Ω"/><Control label="Frequency" value={khz} onChange={setKhz} min={0} max={2} step={.05} log unit="kHz"/></div>
 <Readouts values={[['SECONDARY VOLTAGE',f(d.vs),'V RMS'],['REFLECTED LOAD',number(d.reflected),'Ω'],['PRIMARY LOAD CURRENT',f(d.ip*1000,2),'mA RMS']]}/>
 <div className="plot-area"><h4>Voltage follows turns; current follows the load</h4><Plot curves={[{name:'Primary voltage',color:gray,dashed:true,points:samples(t=>Math.SQRT2*vp*Math.sin(2*Math.PI*t),2,241)},{name:'Secondary voltage',color:green,points:samples(t=>Math.SQRT2*d.vs*Math.sin(2*Math.PI*t),2,241)}]} xRange={[0,2]} yRange={[-peak,peak]} xLabel="TIME / PERIODS" yLabel="INSTANTANEOUS VOLTAGE / V" description={'Secondary '+f(d.vs)+' volts RMS, current '+f(d.is*1000,2)+' milliamps RMS. Load power '+f(d.power,3)+' watts. Primary voltage and secondary voltage are in phase for the shown dots.'}/>
 <p className="plot-summary">Secondary current {f(d.is*1000,2)} mA RMS; load power {f(d.power,3)} W. Ideal input power equals output power. Changing frequency does not change the ideal turns ratio. One plotted period is {number(1/khz)} ms.</p>
 <p className={'thermal-status '+(d.bpeak>.2?'over-target':'')}>Separate flux estimate: <strong>{f(d.bpeak,3)} T peak</strong>, assuming sinusoidal drive, 100 primary turns, and 25 mm² core area. {d.bpeak>.2?'Above the illustrative 0.2 T target: the ideal waveforms do not include the resulting saturation.':'Below the illustrative 0.2 T target; this does not establish a real core’s loss or saturation rating.'}</p><p className="plot-summary">No winding loss, leakage, magnetizing current, winding capacitance, or current limit. This is a low-voltage mathematical example, not a transformer construction or isolation-rating design.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Double secondary turns at fixed load. Secondary voltage doubles, load power quadruples, and the reflected resistance becomes one quarter. Lower frequency at fixed voltage: the ideal output stays the same, but the flux estimate rises.</div></div>;
}

