import {channel, bodyThreshold, bisect} from './fet.mjs';
const positive=(...xs)=>{if(!xs.every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Positive finite parameters required');};
const nonnegative=(...xs)=>{if(!xs.every(x=>Number.isFinite(x)&&x>=0))throw new RangeError('Nonnegative finite parameters required');};
export const parallelR=(...rs)=>1/rs.reduce((g,r)=>g+1/r,0);

// Fixed gate, drain and source resistors. Bulk at ground when gamma is nonzero.
export function bias({vdd=5,vg=2,rd=2000,rs=0,k=.002,vt=1,lambda=0,gamma=0,phi2=.6}={}){
 positive(vdd,k,phi2);nonnegative(vg,rd,rs,lambda,gamma);
 const point=i=>{const vs=i*rs,vd=vdd-i*rd,vth=bodyThreshold(vt,gamma,phi2,vs);return {vs,vd,vgs:vg-vs,vds:Math.max(0,vd-vs),vth};};
 const residual=i=>{const p=point(i);return i-channel(p.vgs,p.vds,k,p.vth,lambda).id;};
 const id=rd+rs===0?channel(vg,vdd,k,vt,lambda).id:bisect(residual,0,vdd/(rd+rs));
 const p=point(id),m=channel(p.vgs,p.vds,k,p.vth,lambda);
 return {...p,...m,id,u:p.vgs-p.vth,margin:p.vds-Math.max(0,p.vgs-p.vth),gmb:m.gm*gamma/(2*Math.sqrt(phi2+p.vs))};
}
export function diodeVoltage({iref=.001,k=.002,vt=1,lambda=0}={}){
 positive(iref,k);nonnegative(lambda);
 return bisect(v=>channel(v,v,k,vt,lambda).id-iref,Math.max(0,vt),Math.max(0,vt)+Math.sqrt(2*iref/k)+1);
}
export function mirror({iref=.001,k=.002,vt=1,lambda=.02,ratio=1,deltaVt=0,vout=2,rs=0}={}){
 positive(iref,k,ratio);nonnegative(lambda,vout,rs);
 const vref=diodeVoltage({iref,k,vt,lambda})+iref*rs;
 const model=i=>channel(vref-i*rs,Math.max(0,vout-i*rs),k*ratio,vt+deltaVt,lambda);
 const id=rs===0?model(0).id:bisect(i=>i-model(i).id,0,vout/rs);
 const m=model(id);return {...m,id,vref,vs:id*rs,error:id/(ratio*iref)-1,u:vref-id*rs-vt-deltaVt};
}
// Two-node KCL with drain and source conductance; bulk AC grounded.
export function csGain({gm=.002,gmb=0,gds=0,rd=2000,rl=Infinity,rs=0}={}){
 nonnegative(gm,gmb,gds,rs);if(rd<=0||rl<=0)throw new RangeError('Positive load resistance required');
 const load=parallelR(rd,rl);
 return -gm*load/(1+gds*load+(gm+gmb+gds)*rs);
}
export function follower({vdd=5,vg=3,k=.002,vt=1,lambda=0,gamma=0,phi2=.6,ibias=0,rl=2000}={}){
 positive(vdd,k,phi2);nonnegative(vg,lambda,gamma,ibias);if(rl<=0)throw new RangeError('Positive load required');
 const at=vs=>{const vth=bodyThreshold(vt,gamma,phi2,vs);return {...channel(vg-vs,vdd-vs,k,vth,lambda),vth};};
 const fn=vs=>ibias+vs/rl-at(vs).id;
 if(fn(0)>0)return {valid:false,vs:NaN,id:NaN,gain:NaN,rout:NaN,region:'insufficient gate drive'};
 const vs=bisect(fn,0,vdd),m=at(vs),gmb=m.gm*gamma/(2*Math.sqrt(phi2+vs));
 return {...m,valid:true,vs,vgs:vg-vs,vds:vdd-vs,gmb,gain:m.gm/(m.gm+gmb+m.gds+1/rl),rout:1/(m.gm+gmb+m.gds),u:vg-vs-m.vth};
}
export function commonGate({gm=.002,gmb=0,gds=.00002,rd=10000}={}){
 positive(gm,rd);nonnegative(gmb,gds);
 return {gain:(gm+gmb+gds)/(1/rd+gds),rin:(1+gds*rd)/(gm+gmb+gds)};
}
export function cascode({gm1=.002,gm2=.002,gmb2=0,ro1=50000,ro2=50000,rl=Infinity}={}){
 positive(gm1,gm2,ro1,ro2);nonnegative(gmb2);if(rl<=0)throw new RangeError('Positive load required');
 const g=gm2+gmb2,rout=ro1+ro2+g*ro1*ro2;
 const gm=gm1*(g+1/ro2)/(g+1/ro1+1/ro2);
 return {rout,gm,gain:-gm*parallelR(rout,rl)};
}
// Matched square-law pair: exact current steering, lambda=0, equal source resistors.
// Validity is checked against resistor-load and tail-source compliance afterwards.
export function differential({tail=.002,k=.002,vdiff=0,rs=0,vc=2.5,vdd=5,rd=1000,vt=1,tailMin=.3}={}){
 positive(tail,k,vdd,rd);nonnegative(rs,tailMin);
 const maxDiff=Math.sqrt(2*tail/k)+tail*rs;
 const eq=i=>Math.sqrt(2*i/k)-Math.sqrt(2*(tail-i)/k)+(2*i-tail)*rs-vdiff;
 const i1=vdiff>=maxDiff?tail:vdiff<=-maxDiff?0:bisect(eq,0,tail),i2=tail-i1;
 const v1=vc+vdiff/2,v2=vc-vdiff/2;
 const vs=i1>0?v1-vt-Math.sqrt(2*i1/k)-i1*rs:v2-vt-Math.sqrt(2*i2/k)-i2*rs;
 const d1=vdd-i1*rd,d2=vdd-i2*rd;
 const margin1=d1-(vs+i1*rs)-Math.sqrt(2*i1/k),margin2=d2-(vs+i2*rs)-Math.sqrt(2*i2/k);
 const gm=Math.sqrt(k*tail),gmDiff=gm/(1+gm*rs);
 return {i1,i2,vs,d1,d2,out:d2-d1,gm,gmDiff,maxDiff,margin1,margin2,valid:vs>=tailMin&&(i1===0||margin1>=0)&&(i2===0||margin2>=0)};
}
