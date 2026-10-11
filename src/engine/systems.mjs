// Teaching models use SI units. Limits are explicit at the call sites.
export const kB=1.380649e-23;
export const codeStep=(span,bits)=>span/2**bits;
export const quantize=(v,span,bits)=>Math.max(0,Math.min(2**bits-1,Math.floor(v/codeStep(span,bits))));
export const alias=(hz,fs)=>Math.abs(((hz+fs/2)%fs+fs)%fs-fs/2);
export const acquisition=(bits,r,c)=>Math.log(2**(bits+1))*r*c;
export const jitterSNR=(hz,sigma)=>-20*Math.log10(2*Math.PI*hz*sigma);
export function buck({vin=12,vout=5,l=22e-6,fs=500e3,load=1}={}){
 const duty=vout/vin,di=(vin-vout)*duty/(l*fs);
 return {duty,di,min:load-di/2,max:load+di/2,ccm:load>di/2};
}
export function boost({vin=5,vout=12,l=22e-6,fs=500e3,load=.5}={}){
 const duty=1-vin/vout,di=vin*duty/(l*fs),input=load/(1-duty);
 return {duty,di,input,peak:input+di/2};
}
export function reflection({z0=50,zl=100,rs=50,vs=1}={}){
 const gl=(zl-z0)/(zl+z0),gs=(rs-z0)/(rs+z0),launch=vs*z0/(rs+z0);
 return {gl,gs,launch,first:launch*(1+gl),final:vs*zl/(rs+zl)};
}
export function friis(stages){let gain=1,f=1;for(const s of stages){f+=(10**(s.nf/10)-1)/gain;gain*=10**(s.gain/10);}return {factor:f,nf:10*Math.log10(f),gain:10*Math.log10(gain)};}
export function deltaSigma(input,count=4096){let state=0;const bits=[];for(let i=0;i<count;i++){state+=input;const b=state>=0?1:-1;state-=b;bits.push(b);}return {bits,state,mean:bits.reduce((a,b)=>a+b,0)/count};}
export const sinc=(x)=>x===0?1:Math.sin(Math.PI*x)/(Math.PI*x);
