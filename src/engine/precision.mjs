import {C,add,mul,div} from './ac.mjs';
export function feedbackNetwork({hz,rf,rg,cf,cin}){
 if(![hz,cf,cin].every(x=>Number.isFinite(x)&&x>=0)||![rf,rg].every(x=>Number.isFinite(x)&&x>0))throw new RangeError('Invalid feedback network');
 const zf=div(C(rf),C(1,2*Math.PI*hz*rf*cf)),yg=C(1/rg,2*Math.PI*hz*cin),ng=add(C(1),mul(zf,yg));
 return {zf,yg,ng,beta:div(C(1),ng)};
}
