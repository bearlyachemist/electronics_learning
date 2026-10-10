// Static teaching figures. Rendered at build time (no client directive), so they ship as plain SVG.
import Plot from './Plot';
import {Wires,Res,Cap,Ind,Diode,Source,Ground,Dot,Label,PhasorDiagram,Bjt,logspace,green,orange,ink} from './Parts';
import {polar,rcResponse,db} from '../engine/ac.mjs';
function Figure({caption,children}:{caption:string;children:React.ReactNode}){return <figure className="support-figure">{children}<figcaption>{caption}</figcaption></figure>}

export function RegulatorBypassFigure(){
 return <Figure caption="A protection diode from regulator output (anode) to input (cathode). It is reverse-biased in normal operation. If the input collapses faster than the output, the output capacitor discharges through the diode instead of backward through the regulator.">
 <svg viewBox="0 0 640 250" role="img" aria-label="Input rail with capacitor feeds a three-terminal regulator block. Output rail with capacitor feeds the load. A diode bridges from the output rail back to the input rail above the regulator, anode at output.">
  <Wires d="M40 140 H250 M390 140 H600 M130 140 V170 M130 230 V240 M500 140 V170 M500 230 V240 M320 180 V240 H130 M320 240 H500 M200 140 V60 H290 M350 60 H440 V140"/>
  <rect x="250" y="110" width="140" height="70" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><Cap x={130} y={200} v/><Cap x={500} y={200} v/><Diode x={320} y={60} rotate={180} color={green}/>
  <Dot x={200} y={140}/><Dot x={440} y={140}/><Dot x={130} y={140}/><Dot x={500} y={140}/><Dot x={320} y={240}/>
  <Label x={320} y={140} anchor="middle">Linear</Label><Label x={320} y={160} anchor="middle">regulator</Label><Label x={262} y={132} kind="value">IN</Label><Label x={378} y={132} anchor="end" kind="value">OUT</Label>
  <Label x={40} y={128}>Vin</Label><Label x={600} y={128} anchor="end">Vout</Label><Label x={150} y={205}>C_in</Label><Label x={520} y={205}>C_out (large)</Label><Label x={320} y={38} anchor="middle" kind="output">protection diode</Label>
 </svg></Figure>;
}
export function SteeringFigure(){
 return <Figure caption="Layered input protection. A TVS at the connector diverts most of a surge to ground; the series resistor limits whatever current remains; steering diodes return the rest to the supply rails. Each element assumes the next one exists.">
 <svg viewBox="0 0 640 270" role="img" aria-label="Connector pin, TVS diode to ground at the connector, series resistor, then a protected pin with one diode from pin up to VDD and one from ground up to the pin.">
  <Wires d="M50 135 H310 M370 135 H560 M140 135 V170 M140 230 V240 M460 135 V100 M460 40 V30 M460 135 V170 M460 230 V240"/>
  <circle cx="50" cy="135" r="6" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><Diode x={140} y={200} rotate={-90} zener color={orange}/><Res x={340} y={135}/><Diode x={460} y={70} rotate={-90}/><Diode x={460} y={200} rotate={-90}/><Ground x={140} y={240}/><Ground x={460} y={240}/>
  <Dot x={140} y={135}/><Dot x={460} y={135} color={green}/><path d="M440 30 H480" stroke={ink} strokeWidth="1.8"/>
  <Label x={40} y={115}>connector</Label><Label x={165} y={205}>TVS</Label><Label x={340} y={115} anchor="middle">R series</Label><Label x={490} y={34}>VDD</Label><Label x={485} y={75} kind="value">to VDD</Label><Label x={485} y={205} kind="value">from ground</Label><Label x={575} y={140}>protected pin</Label>
 </svg></Figure>;
}
export function ResetFigure(){
 return <Figure caption="A power-on delay with a discharge diode. R charges C slowly when power appears. When the supply falls to zero, the diode (anode at the timing node, cathode at the supply) empties C quickly, so a brief dropout produces a fresh delay.">
 <svg viewBox="0 0 640 250" role="img" aria-label="Supply at top through resistor R to a timing node, capacitor from the node to ground. A diode in parallel with R points from the node up to the supply.">
  <Wires d="M160 40 V80 M160 140 V170 M160 170 H360 M160 230 V240 M360 170 H470 M160 60 H260 V80 M260 140 V170"/>
  <Res x={160} y={110} v/><Diode x={260} y={110} rotate={-90} color={green}/><Cap x={160} y={200} v/><Ground x={160} y={240}/><Dot x={160} y={170} color={green}/><Dot x={160} y={60}/><Dot x={260} y={170}/>
  <path d="M140 40 H180" stroke={ink} strokeWidth="1.8"/><Label x={190} y={44}>VDD</Label><Label x={130} y={115} anchor="end">R</Label><Label x={285} y={115}>diode</Label><Label x={130} y={205} anchor="end">C</Label><Label x={480} y={175} kind="output">to RESET input</Label>
 </svg></Figure>;
}
export function EulerFigure(){
 const t=35,z=polar(1,t);
 return <figure className="support-figure figure-row"><PhasorDiagram vectors={[{re:z.re,im:0,color:green,label:'cos θ'},{re:0,im:z.im,from:{re:z.re,im:0},color:orange,label:'j sin θ'},{...z,color:ink,label:'e^{jθ}'}]} circle={1} scale={1.15} description="Unit circle. The point e to the j theta sits at angle 35 degrees; its horizontal projection is cos theta and its vertical projection is sin theta."/>
 <figcaption>Euler’s formula as geometry. The complex number e<sup>jθ</sup> has length 1 and angle θ; its real part is cos θ and its imaginary part is sin θ. Multiplying by e<sup>jφ</sup> rotates any complex number by φ without changing its length. As θ = ωt grows steadily, the point travels around the circle and its shadow on the real axis is cos ωt.</figcaption></figure>;
}
export function ReactanceFigure(){
 const fr=logspace(1,6),l=.01,c=1e-6;
 return <figure className="static-plot"><Plot curves={[{name:'X_L = 2πfL, L = 10 mH',color:orange,points:fr.map(v=>[v,2*Math.PI*v*l])},{name:'X_C = 1/(2πfC), C = 1 µF',color:green,points:fr.map(v=>[v,1/(2*Math.PI*v*c)])}]} xRange={[10,1e6]} yRange={[.1,1e7]} xScale="log" yScale="log" xTicks={[10,100,1e3,1e4,1e5,1e6]} xLabel="FREQUENCY / Hz · LOG" yLabel="REACTANCE / Ω · LOG" description="On log-log axes inductive reactance is a straight line rising one decade per decade; capacitive reactance falls one decade per decade. They cross near 1.59 kilohertz at 100 ohms."/>
 <figcaption>Reactance on logarithmic axes. Each line has slope ±1: ten times the frequency gives ten times X_L and one tenth of X_C. These two lines cross at 1.59 kHz, where both equal 100 Ω — the resonant frequency of this L and C.</figcaption></figure>;
}
export function DividerFigure(){
 return <Figure caption="The generalized divider. Z₁ and Z₂ may be any combination of R, L and C; at one frequency each is a single complex number, and the same algebra as the resistive divider applies.">
 <svg viewBox="0 0 640 230" role="img" aria-label="Source Vin feeds impedance Z1 to the output node; impedance Z2 from output node to ground.">
  <Wires d="M100 92 V50 H230 M330 50 H430 V80 M430 140 V190 H100 V142"/><Source x={100} y={117} ac label="Vin"/>
  <rect x="230" y="35" width="100" height="30" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><rect x="415" y="80" width="30" height="60" fill="var(--white)" stroke={ink} strokeWidth="1.8"/>
  <Label x={280} y={55} anchor="middle">Z₁</Label><Label x={460} y={115}>Z₂</Label><Dot x={430} y={50} color={green}/><Label x={445} y={40} kind="output">Vout = Vin · Z₂ / (Z₁ + Z₂)</Label>
 </svg></Figure>;
}
export function TankFigure(){
 const term=(x:number,y:number)=><circle cx={x} cy={y} r="4" fill="var(--white)" stroke={ink} strokeWidth="1.8"/>;
 return <Figure caption="Left: series resonance gives a minimum impedance (a near-short at f₀). Right: a parallel tank gives a maximum (a near-open at f₀). The resistor r is the inductor’s winding loss, which usually dominates.">
 <svg viewBox="0 0 640 240" role="img" aria-label="Left, a series chain of r, L and C between two terminals at the top. Right, a parallel tank: L with series r in one branch, C in the other, between top and bottom terminals.">
  <Wires d="M60 40 V60 M60 120 V125 M60 185 V200 H150 V175 M150 115 V40"/><Res x={60} y={90} v/><Ind x={60} y={155} v/><Cap x={150} y={145} v/>{term(60,36)}{term(150,36)}
  <Label x={85} y={95}>r</Label><Label x={85} y={160}>L</Label><Label x={172} y={150}>C</Label><Label x={105} y={230} anchor="middle" kind="value">series: |Z| → r at f₀</Label>
  <Wires d="M480 30 V50 M420 50 H540 M420 50 V65 M420 125 V135 M420 195 V210 H540 M540 50 V100 M540 160 V210 M480 210 V222"/><Res x={420} y={95} v/><Ind x={420} y={165} v/><Cap x={540} y={130} v/>
  <Dot x={480} y={50}/><Dot x={480} y={210}/>{term(480,26)}{term(480,226)}
  <Label x={398} y={100} anchor="end">r</Label><Label x={398} y={170} anchor="end">L</Label><Label x={562} y={135}>C</Label><Label x={620} y={230} anchor="end" kind="value">parallel: |Z| → L/(rC)</Label>
 </svg></Figure>;
}
export function RadioFigure(){
 return <Figure caption="A minimal AM receiver. The tuned tank selects one station; the diode and RC form an envelope detector; the coupling capacitor removes the detector’s DC level before the audio stage. Every block is a chapter you have already worked through.">
 <svg viewBox="0 0 640 260" role="img" aria-label="Antenna to a parallel LC tank to ground. The tank top feeds a diode, then a parallel resistor and capacitor to ground, then a series coupling capacitor to an amplifier block.">
  <Wires d="M70 30 V70 M70 70 H150 M110 70 V110 M110 170 V210 M180 70 V110 M180 170 V210 M110 210 H330 M150 70 H220 M280 70 H330 V110 M330 170 V210 M400 70 V110 M400 170 V210 M330 210 H400 M330 70 H435 M495 70 H530"/>
  <path d="M55 15 L70 30 L85 15 M70 30 V15" stroke={ink} strokeWidth="1.8" fill="none"/><Ind x={110} y={140} v/><Cap x={180} y={140} v/><path d="M162 165 L198 115 m-8 1 l8 -1 l-1 8" stroke={orange} strokeWidth="1.5" fill="none"/>
  <Diode x={250} y={70} color={green}/><Cap x={330} y={140} v/><Res x={400} y={140} v/><Cap x={465} y={70}/><Ground x={220} y={210}/>
  <polygon points="530,45 530,95 575,70" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><Dot x={110} y={70}/><Dot x={180} y={70}/><Dot x={330} y={70}/><Dot x={400} y={70}/><Dot x={180} y={210}/><Dot x={330} y={210}/>
  <Label x={90} y={14}>antenna</Label><Label x={145} y={238} anchor="middle" kind="value">tuned tank</Label><Label x={250} y={48} anchor="middle" kind="value">detector</Label><Label x={365} y={238} anchor="middle" kind="value">envelope RC</Label><Label x={465} y={45} anchor="middle" kind="value">coupling C</Label><Label x={585} y={75}>audio</Label>
 </svg></Figure>;
}
export function DecibelFigure(){
 const fr=logspace(0,4,201);
 return <figure className="static-plot"><Plot curves={[1,2,3].map((n,i)=>({name:n+' pole'+(n>1?'s':'')+' at 100 Hz',color:[green,orange,ink][i],points:fr.map(v=>[v,n*db(rcResponse({hz:v,fc:100}))] as [number,number])}))} xRange={[1,1e4]} yRange={[-80,0]} xScale="log" xTicks={[1,10,100,1e3,1e4]} xLabel="FREQUENCY / Hz · LOG" yLabel="GAIN / dB" description="One, two and three buffered poles at 100 hertz. Beyond the corner the slopes are minus 20, minus 40 and minus 60 decibels per decade."/>
 <figcaption>Stacked identical buffered poles. Well above the corner, one pole falls 20 dB/decade (6 dB/octave), two fall 40, three fall 60. At the corner itself each pole contributes −3 dB.</figcaption></figure>;
}
export function RCLocusFigure(){
 const vc=(x:number)=>({re:1/(1+x*x),im:-x/(1+x*x)}),at=vc(1),vr={re:1-at.re,im:-at.im};
 const locus=Array.from({length:41},(_,k)=>vc(10**(-2+4*k/40)));
 return <figure className="support-figure figure-row"><PhasorDiagram vectors={[{re:1,im:0,color:ink,dashed:true,label:'Vin'},{...at,color:green,label:'V_C'},{...vr,from:at,color:orange,label:'V_R'}]} scale={1.05} points={locus.map(p=>({...p,color:'var(--line)'}))} description="Series RC phasor diagram at the corner frequency. V_C and V_R are perpendicular and sum to Vin. As frequency varies, the tip of V_C moves along a semicircle below the real axis whose diameter is Vin."/>
 <figcaption>Series RC driven by Vin, drawn at f = f₃dB. V_R is in phase with the current and V_C lags it by 90°, so the two always meet at a right angle. By Thales’ theorem the corner between them lies on a semicircle with Vin as diameter: as frequency rises, the tip of V_C slides from Vin (low f) toward the origin (high f), and the low-pass output’s magnitude and phase can be read straight off the circle.</figcaption></figure>;
}
const arrow=(x:number,y:number,dir:'down'|'right'|'up'|'left',color=green)=>{const d={down:'l-5 -8 m5 8 l5 -8',up:'l-5 8 m5 -8 l5 8',right:'l-8 -5 m8 5 l-8 5',left:'l8 -5 m-8 5 l8 5'}[dir];return <path d={`M${x} ${y} ${d}`} stroke={color} strokeWidth="2" fill="none"/>};
export function TerminalsFigure(){
 return <Figure caption="NPN (left) and PNP (right). The emitter arrow points in the direction of conventional emitter current. For the NPN, base and collector currents flow in and combine to leave by the emitter: I_E = I_B + I_C. The PNP is the mirror image, with every current and voltage reversed.">
 <svg viewBox="0 0 640 270" role="img" aria-label="NPN transistor with base current entering the base, collector current entering the collector from above, and emitter current leaving the emitter downward. PNP transistor drawn emitter-up with emitter current entering from above and base and collector currents leaving.">
  <Wires d="M80 135 H150 M192 40 V95 M192 175 V230"/><Bjt x={180} y={135}/>{arrow(130,135,'right')}{arrow(192,70,'down')}{arrow(192,212,'down')}
  <Label x={92} y={122}>I_B</Label><Label x={204} y={70}>I_C</Label><Label x={204} y={212}>I_E</Label><Label x={140} y={160} kind="value">B</Label><Label x={176} y={52} kind="value">C</Label><Label x={176} y={226} kind="value">E</Label><Label x={180} y={260} anchor="middle" kind="output">NPN: V_BE ≈ +0.65 V</Label>
  <g transform="translate(0 270) scale(1 -1)"><Wires d="M380 135 H450 M492 40 V95 M492 175 V230"/><Bjt x={480} y={135} pnp/></g>{arrow(410,135,'left')}{arrow(492,212,'down')}{arrow(492,70,'down')}
  <Label x={392} y={122}>I_B</Label><Label x={504} y={70}>I_E</Label><Label x={504} y={212}>I_C</Label><Label x={476} y={52} kind="value">E</Label><Label x={476} y={226} kind="value">C</Label><Label x={480} y={260} anchor="middle" kind="output">PNP: V_BE ≈ −0.65 V</Label>
 </svg></Figure>;
}
export function FollowerRegulatorFigure(){
 return <Figure caption="A zener sets the base voltage; the follower supplies the load current. The zener now has to supply only the base current, I_load/(β + 1), so a small zener and a large resistor regulate a large load. The output sits one V_BE below the zener voltage.">
 <svg viewBox="0 0 640 270" role="img" aria-label="Unregulated input rail at top. A resistor from the rail feeds a zener diode to ground; the zener node drives the base of an NPN transistor whose collector is on the input rail and whose emitter feeds the load.">
  <path d="M120 30 H440" stroke={ink} strokeWidth="2.4"/><Wires d="M200 30 V55 M200 115 V140 M200 200 V215 M200 125 H330 M372 30 V85 M372 165 V190 M372 250 V255 M372 178 H470"/>
  <Res x={200} y={85} v/><Diode x={200} y={170} rotate={-90} zener/><Bjt x={360} y={125}/><Res x={372} y={220} v/><Ground x={200} y={215}/><Ground x={372} y={255}/><Dot x={200} y={125}/><Dot x={372} y={178} color={green}/><Dot x={372} y={30}/>
  <Label x={448} y={35}>V_in (unregulated)</Label><Label x={180} y={90} anchor="end">R</Label><Label x={180} y={175} anchor="end">zener V_Z</Label><Label x={394} y={225}>load</Label><Label x={478} y={183} kind="output">V_out ≈ V_Z − 0.65 V</Label>
 </svg></Figure>;
}
export function HybridPiFigure(){
 return <Figure caption="The hybrid-π small-signal model. Between base and emitter the transistor looks like a resistance r_π = β/g_m; the collector is a current source g_m·v_be, with the Early effect appearing as r_o in parallel. Every element depends on the bias current. Add the external resistors, set DC supplies to ground, and solve as an ordinary linear circuit.">
 <svg viewBox="0 0 640 250" role="img" aria-label="Base node on the left connected through r pi to the common emitter node at the bottom. On the right, collector node with a dependent current source g m times v be flowing down to the emitter, and r o in parallel.">
  <Wires d="M70 60 H200 M200 60 V90 M200 150 V200 M70 200 H560 M380 60 H560 M400 60 V95 M400 165 V200 M520 60 V90 M520 150 V200"/>
  <Res x={200} y={120} v/><circle cx="400" cy="130" r="30" fill="var(--white)" stroke={ink} strokeWidth="1.8"/>{arrow(400,148,'down',ink)}<path d="M400 112 V148" stroke={ink} strokeWidth="1.8"/><Res x={520} y={120} v/>
  <circle cx="70" cy="60" r="5" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><circle cx="560" cy="60" r="5" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><circle cx="70" cy="200" r="5" fill="var(--white)" stroke={ink} strokeWidth="1.8"/>
  <Label x={56} y={65} anchor="end">B</Label><Label x={574} y={65}>C</Label><Label x={56} y={205} anchor="end">E</Label><Label x={222} y={125}>r_π = β/g_m</Label><Label x={436} y={125}>g_m·v_be</Label><Label x={542} y={125}>r_o</Label>
  <Label x={135} y={100} kind="output">+</Label><Label x={135} y={180} kind="output">−</Label><Label x={122} y={142} kind="output">v_be</Label>
 </svg></Figure>;
}
export function MirrorFigure(){
 return <Figure caption="A current mirror. Q₁ is diode-connected (collector tied to base), so it develops whatever V_BE its current I_ref requires. Q₂ shares that V_BE and, if it is matched and at the same temperature, carries the same collector current into its load.">
 <svg viewBox="0 0 640 270" role="img" aria-label="Supply rail at top. A resistor from the rail feeds the collector of Q1, which is tied to both bases. Q2 sits to the right with its emitter grounded and its collector feeding the load up to the supply. Both emitters are grounded.">
  <path d="M200 30 H460" stroke={ink} strokeWidth="2.4"/><Wires d="M238 30 V55 M238 115 V130 M238 210 V225 M238 122 H300 V170 M280 170 H340 M382 210 V225 M382 30 V55 M382 115 V130"/>
  <Res x={238} y={85} v/><Bjt x={250} y={170} flip/><Bjt x={370} y={170}/><Res x={382} y={85} v/><Ground x={238} y={225}/><Ground x={382} y={225}/><Dot x={300} y={170}/><Dot x={238} y={122}/>
  <Label x={468} y={35}>+V_CC</Label><Label x={218} y={90} anchor="end">R (sets I_ref)</Label><Label x={404} y={90}>load</Label><Label x={208} y={175} anchor="end">Q₁</Label><Label x={404} y={175}>Q₂</Label><Label x={404} y={128} kind="output">I_out ≈ I_ref</Label>
 </svg></Figure>;
}
export function MillerFigure(){
 return <Figure caption="The Miller theorem. A capacitance C bridging the input and output of an inverting amplifier of gain −A carries a current set by the full voltage difference v(1 + A). Seen from the input, it looks like a capacitance C(1 + A) to ground; seen from the output, like C(1 + 1/A) ≈ C.">
 <svg viewBox="0 0 640 230" role="img" aria-label="Left: inverting amplifier with gain minus A and a capacitor C from its output back to its input. Right: the equivalent, a capacitor C times one plus A from the input to ground.">
  <polygon points="120,70 120,150 190,110" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><Label x={140} y={115}>−A</Label><Wires d="M50 110 H120 M190 110 H250 M80 110 V40 H130 M170 40 H220 V110"/><Cap x={150} y={40}/><Dot x={80} y={110}/><Dot x={220} y={110}/><Label x={150} y={25} anchor="middle">C</Label><Label x={40} y={115} anchor="end">v</Label><Label x={258} y={115}>−Av</Label>
  <path d="M290 110 h40 m-8 -6 l8 6 l-8 6" stroke={green} strokeWidth="2" fill="none"/>
  <polygon points="470,70 470,150 540,110" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><Label x={490} y={115}>−A</Label><Wires d="M380 110 H470 M540 110 H600 M420 110 V140 M420 200 V210"/><Cap x={420} y={170} v/><Ground x={420} y={210}/><Dot x={420} y={110}/><Label x={442} y={175}>C(1 + A)</Label>
 </svg></Figure>;
}
export function ClassBPowerFigure(){
 const vcc=15,rl=8,a=pts2(v=>v,0,vcc);const pl=(v:number)=>v*v/(2*rl),ps=(v:number)=>2*vcc*v/(Math.PI*rl);
 return <figure className="static-plot"><Plot curves={[{name:'Supply power',color:ink,points:a.map(([v])=>[v,ps(v)])},{name:'Load power',color:green,points:a.map(([v])=>[v,pl(v)])},{name:'Dissipated in both transistors',color:orange,points:a.map(([v])=>[v,ps(v)-pl(v)])}]} xRange={[0,15]} xTicks={[0,3,6,9,12,15]} yRange={[0,20]} xLabel="OUTPUT AMPLITUDE / V PEAK (±15 V, 8 Ω, IDEAL CLASS B)" yLabel="POWER / W" description="Class B powers versus amplitude: load power rises as amplitude squared, supply power linearly, and transistor dissipation peaks at 5.7 watts near 9.5 volts amplitude."/>
 <figcaption>Ideal class B into 8 Ω from ±15 V. Load power grows as the square of the amplitude, supply power linearly, so the transistors run hottest not at full output but at 2V_CC/π ≈ 9.5 V, where together they dissipate 2V_CC²/(π²R_L) = 5.7 W.</figcaption></figure>;
}
function pts2(fn:(x:number)=>number,a:number,b:number,n=100):[number,number][]{return Array.from({length:n+1},(_,k)=>{const x=a+(b-a)*k/n;return [x,fn(x)]});}
export function ActiveLoadFigure(){
 return <Figure caption="A differential pair with a current-mirror load. The mirror copies Q₁’s collector current to the right side, so a differential input changes both collector currents in the direction that adds at the output node. The output sees two high collector resistances in parallel, giving gains in the thousands from one stage.">
 <svg viewBox="0 0 640 300" role="img" aria-label="PNP current mirror at top: Q3 diode-connected on the left above Q1, Q4 on the right above Q2. NPN differential pair Q1 and Q2 below with emitters joined to a tail current source to the negative supply. Output taken at the junction of Q2 and Q4 collectors.">
  <path d="M220 22 H440" stroke={ink} strokeWidth="2.4"/><g transform="translate(0 200) scale(1 -1)"><Bjt x={250} y={115} flip pnp/><Bjt x={410} y={115} pnp/></g><Wires d="M262 22 V45 M398 22 V45 M280 85 H380 M262 125 V140 M398 125 V140 M262 132 H300 V85"/><Dot x={300} y={85}/><Dot x={262} y={132}/>
  <Bjt x={250} y={180}/><Bjt x={410} y={180} flip/><Wires d="M262 220 V240 H398 V220 M330 240 V250 M330 282 V292 M398 132 H480"/><circle cx="330" cy="266" r="16" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><path d="M330 258 V274 m-5 -6 l5 6 l5 -6" stroke={ink} strokeWidth="1.8" fill="none"/><path d="M220 292 H440" stroke={ink} strokeWidth="2.4"/><Dot x={398} y={132} color={green}/>
  <Label x={448} y={27}>+V</Label><Label x={448} y={297}>−V</Label><Label x={240} y={70} anchor="end" kind="value">Q₃</Label><Label x={420} y={70} kind="value">Q₄</Label><Label x={240} y={185} anchor="end" kind="value">Q₁</Label><Label x={420} y={185} kind="value">Q₂</Label><Label x={488} y={137} kind="output">out</Label><Label x={352} y={270}>I_tail</Label><Label x={210} y={185} anchor="end">v₁</Label><Label x={450} y={185}>v₂</Label><Wires d="M150 180 H220 M440 180 H510"/>
 </svg></Figure>;
}
export function VbeMultiplierFigure(){
 return <Figure caption="The V_BE multiplier. With R₂ from collector to base and R₁ from base to emitter, the transistor conducts just enough to hold R₁ at one V_BE, so V_CE ≈ V_BE(1 + R₂/R₁). Mounted on the output transistors’ heat sink, it tracks their falling V_BE and keeps the quiescent current from running away.">
 <svg viewBox="0 0 640 230" role="img" aria-label="Transistor with resistor R2 from collector to base and resistor R1 from base to emitter; the voltage across collector to emitter is V_BE times one plus R2 over R1.">
  <Wires d="M330 20 V75 M330 155 V210 M330 50 H250 V85 M250 145 V150 M250 175 V180 H330 M250 115 H300"/><Bjt x={318} y={115}/><Res x={250} y={115} v/><Res x={250} y={160} v/>
  <path d="M250 145 V130" stroke={ink} strokeWidth="1.8"/><Dot x={330} y={50}/><Dot x={250} y={115}/><Dot x={330} y={180}/><Label x={228} y={95} anchor="end">R₂</Label><Label x={228} y={165} anchor="end">R₁</Label><Label x={360} y={25}>to NPN output base</Label><Label x={360} y={215}>to PNP output base</Label><Label x={380} y={120} kind="output">V ≈ V_BE(1 + R₂/R₁)</Label>
 </svg></Figure>;
}
export function HighFreqModelFigure(){
 return <Figure caption="The hybrid-π model with its capacitances. C_π (diffusion plus base–emitter depletion capacitance) sits across r_π; C_μ (the base–collector depletion capacitance) bridges input and output. C_μ is the smaller of the two, but it is the one the Miller effect multiplies.">
 <svg viewBox="0 0 640 250" role="img" aria-label="Base node with r pi and C pi to the emitter, collector node with current source g m v be and r o to the emitter, and C mu connecting base to collector across the top.">
  <Wires d="M60 80 H330 M370 80 H580 M170 80 V100 M170 160 V200 M240 80 V100 M240 160 V200 M430 80 V100 M430 160 V200 M530 80 V100 M530 160 V200 M60 200 H580"/>
  <Wires d="M300 80 V40 H330 M370 40 H400 V80" color={orange}/><Cap x={350} y={40}/><Res x={170} y={130} v/><Cap x={240} y={130} v/><circle cx="430" cy="130" r="28" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><path d="M430 115 V145 m-5 -7 l5 7 l5 -7" stroke={ink} strokeWidth="1.8" fill="none"/><Res x={530} y={130} v/>
  <Label x={50} y={85} anchor="end">B</Label><Label x={590} y={85}>C</Label><Label x={50} y={205} anchor="end">E</Label><Label x={190} y={135}>r_π</Label><Label x={262} y={135}>C_π</Label><Label x={350} y={25} anchor="middle" kind="output">C_μ</Label><Label x={465} y={135}>g_m v_be</Label><Label x={552} y={135}>r_o</Label>
 </svg></Figure>;
}
