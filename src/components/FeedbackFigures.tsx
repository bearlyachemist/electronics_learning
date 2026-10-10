import {Bjt,Res,Cap,Diode,Ground,Dot,Wires,Label,green,orange} from './Parts';
export function FeedbackBlock(){return <svg className="wide-circuit" viewBox="0 0 640 270" role="img" aria-label="Input x enters a summing junction positively. Feedback b times output returns negatively. Error e drives forward gain A, producing output y.">
 <Wires d="M30 90 H115 M165 90 H240 M380 90 H595 M475 90 V210 H380 M250 210 H140 V115"/><circle cx="140" cy="90" r="25" fill="none" stroke={green} strokeWidth="2"/><rect x="240" y="55" width="140" height="70" rx="4" fill="var(--mint)" stroke={green}/><rect x="250" y="185" width="130" height="50" rx="4" fill="var(--mint)" stroke={green}/><Dot x={475} y={90}/>
 <Label x={30} y={67}>x</Label><Label x={124} y={91}>+</Label><Label x={139} y={110}>−</Label><Label x={190} y={70}>e</Label><Label x={310} y={98} anchor="middle">A</Label><Label x={565} y={70}>y</Label><Label x={315} y={218} anchor="middle">b</Label><Label x={160} y={238}>returned signal = by</Label>
 </svg>}

export function FeedbackAmpFigure({kind='ce'}:{kind?:'ce'|'follower'|'collector'}){
 const ce=kind!=='follower',feedback=kind==='collector';
 return <svg className="wide-circuit" viewBox="0 0 640 400" role="img" aria-label={feedback?'NPN common emitter with collector resistor, emitter grounded, and collector-to-base feedback resistor. Base receives signal through a source resistor.':ce?'NPN common emitter: collector resistor to supply, emitter degeneration resistor to ground, signal at biased base, output at collector.':'NPN emitter follower: collector to positive supply, emitter resistor to ground, input at biased base, output at emitter.'}>
 <Bjt x={320} y={190}/><Wires d={ce?'M332 35 V60 M332 120 V150 M332 230 V250 M332 310 V325 M110 190 H290 M332 135 H520':'M332 35 V150 M332 230 V250 M332 310 V325 M110 190 H290 M332 240 H520'}/>
 {ce&&<Res x={332} y={90} v/>}{feedback?<Wires d="M332 250 V310"/>:<Res x={332} y={280} v/>}<Ground x={332} y={325}/>
 <Label x={320} y={25}>+VCC</Label>{ce&&<Label x={365} y={95}>RC</Label>}{!feedback&&<Label x={365} y={287}>RE</Label>}<Label x={75} y={173}>biased input</Label><Label x={470} y={ce?123:229} kind="output">output</Label>
 {feedback&&<><Wires d="M450 135 V65 H210 M150 65 H130 V190"/><Res x={180} y={65}/><Label x={165} y={45}>RF</Label><Dot x={130} y={190}/><Dot x={450} y={135}/><Res x={200} y={190}/><Label x={180} y={220}>RS</Label></>}
 <Dot x={332} y={ce?135:240}/><Label x={65} y={388} kind="value">NPN · signal-source DC level supplies the bias · capacitors omitted for midband analysis</Label>
 </svg>;
}
export function SupplyFigure(){return <svg className="wide-circuit" viewBox="0 0 640 430" role="img" aria-label="Series regulator: NPN pass collector at raw input, emitter supplies load. Error amplifier compares reference at plus input against divided output at minus input and drives pass base. Current limit overrides the base drive.">
 <Bjt x={330} y={125}/><Wires d="M342 30 V85 M342 165 V190 H550 V235 M550 295 V360 H445 M445 190 V215 M445 275 V295 M445 355 V360 M180 140 H300 M75 115 H100 M100 165 H75 V285 H445"/>
 <path d="M100 90 L100 190 L180 140 Z" fill="var(--mint)" stroke={green} strokeWidth="1.8"/><Label x={109} y={120}>+</Label><Label x={109} y={171}>−</Label><Label x={35} y={95}>Vref</Label><Label x={114} y={70}>error amp</Label><Label x={330} y={22}>Vin</Label>
 <Res x={445} y={245} v/><Res x={445} y={325} v/><Res x={550} y={265} v/><Ground x={445} y={360}/><Dot x={445} y={190}/><Dot x={445} y={285}/><Label x={464} y={249}>Rtop</Label><Label x={464} y={325}>Rbottom</Label><Label x={575} y={270}>load</Label><Label x={488} y={178} kind="output">Vout</Label>
 <rect x="160" y="230" width="175" height="55" fill="var(--paper)" stroke={orange} strokeDasharray="5 4"/><Label x={247} y={253} anchor="middle">current limit</Label><Label x={247} y={273} anchor="middle" kind="value">drive override</Label><Wires d="M248 230 V140" color={orange} dashed/><Label x={30} y={416} kind="value">Functional loop: driver supply, current sensor, compensation and protection not shown.</Label>
 </svg>}
export function ThermalFigure(){return <svg className="wide-circuit" viewBox="0 0 640 235" role="img" aria-label="Temperature target minus measured temperature drives controller, power transistor and heater. Thermal plant temperature is measured by a sensor and returned to the negative summing input.">
 <Wires d="M20 70 H80 M120 70 H160 M280 70 H320 M440 70 H480 M580 70 H610 M600 70 V175 H365 M235 175 H100 V90"/><circle cx="100" cy="70" r="20" stroke={green} fill="none"/><rect x="160" y="40" width="120" height="60" fill="var(--mint)" stroke={green}/><rect x="320" y="40" width="120" height="60" fill="var(--mint)" stroke={green}/><rect x="480" y="40" width="100" height="60" fill="var(--mint)" stroke={green}/><rect x="235" y="150" width="130" height="50" fill="var(--mint)" stroke={green}/>
 <Label x={20} y={45}>Tset</Label><Label x={85} y={70}>+</Label><Label x={99} y={87}>−</Label><Label x={220} y={75} anchor="middle">controller</Label><Label x={380} y={65} anchor="middle">BJT + heater</Label><Label x={380} y={87} anchor="middle" kind="value">0 to Pmax</Label><Label x={530} y={75} anchor="middle">thermal mass</Label><Label x={300} y={180} anchor="middle">sensor + lag</Label>
 </svg>}
export function LogicFigure({kind='NOR'}:{kind?:'NOR'|'NAND'}){
 return kind==='NOR'?<svg className="wide-circuit" viewBox="0 0 640 340" role="img" aria-label="Two NPN transistors in parallel share a collector pull-up resistor. Each base is fed through 18 kilohms by an input. Either high input pulls output low, forming NOR.">
 <Bjt x={260} y={210}/><Bjt x={480} y={210}/><Res x={380} y={80} v/><Res x={150} y={210}/><Res x={385} y={210}/><Wires d="M380 25 V50 M380 110 V140 H272 V170 M380 140 H492 V170 M380 140 H590 M50 210 H120 M180 210 H230 M330 210 H355 M415 210 H450 M272 250 V290 H492 V250"/><Ground x={380} y={290}/><Wires d="M380 290 H272"/><Dot x={380} y={140}/><Label x={370} y={18}>+5 V</Label><Label x={411} y={85}>2.2 kΩ</Label><Label x={50} y={193}>A</Label><Label x={330} y={193}>B</Label><Label x={120} y={245}>18 kΩ</Label><Label x={359} y={245}>18 kΩ</Label><Label x={545} y={128} kind="output">Y</Label>
 </svg>:<svg className="wide-circuit" viewBox="0 0 640 390" role="img" aria-label="DTL NAND: 10 kilohm pull-up feeds node X. Two diodes have anodes at X and cathodes at inputs A and B. X feeds two forward level-shift diodes and 1 kilohm into an NPN base. Base has 100 kilohm to ground. Collector output has 2.2 kilohm pull-up.">
 <Bjt x={480} y={230}/><Res x={200} y={80} v/><Res x={492} y={80} v/><Res x={390} y={230}/><Res x={440} y={310} v/><Diode x={120} y={170} rotate={180}/><Diode x={120} y={230} rotate={180}/><Diode x={260} y={230}/><Diode x={325} y={230}/>
 <Wires d="M200 20 V50 M200 110 V230 H230 M200 170 H150 M90 170 H45 M200 230 H150 M90 230 H45 M290 230 H295 M355 230 H360 M420 230 H450 M440 230 V280 M440 340 V360 H492 V270 M492 20 V50 M492 110 V190 M492 150 H585"/><Ground x={492} y={360}/><Dot x={200} y={170}/><Dot x={200} y={230}/><Dot x={440} y={230}/><Dot x={492} y={150}/>
 <Label x={180} y={15}>+5 V</Label><Label x={477} y={15}>+5 V</Label><Label x={225} y={85}>10 kΩ</Label><Label x={518} y={85}>2.2 kΩ</Label><Label x={45} y={155}>A</Label><Label x={45} y={215}>B</Label><Label x={208} y={205}>X</Label><Label x={275} y={260} kind="value">2 level diodes</Label><Label x={373} y={207}>1 kΩ</Label><Label x={351} y={318}>100 kΩ</Label><Label x={565} y={137} kind="output">Y</Label>
 </svg>;
}




