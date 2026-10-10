import * as S from './Schematic';
import {Wires as LegacyWires} from './Parts';
export function FetCircuit({mode='source',mos=false,rd='1 kΩ',rs='500 Ω',supply='12 V'}:{mode?:'source'|'follower'|'switch';mos?:boolean;rd?:string;rs?:string;supply?:string}){
 const sw=mode==='switch',fol=mode==='follower',at:S.Pt=[335,175],q=S.fetPins({at,kind:mos||sw?'nmos':'njfet'}),d:S.Pt=[349,110],e:S.Pt=[349,250];
 return <S.Schematic height={420} description={sw?'N-channel low-side switch: load to 24 volts, series gate resistor, gate pull-down and flyback diode cathode at positive rail.':mos?'Divider-biased MOS common source, gate divider 200 and 100 kilohms; input and load AC coupled.':fol?'JFET source follower with externally established gate bias, source resistance and source output.':'Self-biased JFET: 1 megohm gate return to ground, source resistor and drain load.'}>
 <S.Fet at={at} kind={mos||sw?'nmos':'njfet'}/><S.Rail at={[349,30]} label={sw?'+24 V':supply}/>
 {fol?<S.Wire pts={[[349,30],q.d]}/>:<>{sw?<S.Ind a={[349,30]} b={d} label="L_load"/>:<S.Res a={[349,30]} b={d} label="R_D" value={mos?'2.2 kΩ':rd}/>}<S.Wire pts={[d,q.d]}/></>}
 {sw?<><S.Wire pts={[q.s,[349,345]]}/><S.Ground at={[349,345]}/><S.Terminal at={[45,175]} label="driver" side="above"/><S.Res a={[45,175]} b={[205,175]} label="R_G"/><S.Wire pts={[[205,175],q.g]}/><S.Res a={[225,175]} b={[225,345]} label="R_GS" flipLabel/><S.Ground at={[225,345]}/><S.Dot at={[225,175]}/><S.Wire pts={[[349,30],[480,30]]}/><S.Diode a={[480,110]} b={[480,30]} label="flyback"/><S.Wire pts={[[480,110],d]}/><S.Dot at={d}/><S.Dot at={[349,30]}/><S.Text x={70} y={390} kind="value">Inductive load: external diode anode at drain, cathode at rail</S.Text></>:
 <><S.Wire pts={[q.s,e]}/><S.Res a={e} b={[349,345]} label="R_S" value={fol?'2 kΩ':rs}/><S.Ground at={[349,345]}/>
 {fol?<><S.Terminal at={[100,175]} label="gate bias + signal" side="above"/><S.Wire pts={[[100,175],q.g]}/></>:<>
 {mos?<><S.Rail at={[205,30]} label="12 V"/><S.Res a={[205,30]} b={[205,175]} label="R_1" value="200 kΩ" flipLabel/><S.Res a={[205,175]} b={[205,345]} label="R_2" value="100 kΩ" flipLabel/></>:<S.Res a={[205,175]} b={[205,345]} label="R_G" value="1 MΩ" flipLabel/>}
 <S.Ground at={[205,345]}/><S.Wire pts={[[205,175],q.g]}/><S.Dot at={[205,175]}/><S.Terminal at={[85,175]} label="v_in (AC)" side="left"/><S.Cap a={[85,175]} b={[205,175]} label="C_in"/>
 </>}
 </>}
 {!sw&&<><S.Wire pts={[fol?e:d,[565,fol?250:110]]}/><S.Dot at={fol?e:d} color={S.green}/><S.Terminal at={[565,fol?250:110]} label="v_out" side="above"/>{mos&&<><S.Cap a={[480,110]} b={[480,210]} label="C_out"/><S.Res a={[480,210]} b={[480,345]} label="R_L" value="10 kΩ"/><S.Ground at={[480,345]}/><S.Dot at={[480,110]}/></>}</>}
 </S.Schematic>;
}
export function FetGainCircuit({rs='470 Ω',rd='4.7 kΩ'}:{rs?:string;rd?:string}){return <S.Schematic height={355} description="Low-frequency common-source small-signal model: gate voltage controls drain-to-source current; drain resistor and 10 kilohm load to AC ground; source degeneration; zero ideal gate current.">
 <S.Terminal at={[65,110]} label="v_g" side="above"/><S.Wire pts={[[65,110],[195,110]]}/><S.Terminal at={[195,110]} label="ideal gate" side="right"/><S.DepSource a={[365,110]} b={[365,235]} label="g_m(v_g − v_s)" flipLabel/><S.Res a={[365,235]} b={[365,315]} label="R_S" value={rs}/><S.Ground at={[365,315]}/><S.Res a={[365,110]} b={[365,30]} label="R_D" value={rd}/><S.Ground at={[365,30]}/><S.Res a={[525,110]} b={[525,235]} label="R_L" value="10 kΩ"/><S.Ground at={[525,235]}/><S.Wire pts={[[365,110],[575,110]]}/><S.Dot at={[365,110]}/><S.Dot at={[525,110]}/><S.Terminal at={[575,110]} label="v_out" side="above"/>
 </S.Schematic>}
export function FetStructure(){
 return <svg className="wide-circuit" viewBox="0 0 620 270" role="img" aria-label="Conceptual sections: reverse-biased JFET junction narrows an existing channel; MOS gate creates an inversion channel through oxide">
 <rect x="35" y="70" width="240" height="130" rx="8" fill="var(--line)"/><rect x="35" y="114" width="240" height="42" fill="var(--accent)" opacity=".3"/>
 <rect x="90" y="70" width="130" height="28" fill="var(--orange)" opacity=".5"/><rect x="90" y="172" width="130" height="28" fill="var(--orange)" opacity=".5"/>
 <S.Text x={150} y={46} anchor="middle">JFET: existing n channel</S.Text><S.Text x={45} y={140}>S</S.Text><S.Text x={248} y={140}>D</S.Text><S.Text x={155} y={89} anchor="middle">p gate</S.Text>
 <LegacyWires d="M155 55 V70"/><S.Text x={155} y={231} anchor="middle" kind="value">Reverse bias widens depletion</S.Text>
 <rect x="340" y="110" width="240" height="90" rx="8" fill="var(--line)"/><rect x="350" y="110" width="40" height="28" fill="var(--accent)" opacity=".4"/><rect x="530" y="110" width="40" height="28" fill="var(--accent)" opacity=".4"/>
 <rect x="395" y="94" width="130" height="8" fill="var(--orange)" opacity=".4"/><LegacyWires d="M395 88 H525 M460 55 V88 M390 113 H530" dashed/>
 <S.Text x={460} y={46} anchor="middle">MOSFET: insulated gate</S.Text><S.Text x={370} y={132} anchor="middle">S</S.Text><S.Text x={550} y={132} anchor="middle">D</S.Text><S.Text x={460} y={174} anchor="middle">p body</S.Text><S.Text x={460} y={231} anchor="middle" kind="value">Positive gate forms an n channel</S.Text>
 </svg>;
}

export function BackToBack(){
 const a:S.Pt=[180,124],b:S.Pt=[440,124],q1=S.fetPins({at:a,rotate:-90}),q2=S.fetPins({at:b,rotate:-90,vflip:true});
 return <S.Schematic height={300} description="Two n-channel MOSFETs with joined sources and gates; drains at A and B. Intrinsic body diodes point from common sources toward opposite drain ports. Gate drive is referenced to common source.">
 <S.Fet at={a} rotate={-90}/><S.Fet at={b} rotate={-90} vflip/><S.Terminal at={[55,110]} label="A" side="above"/><S.Terminal at={[565,110]} label="B" side="above"/><S.Wire pts={[[55,110],q1.d]}/><S.Wire pts={[q1.s,q2.s]}/><S.Wire pts={[q2.d,[565,110]]}/><S.Dot at={[310,110]}/>{[q1.d,q1.s,q2.d,q2.s].map((p,i)=><S.Dot key={i} at={p}/>)}<S.Text x={310} y={98} anchor="middle" kind="value">common S</S.Text><S.Wire pts={[q1.g,[180,215],[440,215],q2.g]}/><S.Terminal at={[310,250]} label="gate drive relative to S" side="below"/><S.Wire pts={[[310,250],[310,215]]}/><S.Dot at={[310,215]}/>
 <S.Wire pts={[q1.d,[140,45]]}/><S.Wire pts={[q1.s,[220,45]]}/><S.Diode a={[220,45]} b={[140,45]} label="body"/><S.Wire pts={[q2.s,[400,45]]}/><S.Wire pts={[q2.d,[480,45]]}/><S.Diode a={[400,45]} b={[480,45]} label="body"/>
 </S.Schematic>;
}
