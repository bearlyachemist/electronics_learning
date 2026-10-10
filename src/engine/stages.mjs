// Multi-transistor building blocks: mirrors, differential pairs, push–pull stages, compound pairs,
// paralleled transistors, and small-signal frequency analysis by complex nodal analysis.
import {ebersMoll,VT300} from './bjt.mjs';
import {C,add,sub,mul,div,mag} from './ac.mjs';
const VT=VT300;
function positive(...xs){if(!xs.every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Positive finite parameters required');}
function bisect(f,a,b,n=60){let fa=f(a);for(let i=0;i<n;i++){const m=(a+b)/2,fm=f(m);if((fm>0)===(fa>0)){a=m;fa=fm;}else b=m;}return (a+b)/2;}
const em=(vbe,vbc,p)=>ebersMoll({vbe,vbc,...p});

/* ---------- Current mirrors ---------- */
// Types: 'basic' (optionally degenerated or ratioed with re1/re2/area), 'widlar' (re1 = 0, re2 = re),
// 'helper' (beta-helper follower supplies the bases), 'wilson'. Reference resistor r from vcc.
export function mirror({type='basic',vcc=15,r=14.3e3,vout=5,beta=100,va=100,is=1e-14,re=0,re2,area=1}={}){
 positive(vcc,r,beta,is,area);if(!(va>0))throw new RangeError('Early voltage must be positive');
 const p={is,betaF:beta,betaR:2,va},p2={...p,is:is*area};
 const solveVbe=(vb,rEm,vbc,pp)=>rEm===0?vb:bisect(v=>v+em(v,vbc(v),pp).ie*rEm-vb,-1,vb);
 if(type==='basic'||type==='widlar'){
  const r1=type==='widlar'?0:re,r2=type==='widlar'?re:(re2??re);
  const parts=vb=>{const v1=solveVbe(vb,r1,()=>0,p),q1=em(v1,0,p),v2=solveVbe(vb,r2,v=>vb-vout,p2),q2=em(v2,vb-vout,p2);return {q1,q2};};
  const vb=bisect(vb=>{const {q1,q2}=parts(vb);return (vcc-vb)/r-q1.ic-q1.ib-q2.ib;},0,Math.min(vcc,3));
  const {q1,q2}=parts(vb);return {iref:(vcc-vb)/r,iout:q2.ic,ic1:q1.ic,vb};
 }
 if(type==='helper'){
  // Q3 (collector at vcc) is a follower from Q1's collector node X to the common base node.
  const parts=vb=>{let vx=vb+.6,q1,q2,q3,v3=.6;for(let k=0;k<3;k++){q1=em(vb,vb-vx,p);q2=em(vb,vb-vout,p2);const need=q1.ib+q2.ib;v3=bisect(v=>em(v,vb+v-vcc,p).ie-need,-1,1.2);q3=em(v3,vb+v3-vcc,p);vx=vb+v3;}return {q1,q2,q3,vx};};
  const vb=bisect(vb=>{const d=parts(vb);return (vcc-d.vx)/r-d.q1.ic-d.q3.ib;},.3,Math.min(vcc-1,2));
  const d=parts(vb);return {iref:(vcc-d.vx)/r,iout:d.q2.ic,ic1:d.q1.ic,vb};
 }
 if(type==='wilson'){
  // Q2 diode-connected at node Y feeds both bases; Q1 collector X drives Q3, whose emitter returns to Y.
  const parts=vy=>{const q2=em(vy,0,p),ib1=em(vy,-.6,p).ib,need=q2.ic+q2.ib+ib1;const v3=bisect(v=>em(v,vy+v-vout,p2).ie-need,-1,1.2),q3=em(v3,vy+v3-vout,p2),vx=vy+v3,q1=em(vy,vy-vx,p);return {q1,q3,vx};};
  const vy=bisect(vy=>{const d=parts(vy);return (vcc-d.vx)/r-d.q1.ic-d.q3.ib;},.3,Math.min(vcc-1,2));
  const d=parts(vy);return {iref:(vcc-d.vx)/r,iout:d.q3.ic,ic1:d.q1.ic,vb:vy};
 }
 throw new RangeError('Unknown mirror type');
}
// Small-signal output resistance by a centered finite difference of the output current.
export function mirrorRout(p={}){const v=p.vout??5,h=.05,a=mirror({...p,vout:v-h}).iout,b=mirror({...p,vout:v+h}).iout;return 2*h/(b-a);}

/* ---------- Differential pair ---------- */
// Emitter-coupled pair with tail current itail and emitter resistors re (alpha taken as 1).
export function diffPair({vd,itail=1e-3,re=0}){
 positive(itail);if(!Number.isFinite(vd)||!(re>=0))throw new RangeError('Invalid differential input');
 if(re===0){const i1=itail/(1+Math.exp(-vd/VT));return {i1,i2:itail-i1};}
 const i1=bisect(i=>VT*Math.log(i/(itail-i))+(2*i-itail)*re-vd,itail*1e-12,itail*(1-1e-12),80);return {i1,i2:itail-i1};
}
// Small-signal gains for a resistively loaded pair (single-ended output unless noted).
export function diffGains({itail=1e-3,rc=10e3,re=0,rtail=Infinity,va=100}){
 const r=VT/(itail/2),ad=rc/(2*(r+re)),acm=rtail===Infinity?0:-rc/(2*rtail+r+re);
 const gm=1/(r+re); // active load: gm × (r_o2 ∥ r_o4) = gm·V_A/I_tail
 return {re:r,ad,adDiff:2*ad,acm,cmrr:acm===0?Infinity:Math.abs(ad/acm),activeLoad:gm*va/itail};
}

/* ---------- Push–pull output stage ---------- */
// Complementary emitter followers into a resistive load. Modes: 'B' (bases tied), 'AB' (bases split by vbias),
// 'feedback' (class B inside a loop of gain a). Each device follows the exponential law with emitter resistor re.
export function pushPull({vin,mode='B',rl=8,re=0,vbias=1.3,is=1e-12,vcc=15,vsat=1,a=200}){
 positive(rl,is,vcc);if(!Number.isFinite(vin)||!(re>=0))throw new RangeError('Invalid push–pull input');
 const dev=x=>{if(x<=-1)return 0;const vbe=re===0?Math.min(x,1.05):bisect(v=>x-v-re*is*Math.exp(Math.min(v,1.05)/VT),-1,Math.min(x,1.05),70);return is*Math.expm1(Math.min(vbe,1.05)/VT)>0?is*Math.expm1(Math.min(vbe,1.05)/VT):0;};
 const half=mode==='AB'?vbias/2:0,lim=vcc-vsat;
 const base=vo=>mode==='feedback'?a*(vin-vo):vin;
 const res=vo=>{const b=base(vo);return dev(b+half-vo)-dev(vo-(b-half))-vo/rl;};
 let vout=bisect(res,-lim,lim,70);vout=Math.max(-lim,Math.min(lim,vout));
 const b=base(vout);return {vout,iN:dev(b+half-vout),iP:dev(vout-(b-half))};
}
// One period of a sinusoidal drive: waveform, harmonic distortion, powers and efficiency.
export function pushPullCycle({amp=5,n=256,...p}){
 const pts=[];let ps=0,pl=0;
 for(let k=0;k<n;k++){const t=k/n,vin=amp*Math.sin(2*Math.PI*t),d=pushPull({vin,...p});pts.push({t,vin,...d});ps+=(p.vcc??15)*(d.iN+d.iP)/n;pl+=d.vout*d.vout/(p.rl??8)/n;}
 const h=m=>{let re=0,im=0;for(const q of pts){re+=q.vout*Math.cos(2*Math.PI*m*q.t);im+=q.vout*Math.sin(2*Math.PI*m*q.t);}return 2*Math.hypot(re,im)/n;};
 const fund=h(1);let sum=0;for(let m=2;m<=15;m++)sum+=h(m)**2;
 return {pts,fundamental:fund,thd:fund>0?Math.sqrt(sum)/fund:0,pSupply:ps,pLoad:pl,efficiency:ps>0?pl/ps:0,quiescent:pushPull({vin:0,...p}).iN};
}

/* ---------- Compound pairs as saturated switches ---------- */
// 'single', 'darlington' (NPN–NPN) or 'sziklai' (NPN driver, PNP output). Forced base current ib,
// load rc to vcc. Q1 small (is1, beta1), Q2 power (is2, beta2). Optional bleeder rb from Q2 base to emitter.
export function compound({type='darlington',ib=1e-3,vcc=12,rc=12,beta1=150,beta2=50,is1=1e-14,is2=1e-12,rb=Infinity,n=40}){
 positive(ib,vcc,rc);const p1={is:is1,betaF:beta1,betaR:2,va:Infinity},p2={is:is2,betaF:beta2,betaR:2,va:Infinity};
 const g=rb===Infinity?0:1/rb;
 if(type==='single'){
  const at=vc=>{const v=bisect(v=>em(v,v-vc,p2).ib-ib,-1,1.3,n);return em(v,v-vc,p2);};
  const vc=bisect(vc=>vcc-at(vc).ic*rc-vc,-.5,vcc,n);const d=at(vc);return {vce:vc,ic:d.ic,ib,gain:d.ic/ib};
 }
 if(type==='darlington'){
  const at=vc=>{const vm=bisect(vm=>{const q2=em(vm,vm-vc,p2),need=Math.max(1e-20,q2.ib+vm*g);const v1=bisect(v=>em(v,vm+v-vc,p1).ie-need,-1,1.3,n);return em(v1,vm+v1-vc,p1).ib-ib;},0,1.3,n);
   const q2=em(vm,vm-vc,p2),need=Math.max(1e-20,q2.ib+vm*g),v1=bisect(v=>em(v,vm+v-vc,p1).ie-need,-1,1.3,n),q1=em(v1,vm+v1-vc,p1);return {ic:q1.ic+q2.ic,vbe:vm+v1};};
  const vc=bisect(vc=>vcc-at(vc).ic*rc-vc,-.5,vcc,n);const d=at(vc);return {vce:vc,ic:d.ic,ib,gain:d.ic/ib,vin:d.vbe};
 }
 if(type==='sziklai'){
  // Q1 collector X drives the PNP base; PNP emitter at the load node C, PNP collector to ground (Q1 emitter).
  const at=vc=>{const vx=bisect(vx=>{const qp=em(vc-vx,-vx,p2),v1=bisect(v=>em(v,v-vx,p1).ib-ib,-1,1.3,n);return em(v1,v1-vx,p1).ic-(qp.ib+(vc-vx)*g);},-.5,vc,n);
   const qp=em(vc-vx,-vx,p2),v1=bisect(v=>em(v,v-vx,p1).ib-ib,-1,1.3,n),q1=em(v1,v1-vx,p1);return {ic:qp.ie+ (q1.ic-qp.ib),vbe:v1};};
  const vc=bisect(vc=>vcc-at(vc).ic*rc-vc,0,vcc,n);const d=at(vc);return {vce:vc,ic:d.ic,ib,gain:d.ic/ib,vin:d.vbe};
 }
 throw new RangeError('Unknown compound type');
}

/* ---------- Paralleled transistors with emitter ballast and self-heating ---------- */
// Two transistors share a base voltage and total current; Q2 needs dvbe more V_BE for the same current.
// Each heats by theta·vce·I and its V_BE falls by tc per °C. Damped fixed-point iteration.
export function sharing({itot=2,dvbe=.005,re=.1,theta=8,vce=10,ta=25,tc=.0021,is=1e-12}={}){
 positive(itot,theta,is);if(!(re>=0)||!(vce>=0))throw new RangeError('Invalid sharing parameters');
 // Base voltage each device needs for current i at temperature t: V_T ln(i/I_S) + i·re + offset − tc(t − ta).
 const vbNeed=(i,off,t)=>VT*Math.log(i/is)+i*re+off-tc*(t-ta);
 let t1=ta,t2=ta,i1=itot/2,i2=itot/2,runaway=false,iter=0;
 for(;iter<400;iter++){
  // Shared base: find the split where both devices need the same base voltage (monotonic in i1).
  i1=bisect(x=>vbNeed(x,0,t1)-vbNeed(itot-x,dvbe,t2),itot*1e-12,itot*(1-1e-12),80);i2=itot-i1;
  const n1=ta+theta*vce*i1,n2=ta+theta*vce*i2;if(Math.max(n1,n2)>250){runaway=true;t1=n1;t2=n2;break;}
  if(Math.abs(n1-t1)+Math.abs(n2-t2)<1e-6){t1=n1;t2=n2;break;}t1+=.5*(n1-t1);t2+=.5*(n2-t2);
 }
 const loop=i=>theta*vce*i*tc/(VT+i*re);
 return {i1,i2,t1,t2,runaway,hogging:runaway||Math.max(i1,i2)>.9*itot,ratio:i1/i2,loop1:loop(i1),loop2:loop(i2),iterations:iter};
}

/* ---------- Complex nodal analysis ---------- */
// Elements: {type:'y',a,b,y} admittance between nodes a and b (0 = ground);
// {type:'g',from,to,p,n,gm} current gm·(v_p − v_n) flowing out of `from` into `to`; {type:'i',node,value} injection.
export function nodal(size,elements){
 const Y=Array.from({length:size},()=>Array.from({length:size},()=>C(0))),I=Array.from({length:size},()=>C(0));
 const at=(r,c,v)=>{if(r>0&&c>0)Y[r-1][c-1]=add(Y[r-1][c-1],v);};
 for(const e of elements){
  if(e.type==='y'){at(e.a,e.a,e.y);at(e.b,e.b,e.y);at(e.a,e.b,mul(e.y,C(-1)));at(e.b,e.a,mul(e.y,C(-1)));}
  else if(e.type==='g'){const g=C(e.gm);at(e.from,e.p,g);at(e.from,e.n,mul(g,C(-1)));at(e.to,e.p,mul(g,C(-1)));at(e.to,e.n,g);}
  else if(e.type==='i'){if(e.node>0)I[e.node-1]=add(I[e.node-1],typeof e.value==='number'?C(e.value):e.value);}
 }
 // Gaussian elimination with partial pivoting.
 for(let c=0;c<size;c++){let piv=c;for(let r=c+1;r<size;r++)if(mag(Y[r][c])>mag(Y[piv][c]))piv=r;
  [Y[c],Y[piv]]=[Y[piv],Y[c]];[I[c],I[piv]]=[I[piv],I[c]];
  for(let r=c+1;r<size;r++){const f=div(Y[r][c],Y[c][c]);for(let k=c;k<size;k++)Y[r][k]=sub(Y[r][k],mul(f,Y[c][k]));I[r]=sub(I[r],mul(f,I[c]));}}
 const v=Array(size);for(let r=size-1;r>=0;r--){let s=I[r];for(let k=r+1;k<size;k++)s=sub(s,mul(Y[r][k],v[k]));v[r]=div(s,Y[r][r]);}
 return [C(0),...v];
}
const Yr=r=>C(1/r),Yc=(c,w)=>C(0,w*c);
// Divider-biased emitter follower, plain or bootstrapped. Plain: R1 ∥ R2 directly at the base.
// Bootstrapped: R1 ∥ R2 to node M, R3 from M to base, capacitor cb from emitter to M.
export function follower({hz=1000,r1=130e3,r2=150e3,r3=47e3,cb=10e-6,re=7.5e3,rl=Infinity,ic=1e-3,beta=100,bootstrapped=false}){
 positive(hz,r1,r2,re,ic,beta);const w=2*Math.PI*hz,gm=ic/VT,rpi=beta/gm,rp=r1*r2/(r1+r2),ret=rl===Infinity?re:re*rl/(re+rl);
 const els=[{type:'y',a:1,b:2,y:Yr(rpi)},{type:'g',from:0,to:2,p:1,n:2,gm},{type:'y',a:2,b:0,y:Yr(ret)},{type:'i',node:1,value:1}];
 if(bootstrapped)els.push({type:'y',a:3,b:0,y:Yr(rp)},{type:'y',a:3,b:1,y:Yr(r3)},{type:'y',a:2,b:3,y:Yc(cb,w)});else els.push({type:'y',a:1,b:0,y:Yr(rp)},{type:'y',a:3,b:0,y:C(1)});
 const v=nodal(3,els);return {zin:v[1],gain:div(v[2],v[1])};
}
// Common-emitter stage with source resistance, hybrid-π capacitances, collector load, optional cascode.
export function ceFrequency({hz,rs=1e3,rc=10e3,ic=1e-3,beta=100,cpi=10e-12,cmu=2e-12,cl=0,cascode=false}){
 positive(hz,rs,rc,ic,beta);const w=2*Math.PI*hz,gm=ic/VT,rpi=beta/gm;
 const els=[{type:'i',node:1,value:1/rs},{type:'y',a:1,b:0,y:add(Yr(rs),add(Yr(rpi),Yc(cpi,w)))},{type:'y',a:2,b:0,y:add(Yr(rc),Yc(cl,w))}];
 if(cascode)els.push({type:'y',a:1,b:3,y:Yc(cmu,w)},{type:'g',from:3,to:0,p:1,n:0,gm},{type:'y',a:3,b:0,y:add(Yr(rpi),Yc(cpi,w))},{type:'g',from:2,to:3,p:0,n:3,gm},{type:'y',a:2,b:0,y:Yc(cmu,w)});
 else els.push({type:'y',a:1,b:2,y:Yc(cmu,w)},{type:'g',from:2,to:0,p:1,n:0,gm},{type:'y',a:3,b:0,y:C(1)});
 const v=nodal(3,els);return {gain:v[2],vb:v[1],millerC:cpi+cmu*(1+gm*rc),millerPole:1/(2*Math.PI*(1/(1/rs+1/rpi))*(cpi+cmu*(1+gm*rc))),gm,rpi};
}
