import Plot from './Plot';
import * as S from './Schematic';
import type {Pt} from './Schematic';
import type {ReactNode} from 'react';
import {channel,bisect} from '../engine/fet.mjs';
const xs=(a:number,b:number,n=200)=>Array.from({length:n+1},(_,i)=>a+(b-a)*i/n);
const logs=(a:number,b:number,n=200)=>xs(Math.log10(a),Math.log10(b),n).map(e=>10**e);

// A labelled block with ports on its left and right edges, so the connectivity lint can check wiring.
function Block({x,y,w=110,h=60,children,ports}:{x:number;y:number;w?:number;h?:number;children:ReactNode;ports:Pt[]}){
 return <g data-pins={ports.map(p=>p.join(',')).join(' ')}><rect x={x} y={y} width={w} height={h} fill="var(--white)" stroke="var(--ink)" strokeWidth="1.8"/>
  <S.Text x={x+w/2} y={y+h/2+5} anchor="middle">{children}</S.Text></g>;
}
function Sum({at:p,from='below'}:{at:Pt;from?:'below'|'above'}){return <g data-pins={[[p[0]-18,p[1]],[p[0]+18,p[1]],[p[0],p[1]+(from==='below'?18:-18)]].map(q=>q.join(',')).join(' ')}><circle cx={p[0]} cy={p[1]} r="18" fill="var(--white)" stroke="var(--ink)" strokeWidth="1.8"/><line x1={p[0]-9} x2={p[0]+9} y1={p[1]} y2={p[1]} stroke="var(--ink)" strokeWidth="1.6"/><line x1={p[0]} x2={p[0]} y1={p[1]-9} y2={p[1]+9} stroke="var(--ink)" strokeWidth="1.6"/></g>;}

/* ---------- Chapter 72: ideal op amps and feedback ---------- */
export function FeedbackBlockFigure(){
 return <S.Figure caption="Every negative-feedback amplifier in these chapters reduces to this loop. The forward amplifier multiplies the error $v_e = v_i - \beta v_o$ by $A$; the feedback network returns the fraction $\beta$ of the output. Solving the two equations gives the closed-loop gain $A/(1 + A\beta)$. The product $T = A\beta$, the gain around the loop, decides how closely the result approaches $1/\beta$.">
 <S.Schematic width={680} height={250} description="Block diagram: input to a summing junction, error to an amplifier A, output fed back through block beta to the summing junction with a minus sign.">
  <S.Terminal at={[50,90]} label="v_i" side="above"/><S.Wire pts={[[50,90],[152,90]]}/><Sum at={[170,90]}/><S.Text x={140} y={78} kind="value">+</S.Text><S.Text x={182} y={128} kind="value">−</S.Text>
  <S.Wire pts={[[188,90],[290,90]]}/><S.Text x={240} y={78} anchor="middle" kind="value">v_e</S.Text>
  <Block x={290} y={60} ports={[[290,90],[400,90]]}>A</Block><S.Wire pts={[[400,90],[620,90]]}/><S.Dot at={[540,90]}/><S.Terminal at={[620,90]} label="v_o" side="above"/>
  <S.Wire pts={[[540,90],[540,190],[400,190]]}/><Block x={290} y={160} ports={[[400,190],[290,190]]}>β</Block><S.Wire pts={[[290,190],[170,190],[170,108]]}/>
  <S.Text x={240} y={178} anchor="middle" kind="value">βv_o</S.Text>
 </S.Schematic></S.Figure>;
}
export function LoopGainErrorFigure(){
 return <S.Figure plot caption="Fractional gain error $1/(1 + T)$ against loop gain $T = A\beta$. Each factor of ten in loop gain buys a factor of ten in accuracy. The marks show a gain-of-11 amplifier ($\beta$ = 1/11) built from op amps with open-loop gains of $10^3$, $10^4$ and $10^5$: errors of 1.1%, 0.11% and 0.011%. Accuracy is set by loop gain, not by open-loop gain alone: the same op amp gives a hundred times less error as a follower ($\beta$ = 1) than at a gain of 100.">
 <Plot curves={[{name:'Gain error 1/(1 + T)',color:S.green,points:logs(1,1e6).map(t=>[t,100/(1+t)] as [number,number])}]} marks={[1e3,1e4,1e5].map(a=>({at:[a/11,100/(1+a/11)] as [number,number],label:'A = '+(a>=1e5?'10⁵':a>=1e4?'10⁴':'10³'),pos:'ne' as const}))}
  xScale="log" yScale="log" xRange={[1,1e6]} yRange={[1e-4,100]} xLabel="LOOP GAIN T = Aβ" yLabel="GAIN ERROR / %" description="Straight line on log-log axes: gain error falls in proportion to loop gain, with three marked op amps."/></S.Figure>;
}
export function SaturationFigure(){
 const A=1e5,G=11,lim=4.5,vo=(v:number)=>Math.max(-lim,Math.min(lim,v*A/(1+A/G))),vd=(v:number)=>v-vo(v)/G;
 return <S.Figure plot caption="A gain-of-11 noninverting amplifier ($A_0 = 10^5$) whose output can swing only ±4.5 V. Top: the output follows $11v_i$ until it reaches the limit. Bottom: the differential input $v_+ - v_-$, in millivolts. While the output is linear it is about 11 µV per volt of input, invisible on this scale: the virtual short. Once the output saturates, feedback can no longer correct the input, and $v_d$ grows one for one with the input. The rule $v_+ = v_-$ is a consequence of working feedback, not a property of the op amp.">
 <Plot curves={[{name:'Output v_o',color:S.green,points:xs(-1,1,400).map(v=>[v,vo(v)] as [number,number])},{name:'Requested 11 v_i',color:S.gray,dashed:true,points:[[-1,-11],[1,11]]}]} xRange={[-1,1]} yRange={[-6,6]} xLabel="INPUT v_i / V" yLabel="OUTPUT / V" description="Output rises with slope eleven and clips at plus and minus four and a half volts."/>
 <Plot curves={[{name:'Differential input v_+ − v_−',color:S.orange,points:xs(-1,1,400).map(v=>[v,1e3*vd(v)] as [number,number])}]} xRange={[-1,1]} yRange={[-700,700]} xLabel="INPUT v_i / V" yLabel="v_d / mV" description="Differential input is essentially zero between minus 0.41 and plus 0.41 volts of input, then grows linearly."/></S.Figure>;
}
export function OptionalInverterCircuit(){
 const at:Pt=[420,190],p=S.opAmpPins({at});
 return <S.Figure caption="A gain of +1 or −1 at the flick of a switch, a good test of the ideal rules. With the switch to ground, the plus input is at 0 V, the minus input is a virtual ground, and the circuit is an inverter: gain $-R_F/R_{IN}$ = −1. With the switch to the input, both inputs see $v_i$; no current flows in $R_{IN}$, none in $R_F$, and the output equals the input: gain +1. The 20 kΩ resistor keeps the plus input's source resistance similar in both positions.">
 <S.Schematic width={680} height={340} description="Op amp with equal input and feedback resistors from the input to the inverting input and output; the noninverting input is switched, through twenty kilohms, either to the input or to ground.">
  <S.Terminal at={[80,120]} label="v_i"/><S.Wire pts={[[80,120],[180,120]]}/><S.Dot at={[180,120]}/>
  <S.Res a={[180,120]} b={[330,120]} label="R_IN" value="10 kΩ"/><S.Wire pts={[[330,120],[330,175],p.minus]}/><S.Dot at={[330,120]}/>
  <S.Wire pts={[[330,120],[330,60],[400,60]]}/><S.Res a={[400,60]} b={[540,60]} label="R_F" value="10 kΩ"/><S.Wire pts={[[540,60],[540,190]]}/>
  <S.OpAmp at={at}/><S.Wire pts={[p.out,[600,190]]}/><S.Dot at={[540,190]}/><S.Terminal at={[600,190]} label="v_o" side="right"/>
  <S.Wire pts={[[180,120],[180,180],[210,180]]}/><S.Switch a={[210,180]} b={[260,205]} closed/><S.Text x={196} y={172} anchor="end" kind="value">+1</S.Text>
  <S.Terminal at={[210,232]} side="left"/><S.Text x={196} y={248} anchor="end" kind="value">−1</S.Text><S.Wire pts={[[210,232],[210,300]]}/><S.Ground at={[210,300]}/>
  <S.Res a={[260,205]} b={p.plus} label="20 kΩ" flipLabel/>
 </S.Schematic></S.Figure>;
}

/* ---------- Chapter 73: DC error budget ---------- */
export function ErrorModelCircuit(){
 const at:Pt=[430,190],p=S.opAmpPins({at,plusTop:true});
 return <S.Figure caption="The DC error model. A real op amp is an ideal one with three sources added at its inputs: an offset voltage $V_{OS}$ in series with one input, and bias currents $I_{B+}$ and $I_{B-}$ flowing into each input (signed: positive into the amplifier). $I_{B+}$ flows through the source resistance $R_{SRC}$; $I_{B-}$ flows through the feedback network, which it sees as $R_F \parallel R_G$.">
 <S.Schematic width={720} height={360} description="Noninverting amplifier with source resistance, offset voltage source in series with the plus input, bias current sources at both inputs, feedback resistors R F and R G.">
  <S.Source a={[60,320]} b={[60,175]} label="V_IN"/><S.Ground at={[60,320]}/><S.Res a={[60,175]} b={[200,175]} label="R_SRC"/>
  <S.Wire pts={[[200,175],[240,175]]}/><S.Dot at={[240,175]}/><S.CurrentSource a={[240,175]} b={[240,320]} label="I_B+" flipLabel/><S.Ground at={[240,320]}/>
  <S.Source a={[260,175]} b={[360,175]} label="V_OS"/><S.Wire pts={[[240,175],[260,175]]}/><S.Wire pts={[[360,175],p.plus]}/>
  <S.OpAmp at={at} plusTop/><S.Text x={460} y={145} anchor="middle" kind="value">ideal op amp</S.Text><S.Wire pts={[p.out,[650,190]]}/><S.Terminal at={[650,190]} label="v_o" side="above"/><S.Dot at={[600,190]}/>
  <S.Wire pts={[p.minus,[390,205],[390,260]]}/><S.Res a={[390,260]} b={[600,260]} label="R_F" value="100 kΩ"/><S.Wire pts={[[600,260],[600,190]]}/>
  <S.Res a={[390,260]} b={[390,340]} label="R_G" value="10 kΩ"/><S.Ground at={[390,340]}/><S.Dot at={[390,260]}/>
  <S.Wire pts={[[390,230],[320,230]]}/><S.Dot at={[390,230]}/><S.CurrentSource a={[320,230]} b={[320,320]} label="I_B−" flipLabel/><S.Ground at={[320,320]}/>
 </S.Schematic></S.Figure>;
}
export function ErrorVsSourceFigure(){
 const vos=100e-6,ibp=50e-9,ibm=55e-9,ng=11,rp=1e5*1e4/1.1e5;
 const rs=logs(10,1e6,240);
 return <S.Figure plot caption="Output error of the gain-of-11 amplifier ($R_F$ = 100 kΩ, $R_G$ = 10 kΩ) against source resistance, with $V_{OS}$ = +100 µV, $I_{B+}$ = 50 nA and $I_{B-}$ = 55 nA. The offset term (gray) is fixed; the $I_{B-}$ term through $R_F \parallel R_G$ is fixed; the $I_{B+}$ term grows with $R_{SRC}$ and subtracts. Their signed sum (green) passes through zero near 12 kΩ and becomes large and negative for high source resistance. Matching $R_{SRC}$ to $R_F \parallel R_G$ = 9.09 kΩ (mark) leaves only offset plus the offset-current term.">
 <Plot curves={[{name:'Total output error',color:S.green,points:rs.map(r=>[r,ng*(vos-ibp*r+ibm*rp)*1e3] as [number,number])},{name:'Offset term, 11 V_OS',color:S.gray,dashed:true,points:[[10,ng*vos*1e3],[1e6,ng*vos*1e3]]},{name:'Bias term, 11 (I_B− R_F∥R_G − I_B+ R_SRC)',color:S.orange,points:rs.map(r=>[r,ng*(ibm*rp-ibp*r)*1e3] as [number,number])}]}
  marks={[{at:[rp,ng*(vos-ibp*rp+ibm*rp)*1e3],label:'R_SRC = R_F∥R_G',pos:'ne'}]}
  xScale="log" xRange={[10,1e6]} yRange={[-20,10]} xLabel="SOURCE RESISTANCE R_SRC / Ω" yLabel="OUTPUT ERROR / mV" description="Signed output error against source resistance: flat near six millivolts for small sources, falling through zero near twelve kilohms to large negative values."/></S.Figure>;
}
export function ThermocoupleBudgetFigure(){
 // Input-referred worst-case errors in µV for a gain-100 thermocouple amplifier over a 40 °C ambient change.
 const rows:[string,number,number,number][]=[['Offset (uncalibrated)',1000,25,5],['Offset drift × 40 °C',400,12,.8],['Bias × source mismatch',50,.5,.1],['CMRR, 1 V common mode',100,1,.3],['Gain error 0.05% at 10 mV',5,5,5],['0.1–10 Hz noise (p-p)',2,.25,.4]];
 const groups:[string,number,string][]=[['General purpose',1,S.orange],['Precision bipolar',2,S.green],['Chopper',3,S.ink]];
 const curves=groups.map(([name,col,color],gi)=>({name,color,points:rows.flatMap((r,i)=>{const x0=i+.12+gi*.26,v=Math.max(.01,r[col] as number);return [[x0,.01],[x0,v],[x0+.22,v],[x0+.22,.01]] as [number,number][];})}));
 return <S.Figure plot caption="Input-referred error budget, in microvolts on a log scale, for a gain-of-100 thermocouple amplifier (about 41 µV/°C) that must hold ±0.5 °C, a 20 µV budget. Six contributions for three classes of op amp: a general-purpose part (orange), a precision bipolar part (green) and an auto-zero chopper (black). Values are representative, not a particular device. The general-purpose part fails on offset and drift alone; the precision part passes if its initial offset is calibrated out; the chopper passes without calibration, and the gain resistors become the largest error.">
 <Plot curves={[...curves,{name:'20 µV budget',color:S.gray,dashed:true,points:[[0,20],[6,20]]}]} yScale="log" xRange={[0,6]} yRange={[.1,2000]} xTicks={[]} xLabel="OFFSET · DRIFT · BIAS · CMRR · GAIN · NOISE" yLabel="INPUT-REFERRED ERROR / µV" description="Grouped bar chart on a log scale comparing six error sources for three op-amp types against a twenty microvolt budget."/></S.Figure>;
}
export function OffsetNullCircuit(){
 const at:Pt=[430,170],p=S.opAmpPins({at});
 return <S.Figure caption="External offset nulling for an inverting amplifier. A potentiometer across the ±15 V rails gives a wiper voltage anywhere between them; the 150 kΩ / 10 Ω divider scales that to ±1 mV at the plus input. Because the plus input is amplified by the noise gain, this cancels an input offset of up to ±1 mV, exactly like a small voltage in series with the input. Nulling corrects one temperature only; drift remains.">
 <S.Schematic width={720} height={380} description="Inverting amplifier with ten kilohm input and one hundred kilohm feedback; a potentiometer between plus and minus fifteen volts feeds a one hundred fifty kilohm and ten ohm divider at the noninverting input.">
  <S.Terminal at={[90,155]} label="v_i"/><S.Res a={[90,155]} b={[280,155]} label="R_IN" value="10 kΩ"/><S.Wire pts={[[280,155],p.minus]}/><S.Dot at={[330,155]}/>
  <S.Wire pts={[[330,155],[330,80],[400,80]]}/><S.Res a={[400,80]} b={[560,80]} label="R_F" value="100 kΩ"/><S.Wire pts={[[560,80],[560,170]]}/>
  <S.OpAmp at={at}/><S.Wire pts={[p.out,[640,170]]}/><S.Dot at={[560,170]}/><S.Terminal at={[640,170]} label="v_o" side="right"/>
  <S.Wire pts={[p.plus,[400,185],[400,260]]}/><S.Res a={[400,260]} b={[400,350]} label="10 Ω"/><S.Ground at={[400,350]}/><S.Dot at={[400,260]}/>
  <S.Res a={[400,260]} b={[250,260]} label="150 kΩ"/><S.Wire pts={[[250,260],[170,260]]}/>
  <S.Rail at={[170,200]} label="+15 V"/><S.Res a={[170,200]} b={[170,260]} label="10 kΩ" value="pot" flipLabel/><S.Res a={[170,260]} b={[170,330]} flipLabel/><S.Rail at={[170,330]} label="−15 V" down/>
  <S.Dot at={[170,260]}/><S.Text x={182} y={252} kind="value">wiper</S.Text>
 </S.Schematic></S.Figure>;
}

/* ---------- Chapter 74: bandwidth, slew and stability ---------- */
export function ClosedLoopBodeFigure(){
 const A0=1e5,fp=10,fs=logs(1,1e7,300),ol=(f:number)=>A0/Math.hypot(1,f/fp);
 const cl=(f:number,ng:number)=>{const re=1+ng/A0,im=f*ng/(A0*fp);return ng/Math.hypot(re,im);};
 return <S.Figure plot caption="Open-loop gain of a single-pole op amp ($A_0 = 10^5$, $f_t$ = 1 MHz, black) and the closed-loop gain at noise gains of 1, 10 and 100. Each closed-loop curve is flat at $NG$ until it meets the open-loop curve, then follows it down. Its bandwidth is $f_t/NG$: 1 MHz, 100 kHz and 10 kHz. The vertical distance between the two curves is the loop gain, so at any frequency the available accuracy can be read straight off the plot.">
 <Plot curves={[{name:'Open loop A(f)',color:S.ink,points:fs.map(f=>[f,20*Math.log10(ol(f))] as [number,number])},...([[1,S.green],[10,S.gray],[100,S.orange]] as [number,string][]).map(([ng,c])=>({name:'Closed loop, NG = '+ng,color:c,points:fs.map(f=>[f,20*Math.log10(cl(f,ng))] as [number,number])}))]}
  xScale="log" xRange={[1,1e7]} yRange={[-20,110]} xLabel="FREQUENCY / Hz" yLabel="GAIN / dB" description="Open-loop gain falling at twenty decibels per decade from ten hertz; three flat closed-loop gains that each turn down where they meet it."/></S.Figure>;
}
export function SlewDistortionFigure(){
 const SR=.5e6,f=5e4,A=2,wc=2*Math.PI*1e6,dt=2e-9,out:[number,number][]=[],inp:[number,number][]=[];let y=0;
 for(let n=0;n<=20000;n++){const t=n*dt,x=A*Math.sin(2*Math.PI*f*t);const dy=Math.max(-SR,Math.min(SR,wc*(x-y)));y+=dy*dt;if(n%40===0&&t>=0){out.push([t*1e6,y]);inp.push([t*1e6,x]);}}
 return <S.Figure plot caption="A follower with 1 MHz bandwidth but a 0.5 V/µs slew rate, driven by a 2 V peak sine at 50 kHz. The sine's steepest slope, $2\pi fV_{pk}$ = 0.63 V/µs, exceeds what the op amp can deliver, so through each zero crossing the output ramps at its maximum rate and falls behind. The result is a lagging, triangular waveform, although a small-signal analysis predicts a perfect copy at this frequency.">
 <Plot curves={[{name:'Input',color:S.gray,dashed:true,points:inp},{name:'Slew-limited output',color:S.orange,points:out}]} xRange={[0,40]} yRange={[-2.5,2.5]} xLabel="TIME / µs" yLabel="VOLTAGE / V" description="Sine input and a lagging, triangle-like output limited to half a volt per microsecond."/></S.Figure>;
}
export function FullPowerFigure(){
 const fs=logs(1e3,1e7,300);
 return <S.Figure plot caption="The largest undistorted sine an op amp can deliver, against frequency, for an output swing of ±13 V and three slew rates. At low frequency the rails limit the amplitude; above the full-power bandwidth $SR/2\pi V_{max}$ the slew rate does, and the allowed amplitude falls as $1/f$. A 0.5 V/µs part delivers full swing only to 6 kHz, and 1 V peak only to 80 kHz. Small-signal bandwidth is a separate, higher limit.">
 <Plot curves={([[.5,S.orange],[13,S.gray],[100,S.green]] as [number,string][]).map(([sr,c])=>({name:'SR = '+sr+' V/µs',color:c,points:fs.map(f=>[f,Math.min(13,sr*1e6/(2*Math.PI*f))] as [number,number])}))}
  xScale="log" yScale="log" xRange={[1e3,1e7]} yRange={[.01,20]} xLabel="FREQUENCY / Hz" yLabel="MAX UNDISTORTED PEAK / V" description="Maximum sine amplitude is flat at thirteen volts at low frequency, then falls as one over frequency beyond a corner set by the slew rate."/></S.Figure>;
}
export function PhaseMarginStepFigure(){
 const A0=1e5,w1=2*Math.PI*10,w2=2*Math.PI*2e5,sim=(ng:number)=>{const b=1/ng,a2=1/(w1*w2),a1=1/w1+1/w2,a0=1+A0*b,fin=A0/a0,dt=2e-9,out:[number,number][]=[];let x=0,v=0;
  for(let n=0;n<=6000;n++){if(n%10===0)out.push([n*dt*1e6,x/fin]);const acc=(A0-a1*v-a0*x)/a2;v+=acc*dt;x+=v*dt;}return out;};
 return <S.Figure plot caption="Normalized small-signal step response of an op amp with a 1 MHz dominant-pole scale and a second pole at 200 kHz, at noise gains of 1, 2 and 10. The phase margins are 25°, 35° and 65°, and the overshoots 49%, 35% and 4%. The same op amp that rings badly as a follower is well behaved at a gain of 10. A datasheet's “stable for gains ≥ 10” means exactly this.">
 <Plot curves={([[1,'NG = 1, PM 25°',S.orange],[2,'NG = 2, PM 35°',S.gray],[10,'NG = 10, PM 65°',S.green]] as [number,string,string][]).map(([ng,name,color])=>({name,color,points:sim(ng)}))}
  xRange={[0,12]} yRange={[0,1.6]} xLabel="TIME / µs" yLabel="OUTPUT / FINAL VALUE" description="Three step responses: strongly ringing at noise gain one, moderately at two, nearly clean at ten."/></S.Figure>;
}

/* ---------- Chapter 75: inside a bipolar op amp ---------- */
export function SlewGbwFigure(){
 const fu=logs(1e5,1e8,200),VT=.02585;
 const lines:[string,number,string][]=[['BJT pair, SR = 2V_T · 2πf_u',2*VT,S.orange],['BJT pair with I_T R_E = 1 V degeneration',2*VT+1,S.gray],['MOS pair, u_0 = 0.2 V',.2,S.green],['MOS pair, u_0 = 0.5 V',.5,S.ink]];
 return <S.Figure plot caption="Slew rate against unity-gain frequency for different input stages. With a dominant Miller capacitor, $f_u = g_{m1}/2\pi C_C$ and $SR = I_T/C_C$, so $SR = (I_T/g_{m1})\cdot 2\pi f_u$. For an undegenerated bipolar pair $I_T/g_{m1} = 2V_T$ ≈ 52 mV: only about 0.33 V/µs per megahertz, which is why classic bipolar op amps slew slowly. Emitter degeneration or a MOS input with larger overdrive raises $I_T/g_{m1}$ and the slew rate in proportion, at the cost of offset and noise.">
 <Plot curves={lines.map(([name,k,color])=>({name,color,points:fu.map(f=>[f,k*2*Math.PI*f/1e6] as [number,number])}))} xScale="log" yScale="log" xRange={[1e5,1e8]} yRange={[.01,1000]} xLabel="UNITY-GAIN FREQUENCY f_u / Hz" yLabel="SLEW RATE / (V/µs)" description="Four parallel lines of slew rate against unity-gain frequency; the undegenerated bipolar stage is lowest."/></S.Figure>;
}
export function ShortCircuitLimitCircuit(){
 const q1=S.bjtPins({at:[330,150]}),q2=S.bjtPins({at:[250,210],flip:true});
 return <S.Figure caption="Output short-circuit protection for the sourcing half of a bipolar output stage. The output current flows through a 27 Ω sense resistor. When its drop reaches about 0.65 V, at 24 mA, $Q_2$ turns on and steals base drive from the output transistor $Q_1$. The output then behaves as a current source rather than shorting the supply. The sinking half has a mirror-image circuit.">
 <S.Schematic width={680} height={350} description="NPN output emitter follower with twenty-seven ohm emitter sense resistor; a second NPN across base and output end of the resistor limits base drive.">
  <S.Rail at={[342,30]} label="+V_S"/><S.Wire pts={[[342,30],q1.c]}/><S.Bjt at={[330,150]}/>
  <S.Terminal at={[170,150]} label="drive"/><S.Wire pts={[[170,150],q1.b]}/><S.Dot at={[238,150]}/>
  <S.Wire pts={[q1.e,[342,220]]}/><S.Res a={[342,220]} b={[342,300]} label="R_sense" value="27 Ω"/><S.Wire pts={[[342,300],[560,300]]}/><S.Dot at={[342,300]}/><S.Terminal at={[560,300]} label="output" side="right"/>
  <S.Wire pts={[[238,150],q2.c]}/><S.Bjt at={[250,210]} flip/><S.Wire pts={[q2.b,[342,210]]}/><S.Dot at={[342,210]}/><S.Wire pts={[q2.e,[238,300],[342,300]]}/>
  <S.Text x={380} y={155}>Q_1</S.Text><S.Text x={200} y={215} anchor="end">Q_2</S.Text><S.CurrentArrow at={[450,300]} dir="right" label="I_out"/>
 </S.Schematic></S.Figure>;
}

/* ---------- Chapter 76: inside a CMOS op amp ---------- */
export function RailToRailInputFigure(){
 // 3.3 V supply, |V_T| = 0.7 V, u = 0.2 V per input, tail compliance 0.15 V. Each pair's gm fades out over 0.25 V near its limit.
 const VDD=3.3,ramp=(x:number)=>Math.max(0,Math.min(1,x/.25));
 const gN=(v:number)=>ramp(v-1.05),gP=(v:number)=>ramp(VDD-1.05-v);
 const vs=xs(0,3.3,330);
 return <S.Figure plot caption="Normalized input transconductance against common-mode voltage for a rail-to-rail input made of an NMOS pair and a PMOS pair in parallel (3.3 V supply, $|V_T|$ = 0.7 V, 0.2 V overdrive, 0.15 V tail compliance). The NMOS pair works above about 1.05 V, the PMOS pair below about 2.25 V. Between them both work, and the total transconductance doubles; near either rail only one works. Without a constant-$g_m$ circuit, the unity-gain frequency, noise and offset all change as the input moves.">
 <Plot curves={[{name:'NMOS pair',color:S.gray,points:vs.map(v=>[v,gN(v)] as [number,number])},{name:'PMOS pair',color:S.orange,points:vs.map(v=>[v,gP(v)] as [number,number])},{name:'Total',color:S.green,points:vs.map(v=>[v,gN(v)+gP(v)] as [number,number])}]}
  xRange={[0,3.3]} yRange={[0,2.2]} xLabel="INPUT COMMON-MODE VOLTAGE / V" yLabel="g_m / g_m OF ONE PAIR" description="NMOS transconductance rises above one volt, PMOS falls above two point two volts; the total is one near the rails and two in the middle."/></S.Figure>;
}
export function RroOutputCircuit(){
 const mp=S.fetPins({at:[400,110],kind:'pmos'}),mn=S.fetPins({at:[400,270]});
 return <S.Figure caption="A rail-to-rail output stage. The output devices are common-source, with their drains at the output: the PMOS can pull the output to within $I_LR_{on,P}$ of the positive rail, the NMOS to within $I_LR_{on,N}$ of ground, because neither needs a gate–source voltage across the output. The gates are driven separately by a class-AB control circuit (not shown) that sets the idle current. The price is a high open-loop output impedance, which only feedback reduces.">
 <S.Schematic width={640} height={380} description="PMOS from positive rail to output and NMOS from output to ground, drains joined at the output; gates driven separately from a class-AB control block.">
  <S.Rail at={[414,30]} label="V_DD"/><S.Wire pts={[[414,30],mp.s]}/><S.Fet at={[400,110]} kind="pmos"/><S.Wire pts={[mp.d,mn.d]}/><S.Fet at={[400,270]}/><S.Wire pts={[mn.s,[414,350]]}/><S.Ground at={[414,350]}/>
  <S.Wire pts={[[414,190],[560,190]]}/><S.Dot at={[414,190]}/><S.Terminal at={[560,190]} label="v_out" side="right"/>
  <S.Terminal at={[230,110]} label="gate drive P"/><S.Wire pts={[[230,110],mp.g]}/><S.Terminal at={[230,270]} label="gate drive N"/><S.Wire pts={[[230,270],mn.g]}/>
  <S.Text x={450} y={115}>M_P</S.Text><S.Text x={450} y={275}>M_N</S.Text>
 </S.Schematic></S.Figure>;
}
export function RroSwingFigure(){
 const il=xs(0,20,200);
 return <S.Figure plot caption="How close a rail-to-rail output gets to the rail, against load current, for output devices with 25 Ω and 75 Ω of on-resistance (plus about 10 mV of light-load headroom). “Rail-to-rail” is exact only at zero load: at 10 mA a 75 Ω device stops 0.76 V short of the rail. Datasheets specify the swing at stated load currents for this reason.">
 <Plot curves={([[25,S.green],[75,S.orange]] as [number,string][]).map(([r,c])=>({name:'R_on = '+r+' Ω',color:c,points:il.map(i=>[i,.01+i*1e-3*r] as [number,number])}))} xRange={[0,20]} yRange={[0,1.6]} xLabel="LOAD CURRENT / mA" yLabel="DISTANCE FROM RAIL / V" description="Straight lines: output headroom grows with load current, steeper for the higher on-resistance."/></S.Figure>;
}
export function LeakageTempFigure(){
 const T=xs(-40,125,200),ib=(t:number)=>1e-12*2**((t-25)/10);
 return <S.Figure plot caption="Input bias current of a CMOS op amp, dominated by its input protection diodes' leakage, doubling every 10 °C from 1 pA at 25 °C. Through a 1 MΩ source each picoamp is a microvolt of input error, so the same curve reads in microvolts: 1 mV at 125 °C. A specification of “1 pA typical” describes room temperature; a high-impedance design must be checked at the hottest operating point.">
 <Plot curves={[{name:'Bias current in pA = error through 1 MΩ in µV',color:S.orange,points:T.map(t=>[t,ib(t)*1e12] as [number,number])}]}
  yScale="log" xRange={[-40,125]} yRange={[.01,2000]} xLabel="TEMPERATURE / °C" yLabel="pA, OR µV" description="Bias current rising exponentially with temperature from about a hundredth of a picoamp at minus forty to a nanoamp at one hundred twenty five degrees."/></S.Figure>;
}

/* ---------- Chapter 77: choosing an input technology ---------- */
const KB=1.380649e-23;
const TECH:[string,number,number,string][]=[['Low-noise bipolar: 1 nV, 2 pA',1e-9,2e-12,S.orange],['JFET: 5 nV, 5 fA',5e-9,5e-15,S.green],['CMOS: 15 nV, 1 fA',15e-9,1e-15,S.ink]];
export function TechNoiseFigure(){
 const rs=logs(10,1e9,300),th=(r:number)=>Math.sqrt(4*KB*300*r);
 return <S.Figure plot caption="Total input noise density at 1 kHz against source resistance for three illustrative input technologies, $e_{tot} = \sqrt{e_n^2 + (i_nR_S)^2 + 4kTR_S}$, with the source resistor alone (dashed). The bipolar part wins below about 1 kΩ, where its 1 nV/√Hz matters; above about 100 kΩ its current noise flowing through the source dominates. The JFET is best from roughly 10 kΩ to 100 MΩ. At gigaohms only the CMOS part's femtoamp current noise keeps the total near the resistor's own noise. The values are teaching examples, not specific products.">
 <Plot curves={[{name:'Source resistor alone',color:S.gray,dashed:true,points:rs.map(r=>[r,th(r)*1e9] as [number,number])},...TECH.map(([name,en,inn,color])=>({name,color,points:rs.map(r=>[r,Math.sqrt(en*en+(inn*r)**2+th(r)**2)*1e9] as [number,number])}))]}
  xScale="log" yScale="log" xRange={[10,1e9]} yRange={[.5,1e5]} xLabel="SOURCE RESISTANCE R_S / Ω" yLabel="TOTAL NOISE / (nV/√Hz)" description="Log-log plot of total noise against source resistance; bipolar lowest at low resistance, then rising steeply; JFET and CMOS following the resistor line up to high resistance."/></S.Figure>;
}
export function ChopperBlockFigure(){
 return <S.Figure caption="The idea of chopper stabilization. A switch modulator multiplies the input by a square wave at the chopping frequency $f_{ch}$, moving the signal up to $f_{ch}$. The amplifier adds its own offset and $1/f$ noise, which stay at low frequency. A second, synchronized demodulator moves the signal back to baseband and moves the offset and flicker noise up to $f_{ch}$, where a low-pass filter removes them. What remains is a nearly offset-free signal, plus some ripple and switching artifacts at $f_{ch}$.">
 <S.Schematic width={720} height={200} description="Block diagram: input, modulator, amplifier with offset added, demodulator, low-pass filter, output.">
  <S.Terminal at={[30,100]} label="v_in" side="above"/><S.Wire pts={[[30,100],[80,100]]}/><Block x={80} y={70} w={100} ports={[[80,100],[180,100]]}>× sq(f_ch)</Block>
  <S.Wire pts={[[180,100],[232,100]]}/><Sum at={[250,100]} from="above"/><S.Text x={250} y={52} anchor="middle" kind="value">V_OS + 1/f</S.Text><S.Terminal at={[250,64]} side="above"/><S.Wire pts={[[250,64],[250,82]]}/>
  <S.Wire pts={[[268,100],[300,100]]}/><Block x={300} y={70} w={90} ports={[[300,100],[390,100]]}>gain A</Block>
  <S.Wire pts={[[390,100],[430,100]]}/><Block x={430} y={70} w={100} ports={[[430,100],[530,100]]}>× sq(f_ch)</Block>
  <S.Wire pts={[[530,100],[570,100]]}/><Block x={570} y={70} w={90} ports={[[570,100],[660,100]]}>low-pass</Block><S.Wire pts={[[660,100],[700,100]]}/><S.Terminal at={[700,100]} label="v_out" side="above"/>
  <S.Text x={130} y={150} anchor="middle" kind="value">signal → f_ch</S.Text><S.Text x={480} y={150} anchor="middle" kind="value">signal → DC, offset → f_ch</S.Text>
 </S.Schematic></S.Figure>;
}
export function LowFreqNoiseFigure(){
 const fs=logs(.01,1e5,300);
 const d:[string,number,number,string][]=[['Bipolar, 3 nV, corner 3 Hz',3,3,S.orange],['CMOS, 10 nV, corner 2 kHz',10,2000,S.ink],['Chopper, 20 nV, no 1/f',20,0,S.green]];
 return <S.Figure plot caption="Input voltage-noise spectra of three illustrative amplifiers. Above a few kilohertz the bipolar part is quietest. Below 1 Hz the CMOS part's flicker noise rises above both others, and the chopper, whose white floor is the highest, is the quietest of all: chopping has removed its $1/f$ region. Integrated over 0.1–10 Hz, the three give roughly 0.015, 0.96 and 0.063 µV rms.">
 <Plot curves={d.map(([name,en,fc,color])=>({name,color,points:fs.map(f=>[f,en*Math.sqrt(1+fc/f)] as [number,number])}))} xScale="log" yScale="log" xRange={[.01,1e5]} yRange={[1,10000]} xLabel="FREQUENCY / Hz" yLabel="VOLTAGE NOISE / (nV/√Hz)" description="Three noise spectra: CMOS rises steeply at low frequency, bipolar rises only below a few hertz, chopper flat at twenty nanovolts."/></S.Figure>;
}

/* ---------- Chapter 78: noninverting amplifiers and buffers ---------- */
export function AcNoninvCircuit(){
 const at:Pt=[420,170],p=S.opAmpPins({at,plusTop:true});
 return <S.Figure caption="An AC-coupled noninverting amplifier on split supplies. $C_{in}$ blocks the source's DC; $R_B$ gives the plus input a DC path to ground, without which its bias current would charge $C_{in}$ until the output saturated. $C_G$ in series with $R_G$ makes the DC gain exactly 1, so the op amp's offset is not amplified by 11, while above a few hertz the gain is $1 + R_F/R_G$ = 11. Values: $C_{in}$ = 1 µF, $R_B$ = 100 kΩ, $R_F$ = 100 kΩ, $R_G$ = 10 kΩ, $C_G$ = 10 µF.">
 <S.Schematic width={720} height={380} description="Source through input coupling capacitor to the noninverting input with a one hundred kilohm bias resistor to ground; feedback resistor from output to inverting input, and gain resistor in series with a capacitor to ground.">
  <S.Source kind="ac" a={[60,330]} b={[60,155]} label="v_s"/><S.Ground at={[60,330]}/><S.Cap a={[60,155]} b={[200,155]} label="C_in" value="1 µF"/><S.Wire pts={[[200,155],p.plus]}/>
  <S.Res a={[260,155]} b={[260,330]} label="R_B" value="100 kΩ"/><S.Ground at={[260,330]}/><S.Dot at={[260,155]}/>
  <S.OpAmp at={at} plusTop/><S.Wire pts={[p.out,[650,170]]}/><S.Dot at={[600,170]}/><S.Terminal at={[650,170]} label="v_out" side="above"/>
  <S.Wire pts={[p.minus,[380,185],[380,240]]}/><S.Res a={[380,240]} b={[600,240]} label="R_F" value="100 kΩ"/><S.Wire pts={[[600,240],[600,170]]}/><S.Dot at={[380,240]}/>
  <S.Res a={[380,240]} b={[380,300]} label="R_G" value="10 kΩ" flipLabel/><S.Cap a={[380,300]} b={[380,360]} label="C_G" value="10 µF" flipLabel/><S.Ground at={[380,360]}/>
 </S.Schematic></S.Figure>;
}
export function AcNoninvBodeFigure(){
 const fs=logs(.1,1e6,300),ft=1e6;
 const H=(f:number)=>{const w=2*Math.PI*f;
  // input high-pass (R_B·C_in = 0.1 s), gain 1 + R_F/(R_G + 1/jwC_G), finite GBW one pole at ft/NG.
  const hp=w*.1/Math.hypot(1,w*.1);
  const zr=1e4,zi=-1/(w*10e-6),den=zr*zr+zi*zi,gr=1+1e5*zr/den,gi=-1e5*zi/den,ng=Math.hypot(gr,gi);
  return hp*ng/Math.hypot(1,f*ng/ft);};
 return <S.Figure plot caption="Gain of the AC-coupled amplifier with a 1 MHz op amp. The input coupling ($R_BC_{in}$ = 0.1 s) rolls off below 1.6 Hz; $C_G$ brings the gain from 11 down to 1 below about 1.6 Hz too (its zero with $R_G$ is at 1.6 Hz, its pole with $R_F + R_G$ at 0.14 Hz). The top end is the op amp's $f_t/NG$ ≈ 91 kHz. Choose the two low-frequency corners well below the signal band, and separate them to avoid peaking.">
 <Plot curves={[{name:'|v_out / v_s|',color:S.green,points:fs.map(f=>[f,20*Math.log10(H(f))] as [number,number])},{name:'Gain 11 (20.8 dB)',color:S.gray,dashed:true,points:[[.1,20.83],[1e6,20.83]]}]} xScale="log" xRange={[.1,1e6]} yRange={[-30,25]} xLabel="FREQUENCY / Hz" yLabel="GAIN / dB" description="Band-pass response: rising below a few hertz, flat at twenty point eight decibels, falling above about ninety kilohertz."/></S.Figure>;
}
export function ImpedanceScaleFigure(){
 const rg=logs(100,1e6,200),KBT=1.380649e-23*300;
 return <S.Figure plot caption="Choosing the impedance level of a gain-of-11 divider ($R_F = 10R_G$). Its thermal noise referred to the input, $\sqrt{4kT(R_F\parallel R_G)}$ (green), equals a typical 5 nV/√Hz op amp's (dashed) at $R_G$ ≈ 1.6 kΩ and dominates above it. The output error from 50 nA of bias current through $R_F\parallel R_G$ (orange, in µV referred to the input) rises in proportion. Low values cost output current: 2 V across 11 kΩ is 180 µA, across 1.1 kΩ 1.8 mA.">
 <Plot curves={[{name:'Divider noise / (nV/√Hz)',color:S.green,points:rg.map(r=>[r,Math.sqrt(4*KBT*r*10/11)*1e9] as [number,number])},{name:'Op amp e_n = 5 nV/√Hz',color:S.gray,dashed:true,points:[[100,5],[1e6,5]]},{name:'Bias error 50 nA × R_F∥R_G / µV',color:S.orange,points:rg.map(r=>[r,50e-9*r*10/11*1e6] as [number,number])}]}
  xScale="log" yScale="log" xRange={[100,1e6]} yRange={[.1,1e5]} xLabel="GAIN RESISTOR R_G / Ω" yLabel="nV/√Hz, OR µV" description="Divider noise and bias error both rise with resistor value, crossing the op amp's noise at about 1.6 kilohms."/></S.Figure>;
}
export function BootstrapBiasCircuit(){
 const at:Pt=[430,160],p=S.opAmpPins({at,plusTop:true});
 return <S.Figure caption="Bootstrapping the bias resistor of an AC-coupled follower. The plus input needs a DC return, but a plain 100 kΩ resistor would load the source with 100 kΩ. Split it into two 51 kΩ halves and drive their midpoint from the output through $C_B$. For signals, the output follows the input, so the upper resistor has almost no signal across it and carries almost no signal current: it looks like $R/(1 - A_v)$, many megohms. At DC it is an ordinary 102 kΩ path.">
 <S.Schematic width={720} height={360} description="Follower with input coupling capacitor; bias path of two fifty-one kilohm resistors from the noninverting input to ground, with their midpoint coupled to the output by a capacitor.">
  <S.Source kind="ac" a={[60,320]} b={[60,145]} label="v_s"/><S.Ground at={[60,320]}/><S.Cap a={[60,145]} b={[200,145]} label="C_in" value="0.47 µF"/><S.Wire pts={[[200,145],p.plus]}/>
  <S.Res a={[260,145]} b={[260,230]} label="51 kΩ"/><S.Res a={[260,230]} b={[260,320]} label="51 kΩ"/><S.Ground at={[260,320]}/><S.Dot at={[260,145]}/><S.Dot at={[260,230]}/>
  <S.OpAmp at={at} plusTop/><S.Wire pts={[p.out,[660,160]]}/><S.Dot at={[580,160]}/><S.Terminal at={[660,160]} label="v_out" side="above"/>
  <S.Wire pts={[p.minus,[400,175],[400,90],[580,90],[580,160]]}/>
  <S.Wire pts={[[580,160],[580,230],[470,230]]}/><S.Cap a={[470,230]} b={[340,230]} label="C_B" value="4.7 µF"/><S.Wire pts={[[340,230],[260,230]]}/>
 </S.Schematic></S.Figure>;
}

/* ---------- Chapter 79: inverting and summing amplifiers ---------- */
export function SummingDacCircuit(){
 const at:Pt=[470,220],p=S.opAmpPins({at});
 const rows:[string,string,number][]=[['b₀ (LSB)','80 kΩ',70],['b₁','40 kΩ',125],['b₂','20 kΩ',180],['b₃ (MSB)','10 kΩ',235]];
 return <S.Figure caption="A 4-bit binary-weighted summing DAC. Each bit switches its input between 2.5 V and ground; its resistor turns that into a current into the virtual-ground summing node, weighted 1 : 2 : 4 : 8. All the currents flow through $R_F$, so $v_{out} = -2.5\text{ V}\cdot R_F(b_0/80\text{k} + b_1/40\text{k} + b_2/20\text{k} + b_3/10\text{k})$: 0 to −4.69 V in 0.3125 V steps. Because the summing node stays at 0 V, the bits do not interact.">
 <S.Schematic width={720} height={330} description="Four inputs through eighty, forty, twenty and ten kilohm resistors into the inverting input of an op amp with ten kilohm feedback; noninverting input grounded.">
  {rows.map(([lab,val,y])=><g key={lab}><S.Terminal at={[130,y]} label={lab}/><S.Res a={[130,y]} b={[300,y]} label={val}/><S.Wire pts={[[300,y],[360,y]]}/></g>)}
  <S.Wire pts={[[360,70],[360,235]]}/><S.Wire pts={[[360,205],p.minus]}/><S.Dot at={[360,125]}/><S.Dot at={[360,180]}/><S.Dot at={[360,205]}/>
  <S.Wire pts={[[360,70],[360,30],[430,30]]}/><S.Dot at={[360,70]}/><S.Res a={[430,30]} b={[590,30]} label="R_F" value="10 kΩ"/><S.Wire pts={[[590,30],[590,220]]}/>
  <S.OpAmp at={at}/><S.Wire pts={[p.out,[660,220]]}/><S.Dot at={[590,220]}/><S.Terminal at={[660,220]} label="v_out" side="above"/>
  <S.Wire pts={[p.plus,[440,235],[440,300]]}/><S.Ground at={[440,300]}/><S.Text x={350} y={250} anchor="end" kind="value">summing node: virtual ground</S.Text>
 </S.Schematic></S.Figure>;
}
export function DacStaircaseFigure(){
 const out=(c:number,e:number)=>{let s=0;[80e3,40e3,20e3,1e4*(1+e)].forEach((r,i)=>{if(c>>i&1)s+=2.5/r;});return 1e4*s;};
 const stairs=(e:number)=>Array.from({length:16},(_,c)=>[[c,out(c,e)],[c+1,out(c,e)]] as [number,number][]).flat();
 return <S.Figure plot caption="Output magnitude against input code for the summing DAC (sign inverted for readability), ideal (green) and with the MSB resistor 5% high (orange, exaggerated to make it visible). The MSB error shrinks every step that turns the MSB on, so the step from code 7 to 8 is too small. For a DAC with $n$ bits, the MSB resistor must match the LSB weight to better than $2^{-n}$, about 0.02% at 12 bits, which is why practical DACs use an R–2R ladder of only two resistor values.">
 <Plot curves={[{name:'Ideal',color:S.green,points:stairs(0)},{name:'MSB resistor 5% high',color:S.orange,dashed:true,points:stairs(.05)}]} xRange={[0,16]} yRange={[0,5]} xTicks={[0,4,8,12,16]} xLabel="INPUT CODE" yLabel="|v_out| / V" description="Staircase rising in 0.3125 volt steps; the version with an MSB error has a small step between codes seven and eight."/></S.Figure>;
}
export function LevelShiftCircuit(){
 const at:Pt=[430,180],p=S.opAmpPins({at});
 return <S.Figure caption="Fitting a ±10 V signal into a 0–3.3 V ADC from a single 3.3 V supply. The inverting stage scales by $-R_F/R_{IN}$ = −0.1616; the reference at the plus input, amplified by the noise gain 1.1616, lifts the output to mid-supply. The output is $1.65\text{ V} - 0.1616\,v_{in}$, from 3.27 V at −10 V to 0.03 V at +10 V. A rail-to-rail-output op amp is required, and the reference's noise and drift reach the output multiplied by 1.16.">
 <S.Schematic width={720} height={380} description="Inverting amplifier with sixty kilohm input and ten kilohm feedback on a single supply; the noninverting input is held at 1.42 volts by a divider from the supply.">
  <S.Terminal at={[90,165]} label="v_in, ±10 V"/><S.Res a={[90,165]} b={[290,165]} label="R_IN" value="60.4 kΩ"/><S.Wire pts={[[290,165],p.minus]}/><S.Dot at={[340,165]}/>
  <S.Wire pts={[[340,165],[340,90],[400,90]]}/><S.Res a={[400,90]} b={[560,90]} label="R_F" value="9.76 kΩ"/><S.Wire pts={[[560,90],[560,180]]}/>
  <S.OpAmp at={at}/><S.Wire pts={[p.out,[650,180]]}/><S.Dot at={[560,180]}/><S.Terminal at={[650,180]} label="to ADC" side="above"/>
  <S.Wire pts={[p.plus,[390,195],[390,270]]}/><S.Dot at={[390,270]}/><S.Text x={402} y={286} kind="value">1.42 V</S.Text>
  <S.Rail at={[250,230]} label="+3.3 V"/><S.Res a={[250,230]} b={[250,270]} label="18.7 kΩ" flipLabel/><S.Res a={[250,270]} b={[250,350]} label="14.1 kΩ" flipLabel/><S.Ground at={[250,350]}/>
  <S.Wire pts={[[250,270],[390,270]]}/><S.Dot at={[250,270]}/><S.Cap a={[330,270]} b={[330,350]} label="1 µF"/><S.Ground at={[330,350]}/><S.Dot at={[330,270]}/>
 </S.Schematic></S.Figure>;
}
export function MixerBandwidthFigure(){
 const n=xs(1,16,15);
 return <S.Figure plot caption="An audio mixer sums $N$ inputs at unity weight. Each extra input resistor adds another path from the summing node to (AC) ground, so the noise gain is $N + 1$ and the bandwidth $f_t/(N+1)$ falls with every channel, even unused ones whose inputs sit at zero. With a 10 MHz op amp, 16 channels still leave 590 kHz, but the op amp's voltage noise is now multiplied by 17.">
 <Plot curves={[{name:'Bandwidth f_t/(N+1), f_t = 10 MHz',color:S.green,points:n.map(k=>[k,10/(k+1)] as [number,number])},{name:'Noise gain N + 1 (right scale ÷ 4)',color:S.orange,dashed:true,points:n.map(k=>[k,(k+1)/4] as [number,number])}]}
  xRange={[1,16]} yRange={[0,5.2]} xLabel="NUMBER OF INPUTS N" yLabel="MHz, OR NOISE GAIN / 4" description="Bandwidth falls from five megahertz with one input to about half a megahertz with sixteen; noise gain rises linearly."/></S.Figure>;
}

/* ---------- Chapter 80: difference amplifiers and resistor CMRR ---------- */
export function CmrrMismatchFigure(){
 const eps=logs(1e-5,1e-2,200);
 return <S.Figure plot caption="Resistor-limited CMRR of a four-resistor difference amplifier against the relative mismatch $\epsilon$ between its two resistor ratios, for gains of 1, 10 and 100: $\mathrm{CMRR} \approx (1 + G)/\epsilon$. A 0.1% ratio mismatch at unity gain gives only 66 dB. Higher gain helps, because the common-mode error is fixed while the wanted signal grows; at gain 100 the same mismatch gives 100 dB.">
 <Plot curves={([[1,S.orange],[10,S.gray],[100,S.green]] as [number,string][]).map(([g,c])=>({name:'G = '+g,color:c,points:eps.map(e=>[e*100,20*Math.log10((1+g)/e)] as [number,number])}))} xScale="log" xRange={[1e-3,1]} yRange={[40,140]} xLabel="RATIO MISMATCH ε / %" yLabel="CMRR / dB" description="Three straight lines: CMRR falls twenty decibels per decade of mismatch, higher for higher gain."/></S.Figure>;
}
export function CmrrMonteCarloFigure(){
 let seed=12345;const rnd=()=>{seed=(1103515245*seed+12345)%2147483648;return seed/2147483648;};
 const bins=Array(30).fill(0),lo=50,hi=110,w=(hi-lo)/30;
 for(let k=0;k<4000;k++){const r=()=>1+.001*(2*rnd()-1);const a=r()/r(),b=r()/r(),c=(1+a)*b/(1+b),db=20*Math.log10(Math.abs(((a+c)/2)/(c-a)));const i=Math.floor((Math.min(hi-1e-9,db)-lo)/w);if(i>=0)bins[i]++;}
 const pts:[number,number][]=bins.flatMap((n,i)=>[[lo+i*w,0],[lo+i*w,n],[lo+(i+1)*w,n],[lo+(i+1)*w,0]] as [number,number][]);
 return <S.Figure plot caption="Monte Carlo analysis: 4000 unity-gain difference amplifiers, each built from four 10 kΩ resistors drawn independently and uniformly within ±0.1%. The worst-case bound, all four errors adding to a 0.4% ratio mismatch, is 54 dB (dashed). The simulated amplifiers cluster around 68 dB, and 95% exceed 59 dB. A worst-case design guarantees 54 dB; a statistical one predicts what most units achieve. A matched resistor network with 0.01% ratio tracking would put every unit above 86 dB.">
 <Plot curves={[{name:'Number of amplifiers',color:S.green,points:pts},{name:'Worst-case bound, 54 dB',color:S.orange,dashed:true,points:[[54,0],[54,500]]}]} xRange={[50,110]} yRange={[0,500]} xLabel="CMRR / dB" yLabel="COUNT (OF 4000)" description="Histogram of simulated CMRR values peaking near sixty-eight decibels with a long tail toward higher values, all above the fifty-four decibel worst-case line."/></S.Figure>;
}
export function CurrentSenseCircuit(){
 const at:Pt=[470,200],p=S.opAmpPins({at});
 return <S.Figure caption="High-side current sensing with a difference amplifier. The 50 mΩ shunt sits in the positive supply line to a load, so both its ends are near 12 V. The difference amplifier (gain 20: 5 kΩ and 100 kΩ) amplifies only the 50 mV per ampere across it, giving 1 V/A. But its plus input sits at 12 V × 100/105 = 11.4 V: the op amp must be powered from more than about 13 V, and its CMRR, and the resistors' ratio match, decide how much of the 12 V leaks into the reading.">
 <S.Schematic width={760} height={380} description="Twelve volt supply through a fifty milliohm shunt to a load; a difference amplifier with five kilohm and one hundred kilohm resistors senses the voltage across the shunt.">
  <S.Source a={[60,330]} b={[60,60]} label="12 V"/><S.Ground at={[60,330]}/><S.Wire pts={[[60,60],[140,60]]}/><S.Res a={[140,60]} b={[260,60]} label="R_shunt" value="50 mΩ"/><S.Wire pts={[[260,60],[660,60]]}/>
  <S.Res a={[660,60]} b={[660,330]} label="load" value="0–2 A"/><S.Ground at={[660,330]}/><S.Dot at={[140,60]}/><S.Dot at={[260,60]}/>
  <S.Wire pts={[[260,60],[260,185]]}/><S.Res a={[260,185]} b={[380,185]} label="5 kΩ"/><S.Wire pts={[[380,185],p.minus]}/><S.Dot at={[420,185]}/>
  <S.Wire pts={[[420,185],[420,130],[480,130]]}/><S.Res a={[480,130]} b={[600,130]} label="100 kΩ"/><S.Wire pts={[[600,130],[600,200]]}/>
  <S.Wire pts={[[140,60],[140,215]]}/><S.Res a={[140,215]} b={[400,215]} label="5 kΩ" flipLabel/><S.Wire pts={[[400,215],p.plus]}/><S.Dot at={[400,215]}/>
  <S.Res a={[400,215]} b={[400,330]} label="100 kΩ" flipLabel/><S.Ground at={[400,330]}/>
  <S.OpAmp at={at}/><S.Wire pts={[p.out,[600,200]]}/><S.Dot at={[600,200]}/><S.Wire pts={[[600,200],[600,290]]}/><S.Terminal at={[600,290]} label="v_out = 1 V/A" side="below"/>
 </S.Schematic></S.Figure>;
}

/* ---------- Chapter 81: instrumentation amplifiers ---------- */
export function InaDiamondFigure(){
 // 5 V supply, reference 2.5 V, unity subtractor. Internal outputs and final output limited to 0.2–4.5 V; input op amps accept 0–4.0 V common mode.
 const vo=xs(.2,4.5,200),d=(v:number)=>Math.abs(v-2.5)/2;
 const top=vo.map(v=>[v,Math.min(4,4.5-d(v))] as [number,number]),bot=vo.map(v=>[v,.2+d(v)] as [number,number]);
 return <S.Figure plot caption="The allowed region of a three-op-amp instrumentation amplifier on a 5 V supply (reference 2.5 V, unity-gain subtractor), plotted as input common-mode voltage against output voltage. Each internal output sits at $V_C \pm (V_{out} - 2.5)/2$ and must stay within 0.2–4.5 V, which bounds the region by the sloping lines; the input op amps' own common-mode limit of 4.0 V flattens the top. A large output is only available near mid-supply common mode. Integrated INA datasheets publish this shape, often called the diamond plot.">
 <Plot curves={[{name:'Upper limit of V_C',color:S.green,points:top},{name:'Lower limit of V_C',color:S.orange,points:bot}]} marks={[{at:[3.6,2.5],label:'1.1 V out at 2.5 V CM: valid',pos:'nw'},{at:[4.4,4.0],label:'invalid',pos:'nw'}]}
  xRange={[0,5]} yRange={[0,4.6]} xLabel="OUTPUT VOLTAGE / V" yLabel="INPUT COMMON MODE V_C / V" description="Valid region bounded below by a V shape and above by an inverted V capped at 4 volts; widest at an output of 2.5 volts."/></S.Figure>;
}
export function InaCmrrGainFigure(){
 const g=logs(1,1000,200);
 return <S.Figure plot caption="CMRR of a three-op-amp instrumentation amplifier against its gain, when the CMRR is limited by a 0.1% ratio mismatch in the unity-gain subtractor (about 66 dB on its own). The first stage passes common mode at unity gain but amplifies the difference by $G_1$, so the overall CMRR improves in proportion to $G_1$: 86 dB at a gain of 10, 106 dB at 100, until the op amps' own CMRR (here 120 dB, dashed) takes over.">
 <Plot curves={[{name:'Resistor-limited, 0.1% subtractor',color:S.green,points:g.map(x=>[x,Math.min(20*Math.log10(2000*x),300)] as [number,number])},{name:'With 120 dB op-amp limit',color:S.orange,points:g.map(x=>{const a=1/(2000*x),b=1e-6;return [x,-20*Math.log10(a+b)] as [number,number];})}]}
  xScale="log" xRange={[1,1000]} yRange={[60,130]} xLabel="FIRST-STAGE GAIN G_1" yLabel="CMRR / dB" description="CMRR rising twenty decibels per decade of gain from sixty-six decibels, levelling off near one hundred twenty."/></S.Figure>;
}
export function BridgeInaCircuit(){
 return <S.Figure caption="A strain-gauge bridge read by an instrumentation amplifier. The bridge, excited by 5 V, has both outputs near 2.5 V and a full-scale difference of ±10 mV (2 mV/V). The INA, with $R_G$ = 202 Ω and internal 10 kΩ feedback resistors, has a gain of 100: ±1 V full scale. Its output is referred to a buffered 2.5 V, so strain of either sign gives an output on either side of 2.5 V. The bridge itself provides the inputs' DC bias return.">
 <S.Schematic width={720} height={340} description="Four-resistor bridge between five volts and ground; its two midpoints feed the inputs of an instrumentation amplifier block with gain resistor and reference input.">
  <S.Rail at={[200,30]} label="+5 V"/><S.Wire pts={[[120,60],[280,60]]}/><S.Wire pts={[[200,30],[200,60]]}/><S.Dot at={[200,60]}/>
  <S.Res a={[120,60]} b={[120,170]} label="350 Ω" flipLabel/><S.Res a={[120,170]} b={[120,280]} label="350 Ω" flipLabel/><S.Res a={[280,60]} b={[280,170]} label="gauge" value="350 Ω ± ΔR"/><S.Res a={[280,170]} b={[280,280]} label="350 Ω"/>
  <S.Wire pts={[[120,280],[280,280]]}/><S.Ground at={[200,280]}/><S.Dot at={[120,170]}/><S.Dot at={[280,170]}/>
  <S.Wire pts={[[120,170],[60,170],[60,310],[430,310],[430,200],[460,200]]}/><S.Wire pts={[[280,170],[460,170]]}/>
  <Block x={460} y={140} w={130} h={90} ports={[[460,170],[460,200],[590,185],[525,230]]}>INA, G = 100</Block>
  <S.Text x={470} y={165} kind="value">+</S.Text><S.Text x={470} y={214} kind="value">−</S.Text>
  <S.Wire pts={[[590,185],[660,185]]}/><S.Terminal at={[660,185]} label="2.5 V ± 1 V" side="above"/>
  <S.Wire pts={[[525,230],[525,270]]}/><S.Terminal at={[525,270]} label="ref 2.5 V (buffered)" side="below"/>
 </S.Schematic></S.Figure>;
}

/* ---------- Chapter 82: transimpedance amplifiers ---------- */
const TIA={RF:1e6,CIN:50e-12,ft:1e6};
export function TiaNoiseGainFigure(){
 const fs=logs(10,1e8,300),{RF,CIN,ft}=TIA;
 const ng=(f:number,cf:number)=>{const w=2*Math.PI*f,zr=RF/(1+(w*RF*cf)**2),zi=-w*RF*RF*cf/(1+(w*RF*cf)**2);return Math.hypot(1-w*CIN*zi,w*CIN*zr);};
 return <S.Figure plot caption="The stability picture of a transimpedance amplifier: the noise gain $1/\beta = 1 + Z_F\,j\omega C_{IN}$ against the op amp's open-loop gain $A(f)$ (black). With $R_F$ = 1 MΩ and $C_{IN}$ = 50 pF, the noise gain starts rising at about 3 kHz. With $C_F$ = 1 pF it levels off at 51, crossing $A(f)$ while still rising at a steep angle: little phase margin. With $C_F$ = 2.8 pF it has flattened at 19 before the crossing; with 10 pF at 6, well before it, but the signal bandwidth is then only 16 kHz.">
 <Plot curves={[{name:'Open loop A(f), f_t = 1 MHz',color:S.ink,points:fs.map(f=>[f,ft/f] as [number,number])},...([[1e-12,S.orange],[2.82e-12,S.green],[10e-12,S.gray]] as [number,string][]).map(([cf,c])=>({name:'Noise gain, C_F = '+(cf*1e12).toFixed(cf<2e-12?0:1)+' pF',color:c,points:fs.map(f=>[f,ng(f,cf)] as [number,number])}))]}
  xScale="log" yScale="log" xRange={[10,1e8]} yRange={[.5,1e5]} xLabel="FREQUENCY / Hz" yLabel="GAIN" description="Open-loop gain falling at minus twenty decibels per decade; three noise-gain curves rising from one and levelling at fifty-one, nineteen and six."/></S.Figure>;
}
export function TiaStepFigure(){
 const {RF,CIN}=TIA,wt=2*Math.PI*TIA.ft;
 const sim=(cf:number)=>{const a2=RF*(CIN+cf)/wt,a1=RF*cf+1/wt,dt=5e-9,out:[number,number][]=[];let x=0,v=0;for(let n=0;n<=16000;n++){if(n%40===0)out.push([n*dt*1e6,x]);const acc=(1-a1*v-x)/a2;v+=acc*dt;x+=v*dt;}return out;};
 return <S.Figure plot caption="Response of the photodiode amplifier to a step of light (normalized output). With $C_F$ = 1 pF it rises fastest but overshoots 52% and takes 65 µs to settle within 1%. With 2.8 pF it overshoots 15% and settles in 25 µs. With 10 pF it never overshoots but is slow, 43 µs. A feedback capacitor that lowers the ideal bandwidth makes the measurement settle sooner, because it removes the ringing.">
 <Plot curves={([[1e-12,'C_F = 1 pF',S.orange],[2.82e-12,'C_F = 2.8 pF',S.green],[10e-12,'C_F = 10 pF',S.gray]] as [number,string,string][]).map(([cf,name,color])=>({name,color,points:sim(cf)}))} xRange={[0,80]} yRange={[0,1.6]} xLabel="TIME / µs" yLabel="OUTPUT / FINAL VALUE" description="Three step responses: strongly ringing, slightly overshooting and fastest-settling, and slow without overshoot."/></S.Figure>;
}
export function TiaNoiseFigure(){
 const fs=logs(10,1e6,300),{RF,CIN,ft}=TIA,cf=2.82e-12,en=10e-9,inn=1e-15,KBT=1.380649e-23*300;
 const zf=(f:number)=>RF/Math.hypot(1,2*Math.PI*f*RF*cf);
 const ngm=(f:number)=>{const w=2*Math.PI*f,zr=RF/(1+(w*RF*cf)**2),zi=-w*RF*RF*cf/(1+(w*RF*cf)**2);return Math.hypot(1-w*CIN*zi,w*CIN*zr);};
 const lim=(f:number)=>1/Math.hypot(1,f*ngm(f)/ft);
 return <S.Figure plot caption="Output noise density of the 1 MΩ photodiode amplifier ($C_F$ = 2.8 pF), broken into its sources. The feedback resistor's thermal noise (green) is flat at 129 nV/√Hz until the feedback pole. The op amp's 10 nV/√Hz voltage noise is multiplied by the noise gain, which rises with $C_{IN}$ (orange): negligible at low frequency, it becomes the largest contribution near 50 kHz. The op amp's 1 fA/√Hz current noise times $R_F$ is negligible. A high-capacitance detector makes the amplifier's voltage noise matter even in a current amplifier.">
 <Plot curves={[{name:'R_F thermal noise',color:S.green,points:fs.map(f=>[f,Math.sqrt(4*KBT*RF)*zf(f)/RF*lim(f)*1e9] as [number,number])},{name:'e_n × noise gain',color:S.orange,points:fs.map(f=>[f,en*ngm(f)*lim(f)*1e9] as [number,number])},{name:'i_n × R_F',color:S.gray,points:fs.map(f=>[f,inn*zf(f)*lim(f)*1e9] as [number,number])}]}
  xScale="log" yScale="log" xRange={[10,1e6]} yRange={[.1,1000]} xLabel="FREQUENCY / Hz" yLabel="OUTPUT NOISE / (nV/√Hz)" description="Resistor noise flat then falling; amplified voltage noise rising from ten nanovolts to a peak near fifty kilohertz; current-noise term negligible."/></S.Figure>;
}

/* ---------- Chapter 83: integrators ---------- */
export function IntegratorWindowFigure(){
 const fs=logs(.1,1e7,300),RIN=1e4,C=10e-9,ft=1e6,A0=1e5;
 const H=(f:number,RF:number)=>{const w=2*Math.PI*f;const zr=RF/(1+(w*RF*C)**2),zi=-w*RF*RF*C/(1+(w*RF*C)**2);const ideal=Math.hypot(zr,zi)/RIN;
  // noise gain 1 + Zf/Rin; finite one-pole op amp
  const ngr=1+zr/RIN,ngi=zi/RIN,ar=A0/(1+(f*A0/ft)**2),ai=-A0*(f*A0/ft)/(1+(f*A0/ft)**2);
  const qr=(ngr*ar+ngi*ai)/(ar*ar+ai*ai),qi=(ngi*ar-ngr*ai)/(ar*ar+ai*ai);return ideal/Math.hypot(1+qr,qi);};
 return <S.Figure plot caption="Gain of an integrator ($R_{IN}$ = 10 kΩ, $C_F$ = 10 nF) against frequency. The ideal integrator (dashed) falls at 20 dB per decade forever. A practical one with $R_F$ = 1 MΩ across the capacitor flattens at the DC gain −100 below 16 Hz. A 1 MHz op amp bends it again at the top, where the loop gain runs out. Between those corners the circuit integrates; outside them it does not.">
 <Plot curves={[{name:'Ideal 1/(ωR_IN C_F)',color:S.gray,dashed:true,points:fs.map(f=>[f,1/(2*Math.PI*f*RIN*C)] as [number,number])},{name:'R_F = 1 MΩ, 1 MHz op amp',color:S.green,points:fs.map(f=>[f,H(f,1e6)] as [number,number])},{name:'R_F = 10 MΩ',color:S.orange,points:fs.map(f=>[f,H(f,1e7)] as [number,number])}]}
  xScale="log" yScale="log" xRange={[.1,1e7]} yRange={[1e-5,1e4]} xLabel="FREQUENCY / Hz" yLabel="|GAIN|" description="Integrator magnitude: flat at low frequency set by the feedback resistor, then falling at twenty decibels per decade, then falling faster above about one megahertz."/></S.Figure>;
}
export function IntegratorDriftFigure(){
 const t=xs(0,10,300),vos=1e-4,RIN=1e4,C=10e-9;
 return <S.Figure plot caption="What a 100 µV offset does to an integrator with no input signal ($R_{IN}$ = 10 kΩ, $C_F$ = 10 nF, output limited to ±4.5 V). With capacitor-only feedback the output ramps at 1 V/s and saturates after 4.5 s. With 10 MΩ across the capacitor (100 ms time constant) it settles at $-V_{OS}R_F/R_{IN}$ = −0.1 V; with 1 MΩ at −10 mV. The resistor trades a low-frequency integration limit for a bounded offset.">
 <Plot curves={[{name:'No R_F',color:S.orange,points:t.map(x=>[x,Math.max(-4.5,-vos*x/(RIN*C))] as [number,number])},{name:'R_F = 10 MΩ',color:S.gray,points:t.map(x=>[x,-vos*1e7/RIN*(1-Math.exp(-x/(1e7*C)))] as [number,number])},{name:'R_F = 1 MΩ',color:S.green,points:t.map(x=>[x,-vos*1e6/RIN*(1-Math.exp(-x/(1e6*C)))] as [number,number])}]}
  xRange={[0,10]} yRange={[-5,.5]} xLabel="TIME / s" yLabel="OUTPUT / V" description="Without a feedback resistor the output ramps down to minus four and a half volts; with resistors it settles near zero."/></S.Figure>;
}
export function TriangleOscCircuit(){
 const i:Pt=[230,170],c:Pt=[520,185],pi=S.opAmpPins({at:i,plusTop:false}),pc=S.opAmpPins({at:c,plusTop:true});
 return <S.Figure caption="A triangle-wave oscillator from an integrator and a noninverting Schmitt trigger, on ±5 V with rail-to-rail outputs. The comparator's ±5 V output drives the integrator, whose output ramps at $\mp 5\text{ V}/R_1C$. The comparator switches when the ramp reaches $\pm 5\text{ V}\cdot R_2/R_3$ = ±2.5 V, reversing the ramp. The integrator gives a triangle; the comparator gives a square wave in quadrature with it.">
 <S.Schematic width={760} height={340} description="Integrator with one hundred kilohm input resistor and ten nanofarad capacitor feeding a comparator with positive feedback through ten and twenty kilohm resistors; comparator output returns to the integrator input.">
  <S.Res a={[60,155]} b={[170,155]} label="R_1" value="100 kΩ"/><S.Wire pts={[[170,155],pi.minus]}/><S.Dot at={[200,155]}/>
  <S.Wire pts={[[200,155],[200,90],[250,90]]}/><S.Cap a={[250,90]} b={[340,90]} label="C" value="10 nF"/><S.Wire pts={[[340,90],[340,170]]}/>
  <S.OpAmp at={i}/><S.Wire pts={[pi.plus,[200,185],[200,250]]}/><S.Ground at={[200,250]}/><S.Wire pts={[pi.out,[380,170]]}/><S.Dot at={[340,170]}/>
  <S.Res a={[380,170]} b={[470,170]} label="R_2" value="10 kΩ"/><S.Wire pts={[[470,170],pc.plus]}/><S.Dot at={[480,170]}/>
  <S.Wire pts={[[480,170],[480,110],[540,110]]}/><S.Res a={[540,110]} b={[640,110]} label="R_3" value="20 kΩ"/><S.Wire pts={[[640,110],[640,185]]}/>
  <S.OpAmp at={c} plusTop/><S.Wire pts={[pc.minus,[480,200],[480,260]]}/><S.Ground at={[480,260]}/>
  <S.Wire pts={[pc.out,[700,185]]}/><S.Dot at={[640,185]}/><S.Terminal at={[700,185]} label="square" side="above"/>
  <S.Wire pts={[[640,185],[640,300],[60,300],[60,155]]}/><S.Dot at={[380,170]}/><S.Wire pts={[[380,170],[380,230]]}/><S.Terminal at={[380,230]} label="triangle" side="below"/>
 </S.Schematic></S.Figure>;
}
export function TriangleWaveFigure(){
 const T=2e-3,pts:[number,number][]=[],sq:[number,number][]=[];let v=0,out=5;const dt=2e-6;
 for(let n=0;n<=3000;n++){const t=n*dt;v+=-out/(1e5*10e-9)*dt;if(v<=-2.5)out=-5;if(v>=2.5)out=5;if(n%5===0){pts.push([t*1e3,v]);sq.push([t*1e3,out]);}}
 return <S.Figure plot caption="Waveforms of the triangle oscillator. The integrator output ramps at ±5 V / (100 kΩ × 10 nF) = ±5 V/ms between the ±2.5 V thresholds, so each half-cycle lasts 1 ms and the frequency is $f = R_3/(4R_1R_2C)$ = 500 Hz. The supply voltage cancels out of the frequency: a larger output swing raises both the ramp rate and the thresholds equally.">
 <Plot curves={[{name:'Triangle (integrator output)',color:S.green,points:pts},{name:'Square (comparator output)',color:S.gray,dashed:true,points:sq}]} xRange={[0,6]} yRange={[-6,6]} xLabel="TIME / ms" yLabel="VOLTAGE / V" description="A triangle wave between plus and minus two and a half volts with a two millisecond period, and the square wave that drives it."/></S.Figure>;
}

/* ---------- Chapter 84: differentiators ---------- */
// R_F = 100 kΩ, C_IN = 1 nF, op amp f_t = 1 MHz (integrator model A = ω_t/s).
const DF={RF:1e5,CIN:1e-9,wt:2*Math.PI*1e6};
const diffH=(f:number,RIN:number,CF:number)=>{const w=2*Math.PI*f,{RF,CIN,wt}=DF;
 // Z_in = R_IN + 1/(jwC_IN), Z_F = R_F || 1/(jwC_F); H = -(Z_F/Z_in)/(1 + (1 + Z_F/Z_in)/A), A = wt/(jw)
 const zin=[RIN,-1/(w*CIN)],zf=[RF/(1+(w*RF*CF)**2),-w*RF*RF*CF/(1+(w*RF*CF)**2)];
 const d=zin[0]**2+zin[1]**2,r=[(zf[0]*zin[0]+zf[1]*zin[1])/d,(zf[1]*zin[0]-zf[0]*zin[1])/d];
 const ng=[1+r[0],r[1]],invA=[0,w/wt],t=[ng[0]*invA[0]-ng[1]*invA[1],ng[0]*invA[1]+ng[1]*invA[0]],den=[1+t[0],t[1]];
 return Math.hypot(...r)/Math.hypot(...den);};
export function DiffBodeFigure(){
 const fs=logs(10,1e7,320);
 return <S.Figure plot caption="Gain of a differentiator ($R_F$ = 100 kΩ, $C_{IN}$ = 1 nF, so $R_FC_{IN}$ = 100 µs) built with a 1 MHz op amp. The ideal derivative (dashed) rises at 20 dB per decade without limit. With only $C_{IN}$ and $R_F$ the real circuit follows it, then peaks sharply near 40 kHz, where its rising noise gain meets the falling open-loop gain: a resonance with a Q of about 25. Adding $R_{IN}$ = 10 kΩ and $C_F$ = 100 pF caps the gain near 16 kHz and removes the peak.">
 <Plot curves={[{name:'Ideal ωR_F C_IN',color:S.gray,dashed:true,points:fs.map(f=>[f,2*Math.PI*f*1e-4] as [number,number])},{name:'C_IN and R_F only',color:S.orange,points:fs.map(f=>[f,diffH(f,0,0)] as [number,number])},{name:'With R_IN = 10 kΩ, C_F = 100 pF',color:S.green,points:fs.map(f=>[f,diffH(f,1e4,1e-10)] as [number,number])}]}
  xScale="log" yScale="log" xRange={[10,1e7]} yRange={[1e-3,100]} xLabel="FREQUENCY / Hz" yLabel="|GAIN|" description="Differentiator gain rising with frequency; the uncompensated circuit has a tall resonant peak near forty kilohertz; the compensated circuit levels off without a peak."/></S.Figure>;
}
export function DiffRingFigure(){
 const {RF,CIN,wt}=DF,dt=2e-8;
 // Uncompensated: vout'' RC/wt + vout'/wt + vout = -RC vin'; response to an input ramp of 1 V/ms starting at t = 0 (output ideally -0.1 V).
 const sim=(comp:boolean)=>{const out:[number,number][]=[];let x=0,v=0;
  if(!comp){const a2=RF*CIN/wt,a1=1/wt;for(let n=0;n<=10000;n++){if(n%20===0)out.push([n*dt*1e6,x]);const acc=(-RF*CIN*1e3-a1*v-x)/a2;v+=acc*dt;x+=v*dt;}}
  else{const tau=1e-5;let y=0,z=0;for(let n=0;n<=10000;n++){if(n%20===0)out.push([n*dt*1e6,z]);y+=dt*(-RF*CIN*1e3-y)/tau;z+=dt*(y-z)/tau;}}
  return out;};
 return <S.Figure plot caption="Response of the two differentiators to an input ramp of 1 V/ms that starts at $t$ = 0. The derivative is a step to $-R_FC_{IN} \cdot dV/dt$ = −0.1 V. The uncompensated circuit gets there eventually, but rings at about 40 kHz for well over 100 µs. The compensated one (two 10 µs time constants) settles cleanly within about 60 µs. The ringing is the resonance in the previous figure, made visible.">
 <Plot curves={[{name:'C_IN and R_F only',color:S.orange,points:sim(false)},{name:'With R_IN and C_F',color:S.green,points:sim(true)}]} xRange={[0,200]} yRange={[-.2,.02]} xLabel="TIME / µs" yLabel="OUTPUT / V" description="Uncompensated output rings around minus point one volts for a long time; the compensated output rises smoothly to it."/></S.Figure>;
}
export function DiffNoiseFigure(){
 let seed=7;const rnd=()=>{seed=(1103515245*seed+12345)%2147483648;return seed/2147483648-.5;};
 const N=600,dt=2e-6,inp:number[]=[];for(let n=0;n<N;n++){const t=n*dt;inp.push(Math.sin(2*Math.PI*500*t)+.01*rnd());}
 const naive:[number,number][]=[],filt:[number,number][]=[];let y=0,z=0;const tau=1e-4;
 for(let n=1;n<N;n++){const d=(inp[n]-inp[n-1])/dt*1e-4;naive.push([n*dt*1e3,d]);y+=dt*(d-y)/tau;z+=dt*(y-z)/tau;filt.push([n*dt*1e3,z]);}
 return <S.Figure plot caption="Why differentiators and noise do not mix. The input is a 500 Hz, 1 V sine with 1% of broadband noise, scaled so the ideal derivative has a peak of about 0.31. Differentiated without any bandwidth limit (orange), the noise, whose slope is enormous, buries the signal. With the derivative limited to below about 1.6 kHz (green), the sine's derivative appears cleanly, slightly delayed. A differentiator must always come with a defined bandwidth.">
 <Plot curves={[{name:'Unlimited bandwidth',color:S.orange,points:naive},{name:'Band-limited',color:S.green,points:filt}]} xRange={[0,1.2]} yRange={[-2,2]} xLabel="TIME / ms" yLabel="DERIVATIVE × 100 µs" description="A noisy, spiky trace that swamps a sinusoid, and a clean sinusoid from the band-limited differentiator."/></S.Figure>;
}

/* ---------- Chapter 85: active filters ---------- */
// Fourth-order low-pass sections (normalized frequency, Q) for 1 kHz: Butterworth and Bessel at -3 dB = 1, Chebyshev 1 dB at ripple edge = 1.
const FAMILIES:[string,[number,number][],string][]=[['Butterworth',[[1,.5412],[1,1.3066]],S.green],['Bessel',[[1.4192,.5219],[1.5912,.8055]],S.gray],['Chebyshev, 1 dB ripple',[[.5286,.7845],[.9932,3.5594]],S.orange]];
const famH=(f:number,sec:[number,number][])=>sec.reduce((p,[fn,q])=>{const x=f/fn;return p/Math.hypot(1-x*x,x/q);},1);
export function FilterFamiliesFigure(){
 const fs=logs(100,1e4,300);
 return <S.Figure plot caption="Three fourth-order low-pass filters with a 1 kHz cutoff, each built from two Sallen–Key sections with different natural frequencies and Q values. Butterworth is maximally flat in the passband. Bessel rolls off gently and is only −14 dB at 2 kHz. Chebyshev allows 1 dB of ripple in exchange for a much steeper edge: −33 dB at 2 kHz against Butterworth's −24 dB. Same order, same number of op amps, different section values.">
 <Plot curves={FAMILIES.map(([name,sec,color])=>({name,color,points:fs.map(f=>[f,20*Math.log10(famH(f/1000,sec))] as [number,number])}))} xScale="log" xRange={[100,1e4]} yRange={[-70,5]} xLabel="FREQUENCY / Hz" yLabel="GAIN / dB" description="Three low-pass responses: Chebyshev rippled and steepest, Butterworth flat, Bessel gentlest."/></S.Figure>;
}
export function FilterStepFigure(){
 const step=(sec:[number,number][])=>{const dt=2e-6,out:[number,number][]=[];let st=sec.map(()=>[0,0]);
  for(let n=0;n<=2500;n++){let u=1;st=st.map(([x,v],i)=>{const [fn,q]=sec[i],w=2*Math.PI*1000*fn,a=w*w*(u-x)-w/q*v;v+=a*dt;x+=v*dt;u=x;return [x,v];});if(n%10===0)out.push([n*dt*1e3,u]);}return out;};
 return <S.Figure plot caption="Step responses of the same three filters. The price of a sharp frequency edge is time-domain misbehaviour: Chebyshev overshoots 22% and rings, Butterworth overshoots 11%, Bessel less than 1%. For pulses, or for anything where the waveform's shape matters, the Bessel's nearly constant delay is worth its soft cutoff.">
 <Plot curves={FAMILIES.map(([name,sec,color])=>({name,color,points:step(sec)}))} xRange={[0,5]} yRange={[0,1.3]} xLabel="TIME / ms" yLabel="OUTPUT / FINAL VALUE" description="Step responses: Chebyshev rings with the largest overshoot, Butterworth overshoots moderately, Bessel rises without overshoot."/></S.Figure>;
}
export function UnitySkCircuit(){
 const at:Pt=[480,190],p=S.opAmpPins({at,plusTop:true});
 return <S.Figure caption="A unity-gain Sallen–Key low-pass designed for a Butterworth response at 1 kHz. With equal resistors, $Q = \tfrac12\sqrt{C_1/C_2}$, so Butterworth's $Q$ = 0.707 needs $C_1 = 2C_2$; $f_0 = 1/(2\pi R\sqrt{C_1C_2})$ sets the size. With 10 kΩ, 22 nF and 11 nF, $f_0$ = 1.02 kHz. The follower makes the gain exactly 1, independent of resistor tolerances, which removes resistor-ratio gain error from $Q$.">
 <S.Schematic width={720} height={340} description="Two ten kilohm resistors in series to the noninverting input of a follower; twenty-two nanofarads from the resistor junction to the output; eleven nanofarads from the noninverting input to ground.">
  <S.Terminal at={[70,175]} label="v_in"/><S.Res a={[70,175]} b={[220,175]} label="R_1" value="10 kΩ"/><S.Res a={[220,175]} b={[370,175]} label="R_2" value="10 kΩ"/><S.Wire pts={[[370,175],p.plus]}/>
  <S.Wire pts={[[220,175],[220,80],[300,80]]}/><S.Cap a={[300,80]} b={[420,80]} label="C_1" value="22 nF"/><S.Wire pts={[[420,80],[600,80],[600,190]]}/><S.Dot at={[220,175]}/>
  <S.Cap a={[370,175]} b={[370,300]} label="C_2" value="11 nF" flipLabel/><S.Ground at={[370,300]}/><S.Dot at={[370,175]}/>
  <S.OpAmp at={at} plusTop/><S.Wire pts={[p.out,[660,190]]}/><S.Dot at={[600,190]}/><S.Terminal at={[660,190]} label="v_out" side="above"/>
  <S.Wire pts={[p.minus,[450,205],[450,250],[600,250],[600,190]]}/>
 </S.Schematic></S.Figure>;
}
export function QSensitivityFigure(){
 const k=xs(1,2.95,200);
 return <S.Figure plot caption="For the equal-R, equal-C Sallen–Key section, $Q = 1/(3 - K)$. Near $K$ = 1.586 (Butterworth) the curve is gentle: a 1% gain error moves $Q$ by about 1.1%. Near $K$ = 2.8 ($Q$ = 5) the same 1% gain error moves $Q$ by about 15%, and at $K$ = 3 the ideal section is undamped. High-Q sections built this way demand tight resistor ratios, or a topology whose $Q$ does not depend on a gain difference.">
 <Plot curves={[{name:'Q = 1/(3 − K)',color:S.green,points:k.map(x=>[x,1/(3-x)] as [number,number])}]} marks={[{at:[1.586,.707],label:'Butterworth',pos:'nw'},{at:[2.5,2],label:'Q = 2',pos:'nw'}]}
  yScale="log" xRange={[1,3]} yRange={[.3,30]} xLabel="STAGE GAIN K" yLabel="Q" description="Q rising slowly with gain at first and then without limit as gain approaches three."/></S.Figure>;
}

/* ---------- Chapter 86: precision rectifiers and peak detection ---------- */
export function ImprovedHalfWaveCircuit(){
 const at:Pt=[380,190],p=S.opAmpPins({at});
 return <S.Figure caption="The improved (inverting) half-wave rectifier. For a positive input the op amp's output goes negative, $D_1$ conducts, and the circuit is an inverter of gain −1 through $R_F$: $v_{out} = -v_{in}$. For a negative input the output goes positive, $D_2$ conducts and clamps the op amp's output one diode drop above the virtual ground, while $D_1$ is reverse biased and $v_{out}$ sits at 0 V through $R_F$. The op amp never saturates: it swings only about 1.2 V across each zero crossing.">
 <S.Schematic width={720} height={340} description="Inverting op amp with ten kilohm input resistor; diode D2 from output back to the inverting input; diode D1 from the op amp output to the circuit output, with ten kilohm feedback from the circuit output to the inverting input.">
  <S.Terminal at={[90,175]} label="v_in"/><S.Res a={[90,175]} b={[260,175]} label="R_IN" value="10 kΩ"/><S.Wire pts={[[260,175],p.minus]}/><S.Dot at={[300,175]}/>
  <S.OpAmp at={at}/><S.Wire pts={[p.plus,[340,205],[340,270]]}/><S.Ground at={[340,270]}/>
  <S.Wire pts={[p.out,[490,190]]}/><S.Dot at={[490,190]}/><S.Diode a={[580,190]} b={[490,190]} label="D_1"/><S.Wire pts={[[580,190],[650,190]]}/><S.Dot at={[600,190]}/><S.Terminal at={[650,190]} label="v_out" side="above"/>
  <S.Wire pts={[[300,175],[300,120],[400,120]]}/><S.Diode a={[490,120]} b={[400,120]} label="D_2"/><S.Wire pts={[[490,120],[490,190]]}/><S.Dot at={[300,120]}/>
  <S.Wire pts={[[300,120],[300,60],[420,60]]}/><S.Res a={[420,60]} b={[600,60]} label="R_F" value="10 kΩ"/><S.Wire pts={[[600,60],[600,190]]}/>
 </S.Schematic></S.Figure>;
}
export function FullWaveCircuit(){
 const a:Pt=[260,200],b:Pt=[560,200],pa=S.opAmpPins({at:a}),pb=S.opAmpPins({at:b});
 return <S.Figure caption="A full-wave precision rectifier (absolute-value circuit). The first stage is the improved half-wave rectifier, giving $-v_{in}$ for positive inputs and 0 for negative ones. The second stage sums the input (weight −1, via 20 kΩ) and the half-wave output (weight −2, via 10 kΩ): for positive inputs $-v_{in} + 2v_{in} = v_{in}$; for negative inputs $-v_{in}$. Either way, $v_{out} = |v_{in}|$. The two 20 kΩ and the 10 kΩ resistor must match closely, or the two half-cycles have different gains.">
 <S.Schematic width={780} height={380} description="Improved half-wave rectifier followed by an inverting summer that adds the input through twenty kilohms and the half-wave output through ten kilohms, with twenty kilohm feedback.">
  <S.Terminal at={[40,185]} label="v_in"/><S.Wire pts={[[40,185],[80,185]]}/><S.Dot at={[80,185]}/><S.Res a={[80,185]} b={[200,185]} label="10 kΩ"/><S.Wire pts={[[200,185],pa.minus]}/><S.Dot at={[220,185]}/>
  <S.OpAmp at={a}/><S.Wire pts={[pa.plus,[230,215],[230,260]]}/><S.Ground at={[230,260]}/>
  <S.Wire pts={[pa.out,[350,200]]}/><S.Dot at={[350,200]}/><S.Diode a={[420,200]} b={[350,200]} label="D_1"/><S.Wire pts={[[420,200],[440,200]]}/><S.Dot at={[440,200]}/>
  <S.Wire pts={[[220,185],[220,130],[280,130]]}/><S.Diode a={[350,130]} b={[280,130]} label="D_2"/><S.Wire pts={[[350,130],[350,200]]}/><S.Dot at={[220,130]}/>
  <S.Wire pts={[[220,130],[220,70],[300,70]]}/><S.Res a={[300,70]} b={[440,70]} label="10 kΩ"/><S.Wire pts={[[440,70],[440,200]]}/>
  <S.Res a={[440,200]} b={[520,200]} label="10 kΩ"/><S.Wire pts={[[520,200],[530,200]]}/><S.Wire pts={[[530,200],[530,185],pb.minus]}/><S.Dot at={[530,185]}/>
  <S.Wire pts={[[80,185],[80,320],[400,320]]}/><S.Res a={[400,320]} b={[520,320]} label="20 kΩ" flipLabel/><S.Wire pts={[[520,320],[520,185],[530,185]]}/>
  <S.Wire pts={[[530,185],[530,110],[600,110]]}/><S.Res a={[600,110]} b={[700,110]} label="20 kΩ"/><S.Wire pts={[[700,110],[700,200]]}/>
  <S.OpAmp at={b}/><S.Wire pts={[pb.plus,[540,215],[540,260]]}/><S.Ground at={[540,260]}/><S.Wire pts={[pb.out,[750,200]]}/><S.Dot at={[700,200]}/><S.Terminal at={[750,200]} label="|v_in|" side="above"/>
 </S.Schematic></S.Figure>;
}
export function RectifierRecoveryFigure(){
 // Noninverting simple rectifier vs a clamped version, 10 kHz 1 V sine, SR 0.5 V/µs, diode 0.6 V, op amp swings to -4 V when off (simple) or -0.6 V (clamped).
 const SR=.5e6,dt=5e-9,f=1e4,run=(low:number)=>{const out:[number,number][]=[];let y=0;for(let n=0;n<=40000;n++){const t=n*dt,x=Math.sin(2*Math.PI*f*t),target=x>0?x+.6:low;const dy=Math.max(-SR,Math.min(SR,(target-y)/2e-7));y+=dy*dt;if(n%100===0)out.push([t*1e6,Math.max(0,Math.min(x>0?x:0,y-.6))]);}return out;};
 const ideal=xs(0,200,400).map(t=>[t,Math.max(0,Math.sin(2*Math.PI*f*t*1e-6))] as [number,number]);
 return <S.Figure plot caption="Half-wave rectifying a 1 V, 10 kHz sine with a 0.5 V/µs op amp. Ideal output dashed. In the simple circuit the op amp saturates at −4 V during each negative half-cycle; when the input turns positive it must slew 4.6 V before its diode conducts, about 9 µs, and the output misses the start of every positive half-cycle (orange). In a circuit whose op amp is clamped one diode drop below zero, it slews only 1.2 V, and the gap shrinks to about 2.4 µs (green).">
 <Plot curves={[{name:'Ideal',color:S.gray,dashed:true,points:ideal},{name:'Simple: op amp saturates',color:S.orange,points:run(-4)},{name:'Clamped op amp output',color:S.green,points:run(-.6)}]} xRange={[0,200]} yRange={[-.1,1.1]} xLabel="TIME / µs" yLabel="OUTPUT / V" description="Rectified half sines; the simple circuit's output starts late on each half-cycle, the clamped one only slightly late."/></S.Figure>;
}
export function PeakDetectorCircuit(){
 const a:Pt=[230,180],b:Pt=[580,195],pa=S.opAmpPins({at:a,plusTop:true}),pb=S.opAmpPins({at:b,plusTop:true});
 return <S.Figure caption="A peak detector with a buffered hold capacitor. The first op amp charges $C_H$ through the diode whenever the input exceeds the stored voltage; the follower reads $C_H$ without loading it, and the loop is closed from the follower's output, so the diode drop is removed. When the input falls, the diode turns off and $C_H$ holds the peak. A reset switch discharges it. Diode, switch and follower leakage make the held value droop.">
 <S.Schematic width={770} height={360} description="Op amp driving a diode into a hold capacitor to ground, a reset switch across the capacitor, and a follower buffering the capacitor; feedback from the follower output to the first op amp's inverting input.">
  <S.Terminal at={[90,165]} label="v_in"/><S.Wire pts={[[90,165],pa.plus]}/><S.OpAmp at={a} plusTop/>
  <S.Wire pts={[pa.out,[330,180]]}/><S.Diode a={[330,180]} b={[420,180]} label="D"/><S.Wire pts={[[420,180],pb.plus]}/><S.Dot at={[440,180]}/>
  <S.Cap a={[440,180]} b={[440,300]} label="C_H" value="10 nF" flipLabel/><S.Ground at={[440,300]}/><S.Dot at={[480,180]}/><S.Switch a={[480,180]} b={[480,300]} label="reset"/><S.Ground at={[480,300]}/>
  <S.OpAmp at={b} plusTop/><S.Wire pts={[pb.minus,[550,210],[550,240],[690,240],[690,195]]}/><S.Wire pts={[pb.out,[730,195]]}/><S.Dot at={[690,195]}/><S.Terminal at={[730,195]} label="v_peak" side="above"/>
  <S.Wire pts={[[690,240],[690,335],[190,335],[190,195],pa.minus]}/><S.Dot at={[690,240]}/>
 </S.Schematic></S.Figure>;
}

/* ---------- Chapter 87: op-amp current servos ---------- */
// 10 mA command, 50 Ω sense, 12 V supply, op amp output up to 11 V, MOSFET k = 0.1 A/V², V_T = 2 V.
const servoI=(RL:number)=>Math.min(.01,bisect((i:number)=>i-channel(11-i*50,Math.max(0,12-i*(RL+50)),.1,2).id,0,12/(RL+50)));
export function ServoComplianceFigure(){
 const r=xs(0,2500,300);
 return <S.Figure plot caption="Load current against load resistance for a 10 mA servo (50 Ω sense resistor, 12 V supply, op amp able to drive the gate to 11 V). Up to about 1.15 kΩ the loop holds 10 mA exactly: the MOSFET absorbs whatever voltage the load leaves. Beyond that, the load plus sense resistor need more than the supply can give, the op amp's output goes to its limit, the MOSFET turns fully on, and the current falls as roughly $12\text{ V}/(R_L + R_S)$. The circuit is a current source only within its compliance.">
 <Plot curves={[{name:'Actual load current',color:S.green,points:r.map(x=>[x,servoI(x)*1e3] as [number,number])},{name:'Command, 10 mA',color:S.gray,dashed:true,points:[[0,10],[2500,10]]}]} marks={[{at:[1150,9.99],label:'compliance limit',pos:'ne'}]}
  xRange={[0,2500]} yRange={[0,12]} xLabel="LOAD RESISTANCE / Ω" yLabel="LOAD CURRENT / mA" description="Current held flat at ten milliamps up to about eleven hundred ohms, then falling."/></S.Figure>;
}
export function ServoDissipationFigure(){
 const r=xs(0,1150,200);
 return <S.Figure plot caption="Power dissipated in the MOSFET and in the load as the load resistance varies, at a regulated 10 mA from 12 V. The supply always delivers 120 mW; whatever the load and sense resistor do not take, the transistor must. Its dissipation is largest, 115 mW, with the load shorted. Rate the transistor and its heat sink for a shorted load, not for the nominal one.">
 <Plot curves={[{name:'MOSFET',color:S.orange,points:r.map(x=>[x,.01*(12-.01*(x+50))*1e3] as [number,number])},{name:'Load',color:S.green,points:r.map(x=>[x,1e-4*x*1e3] as [number,number])},{name:'Sense resistor',color:S.gray,points:[[0,5],[1150,5]]}]}
  xRange={[0,1150]} yRange={[0,130]} xLabel="LOAD RESISTANCE / Ω" yLabel="POWER / mW" description="Transistor power falls linearly from one hundred fifteen milliwatts as load power rises linearly; sense resistor power constant at five milliwatts."/></S.Figure>;
}
export function HighSideSourceCircuit(){
 const at:Pt=[300,200],p=S.opAmpPins({at,plusTop:false}),q=S.fetPins({at:[470,190],kind:'pmos'});
 return <S.Figure caption="A current source into a grounded load, using a PMOS. The sense resistor sits between the supply and the PMOS source. The op amp forces the sense node to equal the voltage on its plus input, $V_{DD} - V_{SET}$, so the sense resistor carries $V_{SET}/R_S$, all of which flows through the PMOS into the load. Here a 1.0 V drop across 100 Ω gives 10 mA. The set voltage is measured from the supply, so supply noise must be rejected by making $V_{SET}$ track $V_{DD}$.">
 <S.Schematic width={720} height={380} description="Twelve volt rail through a one hundred ohm sense resistor to the source of a PMOS; op amp compares the sense node with a voltage one volt below the rail and drives the PMOS gate; PMOS drain feeds a grounded load.">
  <S.Rail at={[484,30]} label="+12 V"/><S.Res a={[484,30]} b={[484,120]} label="R_S" value="100 Ω"/><S.Wire pts={[[484,120],q.s]}/><S.Fet at={[470,190]} kind="pmos"/>
  <S.Wire pts={[[484,135],[260,135],[260,185],p.minus]}/><S.Dot at={[484,135]}/>
  <S.OpAmp at={at}/><S.Wire pts={[p.out,[410,200],[410,190],q.g]}/>
  <S.Terminal at={[170,215]} label="V_DD − 1.0 V"/><S.Wire pts={[[170,215],p.plus]}/>
  <S.Wire pts={[q.d,[484,270]]}/><S.Res a={[484,270]} b={[484,350]} label="load" value="0–1 kΩ"/><S.Ground at={[484,350]}/><S.CurrentArrow at={[484,250]} dir="down" label="10 mA"/>
 </S.Schematic></S.Figure>;
}
export function ServoStepFigure(){
 // Loop: op amp integrator (f_t = 1 MHz) driving the gate through 100 Ω into C_gs; source follows the gate with gain 0.9.
 const sim=(C:number)=>{const wt=2*Math.PI*1e6,tg=100*C,dt=1e-9,out:[number,number][]=[];let vo=0,vg=0;
  for(let n=0;n<=10000;n++){const vs=.9*vg;if(n%20===0)out.push([n*dt*1e6,vs/.5]);vo+=dt*wt*(.5-vs);vg+=dt*(vo-vg)/tg;}return out;};
 return <S.Figure plot caption="A 0.5 V step on $V_{SET}$, normalized, for two MOSFETs driven through the op amp's 100 Ω output resistance. With 1 nF of gate capacitance the gate pole is at 1.6 MHz, the phase margin about 63°, and the sense voltage settles cleanly. With a larger 5 nF part the pole drops to 320 kHz, the margin to about 33°, and the current rings. A bigger transistor is a different control plant.">
 <Plot curves={[{name:'C_gs = 1 nF, PM ≈ 63°',color:S.green,points:sim(1e-9)},{name:'C_gs = 5 nF, PM ≈ 33°',color:S.orange,points:sim(5e-9)}]} xRange={[0,10]} yRange={[0,1.5]} xLabel="TIME / µs" yLabel="SENSE VOLTAGE / COMMAND" description="Step responses: clean with one nanofarad of gate capacitance, ringing with five."/></S.Figure>;
}

/* ---------- Chapter 88: capacitive loads and feedback placement ---------- */
export function CapLoadLagFigure(){
 const c=logs(1e-11,1e-7,200);
 return <S.Figure plot caption="Extra phase lag at a 1 MHz loop crossing from the pole formed by an op amp's 50 Ω open-loop output resistance and a capacitive load, $\arctan(2\pi f_cR_OC_L)$. A few hundred picofarads cost little; 1 nF costs 17°; 10 nF costs 72°, leaving almost nothing of a typical 60–70° margin. Cable, a long trace or an ADC's input can easily add this much.">
 <Plot curves={[{name:'Extra phase lag at 1 MHz',color:S.orange,points:c.map(x=>[x*1e12,Math.atan(2*Math.PI*1e6*50*x)*180/Math.PI] as [number,number])}]} marks={[{at:[1000,17.4],label:'1 nF: 17°',pos:'nw'},{at:[1e4,72.3],label:'10 nF: 72°',pos:'nw'}]}
  xScale="log" xRange={[10,1e5]} yRange={[0,90]} xLabel="LOAD CAPACITANCE / pF" yLabel="PHASE LAG / degrees" description="Phase lag rising from near zero at ten picofarads to almost ninety degrees at a hundred nanofarads."/></S.Figure>;
}
export function IsolationCircuits(){
 const a:Pt=[200,170],b:Pt=[600,170],pa=S.opAmpPins({at:a,plusTop:true}),pb=S.opAmpPins({at:b,plusTop:true});
 return <S.Figure caption="Two ways to drive a capacitive load. Left: an isolation resistor outside the loop. Feedback is taken at the op amp's pin, so the loop never sees $C_L$ directly; but the resistor's drop with a resistive load, and the $R_{ISO}C_L$ filter, are outside the loop's correction. Right: dual-path feedback. $R_F$ senses the load for DC accuracy, while $C_F$ feeds back from the pin at high frequency, where it dominates, so the loop is stable and the load voltage is correct at DC.">
 <S.Schematic width={830} height={350} description="Left: follower with isolation resistor to a capacitive load, feedback from the op amp output pin. Right: follower with isolation resistor, a resistor from the load to the inverting input and a capacitor from the output pin to the inverting input.">
  <S.Terminal at={[70,155]} label="v_in"/><S.Wire pts={[[70,155],pa.plus]}/><S.OpAmp at={a} plusTop/><S.Wire pts={[pa.out,[300,170]]}/><S.Dot at={[290,170]}/>
  <S.Res a={[300,170]} b={[380,170]} label="R_ISO" value="50 Ω"/><S.Wire pts={[[380,170],[400,170]]}/><S.Cap a={[400,170]} b={[400,280]} label="C_L" value="10 nF"/><S.Ground at={[400,280]}/><S.Dot at={[400,170]}/>
  <S.Wire pts={[pa.minus,[170,185],[170,230],[290,230],[290,170]]}/><S.Text x={230} y={300} anchor="middle">feedback at the pin</S.Text>
  <S.Terminal at={[480,155]} label="v_in"/><S.Wire pts={[[480,155],pb.plus]}/><S.OpAmp at={b} plusTop/><S.Wire pts={[pb.out,[700,170]]}/><S.Dot at={[690,170]}/>
  <S.Res a={[700,170]} b={[770,170]} label="R_ISO"/><S.Cap a={[780,170]} b={[780,280]} label="C_L"/><S.Wire pts={[[770,170],[780,170]]}/><S.Ground at={[780,280]}/><S.Dot at={[780,170]}/>
  <S.Wire pts={[pb.minus,[570,185],[570,240]]}/><S.Dot at={[570,240]}/><S.Cap a={[570,240]} b={[690,240]} label="C_F"/><S.Wire pts={[[690,240],[690,170]]}/>
  <S.Wire pts={[[570,240],[570,315]]}/><S.Res a={[570,315]} b={[740,315]} label="R_F" flipLabel/><S.Wire pts={[[740,315],[810,315],[810,170],[780,170]]}/>
 </S.Schematic></S.Figure>;
}
export function CapLoadStepFigure(){
 const wt=2*Math.PI*1e6,RO=50,CL=10e-9,RL=1000,dt=2e-9;
 const run=(mode:string,Riso:number)=>{let vi=0,vL=0,z=0;const out:[number,number][]=[];for(let n=0;n<=10000;n++){const i=(vi-vL)/(RO+Riso),vout=vi-RO*i,fb=mode==='direct'?vL:mode==='out'?vout:vout-z;if(n%20===0)out.push([n*dt*1e6,vL]);vi+=dt*wt*(1-fb);vL+=dt*(i-vL/RL)/CL;z+=dt*((vout-vL)-z)/3e-5;}return out;};
 return <S.Figure plot caption="A 1 V step into 10 nF in parallel with 1 kΩ, from a follower with 1 MHz bandwidth and 50 Ω of output resistance. Driven directly (orange), the load voltage overshoots about 40% and rings. With 50 Ω of isolation outside the loop (gray) it settles in about 1.5 µs with 1% overshoot, but to 0.952 V: the resistor's drop with the 1 kΩ load is not corrected. With dual-path feedback (green) it settles to 1.000 V without overshoot, but its final approach is slow, set by $R_FC_F$.">
 <Plot curves={[{name:'Direct drive',color:S.orange,points:run('direct',0)},{name:'R_ISO outside the loop',color:S.gray,points:run('out',50)},{name:'Dual-path feedback',color:S.green,points:run('dual',50)}]} xRange={[0,20]} yRange={[0,1.5]} xLabel="TIME / µs" yLabel="LOAD VOLTAGE / V" description="Load voltage step responses: ringing with direct drive, fast but slightly low with an isolation resistor, slow but accurate with dual feedback."/>
 <Plot curves={[{name:'Direct drive',color:S.orange,points:run('direct',0)},{name:'R_ISO outside the loop',color:S.gray,points:run('out',50)},{name:'Dual-path feedback',color:S.green,points:run('dual',50)}]} xRange={[0,20]} yRange={[.9,1.05]} xLabel="TIME / µs" yLabel="LOAD VOLTAGE, ZOOMED / V" description="Zoomed view near the final value: the isolated output settles at 0.952 volts, the dual-feedback output creeps up to 1.000 volt."/></S.Figure>;
}

/* ---------- Chapter 89: analog functions and a complete design ---------- */
export function LogTransferFigure(){
 const I=logs(1e-9,1e-3,240),Is=1e-14,q=1.602e-19,k=1.380649e-23;
 const vo=(i:number,T:number,leak=0)=>-(k*T/q)*Math.log(Math.max(1e-30,i-leak)/(Is*Math.exp(.06*(T-298))));
 return <S.Figure plot caption="Output of a diode (or transistor) log amplifier against input current. At 25 °C (green) the slope is −59 mV per decade. At 85 °C (orange) the slope grows to −71 mV per decade, and the whole line moves, because the junction's saturation current roughly doubles every 10 °C. With 1 nA of leakage at the input (gray, dashed), the low end bends away: at 10 nA the reading is already wrong by 10%. A precision log amplifier cancels $I_S$ with a matched reference transistor and corrects the $kT/q$ slope with a temperature-dependent gain.">
 <Plot curves={[{name:'25 °C',color:S.green,points:I.map(i=>[i,vo(i,298)] as [number,number])},{name:'85 °C',color:S.orange,points:I.map(i=>[i,vo(i,358)] as [number,number])},{name:'25 °C with 1 nA leakage',color:S.gray,dashed:true,points:I.filter(i=>i>1.05e-9).map(i=>[i,vo(i,298,1e-9)] as [number,number])}]}
  xScale="log" xRange={[1e-9,1e-3]} yRange={[-.7,-.2]} xLabel="INPUT CURRENT / A" yLabel="OUTPUT / V" description="Log amplifier output falling linearly with the logarithm of input current, with a steeper, shifted line at higher temperature and a bend at low currents from leakage."/></S.Figure>;
}
export function SchmittFigure(){
 let seed=3;const rnd=()=>{seed=(1103515245*seed+12345)%2147483648;return seed/2147483648-.5;};
 const N=1200,inp:[number,number][]=[],plain:[number,number][]=[],hyst:[number,number][]=[];let state=0;
 for(let n=0;n<N;n++){const t=n/N*10,x=2.5+.8*Math.sin(2*Math.PI*t/10*1.2)+.12*rnd();inp.push([t,x]);plain.push([t,x>2.5?.4:4.6]);if(state===0&&x>2.65)state=1;else if(state===1&&x<2.35)state=0;hyst.push([t,state?.1:4.9]);}
 return <S.Figure plot caption="A slow, noisy signal (black) crossing a 2.5 V threshold. Both comparators here are inverting, as in the circuit below: output high while the input is below threshold. A plain comparator (orange) switches many times at each crossing, because the noise carries the input back and forth across the threshold. A Schmitt trigger (green) with thresholds at 2.35 V and 2.65 V switches exactly once per crossing: once it has switched, the noise would have to exceed the 0.3 V hysteresis to switch it back. Choose the hysteresis larger than the peak-to-peak noise.">
 <Plot curves={[{name:'Noisy input',color:S.ink,points:inp},{name:'Plain comparator',color:S.orange,points:plain},{name:'Schmitt trigger',color:S.green,points:hyst}]} xRange={[0,10]} yRange={[0,5.2]} xLabel="TIME / ms" yLabel="VOLTAGE / V" description="Noisy slow wave with a comparator output that chatters at each threshold crossing and a Schmitt trigger output that switches cleanly."/></S.Figure>;
}
export function SchmittCircuit(){
 const at:Pt=[420,180],p=S.opAmpPins({at,plusTop:true});
 return <S.Figure caption="A Schmitt trigger on a single 5 V supply. The divider $R_1$, $R_2$ sets the centre threshold at 2.5 V; positive feedback through $R_3$ shifts it by about ±0.15 V depending on the output state: $\Delta V \approx 5\text{ V}\cdot(R_1\parallel R_2)/R_3$ = 5 V × 5 kΩ/82 kΩ ≈ 0.3 V of hysteresis. A dedicated comparator switches far faster than an op amp and does not suffer from saturation recovery.">
 <S.Schematic width={720} height={340} description="Comparator with inverting input driven by the signal; noninverting input at the junction of two ten kilohm resistors across the supply, with eighty-two kilohm feedback from the output.">
  <S.Terminal at={[380,300]} label="v_in" side="below"/><S.Wire pts={[[380,300],[380,195],p.minus]}/>
  <S.Rail at={[300,40]} label="+5 V"/><S.Res a={[300,40]} b={[300,165]} label="R_1" value="10 kΩ" flipLabel/><S.Res a={[300,165]} b={[300,300]} label="R_2" value="10 kΩ" flipLabel/><S.Ground at={[300,300]}/>
  <S.Wire pts={[[300,165],p.plus]}/><S.Dot at={[300,165]}/><S.Dot at={[360,165]}/>
  <S.Wire pts={[[360,165],[360,90],[440,90]]}/><S.Res a={[440,90]} b={[560,90]} label="R_3" value="82 kΩ"/><S.Wire pts={[[560,90],[560,180]]}/>
  <S.OpAmp at={at} plusTop/><S.Wire pts={[p.out,[640,180]]}/><S.Dot at={[560,180]}/><S.Terminal at={[640,180]} label="v_out" side="above"/>
 </S.Schematic></S.Figure>;
}
export function WienStartupFigure(){
 const w0=2*Math.PI*1000,dt=2e-6,out:[number,number][]=[],env:[number,number][]=[];let v=.01,dv=0,a=0;
 for(let n=0;n<=30000;n++){const K=3+.2*(1-a/2);const acc=-(3-K)*w0*dv-w0*w0*v;dv+=acc*dt;v+=dv*dt;a+=dt*(v*v-a)/5e-3;if(n%10===0){out.push([n*dt*1e3,v]);env.push([n*dt*1e3,Math.sqrt(2*a)]);}}
 return <S.Figure plot caption="Start-up of a 1 kHz Wien-bridge oscillator with amplitude control. The amplifier's gain starts at 3.2, slightly above the 3 needed to sustain oscillation, so a tiny initial disturbance grows exponentially. A control loop measures the mean-square output (dashed: the estimated peak) and reduces the gain as the amplitude approaches 2 V. After a few overshoots of the envelope the gain settles at exactly 3 and the amplitude at 2 V. A fixed gain of 3 would never start; a fixed 3.2 would grow until the op amp clipped, distorting the sine.">
 <Plot curves={[{name:'Oscillator output',color:S.green,points:out},{name:'Amplitude estimate',color:S.orange,dashed:true,points:env}]} xRange={[0,60]} yRange={[-3,3]} xLabel="TIME / ms" yLabel="VOLTAGE / V" description="A sine wave growing from nothing to a steady two volt amplitude over about forty milliseconds, with its envelope overshooting slightly before settling."/></S.Figure>;
}
export function SignalChainFigure(){
 return <S.Figure caption="The complete measurement chain designed in section 05: a 350 Ω strain-gauge bridge, an instrumentation amplifier (gain 200, output referred to 2.5 V), a second-order Butterworth low-pass at 100 Hz to set the noise bandwidth and act as an anti-aliasing filter, and an ADC driver with an RC charge reservoir into a 16-bit ADC whose reference is the bridge's own 5 V excitation, so the measurement is ratiometric. Every arrow is also a loading, range and noise question.">
 <S.Schematic width={780} height={200} description="Block diagram: bridge, instrumentation amplifier, low-pass filter, ADC driver, ADC with ratiometric reference.">
  <Block x={20} y={70} w={110} ports={[[130,100]]}>bridge</Block><S.Wire pts={[[130,100],[170,100]]}/>
  <Block x={170} y={70} w={120} ports={[[170,100],[290,100]]}>INA, G = 200</Block><S.Wire pts={[[290,100],[330,100]]}/>
  <Block x={330} y={70} w={130} ports={[[330,100],[460,100]]}>LPF, 100 Hz</Block><S.Wire pts={[[460,100],[500,100]]}/>
  <Block x={500} y={70} w={120} ports={[[500,100],[620,100]]}>ADC driver</Block><S.Wire pts={[[620,100],[660,100]]}/>
  <Block x={660} y={70} w={100} ports={[[660,100]]}>16-bit ADC</Block>
  <S.Text x={75} y={155} anchor="middle" kind="value">±5 mV on 2.5 V</S.Text><S.Text x={230} y={155} anchor="middle" kind="value">2.5 V ± 1 V</S.Text><S.Text x={395} y={155} anchor="middle" kind="value">noise bandwidth</S.Text><S.Text x={560} y={155} anchor="middle" kind="value">settle in 1 µs</S.Text><S.Text x={710} y={155} anchor="middle" kind="value">ref = excitation</S.Text>
 </S.Schematic></S.Figure>;
}
