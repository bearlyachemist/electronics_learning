import {useState} from 'react';
import {Control,Readouts,f} from './LabControls';
import {shortDipole} from '../engine/antennas.mjs';
export function AntennaBudgetLab(){
 const [length,L]=useState(.15),[frequency,F]=useState(27),[loss,R]=useState(3),[gamma,G]=useState(0);
 const p=shortDipole({length,frequency:frequency*1e6,loss,gamma});
 return <div className="lab" aria-label="Short dipole efficiency laboratory">
 <div className="horizontal-controls"><Control label="Total dipole length" value={length} onChange={L} min={.05} max={.5} step={.01} unit="m"/>
 <Control label="Frequency" value={frequency} onChange={F} min={10} max={100} step={1} unit="MHz"/>
 <Control label="Feed-referred series loss" value={loss} onChange={R} min={.01} max={5} step={.01} unit="Ω"/>
 <Control label="Reflection magnitude" value={gamma} onChange={G} min={0} max={.9} step={.05} unit=""/></div>
 <Readouts values={[
 ['Length / wavelength',f(p.electricalLength,4),''],
 ['Radiation resistance',p.valid?f(p.radiationResistance*1000,3):'Model limit',p.valid?'mΩ':''],
 ['Radiation efficiency',p.valid?f(100*p.efficiency,3):'Model limit',p.valid?'%':''],
 ['Realized gain',p.valid?f(10*Math.log10(p.realizedGain),2):'Model limit',p.valid?'dBi':'']
 ]}/>
 <p className="lab-prompt">Centre-fed wire with triangular current, free-space wavelength and short-dipole directivity 1.5. Loss is an independently chosen series resistance after ideal reactive tuning. Increasing frequency or length past λ/10 hides the numerical estimates: λ/10 is a teaching cutoff, not an accuracy guarantee. The model excludes enclosure loading, matching bandwidth and nearby conductors. Change loss and reflection separately to see what matching can recover.</p>
 </div>;
}
