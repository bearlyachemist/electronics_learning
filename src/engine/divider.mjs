export function parallel(a,b) { return b === Infinity ? a : a*b/(a+b); }
export function divider({vin,r1,r2,rl=Infinity}) {
  if (![vin,r1,r2].every(Number.isFinite) || vin < 0 || r1 <= 0 || r2 <= 0 || !(rl > 0)) throw new RangeError('Use a nonnegative supply and positive resistances.');
  const lower=parallel(r2,rl), vth=vin*r2/(r1+r2), rth=parallel(r1,r2);
  const out=vin*lower/(r1+lower), i1=(vin-out)/r1, i2=out/r2, il=rl===Infinity?0:out/rl;
  return {out,vth,rth,i1,i2,il,p1:i1*i1*r1,p2:i2*i2*r2,pl:out*il,drop:vth===0?0:1-out/vth};
}
export function toleranceBounds(vin,r1,r2,t) {
 if (t<0 || t>=1) throw new RangeError('Tolerance must be between 0 and 1.');
 return {min:divider({vin,r1:r1*(1+t),r2:r2*(1-t)}).out,max:divider({vin,r1:r1*(1-t),r2:r2*(1+t)}).out};
}

