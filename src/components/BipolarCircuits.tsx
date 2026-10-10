import * as S from './Schematic';
export function FollowerCircuit({re='1 kΩ',rl='1 kΩ',noLoad=false}:{re?:string;rl?:string;noLoad?:boolean}){
 const at:S.Pt=[340,145],q=S.bjtPins({at});
 return <S.Schematic height={325} description={'NPN follower: input through 10 kilohms to base, collector at +10 volts, emitter resistor '+re+' to −10 volts'+(noLoad?', unloaded.':', with '+rl+' load to ground.')}>
 <S.Source kind="ac" a={[70,260]} b={[70,180]} label="V_in"/><S.Ground at={[70,260]}/><S.Wire pts={[[70,180],[70,145],[135,145]]}/><S.Res a={[135,145]} b={[245,145]} label="R_s" value="10 kΩ"/><S.Wire pts={[[245,145],q.b]}/>
 <S.Bjt at={at}/><S.Rail at={[352,40]} label="+10 V"/><S.Wire pts={[[352,40],q.c]}/><S.Wire pts={[q.e,[352,205]]}/><S.Res a={[352,205]} b={[352,285]} label="R_E" value={re} flipLabel/><S.Rail at={[352,285]} label="−10 V" down/>
 <S.Wire pts={[[352,195],[525,195]]}/><S.Dot at={[352,195]} color={S.green}/><S.Terminal at={[525,195]} label="V_out" side="above"/>
 {!noLoad&&<><S.Res a={[485,195]} b={[485,285]} label="R_L" value={rl}/><S.Ground at={[485,285]}/><S.Dot at={[485,195]}/></>}
 </S.Schematic>;
}
export function BipolarStage({labels={rc:'7.5 kΩ',re:'1 kΩ',r1:'82 kΩ',r2:'10 kΩ'},coupling=false,bypass=false,splitter=false,rlc='1 MΩ',rle='1 MΩ'}:{labels?:{r1?:string;r2?:string;rc:string;re:string};coupling?:boolean;bypass?:boolean;splitter?:boolean;rlc?:string;rle?:string}){
 const at:S.Pt=[350,200],q=S.bjtPins({at}),base:S.Pt=[205,200],c:S.Pt=[362,135],e:S.Pt=[362,255];
 return <S.Schematic height={420} description={splitter?'Phase splitter, stiff base bias 5 volts; collector resistor to +15 volts, emitter resistor to ground; separate AC-coupled collector and emitter loads.':'Divider-biased common-emitter stage, collector resistor to +15 volts, emitter resistor to ground'+(coupling?', input and output coupling capacitors':'')+(bypass?', capacitor bypasses emitter resistor.':'.')}>
 <S.Rail at={[362,35]} label="+15 V"/><S.Res a={[362,35]} b={c} label="R_C" value={labels.rc} flipLabel/><S.Wire pts={[c,q.c]}/><S.Bjt at={at}/><S.Wire pts={[q.e,e]}/><S.Res a={e} b={[362,370]} label="R_E" value={labels.re} flipLabel/><S.Ground at={[362,370]}/>
 {splitter?<><S.Source a={[110,335]} b={[110,255]} label="bias + signal" value="5 V DC"/><S.Ground at={[110,335]}/><S.Wire pts={[[110,255],[110,200],q.b]}/>
 <S.Cap a={c} b={[470,135]} label="C_C"/><S.Res a={[470,135]} b={[470,230]} label="R_LC" value={rlc}/><S.Ground at={[470,230]}/><S.Dot at={c} color={S.orange}/><S.Text x={488} y={120} kind="output">V_C</S.Text>
 <S.Cap a={e} b={[545,255]} label="C_E"/><S.Res a={[545,255]} b={[545,370]} label="R_LE" value={rle}/><S.Ground at={[545,370]}/><S.Dot at={e} color={S.green}/><S.Text x={560} y={250} kind="output">V_E</S.Text></>
 :<><S.Rail at={[205,35]} label="+15 V"/><S.Res a={[205,35]} b={[205,135]} label="R_1" value={labels.r1} flipLabel/><S.Wire pts={[[205,135],base,q.b]}/><S.Res a={base} b={[205,370]} label="R_2" value={labels.r2} flipLabel/><S.Ground at={[205,370]}/><S.Dot at={base}/>
 {coupling&&<><S.Terminal at={[40,200]} label="V_in" side="above"/><S.Cap a={[40,200]} b={base} label="C_in"/><S.Cap a={c} b={[550,135]} label="C_out"/><S.Terminal at={[550,135]} label="V_out" side="above"/><S.Dot at={c} color={S.green}/></>}
 {bypass&&<><S.Wire pts={[e,[465,255]]}/><S.Cap a={[465,255]} b={[465,370]} label="C_bypass"/><S.Ground at={[465,370]}/><S.Dot at={e}/></>}
 </>}
 </S.Schematic>;
}
export function CurrentSinkCircuit({vb='2 V',re='1 kΩ',load='10 kΩ'}:{vb?:string;re?:string;load?:string}){
 const at:S.Pt=[335,185],q=S.bjtPins({at});
 return <S.Schematic height={350} description={'NPN current sink: load '+load+' from +15 volts to collector; base driven by '+vb+' reference; emitter through '+re+' to ground.'}>
 <S.Source a={[150,300]} b={[150,220]} label="V_B" value={vb}/><S.Ground at={[150,300]}/><S.Wire pts={[[150,220],[150,185],q.b]}/><S.Bjt at={at}/><S.Rail at={[347,30]} label="+15 V"/><S.Res a={[347,30]} b={q.c} label="load" value={load}/><S.Res a={q.e} b={[347,310]} label="R_E" value={re}/><S.Ground at={[347,310]}/><S.CurrentArrow at={[347,125]} dir="down" label="I_out" side={-1}/>
 </S.Schematic>;
}
export function SimpleMirrorCircuit({caption=false}:{caption?:boolean}){
 const a:S.Pt=[220,180],b:S.Pt=[430,180],q1=S.bjtPins({at:a,flip:true}),q2=S.bjtPins({at:b});
 const drawing=<S.Schematic height={325} description="NPN mirror: reference resistor from +15 volts to diode-connected Q1; joined bases; grounded emitters; output at Q2 collector.">
 <S.Rail at={[208,25]} label="+15 V"/><S.Res a={[208,25]} b={[208,110]} label="R_ref" value="14.3 kΩ" flipLabel/><S.Wire pts={[[208,110],q1.c]}/><S.Bjt at={a} flip/><S.Bjt at={b}/><S.Wire pts={[q1.b,q2.b]}/><S.Wire pts={[[208,125],[320,125],[320,180]]}/><S.Dot at={[208,125]}/><S.Dot at={[320,180]}/><S.Ground at={q1.e}/><S.Ground at={q2.e}/><S.Wire pts={[q2.c,[442,55]]}/><S.Terminal at={[442,55]} label="I_out" side="above"/><S.Text x={180} y={275} kind="value">Q_1 · diode-connected</S.Text><S.Text x={395} y={275} kind="value">Q_2 · output</S.Text>
 </S.Schematic>;
 return caption?<S.Figure caption="Matched transistors share a base voltage. The reference must supply the first collector plus both base currents; the output collector needs enough voltage to keep its transistor active.">{drawing}</S.Figure>:drawing;
}
export function HybridPiCircuit(){
 return <S.Schematic height={300} description="Hybrid pi transistor: base-emitter r pi; controlled collector-emitter current source gm vbe; output resistance ro in parallel.">
 <S.Terminal at={[60,60]} label="B" side="above"/><S.Wire pts={[[60,60],[180,60]]}/><S.Res a={[180,60]} b={[180,235]} label="r_π" flipLabel/><S.Wire pts={[[60,235],[525,235]]}/><S.Terminal at={[60,235]} label="E" side="below"/>
 <S.Terminal at={[555,60]} label="C" side="above"/><S.Wire pts={[[355,60],[555,60]]}/><S.DepSource a={[355,60]} b={[355,235]} label="g_m v_be"/><S.Res a={[525,60]} b={[525,235]} label="r_o"/>
 <S.Dot at={[525,60]}/><S.Dot at={[355,235]}/><S.Dot at={[525,235]}/><S.Dot at={[180,235]}/><S.Text x={95} y={150} kind="output">v_be</S.Text>
 </S.Schematic>;
}
export function FollowerRegulatorCircuit(){
 const at:S.Pt=[350,160],q=S.bjtPins({at});
 return <S.Schematic height={350} description="Input supply to NPN collector; resistor feeds a zener reference and the transistor base; emitter supplies a grounded load.">
 <S.Rail at={[362,35]} label="V_in"/><S.Wire pts={[[362,35],q.c]}/><S.Wire pts={[[362,60],[180,60]]}/><S.Dot at={[362,60]}/><S.Res a={[180,60]} b={[180,160]} label="R_Z" flipLabel/>
 <S.Wire pts={[[180,160],q.b]}/><S.Diode kind="zener" a={[180,300]} b={[180,160]} label="V_Z" flipLabel/><S.Ground at={[180,300]}/><S.Dot at={[180,160]}/><S.Bjt at={at}/><S.Wire pts={[q.e,[362,225],[530,225]]}/><S.Res a={[362,225]} b={[362,310]} label="load"/><S.Ground at={[362,310]}/><S.Dot at={[362,225]} color={S.green}/><S.Terminal at={[530,225]} label="V_out" side="above"/>
 </S.Schematic>;
}
