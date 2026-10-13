// Figures for the electromagnetics and RF chapters (Part V). Values and drawings are original teaching examples.
import * as S from './Schematic';
import Plot from './Plot';
import {Figure} from './Schematic';
import {svgMath} from './MathText';
const green='var(--accent)',orange='var(--orange)',ink='var(--ink)',muted='var(--muted)';
const logpts=(fn:(x:number)=>number,lo:number,hi:number,n=301):[number,number][]=>Array.from({length:n},(_,i)=>{const x=lo*Math.pow(hi/lo,i/(n-1));return [x,fn(x)];});
const linpts=(fn:(x:number)=>number,lo:number,hi:number,n=301):[number,number][]=>Array.from({length:n},(_,i)=>{const x=lo+(hi-lo)*i/(n-1);return [x,fn(x)];});

// Block-diagram helpers drawn as plain SVG (not schematic nets).
function Box({x,y,w,h,label,sub}:{x:number;y:number;w:number;h:number;label:string;sub?:string}){
  return <g><rect x={x} y={y} width={w} height={h} rx="3" fill="var(--paper)" stroke={green} strokeWidth="1.8"/><text x={x+w/2} y={y+h/2+(sub?-3:5)} textAnchor="middle" className="symbol-value">{svgMath(label)}</text>{sub&&<text x={x+w/2} y={y+h/2+15} textAnchor="middle" className="tick">{svgMath(sub)}</text>}</g>;
}
function Arrow({d}:{d:string}){return <path d={d} fill="none" stroke={ink} strokeWidth="1.8" markerEnd="url(#rf-arrow)"/>;}
const ArrowDef=()=><defs><marker id="rf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill={ink}/></marker></defs>;

/* ---------- Chapter 110: fields ---------- */
export function CoaxFieldFigure(){
  const cx=170,cy=130,a=28,b=92;
  const radials=Array.from({length:12},(_,i)=>i*Math.PI/6);
  return <Figure caption="Cross-section of a coaxial line carrying a TEM wave. Electric field lines (green) run radially from the inner conductor of radius a to the outer conductor of radius b; magnetic field lines (orange) circle the inner conductor. Both fall as 1/r, which is why C′ and L′ depend only on ln(b/a)."><svg viewBox="0 0 560 260" role="img" aria-label="Coaxial cross-section with radial electric field and circular magnetic field.">
    <ArrowDef/>
    <circle cx={cx} cy={cy} r={b+10} fill="none" stroke={ink} strokeWidth="1.8"/><circle cx={cx} cy={cy} r={b} fill="none" stroke={ink} strokeWidth="1.2"/>
    <circle cx={cx} cy={cy} r={a} fill="var(--mint)" stroke={ink} strokeWidth="1.8"/>
    {radials.map((t,i)=><path key={i} d={`M${cx+(a+4)*Math.cos(t)} ${cy+(a+4)*Math.sin(t)} L${cx+(b-6)*Math.cos(t)} ${cy+(b-6)*Math.sin(t)}`} stroke={green} strokeWidth="1.4" markerEnd="url(#rf-arrow)"/>)}
    {[45,65,82].map(r=><circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={orange} strokeWidth="1.3" strokeDasharray="5 4"/>)}
    <path d={`M${cx} ${cy} L${cx+a} ${cy}`} stroke={ink} strokeWidth="1"/><text x={cx+6} y={cy-6} className="tick">a</text>
    <path d={`M${cx} ${cy} L${cx} ${cy+b}`} stroke={ink} strokeWidth="1"/><text x={cx+6} y={cy+60} className="tick">b</text>
    <text x={330} y={70} className="symbol-value">E ∝ 1/r  (Gauss)</text>
    <text x={330} y={100} className="symbol-value" fill={orange}>H ∝ 1/r  (Ampère)</text>
    <text x={330} y={140} className="tick">C′ = 2πε / ln(b/a)</text>
    <text x={330} y={162} className="tick">L′ = (μ/2π) ln(b/a)</text>
    <text x={330} y={184} className="tick">Z₀ = (60 Ω/√εᵣ) ln(b/a)</text>
  </svg></Figure>;
}

export function SkinDepthPlot(){
  const rho=1.72e-8,mu=4e-7*Math.PI,d=(f:number)=>Math.sqrt(2*rho/(2*Math.PI*f*mu))*1e6;
  return <Figure plot caption="Skin depth in copper, δ = √(2ρ/ωμ). It falls as 1/√f: about 8.5 mm at 60 Hz, 66 µm at 1 MHz and 2.1 µm at 1 GHz. Above the frequency where δ is comparable to the conductor's thickness, resistance rises as √f."><Plot curves={[{name:'Copper skin depth',color:green,points:logpts(d,10,1e10)}]} xScale="log" yScale="log" xRange={[10,1e10]} yRange={[0.5,3e4]} xLabel="Frequency / Hz" yLabel="Skin depth / µm" marks={[{at:[60,d(60)],label:'60 Hz',pos:'ne'},{at:[1e6,d(1e6)],label:'1 MHz',pos:'ne'},{at:[1e9,d(1e9)],label:'1 GHz',pos:'sw'}]} description="Skin depth of copper versus frequency on log-log axes, a straight line of slope minus one half."/></Figure>;
}

/* ---------- Chapter 112: RF passives and the Smith chart ---------- */
export function RealComponentPlot(){
  const w=(f:number)=>2*Math.PI*f;
  const zc=(f:number)=>{const C=100e-9,L=1e-9,R=0.02;const x=w(f)*L-1/(w(f)*C);return Math.hypot(R,x);};
  const zl=(f:number)=>{const L=1e-6,Cp=1e-12,R=0.5;const re=R,im=w(f)*L;const den=(1-w(f)**2*L*Cp)**2+(w(f)*R*Cp)**2;return Math.hypot(re,im)/Math.sqrt(den);};
  return <Figure plot caption="Impedance magnitude of a 100 nF capacitor with 1 nH of ESL and 20 mΩ ESR (green), and a 1 µH inductor with 1 pF of winding capacitance (orange). The capacitor is inductive above its 15.9 MHz series resonance; the inductor is capacitive above its 159 MHz parallel resonance."><Plot curves={[{name:'100 nF capacitor',color:green,points:logpts(zc,1e5,1e10,500)},{name:'1 µH inductor',color:orange,points:logpts(zl,1e5,1e10,800)}]} xScale="log" yScale="log" xRange={[1e5,1e10]} yRange={[1e-2,1e5]} xLabel="Frequency / Hz" yLabel="|Z| / Ω" marks={[{at:[15.9e6,0.02],label:'series resonance',pos:'se'},{at:[159e6,6e4],label:'self-resonance',pos:'nw'}]} description="Log-log impedance of a real capacitor and a real inductor showing self-resonances."/></Figure>;
}

export function SmithChartFigure(){
  const cx=200,cy=200,R=160,X=(u:number)=>cx+R*u,Y=(v:number)=>cy-R*v;
  const rs=[0.2,0.5,1,2,5],xs=[0.2,0.5,1,2,5];
  const arcPath=(r0:number,a0:number,a1:number,c:[number,number],n=60)=>Array.from({length:n+1},(_,i)=>{const t=a0+(a1-a0)*i/n;return `${i?'L':'M'}${X(c[0]+r0*Math.cos(t))} ${Y(c[1]+r0*Math.sin(t))}`;}).join(' ');
  const gl=1/3;
  return <Figure caption="Smith chart: every passive impedance z = Z/Z₀ maps to a reflection coefficient Γ = (z − 1)/(z + 1) inside the unit circle. Circles of constant resistance (green) and arcs of constant reactance (gray) are the images of the grid lines of the z-plane. Moving along a lossless line rotates Γ about the center: a quarter wavelength (orange) carries z = 2 to z = 0.5."><svg viewBox="0 0 560 400" role="img" aria-label="Smith chart with constant resistance circles, reactance arcs, and a quarter-wave rotation from z equals 2 to z equals 0.5.">
    <ArrowDef/>
    <defs><clipPath id="smith-clip"><circle cx={cx} cy={cy} r={R}/></clipPath></defs>
    <circle cx={cx} cy={cy} r={R} fill="var(--paper)" stroke={ink} strokeWidth="1.8"/>
    <g clipPath="url(#smith-clip)">
      {rs.map(r=><circle key={'r'+r} cx={X(r/(1+r))} cy={cy} r={R/(1+r)} fill="none" stroke={green} strokeWidth="1"/>)}
      {xs.flatMap(x=>[x,-x]).map(x=><circle key={'x'+x} cx={X(1)} cy={Y(1/x)} r={R/Math.abs(x)} fill="none" stroke={muted} strokeWidth="0.9"/>)}
    </g>
    <path d={`M${X(-1)} ${cy} L${X(1)} ${cy}`} stroke={ink} strokeWidth="1"/>
    {rs.map(r=><text key={'t'+r} x={X((r-1)/(r+1))-3} y={cy+14} textAnchor="end" className="tick">{r}</text>)}
    <text x={X(-1)-8} y={cy+4} textAnchor="end" className="tick">short</text><text x={X(1)+8} y={cy+4} className="tick">open</text>
    <text x={X(0)} y={Y(1)-10} textAnchor="middle" className="tick">+j (inductive)</text><text x={X(0)} y={Y(-1)+20} textAnchor="middle" className="tick">−j (capacitive)</text>
    <path d={arcPath(gl,0,-Math.PI,[0,0])} fill="none" stroke={orange} strokeWidth="2.4" markerEnd="url(#rf-arrow)"/>
    <circle cx={X(gl)} cy={cy} r="5" fill={orange}/><circle cx={X(-gl)} cy={cy} r="5" fill={orange}/>
    <text x={X(gl)+4} y={cy-10} className="tick">z = 2</text><text x={X(-gl)-4} y={cy-10} textAnchor="end" className="tick">z = 0.5</text>
    <text x={390} y={40} className="symbol-value">Γ = (z − 1)/(z + 1)</text>
    <text x={390} y={70} className="tick">constant r: centre r/(1+r),</text><text x={390} y={88} className="tick">radius 1/(1+r)</text>
    <text x={390} y={116} className="tick">constant x: centre (1, 1/x),</text><text x={390} y={134} className="tick">radius 1/|x|</text>
    <text x={390} y={268} className="tick">{svgMath('toward generator: Γ(d) = Γ_L e^(−j2βd)')}</text>
    <text x={390} y={286} className="tick">clockwise, one turn per λ/2</text>
  </svg></Figure>;
}

export function LineImpedancePlot(){
  const Z0=50,ZL=100;
  const zin=(l:number)=>{const t=Math.tan(2*Math.PI*l);const re=Z0*(ZL*Z0*(1+t*t))/(Z0*Z0+ZL*ZL*t*t);const im=Z0*(Z0*Z0*t-ZL*ZL*t)/(Z0*Z0+ZL*ZL*t*t);return [re,im];};
  return <Figure plot caption="Input impedance of a lossless 50 Ω line terminated in 100 Ω, versus line length in wavelengths. The resistance swings between Z_L = 100 Ω and Z₀²/Z_L = 25 Ω every quarter wavelength; the reactance is zero only at those two points."><Plot curves={[{name:'R_in',color:green,points:linpts(l=>zin(l)[0],0,1,400)},{name:'X_in',color:orange,points:linpts(l=>zin(l)[1],0,1,400)}]} xRange={[0,1]} yRange={[-45,105]} xLabel="Line length / wavelengths" yLabel="Input impedance / Ω" marks={[{at:[0.25,25],label:'λ/4: 25 Ω',pos:'se'},{at:[0.5,100],label:'λ/2: 100 Ω',pos:'ne'}]} description="Real and imaginary input impedance oscillating with period one half wavelength."/></Figure>;
}

/* ---------- Chapter 116: oscillators and PLLs ---------- */
export function NegativeResistanceTank(){
  const cap='A parallel LC tank with loss conductance G = 1/R_p, and an active circuit modelled as a negative conductance −G_m. If G_m exceeds G the net conductance is negative and any disturbance at the tank frequency grows; amplitude limiting in the active circuit then reduces the average G_m until it equals G.';
  return <Figure caption={cap}><S.Schematic width={640} height={240} description={cap}>
    <S.Wire pts={[[100,60],[520,60]]}/><S.Wire pts={[[100,190],[520,190]]}/>
    <S.Ind a={[100,60]} b={[100,190]} label="L"/>
    <S.Cap a={[240,60]} b={[240,190]} label="C"/>
    <S.Res a={[380,60]} b={[380,190]} label="R_p"/>
    <S.DepSource a={[520,190]} b={[520,60]} label="G_m v" kind="current"/>
    {([[240,60],[380,60],[240,190],[380,190]] as S.Pt[]).map((p,i)=><S.Dot key={i} at={p}/>)}
    <S.Ground at={[310,190]}/><S.Dot at={[310,190]}/>
    <S.Text x={240} y={36} kind="value" anchor="middle">tank</S.Text>
    <S.Text x={520} y={36} kind="value" anchor="middle">active circuit</S.Text>
  </S.Schematic></Figure>;
}

export function OscillatorStartupPlot(){
  // van der Pol oscillator in normalized time: v'' - eps(1 - v^2/A^2) v' + v = 0, integrated with RK4.
  const eps=0.12,A=1,T=160,dt=0.02;const pts:[number,number][]=[];let v=0.02,w=0;
  const f=(v:number,w:number)=>[w,eps*(1-v*v/(A*A))*w-v];
  for(let t=0;t<=T;t+=dt){if(Math.round(t/dt)%5===0)pts.push([t/(2*Math.PI),v]);const k1=f(v,w),k2=f(v+dt*k1[0]/2,w+dt*k1[1]/2),k3=f(v+dt*k2[0]/2,w+dt*k2[1]/2),k4=f(v+dt*k3[0],w+dt*k3[1]);v+=dt*(k1[0]+2*k2[0]+2*k3[0]+k4[0])/6;w+=dt*(k1[1]+2*k2[1]+2*k3[1]+k4[1])/6;}
  const env=(c:number)=>Math.min(2,0.02*Math.exp(eps*c*2*Math.PI/2));
  return <Figure plot caption="Oscillator start-up with a small excess of negative conductance. The envelope first grows exponentially at rate (G_m − G)/2C (dashed), then saturates as limiting reduces the effective G_m, settling at an amplitude set by the nonlinearity rather than by the linear loop gain."><Plot curves={[{name:'Tank voltage',color:green,points:pts},{name:'Linear growth envelope',color:orange,dashed:true,points:linpts(env,0,13,200)}]} xRange={[0,25]} yRange={[-2.4,2.4]} xLabel="Time / oscillation periods" yLabel="Tank voltage (normalized)" description="Growing sinusoid that saturates at a steady amplitude near two."/></Figure>;
}

export function PhaseNoisePlot(){
  const f0=1e9,Q=20,F=10,P=1e-3,k=1.38e-23,T=290,fc=50e3;
  const L=(df:number)=>10*Math.log10((2*F*k*T/P)*(1+(f0/(2*Q*df))**2)*(1+fc/df));
  return <Figure plot caption="Leeson's model for a 1 GHz oscillator with loaded Q of 20, 1 mW in the tank, a 10 dB effective noise factor and a 50 kHz flicker corner. Close to the carrier, noise rises at 30 dB per decade (flicker upconverted through the tank); in the middle region at 20 dB per decade; far out it flattens at the thermal floor 2FkT/P."><Plot curves={[{name:'Single-sideband phase noise',color:green,points:logpts(L,100,1e8,400)}]} xScale="log" xRange={[100,1e8]} yRange={[-170,-20]} xLabel="Offset from carrier / Hz" yLabel="L(Δf) / dBc/Hz" marks={[{at:[fc,L(fc)],label:'flicker corner',pos:'ne'},{at:[f0/(2*Q),L(f0/(2*Q))],label:'f₀/2Q',pos:'ne'}]} description="Phase noise falling at 30 then 20 decibels per decade before flattening."/></Figure>;
}

export function PllBlockFigure(){
  return <Figure caption="Charge-pump PLL. The phase-frequency detector compares the reference with the divided VCO output; the charge pump converts phase error to current; the loop filter turns current into the VCO control voltage. In lock, f_out = N f_ref."><svg viewBox="0 0 640 220" role="img" aria-label="PLL block diagram with phase detector, charge pump, loop filter, VCO and divide-by-N feedback.">
    <ArrowDef/>
    <text x={20} y={64} className="tick">{svgMath('f_ref')}</text><Arrow d="M20 72 H62"/>
    <Box x={64} y={42} w={130} h={58} label="PFD + CP" sub="K_d = I_cp/2π"/>
    <Arrow d="M194 71 H236"/><Box x={238} y={42} w={130} h={58} label="Loop filter" sub="Z(s)"/>
    <Arrow d="M368 71 H410"/><Box x={412} y={42} w={120} h={58} label="VCO" sub="K_v / s"/>
    <Arrow d="M532 71 H612"/><text x={575} y={62} className="tick">{svgMath('f_out')}</text>
    <path d="M580 71 V170 H352" fill="none" stroke={ink} strokeWidth="1.8"/><Arrow d="M352 170 H330"/>
    <Box x={238} y={145} w={92} h={50} label="÷ N"/>
    <path d="M238 170 H129" fill="none" stroke={ink} strokeWidth="1.8"/><Arrow d="M129 170 V102"/>
    <circle cx={580} cy={71} r="3.3" fill={ink}/>
  </svg></Figure>;
}

export function PllStepPlot(){
  const step=(t:number,z:number)=>{ // type-II PLL with stabilizing zero: H = (2zws+w²)/(s²+2zws+w²), w=1
    if(z<1){const wd=Math.sqrt(1-z*z);return 1-Math.exp(-z*t)*(Math.cos(wd*t)-(z/wd)*Math.sin(wd*t));}
    if(z===1)return 1-Math.exp(-t)*(1-t);
    const r=Math.sqrt(z*z-1),s1=-z+r,s2=-z-r;const A=(2*z*s1+1)/(s1*(s1-s2)),B=(2*z*s2+1)/(s2*(s2-s1));return 1+A*Math.exp(s1*t)+B*Math.exp(s2*t);};
  return <Figure plot caption="Output phase after a reference phase step for a type-II PLL, H(s) = (2ζω_n s + ω_n²)/(s² + 2ζω_n s + ω_n²). The stabilizing zero makes every response overshoot; ζ ≈ 0.7 is a common compromise between settling time and peaking."><Plot curves={[{name:'ζ = 0.5',color:orange,points:linpts(t=>step(t,0.5),0,12)},{name:'ζ = 0.707',color:green,points:linpts(t=>step(t,0.707),0,12)},{name:'ζ = 1.5',color:muted,points:linpts(t=>step(t,1.5),0,12)}]} xRange={[0,12]} yRange={[0,1.5]} xLabel="Normalized time ω_n t" yLabel="Output phase / input step" description="Three step responses with different damping settling to one."/></Figure>;
}

/* ---------- Chapter 119: antennas ---------- */
export function DipolePatternFigure(){
  const cx=150,cy=150,R=110;
  const poly=(g:(t:number)=>number)=>Array.from({length:361},(_,i)=>{const t=i*Math.PI/180;const r=g(t);return `${i?'L':'M'}${cx+R*r*Math.sin(t)} ${cy-R*r*Math.cos(t)}`;}).join(' ')+'Z';
  const hertz=(t:number)=>Math.sin(t)**2,half=(t:number)=>{const s=Math.sin(t);return Math.abs(s)<1e-6?0:(Math.cos(Math.PI/2*Math.cos(t))/s)**2;};
  return <Figure caption="Elevation power patterns in a plane containing the antenna axis (vertical). A short (Hertzian) dipole radiates as sin²θ (gray, directivity 1.5); a half-wave dipole is slightly more directive (green, directivity 1.64 or 2.15 dBi). Neither radiates along its own axis."><svg viewBox="0 0 560 300" role="img" aria-label="Polar radiation patterns of a short dipole and a half-wave dipole.">
    {[0.25,0.5,0.75,1].map(r=><circle key={r} cx={cx} cy={cy} r={R*r} fill="none" stroke="var(--line)"/>)}
    <path d={`M${cx-R-10} ${cy} H${cx+R+10} M${cx} ${cy-R-10} V${cy+R+10}`} stroke="var(--line)"/>
    <path d={poly(hertz)} fill="none" stroke={muted} strokeWidth="1.6" strokeDasharray="5 4"/>
    <path d={poly(half)} fill="var(--mint)" fillOpacity="0.5" stroke={green} strokeWidth="2"/>
    <path d={`M${cx} ${cy-28} V${cy+28}`} stroke={ink} strokeWidth="4"/>
    <text x={cx+8} y={cy-R-14} className="tick">θ = 0 (axis)</text><text x={cx+R-4} y={cy+20} className="tick">θ = 90°</text>
    <text x={340} y={90} className="symbol-value">short dipole: sin²θ</text>
    <text x={340} y={118} className="tick">{svgMath('R_rad = 80π²(ℓ_eff/λ)² Ω')}</text>
    <text x={340} y={140} className="tick">wire dipole: ℓ_eff = ℓ/2</text>
    <text x={340} y={158} className="symbol-value" fill={green}>half-wave dipole</text>
    <text x={340} y={186} className="tick">[cos(½π cos θ)/sin θ]²</text>
    <text x={340} y={208} className="tick">{svgMath('R_rad ≈ 73 Ω, D = 1.64')}</text>
  </svg></Figure>;
}

export function FriisLinkPlot(){
  const f=2.44e9,lam=3e8/f,Pt=0,G=2;const Pr=(d:number)=>Pt+2*G+20*Math.log10(lam/(4*Math.PI*d));
  return <Figure plot caption="Free-space received power for a 2.44 GHz link: 0 dBm transmitter, two 2 dBi antennas. Power falls 20 dB per decade of distance. Against a −95 dBm receiver sensitivity the free-space range is about 870 m; a 20 dB fade margin for walls and multipath cuts it tenfold, to about 87 m."><Plot curves={[{name:'Received power',color:green,points:logpts(Pr,1,1e4)},{name:'Sensitivity −95 dBm',color:orange,dashed:true,points:[[1,-95],[1e4,-95]]},{name:'With 20 dB margin',color:muted,dashed:true,points:[[1,-75],[1e4,-75]]}]} xScale="log" xRange={[1,1e4]} yRange={[-120,-20]} xLabel="Distance / m" yLabel="Received power / dBm" description="Received power versus distance on a log axis, a straight line falling twenty decibels per decade."/></Figure>;
}

export function BoardEmissionPlot(){
  const loop=(f:number)=>20*Math.log10(1.316e-14*(f*1e6)**2*1e-4*0.02/10*1e6);
  const cm=(f:number)=>20*Math.log10(1.257e-6*(f*1e6)*.15*20e-6/10*1e6);
  return <Figure plot caption="Peak far-field estimates at 10 m: a 1 cm² loop carrying 20 mA peak and a 15 cm uniform-current conductor carrying 20 µA peak. The conductor estimate assumes an in-phase image reflection. Over 30–100 MHz the conductor remains electrically short; the observer is at least one wavelength away. The loop rises 40 dB per decade, the conductor 20 dB per decade, crossing near 72 MHz. These geometry-dependent estimates do not predict compliance."><Plot curves={[{name:'Differential loop, 20 mA',color:green,points:logpts(loop,30,100)},{name:'Short conductor, 20 µA',color:orange,points:logpts(cm,30,100)}]} xScale="log" xRange={[30,100]} yRange={[0,35]} xLabel="Frequency / MHz" yLabel="Peak E at 10 m / dBµV/m" description="Two short-antenna estimates crossing near seventy-two megahertz within their stated model range."/></Figure>;
}

/* ---------- Chapter 114: RF amplifiers ---------- */
export function LnaCircuit(){
  const P=S.fetPins({at:[360,160]});const cap='Inductively degenerated common-source LNA. The source inductor L_s, through the transistor’s transconductance, creates a real input resistance g_mL_s/C_gs without a noisy resistor; the gate inductor L_g resonates the remaining input capacitance at the operating frequency. A tuned drain load L_d supplies gain at the same frequency.';
  return <Figure caption={cap}><S.Schematic width={620} height={300} description={cap}>
    <S.Terminal at={[90,160]} label="50 Ω in" side="left"/><S.Ind a={[90,160]} b={P.g} label="L_g"/>
    <S.Fet at={[360,160]}/>
    <S.Ind a={P.s} b={[P.s[0],270]} label="L_s"/><S.Ground at={[P.s[0],270]}/>
    <S.Ind a={P.d} b={[P.d[0],40]} label="L_d"/><S.Rail at={[P.d[0],40]} label="V_DD"/>
    <S.Wire pts={[P.d,[520,P.d[1]]]}/><S.Terminal at={[520,P.d[1]]} label="out" side="right"/><S.Dot at={P.d}/>
    <S.Text x={240} y={215} kind="value">C_gs (internal)</S.Text>
  </S.Schematic></Figure>;
}

export function CompressionPlot(){
  const G=15,Psat=18,IIP3=12,psat=10**(Psat/10);
  const out=(pin:number)=>{const pl=10**((pin+G)/10);return 10*Math.log10(psat*Math.tanh(pl/psat));};
  let p1=-40;for(let p=-40;p<20;p+=0.01){if(p+G-out(p)>=1){p1=p;break;}}
  return <Figure plot caption={`An amplifier with 15 dB gain and an 18 dBm saturated output. The fundamental (green) follows a slope of 1 until it compresses: the 1 dB compression point is at an input of about ${p1.toFixed(1)} dBm. Third-order intermodulation products (orange) rise with slope 3; extrapolated, they meet the extrapolated fundamental at the third-order intercept, IIP3 = +12 dBm, OIP3 = +27 dBm, roughly 9.6 dB above the compression point as the cubic model predicts. Neither intercept is an operating point.`}><Plot curves={[{name:'Fundamental output',color:green,points:linpts(out,-40,20,400)},{name:'Linear extrapolation',color:muted,dashed:true,points:[[-40,-40+G],[IIP3+2,IIP3+2+G]]},{name:'IM3 output (two-tone)',color:orange,points:linpts(p=>3*p+G-2*IIP3,-30,p1,200)},{name:'IM3 extrapolation',color:orange,dashed:true,points:[[p1,3*p1+G-2*IIP3],[IIP3+1,3*(IIP3+1)+G-2*IIP3]]}]} xRange={[-40,15]} yRange={[-60,32]} xLabel="Input power per tone / dBm" yLabel="Output power / dBm" marks={[{at:[p1,out(p1)],label:'P1dB',pos:'nw'},{at:[IIP3,IIP3+G],label:'IP3',pos:'nw'}]} description="Fundamental and third-order intermodulation output power versus input power with compression and intercept points."/></Figure>;
}

export function NoiseMatchPlot(){
  const k=1.38e-23,T=290,en=1e-9,inn=2e-12;const nf=(R:number)=>10*Math.log10(1+(en*en+inn*inn*R*R)/(4*k*T*R));
  return <Figure plot caption="Noise figure of an amplifier with e_n = 1 nV/√Hz and i_n = 2 pA/√Hz as a function of source resistance. Voltage noise dominates for low source resistance and current noise for high; the minimum, about 1 dB, occurs at R_opt = e_n/i_n = 500 Ω. A matching network that presents 500 Ω to the transistor from a 50 Ω antenna achieves that minimum, which is a different impedance from the one that maximizes gain."><Plot curves={[{name:'Noise figure',color:green,points:logpts(nf,5,50000)}]} xScale="log" xRange={[5,50000]} yRange={[0,10]} xLabel="Source resistance / Ω" yLabel="Noise figure / dB" marks={[{at:[500,nf(500)],label:'R_opt = 500 Ω',pos:'ne'},{at:[50,nf(50)],label:'50 Ω direct',pos:'ne'}]} description="U-shaped noise figure curve versus source resistance with a minimum at five hundred ohms."/></Figure>;
}

/* ---------- Chapter 115: RF filters ---------- */
export function LcLadderCircuit(){
  const cap='Third-order Butterworth low-pass ladder for 100 MHz between 50 Ω terminations, scaled from the prototype values g₁ = 1, g₂ = 2, g₃ = 1: C₁ = C₃ = g/(2πf_cR) = 31.8 pF and L₂ = gR/(2πf_c) = 159 nH.';
  return <Figure caption={cap}><S.Schematic width={640} height={240} description={cap}>
    <S.Source a={[60,190]} b={[60,70]} kind="ac" label="V_s"/><S.Res a={[60,70]} b={[200,70]} label="R_s" value="50 Ω"/>
    <S.Cap a={[200,70]} b={[200,190]} label="C₁" value="31.8 pF"/>
    <S.Ind a={[200,70]} b={[420,70]} label="L₂" value="159 nH"/>
    <S.Cap a={[420,70]} b={[420,190]} label="C₃" value="31.8 pF"/>
    <S.Wire pts={[[420,70],[560,70]]}/><S.Res a={[560,70]} b={[560,190]} label="R_L" value="50 Ω"/>
    <S.Wire pts={[[60,190],[200,190],[420,190],[560,190]]}/><S.Ground at={[310,190]}/>
    {([[200,70],[420,70],[200,190],[420,190],[310,190]] as S.Pt[]).map((p,i)=><S.Dot key={i} at={p}/>)}
  </S.Schematic></Figure>;
}

export function FilterResponsePlot(){
  const bw=(x:number)=>-10*Math.log10(1+x**6);
  const eps2=10**(0.05)-1;const T3=(x:number)=>x<=1?4*x**3-3*x:Math.cosh(3*Math.acosh(x));
  const ch=(x:number)=>-10*Math.log10(1+eps2*T3(x)**2);
  return <Figure plot caption="Magnitude responses of third-order low-pass filters normalized to the cutoff frequency. Butterworth (green) is maximally flat and −3 dB at the cutoff. Chebyshev with 0.5 dB ripple (orange, cutoff defined at the ripple edge) ripples in the passband but falls faster beyond it: at twice the cutoff it gives 19.2 dB against 18.1 dB. The advantage grows with order: for fifth-order filters it is 42 dB against 30 dB."><Plot curves={[{name:'Butterworth',color:green,points:linpts(bw,0.01,4,500)},{name:'Chebyshev 0.5 dB',color:orange,points:linpts(ch,0.01,4,500)}]} xRange={[0,4]} yRange={[-50,2]} xLabel="Frequency / cutoff" yLabel="Response / dB" marks={[{at:[2,bw(2)],label:'−18.1 dB',pos:'ne'},{at:[2,ch(2)],label:'−19.2 dB',pos:'sw'}]} description="Two third-order low-pass responses, one maximally flat and one rippled with a steeper rolloff."/></Figure>;
}

export function InsertionLossPlot(){
  const il=(fbw:number,Qu:number)=>4.343*4/(fbw*Qu); // three-section Butterworth: sum g = 4
  return <Figure plot caption="Midband insertion loss of a three-resonator Butterworth band-pass filter, IL ≈ 4.34 Σg_k/(FBW·Q_u) dB with Σg = 4, against fractional bandwidth. Narrow filters need high-Q resonators: a 1% bandwidth costs 35 dB with Q_u = 50 inductors, 8.7 dB with Q_u = 200, and only 0.17 dB with Q_u = 10 000 (ceramic or cavity resonators)."><Plot curves={[{name:'Q_u = 50',color:orange,points:logpts(f=>il(f,50),0.005,0.5)},{name:'Q_u = 200',color:green,points:logpts(f=>il(f,200),0.005,0.5)},{name:'Q_u = 10 000',color:muted,points:logpts(f=>il(f,10000),0.005,0.5)}]} xScale="log" yScale="log" xRange={[0.005,0.5]} yRange={[0.01,100]} xLabel="Fractional bandwidth" yLabel="Insertion loss / dB" description="Insertion loss falling inversely with fractional bandwidth for three resonator Q values."/></Figure>;
}

/* ---------- Chapter 117: modulation ---------- */
export function ModulationWaveformsPlot(){
  const fc=10,m=(t:number)=>Math.sin(2*Math.PI*t),bits=[1,0,0,1];
  const am=(t:number)=>4+(1+0.6*m(t))*Math.cos(2*Math.PI*fc*t);
  const fm=(t:number)=>Math.cos(2*Math.PI*fc*t+5*Math.sin(2*Math.PI*t)); // β = 5: deviation half the carrier frequency, for visibility
  const psk=(t:number)=>-4+(bits[Math.min(3,Math.floor(t*4))]?1:-1)*Math.cos(2*Math.PI*fc*t);
  return <Figure plot caption="The same carrier modulated three ways (offset vertically). AM (top) varies the envelope with the message; FM (middle) keeps the amplitude constant and varies the instantaneous frequency, crowding cycles where the message is positive; BPSK (bottom) flips the carrier's phase by 180° to send bits 1, 0, 0, 1."><Plot curves={[{name:'AM, m = 0.6',color:green,points:linpts(am,0,1,2000)},{name:'FM',color:orange,points:linpts(fm,0,1,2000)},{name:'BPSK',color:muted,points:linpts(psk,0,1,2000)}]} xRange={[0,1]} yRange={[-5.5,6]} xLabel="Time / message period" yLabel="Signal (offset)" description="Amplitude, frequency and phase modulated waveforms."/></Figure>;
}

export function IqModulatorFigure(){
  return <Figure caption="I/Q (quadrature) modulator. Two baseband signals multiply a cosine and a negative sine of the same carrier, and their sum is s(t) = I(t)cos ωt − Q(t)sin ωt = A(t)cos(ωt + φ(t)) with A = √(I² + Q²) and φ = atan2(Q, I). Any amplitude and phase modulation can therefore be built from two real baseband signals; the demodulator reverses the process."><svg viewBox="0 0 680 240" role="img" aria-label="I/Q modulator with two mixers, a 90 degree phase shift and a summing node.">
    <ArrowDef/>
    <text x={20} y={64} className="symbol-value">I(t)</text><Arrow d="M50 60 H180"/>
    <text x={20} y={184} className="symbol-value">Q(t)</text><Arrow d="M50 180 H180"/>
    <circle cx={200} cy={60} r="18" fill="var(--paper)" stroke={ink} strokeWidth="1.8"/><text x={200} y={65} textAnchor="middle" className="symbol-value">×</text>
    <circle cx={200} cy={180} r="18" fill="var(--paper)" stroke={ink} strokeWidth="1.8"/><text x={200} y={185} textAnchor="middle" className="symbol-value">×</text>
    <Box x={150} y={100} w={100} h={40} label="0° / −90°"/>
    <Arrow d="M200 100 V80"/><Arrow d="M200 140 V160"/>
    <path d="M330 120 H250" fill="none" stroke={ink} strokeWidth="1.8"/><text x={300} y={112} className="tick">cos ωt (LO)</text>
    <Arrow d="M218 60 H380 V102"/><Arrow d="M218 180 H380 V138"/>
    <circle cx={380} cy={120} r="18" fill="var(--paper)" stroke={ink} strokeWidth="1.8"/><text x={380} y={125} textAnchor="middle" className="symbol-value">Σ</text>
    <Arrow d="M398 120 H520"/><text x={530} y={116} className="symbol-value">s(t)</text>
    <text x={240} y={50} className="tick">I cos ωt</text><text x={240} y={202} className="tick">−Q sin ωt</text>
  </svg></Figure>;
}

export function ConstellationFigure(){
  const panel=(cx:number,title:string,pts:[number,number][],sc:number)=><g>
    <path d={`M${cx-110} 130 H${cx+110} M${cx} 20 V240`} stroke="var(--line)"/>
    {pts.map((p,i)=><circle key={i} cx={cx+p[0]*sc} cy={130-p[1]*sc} r="5" fill={green}/>)}
    <text x={cx} y={14} textAnchor="middle" className="symbol-value">{title}</text>
    <text x={cx+104} y={124} className="tick">I</text><text x={cx+6} y={30} className="tick">Q</text></g>;
  const qpsk:[number,number][]=[[1,1],[-1,1],[-1,-1],[1,-1]];const qam:[number,number][]=[];for(const a of [-3,-1,1,3])for(const b of [-3,-1,1,3])qam.push([a,b]);
  return <Figure caption="Constellations: each symbol is a point (I, Q). QPSK carries 2 bits per symbol on four points of equal amplitude; 16-QAM carries 4 bits on a 4 × 4 grid. With the same average power, 16-QAM's points are closer together, so less noise moves a received point across a decision boundary (the axes and midlines): more bits per hertz costs signal-to-noise ratio."><svg viewBox="0 0 680 260" role="img" aria-label="QPSK and 16-QAM constellation diagrams.">
    {panel(170,'QPSK (2 bits/symbol)',qpsk,60)}
    {panel(510,'16-QAM (4 bits/symbol)',qam,26)}
    {[-2,0,2].map(v=><g key={v}><path d={`M${510+v*26} 30 V230 M${400} ${130-v*26} H${620}`} stroke={orange} strokeDasharray="3 4" strokeWidth="1"/></g>)}
  </svg></Figure>;
}

export function BerPlot(){
  const erfc=(x:number)=>{const t=1/(1+0.5*Math.abs(x));const y=t*Math.exp(-x*x-1.26551223+t*(1.00002368+t*(0.37409196+t*(0.09678418+t*(-0.18628806+t*(0.27886807+t*(-1.13520398+t*(1.48851587+t*(-0.82215223+t*0.17087277)))))))));return x>=0?y:2-y;};
  const db=(x:number)=>10**(x/10);
  const bpsk=(e:number)=>0.5*erfc(Math.sqrt(db(e)));
  const qam16=(e:number)=>(3/8)*erfc(Math.sqrt(0.4*db(e)));
  return <Figure plot caption="Bit error rate against energy per bit over noise density for Gray-coded modulation in white Gaussian noise. BPSK and QPSK share one curve (QPSK sends two independent BPSK streams in quadrature); 16-QAM needs about 4 dB more E_b/N₀ for the same error rate, the price of doubling the bits per symbol."><Plot curves={[{name:'BPSK / QPSK',color:green,points:linpts(bpsk,0,14,300)},{name:'16-QAM',color:orange,points:linpts(qam16,0,16,300)}]} yScale="log" xRange={[0,16]} yRange={[1e-8,0.5]} xLabel="E_b/N₀ / dB" yLabel="Bit error rate" marks={[{at:[9.6,bpsk(9.6)],label:'10⁻⁵ at 9.6 dB',pos:'sw'}]} description="Waterfall curves of bit error rate versus signal to noise ratio for two modulation schemes."/></Figure>;
}
