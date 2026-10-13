// Figures for the low-noise design chapters (Part III). Values are original teaching examples.
import * as S from './Schematic';
import Plot from './Plot';
import {Figure} from './Schematic';
const green='var(--accent)',orange='var(--orange)',ink='var(--ink)',muted='var(--muted)';
const k=1.380649e-23,T=300,q=1.602e-19;
const logpts=(fn:(x:number)=>number,lo:number,hi:number,n=301):[number,number][]=>Array.from({length:n},(_,i)=>{const x=lo*Math.pow(hi/lo,i/(n-1));return [x,fn(x)];});

/* ---------- Chapter 90: noise fundamentals ---------- */
export function NoiseDensityPlot(){
  const ew=4e-9,fc=100,amp=(f:number)=>ew*Math.sqrt(1+fc/f)*1e9,res=Math.sqrt(4*k*T*10e3)*1e9;
  return <Figure plot caption="Voltage-noise density of an op amp with a 4 nV/√Hz white floor and a 100 Hz 1/f corner (green), compared with the Johnson noise of a 10 kΩ resistor, 12.9 nV/√Hz (orange). Below the corner the density rises as 1/√f (10 dB per decade in power). In a 10 kΩ circuit the resistor dominates everywhere above a few hertz, so a quieter op amp would buy nothing."><Plot curves={[{name:'Op-amp e_n',color:green,points:logpts(amp,0.1,1e5)},{name:'10 kΩ resistor',color:orange,points:[[0.1,res],[1e5,res]]}]} xScale="log" yScale="log" xRange={[0.1,1e5]} yRange={[1,200]} xLabel="Frequency / Hz" yLabel="Noise density / (nV/√Hz)" marks={[{at:[100,amp(100)],label:'1/f corner',pos:'ne'}]} description="Noise density with a one over f region and a flat floor, and a flat resistor noise line."/></Figure>;
}

export function NoiseTracePlot(){
  let s=12345;const rnd=()=>{s=(s*1103515245+12345)%2147483648;return s/2147483648;};
  const pts:[number,number][]=[];for(let i=0;i<800;i++){const u=Math.max(1e-9,rnd()),v=rnd();pts.push([i,Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v)]);}
  return <Figure plot caption="800 samples of Gaussian noise with unit rms value σ. About 68% of samples lie within ±σ and 99.9% within ±3.3σ, which is why a peak-to-peak noise reading is commonly converted to rms by dividing by about 6.6. The convention depends on observation time: watch longer and rarer, larger peaks appear."><Plot curves={[{name:'Noise',color:green,points:pts},{name:'±σ',color:orange,dashed:true,points:[[0,1],[800,1],[NaN,NaN],[0,-1],[800,-1]]},{name:'±3.3σ',color:muted,dashed:true,points:[[0,3.3],[800,3.3],[NaN,NaN],[0,-3.3],[800,-3.3]]}]} xRange={[0,800]} yRange={[-4.5,4.5]} xLabel="Sample number" yLabel="Amplitude / σ" description="Random Gaussian noise trace with one sigma and three point three sigma lines."/></Figure>;
}

/* ---------- Chapter 91: transistor noise ---------- */
export function BjtNoiseVsCurrentPlot(){
  const rbb=50,beta=200,VT=k*T/q;
  const en=(I:number)=>Math.sqrt(4*k*T*rbb+2*k*T*VT/I)*1e9,inn=(I:number)=>Math.sqrt(2*q*I/beta)*1e12;
  return <Figure plot caption="Input voltage noise (green, nV/√Hz) and current noise (orange, pA/√Hz) of a bipolar transistor with β = 200 and 50 Ω of base spreading resistance, against collector current. Raising I_C lowers e_n as 1/√I_C, until the base resistance's own Johnson noise (0.9 nV/√Hz) sets a floor; it raises i_n as √I_C. The current that minimizes total noise therefore depends on the source resistance."><Plot curves={[{name:'e_n / (nV/√Hz)',color:green,points:logpts(en,1e-6,0.01)},{name:'i_n / (pA/√Hz)',color:orange,points:logpts(inn,1e-6,0.01)}]} xScale="log" yScale="log" xRange={[1e-6,0.01]} yRange={[0.01,100]} xLabel="Collector current / A" yLabel="Noise density" marks={[{at:[1e-3,en(1e-3)],label:'1 mA',pos:'ne'}]} description="Falling voltage noise and rising current noise versus collector current on log axes."/></Figure>;
}

export function NoiseVsSourcePlot(){
  const tot=(en:number,inn:number)=>(R:number)=>Math.sqrt(en*en+inn*inn*R*R+4*k*T*R)*1e9;
  const VT=k*T/q,bjt=(I:number)=>[Math.sqrt(4*k*T*50+2*k*T*VT/I),Math.sqrt(2*q*I/200)];
  const [e1,i1]=bjt(10e-6),[e2,i2]=bjt(1e-3);
  return <Figure plot caption="Total input-referred noise density against source resistance for a bipolar transistor at 1 mA and at 10 µA, a JFET (2 nV/√Hz, 5 fA/√Hz), and the source resistance's own Johnson noise alone (dashed). Each amplifier approaches the dashed line, where it adds little, only over a range of source resistance: the BJT at 1 mA from a few hundred ohms to a few kilohms, at 10 µA from a few kilohms to a few hundred kilohms, and the JFET from about 10 kΩ upward. Above about 1 MΩ only the JFET remains close, because current noise flowing through the source resistance ruins both BJTs."><Plot curves={[{name:'BJT, 1 mA',color:green,points:logpts(tot(e2,i2),1,1e8)},{name:'BJT, 10 µA',color:orange,points:logpts(tot(e1,i1),1,1e8)},{name:'JFET',color:ink,points:logpts(tot(2e-9,5e-15),1,1e8)},{name:'Source Johnson noise only',color:muted,dashed:true,points:logpts(R=>Math.sqrt(4*k*T*R)*1e9,1,1e8)}]} xScale="log" yScale="log" xRange={[1,1e8]} yRange={[0.1,1e4]} xLabel="Source resistance / Ω" yLabel="Total noise / (nV/√Hz)" description="Total noise versus source resistance for three amplifier choices compared with resistor thermal noise."/></Figure>;
}

/* ---------- Chapter 92: op-amp noise ---------- */
export function OpampNoiseModelCircuit(){
  const P=S.opAmpPins({at:[380,150],plusTop:true});const cap='Noise model of a noninverting amplifier. The op amp is noiseless; its voltage noise e_n is a source in series with the non-inverting input, and its current noises i_n+ and i_n− flow from each input to ground. Each resistor also contributes its own Johnson noise √(4kTR). All of these sources are uncorrelated, so their contributions at the output add in power.';
  const M:S.Pt=[P.minus[0],230];
  return <Figure caption={cap}><S.Schematic width={640} height={320} description={cap}>
    <S.Terminal at={[50,P.plus[1]]} label="v_s" side="left"/><S.Res a={[50,P.plus[1]]} b={[140,P.plus[1]]} label="R_s"/>
    <S.Wire pts={[[140,P.plus[1]],[210,P.plus[1]]]}/><S.CurrentSource a={[180,P.plus[1]]} b={[180,260]} label="i_n+"/><S.Ground at={[180,260]}/>
    <S.Source a={[210,P.plus[1]]} b={[300,P.plus[1]]} kind="ac" label="e_n"/><S.Wire pts={[[300,P.plus[1]],P.plus]}/>
    <S.OpAmp at={[380,150]} plusTop/>
    <S.Wire pts={[P.minus,M]}/><S.Res a={M} b={[540,M[1]]} label="R_f"/><S.Wire pts={[[540,M[1]],[540,150]]}/>
    <S.Wire pts={[P.out,[590,150]]}/><S.Terminal at={[590,150]} label="out" side="right"/>
    <S.Res a={M} b={[M[0],300]} label="R_g"/><S.Ground at={[M[0],300]}/>
    <S.Wire pts={[[290,M[1]],M]}/><S.CurrentSource a={[290,M[1]]} b={[290,300]} label="i_n−"/><S.Ground at={[290,300]}/>
    {([[180,P.plus[1]],M,[540,150]] as S.Pt[]).map((p,i)=><S.Dot key={i} at={p}/>)}
  </S.Schematic></Figure>;
}

export function TiaNoisePlot(){
  const Rf=1e6,Cf=1e-12,Cin=20e-12,en=5e-9,inn=1e-15,GBW=50e6;const f3=GBW/(1+Cin/Cf);
  const w=(f:number)=>2*Math.PI*f,lp=(f:number)=>1/Math.sqrt(1+(f/f3)**2);
  // Noise gain 1 + jωC_in Z_f with Z_f = R_f/(1 + jωR_fC_f): a = ωR_fC_f, b = ωR_fC_in.
  const ng=(f:number)=>{const a=w(f)*Rf*Cf,b=w(f)*Rf*Cin,d=1+a*a;return Math.hypot(1+a*b/d,b/d);};
  const zf=(f:number)=>Rf/Math.sqrt(1+(w(f)*Rf*Cf)**2);
  const eR=(f:number)=>Math.sqrt(4*k*T*Rf)*zf(f)/Rf*lp(f)*1e9,eI=(f:number)=>inn*zf(f)*lp(f)*1e9,eE=(f:number)=>en*ng(f)*lp(f)*1e9;
  const tot=(f:number)=>Math.sqrt(eR(f)**2+eI(f)**2+eE(f)**2);
  return <Figure plot caption="Output noise density of a transimpedance amplifier with R_f = 1 MΩ, C_f = 1 pF, 20 pF of photodiode and input capacitance, and an op amp with 5 nV/√Hz, 1 fA/√Hz and 50 MHz GBW. At low frequency the feedback resistor's Johnson noise (orange, 129 nV/√Hz) dominates. Above a few kilohertz the op amp's voltage noise is amplified by the rising noise gain 1 + C_in/C_f = 21 (green, the 'e_nC' noise), which dominates the total (dark) until the op amp's bandwidth rolls everything off."><Plot curves={[{name:'R_f Johnson',color:orange,points:logpts(eR,10,1e8)},{name:'i_n × Z_f',color:muted,points:logpts(eI,10,1e8)},{name:'e_n × noise gain',color:green,points:logpts(eE,10,1e8)},{name:'Total',color:ink,points:logpts(tot,10,1e8)}]} xScale="log" yScale="log" xRange={[10,1e8]} yRange={[0.1,1000]} xLabel="Frequency / Hz" yLabel="Output noise / (nV/√Hz)" description="Output noise components of a transimpedance amplifier versus frequency."/></Figure>;
}

/* ---------- Chapter 93: measurement and lock-in ---------- */
export function LockInFigure(){
  return <Figure caption="Lock-in amplifier. The signal, modulated at a known reference frequency, is multiplied by the reference and by its 90° shifted copy; low-pass filters keep only the products near DC. The outputs X and Y are the in-phase and quadrature components, so amplitude √(X² + Y²) and phase atan2(Y, X) are recovered. Noise more than about one filter bandwidth away from the reference frequency averages out."><svg viewBox="0 0 680 240" role="img" aria-label="Lock-in amplifier with two multipliers, reference, phase shifter and low-pass filters.">
    <defs><marker id="ni-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill={ink}/></marker></defs>
    {[[60,'signal + noise'],[200,'reference f_r']].map(([y,l],i)=><text key={i} x={10} y={Number(y)-8} className="tick">{l}</text>)}
    <path d="M10 60 H110 M90 60 V180 H160" fill="none" stroke={ink} strokeWidth="1.8"/><path d="M160 180 H180" fill="none" stroke={ink} strokeWidth="1.8" markerEnd="url(#ni-arrow)"/>
    <path d="M110 60 H180" fill="none" stroke={ink} strokeWidth="1.8" markerEnd="url(#ni-arrow)"/>
    <circle cx={90} cy={60} r="3.3" fill={ink}/>
    {[60,180].map(y=><g key={y}><circle cx={200} cy={y} r="18" fill="var(--paper)" stroke={ink} strokeWidth="1.8"/><text x={200} y={y+5} textAnchor="middle" className="symbol-value">×</text><path d={`M218 ${y} H300`} stroke={ink} strokeWidth="1.8" markerEnd="url(#ni-arrow)"/><rect x={302} y={y-22} width={120} height={44} rx="3" fill="var(--paper)" stroke={green} strokeWidth="1.8"/><text x={362} y={y+5} textAnchor="middle" className="symbol-value">low-pass</text><path d={`M422 ${y} H500`} stroke={ink} strokeWidth="1.8" markerEnd="url(#ni-arrow)"/></g>)}
    <text x={510} y={65} className="symbol-value">X = (A/2) cos φ</text><text x={510} y={185} className="symbol-value">Y = (A/2) sin φ</text>
    <rect x={150} y={108} width={100} height={36} rx="3" fill="var(--paper)" stroke={green} strokeWidth="1.8"/><text x={200} y={131} textAnchor="middle" className="tick">ref: 0° / 90°</text>
    <path d="M200 108 V80 M200 144 V160" stroke={ink} strokeWidth="1.8" markerEnd="url(#ni-arrow)"/>
    <path d="M10 200 H120 V126 H150" fill="none" stroke={ink} strokeWidth="1.8" markerEnd="url(#ni-arrow)"/>
  </svg></Figure>;
}

export function AveragingPlot(){
  const white=(t:number)=>Math.sqrt(1/t)*10,floor=(t:number)=>Math.sqrt(100/t+0.5);
  return <Figure plot caption="Rms noise of an averaged measurement against averaging time. With white noise only (dashed), rms noise falls as 1/√T forever: four times longer averaging halves it. With a 1/f component (green) the improvement stops at a floor: longer averaging includes ever-slower fluctuations. That floor is where chopping, auto-zeroing or lock-in detection move the measurement to a frequency above the 1/f corner."><Plot curves={[{name:'White noise only',color:muted,dashed:true,points:logpts(white,0.01,1e4)},{name:'White + 1/f',color:green,points:logpts(floor,0.01,1e4)}]} xScale="log" yScale="log" xRange={[0.01,1e4]} yRange={[0.05,200]} xLabel="Averaging time / s" yLabel="Rms noise (arbitrary units)" description="Averaged noise falling with time and then flattening due to flicker noise."/></Figure>;
}
