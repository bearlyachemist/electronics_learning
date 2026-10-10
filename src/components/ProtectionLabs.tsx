import {M,htmlSub} from './MathText';
import {useState} from 'react';
import {polarity,hotPlug,boostCycle} from '../engine/protection.mjs';
import Plot from './Plot';
import {Control,Readouts,f} from './LabControls';
import {niceTicks,green,orange,gray,ink} from './Parts';
import * as S from './Schematic';
function Head({title,reset}:{title:string;reset:()=>void}){return <div className="lab-heading"><div><span className="live-dot"/><span className="tiny-label">{htmlSub(title)}</span></div><button onClick={reset}>Reset ↺</button></div>}
const pts=(fn:(x:number)=>number,a:number,b:number,n=200):[number,number][]=>Array.from({length:n+1},(_,k)=>{const x=a+(b-a)*k/n;return [x,fn(x)]});

type Topology='series'|'shunt'|'pmos'|'bridge';
const names:Record<Topology,string>={series:'Series diode',shunt:'Shunt diode + fuse',pmos:'P-channel MOSFET',bridge:'Bridge'};
export function PolarityLab(){
 const [topology,setTopology]=useState<Topology>('series'),[reversed,setReversed]=useState(false),[load,setLoad]=useState(1),[vin,setVin]=useState(12);
 const d=polarity({topology,vin,load,reversed}),loss=(t:Topology)=>(i:number)=>polarity({topology:t,vin,load:i}).loss;
 const reset=()=>{setTopology('series');setReversed(false);setLoad(1);setVin(12)};
 const Pm=S.fetPins({at:[300,100],kind:'pmos',flip:true,rotate:90});
 const describe:Record<Topology,string>={series:'Series diode in the positive lead, anode toward the source.',shunt:'Fuse in the positive lead, then a diode across the load with its cathode on the positive rail.',pmos:'P-channel MOSFET in the positive lead with its drain toward the source; gate pulled to the negative rail through a resistor. Its body diode points toward the load.',bridge:'Bridge rectifier between the connector and the load, so either connector polarity gives a positive load voltage.'};
 return <div className="lab" aria-label="Reverse-polarity protection experiment"><Head title="FOUR WAYS TO SURVIVE A BACKWARDS CONNECTOR" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Protection topology">{(Object.keys(names) as Topology[]).map(t=><button key={t} aria-pressed={topology===t} onClick={()=>setTopology(t)}>{names[t]}</button>)}</div>
 <div className="view-buttons" role="group" aria-label="Source connection"><button aria-pressed={!reversed} onClick={()=>setReversed(false)}>Connected correctly</button><button aria-pressed={reversed} onClick={()=>setReversed(true)}>Connected backwards</button></div>
 <S.Schematic height={260} description={describe[topology]+(reversed?' The source is connected backwards.':'')}>
  <S.Source a={reversed?[90,110]:[90,160]} b={reversed?[90,160]:[90,110]} label={f(vin,1)+' V'}/><S.Wire pts={[[90,160],[90,210],[540,210],[540,170]]}/><S.Res a={[540,100]} b={[540,170]} label="load" value={f(load,2)+' A'}/><S.Ground at={[90,210]}/>
  {topology==='series'&&<><S.Wire pts={[[90,110],[90,60],[250,60]]}/><S.Diode a={[250,60]} b={[350,60]} color={reversed?gray:green} label="Schottky" value="V_F ≈ 0.45 V"/><S.Wire pts={[[350,60],[540,60],[540,100]]}/></>}
  {topology==='shunt'&&<><S.Wire pts={[[90,110],[90,60],[170,60]]}/><S.Res a={[170,60]} b={[250,60]} label="fuse" color={reversed&&d.fault>0?orange:undefined}/><S.Wire pts={[[250,60],[540,60],[540,100]]}/><S.Diode a={[370,210]} b={[370,60]} color={reversed?orange:gray} label="shunt diode"/><S.Dot at={[370,60]}/><S.Dot at={[370,210]}/></>}
  {topology==='pmos'&&<><S.Wire pts={[[90,110],[90,86],Pm.d]}/><S.Fet at={[300,100]} kind="pmos" flip rotate={90} color={reversed?gray:green}/><S.Wire pts={[Pm.s,[540,86],[540,100]]}/>
    <S.Wire pts={[Pm.d,[260,40]]}/><S.Diode a={[260,40]} b={[340,40]} color={gray} label="body diode"/><S.Wire pts={[[340,40],Pm.s]}/><S.Dot at={Pm.d}/><S.Dot at={Pm.s}/>
    <S.Res a={Pm.g} b={[300,210]} label="gate R" flipLabel/><S.Text x={322} y={160} kind="value">P-MOSFET · gate low</S.Text></>}
  {topology==='bridge'&&<><S.Wire pts={[[90,110],[90,60],[230,60]]}/><g data-pins="230,60 370,60"><rect x="230" y="40" width="140" height="150" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><S.Text x={300} y={110} anchor="middle">Bridge</S.Text><S.Text x={300} y={132} anchor="middle" kind="value">two diodes conduct</S.Text></g><S.Wire pts={[[370,60],[540,60],[540,100]]}/></>}
  <S.Text x={445} y={48} kind="output">V_load = {f(d.out,2)} V</S.Text>
 </S.Schematic>
 <div className="horizontal-controls"><Control label="Supply voltage" value={vin} onChange={setVin} min={5} max={24} step={.5} unit="V"/><Control label="Load current" value={load} onChange={setLoad} min={0} max={3} step={.05} unit="A"/></div>
 <Readouts values={reversed?[['LOAD VOLTAGE',f(d.out,2),'V'],['PROTECTION DISSIPATION',d.fault>0?f(d.loss,0):f(d.loss,2),'W'],['FAULT CURRENT',f(d.fault,0),'A']]:[['LOAD VOLTAGE',f(d.out,2),'V'],['PROTECTION LOSS',f(d.loss,3),'W'],['EFFICIENCY',f(d.efficiency*100,1),'%']]}/>
 <div className="plot-area"><h4>Normal-operation loss is the price of protection</h4><Plot curves={(Object.keys(names) as Topology[]).map((t,i)=>({name:names[t],color:[green,'var(--ink)',orange,gray][i],dashed:t!==topology,points:pts(loss(t),0,3)}))} xRange={[0,3]} yRange={[0,3]} xLabel="LOAD CURRENT / A" yLabel="PROTECTION LOSS, CORRECT POLARITY / W" point={reversed?undefined:[load,d.loss]} description="Series diode loss rises linearly with current; a bridge doubles that; MOSFET loss rises with current squared but is much smaller here; the shunt diode wastes nothing until a fault."/>
 <p className="plot-summary">{reversed?(topology==='shunt'?`Backwards, the shunt diode is forward-biased across the source. Only the assumed 50 mΩ source resistance limits current to about ${f(d.fault,0)} A until the fuse opens; the load sees about −0.45 V meanwhile.`:topology==='bridge'?'Backwards, the other diode pair conducts. The load still sees a positive voltage, less two drops.':'Backwards, the protection element blocks and the load sees 0 V. Only leakage flows.'):'Load modeled as constant current. Fixed 0.45 V Schottky drops; 20 mΩ MOSFET channel; 50 mΩ source resistance (shunt fault only).'} Temperature, diode current dependence, MOSFET gate-voltage limits and fuse timing are omitted.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> At 3 A, compare the series diode and MOSFET losses. Then reverse the source with the shunt diode selected: the load is protected only because something upstream must fail open.</div></div>;
}

export function HotPlugLab(){
 const [uh,setUh]=useState(10),[uf,setUf]=useState(22),[r,setR]=useState(.05),[diode,setDiode]=useState(false);
 const d=hotPlug({vin:12,l:uh*1e-6,c:uf*1e-6,r,rl:100,diode,steps:3000}),end=d.points.at(-1)!.t*1e6;
 const reset=()=>{setUh(10);setUf(22);setR(.05);setDiode(false)};
 return <div className="lab" aria-label="Hot-plug LC overshoot experiment"><Head title="A STEP INTO AN LC FILTER RINGS" reset={reset}/>
 <S.Schematic height={260} description={'A 12 volt source and switch feed a series inductor and damping resistor into a capacitor with a 100 ohm load. '+(diode?'A bypass diode across the inductor and resistor points from the output back to the input.':'No bypass diode is fitted.')}>
  <S.Source a={[80,180]} b={[80,110]} label="12 V"/><S.Wire pts={[[80,110],[80,80],[110,80]]}/><S.Switch a={[110,80]} b={[170,80]} closed label="t = 0"/><S.Wire pts={[[170,80],[190,80]]}/>
  <S.Ind a={[190,80]} b={[270,80]} value={f(uh,0)+' µH'}/><S.Res a={[270,80]} b={[350,80]} value={f(r,2)+' Ω'}/><S.Wire pts={[[350,80],[430,80]]}/>
  <S.Cap a={[430,80]} b={[430,215]} label={f(uf,0)+' µF'}/><S.Wire pts={[[430,80],[540,80]]}/><S.Res a={[540,80]} b={[540,215]} label="100 Ω" value="load"/><S.Wire pts={[[540,215],[80,215],[80,180]]}/><S.Ground at={[250,215]}/>
  <S.Wire pts={[[190,80],[190,30],[230,30]]} color={diode?ink:gray} dashed={!diode}/><S.Diode a={[310,30]} b={[230,30]} color={diode?green:gray} label={diode?'bypass diode':'no bypass diode'}/><S.Wire pts={[[310,30],[370,30],[370,80]]} color={diode?ink:gray} dashed={!diode}/>
  <S.Dot at={[190,80]}/><S.Dot at={[370,80]}/><S.Dot at={[430,80]} color={green}/><S.Dot at={[430,215]}/><S.Text x={445} y={68} kind="output">V_out</S.Text>
 </S.Schematic>
 <div className="horizontal-controls"><Control label="Series inductance" value={uh} onChange={setUh} min={0} max={2} step={.05} log unit="µH"/><Control label="Capacitance" value={uf} onChange={setUf} min={0} max={2} step={.05} log unit="µF"/><Control label="Series damping resistance" value={r} onChange={setR} min={-2} max={.5} step={.05} log unit="Ω"/><label className="check"><input type="checkbox" checked={diode} onChange={e=>setDiode(e.target.checked)}/> Fit bypass diode</label></div>
 <Readouts values={[['PEAK OUTPUT',f(d.peakV,2),'V'],['PEAK INDUCTOR CURRENT',f(d.peakI,2),'A'],['CHARACTERISTIC Z0',f(d.z0,3),'Ω']]}/>
 <div className="plot-area"><h4>{diode?'The diode returns the excess to the input':'Without a path, the inductor overshoots toward 2 × Vin'}</h4><Plot curves={[{name:'Output voltage',color:green,points:d.points.filter((_,k)=>k%10===0).map(p=>[p.t*1e6,p.v] as [number,number])},{name:'Input 12 V',color:gray,dashed:true,points:[[0,12],[end,12]]},{name:'2 × input',color:orange,dashed:true,points:[[0,24],[end,24]]}]} xRange={[0,end]} xTicks={niceTicks(end)} yRange={[0,28]} xLabel="TIME AFTER CONNECTION / µs" yLabel="OUTPUT VOLTAGE / V" description={'Peak output '+f(d.peakV,2)+' volts. Resonant frequency '+f(d.f0/1000,1)+' kilohertz.'}/>
 <Plot curves={[{name:'Inductor current',color:orange,points:d.points.filter((_,k)=>k%10===0).map(p=>[p.t*1e6,p.i] as [number,number])},...(diode?[{name:'Diode current',color:green,points:d.points.filter((_,k)=>k%10===0).map(p=>[p.t*1e6,p.id] as [number,number])}]:[])]} xRange={[0,end]} xTicks={niceTicks(end)} yRange={[-d.peakI*1.1,d.peakI*1.1]} xLabel="TIME AFTER CONNECTION / µs" yLabel="CURRENT / A" description={'Inductor current peaks at '+f(d.peakI,2)+' amps, close to Vin divided by Z0 = '+f(d.inrushEstimate,2)+' amps when lightly damped.'}/>
 <p className="plot-summary">Resonance <M t="f_0"/> = {f(d.f0/1000,2)} kHz; damping ratio ζ ≈ {f(d.zeta,3)}. Ideal 12 V step and switch; the series resistance stands for source, wiring, inductor and capacitor ESR together. Fixed 0.7 V diode drop. Light 100 Ω load. Real connectors bounce and real capacitors lose capacitance with voltage.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> With damping near 0.01 Ω, the peak approaches 24 V. Raise resistance until ζ approaches 1 and the overshoot nearly disappears; note how much resistance that needs. Then restore low damping and fit the diode.</div></div>;
}

export function BoostLab(){
 const [ton,setTon]=useState(10),[uh,setUh]=useState(100),[vout,setVout]=useState(12);
 const d=boostCycle({vin:5,vout,l:uh*1e-6,ton:ton*1e-6,hz:20e3,vf:.4}),end=150;
 const reset=()=>{setTon(10);setUh(100);setVout(12)};
 return <div className="lab" aria-label="Inductor boost cycle experiment"><Head title="CHARGE AN INDUCTOR, THEN LET IT PUSH" reset={reset}/>
 <S.Schematic height={250} description="5 volt source feeds an inductor to a switch node. A switch connects the node to ground. A diode from the node feeds an output capacitor held at the chosen output voltage.">
  <S.Source a={[80,180]} b={[80,110]} label="5 V"/><S.Wire pts={[[80,110],[80,60],[150,60]]}/><S.Ind a={[150,60]} b={[250,60]} label={f(uh,0)+' µH'}/><S.Wire pts={[[250,60],[290,60]]}/>
  <S.Switch a={[290,60]} b={[290,210]} label="switch" value="20 kHz"/><S.Diode a={[290,60]} b={[400,60]} label="D"/><S.Wire pts={[[400,60],[480,60]]}/>
  <S.Cap polar a={[480,210]} b={[480,60]} label="large C" value={'held at '+f(vout,1)+' V'}/><S.Wire pts={[[480,210],[80,210],[80,180]]}/><S.Ground at={[190,210]}/>
  <S.Dot at={[290,60]} color={green}/><S.Dot at={[290,210]}/><S.Text x={262} y={46} kind="output">node</S.Text>
 </S.Schematic>
 <div className="horizontal-controls"><Control label="Switch on-time" value={ton} onChange={setTon} min={2} max={20} step={.5} unit="µs"/><Control label="Inductance" value={uh} onChange={setUh} min={1.7} max={2.7} step={.02} log unit="µH"/><Control label="Output voltage" value={vout} onChange={setVout} min={6} max={30} step={.5} unit="V"/></div>
 <Readouts values={[['PEAK CURRENT',f(d.ipk,3),'A'],['ENERGY PER CYCLE',f(d.stored*1e6,1),'µJ'],['POWER DELIVERED',f(d.pOut,3),'W']]}/>
 {d.continuous&&<p className="lab-warning">Current would not reach zero before the next on-time ({f((ton*1e-6+d.toff)*1e6,1)} µs needed of 50 µs). This discontinuous-mode model no longer applies; the traces below are not valid for these settings.</p>}
 <div className="plot-area"><h4>Ramp up at Vin/L, ramp down at (Vout + <M t="V_F"/> − Vin)/L</h4><Plot curves={[{name:'Inductor current',color:green,points:pts(t=>d.current(t*1e-6),0,end,600)}]} xRange={[0,end]} yRange={[0,Math.max(.1,d.ipk*1.15)]} xLabel="TIME / µs" yLabel="INDUCTOR CURRENT / A" description={'Triangular current pulses peaking at '+f(d.ipk,3)+' amps; release lasts '+f(d.toff*1e6,2)+' microseconds.'}/>
 <Plot curves={[{name:'Switch-node voltage',color:orange,points:pts(t=>d.node(t*1e-6),0,end,1200)}]} xRange={[0,end]} yRange={[0,vout+2]} xLabel="TIME / µs" yLabel="SWITCH NODE / V" description={'The node sits at 0 V while the switch is on, jumps to output plus one diode drop while the inductor releases, then returns to the input voltage.'}/>
 <p className="plot-summary">Release time {f(d.toff*1e6,2)} µs. Each cycle stores ½LI² = {f(d.stored*1e6,1)} µJ, but the output receives {f(d.eOut*1e6,1)} µJ because the source keeps supplying current during release; the diode takes {f(d.eDiode*1e6,2)} µJ. Ideal switch and inductor; output held constant; real nodes ring when current stops.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Double the on-time: peak current doubles and energy per cycle quadruples. Raise the output voltage: the release gets shorter, but the energy stored per cycle does not change.</div></div>;
}
