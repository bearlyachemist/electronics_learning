// Figures added while distilling the reference textbooks into Chapters 1–56. Values and drawings are original.
import Plot from './Plot';
import * as S from './Schematic';
import type {Pt} from './Schematic';
const xs=(a:number,b:number,n=200)=>Array.from({length:n+1},(_,i)=>a+(b-a)*i/n);

/* ---------- Chapter 1: real dividers ---------- */
const ntc=(T:number)=>1e4*Math.exp(3950*(1/(T+273.15)-1/298.15));
export function ThermistorDividerFigure(){
 const T=xs(0,80,240),cases:[number,string,string][]=[[1e4,'R = 10 kΩ (matches 25 °C)',S.gray],[5360,'R = 5.36 kΩ (matches 39.7 °C)',S.green],[2000,'R = 2 kΩ (matches 66 °C)',S.orange]];
 return <S.Figure plot caption="Output of a divider made from a fixed resistor $R$ (top) and a 10 kΩ NTC thermistor (bottom, $B$ = 3950 K) on 5 V. The thermistor's resistance falls about 4%/°C, so the output falls as the temperature rises. Matching $R$ to the thermistor near the target temperature gives a useful local sensitivity of about −50 mV/°C around 40 °C. The 5.36 kΩ standard value crosses 2.50 V at 39.73 °C.">
 <Plot curves={cases.map(([R,name,color])=>({name,color,points:T.map(t=>[t,5*ntc(t)/(R+ntc(t))] as [number,number])}))} marks={[{at:[39.7276,2.5],label:'2.50 V at 39.73 °C',pos:'ne'}]}
  xRange={[0,80]} yRange={[0,5]} xLabel="TEMPERATURE / °C" yLabel="DIVIDER OUTPUT / V" description="Three falling S-shaped curves of divider output against temperature; each has a sensitive region near resistance matching."/></S.Figure>;
}
export function ThermistorAlarmCircuit(){
 const at:Pt=[430,180],p=S.opAmpPins({at});
 return <S.Figure caption="An over-temperature indicator built from two dividers and a comparator. The left divider (two 10 kΩ resistors) makes a fixed 2.5 V reference. The right divider puts the thermistor under a 5.36 kΩ resistor, so its output passes 2.5 V at about 39.73 °C. Above that temperature the sensing voltage falls below the reference, the comparator's output goes low and the LED lights through 680 Ω. Because both dividers use the same 5 V, the trip point does not depend on the supply voltage: the comparison is ratiometric.">
 <S.Schematic width={720} height={360} description="Reference divider of two ten kilohm resistors and sensing divider of a 5.36 kilohm resistor over an NTC thermistor, both from five volts, feeding a comparator whose output sinks current through an LED and a 680 ohm resistor.">
  <S.Rail at={[120,30]} label="+5 V"/><S.Wire pts={[[120,50],[560,50]]}/><S.Wire pts={[[120,30],[120,50]]}/><S.Dot at={[120,50]}/>
  <S.Res a={[120,50]} b={[120,165]} label="10 kΩ" flipLabel/><S.Res a={[120,165]} b={[120,300]} label="10 kΩ" flipLabel/><S.Ground at={[120,300]}/><S.Dot at={[120,165]}/>
  <S.Wire pts={[[120,165],p.minus]}/><S.Text x={150} y={155} kind="value">2.50 V ref</S.Text>
  <S.Res a={[280,50]} b={[280,195]} label="5.36 kΩ"/><S.Res a={[280,195]} b={[280,300]} label="NTC" value="10 kΩ at 25 °C"/><S.Ground at={[280,300]}/><S.Dot at={[280,50]}/>
  <S.Wire pts={[[280,195],p.plus]}/><S.Dot at={[280,195]}/>
  <S.OpAmp at={at}/><S.Text x={440} y={240} kind="value">comparator</S.Text>
  <S.Wire pts={[p.out,[560,180]]}/><S.Res a={[560,180]} b={[560,110]} label="680 Ω"/><S.Diode kind="led" a={[560,50]} b={[560,110]} label="LED"/><S.Dot at={[560,50]}/>
 </S.Schematic></S.Figure>;
}
export function LoadedPotFigure(){
 const a=xs(0,1,200),ks:[number,string,string][]=[[Infinity,'No load',S.gray],[10,'R_L = 10 R_pot',S.green],[1,'R_L = R_pot',S.ink],[.1,'R_L = 0.1 R_pot',S.orange]];
 const f=(x:number,k:number)=>{if(!Number.isFinite(k))return x;const lo=x===0?0:1/(1/x+1/k);return lo/((1-x)+lo);};
 return <S.Figure plot caption="A potentiometer is an adjustable divider, but its output is linear in shaft position only when unloaded. With a load equal to the pot's resistance the midpoint gives 0.33 instead of 0.5; with a load a tenth of it, the control is nearly dead for most of its travel. Load a pot with at least ten times its resistance, or buffer the wiper.">
 <Plot curves={ks.map(([k,name,color])=>({name,color,points:a.map(x=>[x,f(x,k)] as [number,number])}))} xRange={[0,1]} yRange={[0,1]} xLabel="WIPER POSITION (FRACTION OF TRAVEL)" yLabel="V_out / V_in" description="Pot output against wiper position: a straight line unloaded, sagging curves for heavier loads."/></S.Figure>;
}
