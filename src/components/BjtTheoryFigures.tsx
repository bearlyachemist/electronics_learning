import Plot from './Plot';
import * as S from './Schematic';
import {BipolarStage,CurrentSinkCircuit,HybridPiCircuit,FollowerRegulatorCircuit,SimpleMirrorCircuit} from './BipolarCircuits';
import {bjtPhysics,vbeTemperature,VT300,dividerBias,smallSignal,ceGain,phaseSplitter} from '../engine/bjt.mjs';
import {logspace} from './Parts';
const xs=(a:number,b:number,n=240)=>Array.from({length:n+1},(_,k)=>a+(b-a)*k/n);

export function CarrierProfileFigure(){
 return <S.Figure plot caption="Exact steady minority-carrier profiles with a collecting boundary at x = W, normalized to the injected excess. A base much shorter than a diffusion length is nearly linear; a longer base loses more carriers to recombination. The straight dashed line is the short-base approximation.">
 <Plot curves={[...[.1,1,3].map((r,i)=>({name:'W/L_n = '+r,color:[S.green,S.orange,S.ink][i],points:xs(0,1).map(x=>[x,Math.sinh(r*(1-x))/Math.sinh(r)] as [number,number])})),{name:'Short-base line',color:S.gray,dashed:true,points:[[0,1],[1,0]]}]} xRange={[0,1]} yRange={[0,1.05]} xLabel="DISTANCE / BASE WIDTH" yLabel="EXCESS DENSITY / INJECTED DENSITY" description="Normalized minority carrier profiles become increasingly curved as base width approaches or exceeds the diffusion length."/>
 </S.Figure>;
}
export function TransportStructureFigure(){
 return <S.Figure caption="An NPN cross-section in forward active operation. Electrons diffuse across the neutral P base, then drift through the collector depletion field. The conventional collector current points in the opposite direction. Regions are schematic, not to scale.">
 <S.Schematic height={250} description="Heavily doped N emitter, narrow P base, collector depletion region and lightly doped N collector. Electron motion from emitter to collector; conventional current from collector to emitter.">
 <rect x="45" y="70" width="160" height="90" fill="#dcece5"/><rect x="205" y="70" width="150" height="90" fill="#efe5d6"/><rect x="355" y="70" width="100" height="90" fill="var(--paper)" stroke={S.orange} strokeDasharray="4 3"/><rect x="455" y="70" width="140" height="90" fill="#dcece5"/>
 <S.Text x={125} y={50} anchor="middle">N⁺ emitter</S.Text><S.Text x={280} y={50} anchor="middle">P base</S.Text><S.Text x={525} y={50} anchor="middle">N collector</S.Text>
 <path d="M90 195 H560 m-8 -5 l8 5 l-8 5 M560 220 H90 m8 -5 l-8 5 l8 5" fill="none" stroke={S.green} strokeWidth="1.8"/>
 <S.Text x={280} y={185} kind="value">electrons →</S.Text><S.Text x={390} y={245} kind="value">← conventional current</S.Text><S.Text x={405} y={100} anchor="middle" kind="value">collector</S.Text><S.Text x={405} y={122} anchor="middle" kind="value">field</S.Text>
 </S.Schematic></S.Figure>;
}
export function BaseWidthFigure(){
 return <S.Figure plot caption="Thin-base gain estimate versus neutral base width, with the chapter’s fixed doping and emitter geometry. Back-injection contributes a term proportional to W; recombination contributes W². Thin bases improve gain and transit time, but leave less margin against depletion-region punch-through.">
 <Plot curves={[{name:'β, both loss terms',color:S.green,points:xs(.1,1.2).map(w=>[w,1/(2.6e-4*1e23*w*1e-6/(2e-3*1e25*.3e-6)+(w/14)**2/2)])},{name:'Back-injection only',color:S.gray,dashed:true,points:xs(.1,1.2).map(w=>[w,1/(2.6e-4*1e23*w*1e-6/(2e-3*1e25*.3e-6))])}]} xRange={[.1,1.2]} yRange={[0,2500]} xLabel="NEUTRAL BASE WIDTH / µm" yLabel="CURRENT GAIN β" description="Current gain rises as neutral base width decreases. Recombination lowers the gain below a model containing only emitter back-injection."/>
 </S.Figure>;
}
export function EarlyProfileFigure(){
 const ds=[0,5,20].map(vcb=>bjtPhysics({vcb}));
 return <S.Figure plot caption="At the same base–emitter voltage, increasing collector reverse bias narrows the neutral base. The injected edge density is almost unchanged; the steeper profile produces more collector current. The concentration and width here use the chapter’s default physics model.">
 <Plot curves={ds.map((d,i)=>({name:'V_CB = '+[0,5,20][i]+' V',color:[S.gray,S.green,S.orange][i],points:[[0,1],[d.w*1e6,0]]}))} xRange={[0,.8]} yRange={[0,1.05]} xLabel="DISTANCE INTO NEUTRAL BASE / µm" yLabel="DENSITY / EMITTER-EDGE DENSITY" description="Three linear carrier profiles of equal height but decreasing width for collector-base voltages 0, 5 and 20 volts."/>
 </S.Figure>;
}
export function JunctionTemperatureFigure(){
 return <S.Figure plot caption="Base–emitter voltage at fixed collector current, using the chapter’s simplified temperature law. Each curve starts at its labeled voltage at 300 K. The slope depends on current and the device model; −2.1 mV/°C is a useful local estimate, not a universal constant.">
 <Plot curves={[.6,.65,.7].map((v,i)=>({name:'V_BE at 300 K = '+v+' V',color:[S.gray,S.green,S.orange][i],points:xs(-25,100).map(t=>[t,vbeTemperature({vbe0:v,t:t+273.15})] as [number,number])}))} xRange={[-25,100]} yRange={[.4,.85]} xLabel="TEMPERATURE / °C" yLabel="V_BE AT FIXED CURRENT / V" description="At fixed collector current, three transistor junction voltage curves decline by roughly two millivolts per degree with temperature."/>
 </S.Figure>;
}
export function FollowerLoadingFigure(){
 const rs=logspace(1,5),r=500,gm=.01/VT300;
 return <S.Figure plot caption="Source-to-emitter small-signal gain into 500 Ω at a 10 mA collector bias. The follower transforms impedance, but finite β still loads the source. A larger source resistance or a smaller β reduces overall gain, even if base-to-emitter gain is close to one.">
 <Plot curves={[50,100,200].map((beta,i)=>{const rpi=beta/gm,zin=rpi+(beta+1)*r,a=(beta+1)*r/zin;return {name:'β = '+beta,color:[S.orange,S.green,S.gray][i],points:rs.map(x=>[x,a*zin/(zin+x)] as [number,number])}})} xRange={[10,1e5]} yRange={[0,1]} xScale="log" xLabel="SOURCE RESISTANCE / Ω" yLabel="SOURCE-TO-EMITTER GAIN" description="Overall follower gain declines as source resistance grows, with the greatest decline for beta 50 and the least for beta 200."/>
 </S.Figure>;
}
export function FollowerRegulatorFigure(){return <S.Figure caption="The zener supplies base drive; the transistor supplies load current from the input rail. Budget zener current at minimum input and maximum load, then check zener heating at maximum input and minimum load."><FollowerRegulatorCircuit/></S.Figure>}
export function DividerBiasFigure(){return <S.Figure caption="The divider establishes a base Thévenin voltage and resistance; the emitter resistor provides DC negative feedback. Collector voltage is a consequence of current and load, so check the full operating point rather than the divider voltage alone."><BipolarStage/></S.Figure>}
export function BiasSpreadFigure(){
 return <S.Figure plot caption="The 82 kΩ / 10 kΩ divider, 1 kΩ emitter resistor and 7.5 kΩ collector resistor on 15 V, in the fixed-junction-voltage model. Temperature shifts the current even when β dependence is modest. A stable design budgets both effects.">
 <Plot curves={[25,85].map((temp,i)=>({name:temp+' °C',color:[S.green,S.orange][i],points:xs(25,500).map(beta=>[beta,dividerBias({beta,temp,r1:82e3,r2:10e3}).ic*1e3] as [number,number])}))} xRange={[25,500]} yRange={[0,1.5]} xLabel="CURRENT GAIN β" yLabel="COLLECTOR CURRENT / mA" description="Divider-biased collector current varies moderately with beta and shifts upward at 85 degrees Celsius."/>
 </S.Figure>;
}
export function HybridPiFigure(){return <S.Figure caption="The low-frequency hybrid-π model: $r_π$ between base and emitter, a dependent current source $g_m v_{be}$ from collector to emitter, and $r_o$ representing Early-effect output conductance. These are incremental quantities at one bias point."><HybridPiCircuit/></S.Figure>}
export function IntrinsicParametersFigure(){
 const cs=logspace(-2,1);
 return <S.Figure plot caption="Bias sets the small-signal parameters. Ten times the current gives ten times the transconductance and one tenth the intrinsic emitter resistance. These ideal low-frequency trends do not include high-current effects or package resistance.">
 <div className="split-plots"><Plot curves={[{name:'g_m at 300 K',color:S.green,points:cs.map(c=>[c,smallSignal({ic:c*1e-3}).gm*1e3])}]} xRange={[.01,10]} yRange={[.1,1e3]} xScale="log" yScale="log" xLabel="I_C / mA" yLabel="TRANSCONDUCTANCE / mS" description="Transconductance increases linearly with collector bias current on logarithmic axes."/><Plot curves={[{name:'r_e ≈ V_T/I_C',color:S.orange,points:cs.map(c=>[c,VT300/(c*1e-3)])}]} xRange={[.01,10]} yRange={[1,1e4]} xScale="log" yScale="log" xLabel="I_C / mA" yLabel="INTRINSIC RESISTANCE / Ω" description="Intrinsic emitter resistance falls inversely with collector bias current."/></div>
 </S.Figure>;
}
export function CurrentSinkFigure(){return <S.Figure caption="The base reference and emitter resistor set approximately $(V_B-V_{BE})/R_E$ emitter current. The collector current is slightly smaller. The load must leave enough collector voltage for active operation, and transistor power rises as load resistance falls."><CurrentSinkCircuit/></S.Figure>}
export function CurrentComplianceFigure(){
 return <S.Figure plot caption="A 2 V base reference and 1 kΩ emitter resistor set about 1.35 mA. On 15 V, the ideal constant-current region ends near a 10 kΩ load; beyond it the load and transistor headroom limit current. The fixed-drop approximation makes a sharp knee; the lab’s exponential model rounds it.">
 <Plot curves={[{name:'First-model collector current, β = 100',color:S.green,points:xs(0,20).map(r=>[r,Math.min(100/101*1.35,(15-.2)/(r+1.01))])}]} xRange={[0,20]} yRange={[0,1.5]} xLabel="LOAD RESISTANCE / kΩ" yLabel="COLLECTOR CURRENT / mA" description="Current remains near 1.337 milliamps until the load approaches ten kilohms, then falls as headroom is exhausted."/>
 </S.Figure>;
}
export function CommonEmitterFigure(){return <S.Figure caption="A complete common-emitter stage: divider for DC bias, emitter resistance for feedback, and coupling capacitors to separate adjacent bias voltages. A bypass capacitor changes AC degeneration while retaining the emitter resistor for DC."><BipolarStage coupling bypass/></S.Figure>}
export function DegeneratedGainFigure(){
 const cs=logspace(-2,1);
 return <S.Figure plot caption="Small-signal gain magnitude for a 4.7 kΩ collector load. With no external emitter degeneration, gain scales with bias current. With 1 kΩ degeneration it approaches 4.7. Only bias points with adequate collector headroom can realize the plotted gain in a real supply circuit.">
 <Plot curves={[false,true].map((bypassed,i)=>({name:bypassed?'Emitter resistor bypassed':'1 kΩ degeneration',color:[S.green,S.orange][i],points:cs.map(ic=>[ic,Math.abs(ceGain({ic:ic*1e-3,rc:4.7e3,re:1e3,bypassed}).gain)] as [number,number])}))} xRange={[.01,10]} yRange={[.1,1e4]} xScale="log" yScale="log" xLabel="BIAS I_C / mA" yLabel="SMALL-SIGNAL GAIN MAGNITUDE" description="Bypassed common-emitter gain rises with current; emitter degeneration limits gain to approximately the resistor ratio."/>
 </S.Figure>;
}
export function PhaseSplitterFigure(){return <S.Figure caption="A phase splitter with a stiff 5 V base bias. Collector and emitter signals have opposite signs; their loads are AC-coupled so the DC bias remains separate. Equal resistor values give equal gain only when the loads do not disturb the balance."><BipolarStage labels={{rc:'4.7 kΩ',re:'4.7 kΩ'}} splitter rlc="10 kΩ" rle="1 MΩ"/></S.Figure>}
export function SplitterLoadingFigure(){
 const rs=logspace(0,3),ic=(5-.65)/4.7e3;
 return <S.Figure plot caption="With a load only on the collector, its gain is reduced while the emitter still follows. Plot uses 4.7 kΩ resistors and the chapter’s small-signal model. Loading the emitter instead would also change collector gain because it changes the signal emitter current.">
 <Plot curves={[{name:'|Collector gain|',color:S.orange,points:rs.map(r=>[r,Math.abs(phaseSplitter({ic,rlc:r*1e3}).collector)])},{name:'Emitter gain',color:S.green,dashed:true,points:rs.map(r=>[r,phaseSplitter({ic,rlc:r*1e3}).emitter])}]} xRange={[1,1000]} yRange={[0,1.05]} xScale="log" xLabel="COLLECTOR LOAD / kΩ" yLabel="GAIN MAGNITUDE" description="Collector gain approaches unity only for large load resistances; emitter gain remains close to unity."/>
 </S.Figure>;
}
export function SaturationDriveFigure(){
 return <S.Figure plot caption="Ideal Ebers–Moll saturation voltage for $β_F = 150$ and $β_R = 2$, neglecting ohmic resistance. Stronger base drive means a smaller forced β and a smaller collector–emitter voltage. Device series resistance and stored charge matter in practical switches.">
 <Plot curves={[{name:'V_CE(sat), ideal transport model',color:S.green,points:xs(1,100).map(b=>[b,VT300*Math.log((1.5+b/2)/(1-b/150))*1e3])}]} xRange={[1,100]} yRange={[0,160]} xLabel="FORCED β = I_C/I_B" yLabel="V_CE(sat) / mV" description="Ideal saturation voltage increases with forced beta, from a few tens of millivolts to about 130 millivolts."/>
 </S.Figure>;
}
export function MirrorFigure(){return <SimpleMirrorCircuit caption/>}
