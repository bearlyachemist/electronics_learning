// AC teaching figures. All circuits use pin-to-pin wiring; all plots render at build time.
import Plot from './Plot';
import * as S from './Schematic';
import {PhasorDiagram,logspace,green,orange,gray,ink} from './Parts';
import {polar,mag,db,rcResponse,loadedRC,correction,rcCascade,secondOrderStep} from '../engine/ac.mjs';
const pts=(fn:(x:number)=>number,a:number,b:number,n=240):[number,number][]=>Array.from({length:n+1},(_,k)=>{const x=a+(b-a)*k/n;return [x,fn(x)]});

export function EulerFigure(){
 const z=polar(1,35);
 return <S.Figure caption="The unit phasor at 35°. Its horizontal projection is cos θ and its vertical projection is sin θ. Multiplication by j rotates it by 90°; multiplication by a unit phasor rotates it by that phasor’s angle.">
 <PhasorDiagram vectors={[{re:z.re,im:0,color:green,label:'cos θ'},{re:0,im:z.im,from:{re:z.re,im:0},color:orange,label:'j sin θ'},{...z,color:ink,label:'Unit phasor',side:-1}]} circle={1} scale={1.15} description="A unit phasor at 35 degrees decomposed into horizontal cosine and vertical sine components."/>
 </S.Figure>;
}
export function PhaseTimingFigure(){
 return <S.Figure plot caption="At 1 kHz a +45° phase leads by 125 µs: its peak occurs earlier. The derivative of cos(ωt), divided by ω, leads by 90°. Phase is an angle; time shift also depends on frequency.">
 <Plot curves={[{name:'Reference: cos(ωt)',color:ink,points:pts(t=>Math.cos(2*Math.PI*t),-.5,1.5)},{name:'Lead: cos(ωt + 45°)',color:green,points:pts(t=>Math.cos(2*Math.PI*t+Math.PI/4),-.5,1.5)},{name:'Derivative / ω',color:orange,dashed:true,points:pts(t=>-Math.sin(2*Math.PI*t),-.5,1.5)}]} xRange={[-.5,1.5]} yRange={[-1.1,1.1]} xLabel="TIME / ms · 1 kHz" yLabel="NORMALIZED VOLTAGE" description="Three normalized sinusoids at 1 kilohertz: reference, 45 degree lead, and derivative leading by 90 degrees."/>
 </S.Figure>;
}
export function CancellationFigure(){
 return <S.Figure plot caption="The amplitude of two same-frequency signals depends on their relative phase. Equal 1 V peak signals cancel at 180°; unequal 1 V and 0.8 V signals leave 0.2 V. The plotted amplitudes are peak values throughout.">
 <Plot curves={[{name:'1 V + 1 V',color:green,points:pts(p=>Math.hypot(1+Math.cos(p*Math.PI/180),Math.sin(p*Math.PI/180)),0,180)},{name:'1 V + 0.8 V',color:orange,points:pts(p=>Math.hypot(1+.8*Math.cos(p*Math.PI/180),.8*Math.sin(p*Math.PI/180)),0,180)}]} xRange={[0,180]} xTicks={[0,45,90,135,180]} yRange={[0,2.1]} xLabel="RELATIVE PHASE / DEGREES" yLabel="SUM AMPLITUDE / V PEAK" description="Equal-amplitude signals sum from 2 volts at zero phase to zero at 180 degrees. A 20 percent amplitude mismatch prevents complete cancellation."/>
 </S.Figure>;
}
export function ReactanceFigure(){
 const fr=logspace(1,6);
 return <S.Figure plot caption="Ideal reactance magnitudes: $X_L = 2πfL$ rises and $X_C = 1/(2πfC)$ falls. For 10 mH and 1 µF they cross at 1.59 kHz and 100 Ω. Capacitive impedance has a negative imaginary part even though its magnitude is positive.">
 <Plot curves={[{name:'X_L · L = 10 mH',color:orange,points:fr.map(v=>[v,2*Math.PI*v*.01])},{name:'X_C magnitude · C = 1 µF',color:green,points:fr.map(v=>[v,1/(2*Math.PI*v*1e-6)])}]} xRange={[10,1e6]} yRange={[.1,1e7]} xScale="log" yScale="log" xLabel="FREQUENCY / Hz · LOG" yLabel="REACTANCE MAGNITUDE / Ω" description="Logarithmic reactance curves crossing at 1.59 kilohertz, 100 ohms."/>
 </S.Figure>;
}
export function RlcImpedanceFigure(){
 return <S.Figure caption="At 1.59 kHz, the 10 mH inductor and 1 µF capacitor contribute +j100 Ω and −j100 Ω. They cancel in the total impedance, leaving 100 Ω. Each component still has voltage across it and stores energy.">
 <S.Schematic height={245} description="One volt AC source driving series 100 ohms, 10 millihenries and 1 microfarad, at their resonant frequency of 1.59 kilohertz.">
 <S.Source kind="ac" a={[80,185]} b={[80,105]} label="1 V RMS"/><S.Wire pts={[[80,105],[80,55],[165,55]]}/><S.Res a={[165,55]} b={[265,55]} label="100 Ω" value="V_R = 1 V"/>
 <S.Wire pts={[[265,55],[300,55]]}/><S.Ind a={[300,55]} b={[400,55]} label="10 mH" value="V_L = +j1 V"/><S.Wire pts={[[400,55],[485,55]]}/>
 <S.Cap a={[485,55]} b={[485,205]} label="1 µF" value="V_C = −j1 V"/><S.Wire pts={[[485,205],[80,205],[80,185]]}/><S.CurrentArrow at={[145,55]} dir="right"/>
 <S.Text x={170} y={152} kind="value">Z = 100 Ω; I = 10 mA RMS</S.Text><S.Text x={170} y={177} kind="value">V_R + V_L + V_C = 1 V RMS</S.Text>
 </S.Schematic></S.Figure>;
}
export function AdmittanceFigure(){
 return <S.Figure caption="Parallel RC with 1 V RMS across 1 kΩ and 1 µF at 159 Hz: the resistor draws 1 mA in phase, the capacitor draws 1 mA leading by 90°, and the source supplies √2 mA at +45°. Add branch currents or admittances, rather than impedance magnitudes.">
 <PhasorDiagram vectors={[{re:1,im:0,color:ink,label:'I_R',side:-1},{re:0,im:1,from:{re:1,im:0},color:orange,label:'I_C'},{re:1,im:1,color:green,label:'I_total',side:-1}]} scale={1.7} xLabel="Re I / mA" yLabel="Im I / mA" description="Parallel RC current triangle: one milliamp resistor current plus one milliamp capacitive current gives 1.414 milliamps leading by 45 degrees."/>
 </S.Figure>;
}
export function ReactiveEnergyFigure(){
 return <S.Figure plot caption="An ideal 1 µF capacitor driven by 10 V RMS at 1 kHz stores up to 100 µJ. Its power changes sign twice per cycle as energy enters and leaves. Stored energy stays nonnegative, while average power is zero.">
 <Plot curves={[{name:'Stored energy / 100 µJ',color:green,points:pts(t=>Math.cos(2*Math.PI*t)**2,0,2)},{name:'Power / 0.628 W',color:orange,points:pts(t=>-Math.sin(4*Math.PI*t),0,2)}]} xRange={[0,2]} yRange={[-1.1,1.1]} xLabel="TIME / ms · 1 kHz" yLabel="NORMALIZED ENERGY AND POWER" description="Capacitor stored energy follows cosine squared; instantaneous power is its derivative, alternating positive and negative with zero cycle average."/>
 </S.Figure>;
}
export function CorrectionCurrentFigure(){
 const d=(c:number)=>correction({vrms:230,hz:50,r:20,l:.05,c:c*1e-6}),ideal=d(0).ideal*1e6;
 return <S.Figure plot caption="For 20 Ω + 50 mH on 230 V RMS at 50 Hz, correction is optimal near 77.3 µF. Line current falls from 9.04 A to 7.11 A. More capacitance makes the line current rise again with leading power factor; the load current stays 9.04 A.">
 <Plot curves={[{name:'Line current',color:green,points:pts(c=>mag(d(c).line),0,180)},{name:'Load current',color:orange,dashed:true,points:[[0,mag(d(0).load)],[180,mag(d(0).load)]]}]} xRange={[0,180]} yRange={[0,12]} xLabel="SHUNT CAPACITANCE / µF" yLabel="RMS CURRENT / A" point={[ideal,mag(d(ideal).line)]} pointLabel="Unity power factor" description="Line current versus correction capacitance has a minimum of 7.11 amperes near 77.3 microfarads; the fixed load current is 9.04 amperes."/>
 </S.Figure>;
}
export function DividerFigure(){
 return <S.Figure caption="The generalized divider: $V_{out} = V_{in}Z_2/(Z_1 + Z_2)$. The boxes stand for arbitrary two-terminal impedances evaluated at the same frequency. Connect a load by replacing $Z_2$ with $Z_2 ∥ Z_L$.">
 <S.Schematic height={245} description="AC source through impedance Z1 to output; impedance Z2 from output to return.">
 <S.Source kind="ac" a={[95,185]} b={[95,105]} label="V_in"/><S.Wire pts={[[95,105],[95,55],[210,55]]}/><S.Res a={[210,55]} b={[330,55]} label="Z_1"/>
 <S.Wire pts={[[330,55],[445,55],[525,55]]}/><S.Terminal at={[525,55]} label="V_out" side="above"/><S.Res a={[445,55]} b={[445,205]} label="Z_2"/>
 <S.Dot at={[445,55]} color={green}/><S.Wire pts={[[445,205],[95,205],[95,185]]}/><S.Ground at={[270,205]}/><S.Dot at={[270,205]}/>
 </S.Schematic></S.Figure>;
}
export function FilterPairFigure(){
 return <S.Figure caption="Low-pass takes the voltage across C; high-pass takes it across R. The source is ideal and outputs are unloaded. Swapping the two parts preserves RC and the corner frequency, but changes the limits at DC and high frequency.">
 <S.Schematic height={255} description="Side by side: series resistor and shunt capacitor low-pass; series capacitor and shunt resistor high-pass.">
 {[0,320].map((dx,i)=><g key={i}>
 <S.Text x={dx+165} y={25} anchor="middle" kind="value">{i?'HIGH-PASS':'LOW-PASS'}</S.Text>
 <S.Source kind="ac" a={[dx+65,180]} b={[dx+65,100]}/><S.Wire pts={[[dx+65,100],[dx+65,65],[dx+120,65]]}/>
 {i?<S.Cap a={[dx+120,65]} b={[dx+215,65]} label="C"/>:<S.Res a={[dx+120,65]} b={[dx+215,65]} label="R"/>}
 <S.Wire pts={[[dx+215,65],[dx+250,65],[dx+290,65]]}/><S.Terminal at={[dx+290,65]} label="V_out" side="above"/>
 {i?<S.Res a={[dx+250,65]} b={[dx+250,205]} label="R"/>:<S.Cap a={[dx+250,65]} b={[dx+250,205]} label="C"/>}
 <S.Wire pts={[[dx+250,205],[dx+65,205],[dx+65,180]]}/><S.Dot at={[dx+250,65]} color={green}/><S.Ground at={[dx+150,205]}/><S.Dot at={[dx+150,205]}/>
 </g>)}
 </S.Schematic></S.Figure>;
}
export function FilterLoadingFigure(){
 const fr=logspace(1,5);
 return <S.Figure plot caption="A 10 kΩ / 10 nF low-pass is loaded by 10 kΩ: DC gain falls to −6.02 dB and its pole rises from 1.59 to 3.18 kHz. Adding 1 kΩ source resistance gives −6.44 dB DC gain and a 3.04 kHz pole. Every curve is relative to the same source voltage.">
 <Plot curves={[{name:'Unloaded, ideal source',color:gray,dashed:true,points:fr.map(hz=>[hz,db(loadedRC({hz}))])},{name:'10 kΩ load',color:green,points:fr.map(hz=>[hz,db(loadedRC({hz,rl:1e4}))])},{name:'Load + 1 kΩ source',color:orange,points:fr.map(hz=>[hz,db(loadedRC({hz,r:11e3,rl:1e4}))])}]} xRange={[10,1e5]} yRange={[-40,0]} xScale="log" xLabel="FREQUENCY / Hz" yLabel="GAIN / dB" description="Loaded low-pass response starts six decibels below the unloaded response and has a higher pole frequency; finite source resistance produces additional loss."/>
 </S.Figure>;
}
export function DecibelFigure(){
 const fr=logspace(0,4);
 return <S.Figure plot caption="One, two, and three independent poles at 100 Hz. Their eventual slopes are −20, −40, and −60 dB/decade; at 100 Hz their gains are −3.01, −6.02, and −9.03 dB. These responses require isolation between stages.">
 <Plot curves={[1,2,3].map((n,i)=>({name:n+' buffered pole'+(n>1?'s':''),color:[green,orange,ink][i],points:fr.map(hz=>[hz,n*db(rcResponse({hz,fc:100}))] as [number,number])}))} xRange={[1,1e4]} yRange={[-100,0]} xScale="log" xLabel="FREQUENCY / Hz" yLabel="GAIN / dB" description="Stacking independent RC poles steepens the high-frequency slope but adds loss at the individual section corner."/>
 </S.Figure>;
}
export function CascadeCircuitFigure(){
 return <S.Figure caption="Two directly connected RC stages. To scale the second stage without moving its own RC corner, use $R_2 = kR_1$ and $C_2 = C_1/k$. Larger k reduces its loading on the first stage; the source is ideal and the final output is unloaded.">
 <S.Schematic height={270} description="Two passive low-pass sections in cascade without a buffer: R1 series, C1 shunt, R2 series, C2 shunt.">
 <S.Source kind="ac" a={[70,195]} b={[70,115]}/><S.Wire pts={[[70,115],[70,60],[140,60]]}/><S.Res a={[140,60]} b={[230,60]} label="R_1"/>
 <S.Wire pts={[[230,60],[320,60]]}/><S.Cap a={[275,60]} b={[275,225]} label="C_1" flipLabel/><S.Dot at={[275,60]}/>
 <S.Res a={[320,60]} b={[420,60]} label="R_2 = k R_1"/><S.Wire pts={[[420,60],[515,60],[590,60]]}/><S.Cap a={[515,60]} b={[515,225]} label="C_2 = C_1/k" flipLabel/>
 <S.Terminal at={[590,60]} label="V_out" side="above"/><S.Dot at={[515,60]} color={green}/><S.Wire pts={[[515,225],[70,225],[70,195]]}/><S.Dot at={[275,225]}/><S.Ground at={[390,225]}/><S.Dot at={[390,225]}/>
 </S.Schematic></S.Figure>;
}
export function CascadeLoadingFigure(){
 const fr=logspace(-1,2);
 return <S.Figure plot caption="At the isolated section corner, equal unbuffered stages give −9.54 dB, stages scaled by k = 10 give −6.44 dB, and ideal buffering gives −6.02 dB. Their eventual slopes agree; their poles and response near the corner differ.">
 <Plot curves={[{name:'Buffered',color:gray,dashed:true,points:fr.map(x=>[x,db(rcCascade({hz:x,tau:1/(2*Math.PI),buffered:true}))])},...[1,10].map((k,i)=>({name:'Unbuffered, k = '+k,color:[orange,green][i],points:fr.map(x=>[x,db(rcCascade({hz:x,tau:1/(2*Math.PI),k}))] as [number,number])}))]} xRange={[.1,100]} yRange={[-80,0]} xScale="log" xLabel="FREQUENCY / ISOLATED CORNER" yLabel="GAIN / dB" description="Comparison of buffered, equal unbuffered, and impedance-scaled RC cascades. Equal unbuffered stages lose an extra 3.52 decibels at the isolated corner."/>
 </S.Figure>;
}
export function TwinTFigure(){
 return <S.Figure caption="The twin-T has two parallel signal paths: R–R with a 2C shunt, and C–C with an R/2 shunt. The ratios are essential to cancellation. The input source should have low impedance and the output load high impedance.">
 <S.Schematic height={375} description="Twin-T notch: two series R resistors with shunt 2C at their midpoint, in parallel with two series C capacitors with shunt R over 2 at their midpoint.">
 <S.Terminal at={[60,60]} label="V_in" side="above"/><S.Wire pts={[[60,60],[110,60]]}/><S.Res a={[110,60]} b={[210,60]} label="R"/>
 <S.Wire pts={[[210,60],[290,60]]}/><S.Res a={[290,60]} b={[390,60]} label="R"/><S.Wire pts={[[390,60],[560,60]]}/><S.Terminal at={[560,60]} label="V_out" side="above"/>
 <S.Cap a={[250,60]} b={[250,170]} label="2C"/><S.Dot at={[250,60]}/><S.Ground at={[250,170]}/>
 <S.Wire pts={[[60,60],[60,240],[110,240]]}/><S.Cap a={[110,240]} b={[210,240]} label="C"/>
 <S.Wire pts={[[210,240],[390,240]]}/><S.Cap a={[390,240]} b={[490,240]} label="C"/><S.Wire pts={[[490,240],[560,240],[560,60]]}/>
 <S.Res a={[300,240]} b={[300,330]} label="R/2"/><S.Ground at={[300,330]}/><S.Dot at={[300,240]}/><S.Dot at={[60,60]}/><S.Dot at={[560,60]} color={green}/>
 </S.Schematic></S.Figure>;
}
export function ShelfFigure(){
 return <S.Figure caption="A shelf: $R_1 = 9$ kΩ in series, with a shunt branch of $R_2 = 1$ kΩ and C = 100 nF. At DC the capacitor opens and gain is 1; at high frequency it shorts and gain approaches 0.1. The pole at 159 Hz and zero at 1.59 kHz limit the falling interval.">
 <S.Schematic height={300} description="AC source through 9 kilohms to output, with series 1 kilohm and 100 nanofarad capacitor from output to return.">
 <S.Source kind="ac" a={[95,235]} b={[95,155]} label="V_in"/><S.Wire pts={[[95,155],[95,55],[210,55]]}/><S.Res a={[210,55]} b={[330,55]} label="R_1 = 9 kΩ"/>
 <S.Wire pts={[[330,55],[455,55],[550,55]]}/><S.Terminal at={[550,55]} label="V_out" side="above"/><S.Dot at={[455,55]} color={green}/>
 <S.Res a={[455,55]} b={[455,155]} label="R_2 = 1 kΩ"/><S.Cap a={[455,155]} b={[455,255]} label="100 nF"/>
 <S.Wire pts={[[455,255],[95,255],[95,235]]}/><S.Ground at={[270,255]}/><S.Dot at={[270,255]}/>
 </S.Schematic></S.Figure>;
}
export function TankFigure(){
 return <S.Figure caption="Series resonance gives a low impedance, approximately r. Parallel resonance gives a high impedance, approximately L/(rC) for a high-Q winding. The inductor’s series resistance r is placed explicitly so the two topologies cannot be confused.">
 <S.Schematic height={300} description="Left: series r, L, C between two terminals. Right: winding r plus L in one branch in parallel with capacitor C.">
 <S.Terminal at={[65,50]} label="a" side="above"/><S.Res a={[65,50]} b={[65,135]} label="r"/><S.Ind a={[65,135]} b={[65,225]} label="L"/>
 <S.Wire pts={[[65,225],[220,225]]}/><S.Cap a={[220,225]} b={[220,50]} label="C"/><S.Terminal at={[220,50]} label="b" side="above"/>
 <S.Text x={145} y={280} anchor="middle" kind="value">SERIES · low impedance</S.Text>
 <S.Terminal at={[460,35]} label="a" side="above"/><S.Wire pts={[[460,35],[460,65]]}/><S.Wire pts={[[390,65],[555,65]]}/><S.Dot at={[460,65]}/>
 <S.Res a={[390,65]} b={[390,145]} label="r" flipLabel/><S.Ind a={[390,145]} b={[390,225]} label="L" flipLabel/><S.Cap a={[555,65]} b={[555,225]} label="C"/>
 <S.Wire pts={[[390,225],[555,225]]}/><S.Wire pts={[[460,225],[460,245]]}/><S.Terminal at={[460,245]} label="b" side="right"/><S.Dot at={[460,225]}/>
 <S.Text x={465} y={280} anchor="middle" kind="value">PARALLEL · high impedance</S.Text>
 </S.Schematic></S.Figure>;
}
export function RCLocusFigure(){
 const x=1,vc={re:1/(1+x*x),im:-x/(1+x*x)},vr={re:1-vc.re,im:-vc.im};
 const locus=logspace(-2,2,81).map(t=>({re:1/(1+t*t),im:-t/(1+t*t),color:'var(--line)'}));
 return <S.Figure caption="At the RC corner, $V_C = 0.5 − j0.5$ and $V_R = 0.5 + j0.5$ per volt of input. Their magnitudes are each 0.707 V, and their phasor sum is 1 V. The capacitor tip follows a lower semicircle as frequency changes.">
 <PhasorDiagram vectors={[{re:1,im:0,color:ink,dashed:true,label:'V_in',side:-1},{...vc,color:green,label:'V_C',side:-1},{...vr,from:vc,color:orange,label:'V_R'}]} scale={1.15} points={locus} description="RC voltage phasors form a right triangle at the corner; both component voltages are 0.707 volts and sum to a 1 volt source. The capacitor voltage locus is a semicircle."/>
 </S.Figure>;
}
export function ResonanceWidthFigure(){
 return <S.Figure plot caption="Series resonators with Q = 5, 10, and 30, normalized to their own peak current and the same resonant frequency. Higher Q narrows the half-power bandwidth: Δf/f₀ = 1/Q. The half-power current is 1/√2 of peak, not half of peak.">
 <Plot curves={[...[5,10,30].map((q,i)=>({name:'Q = '+q,color:[gray,orange,green][i],points:pts(x=>1/Math.hypot(1,q*(x-1/x)),.75,1.25,500)})),{name:'Half-power level',color:ink,dashed:true,points:[[.75,Math.SQRT1_2],[1.25,Math.SQRT1_2]]}]} xRange={[.75,1.25]} yRange={[0,1.05]} xLabel="FREQUENCY / f_0" yLabel="CURRENT / PEAK CURRENT" description="Normalized series resonance current: Q 30 gives the narrowest curve, Q 5 the widest; all peak at the same frequency."/>
 </S.Figure>;
}
export function RingingFigure(){
 return <S.Figure plot caption="Unit-step responses of second-order low-pass filters, normalized to their final value. Q = 0.5 is critically damped; Q = 0.707 is flat in frequency yet overshoots by 4.3%; Q = 2 and 5 ring strongly. The horizontal axis uses natural-frequency periods.">
 <Plot curves={[.5,Math.SQRT1_2,2,5].map((q,i)=>({name:'Q = '+q.toFixed(q===Math.SQRT1_2?3:1),color:[gray,ink,orange,green][i],dashed:i===0,points:pts(t=>secondOrderStep({u:2*Math.PI*t,q}),0,5,600)}))} xRange={[0,5]} yRange={[0,1.85]} xLabel="TIME × NATURAL FREQUENCY / CYCLES" yLabel="OUTPUT / FINAL VALUE" description="Critically damped and three underdamped low-pass step responses. High Q causes large overshoot and long ringing; Butterworth Q still produces slight overshoot."/>
 </S.Figure>;
}
export function CouplingFigure(){
 return <S.Figure caption="A coupling capacitor sees both resistances when calculating its time constant: $τ = (R_s + R_{in})C$. The passband gain is $R_{in}/(R_s + R_{in})$. The bias source is a DC reference and an AC ground in this signal model.">
 <S.Schematic height={260} description="Signal source through source resistance Rs and coupling capacitor C to a biased input resistance Rin, returned to AC ground.">
 <S.Source kind="ac" a={[80,185]} b={[80,105]} label="signal"/><S.Wire pts={[[80,105],[80,55],[155,55]]}/><S.Res a={[155,55]} b={[255,55]} label="R_s"/>
 <S.Wire pts={[[255,55],[285,55]]}/><S.Cap a={[285,55]} b={[385,55]} label="C"/><S.Wire pts={[[385,55],[485,55],[565,55]]}/><S.Terminal at={[565,55]} label="V_out" side="above"/>
 <S.Res a={[485,55]} b={[485,205]} label="R_in"/><S.Dot at={[485,55]} color={green}/><S.Wire pts={[[485,205],[80,205],[80,185]]}/><S.Ground at={[325,205]}/><S.Dot at={[325,205]}/>
 <S.Text x={325} y={245} anchor="middle" kind="value">AC equivalent · DC bias sources zeroed</S.Text>
 </S.Schematic></S.Figure>;
}
export function BypassLoopFigure(){
 return <S.Figure caption="A local capacitor closes the fast current loop at the load. Supply wiring carries the slower recharge current. This is an electrical topology drawing: the physical capacitor-to-load-and-return loop must also be short to keep its inductance low.">
 <S.Schematic height={255} description="Remote supply through wiring inductance, with a local capacitor in parallel with a pulsed current load and a highlighted local current loop.">
 <S.Source a={[80,175]} b={[80,105]} label="regulator"/><S.Wire pts={[[80,105],[80,55],[195,55]]}/><S.Ind a={[195,55]} b={[295,55]} label="wiring L"/>
 <S.Wire pts={[[295,55],[535,55]]}/><S.Cap a={[385,210]} b={[385,55]} label="local C" flipLabel/><S.CurrentSource a={[535,55]} b={[535,210]} label="load"/>
 <S.Wire pts={[[535,210],[80,210],[80,175]]}/><S.Dot at={[385,55]} color={green}/><S.Dot at={[385,210]}/><S.Ground at={[230,210]}/><S.Dot at={[230,210]}/>
 <S.CurrentArrow at={[450,55]} dir="right" label="fast pulse"/><S.CurrentArrow at={[450,210]} dir="left"/><S.CurrentArrow at={[385,170]} dir="up"/>
 </S.Schematic></S.Figure>;
}
export function RadioFigure(){
 return <S.Figure caption="An AM receiver teaching chain: parallel LC selects a carrier, the diode and RC recover its envelope, and a coupling capacitor removes DC before an audio amplifier. Detector and antenna loading reduce the tank’s Q; a practical receiver usually needs buffering or coil tapping.">
 <S.Schematic height={300} description="Antenna feeding parallel LC tank; diode from tank to parallel envelope resistor and capacitor; coupling capacitor to an audio-amplifier input represented as a terminal.">
 <S.Terminal at={[60,65]} label="antenna" side="above"/><S.Wire pts={[[60,65],[225,65]]}/><S.Ind a={[95,65]} b={[95,230]} label="L" flipLabel/><S.Cap a={[170,65]} b={[170,230]} label="C_tune"/>
 <S.Diode a={[225,65]} b={[300,65]} label="detector"/><S.Wire pts={[[300,65],[450,65]]}/><S.Cap a={[325,65]} b={[325,230]} label="C_env" flipLabel/><S.Res a={[415,65]} b={[415,230]} label="R_env"/>
 <S.Cap a={[450,65]} b={[540,65]} label="C_couple"/><S.Wire pts={[[540,65],[580,65]]}/><S.Terminal at={[580,65]} label="audio in" side="above"/>
 <S.Wire pts={[[95,230],[415,230]]}/><S.Ground at={[250,230]}/><S.Dot at={[250,230]}/>
 {[95,170,325,415].map(x=><g key={x}><S.Dot at={[x,65]}/>{x!==95&&x!==415&&<S.Dot at={[x,230]}/>}</g>)}
 <S.Text x={135} y={275} anchor="middle" kind="value">SELECT</S.Text><S.Text x={370} y={275} anchor="middle" kind="value">DETECT</S.Text><S.Text x={550} y={275} anchor="middle" kind="value">COUPLE</S.Text>
 </S.Schematic></S.Figure>;
}
