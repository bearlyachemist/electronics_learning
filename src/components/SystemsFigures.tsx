import * as S from './Schematic';
import Plot from './Plot';
import {Figure} from './Schematic';
import {Tx} from './MathText';
import {sinc} from '../engine/systems.mjs';
const green='var(--accent)',orange='var(--orange)';
export function SystemsFlow({labels,caption}:{labels:string[];caption:string}){
 const w=640,pad=12,gap=22,bw=(w-2*pad-gap*(labels.length-1))/labels.length;
 return <Figure caption={caption}><svg viewBox="0 0 640 130" role="img" aria-label={caption}>{labels.map((label,i)=><g key={i}><rect x={pad+i*(bw+gap)} y="25" width={bw} height="62" rx="3" fill="var(--paper)" stroke={green} strokeWidth="1.8"/><text x={pad+i*(bw+gap)+bw/2} y="51" textAnchor="middle" className="symbol-value">{label.split('|').map((s,j)=><tspan key={j} x={pad+i*(bw+gap)+bw/2} dy={j?20:0}>{s}</tspan>)}</text>{i<labels.length-1&&<path d={`M${pad+(i+1)*bw+i*gap} 56 h${gap-5} m-6 -5 l6 5 l-6 5`} stroke="var(--ink)" fill="none" strokeWidth="1.8"/>}</g>)}</svg></Figure>;
}
const pts=(fn:(x:number)=>number,lo:number,hi:number,n=201):[number,number][]=>Array.from({length:n},(_,i)=>{const x=lo+(hi-lo)*i/(n-1);return [x,fn(x)];});
export function SystemsPlot({kind}:{kind:string}){
 const common={xRange:[0,1] as [number,number],yRange:[0,1] as [number,number],xLabel:'Normalized input',yLabel:'Normalized output',description:kind};
 const configs:Record<string,any>={
 quantization:{...common,curves:[{name:'Ideal 4-bit staircase',color:green,points:pts(x=>Math.min(15,Math.floor(x*16))/16,0,1,401)},{name:'Continuous input',color:orange,dashed:true,points:[[0,0],[1,1]]}],description:'Sixteen bins over a unit span; the plotted output is each bin’s lower boundary.'},
 buck:{...common,xRange:[0,4],yRange:[0,2],xLabel:'Time / switching periods',yLabel:'Inductor current / A',curves:[{name:'1 A CCM load',color:green,points:pts(t=>{const p=t%1,d=5/12,di=7*d/(22e-6*500e3);return 1-di/2+(p<d?di*p/d:di*(1-(p-d)/(1-d)));},0,4,481)}],description:'Ideal 12-to-5 V buck, 22 microhenry, 500 kilohertz: rising on-state and falling off-state currents.'},
 reflection:{...common,xRange:[0,6],yRange:[0,1.2],xLabel:'Time / one-way delay',yLabel:'Load voltage / V',curves:[{name:'Matched 50 Ω',color:green,points:[[0,0],[1,0],[1,.5],[6,.5]]},{name:'Open load',color:orange,points:[[0,0],[1,0],[1,1],[6,1]]}],description:'One volt source with 50 ohm source resistance drives a 50 ohm line. Load first sees the wave after one flight time; source absorbs the reflected wave.'},
 skew:{...common,xRange:[-1,2],yRange:[-.1,1.1],xLabel:'Time / ns',yLabel:'Voltage / V',curves:[{name:'Differential voltage',color:green,points:pts(t=>{const edge=(x:number)=>Math.max(0,Math.min(1,x));return .4*(edge(t)+edge(t-.3))- .4;},-1,2)},{name:'Common mode',color:orange,points:pts(t=>{const edge=(x:number)=>Math.max(0,Math.min(1,x));return .6+.2*(edge(t)-edge(t-.3));},-1,2)}],description:'Opposite 0.4 volt transitions around 0.6 volt common mode have 300 picosecond skew and one nanosecond rise time; common mode briefly rises by 60 millivolts.'},
 dac:{...common,xRange:[0,2],yRange:[-80,3],xLabel:'Frequency / update rate',yLabel:'Zero-order hold magnitude / dB',curves:[{name:'Hold envelope',color:green,points:pts(x=>20*Math.log10(Math.max(1e-5,Math.abs(sinc(x)))),0,2,501)}],description:'The zero-order hold envelope is sinc(f/fs), with droop within the signal band and nulls at integer multiples of update rate.'},
 delta:{...common,xRange:[.001,.5],yRange:[-70,10],xLabel:'Frequency / modulator rate',yLabel:'Noise-transfer magnitude / dB',curves:[{name:'First order',color:green,points:pts(x=>20*Math.log10(2*Math.sin(Math.PI*x)),.001,.5)},{name:'Second-order ideal NTF',color:orange,points:pts(x=>40*Math.log10(2*Math.sin(Math.PI*x)),.001,.5)}],description:'Ideal noise transfer magnitudes for (1-z^-1) and (1-z^-1)^2. These spectra do not establish high-order loop stability.'}
 };
 const p=configs[kind];return p?<Figure plot caption={p.description}><Plot {...p}/></Figure>:null;
}

export function PowerCircuit({kind='buck'}:{kind?:'buck'|'boost'}){
 const isBuck=kind==='buck',caption=isBuck?'Asynchronous buck power stage: switch on applies input minus output across L; switch off returns positive inductor current through the catch diode. Control and input bypass are omitted.':'Boost power stage: switch on stores energy in L while the output capacitor feeds the load; switch off sends inductor current through the diode to the output. Control and input bypass are omitted.';
 return <Figure caption={caption}><S.Schematic width={660} height={260} description={caption}>
 <S.Rail at={[80,70]} label="V_in"/>
 {isBuck?<><S.Switch a={[80,70]} b={[260,70]} label="S"/><S.Ind a={[260,70]} b={[430,70]} label="L"/><S.Diode a={[260,200]} b={[260,70]} label="D" kind="schottky" flipLabel/></>:<><S.Ind a={[80,70]} b={[260,70]} label="L"/><S.Diode a={[260,70]} b={[430,70]} label="D" kind="schottky"/><S.Switch a={[260,70]} b={[260,200]} label="S" flipLabel/></>}
 <S.Wire pts={[[430,70],[590,70],[620,70]]}/><S.Terminal at={[620,70]} label="V_o" side="right"/>
 <S.Cap a={[430,70]} b={[430,200]} label="C_o"/>
 <S.Res a={[590,70]} b={[590,200]} label="R_load" flipLabel/>
 <S.Wire pts={[[260,200],[430,200],[590,200]]}/><S.Ground at={[430,200]}/>
 {([[260,70],[430,70],[590,70],[430,200]] as S.Pt[]).map((at,i)=><S.Dot key={i} at={at}/>)}
 <S.CurrentArrow at={[405,70]} dir="right" label="i_L" side={-1}/>
 <S.Text x={80} y={238} kind="value">Ideal switch and diode model; capacitor and load share output.</S.Text>
 </S.Schematic></Figure>;
}

export function MatchCircuit(){return <Figure caption="Low-pass L match from a 50 Ω source port to a 200 Ω load at 10 MHz. The shunt capacitor is on the higher-resistance side; the return conductor is continuous."><S.Schematic width={640} height={240} description="Series 1.378 microhenry followed by shunt 137.8 picofarad across a 200 ohm load, matching to a 50 ohm source at 10 megahertz.">
 <S.Terminal at={[80,70]} label="50 Ω port" side="above"/><S.Ind a={[80,70]} b={[280,70]} label="L" value="1.378 μH"/>
 <S.Wire pts={[[280,70],[460,70]]}/><S.Cap a={[280,70]} b={[280,190]} label="C" value="137.8 pF"/>
 <S.Res a={[460,70]} b={[460,190]} label="R_L" value="200 Ω"/>
 <S.Wire pts={[[80,190],[280,190],[460,190]]}/><S.Terminal at={[80,190]} label="Return"/><S.Ground at={[280,190]}/><S.Dot at={[280,70]}/><S.Dot at={[280,190]}/>
 </S.Schematic></Figure>;}
