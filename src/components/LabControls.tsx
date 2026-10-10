import {useEffect,useState} from 'react';
export const f=(n:number,d=2)=>n.toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
export function Control({label,value,onChange,min,max,step=1,unit,log=false}:{label:string;value:number;onChange:(v:number)=>void;min:number;max:number;step?:number;unit:string;log?:boolean}) {
 const [ready,setReady]=useState(false); useEffect(()=>setReady(true),[]);
 return <label className="new-control"><span>{label}<b>{f(value,value<1?3:2)} {unit}</b></span><input disabled={!ready} aria-label={label} aria-valuetext={f(value,3)+' '+unit} type="range" min={min} max={max} step={step} value={log?Math.log10(value):value} onChange={e=>onChange(log?10**Number(e.target.value):Number(e.target.value))}/><small><span>{log?Number((10**min).toPrecision(3)):min} {unit}</span><span>{log?Number((10**max).toPrecision(3)):max} {unit}</span></small></label>;
}
export function Readouts({values}:{values:[string,string,string][]}){return <div className="readouts">{values.map(([label,value,unit])=><div key={label}><span>{label}</span><strong>{value} <small>{unit}</small></strong></div>)}</div>}


