import {C,add,mul,div,mag,phase} from './ac.mjs';
const pos=(...v)=>{if(!v.every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Positive finite parameters required');};
export function closedLoop({hz=0,a0=100000,gbw=1e6,noiseGain=11,signalGain=11,pole2=Infinity}={}){
 pos(a0,gbw,noiseGain);if(hz<0||pole2<=0)throw new RangeError('Invalid frequency');
 let a=div(C(a0),C(1,hz/(gbw/a0)));
 if(Number.isFinite(pole2))a=div(a,C(1,hz/pole2));
 const loop=div(a,C(noiseGain)),h=div(mul(C(signalGain/noiseGain),a),add(C(1),loop));
 return {a,loop,h,magnitude:mag(h),phase:phase(h)};
}
export function dcErrors({vin=.1,rf=100000,rg=10000,a0=100000,vos=.0001,ibPlus=0,ibMinus=0,rsource=0,low=-4.5,high=4.5}={}){
 pos(rf,rg,a0);if(rsource<0||low>=high)throw new RangeError('Invalid circuit limits');
 const ng=1+rf/rg,raw=ng*(vin+vos-ibPlus*rsource+ibMinus*(rf*rg/(rf+rg)))/(1+ng/a0);
 return {ng,raw,out:Math.max(low,Math.min(high,raw)),clipped:raw<low||raw>high,ideal:ng*vin};
}
export function noise({en=5e-9,inNoise=1e-12,rs=10000,t=300,bw=10000}={}){
 pos(t,bw);if([en,inNoise,rs].some(v=>v<0))throw new RangeError('Nonnegative noise parameters required');
 const resistor=Math.sqrt(4*1.380649e-23*t*rs),current=inNoise*rs,density=Math.hypot(en,resistor,current);
 return {resistor,current,density,rms:density*Math.sqrt(bw)};
}
export function sallenKey({hz=1000,r1=10000,r2=10000,c1=10e-9,c2=10e-9,gain=1}={}){
 pos(r1,r2,c1,c2,gain);if(hz<0)throw new RangeError('Nonnegative frequency required');
 // C1: first RC junction to output; C2: noninverting input to ground.
 const a=r1*r2*c1*c2,b=c2*(r1+r2)+c1*r1*(1-gain),w=2*Math.PI*hz;
 const f0=1/(2*Math.PI*Math.sqrt(a)),q=Math.sqrt(a)/b;
 const h=div(C(gain),C(1-a*w*w,b*w));return {h,f0,q,stable:b>0,magnitude:mag(h),phase:phase(h)};
}
export function tia({hz=1000,rf=1e6,cf=10e-12,cin=50e-12,a0=100000,gbw=1e6}={}){
 pos(rf,cf,a0,gbw);if(hz<0||cin<0)throw new RangeError('Invalid frequency or capacitance');
 const w=2*Math.PI*hz,zf=div(C(rf),C(1,w*rf*cf)),ng=add(C(1),mul(zf,C(0,w*cin)));
 const a=div(C(a0),C(1,hz/(gbw/a0)));
 const h=div(mul(C(-1),zf),add(C(1),div(ng,a)));
 return {h,noiseGain:ng,magnitude:mag(h),phase:phase(h)};
}
