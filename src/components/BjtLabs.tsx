import {FollowerCircuit,BipolarStage,CurrentSinkCircuit} from './BipolarCircuits';
import {useMemo,useState} from 'react';
import {bjtPhysics,earlyVoltage,solveStage,outputCurve,simpleSwitch,follower,dividerBias,baseResistorBias,smallSignal,ceGain,phaseSplitter,VT300} from '../engine/bjt.mjs';
import Plot from './Plot';
import {Control,Readouts,f} from './LabControls';
import {Label,eng,engText,green,orange,gray,ink} from './Parts';
import * as S from './Schematic';
import {M,htmlSub} from './MathText';
function Head({title,reset}:{title:string;reset:()=>void}){return <div className="lab-heading"><div><span className="live-dot"/><span className="tiny-label">{htmlSub(title)}</span></div><button onClick={reset}>Reset ↺</button></div>}
const pts=(fn:(x:number)=>number,a:number,b:number,n=200):[number,number][]=>Array.from({length:n+1},(_,k)=>{const x=a+(b-a)*k/n;return [x,fn(x)]});

/* ---------- Transistor physics ---------- */
export function BaseTransportLab(){
 const [vbe,setVbe]=useState(.65),[vcb,setVcb]=useState(5),[wb,setWb]=useState(.8),[nab,setNab]=useState(10);
 const p={vbe,vcb,wb:wb*1e-6,nab:nab*1e22};let d:ReturnType<typeof bjtPhysics>|null=null,zero:ReturnType<typeof bjtPhysics>|null=null,va=NaN;
 try{d=bjtPhysics(p);zero=bjtPhysics({...p,vcb:0});va=earlyVoltage(p);}catch{d=null;}
 const reset=()=>{setVbe(.65);setVcb(5);setWb(.8);setNab(10)};
 const scale=260,x0=210,xb=x0+wb*scale;
 return <div className="lab" aria-label="Base transport experiment"><Head title="INJECT · DIFFUSE · COLLECT" reset={reset}/>
 <svg className="wide-circuit" viewBox="0 0 640 240" role="img" aria-label="Cross-section of an NPN transistor: heavily doped N emitter on the left, thin P base, N collector on the right. Electrons injected from the emitter form a straight-line concentration profile across the base and are swept into the collector by the reverse-biased collector junction.">
  <rect x="40" y="60" width={x0-40} height="110" fill="#dcece5"/><rect x={x0} y="60" width={xb-x0} height="110" fill="#efe5d6"/><rect x={xb} y="60" width={600-xb} height="110" fill="#e6efe9"/>
  {d&&<><rect x={x0} y="60" width={d.xe*1e6*scale} height="110" fill="var(--paper)" stroke={orange} strokeDasharray="4 3"/><rect x={xb-d.xc*1e6*scale} y="60" width={Math.min(600-xb+d.xc*1e6*scale,d.xc*1e6*scale*(1+nab))} height="110" fill="var(--paper)" stroke={orange} strokeDasharray="4 3"/>
  <path d={`M${x0+d.xe*1e6*scale} 80 L${xb-d.xc*1e6*scale} 160`} stroke={green} strokeWidth="3"/><path d={`M${x0+d.xe*1e6*scale} 80 V160 H${xb-d.xc*1e6*scale}`} stroke={green} strokeWidth="1" strokeDasharray="3 3" fill="none"/></>}
  <path d={`M100 200 H560`} stroke={ink} strokeWidth="1.6"/><path d="M552 195 l8 5 l-8 5" fill="none" stroke={ink} strokeWidth="1.6"/>
  <Label x={120} y={45} anchor="middle">N⁺ emitter</Label><Label x={(x0+xb)/2} y={45} anchor="middle">P base</Label><Label x={(xb+600)/2} y={45} anchor="middle">N collector</Label>
  <Label x={330} y={225} anchor="middle" kind="value">electron flow: emitter → base → collector</Label>
  {d&&<Label x={x0+d.xe*1e6*scale+6} y={98} kind="output">n(0)</Label>}
 </svg>
 <div className="horizontal-controls"><Control label="Base–emitter voltage" value={vbe} onChange={setVbe} min={.55} max={.75} step={.005} unit="V"/><Control label="Collector–base reverse voltage" value={vcb} onChange={setVcb} min={0} max={30} step={.5} unit="V"/><Control label="Metallurgical base width" value={wb} onChange={setWb} min={.4} max={1.2} step={.02} unit="µm"/><Control label="Base doping" value={nab} onChange={setNab} min={0} max={2} step={.02} log unit="×10¹⁶ cm⁻³"/></div>
 {d&&zero?<><Readouts values={[['COLLECTOR CURRENT',...eng(d.ic,'A')],['CURRENT GAIN β',f(d.beta,0),''],['NEUTRAL BASE WIDTH',f(d.w*1e6,3),'µm']]}/>
 <div className="plot-area"><h4>A straight-line profile: its slope is the collector current</h4><Plot curves={[{name:'Electron density, selected V_CB',color:green,points:[[0,d.edge/1e20],[d.w*1e6,0]]},{name:'Same V_BE, V_CB = 0',color:gray,dashed:true,points:[[0,zero.edge/1e20],[zero.w*1e6,0]]}]} xRange={[0,1.2]} yRange={[0,Math.max(d.edge,zero.edge)/1e20*1.15]} xLabel="DISTANCE INTO NEUTRAL BASE / µm" yLabel="EXCESS ELECTRON DENSITY / 10¹⁴ cm⁻³" description={'Electron density falls linearly from '+f(d.edge/1e20,3)+' times 10 to the 14 per cubic centimeter at the emitter edge to nearly zero at the collector edge, '+f(d.w*1e6,3)+' micrometers away.'}/>
 <Plot curves={[{name:'Collector current',color:orange,points:pts(v=>{try{return bjtPhysics({...p,vcb:v}).ic*1e6}catch{return NaN}},0,30,60)}]} xRange={[0,30]} yRange={[0,Math.max(d.ic*1e6,...pts(v=>{try{return bjtPhysics({...p,vcb:v}).ic*1e6}catch{return NaN}},0,30,60).map(p=>p[1]).filter(Number.isFinite))*1.15]} xLabel="COLLECTOR–BASE REVERSE VOLTAGE / V" yLabel="COLLECTOR CURRENT / µA" point={[vcb,d.ic*1e6]} description="Collector current rises slowly with collector voltage because the collector depletion region eats into the base: the Early effect."/>
 <p className="plot-summary">Emitter efficiency γ = {f(d.gamma,5)}; base transport <M t="α_T"/> = {f(d.alphaT,5)}; α = {f(d.alpha,5)}. Base transit time <M t="τ_F"/> = W²/2<M t="D_n"/> = {engText(d.tauF,'s')}, an upper limit <M t="f_T"/> ≈ {engText(d.ft,'Hz')}. Early voltage ≈ {f(va,0)} V. Uniform doping; N⁺ emitter 10¹⁹ cm⁻³, 0.3 µm; collector 10¹⁶ cm⁻³; area 1000 µm²; <M t="D_n"/> = 20 cm²/s, <M t="D_p"/>(emitter) = 2.6 cm²/s, <M t="L_n"/> = 14 µm; 300 K; low-level injection; no bandgap narrowing or recombination in depletion regions.</p></div></>
 :<p className="lab-warning" style={{margin:'16px 22px'}}>The collector depletion region has reached the emitter: the base has <strong>punched through</strong> and the model no longer applies. Reduce the collector voltage, widen the base, or dope it more heavily.</p>}
 <div className="lab-prompt"><strong>Explore.</strong> Raise <M t="V_BE"/> by 60 mV: the edge density and the current rise tenfold. Thin the base: β rises, because fewer electrons recombine and fewer holes are needed per electron. Dope the base more heavily: β falls.</div></div>;
}

/* ---------- The BJT: first model and switch ---------- */
export function SwitchLab(){
 const [vin,setVin]=useState(5),[rbk,setRbk]=useState(1),[rc,setRc]=useState(120),[beta,setBeta]=useState(100);
 const vcc=12,d=simpleSwitch({vin,rb:rbk*1e3,vcc,rc,beta}),imax=vcc/rc*1000,sel=Math.min(beta*d.ib*1000,imax*1.6);
 const curve=(icma:number):[number,number][]=>[[0,0],[.2,icma],[vcc,icma]];
 const reset=()=>{setVin(5);setRbk(1);setRc(120);setBeta(100)};
 const q=S.bjtPins({at:[360,185]}),node:[number,number]=[372,120],active=d.region!=='cutoff';
 return <div className="lab" aria-label="Transistor switch experiment"><Head title="A SMALL BASE CURRENT CONTROLS A LARGE ONE" reset={reset}/>
 <S.Schematic height={275} description={'Input '+vin+' volts through base resistor '+rbk+' kilohms to an NPN transistor. Collector load '+rc+' ohms to +12 volts, emitter grounded.'}>
  <S.Source a={[90,215]} b={[90,155]} label={f(vin,2)+' V'}/><S.Wire pts={[[90,155],[90,110],[150,110]]}/><S.Res a={[150,110]} b={[250,110]} label={'R_B = '+engText(rbk*1e3,'Ω')}/>
  <S.Wire pts={[[250,110],[300,110],[300,185],q.b]}/><S.Bjt at={[360,185]}/><S.Rail at={[372,28]} label="+12 V"/>
  <S.Res a={[372,28]} b={node} label={'R_C = '+engText(rc,'Ω')} value="load"/><S.Wire pts={[node,q.c]}/><S.Dot at={node} color={green}/>
  <S.Wire pts={[[90,215],[90,250],[372,250],q.e]}/><S.Ground at={[230,250]}/>
  {active&&<><S.CurrentArrow at={[300,150]} dir="down" side={-1} label={'I_B = '+engText(d.ib,'A')}/><S.CurrentArrow at={[372,136]} dir="down"/></>}
  <S.Text x={388} y={140} kind="output">V_CE = {f(d.vce,2)} V</S.Text><S.Text x={388} y={162} kind="value">I_C = {engText(d.ic,'A')}</S.Text><S.Text x={406} y={210} kind="value">β = {beta}</S.Text>
 </S.Schematic>
 <div className="horizontal-controls"><Control label="Input voltage" value={vin} onChange={setVin} min={0} max={5} step={.05} unit="V"/><Control label="Base resistor" value={rbk} onChange={setRbk} min={-1} max={2} step={.02} log unit="kΩ"/><Control label="Collector load" value={rc} onChange={setRc} min={1.7} max={3.7} step={.02} log unit="Ω"/><Control label="Current gain β" value={beta} onChange={setBeta} min={30} max={300} step={5} unit=""/></div>
 <Readouts values={[['BASE CURRENT',...eng(d.ib,'A')],['COLLECTOR CURRENT',...eng(d.ic,'A')],['REGION',d.region,d.region==='saturation'?'×'+f(d.overdrive,1)+' overdrive':'']]}/>
 <div className="plot-area"><h4>Operating point = transistor curve ∩ load line</h4><Plot curves={[{name:'Transistor at this $I_B$ (first model)',color:green,points:curve(sel)},{name:'Other base currents',color:gray,dashed:true,points:[0.25,.5,.75,1.25].flatMap(k=>[...curve(k*imax),[NaN,NaN] as [number,number]])},{name:'Load line: $I = (12\\text{ V} - V_{CE})/R_C$',color:orange,points:[[0,imax],[vcc,0]]}]} xRange={[0,vcc]} yRange={[0,imax*1.6]} xLabel="COLLECTOR–EMITTER VOLTAGE V_CE / V" yLabel="COLLECTOR CURRENT I_C / mA" point={[d.vce,d.ic*1000]} description={'Operating point at '+f(d.vce,2)+' volts and '+f(d.ic*1000,1)+' milliamps; region '+d.region+'.'}/>
 <p className="plot-summary">Transistor dissipation <M t="I_C V_{CE}"/> = {engText(d.ic*d.vce,'W')}; load receives {engText(d.ic*d.ic*rc,'W')}. First model: fixed <M t="V_{BE}"/> = 0.65 V, <M t="I_C=\beta I_B"/> in the active region, a fixed 0.2 V floor in saturation. Real curves (Chapter 34) bend smoothly into saturation and slope upward with <M t="V_{CE}"/>.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Find the largest base resistor that still saturates the switch at <M t="\beta"/> = 30, the worst case for many transistors. Then set the input halfway between on and off (e.g. <M t="V_{\mathrm{in}}"/> ≈ 1.2 V with 1 kΩ) and see how much power the transistor itself burns. Finally, halve the load resistance: the same base drive that saturated a 100 mA load may leave a 200 mA load in the active region.</div></div>;
}

/* ---------- Emitter follower ---------- */
export function FollowerLab(){
 const [amp,setAmp]=useState(6),[re,setRe]=useState(1000),[rl,setRl]=useState(1000),[noLoad,setNoLoad]=useState(false);
 const load=noLoad?Infinity:rl,out=(v:number)=>Math.min(follower({vin:v,re,rl:load,vee:10,rs:10e3}).out,9.8),d=follower({vin:0,re,rl:load,vee:10,rs:10e3});
 const reset=()=>{setAmp(6);setRe(1000);setRl(1000);setNoLoad(false)};
 return <div className="lab" aria-label="Emitter follower experiment"><Head title="THE EMITTER FOLLOWS — UNTIL IT CAN’T PULL DOWN" reset={reset}/>
 <FollowerCircuit re={engText(re,'Ω')} rl={engText(rl,'Ω')} noLoad={noLoad}/>
 <div className="horizontal-controls"><Control label="Input amplitude" value={amp} onChange={setAmp} min={0} max={9.5} step={.1} unit="V peak"/><Control label="Emitter resistor R_E (to −10 V)" value={re} onChange={setRe} min={2} max={4} step={.02} log unit="Ω"/>{!noLoad&&<Control label="Load to ground" value={rl} onChange={setRl} min={2} max={5} step={.02} log unit="Ω"/>}<label className="check"><input type="checkbox" checked={noLoad} onChange={e=>setNoLoad(e.target.checked)}/> Remove the load</label></div>
 <Readouts values={[['LOWEST OUTPUT',f(d.floor,2),'V'],['INPUT IMPEDANCE',...eng(d.zin,'Ω')],['OUTPUT IMPEDANCE',...eng(d.zout,'Ω')]]}/>
 <div className="plot-area"><h4>{htmlSub(out(-amp)<=d.floor+1e-9?'Negative peaks clip: R_E cannot pull the load down far enough':'Output follows input, one V_BE lower')}</h4><Plot curves={[{name:'Input',color:gray,dashed:true,points:pts(t=>amp*Math.sin(2*Math.PI*t),0,2)},{name:'Output',color:green,points:pts(t=>out(amp*Math.sin(2*Math.PI*t)),0,2,400)},{name:'Pull-down limit',color:orange,dashed:true,points:[[0,d.floor],[2,d.floor]]}]} xRange={[0,2]} yRange={[-11,11]} xLabel="TIME / PERIODS" yLabel="VOLTAGE / V" description={'Output follows the input minus 0.65 V but cannot fall below '+f(d.floor,2)+' volts.'}/>
 <p className="plot-summary">With the transistor off, the emitter falls to the divider of −10 V by <M t="R_E"/> and <M t="R_L"/>: {f(d.floor,2)} V. Impedances at zero input: <M t="Z_in"/> = (β + 1)(<M t="r_e"/> + <M t="R_E"/> ∥ <M t="R_L"/>) with β = 100; <M t="Z_out"/> = <M t="r_e"/> + 10 kΩ/(β + 1). Fixed <M t="V_BE"/> = 0.65 V and β = 100 for the waveform, including the 10 kΩ source drop; output also limited near +9.8 V by saturation.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> With a 1 kΩ load, raise <M t="R_E"/>: the quiescent current falls and clipping starts earlier. Choose <M t="R_E"/> so that a ±6 V swing into 1 kΩ survives—the standing current must exceed the peak load current.</div></div>;
}

/* ---------- Biasing ---------- */
export function BiasLab(){
 const [r1,setR1]=useState(82),[r2,setR2]=useState(10),[re,setRe]=useState(1000),[beta,setBeta]=useState(100),[temp,setTemp]=useState(25);
 const base={vcc:15,r1:r1*1e3,r2:r2*1e3,rc:7.5e3,re},nominal=dividerBias({...base,beta:100,temp:25}),rb=100*(15-.65)/nominal.ic;
 const d=dividerBias({...base,beta,temp}),b=baseResistorBias({vcc:15,rb,rc:7.5e3,beta,temp});
 const reset=()=>{setR1(82);setR2(10);setRe(1000);setBeta(100);setTemp(25)};
 return <div className="lab" aria-label="Bias stability experiment"><Head title="WHICH BIAS SURVIVES A DIFFERENT TRANSISTOR?" reset={reset}/>
 <BipolarStage labels={{r1:engText(r1*1e3,'Ω'),r2:engText(r2*1e3,'Ω'),rc:'7.5 kΩ',re:engText(re,'Ω')}}/>
 <div className="horizontal-controls"><Control label="Upper divider R_1" value={r1} onChange={setR1} min={20} max={300} step={1} unit="kΩ"/><Control label="Lower divider R_2" value={r2} onChange={setR2} min={1} max={50} step={.5} unit="kΩ"/><Control label="Emitter resistor R_E" value={re} onChange={setRe} min={2} max={3.7} step={.02} log unit="Ω"/><Control label="Transistor β" value={beta} onChange={setBeta} min={25} max={500} step={5} unit=""/><Control label="Temperature" value={temp} onChange={setTemp} min={-40} max={125} step={1} unit="°C"/></div>
 <Readouts values={[['I_C, DIVIDER + R_E',f(d.ic*1000,3),'mA'],['V_C, DIVIDER + R_E',f(d.vc,2),'V'],['I_C, BASE RESISTOR',f(b.ic*1000,3),'mA']]}/>
 <div className="plot-area"><h4>Collector current as β varies over a typical production spread</h4><Plot curves={[{name:'Divider + R_E',color:green,points:pts(x=>dividerBias({...base,beta:x,temp}).ic*1000,25,500,120)},{name:'Single base resistor, same nominal I_C',color:orange,points:pts(x=>baseResistorBias({vcc:15,rb,rc:7.5e3,beta:x,temp}).ic*1000,25,500,120)}]} xRange={[25,500]} xTicks={[25,100,200,300,400,500]} yRange={[0,2.2]} xLabel="CURRENT GAIN β" yLabel="COLLECTOR CURRENT / mA" point={[beta,d.ic*1000]} description={'With the divider and emitter resistor, collector current is '+f(d.ic*1000,3)+' milliamps; with a single base resistor it is '+f(b.ic*1000,3)+' milliamps.'}/>
 <p className="plot-summary">Divider: <M t="V_TH"/> = {f(d.vth,3)} V, <M t="R_TH"/> = {engText(d.rth,'Ω')}, stiffness ratio (β+1)<M t="R_E"/>/<M t="R_TH"/> = {f((beta+1)*re/d.rth,1)}. Base resistor chosen as {engText(rb,'Ω')} to match at β = 100, 25 °C. {d.saturated?'The divider stage has saturated.':''}{htmlSub(b.saturated?' The base-resistor stage has saturated (V_C ≈ 0.2 V).':'')} Fixed-<M t="V_BE"/> model with −2.1 mV/°C; β held constant with temperature here, though it actually rises.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Sweep β from 50 to 500: the single-resistor design runs from half current to saturation, while the divider design barely moves. Then raise <M t="R_1"/> and <M t="R_2"/> tenfold together (a “stiffer-looking” ratio but weaker divider) and watch the β-sensitivity return.</div></div>;
}

/* ---------- Small-signal model ---------- */
export function SmallSignalLab(){
 const [ima,setIma]=useState(1),[beta,setBeta]=useState(100),[mv,setMv]=useState(5);
 const ic=ima/1000,s=smallSignal({ic,beta,va:Infinity}),is=1e-14,vbe=VT300*Math.log(ic/is),exp=(v:number)=>is*Math.expm1(v/VT300)*1000;
 const up=ic*Math.expm1(mv/1000/VT300),down=ic*Math.expm1(-mv/1000/VT300),lin=s.gm*mv/1000;
 const reset=()=>{setIma(1);setBeta(100);setMv(5)};
 return <div className="lab" aria-label="Small-signal transistor model experiment"><Head title="A TANGENT TO AN EXPONENTIAL" reset={reset}/>
 <div className="horizontal-controls"><Control label="Bias collector current" value={ima} onChange={setIma} min={-2} max={1} step={.02} log unit="mA"/><Control label="Current gain β" value={beta} onChange={setBeta} min={30} max={500} step={5} unit=""/><Control label="Signal amplitude Δv_BE" value={mv} onChange={setMv} min={0} max={40} step={.5} unit="mV"/></div>
 <Readouts values={[['TRANSCONDUCTANCE g_m',...eng(s.gm,'S')],['EMITTER RESISTANCE r_e',...eng(s.re,'Ω')],['BASE RESISTANCE r_π',...eng(s.rpi,'Ω')]]}/>
 <div className="plot-area"><h4>Bias point at <M t="V_BE"/> = {f(vbe,4)} V</h4><Plot curves={[{name:'I_C = I_S e^(V_BE/V_T)',color:green,points:pts(exp,vbe-.08,vbe+.05)},{name:'Tangent: slope g_m',color:orange,dashed:true,points:pts(v=>ima+s.gm*(v-vbe)*1000,vbe-.08,vbe+.05,2)}]} xRange={[vbe-.08,vbe+.05]} xTicks={[-.08,-.04,0,.04].map(x=>Number((vbe+x).toFixed(3)))} yRange={[0,ima*8]} xLabel="BASE–EMITTER VOLTAGE / V" yLabel="COLLECTOR CURRENT / mA" point={[vbe,ima]} description={'Exponential collector characteristic with its tangent at '+f(ima,3)+' milliamps. Slope g_m = '+engText(s.gm,'S')+'.'}/>
 <Plot curves={[{name:'Exact Δi_C',color:green,points:pts(t=>ic*Math.expm1(mv/1000*Math.sin(2*Math.PI*t)/VT300)*1000,0,2)},{name:'Linear model g_m·Δv_BE',color:orange,dashed:true,points:pts(t=>lin*Math.sin(2*Math.PI*t)*1000,0,2)}]} xRange={[0,2]} yRange={[-(Math.max(lin,up)*1150||1e-3),Math.max(lin,up)*1150||1e-3]} xLabel="TIME / PERIODS" yLabel="CHANGE IN COLLECTOR CURRENT / mA" description={'For '+mv+' millivolts of base signal the current rises '+f(up*1000,4)+' and falls '+f(-down*1000,4)+' milliamps; the linear model predicts ±'+f(lin*1000,4)+'.'}/>
 <p className="plot-summary">Positive peak {f(lin===0?0:(up/lin-1)*100,1)}% above the linear prediction, negative peak {f(lin===0?0:(1+down/lin)*100,1)}% below it. All three small-signal parameters depend only on the bias current (and β): <M t="g_m"/> = <M t="I_C"/>/<M t="V_T"/>, <M t="r_e"/> = 1/<M t="g_m"/>, <M t="r_π"/> = β/<M t="g_m"/>. <M t="I_S"/> = 10 fA, 300 K, no Early effect.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> At 1 mV the model is accurate to 2%; at 10 mV the peaks are about 20% asymmetric. Change the bias current: <M t="r_e"/> and <M t="g_m"/> change, but the percentage error at a given Δ<M t="v_BE"/> does not.</div></div>;
}

/* ---------- Current source ---------- */
export function CurrentSourceLab(){
 const [vb,setVb]=useState(1.65),[re,setRe]=useState(1000),[load,setLoad]=useState(6),[early,setEarly]=useState(true);
 const m={vcc:15,re,rb:0,betaF:100,va:early?50:Infinity},solve=(rl:number)=>solveStage({vbb:vb,...m,rc:rl*1e3});
 const sweep=useMemo(()=>pts(rl=>solve(rl).ic*1000,0,25,100),[vb,re,early]);
 const d=solve(load),i0=solve(0),ve=d.ve,limit=(15-.2-ve)/d.ic/1000;
 const reset=()=>{setVb(1.65);setRe(1000);setLoad(6);setEarly(true)};
 return <div className="lab" aria-label="Transistor current source experiment"><Head title="THE SAME CURRENT INTO ANY LOAD — WITHIN LIMITS" reset={reset}/>
 <CurrentSinkCircuit vb={f(vb,2)+' V'} re={engText(re,'Ω')} load={f(load,1)+' kΩ'}/>
 <div className="horizontal-controls"><Control label="Base voltage" value={vb} onChange={setVb} min={1} max={6} step={.05} unit="V"/><Control label="Emitter resistor" value={re} onChange={setRe} min={2} max={4} step={.02} log unit="Ω"/><Control label="Load resistance" value={load} onChange={setLoad} min={0} max={25} step={.1} unit="kΩ"/><label className="check"><input type="checkbox" checked={early} onChange={e=>setEarly(e.target.checked)}/> Include Early effect (<M t="V_A"/> = 50 V)</label></div>
 <Readouts values={[['OUTPUT CURRENT',f(d.ic*1000,3),'mA'],['V_CE ACROSS TRANSISTOR',f(d.vce,2),'V'],['COMPLIANCE LIMIT',f(Math.max(0,limit),1),'kΩ max']]}/>
 <div className="plot-area"><h4>Flat until the transistor saturates</h4><Plot curves={[{name:'Output current (Ebers–Moll)',color:green,points:sweep},{name:'(V_B − V_BE)/R_E estimate',color:gray,dashed:true,points:[[0,(vb-.65)/re*1000],[25,(vb-.65)/re*1000]]}]} xRange={[0,25]} xTicks={[0,5,10,15,20,25]} yRange={[0,Math.max(...sweep.map(p=>p[1]))*1.25+1e-6]} xLabel="LOAD RESISTANCE / kΩ" yLabel="OUTPUT CURRENT / mA" point={[load,d.ic*1000]} description={'Output current is nearly constant at '+f(i0.ic*1000,3)+' milliamps until the load exceeds about '+f(limit,1)+' kilohms, where the transistor saturates.'}/>
 <p className="plot-summary">Region: {d.region}. From a short to this load, the current changes by {f((d.ic/i0.ic-1)*100,2)}%. {htmlSub(early?'With the Early effect, emitter degeneration still keeps the change small: output resistance is roughly r_o(1 + g_mR_E).':'Without the Early effect the active-region current is essentially independent of the load.')} Ebers–Moll transistor, β = 100, ideal stiff base source.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Raise <M t="V_B"/>: more current, but less compliance, because <M t="V_E"/> rises and the load voltage grows. Reduce <M t="R_E"/> to 100 Ω at the same current (lower <M t="V_B"/>): the source becomes more sensitive to <M t="V_BE"/> and temperature.</div></div>;
}

/* ---------- Common-emitter amplifier ---------- */
export function CEAmpLab(){
 const [rck,setRck]=useState(7.5),[re,setRe]=useState(1000),[bypass,setBypass]=useState(false),[mv,setMv]=useState(100);
 const vcc=15,vth=15*10/92,rth=82e3*10e3/92e3,m={betaF:100,va:Infinity};
 const sim=useMemo(()=>{const dc=solveStage({vbb:vth,rb:rth,vcc,rc:rck*1e3,re,...m});
  // An ideal signal source, coupled through a large capacitor, adds v to the quiescent base voltage.
  const at=(v:number)=>bypass?solveStage({vbb:dc.vb+v,rb:0,vcc,rc:rck*1e3,re:0,vee:dc.ve,...m}).vc:solveStage({vbb:dc.vb+v,rb:0,vcc,rc:rck*1e3,re,...m}).vc;
  const wave=pts(t=>at(mv/1000*Math.sin(2*Math.PI*t)),0,2,160);return {dc,wave};},[rck,re,bypass,mv]);
 const {dc,wave}=sim,g=ceGain({ic:dc.ic,rc:rck*1e3,re,bypassed:bypass}),vals=wave.map(p=>p[1]),hi=Math.max(...vals),lo=Math.min(...vals),measured=-(hi-lo)/(2*mv/1000);
 const reset=()=>{setRck(7.5);setRe(1000);setBypass(false);setMv(100)};
 return <div className="lab" aria-label="Common-emitter amplifier experiment"><Head title="GAIN = −R_C / (R_E + r_e)" reset={reset}/>
 <BipolarStage labels={{r1:'82 kΩ',r2:'10 kΩ',rc:engText(rck*1e3,'Ω'),re:engText(re,'Ω')}} coupling bypass={bypass}/>
 <div className="horizontal-controls"><Control label="Collector resistor" value={rck} onChange={setRck} min={0} max={1.3} step={.02} log unit="kΩ"/><Control label="Emitter resistor" value={re} onChange={setRe} min={2} max={3.5} step={.02} log unit="Ω"/><Control label="Input amplitude" value={mv} onChange={setMv} min={0} max={3} step={.02} log unit="mV"/><label className="check"><input type="checkbox" checked={bypass} onChange={e=>setBypass(e.target.checked)}/> Bypass <M t="R_E"/> with a large capacitor</label></div>
 <Readouts values={[['BIAS CURRENT',f(dc.ic*1000,3),'mA'],['SMALL-SIGNAL GAIN',f(g.gain,1),''],['MEASURED GAIN',f(measured,1),'peak-to-peak']]}/>
 <div className="plot-area"><h4>Collector voltage: Ebers–Moll result versus small-signal prediction</h4><Plot curves={[{name:'Collector voltage (Ebers–Moll)',color:green,points:wave},{name:'Linear prediction',color:orange,dashed:true,points:pts(t=>dc.vc+g.gain*mv/1000*Math.sin(2*Math.PI*t),0,2,160)},{name:'Quiescent V_C',color:gray,dashed:true,points:[[0,dc.vc],[2,dc.vc]]}]} xRange={[0,2]} yRange={[0,15]} xLabel="TIME / PERIODS" yLabel="COLLECTOR VOLTAGE / V" description={'Quiescent collector at '+f(dc.vc,2)+' volts; output swings from '+f(lo,2)+' to '+f(hi,2)+' volts.'}/>
 <p className="plot-summary"><M t="V_C"/> rises {f(hi-dc.vc,2)} V and falls {f(dc.vc-lo,2)} V. {Math.abs(measured)<.8*Math.abs(g.gain)?'The output is clipping: it has hit cutoff near 15 V and saturation near the emitter voltage, so the measured gain is far below the small-signal value.':Math.abs((hi-dc.vc)-(dc.vc-lo))>.1*(hi-lo)?'The asymmetry is distortion: the transistor’s exponential law is showing.':'Nearly symmetric: the stage is operating linearly.'} <M t="r_e"/> = {f(g.re,1)} Ω at this bias. Ebers–Moll, β = 100, divider 82 kΩ/10 kΩ on 15 V, coupling and bypass capacitors treated as shorts; an ideal signal source drives the base, so the divider only sets the bias.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Bypass <M t="R_E"/>: the gain jumps from about −7 to nearly −300, and 100 mV in now drives the output into hard clipping. Reduce the input to a few millivolts and look for the remaining asymmetry: that is the exponential.</div></div>;
}

/* ---------- Phase splitter ---------- */
export function PhaseSplitterLab(){
 const [rc,setRc]=useState(4.7),[re,setRe]=useState(4.7),[rlc,setRlc]=useState(1000),[rle,setRle]=useState(1000);
 const ic=(5-.65)/(re*1e3),d=phaseSplitter({ic,rc:rc*1e3,re:re*1e3,rlc:rlc*1e3,rle:rle*1e3}),amp=1;
 const reset=()=>{setRc(4.7);setRe(4.7);setRlc(1000);setRle(1000)};
 return <div className="lab" aria-label="Phase splitter experiment"><Head title="TWO OUTPUTS · OPPOSITE PHASE · DIFFERENT IMPEDANCES" reset={reset}/>
 <BipolarStage labels={{rc:engText(rc*1e3,'Ω'),re:engText(re*1e3,'Ω')}} splitter rlc={engText(rlc*1e3,'Ω')} rle={engText(rle*1e3,'Ω')}/>
 <div className="horizontal-controls"><Control label="Collector resistor" value={rc} onChange={setRc} min={1} max={10} step={.1} unit="kΩ"/><Control label="Emitter resistor" value={re} onChange={setRe} min={1} max={10} step={.1} unit="kΩ"/><Control label="Load on collector output" value={rlc} onChange={setRlc} min={0} max={3} step={.02} log unit="kΩ"/><Control label="Load on emitter output" value={rle} onChange={setRle} min={-1} max={3} step={.02} log unit="kΩ"/></div>
 <Readouts values={[['COLLECTOR GAIN',f(d.collector,3),''],['EMITTER GAIN',f(d.emitter,3),''],['Z_OUT: COLLECTOR / EMITTER',engText(d.zc,'Ω'),'/ '+engText(d.ze,'Ω')]]}/>
 <div className="plot-area"><h4>{Math.abs(d.collector+d.emitter)<.03?'Balanced: equal and opposite':'Unbalanced: the outputs no longer match'}</h4><Plot curves={[{name:'Input (1 V peak)',color:gray,dashed:true,points:pts(t=>amp*Math.sin(2*Math.PI*t),0,2)},{name:'Collector output',color:orange,points:pts(t=>d.collector*amp*Math.sin(2*Math.PI*t),0,2)},{name:'Emitter output',color:green,points:pts(t=>d.emitter*amp*Math.sin(2*Math.PI*t),0,2)}]} xRange={[0,2]} yRange={[-2.5,2.5]} xLabel="TIME / PERIODS" yLabel="AC OUTPUT / V" description={'Collector gain '+f(d.collector,3)+', emitter gain '+f(d.emitter,3)+'.'}/>
 <p className="plot-summary">Bias: base at 5 V on a 15 V supply, <M t="I_C"/> = {f(ic*1000,2)} mA, <M t="r_e"/> = {f(VT300/ic,1)} Ω. Small-signal model; loads are AC-coupled. The emitter output is a follower (low impedance); the collector output looks back into <M t="R_C"/> (high impedance), so the same load disturbs it far more.</p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Load each output with 10 kΩ in turn. The emitter output barely notices; the collector output drops by about a third. Then make <M t="R_C"/> slightly larger than <M t="R_E"/> to compensate a known collector load.</div></div>;
}

/* ---------- Ebers–Moll ---------- */
export function EbersMollLab(){
 const [iba,setIba]=useState(20),[rc,setRc]=useState(1000),[va,setVa]=useState(100),[zoom,setZoom]=useState(false);
 const vcc=12,m={betaF:150,betaR:2,va},end=zoom?1:vcc,family=[5,10,20,40,60];
 const curves=useMemo(()=>family.map(ib=>pts(v=>outputCurve({ib:ib*1e-6,vce:v,...m}).ic*1000,0,end,zoom?60:48)),[va,zoom]);
 const sel=useMemo(()=>pts(v=>outputCurve({ib:iba*1e-6,vce:v,...m}).ic*1000,0,end,zoom?60:48),[iba,va,zoom]);
 const d=solveStage({vbb:iba*1e-6*1e9+.7,rb:1e9,vcc,rc,...m}),ymax=zoom?Math.max(...sel.map(p=>p[1]))*1.2:Math.max(14,150*60e-3*(1+12/va)*1.1);
 const reset=()=>{setIba(20);setRc(1000);setVa(100);setZoom(false)};
 return <div className="lab" aria-label="Ebers–Moll output characteristics"><Head title="THE REAL CURVES: KNEE, SLOPE AND SATURATION" reset={reset}/>
 <div className="view-buttons" role="group" aria-label="Axis range"><button aria-pressed={!zoom} onClick={()=>setZoom(false)}>Full range 0–12 V</button><button aria-pressed={zoom} onClick={()=>setZoom(true)}>Saturation region 0–1 V</button></div>
 <div className="horizontal-controls"><Control label="Forced base current" value={iba} onChange={setIba} min={0} max={2} step={.02} log unit="µA"/><Control label="Collector load (to 12 V)" value={rc} onChange={setRc} min={2} max={4.3} step={.02} log unit="Ω"/><Control label="Early voltage V_A" value={va} onChange={setVa} min={1} max={3} step={.02} log unit="V"/></div>
 <Readouts values={[['V_CE',d.vce<1?f(d.vce*1000,0):f(d.vce,2),d.vce<1?'mV':'V'],['I_C',...eng(d.ic,'A')],['FORCED β = I_C/I_B',f(d.ic/d.ib,1),d.region]]}/>
 <div className="plot-area"><h4>{htmlSub(zoom?'Saturation: both junctions forward-biased':'Active region: nearly flat lines that slope toward −V_A')}</h4><Plot curves={[{name:'I_B = 5, 10, 20, 40, 60 µA',color:gray,dashed:true,points:curves.flatMap(c=>[...c,[NaN,NaN] as [number,number]])},{name:'Selected I_B',color:green,points:sel},{name:'Load line',color:orange,points:[[0,vcc/rc*1000],[vcc,0]]}]} xRange={[0,end]} yRange={[0,ymax]} xLabel="COLLECTOR–EMITTER VOLTAGE / V" yLabel="COLLECTOR CURRENT / mA" point={[d.vce,d.ic*1000]} description={'Output characteristics from the Ebers–Moll model. Operating point '+f(d.vce,3)+' volts, '+f(d.ic*1000,3)+' milliamps, region '+d.region+'.'}/>
 <p className="plot-summary"><M t="β_F"/> = 150, <M t="β_R"/> = 2, <M t="I_S"/> = 10 fA, Early voltage {f(va,0)} V applied to the transport current. In saturation the forced β falls below <M t="β_F"/> and <M t="V_CE"/> settles at a few tens to a couple of hundred millivolts, set by how hard the base is overdriven. </p></div>
 <div className="lab-prompt"><strong>Explore.</strong> Zoom into the saturation region and raise the base current: <M t="V_CE"/>(sat) falls as the forced β drops. Lower <M t="V_A"/> to 20 V and the active-region lines tilt steeply—the Early effect that limits single-stage gain.</div></div>;
}
