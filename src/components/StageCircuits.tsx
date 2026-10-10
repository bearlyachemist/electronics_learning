import * as S from './Schematic';
export type MirrorType='basic'|'degenerated'|'helper'|'wilson'|'widlar';
export function MirrorCircuit({type='basic',vout=5,re='1 kΩ'}:{type?:MirrorType;vout?:number;re?:string}){
 const p1:S.Pt=[190,215],p2:S.Pt=[410,215],q1=S.bjtPins({at:p1,flip:true}),q2=S.bjtPins({at:p2}),p3:S.Pt=[300,125],q3=S.bjtPins({at:p3});
 const helper=type==='helper',wilson=type==='wilson',extra=helper||wilson;
 return <S.Schematic height={390} description={type+' NPN current mirror, 14.3 kilohm reference resistor on +15 volts. Output held at '+vout.toFixed(1)+' volts.'}>
 <S.Rail at={[178,30]} label="+15 V"/><S.Res a={[178,30]} b={[178,130]} label="R_ref" value="14.3 kΩ" flipLabel/><S.Wire pts={[[178,130],q1.c]}/><S.Bjt at={p1} flip/><S.Bjt at={p2}/><S.Wire pts={[q1.b,q2.b]}/>
 {extra?<><S.Bjt at={p3}/><S.Wire pts={[[178,150],[260,150],[260,125],q3.b]}/><S.Dot at={[178,150]}/><S.Wire pts={[q3.e,[312,215]]}/><S.Dot at={[312,215]}/><S.Text x={335} y={130} kind="value">Q_3</S.Text>
 {helper?<><S.Rail at={[312,45]} label="+15 V"/><S.Wire pts={[[312,45],q3.c]}/></>:<><S.Wire pts={[q3.c,[312,45],[510,45]]}/><S.Terminal at={[510,45]} label="I_out" side="below"/><S.Wire pts={[q2.c,[422,160],[340,160],[340,215]]}/><S.Dot at={[340,215]}/><S.Text x={500} y={105} kind="value">V_out = {vout.toFixed(1)} V</S.Text></>}
 </>:<><S.Wire pts={[[178,150],[300,150],[300,215]]}/><S.Dot at={[178,150]}/><S.Dot at={[300,215]}/></>}
 {!wilson&&<><S.Wire pts={[q2.c,[422,70],[530,70]]}/><S.Terminal at={[530,70]} label="I_out" side="above"/><S.Text x={465} y={105} kind="value">V_out = {vout.toFixed(1)} V</S.Text></>}
 {type==='degenerated'?<><S.Res a={q1.e} b={[178,345]} label="R_E1" value={re} flipLabel/><S.Ground at={[178,345]}/></>:<S.Ground at={q1.e}/>}
 {type==='degenerated'||type==='widlar'?<><S.Res a={q2.e} b={[422,345]} label="R_E2" value={re}/><S.Ground at={[422,345]}/></>:<S.Ground at={q2.e}/>}
 <S.Text x={110} y={220} kind="value">Q_1</S.Text><S.Text x={445} y={220} kind="value">Q_2</S.Text>
 </S.Schematic>;
}
export function DifferentialCircuit({re=0,source=false,activeLoad=false}:{re?:number;source?:boolean;activeLoad?:boolean}){
 const a:S.Pt=[235,225],b:S.Pt=[405,225],q1=S.bjtPins({at:a}),q2=S.bjtPins({at:b,flip:true});
 const c1:S.Pt=[247,165],c2:S.Pt=[393,165],tail:S.Pt=[320,320];
 return <S.Schematic height={440} description={'NPN differential pair with '+(activeLoad?'PNP current-mirror load':'10 kilohm collector loads')+', '+(source||activeLoad?'1 milliamp tail current source':'14.3 kilohm tail resistor')+' to −15 volts; output from right collector.'}>
 <S.Bjt at={a}/><S.Bjt at={b} flip/><S.Terminal at={[75,225]} label="v_1" side="above"/><S.Wire pts={[[75,225],q1.b]}/><S.Terminal at={[565,225]} label="v_2" side="above"/><S.Wire pts={[q2.b,[565,225]]}/><S.Wire pts={[q1.c,c1]}/><S.Wire pts={[q2.c,c2]}/>
 {activeLoad?(()=>{const p3:S.Pt=[259,95],p4:S.Pt=[381,95],q3=S.bjtPins({at:p3,pnp:true,flip:true}),q4=S.bjtPins({at:p4,pnp:true});return <>
 <S.Bjt at={p3} pnp flip/><S.Bjt at={p4} pnp/><S.Rail at={[247,30]} label="+15 V"/><S.Rail at={[393,30]} label="+15 V"/><S.Wire pts={[[247,30],q3.e]}/><S.Wire pts={[[393,30],q4.e]}/><S.Wire pts={[q3.c,c1]}/><S.Wire pts={[q4.c,c2]}/><S.Wire pts={[q3.b,q4.b]}/><S.Wire pts={[[247,150],[320,150],[320,95]]}/><S.Dot at={[247,150]}/><S.Dot at={[320,95]}/><S.Text x={190} y={65} kind="value">Q_3</S.Text><S.Text x={425} y={65} kind="value">Q_4</S.Text>
 </>})():<><S.Rail at={[247,30]} label="+15 V"/><S.Rail at={[393,30]} label="+15 V"/><S.Res a={[247,30]} b={c1} label="R_C1" value="10 kΩ" flipLabel/><S.Res a={[393,30]} b={c2} label="R_C2" value="10 kΩ"/></>}
 {re>0?<><S.Res a={q1.e} b={[247,320]} label="R_E1" value={re+' Ω'} flipLabel/><S.Res a={q2.e} b={[393,320]} label="R_E2" value={re+' Ω'}/><S.Wire pts={[[247,320],[393,320]]}/></>:<S.Wire pts={[q1.e,[247,320],[393,320],q2.e]}/>}
 <S.Dot at={tail}/>{source||activeLoad?<S.CurrentSource a={tail} b={[320,395]} label="I_tail" value="1 mA"/>:<S.Res a={tail} b={[320,395]} label="R_tail" value="14.3 kΩ"/>}<S.Rail at={[320,395]} label="−15 V" down/>
 <S.Wire pts={[c2,[535,165]]}/><S.Dot at={c2} color={S.green}/><S.Terminal at={[535,165]} label="v_out" side="above"/>
 </S.Schematic>;
}
export function PushPullCircuit({mode='B',rl=8}:{mode?:'B'|'AB'|'feedback';rl?:number}){
 const a:S.Pt=[355,125],b:S.Pt=[355,315],qn=S.bjtPins({at:a}),qp=S.bjtPins({at:b,pnp:true}),out:S.Pt=[367,220];
 return <S.Schematic height={445} description={'Complementary NPN and PNP followers on ±15 volts, '+rl+' ohm load. '+(mode==='AB'?'Two bias diodes and 0.47 ohm emitter resistors.':mode==='feedback'?'Op-amp compares input with output and drives both bases.':'Bases tied to input; emitters joined.')}>
 <S.Bjt at={a}/><S.Bjt at={b} pnp/><S.Rail at={[367,40]} label="+15 V"/><S.Wire pts={[[367,40],qn.c]}/><S.Rail at={[367,400]} label="−15 V" down/><S.Wire pts={[qp.c,[367,400]]}/>
 {mode==='AB'?<><S.Res a={qn.e} b={out} label="R_EN" value="0.47 Ω"/><S.Res a={out} b={qp.e} label="R_EP" value="0.47 Ω"/>
 <S.Rail at={[235,30]} label="+15 V"/><S.Res a={[235,30]} b={[235,125]} label="bias feed" flipLabel/><S.Wire pts={[[235,125],qn.b]}/><S.Diode a={[235,125]} b={[235,220]} label="D_1" flipLabel/><S.Diode a={[235,220]} b={[235,315]} label="D_2" flipLabel/><S.Wire pts={[[235,315],qp.b]}/><S.Res a={[235,315]} b={[235,400]} label="bias feed" flipLabel/><S.Rail at={[235,400]} label="−15 V" down/><S.Terminal at={[75,220]} label="v_in" side="above"/><S.Wire pts={[[75,220],[235,220]]}/><S.Dot at={[235,220]}/><S.Text x={100} y={265} kind="value">V_bias ≈ 1.3 V</S.Text>
 </>:<><S.Wire pts={[qn.e,qp.e]}/><S.Wire pts={[qn.b,[295,125],[295,315],qp.b]}/><S.Dot at={[295,220]}/>
 {mode==='feedback'?(()=>{const at:S.Pt=[140,220],p=S.opAmpPins({at,plusTop:true});return <><S.OpAmp at={at} plusTop/><S.Wire pts={[p.out,[295,220]]}/><S.Terminal at={[60,205]} label="v_in" side="above"/><S.Wire pts={[[60,205],p.plus]}/><S.Wire pts={[p.minus,[100,235],[100,370],[480,370],[480,220]]}/><S.Dot at={[480,220]}/><S.Text x={150} y={270} kind="value">A = 200</S.Text></>})():<><S.Terminal at={[75,220]} label="v_in" side="above"/><S.Wire pts={[[75,220],[295,220]]}/></>}
 </>}
 <S.Wire pts={[out,[560,220]]}/><S.Dot at={out} color={S.green}/><S.Terminal at={[560,220]} label="v_out" side="above"/><S.Res a={[530,220]} b={[530,320]} label="R_L" value={rl+' Ω'}/><S.Ground at={[530,320]}/><S.Dot at={[530,220]}/>
 </S.Schematic>;
}
export function PairCircuit({type='darlington',load='12 Ω'}:{type?:'single'|'darlington'|'sziklai';load?:string}){
 const p2:S.Pt=[405,type==='darlington'?255:205],q2=S.bjtPins({at:p2,pnp:type==='sziklai'}),loadNode:S.Pt=[417,120];
 return <S.Schematic height={380} description={type+' compound switch: 12 volt supply through '+load+' load; externally supplied base current. '+(type==='sziklai'?'NPN driver collector drives PNP base; PNP emitter at load, collector grounded.':'NPN output emitter grounded.')}>
 <S.Rail at={[417,25]} label="+12 V"/><S.Res a={[417,25]} b={loadNode} label="load" value={load}/><S.Wire pts={[loadNode,type==='sziklai'?q2.e:q2.c]}/><S.Dot at={loadNode} color={S.green}/><S.Text x={440} y={130} kind="output">V_CE</S.Text><S.Bjt at={p2} pnp={type==='sziklai'}/><S.Wire pts={[type==='sziklai'?q2.c:q2.e,[417,335]]}/><S.Ground at={[417,335]}/>
 {type==='single'?<><S.Terminal at={[100,205]} label="I_B" side="above"/><S.Wire pts={[[100,205],q2.b]}/></>:(()=>{const p1:S.Pt=[265,type==='darlington'?185:260],q1=S.bjtPins({at:p1});return <><S.Bjt at={p1}/><S.Terminal at={[85,p1[1]]} label="I_B" side="above"/><S.Wire pts={[[85,p1[1]],q1.b]}/><S.Text x={220} y={p1[1]-35} kind="value">Q_1 · NPN</S.Text><S.Text x={445} y={p2[1]+5} kind="value">Q_2 · {type==='sziklai'?'PNP':'NPN'}</S.Text>
 {type==='darlington'?<><S.Wire pts={[q1.c,[277,120],loadNode]}/><S.Wire pts={[q1.e,[277,255],q2.b]}/></>:<><S.Wire pts={[q1.c,[277,205],q2.b]}/><S.Wire pts={[q1.e,[277,335],[417,335]]}/></>}
 </>})()}
 </S.Schematic>;
}
export function BootstrapCircuit({boot=true,r3='47 kΩ',cb='10 µF',rl='none'}:{boot?:boolean;r3?:string;cb?:string;rl?:string}){
 const at:S.Pt=[355,180],q=S.bjtPins({at}),m:S.Pt=[185,180],out:S.Pt=[367,245];
 return <S.Schematic height={415} description={'Divider biased follower on 15 volts. '+(boot?'Divider midpoint M feeds base through R3; capacitor from emitter to M bootstraps the bias network.':'Divider connects directly to base.')+' Emitter load '+rl+'.'}>
 <S.Rail at={[185,35]} label="+15 V"/><S.Res a={[185,35]} b={m} label="R_1" value="130 kΩ" flipLabel/><S.Res a={m} b={[185,355]} label="R_2" value="150 kΩ" flipLabel/><S.Ground at={[185,355]}/><S.Dot at={m}/><S.Bjt at={at}/><S.Rail at={[367,35]} label="+15 V"/><S.Wire pts={[[367,35],q.c]}/><S.Wire pts={[q.e,out]}/><S.Res a={out} b={[367,355]} label="R_E" value="7.5 kΩ"/><S.Ground at={[367,355]}/>
 {boot?<><S.Res a={m} b={q.b} label="R_3" value={r3}/><S.Wire pts={[m,[185,230],[285,230]]}/><S.Cap a={[285,230]} b={[285,315]} label="C_B" value={cb} flipLabel/><S.Wire pts={[[285,315],[335,315],[335,245],out]}/><S.Dot at={out}/><S.Text x={160} y={185} kind="value" anchor="end">M</S.Text></>:<S.Wire pts={[m,q.b]}/>}
 <S.Terminal at={[250,65]} label="v_in (AC)" side="left"/><S.Cap a={[250,65]} b={[310,65]} label="C_in"/><S.Wire pts={[[310,65],[310,180],q.b]}/><S.Dot at={[310,180]}/>
 <S.Wire pts={[out,[555,245]]}/><S.Dot at={out} color={S.green}/><S.Terminal at={[555,245]} label="v_out" side="above"/>{rl!=='none'&&<><S.Cap a={[485,245]} b={[485,290]} label="C_out"/><S.Res a={[485,290]} b={[485,375]} label="R_L" value={rl}/><S.Ground at={[485,375]}/><S.Dot at={[485,245]}/></>}
 </S.Schematic>;
}
export function SharingCircuit({re=0,vce=10,i1=1,i2=1,t1=25,t2=25}:{re?:number;vce?:number;i1?:number;i2?:number;t1?:number;t2?:number}){
 const a:S.Pt=[255,150],b:S.Pt=[435,150],q1=S.bjtPins({at:a}),q2=S.bjtPins({at:b});
 return <S.Schematic height={345} description={'Two NPN transistors share base and collector connections; '+(re?'individual '+re+' ohm emitter ballast resistors.':'directly joined emitters.')}>
 <S.Rail at={[267,45]} label={'V_CE ≈ '+vce.toFixed(0)+' V'}/><S.Wire pts={[[267,45],[447,45],q2.c]}/><S.Wire pts={[[267,45],q1.c]}/><S.Dot at={[267,45]}/><S.Bjt at={a}/><S.Bjt at={b}/><S.Terminal at={[75,150]} label="drive" side="above"/><S.Wire pts={[[75,150],q1.b]}/><S.Wire pts={[q1.b,[205,150],[205,95],[395,95],[395,150],q2.b]}/><S.Dot at={[205,150]}/>
 {re>0?<><S.Res a={q1.e} b={[267,280]} label="R_E1" value={re.toFixed(2)+' Ω'} flipLabel/><S.Res a={q2.e} b={[447,280]} label="R_E2" value={re.toFixed(2)+' Ω'}/></>:<><S.Wire pts={[q1.e,[267,280]]}/><S.Wire pts={[q2.e,[447,280]]}/></>}
 <S.Wire pts={[[267,280],[447,280]]}/><S.Ground at={[357,280]}/><S.Dot at={[357,280]}/><S.Text x={200} y={120} kind="output" anchor="end">{i1.toFixed(2)} A</S.Text><S.Text x={500} y={120} kind="output">{i2.toFixed(2)} A</S.Text><S.Text x={267} y={330} kind="value" anchor="middle">Q_1 · {t1.toFixed(0)} °C</S.Text><S.Text x={447} y={330} kind="value" anchor="middle">Q_2 · {t2.toFixed(0)} °C</S.Text>
 </S.Schematic>;
}
export function MillerCircuit({cascode=false,rs='1 kΩ',rc='10 kΩ',cmu='2 pF',cpi='13.4 pF'}:{cascode?:boolean;rs?:string;rc?:string;cmu?:string;cpi?:string}){
 const a:S.Pt=[390,cascode?285:200],q1=S.bjtPins({at:a}),p2:S.Pt=[390,190],q2=S.bjtPins({at:p2});const collector=cascode?q2.c:q1.c;
 return <S.Schematic height={425} description={(cascode?'Cascode':'Common-emitter')+' small-signal AC equivalent. Bias sources are zeroed. Source resistor drives base; C pi to ground and C mu to Q1 collector; output load to AC ground.'}>
 <S.Source kind="ac" a={[65,370]} b={[65,295]} label="v_s"/><S.Ground at={[65,370]}/><S.Wire pts={[[65,295],[65,a[1]],[115,a[1]]]}/><S.Res a={[115,a[1]]} b={[225,a[1]]} label="R_s" value={rs}/><S.Wire pts={[[225,a[1]],q1.b]}/><S.Bjt at={a}/><S.Wire pts={[q1.e,[402,370]]}/><S.Ground at={[402,370]}/>
 <S.Cap a={[275,a[1]]} b={[275,370]} label="C_π" value={cpi} flipLabel/><S.Ground at={[275,370]}/><S.Dot at={[275,a[1]]}/>
 {cascode&&<><S.Bjt at={p2}/><S.Wire pts={[q1.c,q2.e]}/><S.Wire pts={[q2.b,[340,190],[340,205]]}/><S.Ground at={[340,205]}/><S.Wire pts={[q2.e,[500,230]]}/><S.Cap a={[500,230]} b={[500,345]} label="C_π2" value={cpi}/><S.Ground at={[500,345]}/><S.Dot at={q2.e}/><S.Cap a={[550,150]} b={[550,225]} label="C_μ2" value={cmu}/><S.Ground at={[550,225]}/><S.Dot at={[550,150]}/></>}
 <S.Wire pts={[[325,a[1]],[325,cascode?240:120]]}/><S.Cap a={[325,cascode?240:120]} b={[402,cascode?240:120]} label="C_μ" value={cmu}/><S.Wire pts={[[402,cascode?240:120],q1.c]}/><S.Dot at={[325,a[1]]}/><S.Dot at={[402,cascode?240:120]}/>
 <S.Res a={[402,45]} b={[402,cascode?150:105]} label="R_C" value={rc}/><S.Ground at={[402,45]}/>{!cascode&&<S.Wire pts={[[402,105],collector]}/>}<S.Wire pts={[collector,[560,collector[1]]]}/><S.Dot at={collector} color={S.green}/><S.Terminal at={[560,collector[1]]} label="v_out" side="above"/><S.Text x={80} y={35} kind="value">AC equivalent · DC bias omitted</S.Text>
 </S.Schematic>;
}
