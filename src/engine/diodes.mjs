const q=1.602176634e-19,eps=11.7*8.8541878128e-12;
function positive(...xs){if(!xs.every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Positive finite parameters required');}
export function junction({na=1e22,nd=1e22,bias=0,area=1e-8}={}){
 positive(na,nd,area);if(!Number.isFinite(bias))throw new RangeError('Finite bias required');
 const vt=.025852,ni=1e16,built=vt*Math.log(na*nd/(ni*ni));
 if(built<=bias)throw new RangeError('Depletion approximation requires bias below built-in potential');
 const width=Math.sqrt(2*eps/q*(1/na+1/nd)*(built-bias)),xp=width*nd/(na+nd),xn=width*na/(na+nd);
 return {built,width,xp,xn,capacitance:eps*area/width,field:2*(built-bias)/width};
}
export function diodePoint({vs=5,r=1000,is=1e-12,n=1.5,vt=.025852}={}){
 positive(r,is,n,vt);if(!Number.isFinite(vs)||vs<0)throw new RangeError('Nonnegative supply required');
 let lo=0,hi=vs;
 for(let k=0;k<90;k++){const v=(lo+hi)/2;if(is*Math.expm1(v/(n*vt))>(vs-v)/r)hi=v;else lo=v;}
 const voltage=(lo+hi)/2,current=(vs-voltage)/r;
 return {voltage,current,rd:n*vt/(current+is),power:voltage*current};
}
// Backward Euler of a resistively fed, fixed-drop rectifier and parallel RC load.
// Each step solves conduction consistently; no ideal peak-hold/inrush singularity.
export function rectifier({rms=9,hz=50,rs=10,rl=500,c=470e-6,vf=.7,bridge=true,steps=1000,cycles=40}={}){
 positive(rms,hz,rs,rl,c);if(!Number.isFinite(vf)||vf<0||!Number.isInteger(steps)||steps<100||!Number.isInteger(cycles)||cycles<3)throw new RangeError('Invalid rectifier settings');
 const dt=1/(hz*steps),peak=Math.SQRT2*rms,points=[];let v=0;
 for(let k=0;k<=steps*cycles;k++){
 const t=k*dt,ac=peak*Math.sin(2*Math.PI*hz*t),drive=Math.max(0,(bridge?Math.abs(ac):ac)-(bridge?2:1)*vf);
 const off=v/(1+dt/(rl*c)),on=(v+dt*drive/(rs*c))/(1+dt/c*(1/rs+1/rl));
 v=drive>off?on:off;const current=Math.max(0,(drive-v)/rs);
 if(k>=steps*(cycles-2))points.push({t:(k-steps*(cycles-2))*dt,ac,drive,v,current});
 }
 const last=points.slice(steps),values=last.map(p=>p.v);
 return {points,min:Math.min(...values),max:Math.max(...values),mean:values.reduce((a,b)=>a+b,0)/values.length,peakCurrent:Math.max(...last.map(p=>p.current)),ripple:Math.max(...values)-Math.min(...values)};
}
export function zener({vin=12,r=330,load=.01,vz=5.1}={}){
 positive(r,vz);if(![vin,load].every(x=>Number.isFinite(x)&&x>=0))throw new RangeError('Nonnegative voltage/current required');
 const out=Math.min(vz,Math.max(0,vin-r*load)),feed=(vin-out)/r,iz=Math.max(0,feed-load);
 return {out,feed,iz,pz:out*iz,pr:feed*feed*r,regulated:vin>=vz&&feed>=load};
}
export function regulator({vin=9,target=5,dropout=.5,load=.1,theta=60,ambient=25}={}){
 positive(target,theta);if(![vin,dropout,load,ambient].every(Number.isFinite)||Math.min(vin,dropout,load)<0)throw new RangeError('Invalid regulator settings');
 const out=Math.max(0,Math.min(target,vin-dropout)),power=(vin-out)*load;
 return {out,power,tj:ambient+theta*power,headroom:vin-target-dropout};
}
export function limiter({vin,r=1000,rail=3.3,vf=.3}){
 positive(r,rail);if(![vin,vf].every(Number.isFinite)||vf<0)throw new RangeError('Invalid limiter');
 const out=Math.max(-vf,Math.min(rail+vf,vin));return {out,current:(vin-out)/r};
}
export function flyback({l=.1,r=120,i0=.1,clamp=.7,t=0,supply=12}={}){
 positive(l,r,clamp);if(![i0,t,supply].every(x=>Number.isFinite(x)&&x>=0))throw new RangeError('Nonnegative conditions required');
 const tau=l/r,stop=tau*Math.log1p(r*i0/clamp),current=t>=stop?0:Math.max(0,(i0+clamp/r)*Math.exp(-t/tau)-clamp/r);
 const charge=l/r*(i0-clamp/r*Math.log1p(r*i0/clamp)),energy=.5*l*i0*i0,clampEnergy=clamp*charge;
 return {current,stop,energy,clampEnergy,copperEnergy:energy-clampEnergy,switchVoltage:supply+clamp};
}

