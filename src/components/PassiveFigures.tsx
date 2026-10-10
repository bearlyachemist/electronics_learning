// Static figures for the passive-component chapters (05–11). Rendered at build time.
import Plot from './Plot';
import {Schematic,Figure,Wire,Res,Cap,Ind,Diode,Source,CurrentSource,Switch,OpAmp,opAmpPins,Ground,Rail,Dot,Terminal,Text,CurrentArrow,green,orange,gray,ink,type Pt} from './Schematic';
import {logspace} from './Parts';

const pairs=(xs:number[],f:(x:number)=>number)=>xs.map(x=>[x,f(x)] as [number,number]);
const span=(a:number,b:number,n=300)=>Array.from({length:n+1},(_,k)=>a+(b-a)*k/n);

/* ---------- Chapter 05: capacitors ---------- */
// A physical picture, not a schematic: plates, separated charge, and the field between them.
export function ParallelPlateFigure(){
  const xs=[0,1,2,3,4,5,6,7,8].map(k=>190+k*30);
  return <Figure caption="A parallel-plate capacitor in cross-section. The external circuit has moved electrons from the top plate to the bottom plate: the top carries $+Q$, the bottom $-Q$, and the component stays neutral overall. The charge sits on the inner surfaces, and the field lines (green) run straight across the gap, with strength $E \approx V/d$. Pack the plates closer or make them larger and the same voltage holds more charge: $C = \varepsilon A/d$.">
    <svg viewBox="0 0 640 230" role="img" aria-label="Two horizontal plates separated by a gap d. Plus signs line the inner surface of the top plate and minus signs the bottom plate; vertical field arrows point from top to bottom. Wires lead to a battery on the left.">
      <rect x="170" y="50" width="280" height="14" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><rect x="170" y="166" width="280" height="14" fill="var(--white)" stroke={ink} strokeWidth="1.8"/>
      <rect x="170" y="64" width="280" height="102" fill="var(--mint)" opacity=".7"/>
      {xs.map(x=><g key={x}><text x={x} y={80} textAnchor="middle" className="output-label">+</text><text x={x} y={160} textAnchor="middle" className="symbol-label" style={{fill:'var(--orange)'}}>−</text>
        <path d={`M${x} 88 V140`} stroke={green} strokeWidth="1.4"/><path d={`M${x-4} 134 l4 7 l4 -7`} fill="none" stroke={green} strokeWidth="1.4"/></g>)}
      <path d="M170 57 H80 V100 M170 173 H80 V108 M60 100 H100" stroke={ink} strokeWidth="1.8" fill="none"/><path d="M70 108 H90" stroke={ink} strokeWidth="3.2"/>
      <text x="56" y="96" textAnchor="end" className="symbol-value">+</text><text x="56" y="122" textAnchor="end" className="symbol-label">V</text>
      <path d="M480 64 V166 M474 64 H486 M474 166 H486" stroke={gray} strokeWidth="1.4"/><text x="494" y="120" className="symbol-label">d</text>
      <text x="310" y="40" textAnchor="middle" className="symbol-value">area A, charge +Q</text><text x="310" y="204" textAnchor="middle" className="symbol-value">charge −Q</text>
      <text x="560" y="118" textAnchor="middle" className="output-label">E ≈ V/d</text>
    </svg></Figure>;
}

// Current into a capacitor, and the voltage it produces: voltage is the running integral of current.
export function CurrentPulseFigure(){
  const t=span(0,20,400),i=(x:number)=>x<5?2:x<10?0:x<15?-2:0,v=(x:number)=>x<5?2+x/5:x<10?3:x<15?3-(x-10)/5:2;
  return <Figure plot caption="The worked example as waveforms. Top: current into a 10 µF capacitor. Bottom: its voltage. Each segment of constant current produces a straight voltage ramp with slope $I/C$ = 200 V/s, and zero current holds the voltage still. The voltage at any moment is set by the accumulated area under the current curve, not by the present current: at 7 ms the current is zero but the capacitor remembers the 10 µC it received.">
    <div className="split-plots">
      <div><h4>Current into the capacitor</h4><Plot curves={[{name:'i(t)',color:orange,points:t.map(x=>[x,i(x)] as [number,number])}]} xRange={[0,20]} yRange={[-3,3]} xLabel="TIME / ms" yLabel="CURRENT / mA" description="Current is plus 2 milliamps from 0 to 5 milliseconds, zero to 10, minus 2 milliamps to 15, then zero."/></div>
      <div><h4>Capacitor voltage</h4><Plot curves={[{name:'v(t)',color:green,points:t.map(x=>[x,v(x)] as [number,number])}]} xRange={[0,20]} yRange={[1.5,3.5]} xLabel="TIME / ms" yLabel="VOLTAGE / V" description="Voltage ramps from 2 to 3 volts over the first 5 milliseconds, holds at 3 volts, ramps back to 2 volts between 10 and 15 milliseconds, then holds."/></div>
    </div></Figure>;
}

// Energy bookkeeping while a capacitor charges from a fixed source through a resistor.
export function ChargingEnergyFigure(){
  const t=span(0,5,300),Vs=5,C=100e-6,ws=(x:number)=>C*Vs*Vs*(1-Math.exp(-x))*1e3,wc=(x:number)=>.5*C*(Vs*(1-Math.exp(-x)))**2*1e3;
  return <Figure plot caption="Energy while 100 µF charges to 5 V through a resistor, against time in time constants. The source (gray) delivers $CV_s^2$ = 2.5 mJ in total; the capacitor (green) ends with half, 1.25 mJ; the resistor (orange) burns the other half. The resistance changes only the time scale: a smaller resistor charges faster and dissipates the same energy at a higher peak power.">
    <Plot curves={[{name:'Delivered by source',color:gray,dashed:true,points:t.map(x=>[x,ws(x)] as [number,number])},{name:'Stored in capacitor',color:green,points:t.map(x=>[x,wc(x)] as [number,number])},{name:'Dissipated in resistor',color:orange,points:t.map(x=>[x,ws(x)-wc(x)] as [number,number])}]}
      xRange={[0,5]} yRange={[0,2.8]} xLabel="TIME / TIME CONSTANTS" yLabel="ENERGY / mJ" description="Source energy rises to 2.5 millijoules; capacitor energy and resistor energy each rise to 1.25 millijoules, the resistor's share growing faster at first."/>
  </Figure>;
}

export function SeriesParallelCapFigure(){
  const m:Pt=[530,130];
  return <Figure caption="Left: in parallel, both capacitors see the same 12 V and their charges add, so $C$ = 32 µF. Right: in series, the isolated middle node forces equal charge on both (82.5 µC), so the smaller capacitor takes the larger voltage. Series capacitance is always less than the smallest member.">
    <Schematic width={680} height={250} description="Left: a 12 volt source across 10 microfarads and 22 microfarads in parallel. Right: a 12 volt source across 10 microfarads in series with 22 microfarads; the 10 microfarad capacitor has 8.25 volts and the 22 microfarad capacitor 3.75 volts.">
      <Source a={[60,200]} b={[60,80]} label="12 V"/><Wire pts={[[60,80],[60,40],[290,40]]}/><Wire pts={[[60,200],[60,220],[290,220]]}/>
      <Cap a={[160,40]} b={[160,220]} label="10 µF" value="120 µC"/><Cap a={[290,40]} b={[290,220]} label="22 µF" value="264 µC"/><Dot at={[160,40]}/><Dot at={[160,220]}/>
      <Text x={175} y={246} anchor="middle" kind="output">parallel: 32 µF</Text>
      <Source a={[430,200]} b={[430,80]} label="12 V"/><Wire pts={[[430,80],[430,40],[530,40]]}/><Wire pts={[[430,200],[430,220],[530,220]]}/>
      <Cap a={[530,40]} b={m} label="10 µF" value="8.25 V"/><Cap a={m} b={[530,220]} label="22 µF" value="3.75 V"/>
      <Text x={500} y={246} anchor="middle" kind="output">series: 6.875 µF</Text>
    </Schematic></Figure>;
}

export function ChargeSharingFigure(){
  return <Figure caption="Charge sharing. Before the switch closes, the left capacitor holds 500 µC at 5 V (1.25 mJ) and the right one is empty. Afterward charge is conserved, so both settle at 2.5 V, but only 0.625 mJ remains. Half the energy is lost in the switch and wiring however small their resistance: a smaller resistance just makes a shorter, larger current spike.">
    <Schematic width={560} height={210} description="A 100 microfarad capacitor charged to 5 volts connects through a switch to an uncharged 100 microfarad capacitor.">
      <Cap a={[120,60]} b={[120,170]} label="100 µF" value="5 V → 2.5 V" flipLabel/><Wire pts={[[120,60],[220,60]]}/><Switch a={[220,60]} b={[320,60]} label="switch"/><Wire pts={[[320,60],[420,60]]}/>
      <Cap a={[420,60]} b={[420,170]} label="100 µF" value="0 V → 2.5 V"/><Wire pts={[[420,170],[120,170]]}/><Ground at={[270,170]}/>
    </Schematic></Figure>;
}

export function HoldUpFigure(){
  const n:Pt=[330,70];
  return <Figure caption="A local reservoir capacitor. The wiring back to the supply has resistance and inductance, so it cannot deliver a sudden current step instantly. For a short burst the load draws its charge from the nearby capacitor, whose voltage droops by $\Delta V = I\,\Delta t/C$ until the supply catches up.">
    <Schematic width={650} height={230} description="A supply connects through wiring resistance and inductance to a node; a capacitor from the node to ground; a pulsed load from the node to ground.">
      <Source a={[60,190]} b={[60,110]} label="supply"/><Wire pts={[[60,110],[60,70],[100,70]]}/><Res a={[100,70]} b={[180,70]} label="wiring R"/><Ind a={[180,70]} b={[270,70]} label="wiring L"/><Wire pts={[[270,70],n]}/>
      <Cap a={n} b={[330,190]} label="C" value="10 µF"/><Wire pts={[n,[460,70]]}/><CurrentSource a={[460,70]} b={[460,190]} label="load" value="+20 mA for 50 µs"/>
      <Wire pts={[[460,190],[60,190]]}/><Ground at={[200,190]}/><Dot at={n} color={green}/><Dot at={[330,190]}/>
    </Schematic></Figure>;
}

export function SupercapFigure(){
  const t=span(0,450,300);
  return <Figure plot caption="A 1 F supercapacitor charged to 5 V supplying a constant 5 mA. The voltage falls linearly at $I/C$ = 5 mV/s and reaches the circuit's 3 V minimum after 400 s. A resistive load would instead produce an exponential decay, slowing as the voltage falls.">
    <Plot curves={[{name:'Capacitor voltage, 5 mA load',color:green,points:t.map(x=>[x,Math.max(0,5-.005*x)] as [number,number])},{name:'3 V minimum operating voltage',color:orange,dashed:true,points:[[0,3],[450,3]]}]} xRange={[0,450]} yRange={[0,5.5]} xLabel="TIME / s" yLabel="VOLTAGE / V" point={[400,3]} pointLabel="400 s of backup"
      description="A straight line falling from 5 volts at zero seconds to 2.75 volts at 450 seconds, crossing the 3 volt line at 400 seconds."/>
  </Figure>;
}

/* ---------- Chapter 06: RC circuits ---------- */
export function RCSwitchFigure(){
  const n:Pt=[400,60];
  return <Figure caption="The circuit of this chapter. When the switch closes at $t = 0$, the source drives current through $R$ into $C$. The capacitor voltage $v$ cannot jump, so all of $V_s - V_0$ initially appears across the resistor, and the current starts at its maximum, $(V_s - V_0)/R$.">
    <Schematic width={560} height={230} description="A voltage source, a switch, a series resistor and a capacitor to ground. The capacitor voltage is labelled v.">
      <Source a={[70,190]} b={[70,110]} label="V_s"/><Wire pts={[[70,110],[70,60],[120,60]]}/><Switch a={[120,60]} b={[200,60]} label="t = 0" closed/><Wire pts={[[200,60],[240,60]]}/>
      <Res a={[240,60]} b={[340,60]} label="R"/><Wire pts={[[340,60],n]}/><Cap a={n} b={[400,190]} label="C" value="v(0) = V_0"/><Wire pts={[[400,190],[70,190]]}/><Ground at={[230,190]}/>
      <Dot at={n} color={green}/><Text x={415} y={48} kind="output">v(t)</Text><CurrentArrow at={[222,60]} dir="right" label="i(t)"/>
    </Schematic></Figure>;
}

export function UniversalExponentialFigure(){
  const t=span(0,5,300);
  return <Figure plot caption="Every first-order step response is this one curve: the fraction of the initial error that remains, $e^{-t/\tau}$. The dashed tangent shows the starting slope. If the capacitor kept charging at its initial rate it would finish in exactly one time constant; because the current falls as the gap closes, it covers only 63% in that time, 95% in three and 99.3% in five.">
    <Plot curves={[{name:'Remaining error, $e^{-t/\\tau}$',color:green,points:t.map(x=>[x,Math.exp(-x)*100] as [number,number])},{name:'Initial slope',color:orange,dashed:true,points:[[0,100],[1,0]]},{name:'Progress, $1 - e^{-t/\\tau}$',color:gray,dashed:true,points:t.map(x=>[x,(1-Math.exp(-x))*100] as [number,number])}]}
      xRange={[0,5]} yRange={[0,100]} xLabel="TIME / τ" yLabel="PERCENT OF INITIAL ERROR" point={[1,36.79]} pointLabel="t = τ: 36.8% remains"
      description="A decaying exponential from 100 percent to 0.7 percent over five time constants, its mirror image rising to 99.3 percent, and a straight tangent from 100 percent at zero reaching zero at one time constant."/>
  </Figure>;
}

export function SquareResponseFigure(){
  // Steady-state RC response to a 0/1 V square wave with half-period h (in units of tau).
  const wave=(h:number)=>{const a=Math.exp(-h),low=a/(1+a)*1,high=1-low;const pts:[number,number][]=[];const T=2*h;
    for(let k=0;k<=400;k++){const t=k/400*2*T,ph=t%T;pts.push([t/T,ph<h?1-(1-low)*Math.exp(-ph):high*Math.exp(-(ph-h))]);}return pts;};
  const sq:[number,number][]=[[0,1],[.5,1],[.5,0],[1,0],[1,1],[1.5,1],[1.5,0],[2,0]];
  return <Figure plot caption="The same RC low-pass driven by a 0–1 V square wave of three different periods, shown over two cycles. Half-period 5τ (green): the capacitor nearly finishes each transition, and the output is a square wave with rounded edges. Half-period τ (dark): it never finishes. Half-period 0.2τ (orange): the output barely moves from the average, 0.5 V, as a small triangle. Slowness relative to the signal is what makes RC circuits smooth, average and filter.">
    <Plot curves={[{name:'Input',color:gray,dashed:true,points:sq},{name:'Half-period = 5τ',color:green,points:wave(5)},{name:'Half-period = τ',color:ink,points:wave(1)},{name:'Half-period = 0.2τ',color:orange,points:wave(.2)}]}
      xRange={[0,2]} yRange={[-.05,1.1]} xLabel="TIME / INPUT PERIODS" yLabel="VOLTAGE / V" description="A square wave and three responses: nearly square with rounded corners, a sawtooth-like curve between 0.27 and 0.73 volts, and a small triangle between 0.45 and 0.55 volts."/>
  </Figure>;
}

export function RCFrequencyFigure(){
  const xs=logspace(-2,2,240);
  return <Figure plot caption="The RC low-pass in frequency, against $f/f_c$ on a logarithmic axis. Gain (green) is flat below cutoff and falls in proportion to $1/f$ above it; at cutoff it is $1/\sqrt2$ = 0.707. The phase lag (orange, right-hand values in degrees ÷ 100) passes −45° at cutoff and approaches −90°. Fast signals get through the resistor but not into the capacitor.">
    <Plot curves={[{name:'Gain |H|',color:green,points:pairs(xs,x=>1/Math.sqrt(1+x*x))},{name:'Phase / (−100°)',color:orange,dashed:true,points:pairs(xs,x=>Math.atan(x)*180/Math.PI/100)}]}
      xRange={[.01,100]} yRange={[0,1.05]} xScale="log" xLabel="FREQUENCY RATIO f / f_c" yLabel="GAIN (V/V)  ·  PHASE LAG / 100°" point={[1,.7071]} pointLabel="Cutoff: 0.707, −45°"
      description="Gain stays near 1 below a tenth of cutoff, passes 0.707 at cutoff, and falls to 0.01 at 100 times cutoff. Phase lag rises from near zero to 45 degrees at cutoff and approaches 90 degrees."/>
  </Figure>;
}

export function LoadedRCFigure(){
  const n:Pt=[300,60];
  return <Figure caption="A load across the capacitor. Remove $C$ and the rest is a divider: $V_{\mathrm{th}}$ = 2.5 V, $R_{\mathrm{th}} = 10\text{ k}\Omega \parallel 10\text{ k}\Omega$ = 5 kΩ. The capacitor then charges toward 2.5 V with $\tau = R_{\mathrm{th}}C$ = 50 ms. Any linear network around a single capacitor reduces this way.">
    <Schematic width={560} height={230} description="A 5 volt source through 10 kilohms to a node; a 10 microfarad capacitor and a 10 kilohm load from the node to ground.">
      <Source a={[70,190]} b={[70,110]} label="5 V"/><Wire pts={[[70,110],[70,60],[150,60]]}/><Res a={[150,60]} b={[250,60]} label="R" value="10 kΩ"/><Wire pts={[[250,60],n]}/>
      <Cap a={n} b={[300,190]} label="C" value="10 µF"/><Wire pts={[n,[420,60]]}/><Res a={[420,60]} b={[420,190]} label="load" value="10 kΩ" color={orange}/><Wire pts={[[420,190],[70,190]]}/>
      <Ground at={[180,190]}/><Dot at={n} color={green}/><Dot at={[300,190]}/>
    </Schematic></Figure>;
}

export function DebounceFigure(){
  const n:Pt=[300,120];
  return <Figure caption="Debouncing a pushbutton. Pressing the switch discharges $C$ almost instantly. When it is released the contacts bounce for a few milliseconds, but the node can only climb slowly through $R$, with $\tau$ = 10 ms. A Schmitt-trigger input (thresholds about 2 V falling and 3 V rising) sees one clean transition.">
    <Schematic width={600} height={250} description="A 5 volt rail through 10 kilohms to a node; a 1 microfarad capacitor from the node to ground; a pushbutton from the node to ground; the node feeds a Schmitt-trigger logic input.">
      <Rail at={[300,25]} label="+5 V"/><Res a={[300,25]} b={n} label="R" value="10 kΩ"/><Cap a={n} b={[300,220]} label="C" value="1 µF"/>
      <Wire pts={[n,[180,120]]}/><Switch a={[180,120]} b={[180,220]} label="button" flipLabel/><Wire pts={[[180,220],[300,220]]}/><Ground at={[240,220]}/>
      <Wire pts={[n,[460,120]]} color={green}/><Terminal at={[460,120]} label="Schmitt input" side="right"/><Dot at={n} color={green}/>
    </Schematic></Figure>;
}

/* ---------- Chapter 07: differentiators ---------- */
// Steady-state CR high-pass response to a periodic piecewise-linear input, computed by direct time stepping.
function highpass(input:(t:number)=>number,tau:number,period:number,cycles=2,n=1200){
  const dt=period*(cycles+3)/n;let vc=0;const out:[number,number][]=[];
  // Run three periods first so the plotted cycles are in steady state. vc is the capacitor voltage; the resistor carries vin − vc.
  for(let k=0;k<=n;k++){const t=k*dt,vout=input(t)-vc;vc+=dt*vout/tau;if(t>=3*period)out.push([(t-3*period)/period,vout]);}
  return out;
}
export function TriangleToSquareFigure(){
  const T=1,tau=.02,tri=(t:number)=>{const p=((t%T)+T)%T;return p<T/2?-1+4*p/T:3-4*p/T;};
  const ts=span(0,2,400);
  return <Figure plot caption="A 1 V peak triangle wave (gray) through a CR high-pass with $\tau$ = T/50. Its slope is ±4 V per period, so the output (green) is a square wave of height $\pm s\tau$ = ±0.08 V, scaled up ×10 here to be visible. Each corner of the triangle, where the slope suddenly reverses, produces an exponential transition lasting a few $\tau$: the circuit approximates the derivative everywhere except right after an abrupt change.">
    <Plot curves={[{name:'Input triangle',color:gray,dashed:true,points:ts.map(t=>[t,tri(t)] as [number,number])},{name:'Output × 10',color:green,points:highpass(tri,tau,T).map(([t,v])=>[t,v*10] as [number,number])}]}
      xRange={[0,2]} yRange={[-1.2,1.2]} xLabel="TIME / PERIODS" yLabel="VOLTAGE / V" description="A triangle wave between plus and minus 1 volt, and a nearly square output wave of plus and minus 0.8 volts after a tenfold scale-up, switching at each triangle peak."/>
  </Figure>;
}

export function EdgePulseFigure(){
  const T=1,sq=(t:number)=>((t%T)+T)%T<T/2?1:0,ts=span(0,2,400);
  return <Figure plot caption="A 0–1 V square wave through two CR high-pass networks. With $\tau$ = T/20 (green) each edge becomes a sharp spike that dies away well before the next edge: an edge detector. With $\tau$ = T (orange) the output only sags between edges; this is how a coupling capacitor distorts a slow square wave (tilt). Either way the output averages to zero, and it swings negative although the input never does.">
    <Plot curves={[{name:'Input',color:gray,dashed:true,points:ts.map(t=>[t,sq(t)] as [number,number])},{name:'τ = T/20',color:green,points:highpass(sq,T/20,T)},{name:'τ = T',color:orange,points:highpass(sq,T,T)}]}
      xRange={[0,2]} yRange={[-1.1,1.1]} xLabel="TIME / PERIODS" yLabel="VOLTAGE / V" description="Square wave between 0 and 1 volt. The short time-constant output shows positive spikes at rising edges and negative spikes at falling edges, decaying quickly to zero. The long time-constant output is a tilted square wave between about plus and minus 0.62 volts."/>
  </Figure>;
}

export function DifferentiatorBandFigure(){
  const xs=logspace(-2,4,300),k=100; // frequency normalized to the ideal unity-gain point; active poles both at k
  return <Figure plot caption="Gain against frequency for three differentiators on log–log axes, normalized to the frequency where the ideal reaches unity gain. Ideal (dashed): rises ×10 per decade forever. Passive CR (green): follows the ideal at low frequency, then levels off at 1 V/V. Practical active circuit (orange) with $R_f/R_i$ = 100: follows the ideal up to a gain of about 100, then rolls off, so high-frequency noise is not amplified without limit.">
    <Plot curves={[{name:'Ideal derivative',color:gray,dashed:true,points:pairs(xs,x=>x)},{name:'Passive CR, f_c = 1',color:green,points:pairs(xs,x=>x/Math.sqrt(1+x*x))},{name:'Practical active, R_f/R_i = 100',color:orange,points:pairs(xs,x=>x/(1+(x/k)**2))}]}
      xRange={[.01,1e4]} yRange={[.01,1e3]} xScale="log" yScale="log" xLabel="NORMALIZED FREQUENCY" yLabel="GAIN / (V/V)" description="Three log-log curves: a straight line of slope one; a curve that follows it and flattens at gain 1 above frequency 1; and a curve that follows the line to about gain 50 near frequency 100, then falls."/>
  </Figure>;
}

export function ActiveDifferentiatorFigure(){
  const P=opAmpPins({at:[330,140]}),n:Pt=[P.minus[0]-28,P.minus[1]],fb=P.out[0]+18;
  return <Figure caption="A practical inverting differentiator. Feedback holds the inverting input near 0 V, so the input current is $C\,dv_{\mathrm{in}}/dt$ and it develops $-R_fC\,dv_{\mathrm{in}}/dt$ across $R_f$. The small series resistor $R_i$ and the feedback capacitor $C_f$ cap the gain at high frequency, which keeps noise in check and helps stability.">
    <Schematic width={600} height={250} description="Input through a series resistor Ri and capacitor C to the inverting input of an op-amp; feedback resistor Rf in parallel with capacitor Cf from output to inverting input; non-inverting input grounded.">
      <Terminal at={[60,125]} label="v_in" side="above"/><Wire pts={[[60,125],[90,125]]}/><Res a={[90,125]} b={[170,125]} label="R_i"/><Cap a={[170,125]} b={[240,125]} label="C"/>
      <Wire pts={[[240,125],n,P.minus]}/><OpAmp at={[330,140]}/><Wire pts={[P.plus,[300,155],[300,200]]}/><Ground at={[300,200]}/>
      <Wire pts={[n,[n[0],70],[320,70]]}/><Res a={[320,70]} b={[400,70]} label="R_f"/><Wire pts={[[400,70],[fb,70],[fb,P.out[1]]]}/>
      <Wire pts={[[n[0],70],[n[0],30],[330,30]]}/><Cap a={[330,30]} b={[390,30]} label="C_f"/><Wire pts={[[390,30],[fb,30],[fb,70]]}/>
      <Wire pts={[P.out,[P.out[0]+70,P.out[1]]]} color={green}/><Terminal at={[P.out[0]+70,P.out[1]]} label="v_out" side="right"/>
      <Dot at={n}/><Dot at={[n[0],70]}/><Dot at={[fb,70]}/><Dot at={[fb,P.out[1]]}/>
    </Schematic></Figure>;
}

export function EdgeDetectorFigure(){
  const n:Pt=[300,90];
  return <Figure caption="An edge detector feeding a logic input. Each rising edge of the 5 V input produces a decaying pulse; the logic input sees it as high for about $\tau\ln 2$ = 6.9 µs. The diode stops the negative spike from each falling edge from driving the input below ground.">
    <Schematic width={600} height={240} description="A 5 volt logic square wave through a 1 nanofarad capacitor to a node; a 10 kilohm resistor from node to ground; a diode from ground up to the node; node to a logic input.">
      <Terminal at={[60,90]} label="0/5 V edges" side="above"/><Wire pts={[[60,90],[130,90]]}/><Cap a={[130,90]} b={[220,90]} label="C" value="1 nF"/><Wire pts={[[220,90],n]}/>
      <Res a={n} b={[300,210]} label="R" value="10 kΩ"/><Wire pts={[n,[400,90]]}/><Diode a={[400,210]} b={[400,90]} label="clamp" value="anode to ground"/>
      <Wire pts={[[400,210],[300,210]]}/><Ground at={[350,210]}/><Wire pts={[[400,90],[500,90]]} color={green}/><Terminal at={[500,90]} label="logic in" side="right"/>
      <Dot at={n}/><Dot at={[400,90]}/><Dot at={[300,210]}/>
    </Schematic></Figure>;
}

/* ---------- Chapter 08: integrators ---------- */
// Steady-state RC low-pass response to a periodic input (time stepping, three settling periods discarded).
function lowpass(input:(t:number)=>number,tau:number,period:number,cycles=2,n=1600){
  const dt=period*(cycles+3)/n;let v=0;const out:[number,number][]=[];
  for(let k=0;k<=n;k++){const t=k*dt;if(t>=3*period)out.push([(t-3*period)/period,v]);v+=dt*(input(t)-v)/tau;}
  return out;
}
export function SquareToTriangleFigure(){
  const T=1,sq=(t:number)=>((t%T)+T)%T<T/2?1:-1,ts=span(0,2,400);
  return <Figure plot caption="A ±1 V square wave (gray) through an RC low-pass with $RC$ = 10T. While the input is +1 V the capacitor charges at nearly constant current, and while it is −1 V it discharges, so the output (green, scaled ×10) is a triangle of ±25 mV: the running integral of the square wave. Each slope is $\pm A/RC$; the output stays small enough that the resistor current hardly depends on it.">
    <Plot curves={[{name:'Input square wave',color:gray,dashed:true,points:ts.map(t=>[t,sq(t)] as [number,number])},{name:'Output × 10',color:green,points:lowpass(sq,10*T,T).map(([t,v])=>[t,v*10] as [number,number])}]}
      xRange={[0,2]} yRange={[-1.2,1.2]} xLabel="TIME / PERIODS" yLabel="VOLTAGE / V" description="A square wave between plus and minus 1 volt, and a triangle output reaching plus and minus 0.25 volts after a tenfold scale-up, peaking at each input edge."/>
  </Figure>;
}

export function IntegratorBandFigure(){
  const xs=logspace(-3,3,300),k=.01;
  return <Figure plot caption="Gain against frequency, normalized to where the ideal integrator has unity gain. Ideal (dashed): rises without limit as frequency falls, infinite at DC. Passive RC (green): follows the ideal only above its cutoff, and flattens at 1 below it. Leaky active integrator with $R_f/R$ = 100 (orange): follows the ideal down to a gain of 100, then levels off, so a DC offset produces a bounded output instead of a ramp.">
    <Plot curves={[{name:'Ideal integrator',color:gray,dashed:true,points:pairs(xs,x=>1/x)},{name:'Passive RC, f_c = 1',color:green,points:pairs(xs,x=>1/Math.sqrt(1+x*x))},{name:'Leaky active, R_f/R = 100',color:orange,points:pairs(xs,x=>100/Math.sqrt(1+(x/k)**2))}]}
      xRange={[.001,1000]} yRange={[.001,1000]} xScale="log" yScale="log" xLabel="NORMALIZED FREQUENCY" yLabel="GAIN / (V/V)" description="On log-log axes: a falling straight line of slope minus one; a curve flat at 1 below frequency 1 that then follows the line; and a curve flat at 100 below frequency 0.01 that then follows the line."/>
  </Figure>;
}

export function ActiveIntegratorFigure(){
  const P=opAmpPins({at:[330,200]}),n:Pt=[P.minus[0]-28,P.minus[1]],fb=P.out[0]+18;
  return <Figure caption="A practical inverting integrator. The input current $v_{\mathrm{in}}/R$ flows onto $C$ because the op-amp holds the inverting input at 0 V, so the output ramps at $-v_{\mathrm{in}}/RC$. The reset switch sets the initial condition by discharging $C$; the large resistor $R_f$ gives DC a path so offsets cannot ramp the output into saturation.">
    <Schematic width={600} height={300} description="Input through resistor R to the inverting input of an op-amp; capacitor C from output to inverting input, with a reset switch and a large resistor Rf in parallel with it; non-inverting input grounded.">
      <Terminal at={[60,185]} label="v_in" side="above"/><Wire pts={[[60,185],[120,185]]}/><Res a={[120,185]} b={[220,185]} label="R"/><Wire pts={[[220,185],n,P.minus]}/>
      <OpAmp at={[330,200]}/><Wire pts={[P.plus,[300,215],[300,262]]}/><Ground at={[300,262]}/>
      <Wire pts={[n,[n[0],140],[320,140]]}/><Cap a={[320,140]} b={[400,140]} label="C"/><Wire pts={[[400,140],[fb,140],[fb,P.out[1]]]}/>
      <Wire pts={[[n[0],140],[n[0],92],[320,92]]}/><Switch a={[320,92]} b={[400,92]} label="reset"/><Wire pts={[[400,92],[fb,92],[fb,140]]}/>
      <Wire pts={[[n[0],92],[n[0],44],[320,44]]}/><Res a={[320,44]} b={[400,44]} label="R_f (large)"/><Wire pts={[[400,44],[fb,44],[fb,92]]}/>
      <Wire pts={[P.out,[P.out[0]+70,P.out[1]]]} color={green}/><Terminal at={[P.out[0]+70,P.out[1]]} label="v_out" side="right"/>
      <Dot at={n}/><Dot at={[n[0],140]}/><Dot at={[n[0],92]}/><Dot at={[fb,140]}/><Dot at={[fb,92]}/><Dot at={[fb,P.out[1]]}/>
    </Schematic></Figure>;
}

export function DriftFigure(){
  const ts=span(0,20,400);
  return <Figure plot caption="The output of an integrator with $RC$ = 1 ms whose input is grounded but whose op-amp has a 1 mV input offset. An ideal capacitor-only integrator (green) treats the offset as a signal and ramps at 1 V/s until it saturates at −10 V after 10 s. With $R_f$ = 100 kΩ across $C$ (orange) the DC gain is only $R_f/R$ = 10, so the output settles at −10 mV.">
    <Plot curves={[{name:'Ideal integrator',color:green,points:ts.map(t=>[t,Math.max(-10,-t)] as [number,number])},{name:'Leaky, R_f/R = 10 (×100 to show)',color:orange,points:ts.map(t=>[t,-1*(1-Math.exp(-t*10))] as [number,number])}]}
      xRange={[0,20]} yRange={[-11,1]} xLabel="TIME / s" yLabel="OUTPUT / V" description="A ramp from zero down to minus 10 volts over 10 seconds, then flat; and a curve that settles almost immediately near minus 1 volt on this hundredfold scale, meaning minus 10 millivolts."/>
  </Figure>;
}

export function DualSlopeFigure(){
  const T1=100,vref=1,ramp=(vin:number)=>{const t2=T1*vin/vref;return [[0,0],[T1,vin*T1/100],[T1+t2,0],[300,0]] as [number,number][];};
  return <Figure plot caption="A dual-slope converter. Phase 1: integrate the unknown input for a fixed 100 ms, so the output climbs to a height proportional to $V_{\mathrm{in}}$. Phase 2: switch to a reference of opposite sign and time how long the output takes to return to zero. That time is $T_1V_{\mathrm{in}}/V_{\mathrm{ref}}$: 50 ms for 0.5 V (green) and 120 ms for 1.2 V (orange) with a 1 V reference. $R$ and $C$ set the slopes but cancel from the result.">
    <Plot curves={[{name:'V_in = 0.5 V',color:green,points:ramp(.5)},{name:'V_in = 1.2 V',color:orange,points:ramp(1.2)},{name:'End of fixed integration',color:gray,dashed:true,points:[[100,0],[100,1.4]]}]}
      xRange={[0,300]} yRange={[0,1.4]} xLabel="TIME / ms" yLabel="INTEGRATOR OUTPUT (magnitude) / V" description="Two triangles that rise for 100 milliseconds to 0.5 and 1.2 volts, then fall at the same slope, reaching zero at 150 and 220 milliseconds."/>
  </Figure>;
}

/* ---------- Chapter 09: real capacitors ---------- */
export function FullCapModelFigure(){
  const A:Pt=[150,70];
  return <Figure caption="A fuller equivalent circuit for a real capacitor. ESR and ESL sit in series with the main capacitance $C$. The leakage resistance carries a small DC current through the dielectric. The extra branch $R_{\mathrm{DA}}C_{\mathrm{DA}}$ models dielectric absorption: charge that soaks slowly into the dielectric and slowly comes back out. Each element matters in a different regime; most designs need only one or two of them.">
    <Schematic width={640} height={260} description="Terminal, ESR, ESL, then a node. From the node to the second terminal: the main capacitance, a leakage resistance in parallel, and a series R-C absorption branch in parallel.">
      <Terminal at={[40,70]}/><Res a={[40,70]} b={[110,70]} label="ESR"/><Ind a={[110,70]} b={A} label="ESL"/><Wire pts={[A,[420,70]]}/>
      <Cap a={[200,70]} b={[200,220]} label="C" value="main"/><Res a={[300,70]} b={[300,220]} label="R_leak" value="GΩ range"/>
      <Res a={[420,70]} b={[420,145]} label="R_DA"/><Cap a={[420,145]} b={[420,220]} label="C_DA"/>
      <Wire pts={[[200,220],[520,220]]}/><Terminal at={[520,220]}/>
      <Dot at={[200,70]}/><Dot at={[300,70]}/><Dot at={[300,220]}/><Dot at={[420,220]}/>
    </Schematic></Figure>;
}

// |Z| of two real capacitors in parallel, each a series R-L-C.
export function AntiresonanceFigure(){
  const fs=logspace(4,9,400),z=(f:number,c:number,l:number,r:number)=>{const w=2*Math.PI*f;return {re:r,im:w*l-1/(w*c)};};
  const par=(f:number)=>{const a=z(f,10e-6,2e-9,.01),b=z(f,100e-9,.8e-9,.03);const nr=a.re*b.re-a.im*b.im,ni=a.re*b.im+a.im*b.re,dr=a.re+b.re,di=a.im+b.im;const d=dr*dr+di*di;return Math.hypot((nr*dr+ni*di)/d,(ni*dr-nr*di)/d);};
  const mag=(f:number,c:number,l:number,r:number)=>{const q=z(f,c,l,r);return Math.hypot(q.re,q.im);};
  return <Figure plot caption="Impedance of a 10 µF capacitor (ESL 2 nH), a 100 nF capacitor (ESL 0.8 nH), and the two in parallel. Each alone dips to its ESR at its own series resonance. In parallel a new peak appears between the dips: an antiresonance of 0.36 Ω near 9.5 MHz, three times worse than the 10 µF part alone at that frequency. There the large capacitor is already inductive and the small one still capacitive, so together they form a parallel LC tank. Adding a small capacitor beside a big one helps above the peak and can hurt at it.">
    <Plot curves={[{name:'10 µF alone',color:gray,dashed:true,points:fs.map(f=>[f,mag(f,10e-6,2e-9,.01)] as [number,number])},{name:'100 nF alone',color:ink,dashed:true,points:fs.map(f=>[f,mag(f,100e-9,.8e-9,.03)] as [number,number])},{name:'Both in parallel',color:orange,points:fs.map(f=>[f,par(f)] as [number,number])}]}
      xRange={[1e4,1e9]} yRange={[.001,100]} xScale="log" yScale="log" xLabel="FREQUENCY / Hz" yLabel="|Z| / Ω" description="Two V-shaped impedance curves with minima near 1.1 megahertz and 18 megahertz, and the parallel combination, which follows the lower of the two except for a peak of about 0.36 ohms near 9.5 megahertz."/>
  </Figure>;
}

export function BiasDeratingFigure(){
  const v=span(0,16,160);
  return <Figure plot caption="An illustrative shape for the capacitance of two 10 µF, 16 V ceramic capacitors against DC bias: a high-permittivity class-II type (orange) and a class-I C0G type (green). The class-II curve is representative of the trend, not a specific part, which is why the text insists on the manufacturer's curve for the actual part, case size and voltage. Small case sizes typically lose even more.">
    <Plot curves={[{name:'Class II (X5R/X7R-type), illustrative',color:orange,points:v.map(x=>[x,100/(1+(x/6.5)**1.6)] as [number,number])},{name:'Class I (C0G), illustrative',color:green,points:v.map(x=>[x,100-.05*x] as [number,number])}]}
      xRange={[0,16]} yRange={[0,110]} xLabel="DC BIAS / V" yLabel="CAPACITANCE / % OF NOMINAL" description="The class II curve falls from 100 percent at zero bias to about 50 percent near 6.5 volts and about 20 percent at 16 volts; the class I curve stays essentially flat at 100 percent."/>
  </Figure>;
}

export function LoadStepFigure(){
  const C=10e-6,R=.2,L=10e-9,rise=50e-9,ts=span(0,10e-6,600);
  const i=(t:number)=>t<rise?.1*t/rise:.1,q=(t:number)=>t<rise?.1*t*t/(2*rise):.1*rise/2+.1*(t-rise);
  const v=(t:number)=>-(R*i(t)+(t<rise?L*.1/rise:0)+q(t)/C)*1e3;
  return <Figure plot caption="A 100 mA load step on a 10 µF capacitor with 0.2 Ω ESR and 10 nH ESL, if nothing upstream helps. The voltage drops immediately by $I \times \text{ESR}$ = 20 mV (a resistive step), then falls linearly at $I/C$ = 10 mV/µs as charge leaves. The inductive kick ($L\,di/dt$ = 20 mV) lasts only the 50 ns of the current edge, too brief to see at this scale. Three element values, three timescales, three separate fixes.">
    <Plot curves={[{name:'Change in capacitor terminal voltage',color:orange,points:ts.map(t=>[t*1e6,v(t)] as [number,number])}]} xRange={[0,10]} yRange={[-130,10]} xLabel="TIME / µs" yLabel="VOLTAGE CHANGE / mV" description="The voltage drops almost instantly to minus 20 millivolts, then falls in a straight line to minus 120 millivolts at 10 microseconds."/>
  </Figure>;
}

export function AbsorptionFigure(){
  // Main C = 1 µF, absorption branch 1 MΩ + 50 nF. Charged to 10 V for a long time, shorted for 2 ms, then left open.
  const C=1e-6,Ra=1e6,Ca=50e-9,dt=1e-4,pts:[number,number][]=[];let v=10,va=10;
  for(let k=0;k<=12000;k++){const t=k*dt;const short=t>=.1&&t<.102;
    const ia=(va-v)/Ra;va-=ia*dt/Ca;if(short)v=0;else v+=ia*dt/C;if(k%20===0)pts.push([t,v]);}
  return <Figure plot caption="Dielectric absorption in a two-branch model: a 1 µF main capacitance plus a slow 1 MΩ / 50 nF branch. The capacitor sits at 10 V, is shorted for 2 ms at $t$ = 0.1 s, then left open. The terminal voltage creeps back up to about 0.46 V as charge soaked into the slow branch drains back into the main one. Real dielectrics have many such branches; polypropylene and C0G show very little, some electrolytics several percent.">
    <Plot curves={[{name:'Terminal voltage after a brief short',color:orange,points:pts.filter(([t])=>t>=.1)}]} xRange={[.1,1.2]} yRange={[0,.6]} xLabel="TIME / s" yLabel="VOLTAGE / V" description="After the short the voltage starts at zero and rises along an exponential to about 0.46 volts over roughly a quarter of a second, then stays there."/>
  </Figure>;
}

/* ---------- Chapter 10: inductors ---------- */
// A physical sketch: a winding on a closed core, with the flux loop it creates.
export function CoreFluxFigure(){
  const turns=[0,1,2,3,4,5].map(k=>150+k*18);
  return <Figure caption="A winding of $N$ turns on a closed magnetic core. Current $i$ in the winding drives flux $\Phi$ around the core (green), and every turn links that flux, so the flux linkage is $\lambda = N\Phi = Li$. Change the current and the flux changes, inducing a voltage $v = L\,di/dt$ in the same winding that opposes the change. Inductance grows as $N^2$: doubling the turns doubles both the flux per ampere and the number of turns it links.">
    <svg viewBox="0 0 640 250" role="img" aria-label="A rectangular core with a coil wound on its left leg; dashed green arrows show flux circulating around the core.">
      <path d="M120 40 H520 V210 H120 Z M180 90 H460 V160 H180 Z" fill="var(--mint)" fillRule="evenodd" stroke={ink} strokeWidth="1.6"/>
      {turns.map(y=><path key={y} d={`M108 ${y-50} Q150 ${y-58} 192 ${y-50}`} fill="none" stroke={orange} strokeWidth="2.4"/>)}
      <path d="M108 100 H60 M108 190 H60" stroke={orange} strokeWidth="2.4"/><text x="52" y="95" textAnchor="end" className="symbol-label">i</text><text x="52" y="150" textAnchor="end" className="symbol-label">v</text>
      <path d="M150 65 H490 V185 H150 Z" fill="none" stroke={green} strokeWidth="1.6" strokeDasharray="6 5"/>
      <path d="M330 59 l10 6 l-10 6 M330 179 l-10 6 l10 6" fill="none" stroke={green} strokeWidth="1.8"/>
      <text x="330" y="30" textAnchor="middle" className="output-label">flux Φ</text><text x="210" y="232" textAnchor="middle" className="symbol-value">N turns</text><text x="490" y="232" textAnchor="middle" className="symbol-value">core</text>
    </svg></Figure>;
}

export function RLResponseFigure(){
  const t=span(0,5,300);
  return <Figure plot caption="Energizing a series RL circuit, against time in units of $\tau_L = L/R$. The current (green) rises exactly like an RC voltage, reaching 63% of $V_s/R$ in one time constant. The inductor voltage (orange) starts at the full supply, because a current that has not yet started produces no resistor drop, and decays as the current approaches its final value.">
    <Plot curves={[{name:'Current, fraction of V_s/R',color:green,points:t.map(x=>[x,1-Math.exp(-x)] as [number,number])},{name:'Inductor voltage, fraction of V_s',color:orange,points:t.map(x=>[x,Math.exp(-x)] as [number,number])}]}
      xRange={[0,5]} yRange={[0,1.05]} xLabel="TIME / τ_L" yLabel="FRACTION OF FINAL VALUE" description="Current rises from zero toward 1 with an exponential; inductor voltage falls from 1 toward zero with the mirror-image exponential."/>
  </Figure>;
}

export function ClampDecayFigure(){
  const t=span(0,16,400);
  return <Figure plot caption="A 100 mH coil switched off from 100 mA into two clamps. With a 0.7 V diode clamp (green) the current falls at only 7 A/s and takes 14.3 ms to reach zero, so a relay releases sluggishly. With a 20 V clamp (orange) it falls at 200 A/s and is gone in 0.5 ms. Both clamps absorb the same 0.5 mJ; the higher voltage absorbs it faster.">
    <Plot curves={[{name:'0.7 V clamp',color:green,points:t.map(x=>[x,Math.max(0,100-7*x)] as [number,number])},{name:'20 V clamp',color:orange,points:t.map(x=>[x,Math.max(0,100-200*x)] as [number,number])}]}
      xRange={[0,16]} yRange={[0,110]} xLabel="TIME AFTER TURN-OFF / ms" yLabel="COIL CURRENT / mA" description="Two straight lines from 100 milliamps: one reaches zero at 14.3 milliseconds, the other at 0.5 milliseconds."/>
  </Figure>;
}

export function FlybackOptionsFigure(){
  const panel=(x0:number,kind:'none'|'diode'|'zener')=>{const top:Pt=[x0+90,40],sw:Pt=[x0+90,150];return <g key={kind}>
    <Rail at={top} label="+12 V"/><Ind a={top} b={sw} label="coil" flipLabel/><Switch a={sw} b={[x0+90,230]}/><Ground at={[x0+90,230]}/>
    {kind!=='none'&&<><Dot at={[x0+90,55]}/><Dot at={[x0+90,135]}/><Wire pts={[[x0+90,55],[x0+150,55]]}/><Wire pts={[[x0+90,135],[x0+150,135]]}/>
      {kind==='diode'?<Diode a={[x0+150,135]} b={[x0+150,55]}/>:<><Diode a={[x0+150,135]} b={[x0+150,95]}/><Diode kind="zener" a={[x0+150,55]} b={[x0+150,95]}/></>}</>}
    <Text x={x0+90} y={262} anchor="middle" kind="output">{kind==='none'?'no path: kilovolts':kind==='diode'?'diode: 12.7 V, slow release':'diode + zener: fast release'}</Text></g>;};
  return <Figure caption="Three ways to switch off an inductive load. With no path (left) the current has nowhere to go, and the voltage rises until something breaks down, usually the switch. A diode across the coil (center) lets the current circulate at about 0.7 V: safe, but slow to decay. A diode plus a zener (right) clamps at about $V_Z$ + 0.7 V above the supply: the current decays much faster, and the switch must be rated for the higher voltage.">
    <Schematic width={660} height={275} description="Three panels each showing a coil from +12 volts to a switch to ground. The first has nothing across the coil, the second has a diode across it pointing toward the supply, the third has a diode in series with a zener across it.">
      {panel(0,'none')}{panel(220,'diode')}{panel(440,'zener')}
    </Schematic></Figure>;
}

export function SaturationFigure(){
  // Constant voltage across an inductor whose inductance collapses above 1 A (illustrative soft saturation).
  const L=(i:number)=>10e-3/(1+(i/1.2)**6),dt=1e-6,pts:[number,number][]=[],lin:[number,number][]=[];let i=0;
  for(let k=0;k<=8000;k++){const t=k*dt;if(k%40===0){pts.push([t*1e3,i]);lin.push([t*1e3,12*t/10e-3]);}i+=12*dt/L(i);if(i>3)break;}
  return <Figure plot caption="12 V across a 10 mH inductor whose core begins to saturate above about 1 A (illustrative). An ideal inductor's current rises in a straight line, 1.2 A per millisecond (dashed). In the saturating part the inductance collapses as the current grows, $di/dt = V/L$ soars, and the current runs away within a fraction of a millisecond. A switch designed for the straight line can be destroyed by the curve.">
    <Plot curves={[{name:'Constant L (ideal)',color:gray,dashed:true,points:lin},{name:'Saturating core',color:orange,points:pts}]} xRange={[0,2.5]} yRange={[0,3]} xLabel="TIME / ms" yLabel="CURRENT / A" description="A straight line rising to 3 amps at 2.5 milliseconds, and a curve that follows it to about 1 amp and then bends sharply upward, reaching 3 amps near 1.2 milliseconds."/>
  </Figure>;
}

export function InductorSRFFigure(){
  const fs=logspace(2,9,400),L=100e-6,R=.5,C=5e-12;
  const z=(f:number)=>{const w=2*Math.PI*f,zr={re:R,im:w*L},yc=w*C;const den=(1-yc*zr.im)**2+(yc*zr.re)**2;return Math.hypot(zr.re/den,(zr.im*(1-yc*zr.im)-yc*zr.re*zr.re)/den);};
  return <Figure plot caption="Impedance of a 100 µH inductor with 0.5 Ω winding resistance and 5 pF of winding capacitance. At low frequency the resistance shows. Through the middle, $|Z|$ rises as $2\pi fL$. At about 7 MHz the winding capacitance resonates with $L$ and the impedance peaks, and above that the 'inductor' behaves like a 5 pF capacitor. A choke blocks noise only below its self-resonance.">
    <Plot curves={[{name:'Real inductor',color:orange,points:fs.map(f=>[f,z(f)] as [number,number])},{name:'Ideal 2πfL',color:gray,dashed:true,points:fs.map(f=>[f,2*Math.PI*f*L] as [number,number])}]}
      xRange={[100,1e9]} yRange={[.1,1e7]} xScale="log" yScale="log" xLabel="FREQUENCY / Hz" yLabel="|Z| / Ω" description="Impedance is 0.5 ohm at low frequency, rises with slope one from about 1 kilohertz, peaks near 7 megahertz, then falls with slope minus one."/>
  </Figure>;
}

/* ---------- Chapter 11: transformers ---------- */
// An ideal transformer drawn as two windings on a core, between four terminal points.
function Xfmr({x,y,h=110,np='N_p',ns='N_s'}:{x:number;y:number;h?:number;np?:string;ns?:string}){
  return <g><Ind a={[x,y]} b={[x,y+h]}/><Ind a={[x+70,y+h]} b={[x+70,y]}/>
    <path d={`M${x+28} ${y+10} V${y+h-10} M${x+42} ${y+10} V${y+h-10}`} stroke={ink} strokeWidth="1.8"/>
    <circle cx={x-12} cy={y+22} r="3.2" fill={ink}/><circle cx={x+82} cy={y+22} r="3.2" fill={ink}/>
    <Text x={x+35} y={y-12} anchor="middle" kind="value">{np+' : '+ns}</Text></g>;
}

export function TransformerEquivalentFigure(){
  const y=70,h=110;
  return <Figure caption="A practical transformer model built around an ideal one. On the primary side: winding resistance $R_p$ and leakage inductance $L_{\ell p}$ in series, then the magnetizing inductance $L_m$ (the current needed to make the flux) and core loss $R_c$ in parallel. The secondary has its own $R_s$ and $L_{\ell s}$. At low frequency $L_m$ dominates the imperfections; at high frequency the leakage inductances and winding capacitances (not drawn) do.">
    <Schematic width={680} height={240} description="Primary terminal through Rp and primary leakage inductance to a node; magnetizing inductance Lm and core-loss resistance Rc from that node to the primary return; then an ideal transformer; then secondary leakage inductance and Rs to the secondary terminal.">
      <Terminal at={[30,y]}/><Res a={[30,y]} b={[100,y]} label="R_p"/><Ind a={[100,y]} b={[180,y]} label="L_{ℓp}"/><Wire pts={[[180,y],[330,y]]}/>
      <Ind a={[220,y]} b={[220,y+h]} label="L_m" flipLabel/><Res a={[280,y]} b={[280,y+h]} label="R_c"/>
      <Xfmr x={330} y={y} h={h}/><Wire pts={[[30,y+h],[330,y+h]]}/><Terminal at={[30,y+h]}/>
      <Wire pts={[[400,y],[430,y]]}/><Ind a={[430,y]} b={[510,y]} label="L_{ℓs}"/><Res a={[510,y]} b={[580,y]} label="R_s"/><Terminal at={[580,y]}/>
      <Wire pts={[[400,y+h],[580,y+h]]}/><Terminal at={[580,y+h]}/>
      <Dot at={[220,y]}/><Dot at={[280,y]}/><Dot at={[220,y+h]}/><Dot at={[280,y+h]}/>
      <Text x={365} y={y+h+40} anchor="middle" kind="output">ideal transformer</Text>
    </Schematic></Figure>;
}

export function ReflectionFigure(){
  return <Figure caption="Reflecting through an ideal 2 : 1 transformer. Left: a 12 V source with 20 Ω of internal resistance drives a 100 Ω load through the transformer. Middle: the same seen from the primary, with the load reflected up as $a^2R_L$ = 400 Ω. Right: the same seen from the secondary, with the source reflected down to 6 V behind $20/a^2$ = 5 Ω. All three give 5.714 V across the real load.">
    <Schematic width={760} height={230} description="Three panels: the original transformer circuit; the primary-side equivalent with a 400 ohm load; the secondary-side equivalent with a 6 volt source and 5 ohm resistance driving 100 ohms.">
      <Source kind="ac" a={[40,180]} b={[40,100]} label="12 V"/><Wire pts={[[40,100],[40,60],[60,60]]}/><Res a={[60,60]} b={[130,60]} label="20 Ω"/><Wire pts={[[130,60],[150,60]]}/>
      <Xfmr x={150} y={60} h={120} np="2" ns="1"/><Wire pts={[[40,180],[150,180]]}/><Wire pts={[[220,60],[260,60]]}/><Res a={[260,60]} b={[260,180]} label="100 Ω"/><Wire pts={[[260,180],[220,180]]}/>
      <Source kind="ac" a={[330,180]} b={[330,100]} label="12 V"/><Wire pts={[[330,100],[330,60],[350,60]]}/><Res a={[350,60]} b={[420,60]} label="20 Ω"/><Wire pts={[[420,60],[450,60]]}/>
      <Res a={[450,60]} b={[450,180]} label="400 Ω" value="a²R_L" color={orange}/><Wire pts={[[450,180],[330,180]]}/>
      <Source kind="ac" a={[560,180]} b={[560,100]} label="6 V" value="12 V / a"/><Wire pts={[[560,100],[560,60],[590,60]]}/><Res a={[590,60]} b={[660,60]} label="5 Ω" value="20 Ω / a²" color={orange}/><Wire pts={[[660,60],[690,60]]}/>
      <Res a={[690,60]} b={[690,180]} label="100 Ω"/><Wire pts={[[690,180],[560,180]]}/>
      <Text x={150} y={218} anchor="middle" kind="output">original</Text><Text x={390} y={218} anchor="middle" kind="output">seen from the primary</Text><Text x={625} y={218} anchor="middle" kind="output">seen from the secondary</Text>
    </Schematic></Figure>;
}

export function FluxVsFrequencyFigure(){
  const fs=logspace(2,5,240),b=(f:number)=>Math.SQRT2*12/(2*Math.PI*f*100*25e-6);
  return <Figure plot caption="Peak flux density for a 12 V RMS sine on 100 turns and a 25 mm² core, against frequency. Halving the frequency doubles the volt-seconds per half-cycle and so doubles the flux. Above the illustrative 0.2 T limit (orange) the core saturates. This is why a 50 Hz mains transformer needs a massive core while a 100 kHz switching transformer of the same power fits in a fingertip.">
    <Plot curves={[{name:'Peak flux, 12 V RMS',color:green,points:fs.map(f=>[f,b(f)] as [number,number])},{name:'Illustrative 0.2 T limit',color:orange,dashed:true,points:[[100,.2],[1e5,.2]]}]}
      xRange={[100,1e5]} yRange={[.001,20]} xScale="log" yScale="log" xLabel="FREQUENCY / Hz" yLabel="PEAK FLUX DENSITY / T" point={[1e4,b(1e4)]} pointLabel="10 kHz: 0.108 T"
      description="A straight falling line on log-log axes, from about 11 tesla at 100 hertz to 0.011 tesla at 100 kilohertz, crossing the 0.2 tesla limit near 5.4 kilohertz."/>
  </Figure>;
}

export function MagnetizingCurrentFigure(){
  const t=span(0,2,300),w=2*Math.PI,v=(x:number)=>Math.sin(w*x),il=(x:number)=>.8*Math.sin(w*x),im=(x:number)=>-.35*Math.cos(w*x);
  return <Figure plot caption="Primary current of a loaded real transformer (normalized). The load component (gray, dashed) is in phase with the primary voltage (thin green). The magnetizing component (orange) lags the voltage by 90°, like any inductor current, and flows even with no load. Their sum (dark) is slightly larger and slightly lagging. Because the two parts are 90° apart, their RMS values add as $\sqrt{I_L^2 + I_m^2}$, not as $I_L + I_m$.">
    <Plot curves={[{name:'Primary voltage',color:green,points:t.map(x=>[x,v(x)] as [number,number])},{name:'Load component',color:gray,dashed:true,points:t.map(x=>[x,il(x)] as [number,number])},{name:'Magnetizing component',color:orange,points:t.map(x=>[x,im(x)] as [number,number])},{name:'Total primary current',color:ink,points:t.map(x=>[x,il(x)+im(x)] as [number,number])}]}
      xRange={[0,2]} yRange={[-1.1,1.1]} xLabel="TIME / PERIODS" yLabel="NORMALIZED VALUE" description="Four sinusoids: the voltage, a smaller in-phase load current, a smaller magnetizing current lagging by a quarter period, and their total, slightly larger than the load current and slightly delayed."/>
  </Figure>;
}
