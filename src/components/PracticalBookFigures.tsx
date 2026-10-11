import Plot from './Plot';
import * as S from './Schematic';
import type {Pt} from './Schematic';
import {squareSeries,allPass,stateVariable,railGmSplit} from '../engine/practical.mjs';
import {mag} from '../engine/ac.mjs';
const xs=(a:number,b:number,n=320)=>Array.from({length:n+1},(_,i)=>a+(b-a)*i/n);
const logs=(a:number,b:number)=>xs(Math.log10(a),Math.log10(b)).map(x=>10**x);
export function FourierExtensionFigure(){
 const t=xs(0,1,800);
 return <S.Figure plot caption="Original Fourier reconstruction of a unit-peak square wave. The fundamental alone reaches 4/π. Adding odd harmonics builds edges and cancels much of that peak; overshoot near a discontinuity remains as its width narrows.">
 <Plot curves={[1,3,15].map((terms,i)=>({name:`${terms} odd harmonic${terms>1?'s':''}`,color:[S.gray,S.orange,S.green][i],points:t.map(x=>[x,squareSeries(x,terms)] as [number,number])}))} xRange={[0,1]} yRange={[-1.4,1.4]} xLabel="TIME / CYCLES" yLabel="VOLTAGE / V_peak" description="One, three and fifteen odd harmonics approximate a square wave, with sharper edges and persistent localized overshoot as the term count increases."/>
 </S.Figure>;
}
export function AllPassExtensionFigure(){
 const f=logs(.01,100);
 return <S.Figure plot caption="A first-order all-pass keeps unity magnitude while its phase moves from 0° toward −180°. At the normalized corner it contributes −90°. Equal magnitude does not imply equal arrival time.">
 <Plot curves={[{name:'All-pass phase',color:S.green,points:f.map(x=>[x,allPass(x).phase] as [number,number])}]} xRange={[.01,100]} yRange={[-180,0]} xScale="log" xLabel="FREQUENCY / f_corner" yLabel="PHASE / DEGREES" marks={[{at:[1,-90],label:'−90° at the corner'}]} description="All-pass phase versus normalized log frequency, passing minus ninety degrees at the corner and approaching minus one hundred eighty degrees at high frequency."/>
 </S.Figure>;
}
export function RailGmExtensionFigure(){
 const x=xs(0,1);
 return <S.Figure plot caption="Strong-inversion square-law illustration with matched effective device factors and a fixed sum of tail currents. The summed transconductance rises 41.4% when current is shared equally between complementary pairs.">
 <Plot curves={[{name:'Summed g_m / edge g_m',color:S.green,points:x.map(t=>[t,railGmSplit(t)] as [number,number])}]} xRange={[0,1]} yRange={[.95,1.5]} xLabel="FRACTION OF TOTAL TAIL CURRENT / x" yLabel="NORMALIZED TRANSCONDUCTANCE" marks={[{at:[.5,Math.SQRT2],label:'√2 = 1.414'}]} description="Normalized transconductance hill from one at either current-sharing extreme to square root of two at equal sharing."/>
 </S.Figure>;
}
export function StateVariableExtensionFigure(){
 const f=logs(.1,10),q=2;
 return <S.Figure plot caption="Normalized state-variable responses at Q = 2. LP, BP and HP share one denominator. The notch is the phasor sum of HP and LP, so the individual states can remain large even where their sum is zero.">
 <Plot curves={(['lp','bp','hp','notch'] as const).map((key,i)=>({name:['Low-pass','Band-pass','High-pass','Notch'][i],color:[S.gray,S.green,S.orange,S.ink][i],dashed:key==='notch',points:f.map(x=>[x,mag(stateVariable(x,q)[key])] as [number,number])}))} xRange={[.1,10]} yRange={[0,2.3]} xScale="log" xLabel="FREQUENCY / f_0" yLabel="MAGNITUDE / V per V" description="Four filter magnitudes versus normalized frequency: low-pass, band-pass, high-pass and a notch formed by cancellation at the center frequency."/>
 </S.Figure>;
}
export function CapacitanceMultiplierFigure(){
 const at:Pt=[365,155],p=S.bjtPins({at});
 return <S.Figure caption="A supply-ripple filter using an NPN emitter follower. The collector takes load current directly from V_IN, while R and C filter the base voltage. Base-current drop and V_BE cost headroom, and there is no output-reference loop to regulate slow changes.">
 <S.Schematic width={700} height={320} className="advanced-circuit" description="Input supply directly feeds an NPN collector and, through a one-kilohm resistor, its base. A one-hundred-microfarad capacitor filters the base to ground. The emitter feeds a load resistor to ground and the output terminal.">
 <S.Terminal at={[70,60]} label="V_IN"/><S.Wire pts={[[70,60],[377,60],p.c]}/><S.Dot at={[145,60]}/>
 <S.Wire pts={[[145,60],[145,155]]}/><S.Res a={[145,155]} b={[270,155]} label="R" value="1 kΩ"/>
 <S.Wire pts={[[270,155],p.b]}/><S.Dot at={[285,155]}/><S.Cap a={[285,270]} b={[285,155]} label="C" value="100 µF" polar/><S.Ground at={[285,270]}/>
 <S.Bjt at={at}/><S.Text x={405} y={152}>Q1</S.Text><S.Wire pts={[p.e,[377,205],[580,205]]}/><S.Dot at={[500,205]}/>
 <S.Terminal at={[580,205]} label="V_OUT" side="right"/><S.Res a={[500,205]} b={[500,270]} label="load"/><S.Ground at={[500,270]}/>
 </S.Schematic></S.Figure>;
}
export function FoldedCurrentFigure(){
 const at:Pt=[410,150],p=S.fetPins({at,kind:'pmos'});
 return <S.Figure caption="One simplified current-folding half-path. At X, bias current divides between the input-stage drain current and a PMOS common-gate path. A fixed sink at the output subtracts its quiescent current; the remaining signal current charges or discharges C_L. This is not a complete differential amplifier.">
 <S.Schematic width={720} height={410} className="advanced-circuit" description="A bias current source from the positive rail supplies node X. A controlled input-stage current sinks from X to ground. The remaining current enters the source of a biased PMOS common-gate transistor and flows to an output node with a load current sink and capacitor to ground.">
 <S.Rail at={[424,25]} label="V_DD"/><S.CurrentSource a={[424,25]} b={[424,85]} label="I_B"/><S.Dot at={[424,85]}/><S.Wire pts={[[424,85],p.s]}/>
 <S.Wire pts={[[424,85],[215,85]]}/><S.DepSource a={[215,85]} b={[215,360]} label="I_IN"/><S.Ground at={[215,360]}/><S.Text x={165} y={55} kind="value">input-stage current</S.Text>
 <S.Fet at={at} kind="pmos"/><S.Text x={456} y={150}>M_F</S.Text><S.Terminal at={[340,150]} label="V_B"/><S.Wire pts={[[340,150],p.g]}/>
 <S.Text x={445} y={105}>X</S.Text><S.Wire pts={[p.d,[424,245],[635,245]]}/><S.Dot at={[424,245]}/><S.Dot at={[540,245]}/>
 <S.Terminal at={[635,245]} label="V_O" side="right"/>
 <S.CurrentSource a={[424,245]} b={[424,360]} label="I_L" flipLabel/><S.Ground at={[424,360]}/><S.Cap a={[540,245]} b={[540,360]} label="C_L"/><S.Ground at={[540,360]}/>
 <S.CurrentArrow at={[424,212]} dir="down" label="I_F" side={-1}/><S.Text x={55} y={390} kind="value">I_F = I_B − I_IN; net output current = I_F − I_L</S.Text>
 </S.Schematic></S.Figure>;
}
