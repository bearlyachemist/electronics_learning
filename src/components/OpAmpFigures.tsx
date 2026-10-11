import * as S from './Schematic';
import type {Pt} from './Schematic';
const W=({p}:{p:Pt[]})=><S.Wire pts={p}/>;
const T=({p,label,side='left'}:{p:Pt;label:string;side?:'left'|'right'|'above'|'below'})=><S.Terminal at={p} label={label} side={side}/>;

export function InternalAmplifierFigure({technology='mos'}:{technology?:'mos'|'bjt'}){
 const b=technology==='bjt',ld=b?222:224,rd=b?442:444,sd=b?622:624;
 return <S.Figure caption={b?'Original simplified bipolar construction: NPN differential pair, PNP mirror, NPN voltage-gain stage and Miller compensation. Ideal tail and bias generators are shown explicitly. A separate complementary buffer can follow the output.':'Original two-stage CMOS teaching construction: NMOS differential pair, PMOS mirror load, NMOS second gain stage, PMOS active load and Miller capacitor. Ideal tail and bias generators require implementation in a complete design.'}>
 <S.Schematic className="wide-circuit advanced-circuit" width={830} height={480} description="Two connected transistor gain stages with explicit signal polarity and compensation">
 {b?<><S.Bjt at={[210,225]}/><S.Bjt at={[430,225]}/><S.Bjt at={[210,90]} pnp/><S.Bjt at={[430,90]} pnp/><S.Bjt at={[610,225]}/><S.Bjt at={[610,90]} pnp/></>:<><S.Fet at={[210,225]}/><S.Fet at={[430,225]}/><S.Fet at={[210,90]} kind="pmos"/><S.Fet at={[430,90]} kind="pmos"/><S.Fet at={[610,225]}/><S.Fet at={[610,90]} kind="pmos"/></>}
 {[ld,rd,sd].map(x=><g key={x}><S.Rail at={[x,30]} label="V_DD"/><W p={[[x,30],[x,50]]}/><W p={[[x,130],[x,185]]}/></g>)}
 <W p={[[180,90],[145,90],[145,155],[350,155],[350,90],[400,90]]}/><W p={[[ld,155],[350,155]]}/><S.Dot at={[ld,155]}/>
 <T p={[100,225]} label="V_−"/><W p={[[100,225],[180,225]]}/><T p={[320,225]} label="V_+"/><W p={[[320,225],[400,225]]}/>
 <W p={[[ld,265],[ld,315],[rd,315],[rd,265]]}/><S.CurrentSource a={[330,315]} b={[330,420]} label="I_T"/><S.Ground at={[330,420]}/>
 <W p={[[rd,170],[525,170],[525,225],[580,225]]}/><S.Dot at={[rd,170]}/><S.Text x={465} y={155}>V_X</S.Text>
 <T p={[530,90]} label="V_BP"/><W p={[[530,90],[580,90]]}/><W p={[[sd,265],[sd,420]]}/><S.Ground at={[sd,420]}/>
 <W p={[[sd,170],[750,170]]}/><S.Dot at={[sd,170]}/><T p={[750,170]} label="V_OUT" side="above"/>
 <S.Cap a={[525,170]} b={[sd,170]} label="C_C"/><S.Dot at={[525,170]}/>
 <S.Text x={210} y={460} anchor="middle">differential input</S.Text><S.Text x={620} y={460} anchor="middle">voltage gain</S.Text>
 </S.Schematic></S.Figure>;
}

type Mode='noninv'|'inv'|'sum'|'difference'|'tia'|'integrator'|'differentiator'|'filter'|'rectifier'|'servo'|'stability'|'log';
export function OpAmpFigure({mode='noninv'}:{mode?:Mode}){
 if(mode==='filter')return <FilterFigure/>;
 if(mode==='difference')return <DifferenceFigure/>;
 if(mode==='servo')return <ServoFigure/>;
 const p=S.opAmpPins({at:[360,230]}),non=mode==='noninv'||mode==='stability',rect=mode==='rectifier',feedback=mode==='integrator'?'C_F':mode==='tia'?'R_F':mode==='log'?'D_F':'R_F';
 const caption=non?'Noninverting feedback: the divider returns output voltage to the minus input.':rect?'Positive precision half-wave rectifier: the diode is inside the feedback path only while conducting. The amplifier output before the diode is a separate node.':'Inverting feedback topology. The plus input is grounded; input and feedback currents meet at the minus-input summing node.';
 return <S.Figure caption={caption}><S.Schematic className="wide-circuit advanced-circuit" width={760} height={460} description={caption}>
 <S.OpAmp at={[360,230]}/><S.Text x={386} y={280}>A</S.Text>
 {non||rect?<><T p={[180,245]} label="V_IN"/><W p={[[180,245],p.plus]}/></>:<><W p={[p.plus,[325,245],[325,385]]}/><S.Ground at={[325,385]}/></>}
 {rect?<><W p={[p.out,[475,230]]}/><S.Diode a={[475,230]} b={[570,230]} label="D"/><W p={[[570,230],[675,230]]}/></>:<W p={[p.out,[675,230]]}/>}
 <T p={[675,230]} label="V_OUT" side="above"/>
 <W p={[[610,230],[610,110]]}/><S.Dot at={[610,230]}/>
 {rect?<W p={[[610,110],[285,110]]}/>:mode==='integrator'?<S.Cap a={[610,110]} b={[285,110]} label={feedback}/>:mode==='log'?<S.Diode a={[285,110]} b={[610,110]} label={feedback}/>:<S.Res a={[610,110]} b={[285,110]} label={feedback}/>}
 <W p={[[285,110],[285,215],p.minus]}/>
 {non?<><S.Res a={[285,215]} b={[285,385]} label="R_G"/><S.Ground at={[285,385]}/></>:rect?<><S.Res a={[610,230]} b={[610,385]} label="R_L"/><S.Ground at={[610,385]}/></>:mode==='tia'?<><S.CurrentSource a={[180,385]} b={[180,215]} label="I_PD"/><S.Ground at={[180,385]}/><W p={[[180,215],[285,215]]}/><S.Cap a={[245,215]} b={[245,385]} label="C_IN"/><S.Ground at={[245,385]}/><S.Dot at={[245,215]}/>
 <W p={[[285,110],[285,55]]}/><S.Cap a={[285,55]} b={[610,55]} label="C_F"/><W p={[[610,55],[610,110]]}/></>:mode==='sum'?<><T p={[95,175]} label="V_1"/><S.Res a={[95,175]} b={[245,175]} label="R_1"/><W p={[[245,175],[285,175]]}/><T p={[95,315]} label="V_2"/><S.Res a={[95,315]} b={[245,315]} label="R_2"/><W p={[[245,315],[285,315],[285,215]]}/></>:<><T p={[95,215]} label="V_IN"/>{mode==='differentiator'?<><S.Cap a={[95,215]} b={[180,215]} label="C_IN"/><S.Res a={[180,215]} b={[285,215]} label="R_IN"/></>:<S.Res a={[95,215]} b={[285,215]} label="R_IN"/>}</>}
 <S.Dot at={[285,215]}/>
 {mode==='differentiator'&&<><W p={[[285,110],[285,55]]}/><S.Cap a={[285,55]} b={[610,55]} label="C_F"/><W p={[[610,55],[610,110]]}/></>}
 {mode==='integrator'&&<><W p={[[285,110],[285,55]]}/><S.Res a={[285,55]} b={[610,55]} label="R_F"/><W p={[[610,55],[610,110]]}/></>}
 {mode==='stability'&&<><S.Cap a={[570,230]} b={[570,385]} label="C_L"/><S.Ground at={[570,385]}/><S.Dot at={[570,230]}/></>}
 </S.Schematic></S.Figure>;
}
function FilterFigure(){const p=S.opAmpPins({at:[480,230],plusTop:true});return <S.Figure caption="Sallen–Key low-pass. C₁ connects the first resistor junction to output; C₂ connects the plus-input node to ground. The op amp has noninverting gain K."><S.Schematic className="wide-circuit advanced-circuit" width={800} height={460} description="Sallen Key low pass with explicitly defined capacitor positions">
 <T p={[70,215]} label="V_IN"/><S.Res a={[70,215]} b={[240,215]} label="R_1"/><S.Res a={[240,215]} b={[410,215]} label="R_2"/><W p={[[410,215],p.plus]}/><S.OpAmp at={[480,230]} plusTop/><W p={[p.out,[710,230]]}/><T p={[710,230]} label="V_OUT" side="above"/>
 <W p={[[240,215],[240,100]]}/><S.Cap a={[240,100]} b={[650,100]} label="C_1"/><W p={[[650,100],[650,230]]}/><S.Dot at={[240,215]}/><S.Dot at={[650,230]}/>
 <S.Cap a={[410,215]} b={[410,385]} label="C_2"/><S.Ground at={[410,385]}/><S.Dot at={[410,215]}/>
 <W p={[p.minus,[455,245],[455,325]]}/><S.Res a={[455,325]} b={[650,325]} label="R_F"/><W p={[[650,325],[650,230]]}/><S.Res a={[455,325]} b={[455,415]} label="R_G"/><S.Ground at={[455,415]}/><S.Dot at={[455,325]}/>
 </S.Schematic></S.Figure>;}
function DifferenceFigure(){const p=S.opAmpPins({at:[390,230]});return <S.Figure caption="Four-resistor difference amplifier. Equal resistor ratios, rather than merely equal nominal gains, determine common-mode cancellation."><S.Schematic className="wide-circuit advanced-circuit" width={760} height={440} description="Difference amplifier with separate input dividers">
 <S.OpAmp at={[390,230]}/><T p={[90,215]} label="V_1"/><S.Res a={[90,215]} b={[285,215]} label="R_1"/><W p={[[285,215],p.minus]}/><T p={[90,245]} label="V_2"/><S.Res a={[90,245]} b={[335,245]} label="R_3" flipLabel/><W p={[[335,245],p.plus]}/><S.Res a={[335,245]} b={[335,380]} label="R_4"/><S.Ground at={[335,380]}/><S.Dot at={[335,245]}/>
 <W p={[[285,215],[285,100]]}/><S.Res a={[285,100]} b={[625,100]} label="R_2"/><W p={[[625,100],[625,230],p.out]}/><S.Dot at={[625,230]}/><W p={[[625,230],[685,230]]}/><T p={[685,230]} label="V_OUT" side="above"/>
 </S.Schematic></S.Figure>;}
function ServoFigure(){const p=S.opAmpPins({at:[330,185]}),q=S.fetPins({at:[500,220]});return <S.Figure caption="Low-side current servo. The op amp drives the NMOS gate until the sense-resistor voltage follows V_SET, provided load and transistor headroom remain available."><S.Schematic className="wide-circuit advanced-circuit" width={760} height={470} description="Op amp NMOS current sink with resistor sense feedback">
 <S.OpAmp at={[330,185]} plusTop/><T p={[150,170]} label="V_SET"/><W p={[[150,170],p.minus]}/><W p={[p.out,[450,185],[450,220],q.g]}/><S.Fet at={[500,220]}/><S.Rail at={[514,35]} label="V_SUPPLY"/><S.Res a={[514,35]} b={q.d} label="LOAD"/>
 <W p={[q.s,[514,310]]}/><S.Res a={[514,310]} b={[514,400]} label="R_SENSE"/><S.Ground at={[514,400]}/><W p={[[514,310],[270,310],[270,200],p.plus]}/><S.Dot at={[514,310]}/><S.Text x={540} y={309}>V_SENSE</S.Text>
 </S.Schematic></S.Figure>;}

export function InstrumentationFigure(){
 const l=S.opAmpPins({at:[200,130],plusTop:true}),r=S.opAmpPins({at:[200,370]}),o=S.opAmpPins({at:[680,245]});
 return <S.Figure caption="Three-op-amp instrumentation amplifier. The two input amplifiers share R_G between their minus nodes; the final matched-ratio subtractor forms V_B minus V_A."><S.Schematic className="wide-circuit advanced-circuit" width={980} height={530} description="Instrumentation amplifier with two input buffers and matched difference output stage">
 <S.OpAmp at={[200,130]} plusTop/><S.OpAmp at={[200,370]}/><S.OpAmp at={[680,245]}/>
 <T p={[75,115]} label="V_1"/><W p={[[75,115],l.plus]}/><T p={[75,385]} label="V_2"/><W p={[[75,385],r.plus]}/>
 <W p={[l.minus,[160,145],[160,195]]}/><W p={[r.minus,[160,355],[160,305]]}/><S.Res a={[160,195]} b={[160,305]} label="R_G" flipLabel/>
 <S.Res a={[160,195]} b={[340,195]} label="R"/><W p={[[340,195],[340,130],l.out]}/><S.Res a={[160,305]} b={[340,305]} label="R"/><W p={[[340,305],[340,370],r.out]}/>
 <W p={[[340,130],[400,130],[400,230]]}/><S.Res a={[400,230]} b={[570,230]} label="R_1"/><W p={[[570,230],o.minus]}/><W p={[[340,370],[425,370],[425,260]]}/><S.Res a={[425,260]} b={[625,260]} label="R_3" flipLabel/><W p={[[625,260],o.plus]}/>
 <W p={[[570,230],[570,85]]}/><S.Res a={[570,85]} b={[870,85]} label="R_2"/><W p={[[870,85],[870,245],o.out]}/><W p={[[870,245],[930,245]]}/><T p={[930,245]} label="V_OUT" side="above"/>
 <S.Res a={[625,260]} b={[625,455]} label="R_4"/><S.Ground at={[625,455]}/><S.Dot at={[570,230]}/><S.Dot at={[625,260]}/><S.Dot at={[870,245]}/><S.Dot at={[340,130]}/><S.Dot at={[340,370]}/><S.Dot at={[160,195]}/><S.Dot at={[160,305]}/>
 </S.Schematic></S.Figure>;
}
