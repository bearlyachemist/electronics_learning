import {C,add,div,mag,phase} from './ac.mjs';
// Original normalized teaching responses used by the practical-extension figures.
export function squareSeries(cycles,terms=7){
 if(!Number.isFinite(cycles)||!Number.isInteger(terms)||terms<1||terms>1000)throw new RangeError('Finite time and 1–1000 terms required');
 let value=0;for(let m=0;m<terms;m++){const n=2*m+1;value+=Math.sin(2*Math.PI*n*cycles)/n;}return 4/Math.PI*value;
}
export function allPass(x){
 if(!Number.isFinite(x)||x<0)throw new RangeError('Nonnegative normalized frequency required');
 const h=div(C(1,-x),C(1,x));return {h,magnitude:mag(h),phase:phase(h),delayInTau:2/(1+x*x)};
}
export function stateVariable(x,q){
 if(!Number.isFinite(x)||x<0||!Number.isFinite(q)||q<=0)throw new RangeError('Nonnegative frequency and positive Q required');
 const d=C(1-x*x,x/q),hp=div(C(-x*x),d),bp=div(C(0,x),d),lp=div(C(1),d);
 return {hp,bp,lp,notch:add(hp,lp)};
}
export function railGmSplit(x){if(!Number.isFinite(x)||x<0||x>1)throw new RangeError('Current fraction must be within [0,1]');return Math.sqrt(x)+Math.sqrt(1-x);}
