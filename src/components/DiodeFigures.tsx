// Static figures for the diode and protection chapters (12–18). Rendered at build time.
import Plot from './Plot';
import {Schematic,Figure,Wire,Res,Cap,Ind,Diode,Source,CurrentSource,Switch,Bjt,bjtPins,OpAmp,opAmpPins,Ground,Rail,Dot,Terminal,Text,CurrentArrow,green,orange,gray,ink,type Pt} from './Schematic';
import {logspace} from './Parts';

const span=(a:number,b:number,n=300)=>Array.from({length:n+1},(_,k)=>a+(b-a)*k/n);
const VT=.025852,Q=1.602e-19,EPS=11.7*8.854e-12,NI=1e16; // NI in m⁻³ (10¹⁰ cm⁻³)

/* ---------- Chapter 12: semiconductor physics ---------- */
// A 2-D cartoon of the silicon lattice with one donor and one acceptor.
export function LatticeFigure(){
  const xs=[0,1,2,3,4],ys=[0,1,2],X=(i:number)=>120+i*100,Y=(j:number)=>35+j*70;
  const kind=(i:number,j:number)=>i===1&&j===1?'P':i===3&&j===1?'B':'Si';
  return <Figure caption="A flattened cartoon of the silicon crystal. Each silicon atom shares its four outer electrons in bonds with four neighbors (the double lines). A phosphorus donor (P, left) has five: four bond and the fifth is only loosely held, free to wander as a conduction electron (green), leaving a fixed positive ion behind. A boron acceptor (B, right) has three, so one bond is missing an electron: a hole (orange) that neighboring electrons can hop into. The ions stay put; only the electrons and holes move.">
    <svg viewBox="0 0 640 240" role="img" aria-label="A grid of silicon atoms joined by bonds. One phosphorus atom has an extra free electron nearby; one boron atom has a missing bond marked as a hole.">
      {ys.map(j=>xs.slice(0,-1).map(i=><path key={'h'+i+j} d={`M${X(i)+20} ${Y(j)-3} H${X(i+1)-20} M${X(i)+20} ${Y(j)+3} H${X(i+1)-20}`} stroke={i===2&&j===1?gray:ink} strokeWidth="1.4" strokeDasharray={i===2&&j===1?'4 3':undefined}/>))}
      {ys.slice(0,-1).map(j=>xs.map(i=><path key={'v'+i+j} d={`M${X(i)-3} ${Y(j)+20} V${Y(j+1)-20} M${X(i)+3} ${Y(j)+20} V${Y(j+1)-20}`} stroke={ink} strokeWidth="1.4"/>))}
      {ys.map(j=>xs.map(i=>{const k=kind(i,j);return <g key={i+'-'+j}><circle cx={X(i)} cy={Y(j)} r="18" fill={k==='Si'?'var(--white)':k==='P'?'#dcece5':'#f6e4da'} stroke={ink} strokeWidth="1.6"/><text x={X(i)} y={Y(j)+5} textAnchor="middle" className="symbol-label">{k}</text>{k!=='Si'&&<text x={X(i)+14} y={Y(j)-12} className="symbol-value">{k==='P'?'+':'−'}</text>}</g>;}))}
      <circle cx={X(1)+45} cy={Y(1)+37} r="6" fill={green}/><circle cx={X(2)+70} cy={Y(1)} r="6" fill="var(--paper)" stroke={orange} strokeWidth="2.4"/>
      <circle cx={150} cy={222} r="6" fill={green}/><text x={162} y={227} className="output-label">free electron (from P)</text>
      <circle cx={440} cy={222} r="6" fill="var(--paper)" stroke={orange} strokeWidth="2.4"/><text x={452} y={227} className="symbol-label" style={{fill:'var(--orange)'}}>hole (at B)</text>
    </svg></Figure>;
}

// Abrupt-junction depletion profiles from the depletion approximation.
function junction(naCm3:number,ndCm3:number,va=0){
  const NA=naCm3*1e6,ND=ndCm3*1e6,vbi=VT*Math.log(NA*ND/NI/NI),W=Math.sqrt(2*EPS/Q*(1/NA+1/ND)*(vbi-va)),xp=W*ND/(NA+ND),xn=W*NA/(NA+ND);
  const psiP=-VT*Math.log(NA/NI),psiN=VT*Math.log(ND/NI);
  const psi=(x:number)=>x<=-xp?psiP:x<0?psiP+Q*NA/(2*EPS)*(x+xp)**2:x<xn?psiN-Q*ND/(2*EPS)*(xn-x)**2:psiN;
  const E=(x:number)=>x<=-xp||x>=xn?0:x<0?-Q*NA/EPS*(x+xp):-Q*ND/EPS*(xn-x);
  const rho=(x:number)=>x<=-xp||x>=xn?0:x<0?-Q*NA:Q*ND;
  return {vbi,W,xp,xn,psi,E,rho};
}
export function JunctionProfileFigure(){
  const j=junction(1e16,1e17),xs=span(-.45e-6,.25e-6,500),um=(x:number)=>x*1e6;
  return <Figure plot caption="The depletion approximation for an abrupt junction with $N_A$ = 10¹⁶ cm⁻³ (p side, left) and $N_D$ = 10¹⁷ cm⁻³ (n side, right), at zero bias. Top left: charge density, negative acceptor ions on the p side and positive donor ions on the n side, equal in total. Top right: the field, triangular, peaking at the junction at 4.7 MV/m (47 kV/cm) and pointing from n to p (negative here). Bottom: the potential, which rises by $V_{\mathrm{bi}}$ = 0.77 V across the region. The lightly doped side holds most of the width. Each plot is the integral of the one before (Poisson's equation).">
    <div className="split-plots">
      <div><h4>Charge density</h4><Plot curves={[{name:'ρ(x)',color:orange,points:xs.map(x=>[um(x),j.rho(x)/Q/1e6/1e16] as [number,number])}]} xRange={[-.45,.25]} yRange={[-2,11]} xLabel="POSITION / µm" yLabel="ρ / q·10¹⁶ cm⁻³" description="Charge density is minus 1 between minus 0.3 and 0 micrometers and plus 10 in a thin slice from 0 to 0.03 micrometers."/></div>
      <div><h4>Electric field</h4><Plot curves={[{name:'E(x)',color:green,points:xs.map(x=>[um(x),j.E(x)/1e6] as [number,number])}]} xRange={[-.45,.25]} yRange={[-5.5,.5]} xLabel="POSITION / µm" yLabel="E / 10⁶ V/m" description="A triangular dip, falling linearly to about minus 4.7 million volts per metre at the junction and rising steeply back to zero on the n side."/></div>
    </div>
    <Plot curves={[{name:'Electrostatic potential ψ(x)',color:ink,points:xs.map(x=>[um(x),j.psi(x)] as [number,number])}]} xRange={[-.45,.25]} yRange={[-.45,.45]} xLabel="POSITION / µm" yLabel="POTENTIAL / V" description="The potential is flat at minus 0.36 volts on the p side, curves upward through the depletion region and is flat at plus 0.42 volts on the n side."/>
  </Figure>;
}

export function CarrierProfileFigure(){
  const j=junction(1e16,1e16),xs=span(-.5e-6,.5e-6,500);
  return <Figure plot caption="Equilibrium electron (green) and hole (orange) concentrations across a symmetric junction, on a logarithmic axis. Far from the junction each side has 10¹⁶ cm⁻³ majority carriers and only 10⁴ cm⁻³ minority carriers, a ratio of a trillion. Inside the depletion region both fall exponentially with the potential, so the region is nearly empty of mobile charge. Everywhere, $np = n_i^2$ = 10²⁰ cm⁻⁶.">
    <Plot curves={[{name:'Electrons n',color:green,points:xs.map(x=>[x*1e6,1e10*Math.exp(j.psi(x)/VT)] as [number,number])},{name:'Holes p',color:orange,points:xs.map(x=>[x*1e6,1e10*Math.exp(-j.psi(x)/VT)] as [number,number])},{name:'Intrinsic n_i',color:gray,dashed:true,points:[[-.5,1e10],[.5,1e10]]}]}
      xRange={[-.5,.5]} yRange={[1e3,1e17]} yScale="log" xLabel="POSITION / µm (p side left, n side right)" yLabel="CONCENTRATION / cm⁻³" description="On the left holes are 10 to the 16 and electrons 10 to the 4 per cubic centimetre; across the central 0.43 micrometers they swap, crossing at 10 to the 10."/>
  </Figure>;
}

export function JunctionCapFigure(){
  const vr=span(0,20,200),c=(v:number)=>{const j=junction(1e16,1e16,-v);return EPS*1e-8/j.W*1e12;};
  return <Figure plot caption="Junction capacitance of the chapter's symmetric example (area 0.01 mm²) against reverse bias. More reverse voltage exposes more fixed charge and widens the depletion region, so the 'plates' move apart and $C_j = \varepsilon A/W$ falls, roughly as $1/\sqrt{V_{\mathrm{bi}} + V_R}$. A diode built to exploit this is a varactor: a voltage-controlled capacitor.">
    <Plot curves={[{name:'C_j',color:green,points:vr.map(v=>[v,c(v)] as [number,number])}]} xRange={[0,20]} yRange={[0,2.6]} xLabel="REVERSE BIAS V_R / V" yLabel="CAPACITANCE / pF" point={[5,c(5)]} pointLabel="5 V: 0.85 pF"
      description="Capacitance falls from 2.41 picofarads at zero bias to about 0.85 at 5 volts and 0.45 at 20 volts."/>
  </Figure>;
}

export function VaractorFigure(){
  const n:Pt=[300,70];
  return <Figure caption="A varactor-tuned LC resonator. The tuning voltage reverse-biases the diode through a large resistor, setting its depletion capacitance; the blocking capacitor keeps that DC off the inductor while passing the RF current. Turning the knob retunes the circuit with no moving parts.">
    <Schematic width={640} height={250} description="An inductor from a node to ground; from the node, a blocking capacitor in series with a varactor diode to ground; a tuning voltage feeds the junction between capacitor and diode through a large resistor.">
      <Ind a={n} b={[300,210]} label="L" value="1 µH" flipLabel/><Wire pts={[[220,70],n]}/><Terminal at={[220,70]} label="to oscillator" side="left"/>
      <Wire pts={[n,[360,70]]}/><Cap a={[360,70]} b={[430,70]} label="C_block" value="large"/><Wire pts={[[430,70],[470,70]]}/><Diode a={[470,210]} b={[470,70]} label="varactor"/>
      <Wire pts={[[470,70],[470,40],[520,40]]}/><Res a={[520,40]} b={[600,40]} label="100 kΩ"/><Terminal at={[600,40]}/><Text x={600} y={22} anchor="end" kind="value">+V_tune</Text>
      <Wire pts={[[300,210],[470,210]]}/><Ground at={[385,210]}/><Dot at={n}/><Dot at={[470,70]}/>
    </Schematic></Figure>;
}

/* ---------- Chapter 13: diode models ---------- */
export function DiodeSymbolFigure(){
  return <Figure caption="The diode symbol and a typical package. The triangle points in the direction of conventional forward current, from anode (A) to cathode (K). The bar is the cathode, and so is the band printed on most packages. Positive diode voltage $V_D$ means the anode is higher than the cathode.">
    <svg viewBox="0 0 640 170" role="img" aria-label="A diode symbol between terminals A and K with a current arrow from A to K, and a cylindrical package with a band at the cathode end.">
      <Diode a={[80,80]} b={[300,80]}/><Terminal at={[80,80]} label="A (anode)" side="above"/><Terminal at={[300,80]} label="K (cathode)" side="above"/>
      <CurrentArrow at={[190,130]} dir="right" label="I_D, forward"/><path d="M110 130 H270" stroke={green} strokeWidth="1.4"/>
      <Text x={190} y={160} anchor="middle" kind="value">+    V_D    −</Text>
      <path d="M400 80 H440 M580 80 H620" stroke={ink} strokeWidth="1.8"/><rect x="440" y="62" width="140" height="36" rx="10" fill="#e6e1d6" stroke={ink} strokeWidth="1.6"/><rect x="552" y="62" width="14" height="36" fill={ink}/>
      <text x="510" y="128" textAnchor="middle" className="symbol-value">band = cathode</text>
    </svg></Figure>;
}

const dI=(v:number,n=1.5,is=1e-12,T=300)=>is*Math.expm1(v/(n*VT*T/300));
export function DiodeCurveFigure(){
  const vs=span(0,1,400);
  return <Figure plot caption="The same model diode ($I_S$ = 1 pA, $n$ = 1.5) on two kinds of axis. Linear (left): current seems to be zero until a 'turn-on voltage' and then shoots up, which is where the 0.7 V habit comes from. Logarithmic (right): there is no corner at all. Current rises by a factor of ten for every 89 mV ($nV_T\ln10$), a perfectly straight line spanning eight decades. The apparent threshold on the linear plot is just the point where the current becomes large enough to see on the chosen scale.">
    <div className="split-plots">
      <div><h4>Linear current axis</h4><Plot curves={[{name:'I_D',color:green,points:vs.map(v=>[v,dI(v)*1e3] as [number,number])}]} xRange={[0,1]} yRange={[0,20]} xLabel="DIODE VOLTAGE / V" yLabel="CURRENT / mA" description="Current is invisible below about 0.7 volts and then rises steeply to 20 milliamps near 0.95 volts."/></div>
      <div><h4>Logarithmic current axis</h4><Plot curves={[{name:'I_D',color:green,points:vs.filter(v=>v>.05).map(v=>[v,dI(v)] as [number,number])}]} xRange={[0,1]} yRange={[1e-12,1]} yScale="log" xLabel="DIODE VOLTAGE / V" yLabel="CURRENT / A" description="On a log axis the current is a straight line from about 1 picoamp near zero volts to 0.1 amps near 1 volt."/></div>
    </div></Figure>;
}

export function DiodeModelsFigure(){
  const vs=span(0,1.2,400),rs=5,expo=(v:number)=>dI(v),series=(i:number)=>1.5*VT*Math.log(1+i/1e-12)+i*rs;
  const is=span(0,.1,300);
  return <Figure plot caption="Four models of the same diode. Ideal switch (gray): zero volts at any current. Fixed drop (dark): 0.7 V at any current. Exponential (green): the physics. Exponential plus 5 Ω of series resistance (orange): what a real small diode does at higher currents, bending away from the exponential. Each is right for some questions; none is right for all.">
    <Plot curves={[{name:'Ideal switch',color:gray,dashed:true,points:[[0,0],[0,100]]},{name:'Fixed 0.7 V drop',color:ink,dashed:true,points:[[.7,0],[.7,100]]},{name:'Exponential',color:green,points:vs.map(v=>[v,expo(v)*1e3] as [number,number])},{name:'Exponential + 5 Ω',color:orange,points:is.map(i=>[series(i),i*1e3] as [number,number])}]}
      xRange={[0,1.2]} yRange={[0,100]} xLabel="DIODE VOLTAGE / V" yLabel="CURRENT / mA" description="A vertical line at zero volts, a vertical line at 0.7 volts, an exponential curve that rises steeply near 0.9 to 1 volt, and a less steep curve that leans to the right at high current."/>
  </Figure>;
}

export function DiodeTempFigure(){
  const vs=span(.4,1,300),is=(T:number)=>1e-12*(T/300)**3*Math.exp(1.12/(8.617e-5)*(1/300-1/T));
  const c=(T:number)=>vs.map(v=>[v,is(T)*Math.expm1(v/(VT*T/300))*1e3] as [number,number]);
  return <Figure plot caption="An ideal ($n$ = 1) diode model at three temperatures, with the saturation current's strong temperature dependence included. Heating moves the curve left: at a fixed 1 mA the forward voltage falls by roughly 2 mV/°C. The thermal voltage $V_T = kT/q$ grows with temperature, which alone would move the curve the other way; the rapid rise of $I_S$ wins. The effect is a thermometer (Chapter 45) and a hazard for parallel diodes (Chapter 40).">
    <Plot curves={[{name:'0 °C',color:gray,points:c(273)},{name:'25 °C',color:green,points:c(298)},{name:'75 °C',color:orange,points:c(348)}]} xRange={[.4,1]} yRange={[0,5]} xLabel="DIODE VOLTAGE / V" yLabel="CURRENT / mA" description="Three exponential curves; the 75 degree curve rises about 0.1 volts to the left of the 25 degree curve, and the 0 degree curve about 0.05 volts to the right."/>
  </Figure>;
}

export function RecoveryFigure(){
  const t=span(-50,250,600),pnc=(x:number)=>x<0?200:x<60?200-(400/60)*x:x<80?-200:x<140?-200*(1-(x-80)/60):0,sch=(x:number)=>x<0?200:x<30?200-(200/30)*x:x<40?-15*(1-(x-30)/10):0;
  return <Figure plot caption="An illustrative turn-off: the circuit forces the diode current from +200 mA toward reverse at a fixed rate. A PN junction (orange) keeps conducting backward after the current crosses zero, because stored minority carriers must be swept out first. The reverse peak and the shaded area give the recovered charge $Q_{rr}$. A Schottky diode (green) stores almost no such charge; its small negative blip is only junction capacitance charging. Reverse current flowing while the reverse voltage rises is lost energy at every switching edge.">
    <Plot curves={[{name:'PN junction',color:orange,points:t.map(x=>[x,pnc(x)] as [number,number])},{name:'Schottky',color:green,points:t.map(x=>[x,sch(x)] as [number,number])},{name:'Zero',color:gray,dashed:true,points:[[-50,0],[250,0]]}]}
      xRange={[-50,250]} yRange={[-250,250]} xLabel="TIME / ns" yLabel="DIODE CURRENT / mA" description="Both currents start at 200 milliamps. The Schottky current falls to zero by 30 nanoseconds with only a tiny dip. The PN current falls through zero to minus 200 milliamps at 60 nanoseconds, stays there until 80, then recovers to zero by 140 nanoseconds."/>
  </Figure>;
}

export function DiodeOrFigure(){
  const n:Pt=[330,110];
  return <Figure caption="A diode-OR power selector. Whichever source is higher supplies the load; the other diode is reverse-biased and blocks backflow, so the 5 V adapter cannot charge (or be loaded by) the 3 V battery. The load gets the higher input minus one diode drop.">
    <Schematic width={600} height={260} description="A 5 volt adapter through diode D1 and a 3 volt battery through diode D2 both feed a common node; a 1 kilohm load from the node to ground.">
      <Source a={[80,200]} b={[80,120]} label="adapter" value="5 V"/><Wire pts={[[80,120],[80,60],[200,60]]}/><Diode a={[200,60]} b={[290,60]} label="D_1"/><Wire pts={[[290,60],[330,60],n]}/>
      <Source kind="battery" a={[200,230]} b={[200,170]} label="battery" value="3 V"/><Wire pts={[[200,170],[200,150]]}/><Diode a={[200,150]} b={[290,150]} label="D_2"/><Wire pts={[[290,150],[330,150],n]}/>
      <Wire pts={[n,[440,110]]}/><Res a={[440,110]} b={[440,230]} label="load" value="1 kΩ"/><Wire pts={[[440,230],[80,230],[80,200]]}/><Dot at={n} color={green}/><Dot at={[200,230]}/><Ground at={[320,230]}/>
      <Text x={345} y={100} kind="output">≈ 4.3 V</Text>
    </Schematic></Figure>;
}

/* ---------- Chapter 14: rectifiers ---------- */
export function RectifiedWaveFigure(){
  const t=span(0,2,400),vp=12.73,w=2*Math.PI,s=(x:number)=>vp*Math.sin(w*x);
  return <Figure plot caption="A 9 V RMS (12.73 V peak) sine, rectified with ideal diodes and no capacitor. Half-wave (orange) passes only positive half-cycles: average $V_p/\pi$ = 4.05 V. Full-wave (green) flips the negative half-cycles up: average $2V_p/\pi$ = 8.10 V, with twice as many pulses. Both outputs keep one polarity, but neither is steady; the reservoir capacitor of section 02 does the smoothing.">
    <Plot curves={[{name:'AC input',color:gray,dashed:true,points:t.map(x=>[x,s(x)] as [number,number])},{name:'Full-wave',color:green,points:t.map(x=>[x,Math.abs(s(x))] as [number,number])},{name:'Half-wave',color:orange,points:t.map(x=>[x,Math.max(0,s(x))] as [number,number])},{name:'Full-wave average, 8.1 V',color:green,dashed:true,points:[[0,8.1],[2,8.1]]}]}
      xRange={[0,2]} yRange={[-14,14]} xLabel="TIME / LINE PERIODS" yLabel="VOLTAGE / V" description="A sine wave between plus and minus 12.7 volts; the full-wave output is the absolute value of it; the half-wave output keeps only the positive humps; a dashed line marks the 8.1 volt full-wave average."/>
  </Figure>;
}

export function RippleVsCFigure(){
  const cs=logspace(2,4,200);
  return <Figure plot caption="Peak-to-peak ripple from the constant-current estimate $\Delta V \approx I_L/(f_rC)$ for a full-wave rectifier on 50 Hz mains ($f_r$ = 100 Hz), at three load currents. Ripple is proportional to load current and inversely proportional to capacitance, a straight line of slope −1 on log axes. Halving the ripple always costs twice the capacitance.">
    <Plot curves={[{name:'20 mA',color:green,points:cs.map(c=>[c,.02/(100*c*1e-6)] as [number,number])},{name:'100 mA',color:ink,points:cs.map(c=>[c,.1/(100*c*1e-6)] as [number,number])},{name:'500 mA',color:orange,points:cs.map(c=>[c,.5/(100*c*1e-6)] as [number,number])}]}
      xRange={[100,1e4]} yRange={[.01,100]} xScale="log" yScale="log" xLabel="RESERVOIR CAPACITANCE / µF" yLabel="RIPPLE / V p-p" point={[470,.426]} pointLabel="20 mA, 470 µF: 0.43 V"
      description="Three parallel falling lines; at 1000 microfarads the ripple is 0.2, 1 and 5 volts peak-to-peak for 20, 100 and 500 milliamps."/>
  </Figure>;
}

export function PivFigure(){
  const t=span(0,2,400),vp=12,w=2*Math.PI;
  return <Figure plot caption="Why a half-wave capacitor-input rectifier needs a diode rated for twice the peak. The capacitor (green) holds near +12 V. When the source (gray) swings to −12 V, the diode's anode is at −12 V and its cathode at +12 V: the reverse voltage across it (orange) reaches nearly 24 V once per cycle. In a bridge, each blocking diode sees only about one peak.">
    <Plot curves={[{name:'Source voltage',color:gray,dashed:true,points:t.map(x=>[x,vp*Math.sin(w*x)] as [number,number])},{name:'Capacitor voltage (≈ peak)',color:green,points:[[0,11.3],[2,11.3]]},{name:'Diode voltage, anode − cathode',color:orange,points:t.map(x=>[x,Math.min(0,vp*Math.sin(w*x)-11.3)] as [number,number])}]}
      xRange={[0,2]} yRange={[-26,14]} xLabel="TIME / LINE PERIODS" yLabel="VOLTAGE / V" description="The source swings between plus and minus 12 volts; the capacitor holds about 11.3 volts; the diode voltage dips to about minus 23.3 volts at each negative peak."/>
  </Figure>;
}

export function HalfWaveFigure(){
  const n:Pt=[330,60];
  return <Figure caption="The half-wave capacitor-input rectifier. One diode, one recharge pulse per line cycle, so twice the ripple of a full-wave circuit for the same capacitor, and a DC component in the source current that some transformers dislike.">
    <Schematic width={560} height={220} description="An AC source through a diode to a node; a reservoir capacitor and a load resistor from the node to ground.">
      <Source kind="ac" a={[70,180]} b={[70,100]} label="AC"/><Wire pts={[[70,100],[70,60],[160,60]]}/><Diode a={[160,60]} b={[260,60]} label="D"/><Wire pts={[[260,60],n]}/>
      <Cap polar a={[330,180]} b={n} label="C" flipLabel/><Wire pts={[n,[440,60]]}/><Res a={[440,60]} b={[440,180]} label="R_L"/><Wire pts={[[440,180],[70,180]]}/>
      <Ground at={[200,180]}/><Dot at={n} color={green}/><Dot at={[330,180]}/><Text x={345} y={48} kind="output">V_out</Text>
    </Schematic></Figure>;
}

export function CenterTapFigure(){
  const tp:Pt=[200,40],ct:Pt=[200,140],bt:Pt=[200,240],n:Pt=[400,40];
  return <Figure caption="A center-tapped full-wave rectifier. The secondary is two half-windings in series; the tap is ground. On alternate half-cycles the top or bottom end is positive, and its diode conducts. Only one diode drop is lost per path, but each half-winding is used only half the time, and the blocking diode sees about twice a half-winding's peak.">
    <Schematic width={600} height={280} description="A transformer secondary with a grounded center tap; diodes from each outer end to a common output node; a capacitor and load from the output to ground.">
      <Ind a={[120,40]} b={[120,240]} label="primary" flipLabel/><path d="M148 50 V230 M162 50 V230" stroke={ink} strokeWidth="1.8"/>
      <Ind a={ct} b={tp}/><Ind a={bt} b={ct}/><Terminal at={[120,40]}/><Terminal at={[120,240]}/>
      <Wire pts={[tp,[260,40]]}/><Diode a={[260,40]} b={[340,40]} label="D_1"/><Wire pts={[[340,40],n]}/>
      <Wire pts={[bt,[260,240]]}/><Diode a={[260,240]} b={[340,240]} label="D_2"/><Wire pts={[[340,240],[370,240],[370,40]]}/>
      <Wire pts={[ct,[300,140],[300,180]]}/><Ground at={[300,180]}/>
      <Wire pts={[n,[460,40]]}/><Cap polar a={[460,180]} b={[460,40]} label="C"/><Res a={[540,40]} b={[540,180]} label="R_L"/><Wire pts={[[460,40],[540,40]]}/><Wire pts={[[460,180],[540,180]]}/><Ground at={[500,180]}/>
      <Dot at={n} color={green}/><Dot at={[370,40]}/><Dot at={[460,40]}/><Dot at={[460,180]}/><Dot at={ct}/>
      <Text x={214} y={130} kind="value">CT</Text>
    </Schematic></Figure>;
}

export function DoublerFigure(){
  const a:Pt=[230,70],b:Pt=[340,70];
  return <Figure caption="A half-wave voltage doubler (Greinacher). On the negative half-cycle $D_1$ charges $C_1$ to about $V_p$. On the positive half-cycle the source and $C_1$ add in series, and $D_2$ charges $C_2$ to nearly $2V_p$. Unloaded it doubles; under load the output falls fast, because all of the load charge has to pass through $C_1$ every cycle.">
    <Schematic width={560} height={240} description="An AC source through series capacitor C1 to a node; diode D1 from ground up to that node; diode D2 from that node to the output; capacitor C2 from the output to ground.">
      <Source kind="ac" a={[70,200]} b={[70,110]} label="AC, V_p"/><Wire pts={[[70,110],[70,70],[130,70]]}/><Cap a={[130,70]} b={[200,70]} label="C_1"/><Wire pts={[[200,70],a]}/>
      <Diode a={[230,200]} b={a} label="D_1" flipLabel/><Wire pts={[a,[260,70]]}/><Diode a={[260,70]} b={b} label="D_2"/><Wire pts={[b,[400,70]]}/>
      <Cap polar a={[400,200]} b={[400,70]} label="C_2" value="≈ 2V_p"/><Wire pts={[[400,70],[470,70]]}/><Terminal at={[470,70]} label="out" side="right"/>
      <Wire pts={[[400,200],[70,200]]}/><Ground at={[300,200]}/><Dot at={a}/><Dot at={[230,200]}/><Dot at={[400,70]}/>
    </Schematic></Figure>;
}

export function SupplyBlockFigure(){
  const p:Pt=[400,70];
  return <Figure caption="The complete unregulated-to-regulated supply of the worked example: transformer, bridge, reservoir capacitor, then a linear regulator that removes the remaining ripple. Each block passes a voltage budget to the next; the regulator needs its input trough, not its average, to stay above $V_{\mathrm{out}}$ plus its dropout.">
    <Schematic width={680} height={220} description="A 9 volt RMS transformer secondary feeds a bridge rectifier block; a 2200 microfarad capacitor across the bridge output; a 5 volt regulator block; then a small output capacitor and the load.">
      <Source kind="ac" a={[60,170]} b={[60,90]} label="9 V" value="RMS"/><Wire pts={[[60,90],[60,70],[140,70]]}/><Wire pts={[[60,170],[60,190],[140,190]]}/>
      <g data-pins="140,70 140,190 240,70 240,190"><rect x="140" y="50" width="100" height="160" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><Text x={190} y={128} anchor="middle">bridge</Text><Text x={190} y={148} anchor="middle" kind="value">4 diodes</Text></g>
      <Wire pts={[[240,70],[310,70]]}/><Wire pts={[[240,190],[560,190]]}/><Cap polar a={[310,190]} b={[310,70]} label="2200 µF" value="12–13 V"/><Wire pts={[[310,70],p]}/>
      <g data-pins="400,70 520,70 460,115"><rect x="400" y="45" width="120" height="70" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><Text x={460} y={78} anchor="middle">5 V</Text><Text x={460} y={98} anchor="middle" kind="value">regulator</Text></g>
      <Wire pts={[[460,115],[460,190]]}/><Wire pts={[[520,70],[600,70]]}/><Cap a={[560,190]} b={[560,70]} label="1 µF" flipLabel/><Res a={[600,70]} b={[600,190]} label="load" value="100 mA"/><Wire pts={[[560,190],[600,190]]}/>
      <Ground at={[380,190]}/><Dot at={[310,70]}/><Dot at={[310,190]}/><Dot at={[460,190]}/><Dot at={[560,70]}/><Dot at={[560,190]}/>
    </Schematic></Figure>;
}

/* ---------- Chapter 15: regulators ---------- */
export function ZenerCurveFigure(){
  const v=span(-6,1,500),fwd=(x:number)=>1e-12*Math.expm1(x/(1.2*VT));
  // Reverse: 10 Ω slope beyond 5.1 V plus an exponential knee that reaches 2 mA at 5.1 V.
  const i=(x:number)=>{const r=x<-4.6?-Math.max(0,(-x-5.1)/10)-.002*Math.exp(Math.min(0,(-x-5.1))/.05):0;return (fwd(x)+r)*1e3;};
  return <Figure plot caption="A 5.1 V zener's characteristic (illustrative). Forward, it is an ordinary diode. Reverse, it blocks until about 5 V and then conducts steeply: the breakdown region, where the voltage changes little as current changes a lot. The useful operating window (between the dashed lines) starts above the rounded knee, where the slope $r_z$ is small, and ends at the power limit. Note the reversed sign convention: zener current is plotted negative here because it flows cathode to anode.">
    <Plot curves={[{name:'Zener current',color:green,points:v.map(x=>[x,Math.max(-40,Math.min(40,i(x)))] as [number,number])},{name:'Operating window, 2–30 mA',color:orange,dashed:true,points:[[-6,-2],[-4.6,-2],[NaN,NaN],[-6,-30],[-4.6,-30]]}]}
      xRange={[-6,1]} yRange={[-40,40]} xLabel="VOLTAGE, ANODE − CATHODE / V" yLabel="CURRENT / mA" description="Forward current rises steeply near 0.8 volts. In reverse the current stays near zero until about minus 5.1 volts, where it drops steeply negative, passing minus 2 and minus 30 milliamps within a few tenths of a volt."/>
  </Figure>;
}

export function ZenerBudgetFigure(){
  const il=span(0,15,150),R=300,vz=5.1,iz=(vin:number,l:number)=>((vin-vz)/R*1e3)-l;
  return <Figure plot caption="Zener current against load current for the design of section 02 (300 Ω, 5.1 V zener), at the two input extremes. The resistor delivers a fixed current, $(V_{\mathrm{in}} - V_Z)/R$; whatever the load does not take, the zener must. At 9 V input the zener current reaches the 2 mA minimum (orange) at about 11 mA of load: regulation ends. At 15 V the zener carries 33 mA, 0.17 W, when the load is idle.">
    <Plot curves={[{name:'V_in = 15 V',color:ink,points:il.map(l=>[l,iz(15,l)] as [number,number])},{name:'V_in = 9 V',color:green,points:il.map(l=>[l,Math.max(0,iz(9,l))] as [number,number])},{name:'Minimum zener current, 2 mA',color:orange,dashed:true,points:[[0,2],[15,2]]}]}
      xRange={[0,15]} yRange={[0,35]} xLabel="LOAD CURRENT / mA" yLabel="ZENER CURRENT / mA" point={[11,2]} pointLabel="Edge of regulation at 9 V"
      description="Two straight lines falling with slope minus one: from 33 milliamps at no load for 15 volts in, and from 13 milliamps for 9 volts in, which reaches the 2 milliamp floor at 11 milliamps of load."/>
  </Figure>;
}

export function SeriesRegulatorFigure(){
  const q=bjtPins({at:[300,80]}),P=opAmpPins({at:[180,175],plusTop:true}),fb:Pt=[420,205];
  return <Figure caption="A series feedback regulator. The pass transistor drops whatever voltage is needed between the unregulated input and the output. The error amplifier compares a fraction of the output (from the divider) with a stable reference and drives the transistor's base so the two match. If the output sags under load, the fraction falls, the amplifier output rises, and the transistor conducts harder. Every three-terminal linear regulator contains this loop.">
    <Schematic width={600} height={310} description="Unregulated input to the collector of an NPN pass transistor whose emitter is the output; a divider from output to ground feeds the inverting input of an error amplifier; a reference voltage feeds its non-inverting input; the amplifier output drives the transistor base.">
      <Terminal at={[60,40]} label="V_in (unregulated)" side="above"/><Wire pts={[[60,40],[312,40],q.c]}/><Bjt at={[300,80]}/>
      <Wire pts={[q.e,[312,140],[420,140]]}/><Wire pts={[[420,140],[520,140]]} color={green}/><Terminal at={[520,140]} label="V_out" side="right"/>
      <Res a={[420,140]} b={fb} label="R_top"/><Res a={fb} b={[420,280]} label="R_bottom"/><Ground at={[420,280]}/>
      <OpAmp at={[180,175]} plusTop/><Wire pts={[P.out,[255,175],[255,80],q.b]}/>
      <Wire pts={[fb,[380,205],[380,240],[150,240],[150,P.minus[1]],P.minus]}/>
      <Wire pts={[P.plus,[120,P.plus[1]]]}/><Source a={[120,280]} b={[120,P.plus[1]]} label="V_ref" flipLabel/><Ground at={[120,280]}/>
      <Dot at={[420,140]}/><Dot at={fb}/>
    </Schematic></Figure>;
}

export function ZenerFollowerFigure(){
  const q=bjtPins({at:[300,110]}),b:Pt=[200,110];
  return <Figure caption="A zener followed by an emitter follower. The zener sets the base voltage; the transistor supplies the load current, so the zener's own current budget is divided by the transistor's $\beta$. The price: the output is one base–emitter drop (about 0.65 V) below the zener, and that drop changes with load current and temperature.">
    <Schematic width={560} height={250} description="Input through a resistor to the base node; a zener from the base node to ground; an NPN transistor with collector to the input, base at the node and emitter driving the load.">
      <Terminal at={[60,40]} label="V_in" side="above"/><Wire pts={[[60,40],[312,40],q.c]}/><Res a={[200,40]} b={b} label="R" flipLabel/><Dot at={[200,40]}/>
      <Wire pts={[b,q.b]}/><Diode kind="zener" a={[200,235]} b={b} label="V_Z" flipLabel/><Bjt at={[300,110]}/>
      <Wire pts={[q.e,[312,170],[420,170]]}/><Res a={[420,170]} b={[420,235]} label="load"/><Wire pts={[[420,235],[200,235]]}/><Ground at={[310,235]}/>
      <Dot at={b}/><Text x={430} y={160} kind="output">≈ V_Z − 0.65 V</Text>
    </Schematic></Figure>;
}

export function DropoutFigure(){
  const v=span(0,12,240);
  return <Figure plot caption="A 5 V regulator's output against its input, in a simple model with 2 V dropout (a classic NPN-pass design, dark) and 0.3 V (a low-dropout design, green). Above dropout the output is flat; below it, the regulator is just a wire with a fixed drop, and input ripple passes straight through. The LDO keeps regulating down to 5.3 V in, at the cost of a pass device that needs more careful stabilization.">
    <Plot curves={[{name:'2 V dropout',color:ink,points:v.map(x=>[x,Math.max(0,Math.min(5,x-2))] as [number,number])},{name:'0.3 V dropout (LDO)',color:green,points:v.map(x=>[x,Math.max(0,Math.min(5,x-.3))] as [number,number])},{name:'Output = input',color:gray,dashed:true,points:[[0,0],[6,6]]}]}
      xRange={[0,12]} yRange={[0,6]} xLabel="INPUT VOLTAGE / V" yLabel="OUTPUT VOLTAGE / V" description="Two curves rise parallel to the identity line, offset by 2 volts and 0.3 volts, until they flatten at 5 volts, reached at 7 volts and 5.3 volts of input."/>
  </Figure>;
}

export function LinearEfficiencyFigure(){
  const v=span(5.3,24,200);
  return <Figure plot caption="Efficiency of a linear regulator delivering 5 V, ignoring quiescent current: $\eta = V_{\mathrm{out}}/V_{\mathrm{in}}$. From 12 V it is 42%; from 24 V, 21%, with the other 79% turned into heat in the pass device. A linear regulator can never be more efficient than the voltage ratio, however good it is. Switching regulators (Chapter 18) escape this limit.">
    <Plot curves={[{name:'Efficiency',color:green,points:v.map(x=>[x,500/x] as [number,number])}]} xRange={[5,24]} yRange={[0,100]} xLabel="INPUT VOLTAGE / V" yLabel="EFFICIENCY / %" point={[12,500/12]} pointLabel="12 V in: 42%"
      description="Efficiency falls from about 94 percent at 5.3 volts in, through 42 percent at 12 volts, to 21 percent at 24 volts."/>
  </Figure>;
}

/* ---------- Chapter 16: diode applications ---------- */
export function LimiterTransferFigure(){
  const v=span(-8,8,320),vo=(x:number)=>Math.max(-.3,Math.min(3.6,x));
  return <Figure plot caption="Transfer curve of the two-diode limiter (fixed 0.3 V drops, 3.3 V rail): output against input. Between −0.3 V and 3.6 V neither diode conducts and the output equals the input (slope 1). Outside that window one diode conducts, the output is pinned, and the series resistor takes up the difference. A transfer curve shows a circuit's whole behavior at a glance, for any waveform slow enough to ignore capacitance.">
    <Plot curves={[{name:'Output',color:green,points:v.map(x=>[x,vo(x)] as [number,number])},{name:'Output = input',color:gray,dashed:true,points:[[-5,-5],[5,5]]}]} xRange={[-8,8]} yRange={[-2,5]} xLabel="INPUT VOLTAGE / V" yLabel="OUTPUT VOLTAGE / V" description="Output is flat at minus 0.3 volts for inputs below minus 0.3, follows the input with slope one up to 3.6 volts, then is flat at 3.6 volts."/>
  </Figure>;
}

// Ideal-diode peak/envelope detector: the capacitor follows the input upward and decays through R otherwise.
function detector(input:(t:number)=>number,rc:number,tEnd:number,dt:number,vf=0){
  let v=0;const out:[number,number][]=[];const n=Math.round(tEnd/dt),k=Math.max(1,Math.round(n/800));
  for(let i=0;i<=n;i++){const t=i*dt,x=input(t)-vf;v=x>v?x:v*Math.exp(-dt/rc);if(i%k===0)out.push([t,v]);}return out;
}
export function PeakDetectorFigure(){
  const n:Pt=[300,70];
  return <Figure caption="A positive peak detector. While the input exceeds the capacitor voltage by a diode drop, the diode conducts and tops the capacitor up; otherwise it blocks, and the capacitor discharges slowly through $R$ (and through any leakage). The output holds approximately the most recent peak, minus $V_F$.">
    <Schematic width={560} height={220} description="Input through a diode to a node; a capacitor and a discharge resistor from the node to ground; output at the node.">
      <Terminal at={[70,70]} label="v_in" side="above"/><Wire pts={[[70,70],[160,70]]}/><Diode a={[160,70]} b={[250,70]} label="D"/><Wire pts={[[250,70],n]}/>
      <Cap a={n} b={[300,180]} label="C"/><Wire pts={[n,[400,70]]}/><Res a={[400,70]} b={[400,180]} label="R" value="discharge"/><Wire pts={[[400,180],[300,180]]}/><Ground at={[350,180]}/>
      <Wire pts={[[400,70],[480,70]]} color={green}/><Terminal at={[480,70]} label="v_out" side="right"/><Dot at={n}/><Dot at={[400,70]}/>
    </Schematic></Figure>;
}

export function PeakWaveFigure(){
  const f=1e3,inp=(t:number)=>5*Math.sin(2*Math.PI*f*t),tEnd=3e-3,dt=1e-7;
  return <Figure plot caption="A 5 V peak, 1 kHz sine (gray) into the peak detector, with a 0.6 V diode drop and two discharge time constants. With $RC$ = 10 ms (green) the output rises to 4.4 V in the first cycle and droops only 10% between peaks. With $RC$ = 0.5 ms (orange) it sags badly between peaks and the 'held' value is just a sawtooth. Choose $RC$ long compared with the time between peaks, but short enough to follow genuine changes.">
    <Plot curves={[{name:'Input',color:gray,dashed:true,points:span(0,tEnd,600).map(t=>[t*1e3,inp(t)] as [number,number])},{name:'RC = 10 ms',color:green,points:detector(inp,.01,tEnd,dt,.6).map(([t,v])=>[t*1e3,v] as [number,number])},{name:'RC = 0.5 ms',color:orange,points:detector(inp,5e-4,tEnd,dt,.6).map(([t,v])=>[t*1e3,v] as [number,number])}]}
      xRange={[0,3]} yRange={[-6,6]} xLabel="TIME / ms" yLabel="VOLTAGE / V" description="A sine between plus and minus 5 volts. The long time-constant output climbs to 4.4 volts on the first peak and stays near it with small dips. The short time-constant output repeatedly charges to 4.4 volts and decays to about 1 volt between peaks."/>
  </Figure>;
}

export function EnvelopeFigure(){
  const fc=50e3,fm=500,m=.8,am=(t:number)=>(1+m*Math.sin(2*Math.PI*fm*t))*Math.sin(2*Math.PI*fc*t),tEnd=4e-3,dt=2e-7;
  const env=span(0,tEnd,400).map(t=>[t*1e3,1+m*Math.sin(2*Math.PI*fm*t)] as [number,number]);
  return <Figure plot caption="An amplitude-modulated 50 kHz carrier (500 Hz envelope, 80% depth) into an ideal-diode envelope detector. With $RC$ = 150 µs (green) the output follows the envelope (dashed) with a small carrier ripple. With $RC$ = 1.5 ms (orange) the capacitor cannot discharge as fast as the envelope falls, so on every falling slope the output lags far above it: diagonal clipping, heard as distortion. The carrier period (20 µs) and the envelope period (2 ms) bracket the right time constant.">
    <Plot curves={[{name:'Envelope (ideal)',color:gray,dashed:true,points:env},{name:'RC = 150 µs',color:green,points:detector(am,150e-6,tEnd,dt).map(([t,v])=>[t*1e3,v] as [number,number])},{name:'RC = 1.5 ms',color:orange,points:detector(am,1.5e-3,tEnd,dt).map(([t,v])=>[t*1e3,v] as [number,number])}]}
      xRange={[0,4]} yRange={[0,2]} xLabel="TIME / ms" yLabel="DETECTOR OUTPUT / V" description="The envelope swings between 0.2 and 1.8 volts every 2 milliseconds. The 150 microsecond output tracks it closely with fine ripple. The 1.5 millisecond output tracks the rising slopes but falls in slow exponentials well above the envelope on the falling slopes."/>
  </Figure>;
}

export function ClamperFigure(){
  const n:Pt=[300,80];
  return <Figure caption="A diode clamper (DC restorer). The capacitor in series stores charge; the diode from ground lets current flow only when the output tries to go below about −0.7 V. After a few cycles the capacitor holds just the charge that lifts the whole waveform until its lowest point sits at −$V_F$. The large resistor lets the stored charge leak away slowly if the input amplitude falls.">
    <Schematic width={560} height={220} description="Input through a series capacitor to a node; a diode from ground (anode) to the node (cathode); a large resistor from the node to ground; output at the node.">
      <Terminal at={[70,80]} label="v_in" side="above"/><Wire pts={[[70,80],[170,80]]}/><Cap a={[170,80]} b={[250,80]} label="C"/><Wire pts={[[250,80],n]}/>
      <Diode a={[300,190]} b={n} label="D" flipLabel/><Wire pts={[n,[400,80]]}/><Res a={[400,80]} b={[400,190]} label="R" value="large"/><Wire pts={[[400,190],[300,190]]}/><Ground at={[350,190]}/>
      <Wire pts={[[400,80],[480,80]]} color={green}/><Terminal at={[480,80]} label="v_out" side="right"/><Dot at={n}/><Dot at={[400,80]}/>
    </Schematic></Figure>;
}

export function ClamperWaveFigure(){
  // Square wave ±2 V, 1 kHz. Capacitor 1 µF, R 100 kΩ, diode 0.7 V with 50 Ω on-resistance. vc = voltage across C (input side minus output side).
  const T=1e-3,sq=(t:number)=>((t%T)+T)%T<T/2?2:-2,dt=2e-7,R=1e5,C=1e-6,Ron=50,pts:[number,number][]=[];let vc=0;
  for(let i=0;i<=Math.round(6e-3/dt);i++){const t=i*dt,vo=sq(t)-vc;const id=vo< -.7?(-.7-vo)/Ron:0;vc+=dt*(vo/R-id)/C;if(i%25===0)pts.push([t*1e3,vo]);}
  return <Figure plot caption="The clamper settling on a ±2 V, 1 kHz square wave (gray), with 1 µF, 100 kΩ and a 0.7 V diode. On the first negative half-cycle the diode conducts and charges the capacitor; within a cycle the output (green) has been lifted so that its low level sits at −0.7 V and its high level at +3.3 V. The 4 V swing is unchanged; only its DC level has moved. The slight tilt is the capacitor leaking through $R$.">
    <Plot curves={[{name:'Input',color:gray,dashed:true,points:span(0,6e-3,600).map(t=>[t*1e3,sq(t)] as [number,number])},{name:'Output',color:green,points:pts}]} xRange={[0,6]} yRange={[-3,4]} xLabel="TIME / ms" yLabel="VOLTAGE / V" description="The input square wave alternates between plus and minus 2 volts. The output starts equal to it, but after the first negative half-cycle it alternates between about minus 0.7 and plus 3.3 volts."/>
  </Figure>;
}

export function ZenerLimiterFigure(){
  const n:Pt=[260,70];
  return <Figure caption="A symmetric limiter from back-to-back zeners. On positive excursions the upper zener breaks down while the lower conducts forward; on negative excursions the roles swap. Either way the output is limited near $\pm(V_Z + V_F)$, about ±5.8 V for 5.1 V zeners.">
    <Schematic width={520} height={230} description="Input through a resistor to the output node; two zener diodes in series, anode to anode, from the output node to ground.">
      <Terminal at={[60,70]} label="v_in" side="above"/><Wire pts={[[60,70],[120,70]]}/><Res a={[120,70]} b={[220,70]} label="R"/><Wire pts={[[220,70],n]}/>
      <Diode kind="zener" a={[260,135]} b={n} label="5.1 V"/><Diode kind="zener" a={[260,135]} b={[260,200]} label="5.1 V"/><Ground at={[260,200]}/>
      <Wire pts={[n,[380,70]]} color={green}/><Terminal at={[380,70]} label="v_out" side="right"/><Dot at={n}/>
    </Schematic></Figure>;
}

export function PolarityProtectFigure(){
  return <Figure caption="Two ways to survive a reversed battery. Left: a series diode simply blocks reverse current, at the cost of its forward drop (0.3–0.8 V) and the heat that drop produces. Right: a shunt diode across the supply conducts heavily when the battery is reversed and blows the fuse, losing nothing in normal operation but needing a fuse replaced after each mistake.">
    <Schematic width={680} height={230} description="Left: battery, series diode, load. Right: battery, fuse, then a diode across the supply with cathode to positive, then the load.">
      <Source kind="battery" a={[60,180]} b={[60,90]} label="battery"/><Wire pts={[[60,90],[60,60],[110,60]]}/><Diode a={[110,60]} b={[200,60]} label="series diode"/><Wire pts={[[200,60],[260,60]]}/>
      <Res a={[260,60]} b={[260,180]} label="load"/><Wire pts={[[260,180],[60,180]]}/><Text x={160} y={218} anchor="middle" kind="output">series: blocks, costs V_F</Text>
      <Source kind="battery" a={[400,180]} b={[400,90]} label="battery"/><Wire pts={[[400,90],[400,60],[440,60]]}/><Res a={[440,60]} b={[520,60]} label="fuse"/><Wire pts={[[520,60],[620,60]]}/>
      <Diode a={[540,180]} b={[540,60]} label="shunt diode" flipLabel/><Res a={[620,60]} b={[620,180]} label="load"/><Wire pts={[[620,180],[400,180]]}/><Dot at={[540,60]}/><Dot at={[540,180]}/>
      <Text x={510} y={218} anchor="middle" kind="output">shunt: blows the fuse</Text>
    </Schematic></Figure>;
}

/* ---------- Chapter 17: inductive-load protection ---------- */
export function FlybackLoopsFigure(){
  const panel=(x0:number,on:boolean)=>{const top:Pt=[x0+120,40],mid:Pt=[x0+120,150];const c=(b:boolean)=>b?green:ink;return <g key={String(on)}>
    <Rail at={top} label="+12 V"/><Ind a={top} b={mid} label="winding" value="100 mH, 120 Ω" flipLabel color={green}/>
    <Switch a={mid} b={[x0+120,230]} closed={on} color={c(on)}/><Ground at={[x0+120,230]}/>
    <Wire pts={[[x0+120,55],[x0+190,55]]} color={c(!on)}/><Wire pts={[[x0+120,135],[x0+190,135]]} color={c(!on)}/><Diode a={[x0+190,135]} b={[x0+190,55]} color={c(!on)}/>
    <Dot at={[x0+120,55]}/><Dot at={[x0+120,135]}/>
    {on?<CurrentArrow at={[x0+120,195]} dir="down" color={green} side={-1} label="100 mA"/>:<CurrentArrow at={[x0+190,95]} dir="up" color={green} label="decaying"/>}
    <Text x={x0+150} y={268} anchor="middle" kind="output">{on?'switch closed: current flows down':'switch opened: current circulates'}</Text></g>;};
  return <Figure caption="The two current loops of a relay driver. Switch closed (left): current flows from the supply down through the winding and the switch; the diode is reverse-biased and idle. Switch opened (right): the winding's current cannot stop instantly, so it keeps flowing downward through the winding, out at the bottom, up through the diode and back in at the top. The current circulates in this small loop, decaying as the winding's resistance and the diode absorb its energy.">
    <Schematic width={640} height={280} description="Two copies of a winding from +12 volts to a switch to ground, with a diode across the winding. In the first, the switch is closed and the current path through winding and switch is highlighted. In the second, the switch is open and the loop through the winding and diode is highlighted.">
      {panel(20,true)}{panel(340,false)}
    </Schematic></Figure>;
}

export function SwitchNodeFigure(){
  const t=span(-.5,3,500),L=.1,R=120,I0=.1,td=(vc:number)=>L/R*Math.log(1+R*I0/vc)*1e3;
  const node=(vc:number)=>(x:number)=>x<0?.2:x<td(vc)?12+vc:12;
  return <Figure plot caption="The switch-node voltage when the switch opens at $t$ = 0 (ideal model, 12 V supply). With a plain flywheel diode (green) the node rises to only 12.7 V, but the current takes 2.4 ms to die away. With a diode plus 24 V zener (orange) the node jumps to about 36 V and the current is gone in 0.34 ms. With no clamp at all the node would rise until the switch broke down, typically far off the top of this plot. The switch must be rated for supply plus clamp voltage, plus overshoot.">
    <Plot curves={[{name:'Flywheel diode, 0.7 V',color:green,points:t.map(x=>[x,node(.7)(x)] as [number,number])},{name:'Diode + 24 V zener',color:orange,points:t.map(x=>[x,node(24.7)(x)] as [number,number])},{name:'Supply, 12 V',color:gray,dashed:true,points:[[-.5,12],[3,12]]}]}
      xRange={[-.5,3]} yRange={[0,40]} xLabel="TIME AFTER OPENING / ms" yLabel="SWITCH-NODE VOLTAGE / V" description="Before opening the node sits near zero. The diode trace steps to 12.7 volts for 2.4 milliseconds, then settles at 12. The zener trace steps to about 36.7 volts for 0.34 milliseconds, then settles at 12."/>
  </Figure>;
}

export function ClampTradeFigure(){
  const vc=logspace(-.3,1.7,200),L=.1,R=120,I0=.1,t=(v:number)=>L/R*Math.log(1+R*I0/v)*1e3,e=(v:number)=>v*L/R*(I0-v/R*Math.log(1+R*I0/v))*1e3;
  return <Figure plot caption="The clamp tradeoff for the chapter's relay (100 mH, 120 Ω, 100 mA, so 0.5 mJ stored). Left: time for the current to reach zero falls steeply as the clamp voltage rises. Right: the share of the stored energy dumped into the clamp rises with clamp voltage; with a plain diode the winding's own resistance absorbs about 90% of it. Faster release costs switch voltage and clamp energy.">
    <div className="split-plots">
      <div><h4>Release time</h4><Plot curves={[{name:'Time to zero current',color:green,points:vc.map(v=>[v,t(v)] as [number,number])}]} xRange={[.5,50]} yRange={[0,3]} xScale="log" xLabel="CLAMP VOLTAGE / V" yLabel="TIME / ms" description="Release time falls from about 2.7 milliseconds at 0.5 volts to 0.18 milliseconds at 50 volts."/></div>
      <div><h4>Energy absorbed by the clamp</h4><Plot curves={[{name:'Clamp energy',color:orange,points:vc.map(v=>[v,e(v)] as [number,number])},{name:'Total stored, 0.5 mJ',color:gray,dashed:true,points:[[.5,.5],[50,.5]]}]} xRange={[.5,50]} yRange={[0,.55]} xScale="log" xLabel="CLAMP VOLTAGE / V" yLabel="ENERGY / mJ" description="Clamp energy rises from about 0.04 millijoules at 0.5 volts to about 0.42 millijoules at 50 volts, approaching the 0.5 millijoule total."/></div>
    </div></Figure>;
}

export function ClampPlacementFigure(){
  const panel=(x0:number,acrossSwitch:boolean)=>{const top:Pt=[x0+110,40],mid:Pt=[x0+110,150];return <g key={String(acrossSwitch)}>
    <Rail at={top} label="+12 V"/><Ind a={top} b={mid} label="winding" flipLabel/><Switch a={mid} b={[x0+110,240]}/><Ground at={[x0+110,240]}/><Dot at={mid}/>
    {acrossSwitch?<><Wire pts={[mid,[x0+190,150]]}/><Diode kind="zener" a={[x0+190,240]} b={[x0+190,150]} label="36 V TVS"/><Wire pts={[[x0+190,240],[x0+110,240]]}/></>
     :<><Wire pts={[[x0+110,55],[x0+190,55]]}/><Wire pts={[[x0+110,135],[x0+190,135]]}/><Diode a={[x0+190,135]} b={[x0+190,95]}/><Diode kind="zener" a={[x0+190,55]} b={[x0+190,95]} label="24 V"/><Dot at={[x0+110,55]}/><Dot at={[x0+110,135]}/></>}
    <Text x={x0+140} y={278} anchor="middle" kind="output">{acrossSwitch?'across the switch':'across the winding'}</Text></g>;};
  return <Figure caption="Two places to put a clamp. Across the winding (left), a diode and 24 V zener limit the switch node to 12 + 24.7 V, and the decaying current circulates locally. Across the switch (right), a 36 V clamp to ground gives the same switch voltage and the same 24 V across the winding, but the current now flows from the supply through the winding into the clamp, so the clamp absorbs the stored energy plus extra energy from the supply. Same switch stress, different clamp stress.">
    <Schematic width={660} height={290} description="Left: winding from +12 volts to a switch, with a diode and zener in series across the winding. Right: the same winding and switch, with a zener-type clamp from the switch node to ground.">
      {panel(30,false)}{panel(360,true)}
    </Schematic></Figure>;
}

export function PwmFreewheelFigure(){
  // Motor winding 2 mH, 4 Ω on 12 V, 20 kHz PWM at 50%; diode 0.7 V during off-time.
  const L=2e-3,R=4,f=20e3,D=.5,dt=1e-7,pts:[number,number][]=[];let i=0;
  for(let k=0;k<=Math.round(1.5e-3/dt);k++){const t=k*dt,on=(t*f)%1<D,v=on?12:-.7;i=Math.max(0,i+dt*(v-R*i)/L);if(k%20===0)pts.push([t*1e3,i]);}
  return <Figure plot caption="Current in a 2 mH, 4 Ω motor winding switched at 20 kHz, 50% duty, from 12 V, with a freewheeling diode. The current climbs over a few $L/R$ = 0.5 ms time constants to an average near $D \times 12/4$ = 1.5 A minus a little for the diode drop. In each period it rises while the switch is on and falls, still flowing, through the diode while it is off. Here the diode is not an occasional protector: it carries half the motor current continuously, so its average current, heating and recovery all matter.">
    <Plot curves={[{name:'Winding current',color:green,points:pts}]} xRange={[0,1.5]} yRange={[0,2]} xLabel="TIME / ms" yLabel="CURRENT / A" description="A current that rises from zero with a fine sawtooth ripple, settling after about 1.5 milliseconds to roughly 1.4 amps with about 0.07 amps of ripple."/>
  </Figure>;
}

/* ---------- Chapter 18: protection and bypass diodes ---------- */
export function RegulatorBypassFigure(){
  const i:Pt=[250,140],o:Pt=[390,140];
  return <Figure caption="A protection diode from regulator output (anode) to input (cathode). It is reverse-biased in normal operation. If the input collapses faster than the output, the output capacitor discharges through the diode instead of backward through the regulator.">
    <Schematic width={640} height={250} description="Input rail with capacitor feeds a three-terminal regulator block. Output rail with capacitor feeds the load. A diode bridges from the output rail back to the input rail above the regulator, anode at output.">
      <Terminal at={[40,140]} label="V_in"/><Wire pts={[[40,140],i]}/><Wire pts={[o,[600,140]]}/><Terminal at={[600,140]} label="V_out" side="right"/>
      <g data-pins="250,140 390,140 320,180"><rect x="250" y="110" width="140" height="70" fill="var(--white)" stroke={ink} strokeWidth="1.8"/><Text x={320} y={140} anchor="middle">linear</Text><Text x={320} y={160} anchor="middle">regulator</Text><Text x={262} y={132} kind="value">IN</Text><Text x={378} y={132} anchor="end" kind="value">OUT</Text></g>
      <Cap a={[130,140]} b={[130,230]} label="C_in"/><Cap polar a={[500,230]} b={[500,140]} label="C_out" value="large"/><Wire pts={[[320,180],[320,230]]}/><Wire pts={[[130,230],[500,230]]}/><Ground at={[320,230]}/>
      <Wire pts={[[440,140],[440,60],[370,60]]}/><Diode a={[370,60]} b={[270,60]} color={green} label="protection diode"/><Wire pts={[[270,60],[200,60],[200,140]]}/>
      <Dot at={[200,140]}/><Dot at={[440,140]}/><Dot at={[130,140]}/><Dot at={[500,140]}/><Dot at={[320,230]}/><Dot at={[130,230]}/>
    </Schematic></Figure>;
}

export function SteeringFigure(){
  const pin:Pt=[460,135];
  return <Figure caption="Layered input protection. A TVS at the connector diverts most of a surge to ground; the series resistor limits whatever current remains; steering diodes return the rest to the supply rails. Each element assumes the next one exists.">
    <Schematic width={640} height={270} description="Connector pin, TVS diode to ground at the connector, series resistor, then a protected pin with one diode from pin up to VDD and one from ground up to the pin.">
      <Terminal at={[50,135]} label="connector" side="above"/><Wire pts={[[50,135],[310,135]]}/><Diode kind="zener" a={[140,240]} b={[140,135]} color={orange} label="TVS"/><Ground at={[140,240]}/>
      <Res a={[310,135]} b={[400,135]} label="R series"/><Wire pts={[[400,135],pin]}/><Rail at={[460,30]} label="V_DD"/><Diode a={pin} b={[460,30]} label="to V_DD"/><Diode a={[460,240]} b={pin} label="from ground"/><Ground at={[460,240]}/>
      <Wire pts={[pin,[560,135]]} color={green}/><Terminal at={[560,135]} label="protected pin" side="below"/><Dot at={[140,135]}/><Dot at={pin} color={green}/>
    </Schematic></Figure>;
}

export function ResetFigure(){
  const n:Pt=[180,170];
  return <Figure caption="A power-on delay with a discharge diode. $R$ charges $C$ slowly when power appears. When the supply falls to zero, the diode (anode at the timing node, cathode at the supply) empties $C$ quickly, so a brief dropout produces a fresh delay.">
    <Schematic width={600} height={260} description="Supply at top through resistor R to a timing node, capacitor from the node to ground. A diode in parallel with R points from the node up to the supply.">
      <Rail at={[180,30]} label="V_DD"/><Wire pts={[[180,30],[180,60]]}/><Res a={[180,60]} b={n} label="R" value="100 kΩ" flipLabel/><Wire pts={[[180,60],[280,60]]}/><Diode a={[280,170]} b={[280,60]} color={green} label="discharge diode"/><Wire pts={[[280,170],n]}/>
      <Cap a={n} b={[180,240]} label="C" value="1 µF" flipLabel/><Ground at={[180,240]}/><Wire pts={[[280,170],[420,170]]} color={green}/><Terminal at={[420,170]} label="to RESET input" side="right"/>
      <Dot at={n}/><Dot at={[180,60]}/><Dot at={[280,170]}/>
    </Schematic></Figure>;
}

export function InrushFigure(){
  const t=span(0,15,300),C=4700e-6,V=24,curve=(R:number)=>t.map(x=>[x,V/R*Math.exp(-x*1e-3/(R*C))] as [number,number]);
  return <Figure plot caption="Inrush current into an empty 4700 µF capacitor connected to 24 V through 0.5 Ω (wiring and ESR, orange) and through a 10 Ω limiter (green). The low-resistance path draws a 48 A spike lasting a few milliseconds; the limiter caps the peak at 2.4 A and spreads charging over about 0.2 s. Either way the resistance dissipates exactly ½CV² = 1.35 J. The limiter does not save energy; it lowers the peak.">
    <Plot curves={[{name:'0.5 Ω path',color:orange,points:curve(.5)},{name:'10 Ω limiter',color:green,points:curve(10)}]} xRange={[0,15]} yRange={[0,50]} xLabel="TIME / ms" yLabel="CURRENT / A" description="The 0.5 ohm current starts at 48 amps and decays to near zero within about 10 milliseconds. The 10 ohm current starts at 2.4 amps and decays only slowly over this window."/>
  </Figure>;
}

export function OvershootDampingFigure(){
  const t=span(0,3,400),V=12,step=(z:number)=>t.map(x=>{const w=2*Math.PI*x,wd=Math.sqrt(Math.max(1e-9,1-z*z));const v=z<1?V*(1-Math.exp(-z*w)*(Math.cos(wd*w)+z/wd*Math.sin(wd*w))):V*(1-Math.exp(-w)*(1+w));return [x,v] as [number,number];});
  return <Figure plot caption="A 12 V step into a series LC filter, against time in periods of its resonance, for three damping ratios $\zeta = R/2Z_0$. Lightly damped (ζ = 0.04, orange) it rings up to nearly 24 V, twice the input. Partly damped (ζ = 0.37, dark) it still overshoots to about 15 V. Critically damped (ζ = 1, green) it rises without overshoot, at the cost of a series resistance twice the characteristic impedance.">
    <Plot curves={[{name:'ζ = 0.04',color:orange,points:step(.04)},{name:'ζ = 0.37',color:ink,points:step(.37)},{name:'ζ = 1',color:green,points:step(1)},{name:'Input, 12 V',color:gray,dashed:true,points:[[0,12],[3,12]]}]}
      xRange={[0,3]} yRange={[0,25]} xLabel="TIME / RESONANT PERIODS" yLabel="OUTPUT VOLTAGE / V" description="The lightly damped output oscillates between near 0 and about 23 volts, decaying slowly; the medium curve overshoots to about 15 volts once and settles; the critically damped curve rises smoothly to 12 volts."/>
  </Figure>;
}

export function EsdPulseFigure(){
  const t=span(0,200,400),i=(x:number)=>8000/330*Math.exp(-x/49.5)*(1-Math.exp(-x/1.5));
  return <Figure plot caption="The current of the human-body ESD model: 150 pF charged to 8 kV discharging through 330 Ω. It peaks near 24 A within a few nanoseconds and decays with $\tau = RC \approx$ 50 ns. The energy is only 4.8 mJ, but the rate of change is enormous: a few nanohenries of ground path turn it into hundreds of volts, which is why protection must sit right at the connector.">
    <Plot curves={[{name:'Discharge current',color:orange,points:t.map(x=>[x,i(x)] as [number,number])}]} xRange={[0,200]} yRange={[0,26]} xLabel="TIME / ns" yLabel="CURRENT / A" description="Current rises within about 5 nanoseconds to about 23 amps and decays exponentially, falling below 3 amps by 100 nanoseconds."/>
  </Figure>;
}

export function ResetDropoutFigure(){
  // Supply: on until 400 ms, off (pulled to 0 V) 400–450 ms, on again. R = 100 kΩ, C = 1 µF, threshold 3.5 V of 5 V.
  const dt=2e-4,pts:[number,number][]=[],ptsD:[number,number][]=[];let v=0,vd=0;
  for(let k=0;k<=Math.round(.7/dt);k++){const t=k*dt,vs=t<.4||t>=.45?5:0;
    v+=dt*(vs-v)/(1e5*1e-6);vd+=dt*(vs-vd)/(1e5*1e-6);if(vs===0&&vd>.6)vd=Math.max(.6,vd-dt*(vd-.6)/1e-5);
    if(k%5===0){pts.push([t*1e3,v]);ptsD.push([t*1e3,vd]);}}
  return <Figure plot caption="The reset node through a 50 ms supply dropout at 400 ms (100 kΩ, 1 µF, reset threshold 3.5 V). Without the diode (orange) the capacitor decays only to about 3 V, so the reset input barely dips below threshold and the circuit restarts with almost no delay. With the diode (green) the node falls to one diode drop almost at once, and when power returns it climbs through the threshold a full 120 ms later: a clean reset.">
    <Plot curves={[{name:'Without diode',color:orange,points:pts},{name:'With discharge diode',color:green,points:ptsD},{name:'Reset threshold, 3.5 V',color:gray,dashed:true,points:[[0,3.5],[700,3.5]]}]} xRange={[0,700]} yRange={[0,5.5]} xLabel="TIME / ms" yLabel="TIMING-NODE VOLTAGE / V" description="Both curves charge to near 5 volts by 400 milliseconds. During the dropout the no-diode curve sags to about 3 volts and recovers; the diode curve drops to about 0.6 volts and then recharges, crossing 3.5 volts about 120 milliseconds after power returns."/>
  </Figure>;
}
