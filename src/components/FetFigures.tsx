import {Wires,Res,Ground,Label,Dot,Diode,Cap} from './Parts';
/** Simplified labelled n-channel symbols. MOS body connection is not drawn. */
export function Fet({x,y,mos=false}:{x:number;y:number;mos?:boolean}){
 return <g transform={'translate('+x+','+y+')'}><Wires d="M12 -40 V-24 H0 M0 24 H12 V40 M0 -24 V24 M-30 0 H-10"/>
 {mos?<Wires d="M-10 -20 V20"/>:<><Wires d="M-10 0 H0"/><path d="M-8 -4 L0 0 L-8 4 Z" fill="var(--ink)"/></>}
 <Label x={22} y={-25} kind="value">D</Label><Label x={22} y={31} kind="value">S</Label><Label x={-30} y={-10} kind="value">G</Label></g>;
}
export function FetCircuit({mode='source',mos=false}:{mode?:'source'|'follower'|'switch';mos?:boolean}){
 const sw=mode==='switch',fol=mode==='follower';
 return <svg className="wide-circuit" viewBox="0 0 580 345" role="img" aria-label={sw?'N-channel low-side switch with load, gate resistor, pulldown and external flyback diode':fol?'FET source follower with source resistor and grounded gate bias reference':'Self-biased common-source FET with drain and source resistors'}>
 <Fet x={285} y={157} mos={mos||sw}/><Wires d="M297 30 V48 M297 108 V117 M297 197 V217 M297 277 V290 M170 157 H255"/>
 <Label x={310} y={33}>+VDD</Label>{fol?<Wires d="M297 48 V108"/>:<Res x={297} y={78} v/>}<Label x={330} y={82}>{sw?'Load (R or L)':fol?'':'RD'}</Label>
 {sw?<><Wires d="M90 157 H110"/><Res x={140} y={157}/><Label x={130} y={185} kind="value">RG</Label></>:<Wires d="M130 157 H170"/>}<Label x={100} y={128}>{sw?'Driver':'Gate input / bias'}</Label>
 {sw?<><Wires d="M297 217 V290 M205 157 V190 M205 250 V290"/><Res x={205} y={220} v/><Label x={150} y={224}>RGS</Label><Ground x={205} y={290}/><Diode x={440} y={78} rotate={-90}/><Wires d="M297 30 H440 V48 M440 108 V117 H297"/><Label x={457} y={83} kind="value">Flyback</Label></>:<><Res x={297} y={247} v/><Label x={330} y={253}>RS</Label></>}
 <Ground x={297} y={290}/><Dot x={297} y={fol?207:117}/><Wires d={fol?'M297 207 H420':'M297 117 H420'}/><Label x={428} y={fol?212:122} kind="output">{fol?'vout (source)':'vout (drain)'}</Label>
 {fol&&<Label x={60} y={327} kind="value">For a follower, replace RD with a wire to VDD.</Label>}
 {sw&&<Label x={60} y={327} kind="value">Gate resistor sits in series with the driver; diode cathode at +VDD.</Label>}
 </svg>;
}
export function FetStructure(){
 return <svg className="wide-circuit" viewBox="0 0 620 270" role="img" aria-label="Conceptual sections: reverse-biased JFET junction narrows an existing channel; MOS gate creates an inversion channel through oxide">
 <rect x="35" y="70" width="240" height="130" rx="8" fill="var(--line)"/><rect x="35" y="114" width="240" height="42" fill="var(--accent)" opacity=".3"/>
 <rect x="90" y="70" width="130" height="28" fill="var(--orange)" opacity=".5"/><rect x="90" y="172" width="130" height="28" fill="var(--orange)" opacity=".5"/>
 <Label x={150} y={46} anchor="middle">JFET: existing n channel</Label><Label x={45} y={140}>S</Label><Label x={248} y={140}>D</Label><Label x={155} y={89} anchor="middle">p gate</Label>
 <Wires d="M155 55 V70"/><Label x={155} y={231} anchor="middle" kind="value">Reverse bias widens depletion</Label>
 <rect x="340" y="110" width="240" height="90" rx="8" fill="var(--line)"/><rect x="350" y="110" width="40" height="28" fill="var(--accent)" opacity=".4"/><rect x="530" y="110" width="40" height="28" fill="var(--accent)" opacity=".4"/>
 <rect x="395" y="94" width="130" height="8" fill="var(--orange)" opacity=".4"/><Wires d="M395 88 H525 M460 55 V88 M390 113 H530" dashed/>
 <Label x={460} y={46} anchor="middle">MOSFET: insulated gate</Label><Label x={370} y={132} anchor="middle">S</Label><Label x={550} y={132} anchor="middle">D</Label><Label x={460} y={174} anchor="middle">p body</Label><Label x={460} y={231} anchor="middle" kind="value">Positive gate forms an n channel</Label>
 </svg>;
}
export function BackToBack(){
 return <svg className="wide-circuit" viewBox="0 0 600 200" role="img" aria-label="Back-to-back n-channel MOSFETs: drains at external terminals, common sources and gates; opposing intrinsic diode paths">
 <Wires d="M45 80 H100 M230 80 H350 M480 80 H555"/><rect x="100" y="48" width="130" height="65" fill="none" stroke="var(--ink)"/><rect x="350" y="48" width="130" height="65" fill="none" stroke="var(--ink)"/>
 <Label x={165} y={75} anchor="middle">MOSFET 1</Label><Label x={115} y={100}>D</Label><Label x={205} y={100}>S</Label><Label x={365} y={100}>S</Label><Label x={455} y={100}>D</Label><Label x={415} y={75} anchor="middle">MOSFET 2</Label>
 <Wires d="M165 113 V155 H415 V113 M290 155 V180"/><Label x={300} y={182} kind="value">Gate drive relative to common S</Label><Label x={290} y={60} anchor="middle" kind="value">Common sources</Label>
 <Label x={45} y={40}>A</Label><Label x={550} y={40}>B</Label><Label x={165} y={137} anchor="middle" kind="value">Body diode S → D</Label><Label x={415} y={137} anchor="middle" kind="value">Body diode S → D</Label>
 </svg>;
}


