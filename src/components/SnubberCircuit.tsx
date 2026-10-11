import * as S from './Schematic';
export function SnubberCircuit(){
 const description='An edge drives parasitic series inductance into node capacitance; a series resistor and snubber capacitor form a separate shunt branch to the same return. This is a local ringing equivalent, not the complete power converter.';
 return <S.Figure caption={description}><S.Schematic width={640} height={290} description={description}>
 <S.Terminal at={[80,70]} label="Edge" side="above"/>
 <S.Ind a={[80,70]} b={[300,70]} label="L_p"/>
 <S.Wire pts={[[300,70],[520,70]]}/>
 <S.Cap a={[300,70]} b={[300,240]} label="C_p"/>
 <S.Res a={[520,70]} b={[520,155]} label="R_s"/>
 <S.Cap a={[520,155]} b={[520,240]} label="C_s"/>
 <S.Wire pts={[[80,240],[300,240],[520,240]]}/>
 <S.Terminal at={[80,240]} label="Return"/>
 <S.Ground at={[300,240]}/><S.Dot at={[300,70]}/><S.Dot at={[300,240]}/>
 <S.Text x={520} y={40} anchor="middle" kind="value">RC snubber</S.Text>
 </S.Schematic></S.Figure>;
}
