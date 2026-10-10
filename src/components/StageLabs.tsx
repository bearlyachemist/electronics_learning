import {MirrorCircuit,DifferentialCircuit,PushPullCircuit,PairCircuit,BootstrapCircuit,SharingCircuit,MillerCircuit} from './StageCircuits';
import {M,htmlSub} from './MathText';
import {useMemo,useState} from 'react';
import {mirror,mirrorRout,diffPair,diffGains,pushPullCycle,pushPull,compound,sharing,follower,ceFrequency} from '../engine/stages.mjs';
import {mag,db} from '../engine/ac.mjs';
import Plot from './Plot';
import {Control,Readouts,f} from './LabControls';
import {eng,engText,logspace,green,orange,gray} from './Parts';
function Head({title,reset}:{title:string;reset:()=>void}){return <div className="lab-heading"><div><span className="live-dot"/><span className="tiny-label">{htmlSub(title)}</span></div><button onClick={reset}>Reset ↺</button></div>}
const pts=(fn:(x:number)=>number,a:number,b:number,n=200):[number,number][]=>Array.from({length:n+1},(_,k)=>{const x=a+(b-a)*k/n;return [x,fn(x)]});
const decades=(a:number,b:number)=>Array.from({length:b-a+1},(_,k)=>10**(a+k));
/* ---------- Current mirrors ---------- */
type MirrorType='basic'|'degenerated'|'helper'|'wilson'|'widlar';
const mirrorNames:Record<MirrorType,string>={basic:'Basic',degenerated:'Degenerated',helper:'β-helper',wilson:'Wilson',widlar:'Widlar'};
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
 <div className="horizontal-controls"><Control label="Output voltage" value={vout} onChange={setVout} min={.1} max={14} step={.1} unit="V"/><Control label="Transistor β" value={beta} onChange={setBeta} min={20} max={400} step={5} unit=""/><Control label="Early voltage V_A" value={va} onChange={setVa} min={1} max={3} step={.02} log unit="V"/>{(type==='degenerated'||type==='widlar')&&<Control label={type==='widlar'?'Q_2 emitter resistor (×5 kΩ)':'Emitter resistors'} value={rek} onChange={setRek} min={.1} max={3} step={.05} unit={type==='widlar'?'×5 kΩ':'kΩ'}/>}</div>
 <Readouts values={[['OUTPUT CURRENT',...eng(d.iout,'A')],['I_out / I_ref',f(d.iout/d.iref,4),''],['OUTPUT RESISTANCE',...eng(rout,'Ω')]]}/>
 <div className="plot-area"><h4>{type==='widlar'?'A small, well-defined current from a modest resistor':'The flatter the line, the better the current source'}</h4><Plot curves={[{name:mirrorNames[type]+' mirror',color:green,points:curve},...(type!=='basic'&&type!=='widlar'?[{name:'Basic mirror',color:gray,dashed:true,points:basic}]:[]),{name:'Reference current',color:orange,dashed:true,points:[[0,d.iref*1000],[14,d.iref*1000]]}]} xRange={[0,14]} xTicks={[0,2,4,6,8,10,12,14]} yRange={[0,ymax]} xLabel="OUTPUT (COLLECTOR) VOLTAGE / V" yLabel="OUTPUT CURRENT / mA" point={[vout,d.iout*1000]} description={'Output current versus output voltage for the '+mirrorNames[type]+' mirror. At '+f(vout,1)+' volts the current is '+engText(d.iout,'A')+'.'}/>
 <p className="plot-summary">Reference ≈ {engText(d.iref,'A')} through 14.3 kΩ from 15 V. Matched Ebers–Moll transistors at one temperature, <M t="β_R"/> = 2, Early factor on the transport current. Below a few tenths of a volt the output transistor saturates. Real discrete transistors also mismatch: 1 mV of <M t="V_BE"/> difference alone shifts a basic mirror by 4%.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> In the basic mirror, set β = 30: the output falls about 6% below <M t="I_ref"/>. Switch to β-helper or Wilson and the base-current error nearly vanishes. Compare the slopes: the Wilson and degenerated mirrors are tens of times flatter.</div></div>;
}

/* ---------- Differential amplifier ---------- */
export function DiffPairLab(){
 const [re,setRe]=useState(0),[source,setSource]=useState(false),[vcm,setVcm]=useState(1),[vdm,setVdm]=useState(5);
 const itail=1e-3,rc=10e3,rtail=source?5e6:14.3e3,g=diffGains({itail,rc,re,rtail});
 const vout=(t:number)=>{const vd=vdm/1000*Math.sin(2*Math.PI*1000*t),d=diffPair({vd,itail,re});return rc*(d.i1-itail/2)+g.acm*vcm*Math.sin(2*Math.PI*50*t);};
 const reset=()=>{setRe(0);setSource(false);setVcm(1);setVdm(5)};
 return <div className="lab" aria-label="Differential amplifier experiment"><Head title="AMPLIFY THE DIFFERENCE · REJECT WHAT IS COMMON" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Tail"><button aria-pressed={!source} onClick={()=>setSource(false)}>Tail resistor 14.3 kΩ</button><button aria-pressed={source} onClick={()=>setSource(true)}>Tail current source</button></div>
 <DifferentialCircuit re={re} source={source}/>
 <div className="horizontal-controls"><Control label="Emitter degeneration R_E" value={re} onChange={setRe} min={0} max={1000} step={10} unit="Ω"/><Control label="Differential signal (1 kHz)" value={vdm} onChange={setVdm} min={0} max={100} step={1} unit="mV peak"/><Control label="Common-mode interference (50 Hz)" value={vcm} onChange={setVcm} min={0} max={3} step={.05} unit="V peak"/></div>
 <Readouts values={[['DIFFERENTIAL GAIN',f(g.ad,1),'single-ended'],['COMMON-MODE GAIN',f(g.acm,4),''],['CMRR',f(20*Math.log10(g.cmrr),1),'dB']]}/>
 <div className="plot-area"><h4>Large-signal transfer: currents steer smoothly from one side to the other</h4><Plot curves={[{name:'I_C1',color:green,points:pts(v=>diffPair({vd:v/1000,itail,re}).i1*1000,-200,200)},{name:'I_C2',color:orange,points:pts(v=>diffPair({vd:v/1000,itail,re}).i2*1000,-200,200)},{name:'Small-signal slope at 0',color:gray,dashed:true,points:pts(v=>.5+v/1000/(2*(g.re+re))*1000,-200,200,2)}]} xRange={[-200,200]} yRange={[0,1]} xLabel="DIFFERENTIAL INPUT v_1 − v_2 / mV" yLabel="COLLECTOR CURRENT / mA" description="Collector currents versus differential input: a hyperbolic-tangent steering curve whose linear range widens with emitter degeneration."/>
 <Plot curves={[{name:'Output (AC part of V_C2)',color:green,points:pts(t=>vout(t/1000),0,40,800)}]} xRange={[0,40]} yRange={[-6,6]} xLabel="TIME / ms" yLabel="OUTPUT CHANGE / V" description={'Output with a '+vdm+' millivolt 1 kHz differential signal and a '+vcm+' volt 50 hertz common-mode signal.'}/>
 <p className="plot-summary">Tail current 1 mA, so each side runs at 0.5 mA with <M t="r_e"/> = {f(g.re,1)} Ω. Differential gain <M t="R_C"/>/2(<M t="r_e"/> + <M t="R_E"/>); common-mode gain ≈ −<M t="R_C"/>/2<M t="R_tail"/>. Common-mode output here: {f(Math.abs(g.acm)*vcm*1000,1)} mV peak; wanted output: about {f(g.ad*vdm,0)} mV peak. Matched transistors assumed: real mismatch converts some common-mode signal into a differential one.</p></div>
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
 <PushPullCircuit mode={mode} rl={rl}/>
 <div className="horizontal-controls"><Control label="Input amplitude" value={amp} onChange={setAmp} min={.2} max={14} step={.1} unit="V peak"/><Control label="Load" value={rl} onChange={setRl} min={4} max={16} step={1} unit="Ω"/></div>
 <Readouts values={[['TOTAL HARMONIC DISTORTION',c.thd<.01?f(c.thd*100,3):f(c.thd*100,1),'%'],['EFFICIENCY',f(c.efficiency*100,1),'%'],['QUIESCENT CURRENT',...(c.quiescent<1e-9?['0','A'] as [string,string]:eng(c.quiescent,'A'))]]}/>
 <div className="plot-area"><h4>{mode==='B'?'A dead zone near zero: crossover distortion':mode==='AB'?'Both transistors conduct through the crossover':'The loop drives the bases across the dead zone'}</h4><Plot curves={[{name:'Input',color:gray,dashed:true,points:c.pts.map(q=>[q.t,q.vin] as [number,number])},{name:'Output',color:green,points:c.pts.map(q=>[q.t,q.vout] as [number,number])}]} xRange={[0,1]} yRange={[-amp*1.15,amp*1.15]} xLabel="TIME / PERIOD" yLabel="VOLTAGE / V" description={'One period: total harmonic distortion '+f(c.thd*100,2)+' percent.'}/>
 <Plot curves={[{name:'Static transfer vout(vin)',color:orange,points:transfer},{name:'Ideal: vout = vin',color:gray,dashed:true,points:[[-3,-3],[3,3]]}]} xRange={[-3,3]} yRange={[-3,3]} xLabel="INPUT / V (ZOOMED NEAR ZERO)" yLabel="OUTPUT / V" description="Static transfer curve near zero showing the crossover region."/>
 <p className="plot-summary">Load power {engText(c.pLoad,'W')}, supply power {engText(c.pSupply,'W')}, transistors dissipate {engText(c.pSupply-c.pLoad,'W')}. ±15 V supplies; exponential transistors (<M t="I_S"/> = 1 pA) with about 1 V saturation; class AB uses two 0.65 V diode drops of bias; the feedback loop has gain 200. Thermal effects on bias are discussed in the text, not simulated.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> In class B at 1 V amplitude, THD is tens of percent—small signals lose most of their shape. Switch to AB: distortion drops below 0.1% at the cost of a standing current. Turn the amplitude up in class B and watch efficiency approach its 78.5% ceiling.</div></div>;
}

/* ---------- Darlington and Sziklai ---------- */
type Pair='single'|'darlington'|'sziklai';
export function DarlingtonLab(){
 const [type,setType]=useState<Pair>('darlington'),[ibm,setIbm]=useState(2),[rl,setRl]=useState(12);
 const d=compound({type,ib:ibm/1000,rc:rl});
 const curves=useMemo(()=>(['single','darlington','sziklai'] as Pair[]).map(t=>pts(x=>compound({type:t,ib:10**x/1000,rc:rl,n:32}).vce,-2,1,20)),[rl]);
 const reset=()=>{setType('darlington');setIbm(2);setRl(12)};
 return <div className="lab" aria-label="Darlington and Sziklai switch experiment"><Head title="MULTIPLY β — AND PAY A V_BE" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Configuration">{([['single','Single power transistor'],['darlington','Darlington'],['sziklai','Sziklai (complementary)']] as [Pair,string][]).map(([t,n])=><button key={t} aria-pressed={type===t} onClick={()=>setType(t)}>{n}</button>)}</div>
 <PairCircuit type={type} load={engText(rl,'Ω')}/>
 <div className="horizontal-controls"><Control label="Base drive current" value={ibm} onChange={setIbm} min={-2} max={1} step={.02} log unit="mA"/><Control label="Load resistance (to 12 V)" value={rl} onChange={setRl} min={.8} max={3} step={.02} log unit="Ω"/></div>
 <Readouts values={[['V_CE (ON VOLTAGE)',f(d.vce,3),'V'],['LOAD CURRENT',...eng(d.ic,'A')],['CURRENT GAIN I_C/I_B',f(d.gain,0),'']]}/>
 <div className="plot-area"><h4>Collector voltage as base drive increases</h4><Plot curves={[{name:'Single (β = 50)',color:gray,points:curves[0]},{name:'Darlington',color:green,points:curves[1]},{name:'Sziklai',color:orange,dashed:true,points:curves[2]}]} xRange={[-2,1]} xTicks={[-2,-1,0,1]} yRange={[0,12.5]} xLabel="BASE CURRENT / mA (LOG_{10}: −2 = 10 µA, 1 = 10 mA)" yLabel="COLLECTOR–EMITTER VOLTAGE / V" point={[Math.log10(ibm),d.vce]} description={'Collector voltage versus base drive for the three configurations into '+f(rl,1)+' ohms.'}/>
 <p className="plot-summary">Transistor dissipation at this point: {engText(d.vce*d.ic,'W')}. {type==='single'?'A single power transistor saturates near 0.1 V but needs tens of milliamps of base current.':'Both compound pairs need only about a hundredth as much drive, but cannot pull below about 0.75 V: the output transistor’s base–emitter voltage plus the driver’s saturation voltage.'}{htmlSub(d.vin?' Input V_BE: '+f(d.vin,2)+' V.':'')} <M t="Q_1"/>: β = 150, <M t="I_S"/> = 10 fA; <M t="Q_2"/>: β = 50, <M t="I_S"/> = 1 pA; no bleeder resistor or series resistances.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> At a 12 Ω load (1 A), compare the base current each configuration needs to reach its flattest <M t="V_CE"/>. Then compare the dissipation: the Darlington’s 0.75 V costs about 0.7 W where the saturated single transistor wastes under 0.1 W.</div></div>;
}

/* ---------- Bootstrapping ---------- */
export function BootstrapLab(){
 const [boot,setBoot]=useState(true),[uf,setUf]=useState(10),[r3,setR3]=useState(47),[rlk,setRlk]=useState(1000);
 const p={cb:uf*1e-6,r3:r3*1e3,rl:rlk>=1000?Infinity:rlk*1e3},freqs=logspace(0,5,121);
 const zp=mag(follower({...p,hz:1000}).zin),zb=mag(follower({...p,hz:1000,bootstrapped:true}).zin);
 const reset=()=>{setBoot(true);setUf(10);setR3(47);setRlk(1000)};
 return <div className="lab" aria-label="Bootstrapped emitter follower experiment"><Head title="LIFT BOTH ENDS OF A RESISTOR TOGETHER" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Bias network"><button aria-pressed={!boot} onClick={()=>setBoot(false)}>Plain divider at the base</button><button aria-pressed={boot} onClick={()=>setBoot(true)}>Bootstrapped</button></div>
 <BootstrapCircuit boot={boot} r3={engText(r3*1e3,'Ω')} cb={engText(uf*1e-6,'F')} rl={rlk>=1000?'none':engText(rlk*1e3,'Ω')}/>
 <div className="horizontal-controls"><Control label="Bootstrap capacitor" value={uf} onChange={setUf} min={-1} max={2} step={.02} log unit="µF"/><Control label="R_3 (base feed resistor)" value={r3} onChange={setR3} min={1} max={3} step={.02} log unit="kΩ"/><Control label="Load on emitter (1000 = none)" value={rlk} onChange={setRlk} min={0} max={3} step={.02} log unit="kΩ"/></div>
 <Readouts values={[['Z_IN, PLAIN @ 1 kHz',...eng(zp,'Ω')],['Z_IN, BOOTSTRAPPED @ 1 kHz',...eng(zb,'Ω')],['IMPROVEMENT',f(zb/zp,1),'×']]}/>
 <div className="plot-area"><h4>Input impedance across frequency</h4><Plot curves={[{name:'Plain divider',color:gray,dashed:!boot,points:freqs.map(v=>[v,mag(follower({...p,hz:v}).zin)])},{name:'Bootstrapped',color:green,dashed:boot?false:true,points:freqs.map(v=>[v,mag(follower({...p,hz:v,bootstrapped:true}).zin)])}]} xRange={[1,1e5]} yRange={[1e4,1e7]} xScale="log" yScale="log" xTicks={decades(0,5)} xLabel="FREQUENCY / Hz · LOG" yLabel="INPUT IMPEDANCE / Ω · LOG" description={'Plain divider gives '+engText(zp,'Ω')+'; bootstrapped gives '+engText(zb,'Ω')+' at 1 kHz.'}/>
 <p className="plot-summary">Small-signal model at 1 mA, β = 100. Bootstrapping makes <M t="R_3"/> look like <M t="R_3"/>/(1 − G) with G ≈ 0.997, so the divider almost disappears; the transistor’s own (β + 1)(<M t="R_E"/> ∥ <M t="R_1"/> ∥ <M t="R_2"/> ∥ <M t="R_L"/>) then sets the limit. At low frequency the bootstrap capacitor stops working and the input impedance falls toward the ordinary bias-network value. Input and load coupling capacitors are treated as AC shorts throughout the plotted band.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Add a 1 kΩ load: the bootstrapped impedance falls tenfold because the transistor’s own input impedance is (β + 1) times the smaller emitter load. Shrink the capacitor and the bootstrap stops working below a corner frequency.</div></div>;
}

/* ---------- Current sharing ---------- */
export function SharingLab(){
 const [re,setRe]=useState(0),[mv,setMv]=useState(5),[theta,setTheta]=useState(2),[vce,setVce]=useState(10);
 const p={itot:2,dvbe:mv/1000,theta,vce},d=sharing({...p,re});
 const sweep=useMemo(()=>{const r=Array.from({length:41},(_,k)=>k/40).map(x=>({x,...sharing({...p,re:x})}));return {a:r.map(q=>[q.x,q.i1] as [number,number]),b:r.map(q=>[q.x,q.i2] as [number,number])};},[mv,theta,vce]);
 const reset=()=>{setRe(0);setMv(5);setTheta(2);setVce(10)};
 return <div className="lab" aria-label="Current sharing experiment"><Head title="TWO TRANSISTORS, ONE CURRENT, TWO TEMPERATURES" reset={reset}/>
 <SharingCircuit re={re} vce={vce} i1={d.i1} i2={d.i2} t1={d.t1} t2={d.t2}/>
 <div className="horizontal-controls"><Control label="Emitter ballast resistors" value={re} onChange={setRe} min={0} max={1} step={.01} unit="Ω"/><Control label="V_BE mismatch (Q_2 needs more)" value={mv} onChange={setMv} min={0} max={20} step={.5} unit="mV"/><Control label="Thermal resistance per device" value={theta} onChange={setTheta} min={.2} max={10} step={.1} unit="°C/W"/><Control label="Collector–emitter voltage" value={vce} onChange={setVce} min={1} max={30} step={.5} unit="V"/></div>
 <Readouts values={[['CURRENT SPLIT',f(d.i1,2)+' / '+f(d.i2,2),'A'],['HOTTEST JUNCTION',f(Math.max(d.t1,d.t2),0),'°C'],['THERMAL LOOP GAIN',f(Math.max(d.loop1,d.loop2),2),d.hogging?'hogging':'stable']]}/>
 <div className="plot-area"><h4>How much ballast resistance is enough?</h4><Plot curves={[{name:'Q_1 current',color:green,points:sweep.a},{name:'Q_2 current',color:orange,points:sweep.b},{name:'Equal share',color:gray,dashed:true,points:[[0,1],[1,1]]}]} xRange={[0,1]} yRange={[0,2.1]} xLabel="BALLAST RESISTANCE PER EMITTER / Ω" yLabel="COLLECTOR CURRENT / A" point={[re,d.i1]} description={'With '+f(re,2)+' ohm ballast the currents are '+f(d.i1,2)+' and '+f(d.i2,2)+' amps.'}/>
 <p className="plot-summary">2 A total, 25 °C ambient, <M t="V_BE"/> falling 2.1 mV/°C, separate heat sinks. Loop gain = θ·<M t="V_CE"/>·I·(2.1 mV/°C)/(<M t="V_T"/> + I·<M t="R_E"/>): above 1, the hotter transistor’s extra current heats it further faster than its ballast resistor can push back, and one device hogs the current. Steady-state model only; no second breakdown.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> With no ballast and 2 °C/W, the pair is already unstable: almost all the current ends up in one device. Add 0.1 Ω: sharing within a few percent. Raise <M t="V_CE"/> to 30 V and see how much more ballast hot, high-voltage operation needs.</div></div>;
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
 <MillerCircuit cascode={cascode} rs={engText(rs,'Ω')} rc={engText(rck*1e3,'Ω')} cmu={engText(cmu*1e-12,'F')} cpi={engText(p.cpi,'F')}/>
 <div className="horizontal-controls"><Control label="Source resistance" value={rs} onChange={setRs} min={1.7} max={5} step={.02} log unit="Ω"/><Control label="Collector load" value={rck} onChange={setRck} min={0} max={2} step={.02} log unit="kΩ"/><Control label="Collector current" value={ima} onChange={setIma} min={-1} max={1} step={.02} log unit="mA"/><Control label="Collector–base capacitance C_μ" value={cmu} onChange={setCmu} min={.5} max={10} step={.1} unit="pF"/></div>
 <Readouts values={[['MIDBAND GAIN',f(g0,1),'V/V'],['−3 dB BANDWIDTH',...eng(cascode?fc:fp,'Hz')],['MILLER CAPACITANCE',...eng(lo.millerC,'F')]]}/>
 <div className="plot-area"><h4>{htmlSub(cascode?'The cascode removes the Miller multiplication':'Bandwidth set by C_μ × (1 + gain) and R_s')}</h4><Plot curves={[{name:'Common emitter',color:cascode?gray:green,dashed:cascode,points:freqs.map(v=>[v,db({re:H(v,false),im:0})])},{name:'Cascode',color:cascode?green:gray,dashed:!cascode,points:freqs.map(v=>[v,db({re:H(v,true),im:0})])}]} xRange={[1e3,1e9]} yRange={[-20,60]} xScale="log" xTicks={decades(3,9)} xLabel="FREQUENCY / Hz · LOG" yLabel="GAIN / dB" description={'Common emitter −3 dB at '+engText(fp,'Hz')+'; cascode at '+engText(fc,'Hz')+'.'}/>
 <p className="plot-summary">Miller estimate for the common emitter: <M t="C_in"/> = <M t="C_π"/> + <M t="C_μ"/>(1 + <M t="g_m R_C"/>) = {engText(lo.millerC,'F')} with <M t="R_s"/> ∥ <M t="r_π"/> gives f ≈ {engText(lo.millerPole,'Hz')}; exact nodal result {engText(fp,'Hz')}. <M t="C_π"/> chosen for <M t="f_T"/> ≈ 400 MHz. Cascode improves bandwidth by {f(fc/fp,1)}×. Small-signal hybrid-π model, no load capacitance or base resistance.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Double <M t="R_C"/>: the gain doubles and the common-emitter bandwidth roughly halves—the Miller capacitance grew with the gain. Lower <M t="R_s"/> and the bandwidth rises: the Miller capacitance must be charged through the source. The cascode keeps the gain but not the penalty.</div></div>;
}
