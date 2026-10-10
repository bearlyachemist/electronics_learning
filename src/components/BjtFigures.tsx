// Static figures for Chapter 27, the bipolar transistor and the switch. Rendered at build time.
import Plot from './Plot';
import {Schematic,Figure,Wire,Res,Ind,Diode,Lamp,Source,Bjt,bjtPins,Ground,Rail,Dot,Terminal,Text,CurrentArrow,green,orange,gray,ink,type Pt} from './Schematic';
import {simpleSwitch} from '../engine/bjt.mjs';

const range=(a:number,b:number,n=240)=>Array.from({length:n+1},(_,k)=>a+(b-a)*k/n);

export function TerminalsFigure(){
  const n=bjtPins({at:[190,130]}),p=bjtPins({at:[470,130],pnp:true});
  return <Figure caption="NPN (left) and PNP (right). The emitter arrow points in the direction of conventional emitter current. In the NPN, base and collector currents flow in and leave together by the emitter: $I_E = I_B + I_C$. The PNP is the mirror image, with every current and voltage reversed.">
    <Schematic height={270} description="NPN transistor: base current enters the base, collector current enters the collector from above, and emitter current leaves the emitter downward. PNP transistor drawn emitter-up: emitter current enters from above, base and collector currents leave.">
      <Wire pts={[[80,130],n.b]}/><Wire pts={[[202,30],n.c]}/><Wire pts={[n.e,[202,230]]}/><Bjt at={[190,130]}/>
      <Terminal at={[80,130]} label="B"/><Terminal at={[202,30]} label="C"/><Terminal at={[202,230]} label="E"/>
      <CurrentArrow at={[120,130]} dir="right" label="I_B"/><CurrentArrow at={[202,58]} dir="down" label="I_C"/><CurrentArrow at={[202,202]} dir="down" label="I_E"/>
      <Text x={190} y={262} anchor="middle" kind="output">NPN: V_BE ≈ +0.65 V</Text>
      <Wire pts={[[360,130],p.b]}/><Wire pts={[[482,30],p.e]}/><Wire pts={[p.c,[482,230]]}/><Bjt at={[470,130]} pnp/>
      <Terminal at={[360,130]} label="B"/><Terminal at={[482,30]} label="E"/><Terminal at={[482,230]} label="C"/>
      <CurrentArrow at={[400,130]} dir="left" label="I_B"/><CurrentArrow at={[482,58]} dir="down" label="I_E"/><CurrentArrow at={[482,202]} dir="down" label="I_C"/>
      <Text x={470} y={262} anchor="middle" kind="output">PNP: V_BE ≈ −0.65 V</Text>
    </Schematic></Figure>;
}

// Collector current against base current for a fixed collector circuit, for three transistors of the same type.
export function BetaSpreadFigure(){
  const vcc=10,rc=1e3,limit=(vcc-.2)/rc*1e3,curve=(beta:number)=>range(0,400).map(ib=>[ib,Math.min(beta*ib/1e3,limit)] as [number,number]);
  return <Figure plot caption="Collector current against base current for a 1 kΩ collector resistor to 10 V, for three transistors of the same type with $\beta$ = 50, 100 and 200. On the sloped parts (active region) the current depends on $\beta$ and is therefore uncertain. Every curve ends on the same ceiling, $(V_{CC} - V_{CE(\mathrm{sat})})/R_C$ = 9.8 mA, set by the collector circuit alone. Choose a base current to the right of every knee — 300 µA here — and the switch works for any part in the bin.">
    <Plot curves={[{name:'β = 200',color:green,points:curve(200)},{name:'β = 100',color:ink,points:curve(100)},{name:'β = 50',color:gray,points:curve(50)},{name:'Collector-circuit ceiling',color:orange,dashed:true,points:[[0,limit],[400,limit]]},{name:'Design base current, 300 µA',color:orange,points:[[300,0],[300,12]]}]}
      xRange={[0,400]} yRange={[0,12]} xLabel="BASE CURRENT I_B / µA" yLabel="COLLECTOR CURRENT I_C / mA" description="Three lines rising from zero with slopes proportional to beta 50, 100 and 200, each flattening at 9.8 milliamps. A vertical line at 300 microamps lies beyond all three knees."/>
  </Figure>;
}

// Sweep the input of the lab's switch: collector voltage and transistor dissipation against input voltage.
export function SwitchSweepFigure(){
  const vcc=12,rc=120,rb=1e3,beta=100,vs=range(0,5,400).map(vin=>({vin,...simpleSwitch({vin,rb,vcc,rc,beta})}));
  return <Figure plot caption="The lamp switch of the lab (12 V, 120 Ω load, 1 kΩ base resistor, $\beta$ = 100) as its input rises from 0 to 5 V. Below 0.65 V the transistor is cut off and $V_{CE}$ = 12 V. Between 0.65 V and about 1.6 V it is active, and $V_{CE}$ falls in proportion to the base current. Above that it is saturated at 0.2 V. The transistor's own dissipation $I_C V_{CE}$ is tiny at both ends and peaks at 0.3 W when $V_{CE} = V_{CC}/2$: fifteen times the saturated value. A switch must pass through the middle quickly.">
    <div className="split-plots">
      <div><h4>Collector–emitter voltage</h4><Plot curves={[{name:'V_CE',color:green,points:vs.map(d=>[d.vin,d.vce])}]} xRange={[0,5]} yRange={[0,13]} xLabel="INPUT VOLTAGE / V" yLabel="V_CE / V" description="V_CE stays at 12 volts until the input reaches 0.65 volts, falls linearly to 0.2 volts by about 1.6 volts, then stays at 0.2 volts."/></div>
      <div><h4>Power dissipated in the transistor</h4><Plot curves={[{name:'P = I_C V_CE',color:orange,points:vs.map(d=>[d.vin,d.ic*d.vce*1e3])}]} xRange={[0,5]} yRange={[0,350]} xLabel="INPUT VOLTAGE / V" yLabel="POWER / mW" description="Power is zero below 0.65 volts, rises to a peak of 300 milliwatts near 1.15 volts, and falls to about 20 milliwatts once saturated."/></div>
    </div></Figure>;
}

// The opening question: a 12 V lamp switched by a 5 V logic output.
export function LampDriverFigure(){
  const q=bjtPins({at:[330,150]});
  return <Figure caption="The lamp switch designed in the worked example. $R_B$ sets about 10 mA of base current, ten times more than a $\beta$ = 100 transistor strictly needs. The 10 kΩ pull-down holds the base at ground if the logic pin is floating (during reset, for instance) and gives stored charge a path out at turn-off.">
    <Schematic width={470} height={270} description="Logic output through a 430 ohm base resistor to an NPN base; 10 kilohm resistor from base to ground; lamp from +12 V to the collector; emitter to ground.">
      <Terminal at={[60,150]} label="logic out" side="above"/><Wire pts={[[60,150],[100,150]]}/><Res a={[100,150]} b={[200,150]} label="R_B" value="430 Ω"/>
      <Wire pts={[[200,150],q.b]}/><Dot at={[250,150]}/><Res a={[250,150]} b={[250,240]} label="10 kΩ" flipLabel/><Ground at={[250,240]}/>
      <CurrentArrow at={[225,150]} dir="right" label="10 mA"/>
      <Bjt at={[330,150]}/><Ground at={q.e}/><Rail at={[342,25]} label="+12 V"/><Lamp a={[342,25]} b={q.c} label="lamp" value="12 V, 100 mA"/>
      <CurrentArrow at={[342,98]} dir="down" label="100 mA" side={-1}/>
    </Schematic></Figure>;
}

export function LedDriverFigure(){
  const q=bjtPins({at:[330,200]});
  return <Figure caption="An LED driven from a logic pin. $R_C$ sets the LED current from the voltage left over after the LED and $V_{CE(\mathrm{sat})}$; $R_B$ sets a base current five times larger than the minimum needed.">
    <Schematic width={480} height={280} description="Logic output through 5.6 kilohms to an NPN base. From +5 V, a 180 ohm resistor and an LED in series feed the collector. Emitter grounded.">
      <Terminal at={[60,200]} label="logic out" side="above"/><Wire pts={[[60,200],[110,200]]}/><Res a={[110,200]} b={[210,200]} label="R_B" value="5.6 kΩ"/><Wire pts={[[210,200],q.b]}/>
      <Bjt at={[330,200]}/><Ground at={q.e}/><Rail at={[342,22]} label="+5 V"/>
      <Res a={[342,22]} b={[342,100]} label="R_C" value="180 Ω"/><Diode kind="led" a={[342,100]} b={q.c} label="LED" value="2.0 V at 15 mA"/>
    </Schematic></Figure>;
}

export function RelayDriverFigure(){
  const q=bjtPins({at:[330,190]});
  return <Figure caption="A relay driver. The flywheel diode is reverse-biased while the transistor conducts. At turn-off the coil's current, which cannot stop instantly, circulates through the diode instead of driving the collector to a destructive voltage.">
    <Schematic width={540} height={270} description="Logic through 1.5 kilohms to an NPN base with 10 kilohm pull-down. Relay coil from +12 V to the collector, with a diode across the coil, cathode at the supply.">
      <Terminal at={[60,190]} label="logic out" side="above"/><Wire pts={[[60,190],[100,190]]}/><Res a={[100,190]} b={[200,190]} label="R_B" value="1.5 kΩ"/>
      <Wire pts={[[200,190],q.b]}/><Dot at={[250,190]}/><Res a={[250,190]} b={[250,255]} label="10 kΩ" flipLabel/><Ground at={[250,255]}/>
      <Bjt at={[330,190]}/><Ground at={q.e}/><Rail at={[342,22]} label="+12 V"/><Ind a={[342,22]} b={q.c} label="coil" value="12 V, 60 mA" flipLabel/>
      <Dot at={[342,42]}/><Dot at={[342,132]}/><Wire pts={[[342,42],[420,42]]}/><Wire pts={[[342,132],[420,132]]}/><Diode a={[420,132]} b={[420,42]} label="flywheel diode" value="1N4148"/>
    </Schematic></Figure>;
}

export function InverterFigure(){
  const q=bjtPins({at:[330,190]}),out:Pt=[342,128];
  const vin=range(0,2,400),pts=vin.map(v=>[v,simpleSwitch({vin:v,rb:22e3,vcc:5,rc:10e3,beta:100}).vce] as [number,number]);
  return <><Figure caption="A resistor–transistor inverter. A low input leaves the transistor cut off and the output pulled high through 10 kΩ; a high input saturates it and pulls the output to about 0.1–0.2 V.">
    <Schematic width={480} height={270} description="Input through 22 kilohms to an NPN base. Collector to +5 V through 10 kilohms; output taken at the collector. Emitter grounded.">
      <Terminal at={[60,190]} label="in" side="above"/><Wire pts={[[60,190],[110,190]]}/><Res a={[110,190]} b={[210,190]} label="R_B" value="22 kΩ"/><Wire pts={[[210,190],q.b]}/>
      <Bjt at={[330,190]}/><Ground at={q.e}/><Rail at={[342,22]} label="+5 V"/><Res a={[342,22]} b={out} label="R_C" value="10 kΩ"/><Wire pts={[out,q.c]}/>
      <Dot at={out}/><Wire pts={[out,[440,128]]}/><Terminal at={[440,128]} label="out" side="right"/>
    </Schematic></Figure>
    <Figure plot caption="Transfer curve of the inverter in the first model. Nothing happens until the input reaches 0.65 V. Then only about 0.1 V more at the input, which supplies the 4.8 µA of base current a $\beta$ = 100 transistor needs, swings the output from 5 V to 0.2 V. Real transistors make the corners rounder, but the threshold near one $V_{BE}$ remains. This is why such logic has poor noise margin when the input is low.">
      <Plot curves={[{name:'Output voltage',color:green,points:pts}]} xRange={[0,2]} yRange={[0,5.5]} xLabel="INPUT VOLTAGE / V" yLabel="OUTPUT VOLTAGE / V" description="Output stays at 5 volts up to 0.65 volts input, drops steeply to 0.2 volts by about 0.76 volts, and stays low."/>
    </Figure></>;
}

export function HighSideFigure(){
  const p=bjtPins({at:[330,110],pnp:true}),n=bjtPins({at:[248,232]}),node:Pt=[260,110];
  return <Figure caption="High-side switching. The PNP connects the grounded load to +12 V when its base is pulled about 0.7 V below its emitter. Logic cannot do that directly — a 5 V high is still 7 V below the emitter — so a small NPN sinks the PNP's base current through $R_B$. The 10 kΩ resistor from base to emitter turns the PNP fully off when the NPN releases.">
    <Schematic width={440} height={300} description="+12 V rail to the emitter of a PNP whose collector drives a grounded 0.5 ampere load. A 10 kilohm resistor from PNP base to emitter. A 560 ohm resistor from PNP base down to the collector of an NPN, whose emitter is grounded and whose base is driven from logic through 4.7 kilohms.">
      <Rail at={[342,22]} label="+12 V"/><Wire pts={[[342,22],p.e]}/><Bjt at={[330,110]} pnp/><Dot at={[342,45]}/><Wire pts={[[342,45],[260,45]]}/>
      <Res a={[260,45]} b={node} label="10 kΩ" flipLabel/><Wire pts={[node,p.b]}/><Dot at={node}/>
      <Res a={node} b={n.c} label="R_B" value="560 Ω" flipLabel/><Bjt at={[248,232]}/><Ground at={n.e}/>
      <Terminal at={[60,232]} label="logic in" side="above"/><Wire pts={[[60,232],[100,232]]}/><Res a={[100,232]} b={[180,232]} value="4.7 kΩ"/><Wire pts={[[180,232],n.b]}/>
      <Res a={p.c} b={[342,250]} label="load" value="0.5 A"/><Ground at={[342,250]}/>
      <Text x={372} y={105} kind="value">PNP</Text><Text x={278} y={268} kind="value">NPN</Text>
    </Schematic></Figure>;
}

// Base-current drive versus base-voltage drive: the same transistor, two very different sensitivities to β.
export function DriveComparisonFigure(){
  const q1=bjtPins({at:[170,150]}),q2=bjtPins({at:[480,150]});
  return <Figure caption="Two ways to bias the same transistor. Left: a fixed base current through 1 MΩ, so $I_C = \beta I_B$ depends directly on $\beta$. Right: a fixed base voltage with an emitter resistor, so $V_E = V_B - 0.65$ V fixes $I_E$ and $\beta$ hardly matters. Chapters 28 and 29 build on the right-hand circuit.">
    <Schematic height={305} description="Left circuit: +15 V through 1 megohm to the base, collector to +15 V through 3.3 kilohms, emitter grounded. Right circuit: a 2 volt source drives the base, collector to +15 V through 3.3 kilohms, emitter to ground through 1 kilohm.">
      <Rail at={[90,25]} label="+15 V"/><Res a={[90,25]} b={[90,150]} label="R_B" value="1 MΩ" flipLabel/><Wire pts={[[90,150],q1.b]}/>
      <Rail at={[182,25]} label="+15 V"/><Res a={[182,25]} b={q1.c} label="R_C" value="3.3 kΩ"/><Bjt at={[170,150]}/><Ground at={q1.e}/>
      <Text x={140} y={298} anchor="middle" kind="output">fixed base current</Text>
      <Source a={[400,250]} b={[400,190]} label="V_B" value="2.0 V"/><Wire pts={[[400,190],[400,150],q2.b]}/><Ground at={[400,250]}/>
      <Rail at={[492,25]} label="+15 V"/><Res a={[492,25]} b={q2.c} label="R_C" value="3.3 kΩ"/><Bjt at={[480,150]}/>
      <Res a={q2.e} b={[492,262]} label="R_E" value="1 kΩ"/><Ground at={[492,262]}/>
      <Text x={450} y={298} anchor="middle" kind="output">fixed base voltage</Text>
    </Schematic></Figure>;
}
