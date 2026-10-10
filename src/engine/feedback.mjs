const positive=(...v)=>{if(!v.every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Positive finite values required');};
export function feedback({a=1000,b=.1,input=.1,disturbance=0}={}){positive(a,b);if(![input,disturbance].every(Number.isFinite))throw new RangeError('Finite signals required');const loop=a*b,gain=a/(1+loop),out=(a*input+disturbance)/(1+loop);return {loop,gain,out,error:input-b*out,sensitivity:1/(1+loop)};}
export function loopResponse({hz=100,a=10000,b=.1,p1=10,p2=10000,p3=30000}={}){positive(hz,a,b,p1,p2,p3);const mag=a*b/Math.hypot(1,hz/p1)/Math.hypot(1,hz/p2)/Math.hypot(1,hz/p3),phase=-(Math.atan(hz/p1)+Math.atan(hz/p2)+Math.atan(hz/p3))*180/Math.PI;return {mag,db:20*Math.log10(mag),phase};}
export function loopMargins({a=10000,b=.1,p1=10,p2=10000,p3=30000}={}){
 positive(a,b,p1,p2,p3);const cfg={a,b,p1,p2,p3};let lo=1e-9,hi=1e12;for(let k=0;k<100;k++){const mid=Math.sqrt(lo*hi);if(loopResponse({...cfg,hz:mid}).mag>1)lo=mid;else hi=mid;}
 const cross=Math.sqrt(lo*hi),margin=180+loopResponse({...cfg,hz:cross}).phase;
 // Routh criterion for three stable real open-loop poles and constant feedback.
 const sum=p1+p2+p3,pairs=p1*p2+p1*p3+p2*p3,product=p1*p2*p3;
 return {cross:a*b>1?cross:null,margin:a*b>1?margin:null,stable:sum*pairs>product*(1+a*b)};
}
export function degenerated({vin=0,re=100,beta=100,iq=.001,rc=2200,vt=.02585}={}){
 positive(beta,iq,rc,vt);if(!Number.isFinite(vin)||!Number.isFinite(re)||re<0)throw new RangeError('Invalid signal or emitter resistor');
 const factor=1+1/beta;let lo=iq*1e-15,hi=iq*Math.exp(Math.max(0,vin/vt))+Math.abs(vin)/Math.max(re,1);
 for(let k=0;k<100;k++){const i=(lo+hi)/2;const drop=vt*Math.log(i/iq)+(i-iq)*factor*re;if(drop>vin)hi=i;else lo=i;}
 const ic=(lo+hi)/2,gm=iq/vt,gain=-gm*rc/(1+gm*factor*re);
 return {ic,out:-rc*(ic-iq),gain,loop:gm*factor*re,rin:beta/gm+(beta+1)*re};
}
export function supply({vin=12,rl=100,imax=.2,a=1000,b=.2,ref=1,rout=2,dropout=1,theta=40,ambient=25}={}){
 positive(vin,rl,imax,a,b,ref,rout,dropout,theta);if(!Number.isFinite(ambient))throw new RangeError('Finite ambient required');
 const ideal=(a*ref)/(1+a*b+rout/rl),head=Math.max(0,vin-dropout),limited=imax*rl,out=Math.max(0,Math.min(ideal,head,limited)),current=out/rl,power=(vin-out)*current;
 const mode=limited<Math.min(ideal,head)?'current limit':head<ideal?'dropout':'voltage regulation';
 return {out,current,power,tj:ambient+theta*power,mode,base:current/50,ideal,outputResistance:rout/(1+a*b)};
}
export function thermalControl({mode='P',kp=.5,ki=.01,ambient=20,setpoint=50,lag=0,end=1200,dt=.1}={}){
 positive(kp,ki,end,dt);if(!['P','PI','thermostat'].includes(mode)||![ambient,setpoint,lag].every(Number.isFinite)||lag<0)throw new RangeError('Invalid thermal settings');
 const theta=10,cth=20,maxPower=10,points=[];let temp=ambient,sensed=temp,integral=0,on=true,energy=0,loss=0;
 for(let k=0;k<=Math.round(end/dt);k++){
 const t=k*dt,error=setpoint-sensed;
 if(sensed>=setpoint+1)on=false;else if(sensed<=setpoint-1)on=true;
 let raw=kp*error+(mode==='PI'?integral:0),p=mode==='thermostat'?(on?maxPower:0):Math.max(0,Math.min(maxPower,raw));
 if(k%10===0)points.push({t,temp,sensed,p});
 if(k===Math.round(end/dt))break;
 // Integrate only when the error would not push further into saturation.
 if(mode==='PI'&&((raw>0&&raw<maxPower)||(raw>=maxPower&&error<0)||(raw<=0&&error>0)))integral+=ki*error*dt;
 const next=ambient+theta*p+(temp-ambient-theta*p)*Math.exp(-dt/(theta*cth));
 energy+=p*dt;loss+=p*dt-cth*(next-temp);temp=next;
 sensed=lag===0?temp:temp+(sensed-temp)*Math.exp(-dt/lag);
 }
 return {points,temp,sensed,energy,loss,cth,theta,maxPower,pRequired:(setpoint-ambient)/theta};
}
export function logicGate({a=false,b=false,kind='NOR',fanout=0}={}){
 if(!['NOR','NAND'].includes(kind)||!Number.isInteger(fanout)||fanout<0)throw new RangeError('Invalid logic settings');
 const on=kind==='NOR'?(a||b):(a&&b),ib=on?(kind==='NOR'?(5-.7)/18000:(5-2.1)/11000-.7/100000):0,ic=(5-.2)/2200+fanout*(5-.9)/10000;
 return {on,out:on?.2:5,ib,ic:on?ic:0,forced:on?ic/ib:0,passes:!on||ic/ib<=10};
}



