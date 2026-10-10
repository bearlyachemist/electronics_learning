import {useMemo,useState} from 'react';
import {mirror,mirrorRout,diffPair,diffGains,pushPullCycle,pushPull,compound,sharing,follower,ceFrequency} from '../engine/stages.mjs';
import {mag,db} from '../engine/ac.mjs';
import Plot from './Plot';
import {Control,Readouts,f} from './LabControls';
import {Wires,Res,Cap,Diode,Source,Ground,Dot,Label,Bjt,eng,engText,logspace,green,orange,gray,ink} from './Parts';
function Head({title,reset}:{title:string;reset:()=>void}){return <div className="lab-heading"><div><span className="live-dot"/><span className="tiny-label">{title}</span></div><button onClick={reset}>Reset ↺</button></div>}
const pts=(fn:(x:number)=>number,a:number,b:number,n=200):[number,number][]=>Array.from({length:n+1},(_,k)=>{const x=a+(b-a)*k/n;return [x,fn(x)]});
const Rail=({x1,x2,y,label}:{x1:number;x2:number;y:number;label:string})=><><path d={`M${x1} ${y} H${x2}`} stroke={ink} strokeWidth="2.4"/><Label x={x2+8} y={y+5}>{label}</Label></>;
const decades=(a:number,b:number)=>Array.from({length:b-a+1},(_,k)=>10**(a+k));
const OpAmp=({x,y}:{x:number;y:number})=><g><polygon points={`${x},${y-30} ${x},${y+30} ${x+52},${y}`} fill="var(--white)" stroke={ink} strokeWidth="1.8"/><text x={x+6} y={y-10} className="symbol-value">+</text><text x={x+7} y={y+18} className="symbol-value">−</text></g>;

/* ---------- Current mirrors ---------- */
type MirrorType='basic'|'degenerated'|'helper'|'wilson'|'widlar';
const mirrorNames:Record<MirrorType,string>={basic:'Basic',degenerated:'Degenerated',helper:'β-helper',wilson:'Wilson',widlar:'Widlar'};
function MirrorCircuit({type,vout,re}:{type:MirrorType;vout:number;re:string}){
 const withRe1=type==='degenerated',withRe2=type==='degenerated'||type==='widlar',wilson=type==='wilson',helper=type==='helper';
 return <svg className="wide-circuit" viewBox="0 0 640 300" role="img" aria-label={mirrorNames[type]+' current mirror. A reference resistor from the supply feeds Q1; Q2 copies its current into an output forced to '+f(vout,1)+' volts.'}>
  <Rail x1={190} x2={470} y={25} label="+15 V"/><Wires d="M238 25 V55 M238 115 V130 M280 170 H340"/><Res x={238} y={85} v/><Bjt x={250} y={170} flip/>
  {!wilson&&<><Bjt x={370} y={170}/><Wires d="M382 130 V60"/><Dot x={382} y={95} color={green}/></>}
  {!helper&&!wilson&&<><Wires d="M238 122 H300 V170"/><Dot x={300} y={170}/></>}
  {helper&&<><Bjt x={300} y={100}/><Wires d="M238 122 H255 V100 H270 M312 60 V25 M312 140 V170"/><Dot x={312} y={170}/><Label x={322} y={95} kind="value">Q₃</Label></>}
  {wilson&&<><Bjt x={370} y={170}/><Bjt x={370} y={90}/><Wires d="M238 122 H325 V90 H340 M382 130 H355 V170 M382 50 V35"/><Dot x={355} y={170}/><Dot x={382} y={130}/><Dot x={382} y={42} color={green}/><Label x={404} y={95} kind="value">Q₃</Label></>}
  {withRe1?<><Wires d="M238 210 V215 M238 275 V280"/><Res x={238} y={245} v/><Ground x={238} y={280}/><Label x={215} y={250} anchor="end">{re}</Label></>:<><Wires d="M238 210 V230"/><Ground x={238} y={230}/></>}
  {withRe2?<><Wires d="M382 210 V215 M382 275 V280"/><Res x={382} y={245} v/><Ground x={382} y={280}/><Label x={404} y={250}>{re}</Label></>:<><Wires d="M382 210 V230"/><Ground x={382} y={230}/></>}
  <Label x={218} y={90} anchor="end">14.3 kΩ</Label><Label x={208} y={175} anchor="end">Q₁</Label><Label x={404} y={175}>Q₂</Label>
  <Label x={420} y={wilson?47:100} kind="output">I_out → node held at {f(vout,1)} V</Label>
 </svg>;
}
export function MirrorLab(){
 const [type,setType]=useState<MirrorType>('basic'),[vout,setVout]=useState(5),[beta,setBeta]=useState(100),[va,setVa]=useState(100),[rek,setRek]=useState(1);
 const params=(t:MirrorType)=>({type:(t==='degenerated'?'basic':t) as 'basic'|'helper'|'wilson'|'widlar',beta,va,re:t==='degenerated'?rek*1e3:t==='widlar'?rek*5e3:0});
 const d=mirror({...params(type),vout}),rout=mirrorRout({...params(type),vout});
 const curve=useMemo(()=>pts(v=>mirror({...params(type),vout:v}).iout*1000,0,14,70),[type,beta,va,rek]);
 const basic=useMemo(()=>pts(v=>mirror({...params('basic'),vout:v}).iout*1000,0,14,70),[beta,va]);
 const ymax=Math.max(...curve.map(p=>p[1]),...(type==='widlar'?[]:basic.map(p=>p[1])))*1.15;
 const reset=()=>{setType('basic');setVout(5);setBeta(100);setVa(100);setRek(1)};
 return <div className="lab" aria-label="Current mirror experiment"><Head title="COPY A CURRENT · COUNT THE ERRORS" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Mirror type">{(Object.keys(mirrorNames) as MirrorType[]).map(t=><button key={t} aria-pressed={type===t} onClick={()=>setType(t)}>{mirrorNames[t]}</button>)}</div>
 <MirrorCircuit type={type} vout={vout} re={type==='widlar'?engText(rek*5e3,'Ω'):engText(rek*1e3,'Ω')}/>
 <div className="horizontal-controls"><Control label="Output voltage" value={vout} onChange={setVout} min={.1} max={14} step={.1} unit="V"/><Control label="Transistor β" value={beta} onChange={setBeta} min={20} max={400} step={5} unit=""/><Control label="Early voltage V_A" value={va} onChange={setVa} min={1} max={3} step={.02} log unit="V"/>{(type==='degenerated'||type==='widlar')&&<Control label={type==='widlar'?'Q₂ emitter resistor (×5 kΩ)':'Emitter resistors'} value={rek} onChange={setRek} min={.1} max={3} step={.05} unit={type==='widlar'?'×5 kΩ':'kΩ'}/>}</div>
 <Readouts values={[['OUTPUT CURRENT',...eng(d.iout,'A')],['I_out / I_ref',f(d.iout/d.iref,4),''],['OUTPUT RESISTANCE',...eng(rout,'Ω')]]}/>
 <div className="plot-area"><h4>{type==='widlar'?'A small, well-defined current from a modest resistor':'The flatter the line, the better the current source'}</h4><Plot curves={[{name:mirrorNames[type]+' mirror',color:green,points:curve},...(type!=='basic'&&type!=='widlar'?[{name:'Basic mirror',color:gray,dashed:true,points:basic}]:[]),{name:'Reference current',color:orange,dashed:true,points:[[0,d.iref*1000],[14,d.iref*1000]]}]} xRange={[0,14]} xTicks={[0,2,4,6,8,10,12,14]} yRange={[0,ymax]} xLabel="OUTPUT (COLLECTOR) VOLTAGE / V" yLabel="OUTPUT CURRENT / mA" point={[vout,d.iout*1000]} description={'Output current versus output voltage for the '+mirrorNames[type]+' mirror. At '+f(vout,1)+' volts the current is '+engText(d.iout,'A')+'.'}/>
 <p className="plot-summary">Reference ≈ {engText(d.iref,'A')} through 14.3 kΩ from 15 V. Matched Ebers–Moll transistors at one temperature, β_R = 2, Early factor on the transport current. Below a few tenths of a volt the output transistor saturates. Real discrete transistors also mismatch: 1 mV of V_BE difference alone shifts a basic mirror by 4%.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> In the basic mirror, set β = 30: the output falls about 6% below I_ref. Switch to β-helper or Wilson and the base-current error nearly vanishes. Compare the slopes: the Wilson and degenerated mirrors are tens of times flatter.</div></div>;
}

/* ---------- Differential amplifier ---------- */
export function DiffPairLab(){
 const [re,setRe]=useState(0),[source,setSource]=useState(false),[vcm,setVcm]=useState(1),[vdm,setVdm]=useState(5);
 const itail=1e-3,rc=10e3,rtail=source?5e6:14.3e3,g=diffGains({itail,rc,re,rtail});
 const vout=(t:number)=>{const vd=vdm/1000*Math.sin(2*Math.PI*1000*t),d=diffPair({vd,itail,re});return rc*(d.i1-itail/2)+g.acm*vcm*Math.sin(2*Math.PI*50*t);};
 const reset=()=>{setRe(0);setSource(false);setVcm(1);setVdm(5)};
 return <div className="lab" aria-label="Differential amplifier experiment"><Head title="AMPLIFY THE DIFFERENCE · REJECT WHAT IS COMMON" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Tail"><button aria-pressed={!source} onClick={()=>setSource(false)}>Tail resistor 14.3 kΩ</button><button aria-pressed={source} onClick={()=>setSource(true)}>Tail current source</button></div>
 <svg className="wide-circuit" viewBox="0 0 640 300" role="img" aria-label={'Long-tailed pair: two NPN transistors with 10 kilohm collector resistors to +15 volts; emitters joined'+(re>0?' through '+re+' ohm resistors':'')+' to a '+(source?'1 milliamp current source':'14.3 kilohm resistor')+' to −15 volts. Output taken from the collector of Q2.'}>
  <Rail x1={220} x2={440} y={22} label="+15 V"/><Rail x1={220} x2={440} y={285} label="−15 V"/><Wires d="M262 22 V40 M262 100 V110 M398 22 V40 M398 100 V110 M262 190 V195 M398 190 V195 M330 225 V235 M330 265 V285 M120 150 H220 M440 150 H540"/>
  <Res x={262} y={70} v/><Res x={398} y={70} v/><Bjt x={250} y={150}/><Bjt x={410} y={150} flip/>
  {re>0?<><Res x={292} y={205}/><Res x={368} y={205}/><Wires d="M262 195 V205 M398 195 V205 M322 205 H338 M330 205 V225"/></>:<Wires d="M262 195 V215 H398 V195 M330 215 V225"/>}
  {source?<><circle cx="330" cy="250" r="16" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><path d="M330 260 V240 m-5 6 l5 -6 l5 6" stroke={ink} strokeWidth="1.8" fill="none" transform="rotate(180 330 250)"/><Wires d="M330 225 V234 M330 266 V285"/></>:<Res x={330} y={255} v/>}
  <Dot x={398} y={105} color={green}/><Label x={110} y={155} anchor="end">v₁</Label><Label x={550} y={155}>v₂</Label><Label x={240} y={75} anchor="end">10 kΩ</Label><Label x={420} y={75}>10 kΩ</Label><Label x={420} y={112} kind="output">vout</Label><Label x={352} y={260}>{source?'1 mA':'14.3 kΩ'}</Label>{re>0&&<Label x={330} y={190} anchor="middle" kind="value">R_E = {re} Ω each</Label>}
 </svg>
 <div className="horizontal-controls"><Control label="Emitter degeneration R_E" value={re} onChange={setRe} min={0} max={1000} step={10} unit="Ω"/><Control label="Differential signal (1 kHz)" value={vdm} onChange={setVdm} min={0} max={100} step={1} unit="mV peak"/><Control label="Common-mode interference (50 Hz)" value={vcm} onChange={setVcm} min={0} max={3} step={.05} unit="V peak"/></div>
 <Readouts values={[['DIFFERENTIAL GAIN',f(g.ad,1),'single-ended'],['COMMON-MODE GAIN',f(g.acm,4),''],['CMRR',f(20*Math.log10(g.cmrr),1),'dB']]}/>
 <div className="plot-area"><h4>Large-signal transfer: currents steer smoothly from one side to the other</h4><Plot curves={[{name:'I_C1',color:green,points:pts(v=>diffPair({vd:v/1000,itail,re}).i1*1000,-200,200)},{name:'I_C2',color:orange,points:pts(v=>diffPair({vd:v/1000,itail,re}).i2*1000,-200,200)},{name:'Small-signal slope at 0',color:gray,dashed:true,points:pts(v=>.5+v/1000/(2*(g.re+re))*1000,-200,200,2)}]} xRange={[-200,200]} yRange={[0,1]} xLabel="DIFFERENTIAL INPUT v₁ − v₂ / mV" yLabel="COLLECTOR CURRENT / mA" description="Collector currents versus differential input: a hyperbolic-tangent steering curve whose linear range widens with emitter degeneration."/>
 <Plot curves={[{name:'Output (AC part of V_C2)',color:green,points:pts(t=>vout(t/1000),0,40,800)}]} xRange={[0,40]} yRange={[-6,6]} xLabel="TIME / ms" yLabel="OUTPUT CHANGE / V" description={'Output with a '+vdm+' millivolt 1 kHz differential signal and a '+vcm+' volt 50 hertz common-mode signal.'}/>
 <p className="plot-summary">Tail current 1 mA, so each side runs at 0.5 mA with r_e = {f(g.re,1)} Ω. Differential gain R_C/2(r_e + R_E); common-mode gain ≈ −R_C/2R_tail. Common-mode output here: {f(Math.abs(g.acm)*vcm*1000,1)} mV peak; wanted output: about {f(g.ad*vdm,0)} mV peak. Matched transistors assumed: real mismatch converts some common-mode signal into a differential one.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> With the tail resistor, the 50 Hz interference is clearly visible. Switch to the current source: CMRR rises from about 49 dB to nearly 100 dB and the hum disappears. Then raise the differential signal past 50 mV and watch the tanh curve clip it.</div></div>;
}

/* ---------- Push–pull output stage ---------- */
type PPMode='B'|'AB'|'feedback';
export function PushPullLab(){
 const [mode,setMode]=useState<PPMode>('B'),[amp,setAmp]=useState(2),[rl,setRl]=useState(8);
 const p={mode,rl,re:mode==='AB'?.47:0,vcc:15};
 const c=useMemo(()=>pushPullCycle({amp,n:128,...p}),[mode,amp,rl]);
 const transfer=useMemo(()=>pts(v=>pushPull({vin:v,...p}).vout,-3,3,120),[mode,rl]);
 const reset=()=>{setMode('B');setAmp(2);setRl(8)};
 return <div className="lab" aria-label="Push–pull output stage experiment"><Head title="TWO FOLLOWERS, ONE FOR EACH HALF" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Biasing">{([['B','Class B'],['AB','Class AB (diode bias)'],['feedback','Class B inside feedback']] as [PPMode,string][]).map(([m,n])=><button key={m} aria-pressed={mode===m} onClick={()=>setMode(m)}>{n}</button>)}</div>
 <svg className="wide-circuit" viewBox="0 0 640 300" role="img" aria-label={'Complementary push–pull follower: NPN on top with collector at +15 V, PNP below with collector at −15 V, emitters joined to drive a '+rl+' ohm load. '+(mode==='AB'?'Two diodes between the bases bias both transistors slightly on; 0.47 ohm emitter resistors.':mode==='feedback'?'An op-amp drives the bases and takes feedback from the output.':'Bases tied together to the input.')}>
  <Rail x1={330} x2={460} y={22} label="+15 V"/><Rail x1={330} x2={460} y={285} label="−15 V"/><Bjt x={370} y={95}/><g transform="translate(0 300) scale(1 -1)"><Bjt x={370} y={95} pnp/></g>
  <Wires d="M382 22 V55 M382 245 V285"/>
  {mode==='AB'?<><Wires d="M382 135 V137 M382 147 V153 M382 163 V165 M382 150 H500"/><rect x="376" y="137" width="12" height="10" fill="var(--white)" stroke={ink} strokeWidth="1.5"/><rect x="376" y="153" width="12" height="10" fill="var(--white)" stroke={ink} strokeWidth="1.5"/><Dot x={382} y={150}/><Wires d="M300 22 V25 M300 85 V92 M300 95 H340 M300 208 V215 M300 205 H340 M300 275 V285 M300 150 H160"/><Res x={300} y={55} v/><Diode x={300} y={122} rotate={90}/><Diode x={300} y={178} rotate={90}/><Res x={300} y={245} v/><Dot x={300} y={150}/><Label x={404} y={156} kind="value">0.47 Ω ×2</Label></>
  :<><Wires d="M382 135 V165 M382 150 H500 M340 95 H300 V205 H340 M300 150 H200"/><Dot x={300} y={150}/><Dot x={382} y={150}/></>}
  {mode==='feedback'&&<><OpAmp x={148} y={150}/><Wires d="M200 150 H300 M148 165 H120 V265 H470 V150 M148 135 H90"/><Dot x={470} y={150}/><Label x={80} y={140} anchor="end">in</Label></>}
  {mode!=='feedback'&&<Label x={mode==='AB'?150:190} y={140} anchor="end">in</Label>}
  <Wires d="M500 150 V180 M500 240 V250"/><Res x={500} y={210} v/><Ground x={500} y={250}/><Dot x={500} y={150} color={green}/><Label x={520} y={215}>{rl} Ω</Label><Label x={510} y={140} kind="output">out</Label>
 </svg>
 <div className="horizontal-controls"><Control label="Input amplitude" value={amp} onChange={setAmp} min={.2} max={14} step={.1} unit="V peak"/><Control label="Load" value={rl} onChange={setRl} min={4} max={16} step={1} unit="Ω"/></div>
 <Readouts values={[['TOTAL HARMONIC DISTORTION',c.thd<.01?f(c.thd*100,3):f(c.thd*100,1),'%'],['EFFICIENCY',f(c.efficiency*100,1),'%'],['QUIESCENT CURRENT',...(c.quiescent<1e-9?['0','A'] as [string,string]:eng(c.quiescent,'A'))]]}/>
 <div className="plot-area"><h4>{mode==='B'?'A dead zone near zero: crossover distortion':mode==='AB'?'Both transistors conduct through the crossover':'The loop drives the bases across the dead zone'}</h4><Plot curves={[{name:'Input',color:gray,dashed:true,points:c.pts.map(q=>[q.t,q.vin] as [number,number])},{name:'Output',color:green,points:c.pts.map(q=>[q.t,q.vout] as [number,number])}]} xRange={[0,1]} yRange={[-amp*1.15,amp*1.15]} xLabel="TIME / PERIOD" yLabel="VOLTAGE / V" description={'One period: total harmonic distortion '+f(c.thd*100,2)+' percent.'}/>
 <Plot curves={[{name:'Static transfer vout(vin)',color:orange,points:transfer},{name:'Ideal: vout = vin',color:gray,dashed:true,points:[[-3,-3],[3,3]]}]} xRange={[-3,3]} yRange={[-3,3]} xLabel="INPUT / V (ZOOMED NEAR ZERO)" yLabel="OUTPUT / V" description="Static transfer curve near zero showing the crossover region."/>
 <p className="plot-summary">Load power {engText(c.pLoad,'W')}, supply power {engText(c.pSupply,'W')}, transistors dissipate {engText(c.pSupply-c.pLoad,'W')}. ±15 V supplies; exponential transistors (I_S = 1 pA) with about 1 V saturation; class AB uses two 0.65 V diode drops of bias; the feedback loop has gain 200. Thermal effects on bias are discussed in the text, not simulated.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> In class B at 1 V amplitude, THD is tens of percent—small signals lose most of their shape. Switch to AB: distortion drops below 0.1% at the cost of a standing current. Turn the amplitude up in class B and watch efficiency approach its 78.5% ceiling.</div></div>;
}

/* ---------- Darlington and Sziklai ---------- */
type Pair='single'|'darlington'|'sziklai';
function PairCircuit({type}:{type:Pair}){
 return <svg className="wide-circuit" viewBox="0 0 640 260" role="img" aria-label={type==='single'?'Single power NPN switching a load from 12 volts.':type==='darlington'?'Darlington pair: driver NPN emitter drives the base of the power NPN; collectors tied to the load.':'Sziklai pair: driver NPN collector pulls down the base of a power PNP whose emitter connects to the load and whose collector returns to the driver emitter at ground.'}>
  <Rail x1={360} x2={480} y={22} label="+12 V"/><Wires d="M412 22 V40 M412 100 V112"/><Res x={412} y={70} v/><Label x={434} y={75}>load</Label><Dot x={412} y={110} color={green}/>
  {type==='single'&&<><Bjt x={400} y={152}/><Wires d="M412 112 V112 M412 192 V220 M370 152 H200"/><Ground x={412} y={220}/></>}
  {type==='darlington'&&<><Bjt x={330} y={140}/><Bjt x={400} y={190}/><Wires d="M342 100 V105 H412 V150 M342 180 V190 H370 M412 230 V240 M300 140 H200"/><Dot x={412} y={105}/><Ground x={412} y={240}/><Label x={300} y={120} kind="value">Q₁</Label><Label x={430} y={195} kind="value">Q₂</Label></>}
  {type==='sziklai'&&<><Bjt x={300} y={192}/><g transform="translate(0 260) scale(1 -1)"><Bjt x={400} y={108} pnp/></g><Wires d="M312 152 H370 M312 232 V240 H412 V192 M270 192 H200"/><Ground x={412} y={240}/><Label x={250} y={225} kind="value">Q₁ (NPN)</Label><Label x={440} y={155} kind="value">Q₂ (PNP)</Label></>}
  <Label x={190} y={type==='darlington'?145:type==='sziklai'?197:157} anchor="end">I_B in</Label>
 </svg>;
}
export function DarlingtonLab(){
 const [type,setType]=useState<Pair>('darlington'),[ibm,setIbm]=useState(2),[rl,setRl]=useState(12);
 const d=compound({type,ib:ibm/1000,rc:rl});
 const curves=useMemo(()=>(['single','darlington','sziklai'] as Pair[]).map(t=>pts(x=>compound({type:t,ib:10**x/1000,rc:rl,n:32}).vce,-2,1,20)),[rl]);
 const reset=()=>{setType('darlington');setIbm(2);setRl(12)};
 return <div className="lab" aria-label="Darlington and Sziklai switch experiment"><Head title="MULTIPLY β — AND PAY A V_BE" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Configuration">{([['single','Single power transistor'],['darlington','Darlington'],['sziklai','Sziklai (complementary)']] as [Pair,string][]).map(([t,n])=><button key={t} aria-pressed={type===t} onClick={()=>setType(t)}>{n}</button>)}</div>
 <PairCircuit type={type}/>
 <div className="horizontal-controls"><Control label="Base drive current" value={ibm} onChange={setIbm} min={-2} max={1} step={.02} log unit="mA"/><Control label="Load resistance (to 12 V)" value={rl} onChange={setRl} min={.8} max={3} step={.02} log unit="Ω"/></div>
 <Readouts values={[['V_CE (ON VOLTAGE)',f(d.vce,3),'V'],['LOAD CURRENT',...eng(d.ic,'A')],['CURRENT GAIN I_C/I_B',f(d.gain,0),'']]}/>
 <div className="plot-area"><h4>Collector voltage as base drive increases</h4><Plot curves={[{name:'Single (β = 50)',color:gray,points:curves[0]},{name:'Darlington',color:green,points:curves[1]},{name:'Sziklai',color:orange,dashed:true,points:curves[2]}]} xRange={[-2,1]} xTicks={[-2,-1,0,1]} yRange={[0,12.5]} xLabel="BASE CURRENT / mA (LOG₁₀: −2 = 10 µA, 1 = 10 mA)" yLabel="COLLECTOR–EMITTER VOLTAGE / V" point={[Math.log10(ibm),d.vce]} description={'Collector voltage versus base drive for the three configurations into '+f(rl,1)+' ohms.'}/>
 <p className="plot-summary">Transistor dissipation at this point: {engText(d.vce*d.ic,'W')}. {type==='single'?'A single power transistor saturates near 0.1 V but needs tens of milliamps of base current.':'Both compound pairs need only about a hundredth as much drive, but cannot pull below about 0.75 V: the output transistor’s base–emitter voltage plus the driver’s saturation voltage.'}{d.vin?' Input V_BE: '+f(d.vin,2)+' V.':''} Q₁: β = 150, I_S = 10 fA; Q₂: β = 50, I_S = 1 pA; no bleeder resistor or series resistances.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> At a 12 Ω load (1 A), compare the base current each configuration needs to reach its flattest V_CE. Then compare the dissipation: the Darlington’s 0.75 V costs about 0.7 W where the saturated single transistor wastes under 0.1 W.</div></div>;
}

/* ---------- Bootstrapping ---------- */
export function BootstrapLab(){
 const [boot,setBoot]=useState(true),[uf,setUf]=useState(10),[r3,setR3]=useState(47),[rlk,setRlk]=useState(1000);
 const p={cb:uf*1e-6,r3:r3*1e3,rl:rlk>=1000?Infinity:rlk*1e3},freqs=logspace(0,5,121);
 const zp=mag(follower({...p,hz:1000}).zin),zb=mag(follower({...p,hz:1000,bootstrapped:true}).zin);
 const reset=()=>{setBoot(true);setUf(10);setR3(47);setRlk(1000)};
 return <div className="lab" aria-label="Bootstrapped emitter follower experiment"><Head title="LIFT BOTH ENDS OF A RESISTOR TOGETHER" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Bias network"><button aria-pressed={!boot} onClick={()=>setBoot(false)}>Plain divider at the base</button><button aria-pressed={boot} onClick={()=>setBoot(true)}>Bootstrapped</button></div>
 <svg className="wide-circuit" viewBox="0 0 640 290" role="img" aria-label={boot?'Divider R1 and R2 meet at node M; R3 connects M to the base; a capacitor from the emitter back to M makes M follow the output.':'Divider R1 and R2 connect directly to the base of the follower.'}>
  <Rail x1={180} x2={460} y={22} label="+15 V"/><Wires d="M220 22 V40 M220 100 V115 M220 175 V190 M412 22 V95 M412 175 V195 M412 255 V265 M350 135 H370 M350 135 V230 H215 M155 230 H70"/><Res x={220} y={70} v/><Res x={220} y={145} v/><Bjt x={400} y={135}/><Res x={412} y={225} v/><Ground x={220} y={190}/><Ground x={412} y={265}/><Cap x={185} y={230}/><Dot x={350} y={135}/>
  {boot?<><Wires d="M220 108 H270 M330 108 H350 V135 M412 185 H480 V160 M480 100 V80 H245 V108"/><Res x={300} y={108}/><Cap x={480} y={130} v/><Dot x={245} y={108} color={orange}/><Label x={300} y={92} anchor="middle">R₃ {r3} kΩ</Label><Label x={502} y={135}>C_B {uf} µF</Label><Label x={240} y={125} anchor="end" kind="value">M</Label></>
  :<><Wires d="M220 108 H350 V135"/></>}
  <Dot x={220} y={108}/><Dot x={412} y={185} color={green}/><Label x={198} y={75} anchor="end">R₁ 130 kΩ</Label><Label x={198} y={150} anchor="end">R₂ 150 kΩ</Label><Label x={434} y={230}>R_E 7.5 kΩ</Label><Label x={62} y={235} anchor="end">in</Label><Label x={426} y={180} kind="output">out</Label>
 </svg>
 <div className="horizontal-controls"><Control label="Bootstrap capacitor" value={uf} onChange={setUf} min={-1} max={2} step={.02} log unit="µF"/><Control label="R₃ (base feed resistor)" value={r3} onChange={setR3} min={1} max={3} step={.02} log unit="kΩ"/><Control label="Load on emitter (1000 = none)" value={rlk} onChange={setRlk} min={0} max={3} step={.02} log unit="kΩ"/></div>
 <Readouts values={[['Z_IN, PLAIN @ 1 kHz',...eng(zp,'Ω')],['Z_IN, BOOTSTRAPPED @ 1 kHz',...eng(zb,'Ω')],['IMPROVEMENT',f(zb/zp,1),'×']]}/>
 <div className="plot-area"><h4>Input impedance across frequency</h4><Plot curves={[{name:'Plain divider',color:gray,dashed:!boot,points:freqs.map(v=>[v,mag(follower({...p,hz:v}).zin)])},{name:'Bootstrapped',color:green,dashed:boot?false:true,points:freqs.map(v=>[v,mag(follower({...p,hz:v,bootstrapped:true}).zin)])}]} xRange={[1,1e5]} yRange={[1e4,1e7]} xScale="log" yScale="log" xTicks={decades(0,5)} xLabel="FREQUENCY / Hz · LOG" yLabel="INPUT IMPEDANCE / Ω · LOG" description={'Plain divider gives '+engText(zp,'Ω')+'; bootstrapped gives '+engText(zb,'Ω')+' at 1 kHz.'}/>
 <p className="plot-summary">Small-signal model at 1 mA, β = 100. Bootstrapping makes R₃ look like R₃/(1 − G) with G ≈ 0.997, so the divider almost disappears; the transistor’s own (β + 1)(R_E ∥ R₁ ∥ R₂ ∥ R_L) then sets the limit. At low frequency the capacitor stops working and the input impedance falls back toward the plain value.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Add a 1 kΩ load: the bootstrapped impedance falls tenfold because the transistor’s own input impedance is (β + 1) times the smaller emitter load. Shrink the capacitor and the bootstrap stops working below a corner frequency.</div></div>;
}

/* ---------- Current sharing ---------- */
export function SharingLab(){
 const [re,setRe]=useState(0),[mv,setMv]=useState(5),[theta,setTheta]=useState(2),[vce,setVce]=useState(10);
 const p={itot:2,dvbe:mv/1000,theta,vce},d=sharing({...p,re});
 const sweep=useMemo(()=>{const r=Array.from({length:41},(_,k)=>k/40).map(x=>({x,...sharing({...p,re:x})}));return {a:r.map(q=>[q.x,q.i1] as [number,number]),b:r.map(q=>[q.x,q.i2] as [number,number])};},[mv,theta,vce]);
 const reset=()=>{setRe(0);setMv(5);setTheta(2);setVce(10)};
 return <div className="lab" aria-label="Current sharing experiment"><Head title="TWO TRANSISTORS, ONE CURRENT, TWO TEMPERATURES" reset={reset}/>
 <svg className="wide-circuit" viewBox="0 0 640 260" role="img" aria-label={'Two NPN power transistors in parallel share 2 amps; bases tied; '+(re>0?'each emitter has a '+f(re,2)+' ohm ballast resistor.':'emitters tied directly.')}>
  <Rail x1={200} x2={470} y={22} label={'V_CE ≈ '+f(vce,0)+' V'}/><Wires d="M282 22 V70 M422 22 V70 M180 110 H240 M240 110 V140 H380 V110"/><Bjt x={270} y={110}/><Bjt x={410} y={110}/>
  {re>0?<><Wires d="M282 150 V160 M422 150 V160 M282 220 V230 H422 V220"/><Res x={282} y={190} v/><Res x={422} y={190} v/><Label x={304} y={195}>{f(re,2)} Ω</Label><Label x={444} y={195}>{f(re,2)} Ω</Label></>:<Wires d="M282 150 V230 H422 V150"/>}
  <Wires d="M352 230 V240"/><Ground x={352} y={240}/><Dot x={240} y={110}/>
  <Label x={230} y={70} anchor="end" kind="output">{f(d.i1,2)} A</Label><Label x={470} y={70} kind="output">{f(d.i2,2)} A</Label><Label x={282} y={252} anchor="middle" kind="value">Q₁ {f(d.t1,0)} °C</Label><Label x={422} y={252} anchor="middle" kind="value">Q₂ {f(d.t2,0)} °C</Label><Label x={170} y={115} anchor="end">drive</Label>
 </svg>
 <div className="horizontal-controls"><Control label="Emitter ballast resistors" value={re} onChange={setRe} min={0} max={1} step={.01} unit="Ω"/><Control label="V_BE mismatch (Q₂ needs more)" value={mv} onChange={setMv} min={0} max={20} step={.5} unit="mV"/><Control label="Thermal resistance per device" value={theta} onChange={setTheta} min={.2} max={10} step={.1} unit="°C/W"/><Control label="Collector–emitter voltage" value={vce} onChange={setVce} min={1} max={30} step={.5} unit="V"/></div>
 <Readouts values={[['CURRENT SPLIT',f(d.i1,2)+' / '+f(d.i2,2),'A'],['HOTTEST JUNCTION',f(Math.max(d.t1,d.t2),0),'°C'],['THERMAL LOOP GAIN',f(Math.max(d.loop1,d.loop2),2),d.hogging?'hogging':'stable']]}/>
 <div className="plot-area"><h4>How much ballast resistance is enough?</h4><Plot curves={[{name:'Q₁ current',color:green,points:sweep.a},{name:'Q₂ current',color:orange,points:sweep.b},{name:'Equal share',color:gray,dashed:true,points:[[0,1],[1,1]]}]} xRange={[0,1]} yRange={[0,2.1]} xLabel="BALLAST RESISTANCE PER EMITTER / Ω" yLabel="COLLECTOR CURRENT / A" point={[re,d.i1]} description={'With '+f(re,2)+' ohm ballast the currents are '+f(d.i1,2)+' and '+f(d.i2,2)+' amps.'}/>
 <p className="plot-summary">2 A total, 25 °C ambient, V_BE falling 2.1 mV/°C, separate heat sinks. Loop gain = θ·V_CE·I·(2.1 mV/°C)/(V_T + I·R_E): above 1, the hotter transistor’s extra current heats it further faster than its ballast resistor can push back, and one device hogs the current. Steady-state model only; no second breakdown.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> With no ballast and 2 °C/W, the pair is already unstable: almost all the current ends up in one device. Add 0.1 Ω: sharing within a few percent. Raise V_CE to 30 V and see how much more ballast hot, high-voltage operation needs.</div></div>;
}

/* ---------- Miller effect and cascode ---------- */
export function MillerLab(){
 const [rs,setRs]=useState(1000),[rck,setRck]=useState(10),[ima,setIma]=useState(1),[cmu,setCmu]=useState(2),[cascode,setCascode]=useState(false);
 const p={rs,rc:rck*1e3,ic:ima/1000,cmu:cmu*1e-12,cpi:Math.max(2e-12,ima/1000/0.025852/(2*Math.PI*400e6)-cmu*1e-12)},freqs=logspace(3,9,241);
 const H=(hz:number,c:boolean)=>mag(ceFrequency({...p,hz,cascode:c}).gain),g0=H(10,cascode),lo=ceFrequency({...p,hz:10});
 const f3=(c:boolean)=>{const g=H(10,c);let fh=10;for(const v of freqs)if(H(v,c)>g/Math.SQRT2)fh=v;return fh;};
 const fp=f3(false),fc=f3(true);
 const reset=()=>{setRs(1000);setRck(10);setIma(1);setCmu(2);setCascode(false)};
 return <div className="lab" aria-label="Miller effect experiment"><Head title="A TINY CAPACITOR, MULTIPLIED BY THE GAIN" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Topology"><button aria-pressed={!cascode} onClick={()=>setCascode(false)}>Common emitter</button><button aria-pressed={cascode} onClick={()=>setCascode(true)}>Cascode</button></div>
 <svg className="wide-circuit" viewBox="0 0 640 280" role="img" aria-label={(cascode?'Cascode: common-emitter Q1 drives the emitter of common-base Q2, whose collector has the load. ':'Common-emitter stage: ')+'source resistance '+engText(rs,'ohms')+' into the base; collector-base capacitance shown explicitly; collector load '+rck+' kilohms.'}>
  <Rail x1={360} x2={480} y={22} label="+V_CC"/><Wires d="M412 22 V30 M412 90 H500"/><Res x={412} y={60} v/><Dot x={412} y={90} color={green}/><Label x={434} y={65}>R_C {rck} kΩ</Label><Label x={508} y={95} kind="output">out</Label>
  {(()=>{const yi=cascode?210:130;return <>
   <Source x={80} y={yi+40} ac/><Wires d={`M80 ${yi+15} V${yi} H140 M200 ${yi} H370 M80 ${yi+65} V250 H412`}/><Res x={170} y={yi}/><Label x={170} y={yi-18} anchor="middle">R_s {engText(rs,'Ω')}</Label><Ground x={250} y={250}/><Dot x={330} y={yi}/>
   {cascode?<><Bjt x={400} y={210}/><Bjt x={400} y={130}/><Wires d="M370 130 H345 V140"/><Ground x={345} y={140}/><Label x={300} y={128} anchor="end" kind="value">Q₂ base: AC ground</Label><Dot x={412} y={170}/>
    <Wires d="M330 210 V170 H342 M402 170 H412" color={orange}/><Cap x={372} y={170}/><Label x={372} y={160} anchor="middle" kind="value">C_μ</Label></>
   :<><Bjt x={400} y={130}/><Wires d="M412 170 V250"/><Wires d="M330 130 V90 H342 M402 90 H412" color={orange}/><Cap x={372} y={90}/><Label x={372} y={78} anchor="middle" kind="value">C_μ</Label></>}
  </>;})()}
 </svg>
 <div className="horizontal-controls"><Control label="Source resistance" value={rs} onChange={setRs} min={1.7} max={5} step={.02} log unit="Ω"/><Control label="Collector load" value={rck} onChange={setRck} min={0} max={2} step={.02} log unit="kΩ"/><Control label="Collector current" value={ima} onChange={setIma} min={-1} max={1} step={.02} log unit="mA"/><Control label="Collector–base capacitance C_μ" value={cmu} onChange={setCmu} min={.5} max={10} step={.1} unit="pF"/></div>
 <Readouts values={[['MIDBAND GAIN',f(g0,1),'V/V'],['−3 dB BANDWIDTH',...eng(cascode?fc:fp,'Hz')],['MILLER CAPACITANCE',...eng(lo.millerC,'F')]]}/>
 <div className="plot-area"><h4>{cascode?'The cascode removes the Miller multiplication':'Bandwidth set by C_μ × (1 + gain) and R_s'}</h4><Plot curves={[{name:'Common emitter',color:cascode?gray:green,dashed:cascode,points:freqs.map(v=>[v,db({re:H(v,false),im:0})])},{name:'Cascode',color:cascode?green:gray,dashed:!cascode,points:freqs.map(v=>[v,db({re:H(v,true),im:0})])}]} xRange={[1e3,1e9]} yRange={[-20,60]} xScale="log" xTicks={decades(3,9)} xLabel="FREQUENCY / Hz · LOG" yLabel="GAIN / dB" description={'Common emitter −3 dB at '+engText(fp,'Hz')+'; cascode at '+engText(fc,'Hz')+'.'}/>
 <p className="plot-summary">Miller estimate for the common emitter: C_in = C_π + C_μ(1 + g_mR_C) = {engText(lo.millerC,'F')} with R_s ∥ r_π gives f ≈ {engText(lo.millerPole,'Hz')}; exact nodal result {engText(fp,'Hz')}. C_π chosen for f_T ≈ 400 MHz. Cascode improves bandwidth by {f(fc/fp,1)}×. Small-signal hybrid-π model, no load capacitance or base resistance.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Double R_C: the gain doubles and the common-emitter bandwidth roughly halves—the Miller capacitance grew with the gain. Lower R_s and the bandwidth rises: the Miller capacitance must be charged through the source. The cascode keeps the gain but not the penalty.</div></div>;
}
