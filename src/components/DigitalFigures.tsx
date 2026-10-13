// Timing diagrams, waveforms and channel figures for the digital-interface chapters (Part VII).
// The Timing component draws named lanes from compact strings; all values are original teaching examples.
import Plot from './Plot';
import {Figure} from './Schematic';
import {svgMath} from './MathText';
const green='var(--accent)',orange='var(--orange)',ink='var(--ink)',muted='var(--muted)';
const lin=(fn:(x:number)=>number,lo:number,hi:number,n=401):[number,number][]=>Array.from({length:n},(_,i)=>{const x=lo+(hi-lo)*i/(n-1);return [x,fn(x)];});

/* ---------- Generic timing diagram ---------- */
// wave: one character per slot. '1' high, '0' low, 'z' mid level (released / zero of a three-level code), '.' repeat.
type Seg={from:number;to:number;label:string;tone?:'a'|'b'|'c'};
type Lane={name:string;wave?:string;bus?:Seg[];color?:string};
type Marker={t:number;label?:string;color?:string;dashed?:boolean};
type Note={t:number;lane:number;text:string;color?:string};
type Arrow={t:number;lane:number};
export function Timing({lanes,slots,markers=[],notes=[],arrows=[],caption,label,nameWidth=110}:{lanes:Lane[];slots:number;markers?:Marker[];notes?:Note[];arrows?:Arrow[];caption:string;label:string;nameWidth?:number}){
  const W=700,x0=nameWidth,usable=W-x0-12,sw=usable/slots,laneH=40,gap=18,top0=26;
  const H=top0+lanes.length*(laneH+gap)+6;
  const yTop=(i:number)=>top0+i*(laneH+gap);
  const X=(t:number)=>x0+t*sw,slew=Math.min(6,sw*0.18);
  const fills={a:'var(--paper)',b:'var(--mint)',c:'#f6e7df'};
  return <Figure caption={caption}><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
    {markers.map((m,i)=><g key={'m'+i}><path d={`M${X(m.t)} ${top0-12} V${H-4}`} stroke={m.color??muted} strokeWidth="1.1" strokeDasharray={m.dashed===false?undefined:'4 4'}/>{m.label&&<text x={X(m.t)+3} y={top0-14} className="tick" fill={m.color??muted}>{svgMath(m.label)}</text>}</g>)}
    {lanes.map((ln,i)=>{const t=yTop(i),hi=t+6,lo=t+laneH-6,mid=(hi+lo)/2,col=ln.color??green;
      let body=null;
      if(ln.wave){const lv=(c:string)=>c==='1'?hi:c==='0'?lo:mid;let prev=ln.wave[0]==='.'?'0':ln.wave[0];const pts:string[]=[`${X(0)},${lv(prev)}`];
        for(let k=0;k<ln.wave.length;k++){const c=ln.wave[k]==='.'?prev:ln.wave[k];if(c!==prev){pts.push(`${X(k)},${lv(prev)}`,`${X(k)+slew},${lv(c)}`);}prev=c;pts.push(`${X(k+1)},${lv(c)}`);}
        body=<polyline points={pts.join(' ')} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round"/>;}
      else if(ln.bus){body=<g>{ln.bus.map((s,j)=>{const a=X(s.from),b=X(s.to),e=Math.min(6,(b-a)/4);return <g key={j}><path d={`M${a} ${mid} L${a+e} ${hi} H${b-e} L${b} ${mid} L${b-e} ${lo} H${a+e} Z`} fill={fills[s.tone??'a']} stroke={col} strokeWidth="1.6"/><text x={(a+b)/2} y={mid+4} textAnchor="middle" className="tick">{svgMath(s.label)}</text></g>;})}</g>;}
      return <g key={i}><text x={8} y={mid+4} className="symbol-value">{svgMath(ln.name)}</text>{body}</g>;})}
    {arrows.map((a,i)=>{const yb=yTop(a.lane)+laneH+3,x=X(a.t);return <path key={'a'+i} d={`M${x} ${yb+9} L${x-4} ${yb+16} H${x+4} Z M${x} ${yb+9} V${yb+2}`} fill={orange} stroke={orange} strokeWidth="1.3"/>;})}
    {notes.map((n,i)=><text key={'n'+i} x={X(n.t)} y={yTop(n.lane)-3} textAnchor="middle" className="tick" fill={n.color??ink}>{svgMath(n.text)}</text>)}
  </svg></Figure>;
}
// Expand a list of bits into a wave string with `per` slots per bit.
const bitsWave=(bits:number[],per=1)=>bits.map(b=>String(b).repeat(per)).join('');

/* ---------- Chapter 128: signal integrity ---------- */
function prbs7(n:number){let r=0x7f;const out:number[]=[];for(let i=0;i<n;i++){const b=((r>>6)^(r>>5))&1;r=((r<<1)|b)&0x7f;out.push(b);}return out;}
function EyePanel({x,y,w,h,tau,title}:{x:number;y:number;w:number;h:number;tau:number;title:string}){
  const bits=prbs7(127),spb=40,dt=1/spb;let v=0;const wave:number[]=[];
  for(const b of bits){for(let k=0;k<spb;k++){v+=(b-v)*(1-Math.exp(-dt/tau));wave.push(v);}}
  const traces:string[]=[];
  for(let s=8;s<bits.length-2;s++){const seg=wave.slice(s*spb-spb/2,s*spb+spb*1.5);traces.push(seg.map((val,k)=>`${x+(k/(2*spb))*w},${y+h-val*h}`).join(' '));}
  // eye opening at the centre of the unit interval
  const centre=bits.map((_,s)=>wave[s*spb+spb/2-1]).slice(8,-2),ones=centre.filter((_,i)=>bits[i+8]===1),zeros=centre.filter((_,i)=>bits[i+8]===0);
  const open=Math.min(...ones)-Math.max(...zeros);
  return <g><rect x={x} y={y} width={w} height={h} fill="var(--paper)" stroke="var(--line)"/>{traces.map((p,i)=><polyline key={i} points={p} fill="none" stroke={green} strokeOpacity="0.28" strokeWidth="1.2"/>)}
    <path d={`M${x+w/2} ${y} V${y+h}`} stroke={orange} strokeDasharray="4 4"/><text x={x+w/2} y={y-8} textAnchor="middle" className="symbol-value">{title}</text>
    <text x={x+w/2} y={y+h+18} textAnchor="middle" className="tick">eye height at centre ≈ {(open*100).toFixed(0)}% of swing</text></g>;
}
export function EyeDiagramFigure(){
  return <Figure caption="Eye diagrams of the same 127-bit pseudo-random sequence sent through a single-pole channel, overlaid over two unit intervals. Left: time constant τ = 0.15 UI, so each bit settles before the next; the eye is wide open. Right: τ = 0.6 UI, so each bit starts from wherever the previous bits left the line (inter-symbol interference); the eye closes vertically and the crossings smear horizontally into jitter."><svg viewBox="0 0 700 260" role="img" aria-label="Two eye diagrams, one open and one partly closed by inter-symbol interference.">
    <EyePanel x={40} y={34} w={290} h={180} tau={0.15} title="τ = 0.15 UI"/>
    <EyePanel x={380} y={34} w={290} h={180} tau={0.6} title="τ = 0.6 UI"/>
  </svg></Figure>;
}

export function ReflectionEdgePlot(){
  // 1 V step, driver Rs into a 50 Ω line of 1 ns delay, high-impedance CMOS receiver. Edges have 0.3 ns rise.
  const tr=0.3,ramp=(t:number)=>t<=0?0:t>=tr?1:t/tr;
  const rx=(Rs:number)=>(t:number)=>{const Z0=50,gs=(Rs-Z0)/(Rs+Z0),gl=1,vp=Z0/(Rs+Z0);let v=0;for(let n=0;n<12;n++){v+=vp*(1+gl)*Math.pow(gl*gs,n)*ramp(t-(2*n+1));}return v;};
  return <Figure plot caption="Receiver voltage for a 1 V logic step on a 1 ns, 50 Ω trace into a CMOS input. A strong 10 Ω driver (green) launches 0.83 V, which doubles at the open end to 1.67 V and then rings down; the overshoot exceeds the supply and stresses input clamps, and the dips can re-cross the 0.7 V threshold. A 50 Ω total source resistance (orange, series termination) launches half the step, which doubles to exactly 1 V once and stops."><Plot curves={[{name:'Driver 10 Ω, unterminated',color:green,points:lin(rx(10),0,12,1200)},{name:'Series-terminated, 50 Ω total',color:orange,points:lin(rx(50),0,12,1200)},{name:'V_IH = 0.7 V',color:muted,dashed:true,points:[[0,0.7],[12,0.7]]}]} xRange={[0,12]} yRange={[0,1.8]} xLabel="Time / ns" yLabel="Receiver voltage / V" description="Ringing step response of an unterminated line compared with a clean series-terminated response."/></Figure>;
}

export function ImpedanceMismatchPlot(){
  const g=(r:number)=>Math.abs((r-100)/(r+100))*100;
  return <Figure plot caption="Reflected fraction of a step on a 100 Ω differential pair as a function of the termination resistance. A ±10% termination error reflects under 5%; using a 120 Ω CAN/RS-485 resistor on a 100 Ω pair reflects 9%; leaving it open reflects everything."><Plot curves={[{name:'|Γ| for a 100 Ω line',color:green,points:lin(g,20,400,400)}]} xScale="log" xRange={[20,400]} yRange={[0,70]} xLabel="Termination resistance / Ω" yLabel="Reflected voltage / %" marks={[{at:[100,0],label:'matched',pos:'ne'},{at:[120,g(120)],label:'120 Ω: 9%',pos:'ne'},{at:[50,g(50)],label:'50 Ω: 33%',pos:'nw'}]} description="V-shaped curve of reflection coefficient magnitude versus termination resistance with a zero at 100 ohms."/></Figure>;
}

/* ---------- Chapter 129: UART and RS-232 ---------- */
export function UartFrameFigure(){
  // 0x4B = 0100 1011, LSB first: 1 1 0 1 0 0 1 0
  const data=[1,1,0,1,0,0,1,0],per=4;
  const wave='1'.repeat(per)+'0'.repeat(per)+bitsWave(data,per)+'1'.repeat(per)+'1'.repeat(per);
  const segs:Seg[]=[{from:per,to:2*per,label:'start',tone:'c'},...data.map((b,i)=>({from:(i+2)*per,to:(i+3)*per,label:`D${i}=${b}`,tone:'a' as const})),{from:10*per,to:11*per,label:'stop',tone:'b'}];
  return <Timing caption="One 8N1 UART frame carrying 0x4B ('K'). The idle line is high; the falling edge of the start bit resets the receiver's bit timer; data follow least-significant bit first; the stop bit returns the line high. Orange arrows mark the receiver's sample instants at the centre of each bit, 1.5, 2.5, … bit periods after the start edge." label="UART frame timing with start, eight data bits least significant first, stop bit, and sample points." slots={12*per} lanes={[{name:'TX line',wave},{name:'Field',bus:segs}]} arrows={[...Array.from({length:10},(_,i)=>({t:per*(1.5+i),lane:0}))]} markers={[{t:per,label:'start edge'},{t:11*per,label:'frame end'}]}/>;
}

export function UartDriftPlot(){
  const err=(eps:number)=>(n:number)=>n*eps+1/16;
  return <Figure plot caption="Worst-case sampling error at each bit centre for a receiver whose clock differs from the transmitter's by ε, including a 1/16-bit start-edge uncertainty from 16× oversampling. The last sample (the stop bit, 9.5 bits after the start edge) must stay inside ±0.5 bit, less the edge time and noise: 2% total mismatch leaves comfortable margin, 5% does not."><Plot curves={[{name:'ε = 1%',color:green,points:lin(err(0.01),0,9.5,100)},{name:'ε = 3%',color:orange,points:lin(err(0.03),0,9.5,100)},{name:'ε = 5%',color:muted,points:lin(err(0.05),0,9.5,100)},{name:'half-bit limit',color:ink,dashed:true,points:[[0,0.5],[10,0.5]]}]} xRange={[0,10]} yRange={[0,0.7]} xLabel="Bit periods after start edge" yLabel="Sample error / bit period" marks={[{at:[9.5,err(0.05)(9.5)],label:'stop bit at 5%',pos:'nw'}]} description="Linearly growing sample error for three clock mismatches compared with the half-bit limit."/></Figure>;
}

export function Rs232LevelsPlot(){
  const data=[1,0,0,0,0,0,1,0],bits=[1,1,0,...data,1,1],seq=(f:(b:number)=>number)=>bits.flatMap((b,i)=>[[i,f(b)],[i+1,f(b)]] as [number,number][]);
  return <Figure plot caption="The same byte, 0x41 ('A'), as a 3.3 V logic UART signal (green) and on an RS-232 line (orange). RS-232 inverts the logic and uses bipolar levels: a logic 1 (mark, idle) is negative, a logic 0 (space, start bit) positive. Receivers must accept anything beyond ±3 V; the band between is undefined, so a ±5–9 V driver has several volts of noise margin."><Plot curves={[{name:'Logic UART (0 / 3.3 V)',color:green,points:seq(b=>b?3.3:0)},{name:'RS-232 line (±9 V, inverted)',color:orange,points:seq(b=>b?-9:9)},{name:'+3 V',color:muted,dashed:true,points:[[0,3],[12,3]]},{name:'−3 V',color:muted,dashed:true,points:[[0,-3],[12,-3]]}]} xRange={[0,12]} yRange={[-12,12]} xLabel="Time / bit periods" yLabel="Voltage / V" description="A logic-level UART waveform and the corresponding inverted bipolar RS-232 waveform with plus and minus three volt thresholds."/></Figure>;
}

/* ---------- Chapter 130: SPI ---------- */
export function SpiModesFigure(){
  const per=4,n=4,clk=(cpol:number)=>{const idle=String(cpol),act=String(1-cpol);return idle.repeat(per)+Array.from({length:n},()=>act.repeat(per/2)+idle.repeat(per/2)).join('')+idle.repeat(per);};
  const bitsStr='1'.repeat(per)+'0'.repeat(per)+'1'.repeat(per)+'1'.repeat(per);
  const d0='z'.repeat(per/2)+bitsStr+'z'.repeat(per*3/2);
  const d1='z'.repeat(per)+bitsStr+'z'.repeat(per);
  const cs='1'+'0'.repeat(per*(n+2)-2)+'1';
  const capt0=Array.from({length:n},(_,i)=>({t:per+i*per,lane:1})),capt1=Array.from({length:n},(_,i)=>({t:per+i*per+per/2,lane:3}));
  return <Timing caption="SPI clock modes for four bits 1, 0, 1, 1. CPOL sets the idle clock level; CPHA sets which edge captures data. With CPHA = 0 (top pair, mode 0) the first bit must be valid before the first clock edge and is captured on the leading (rising) edges; with CPHA = 1 (bottom pair, mode 1) data change on leading edges and are captured on trailing (falling) edges. Orange arrows mark capture instants. Modes 2 and 3 are the same with the clock inverted." label="Timing diagram of SPI modes 0 and 1 showing chip select, clock, data and capture edges." slots={per*(n+2)} lanes={[{name:'CS (low)',wave:cs,color:ink},{name:'SCLK (mode 0)',wave:clk(0)},{name:'COPI (mode 0)',wave:d0,color:orange},{name:'SCLK (mode 1)',wave:clk(0)},{name:'COPI (mode 1)',wave:d1,color:orange}]} arrows={[...capt0,...capt1]} nameWidth={150}/>;
}

export function SpiReadFigure(){
  const segs=(arr:[number,number,string,('a'|'b'|'c')?][])=>arr.map(([from,to,label,tone])=>({from,to,label,tone}));
  return <Timing caption="A typical SPI register read, one byte per field. With CS held low the controller clocks out a read command and an address on MOSI while MISO is undriven; the peripheral then drives the requested data on MISO while the controller sends dummy bytes. Every byte costs eight clocks whether or not it carries payload; here 16 of 32 clocks move useful data." label="SPI read transaction with command, address and two data bytes." slots={36} lanes={[{name:'CS',wave:'1'+'0'.repeat(34)+'1',color:ink},{name:'SCK',bus:segs([[1,9,'8 clocks'],[9,17,'8 clocks'],[17,25,'8 clocks'],[25,33,'8 clocks']])},{name:'MOSI',bus:segs([[1,9,'READ 0x03','b'],[9,17,'ADDR 0x2A','b'],[17,25,'dummy'],[25,33,'dummy']])},{name:'MISO',bus:segs([[1,17,'high-Z'],[17,25,'DATA[0x2A]','c'],[25,33,'DATA[0x2B]','c']])}]} markers={[{t:1,label:'CS ↓'},{t:34,label:'CS ↑'}]}/>;
}

/* ---------- Chapter 131: I²C ---------- */
export function I2cTransactionFigure(){
  // Write one byte 0xA5 to device 0x48 (1001000), ACKs from target. 2 slots per bit: SCL low then high.
  const addr=[1,0,0,1,0,0,0],rw=0,data=[1,0,1,0,0,1,0,1];
  const bits=[...addr,rw,0,...data,0];// 0 for ACK slots (driven low by target)
  const scl='11'+bits.map(()=> '01').join('')+'0111';
  const sda='10'+bits.map(b=>String(b).repeat(2)).join('')+'0011';
  const segs:Seg[]=[{from:0,to:2,label:'S',tone:'c'},{from:2,to:16,label:'address 0x48'},{from:16,to:18,label:'W'},{from:18,to:20,label:'A',tone:'b'},{from:20,to:36,label:'data 0xA5'},{from:36,to:38,label:'A',tone:'b'},{from:38,to:42,label:'P',tone:'c'}];
  return <Timing caption="An I²C write of one byte, 0xA5, to the device at 7-bit address 0x48. SDA may change only while SCL is low and must be stable while SCL is high (orange sample arrows). Two deliberate exceptions frame the transfer: SDA falling while SCL is high is START (S), SDA rising while SCL is high is STOP (P). After each byte the transmitter releases SDA and the receiver pulls it low to acknowledge (A, green); a high level there would be a NACK." label="I2C timing diagram of start, seven address bits, write bit, acknowledge, data byte, acknowledge and stop." slots={42} lanes={[{name:'SCL',wave:scl,color:ink},{name:'SDA',wave:sda},{name:'Meaning',bus:segs}]} arrows={bits.map((_,i)=>({t:3.5+2*i,lane:1}))} markers={[{t:1,label:'START'},{t:40.5,label:'STOP'}]}/>;
}

export function I2cRisePlot(){
  const C=200e-12,v=(R:number)=>(t:number)=>1-Math.exp(-t*1e-9/(R*C));
  return <Figure plot caption="A released I²C line charges through its pull-up into 200 pF of bus capacitance. Rise time is measured from 0.3 V_DD to 0.7 V_DD, which takes 0.847 RC. With 4.7 kΩ it takes 796 ns: fine for standard mode (1000 ns limit) but too slow for fast mode (300 ns). 1 kΩ gives 169 ns but needs 3 mA to pull the line low at 3.3 V."><Plot curves={[{name:'R_p = 1 kΩ',color:green,points:lin(v(1000),0,3000)},{name:'R_p = 2.2 kΩ',color:orange,points:lin(v(2200),0,3000)},{name:'R_p = 4.7 kΩ',color:muted,points:lin(v(4700),0,3000)},{name:'0.3 and 0.7 V_DD',color:ink,dashed:true,points:[[0,0.3],[3000,0.3],[NaN,NaN],[0,0.7],[3000,0.7]]}]} xRange={[0,3000]} yRange={[0,1.05]} xLabel="Time after release / ns" yLabel="SDA / V_DD" marks={[{at:[0.847*1000*C*1e9+0.357*1000*C*1e9,0.7],label:'169 ns',pos:'se'},{at:[0.357*4700*C*1e9+0.847*4700*C*1e9,0.7],label:'796 ns',pos:'se'}]} description="Three exponential charging curves for different pull-up resistors with threshold lines at thirty and seventy percent."/></Figure>;
}

export function I2cArbitrationFigure(){
  // Two controllers start together. A sends 0x48 (1001000), B sends 0x4C (1001100); B loses at bit 4.
  const a=[1,0,0,1,0,0,0],b=[1,0,0,1,1,0,0];
  const lostAt=4;
  const wa='10'+a.map(x=>String(x).repeat(2)).join('');
  const wb='10'+b.map((x,i)=>i<lostAt?String(x).repeat(2):i===lostAt?'11':'11').join('');
  const bus='10'+a.map((x,i)=>String(Math.min(x,i<=lostAt?b[i]:1)).repeat(2)).join('');
  return <Timing caption="Arbitration between two controllers that start at the same moment. The bus is wired-AND: a device that releases SDA (intending 1) while another pulls low sees a 0. Each controller compares the bus with what it sent at every SCL-high sample. At the fifth address bit controller B sends 1, reads 0, recognises it has lost and stops driving; controller A never sees a conflict and its transfer continues undamaged." label="I2C arbitration timing with two controllers and the resulting bus level." slots={16} lanes={[{name:'SDA from A',wave:wa},{name:'SDA from B',wave:wb,color:orange},{name:'SDA on bus',wave:bus,color:ink}]} markers={[{t:2+2*lostAt+1,label:'B loses',color:orange,dashed:false}]} notes={[{t:2+2*lostAt+1,lane:1,text:'sends 1, reads 0',color:orange}]}/>;
}

/* ---------- Chapter 132: RS-485 and CAN ---------- */
export function DifferentialRejectionPlot(){
  const bit=(t:number)=>[1,0,1,1,0,0,1,0][Math.min(7,Math.floor(t))],cm=(t:number)=>2.5+1.2*Math.sin(2*Math.PI*t/5),sw=0.75;
  const A=(t:number)=>cm(t)+(bit(t)?sw:-sw),B=(t:number)=>cm(t)-(bit(t)?sw:-sw);
  return <Figure plot caption="RS-485 differential signalling with 2.4 V peak-to-peak of common-mode noise. Each wire alone (A green, B orange) moves by more than the signal, so a single-ended receiver referenced to its own ground would misread bits. The receiver instead takes A − B (dark): the common-mode term cancels and only the ±1.5 V signal remains, far outside the ±200 mV threshold band."><Plot curves={[{name:'A',color:green,points:lin(A,0,8,1601)},{name:'B',color:orange,points:lin(B,0,8,1601)},{name:'A − B',color:ink,points:lin(t=>A(t)-B(t),0,8,1601)},{name:'±200 mV thresholds',color:muted,dashed:true,points:[[0,0.2],[8,0.2],[NaN,NaN],[0,-0.2],[8,-0.2]]}]} xRange={[0,8]} yRange={[-2.2,5]} xLabel="Time / bit periods" yLabel="Voltage / V" description="Two single-ended wires carrying common-mode noise and their clean difference."/></Figure>;
}

export function CanBitTimingFigure(){
  const segs=[{n:'SYNC',q:1,c:'var(--mint)'},{n:'PROP_SEG',q:7,c:'var(--paper)'},{n:'PHASE_SEG1',q:6,c:'var(--paper)'},{n:'PHASE_SEG2',q:2,c:'#f6e7df'}];
  const x0=40,w=620,tq=w/16;let x=x0;
  return <Figure caption="One CAN bit at 500 kbit/s divided into sixteen time quanta of 125 ns. The synchronisation segment contains the expected edge; the propagation segment absorbs the round-trip delay to the farthest node and back; the two phase segments place the sample point at 87.5% of the bit and can be lengthened or shortened to resynchronise on edges."><svg viewBox="0 0 700 170" role="img" aria-label="CAN bit timing segments with sample point.">
    {segs.map((s,i)=>{const a=x,b=x+s.q*tq;x=b;return <g key={i}><rect x={a} y={50} width={b-a} height={46} fill={s.c} stroke={green} strokeWidth="1.6"/><text x={(a+b)/2} y={78} textAnchor="middle" className="tick">{s.n}</text><text x={(a+b)/2} y={114} textAnchor="middle" className="tick">{s.q} tq</text></g>;})}
    {Array.from({length:17},(_,i)=><path key={i} d={`M${x0+i*tq} 96 V102`} stroke={ink}/>)}
    <path d={`M${x0+14*tq} 30 V108`} stroke={orange} strokeWidth="2"/><text x={x0+14*tq} y={24} textAnchor="middle" className="symbol-value" fill={orange}>sample point 87.5%</text>
    <path d={`M${x0} 140 H${x0+w}`} stroke={ink}/><text x={x0+w/2} y={158} textAnchor="middle" className="tick">one bit = 2 µs = 16 × 125 ns</text>
  </svg></Figure>;
}

export function CanArbitrationFigure(){
  // Identifiers MSB first after SOF. A=0x123, B=0x125, C=0x2A0. Dominant 0 wins.
  const id=(v:number)=>Array.from({length:11},(_,i)=>(v>>(10-i))&1);
  const A=id(0x123),B=id(0x125),C=id(0x2A0);
  // Simulate bit by bit: nodes that have lost send recessive (1) from then on.
  const nodes=[A,B,C],out=[99,99,99],busBits:number[]=[];
  for(let i=0;i<11;i++){const sent=nodes.map((n,k)=>out[k]<i?1:n[i]);const v=Math.min(...sent);busBits.push(v);sent.forEach((x,k)=>{if(out[k]===99&&x===1&&v===0)out[k]=i;});}
  const tx=(k:number)=>'1'+'0'+nodes[k].map((b,i)=>i<=out[k]?String(b):'1').join('');
  const bus='1'+'0'+busBits.join('');
  const lc=out[2],lb=out[1];
  return <Timing caption="Bitwise arbitration among three CAN nodes that start a frame together, with dominant (0) overriding recessive (1). Identifiers are sent most significant bit first. Node C (0x2A0) sends recessive at the second identifier bit while the others send dominant, reads dominant, and drops out. Node B (0x125) loses at the ninth identifier bit to node A (0x123). The lowest identifier wins without any frame being destroyed." label="Timing diagram of CAN arbitration among three nodes and the resulting bus level." slots={13} lanes={[{name:'Node A 0x123',wave:tx(0)},{name:'Node B 0x125',wave:tx(1),color:orange},{name:'Node C 0x2A0',wave:tx(2),color:muted},{name:'Bus',wave:bus,color:ink},{name:'Field',bus:[{from:1,to:2,label:'SOF',tone:'c'},{from:2,to:13,label:'11-bit identifier, MSB first'}]}]} markers={[{t:2+lc+0.5,label:'C out',color:muted,dashed:false},{t:2+lb+0.5,label:'B out',color:orange,dashed:false}]}/>;
}

export function CanFrameFigure(){
  const f:[string,number,'a'|'b'|'c'][]=[['SOF',3,'c'],['ID (11)',11,'a'],['RTR',3,'a'],['IDE',3,'a'],['r0',3,'a'],['DLC (4)',5,'b'],['Data (0–64)',16,'b'],['CRC (15)',15,'a'],['del',3,'a'],['ACK',3,'c'],['del',3,'a'],['EOF (7)',7,'a']];
  let t=0;const segs:Seg[]=f.map(([label,n,tone])=>{const s={from:t,to:t+n,label,tone};t+=n;return s;});
  return <Timing caption="Classical CAN data frame with an 11-bit identifier (field sizes in bits; one-bit fields are drawn wider for legibility and data as two bytes). Arbitration happens during SOF and the identifier. The 15-bit CRC protects everything before it; in the ACK slot the transmitter sends recessive and every receiver that found the frame correct drives dominant. Between SOF and the CRC delimiter, the transmitter inserts a complementary stuff bit after five equal bits so that receivers see enough edges to stay synchronised." label="CAN frame field layout." slots={t} lanes={[{name:'Frame',bus:segs}]} nameWidth={70}/>;
}

/* ---------- Chapter 133: USB and Ethernet ---------- */
export function NrziStuffingFigure(){
  const data=[0,1,1,1,1,1,1,1,0,1];
  const stuffed:number[]=[],isStuff:boolean[]=[];let run=0;
  for(const b of data){stuffed.push(b);isStuff.push(false);run=b?run+1:0;if(run===6){stuffed.push(0);isStuff.push(true);run=0;}}
  let lv=1;const line=stuffed.map(b=>{if(b===0)lv=1-lv;return lv;});
  const segs:Seg[]=[{from:0,to:1,label:'idle'},...stuffed.map((b,i)=>({from:i+1,to:i+2,label:isStuff[i]?'stuff':String(b),tone:(isStuff[i]?'c':'a') as 'a'|'c'}))];
  return <Timing caption="USB NRZI coding with bit stuffing. A 0 is sent as a change of line state and a 1 as no change. After six consecutive 1s the transmitter inserts a 0 (orange) so the line must toggle and the receiver's clock recovery never goes more than seven bit times without an edge; the receiver deletes it." label="USB data bits, stuffed bit and resulting NRZI line state." slots={stuffed.length+1} lanes={[{name:'Bits',bus:segs},{name:'Line (J high)',wave:'1'+line.map(String).join('')}]}/>;
}

export function UsbPacketFigure(){
  const f:[string,number,'a'|'b'|'c'][]=[['SYNC 8',8,'c'],['PID 8',8,'b'],['ADDR 7',7,'a'],['ENDP 4',4,'a'],['CRC5',5,'a'],['EOP',3,'c']];
  let t=0;const segs:Seg[]=f.map(([label,n,tone])=>{const s={from:t,to:t+n,label,tone};t+=n;return s;});
  const dp='1'+'01010100'+'1'.repeat(24)+'00'+'11',dm='0'+'10101011'+'0'.repeat(24)+'00'+'00';
  return <Timing caption="A full-speed USB token packet (widths in bit times). SYNC ends in two equal states that mark the packet start; the PID names the packet type and carries its own complement as a check; address and endpoint select the destination; CRC5 protects them. End-of-packet is two bit times of single-ended zero (both lines low), which no differential data state can produce. On D+ and D−, J and K are the two differential states; the data field is drawn as idle J for clarity." label="USB token packet field layout with D plus and D minus waveforms." slots={t+2} lanes={[{name:'Fields',bus:segs.map(s=>({...s,from:s.from+1,to:s.to+1}))},{name:'D+',wave:dp},{name:'D−',wave:dm,color:orange}]} notes={[{t:t-0.5,lane:1,text:'SE0'}]}/>;
}

export function EthernetLineCodeFigure(){
  const bits=[1,0,1,1,0,0,0,1];
  const man=bits.map(b=>b?'01':'10').join('');
  let st=0;const cyc=['z','1','z','0'];const mlt=bits.map(b=>{if(b)st=(st+1)%4;return cyc[st].repeat(2);}).join('');
  const segs:Seg[]=bits.map((b,i)=>({from:2*i,to:2*i+2,label:String(b)}));
  return <Timing caption="Two Ethernet line codes for the same bits. 10BASE-T Manchester (green) puts a transition in the middle of every bit (low-to-high for 1, high-to-low for 0), which guarantees clock edges and removes DC but needs twice the bandwidth. 100BASE-TX's MLT-3 (orange, after 4B5B coding and scrambling) steps through three levels 0, +, 0, − on each 1 and holds on each 0, cutting the fundamental frequency to a quarter of the bit rate so 125 Mbaud fits a Category 5 cable." label="Manchester and MLT-3 line codes for the same bit sequence." slots={16} lanes={[{name:'Bits',bus:segs},{name:'Manchester',wave:man},{name:'MLT-3',wave:mlt,color:orange}]}/>;
}

export function EthernetFrameFigure(){
  const f:[string,number,'a'|'b'|'c'][]=[['Preamble 7',7,'c'],['SFD 1',3,'c'],['Dest MAC 6',6,'a'],['Src MAC 6',6,'a'],['Type 2',4,'a'],['Payload 46–1500',14,'b'],['FCS 4',4,'a'],['IFG 12',6,'c']];
  let t=0;const segs:Seg[]=f.map(([label,n,tone])=>{const s={from:t,to:t+n,label,tone};t+=n;return s;});
  return <Timing caption="Ethernet frame (field sizes in bytes; widths not to scale). The preamble and start-frame delimiter let the receiver lock to the bit clock and find the first byte; destination and source MAC addresses and the EtherType follow; the payload is padded to at least 46 bytes; a 32-bit CRC (FCS) protects addresses through payload; a 12-byte inter-frame gap separates frames." label="Ethernet frame field layout." slots={t} lanes={[{name:'Frame',bus:segs}]} nameWidth={70}/>;
}

export function UartDistortionPlot(){
  // RS-232 bits through an RC line (tau = 1 us), bit time 8.68 us; receiver threshold +1.5 V.
  const T=8.68,tau=1.0,V=6,Vth=1.5,bits=[1,0,1,1,0,1,0,0,1,1];
  const ideal=(t:number)=>{const k=Math.min(bits.length-1,Math.floor(t/T));return bits[k]?-V:V;};
  const sim:[number,number][]=[];let v=-V;const dt=0.02;for(let t=0;t<=bits.length*T;t+=dt){v+=(ideal(t)-v)*(1-Math.exp(-dt/tau));sim.push([t,v]);}
  return <Figure plot caption="An RS-232 waveform through a cable whose capacitance gives a 1 µs time constant, at 115.2 kbit/s (8.68 µs bits). The receiver switches at +1.5 V rather than 0 V, so a rising line crosses late and a falling line crosses early: every space (positive, logic 0) interval is shortened by τ ln(7.5/4.5) ≈ 0.51 µs, about 6% of a bit. Sampling at bit centres tolerates this; edge-timed decoders or higher rates do not."><Plot curves={[{name:'Line voltage',color:green,points:sim},{name:'Driven level',color:muted,dashed:true,points:lin(ideal,0,bits.length*T-0.01,2000)},{name:'Receiver threshold +1.5 V',color:orange,dashed:true,points:[[0,Vth],[bits.length*T,Vth]]}]} xRange={[0,bits.length*T]} yRange={[-8,8]} xLabel="Time / µs" yLabel="Voltage / V" description="RC-shaped RS-232 waveform crossing an offset receiver threshold early on falling edges and late on rising edges."/></Figure>;
}
