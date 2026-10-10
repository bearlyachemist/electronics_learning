export const C=(re=0,im=0)=>({re,im});
export const add=(a,b)=>C(a.re+b.re,a.im+b.im);
export const sub=(a,b)=>C(a.re-b.re,a.im-b.im);
export const mul=(a,b)=>C(a.re*b.re-a.im*b.im,a.re*b.im+a.im*b.re);
export const scale=(a,k)=>C(a.re*k,a.im*k);
export const conj=a=>C(a.re,-a.im);
export const mag=a=>Math.hypot(a.re,a.im);
export const phase=a=>Math.atan2(a.im,a.re)*180/Math.PI;
export const polar=(r,deg)=>C(r*Math.cos(deg*Math.PI/180),r*Math.sin(deg*Math.PI/180));
export function div(a,b){const d=b.re*b.re+b.im*b.im;if(!Number.isFinite(d)||d===0)throw new RangeError('Singular complex denominator');return C((a.re*b.re+a.im*b.im)/d,(a.im*b.re-a.re*b.im)/d);}
export const parallel=(a,b)=>div(mul(a,b),add(a,b));
export const db=z=>20*Math.log10(mag(z));
const pos=(...v)=>{if(!v.every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Positive finite values required');};
export function impedance({r=100,l=.01,c=1e-6,hz=1000}={}){pos(r,l,c,hz);const w=2*Math.PI*hz;return C(r,w*l-1/(w*c));}
export function power({v=10,r=100,x=100}={}){pos(v,r);if(!Number.isFinite(x))throw new RangeError('Finite reactance required');const z=C(r,x),current=div(C(v),z),s=mul(C(v),conj(current));return {z,current,p:s.re,q:s.im,apparent:mag(s),pf:s.re/mag(s),angle:phase(z)};}
export function rcResponse({hz=1000,fc=1000,high=false}={}){pos(hz,fc);const x=hz/fc;return div(high?C(0,x):C(1),C(1,x));}
export function bandResponse({hz=1000,low=100,high=10000,loaded=false}={}){pos(hz,low,high);if(high<low)throw new RangeError('Upper RC corner must not be below lower corner');const x=hz/low,y=hz/high;return div(C(0,x),C(1-x*y,x+(loaded?2:1)*y));}
export function notchResponse({hz=1000,f0=1000}={}){pos(hz,f0);const x=hz/f0;return div(C(1-x*x),C(1-x*x,4*x));}
export function poleResponse({hz=1000,fc=1000,count=1}={}){pos(hz,fc);if(!Number.isInteger(count)||count<1||count>4)throw new RangeError('One to four poles');let h=C(1);for(let k=0;k<count;k++)h=mul(h,rcResponse({hz,fc}));return h;}
export function resonance({r=10,l=.01,c=1e-6,hz=1000,v=1}={}){pos(r,l,c,hz,v);const z=impedance({r,l,c,hz}),i=div(C(v),z),w=2*Math.PI*hz,f0=1/(2*Math.PI*Math.sqrt(l*c));return {z,i,vr:scale(i,r),vl:mul(i,C(0,w*l)),vc:mul(i,C(0,-1/(w*c))),f0,q:2*Math.PI*f0*l/r,bw:r/(2*Math.PI*l)};}
export function lcResponse({hz=1000,l=.01,c=1e-6,rs=10,rl=1000}={}){pos(hz,l,c,rs,rl);const w=2*Math.PI*hz;return div(C(1),C(1+rs/rl-w*w*l*c,w*(rs*c+l/rl)));}
export function acThevenin({hz=1000,r=1000,c=100e-9,rl=1000,vs=1}={}){pos(hz,r,c,rl,vs);const zc=C(0,-1/(2*Math.PI*hz*c)),vth=scale(div(zc,add(C(r),zc)),vs),zth=parallel(C(r),zc),out=mul(vth,div(C(rl),add(zth,C(rl))));return {vth,zth,out};}
export function bypass({vs=12,r=100,c=1000e-6,t=.1,discharge=false}={}){pos(vs,r,c);if(!Number.isFinite(t)||t<0)throw new RangeError('Nonnegative time required');const rd=1/(1/r+1/10),tau=(discharge?rd:r)*c,v=discharge?vs*Math.exp(-t/tau):vs*(1-Math.exp(-t/tau));return {v,current:discharge?vs/rd*Math.exp(-t/tau):vs/r*Math.exp(-t/tau),tau};}



// Two-terminal networks built from ideal R, L and C. 'series-rlc' uses all three; others ignore unused values.
const topologies=['r','c','l','series-rc','series-rl','series-rlc','parallel-rc','parallel-rl','parallel-rlc'];
export function network({topology='series-rc',r=100,l=.01,c=1e-6,hz=1000}={}){
 pos(r,l,c,hz);if(!topologies.includes(topology))throw new RangeError('Unknown topology');
 const w=2*Math.PI*hz,zr=C(r),zl=C(0,w*l),zc=C(0,-1/(w*c));
 const z={r:zr,c:zc,l:zl,'series-rc':add(zr,zc),'series-rl':add(zr,zl),'series-rlc':add(add(zr,zl),zc),
  'parallel-rc':parallel(zr,zc),'parallel-rl':parallel(zr,zl),'parallel-rlc':div(C(1),add(add(C(1/r),div(C(1),zl)),div(C(1),zc)))}[topology];
 return {z,magnitude:mag(z),phase:phase(z),admittance:div(C(1),z),xl:w*l,xc:1/(w*c)};
}
// Sum of two same-frequency sinusoids a cos(wt + p): add phasors, then convert back.
export function phasorSum({a1=1,p1=0,a2=1,p2=90}={}){
 if(![a1,p1,a2,p2].every(Number.isFinite))throw new RangeError('Finite phasors required');
 const s=add(polar(a1,p1),polar(a2,p2));return {sum:s,amplitude:mag(s),phase:mag(s)===0?0:phase(s),at:t=>a1*Math.cos(t+p1*Math.PI/180)+a2*Math.cos(t+p2*Math.PI/180)};
}
// RMS source across R in series with ideal reactance x (positive inductive, negative capacitive).
// Instantaneous quantities use peak values = √2 × RMS.
export function powerWave({vrms=10,r=100,x=100,hz=50}={}){
 const d=power({v:vrms,r,x}),w=2*Math.PI*hz,ip=Math.SQRT2*mag(d.current),th=phase(d.current)*Math.PI/180;
 return {...d,irms:mag(d.current),vt:t=>Math.SQRT2*vrms*Math.cos(w*t),it:t=>ip*Math.cos(w*t+th),pt:t=>Math.SQRT2*vrms*Math.cos(w*t)*ip*Math.cos(w*t+th)};
}
// Series R–L load with optional shunt correction capacitor, both across an ideal RMS source.
export function correction({vrms=230,hz=50,r=20,l=.05,c=0}={}){
 pos(vrms,hz,r,l);if(!Number.isFinite(c)||c<0)throw new RangeError('Nonnegative capacitance required');
 const w=2*Math.PI*hz,load=div(C(vrms),C(r,w*l)),cap=C(0,w*c*vrms),line=add(load,cap),s=mul(C(vrms),conj(line));
 return {load,cap,line,p:s.re,q:s.im,pf:s.re/mag(s),ideal:l/(r*r+w*w*l*l)};
}
// Single RC section with a resistive load across its output.
export function loadedRC({r=10e3,c=10e-9,rl=Infinity,hz=1000,high=false}={}){
 pos(r,c,hz);if(!(rl>0))throw new RangeError('Load must be positive');
 const zc=C(0,-1/(2*Math.PI*hz*c)),zr=C(r),shunt=high?zr:zc,series=high?zc:zr;
 const zs=rl===Infinity?shunt:parallel(shunt,C(rl));return div(zs,add(series,zs));
}
// A supply with series resistance and wiring inductance, optionally bypassed at the load by C + ESR + ESL.
export function supplyImpedance({rs=.2,ls=200e-9,c=10e-6,esr=.01,esl=2e-9,hz=1e5,bypassed=true}={}){
 pos(rs,ls,c,esr,esl,hz);const w=2*Math.PI*hz,source=C(rs,w*ls);
 return bypassed?parallel(source,C(esr,w*esl-1/(w*c))):source;
}
// Parallel tank: inductor with series winding resistance rl, ideal capacitor in parallel.
export function tank({l=100e-6,c=1e-9,rw=5,hz=1e5}={}){
 pos(l,c,rw,hz);const w=2*Math.PI*hz,z=parallel(C(rw,w*l),C(0,-1/(w*c)));
 const f0=1/(2*Math.PI*Math.sqrt(l*c)),q=2*Math.PI*f0*l/rw;return {z,f0,q,rd:l/(c*rw)};
}

// Two directly connected RC low-pass sections, unloaded at the final output.
// R2 = k R1 and C2 = C1/k: both time constants are tau, but their impedances differ.
export function rcCascade({hz=1000,tau=1e-3,k=1,buffered=false}={}){
 pos(hz,tau,k);const x=2*Math.PI*hz*tau;
 return div(C(1),C(1-x*x,(2+(buffered?0:1/k))*x));
}

// Unit step of H(s) = 1/(1 + s/(Q wn) + (s/wn)^2), initially at rest.
// Use normalized time u = wn t. Covers under-, critical-, and overdamping.
export function secondOrderStep({u=0,q=1}={}){
 pos(q);if(!Number.isFinite(u)||u<0)throw new RangeError('Nonnegative normalized time required');
 const z=1/(2*q);
 if(Math.abs(z-1)<1e-8)return 1-(1+u)*Math.exp(-u);
 if(z<1){const b=Math.sqrt(1-z*z);return 1-Math.exp(-z*u)*(Math.cos(b*u)+z/b*Math.sin(b*u));}
 // Separate negative exponentials avoid overflow in cosh at long times.
 const b=Math.sqrt(z*z-1),slow=-1/(z+b),fast=-(z+b);
 return 1-((z+b)*Math.exp(slow*u)-(z-b)*Math.exp(fast*u))/(2*b);
}
