// Figures for the expanded power-electronics chapters (Part IV). Values are original teaching examples.
import * as S from './Schematic';
import Plot from './Plot';
import {Figure} from './Schematic';
const green='var(--accent)',orange='var(--orange)',ink='var(--ink)',muted='var(--muted)';
const lin=(fn:(x:number)=>number,lo:number,hi:number,n=401):[number,number][]=>Array.from({length:n},(_,i)=>{const x=lo+(hi-lo)*i/(n-1);return [x,fn(x)];});
const logpts=(fn:(x:number)=>number,lo:number,hi:number,n=301):[number,number][]=>Array.from({length:n},(_,i)=>{const x=lo*Math.pow(hi/lo,i/(n-1));return [x,fn(x)];});

/* ---------- Chapter 97: line supplies ---------- */
export function BridgeRectifierCircuit(){
  const cap='Full-wave bridge rectifier with reservoir capacitor. When the top secondary terminal is positive, current flows through the upper-right diode to the load and returns through the lower-left diode; on the other half-cycle the other pair conducts. Either way the load sees the same polarity, minus two diode drops.';
  const T:S.Pt=[250,60],B:S.Pt=[250,260],L:S.Pt=[150,160],R:S.Pt=[350,160];
  return <Figure caption={cap}><S.Schematic width={660} height={300} description={cap}>
    <S.Source a={[60,220]} b={[60,100]} kind="ac" label="12 V rms"/>
    <S.Wire pts={[[60,100],[60,60],T]}/><S.Wire pts={[[60,220],[60,260],B]}/>
    <S.Diode a={T} b={R} label="D₁"/><S.Diode a={B} b={R} label="D₂" flipLabel/>
    <S.Diode a={L} b={T} label="D₃"/><S.Diode a={L} b={B} label="D₄" flipLabel/>
    <S.Wire pts={[L,[150,215]]}/><S.Ground at={[150,215]}/>
    <S.Wire pts={[R,[460,160],[580,160]]}/>
    <S.Cap a={[460,160]} b={[460,260]} label="C" value="2200 µF" polar/>
    <S.Res a={[580,160]} b={[580,260]} label="load" value="1 A"/>
    <S.Wire pts={[[460,260],[580,260]]}/><S.Ground at={[460,260]}/>
    {([T,B,L,R,[460,160],[460,260]] as S.Pt[]).map((p,i)=><S.Dot key={i} at={p}/>)}
    <S.Terminal at={[580,160]} label="V_DC" side="above"/>
  </S.Schematic></Figure>;
}

export function RippleCurrentPlot(){
  const f=60,w=2*Math.PI*f,Vpk=12*Math.SQRT2-1.4,C=2200e-6,I=1,dt=5e-6;let v=Vpk,ipk=0,vmin=Vpk;
  const vo:[number,number][]=[],vr:[number,number][]=[],id:[number,number][]=[];
  for(let t=0;t<=0.025;t+=dt){const r=Math.abs((Vpk+1.4)*Math.sin(w*t))-1.4;let i=0;
    if(r>v){i=C*(r-v)/dt+I;v=r;}else v-=I*dt/C;
    if(t>0.009){ipk=Math.max(ipk,i);vmin=Math.min(vmin,v);}
    if(Math.round(t/dt)%4===0){vo.push([t*1000,v]);vr.push([t*1000,Math.max(0,r)]);id.push([t*1000,i]);}}
  return <Figure plot caption={`Output of the bridge rectifier above with 2200 µF and a 1 A load. Between peaks the capacitor alone supplies the load, so the voltage falls linearly by I/(2fC) = 3.8 V (simulated: ${(Vpk-vmin).toFixed(1)} V). The diodes conduct only near each peak, when the rectified sine exceeds the capacitor voltage, so the capacitor is recharged by short pulses of about ${ipk.toFixed(0)} A (orange): many times the 1 A average. Transformers, diodes and fuses must be rated for these pulses, whose rms value is far above the DC load current.`}><Plot curves={[{name:'Rectified secondary',color:muted,dashed:true,points:vr},{name:'Capacitor voltage',color:green,points:vo},{name:'Diode current / A',color:orange,points:id}]} xRange={[0,25]} yRange={[0,20]} xLabel="Time / ms" yLabel="Voltage / V, current / A" description="Sawtooth capacitor voltage with short recharging current pulses at each peak."/></Figure>;
}

/* ---------- Chapter 100: regulator ICs ---------- */
export function Lm317Circuit(){
  const cap='Adjustable three-terminal regulator. The IC holds 1.25 V between OUT and ADJ, so R₁ carries a fixed 5.2 mA; that current also flows through R₂ (plus the small adjust-pin current), setting V_out = 1.25 V × (1 + R₂/R₁). C_ADJ bypasses the reference for better ripple rejection; the diode discharges C_out if the input is shorted.';
  const box={x:250,y:85,w:120,h:60};
  return <Figure caption={cap}><S.Schematic width={680} height={300} description={cap}>
    <rect x={box.x} y={box.y} width={box.w} height={box.h} rx="3" fill="var(--paper)" stroke={ink} strokeWidth="1.8"/>
    <text x={box.x+box.w/2} y={box.y+28} textAnchor="middle" className="symbol-value">317</text>
    <text x={box.x+6} y={box.y+50} className="tick">IN</text><text x={box.x+box.w-6} y={box.y+50} textAnchor="end" className="tick">OUT</text><text x={box.x+box.w/2} y={box.y+box.h-6} textAnchor="middle" className="tick">ADJ</text>
    <S.Terminal at={[60,115]} label="V_in" side="left"/><S.Wire pts={[[60,115],[250,115]]}/>
    <S.Wire pts={[[370,115],[600,115]]}/><S.Terminal at={[600,115]} label="V_out" side="right"/>
    <S.Cap a={[150,115]} b={[150,260]} label="C_in" value="0.1 µF"/>
    <S.Res a={[470,115]} b={[470,180]} label="R₁" value="240 Ω"/>
    <S.Wire pts={[[310,145],[310,180],[470,180]]}/>
    <S.Res a={[470,180]} b={[470,260]} label="R₂" value="720 Ω"/>
    <S.Cap a={[390,180]} b={[390,260]} label="C_ADJ" value="10 µF"/>
    <S.Cap a={[560,115]} b={[560,260]} label="C_out" value="10 µF"/>
    <S.Wire pts={[[150,260],[390,260],[470,260],[560,260]]}/><S.Ground at={[300,260]}/>
    <S.Wire pts={[[250,115],[250,50]]}/><S.Wire pts={[[370,115],[370,50]]}/>
    <S.Diode a={[370,50]} b={[250,50]} label="D"/>
    {([[250,115],[370,115],[310,145],[150,115],[470,115],[560,115],[470,180],[390,180],[150,260],[300,260],[390,260],[470,260]] as S.Pt[]).map((p,i)=><S.Dot key={i} at={p}/>)}
  </S.Schematic></Figure>;
}

export function DropoutPlot(){
  const knee=(vin:number,vdo:number,vo=3.3)=>{const x=vin-vdo;return x<=0?Math.max(0,vin-vdo-0.05):vo-Math.log(1+Math.exp((vo-x)/0.06))*0.06;};
  return <Figure plot caption="Output against input for two 3.3 V regulators at full load. A 317-style regulator with an NPN Darlington pass element needs about 2 V of headroom; it stops regulating below about 5.3 V input. A PMOS low-dropout regulator needs about 0.25 V, so it keeps regulating down to about 3.55 V, which matters for a single lithium cell discharging from 4.2 V to 3.5 V."><Plot curves={[{name:'317-style, 2 V dropout',color:orange,points:lin(v=>knee(v,2),0,8)},{name:'LDO, 0.25 V dropout',color:green,points:lin(v=>knee(v,0.25),0,8)},{name:'Ideal 3.3 V',color:muted,dashed:true,points:[[0,3.3],[8,3.3]]}]} xRange={[0,8]} yRange={[0,4]} xLabel="Input voltage / V" yLabel="Output voltage / V" marks={[{at:[5.3,3.25],label:'5.3 V',pos:'se'},{at:[3.55,3.25],label:'3.55 V',pos:'se'}]} description="Two regulator transfer curves that track the input until they reach 3.3 volts."/></Figure>;
}

/* ---------- Chapter 101: thermal ---------- */
export function ThermalNetworkCircuit(){
  const cap='Steady-state thermal model as a circuit: power P (W) flows like current through thermal resistances (°C/W) from junction to case, case to sink and sink to ambient; temperatures behave like node voltages above the ambient source. T_J = T_A + P(θ_JC + θ_CS + θ_SA).';
  return <Figure caption={cap}><S.Schematic width={660} height={260} description={cap}>
    <S.CurrentSource a={[80,210]} b={[80,80]} label="P"/>
    <S.Res a={[80,80]} b={[240,80]} label="θ_JC"/><S.Res a={[240,80]} b={[400,80]} label="θ_CS"/><S.Res a={[400,80]} b={[560,80]} label="θ_SA"/>
    <S.Source a={[560,210]} b={[560,80]} kind="dc" label="T_A"/>
    <S.Wire pts={[[80,210],[560,210]]}/><S.Ground at={[320,210]}/>
    {([[80,80],[240,80],[400,80],[560,80],[320,210]] as S.Pt[]).map((p,i)=><S.Dot key={i} at={p}/>)}
    <S.Text x={80} y={64} kind="value" anchor="middle">T_J</S.Text><S.Text x={240} y={64} kind="value" anchor="middle">T_C</S.Text><S.Text x={400} y={64} kind="value" anchor="middle">T_S</S.Text>
  </S.Schematic></Figure>;
}

export function TransientThermalPlot(){
  const R=[0.1,0.3,0.6,1.0],tau=[1e-4,1e-3,1e-2,0.2];const z=(t:number)=>R.reduce((s,r,i)=>s+r*(1-Math.exp(-t/tau[i])),0);
  return <Figure plot caption={`Junction-to-case transient thermal impedance of a power package modelled by four RC stages (2 °C/W at steady state). A single 10 ms pulse sees only Z_th = ${z(0.01).toFixed(2)} °C/W, because the case and outer layers have not yet heated: 50 W for 10 ms raises the junction ${(50*z(0.01)).toFixed(0)} °C above the case, not the 100 °C a steady 50 W would. Repeated pulses add their tails, so pulsed ratings must use the datasheet's duty-cycle curves.`}><Plot curves={[{name:'Z_th(t)',color:green,points:logpts(z,1e-6,10)}]} xScale="log" yScale="log" xRange={[1e-6,10]} yRange={[0.001,3]} xLabel="Pulse duration / s" yLabel="Z_th / (°C/W)" marks={[{at:[0.01,z(0.01)],label:'10 ms',pos:'nw'}]} description="Thermal impedance rising with pulse duration toward a steady-state value."/></Figure>;
}

export function SoaPlot(){
  const Imax=10,P=100,Vsb=30,Vceo=100;
  const dc=(v:number)=>v>Vceo?NaN:Math.min(Imax,P/v,v>Vsb?(P/Vsb)*(Vsb/v)**2:Infinity);
  const pulse=(v:number)=>v>Vceo?NaN:Math.min(Imax*2,3*P/v,v>Vsb*1.5?(3*P/(Vsb*1.5))*((Vsb*1.5)/v)**1.6:Infinity);
  return <Figure plot caption="Safe operating area of a bipolar power transistor (log-log). Four limits bound the DC curve (green): maximum collector current, maximum power (a line of slope −1, I = P/V), second breakdown above about 30 V (steeper, because local hot spots form), and V_CEO. Short pulses (orange, 1 ms) allow more because the die does not reach thermal equilibrium. A linear regulator's pass transistor in a short-circuit sees full input voltage at its current limit: check that point against this curve, not only against the power rating."><Plot curves={[{name:'DC',color:green,points:logpts(dc,1,99.9,400)},{name:'1 ms pulse',color:orange,points:logpts(pulse,1,99.9,400)}]} xScale="log" yScale="log" xRange={[1,150]} yRange={[0.05,30]} xLabel="Collector–emitter voltage / V" yLabel="Collector current / A" marks={[{at:[30,P/30],label:'second breakdown',pos:'ne'}]} description="Safe operating area boundaries for DC and pulsed operation."/></Figure>;
}

/* ---------- Chapter 107: isolated and offline converters ---------- */
export function FlybackCircuit(){
  const P=S.fetPins({at:[186,210]});const cap='Flyback converter. While the switch is on, primary current ramps up and stores energy in the coupled inductor; the dots show the secondary is reverse-biased, so the diode blocks. When the switch turns off, the winding voltages reverse, the diode conducts and the stored energy flows to the output. An RCD clamp (not drawn) absorbs the leakage-inductance energy at turn-off.';
  return <Figure caption={cap}><S.Schematic width={640} height={300} description={cap}>
    <S.Source a={[70,270]} b={[70,60]} kind="dc" label="V_in"/>
    <S.Wire pts={[[70,60],[200,60]]}/><S.Ind a={[200,60]} b={P.d} label="N_p"/>
    <S.Fet at={[186,210]}/><S.Terminal at={P.g} label="gate" side="left"/>
    <S.Wire pts={[P.s,[200,270],[70,270]]}/><S.Ground at={[130,270]}/>
    <path d="M286 70 V160 M294 70 V160" stroke={ink} strokeWidth="1.6"/>
    <circle cx={214} cy={72} r="3.5" fill={ink}/><circle cx={366} cy={150} r="3.5" fill={ink}/>
    <S.Ind a={[380,170]} b={[380,60]} label="N_s" flipLabel/>
    <S.Diode a={[380,60]} b={[500,60]} label="D"/>
    <S.Cap a={[500,60]} b={[500,170]} label="C_o" polar/><S.Wire pts={[[500,60],[570,60]]}/><S.Res a={[570,60]} b={[570,170]} label="R_L"/>
    <S.Wire pts={[[380,170],[500,170],[570,170]]}/><S.Ground at={[500,170]}/>
    {([[500,60],[500,170],[130,270]] as S.Pt[]).map((p,i)=><S.Dot key={i} at={p}/>)}
    <S.Terminal at={[570,60]} label="V_out" side="above"/>
  </S.Schematic></Figure>;
}

export function FlybackWaveformsPlot(){
  const T=10,Ton=4,Tdem=3,Ip=0.4,n=8;
  const ip=(t:number)=>{const p=t%T;return p<Ton?10*Ip*p/Ton:0;};
  const is=(t:number)=>{const p=t%T;return p>=Ton&&p<Ton+Tdem?n*Ip*(1-(p-Ton)/Tdem):0;};
  const vd=(t:number)=>{const p=t%T;if(p<Ton)return 0;const q=p-Ton;if(q<Tdem)return (325+100+120*Math.exp(-q/0.08)*Math.cos(q*40))/100;return (325+100*Math.exp(-(q-Tdem)/2)*Math.cos((q-Tdem)*2.2))/100;};
  return <Figure plot caption="Discontinuous-mode flyback waveforms from a 325 V rectified line with turns ratio 8 and a 12.5 V output. Primary current (green, drawn ×10) ramps to 0.4 A during the 4 µs on-time; at turn-off the energy transfers and the secondary current (orange) starts at eight times that, 3.2 A, and ramps down to zero in 3 µs. The drain voltage (gray, in hundreds of volts) jumps to 325 V plus the 100 V reflected output, with a leakage spike at turn-off, and then rings around 325 V once the core is empty."><Plot curves={[{name:'Primary current × 10 / A',color:green,points:lin(ip,0,20,2000)},{name:'Secondary current / A',color:orange,points:lin(is,0,20,2000)},{name:'Drain voltage / 100 V',color:muted,points:lin(vd,0,20,4000)}]} xRange={[0,20]} yRange={[0,6]} xLabel="Time / µs" yLabel="Current / A, voltage / 100 V" description="Primary and secondary current ramps and drain voltage over two switching periods."/></Figure>;
}

export function PfcCurrentPlot(){
  const vin=(t:number)=>Math.sin(2*Math.PI*t);
  const cap=(t:number)=>{const s=Math.abs(vin(t));return s>0.92?Math.sign(vin(t))*4.5*(s-0.92)/0.08:0;};
  return <Figure plot caption="Line current drawn by an offline supply over one mains cycle. With a bare rectifier and reservoir capacitor (orange) current flows only near the voltage peaks, in pulses several times taller than the average: the power factor is about 0.6 and the current is rich in odd harmonics. A boost power-factor-correction stage (green) forces the input current to follow the voltage, giving a power factor near 0.99 for the same power."><Plot curves={[{name:'Line voltage (scaled)',color:muted,dashed:true,points:lin(vin,0,1,600)},{name:'Rectifier + capacitor',color:orange,points:lin(cap,0,1,2000)},{name:'With PFC',color:green,points:lin(t=>0.95*vin(t),0,1,600)}]} xRange={[0,1]} yRange={[-5,5]} xLabel="Time / line period" yLabel="Current (normalized)" description="Narrow current pulses at the voltage peaks compared with a sinusoidal current in phase with the voltage."/></Figure>;
}

/* ---------- Chapter 109: batteries and protection ---------- */
export function DischargeCurvePlot(){
  const liion=(x:number)=>4.15-0.55*x-0.25*Math.exp(-(1-x)*30)+0.1*Math.exp(-x*20)-0.0;
  const lfp=(x:number)=>3.3-0.1*x-0.6*Math.exp(-(1-x)*25)+0.2*Math.exp(-x*25);
  const nimh=(x:number)=>1.27-0.08*x-0.25*Math.exp(-(1-x)*25)+0.12*Math.exp(-x*20);
  const alk=(x:number)=>1.55-0.55*x-0.15*Math.exp(-(1-x)*15);
  return <Figure plot caption="Cell voltage against fraction of rated capacity delivered, at a moderate discharge rate (shapes are representative). Lithium-ion falls steadily from about 4.2 V to 3.0 V, so remaining charge can be estimated from voltage. LiFePO₄ and NiMH are nearly flat over most of their capacity, so voltage says little about charge and a coulomb counter is needed. Alkaline slopes continuously, so equipment that stops at 1.2 V per cell leaves much of its energy unused."><Plot curves={[{name:'Li-ion',color:green,points:lin(liion,0,0.995)},{name:'LiFePO₄',color:orange,points:lin(lfp,0,0.995)},{name:'NiMH',color:muted,points:lin(nimh,0,0.995)},{name:'Alkaline',color:ink,points:lin(alk,0,0.995)}]} xRange={[0,1]} yRange={[0.8,4.4]} xLabel="Fraction of capacity delivered" yLabel="Cell voltage / V" description="Four battery discharge curves with different slopes and plateaus."/></Figure>;
}

export function FoldbackPlot(){
  const cc=(i:number)=>i<1.5?5:NaN;
  return <Figure plot caption="Output characteristics of a 5 V supply with two kinds of current limit. Constant-current limiting (orange) holds 1.5 A all the way to a short, so the pass transistor dissipates the full input voltage times 1.5 A. Foldback limiting (green) reduces the allowed current as the output falls, to 0.4 A into a short, cutting dissipation by nearly four. The dashed line is a load that needs 0.6 A even at low voltage (a motor or a constant-current LED string): it intersects the foldback curve at a low-voltage operating point, so the supply latches there instead of starting."><Plot curves={[{name:'Constant-current limit',color:orange,points:[[0,5],[1.5,5],[1.5,0]]},{name:'Foldback limit',color:green,points:[[0,5],[1.5,5],[0.4,0]]},{name:'Resistive load 3.3 Ω',color:muted,dashed:true,points:[[0,0],[1.6,5.33]]},{name:'0.6 A constant-current load',color:ink,dashed:true,points:[[0.6,0],[0.6,5.5]]}]} xRange={[0,2]} yRange={[0,6]} xLabel="Output current / A" yLabel="Output voltage / V" marks={[{at:[0.6,0.91],label:'stuck at 0.9 V',pos:'ne'}]} description="Voltage-current characteristics of constant-current and foldback limiting with two load lines."/></Figure>;
}
