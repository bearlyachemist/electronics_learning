function positive(...xs){if(!xs.every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Expected positive finite values.');}
export function thevenin({v1,v2,r1,r2,rl=Infinity}) {
 positive(r1,r2);if(![v1,v2].every(Number.isFinite)||!(rl>0))throw new RangeError('Invalid source or load.');
 const rth=1/(1/r1+1/r2),vth=(v1/r1+v2/r2)*rth;
 const out=rl===Infinity?vth:vth/(1+rth/rl),il=rl===Infinity?0:out/rl;
 return {vth,rth,out,il,i1:(v1-out)/r1,i2:(v2-out)/r2,isc:vth/rth};
}
export const VT=0.02585;
export const IS=1e-12;
export function diode({iq,n=1,dv=0}) {
 positive(iq,n);if(!Number.isFinite(dv))throw new RangeError('Invalid voltage change.');
 const scale=n*VT, vq=scale*Math.log1p(iq/IS),gd=(iq+IS)/scale,rd=1/gd;
 const exact=(iq+IS)*Math.expm1(dv/scale),linear=gd*dv;
 return {vq,rd,gd,exact,linear,total:iq+exact,error:exact===0?0:Math.abs((linear-exact)/exact)};
}
export function thermal({current,resistance,theta,capacity,ambient,time}) {
 positive(resistance,theta,capacity);
 if(![current,ambient,time].every(Number.isFinite)||current<0||time<0)throw new RangeError('Invalid current, ambient, or time.');
 const power=current*current*resistance,tau=theta*capacity,steady=ambient+power*theta;
 return {power,tau,steady,temperature:ambient+power*theta*(-Math.expm1(-time/tau)),energy:power*time};
}

