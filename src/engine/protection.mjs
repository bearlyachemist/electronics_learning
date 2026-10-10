function positive(...xs){if(!xs.every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Positive finite parameters required');}
function nonnegative(...xs){if(!xs.every(x=>Number.isFinite(x)&&x>=0))throw new RangeError('Nonnegative finite parameters required');}

// Four reverse-polarity topologies driving a constant-current load (while output is positive).
// Source resistance only matters for the shunt-diode fault, where it limits current until a fuse opens.
export function polarity({topology='series',vin=12,load=1,reversed=false,vf=.45,rds=.02,rs=.05}={}){
 positive(vin,rs);nonnegative(load,vf,rds);
 if(!['series','shunt','pmos','bridge'].includes(topology))throw new RangeError('Unknown topology');
 let out=0,loss=0,fault=0;
 if(topology==='bridge'){out=Math.max(0,vin-2*vf);loss=out>0?2*vf*load:0;}
 else if(reversed){if(topology==='shunt'){out=-vf;fault=(vin-vf)/rs;loss=vf*fault;}}
 else if(topology==='series'){out=Math.max(0,vin-vf);loss=out>0?vf*load:0;}
 else if(topology==='shunt')out=vin;
 else {out=Math.max(0,vin-load*rds);loss=load*load*rds;}
 const delivered=Math.max(0,out)*load;
 return {out,loss,fault,delivered,efficiency:delivered>0?delivered/(delivered+loss):0};
}

// Hot-plug of an ideal step source into series R–L, shunt C, resistive load.
// Optional ideal-drop diode across the series branch (anode at output, cathode at input)
// conducts when the output exceeds the input by vf. Backward Euler with explicit state switching.
export function hotPlug({vin=12,l=10e-6,c=22e-6,r=.1,rl=100,diode=false,vf=.7,end,steps=4000}={}){
 positive(vin,l,c,r,rl);nonnegative(vf);
 const z0=Math.sqrt(l/c),f0=1/(2*Math.PI*Math.sqrt(l*c));
 const tEnd=end??3/f0;positive(tEnd);if(!Number.isInteger(steps)||steps<200)throw new RangeError('Need at least 200 steps');
 const dt=tEnd/steps,clamp=vin+vf,points=[{t:0,v:0,i:0,id:0}];
 let v=0,i=0,on=false,peakV=0,peakI=0,clampCharge=0;
 for(let k=1;k<=steps;k++){
  // Off state: solve [1+dt r/L, dt/L; -dt/C, 1+dt/(RL C)] [i;v] = [i+dt vin/L; v]
  const a=1+dt*r/l,b=dt/l,cc=-dt/c,d=1+dt/(rl*c),det=a*d-b*cc;
  let ni=((i+dt*vin/l)*d-b*v)/det,nv=(a*v-cc*(i+dt*vin/l))/det,id=0;
  if(diode&&(nv>clamp||on)){
   const ci=(i-dt*vf/l)/(1+dt*r/l),cid=ci-clamp/rl;
   if(cid>0){ni=ci;nv=clamp;id=cid;on=true;}else on=false;
  }
  i=ni;v=nv;peakV=Math.max(peakV,v);peakI=Math.max(peakI,Math.abs(i));clampCharge+=id*dt;
  points.push({t:k*dt,v,i,id});
 }
 return {points,peakV,peakI,z0,f0,zeta:(r+l/(rl*c))/(2*z0),clampCharge,inrushEstimate:vin/z0};
}

// Discontinuous-mode boost cycle: inductor charged from vin for ton, released through a diode into vout.
export function boostCycle({vin=5,vout=12,l=100e-6,ton=10e-6,hz=20e3,vf=.4}={}){
 positive(vin,vout,l,ton,hz);nonnegative(vf);
 if(vout+vf<=vin)throw new RangeError('Output plus diode drop must exceed input');
 const ipk=vin*ton/l,toff=l*ipk/(vout+vf-vin),period=1/hz,continuous=ton+toff>period;
 const stored=.5*l*ipk*ipk,qOut=ipk*toff/2,eOut=vout*qOut,eDiode=vf*qOut,eIn=vin*ipk*(ton+toff)/2;
 return {ipk,toff,period,continuous,stored,eIn,eOut,eDiode,pOut:eOut*hz,iOut:qOut*hz,
  current:t=>{const u=((t%period)+period)%period;return u<ton?vin*u/l:u<ton+toff?ipk-(vout+vf-vin)*(u-ton)/l:0;},
  node:t=>{const u=((t%period)+period)%period;return u<ton?0:u<ton+toff?vout+vf:vin;}};
}

// RC timing node charged through r1 and discharged through r2 alone or with a bypass diode.
export function bypassRC({vs=5,r1=100e3,r2=100e3,c=1e-6,vf=.6,rdiode=10,diode=true,t=0,charging=true,v0}={}){
 positive(vs,r1,r2,c,rdiode);nonnegative(vf,t);
 if(charging){const start=v0??0,tau=r1*c;return {v:vs+(start-vs)*Math.exp(-t/tau),tau};}
 // Discharge toward 0 V through r2, plus through the diode while v exceeds vf.
 const start=v0??vs,tauR=r2*c;
 if(!diode||start<=vf)return {v:start*Math.exp(-t/tauR),tau:tauR};
 const rp=1/(1/r2+1/rdiode),target=vf*rp/rdiode,tau=rp*c;
 const tCross=tau*Math.log((start-target)/(vf-target));
 if(t<=tCross)return {v:target+(start-target)*Math.exp(-t/tau),tau,tCross};
 return {v:vf*Math.exp(-(t-tCross)/tauR),tau,tCross};
}
