import {M} from './MathText';
import {useState} from 'react';
import {channel,jfet,selfBias,gateLoading,wien,switchLoss,sharing,gateTrace} from '../engine/fet.mjs';
import Plot from './Plot';
import {Control,Readouts as BaseReadouts,f} from './LabControls';
import {FetCircuit,FetGainCircuit} from './FetFigures';
function Readouts({values}:{values:[string,string,string][]}){return <BaseReadouts values={values.map(([value,unit,label])=>[label,value,unit])}/>;}
const green='var(--accent)',orange='var(--orange)';
const pts=(fn:(x:number)=>number,a:number,b:number,n=161):[number,number][]=>Array.from({length:n},(_,i)=>{const x=a+(b-a)*i/(n-1);return [x,fn(x)]});
function Head({text}:{text:string}){return <div className="lab-heading"><span className="tiny-label">{text}</span></div>}
export function FetCurves({mos=false}:{mos?:boolean}){
 const [vg,Vg]=useState(mos?3:-2),[vt,Vt]=useState(mos?2:-4),[lam,Lam]=useState(.01);
 const k=mos?.004:.001,model=(g:number,d:number)=>channel(g,d,k,vt,lam),v=model(vg,6);
 return <div className="lab" aria-label="FET characteristic curves"><Head text="GATE VOLTAGE SETS A FAMILY OF DRAIN CURVES"/>
 <div className="horizontal-controls"><Control label="Gate-source voltage" value={vg} onChange={Vg} min={mos?0:-6} max={mos?5:0} step={.1} unit="V"/><Control label={mos?'Threshold voltage':'Cutoff voltage'} value={vt} onChange={Vt} min={mos?1:-6} max={mos?3:-2} step={.1} unit="V"/><Control label="Channel-length modulation" value={lam} onChange={Lam} min={0} max={.05} step={.005} unit="1/V"/></div>
 <Readouts values={[[f(v.id*1000),'mA','Drain current at 6 V'],[f(v.gm*1000),'mS','Transconductance at 6 V'],[v.region,'','Region at 6 V']]}/>
 <div className="plot-area"><Plot curves={[{name:'Selected gate bias',color:green,points:pts(d=>model(vg,d).id*1000,0,10)},{name:mos?'V_GS = 4 V':'V_GS = 0 V',color:orange,points:pts(d=>model(mos?4:0,d).id*1000,0,10),dashed:true}]} xRange={[0,10]} yRange={[0,mos?50:28]} xLabel="Drain-source voltage / V" yLabel="Drain current / mA" description="Ohmic region bends into current saturation; finite slope from channel-length modulation"/>
 <Plot curves={[{name:'Transfer at V_DS = 6 V',color:green,points:pts(g=>model(g,6).id*1000,mos?0:-6,mos?5:0)}]} xRange={mos?[0,5]:[-6,0]} yRange={[0,mos?50:28]} xLabel="Gate-source voltage / V" yLabel="Drain current / mA" description="FET transfer curve: cutoff and increasing slope"/></div>
 <p className="lab-prompt">Hold geometry parameter k fixed as threshold changes. The JFET default gives <M t="I_DSS"/> = 8 mA with modulation disabled; changing cutoff also changes <M t="I_DSS"/> here. No breakdown, subthreshold current, forward gate current or velocity saturation is modeled.</p></div>;
}
export function JfetBiasLab(){
 const [rs,Rs]=useState(500),[rd,Rd]=useState(1000),[s,S]=useState(8),[supply,V]=useState(12);
 const b=selfBias({vdd:supply,rd,rs,idss:s/1000});
 return <div className="lab" aria-label="JFET self bias and compliance"><Head text="THE SOURCE RESISTOR CLOSES A LOCAL FEEDBACK LOOP"/><FetCircuit rd={rd+' Ω'} rs={rs+' Ω'} supply={supply+' V'}/>
 <div className="horizontal-controls"><Control label="Source resistance" value={rs} onChange={Rs} min={0} max={2000} step={25} unit="Ω"/><Control label="Drain resistance" value={rd} onChange={Rd} min={0} max={4000} step={100} unit="Ω"/><Control label="Zero-bias I_DSS" value={s} onChange={S} min={3} max={16} step={.5} unit="mA"/><Control label="Supply voltage" value={supply} onChange={V} min={3} max={20} step={.5} unit="V"/></div>
 <Readouts values={[[f(b.id*1000),'mA','Bias current'],[f(b.vgs),'V','V_GS'],[f(b.vds),'V','V_DS'],[b.region,'','Region']]}/>
 <div className="plot-area"><Plot curves={[{name:'Available channel current',color:green,points:pts(i=>jfet(-i*rs/1000,Math.max(0,supply-i*(rd+rs)/1000),s/1000).id*1000,0,16)},{name:'Required current I',color:orange,points:[[0,0],[16,16]]}]} xRange={[0,16]} yRange={[0,16]} xLabel="Trial current / mA" yLabel="Current / mA" point={[b.id*1000,b.id*1000]} description="Self-consistent bias occurs where trial and channel currents agree"/></div><p className="lab-prompt">Gate is held at 0 V through its bias resistor. Raise RD until the device leaves saturation: a mathematically correct transfer-law solution alone would miss this compliance failure.</p></div>;
}
export function FetGainLab(){
 const [gm,Gm]=useState(4),[rs,Rs]=useState(470),[rd,Rd]=useState(4700),[cgd,Cgd]=useState(3),[source,Source]=useState(100);
 const a=gateLoading({gm:gm/1000,rd,rl:10000,rs,cgs:10e-12,cgd:cgd*1e-12}),cin=a.cin*1e12,pole=1/(2*Math.PI*source*1000*cin*1e-12);
 return <div className="lab" aria-label="FET amplifier gain and Miller capacitance"><Head text="SOURCE DEGENERATION, LOADING AND BANDWIDTH"/><FetGainCircuit rs={rs+' Ω'} rd={rd+' Ω'}/>
 <div className="horizontal-controls"><Control label="Transconductance" value={gm} onChange={Gm} min={1} max={20} step={.5} unit="mS"/><Control label="Unbypassed source resistance" value={rs} onChange={Rs} min={0} max={2000} step={10} unit="Ω"/><Control label="Drain load resistance" value={rd} onChange={Rd} min={1000} max={10000} step={100} unit="Ω"/><Control label="Gate-drain capacitance" value={cgd} onChange={Cgd} min={1} max={10} step={.5} unit="pF"/><Control label="Signal source resistance" value={source} onChange={Source} min={1} max={1000} step={1} unit="kΩ"/></div>
 <Readouts values={[[f(a.gain),'V/V','Midband gain'],[f(cin),'pF','Miller input capacitance'],[f(pole/1000),'kHz','Input pole']]}/>
 <div className="plot-area"><Plot curves={[{name:'Single input-pole approximation',color:green,points:Array.from({length:181},(_,i)=>{const hz=10**(i/30);return [hz,20*Math.log10(Math.abs(a.gain)/Math.hypot(1,hz/pole))] as [number,number]})}]} xRange={[1,1e6]} yRange={[-60,40]} xScale="log" xLabel="Frequency / Hz" yLabel="Gain / dB" description="Amplifier gain rolls off through the source-resistance Miller pole"/></div><p className="lab-prompt"><M t="R_L"/> = 10 kΩ, <M t="C_gs"/> = 10 pF; infinite output resistance and no body effect. Source motion reduces the gate-source capacitance contribution here; the drain contribution includes Miller multiplication. Bias-network loading is excluded from this source-resistance estimate. This isolates one pole, not the complete high-frequency transfer function. The controls describe local parameters at an independently established valid bias point.</p></div>;
}
export function VariableFetLab(){
 const [u,U]=useState(2),[correct,Correct]=useState(false);
 return <div className="lab" aria-label="FET variable resistor"><Head text="THE QUADRATIC ERROR IN A VOLTAGE-CONTROLLED RESISTOR"/>
 <div className="horizontal-controls"><Control label="Control overdrive" value={u} onChange={U} min={1} max={3.4} step={.1} unit="V"/></div><div className="view-buttons"><button aria-pressed={!correct} onClick={()=>Correct(false)}>Fixed gate</button><button aria-pressed={correct} onClick={()=>Correct(true)}>Half-drain tracking</button></div>
 <Readouts values={[[f(1000/u),'Ω','Zero-voltage resistance'],[correct?'Cancelled':'Present','','Quadratic term']]}/>
 <div className="plot-area"><Plot curves={[{name:'Channel current',color:green,points:pts(v=>u*v-(correct?0:v*v/2),-.5,.5)},{name:'Ideal resistor tangent',color:orange,dashed:true,points:[[-.5,-u*.5],[.5,u*.5]]}]} xRange={[-.5,.5]} yRange={[-2.2,2.2]} xLabel="Voltage across channel / V" yLabel="Channel current / mA" description="Drain-voltage tracking cancels the ideal quadratic resistor error"/></div><p className="lab-prompt">k = 1 mA/V². This local symmetric-channel illustration assumes reverse-biased JFET junctions throughout; for VP = −4 V, the control range keeps the gate below both channel ends for ±0.5 V in either mode. MOS body diodes and real JFET geometry limit bidirectional use. Cancellation here is a model result, not a distortion guarantee.</p></div>;
}
export function FetOscillatorLab(){
 const [r,R]=useState(10),[c,C]=useState(10),[gain,G]=useState(3.1);const f0=1/(2*Math.PI*r*1000*c*1e-9);
 return <div className="lab" aria-label="Wien oscillator loop response"><Head text="FREQUENCY SELECTS PHASE; GAIN DETERMINES STARTUP"/>
 <div className="horizontal-controls"><Control label="Wien resistance" value={r} onChange={R} min={1} max={100} unit="kΩ"/><Control label="Wien capacitance" value={c} onChange={C} min={1} max={100} unit="nF"/><Control label="Amplifier gain" value={gain} onChange={G} min={2.5} max={3.5} step={.01} unit="V/V"/></div>
 <Readouts values={[[f(f0),'Hz','Zero-phase frequency'],[f(gain/3,3),'','Loop magnitude at f_0'],[gain>3?'Growth':gain<3?'Decay':'Marginal','','Linear startup prediction']]}/>
 <div className="plot-area"><Plot curves={[{name:'Loop magnitude',color:green,points:pts(x=>gain*wien(x*f0,r*1000,c*1e-9).magnitude,.05,4)}]} xRange={[.05,4]} yRange={[0,1.3]} xLabel="Frequency / f_0" yLabel="Loop magnitude" description="Wien bridge loop peaks at one third of amplifier gain"/>
 <Plot curves={[{name:'Bridge phase',color:orange,points:pts(x=>wien(x*f0,r*1000,c*1e-9).phase,.05,4)}]} xRange={[.05,4]} yRange={[-90,90]} xLabel="Frequency / f_0" yLabel="Phase / degrees" description="Bridge phase crosses zero at f0"/></div><p className="lab-prompt">The lab analyzes the linear loop. It does not simulate noise startup or amplitude regulation. A rectifier/envelope filter can adjust a JFET resistor to bring steady-state gain back toward 3.</p></div>;
}
export function AnalogSwitchLab(){
 const [ron,Ron]=useState(100),[cap,Cap]=useState(1),[leak,Leak]=useState(10),[charge,Q]=useState(5);
 const tau=(1000+ron)*cap*1e-9;
 return <div className="lab" aria-label="Analog switch acquisition and hold errors"><Head text="ACQUIRE QUICKLY; HOLD WITHOUT LEAKING"/>
 <div className="horizontal-controls"><Control label="On resistance" value={ron} onChange={Ron} min={10} max={1000} step={10} unit="Ω"/><Control label="Hold capacitance" value={cap} onChange={Cap} min={.1} max={10} step={.1} unit="nF"/><Control label="Total hold leakage" value={leak} onChange={Leak} min={0} max={100} unit="pA"/><Control label="Injected charge" value={charge} onChange={Q} min={0} max={20} step={.5} unit="pC"/></div>
 <Readouts values={[[f(tau*1e6),'μs','Acquisition time constant'],[f(charge/cap),'mV','Turn-off step magnitude'],[f(leak/cap),'mV/s','Hold droop magnitude']]}/>
 <div className="plot-area"><Plot curves={[{name:'Acquisition from 0 to 1 V',color:green,points:pts(t=>1-Math.exp(-t*1e-6/tau),0,80)}]} xRange={[0,80]} yRange={[0,1.05]} xLabel="Time after closing / μs" yLabel="Hold voltage / V" description="A larger hold capacitor reduces switching step and droop but slows acquisition"/></div><p className="lab-prompt">Source resistance = 1 kΩ. Acquisition, injected step and hold droop are separate estimates; leakage and injection signs depend on the real circuit. Explore why a larger capacitor solves two errors but creates a settling penalty.</p></div>;
}
export function GateChargeLab(){
 const [current,I]=useState(100),[qgd,Q]=useState(10);
 const total=20+qgd,tmax=total/current*1000;
 return <div className="lab" aria-label="MOSFET gate charge timing"><Head text="THE DRIVER MUST MOVE CHARGE"/>
 <div className="horizontal-controls"><Control label="Gate charging current" value={current} onChange={I} min={20} max={500} step={10} unit="mA"/><Control label="Miller charge" value={qgd} onChange={Q} min={2} max={30} unit="nC"/></div>
 <Readouts values={[[f(qgd/current*1000),'ns','Miller interval'],[f(tmax),'ns','Total charging time']]}/>
 <div className="plot-area"><Plot curves={[{name:'Illustrative gate charge curve',color:green,points:pts(t=>gateTrace(t*current/1000,8,qgd,total),0,tmax)}]} xRange={[0,tmax]} yRange={[0,11]} xLabel="Time / ns" yLabel="Gate-source voltage / V" description="Constant-current charge model shows a Miller plateau at 4 volts"/></div><p className="lab-prompt">Illustrative values: pre-plateau charge 8 nC, final charge 12 nC, plateau 4 V, final drive 10 V. Real drivers are not constant-current sources and real curves depend on drain voltage and current. This is a timing illustration, not a transistor transient solver.</p></div>;
}
export function PowerFetLab(){
 const [current,I]=useState(5),[freq,F]=useState(100),[edge,E]=useState(50),[temp,T]=useState(75);
 const r=.02*(1+.004*(temp-25)),p=switchLoss({i:current,f:freq*1000,tr:edge*1e-9/2,tf:edge*1e-9/2,r});
 return <div className="lab" aria-label="Power MOSFET loss budget"><Head text="LOW RESISTANCE DOES NOT ELIMINATE SWITCHING LOSS"/><FetCircuit mode="switch" mos/>
 <div className="horizontal-controls"><Control label="On-state load current" value={current} onChange={I} min={1} max={20} unit="A"/><Control label="Switching frequency" value={freq} onChange={F} min={1} max={500} unit="kHz"/><Control label="Combined overlap time" value={edge} onChange={E} min={10} max={300} step={5} unit="ns"/><Control label="Assumed junction temperature" value={temp} onChange={T} min={25} max={150} unit="°C"/></div>
 <Readouts values={[[f(p.conduction),'W','MOS conduction'],[f(p.overlap),'W','MOS overlap'],[f(p.driver,3),'W','Gate drive supply'],[f(r*1000),'mΩ','Hot on-resistance']]}/>
 <div className="plot-area"><Plot curves={[{name:'Conduction + overlap',color:green,points:pts(hz=>p.conduction+switchLoss({i:current,f:hz*1000,tr:edge*1e-9/2,tf:edge*1e-9/2,r}).overlap,1,500)}]} xRange={[1,500]} yRange={[0,Math.max(2,p.conduction+1.2*switchLoss({i:current,f:500e3,tr:edge*1e-9/2,tf:edge*1e-9/2,r}).overlap)]} xLabel="Frequency / kHz" yLabel="MOSFET power / W" description="Conduction is a fixed floor; hard-switching overlap rises with frequency"/></div><p className="lab-prompt">24 V bus, 50% duty, 20 mΩ at 25°C, assumed +0.4%/°C, <M t="Q_g"/> = 30 nC, drive = 10 V. Temperature is an input, not a computed equilibrium. Gate-drive supply power is reported separately; output-capacitance loss, reverse recovery, dead time and avalanche are excluded.</p></div>;
}
export function ParallelFetLab(){
 const [t,T]=useState(25),[ratio,R]=useState(1),[ballast,B]=useState(0);
 const p=sharing(20,.02,.02*ratio,t,25,.004,ballast/1000);
 return <div className="lab" aria-label="Parallel MOSFET current sharing"><Head text="STATIC SHARING OF FULLY ENHANCED MOSFETS"/>
 <div className="horizontal-controls"><Control label="Device 1 temperature" value={t} onChange={T} min={25} max={150} unit="°C"/><Control label="Device 2 resistance ratio" value={ratio} onChange={R} min={.5} max={1.5} step={.05} unit="×"/><Control label="Individual ballast resistance" value={ballast} onChange={B} min={0} max={30} unit="mΩ"/></div>
 <Readouts values={[[f(p.i1),'A','Device 1 current'],[f(p.i2),'A','Device 2 current'],[f(p.i1*p.i1*.02*(1+.004*(t-25))),'W','Device 1 channel loss']]}/>
 <div className="plot-area"><Plot curves={[{name:'Device 1',color:green,points:pts(temp=>sharing(20,.02,.02*ratio,temp,25,.004,ballast/1000).i1,25,150)},{name:'Device 2',color:orange,points:pts(temp=>sharing(20,.02,.02*ratio,temp,25,.004,ballast/1000).i2,25,150)}]} xRange={[25,150]} yRange={[0,20]} xLabel="Device 1 temperature / °C" yLabel="Branch current / A" description="Positive on-resistance temperature coefficient redistributes current away from a hot fully enhanced channel"/></div><p className="lab-prompt">Total current is held at 20 A. This static ohmic model excludes thermal coupling and switching mismatch. It must not be used to certify linear-mode stability or safe operating area.</p></div>;
}


