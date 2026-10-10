import {useState} from 'react';
import {thevenin,diode,thermal,VT} from '../engine/foundations.mjs';
import Plot from './Plot';
import {Control,Readouts,f} from './LabControls';
const green='var(--accent)',orange='var(--orange)';
function Head({title,reset}:{title:string;reset:()=>void}){return <div className="lab-heading"><div><span className="live-dot"/><span className="tiny-label">{title}</span></div><button onClick={reset}>Reset ↺</button></div>}
function Source({x,y,vertical=true}:{x:number;y:number;vertical?:boolean}) {return <g fill="none" stroke="var(--ink)" strokeWidth="1.8"><circle cx={x} cy={y} r="25"/>{vertical?<path d={`M${x-5} ${y-9} h10 M${x} ${y-14} v10 M${x-5} ${y+10} h10`}/>:<path d={`M${x+5} ${y} h10 M${x+10} ${y-5} v10 M${x-14} ${y} h8`}/>}</g>}
function Ground({x,y}:{x:number;y:number}){return <path d={`M${x} ${y} v10 m-14 0 h28 m-23 6 h18 m-12 6 h6`} stroke="var(--ink)" strokeWidth="1.5" fill="none"/>}
export function TheveninLab(){
 const [v1,setV1]=useState(12),[v2,setV2]=useState(3),[rl,setRl]=useState(4),[open,setOpen]=useState(false),[equivalent,setEquivalent]=useState(false);
 const d=thevenin({v1,v2,r1:3000,r2:6000,rl:open?Infinity:rl*1000});
 const reset=()=>{setV1(12);setV2(3);setRl(4);setOpen(false);setEquivalent(false)};
 const end=Math.min(d.isc,d.vth/(rl*1000));
 return <div className="lab" aria-label="Thévenin equivalence experiment"><Head title="ONE PORT · TWO DESCRIPTIONS" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Circuit view"><button aria-pressed={!equivalent} onClick={()=>setEquivalent(false)}>Original network</button><button aria-pressed={equivalent} onClick={()=>setEquivalent(true)}>Thévenin equivalent</button></div>
 <svg className="wide-circuit" viewBox="0 0 560 290" role="img" aria-label={equivalent?`Equivalent source ${f(d.vth)} V in series with 2 kiloohms supplies the load. Output ${f(d.out)} volts.`:`Two voltage sources ${v1} and ${v2} volts feed the output through 3 and 6 kiloohms respectively. Load ${open?'disconnected':rl+' kiloohms'}.`}>
 <g stroke="var(--ink)" strokeWidth="1.8" fill="none">
 {equivalent?<><path d="M30 140 H50 M100 140 H155 M215 140 H400 M30 140 V250 H400"/><rect x="155" y="130" width="60" height="20"/></>:<><path d="M30 80 H50 M100 80 H155 M215 80 H340 V185 H215 M155 185 H100 M50 185 H30 V80 M30 185 V250 H400 M340 140 H400"/><rect x="155" y="70" width="60" height="20"/><rect x="155" y="175" width="60" height="20"/></>}
 {!open&&<><path d="M400 140 V175 M400 215 V250" stroke={orange}/><rect x="390" y="175" width="20" height="40" stroke={orange}/></>}
 <circle cx="400" cy="140" r="3" fill={green} stroke={green}/>
 </g><Ground x={30} y={250}/>
 {equivalent?<><Source x={75} y={140} vertical={false}/><text x="45" y="105" className="symbol-label">Vₜₕ = {f(d.vth)} V</text><text x="150" y="117" className="symbol-label">Rₜₕ = 2 kΩ</text></>:<><Source x={75} y={80} vertical={false}/><Source x={75} y={185} vertical={false}/><text x="45" y="42" className="symbol-label">V₁ = {v1} V</text><text x="150" y="57" className="symbol-label">R₁ = 3 kΩ</text><text x="45" y="226" className="symbol-label">V₂ = {v2} V</text><text x="150" y="162" className="symbol-label">R₂ = 6 kΩ</text></>}
 <text x="365" y="118" className="output-label">V = {f(d.out)} V</text>{!open&&<text x="425" y="199" className="symbol-label">Rₗ = {rl} kΩ</text>}
 </svg>
 <div className="horizontal-controls"><Control label="Source V₁" value={v1} onChange={setV1} min={4} max={20} unit="V"/><Control label="Source V₂" value={v2} onChange={setV2} min={0} max={6} unit="V"/><Control label="Load resistance" value={rl} onChange={setRl} min={1} max={20} step={.5} unit="kΩ"/><label className="check"><input type="checkbox" checked={open} onChange={e=>setOpen(e.target.checked)}/> Open the load</label></div>
 <Readouts values={[['OPEN-CIRCUIT VOLTAGE',f(d.vth),'V'],['LOADED OUTPUT',f(d.out),'V'],['LOAD CURRENT',f(d.il*1000,3),'mA']]}/>
 <div className="plot-area"><h4>The intersection is the operating point</h4><Plot curves={[{name:'Source: original = equivalent',color:green,points:[[0,d.vth],[d.isc*1000,0]]},...(!open?[{name:'Load: V = IRₗ',color:orange,dashed:true,points:[[0,0],[end*1000,end*rl*1000]] as [number,number][] }]:[])]} xRange={[0,d.isc*1000]} yRange={[0,d.vth*1.1]} xLabel="CURRENT DELIVERED TO LOAD / mA" yLabel="TERMINAL VOLTAGE / V" point={[d.il*1000,d.out]} description={`The original and equivalent source have the same terminal line: ${f(d.vth)} volts open-circuit and ${f(d.isc*1000)} milliamps short-circuit. Selected load voltage ${f(d.out)} volts at ${f(d.il*1000,3)} milliamps.`}/><p className="plot-summary">Branch currents toward the output: I₁ = {f(d.i1*1000,3)} mA and I₂ = {f(d.i2*1000,3)} mA. Their sum is {f(d.il*1000,3)} mA. A negative branch current flows back toward that ideal source.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Switch between the two drawings, then change the load. Terminal behavior stays identical. Opening the load removes the load line and reveals Vₜₕ. Resistances and sources are ideal; internal power is not preserved by this replacement.</div></div>;
}
export function SmallSignalLab(){
 const [iq,setIq]=useState(1),[mv,setMv]=useState(5),[incremental,setIncremental]=useState(false);
 const d=diode({iq:iq/1000,dv:mv/1000});
 const xs=Array.from({length:81},(_,i)=>-40+i);
 const curve=(linear:boolean):[number,number][]=>xs.map(x=>{const a=diode({iq:iq/1000,dv:x/1000});return [x,(iq/1000+(linear?a.linear:a.exact))*1000]});
 return <div className="lab" aria-label="Small-signal diode experiment"><Head title="THE CURVE & ITS LOCAL SLOPE" reset={()=>{setIq(1);setMv(5);setIncremental(false)}}/>
 <div className="view-buttons" role="group" aria-label="Diode circuit model"><button aria-pressed={!incremental} onClick={()=>setIncremental(false)}>Biased diode</button><button aria-pressed={incremental} onClick={()=>setIncremental(true)}>Incremental circuit</button></div>
 <svg className="wide-circuit" viewBox="0 0 560 280" role="img" aria-label={incremental?`Small-signal voltage ${mv} millivolts drives incremental resistance ${f(d.rd)} ohms.`:`An ideal voltage source of VQ plus the perturbation drives a diode at fixed 300 kelvin. Bias current ${iq} milliamps.`}>
 <g fill="none" stroke="var(--ink)" strokeWidth="1.8"><path d="M100 105 V50 H330 V95 M330 160 V230 H100 V155"/>{incremental?<rect x="318" y="95" width="24" height="65"/>:<><path d="M330 95 V110 M312 110 H348 L330 140 Z M310 140 H350 M330 140 V160"/></>}<path d="M290 65 v32 m-4 -6 l4 6 l4 -6" stroke={green}/></g>
 <Source x={100} y={130}/><Ground x={100} y={230}/>
 <text x="143" y="117" className="symbol-label">{incremental?'v = '+mv+' mV':'VQ + v'}</text><text x="143" y="142" className="symbol-value">{incremental?'DC bias removed':f(d.vq+mv/1000,4)+' V'}</text>
 <text x="355" y="122" className="symbol-label">{incremental?'r_d = '+f(d.rd)+' Ω':'D · ideal exponential'}</text><text x="355" y="145" className="symbol-value">{incremental?'i ≈ v / r_d':'n = 1, T = 300 K'}</text><text x="260" y="90" className="symbol-value">{incremental?'i':'I'}</text>
 </svg>
 <div className="horizontal-controls"><Control label="DC bias current I_Q" value={iq} onChange={setIq} min={-2} max={1} step={.02} log unit="mA"/><Control label="Voltage perturbation v" value={mv} onChange={setMv} min={-40} max={40} unit="mV"/></div>
 <Readouts values={[['DC VOLTAGE VQ',f(d.vq,4),'V'],['DC RATIO VQ / IQ',f(d.vq/(iq/1000),1),'Ω'],['LOCAL RESISTANCE',f(d.rd,2),'Ω']]}/>
 <div className="plot-area"><h4>One tangent can only describe a neighborhood</h4><Plot curves={[{name:'Exponential diode',color:green,points:curve(false)},{name:'Tangent at Q',color:orange,dashed:true,points:curve(true)}]} xRange={[-40,40]} yRange={[-.65*iq,4.95*iq]} xLabel="VOLTAGE CHANGE FROM Q / mV" yLabel="TOTAL DIODE CURRENT / mA" point={[mv,d.total*1000]} description={`Bias current ${f(iq,3)} milliamps. At a perturbation of ${mv} millivolts, actual current change is ${f(d.exact*1000,4)} milliamps, linear estimate ${f(d.linear*1000,4)} milliamps. Relative error in the change ${f(d.error*100)} percent.`}/>
 <div className="comparison-row"><span>Exact ΔI <strong>{f(d.exact*1000,4)} mA</strong></span><span>Linear ΔI <strong>{f(d.linear*1000,4)} mA</strong></span><span>Error in ΔI <strong>{mv===0?'— (zero change)':f(d.error*100)+'%'}</strong></span></div>
 <p className="plot-summary">The bias point is at v = 0. {iq/1000+d.linear<0?'The tangent predicts a negative total current here: a clear sign that this local approximation has been pushed too far.':'Changing the bias current changes the slope; changing the perturbation moves away from the point where that slope was measured.'} The vertical axis rescales with bias current. This is a fixed-temperature, low-frequency model with no capacitance or series resistance.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Compare a 1 mV change with a 20 mV change. Then increase the bias current tenfold. The resistance falls tenfold, but the relative linearization error at the same voltage perturbation stays essentially unchanged.</div></div>;
}
export function HeatingLab(){
 const [ma,setMa]=useState(50),[theta,setTheta]=useState(100),[ambient,setAmbient]=useState(25),[capacity,setCapacity]=useState(2),[elapsed,setElapsed]=useState(2);
 const d=thermal({current:ma/1000,resistance:100,theta,capacity,ambient,time:elapsed*theta*capacity});
 const points:[number,number][]=Array.from({length:81},(_,i)=>{const time=i/80*5*d.tau;return [time/60,thermal({current:ma/1000,resistance:100,theta,capacity,ambient,time}).temperature]});
 const target=125;
 return <div className="lab" aria-label="Resistor heating experiment"><Head title="ELECTRICAL POWER → TEMPERATURE" reset={()=>{setMa(50);setTheta(100);setAmbient(25);setCapacity(2);setElapsed(2)}}/>
 <svg className="wide-circuit" viewBox="0 0 560 280" role="img" aria-label={`Current source supplies ${ma} milliamps to a 100 ohm resistor, dissipating ${f(d.power,3)} watts. Single-node thermal model predicts ${f(d.temperature)} degrees Celsius at the selected time.`}>
 <g fill="none" stroke="var(--ink)" strokeWidth="1.8"><path d="M100 105 V50 H320 V100 M320 160 V230 H100 V155"/><circle cx="100" cy="130" r="25"/><path d="M100 145 V115 m-5 7 l5 -7 l5 7"/><rect x="308" y="100" width="24" height="60"/><path d="M380 185 c15 -15 15 15 30 0 m-30 12 c15 -15 15 15 30 0 m-30 12 c15 -15 15 15 30 0" stroke={orange}/></g>
 <Ground x={100} y={230}/><text x="143" y="130" className="symbol-label">I = {ma} mA</text><text x="350" y="115" className="symbol-label">R = 100 Ω</text><text x="350" y="140" className="output-label">{f(d.power,3)} W → heat</text><text x="350" y="160" className="symbol-value">Body: {f(d.temperature,1)} °C</text>
 </svg>
 <div className="horizontal-controls"><Control label="Resistor current" value={ma} onChange={setMa} min={0} max={100} unit="mA"/><Control label="Thermal resistance" value={theta} onChange={setTheta} min={20} max={200} step={5} unit="°C/W"/><Control label="Ambient temperature" value={ambient} onChange={setAmbient} min={0} max={80} unit="°C"/><Control label="Thermal capacitance" value={capacity} onChange={setCapacity} min={1} max={10} step={.5} unit="J/°C"/><Control label="Elapsed time" value={elapsed} onChange={setElapsed} min={0} max={5} step={.1} unit="τ"/></div>
 <Readouts values={[['DISSIPATION',f(d.power,3),'W'],['STEADY TEMPERATURE',f(d.steady,1),'°C'],['TIME CONSTANT',f(d.tau/60,2),'min']]}/>
 <div className="plot-area"><h4>Temperature takes time to reach equilibrium</h4><Plot curves={[{name:'Body temperature',color:green,points},{name:'Illustrative 125 °C target',color:orange,dashed:true,points:[[0,target],[5*d.tau/60,target]]}]} xRange={[0,5*d.tau/60]} yRange={[0,Math.max(140,d.steady*1.1)]} xLabel="TIME AFTER POWER-ON / min" yLabel="BODY TEMPERATURE / °C" point={[elapsed*d.tau/60,d.temperature]} description={`Starting at ambient ${ambient} degrees Celsius, resistor tends to ${f(d.steady,1)} degrees. After ${f(elapsed*d.tau/60,2)} minutes its temperature is ${f(d.temperature,1)} degrees. The demonstration temperature target is 125 degrees, not a rating for a real part.`}/>
 <p className={'thermal-status '+(d.steady>target?'over-target':'')}>Steady-state margin to the illustrative target: <strong>{f(target-d.steady,1)} °C</strong>. {d.steady>target?'This model exceeds the target, even if the selected early-time temperature is lower.':'A positive temperature margin alone does not establish a real component’s power or pulse rating.'}</p>
 <p className="plot-summary">At {f(elapsed*d.tau/60,2)} minutes: {f(d.temperature,1)} °C. The graph spans five time constants and rescales when cooling or thermal mass changes. Assumptions: constant 100 Ω resistance, constant power, uniform body temperature, fixed ambient, and one thermal path. No real component has been selected.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Double the current: power and steady temperature rise quadruple. Increase thermal capacitance: warming slows, but the final temperature is unchanged. Better cooling lowers thermal resistance and the final temperature.</div></div>;
}


