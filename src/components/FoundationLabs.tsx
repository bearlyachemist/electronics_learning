import {useState} from 'react';
import {thevenin,diode,thermal,VT} from '../engine/foundations.mjs';
import Plot from './Plot';
import {Control,Readouts,f} from './LabControls';
import {Schematic,Wire,Res,Diode,Source,CurrentSource,Ground,Dot,Terminal,Text,CurrentArrow,green,orange,type Pt} from './Schematic';
import {Tx,htmlSub} from './MathText';
function Head({title,reset}:{title:string;reset:()=>void}){return <div className="lab-heading"><div><span className="live-dot"/><span className="tiny-label">{htmlSub(title)}</span></div><button onClick={reset}>Reset ↺</button></div>}
export function TheveninLab(){
 const [v1,setV1]=useState(12),[v2,setV2]=useState(3),[rl,setRl]=useState(4),[open,setOpen]=useState(false),[equivalent,setEquivalent]=useState(false);
 const d=thevenin({v1,v2,r1:3000,r2:6000,rl:open?Infinity:rl*1000});
 const reset=()=>{setV1(12);setV2(3);setRl(4);setOpen(false);setEquivalent(false)};
 const end=Math.min(d.isc,d.vth/(rl*1000)),O:Pt=[260,90];
 return <div className="lab" aria-label="Thévenin equivalence experiment"><Head title="ONE PORT · TWO DESCRIPTIONS" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Circuit view"><button aria-pressed={!equivalent} onClick={()=>setEquivalent(false)}>Original network</button><button aria-pressed={equivalent} onClick={()=>setEquivalent(true)}>Thévenin equivalent</button></div>
 <Schematic width={560} height={290} description={equivalent?`Equivalent source ${f(d.vth)} V in series with 2 kiloohms supplies the load. Output ${f(d.out)} volts.`:`Two voltage sources ${v1} and ${v2} volts feed the output through 3 and 6 kiloohms respectively. Load ${open?'disconnected':rl+' kiloohms'}.`}>
  <Source a={[60,250]} b={[60,170]} label={equivalent?'V_th = '+f(d.vth)+' V':'V_1 = '+v1+' V'}/><Ground at={[60,250]}/><Wire pts={[[60,170],[60,90],[110,90]]}/>
  <Res a={[110,90]} b={[210,90]} label={equivalent?'R_th = 2 kΩ':'R_1 = 3 kΩ'}/><Wire pts={[[210,90],O]}/>
  {!equivalent&&<><Source a={[460,250]} b={[460,170]} label={'V_2 = '+v2+' V'} flipLabel/><Wire pts={[[460,170],[460,90],[410,90]]}/><Res a={[410,90]} b={[310,90]} label="R_2 = 6 kΩ"/><Wire pts={[[310,90],O]}/></>}
  {open?<Terminal at={O}/>:<><Res a={O} b={[260,250]} label={'R_L = '+rl+' kΩ'} color={orange}/><Dot at={O} color={green}/></>}
  {(!equivalent||!open)&&<Wire pts={[[60,250],[equivalent?260:460,250]]}/>}{!equivalent&&!open&&<Dot at={[260,250]}/>}
  <Text x={260} y={60} anchor="middle" kind="output">V = {f(d.out)} V</Text>
 </Schematic>
 <div className="horizontal-controls"><Control label="Source V1" value={v1} onChange={setV1} min={4} max={20} unit="V"/><Control label="Source V2" value={v2} onChange={setV2} min={0} max={6} unit="V"/><Control label="Load resistance" value={rl} onChange={setRl} min={1} max={20} step={.5} unit="kΩ"/><label className="check"><input type="checkbox" checked={open} onChange={e=>setOpen(e.target.checked)}/> Open the load</label></div>
 <Readouts values={[['OPEN-CIRCUIT VOLTAGE',f(d.vth),'V'],['LOADED OUTPUT',f(d.out),'V'],['LOAD CURRENT',f(d.il*1000,3),'mA']]}/>
 <div className="plot-area"><h4>The intersection is the operating point</h4><Plot curves={[{name:'Source: original = equivalent',color:green,points:[[0,d.vth],[d.isc*1000,0]]},...(!open?[{name:'Load: $V = IR_L$',color:orange,dashed:true,points:[[0,0],[end*1000,end*rl*1000]] as [number,number][] }]:[])]} xRange={[0,d.isc*1000]} yRange={[0,d.vth*1.1]} xLabel="CURRENT DELIVERED TO LOAD / mA" yLabel="TERMINAL VOLTAGE / V" point={[d.il*1000,d.out]} description={`The original and equivalent source have the same terminal line: ${f(d.vth)} volts open-circuit and ${f(d.isc*1000)} milliamps short-circuit. Selected load voltage ${f(d.out)} volts at ${f(d.il*1000,3)} milliamps.`}/><p className="plot-summary"><Tx>{`Branch currents toward the output: $I_1$ = ${f(d.i1*1000,3)} mA and $I_2$ = ${f(d.i2*1000,3)} mA. Their sum is ${f(d.il*1000,3)} mA. A negative branch current flows back into that ideal source.`}</Tx></p></div>
 <div className="lab-prompt"><strong>Explore.</strong> <Tx>{'Switch between the two drawings, then change the load. Terminal behavior stays identical. Opening the load removes the load line and reveals $V_{\\mathrm{th}}$. Now lower $V_2$ to 0 V: the network still has an equivalent, with $V_{\\mathrm{th}} = 8$ V. Resistances and sources are ideal; internal power is not preserved by this replacement.'}</Tx></div></div>;
}
export function SmallSignalLab(){
 const [iq,setIq]=useState(1),[mv,setMv]=useState(5),[incremental,setIncremental]=useState(false);
 const d=diode({iq:iq/1000,dv:mv/1000});
 const xs=Array.from({length:81},(_,i)=>-40+i);
 const curve=(linear:boolean):[number,number][]=>xs.map(x=>{const a=diode({iq:iq/1000,dv:x/1000});return [x,(iq/1000+(linear?a.linear:a.exact))*1000]});
 return <div className="lab" aria-label="Small-signal diode experiment"><Head title="THE CURVE & ITS LOCAL SLOPE" reset={()=>{setIq(1);setMv(5);setIncremental(false)}}/>
 <div className="view-buttons" role="group" aria-label="Diode circuit model"><button aria-pressed={!incremental} onClick={()=>setIncremental(false)}>Biased diode</button><button aria-pressed={incremental} onClick={()=>setIncremental(true)}>Incremental circuit</button></div>
 <Schematic width={560} height={280} description={incremental?`Small-signal voltage ${mv} millivolts drives incremental resistance ${f(d.rd)} ohms.`:`An ideal voltage source of VQ plus the perturbation drives a diode at fixed 300 kelvin. Bias current ${iq} milliamps.`}>
  <Source kind={incremental?'ac':'dc'} a={[100,230]} b={[100,140]} label={incremental?'v = '+mv+' mV':'V_Q + v'} value={incremental?'DC bias removed':f(d.vq+mv/1000,4)+' V'}/>
  <Wire pts={[[100,140],[100,60],[330,60]]}/><CurrentArrow at={[220,60]} dir="right" label={incremental?'i':'I'}/>
  {incremental?<Res a={[330,60]} b={[330,230]} label={'r_d = '+f(d.rd)+' Ω'} value="i ≈ v / r_d"/>:<Diode a={[330,60]} b={[330,230]} label="D · ideal exponential" value="n = 1, T = 300 K"/>}
  <Wire pts={[[330,230],[100,230]]}/><Ground at={[215,230]}/>
 </Schematic>
 <div className="horizontal-controls"><Control label="DC bias current" value={iq} onChange={setIq} min={-2} max={1} step={.02} log unit="mA"/><Control label="Voltage perturbation v" value={mv} onChange={setMv} min={-40} max={40} unit="mV"/></div>
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
 <Schematic width={560} height={280} description={`Current source supplies ${ma} milliamps to a 100 ohm resistor, dissipating ${f(d.power,3)} watts. Single-node thermal model predicts ${f(d.temperature)} degrees Celsius at the selected time.`}>
  <CurrentSource a={[100,230]} b={[100,130]} label={'I = '+ma+' mA'}/><Wire pts={[[100,130],[100,60],[320,60]]}/>
  <Res a={[320,60]} b={[320,230]} label="R = 100 Ω" value={f(d.power,3)+' W → heat'}/><Wire pts={[[320,230],[100,230]]}/><Ground at={[210,230]}/>
  <path d="M440 125 c12 -12 12 12 24 0 m-24 14 c12 -12 12 12 24 0 m-24 14 c12 -12 12 12 24 0" stroke={orange} strokeWidth="1.8" fill="none"/>
  <Text x={340} y={190} kind="output">Body: {f(d.temperature,1)} °C</Text>
 </Schematic>
 <div className="horizontal-controls"><Control label="Resistor current" value={ma} onChange={setMa} min={0} max={100} unit="mA"/><Control label="Thermal resistance" value={theta} onChange={setTheta} min={20} max={200} step={5} unit="°C/W"/><Control label="Ambient temperature" value={ambient} onChange={setAmbient} min={0} max={80} unit="°C"/><Control label="Thermal capacitance" value={capacity} onChange={setCapacity} min={1} max={10} step={.5} unit="J/°C"/><Control label="Elapsed time" value={elapsed} onChange={setElapsed} min={0} max={5} step={.1} unit="τ"/></div>
 <Readouts values={[['DISSIPATION',f(d.power,3),'W'],['STEADY TEMPERATURE',f(d.steady,1),'°C'],['TIME CONSTANT',f(d.tau/60,2),'min']]}/>
 <div className="plot-area"><h4>Temperature takes time to reach equilibrium</h4><Plot curves={[{name:'Body temperature',color:green,points},{name:'Illustrative 125 °C target',color:orange,dashed:true,points:[[0,target],[5*d.tau/60,target]]}]} xRange={[0,5*d.tau/60]} yRange={[0,Math.max(140,d.steady*1.1)]} xLabel="TIME AFTER POWER-ON / min" yLabel="BODY TEMPERATURE / °C" point={[elapsed*d.tau/60,d.temperature]} description={`Starting at ambient ${ambient} degrees Celsius, resistor tends to ${f(d.steady,1)} degrees. After ${f(elapsed*d.tau/60,2)} minutes its temperature is ${f(d.temperature,1)} degrees. The demonstration temperature target is 125 degrees, not a rating for a real part.`}/>
 <p className={'thermal-status '+(d.steady>target?'over-target':'')}>Steady-state margin to the illustrative target: <strong>{f(target-d.steady,1)} °C</strong>. {d.steady>target?'This model exceeds the target, even if the selected early-time temperature is lower.':'A positive temperature margin alone does not establish a real component’s power or pulse rating.'}</p>
 <p className="plot-summary">At {f(elapsed*d.tau/60,2)} minutes: {f(d.temperature,1)} °C. The graph spans five time constants and rescales when cooling or thermal mass changes. Assumptions: constant 100 Ω resistance, constant power, uniform body temperature, fixed ambient, and one thermal path. No real component has been selected.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Double the current: power and steady temperature rise quadruple. Increase thermal capacitance: warming slows, but the final temperature is unchanged. Better cooling lowers thermal resistance and the final temperature.</div></div>;
}


