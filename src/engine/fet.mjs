/** SI units. Educational n-channel long-channel model; not a power-device SPICE model. */
export function channel(vgs,vds,k,vt,lambda=0){
 if(k<=0||vds<0||lambda<0)throw new RangeError('Invalid parameters');
 const u=vgs-vt;if(u<=0)return {id:0,gm:0,gds:0,region:'cutoff'};
 const sat=vds>=u,b=sat?k*u*u/2:k*(u*vds-vds*vds/2);
 return {id:b*(1+lambda*vds),gm:k*(sat?u:vds)*(1+lambda*vds),gds:(sat?0:k*(u-vds))*(1+lambda*vds)+b*lambda,region:sat?'saturation':'ohmic'};
}
export function jfet(vgs,vds,idss=.008,vp=-4,lambda=0){
 if(vgs>0||vp>=0||idss<=0)throw new RangeError('Reverse-biased JFET gate required');
 return channel(vgs,vds,2*idss/(vp*vp),vp,lambda);
}
export function bisect(fn,lo,hi){
 if(fn(lo)*fn(hi)>0)throw new RangeError('Root not bracketed');
 for(let i=0;i<90;i++){const m=(lo+hi)/2;if(fn(m)>0)hi=m;else lo=m;}return (lo+hi)/2;
}
export function selfBias({vdd=12,rd=1000,rs=500,idss=.008,vp=-4,lambda=0}={}){
 if(vdd<=0||rs<0||rd<0)throw new RangeError('Invalid bias circuit');
 if(rd+rs===0)return {vgs:0,vds:vdd,vd:vdd,vs:0,...jfet(0,vdd,idss,vp,lambda)};
 const id=bisect(i=>i-jfet(-i*rs,Math.max(0,vdd-i*(rd+rs)),idss,vp,lambda).id,0,vdd/(rd+rs));
 const vgs=-id*rs,vds=vdd-id*(rd+rs);
 return {vgs,vds,vd:vdd-id*rd,vs:id*rs,...jfet(vgs,vds,idss,vp,lambda)};
}
export function bodyThreshold(vt,gamma,phi2,vsb){return vt+gamma*(Math.sqrt(phi2+vsb)-Math.sqrt(phi2));}
export function stage(gm,rd,rl,rs=0){const load=1/(1/rd+1/rl);return {gain:-gm*load/(1+gm*rs),follower:gm*load/(1+gm*load),load};}
// Midband voltage gains turn incremental gate charge into an input capacitance estimate.
// This freezes the gains; it is not the full multi-pole high-frequency solution.
export function gateLoading({gm,rd,rl,rs=0,cgs,cgd}){
 const {gain}=stage(gm,rd,rl,rs),sourceGain=gm*rs/(1+gm*rs);
 return {gain,sourceGain,cin:cgs*(1-sourceGain)+cgd*(1-gain)};
}
export function wien(f,r,c){const x=2*Math.PI*f*r*c;return {magnitude:x/Math.hypot(1-x*x,3*x),phase:Math.atan2(1-x*x,3*x)*180/Math.PI};}
export function switchLoss({v=24,i=5,r=.02,d=.5,f=100000,tr=30e-9,tf=20e-9,qg=30e-9,vg=10}={}){
 return {conduction:i*i*r*d,overlap:.5*v*i*(tr+tf)*f,driver:qg*vg*f};
}
export function sharing(total,r1,r2,t1=25,t2=25,alpha=.004,ballast=0){
 const a=r1*(1+alpha*(t1-25))+ballast,b=r2*(1+alpha*(t2-25))+ballast;
 return {i1:total*b/(a+b),i2:total*a/(a+b),r1:a,r2:b};
}
export function gateTrace(q,qpre,qgd,qtotal,plateau=4,drive=10){
 if(q<=qpre)return plateau*q/qpre;
 if(q<=qpre+qgd)return plateau;
 return plateau+(drive-plateau)*(q-qpre-qgd)/(qtotal-qpre-qgd);
}

