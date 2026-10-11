import * as S from './Schematic';
import type {Pt} from './Schematic';
import type {ReactNode} from 'react';
const W=({p}:{p:Pt[]})=><S.Wire pts={p}/>;
const T=({p,label}:{p:Pt;label:string})=><S.Terminal at={p} label={label} side={/out|OUT/.test(label)?'above':'left'}/>;
const N=({p,label,flip=false,kind='nmos',bulk=false}:{p:Pt;label:string;flip?:boolean;kind?:'nmos'|'pmos';bulk?:boolean})=><><S.Fet at={p} flip={flip} kind={kind} bodyExternal={bulk}/><S.Text x={p[0]+(flip?-25:25)} y={p[1]-15} anchor={flip?'end':'start'}>{label}</S.Text></>;
function Frame({children,caption,height=420}:{children:ReactNode;caption:string;height?:number}){return <S.Figure caption={caption}><S.Schematic className="wide-circuit advanced-circuit" width={720} height={height} description={caption}>{children}</S.Schematic></S.Figure>;}

export function MosStageFigure({mode='cs'}:{mode?:'bias'|'cs'|'diode'|'active'|'follower'|'current-follower'|'common-gate'|'cascode'|'noise'}){
 const q=S.fetPins({at:[330,220]}),upper=S.fetPins({at:[330,110]});
 const follower=mode==='follower'||mode==='current-follower',stack=mode==='diode'||mode==='active'||mode==='cascode';
 return <Frame caption={follower?'NMOS source follower. Drain is at the positive supply; the output is the source. The separate bulk terminal is held at ground.':'NMOS voltage stage. Follow the explicit input, bias and output nodes; supply and bias generators are ideal in this teaching schematic.'}>
 <N p={[330,220]} label="M_1" bulk={follower||mode==='bias'}/>
 {stack?<>
   {mode==='active'?<><N p={[330,110]} kind="pmos" label="M_P"/><S.Rail at={[344,45]} label="V_DD"/><W p={[[344,45],[344,70]]}/><T p={[200,110]} label="V_BP"/><W p={[[200,110],[300,110]]}/></>:<>
   <N p={[330,110]} label="M_2"/><S.Rail at={[344,45]} label="V_DD"/>
   {mode==='cascode'?<><S.CurrentSource a={[344,45]} b={upper.d} label="I_LOAD"/><T p={[200,110]} label="V_B"/><W p={[[200,110],upper.g]}/></>:<><W p={[[344,45],upper.d]}/><W p={[upper.g,[270,110],[270,60],[344,60]]}/><S.Dot at={[344,60]}/></>}
   </>}
   <W p={[[344,150],q.d]}/>
 </>:follower?<><S.Rail at={[344,65]} label="V_DD"/><W p={[[344,65],q.d]}/></>:<><S.Rail at={[344,45]} label="V_DD"/><S.Res a={[344,45]} b={q.d} label="R_D"/></>}
 {mode==='common-gate'?<><T p={[190,220]} label="V_B"/><W p={[[190,220],q.g]}/><T p={[190,320]} label="V_in"/><W p={[[190,320],[344,320],q.s]}/></>:<>
 {mode==='noise'?<><T p={[100,220]} label="V_sig"/><S.Res a={[100,220]} b={q.g} label="R_sig"/></>:<><T p={[190,220]} label="V_G + v_in"/><W p={[[190,220],q.g]}/></>}
 {follower?<><W p={[q.s,[344,290],[530,290]]}/><T p={[530,290]} label="V_out"/>
 <W p={[q.b,[580,220],[580,345]]}/><S.Ground at={[580,345]}/><S.Text x={600} y={343}>bulk</S.Text>
 {mode==='current-follower'?<><S.CurrentSource a={[344,290]} b={[344,365]} label="I_B"/><S.Ground at={[344,365]}/><S.Res a={[470,290]} b={[470,365]} label="R_L"/><W p={[[470,290],[344,290]]}/><S.Ground at={[470,365]}/></>:<><S.Res a={[344,290]} b={[344,365]} label="R_L"/><S.Ground at={[344,365]}/></>}
 </>:mode==='bias'?<><W p={[q.b,[580,220],[580,345]]}/><S.Ground at={[580,345]}/><S.Text x={600} y={343}>bulk</S.Text><S.Res a={q.s} b={[344,360]} label="R_S"/><S.Ground at={[344,360]}/></>:<><W p={[q.s,[344,360]]}/><S.Ground at={[344,360]}/></>}
 </>}
 {!follower&&<><W p={[[344,170],[530,170]]}/><S.Dot at={[344,170]}/><T p={[530,170]} label="V_out"/></>}
 </Frame>;
}

export function MosMirrorFigure({mode='simple'}:{mode?:'simple'|'ratio'|'degenerated'|'cascode'|'wide'}){
 const pmos=mode==='ratio',stack=mode==='cascode'||mode==='wide';
 const l=S.fetPins({at:[250,270],kind:pmos?'pmos':'nmos'}),r=S.fetPins({at:[470,270],kind:pmos?'pmos':'nmos'});
 return <Frame height={490} caption={pmos?'PMOS ratioed sourcing mirror. Both sources are at the positive rail; the reference sink fixes the shared gate voltage.':'NMOS current mirror. The reference branch establishes the shared gate bias; the output branch must retain the specified drain headroom.'}>
 <N p={[250,270]} label="M_1" kind={pmos?'pmos':'nmos'}/><N p={[470,270]} label={pmos?'M_2 × m':'M_2'} kind={pmos?'pmos':'nmos'}/>
 {pmos?<><W p={[l.g,[200,270],[200,350],[400,350],[400,270],r.g]}/><S.Dot at={[264,350]}/></>:<><W p={[l.g,[200,270],[200,220],[400,220],[400,270],r.g]}/><S.Dot at={[264,220]}/></>}
 {pmos?<><S.Rail at={[264,60]} label="V_DD"/><W p={[[264,60],l.s]}/><S.Rail at={[484,60]} label="V_DD"/><W p={[[484,60],r.s]}/>
 <W p={[l.d,[264,350],[200,350]]}/><S.CurrentSource a={[264,350]} b={[264,430]} label="I_REF"/><S.Ground at={[264,430]}/>
 <W p={[r.d,[484,360],[600,360]]}/><T p={[600,360]} label="I_OUT → load"/>
 </>:<>
 <W p={[l.d,[264,220]]}/>
 {stack?<>
 {mode==='cascode'&&<N p={[250,130]} label="M_3"/>}<N p={[470,130]} label="M_4"/>
 {mode==='cascode'&&<W p={[[264,170],[264,220]]}/>}<W p={[[484,170],r.d]}/>
 {mode==='cascode'?<><W p={[[220,130],[190,130],[190,75],[420,75],[420,130],[440,130]]}/><W p={[[264,90],[264,75]]}/><S.Dot at={[264,75]}/><S.Rail at={[264,25]} label="V_DD"/><S.CurrentSource a={[264,25]} b={[264,75]} label="I_REF"/></>:<>
 <T p={[365,130]} label="V_B"/><W p={[[365,130],[440,130]]}/>
 <S.Rail at={[264,25]} label="V_DD"/><S.CurrentSource a={[264,25]} b={[264,220]} label="I_REF"/>

 </>}
 <W p={[[484,90],[484,35],[635,35]]}/><T p={[635,35]} label="V_OUT"/>
 </>:<><S.Rail at={[264,60]} label="V_DD"/><S.CurrentSource a={[264,60]} b={[264,220]} label="I_REF"/><W p={[r.d,[484,180],[615,180]]}/><T p={[615,180]} label="V_OUT"/></>}
 {[l.s,r.s].map((s,i)=>mode==='degenerated'?<g key={i}><S.Res a={s} b={[s[0],425]} label="R_S"/><S.Ground at={[s[0],425]}/></g>:<g key={i}><W p={[s,[s[0],425]]}/><S.Ground at={[s[0],425]}/></g>)}
 </>}
 </Frame>;
}

export function MosDifferentialFigure({mode='resistor',technology='mos'}:{mode?:'resistor'|'tail'|'mirror'|'degenerated';technology?:'mos'|'bjt'}){
 const bjt=technology==='bjt',l=bjt?S.bjtPins({at:[235,230]}):S.fetPins({at:[235,230]}),r=bjt?S.bjtPins({at:[495,230],flip:true}):S.fetPins({at:[495,230],flip:true});
 const ld=bjt?(l as ReturnType<typeof S.bjtPins>).c:(l as ReturnType<typeof S.fetPins>).d,rd=bjt?(r as ReturnType<typeof S.bjtPins>).c:(r as ReturnType<typeof S.fetPins>).d;
 const ls=bjt?(l as ReturnType<typeof S.bjtPins>).e:(l as ReturnType<typeof S.fetPins>).s,rs=bjt?(r as ReturnType<typeof S.bjtPins>).e:(r as ReturnType<typeof S.fetPins>).s;
 const lg=bjt?(l as ReturnType<typeof S.bjtPins>).b:(l as ReturnType<typeof S.fetPins>).g,rg=bjt?(r as ReturnType<typeof S.bjtPins>).b:(r as ReturnType<typeof S.fetPins>).g;
 return <Frame height={490} caption={mode==='mirror'?'Differential input pair with a diode-connected left active load and a mirrored right active load. The right drain is the single-ended output.':'Differential input pair. The tail sets total current; branch loads turn unequal currents into output voltages. Separate input and tail compliance constraints apply.'}>
 {bjt?<><S.Bjt at={[235,230]}/><S.Bjt at={[495,230]} flip/><S.Text x={270} y={235}>Q_1</S.Text><S.Text x={435} y={235}>Q_2</S.Text></>:<><N p={[235,230]} label="M_1"/><N p={[495,230]} label="M_2" flip/></>}
 <T p={[100,230]} label="V_1"/><W p={[[100,230],lg]}/><T p={[630,230]} label="V_2"/><W p={[[630,230],rg]}/>
 {mode==='mirror'?<>
 {bjt?<><S.Bjt at={[235,95]} pnp/><S.Bjt at={[rd[0]-12,95]} pnp/></>:<><N p={[235,95]} kind="pmos" label="M_3"/><N p={[rd[0]-14,95]} kind="pmos" label="M_4"/></>}
 <S.Rail at={[ld[0],25]} label="V_DD"/><W p={[[ld[0],25],[ld[0],55]]}/><S.Rail at={[rd[0],25]} label="V_DD"/><W p={[[rd[0],25],[rd[0],55]]}/>
 <W p={[[ld[0],135],ld]}/><W p={[[rd[0],135],rd]}/>
 <W p={[[205,95],[170,95],[170,165],[365,165],[365,95],[rd[0]-(bjt?42:44),95]]}/><W p={[[ld[0],165],[365,165]]}/><S.Dot at={[ld[0],165]}/>
 </>:<><S.Rail at={[ld[0],45]} label="V_DD"/><S.Res a={[ld[0],45]} b={ld} label="R_D1"/><S.Rail at={[rd[0],45]} label="V_DD"/><S.Res a={[rd[0],45]} b={rd} label="R_D2"/></>}
 <W p={[[rd[0],180],[610,180]]}/><S.Dot at={[rd[0],180]}/><T p={[610,180]} label="V_out2"/>
 {mode!=='mirror'&&<><W p={[[ld[0],180],[120,180]]}/><S.Dot at={[ld[0],180]}/><T p={[120,180]} label="V_out1"/></>}
 {mode==='degenerated'?<><S.Res a={ls} b={[ls[0],345]} label="R_S1"/><S.Res a={rs} b={[rs[0],345]} label="R_S2"/><W p={[[ls[0],345],[365,345],[rs[0],345]]}/></>:<W p={[ls,[ls[0],320],[365,320],[rs[0],320],rs]}/>}
 {mode==='tail'?<><N p={[351,390]} label="M_T"/><W p={[[365,320],[365,350]]}/><T p={[235,390]} label="V_BT"/><W p={[[235,390],[321,390]]}/><S.Ground at={[365,430]}/></>:<><S.CurrentSource a={[365,mode==='degenerated'?345:320]} b={[365,425]} label="I_T"/><S.Ground at={[365,425]}/></>}
 </Frame>;
}

export function MosOutputFigure(){
 const n=S.fetPins({at:[330,145]}),p=S.fetPins({at:[330,355],kind:'pmos'});
 return <Frame height={480} caption="Complementary source followers. An external bias spreader supplies two gate commands; their difference sets the class-AB idle current. These gate drives are distinct nodes.">
 <N p={[330,145]} label="M_N"/><N p={[330,355]} kind="pmos" label="M_P"/>
 <S.Rail at={[344,55]} label="+V_S"/><W p={[[344,55],n.d]}/><S.Rail at={[344,440]} label="−V_S" down/><W p={[p.d,[344,440]]}/>
 <T p={[120,145]} label="V_in + V_B/2"/><W p={[[120,145],n.g]}/><T p={[120,355]} label="V_in − V_B/2"/><W p={[[120,355],p.g]}/>
 <W p={[n.s,[344,250],p.s]}/><S.Dot at={[344,250]}/><W p={[[344,250],[570,250]]}/><T p={[570,250]} label="V_OUT"/>
 <S.Res a={[485,250]} b={[485,410]} label="R_L"/><S.Ground at={[485,410]}/>
 </Frame>;
}
