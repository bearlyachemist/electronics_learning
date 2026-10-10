import {useEffect, useState} from 'react';
import {divider} from '../engine/divider.mjs';
import {Schematic,Wire,Res,Source,Ground,Dot,Terminal,Text,CurrentArrow,green,orange,gray,type Pt} from './Schematic';
import {Tx} from './MathText';

type Values = {vin:number;r1:number;r2:number;rl:number;connected:boolean};
const defaults:Values={vin:10,r1:10,r2:10,rl:10,connected:true};
const fmt=(n:number,d=2)=>n.toLocaleString('en-US',{maximumFractionDigits:d,minimumFractionDigits:d});
export function Circuit({v=defaults, simple=false}:{v?:Values;simple?:boolean}) {
 const d=divider({vin:v.vin,r1:v.r1*1000,r2:v.r2*1000,rl:!simple&&v.connected?v.rl*1000:Infinity});
 const loaded=!simple&&v.connected,out:Pt=[220,154];
 return <Schematic className="circuit-svg" width={510} height={300} description={`Voltage source ${v.vin} volts connects through R1 ${v.r1} kiloohms to the output, then through R2 ${v.r2} kiloohms to ground.${loaded?' Load '+v.rl+' kiloohms is parallel with R2.':''} Output ${fmt(d.out)} volts.`}>
  <Source a={[80,190]} b={[80,118]} label={'V_in = '+v.vin+' V'}/><Wire pts={[[80,118],[80,44],[220,44]]}/>
  <Res a={[220,44]} b={out} label="R_1" value={v.r1+' kΩ'}/><Res a={out} b={[220,268]} label="R_2" value={v.r2+' kΩ'}/>
  <Wire pts={[[220,268],[80,268],[80,190]]}/><Ground at={[150,268]}/><CurrentArrow at={[160,44]} dir="right" label="I_1" color={gray}/>
  <Wire pts={[out,[400,154]]} color={green}/><Dot at={out} color={green}/>
  <Text x={262} y={141} kind="output">V_out = {fmt(d.out)} V</Text>
  {loaded?<><Res a={[400,154]} b={[400,268]} label="R_L" value={v.rl>=1000?'1 MΩ':fmt(v.rl,v.rl<1?2:1)+' kΩ'} color={orange}/><Wire pts={[[400,268],[220,268]]} color={orange}/><Dot at={[220,268]}/></>
   :<><Terminal at={[400,154]}/><Text x={276} y={184} kind="value">No output current</Text></>}
  <Text x={172} y={288} kind="value">0 V reference</Text>
 </Schematic>;
}
function Plot({v}:{v:Values}) {
 const d=divider({vin:v.vin,r1:v.r1*1000,r2:v.r2*1000});
 const yMax=Math.max(v.vin*.62,d.vth*1.15,1);
 const x=(r:number)=>60+(Math.log10(r)-2)/4*440;
 const y=(volts:number)=>208-volts/yMax*166;
 const pts=Array.from({length:161},(_,i)=>{const r=10**(2+4*i/160);return `${x(r)},${y(d.vth*r/(d.rth+r))}`;}).join(' ');
 const current=divider({vin:v.vin,r1:v.r1*1000,r2:v.r2*1000,rl:v.rl*1000});
 return <svg className="plot-svg" viewBox="0 0 550 264" role="img" aria-label={`Load sweep from 100 ohms to 1 megaohm. Output rises toward the unloaded limit of ${fmt(d.vth)} volts. At ${v.rl} kiloohms output is ${fmt(current.out)} volts.`}>
 <text x="60" y="18" className="axis-title">OUTPUT VOLTAGE / V</text>
 {[0,.25,.5,.75,1].map(k=><g key={k}><line x1="60" x2="500" y1={y(k*yMax)} y2={y(k*yMax)} stroke="var(--line)"/><text x="48" y={y(k*yMax)+4} textAnchor="end" className="tick">{fmt(k*yMax,1)}</text></g>)}
 {[100,1000,10000,100000,1000000].map((r,i)=><g key={r}><line x1={x(r)} x2={x(r)} y1="42" y2="208" stroke="var(--line)" strokeDasharray="2 5"/><text x={x(r)} y="229" textAnchor="middle" className="tick">{['100 Ω','1 kΩ','10 kΩ','100 kΩ','1 MΩ'][i]}</text></g>)}
 <line x1="60" x2="500" y1={y(d.vth)} y2={y(d.vth)} stroke="var(--muted)" strokeDasharray="6 5"/>
 <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="3"/>
 {v.connected&&<><line x1={x(v.rl*1000)} x2={x(v.rl*1000)} y1={y(current.out)} y2="208" stroke="var(--orange)" strokeDasharray="3 4"/><circle cx={x(v.rl*1000)} cy={y(current.out)} r="6" fill="var(--orange)" stroke="var(--paper)" strokeWidth="2"/></>}
 <text x="280" y="253" textAnchor="middle" className="axis-title">LOAD RESISTANCE / LOGARITHMIC SCALE</text>
 </svg>;
}
export default function DividerLab({simple=false}:{simple?:boolean}) {
 const [v,setV]=useState<Values>(defaults),[loaded,setLoaded]=useState(false);
 const key=simple?'analog-divider-ratio-v1':'analog-divider-load-v1';
 useEffect(()=>{try {const s=JSON.parse(localStorage.getItem(key)||'null');if(s&&s.vin>=1&&s.vin<=24&&s.r1>=1&&s.r1<=100&&s.r2>=1&&s.r2<=100&&s.rl>=.1&&s.rl<=1000&&typeof s.connected==='boolean')setV(s);}catch{}setLoaded(true);},[key]);
 useEffect(()=>{if(loaded)try{localStorage.setItem(key,JSON.stringify(v));}catch{}},[v,loaded,key]);
 const update=(field:keyof Values,value:number|boolean)=>setV(old=>({...old,[field]:value}));
 const d=divider({vin:v.vin,r1:v.r1*1000,r2:v.r2*1000,rl:!simple&&v.connected?v.rl*1000:Infinity});
 const control=(field:'vin'|'r1'|'r2',label:string,unit:string,min:number,max:number)=><div className="control"><label htmlFor={key+field}>{label}<span>{v[field]} {unit}</span></label><input id={key+field} type="range" min={min} max={max} step="1" value={v[field]} onChange={e=>update(field,+e.target.value)}/><div className="range-ends"><span>{min} {unit}</span><span>{max} {unit}</span></div></div>;
 return <div className={'lab '+(simple?'simple-lab':'')} aria-label={simple?'Unloaded divider experiment':'Loaded divider experiment'}>
 <div className="lab-heading"><div><span className="live-dot"/><span className="tiny-label">INTERACTIVE FIGURE {simple?'01':'02'}</span></div><button onClick={()=>setV({...defaults})}>Reset ↺</button></div>
 <div className="lab-body"><div className="lab-visual"><Circuit v={v} simple={simple}/><div className="figure-legend"><span><i className="legend-line"/>Output node</span>{!simple&&<span><i className="legend-line orange"/>External load</span>}<span>Ideal DC model</span></div></div>
 <div className="lab-controls">{control('vin','Supply voltage','V',1,24)}{control('r1','Upper resistor R1','kΩ',1,100)}{control('r2','Lower resistor R2','kΩ',1,100)}
 {!simple&&<><div className="control"><label htmlFor={key+'rl'}>Load resistance<span>{fmt(v.rl,1)} kΩ</span></label><input id={key+'rl'} type="range" min="-1" max="3" step=".01" aria-valuetext={fmt(v.rl,2)+" kiloohms"} value={Math.log10(v.rl)} onChange={e=>update('rl',10**(+e.target.value))} disabled={!v.connected}/><div className="range-ends"><span>100 Ω</span><span>1 MΩ</span></div></div><label className="check"><input type="checkbox" checked={v.connected} onChange={e=>update('connected',e.target.checked)}/> Connect the load</label></>}
 </div></div>
 <div className="readouts"><div><span>OUTPUT</span><strong>{fmt(d.out)} <small>V</small></strong></div><div><span>{simple?'DIVIDER CURRENT':'LOAD CURRENT'}</span><strong>{fmt((simple?d.i1:d.il)*1000,3)} <small>mA</small></strong></div><div><span>{simple?'TOTAL DISSIPATION':'LOADING ERROR'}</span><strong>{fmt(simple?(d.p1+d.p2)*1000:d.drop*100)} <small>{simple?'mW':'%'}</small></strong></div></div>
 {!simple&&<div className="plot-area"><div className="plot-heading"><h4>A load changes the operating point</h4><span><i className="legend-dashed"/>Unloaded: {fmt(d.vth)} V</span></div><Plot v={v}/><p className="plot-summary"><Tx>{`With this divider, $R_L = R_{\\mathrm{th}}$ = ${fmt(d.rth/1000)} kΩ gives half the unloaded voltage. `+(v.connected?`Your connected load gives ${fmt(d.out)} V, a ${fmt(d.drop*100)}% decrease.`:'The load is disconnected; the output is at its unloaded limit. The curve shows what different connected loads would do.')}</Tx></p></div>}
 <div className="lab-prompt"><strong>Try this.</strong> <Tx>{simple?'Keep $R_1$ and $R_2$ equal, then increase both from 10 kΩ to 100 kΩ. The voltage stays the same. What happens to current and power? Then make $R_1$ three times $R_2$ and predict the output before you look.':'Start at the default values, then disconnect and reconnect the load. Sweep $R_L$ upward: a larger load resistance draws less current and disturbs the divider less. Find the load that halves the unloaded voltage, and compare it with $R_1 \\parallel R_2$.'}</Tx></div>
 </div>;
}





