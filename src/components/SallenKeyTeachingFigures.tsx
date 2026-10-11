import Plot from './Plot';
import {Figure,gray,green,orange} from './Schematic';
import {secondOrderStep} from '../engine/ac.mjs';
const logs=Array.from({length:301},(_,i)=>10**(-2+4*i/300));
export function SallenComparisonFigure(){
 const curves=[{name:'Unbuffered passive, Q = 1/3',q:1/3,color:gray},{name:'Buffered / unity SK, Q = 1/2',q:.5,color:green},{name:'Butterworth SK, Q = 0.707',q:Math.SQRT1_2,color:orange}].map(({name,q,color})=>({name,color,points:logs.map(x=>[x,-10*Math.log10((1-x*x)**2+(x/q)**2)] as [number,number])}));
 return <Figure plot caption="Equal R and C do not give the same damping in three connections. Removing interstage loading raises Q from 1/3 to 1/2; controlled output feedback raises it further. All curves are normalized to their own DC gain and share the same natural frequency."><Plot curves={curves} xScale="log" xRange={[.01,100]} yRange={[-80,3]} xLabel="FREQUENCY / NATURAL FREQUENCY" yLabel="GAIN RELATIVE TO DC / dB" description="Three second-order responses comparing passive loading, unity Sallen-Key and Butterworth damping."/></Figure>;
}
export function SallenStepFigure(){
 return <Figure plot caption="Normalized step responses of a single two-pole section. The Q = 2 response overshoots by 44.4%; the Butterworth response by 4.32%. Divide the horizontal axis by f0 to obtain seconds. The plot assumes linear operation and zero initial capacitor energy."><Plot curves={[.5,Math.SQRT1_2,2].map((q,i)=>({name:'Q = '+q.toFixed(3),color:[gray,green,orange][i],points:Array.from({length:601},(_,n)=>[n/120,secondOrderStep({u:2*Math.PI*n/120,q})] as [number,number])}))} xRange={[0,5]} yRange={[0,1.6]} xLabel="TIME × NATURAL FREQUENCY" yLabel="OUTPUT / FINAL VALUE" description="Critical, Butterworth and high-Q step responses showing increasing overshoot and ringing."/></Figure>;
}
