// Bipolar transistor models: device physics, Ebers–Moll with Early effect, and a single-stage solver.
// SI units throughout (concentrations in m^-3, lengths in m).
const q=1.602176634e-19,k=1.380649e-23,eps=11.7*8.8541878128e-12;
export const VT300=k*300/q;
function positive(...xs){if(!xs.every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Positive finite parameters required');}
function finite(...xs){if(!xs.every(Number.isFinite))throw new RangeError('Finite parameters required');}

/* ---------- Device physics ---------- */
// Abrupt-junction depletion width split: returns the part lying in the side doped `nSide` against `nOther`.
function depletionInto(nSide,nOther,v,ni){const vbi=VT300*Math.log(nSide*nOther/(ni*ni)),drop=vbi+v;if(drop<=0)throw new RangeError('Junction fully forward biased');const w=Math.sqrt(2*eps/q*(1/nSide+1/nOther)*drop);return w*nOther/(nSide+nOther);}
// Short-base NPN: uniform doping, low-level injection, no bandgap narrowing.
export function bjtPhysics({vbe=.65,vcb=5,wb=.8e-6,we=.3e-6,nab=1e23,nde=1e25,ndc=1e22,area=1e-9,dn=2e-3,dp=2.6e-4,ln=14e-6,ni=1e16,early=true}={}){
 positive(wb,we,nab,nde,ndc,area,dn,dp,ln,ni);finite(vbe,vcb);
 const xc=early?depletionInto(nab,ndc,vcb,ni):depletionInto(nab,ndc,0,ni),xe=depletionInto(nab,nde,-vbe,ni);
 const w=wb-xc-xe;if(w<=0)throw new RangeError('Base punched through');
 const n0=ni*ni/nab,edge=n0*Math.exp(vbe/VT300),is=q*area*dn*ni*ni/(nab*w);
 const ic=is*Math.exp(vbe/VT300),emitterTerm=dp*nab*w/(dn*nde*we),transportTerm=w*w/(2*ln*ln);
 const ib=ic*(emitterTerm+transportTerm),gamma=1/(1+emitterTerm),alphaT=1-transportTerm;
 const charge=q*area*edge*w/2,tauF=w*w/(2*dn);
 return {w,xc,xe,n0,edge,is,ic,ib,beta:ic/ib,gamma,alphaT,alpha:gamma*alphaT,emitterTerm,transportTerm,charge,tauF,ft:1/(2*Math.PI*tauF)};
}
// Early voltage from the base-width modulation of the physics model: VA = W/(dW/dVCB) - VCB.
export function earlyVoltage(p={}){const v=p.vcb??5,h=.01,a=bjtPhysics({...p,vcb:v-h}),b=bjtPhysics({...p,vcb:v+h});const dIdV=(b.ic-a.ic)/(2*h);return bjtPhysics({...p,vcb:v}).ic/dIdV-v;}
// V_BE at fixed collector current versus temperature, with I_S ∝ T^3 exp(-Eg0/kT).
export function vbeTemperature({vbe0=.65,t0=300,t=300,vg0=1.21}={}){positive(t0,t);return vg0+(t/t0)*(vbe0-vg0)+3*k*t/q*Math.log(t0/t);}

/* ---------- Ebers–Moll (transport form) with Early effect on the transport current ---------- */
export const defaults={is:1e-14,betaF:150,betaR:2,va:100,vt:VT300};
export function ebersMoll({vbe,vbc,is=defaults.is,betaF=defaults.betaF,betaR=defaults.betaR,va=defaults.va,vt=defaults.vt}){
 const ef=Math.expm1(Math.min(vbe,1.3)/vt),er=Math.expm1(Math.min(vbc,1.3)/vt);
 const it=is*(ef-er)*(va===Infinity?1:Math.max(.05,1-vbc/va));
 const ib=is*ef/betaF+is*er/betaR,ic=it-is*er/betaR;return {ic,ib,ie:ic+ib};
}
function bisect(f,a,b,n=70){let fa=f(a);for(let i=0;i<n;i++){const m=(a+b)/2,fm=f(m);if((fm>0)===(fa>0)){a=m;fa=fm;}else b=m;}return (a+b)/2;}
// Single NPN: base driven by Thévenin (vbb, rb); collector to vcc through rc; emitter to vee through re.
// Kirchhoff's laws are solved by nested bisection, which is monotonic for this topology in every region.
export function solveStage({vbb,rb=0,vcc,rc=0,re=0,vee=0,...m}){
 finite(vbb,vcc,vee);if(![rb,rc,re].every(x=>Number.isFinite(x)&&x>=0))throw new RangeError('Resistances must be nonnegative');
 const inner=vbe=>{const vbc=bisect(vbc=>{const d=ebersMoll({vbe,vbc,...m});return vbb-d.ib*rb-(vcc-d.ic*rc)-vbc;},-200,1.3);return {vbc,...ebersMoll({vbe,vbc,...m})};};
 const vbe=bisect(vbe=>{const d=inner(vbe);return vbb-d.ib*rb-vbe-(vee+d.ie*re);},-60,1.3);
 const d=inner(vbe),vb=vbb-d.ib*rb,ve=vee+d.ie*re,vc=vcc-d.ic*rc,vce=vc-ve;
 const region=vbe<.45?'cutoff':d.vbc>.45?'saturation':'active';
 return {vbe,vbc:d.vbc,ib:d.ib,ic:d.ic,ie:d.ie,vb,ve,vc,vce,region};
}
// Output characteristic: collector current at a forced base current and fixed V_CE (emitter grounded).
export function outputCurve({ib,vce,...m}){const rb=1e9;return solveStage({vbb:ib*rb+.7,rb,vcc:vce,rc:0,re:0,...m});}

/* ---------- Simple models used before Ebers–Moll ---------- */
// Current-amplifier model with a fixed V_BE and a saturation floor.
export function simpleSwitch({vin,rb,vcc,rc,beta=100,vbe=.65,vsat=.2}){
 positive(rb,vcc,rc,beta);finite(vin);const ib=Math.max(0,(vin-vbe)/rb),demand=beta*ib,limit=Math.max(0,(vcc-vsat)/rc);
 const ic=Math.min(demand,limit);return {ib,ic,vce:vcc-ic*rc,region:ib===0?'cutoff':demand>=limit?'saturation':'active',overdrive:limit>0?demand/limit:Infinity};
}
// Emitter follower with emitter resistor to -vee and resistive load to ground (Thévenin-combined).
export function follower({vin,re=1000,rl=Infinity,vee=10,vbe=.65,beta=100,rs=0,ic=undefined}){
 positive(re,vee,beta);if(!(rl>0))throw new RangeError('Load must be positive');finite(vin);
 if(!Number.isFinite(rs)||rs<0)throw new RangeError('Source resistance must be nonnegative');
 const rp=rl===Infinity?re:re*rl/(re+rl),floor=rl===Infinity?-vee:-vee*rl/(re+rl);
 const loading=rs/((beta+1)*rp),out=Math.max((vin-vbe+loading*floor)/(1+loading),floor),iout=(out-floor)/rp,on=vin-vbe>floor;
 const ice=ic??Math.max(1e-9,iout*beta/(beta+1));
 const reSmall=VT300/ice;return {out,on,floor,iout,zin:(beta+1)*(reSmall+rp),zout:reSmall+rs/(beta+1),gain:rp/(rp+reSmall)};
}
// Fixed-V_BE bias calculations: divider + emitter resistor, with temperature drift of V_BE.
export function dividerBias({vcc=15,r1=130e3,r2=10e3,rc=7.5e3,re=1e3,beta=100,vbe25=.65,temp=25}){
 positive(vcc,r1,r2,rc,re,beta);const vbe=vbe25-.0021*(temp-25),vth=vcc*r2/(r1+r2),rth=r1*r2/(r1+r2);
 let ic=beta*Math.max(0,vth-vbe)/(rth+(beta+1)*re),vc=vcc-ic*rc,ve=ic*(1+1/beta)*re,saturated=false;
 if(vc<ve+.2){saturated=true;ic=(vcc-.2)/(rc+re*(1+1/beta));vc=vcc-ic*rc;ve=ic*(1+1/beta)*re;}
 return {ic,vc,ve,vth,rth,vbe,saturated};
}
export function baseResistorBias({vcc=15,rb=1.43e6,rc=7.5e3,beta=100,vbe25=.65,temp=25}){
 positive(vcc,rb,rc,beta);const vbe=vbe25-.0021*(temp-25);let ic=beta*Math.max(0,vcc-vbe)/rb,vc=vcc-ic*rc,saturated=false;
 if(vc<.2){saturated=true;ic=(vcc-.2)/rc;vc=.2;}return {ic,vc,saturated};
}
// Small-signal quantities at collector current ic.
export function smallSignal({ic,beta=100,va=100,vt=VT300}){positive(ic,beta,vt);const gm=ic/vt;return {gm,re:vt/ic,rpi:beta/gm,ro:va===Infinity?Infinity:va/ic};}
// Common-emitter stage, small-signal gain and impedances (re includes the intrinsic VT/IC).
export function ceGain({ic,rc,re=0,rl=Infinity,beta=100,bypassed=false,rth=Infinity}){
 const s=smallSignal({ic,beta,va:Infinity}),reff=bypassed?0:re,rcl=rl===Infinity?rc:rc*rl/(rc+rl);
 const zb=(beta+1)*(s.re+reff);return {gain:-rcl/(s.re+reff),zin:rth===Infinity?zb:1/(1/rth+1/zb),zout:rc,re:s.re,gm:s.gm};
}
// Unity-gain phase splitter (collector and emitter outputs), small-signal, each output possibly loaded.
export function phaseSplitter({ic=1e-3,rc=4.7e3,re=4.7e3,rlc=Infinity,rle=Infinity,beta=100}){
 const r=VT300/ic,rcl=rlc===Infinity?rc:rc*rlc/(rc+rlc),rel=rle===Infinity?re:re*rle/(re+rle);
 return {collector:-rcl/(r+rel),emitter:rel/(r+rel),zc:rc,ze:1/(1/re+1/r)};
}
