// Electrically short, isolated dipoles in free space; SI units throughout.
export const c0=3e8;
export function shortDipole({length=.15,frequency=27e6,loss=3,gamma=0,distribution='triangular'}={}) {
 if(!Number.isFinite(length)||length<=0||!Number.isFinite(frequency)||frequency<=0||!Number.isFinite(loss)||loss<0||!Number.isFinite(gamma)||gamma<0||gamma>1||!['triangular','uniform'].includes(distribution)) throw new RangeError('Invalid antenna model parameters');
 const wavelength=c0/frequency,effectiveLength=length/(distribution==='triangular'?2:1);
 const radiationResistance=80*Math.PI**2*(effectiveLength/wavelength)**2;
 const efficiency=radiationResistance/(radiationResistance+loss),gain=1.5*efficiency;
 return {wavelength,effectiveLength,radiationResistance,efficiency,gain,realizedGain:gain*(1-gamma**2),electricalLength:length/wavelength,valid:length/wavelength<=.1};
}
