// Static figures for the Foundations chapters (01–04). Rendered at build time.
import Plot from './Plot';
import {Schematic,Figure,Wire,Res,Cap,Diode,Source,CurrentSource,DepSource,Ground,Dot,Terminal,Text,CurrentArrow,green,orange,gray,ink,type Pt} from './Schematic';
import {logspace} from './Parts';

const pairs=(xs:number[],f:(x:number)=>number)=>xs.map(x=>[x,f(x)] as [number,number]);
const par=(a:number,b:number)=>a*b/(a+b);

/* ---------- Chapter 1: dividers ---------- */
// A loaded divider and its Thévenin equivalent, side by side.
export function DividerEquivalentFigure(){
  const o1:Pt=[200,110],o2:Pt=[580,110];
  return <Figure caption="The same output, two drawings. Left: the loaded divider. Right: its Thévenin equivalent, an ideal 5 V source behind $R_{\mathrm{th}} = R_1 \parallel R_2$ = 5 kΩ. Any load sees identical voltage and current in both, so the right-hand drawing is the one to reason with: the load and $R_{\mathrm{th}}$ form a second divider, and 10 kΩ against 5 kΩ leaves 3.333 V.">
    <Schematic width={680} height={250} description="Left: 10 volt source, 10 kilohm upper resistor, 10 kilohm lower resistor and 10 kilohm load in parallel with the lower resistor. Right: a 5 volt source in series with 5 kilohms driving the same 10 kilohm load. Both outputs are 3.333 volts.">
      <Source a={[50,180]} b={[50,110]} label="10 V"/><Wire pts={[[50,110],[50,40],[200,40]]}/><Res a={[200,40]} b={o1} label="R_1" value="10 kΩ"/>
      <Res a={o1} b={[200,210]} label="R_2" value="10 kΩ"/><Wire pts={[o1,[300,110]]} color={green}/><Res a={[300,110]} b={[300,210]} label="R_L" value="10 kΩ" color={orange}/>
      <Wire pts={[[300,210],[50,210],[50,180]]}/><Dot at={o1} color={green}/><Dot at={[200,210]}/><Ground at={[120,210]}/>
      <Text x={190} y={98} anchor="end" kind="output">3.333 V</Text>
      <text x={395} y={138} textAnchor="middle" style={{font:'32px var(--serif)',fill:'var(--muted)'}}>≡</text>
      <Source a={[450,180]} b={[450,110]} label="V_th" value="5 V"/><Wire pts={[[450,110],[450,40],[480,40]]}/><Res a={[480,40]} b={[580,40]} label="R_th" value="5 kΩ"/>
      <Wire pts={[[580,40],o2]}/><Res a={o2} b={[580,210]} label="R_L" value="10 kΩ" color={orange}/><Wire pts={[[580,210],[450,210],[450,180]]}/><Ground at={[515,210]}/>
      <Dot at={o2} color={green}/><Wire pts={[o2,[650,110]]} color={green}/><Terminal at={[650,110]} label="3.333 V" side="above"/>
    </Schematic></Figure>;
}

export function LoadingErrorFigure(){
  const xs=logspace(-1,4,300);
  return <Figure plot caption="Loading error $\epsilon = R_{\mathrm{th}}/(R_{\mathrm{th}}+R_L)$ against the ratio $R_L/R_{\mathrm{th}}$, on logarithmic axes. Far right, the curve is a straight line of slope −1: every factor of ten in load resistance buys a factor of ten in accuracy. The marked point is the popular “load ten times the source” rule, which costs 9.1%, not 1%.">
    <Plot curves={[{name:'Loading error',color:green,points:pairs(xs,x=>100/(1+x))},{name:'10%, 1% and 0.1% levels',color:gray,dashed:true,points:[[.1,10],[1e4,10],[NaN,NaN],[.1,1],[1e4,1],[NaN,NaN],[.1,.1],[1e4,.1]]}]}
      xRange={[.1,1e4]} yRange={[.01,100]} xScale="log" yScale="log" xLabel="LOAD-TO-SOURCE RATIO R_L / R_th" yLabel="LOADING ERROR / %" point={[10,100/11]} pointLabel="Ten-times rule: 9.1%"
      description="Loading error falls from about 91 percent at a ratio of 0.1 to 0.01 percent at a ratio of 10,000, crossing 10 percent at 9, 1 percent at 99 and 0.1 percent at 999."/>
  </Figure>;
}

// The same ratio at three impedance levels.
export function ImpedanceLevelFigure(){
  const xs=logspace(2,7,300),curve=(r:number)=>pairs(xs,rl=>10*par(r,rl)/(r+par(r,rl)));
  return <Figure plot caption="Three dividers with the same ratio, each two equal resistors from 10 V, feeding a load swept from 100 Ω to 10 MΩ. All three reach 5 V unloaded, but the 100 kΩ pair needs a load above about 10 MΩ to stay within 1%, while the 1 kΩ pair is satisfied by 100 kΩ. The price is current: the 1 kΩ pair draws 5 mA continuously; the 100 kΩ pair, 50 µA.">
    <Plot curves={[{name:'1 kΩ + 1 kΩ',color:green,points:curve(1e3)},{name:'10 kΩ + 10 kΩ',color:ink,points:curve(1e4)},{name:'100 kΩ + 100 kΩ',color:orange,points:curve(1e5)},{name:'Unloaded, 5 V',color:gray,dashed:true,points:[[100,5],[1e7,5]]}]}
      xRange={[100,1e7]} yRange={[0,6]} xScale="log" xLabel="LOAD RESISTANCE R_L / Ω" yLabel="OUTPUT VOLTAGE / V" description="Three S-shaped curves rising to 5 volts. The 1 kilohm divider reaches 5 volts by about 100 kilohms of load, the 10 kilohm divider by about 1 megohm, the 100 kilohm divider by about 10 megohms."/>
  </Figure>;
}

export function DividerTradeoffFigure(){
  const xs=logspace(2,6,240);
  return <Figure plot caption="The design tradeoff for two equal resistors $R$ dividing 10 V into a 100 kΩ load. Dissipation (left) falls as $1/R$; loading error (right) rises with $R$. A 1% loading budget allows $R$ up to about 2 kΩ, which costs 25 mW. There is no value that is best at both; the specification decides.">
    <div className="split-plots">
      <div><h4>Power drawn from the supply</h4><Plot curves={[{name:'Divider dissipation',color:orange,points:pairs(xs,r=>100/(2*r)*1e3)}]} xRange={[100,1e6]} yRange={[.01,1000]} xScale="log" yScale="log" xLabel="EACH RESISTOR R / Ω" yLabel="POWER / mW" point={[2000,25]} pointLabel="2 kΩ design" description="Dissipation falls from 500 milliwatts at 100 ohms to 0.05 milliwatts at 1 megohm; 25 milliwatts at 2 kilohms."/></div>
      <div><h4>Error caused by a 100 kΩ load</h4><Plot curves={[{name:'Loading error',color:green,points:pairs(xs,r=>(r/2)/(r/2+1e5)*100)}]} xRange={[100,1e6]} yRange={[.01,100]} xScale="log" yScale="log" xLabel="EACH RESISTOR R / Ω" yLabel="LOADING ERROR / %" point={[2000,1/1.01]} pointLabel="2 kΩ design" description="Loading error rises from 0.05 percent at 100 ohms to 83 percent at 1 megohm; about 1 percent at 2 kilohms."/></div>
    </div></Figure>;
}

// A battery monitor feeding a microcontroller ADC.
export function BatteryMonitorFigure(){
  const n:Pt=[260,140];
  return <Figure caption="A battery-voltage monitor. $R_1$ and $R_2$ scale up to 14.4 V into the converter's 0–3.3 V range. The capacitor is not part of the ratio: it is a charge reservoir that refills the converter's sampling capacitor, so the divider's 21 kΩ Thévenin resistance does not have to.">
    <Schematic width={560} height={270} description="Battery positive through 100 kilohms to a node; 27 kilohms from the node to ground; 100 nanofarads from node to ground; node to an ADC input pin.">
      <Source kind="battery" a={[60,200]} b={[60,80]} label="battery" value="11–14.4 V"/><Wire pts={[[60,80],[60,40],[260,40]]}/>
      <Res a={[260,40]} b={n} label="R_1" value="100 kΩ"/><Res a={n} b={[260,240]} label="R_2" value="27 kΩ" flipLabel/>
      <Wire pts={[n,[360,140]]}/><Cap a={[360,140]} b={[360,240]} label="C" value="100 nF"/><Wire pts={[[360,140],[470,140]]} color={green}/><Terminal at={[470,140]} label="ADC input" side="right"/>
      <Wire pts={[[60,200],[60,240],[360,240]]}/><Dot at={n}/><Dot at={[360,140]}/><Dot at={[260,240]}/><Ground at={[160,240]}/>
      <Text x={380} y={128} kind="output">0–3.06 V</Text>
    </Schematic></Figure>;
}

/* ---------- Chapter 2: Thévenin ---------- */
// The three steps of finding an equivalent, on the 12 V / 3 kΩ / 6 kΩ example.
export function TheveninStepsFigure(){
  const panel=(x0:number,step:number)=>{const o:Pt=[x0+150,110];return <g key={step}>
    {step===0&&<Source a={[x0+30,200]} b={[x0+30,120]} label="12 V"/>}
    {step===1&&<><Wire pts={[[x0+30,200],[x0+30,120]]} color={orange}/><Text x={x0+40} y={165} kind="value" color={orange}>short (0 V)</Text></>}
    {step===2&&<Source a={[x0+30,200]} b={[x0+30,120]} label="V_th" value="8 V"/>}
    <Wire pts={[[x0+30,120],[x0+30,40],[x0+60,40]]}/><Res a={[x0+60,40]} b={[x0+150,40]} label={step===2?'R_th':'3 kΩ'} value={step===2?'2 kΩ':undefined}/><Wire pts={[[x0+150,40],o]}/>
    {step<2&&<><Res a={o} b={[x0+150,220]} label="6 kΩ"/><Dot at={o}/></>}
    {step===2&&<><Res a={o} b={[x0+150,220]} label="4 kΩ" value="load" color={orange}/><Dot at={o} color={green}/></>}
    <Wire pts={[[x0+150,220],[x0+30,220],[x0+30,200]]}/><Wire pts={[o,[x0+200,110]]} color={green}/><Terminal at={[x0+200,110]}/>
    <Text x={x0+120} y={268} anchor="middle" kind="output">{['1 · open circuit: V_oc = 8 V','2 · zero the source: R_th = 2 kΩ','3 · reconnect: V_L = 5.33 V'][step]}</Text>
  </g>;};
  return <Figure caption="Finding an equivalent in three moves. (1) Remove only the load and find the open-circuit voltage: the divider gives 8 V. (2) Set the independent source to zero (a short, shown in orange) and look into the port: 3 kΩ and 6 kΩ are now in parallel, 2 kΩ. (3) Reconnect the load to the equivalent: 4 kΩ against 2 kΩ receives two-thirds of 8 V.">
    <Schematic width={760} height={285} description="Three panels. First: 12 volt source, 3 kilohm series resistor, 6 kilohm resistor to ground, open output reading 8 volts. Second: the source replaced by a short; looking into the output gives 3 kilohms in parallel with 6 kilohms. Third: an 8 volt source with 2 kilohms in series feeding a 4 kilohm load.">
      {[0,1,2].map(i=>panel(i*255,i))}
    </Schematic></Figure>;
}

// Two sources with the same open-circuit voltage but different output resistance.
export function SourceLinesFigure(){
  const line=(r:number)=>[[0,9],[9/r*1e3,0]] as [number,number][],load=200;
  return <Figure plot caption="Two sources that both read 9 V on a voltmeter. Their terminal lines start at the same point but fall at different rates: the slope is $-R_{\mathrm{th}}$. A 200 Ω load (orange, $V = IR_L$) meets the 50 Ω source at 7.2 V and the 500 Ω source at only 2.6 V. The open-circuit voltage was never enough information.">
    <Plot curves={[{name:'Source with R_th = 50 Ω',color:green,points:line(50)},{name:'Source with R_th = 500 Ω',color:ink,points:line(500)},{name:'200 Ω load line',color:orange,dashed:true,points:[[0,0],[50,10]]}]}
      xRange={[0,100]} yRange={[0,10]} xLabel="CURRENT DELIVERED I / mA" yLabel="TERMINAL VOLTAGE V / V" point={[9/250*1e3,7.2]} pointLabel="Operating point, 50 Ω source"
      description="Two lines from 9 volts at zero current: one reaches zero at 180 milliamps, the other at 18 milliamps. A load line through the origin with slope 200 ohms crosses them at 7.2 volts and 2.57 volts."/>
  </Figure>;
}

export function NortonFigure(){
  const o1:Pt=[250,80],o2:Pt=[560,80];
  return <Figure caption="Thévenin and Norton forms of the same port. An 8 V source behind 2 kΩ, or a 4 mA source in parallel with 2 kΩ. Check both limits: open circuit, the Norton current flows through its resistor and makes 8 V; short circuit, the Thévenin source drives 8 V/2 kΩ = 4 mA. Same two points, same line.">
    <Schematic width={680} height={230} description="Left: 8 volt source in series with 2 kilohms to an output terminal. Right: a 4 milliamp current source in parallel with a 2 kilohm resistor at an output terminal.">
      <Source a={[60,190]} b={[60,110]} label="8 V"/><Wire pts={[[60,110],[60,80],[120,80]]}/><Res a={[120,80]} b={[220,80]} label="2 kΩ"/><Wire pts={[[220,80],o1]}/><Terminal at={o1} label="+" side="right"/>
      <Wire pts={[[60,190],[60,210],[250,210]]}/><Terminal at={[250,210]} label="−" side="right"/>
      <text x={340} y={140} textAnchor="middle" style={{font:'32px var(--serif)',fill:'var(--muted)'}}>≡</text>
      <CurrentSource a={[420,190]} b={[420,100]} label="4 mA"/><Wire pts={[[420,100],[420,80],o2]}/><Res a={[500,80]} b={[500,210]} label="2 kΩ"/>
      <Wire pts={[[420,190],[420,210],[560,210]]}/><Dot at={[500,80]}/><Dot at={[500,210]}/><Terminal at={o2} label="+" side="right"/><Terminal at={[560,210]} label="−" side="right"/>
    </Schematic></Figure>;
}

export function PowerTransferFigure(){
  const xs=logspace(-2,2,240);
  return <Figure plot caption="Load power (as a fraction of the maximum possible, $V_{\mathrm{th}}^2/4R_{\mathrm{th}}$) and efficiency against $R_L/R_{\mathrm{th}}$. Power peaks at a matched load, where efficiency is exactly 50%. Efficiency keeps rising as the load grows, $\eta = R_L/(R_L + R_{\mathrm{th}})$, while power falls. Signal and RF circuits often match; power supplies and amplifiers driving speakers do not.">
    <Plot curves={[{name:'Load power / maximum',color:green,points:pairs(xs,x=>4*x/(1+x)**2*100)},{name:'Efficiency',color:orange,dashed:true,points:pairs(xs,x=>x/(1+x)*100)}]}
      xRange={[.01,100]} yRange={[0,100]} xScale="log" xLabel="LOAD-TO-SOURCE RATIO R_L / R_th" yLabel="PERCENT" point={[1,100]} pointLabel="Matched load: 100% power, 50% efficiency"
      description="Load power rises from 4 percent at a ratio of 0.01 to a peak of 100 percent at a ratio of 1, falling symmetrically on the log axis. Efficiency rises steadily from 1 percent to 99 percent, passing 50 percent at a ratio of 1."/>
  </Figure>;
}

export function BridgeFigure(){
  const A:Pt=[200,145],B:Pt=[380,145];
  return <Figure caption="A Wheatstone bridge reading a strain gauge ($R_4$). No resistor here is in series or in parallel with another once the meter is connected, so series–parallel reduction stalls. Thévenin's theorem does not: find the open-circuit voltage between A and B, and the resistance between them with the supply shorted.">
    <Schematic width={560} height={280} description="A 10 volt source feeds two dividers in parallel: 10 kilohms over 10 kilohms on the left with midpoint A, 10 kilohms over a 10.1 kilohm strain gauge on the right with midpoint B. A 5 kilohm meter connects A to B.">
      <Source a={[60,200]} b={[60,90]} label="10 V"/><Wire pts={[[60,90],[60,40],[380,40]]}/><Wire pts={[[60,200],[60,250],[380,250]]}/><Ground at={[130,250]}/>
      <Res a={[200,40]} b={A} label="R_1" value="10 kΩ" flipLabel/><Res a={A} b={[200,250]} label="R_2" value="10 kΩ" flipLabel/>
      <Res a={[380,40]} b={B} label="R_3" value="10 kΩ"/><Res a={B} b={[380,250]} label="R_4" value="10.1 kΩ (gauge)"/>
      <Res a={A} b={B} label="meter" value="5 kΩ" color={orange}/><Dot at={A}/><Dot at={B}/><Dot at={[200,40]}/><Dot at={[200,250]}/>
      <Text x={A[0]-8} y={A[1]-10} anchor="end" kind="output">A</Text><Text x={B[0]+10} y={B[1]-10} kind="output">B</Text>
    </Schematic></Figure>;
}

export function DependentTestFigure(){
  const top:Pt=[300,50],bot:Pt=[300,235];
  return <Figure caption="Measuring a port that contains a dependent source. With independent sources set to zero, a 1 V test source $V_t$ drives the port and we compute the current $I_t$ it must supply. The diamond is a dependent current source: it injects $0.75\,V_t/(2\text{ k}\Omega)$ into the port and must stay in the circuit.">
    <Schematic width={660} height={270} description="A 1 volt test source drives a port with a 2 kilohm resistor to ground and a parallel dependent current source injecting 0.75 times Vt divided by 2 kilohms upward into the port.">
      <Source a={[90,170]} b={[90,110]} label="V_t" value="1 V"/><Wire pts={[[90,110],[90,50],top]}/><CurrentArrow at={[170,50]} dir="right" label="I_t enters"/>
      <Res a={top} b={bot} label="2 kΩ"/><Wire pts={[top,[440,50]]}/><DepSource a={[440,235]} b={[440,50]} label="0.75 V_t / 2 kΩ" value="dependent source"/>
      <Wire pts={[[440,235],bot]}/><Wire pts={[bot,[90,235],[90,170]]}/><Dot at={top}/><Dot at={bot}/><Ground at={[200,235]}/>
      <Text x={300} y={30} anchor="middle" kind="output">test port</Text>
    </Schematic></Figure>;
}

/* ---------- Chapter 3: small-signal resistance ---------- */
const VT=0.02585,IS=1e-12,diodeI=(v:number)=>IS*(Math.exp(v/VT)-1);
// DC ratio (chord from the origin) versus the tangent at the bias point.
export function ChordTangentFigure(){
  const vq=VT*Math.log(1+1e-3/IS),xs=Array.from({length:301},(_,k)=>.62*k/300);
  return <Figure plot caption="The diode curve near a 1 mA bias point (0.536 V). The dashed line from the origin has slope $I_Q/V_Q$: it describes the operating point (535.7 Ω) but nothing about changes. The orange tangent has slope $1/r_d$: near Q it follows the curve closely, and its steepness (25.85 Ω) predicts how much current a small extra voltage adds.">
    <Plot curves={[{name:'Diode, I_S = 1 pA, n = 1',color:green,points:xs.map(v=>[v,diodeI(v)*1e3] as [number,number])},{name:'Chord from origin: V_Q / I_Q = 536 Ω',color:gray,dashed:true,points:[[0,0],[.62,.62/vq]]},{name:'Tangent at Q: r_d = 25.85 Ω',color:orange,points:[[vq-.03,1-.03/VT],[vq+.03,1+.03/VT]]}]}
      xRange={[0,.62]} yRange={[0,3]} xLabel="DIODE VOLTAGE V / V" yLabel="DIODE CURRENT I / mA" point={[vq,1]} pointLabel="Bias point Q"
      description="An exponential curve that is nearly zero below 0.45 volts and rises steeply through 1 milliamp at 0.536 volts. A shallow dashed line from the origin passes through the same point; a steep tangent line touches it there."/>
  </Figure>;
}

export function ResistanceVsBiasFigure(){
  const xs=logspace(-6,-1,200);
  return <Figure plot caption="Small-signal resistance $r_d = V_T/I_Q$ (green) and the DC ratio $V_Q/I_Q$ (gray) against bias current, on logarithmic axes. Each decade of current divides $r_d$ by exactly ten, a straight line of slope −1. The DC ratio falls more slowly because $V_Q$ itself grows by 60 mV per decade. The gap between them, about twentyfold here, is why the DC ratio is useless for small-signal work.">
    <Plot curves={[{name:'r_d = V_T / I_Q',color:green,points:pairs(xs,i=>VT/i)},{name:'V_Q / I_Q',color:gray,dashed:true,points:pairs(xs,i=>VT*Math.log(1+i/IS)/i)}]}
      xRange={[1e-6,.1]} yRange={[.1,1e6]} xScale="log" yScale="log" xLabel="BIAS CURRENT I_Q / A" yLabel="RESISTANCE / Ω" point={[1e-3,VT/1e-3]} pointLabel="1 mA: 25.85 Ω"
      description="Two straight descending lines on log-log axes. Small-signal resistance falls from 25.85 kilohms at 1 microamp to 0.26 ohms at 100 milliamps; the DC ratio stays roughly twenty times higher."/>
  </Figure>;
}

export function LinearizationErrorFigure(){
  const vs=Array.from({length:241},(_,k)=>-30+60*k/240).filter(v=>Math.abs(v)>.05);
  const err=(mv:number)=>{const x=mv/1e3/VT,exact=Math.expm1(x);return Math.abs((exact-x)/exact)*100;};
  return <Figure plot caption="Error of the linear prediction $i = v/r_d$ relative to the exact current change, against the size of the voltage step. The error grows almost linearly with amplitude: about 2% per millivolt near zero, 10% at 5 mV, 34% at 20 mV. Positive steps are underestimated and negative steps overestimated, so a symmetric sine wave produces an asymmetric current.">
    <Plot curves={[{name:'|error| in Δi',color:orange,points:vs.map(v=>[v,err(v)] as [number,number])}]} xRange={[-30,30]} yRange={[0,50]} xLabel="VOLTAGE CHANGE FROM Q, v / mV" yLabel="ERROR / %"
      description="A V-shaped curve that is zero at zero voltage change and rises to about 45 percent at plus 30 millivolts and 40 percent at minus 30 millivolts."/>
  </Figure>;
}

export function DistortionFigure(){
  const ts=Array.from({length:301},(_,k)=>2*k/300),amp=.02,iq=1;
  return <Figure plot caption="Current through a 1 mA diode driven by a 20 mV peak sine wave directly across it. The linear model (dashed) predicts a symmetric swing of ±0.77 mA. The exponential (green) swings up by 1.17 mA and down by only 0.54 mA. The waveform is no longer a sine: the extra content appears as harmonics, which is what distortion means. A smaller signal, or a series resistor that keeps the junction's share of the signal small, restores linearity.">
    <Plot curves={[{name:'Exact exponential',color:green,points:ts.map(t=>[t,iq*Math.exp(amp*Math.sin(2*Math.PI*t)/VT)] as [number,number])},{name:'Linear model',color:gray,dashed:true,points:ts.map(t=>[t,iq*(1+amp*Math.sin(2*Math.PI*t)/VT)] as [number,number])},{name:'Bias current',color:orange,dashed:true,points:[[0,iq],[2,iq]]}]}
      xRange={[0,2]} yRange={[0,2.4]} xLabel="TIME / PERIODS" yLabel="DIODE CURRENT / mA"
      description="Two periods. The exact current peaks at 2.17 milliamps and dips to 0.46 milliamps; the linear model swings symmetrically between 0.23 and 1.77 milliamps."/>
  </Figure>;
}

// A diode used as a current-controlled attenuator.
export function AttenuatorFigure(){
  const n:Pt=[330,80];
  return <Figure caption="A current-controlled attenuator. The bias source sets $I_Q$ through the large resistor $R_B$; the coupling capacitor passes the signal but blocks the bias from the signal source. For the signal, the diode is just $r_d = V_T/I_Q$, so the DC control current sets the AC gain $r_d/(R_s + r_d)$.">
    <Schematic width={600} height={270} description="Signal source through a capacitor and 1 kilohm to a node; a diode from node to ground; a bias source feeds the node through a large resistor. Output taken at the node.">
      <Source kind="ac" a={[60,220]} b={[60,140]} label="v_s"/><Wire pts={[[60,140],[60,80],[100,80]]}/><Cap a={[100,80]} b={[160,80]} label="C"/><Res a={[160,80]} b={[260,80]} label="R_s" value="1 kΩ"/><Wire pts={[[260,80],n]}/>
      <Diode a={n} b={[330,240]} label="D"/><Wire pts={[[330,240],[60,240],[60,220]]}/><Ground at={[200,240]}/>
      <Wire pts={[n,[330,40],[430,40]]}/><Res a={[430,40]} b={[530,40]} label="R_B" value="large"/><Source a={[560,240]} b={[560,140]} label="bias" flipLabel/><Wire pts={[[530,40],[560,40],[560,140]]}/><Wire pts={[[560,240],[330,240]]}/>
      <Dot at={n} color={green}/><Dot at={[330,240]}/><Wire pts={[n,[420,80]]} color={green}/><Terminal at={[420,80]} label="v_out" side="right"/>
    </Schematic></Figure>;
}

export function IncrementalFigure(){
  const n:Pt=[430,55];
  return <Figure caption="The incremental (small-signal) circuit of a diode biased at 1 mA. The DC sources have been removed; every voltage and current is a change. The diode is replaced by its slope resistance $r_d$ = 25.85 Ω, and the divider it forms with $R_s$ passes only 2.5% of the signal.">
    <Schematic width={600} height={265} description="A 10 millivolt signal source drives a 1 kilohm series resistor and a 25.85 ohm diode small-signal resistance to ground. Voltage across the latter is 0.252 millivolts.">
      <Source kind="ac" a={[90,170]} b={[90,100]} label="v_s" value="10 mV"/><Wire pts={[[90,100],[90,55],[220,55]]}/><Res a={[220,55]} b={[330,55]} label="R_s" value="1 kΩ"/>
      <Wire pts={[[330,55],n]}/><Res a={n} b={[430,230]} label="r_d" value="25.85 Ω"/><Wire pts={[[430,230],[90,230],[90,170]]}/><Ground at={[260,230]}/>
      <Dot at={n} color={green}/><Text x={450} y={48} kind="output">v_d ≈ 0.252 mV</Text>
    </Schematic></Figure>;
}

/* ---------- Chapter 4: power and heating ---------- */
export function HeldConstantFigure(){
  const xs=logspace(0,4,200);
  return <Figure plot caption="Power in a resistor $R$ when the voltage across it is held at 10 V (green, $P = V^2/R$) and when the current through it is held at 100 mA (orange, $P = I^2R$). The lines slope in opposite directions. Asking whether a larger resistor dissipates more is meaningless until you say what the circuit holds fixed; the two drives agree only at $R = V/I$ = 100 Ω.">
    <Plot curves={[{name:'Fixed 10 V across R',color:green,points:pairs(xs,r=>100/r)},{name:'Fixed 100 mA through R',color:orange,points:pairs(xs,r=>.01*r)}]}
      xRange={[1,1e4]} yRange={[.01,100]} xScale="log" yScale="log" xLabel="RESISTANCE R / Ω" yLabel="POWER / W" point={[100,1]} pointLabel="Both: 1 W at 100 Ω"
      description="On log-log axes, power at fixed voltage falls from 100 watts at 1 ohm to 0.01 watts at 10 kilohms; power at fixed current rises from 0.01 watts at 1 ohm to 100 watts at 10 kilohms. They cross at 1 watt and 100 ohms."/>
  </Figure>;
}

export function RmsFigure(){
  const ts=Array.from({length:301},(_,k)=>2*k/300),vp=5;
  return <Figure plot caption="Why RMS is the heating value. A 5 V peak sine (gray) averages to zero, but power depends on its square (green), which is never negative. The square averages to $V_p^2/2$ = 12.5 V² (orange); its square root, 3.54 V, is the RMS value. A 3.54 V battery would heat a resistor exactly as much.">
    <Plot curves={[{name:'v(t), 5 V peak',color:gray,dashed:true,points:ts.map(t=>[t,vp*Math.sin(2*Math.PI*t)] as [number,number])},{name:'v²(t) / V²',color:green,points:ts.map(t=>[t,(vp*Math.sin(2*Math.PI*t))**2] as [number,number])},{name:'Mean of v² = 12.5 V²',color:orange,dashed:true,points:[[0,12.5],[2,12.5]]}]}
      xRange={[0,2]} yRange={[-6,26]} xLabel="TIME / PERIODS" yLabel="VOLTAGE / V   ·   SQUARED VOLTAGE / V²"
      description="A sine wave between plus and minus 5 volts, and its square, which oscillates between 0 and 25 at twice the frequency, with a mean of 12.5."/>
  </Figure>;
}

// Pulsed dissipation and the temperature it produces (single-node model, fast thermal mass for visibility).
export function PulseHeatingFigure(){
  const R=100,C=5e-4,dt=1e-4,period=.01,on=.001,tau=R*C,steps=Math.round(.5/dt),pts:[number,number][]=[];let T=0;
  for(let k=0;k<=steps;k++){const t=k*dt,p=(t%period)<on?4:0;if(k%5===0)pts.push([t*1e3,T]);T+=dt*(p-T/R)/C;}
  return <Figure plot caption="The 4 W, 1 ms, 10% duty pulse train of the worked example, applied to a small part with $R_\theta$ = 100 °C/W and $C_\theta$ = 0.5 mJ/°C ($\tau$ = 50 ms). The temperature climbs toward the rise set by the average power, 0.4 W × 100 °C/W = 40 °C, but each 4 mJ pulse adds a jump of up to 8 °C on top. Average power predicts the trend; the pulse energy and the thermal mass set the peaks.">
    <Plot curves={[{name:'Temperature rise',color:orange,points:pts},{name:'Average-power prediction, 40 °C',color:gray,dashed:true,points:[[0,40],[500,40]]}]}
      xRange={[0,500]} yRange={[0,55]} xLabel="TIME / ms" yLabel="TEMPERATURE RISE / °C"
      description="A sawtooth temperature trace that rises over about 200 milliseconds and settles into a ripple between roughly 37 and 45 degrees above ambient, around the 40 degree average prediction."/>
  </Figure>;
}

export function WarmUpFigure(){
  const ts=Array.from({length:201},(_,k)=>15*k/200),rise=(p:number,r:number,c:number)=>ts.map(t=>[t,25+p*r*(1-Math.exp(-t*60/(r*c)))] as [number,number]);
  return <Figure plot caption="Warm-up of the single-node model from 25 °C. Default (green): 0.25 W, 100 °C/W, 2 J/°C, so the temperature rises 25 °C with a 200 s time constant. Doubling the current (orange) quadruples the power and the final rise but leaves the time constant alone. Halving the thermal resistance (gray) halves both the final rise and the time constant, because $\tau = R_\theta C_\theta$.">
    <Plot curves={[{name:'0.25 W, 100 °C/W',color:green,points:rise(.25,100,2)},{name:'1 W, 100 °C/W',color:orange,points:rise(1,100,2)},{name:'0.25 W, 50 °C/W',color:gray,points:rise(.25,50,2)}]}
      xRange={[0,15]} yRange={[0,130]} xLabel="TIME / min" yLabel="TEMPERATURE / °C" point={[200/60,25+25*(1-Math.exp(-1))]} pointLabel="One time constant: 63% of the rise"
      description="Three exponential curves from 25 degrees: one settling at 50 degrees, one at 125 degrees with the same shape, and one settling faster at 37.5 degrees."/>
  </Figure>;
}

export function DeratingFigure(){
  return <Figure plot caption="A typical derating rule for a hypothetical 1 W resistor: full rating up to 70 °C, falling linearly to zero at 155 °C. At 100 °C the allowed continuous dissipation is 0.647 W. The rule belongs to a specific datasheet and mounting; read which temperature (ambient, terminal or case) it refers to.">
    <Plot curves={[{name:'Allowed continuous power',color:green,points:[[0,1],[70,1],[155,0],[170,0]]}]} xRange={[0,170]} yRange={[0,1.2]} xLabel="TEMPERATURE / °C" yLabel="ALLOWED POWER / W" point={[100,.647]} pointLabel="100 °C: 0.647 W"
      description="A flat line at 1 watt from 0 to 70 degrees, then a straight decline to 0 watts at 155 degrees."/>
  </Figure>;
}

// A series thermal path from a power device's junction to ambient air.
export function ThermalChainFigure(){
  const j:Pt=[200,60],c:Pt=[330,60],sk:Pt=[460,60];
  return <Figure caption="A dominant heat path drawn as series thermal resistances: junction to case (from the datasheet), case to heatsink (the interface: grease, pad or mica), and heatsink to ambient (from the heatsink's datasheet, at a stated airflow). The heat flow $P$ is the same through each, so the temperature rises add, just as voltages add across series resistors.">
    <Schematic width={640} height={240} description="A heat source P feeds the junction node; three thermal resistances in series, junction to case, case to sink, and sink to ambient, lead to the ambient reference.">
      <CurrentSource a={[80,200]} b={[80,110]} label="P" value="1.4 W"/><Wire pts={[[80,110],[80,60],j]}/>
      <Res a={j} b={c} label="R_θJC" value="5 °C/W"/><Res a={c} b={sk} label="R_θCS" value="0.5 °C/W"/><Res a={sk} b={[590,60]} label="R_θSA" value="15 °C/W"/>
      <Wire pts={[[590,60],[590,200],[80,200]]}/><Ground at={[200,200]}/>
      <Dot at={j} color={orange}/><Dot at={c}/><Dot at={sk}/>
      <Text x={200} y={110} anchor="middle" kind="output">T_J = 78.7 °C</Text><Text x={330} y={110} anchor="middle" kind="value">T_C = 71.7 °C</Text><Text x={460} y={110} anchor="middle" kind="value">T_S = 71.0 °C</Text>
      <Text x={222} y={222} kind="value">ambient: 50 °C</Text>
    </Schematic></Figure>;
}

export function ThermalAnalogyFigure(){
  const n:Pt=[290,60];
  return <Figure caption="A thermal analogy, not a wiring diagram. Heat flow $P$ acts like current, temperature rise $\Delta T$ like voltage, thermal resistance $R_\theta$ like resistance and heat capacity $C_\theta$ like capacitance. In steady state the capacitor is irrelevant and $\Delta T = PR_\theta$; it sets how fast the temperature gets there, with time constant $\tau = R_\theta C_\theta$.">
    <Schematic width={600} height={285} description="Thermal analogy: a heat input P feeds a temperature-rise node connected to ambient through thermal resistance and storing heat in thermal capacitance.">
      <CurrentSource a={[90,170]} b={[90,100]} label="P" value="watts"/><Wire pts={[[90,100],[90,60],n]}/><Res a={n} b={[290,235]} label="R_θ" value="°C/W"/>
      <Wire pts={[n,[460,60]]}/><Cap a={[460,60]} b={[460,235]} label="C_θ" value="J/°C"/><Wire pts={[[460,235],[90,235],[90,170]]}/>
      <Dot at={n} color={green}/><Dot at={[290,235]}/><Text x={290} y={40} anchor="middle" kind="output">temperature rise ΔT</Text>
      <Text x={130} y={265} kind="value">ambient reference: ΔT = 0</Text>
    </Schematic></Figure>;
}
