import {htmlSub} from './MathText';
import {useState} from 'react';
import {junction,diodePoint,rectifier,zener,regulator,limiter,flyback} from '../engine/diodes.mjs';
import Plot from './Plot';
import {Control,Readouts,f} from './LabControls';
import {Schematic,Wire,Res,Cap,Ind,Diode,Source,CurrentSource,Switch,Ground,Rail,Dot,Terminal,Text,CurrentArrow,green,orange,ink,type Pt} from './Schematic';
const pts=(fn:(x:number)=>number,a:number,b:number):[number,number][]=>Array.from({length:201},(_,k)=>{const x=a+(b-a)*k/200;return [x,fn(x)]});
function Head({title,reset}:{title:string;reset:()=>void}){return <div className="lab-heading"><span className="tiny-label">{htmlSub(title)}</span><button onClick={reset}>Reset ↺</button></div>}
function SeriesFigure({source,resistor,output,mode='diode'}:{source:string;resistor:string;output:string;mode?:'diode'|'zener'}){
 const n:Pt=[380,55];
 return <Schematic height={260} description={source+' through '+resistor+'. '+output+(mode==='zener'?'. A 5.1 volt zener from the output to ground, cathode at the output, and a load current sink in parallel.':'. A diode from the output to ground, anode at the output.')}>
  <Source a={[80,200]} b={[80,110]} label={source}/><Wire pts={[[80,110],[80,55],[200,55]]}/><Res a={[200,55]} b={[300,55]} label={resistor}/><Wire pts={[[300,55],n]}/>
  {mode==='diode'?<Diode a={n} b={[380,220]} label="D" value="anode at top"/>:<><Diode kind="zener" a={[380,220]} b={n} label="5.1 V zener" flipLabel/><Wire pts={[n,[490,55]]}/><CurrentSource a={[490,55]} b={[490,220]} label="load"/><Wire pts={[[490,220],[380,220]]}/><Dot at={[380,220]}/></>}
  <Wire pts={[[380,220],[80,220],[80,200]]}/><Ground at={[230,220]}/><Dot at={n} color={green}/>
  <Text x={392} y={42} kind="output">{output}</Text>
 </Schematic>;
}
export function JunctionLab(){
 const [reverse,setReverse]=useState(0),[ratio,setRatio]=useState(1);const d=junction({na:1e22,nd:ratio*1e22,bias:-reverse});
 const left=300-d.xp/d.width*260,right=300+d.xn/d.width*260;
 return <div className="lab" aria-label="PN junction depletion experiment"><Head title="FIXED IONS · CHANGING DEPLETION WIDTH" reset={()=>{setReverse(0);setRatio(1)}}/>
 <svg className="wide-circuit" viewBox="0 0 640 230" role="img" aria-label="P region on left, N region on right. Negative acceptor ions left of junction, positive donor ions right. Electric field points from N toward P.">
 <rect x="45" y="65" width="255" height="100" fill="#efe5d6"/><rect x="300" y="65" width="255" height="100" fill="#dcece5"/><rect x={left} y="65" width={right-left} height="100" fill="var(--paper)" stroke="var(--accent)" strokeDasharray="5 4"/>
 <path d="M300 45 V180" stroke="var(--muted)" strokeDasharray="4 4"/><text x="85" y="45" className="symbol-label">P · acceptors</text><text x="410" y="45" className="symbol-label">N · donors</text>
 <text x={(left+300)/2} y="110" textAnchor="middle" className="symbol-label">−</text><text x={(right+300)/2} y="110" textAnchor="middle" className="symbol-label">+</text>
 <path d="M340 140 H260 l9 -5 m-9 5 l9 5" stroke="var(--ink)" fill="none"/><text x="300" y="205" textAnchor="middle" className="symbol-label">Electric field ← · depletion split shown to scale</text></svg>
 <div className="horizontal-controls"><Control label="Reverse bias magnitude" value={reverse} onChange={setReverse} min={0} max={10} step={.1} unit="V"/><Control label="Donor to acceptor ratio" value={ratio} onChange={setRatio} min={-1} max={1} step={.05} log unit="×"/></div>
 <Readouts values={[['BUILT-IN POTENTIAL',f(d.built,3),'V'],['TOTAL WIDTH',f(d.width*1e6,3),'µm'],['JUNCTION CAPACITANCE',f(d.capacitance*1e12,2),'pF']]}/>
 <div className="plot-area"><Plot curves={[{name:'Depletion width',color:green,points:pts(v=>junction({na:1e22,nd:ratio*1e22,bias:-v}).width*1e6,0,10)}]} xRange={[0,10]} yRange={[0,5]} xLabel="REVERSE BIAS / V" yLabel="DEPLETION WIDTH / µm" point={[reverse,d.width*1e6]} description="Reverse bias increases depletion width; the more lightly doped side contains more of that width."/><p className="plot-summary">300 K silicon; acceptors 10¹⁶ cm⁻³, intrinsic density 10¹⁰ cm⁻³, area 0.01 mm². Abrupt-junction depletion approximation; no breakdown. The sketch keeps total drawn width fixed to emphasize its division. The graph shows absolute width.</p></div></div>;
}
export function DiodeLab(){
 const [vs,setVs]=useState(5),[r,setR]=useState(1000),[n,setN]=useState(1.5);const d=diodePoint({vs,r,n});
 return <div className="lab" aria-label="Diode operating point experiment"><Head title="THE DIODE AND THE REST OF THE CIRCUIT" reset={()=>{setVs(5);setR(1000);setN(1.5)}}/>
 <SeriesFigure source={f(vs)+' V DC'} resistor={f(r,0)+' Ω'} output={f(d.voltage,3)+' V'}/>
 <div className="horizontal-controls"><Control label="Supply voltage" value={vs} onChange={setVs} min={0} max={10} step={.1} unit="V"/><Control label="Series resistance" value={r} onChange={setR} min={2} max={4} step={.05} log unit="Ω"/><Control label="Ideality factor" value={n} onChange={setN} min={1} max={2} step={.05} unit=""/></div>
 <Readouts values={[['DIODE CURRENT',f(d.current*1000,3),'mA'],['DIODE VOLTAGE',f(d.voltage,3),'V'],['LOCAL RESISTANCE',f(d.rd),'Ω']]}/>
 <div className="plot-area"><Plot curves={[{name:'Exponential diode',color:green,points:pts(v=>1e-9*Math.expm1(v/(n*.025852)),0,Math.min(1.4,n*.025852*Math.log1p(Math.max(.001,vs/r*1.1)/1e-12)))},{name:'Circuit load line',color:orange,points:pts(v=>Math.max(0,(vs-v)/r)*1000,0,Math.min(1.4,vs))}]} xRange={[0,1.4]} yRange={[0,Math.max(1,vs/r*1100)]} xLabel="DIODE VOLTAGE / V" yLabel="FORWARD CURRENT / mA" point={[d.voltage,d.current*1000]} description="The intersection of the diode curve and resistor load line sets both current and voltage."/><p className="plot-summary">Fixed 300 K; saturation current 1 pA. Ideality factor changes an illustrative model, not temperature. No breakdown, series resistance, stored charge, or self-heating. Curves stop at the plot limits. A diode has no universal 0.7 V threshold.</p></div></div>;
}
export function RectifierLab(){
 const [uf,setUf]=useState(470),[rl,setRl]=useState(500),[bridge,setBridge]=useState(true);
 const d=rectifier({c:uf*1e-6,rl,bridge});
 return <div className="lab" aria-label="Rectifier reservoir experiment"><Head title="RECHARGE PULSES · LOAD DISCHARGE" reset={()=>{setUf(470);setRl(500);setBridge(true)}}/>
 <div className="view-buttons"><button aria-pressed={bridge} onClick={()=>setBridge(true)}>Full-wave bridge</button><button aria-pressed={!bridge} onClick={()=>setBridge(false)}>Half-wave</button></div>
 <Schematic height={220} description="Isolated 9 V RMS 50 Hz source with 10 ohms total series resistance feeds the selected rectifier, then a parallel capacitor and load. The rectifier is shown as a functional block.">
  <Source kind="ac" a={[65,170]} b={[65,90]} label="9 V RMS"/><Wire pts={[[65,90],[65,55],[110,55]]}/><Res a={[110,55]} b={[190,55]} label="10 Ω"/><Wire pts={[[190,55],[220,55]]}/>
  <g data-pins="220,55 220,170 370,55 370,170"><rect x="220" y="30" width="150" height="155" fill="var(--white)" stroke={ink} strokeWidth="1.8"/>
   <Text x={295} y={100} anchor="middle">{bridge?'Bridge':'Half-wave'}</Text><Text x={295} y={124} anchor="middle" kind="value">{bridge?'2 × 0.7 V':'1 × 0.7 V'}</Text></g>
  <Wire pts={[[65,170],[220,170]]}/><Wire pts={[[370,55],[530,55]]}/><Wire pts={[[370,170],[530,170]]}/>
  <Cap polar a={[440,170]} b={[440,55]} label="C" value="reservoir"/><Res a={[530,55]} b={[530,170]} label="load"/><Dot at={[440,55]}/><Dot at={[440,170]}/>
 </Schematic>
 <div className="horizontal-controls"><Control label="Reservoir capacitance" value={uf} onChange={setUf} min={100} max={2200} step={50} unit="µF"/><Control label="Load resistance" value={rl} onChange={setRl} min={100} max={1000} step={25} unit="Ω"/></div>
 <Readouts values={[['MEAN OUTPUT',f(d.mean),'V'],['RIPPLE',f(d.ripple,3),'V p-p'],['PEAK RECHARGE',f(d.peakCurrent*1000),'mA']]}/>
 <div className="plot-area"><Plot curves={[{name:'Available rectified voltage',color:orange,points:d.points.map(p=>[p.t*1000,p.drive])},{name:'Reservoir voltage',color:green,points:d.points.map(p=>[p.t*1000,p.v])}]} xRange={[0,40]} yRange={[0,13]} xLabel="TIME / ms" yLabel="VOLTAGE / V" description="Two source periods after settling: capacitor recharges near peaks and supplies the resistor between them."/><Plot curves={[{name:'Recharge current',color:orange,points:d.points.map(p=>[p.t*1000,p.current*1000])}]} xRange={[0,40]} yRange={[0,Math.max(1,d.peakCurrent*1100)]} xLabel="TIME / ms" yLabel="SOURCE CURRENT MAGNITUDE / mA" description="Source current is concentrated in recharge pulses, rather than equal to load current at every instant."/><p className="plot-summary">9 V RMS, 50 Hz isolated source; 10 Ω total source resistance. Fixed diode drops, resistor load, ideal capacitor. Backward-Euler steps of 20 µs after 38 settling cycles. Winding inductance, recovery, capacitor ESR and startup surge are omitted from the displayed steady-state window.</p></div></div>;
}
export function RegulatorLab(){
 const [vin,setVin]=useState(12),[ma,setMa]=useState(10);const z=zener({vin,load:ma/1000}),d=regulator({vin,load:ma/1000});
 return <div className="lab" aria-label="Regulator current budget experiment"><Head title="SHUNT CURRENT vs SERIES HEADROOM" reset={()=>{setVin(12);setMa(10)}}/>
 <SeriesFigure source={f(vin)+' V'} resistor="330 Ω" output={f(z.out)+' V'} mode="zener"/>
 <div className="horizontal-controls"><Control label="Input voltage" value={vin} onChange={setVin} min={4} max={18} step={.1} unit="V"/><Control label="Load demand" value={ma} onChange={setMa} min={0} max={40} step={.5} unit="mA"/></div>
 <Readouts values={[['ZENER CURRENT',f(z.iz*1000),'mA'],['ZENER POWER',f(z.pz*1000),'mW'],['RESISTOR POWER',f(z.pr*1000),'mW']]}/>
 <div className="plot-area"><Plot curves={[{name:'5.1 V ideal zener shunt',color:green,points:pts(i=>zener({vin,load:i/1000}).out,0,40)},{name:'5 V series regulator',color:orange,points:pts(i=>regulator({vin,load:i/1000}).out,0,40)}]} xRange={[0,40]} yRange={[0,6]} xLabel="LOAD DEMAND / mA" yLabel="OUTPUT VOLTAGE / V" point={[ma,z.out]} description="A shunt regulator loses its voltage when load demand consumes the current budget."/><p className="plot-summary">Zener output {f(z.out)} V; {z.iz>0?'positive zener current remains':'no zener-current margin remains'}. Load is an ideal current sink while voltage is positive; demand is unmet if output reaches zero. Zener has an ideal sharp 5.1 V knee and zero dynamic resistance; real minimum regulation current is greater than zero.</p><p className="plot-summary">The separate series model gives {f(d.out)} V, dissipates {f(d.power*1000)} mW, and estimates {f(d.tj)} °C at 25 °C ambient with 60 °C/W. Fixed 0.5 V dropout; no current limit, quiescent current, loop dynamics, or thermal shutdown. Curves are not component guarantees.</p></div></div>;
}
export function LimiterLab(){
 const [amp,setAmp]=useState(5),[r,setR]=useState(1000);const d=limiter({vin:amp,r});
 return <div className="lab" aria-label="Diode limiter experiment"><Head title="A CLAMP NEEDS A CURRENT PATH" reset={()=>{setAmp(5);setR(1000)}}/>
 <Schematic height={250} description="Input through series resistor to output. Upper diode from output anode to 3.3 volt cathode; lower diode from ground anode to output cathode.">
  <Terminal at={[65,125]} label="V_in" side="above"/><Wire pts={[[65,125],[150,125]]}/><Res a={[150,125]} b={[250,125]} label={f(r,0)+' Ω'}/><Wire pts={[[250,125],[400,125]]}/>
  <Rail at={[400,40]} label="3.3 V"/><Diode a={[400,125]} b={[400,40]} label="to 3.3 V"/><Diode a={[400,215]} b={[400,125]} label="from ground"/><Ground at={[400,215]}/>
  <Wire pts={[[400,125],[500,125]]} color={green}/><Terminal at={[500,125]} label="V_out" side="right"/><Dot at={[400,125]} color={green}/>
 </Schematic>
 <div className="horizontal-controls"><Control label="Input amplitude" value={amp} onChange={setAmp} min={1} max={10} step={.1} unit="V peak"/><Control label="Limiting resistance" value={r} onChange={setR} min={2} max={4} step={.05} log unit="Ω"/></div>
 <Readouts values={[['UPPER CLIP LEVEL','3.60','V'],['POSITIVE PEAK CURRENT',f(d.current*1000),'mA'],['NEGATIVE PEAK MAGNITUDE',f(Math.max(0,amp-.3)/r*1000),'mA']]}/>
 <div className="plot-area"><Plot curves={[{name:'Input',color:orange,points:pts(t=>amp*Math.sin(2*Math.PI*t),0,2)},{name:'Clamped output',color:green,points:pts(t=>limiter({vin:amp*Math.sin(2*Math.PI*t),r}).out,0,2)}]} xRange={[0,2]} yRange={[-amp-1,amp+1]} xLabel="TIME / PERIODS" yLabel="VOLTAGE / V" description="Ideal 0.3 V diode clamps limit the output to minus 0.3 V and plus 3.6 V."/><p className="plot-summary">Fixed 0.3 V drops, no output load, ideal rails that can accept injected current. Resistance sets current, not the ideal clipping levels. Actual clamps depend on current, temperature, rail impedance, and the protected input's ratings.</p></div></div>;
}
export function ProtectionLab(){
 const [clamp,setClamp]=useState(.7),[ms,setMs]=useState(1);const d=flyback({clamp,t:ms/1000}),base=flyback({clamp:.7});
 return <div className="lab" aria-label="Inductive load protection experiment"><Head title="SAME INITIAL ENERGY · DIFFERENT RELEASE TIME" reset={()=>{setClamp(.7);setMs(1)}}/>
 <Schematic height={290} description="12 volt rail feeds a 120 ohm winding resistance and 100 millihenry coil above a low-side switch. A clamp across the whole winding returns switch-node current to the supply rail during turn-off.">
  <Rail at={[270,30]} label="+12 V"/><Wire pts={[[270,30],[270,45]]}/><Res a={[270,45]} b={[270,115]} label="120 Ω" value="winding R" flipLabel/><Ind a={[270,115]} b={[270,200]} label="100 mH" flipLabel/>
  <Switch a={[270,200]} b={[270,260]}/><Ground at={[270,260]}/>
  <Wire pts={[[270,45],[460,45],[460,85]]}/><Wire pts={[[270,200],[460,200],[460,145]]}/><Dot at={[270,45]}/><Dot at={[270,200]} color={green}/>
  <g data-pins="460,85 460,145"><rect x="410" y="85" width="100" height="60" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><Text x={460} y={110} anchor="middle">clamp ↑</Text><Text x={460} y={132} anchor="middle" kind="value">{f(clamp)} V</Text></g>
  <Text x={290} y={228} kind="output">V_switch ≤ {f(d.switchVoltage)} V</Text>
 </Schematic>
 <div className="horizontal-controls"><Control label="Opposing clamp voltage" value={clamp} onChange={setClamp} min={.7} max={36} step={.1} unit="V"/><Control label="Time after opening" value={ms} onChange={setMs} min={0} max={3} step={.01} unit="ms"/></div>
 <Readouts values={[['CURRENT',f(d.current*1000),'mA'],['TIME TO ZERO',f(d.stop*1000,3),'ms'],['CLAMP ENERGY',f(d.clampEnergy*1000,3),'mJ']]}/>
 <div className="plot-area"><Plot curves={[{name:'Selected clamp',color:green,points:pts(t=>flyback({clamp,t:t/1000}).current*1000,0,3)},{name:'0.7 V flywheel diode',color:orange,dashed:true,points:pts(t=>flyback({clamp:.7,t:t/1000}).current*1000,0,3)}]} xRange={[0,3]} yRange={[0,110]} xLabel="TIME AFTER OPENING / ms" yLabel="COIL CURRENT / mA" point={[ms,d.current*1000]} description="A larger opposing clamp voltage makes current decay faster. The fixed comparison is a 0.7 volt diode."/><p className="plot-summary">Initially 100 mA and 0.5 mJ. Selected clamp absorbs {f(d.clampEnergy*1000,3)} mJ; winding resistance absorbs {f(d.copperEnergy*1000,3)} mJ. The 0.7 V comparison reaches zero in {f(base.stop*1000,3)} ms. Clamp is across the entire winding: switch stress is supply plus clamp voltage. Fixed clamp voltage, linear L and R, ideal opening switch; wiring overshoot, recovery and mechanical motion omitted.</p></div></div>;
}




export function BridgePaths(){
 const [positive,setPositive]=useState(true);
 const A:Pt=[180,140],B:Pt=[460,140],T:Pt=[320,40],Bt:Pt=[320,240];
 return <div className="lab" aria-label="Bridge current paths"><Head title="FOLLOW TWO DIODES AT A TIME" reset={()=>setPositive(true)}/><div className="view-buttons"><button aria-pressed={positive} onClick={()=>setPositive(true)}>A higher than B</button><button aria-pressed={!positive} onClick={()=>setPositive(false)}>B higher than A</button></div>
 <Schematic height={300} description={positive?'Current goes from A through upper-left diode, through the load from plus to minus, and through lower-right diode to B.':'Current goes from B through upper-right diode, through the load from plus to minus, and through lower-left diode to A.'}>
  {[{a:A,b:T,on:positive},{a:B,b:T,on:!positive},{a:Bt,b:A,on:!positive},{a:Bt,b:B,on:positive}].map((s,i)=><Diode key={i} a={s.a} b={s.b} color={s.on?green:'var(--line)'}/>)}
  <Terminal at={[120,140]} label="AC A"/><Wire pts={[[120,140],A]}/><Terminal at={[520,140]} label="AC B" side="right"/><Wire pts={[B,[520,140]]}/>
  <Wire pts={[T,[580,40],[580,115]]} color={green}/><Res a={[580,115]} b={[580,165]} label="load"/><Wire pts={[[580,165],[580,240],Bt]} color={green}/>
  <CurrentArrow at={[580,80]} dir="down" color={green}/><Dot at={A}/><Dot at={B}/><Dot at={T}/><Dot at={Bt}/>
  <Text x={320} y={25} anchor="middle" kind="output">DC +</Text><Text x={320} y={268} anchor="middle" kind="output">DC −</Text>
 </Schematic>
 <div className="lab-prompt">Solid green branches conduct; dashed branches block. Load current stays downward in either half-cycle. Resistive load, ideal diodes; the reservoir experiment below adds capacitor memory.</div></div>;
}



