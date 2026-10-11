// Architecture, operation and error figures for the data-converter chapters (Part VI).
// Block diagrams are plain SVG; plots use the shared Plot component. Values are original teaching examples.
import Plot from './Plot';
import {Figure} from './Schematic';
import {svgMath} from './MathText';
const green='var(--accent)',orange='var(--orange)',ink='var(--ink)',muted='var(--muted)';
const lin=(fn:(x:number)=>number,lo:number,hi:number,n=401):[number,number][]=>Array.from({length:n},(_,i)=>{const x=lo+(hi-lo)*i/(n-1);return [x,fn(x)];});
const steps=(vals:number[],x0=0,dx=1):[number,number][]=>vals.flatMap((v,i)=>[[x0+i*dx,v],[x0+(i+1)*dx,v]] as [number,number][]);

function Defs(){return <defs><marker id="cv-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" fill={ink}/></marker></defs>;}
function Box({x,y,w,h,label,sub}:{x:number;y:number;w:number;h:number;label:string;sub?:string}){
  return <g><rect x={x} y={y} width={w} height={h} rx="3" fill="var(--paper)" stroke={green} strokeWidth="1.8"/><text x={x+w/2} y={y+h/2+(sub?-3:5)} textAnchor="middle" className="symbol-value">{svgMath(label)}</text>{sub&&<text x={x+w/2} y={y+h/2+15} textAnchor="middle" className="tick">{svgMath(sub)}</text>}</g>;
}
const A=({d}:{d:string})=><path d={d} fill="none" stroke={ink} strokeWidth="1.8" markerEnd="url(#cv-arrow)"/>;
const W=({d,dash}:{d:string;dash?:boolean})=><path d={d} fill="none" stroke={ink} strokeWidth="1.8" strokeDasharray={dash?'5 4':undefined}/>;
const Dot=({x,y}:{x:number;y:number})=><circle cx={x} cy={y} r="3.3" fill={ink}/>;
// Comparator drawn as an amplifier triangle pointing right, with + on top.
function Comp({x,y,s=1,minusTop=false}:{x:number;y:number;s?:number;minusTop?:boolean}){const h=36*s,w=40*s;return <g><path d={`M${x} ${y-h/2} L${x+w} ${y} L${x} ${y+h/2} Z`} fill="var(--paper)" stroke={ink} strokeWidth="1.8"/><text x={x+5} y={y-h/4+4} className="tick">{minusTop?'−':'+'}</text><text x={x+5} y={y+h/4+4} className="tick">{minusTop?'+':'−'}</text></g>;}
// Vertical zig-zag resistor between y1 and y2 at x.
function ResV({x,y1,y2,label}:{x:number;y1:number;y2:number;label?:string}){const m=(y1+y2)/2,h=Math.min(28,(y2-y1)*0.7),z=6;const pts=[[x,y1],[x,m-h/2],...Array.from({length:6},(_,i)=>[x+(i%2?-z:z),m-h/2+(i+0.5)*h/6]),[x,m+h/2],[x,y2]];return <g><polyline points={pts.map(p=>p.join(',')).join(' ')} fill="none" stroke={ink} strokeWidth="1.8"/>{label&&<text x={x-12} y={m+4} textAnchor="end" className="tick">{label}</text>}</g>;}
// Capacitor drawn vertically: plates at y, y+8.
function CapV({x,y,label}:{x:number;y:number;label?:string}){return <g><path d={`M${x-12} ${y} H${x+12} M${x-12} ${y+8} H${x+12}`} stroke={ink} strokeWidth="2.2"/>{label&&<text x={x} y={y-8} textAnchor="middle" className="tick">{label}</text>}</g>;}

/* ---------- Chapter 109: sampling and quantization errors ---------- */
export function QuantizationErrorPlot(){
  const q=1/8,err=(x:number)=>{if(x<0||x>=1)return NaN;return x-(Math.floor(x/q)+0.5)*q;};
  return <Figure plot caption="Quantization error of an ideal 3-bit converter with midpoint reconstruction, e = V_in − (D + ½)q. Inside the range it is a sawtooth between −q/2 and +q/2; if the input sweeps uniformly, its mean square is q²/12, the result behind the 6.02N + 1.76 dB formula."><Plot curves={[{name:'Error / q',color:green,points:lin(x=>err(x)/q,0,0.999,1200)},{name:'±½ q bounds',color:orange,dashed:true,points:[[0,0.5],[1,0.5],[NaN,NaN],[0,-0.5],[1,-0.5]]}]} xRange={[0,1]} yRange={[-0.7,0.7]} xLabel="Input / full span" yLabel="Error / q" description="Sawtooth quantization error between minus one half and plus one half of a code."/></Figure>;
}

export function AliasFoldingPlot(){
  const fs=10,fa=(f:number)=>{const r=((f%fs)+fs)%fs;return r>fs/2?fs-r:r;};
  return <Figure plot caption="Apparent frequency after sampling at 10 kS/s. Input frequencies fold back and forth between 0 and f_s/2 = 5 kHz like a zig-zag: 7 kHz and 13 kHz both appear at 3 kHz, indistinguishable from a genuine 3 kHz tone. Only an analog filter before the sampler can tell them apart."><Plot curves={[{name:'Alias frequency',color:green,points:lin(fa,0,25,1001)}]} xRange={[0,25]} yRange={[0,5.8]} xLabel="Input frequency / kHz" yLabel="Apparent frequency / kHz" marks={[{at:[3,3],label:'3 kHz',pos:'nw'},{at:[7,3],label:'7 kHz',pos:'ne'},{at:[13,3],label:'13 kHz',pos:'ne'}]} description="Triangular folding of input frequency into the first Nyquist zone."/></Figure>;
}

export function JitterErrorPlot(){
  const f=1,sig=(t:number)=>Math.sin(2*Math.PI*f*t),slope=(t:number)=>2*Math.PI*f*Math.cos(2*Math.PI*f*t),st=0.03;
  return <Figure plot caption="A sampling-time error δt produces a voltage error of about (dv/dt)δt. For a sine the error is largest at the zero crossings, where the slope is 2πfA, and zero at the peaks. The shaded envelope shows ±(dv/dt)σ_t for an exaggerated σ_t = 3% of a period; the rms error over a cycle is 2πfAσ_t/√2."><Plot curves={[{name:'Signal',color:green,points:lin(sig,0,2)},{name:'+ jitter error envelope',color:orange,dashed:true,points:lin(t=>sig(t)+Math.abs(slope(t))*st,0,2)},{name:'− jitter error envelope',color:orange,dashed:true,points:lin(t=>sig(t)-Math.abs(slope(t))*st,0,2)}]} xRange={[0,2]} yRange={[-1.4,1.4]} xLabel="Time / periods" yLabel="Voltage / A" description="Sine wave with an error band that is widest at zero crossings."/></Figure>;
}

export function InlDnlPlot(){
  // 3-bit converter with one wide code (DNL +0.5) and one missing code (DNL −1), thresholds in LSB.
  const T=[1,2,3.5,4.5,4.5,6,7]; // code k+1 begins at T[k]; code 4 has zero width (missing)
  const code=(x:number)=>T.filter(t=>x>=t).length;
  const ideal=(x:number)=>Math.min(7,Math.floor(x));
  return <Figure plot caption="A 3-bit transfer with threshold errors. Code 2 is 1.5 LSB wide (DNL = +0.5), code 4 has zero width (DNL = −1, a missing code, so the output jumps from 3 to 5) and code 5 is 1.5 LSB wide. INL is the running sum of the width errors, the distance of each actual threshold from the ideal: +0.5 LSB at thresholds 3 and 4, −0.5 at threshold 5, then zero. Large DNL errors can partly cancel in INL."><Plot curves={[{name:'Actual codes',color:green,points:lin(code,0,8,1601)},{name:'Ideal codes',color:muted,dashed:true,points:lin(ideal,0,8,1601)}]} xRange={[0,8]} yRange={[-0.3,7.6]} xLabel="Input / LSB" yLabel="Output code" marks={[{at:[3.5,3],label:'wide code 2',pos:'se'},{at:[4.5,5],label:'code 4 missing',pos:'nw'}]} description="Staircase transfer with one wide and one missing code compared with the ideal staircase."/></Figure>;
}

/* ---------- Chapter 110: SAR ---------- */
export function SarArchitectureFigure(){
  const caps=[{x:300,l:'8C'},{x:370,l:'4C'},{x:440,l:'2C'},{x:510,l:'C'},{x:580,l:'C'}];
  return <Figure caption="Charge-redistribution SAR ADC (4 bits plus a dummy unit capacitor). During sampling every bottom-plate switch selects V_in while the top plate is held at ground. Then the top plate floats and the SAR logic switches each bottom plate to V_ref or 0 V, one bit at a time from the largest capacitor. The comparator reads the sign of V_x = V_trial − V_in and the logic keeps or clears that bit."><svg viewBox="0 0 700 320" role="img" aria-label="SAR ADC with binary capacitor array, three-way bottom-plate switches, comparator and SAR logic.">
    <Defs/>
    <Box x={110} y={6} w={250} h={34} label="SAR logic + register"/>
    <A d="M110 23 H66"/><text x={14} y={28} className="symbol-value">code</text>
    <W d="M235 40 V56"/><text x={243} y={54} className="tick">bit-switch control</text>
    <W d="M300 76 H630"/><text x={300} y={68} className="tick">{svgMath('top plate, V_x')}</text>
    {caps.map((c,i)=><g key={i}><Dot x={c.x} y={76}/><W d={`M${c.x} 76 V112`}/><CapV x={c.x} y={112}/><text x={c.x+16} y={120} className="tick">{c.l}</text><W d={`M${c.x} 120 V176`}/><circle cx={c.x} cy={176} r="3" fill={ink}/><path d={`M${c.x} 176 L${c.x-12} 226`} stroke={ink} strokeWidth="1.8"/>{[{y:236,dx:-14},{y:260,dx:0},{y:284,dx:14}].map(t=><g key={t.y}><circle cx={c.x+t.dx} cy={t.y} r="2.8" fill="var(--paper)" stroke={ink} strokeWidth="1.3"/></g>)}</g>)}
    <text x={20} y={240} className="symbol-value">{svgMath('V_in')}</text><text x={20} y={264} className="symbol-value">{svgMath('V_ref')}</text><text x={20} y={288} className="symbol-value">0 V</text>
    <W d="M70 236 H586"/><W d="M70 260 H600"/><W d="M70 284 H614"/>
    <text x={300} y={310} className="tick">{svgMath('each bottom plate selects V_in (sample), then V_ref or 0 V (trial)')}</text>
    <W d="M630 76 V100 H640"/><Comp x={640} y={112}/><W d="M640 124 H630 V140"/><path d="M622 140 H638 M625 145 H635 M628 150 H632" stroke={ink} strokeWidth="1.8"/>
    <W d="M680 112 H692 V23 H384"/><A d="M384 23 H362"/>
  </svg></Figure>;
}

export function SarSearchPlot(){
  const trials=[0.5,0.75,0.625,0.6875];
  return <Figure plot caption="Binary search for a 0.68 V input with a 1 V reference and 4 bits. Each trial sits at the midpoint of the interval still possible: 0.5 V (input above: keep), 0.75 V (below: clear), 0.625 V (keep), 0.6875 V (clear). The result 1010 places the input in [0.625, 0.6875) V, one code wide."><Plot curves={[{name:'Trial DAC voltage',color:green,points:steps(trials,0,1)},{name:'Held input 0.68 V',color:orange,dashed:true,points:[[0,0.68],[4,0.68]]}]} xRange={[0,4]} yRange={[0.4,0.85]} xLabel="Decision number" yLabel="Voltage / V" marks={[{at:[0.5,0.5],label:'keep',pos:'ne'},{at:[1.5,0.75],label:'clear',pos:'ne'},{at:[2.5,0.625],label:'keep',pos:'se'},{at:[3.5,0.6875],label:'clear',pos:'ne'}]} description="Stepped trial voltage converging on the held input over four decisions."/></Figure>;
}

/* ---------- Chapter 111: flash, pipeline, interleaving ---------- */
export function FlashArchitectureFigure(){
  const top=30,bot=270,n=8,dy=(bot-top)/n;const taps=Array.from({length:7},(_,i)=>bot-(i+1)*dy);
  return <Figure caption="3-bit flash ADC. Eight equal resistors divide V_ref into seven thresholds; seven comparators each compare the input with one threshold at the same instant. Their outputs form a thermometer code (all ones below the input, zeros above) that the encoder turns into binary."><svg viewBox="0 0 640 300" role="img" aria-label="Resistor ladder feeding seven comparators whose outputs go to a thermometer-to-binary encoder.">
    <Defs/>
    <text x={70} y={top-8} textAnchor="middle" className="symbol-value">{svgMath('V_ref')}</text>
    {Array.from({length:n},(_,i)=><ResV key={i} x={70} y1={top+i*dy} y2={top+(i+1)*dy}/>)}
    <path d={`M62 ${bot} H78 M65 ${bot+5} H75 M68 ${bot+10} H72`} stroke={ink} strokeWidth="1.8"/>
    <text x={20} y={150} className="symbol-value">{svgMath('V_in')}</text><W d="M40 160 V292 H200"/>
    {taps.map((y,i)=><g key={i}><Dot x={70} y={y}/><W d={`M70 ${y} H240`}/><W d={`M220 ${y+16} H240`}/><W d={`M220 ${y+16} V292`}/><Dot x={220} y={y+16}/><Comp x={240} y={y+8} s={0.75} minusTop/><W d={`M270 ${y+8} H360`}/><text x={300} y={y+4} className="tick">{`t${i+1}`}</text><text x={112} y={y-4} className="tick">{`${i+1}/8`}</text></g>)}
    <W d="M200 292 H220"/>
    <Box x={360} y={40} w={130} h={220} label="Encoder" sub="thermometer → binary"/>
    <A d="M490 150 H560"/><text x={566} y={146} className="symbol-value">D₂D₁D₀</text>
    <text x={400} y={286} className="tick">{svgMath('input 0.61 V_ref → t1–t4 high → code 100')}</text>
  </svg></Figure>;
}

export function PipelineStageFigure(){
  return <Figure caption="One 1.5-bit pipeline stage. A coarse sub-ADC (two comparators) chooses d ∈ {−1, 0, +1}; a sub-DAC subtracts dV_R/2 from the held input; a gain-of-2 amplifier produces the residue r = 2x − d for the next stage. Decisions from all stages are delayed into alignment and added with binary weights."><svg viewBox="0 0 680 230" role="img" aria-label="Pipeline stage block diagram with sample-hold, sub-ADC, sub-DAC, subtractor and gain of two.">
    <Defs/>
    <text x={10} y={84} className="symbol-value">x</text><A d="M24 90 H60"/>
    <Box x={62} y={64} w={90} h={52} label="S/H"/>
    <A d="M152 90 H300"/><Dot x={190} y={90}/>
    <W d="M190 90 V170"/><A d="M190 170 H222"/>
    <Box x={224} y={146} w={120} h={48} label="Sub-ADC" sub="±V_R/4 thresholds"/>
    <A d="M344 170 H400"/><Box x={402} y={146} w={110} h={48} label="Sub-DAC" sub="d · V_R/2"/>
    <A d="M457 146 V90 H336"/>
    <circle cx={318} cy={90} r="17" fill="var(--paper)" stroke={ink} strokeWidth="1.8"/><text x={318} y={95} textAnchor="middle" className="symbol-value">Σ</text><text x={292} y={80} className="tick">+</text>
    <text x={350} y={84} className="tick">−</text>
    <A d="M318 73 V50 H520"/><path d="M522 30 L572 50 L522 70 Z" fill="var(--paper)" stroke={ink} strokeWidth="1.8"/><text x={532} y={55} className="tick">×2</text>
    <A d="M572 50 H640"/><text x={600} y={42} className="symbol-value">r</text>
    <W d="M284 194 V214 H560" dash/><A d="M560 214 H600"/><text x={606} y={218} className="tick">d</text><text x={360} y={208} className="tick">to digital alignment</text>
  </svg></Figure>;
}

export function PipelineResiduePlot(){
  const r=(x:number)=>x<-0.25?2*x+1:x>0.25?2*x-1:2*x;
  return <Figure plot caption="Residue of a 1.5-bit stage, r = 2x − d. Each segment has slope 2; the comparator thresholds at ±¼ leave the residue within ±½ for an ideal stage, so a threshold error up to ±¼ still keeps the residue inside the next stage's ±1 range. That margin is the redundancy digital correction relies on."><Plot curves={[{name:'Residue r',color:green,points:lin(r,-1,1,2001)},{name:'Next-stage range ±1',color:orange,dashed:true,points:[[-1,1],[1,1],[NaN,NaN],[-1,-1],[1,-1]]}]} xRange={[-1,1]} yRange={[-1.25,1.25]} xLabel="Stage input x = v_in/V_R" yLabel="Residue r" marks={[{at:[-0.25,-0.5],label:'d = −1 | 0',pos:'se'},{at:[0.25,0.5],label:'d = 0 | +1',pos:'nw'}]} description="Sawtooth residue with three segments of slope two between thresholds at minus and plus one quarter."/></Figure>;
}

export function InterleaveSpurPlot(){
  const sp=(f:number,dt:number)=>20*Math.log10(Math.PI*f*1e6*dt);
  return <Figure plot caption="Image spur of a two-channel interleaved ADC caused by timing skew alone, 20 log₁₀(πf_in Δt). Every factor of ten in input frequency or in skew costs 20 dB. At 100 MHz input, 1 ps of skew already limits spurious-free range to about 70 dB."><Plot curves={[{name:'Δt = 1 ps',color:green,points:lin(f=>sp(f,1e-12),1,1000,500)},{name:'Δt = 10 ps',color:orange,points:lin(f=>sp(f,10e-12),1,1000,500)}]} xScale="log" xRange={[1,1000]} yRange={[-120,-20]} xLabel="Input frequency / MHz" yLabel="Image spur / dBc" marks={[{at:[100,sp(100,1e-12)],label:'−70 dBc',pos:'se'}]} description="Spur level rising twenty decibels per decade of input frequency for two skew values."/></Figure>;
}

/* ---------- Chapter 112: integrating and delta-sigma ---------- */
export function DualSlopePlot(){
  const Tint=1,ramp=(vin:number)=>(t:number)=>t<=Tint?vin*t:Math.max(0,vin*Tint-(t-Tint));
  return <Figure plot caption="Dual-slope integrator output for inputs of 0.4 and 0.8 V_ref. During the fixed run-up time T_int the slope is proportional to V_in; during run-down the reference gives the same slope for both. The run-down time, 0.4 or 0.8 T_int, is proportional to V_in, and R and C cancel from the ratio."><Plot curves={[{name:'V_in = 0.8 V_ref',color:green,points:lin(ramp(0.8),0,2.1,800)},{name:'V_in = 0.4 V_ref',color:orange,points:lin(ramp(0.4),0,2.1,800)}]} xRange={[0,2.1]} yRange={[0,1]} xLabel="Time / T_int" yLabel="Integrator output / (V_ref T_int/RC)" marks={[{at:[1.4,0],label:'0.4 T_int',pos:'nw'},{at:[1.8,0],label:'0.8 T_int',pos:'ne'}]} description="Two triangular integrator waveforms with fixed run-up and proportional run-down times."/></Figure>;
}

export function DeltaSigmaArchitectureFigure(){
  return <Figure caption="First-order delta–sigma modulator and decimator. The integrator accumulates the difference between the input and the fed-back 1-bit DAC level; the comparator's ±V_ref decisions keep that integral bounded, so their average tracks the input. A digital low-pass filter and decimator turn the fast bitstream into slower multi-bit words."><svg viewBox="0 0 680 220" role="img" aria-label="Delta-sigma loop with summing node, integrator, comparator, one-bit DAC feedback and decimation filter.">
    <Defs/>
    <text x={10} y={74} className="symbol-value">x</text><A d="M24 80 H74"/>
    <circle cx={92} cy={80} r="17" fill="var(--paper)" stroke={ink} strokeWidth="1.8"/><text x={92} y={85} textAnchor="middle" className="symbol-value">Σ</text><text x={64} y={70} className="tick">+</text><text x={98} y={114} className="tick">−</text>
    <A d="M109 80 H160"/><Box x={162} y={54} w={110} h={52} label="∫" sub="integrator"/>
    <A d="M272 80 H320"/><Box x={322} y={54} w={100} h={52} label="1-bit ADC" sub="comparator, f_mod"/>
    <A d="M422 80 H500"/><Dot x={460} y={80}/><text x={436} y={70} className="tick">y = ±1</text>
    <Box x={502} y={54} w={150} h={52} label="Digital filter" sub="low-pass + ↓ M"/>
    <A d="M652 80 H676"/>
    <W d="M460 80 V170 H332"/><Box x={222} y={146} w={110} h={48} label="1-bit DAC" sub="±V_ref"/>
    <W d="M222 170 H92"/><A d="M92 170 V97"/>
  </svg></Figure>;
}

export function DeltaSigmaBitstreamPlot(){
  // First-order modulator, input a slow sine of amplitude 0.6; output ±1; show 16-sample moving average.
  const N=256,xs:number[]=[],ys:number[]=[];let s=0,y=0;
  for(let n=0;n<N;n++){const x=0.6*Math.sin(2*Math.PI*n/N);s+=x-y;y=s>=0?1:-1;xs.push(x);ys.push(y);}
  const avg=ys.map((_,n)=>{const a=Math.max(0,n-15);const w=ys.slice(a,n+1);return w.reduce((p,c)=>p+c,0)/w.length;});
  const bits:[number,number][]=ys.flatMap((v,n)=>[[n,v*0.25-1.9],[n+1,v*0.25-1.9]] as [number,number][]);
  return <Figure plot caption="A first-order delta–sigma modulator driven by a slow sine of amplitude 0.6. The bitstream (bottom, offset for clarity) is mostly +1 near the positive peak, mostly −1 near the negative peak and alternates near zero. A 16-sample moving average (green) already recovers the input (orange dashed); the digital filter in a real converter does this with far less residual noise."><Plot curves={[{name:'Input',color:orange,dashed:true,points:xs.map((v,n)=>[n,v] as [number,number])},{name:'16-sample average of bitstream',color:green,points:avg.map((v,n)=>[n,v] as [number,number]).slice(15)},{name:'Bitstream (offset)',color:muted,points:bits}]} xRange={[0,256]} yRange={[-2.3,1.2]} xLabel="Modulator clock cycles" yLabel="Normalized value" description="Sine input, its one-bit encoded stream and the moving average that reconstructs it."/></Figure>;
}
