import Plot from './Plot';
import * as S from './Schematic';
import {channel,bisect,bodyThreshold} from '../engine/fet.mjs';
import {bias,mirror,diodeVoltage,follower,differential} from '../engine/mos-analog.mjs';
const xs=(a:number,b:number,n=200)=>Array.from({length:n+1},(_,i)=>a+(b-a)*i/n);
const slope=(fn:(x:number)=>number,x:number,h=1e-4)=>(fn(x+h)-fn(x-h))/(2*h);
const K=.002,VT=1;

/* ---------- Chapter 52: bias atlas ---------- */
export function BiasAtlasCircuit(){
 const q=S.fetPins({at:[386,180]});
 return <S.Figure caption="The circuit used throughout this chapter. A 3 MΩ / 2 MΩ divider holds the gate at 2.0 V while drawing only 1 µA; the coupling capacitor adds the signal without disturbing that DC level. $R_S$ is 0 or 500 Ω in the examples. The optional bypass capacitor $C_S$ grounds the source for signals while leaving the DC bias unchanged. The body is tied to the source, as in a discrete MOSFET.">
 <S.Schematic height={380} description="NMOS common-source stage: five volt rail, two kilohm drain resistor, gate divider of three and two megohms with coupling capacitor input, source resistor with optional bypass capacitor, output at the drain.">
  <S.Rail at={[400,40]} label="V_DD = 5 V"/><S.Wire pts={[[250,40],[400,40]]}/><S.Dot at={[400,40]}/>
  <S.Res a={[400,40]} b={[400,120]} label="R_D" value="2 kΩ"/><S.Wire pts={[[400,120],q.d]}/>
  <S.Wire pts={[[400,120],[540,120]]}/><S.Dot at={[400,120]}/><S.Terminal at={[540,120]} label="V_D" side="right"/>
  <S.Fet at={[386,180]}/>
  <S.Wire pts={[q.s,[400,240]]}/><S.Res a={[400,240]} b={[400,330]} label="R_S" value="0 or 500 Ω" flipLabel/><S.Ground at={[400,330]}/>
  <S.Wire pts={[[400,240],[480,240]]}/><S.Dot at={[400,240]}/><S.Cap a={[480,240]} b={[480,330]} label="C_S" value="optional"/><S.Ground at={[480,330]}/>
  <S.Res a={[250,40]} b={[250,180]} label="R_1" value="3.0 MΩ" flipLabel/><S.Res a={[250,180]} b={[250,330]} label="R_2" value="2.0 MΩ" flipLabel/><S.Ground at={[250,330]}/>
  <S.Wire pts={[[250,180],q.g]}/><S.Dot at={[250,180]}/><S.Text x={262} y={168}>V_G = 2.0 V</S.Text>
  <S.Terminal at={[80,180]} label="v_in"/><S.Cap a={[80,180]} b={[200,180]} label="C_in"/><S.Wire pts={[[200,180],[250,180]]}/>
 </S.Schematic></S.Figure>;
}

export function OutputFamilyFigure(){
 const vgs=[1.5,2,2.5,3],cols=[S.gray,S.green,S.ink,S.orange];
 const curves=vgs.map((v,i)=>({name:'V_GS = '+v+' V',color:cols[i],points:xs(0,5).map(d=>[d,channel(v,d,K,VT,0).id*1e3] as [number,number])}));
 return <S.Figure plot caption="The device law and the resistor law on one graph. Solid curves are the transistor’s $I_D$–$V_{DS}$ characteristics ($k$ = 2 mA/V², $V_T$ = 1 V); the straight line is the 2 kΩ load line from 5 V. The dashed parabola $I_D = kV_{DS}^2/2$ separates triode (left) from saturation (right). Each operating point is an intersection. The 1.5 V and 2 V points sit on flat parts of their curves; the 3 V point has slid into triode, where the curves crowd together and a change of gate voltage barely moves the drain.">
 <Plot curves={[...curves,{name:'2 kΩ load line',color:S.ink,dashed:true,points:[[0,2.5],[5,0]]},{name:'Saturation edge',color:S.gray,dashed:true,points:xs(0,2.2).map(d=>[d,K*d*d/2*1e3] as [number,number])}]}
  marks={[{at:[4.5,.25],label:'1.5 V'},{at:[3,1],label:'2 V'},{at:[.649,2.175],label:'3 V',pos:'nw'}]}
  xRange={[0,5]} yRange={[0,4.2]} xLabel="DRAIN–SOURCE VOLTAGE V_DS / V" yLabel="DRAIN CURRENT I_D / mA" description="Output characteristic curves for four gate voltages, crossed by the two kilohm load line; operating points at 1.5, 2 and 3 volts."/></S.Figure>;
}

export function GainVsGateFigure(){
 const vd=(v:number)=>bias({vg:v,lambda:.02}).vd;
 return <S.Figure plot caption="Answering the opening question. Drain voltage (green) and the magnitude of the local gain $|dV_D/dV_G|$ (orange) as the gate bias is swept, with $R_S$ = 0. Gain grows as $g_m = ku$ grows, peaks just before the saturation edge near $V_G$ ≈ 2.35 V, then collapses in triode. More gate voltage first buys gain, then destroys it.">
 <Plot curves={[{name:'Drain voltage / V',color:S.green,points:xs(.5,4).map(v=>[v,vd(v)] as [number,number])},{name:'|gain| / (V/V)',color:S.orange,points:xs(.5,4,350).map(v=>[v,Math.abs(slope(vd,v))] as [number,number])}]}
  marks={[{at:[2,3],label:'bias',pos:'sw'},{at:[2.351,1.351],label:'edge',pos:'sw'}]}
  xRange={[.5,4]} yRange={[0,5.5]} xLabel="GATE BIAS V_G / V" yLabel="VOLTS, OR V/V" description="Drain voltage falls with gate bias; gain magnitude rises to about five at 2.35 volts then drops sharply in triode."/></S.Figure>;
}

export function ThresholdSpreadFigure(){
 const cases:[number,number,string,string][]=[[2,0,'V_G = 2 V, R_S = 0',S.orange],[2.5,500,'V_G = 2.5 V, R_S = 500 Ω',S.gray],[3,1000,'V_G = 3 V, R_S = 1 kΩ',S.green]];
 return <S.Figure plot caption="Why bias circuits use source resistors. All three circuits give 1 mA at the nominal threshold of 1 V. Over a ±0.3 V threshold spread (typical of discrete parts), the grounded-source circuit varies from 0.49 to 1.69 mA; with 1 kΩ of source feedback the range shrinks to 0.80–1.20 mA. The price is a higher gate voltage and, unless $R_S$ is bypassed, lower gain.">
 <Plot curves={cases.map(([vg,rs,name,color])=>({name,color,points:xs(.7,1.3).map(vt=>[vt,bias({vg,rs,vt}).id*1e3] as [number,number])}))} xRange={[.7,1.3]} yRange={[0,1.8]} xLabel="THRESHOLD VOLTAGE V_T / V" yLabel="DRAIN CURRENT / mA" description="Drain current against threshold voltage for three bias circuits; the one with a one kilohm source resistor is flattest."/></S.Figure>;
}

/* ---------- Chapter 53: diode-connected loads ---------- */
// Output of an NMOS input (k = 2 mA/V²) loaded by a diode-connected NMOS of k·ratio on 5 V. Thresholds 1 V.
const diodeOut=(vin:number,ratio:number,gamma=0)=>{
 const f=(v:number)=>channel(vin,v,K,VT).id-channel(5-v,5-v,K*ratio,bodyThreshold(VT,gamma,.6,v)).id;
 // Input off: only leakage flows, so the load sits at the edge of conduction.
 return channel(vin,4,K,VT).id===0?bisect((v:number)=>v-(5-bodyThreshold(VT,gamma,.6,v)),0,5):bisect(f,0,5);
};
export function DiodeLoadCircuit(){
 const m2=S.fetPins({at:[336,120]}),m1=S.fetPins({at:[336,250]});
 return <S.Figure caption="A common-source stage with a diode-connected load. $M_2$'s gate and drain both go to the 5 V rail, so its source, the output, sits one $V_{GS2}$ below the rail. Both transistors carry the same current. Each body is tied to its own source (the next figures show what a shared, grounded body changes). Example values: $k_1$ = 2 mA/V², $k_2$ = 0.5 mA/V², 1 mA, giving $V_{in}$ = 2 V and $V_{out}$ = 2 V.">
 <S.Schematic height={360} description="Diode-connected NMOS M2 from five volt rail to output node, NMOS M1 from output to ground with gate driven by the input.">
  <S.Rail at={[350,40]} label="V_DD = 5 V"/><S.Wire pts={[[350,40],m2.d]}/>
  <S.Fet at={[336,120]}/><S.Wire pts={[m2.g,[280,120],[280,60],[350,60]]}/><S.Dot at={[350,60]}/>
  <S.Text x={380} y={110}>M_2</S.Text><S.Text x={380} y={130} kind="value">k_2 = 0.5 mA/V²</S.Text>
  <S.Wire pts={[m2.s,m1.d]}/><S.Wire pts={[[350,185],[520,185]]}/><S.Dot at={[350,185]}/><S.Terminal at={[520,185]} label="V_out" side="right"/>
  <S.Fet at={[336,250]}/><S.Text x={380} y={240}>M_1</S.Text><S.Text x={380} y={260} kind="value">k_1 = 2 mA/V²</S.Text>
  <S.Wire pts={[m1.s,[350,320]]}/><S.Ground at={[350,320]}/>
  <S.Terminal at={[180,250]} label="V_in"/><S.Wire pts={[[180,250],m1.g]}/>
  <S.CurrentArrow at={[350,200]} dir="down" label="I_D" side={-1}/>
 </S.Schematic></S.Figure>;
}
export function DiodeSmallSignalFigure(){
 const q=S.fetPins({at:[166,170]});
 return <S.Figure caption="Why a diode connection looks like a small resistor. Apply a small test voltage $v$. Because gate and drain are the same node, $v_{gs} = v$, so the device's controlled current $g_mv$ flows from that very node: it behaves exactly like a conductance $g_m$. In parallel with $r_o$ the total is $1/(g_m + g_{ds})$, typically hundreds of ohms, not the tens of kilohms of $r_o$ alone.">
 <S.Schematic width={720} height={300} description="Left: a diode-connected NMOS driven by a test voltage. Right: its small-signal model, a controlled current g m v in parallel with r o.">
  <S.Terminal at={[60,80]} label="v"/><S.Wire pts={[[60,80],[180,80],q.d]}/><S.Fet at={[166,170]}/>
  <S.Wire pts={[q.g,[100,170],[100,105],[180,105]]}/><S.Dot at={[180,105]}/><S.Wire pts={[q.s,[180,250]]}/><S.Ground at={[180,250]}/>
  <S.CurrentArrow at={[120,80]} dir="right" label="i"/>
  <S.Text x={270} y={170} anchor="middle">≡</S.Text>
  <S.Terminal at={[320,80]} label="v"/><S.Wire pts={[[320,80],[520,80]]}/>
  <S.DepSource a={[410,80]} b={[410,250]} label="g_m v"/><S.Res a={[520,80]} b={[520,250]} label="r_o"/>
  <S.Wire pts={[[410,250],[520,250]]}/><S.Ground at={[465,250]}/><S.Dot at={[410,80]}/>
  <S.Text x={575} y={170}>= 1/(g_m + g_ds)</S.Text>
 </S.Schematic></S.Figure>;
}
export function DiodeTransferFigure(){
 const cases:[number,string,string][]=[[.25,'k_2/k_1 = 1/4',S.green],[1,'k_2/k_1 = 1',S.ink],[4,'k_2/k_1 = 4',S.gray]];
 return <S.Figure plot caption="Large-signal transfer curves of the stage. Between cutoff (left) and the point where $M_1$ enters triode (where each curve bends), the output is an exactly straight line of slope $-\sqrt{k_1/k_2}$: −2, −1 and −0.5. The two square laws cancel. The dashed line $V_{out} = V_{in} - V_T$ marks $M_1$'s saturation edge; to its lower right, $M_1$ is in triode.">
 <Plot curves={[...cases.map(([r,name,color])=>({name,color,points:xs(0,5,250).map(v=>[v,diodeOut(v,r)] as [number,number])})),{name:'M_1 saturation edge',color:S.orange,dashed:true,points:[[1,0],[5,4]]}]}
  marks={[{at:[2,2],label:'example bias',pos:'sw'}]}
  xRange={[0,5]} yRange={[0,4.5]} xLabel="INPUT V_in / V" yLabel="OUTPUT V_out / V" description="Three straight-line transfer characteristics with slopes minus two, minus one and minus one half, each bending where the input transistor enters triode."/></S.Figure>;
}
export function DiodeHeadroomFigure(){
 // 1 mA, input overdrive 1 V, 5 V supply: gain = u2/u1, output = 4 − u2.
 return <S.Figure plot caption="The diode-load budget at 1 mA with 1 V of input overdrive. Gain magnitude equals the ratio of overdrives, $u_2/u_1$, so more gain needs more load overdrive, which lowers the output. When $V_{out}$ falls to $u_1$ = 1 V (gain 3) the input transistor reaches its saturation edge. In a 5 V supply with 1 V thresholds this stage cannot exceed a gain of 3 at this input overdrive.">
 <Plot curves={[{name:'|gain| = u_2/u_1',color:S.green,points:xs(.25,3.5).map(u=>[u,u] as [number,number])},{name:'V_out = V_DD − V_T − u_2 / V',color:S.orange,points:xs(.25,3.5).map(u=>[u,4-u] as [number,number])},{name:'M_1 saturation limit',color:S.gray,dashed:true,points:[[.25,1],[3.5,1]]}]}
  marks={[{at:[2,2],label:'example',pos:'nw'},{at:[3,1],label:'limit',pos:'ne'}]}
  xRange={[0,3.5]} yRange={[0,4]} xLabel="LOAD OVERDRIVE u_2 / V" yLabel="V/V, OR VOLTS" description="Gain rises and output voltage falls as load overdrive increases; they cross the input saturation limit at a gain of three."/></S.Figure>;
}
export function DiodeBodyFigure(){
 return <S.Figure plot caption="The same 1 : 4 stage with $M_2$'s body tied to its source (green) and to ground (orange), with $\gamma$ = 0.5 √V. A grounded body raises $M_2$'s threshold as the output rises, so the output sits lower and the line bends: the local gain at $V_{in}$ = 2 V drops from −2.00 to −1.71. Only a process with isolated wells can avoid this.">
 <Plot curves={[{name:'Body tied to source',color:S.green,points:xs(0,5,250).map(v=>[v,diodeOut(v,.25)] as [number,number])},{name:'Body grounded',color:S.orange,points:xs(0,5,250).map(v=>[v,diodeOut(v,.25,.5)] as [number,number])}]}
  xRange={[0,5]} yRange={[0,4.5]} xLabel="INPUT V_in / V" yLabel="OUTPUT V_out / V" description="With a grounded body the transfer curve sits lower and is no longer straight."/></S.Figure>;
}

/* ---------- Chapter 54: basic current mirror ---------- */
export function MirrorResistorCircuit(){
 const l=S.fetPins({at:[250,250],flip:true}),r=S.fetPins({at:[450,250]});
 return <S.Figure caption="A complete mirror. $R_{REF}$ from the 5 V rail sets the reference: $M_1$, diode connected, settles at the gate voltage that makes its drain current equal to the resistor current, 2.0 V at 1 mA for $k$ = 2 mA/V². $M_2$ shares that gate voltage and copies the current into whatever load hangs on its drain, provided its drain stays above the 1 V overdrive.">
 <S.Schematic height={380} description="Five volt rail through three kilohm reference resistor to diode-connected NMOS M1; M2 shares the gate and sinks the output current from a load connected to the rail.">
  <S.Rail at={[236,40]} label="+5 V"/><S.Res a={[236,40]} b={[236,170]} label="R_REF" value="3.0 kΩ"/><S.Wire pts={[[236,170],l.d]}/>
  <S.Fet at={[250,250]} flip/><S.Fet at={[450,250]}/>
  <S.Wire pts={[[236,190],[320,190],[320,250]]}/><S.Dot at={[236,190]}/>
  <S.Wire pts={[l.g,r.g]}/><S.Dot at={[320,250]}/>
  <S.Wire pts={[l.s,[236,330]]}/><S.Ground at={[236,330]}/><S.Wire pts={[r.s,[464,330]]}/><S.Ground at={[464,330]}/>
  <S.Rail at={[464,40]} label="+5 V"/><S.Res a={[464,40]} b={[464,150]} label="load" value="any, while V_D > 1 V"/><S.Wire pts={[[464,150],r.d]}/>
  <S.Wire pts={[[464,180],[580,180]]}/><S.Dot at={[464,180]}/><S.Terminal at={[580,180]} label="V_OUT" side="right"/>
  <S.CurrentArrow at={[236,150]} dir="down" label="I_REF = 1 mA" side={-1}/><S.CurrentArrow at={[464,196]} dir="down" label="I_OUT"/>
  <S.Text x={340} y={240} kind="value">V_GS = 2.0 V</S.Text>
  <S.Text x={180} y={300}>M_1</S.Text><S.Text x={485} y={300}>M_2</S.Text>
 </S.Schematic></S.Figure>;
}
export function MirrorOutputFigure(){
 const ls:[number,string][]=[[0,S.gray],[.02,S.green],[.05,S.orange]];
 return <S.Figure plot caption="Output current against output voltage for a 1 mA mirror ($k$ = 2 mA/V², $V_T$ = 1 V) at three values of $\lambda$. Below the 1 V knee the output device is in triode and the copy collapses. Above it the current rises with slope $1/r_o$. The curves cross 1 mA where the output drain voltage equals the reference device's own $V_{DS}$ (about 2 V): there, and only there, the copy is exact.">
 <Plot curves={ls.map(([l,c])=>({name:'λ = '+l+' V⁻¹',color:c,points:xs(0,5,250).map(v=>[v,mirror({vout:v,lambda:l}).id*1e3] as [number,number])}))} marks={[{at:[1.981,1],label:'V_OUT = V_GS',pos:'se'}]}
  xRange={[0,5]} yRange={[0,1.2]} xLabel="OUTPUT VOLTAGE V_OUT / V" yLabel="OUTPUT CURRENT / mA" description="Mirror output current rises from zero, knees at one volt, then slopes upward with a slope set by lambda."/></S.Figure>;
}
export function MirrorSupplyFigure(){
 const iref=(vdd:number)=>bisect((i:number)=>i-(vdd-(VT+Math.sqrt(2*i/K)))/3000,1e-12,vdd/3000)*1e3;
 return <S.Figure plot caption="A mirror copies its reference, including the reference's faults. With a 3 kΩ resistor the reference current changes by 0.29 mA per volt of supply at 5 V, a 29%/V sensitivity, because almost all of a supply change appears across the resistor. The dashed line is what a constant-$V_{GS}$ approximation predicts; the diode's own slope ($1/g_m$ = 500 Ω in series with $R$) reduces the sensitivity slightly.">
 <Plot curves={[{name:'MOS diode + 3 kΩ',color:S.green,points:xs(1.2,8).map(v=>[v,iref(v)] as [number,number])},{name:'(V_DD − 2 V)/3 kΩ',color:S.gray,dashed:true,points:[[2,0],[8,2]]}]} marks={[{at:[5,1],label:'design',pos:'nw'}]}
  xRange={[0,8]} yRange={[0,2]} xLabel="SUPPLY V_DD / V" yLabel="REFERENCE CURRENT / mA" description="Reference current set by a resistor rises nearly linearly with supply voltage."/></S.Figure>;
}
export function MirrorMismatchFigure(){
 const sv=.005,sk=.01;
 return <S.Figure plot caption="Random current mismatch between two mirror devices against overdrive, for a threshold mismatch of $\sigma_{V_T}$ = 5 mV and a $k$ mismatch of $\sigma_k$ = 1% (one standard deviation). The threshold term $2\sigma_{V_T}/u$ dominates at low overdrive; the $k$ term is independent of bias. Running a mirror at small overdrive saves headroom but costs matching.">
 <Plot curves={[{name:'Threshold term 2σ_VT/u',color:S.orange,points:xs(.1,1.5).map(u=>[u,200*sv/u] as [number,number])},{name:'k term',color:S.gray,dashed:true,points:[[.1,100*sk],[1.5,100*sk]]},{name:'Combined (root sum of squares)',color:S.green,points:xs(.1,1.5).map(u=>[u,100*Math.hypot(2*sv/u,sk)] as [number,number])}]}
  marks={[{at:[1,100*Math.hypot(.01,.01)],label:'1.4% at u = 1 V',pos:'ne'}]}
  xRange={[0,1.5]} yRange={[0,6]} xLabel="OVERDRIVE u / V" yLabel="1σ CURRENT MISMATCH / %" description="Current mismatch falls with overdrive as the threshold contribution shrinks, approaching the constant k mismatch."/></S.Figure>;
}

/* ---------- Chapter 55: ratioed and complementary mirrors ---------- */
export function BiasTreeCircuit(){
 const m1=S.fetPins({at:[134,250],flip:true}),m5=S.fetPins({at:[300,250]}),m2=S.fetPins({at:[460,250]}),m3=S.fetPins({at:[488,100],kind:'pmos',flip:true}),m4=S.fetPins({at:[630,100],kind:'pmos'});
 return <S.Figure caption="A bias tree. One resistor sets a 100 µA reference in $M_1$. NMOS copies sink current: $M_5$, four unit devices in parallel, sinks 400 µA; $M_2$ sinks 100 µA out of the diode-connected PMOS $M_3$, which turns it into a PMOS gate voltage. $M_4$, two PMOS units, then sources 200 µA into a grounded load. Sinks and sources for a whole chip can hang off one reference this way. All units: $k$ = 2 mA/V², $|V_T|$ = 1 V.">
 <S.Schematic width={720} height={400} description="Reference resistor and diode NMOS M1 drive NMOS mirrors M5 times four and M2 times one; M2 feeds diode PMOS M3 which drives PMOS M4 times two sourcing current into a load.">
  <S.Rail at={[120,40]} label="+5 V"/><S.Wire pts={[[120,40],[644,40]]}/><S.Dot at={[314,40]}/><S.Dot at={[474,40]}/>
  <S.Res a={[120,40]} b={[120,170]} label="R_REF" value="36.8 kΩ"/><S.Wire pts={[[120,170],m1.d]}/><S.Fet at={[134,250]} flip/>
  <S.Wire pts={[[120,190],[190,190],[190,250]]}/><S.Dot at={[120,190]}/><S.Wire pts={[m1.g,m5.g]}/><S.Dot at={[190,250]}/><S.Dot at={[230,250]}/>
  <S.Wire pts={[m1.s,[120,305]]}/><S.Ground at={[120,305]}/>
  <S.Fet at={[300,250]}/><S.Res a={[314,40]} b={[314,150]} label="load"/><S.Wire pts={[[314,150],m5.d]}/><S.Wire pts={[m5.s,[314,305]]}/><S.Ground at={[314,305]}/>
  <S.Wire pts={[[230,250],[230,345],[400,345],[400,250],m2.g]}/>
  <S.Fet at={[460,250]}/><S.Wire pts={[m2.s,[474,305]]}/><S.Ground at={[474,305]}/>
  <S.Wire pts={[[474,40],m3.s]}/><S.Fet at={[488,100]} kind="pmos" flip/><S.Wire pts={[m3.d,m2.d]}/>
  <S.Wire pts={[[474,170],[540,170],[540,100]]}/><S.Dot at={[474,170]}/><S.Wire pts={[m3.g,m4.g]}/><S.Dot at={[540,100]}/>
  <S.Wire pts={[[644,40],m4.s]}/><S.Fet at={[630,100]} kind="pmos"/><S.Wire pts={[m4.d,[644,200]]}/><S.Res a={[644,200]} b={[644,305]} label="load"/><S.Ground at={[644,305]}/>
  <S.Text x={70} y={255} anchor="end">M_1</S.Text><S.Text x={70} y={275} anchor="end" kind="value">×1</S.Text>
  <S.Text x={250} y={215}>M_5</S.Text><S.Text x={250} y={232} kind="value">×4</S.Text>
  <S.Text x={415} y={215}>M_2</S.Text><S.Text x={415} y={232} kind="value">×1</S.Text>
  <S.Text x={420} y={95}>M_3</S.Text><S.Text x={420} y={112} kind="value">×1</S.Text>
  <S.Text x={668} y={95}>M_4</S.Text><S.Text x={668} y={112} kind="value">×2</S.Text>
  <S.CurrentArrow at={[120,150]} dir="down" label="100 µA" side={-1}/><S.CurrentArrow at={[314,180]} dir="down" label="400 µA"/><S.CurrentArrow at={[644,175]} dir="down" label="200 µA"/>
 </S.Schematic></S.Figure>;
}
export function PmosComplianceFigure(){
 const ls:[number,string][]=[[0,S.gray],[.02,S.green]];
 return <S.Figure plot caption="A PMOS 1 : 2 mirror sourcing from 5 V with a 1 mA reference ($k$ = 2 mA/V² per unit, $|V_T|$ = 1 V, so $u$ = 1 V). Plotted against the actual output node voltage, the current holds near 2 mA until the output rises within one overdrive of the rail, then collapses to zero at 5 V. A sourcing mirror's limit is at the top.">
 <Plot curves={ls.map(([l,c])=>({name:'λ = '+l+' V⁻¹',color:c,points:xs(0,5,250).map(v=>[v,mirror({vout:5-v,lambda:l,ratio:2}).id*1e3] as [number,number])}))} marks={[{at:[4,2],label:'compliance: V_DD − u',pos:'sw'}]}
  xRange={[0,5]} yRange={[0,2.5]} xLabel="OUTPUT NODE VOLTAGE V_OUT / V" yLabel="SOURCED CURRENT / mA" description="PMOS mirror current is nearly constant at two milliamps up to four volts, then falls to zero at the five volt rail."/></S.Figure>;
}
export function UnitRatioFigure(){
 const dw=.1;
 return <S.Figure plot caption="Ratio error of a 1 : 4 mirror when the effective channel width is the drawn width minus an edge loss $\Delta W$ = 0.1 µm. Drawing one device four times as wide gives a ratio of $(4W - \Delta W)/(W - \Delta W)$, too large by several percent for narrow devices. Building the 4× device from four copies of the unit gives exactly four edges' worth of loss for four units: the systematic error vanishes.">
 <Plot curves={[{name:'One device, 4× wide',color:S.orange,points:xs(.5,10).map(w=>[w,100*((4*w-dw)/(w-dw)/4-1)] as [number,number])},{name:'Four parallel unit devices',color:S.green,points:[[.5,0],[10,0]]}]}
  xRange={[0,10]} yRange={[-1,20]} xLabel="UNIT DRAWN WIDTH W / µm" yLabel="RATIO ERROR / %" description="A single wide device has a ratio error falling from about nineteen percent at half a micrometre to under one percent at ten; parallel unit devices have zero systematic error."/></S.Figure>;
}

/* ---------- Chapter 56: source degeneration ---------- */
// Saturated NMOS (k/2 = 1 mA/V², V_T = 1 V) with source resistor R (kΩ), biased at 1 mA; current in mA for gate signal v.
const degI=(v:number,R:number)=>{const a=1+R+v;if(a<=0)return 0;if(R===0)return a*a;const t=(-1+Math.sqrt(1+4*R*a))/(2*R);return t*t;};
export function DegenSmallSignalFigure(){
 return <S.Figure caption="The small-signal model used for every derivation in this chapter. The controlled source responds to $v_{gs} = v_g - v_s$; the body source to $v_{bs} = -v_s$ when the body is grounded; $r_o$ connects drain to source, not drain to ground. Both the drain and the source move, so KCL must be written at both nodes.">
 <S.Schematic width={640} height={370} description="Small-signal MOSFET model: drain node at top with load R D prime to ground, controlled sources g m v g s and g m b v b s and r o between drain and source, source node with R S to ground.">
  <S.Text x={20} y={110}>gate: v_g</S.Text><S.Text x={20} y={130} kind="value">no current;</S.Text><S.Text x={20} y={146} kind="value">v_gs = v_g − v_s</S.Text>
  <S.Wire pts={[[220,60],[480,60]]}/><S.Dot at={[300,60]}/><S.Dot at={[400,60]}/><S.Text x={210} y={52} anchor="end">drain v_d</S.Text>
  <S.Res a={[480,60]} b={[480,340]} label="R_D′" value="R_D ∥ R_L"/><S.Ground at={[480,340]}/>
  <S.DepSource a={[220,60]} b={[220,250]} label="g_m v_gs" flipLabel/><S.DepSource a={[300,60]} b={[300,250]} label="g_mb v_bs"/><S.Res a={[400,60]} b={[400,250]} label="r_o"/>
  <S.Wire pts={[[220,250],[400,250]]}/><S.Dot at={[300,250]}/><S.Res a={[310,250]} b={[310,340]} label="R_S"/><S.Dot at={[310,250]}/><S.Ground at={[310,340]}/>
  <S.Text x={210} y={280} anchor="end">source v_s</S.Text>
 </S.Schematic></S.Figure>;
}
export function DegenLinearityFigure(){
 const rs:[number,string,string][]=[[0,'R_S = 0',S.orange],[.5,'R_S = 500 Ω',S.gray],[2,'R_S = 2 kΩ',S.green]];
 const gmn=(v:number,R:number)=>slope(x=>degI(x,R),v)/slope(x=>degI(x,R),0);
 return <S.Figure plot caption="Effective transconductance $di_D/dv_g$, normalized to its value at the bias point, as the gate signal swings. Each circuit is biased at 1 mA ($k$ = 2 mA/V², $V_T$ = 1 V; the gate bias is raised to compensate for the source drop). Without degeneration $g_m$ changes by ±50% over a ±0.5 V swing, which is the square law's distortion. With 500 Ω the change is −15% / +11%; with 2 kΩ it is only about ±2%. The source resistor linearizes the stage.">
 <Plot curves={rs.map(([R,name,color])=>({name,color,points:xs(-.6,.6).map(v=>[v,gmn(v,R)] as [number,number])}))} xRange={[-.6,.6]} yRange={[0,1.8]} xLabel="GATE SIGNAL v_g / V" yLabel="g_m,eff / g_m,eff AT BIAS" description="Normalized effective transconductance against gate signal: steep line for no degeneration, much flatter with two kilohms."/></S.Figure>;
}
export function DegenGainSpreadFigure(){
 const rs:[number,string,string][]=[[0,'R_S = 0',S.orange],[500,'R_S = 500 Ω',S.gray],[1000,'R_S = 1 kΩ',S.green]];
 return <S.Figure plot caption="Gain of a current-biased common-source stage ($I_D$ = 1 mA, $R_D$ = 5 kΩ) as the device constant $k$ varies over a 4 : 1 range. Without degeneration the gain doubles, from −7.1 to −14.1, following $g_m = \sqrt{2kI_D}$. With 1 kΩ in the source it changes only from −2.9 to −3.7, because the gain approaches $-R_D/R_S$ = −5 as $g_mR_S$ grows.">
 <Plot curves={rs.map(([R,name,color])=>({name,color,points:xs(1,4).map(k=>{const gm=Math.sqrt(2*k*1e-3*1e-3);return [k,gm*5000/(1+gm*R)] as [number,number];})}))} xRange={[1,4]} yRange={[0,15]} xLabel="DEVICE CONSTANT k / (mA/V²)" yLabel="|VOLTAGE GAIN|" description="Gain magnitude rises steeply with k without degeneration and barely changes with one kilohm of source resistance."/></S.Figure>;
}
export function DegenMismatchFigure(){
 const gm=2,sv=.01,sr=.01;
 return <S.Figure plot caption="Current mismatch of a 1 mA mirror ($u$ = 1 V, $g_m$ = 2 mS) with a 10 mV threshold mismatch and 1% resistor mismatch, against source resistance. Degeneration divides the threshold term by $1 + g_mR_S$ while the resistor term grows toward the resistor mismatch itself. Beyond $g_mR_S$ ≈ 2 the mirror's accuracy is set by its resistors.">
 <Plot curves={[{name:'Threshold term',color:S.orange,points:xs(0,3).map(r=>[r,100*2*sv/1/(1+gm*r)] as [number,number])},{name:'Resistor term',color:S.gray,points:xs(0,3).map(r=>[r,100*sr*gm*r/(1+gm*r)] as [number,number])},{name:'Combined (RSS)',color:S.green,points:xs(0,3).map(r=>[r,100*Math.hypot(2*sv/(1+gm*r),sr*gm*r/(1+gm*r))] as [number,number])}]}
  xRange={[0,3]} yRange={[0,2.2]} xLabel="SOURCE RESISTANCE R_S / kΩ" yLabel="CURRENT MISMATCH / %" description="Threshold contribution falls and resistor contribution rises as source resistance increases; the combined mismatch falls from two percent toward one."/></S.Figure>;
}

/* ---------- Chapter 57: cascode mirror ---------- */
// Standard four-transistor cascode mirror, all devices k = 2 mA/V², V_T = 1 V, λ = 0.02 V⁻¹, bodies tied to sources.
const cascOut=(vout:number,iref:number,vb?:number)=>{
 const v0=diodeVoltage({iref,k:K,vt:VT,lambda:.02}),b=vb??2*v0;
 if(vout<=0)return 0;
 const vx=bisect((x:number)=>channel(v0,x,K,VT,.02).id-channel(b-x,Math.max(0,vout-x),K,VT,.02).id,0,vout);
 return channel(v0,vx,K,VT,.02).id;
};
export function CascodeNodeFigure(){
 const m1=S.fetPins({at:[250,290],flip:true}),m2=S.fetPins({at:[450,290]}),m3=S.fetPins({at:[250,170],flip:true}),m4=S.fetPins({at:[450,170]});
 return <S.Figure caption="The standard cascode mirror at 0.25 mA, with every node voltage labelled ($k$ = 2 mA/V², $V_T$ = 1 V, so $u$ = 0.5 V and $V_{GS}$ = 1.5 V). $M_1$–$M_2$ copy the current. $M_3$, diode connected on top of $M_1$, raises the cascode gate to $V_B$ = 3.0 V, so $M_4$ holds $M_2$'s drain at $V_X$ ≈ 1.5 V, the same as $M_1$'s. The output must stay above $V_X + u$ = 2.0 V.">
 <S.Schematic width={680} height={420} description="Four NMOS cascode mirror: reference current into stacked diode-connected M3 over M1; output stack M4 over M2 with gates tied to M3 and M1 gates respectively.">
  <S.Rail at={[236,30]} label="+V"/><S.CurrentSource a={[236,30]} b={[236,100]} label="I_REF" value="0.25 mA"/><S.Wire pts={[[236,100],m3.d]}/>
  <S.Fet at={[250,170]} flip/><S.Fet at={[250,290]} flip/><S.Fet at={[450,170]}/><S.Fet at={[450,290]}/>
  <S.Wire pts={[[236,115],[310,115],[310,170]]}/><S.Dot at={[236,115]}/><S.Wire pts={[m3.g,m4.g]}/><S.Dot at={[310,170]}/>
  <S.Wire pts={[m3.s,m1.d]}/><S.Wire pts={[[236,232],[330,232],[330,290]]}/><S.Dot at={[236,232]}/><S.Wire pts={[m1.g,m2.g]}/><S.Dot at={[330,290]}/>
  <S.Wire pts={[m4.s,m2.d]}/><S.Wire pts={[m1.s,[236,370]]}/><S.Ground at={[236,370]}/><S.Wire pts={[m2.s,[464,370]]}/><S.Ground at={[464,370]}/>
  <S.Wire pts={[m4.d,[464,60],[600,60]]}/><S.Terminal at={[600,60]} label="V_OUT ≥ 2.0 V" side="right"/>
  <S.Text x={345} y={160} kind="value">V_B = 3.0 V</S.Text><S.Text x={345} y={280} kind="value">V_GS = 1.5 V</S.Text>
  <S.Dot at={[464,232]}/><S.Text x={478} y={237} kind="output">V_X ≈ 1.5 V</S.Text>
  <S.Text x={190} y={175} anchor="end">M_3</S.Text><S.Text x={190} y={295} anchor="end">M_1</S.Text><S.Text x={500} y={180}>M_4</S.Text><S.Text x={500} y={300}>M_2</S.Text>
 </S.Schematic></S.Figure>;
}
export function CascodeOutputFigure(){
 return <S.Figure plot caption="Output current of a 0.25 mA mirror, simple (orange) and cascode (green), against output voltage. Note the vertical scale: the simple mirror's current rises 5 µA per volt ($r_o$ ≈ 200 kΩ); the cascode's is flat to within 0.1 µA over 2–5 V ($R_{out}$ ≈ 45 MΩ). Below about 2 V, though, the upper device is in triode, the shielding is lost, and the cascode is no better than a simple mirror; below about 0.5 V both collapse. The flat, high-resistance region starts at $V_T + 2u$, not at $u$.">
 <Plot curves={[{name:'Simple mirror',color:S.orange,points:xs(0,5,250).map(v=>[v,mirror({iref:.00025,vout:v,lambda:.02}).id*1e6] as [number,number])},{name:'Cascode mirror',color:S.green,points:xs(0,5,250).map(v=>[v,cascOut(v,.00025)*1e6] as [number,number])}]}
  marks={[{at:[.5,mirror({iref:.00025,vout:.5,lambda:.02}).id*1e6],label:'u',pos:'se'},{at:[2,cascOut(2,.00025)*1e6],label:'V_T + 2u',pos:'nw'}]}
  xRange={[0,5]} yRange={[200,270]} xLabel="OUTPUT VOLTAGE V_OUT / V" yLabel="OUTPUT CURRENT / µA" description="Simple mirror current slopes upward; cascode current is flat above two volts but collapses below."/></S.Figure>;
}
export function CascodeRoutFigure(){
 const lam=.02,ro=(i:number)=>1/(lam*i),gm=(i:number)=>Math.sqrt(2*K*i);
 return <S.Figure plot caption="Output resistance against bias current on log scales ($k$ = 2 mA/V², $\lambda$ = 0.02 V⁻¹). The simple mirror's $r_o = 1/\lambda I$ falls as $1/I$. The cascode's $g_mr_o^2$ falls as $I^{-3/2}$, because $g_m$ rises only as $\sqrt I$. The ratio between them is the intrinsic gain $g_mr_o$: about 1000 at 10 µA and 100 at 1 mA in this model.">
 <Plot curves={[{name:'Simple: r_o',color:S.orange,points:xs(-5,-2.3,120).map(e=>{const i=10**e;return [i*1e3,ro(i)/1e6] as [number,number];})},{name:'Cascode: r_o(2 + g_m r_o)',color:S.green,points:xs(-5,-2.3,120).map(e=>{const i=10**e;return [i*1e3,ro(i)*(2+gm(i)*ro(i))/1e6] as [number,number];})}]}
  xScale="log" yScale="log" xRange={[.01,5]} yRange={[.01,1e5]} xLabel="BIAS CURRENT / mA" yLabel="OUTPUT RESISTANCE / MΩ" description="Log-log plot: simple mirror output resistance falls as one over current, cascode as current to the minus three halves, always about a hundred times higher."/></S.Figure>;
}

/* ---------- Chapter 58: wide-swing cascode ---------- */
// General cascode output: lower gate at the reference V_GS, upper gate at vb. k = 8 mA/V², V_T = 0.7 V, λ = 0.05 V⁻¹.
const WK=.008,WT=.7,WL=.05;
const wideOut=(vout:number,iref:number,vb:number)=>{
 const v0=diodeVoltage({iref,k:WK,vt:WT,lambda:WL});if(vout<=0)return 0;
 const vx=bisect((x:number)=>channel(v0,x,WK,WT,WL).id-channel(vb-x,Math.max(0,vout-x),WK,WT,WL).id,0,vout);
 return channel(v0,vx,WK,WT,WL).id;
};
export function WideSwingCircuit(){
 const m5=S.fetPins({at:[130,250],flip:true}),m3=S.fetPins({at:[330,170]}),m1=S.fetPins({at:[358,290],flip:true}),m4=S.fetPins({at:[558,170],flip:true}),m2=S.fetPins({at:[530,290]});
 return <S.Figure caption="A complete wide-swing cascode mirror. $M_5$, about a quarter the size of the others, is diode connected at the same current, so its overdrive is about $2u$ and it makes $V_B = V_T + 2u + m$. In the reference branch, $M_1$'s gate is taken from the top of $M_3$ rather than from its own drain, so $M_1$ runs at the same drain voltage $V_X$ as $M_2$. Both cascode gates share $V_B$, which holds $V_X$ at about $u + m$ instead of $V_T + u$.">
 <S.Schematic width={720} height={440} description="Bias branch with small diode NMOS M5 generating V B; reference branch with cascode M3 over M1, M1 gate tied to M3 drain; output stack M4 over M2; V B routed to both cascode gates.">
  <S.Rail at={[116,30]} label="+V"/><S.CurrentSource a={[116,30]} b={[116,120]} label="I_REF"/><S.Wire pts={[[116,120],m5.d]}/>
  <S.Fet at={[130,250]} flip/><S.Wire pts={[[116,160],[190,160],[190,250],m5.g]}/><S.Dot at={[116,160]}/><S.Wire pts={[m5.s,[116,370]]}/><S.Ground at={[116,370]}/>
  <S.Wire pts={[[190,170],m3.g]}/><S.Dot at={[190,170]}/><S.Dot at={[250,170]}/>
  <S.Wire pts={[[250,170],[250,405],[620,405],[620,170],m4.g]}/>
  <S.Rail at={[344,30]} label="+V"/><S.CurrentSource a={[344,30]} b={[344,100]} label="I_REF"/><S.Wire pts={[[344,100],m3.d]}/>
  <S.Fet at={[330,170]}/><S.Fet at={[358,290]} flip/><S.Wire pts={[m3.s,m1.d]}/>
  <S.Wire pts={[[344,112],[410,112],[410,290],m1.g]}/><S.Dot at={[344,112]}/><S.Wire pts={[[410,290],m2.g]}/><S.Dot at={[410,290]}/>
  <S.Wire pts={[m1.s,[344,370]]}/><S.Ground at={[344,370]}/>
  <S.Fet at={[558,170]} flip/><S.Fet at={[530,290]}/><S.Wire pts={[m4.s,m2.d]}/><S.Wire pts={[m2.s,[544,370]]}/><S.Ground at={[544,370]}/>
  <S.Wire pts={[m4.d,[544,70],[660,70]]}/><S.Terminal at={[660,70]} label="V_OUT ≥ 2u + m" side="above"/>
  <S.Dot at={[544,230]}/><S.Text x={532} y={235} anchor="end" kind="output">V_X ≈ u + m</S.Text><S.Text x={262} y={397} kind="value">V_B = V_T + 2u + m</S.Text>
  <S.Text x={70} y={255} anchor="end">M_5</S.Text><S.Text x={70} y={272} anchor="end" kind="value">≈ k/4</S.Text>
  <S.Text x={372} y={175}>M_3</S.Text><S.Text x={320} y={295} anchor="end">M_1</S.Text><S.Text x={510} y={160} anchor="end">M_4</S.Text><S.Text x={572} y={300}>M_2</S.Text>
 </S.Schematic></S.Figure>;
}
export function WideSwingOutputFigure(){
 const i=.00025,u=Math.sqrt(2*i/WK);
 return <S.Figure plot caption="Output current of a 0.25 mA cascode mirror ($k$ = 8 mA/V², $V_T$ = 0.7 V, so $u$ = 0.25 V; $\lambda$ = 0.05 V⁻¹) with two cascode gate biases. The standard bias, $V_B = 2(V_T + u)$ = 1.9 V, reaches its high-resistance plateau only above about 1.2 V. The wide-swing bias, $V_B = V_T + 2u + m$ with a 0.1 V margin, gets there at about 0.6 V: the threshold-sized waste is recovered. Notice that its plateau sits 3% low. In this sweep the lower gate comes from a plain diode-connected reference running at $V_{DS}$ = 0.95 V, while the output device runs at $V_X$ ≈ 0.36 V. That mismatch in drain voltage is the reason the complete circuit adds $M_3$ to the reference branch.">
 <Plot curves={[{name:'Simple mirror',color:S.gray,dashed:true,points:xs(0,2.5,250).map(v=>[v,mirror({iref:i,vout:v,k:WK,vt:WT,lambda:WL}).id*1e6] as [number,number])},{name:'Standard cascode bias',color:S.orange,points:xs(0,2.5,250).map(v=>[v,wideOut(v,i,2*(WT+u))*1e6] as [number,number])},{name:'Wide-swing bias',color:S.green,points:xs(0,2.5,250).map(v=>[v,wideOut(v,i,WT+2*u+.1)*1e6] as [number,number])}]}
  marks={[{at:[.6,wideOut(.6,i,WT+2*u+.1)*1e6],label:'2u + m',pos:'se'},{at:[1.2,wideOut(1.2,i,2*(WT+u))*1e6],label:'V_T + 2u',pos:'se'}]}
  xRange={[0,2.5]} yRange={[200,270]} xLabel="OUTPUT VOLTAGE V_OUT / V" yLabel="OUTPUT CURRENT / µA" description="Wide-swing cascode current flattens at about 0.6 volts; standard cascode at about 1.2 volts; simple mirror slopes throughout."/></S.Figure>;
}

/* ---------- Chapter 59: resistor-loaded common source ---------- */
export function CsDesignCircuit(){
 const q=S.fetPins({at:[386,190]});
 return <S.Figure caption="The worked design of this chapter: gain about −8 into a 10 kΩ load from 5 V. A 1 mA drain current with 0.4 V of overdrive gives $g_m$ = 5 mS. $R_S$ sets the bias by feedback and is bypassed by $C_S$ for signals. $C_{in}$ and $C_{out}$ block DC at the input and output.">
 <S.Schematic width={720} height={400} description="Complete NMOS common-source amplifier: source resistance and coupling capacitor into a gate divider, two kilohm drain resistor, five hundred ohm bypassed source resistor, output coupling capacitor to ten kilohm load.">
  <S.Rail at={[400,40]} label="V_DD = 5 V"/><S.Wire pts={[[250,40],[400,40]]}/><S.Dot at={[400,40]}/>
  <S.Res a={[400,40]} b={[400,120]} label="R_D" value="2.0 kΩ"/><S.Wire pts={[[400,120],q.d]}/>
  <S.Wire pts={[[400,130],[470,130]]}/><S.Dot at={[400,130]}/><S.Cap a={[470,130]} b={[570,130]} label="C_out" value="1 µF"/><S.Wire pts={[[570,130],[620,130]]}/>
  <S.Res a={[620,130]} b={[620,340]} label="R_L" value="10 kΩ"/><S.Ground at={[620,340]}/><S.Dot at={[620,130]}/><S.Wire pts={[[620,130],[660,130]]}/><S.Terminal at={[660,130]} label="v_out" side="above"/>
  <S.Fet at={[386,190]}/>
  <S.Wire pts={[q.s,[400,250]]}/><S.Res a={[400,250]} b={[400,340]} label="R_S" value="500 Ω" flipLabel/><S.Ground at={[400,340]}/>
  <S.Wire pts={[[400,250],[480,250]]}/><S.Dot at={[400,250]}/><S.Cap a={[480,250]} b={[480,340]} label="C_S" value="100 µF"/><S.Ground at={[480,340]}/>
  <S.Res a={[250,40]} b={[250,190]} label="R_1" value="3.1 MΩ" flipLabel/><S.Res a={[250,190]} b={[250,340]} label="R_2" value="1.9 MΩ" flipLabel/><S.Ground at={[250,340]}/>
  <S.Wire pts={[[250,190],q.g]}/><S.Dot at={[250,190]}/><S.Text x={262} y={178} kind="value">V_G = 1.9 V</S.Text>
  <S.Cap a={[150,190]} b={[230,190]} label="C_in" value="0.1 µF"/><S.Wire pts={[[230,190],[250,190]]}/>
  <S.Res a={[40,190]} b={[150,190]} label="R_sig" value="10 kΩ"/><S.Source kind="ac" a={[40,340]} b={[40,190]} label="v_sig"/><S.Ground at={[40,340]}/>
  <S.Text x={415} y={185} kind="value">k = 12.5 mA/V²</S.Text><S.Text x={415} y={201} kind="value">V_T = 1 V</S.Text>
 </S.Schematic></S.Figure>;
}

export function CsBodeFigure(){
 const C=(re:number,im:number)=>[re,im] as [number,number];
 const mul=(a:[number,number],b:[number,number])=>C(a[0]*b[0]-a[1]*b[1],a[0]*b[1]+a[1]*b[0]);
 const dv=(a:[number,number],b:[number,number])=>{const d=b[0]*b[0]+b[1]*b[1];return C((a[0]*b[0]+a[1]*b[1])/d,(a[1]*b[0]-a[0]*b[1])/d);};
 const hp=(f:number,fc:number)=>dv(C(0,f/fc),C(1,f/fc)),lp=(f:number,fc:number)=>dv(C(1,0),C(1,f/fc));
 const H=(f:number)=>{let h=C(8.0,0);h=mul(h,hp(f,1.34));h=mul(h,dv(C(3.18/11.1,f/11.1),C(1,f/11.1)));h=mul(h,hp(f,13.3));h=mul(h,lp(f,571e3));h=mul(h,lp(f,4.93e6));return 20*Math.log10(Math.hypot(...h));};
 return <S.Figure plot caption="Predicted magnitude response of the design. Three capacitors shape the low end: the input coupling (1.3 Hz), the source bypass (zero at 3.2 Hz, pole at 11 Hz; below it the gain falls to the degenerated value) and the output coupling into the load (13 Hz). Two poles shape the high end: the Miller-multiplied input capacitance against the source resistance (570 kHz) and the output capacitance (4.9 MHz). The midband gain is −8.0, or 18 dB.">
 <Plot curves={[{name:'|v_out / v_sig|',color:S.green,points:xs(-1,8,360).map(e=>[10**e,H(10**e)] as [number,number])},{name:'Midband, 18 dB',color:S.gray,dashed:true,points:[[.1,18.06],[1e8,18.06]]}]} xScale="log" xRange={[.1,1e8]} yRange={[-20,25]} xLabel="FREQUENCY / Hz" yLabel="GAIN / dB" description="Band-pass magnitude response: rising through three low-frequency corners to a flat 18 decibel midband, then falling above about half a megahertz."/></S.Figure>;
}
export function CsDistortionFigure(){
 const vrd=[1,1.61,2,4],cols=[S.orange,S.green,S.gray,S.ink];
 return <S.Figure plot caption="Second-harmonic distortion of a square-law common-source stage against output amplitude, for four values of the “AC load voltage” $I_DR_D'$. The lines are $H_2/H_1 = v_{out}/(8I_DR_D')$, which full time-domain solutions confirm. Overdrive does not appear: at a fixed output, a stage with larger $u$ needs a proportionally larger input, and the two effects cancel. Low distortion at a large swing needs current and load resistance, that is, supply voltage.">
 <Plot curves={vrd.map((v,i)=>({name:'I_D R_D′ = '+v+' V',color:cols[i],points:[[0,0],[1.5,100*1.5/(8*v)]] as [number,number][]}))} marks={[{at:[1,100/(8*1.61)],label:'design, 1 V out',pos:'nw'}]}
  xRange={[0,1.5]} yRange={[0,15]} xLabel="OUTPUT PEAK / V" yLabel="SECOND HARMONIC / %" description="Straight lines of distortion against output amplitude; the larger the product of drain current and load resistance, the shallower the line."/></S.Figure>;
}

/* ---------- Chapter 60: active loads ---------- */
// NMOS input and PMOS current-source load, both k = 2 mA/V², |V_T| = 1 V, λ = 0.02 V⁻¹, 5 V. PMOS V_SG fixed for 1 mA at V_O = 2.5 V.
const AL=.02,VSGP=1+Math.sqrt(2*.001/(K*(1+AL*2.5)));
const pCur=(vo:number)=>channel(VSGP,Math.max(0,5-vo),K,VT,AL).id;
const nCur=(vin:number,vo:number)=>channel(vin,Math.max(0,vo),K,VT,AL).id;
const VIN0=bisect((v:number)=>nCur(v,2.5)-pCur(2.5),1,3);
const activeOut=(vin:number)=>bisect((v:number)=>nCur(vin,v)-pCur(v),0,5);
export function ActiveLoadCircuit(){
 const mp=S.fetPins({at:[420,120],kind:'pmos'}),mb=S.fetPins({at:[220,120],kind:'pmos',flip:true}),mn=S.fetPins({at:[420,260]});
 return <S.Figure caption="A common-source stage with an active load. The diode-connected PMOS $M_3$ turns a 1 mA reference into a gate voltage $V_{BP}$; $M_2$ copies it as a current source that replaces the drain resistor. $M_1$ is the input. All devices: $k$ = 2 mA/V², $|V_T|$ = 1 V, $\lambda$ = 0.02 V⁻¹. The only resistances left at the output are the two transistors' $r_o$.">
 <S.Schematic width={680} height={400} description="PMOS mirror M3 to M2 provides a current-source load for NMOS input M1; output at the joined drains.">
  <S.Rail at={[206,40]} label="V_DD = 5 V"/><S.Wire pts={[[206,40],[434,40]]}/><S.Wire pts={[[206,40],mb.s]}/><S.Wire pts={[[434,40],mp.s]}/>
  <S.Fet at={[220,120]} kind="pmos" flip/><S.Fet at={[420,120]} kind="pmos"/>
  <S.Wire pts={[mb.g,mp.g]}/><S.Wire pts={[mb.d,[206,190]]}/><S.Wire pts={[[206,180],[300,180],[300,120]]}/><S.Dot at={[206,180]}/><S.Dot at={[300,120]}/>
  <S.CurrentSource a={[206,190]} b={[206,330]} label="I_REF" value="1 mA"/><S.Ground at={[206,330]}/>
  <S.Wire pts={[mp.d,mn.d]}/><S.Wire pts={[[434,190],[560,190]]}/><S.Dot at={[434,190]}/><S.Terminal at={[560,190]} label="V_O" side="right"/>
  <S.Fet at={[420,260]}/><S.Wire pts={[mn.s,[434,330]]}/><S.Ground at={[434,330]}/>
  <S.Terminal at={[330,260]} label="V_in"/><S.Wire pts={[[330,260],mn.g]}/>
  <S.Text x={310} y={110} kind="value">V_BP</S.Text><S.Text x={160} y={125} anchor="end">M_3</S.Text><S.Text x={470} y={125}>M_2</S.Text><S.Text x={470} y={265}>M_1</S.Text>
 </S.Schematic></S.Figure>;
}
export function ActiveLoadLineFigure(){
 const dv=[-.01,0,.01],cols=[S.gray,S.green,S.ink];
 return <S.Figure plot caption="Load lines of an active-loaded stage, on a vertical scale zoomed to ±10% around 1 mA. The orange curve is the PMOS load's current against output voltage; the others are the NMOS input's current at three gate voltages 10 mV apart. All are nearly flat in saturation, so a tiny shift in the input curve moves the intersection by volts: a 10 mV gate step moves the output about 0.5 V. That is the gain of −50, and the same flatness makes the DC output exquisitely sensitive to any current mismatch.">
 <Plot curves={[...dv.map((d,i)=>({name:'NMOS, V_in '+(d===0?'= V_Q':(d>0?'+ 10 mV':'− 10 mV')),color:cols[i],points:xs(0,5,250).map(v=>[v,nCur(VIN0+d,v)*1e3] as [number,number])})),{name:'PMOS load',color:S.orange,points:xs(0,5,250).map(v=>[v,pCur(v)*1e3] as [number,number])}]}
  marks={dv.map(d=>({at:[activeOut(VIN0+d),nCur(VIN0+d,activeOut(VIN0+d))*1e3] as [number,number]}))}
  xRange={[0,5]} yRange={[.9,1.1]} xLabel="OUTPUT VOLTAGE V_O / V" yLabel="DRAIN CURRENT / mA" description="Three nearly flat NMOS current curves crossing a nearly flat PMOS load curve; intersections spaced about half a volt apart for ten millivolt input steps."/></S.Figure>;
}
export function ActiveTransferFigure(){
 const rload=(vin:number)=>bias({vg:vin,rd:2500,lambda:AL}).vd;
 return <S.Figure plot caption="DC transfer of the active-loaded stage (green) compared with a 2.5 kΩ resistor load biased at the same point (gray). Over a gate range of only about 60 mV the active-loaded output sweeps from near the top rail to near ground: a slope of about −50 between the two compliance limits, $u_N$ = 1 V and $V_{DD} - u_P$ = 4 V. The resistor-loaded stage changes only about 0.5 V over the same range.">
 <Plot curves={[{name:'Active load',color:S.green,points:xs(VIN0-.08,VIN0+.08,300).map(v=>[1e3*(v-VIN0),activeOut(v)] as [number,number])},{name:'2.5 kΩ resistor load',color:S.gray,points:xs(VIN0-.08,VIN0+.08,100).map(v=>[1e3*(v-VIN0),rload(v)] as [number,number])}]}
  marks={[{at:[0,2.5],label:'V_Q',pos:'ne'}]}
  xRange={[-80,80]} yRange={[0,5]} xLabel="GATE VOLTAGE − QUIESCENT VALUE / mV" yLabel="OUTPUT V_O / V" description="Active-loaded output falls steeply from about four and a half volts to half a volt over sixty millivolts of input; resistor-loaded output barely changes."/></S.Figure>;
}
export function ActiveGbwFigure(){
 const gm=.002,ro=50000,C=10e-12,loads:[number,string,string][]=[[Infinity,'No external load',S.green],[1e5,'100 kΩ AC load',S.gray],[1e4,'10 kΩ AC load',S.orange]];
 return <S.Figure plot caption="Frequency response of the active-loaded stage with 10 pF at its output, for three AC-coupled loads. The load sets the low-frequency gain (−50, −40, −14) and the pole moves up in proportion, so every curve meets the same asymptote and crosses unity at $g_m/2\pi C$ ≈ 32 MHz. Loading trades gain for bandwidth; it cannot change their product.">
 <Plot curves={loads.map(([rl,name,color])=>{const R=1/(2/ro+(Number.isFinite(rl)?1/rl:0));return {name,color,points:xs(3,9,240).map(e=>{const f=10**e;return [f,20*Math.log10(gm*R/Math.hypot(1,2*Math.PI*f*R*C))] as [number,number];})};})}
  xScale="log" xRange={[1e3,1e9]} yRange={[-20,40]} xLabel="FREQUENCY / Hz" yLabel="GAIN / dB" description="Three single-pole responses with different low-frequency gains meeting a common minus twenty decibel per decade asymptote."/></S.Figure>;
}

/* ---------- Chapter 61: resistor-loaded source follower ---------- */
export function FollowerBufferCircuit(){
 const q=S.fetPins({at:[336,170]});
 return <S.Figure caption="A source follower as a buffer. A 100 kΩ sensor cannot drive a 2 kΩ load directly: the divider would pass only 2% of its signal. The MOSFET's gate draws no current, so the sensor sees an open circuit, while the source drives the load from a resistance of about $1/g_m$ ≈ 640 Ω. The gate bias of 3 V comes from the sensor's own DC level or a bias network, omitted here. The body is tied to the source.">
 <S.Schematic width={640} height={340} description="Sensor with one hundred kilohm source resistance driving the gate of an NMOS follower; drain at five volts, two kilohm load from source to ground.">
  <S.Source kind="ac" a={[70,300]} b={[70,170]} label="v_s" value="DC 3 V"/><S.Ground at={[70,300]}/>
  <S.Res a={[70,170]} b={[220,170]} label="R_sensor" value="100 kΩ"/><S.Wire pts={[[220,170],q.g]}/>
  <S.Rail at={[350,40]} label="V_DD = 5 V"/><S.Wire pts={[[350,40],q.d]}/><S.Fet at={[336,170]}/>
  <S.Wire pts={[q.s,[350,240]]}/><S.Res a={[350,240]} b={[350,320]} label="R_L" value="2 kΩ"/><S.Ground at={[350,320]}/>
  <S.Wire pts={[[350,240],[500,240]]}/><S.Dot at={[350,240]}/><S.Terminal at={[500,240]} label="v_out" side="right"/>
  <S.Text x={240} y={150} kind="value">i_G = 0</S.Text><S.Text x={380} y={170} kind="value">k = 2 mA/V²</S.Text>
 </S.Schematic></S.Figure>;
}
export function FollowerTransferFigure(){
 const vgs=xs(1,5,200);
 return <S.Figure plot caption="Source voltage against gate voltage for a 2 kΩ load ($k$ = 2 mA/V², $V_{T0}$ = 1 V), with the body tied to the source (green) and grounded (orange, $\gamma$ = 0.4 √V, $2\phi_F$ = 0.6 V). The dashed line is a fictitious perfect follower one threshold below the gate. The real output lags it by the overdrive needed to carry the load current, and with a grounded body by a threshold that grows with the output as well.">
 <Plot curves={[{name:'Ideal: V_G − V_T0',color:S.gray,dashed:true,points:[[1,0],[5,4]]},{name:'Body tied to source',color:S.green,points:vgs.map(v=>[v,follower({vg:v,rl:2000,gamma:0}).vs] as [number,number])},{name:'Body grounded',color:S.orange,points:vgs.map(v=>[v,follower({vg:v,rl:2000,gamma:.4}).vs] as [number,number])}]}
  marks={[{at:[3,1.219],label:'1.22 V',pos:'nw'},{at:[3,1.064],label:'1.06 V',pos:'se'}]}
  xRange={[1,5]} yRange={[0,4]} xLabel="GATE VOLTAGE V_G / V" yLabel="SOURCE OUTPUT V_S / V" description="Follower output rises with gate voltage, below the ideal threshold-offset line, and lower still with a grounded body."/></S.Figure>;
}
export function FollowerSlewFigure(){
 const C=1e-9,R=1e4,dt=2e-9,pts:[number,number][]=[],gate:[number,number][]=[];let vs=0;
 for(let n=0;n<=40000;n++){const t=n*dt,vg=(Math.floor(t/20e-6)%2===0)?4:2;if(n%80===0){pts.push([t*1e6,vs]);gate.push([t*1e6,vg]);}const i=channel(vg-vs,5-vs,K,VT,0).id;vs+=dt*(i-vs/R)/C;}
 return <S.Figure plot caption="A follower driving 1 nF in parallel with 10 kΩ ($k$ = 2 mA/V², $V_T$ = 1 V), its gate stepped between 2 and 4 V every 20 µs. Rising, the transistor's large initial overdrive charges the capacitor at milliamps, and the output reaches 90% of its 2.5 V final value in 1.2 µs. Falling, the transistor turns off and only the resistor discharges the capacitor ($R_LC_L$ = 10 µs): it takes about 10 µs to fall 90% of the way. A follower can push but not pull.">
 <Plot curves={[{name:'Gate',color:S.gray,dashed:true,points:gate},{name:'Source output',color:S.green,points:pts}]} xRange={[0,80]} yRange={[0,4.5]} xLabel="TIME / µs" yLabel="VOLTAGE / V" description="Square-wave gate drive; the source output rises within about a microsecond but falls exponentially over about ten microseconds."/></S.Figure>;
}

/* ---------- Chapter 62: current-loaded follower ---------- */
export function LevelShiftCircuit(){
 const m1=S.fetPins({at:[420,120]}),m2=S.fetPins({at:[420,270]}),m3=S.fetPins({at:[220,270],flip:true});
 return <S.Figure caption="A current-loaded follower used as a level shifter. $M_3$ and $M_2$ form a mirror that sinks 0.5 mA from the follower $M_1$ whatever the output voltage, so $M_1$'s gate–source drop stays fixed at $V_T + \sqrt{2I_B/k}$ = 1.71 V. The output copies the input 1.71 V lower, with a gain near one even into a light load. $M_2$ must keep at least its overdrive, 0.71 V, across it.">
 <S.Schematic width={680} height={380} description="NMOS follower M1 from five volt rail; its source drives the output and the drain of mirror sink M2; M3 diode with half milliamp reference sets the sink current.">
  <S.Rail at={[434,30]} label="V_DD = 5 V"/><S.Wire pts={[[434,30],m1.d]}/><S.Fet at={[420,120]}/>
  <S.Terminal at={[320,120]} label="v_in"/><S.Wire pts={[[320,120],m1.g]}/>
  <S.Wire pts={[m1.s,m2.d]}/><S.Wire pts={[[434,195],[580,195]]}/><S.Dot at={[434,195]}/><S.Terminal at={[580,195]} label="v_out = v_in − 1.71 V" side="above"/>
  <S.Fet at={[420,270]}/><S.Wire pts={[m2.s,[434,345]]}/><S.Ground at={[434,345]}/>
  <S.Rail at={[206,30]} label="V_DD"/><S.CurrentSource a={[206,30]} b={[206,170]} label="I_REF" value="0.5 mA"/><S.Wire pts={[[206,170],m3.d]}/>
  <S.Fet at={[220,270]} flip/><S.Wire pts={[[206,210],[290,210],[290,270]]}/><S.Dot at={[206,210]}/><S.Wire pts={[m3.g,m2.g]}/><S.Dot at={[290,270]}/>
  <S.Wire pts={[m3.s,[206,345]]}/><S.Ground at={[206,345]}/>
  <S.Text x={470} y={125}>M_1</S.Text><S.Text x={470} y={275}>M_2</S.Text><S.Text x={160} y={275} anchor="end">M_3</S.Text>
  <S.CurrentArrow at={[434,225]} dir="down" label="I_B = 0.5 mA"/>
 </S.Schematic></S.Figure>;
}
export function FollowerLoadGainFigure(){
 const rls=xs(3,6,120).map(e=>10**e);
 const g=(ib:number,gm:number)=>rls.map(r=>{const p=follower({vg:3,ibias:ib,rl:r,gamma:gm});return [r/1e3,p.valid?p.gain:NaN] as [number,number];});
 return <S.Figure plot caption="Local gain at a 3 V gate against load resistance. A resistor-only follower (gray) needs a heavy load to keep its current up, so its gain into light loads rises only because its own current falls. Adding a 0.5 mA sink (green, body tied to source) keeps $g_m$ up and the gain reaches 0.94 at 10 kΩ and 0.99 at 100 kΩ. With a grounded body (orange, $\gamma$ = 0.4 √V) the gain stalls at its ceiling $1/(1 + \eta)$ ≈ 0.87 however light the load.">
 <Plot curves={[{name:'Resistor only',color:S.gray,points:g(0,0)},{name:'0.5 mA sink, body to source',color:S.green,points:g(.0005,0)},{name:'0.5 mA sink, body grounded',color:S.orange,points:g(.0005,.4)}]}
  xScale="log" xRange={[1,1000]} yRange={[.5,1.02]} xLabel="LOAD RESISTANCE R_L / kΩ" yLabel="LOCAL GAIN" description="Follower gain rises toward one with load resistance; a current sink lifts it faster, but a grounded body caps it near 0.87."/></S.Figure>;
}
export function SinkSlewFigure(){
 const C=1e-9,R=1e4,dt=2e-9,ib=5e-4,a:[number,number][]=[],b:[number,number][]=[],gate:[number,number][]=[];let v1=0,v2=0;
 // Sink modelled as a mirror device with 0.71 V overdrive: constant above compliance, triode below.
 const sink=(v:number)=>channel(1.707,Math.max(0,v),K,VT,0).id;
 for(let n=0;n<=20000;n++){const t=n*dt,vg=(Math.floor(t/20e-6)%2===0)?4:2;if(n%40===0){a.push([t*1e6,v1]);b.push([t*1e6,v2]);gate.push([t*1e6,vg]);}
  v1+=dt*(channel(vg-v1,5-v1,K,VT,0).id-v1/R)/C;v2+=dt*(channel(vg-v2,5-v2,K,VT,0).id-sink(v2)-v2/R)/C;}
 return <S.Figure plot caption="The same 1 nF, 10 kΩ load as in Chapter 61, driven by a resistor-only follower (gray) and by a follower with a 0.5 mA mirror sink (green), with the gate stepped from 4 V to 2 V at 20 µs. The sink pulls the output down at about $(I_B + V_O/R_L)/C_L$ ≈ 0.7 V/µs, about three times faster than the resistor alone (0.24 V/µs), until it nears its own compliance at 0.71 V. The price: 0.5 mA flows all the time.">
 <Plot curves={[{name:'Gate',color:S.ink,dashed:true,points:gate},{name:'Resistor only',color:S.gray,points:a},{name:'With 0.5 mA sink',color:S.green,points:b}]} xRange={[0,40]} yRange={[0,4.5]} xLabel="TIME / µs" yLabel="VOLTAGE / V" description="After the gate falls, the follower with a current sink discharges its load several times faster than the resistor-only follower."/></S.Figure>;
}

/* ---------- Chapter 63: common gate ---------- */
export function CgPhotodiodeCircuit(){
 const q=S.fetPins({at:[380,160]});
 return <S.Figure caption="A common-gate stage as a current buffer for a photodiode. The photodiode's 10 pF would form a 3.2 MHz pole with a 5 kΩ resistor connected directly. Instead it sees the transistor's source, about 545 Ω, while the signal current passes almost unchanged through the channel into $R_D$. The sink $I_B$ biases the transistor at 1 mA; the gate sits at a fixed bias $V_B$.">
 <S.Schematic width={680} height={380} description="Photodiode with ten picofarad capacitance at the source of an NMOS common-gate stage; one milliamp bias sink from source to ground; gate at fixed bias; five kilohm drain resistor to supply; output at drain.">
  <S.Rail at={[394,30]} label="V_DD = 10 V"/><S.Res a={[394,30]} b={[394,110]} label="R_D" value="5 kΩ"/><S.Wire pts={[[394,110],q.d]}/>
  <S.Wire pts={[[394,115],[540,115]]}/><S.Dot at={[394,115]}/><S.Terminal at={[540,115]} label="v_out" side="right"/>
  <S.Fet at={[380,160]}/><S.Terminal at={[280,160]} label="V_B"/><S.Wire pts={[[280,160],q.g]}/>
  <S.Wire pts={[q.s,[394,250]]}/><S.CurrentSource a={[394,250]} b={[394,340]} label="I_B" value="1 mA"/><S.Ground at={[394,340]}/>
  <S.Wire pts={[[394,230],[140,230],[140,250]]}/><S.Dot at={[394,230]}/><S.Diode a={[140,340]} b={[140,250]} label="photodiode" flipLabel/><S.Ground at={[140,340]}/>
  <S.Wire pts={[[260,230],[260,250]]}/><S.Dot at={[260,230]}/><S.Cap a={[260,250]} b={[260,340]} label="C_pd" value="10 pF"/><S.Ground at={[260,340]}/>
  <S.CurrentArrow at={[300,230]} dir="right" label="i_pd"/><S.Text x={410} y={225} kind="output">R_in ≈ 545 Ω</S.Text>
 </S.Schematic></S.Figure>;
}
export function CgRinFigure(){
 const gm=.002,gds=2e-5;
 return <S.Figure plot caption="Input resistance of a common-gate stage ($g_m$ = 2 mS, $r_o$ = 50 kΩ) against its drain load. For resistor loads well below $r_o$ it is close to $1/g_m$ = 500 Ω. As the load approaches and exceeds $r_o$, current that enters the source raises the drain, which feeds back through $r_o$ and raises the source further: the input resistance grows toward $R_D/(g_mr_o)$. A common-gate device loaded by a current source does not have a low input resistance.">
 <Plot curves={[{name:'R_in = (1 + g_ds R_D)/(g_m + g_ds)',color:S.green,points:xs(2,7,200).map(e=>{const r=10**e;return [r/1e3,(1+gds*r)/(gm+gds)/1e3] as [number,number];})},{name:'1/g_m',color:S.gray,dashed:true,points:[[.1,.5],[1e4,.5]]}]}
  xScale="log" yScale="log" xRange={[.1,1e4]} yRange={[.1,100]} xLabel="DRAIN LOAD R_D / kΩ" yLabel="INPUT RESISTANCE / kΩ" description="Common-gate input resistance is about five hundred ohms for small drain loads and rises roughly in proportion to the load above fifty kilohms."/></S.Figure>;
}
export function CgBandwidthFigure(){
 const C=10e-12,Co=1e-12,R=5000,Rin=545;
 const direct=(f:number)=>R/Math.hypot(1,2*Math.PI*f*R*(C+Co));
 const cg=(f:number)=>R/(Math.hypot(1,2*Math.PI*f*Rin*C)*Math.hypot(1,2*Math.PI*f*R*Co));
 return <S.Figure plot caption="Transimpedance from photodiode current to output voltage. Connected directly to 5 kΩ, the 10 pF photodiode (plus 1 pF of wiring) limits the bandwidth to 2.9 MHz. Through the common-gate buffer the midband transimpedance is the same 5 kΩ, but the photodiode capacitance now meets only 545 Ω: the input pole moves to 29 MHz, and the remaining 1 pF at the drain sets a second pole at 32 MHz. Together they put the −3 dB point near 20 MHz: the buffer has bought a factor of about seven in bandwidth.">
 <Plot curves={[{name:'Photodiode into 5 kΩ',color:S.orange,points:xs(4,9,200).map(e=>[10**e,20*Math.log10(direct(10**e))] as [number,number])},{name:'Through common-gate buffer',color:S.green,points:xs(4,9,200).map(e=>[10**e,20*Math.log10(cg(10**e))] as [number,number])}]}
  xScale="log" xRange={[1e4,1e9]} yRange={[30,80]} xLabel="FREQUENCY / Hz" yLabel="TRANSIMPEDANCE / dBΩ" description="Both transimpedances start at five kilohms; the direct connection rolls off near three megahertz, the buffered one near twenty megahertz."/></S.Figure>;
}

/* ---------- Chapter 64: cascode amplifier ---------- */
export function TelescopicCircuit(){
 const m1=S.fetPins({at:[336,330]}),m2=S.fetPins({at:[336,240]}),m3=S.fetPins({at:[336,160],kind:'pmos'}),m4=S.fetPins({at:[336,80],kind:'pmos'});
 return <S.Figure caption="A fully cascoded common-source stage. $M_1$ is the input; $M_2$ (gate at $V_{B1}$) cascodes it, raising the resistance looking down to about $g_mr_o^2$. $M_4$ is the PMOS current-source load and $M_3$ (gate at $V_{B2}$) cascodes it, raising the resistance looking up by the same factor. Both resistances are needed: a cascode stage's gain is limited by whichever side has the lower resistance. With four devices biased at 0.25 mA and 0.5 V of overdrive the gain is about −20 000.">
 <S.Schematic width={640} height={430} description="Stack of four transistors: PMOS current source M4 at top, PMOS cascode M3, output node, NMOS cascode M2, NMOS input M1 at the bottom.">
  <S.Rail at={[350,30]} label="V_DD"/><S.Wire pts={[[350,30],m4.s]}/><S.Fet at={[336,80]} kind="pmos"/><S.Wire pts={[m4.d,m3.s]}/><S.Fet at={[336,160]} kind="pmos"/>
  <S.Wire pts={[m3.d,m2.d]}/><S.Fet at={[336,240]}/><S.Wire pts={[m2.s,m1.d]}/><S.Fet at={[336,330]}/><S.Wire pts={[m1.s,[350,400]]}/><S.Ground at={[350,400]}/>
  <S.Terminal at={[230,80]} label="V_B3"/><S.Wire pts={[[230,80],m4.g]}/><S.Terminal at={[230,160]} label="V_B2"/><S.Wire pts={[[230,160],m3.g]}/>
  <S.Terminal at={[230,240]} label="V_B1"/><S.Wire pts={[[230,240],m2.g]}/><S.Terminal at={[230,330]} label="v_in"/><S.Wire pts={[[230,330],m1.g]}/>
  <S.Wire pts={[[350,200],[500,200]]}/><S.Dot at={[350,200]}/><S.Terminal at={[500,200]} label="v_out" side="right"/>
  <S.Text x={380} y={85}>M_4</S.Text><S.Text x={380} y={165}>M_3</S.Text><S.Text x={380} y={245}>M_2</S.Text><S.Text x={380} y={335}>M_1</S.Text>
  <S.Text x={420} y={140} kind="value">R_up ≈ g_m r_o²</S.Text><S.Text x={420} y={270} kind="value">R_down ≈ g_m r_o²</S.Text>
 </S.Schematic></S.Figure>;
}
export function CascodeLoadGainFigure(){
 const gm=.002,ro=5e4,Rc=ro*(2+gm*ro),Gm=gm*(gm+1/ro)/(gm+2/ro);
 return <S.Figure plot caption="Gain magnitude against the total load resistance at the output, for a single common-source device (orange) and a cascode (green), both at 1 mA ($g_m$ = 2 mS, $r_o$ = 50 kΩ). Below about 50 kΩ the load dominates and the two are almost identical: cascoding a stage that drives 10 kΩ buys nothing. The cascode's advantage appears only when the load resistance is comparable to or above its own 5.1 MΩ.">
 <Plot curves={[{name:'Common source: g_m (r_o ∥ R_L)',color:S.orange,points:xs(3,9,200).map(e=>{const r=10**e;return [r/1e3,gm/(1/ro+1/r)] as [number,number];})},{name:'Cascode: G_m (R_c ∥ R_L)',color:S.green,points:xs(3,9,200).map(e=>{const r=10**e;return [r/1e3,Gm/(1/Rc+1/r)] as [number,number];})}]}
  marks={[{at:[10,gm/(1/ro+1/1e4)],label:'10 kΩ',pos:'nw'},{at:[50,Gm/(1/Rc+1/5e4)],label:'50 kΩ active load',pos:'nw'}]}
  xScale="log" yScale="log" xRange={[1,1e6]} yRange={[1,2e4]} xLabel="LOAD RESISTANCE R_L / kΩ" yLabel="|VOLTAGE GAIN|" description="Both gains rise with load resistance and coincide below fifty kilohms; the common-source gain saturates at one hundred while the cascode continues to about ten thousand."/></S.Figure>;
}
export function CascodeMillerFigure(){
 const rs=1e4,cgs=1e-12,cgd=.2e-12,cl=.5e-12,gm=.002;
 const resp=(gain:number,rout:number,cin:number)=>xs(4,9,240).map(e=>{const f=10**e,w=2*Math.PI*f;return [f,20*Math.log10(gain/(Math.hypot(1,w*rs*cin)*Math.hypot(1,w*rout*cl)))] as [number,number];});
 return <S.Figure plot caption="Frequency response from a 10 kΩ source, both stages loaded by a 50 kΩ active load, with $C_{gs}$ = 1 pF, $C_{gd}$ = 0.2 pF and 0.5 pF at the output. The common-source stage's input capacitance is $C_{gs} + C_{gd}(1 + 50)$ = 11.2 pF, so its input pole is at 1.4 MHz. In the cascode, $M_1$'s drain moves only about as much as its gate, so the input capacitance is about $C_{gs} + 2C_{gd}$ = 1.4 pF and the input pole moves to 11 MHz. The cascode has both more gain and more bandwidth.">
 <Plot curves={[{name:'Common source, gain 50',color:S.orange,points:resp(50,25e3,cgs+cgd*51)},{name:'Cascode, gain 98',color:S.green,points:resp(98,49.5e3,cgs+cgd*2)}]}
  xScale="log" xRange={[1e4,1e9]} yRange={[-10,45]} xLabel="FREQUENCY / Hz" yLabel="GAIN / dB" description="Common-source response flat at 34 decibels, rolling off near one megahertz; cascode flat at 40 decibels, rolling off near five megahertz."/></S.Figure>;
}

/* ---------- Chapter 65: differential pair ---------- */
export function HalfCircuitFigure(){
 const a=S.fetPins({at:[170,170]}),b=S.fetPins({at:[470,170]});
 return <S.Figure caption="Half-circuit analysis. A symmetric pair driven by $\pm v_d/2$ has a tail node that does not move, so for differential signals each half is a common-source stage with a grounded source (left): gain $-g_mR_D$ from $v_d/2$. Driven by a common-mode $v_c$ on both gates, both halves move together; each half carries half of the tail current change, so each sees twice the tail's incremental resistance $R_T$ in its source (right): a heavily degenerated stage with gain about $-R_D/2R_T$.">
 <S.Schematic width={640} height={350} description="Left: differential half circuit, NMOS with grounded source and drain resistor. Right: common-mode half circuit, NMOS with source resistor two R T and drain resistor.">
  <S.Rail at={[184,40]} label="V_DD"/><S.Res a={[184,40]} b={[184,110]} label="R_D"/><S.Wire pts={[[184,110],a.d]}/><S.Wire pts={[[184,110],[290,110]]}/><S.Dot at={[184,110]}/><S.Terminal at={[290,110]} label="v_o1" side="right"/>
  <S.Fet at={[170,170]}/><S.Terminal at={[90,170]} label="+v_d/2"/><S.Wire pts={[[90,170],a.g]}/><S.Wire pts={[a.s,[184,250]]}/><S.Ground at={[184,250]}/>
  <S.Text x={198} y={238} kind="value">tail node: AC ground</S.Text>
  <S.Rail at={[484,40]} label="V_DD"/><S.Res a={[484,40]} b={[484,110]} label="R_D"/><S.Wire pts={[[484,110],b.d]}/><S.Wire pts={[[484,110],[590,110]]}/><S.Dot at={[484,110]}/><S.Terminal at={[590,110]} label="v_o1" side="right"/>
  <S.Fet at={[470,170]}/><S.Terminal at={[390,170]} label="v_c"/><S.Wire pts={[[390,170],b.g]}/><S.Res a={b.s} b={[484,320]} label="2R_T"/><S.Ground at={[484,320]}/>
  <S.Text x={184} y={300} anchor="middle">differential half</S.Text><S.Text x={530} y={250}>common-mode half</S.Text>
 </S.Schematic></S.Figure>;
}
export function MosBjtSteeringFigure(){
 const it=2,us=[.2,.5,1],cols=[S.green,S.gray,S.ink];
 const mos=(u0:number)=>(v:number)=>{const b=Math.SQRT2*u0;return Math.abs(v)>=b?Math.sign(v):(v/u0)*Math.sqrt(1-v*v/(4*u0*u0));};
 return <S.Figure plot caption="Normalized current difference $(I_1 - I_2)/I_T$ against differential input for MOS pairs at three balanced overdrives, and for a bipolar pair (orange, $\tanh(v_d/2V_T)$). The MOS curves reach full steering at $\sqrt2\,u_0$, so their linear range scales with overdrive; the bipolar pair always steers fully within about ±100 mV. Each pair's slope at the origin is its $g_m$: a MOS pair at 0.2 V overdrive has a quarter of the bipolar pair's slope for the same tail current.">
 <Plot curves={[...us.map((u,i)=>({name:'MOS, u_0 = '+u+' V',color:cols[i],points:xs(-1.5,1.5,300).map(v=>[v,mos(u)(v)] as [number,number])})),{name:'Bipolar, tanh(v_d/2V_T)',color:S.orange,points:xs(-1.5,1.5,300).map(v=>[v,Math.tanh(v/(2*.02585))] as [number,number])}]}
  xRange={[-1.5,1.5]} yRange={[-1.1,1.1]} xLabel="DIFFERENTIAL INPUT v_d / V" yLabel="(I_1 − I_2) / I_T" description="Bipolar steering is complete within a tenth of a volt; MOS steering takes about 0.28, 0.71 and 1.41 volts for overdrives of 0.2, 0.5 and 1 volt."/></S.Figure>;
}
export function DiffOffsetFigure(){
 const items:[string,number][]=[['Threshold, ΔV_T = 5 mV',5],['Drain resistors, 1%: (u_0/2)(ΔR/R)',5],['k mismatch, 1%: (u_0/2)(Δk/k)',5]];
 const rss=Math.hypot(...items.map(i=>i[1]));
 return <S.Figure plot caption="An input-offset budget for the pair of this chapter at $u_0$ = 1 V, with 5 mV of threshold mismatch and 1% mismatches in drain resistors and in $k$. Each resistor or $k$ term is referred to the input through $u_0/2$, so at 1 V of overdrive a 1% mismatch costs 5 mV, as much as the threshold term. Uncorrelated terms add as a root sum of squares: about 8.7 mV. At 0.2 V of overdrive the two percentage terms shrink to 1 mV each and the threshold dominates.">
 <Plot curves={[...items.map(([name,v],i)=>({name,color:[S.orange,S.gray,S.ink][i],points:[[i+.6,0],[i+.6,v],[i+1.4,v],[i+1.4,0]] as [number,number][]})),{name:'RSS total ≈ '+rss.toFixed(1)+' mV',color:S.green,points:[[3.6,0],[3.6,rss],[4.4,rss],[4.4,0]]}]}
  xRange={[0,5]} yRange={[0,10]} xTicks={[]} xLabel="CONTRIBUTION" yLabel="INPUT-REFERRED OFFSET / mV" description="Bar chart: three five millivolt offset contributions and their root-sum-square total of about 8.7 millivolts."/></S.Figure>;
}

/* ---------- Chapter 66: differential range and rejection ---------- */
export function CmWindowFigure(){
 const u0=1,uT=.3,VD=4;
 return <S.Figure plot caption="The common-mode window of the example pair ($I_T$ = 2 mA, $u_0$ = 1 V, $V_T$ = 1 V, $R_D$ = 1 kΩ, 5 V supply, tail needing $u_T$ = 0.3 V). The shared source follows the inputs, $V_S = V_C - V_T - u_0$ (green). It must stay above the tail's compliance (lower dashed line) and below $V_D - u_0$ (upper dashed line), where the input devices would leave saturation. Those two limits fix the valid common-mode range: 2.3 V to 5.0 V. A 10 mV signal at 2.0 V common mode fails, however small it is.">
 <Plot curves={[{name:'Shared source V_S',color:S.green,points:[[1.5,-.5],[6,4]]},{name:'Tail limit u_T',color:S.orange,dashed:true,points:[[1.5,uT],[6,uT]]},{name:'Input-device limit V_D − u_0',color:S.gray,dashed:true,points:[[1.5,VD-u0],[6,VD-u0]]}]}
  marks={[{at:[2.3,uT],label:'2.3 V',pos:'se'},{at:[5,VD-u0],label:'5.0 V',pos:'nw'},{at:[2.5,.5],label:'bias',pos:'nw'}]}
  xRange={[1.5,6]} yRange={[-.5,4]} xLabel="COMMON-MODE INPUT V_C / V" yLabel="SHARED SOURCE V_S / V" description="Shared source voltage rises one for one with common-mode input; it is valid between the tail limit at 0.3 volts and the input-device limit at 3 volts, corresponding to common-mode inputs from 2.3 to 5 volts."/></S.Figure>;
}
export function CmrrFrequencyFigure(){
 const gm=.002,CT=2e-12,tails:[number,string,string][]=[[5e4,'Simple tail, r_T = 50 kΩ',S.orange],[5e6,'Cascode tail, r_T = 5 MΩ',S.green]];
 return <S.Figure plot caption="Single-ended common-mode rejection against frequency, $\mathrm{CMRR} \approx (1 + 2g_m|Z_T|)/2$, with 2 pF of capacitance at the tail node. A cascode tail raises the low-frequency CMRR by 40 dB, but its pole is 100 times lower, at 16 kHz instead of 1.6 MHz. Above about 2 MHz both are set by the capacitance alone and coincide. Good rejection at DC does not mean good rejection of a fast common-mode disturbance.">
 <Plot curves={tails.map(([rT,name,color])=>({name,color,points:xs(2,9,240).map(e=>{const f=10**e,z=rT/Math.hypot(1,2*Math.PI*f*rT*CT);return [f,20*Math.log10((1+2*gm*z)/2)] as [number,number];})}))}
  xScale="log" xRange={[100,1e9]} yRange={[-10,90]} xLabel="FREQUENCY / Hz" yLabel="SINGLE-ENDED CMRR / dB" description="Common-mode rejection flat at 40 decibels for a simple tail and 80 decibels for a cascode tail, both falling at twenty decibels per decade and merging above a few megahertz."/></S.Figure>;
}

/* ---------- Chapter 67: mirror-loaded differential pair ---------- */
// 2 mA tail, k = 2 mA/V² for all devices, |V_T| = 1 V, λ = 0.02 V⁻¹, V_C = 2.5 V, 5 V supply.
const otaOut=(vd:number)=>{
 const p=differential({vdiff:vd,vc:2.5,tail:.002,k:K,rd:1000}),vs=p.vs;
 const vsg=bisect((v:number)=>channel(v,v,K,VT,.02).id-p.i1,1,4),VL=5-vsg;
 const nI=(vo:number)=>channel(2.5-vd/2-vs,Math.max(0,vo-vs),K,VT,0).id*(1+.02*Math.max(0,vo-vs))/(1+.02*(VL-vs));
 return bisect((vo:number)=>nI(vo)-channel(vsg,Math.max(0,5-vo),K,VT,.02).id,vs,5);
};
export function OtaCurrentFigure(){
 const m1=S.fetPins({at:[250,260]}),m2=S.fetPins({at:[470,260],flip:true}),m3=S.fetPins({at:[278,120],kind:'pmos',flip:true}),m4=S.fetPins({at:[442,120],kind:'pmos'});
 return <S.Figure caption="Signal-current bookkeeping in the mirror-loaded pair. A differential input $+v_d/2$, $-v_d/2$ raises $M_1$'s current by $i = g_{m0}v_d/2$ and lowers $M_2$'s by the same $i$. $M_3$ and $M_4$ copy the left increase to the right side. At the output, $M_4$ now sources $i$ more while $M_2$ sinks $i$ less, so a net $2i = g_{m0}v_d$ flows into the output node: the whole differential current, from one side.">
 <S.Schematic width={720} height={400} description="NMOS differential pair M1 M2 with PMOS mirror load M3 diode and M4; tail current source; signal currents marked on each branch and the output.">
  <S.Rail at={[264,30]} label="V_DD"/><S.Wire pts={[[264,30],[456,30]]}/><S.Wire pts={[[264,30],m3.s]}/><S.Wire pts={[[456,30],m4.s]}/>
  <S.Fet at={[278,120]} kind="pmos" flip/><S.Fet at={[442,120]} kind="pmos"/><S.Wire pts={[[264,180],[340,180],[340,120]]}/><S.Wire pts={[m3.g,m4.g]}/>
  <S.Wire pts={[m3.d,m1.d]}/><S.Dot at={[264,180]}/><S.Dot at={[340,120]}/>
  <S.Wire pts={[m4.d,m2.d]}/><S.Wire pts={[[456,190],[600,190]]}/><S.Dot at={[456,190]}/><S.Terminal at={[600,190]} label="v_out" side="right"/>
  <S.Fet at={[250,260]}/><S.Fet at={[470,260]} flip/><S.Terminal at={[150,260]} label="+v_d/2"/><S.Wire pts={[[150,260],m1.g]}/><S.Terminal at={[570,260]} label="−v_d/2" side="right"/><S.Wire pts={[[570,260],m2.g]}/>
  <S.Wire pts={[m1.s,[264,320],[456,320],m2.s]}/><S.Dot at={[360,320]}/><S.CurrentSource a={[360,320]} b={[360,390]} label="I_T"/><S.Ground at={[360,390]}/>
  <S.CurrentArrow at={[264,215]} dir="down" label="I_T/2 + i" side={-1}/><S.CurrentArrow at={[456,225]} dir="down" label="I_T/2 − i"/><S.CurrentArrow at={[456,168]} dir="down" label="I_T/2 + i" side={-1}/>
  <S.CurrentArrow at={[515,190]} dir="right" label="2i = g_m0 v_d"/>
  <S.Text x={230} y={100} anchor="end">M_3</S.Text><S.Text x={490} y={100}>M_4</S.Text><S.Text x={300} y={265}>M_1</S.Text><S.Text x={420} y={265} anchor="end">M_2</S.Text>
 </S.Schematic></S.Figure>;
}
export function OtaTransferFigure(){
 return <S.Figure plot caption="Large-signal output of the mirror-loaded pair against differential input ($I_T$ = 2 mA, all devices $k$ = 2 mA/V², $|V_T|$ = 1 V, $\lambda$ = 0.02 V⁻¹, $V_C$ = 2.5 V). The output swings from about 1.5 V to 4.1 V over ±30 mV: a gain of about 52 at the center. At zero input the output rests at 3.02 V, exactly the voltage of the diode-connected node, because only there do the two PMOS devices have equal drain voltages. Outside the steep region one device or another has left saturation.">
 <Plot curves={[{name:'v_out',color:S.green,points:xs(-.08,.08,320).map(v=>[1e3*v,otaOut(v)] as [number,number])}]} marks={[{at:[0,otaOut(0)],label:'V_out = V_L',pos:'nw'}]}
  xRange={[-80,80]} yRange={[0,5]} xLabel="DIFFERENTIAL INPUT v_d / mV" yLabel="OUTPUT VOLTAGE / V" description="Steep sigmoid: output near 1.2 volts for negative inputs, rising through three volts at zero, to about 4.3 volts for positive inputs."/></S.Figure>;
}

/* ---------- Chapter 68: degenerated differential pair ---------- */
const dI=(v:number,rs:number)=>{const p=differential({vdiff:v,rs,tail:.002,k:K});return (p.i1-p.i2)*1e3;};
export function DegenSteeringFigure(){
 const rs:[number,string][]=[[0,S.orange],[250,S.gray],[500,S.ink],[1000,S.green]];
 return <S.Figure plot caption="Exact steering of a 2 mA pair ($k$ = 2 mA/V²) with 0, 250, 500 and 1000 Ω in each source. Degeneration lowers the slope at the origin, $G_{md} = g_{m0}/(1 + g_{m0}R_S)$, and stretches the range before one side takes the whole tail: full steering moves from 1.41 V to $\sqrt{2I_T/k} + I_TR_S$ = 3.41 V. Over most of its range the 1 kΩ curve is close to the straight line $v_d/R_S$ set by the resistors.">
 <Plot curves={rs.map(([r,c])=>({name:'R_S = '+r+' Ω',color:c,points:xs(-3.6,3.6,300).map(v=>[v,dI(v,r)] as [number,number])}))} xRange={[-3.6,3.6]} yRange={[-2.2,2.2]} xLabel="DIFFERENTIAL INPUT v_d / V" yLabel="I_1 − I_2 / mA" description="Four steering curves; larger source resistance gives a gentler, straighter curve that saturates at a larger input."/></S.Figure>;
}
export function DegenGmFigure(){
 const rs:[number,string][]=[[0,S.orange],[250,S.gray],[500,S.ink],[1000,S.green]];
 return <S.Figure plot caption="Local differential transconductance $d(I_1 - I_2)/dv_d$, normalized to its value at balance, against differential input. Without degeneration it falls continuously from the origin, which is the square law's compression. With 1 kΩ it stays within 10% of its balanced value out to about ±2 V. The degenerated pair trades transconductance for a long, flat region.">
 <Plot curves={rs.map(([r,c])=>({name:'R_S = '+r+' Ω',color:c,points:xs(-3.6,3.6,300).map(v=>[v,slope(x=>dI(x,r),v,1e-3)/slope(x=>dI(x,r),0,1e-3)] as [number,number])}))} xRange={[-3.6,3.6]} yRange={[0,1.2]} xLabel="DIFFERENTIAL INPUT v_d / V" yLabel="G_m / G_m AT BALANCE" description="Normalized transconductance against input: a narrow peak without degeneration, broad plateaus with degeneration."/></S.Figure>;
}
export function SplitTailCircuit(){
 const a=S.fetPins({at:[250,180]}),b=S.fetPins({at:[470,180],flip:true});
 return <S.Figure caption="Degeneration without a DC drop. Instead of a resistor in each source over one shared tail, give each source its own tail of $I_T/2$ and join the sources with a single resistor of $2R_S$. At balance no current flows in the resistor, so it costs no headroom; for differential signals its midpoint is a virtual ground, so each side sees $R_S$, exactly as before. The price is two current sources that must match.">
 <S.Schematic width={720} height={380} description="NMOS pair with separate half-tail current sinks under each source and a resistor two R S connecting the two sources.">
  <S.Rail at={[264,30]} label="V_DD"/><S.Res a={[264,30]} b={[264,130]} label="R_D"/><S.Wire pts={[[264,130],a.d]}/><S.Rail at={[456,30]} label="V_DD"/><S.Res a={[456,30]} b={[456,130]} label="R_D" flipLabel/><S.Wire pts={[[456,130],b.d]}/>
  <S.Fet at={[250,180]}/><S.Fet at={[470,180]} flip/><S.Terminal at={[150,180]} label="V_1"/><S.Wire pts={[[150,180],a.g]}/><S.Terminal at={[570,180]} label="V_2" side="right"/><S.Wire pts={[[570,180],b.g]}/>
  <S.Wire pts={[a.s,[264,260]]}/><S.Wire pts={[b.s,[456,260]]}/><S.Res a={[264,260]} b={[456,260]} label="2R_S" value="no DC current"/><S.Dot at={[264,260]}/><S.Dot at={[456,260]}/>
  <S.CurrentSource a={[264,260]} b={[264,350]} label="I_T/2" flipLabel/><S.Ground at={[264,350]}/><S.CurrentSource a={[456,260]} b={[456,350]} label="I_T/2"/><S.Ground at={[456,350]}/>
 </S.Schematic></S.Figure>;
}

/* ---------- Chapter 69: complementary output followers ---------- */
// NMOS and PMOS followers, k = 20 mA/V², |V_T| = 1 V, ±5 V rails, 1 kΩ load; gate spread VB.
const compOut=(vin:number,VB:number,RL=1000)=>{const gn=vin+VB/2,gp=vin-VB/2;
 return bisect((vo:number)=>vo/RL+channel(vo-gp,Math.max(0,vo+5),.02,VT).id-channel(gn-vo,Math.max(0,5-vo),.02,VT).id,-5,5);};
const SPREADS:[number,string,string][]=[[0,'Gates tied (V_B = 0)',S.orange],[2,'Class B (V_B = 2V_T)',S.gray],[2.447,'Class AB, I_Q = 0.5 mA',S.green]];
export function CrossoverFigure(){
 return <S.Figure plot caption="Output against input for a complementary follower driving 1 kΩ ($k$ = 20 mA/V², $|V_T|$ = 1 V, ±5 V rails), with three gate spreads. With the gates tied, neither device conducts until the input is a threshold away from the output, leaving a 2 V dead zone. Spreading the gates by $2V_T$ (class B) closes the gap but leaves a kink. Adding a little overdrive (class AB, 0.5 mA idle) makes the curve smooth through zero.">
 <Plot curves={SPREADS.map(([vb,name,color])=>({name,color,points:xs(-3,3,300).map(v=>[v,compOut(v,vb)] as [number,number])}))} xRange={[-3,3]} yRange={[-3,3]} xLabel="INPUT V_in / V" yLabel="OUTPUT V_out / V" description="Three transfer curves: one with a flat dead zone between minus one and plus one volt, one with a kink at zero, one smooth."/></S.Figure>;
}
export function CrossoverGainFigure(){
 return <S.Figure plot caption="Local gain $dV_{out}/dV_{in}$ of the same three stages. Tied gates: zero gain across the dead zone. Class B: the local gain falls to zero exactly at the crossing, where both devices have zero current and zero $g_m$, and recovers only gradually. Class AB: both devices conduct around zero, their transconductances add, and the gain stays near 0.9 throughout. That dip is crossover distortion, and it occurs at every zero crossing however small the signal.">
 <Plot curves={SPREADS.map(([vb,name,color])=>({name,color,points:xs(-3,3,300).map(v=>[v,slope(x=>compOut(x,vb),v,2e-3)] as [number,number])}))} xRange={[-3,3]} yRange={[0,1.05]} xLabel="INPUT V_in / V" yLabel="LOCAL GAIN" description="Local gain against input: zero in a central band for tied gates, a sharp dip at zero for class B, nearly constant for class AB."/></S.Figure>;
}
export function ClassAbBiasCircuit(){
 const mn=S.fetPins({at:[430,120]}),mp=S.fetPins({at:[430,300],kind:'pmos'}),m3=S.fetPins({at:[230,150],flip:true}),m4=S.fetPins({at:[230,270],kind:'pmos',flip:true});
 return <S.Figure caption="A class-AB output stage with a replica bias spreader. $I_{bias}$ flows through a diode-connected NMOS $M_3$ and PMOS $M_4$, which generate the gate spread. Around the loop $V_{GS3} + V_{SG4} = V_{GSN} + V_{SGP}$, so if the output devices are $n$ times the replicas' width and run at the same temperature, the idle current is $I_Q = n\,I_{bias}$, whatever the thresholds. The input drives the replicas' midpoint.">
 <S.Schematic width={680} height={445} description="Current source into diode NMOS M3, input at the junction of M3 and diode PMOS M4, current sink below; M3 and M4 drive the gates of output NMOS MN and PMOS MP whose sources form the output.">
  <S.Rail at={[216,25]} label="+V_S"/><S.CurrentSource a={[216,25]} b={[216,95]} label="I_bias" flipLabel/><S.Wire pts={[[216,95],m3.d]}/>
  <S.Fet at={[230,150]} flip/><S.Wire pts={[[216,100],[290,100],[290,150]]}/><S.Dot at={[216,100]}/><S.Wire pts={[m3.g,[400,150],mn.g]}/><S.Dot at={[290,150]}/>
  <S.Wire pts={[m3.s,m4.s]}/><S.Wire pts={[[216,210],[120,210]]}/><S.Dot at={[216,210]}/><S.Terminal at={[120,210]} label="v_in"/>
  <S.Fet at={[230,270]} kind="pmos" flip/><S.Wire pts={[m4.d,[216,340]]}/><S.Wire pts={[[216,325],[290,325],[290,270]]}/><S.Dot at={[216,325]}/><S.Wire pts={[m4.g,[400,270],[400,300],mp.g]}/><S.Dot at={[290,270]}/>
  <S.CurrentSource a={[216,340]} b={[216,405]} label="I_bias" flipLabel/><S.Rail at={[216,405]} label="−V_S" down/>
  <S.Rail at={[444,25]} label="+V_S"/><S.Wire pts={[[444,25],mn.d]}/><S.Fet at={[430,120]}/><S.Fet at={[430,300]} kind="pmos"/><S.Rail at={[444,405]} label="−V_S" down/><S.Wire pts={[mp.d,[444,405]]}/>
  <S.Wire pts={[mn.s,mp.s]}/><S.Wire pts={[[444,210],[600,210]]}/><S.Dot at={[444,210]}/><S.Terminal at={[600,210]} label="v_out" side="right"/>
  <S.Text x={160} y={155} anchor="end">M_3</S.Text><S.Text x={160} y={275} anchor="end">M_4</S.Text><S.Text x={480} y={125}>M_N</S.Text><S.Text x={480} y={305}>M_P</S.Text>
  <S.Text x={480} y={145} kind="value">× n</S.Text><S.Text x={480} y={325} kind="value">× n</S.Text>
 </S.Schematic></S.Figure>;
}
export function OutputPowerFigure(){
 const VS=5,RL=100,IQ=.001;
 const pts=(fn:(v:number)=>number)=>xs(0,4.6,200).map(v=>[v,fn(v)*1e3] as [number,number]);
 return <S.Figure plot caption="Power in a complementary stage on ±5 V driving 100 Ω with a sine wave, against output amplitude, with 1 mA of idle current. Load power rises as the square of amplitude. Supply power rises linearly (each rail delivers half-wave pulses averaging $V_{pk}/\pi R_L$). The difference, dissipated in the transistors, peaks at $V_{pk} = 2V_S/\pi$ ≈ 3.2 V, not at full output: a stage must be rated for that intermediate amplitude.">
 <Plot curves={[{name:'Load power',color:S.green,points:pts(v=>v*v/(2*RL))},{name:'Supply power',color:S.ink,points:pts(v=>2*VS*v/(Math.PI*RL)+2*VS*IQ)},{name:'Transistor dissipation',color:S.orange,points:pts(v=>2*VS*v/(Math.PI*RL)-v*v/(2*RL)+2*VS*IQ)}]}
  marks={[{at:[2*VS/Math.PI,(2*VS*(2*VS/Math.PI)/(Math.PI*RL)-(2*VS/Math.PI)**2/(2*RL)+2*VS*IQ)*1e3],label:'2V_S/π',pos:'nw'}]}
  xRange={[0,4.6]} yRange={[0,160]} xLabel="OUTPUT AMPLITUDE V_pk / V" yLabel="POWER / mW" description="Load power parabola, supply power straight line, and transistor dissipation that peaks near 3.2 volts of output amplitude."/></S.Figure>;
}

/* ---------- Chapter 70: two-stage amplifier ---------- */
const TS={gm1:1e-3,R1:5e4,gm2:4e-3,R2:2.5e4,C1:.5e-12,C2:10e-12};
const tsCoef=(Cc:number)=>{const {gm1,R1,gm2,R2,C1,C2}=TS;return {A0:gm1*R1*gm2*R2,a:R1*(C1+Cc)+R2*(C2+Cc)+gm2*R1*R2*Cc,b:R1*R2*(C1*C2+Cc*(C1+C2)),tz:Cc/gm2};};
// Open-loop response; with a nulling resistor of 1/gm2 the right-half-plane zero is removed.
const tsH=(f:number,Cc:number,nul=false)=>{const {A0,a,b,tz}=tsCoef(Cc),w=2*Math.PI*f,ni=nul?0:-w*tz,dr=1-b*w*w,di=a*w,d=dr*dr+di*di;
 const re=(dr+ni*di)/d,im=(ni*dr-di)/d;let ph=Math.atan2(im,re)*180/Math.PI;return {mag:A0*Math.hypot(re,im),ph};};
const unwrap=(pts:[number,number][])=>{let off=0;return pts.map((p,i)=>{if(i>0){const prev=pts[i-1][1]+off;while(p[1]+off-prev>180)off-=360;while(p[1]+off-prev<-180)off+=360;}return [p[0],p[1]+off] as [number,number];});};
export function TwoNodeModelFigure(){
 return <S.Figure caption="The two-node small-signal model of the two-stage amplifier. The first stage is a transconductance $g_{m1}$ driving node 1, which has resistance $R_1$ (the mirror and pair output resistances) and capacitance $C_1$ (mostly the second stage's gate). The second stage is $g_{m2}$ driving the output node, with $R_2$ and the load capacitance $C_2$. The compensation capacitor $C_C$ bridges the two nodes; the optional nulling resistor $R_Z$ sits in series with it.">
 <S.Schematic width={720} height={300} description="First transconductance source into node one with R1 and C1 to ground; compensation capacitor and nulling resistor from node one to output node; second transconductance source into output node with R2 and C2 to ground.">
  <S.DepSource a={[90,90]} b={[90,240]} label="g_m1 v_d" flipLabel/><S.Wire pts={[[90,90],[300,90]]}/><S.Wire pts={[[90,240],[260,240]]}/>
  <S.Res a={[190,90]} b={[190,240]} label="R_1"/><S.Cap a={[260,90]} b={[260,240]} label="C_1"/><S.Ground at={[175,240]}/>
  <S.Dot at={[190,90]}/><S.Dot at={[260,90]}/><S.Dot at={[190,240]}/><S.Text x={300} y={80}>v_1</S.Text>
  <S.Wire pts={[[300,90],[300,40],[360,40]]}/><S.Res a={[360,40]} b={[440,40]} label="R_Z" value="optional"/><S.Cap a={[440,40]} b={[540,40]} label="C_C"/><S.Wire pts={[[540,40],[640,40],[640,90]]}/>
  <S.DepSource a={[420,90]} b={[420,240]} label="g_m2 v_1" flipLabel/><S.Wire pts={[[420,90],[660,90]]}/><S.Wire pts={[[420,240],[590,240]]}/>
  <S.Res a={[520,90]} b={[520,240]} label="R_2"/><S.Cap a={[590,90]} b={[590,240]} label="C_2"/><S.Ground at={[505,240]}/>
  <S.Dot at={[520,90]}/><S.Dot at={[590,90]}/><S.Dot at={[640,90]}/><S.Dot at={[520,240]}/><S.Terminal at={[660,90]} label="v_out" side="right"/>
 </S.Schematic></S.Figure>;
}
export function TwoStageBodeFigure(){
 const cases:[number,boolean,string,string][]=[[0,false,'No compensation',S.orange],[2e-12,false,'C_C = 2 pF',S.gray],[5e-12,true,'C_C = 5 pF + R_Z',S.green]];
 const fs=xs(2,10,320).map(e=>10**e);
 return <S.Figure plot caption="Open-loop magnitude (top) and phase (bottom) of the two-stage amplifier: $g_{m1}$ = 1 mS, $R_1$ = 50 kΩ, $g_{m2}$ = 4 mS, $R_2$ = 25 kΩ, $C_1$ = 0.5 pF, $C_2$ = 10 pF, DC gain 5000 (74 dB). Uncompensated, two poles near 640 kHz and 6 MHz bring the phase close to −180° at the unity-gain crossing: a follower would oscillate. With $C_C$ = 2 pF the phase margin is 34°. With 5 pF and a nulling resistor it is 64°, at a unity-gain frequency of 28 MHz.">
 <Plot curves={cases.map(([cc,nul,name,color])=>({name,color,points:fs.map(f=>[f,20*Math.log10(tsH(f,cc,nul).mag)] as [number,number])}))} xScale="log" xRange={[100,1e10]} yRange={[-40,80]} xLabel="FREQUENCY / Hz" yLabel="OPEN-LOOP GAIN / dB" description="Open-loop gain magnitude: all start at 74 decibels; compensation moves the first corner far lower."/>
 <Plot curves={cases.map(([cc,nul,name,color])=>({name,color,points:unwrap(fs.map(f=>[f,tsH(f,cc,nul).ph] as [number,number]))}))} xScale="log" xRange={[100,1e10]} yRange={[-270,0]} xLabel="FREQUENCY / Hz" yLabel="PHASE / degrees" description="Open-loop phase: compensated curves stay near minus ninety degrees over a wide range before falling."/></S.Figure>;
}
export function PoleSplitFigure(){
 const ccs=xs(-14,-10,160).map(e=>10**e);
 const roots=(Cc:number)=>{const {a,b}=tsCoef(Cc),d=Math.sqrt(a*a-4*b);return [(a-d)/(2*b),(a+d)/(2*b)].map(w=>w/(2*Math.PI));};
 return <S.Figure plot caption="Pole splitting. As $C_C$ grows, the lower pole $p_1 \approx 1/(2\pi g_{m2}R_1R_2C_C)$ falls in proportion, because the Miller effect multiplies $C_C$ by the second stage's gain. Meanwhile the upper pole rises toward $g_{m2}/2\pi(C_1 + C_2)$ ≈ 61 MHz, because at high frequency $C_C$ connects the second stage's gate to its drain and turns it into a diode-connected load of resistance $1/g_{m2}$. One capacitor pushes the two poles apart.">
 <Plot curves={[{name:'Lower pole p_1',color:S.green,points:ccs.map(c=>[c*1e12,roots(c)[0]] as [number,number])},{name:'Upper pole p_2',color:S.orange,points:ccs.map(c=>[c*1e12,roots(c)[1]] as [number,number])},{name:'Unity-gain frequency g_m1/2πC_C',color:S.gray,dashed:true,points:ccs.map(c=>[c*1e12,1e-3/(2*Math.PI*c)] as [number,number])}]}
  xScale="log" yScale="log" xRange={[.01,100]} yRange={[1e3,1e10]} xLabel="COMPENSATION CAPACITANCE C_C / pF" yLabel="FREQUENCY / Hz" description="Log-log plot: lower pole falls linearly with compensation capacitance, upper pole rises and levels off near sixty megahertz; they cross the unity-gain line at different capacitances."/></S.Figure>;
}
export function TwoStageStepFigure(){
 const sim=(Cc:number,nul:boolean)=>{const {A0,a,b,tz}=tsCoef(Cc),t2=nul?0:tz,dt=2e-12,out:[number,number][]=[];let x1=0,x2=0;
  for(let n=0;n<=100000;n++){const y=A0*(x1-t2*x2);if(n%250===0)out.push([n*dt*1e9,y]);const d2=(1-(1+A0)*x1-(a-A0*t2)*x2)/b;x1+=dt*x2;x2+=dt*d2;}return out;};
 return <S.Figure plot caption="Small-signal step response of the amplifier connected as a unity-gain follower, for a 1 V input step treated as small (no slewing). With 34° of phase margin ($C_C$ = 2 pF) the output overshoots by 36% and rings; with 64° ($C_C$ = 5 pF and nulling resistor) it overshoots by about 6% and settles cleanly. Look closely at the start of the orange curve: the right-half-plane zero first drives the output slightly the wrong way.">
 <Plot curves={[{name:'C_C = 2 pF, PM 34°',color:S.orange,points:sim(2e-12,false)},{name:'C_C = 5 pF + R_Z, PM 64°',color:S.green,points:sim(5e-12,true)},{name:'Input step',color:S.gray,dashed:true,points:[[0,1],[200,1]]}]}
  xRange={[0,200]} yRange={[-.2,1.6]} xLabel="TIME / ns" yLabel="OUTPUT / V" description="Step responses: one with large overshoot and ringing, one settling smoothly to one volt."/></S.Figure>;
}

/* ---------- Chapter 71: noise and transconductance efficiency ---------- */
const KB=1.380649e-23;
export function NoiseVsSourceFigure(){
 const rs=xs(1,7,200).map(e=>10**e),th=(r:number)=>Math.sqrt(4*KB*300*r)*1e9;
 return <S.Figure plot caption="Input noise density against source resistance at 300 K. The source's own thermal noise (black dashed) rises as $\sqrt{R_S}$. Amplifiers with 1, 3 and 10 nV/√Hz of voltage noise add in quadrature. Below a few hundred ohms the amplifier dominates and a quieter input stage matters; above about 10 kΩ even the 10 nV/√Hz amplifier adds only a few percent, and spending current on a quieter input buys almost nothing. (MOS current noise, negligible at these frequencies, is omitted.)">
 <Plot curves={[{name:'Source resistor alone',color:S.ink,dashed:true,points:rs.map(r=>[r,th(r)] as [number,number])},...([[1,S.green],[3,S.gray],[10,S.orange]] as [number,string][]).map(([en,c])=>({name:'Total with e_n = '+en+' nV/√Hz',color:c,points:rs.map(r=>[r,Math.hypot(en,th(r))] as [number,number])}))]}
  xScale="log" yScale="log" xRange={[10,1e7]} yRange={[.3,500]} xLabel="SOURCE RESISTANCE R_S / Ω" yLabel="INPUT NOISE DENSITY / (nV/√Hz)" description="Log-log plot: total noise is flat at the amplifier's voltage noise for low source resistance and merges with the resistor's square-root rise for high resistance."/></S.Figure>;
}
export function GmIdFigure(){
 const ics=xs(-3,2.5,200).map(e=>10**e),n=1.3,UT=.02585;
 const ekv=(ic:number)=>2/(n*UT*(1+Math.sqrt(1+4*ic)));
 return <S.Figure plot caption="Transconductance efficiency $g_m/I_D$ against inversion coefficient, the drain current normalized to the device's moderate-inversion current. In weak inversion (left) it saturates at $1/nU_T$ ≈ 30 V⁻¹ ($n$ = 1.3); in strong inversion (right) it falls as $1/\sqrt{I}$, following the square law's $2/u$. The smooth curve is a common interpolation through moderate inversion, where most low-power analog design now lives. A bipolar transistor sits at $1/U_T$ ≈ 39 V⁻¹ at every current.">
 <Plot curves={[{name:'Interpolated g_m/I_D',color:S.green,points:ics.map(i=>[i,ekv(i)] as [number,number])},{name:'Weak-inversion limit 1/nU_T',color:S.gray,dashed:true,points:[[1e-3,1/(n*UT)],[300,1/(n*UT)]]},{name:'Strong-inversion asymptote',color:S.orange,dashed:true,points:ics.filter(i=>i>.3).map(i=>[i,1/(n*UT*Math.sqrt(i))] as [number,number])},{name:'Bipolar, 1/U_T',color:S.ink,dashed:true,points:[[1e-3,1/UT],[300,1/UT]]}]}
  xScale="log" yScale="log" xRange={[1e-3,300]} yRange={[1,60]} xLabel="INVERSION COEFFICIENT (NORMALIZED CURRENT)" yLabel="g_m / I_D  /  V⁻¹" description="Transconductance efficiency is flat near thirty per volt in weak inversion and falls as one over the square root of current in strong inversion."/></S.Figure>;
}
export function FlickerFigure(){
 const fs=xs(-1,6,240).map(e=>10**e),en=5;
 return <S.Figure plot caption="Input voltage-noise density with a white floor of 5 nV/√Hz and a flicker ($1/f$) component, for a device with a 1 kHz corner and one with four times the gate area (corner 250 Hz). Flicker noise power falls as $1/(WLf)$: quadrupling the area halves the low-frequency density but does nothing to the white floor, which is set by $g_m$. A measurement below 10 Hz sees mostly flicker noise.">
 <Plot curves={[{name:'Corner 1 kHz',color:S.orange,points:fs.map(f=>[f,en*Math.sqrt(1+1000/f)] as [number,number])},{name:'4× area: corner 250 Hz',color:S.green,points:fs.map(f=>[f,en*Math.sqrt(1+250/f)] as [number,number])},{name:'White floor',color:S.gray,dashed:true,points:[[.1,en],[1e6,en]]}]}
  xScale="log" yScale="log" xRange={[.1,1e6]} yRange={[1,1000]} xLabel="FREQUENCY / Hz" yLabel="NOISE DENSITY / (nV/√Hz)" description="Noise density falls at ten decibels per decade at low frequency and flattens at five nanovolts per root hertz above the corner frequency."/></S.Figure>;
}
