// Anchor-based schematic drawing, in the spirit of Schemdraw.
//
// Two-terminal parts are drawn *between two points* (a → b): the leads stretch to fill whatever distance you give,
// so a part always meets the nodes it connects. Multi-terminal parts (transistors, op-amps) are placed at a point and
// expose their pin coordinates through a `…Pins()` helper; wire to those pins instead of typing numbers.
//
// Every part tags its group with data-pins and every wire with data-wire, so tests/schematics.test.mjs can verify
// that each wire end lands on a pin, a junction or another wire, and each pin is connected.
import type {ReactNode} from 'react';
import {svgMath,Tx} from './MathText';

export type Pt=readonly [number,number];
export const ink='var(--ink)',green='var(--accent)',orange='var(--orange)',gray='var(--muted)';
const SW=1.8;
const pins=(...ps:Pt[])=>ps.map(p=>p[0]+','+p[1]).join(' ');
const axis=(a:Pt,b:Pt)=>{const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1;return {L,ux:dx/L,uy:dy/L,mx:(a[0]+b[0])/2,my:(a[1]+b[1])/2,deg:Math.atan2(dy,dx)*180/Math.PI};};

/* ---------- Wires, junctions, labels ---------- */
// A wire through any number of points. Use hv()/vh() for one-elbow routes.
export function Wire({pts,color=ink,dashed=false,width=SW}:{pts:Pt[];color?:string;dashed?:boolean;width?:number}){
  return <polyline data-wire={pins(...pts)} points={pins(...pts)} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeDasharray={dashed?'5 4':undefined}/>;
}
export const hv=(a:Pt,b:Pt):Pt[]=>[a,[b[0],a[1]],b];   // horizontal first, then vertical
export const vh=(a:Pt,b:Pt):Pt[]=>[a,[a[0],b[1]],b];   // vertical first, then horizontal
export const at=(p:Pt,dx:number,dy:number):Pt=>[p[0]+dx,p[1]+dy];

export function Dot({at:p,color=ink}:{at:Pt;color?:string}){return <circle data-junction={pins(p)} cx={p[0]} cy={p[1]} r="3.3" fill={color}/>}
// Open terminal (a port, input or output connection).
export function Terminal({at:p,label,side='left'}:{at:Pt;label?:ReactNode;side?:'left'|'right'|'above'|'below'}){
  const [dx,dy,anchor]=({left:[-10,5,'end'],right:[10,5,'start'],above:[0,-12,'middle'],below:[0,22,'middle']} as const)[side];
  return <g data-pins={pins(p)}><circle cx={p[0]} cy={p[1]} r="4" fill="var(--white)" stroke={ink} strokeWidth={SW}/>{label!=null&&<Text x={p[0]+dx} y={p[1]+dy} anchor={anchor}>{label}</Text>}</g>;
}
export type LabelKind='symbol'|'value'|'output';
// SVG text with X_sub subscripts rendered properly.
export function Text({x,y,children,kind='symbol',anchor='start',color}:{x:number;y:number;children:ReactNode;kind?:LabelKind;anchor?:'start'|'middle'|'end';color?:string}){
  return <text x={x} y={y} textAnchor={anchor} className={kind==='value'?'symbol-value':kind+'-label'} style={color?{fill:color}:undefined}>{svgMath(children)}</text>;
}
export function Ground({at:p,color=ink}:{at:Pt;color?:string}){
  return <path data-pins={pins(p)} d={`M${p[0]} ${p[1]} v8 m-13 0 h26 m-21 6 h16 m-11 6 h6`} stroke={color} strokeWidth={SW} fill="none"/>;
}
// Supply node: a short bar with its label. `down` draws a negative rail below its connection.
export function Rail({at:p,label,down=false}:{at:Pt;label:ReactNode;down?:boolean}){
  const y=p[1];return <g data-pins={pins(p)}><path d={`M${p[0]-14} ${y} H${p[0]+14}`} stroke={ink} strokeWidth="2.6"/><Text x={p[0]} y={down?y+20:y-9} anchor="middle">{label}</Text></g>;
}
// Small arrowhead on a wire, pointing along `dir`, with an optional label beside it.
export function CurrentArrow({at:p,dir,label,color=green,side=1}:{at:Pt;dir:'up'|'down'|'left'|'right';label?:ReactNode;color?:string;side?:1|-1}){
  const r={right:0,down:90,left:180,up:270}[dir],vert=dir==='up'||dir==='down';
  return <g><path d="M-6 -5 L5 0 L-6 5 Z" fill={color} transform={`translate(${p[0]} ${p[1]}) rotate(${r})`}/>{label!=null&&<Text x={vert?p[0]+12*side:p[0]} y={vert?p[1]+5:p[1]-11*side} anchor={vert?(side>0?'start':'end'):'middle'} kind="value" color={color}>{label}</Text>}</g>;
}

/* ---------- Two-terminal parts ---------- */
type Two={a:Pt;b:Pt;label?:ReactNode;value?:ReactNode;color?:string;flipLabel?:boolean};
// Shared frame: leads from a and b to a body of length `len`, body drawn horizontally around the origin and rotated.
function TwoTerminal({a,b,len,label,value,color=ink,flipLabel,children,labelGap=18}:Two&{len:number;children:ReactNode;labelGap?:number}){
  const {ux,uy,mx,my,deg}=axis(a,b),h=len/2,vertical=Math.abs(uy)>Math.abs(ux),s=flipLabel?-1:1;
  const lead=`M${a[0]} ${a[1]} L${mx-ux*h} ${my-uy*h} M${mx+ux*h} ${my+uy*h} L${b[0]} ${b[1]}`;
  // Vertical parts: label and value stacked beside the body. Horizontal parts: label above, value below.
  // flipLabel moves them to the other side.
  const x=vertical?mx+labelGap*s:mx,anchor=vertical?(s>0?'start':'end'):'middle';
  const above=my-labelGap+2,below=my+labelGap+10;
  const ly=vertical?(value!=null?my-3:my+5):(s>0?above:below),vy=vertical?my+15:(s>0?below:above);
  return <g data-pins={pins(a,b)}>
    <path d={lead} stroke={color} strokeWidth={SW} fill="none"/>
    <g transform={`translate(${mx} ${my}) rotate(${deg})`} stroke={color} strokeWidth={SW} fill="none">{children}</g>
    {label!=null&&<Text x={x} y={ly} anchor={anchor}>{label}</Text>}
    {value!=null&&<Text x={x} y={vy} anchor={anchor} kind="value">{value}</Text>}
  </g>;
}
export function Res(p:Two){return <TwoTerminal {...p} len={48}><rect x="-24" y="-8" width="48" height="16" fill="var(--white)"/></TwoTerminal>}
export function Cap({polar=false,...p}:Two&{polar?:boolean}){
  // Polarized: the straight plate and the + mark are on the b side (b is the positive terminal, as for Source).
  return <TwoTerminal {...p} len={12} labelGap={22}><path d={polar?'M6 -16 V16 M-9 -16 Q-4 0 -9 16':'M-6 -16 V16 M6 -16 V16'}/>{polar&&<path d="M12 -14 h7 m-3.5 -3.5 v7" strokeWidth="1.4"/>}</TwoTerminal>;
}
export function Ind(p:Two){return <TwoTerminal {...p} len={48}><path d="M-24 0 a6 6 0 0 1 12 0 a6 6 0 0 1 12 0 a6 6 0 0 1 12 0 a6 6 0 0 1 12 0"/></TwoTerminal>}
// Diode: conventional current flows a (anode) → b (cathode).
export function Diode({kind='plain',...p}:Two&{kind?:'plain'|'zener'|'schottky'|'led'}){
  const bar=kind==='zener'?'M10 -12 V12 l-5 4 M10 -12 l5 -4':kind==='schottky'?'M10 -12 V12 h5 v-4 M10 -12 h-5 v4':'M10 -12 V12';
  return <TwoTerminal {...p} len={20} labelGap={22}><path d="M-10 -11 L10 0 L-10 11 Z" fill={p.color??ink}/><path d={bar}/>
    {/* Light arrows go on the side away from the label. */}
    {kind==='led'&&<path transform={p.flipLabel?undefined:'scale(1 -1)'} d="M-2 -15 l7 -10 m-5 0 h5 v5 M6 -15 l7 -10 m-5 0 h5 v5" strokeWidth="1.4"/>}</TwoTerminal>;
}
// Voltage source: a is the − terminal, b the + terminal. ac draws a sine; battery draws plates.
export function Source({kind='dc',...p}:Two&{kind?:'dc'|'ac'|'battery'}){
  const {ux,uy,mx,my}=axis(p.a,p.b),c=p.color??ink;
  if(kind==="battery")return <TwoTerminal {...p} len={10} labelGap={26}><path d="M-5 -8 V8 M5 -16 V16"/></TwoTerminal>;
  const plus:Pt=[mx+ux*8,my+uy*8],minus:Pt=[mx-ux*8,my-uy*8];
  return <g><TwoTerminal {...p} len={36} labelGap={28}><circle r="18" fill="var(--white)"/></TwoTerminal>
    {kind==='ac'?<path d={`M${mx-10} ${my} q5 -11 10 0 t10 0`} stroke={c} strokeWidth={SW} fill="none"/>
    :<path d={`M${plus[0]-4} ${plus[1]} h8 M${plus[0]} ${plus[1]-4} v8 M${minus[0]-4} ${minus[1]} h8`} stroke={c} strokeWidth="1.5"/>}</g>;
}
// Current source: arrow shows the direction current is pushed, a → b.
export function CurrentSource(p:Two){return <TwoTerminal {...p} len={36} labelGap={28}><circle r="18" fill="var(--white)"/><path d="M-9 0 H7 M2 -5 L8 0 L2 5"/></TwoTerminal>}
// Dependent (controlled) source: a diamond. kind='current' draws an arrow a → b; kind='voltage' draws + toward b.
export function DepSource({kind='current',...p}:Two&{kind?:'current'|'voltage'}){
  const {ux,uy,mx,my}=axis(p.a,p.b),c=p.color??ink,plus:Pt=[mx+ux*8,my+uy*8],minus:Pt=[mx-ux*8,my-uy*8];
  return <g><TwoTerminal {...p} len={40} labelGap={30}><path d="M-20 0 L0 -20 L20 0 L0 20 Z" fill="var(--white)"/>{kind==='current'&&<path d="M-10 0 H8 M3 -5 L9 0 L3 5"/>}</TwoTerminal>
    {kind==='voltage'&&<path d={`M${plus[0]-4} ${plus[1]} h8 M${plus[0]} ${plus[1]-4} v8 M${minus[0]-4} ${minus[1]} h8`} stroke={c} strokeWidth="1.5"/>}</g>;
}
export function Switch({closed=false,...p}:Two&{closed?:boolean}){
  return <TwoTerminal {...p} len={36}><circle cx="-14" cy="0" r="2.4" fill={p.color??ink}/><circle cx="14" cy="0" r="2.4" fill={p.color??ink}/><path d={closed?'M-14 0 L14 0':'M-14 0 L12 -13'}/></TwoTerminal>;
}
export function Lamp(p:Two){return <TwoTerminal {...p} len={30} labelGap={24}><circle r="15" fill="var(--white)"/><path d="M-10.6 -10.6 L10.6 10.6 M-10.6 10.6 L10.6 -10.6"/></TwoTerminal>}

/* ---------- Transistors and amplifiers ---------- */
// Three-terminal parts may be rotated (degrees, as SVG rotate: 90 turns right). Pins rotate with the drawing.
const rotPt=(p:Pt,c:Pt,deg=0):Pt=>{if(!deg)return p;const r=deg*Math.PI/180,dx=p[0]-c[0],dy=p[1]-c[1];return [Math.round((c[0]+dx*Math.cos(r)-dy*Math.sin(r))*1000)/1000,Math.round((c[1]+dx*Math.sin(r)+dy*Math.cos(r))*1000)/1000];};
// Bipolar transistor centred at `at`. NPN: collector up, emitter down. PNP: emitter up, collector down.
// flip puts the base on the right; vflip swaps top and bottom legs.
type TriOpts={at:Pt;flip?:boolean;vflip?:boolean;color?:string;rotate?:number};
export function bjtPins({at:p,pnp=false,flip=false,vflip=false,rotate=0}:TriOpts&{pnp?:boolean}){
  const sx=flip?-1:1,up=pnp!==vflip;   // up: emitter on top
  const top:Pt=[p[0]+12*sx,p[1]-40],bot:Pt=[p[0]+12*sx,p[1]+40],R=(q:Pt)=>rotPt(q,p,rotate);
  return {b:R([p[0]-30*sx,p[1]]),c:R(up?bot:top),e:R(up?top:bot)};
}
export function Bjt({at:p,pnp=false,flip=false,vflip=false,rotate=0,color=ink,ring=true}:TriOpts&{pnp?:boolean;ring?:boolean}){
  const P=bjtPins({at:p,pnp,flip,vflip,rotate}),sx=flip?-1:1,eTop=pnp!==vflip,ey=eTop?-1:1;
  // Emitter leg runs from (-10, 8ey) to (12, 24ey); NPN arrow points out along it, PNP arrow points in.
  const s=[-10,8*ey],e=[12,24*ey],d=[e[0]-s[0],e[1]-s[1]],L=Math.hypot(d[0],d[1]),u=[d[0]/L,d[1]/L],n=[-u[1],u[0]];
  const t=pnp?.35:.8,tip=[s[0]+d[0]*t,s[1]+d[1]*t],dir=pnp?-1:1,back=[tip[0]-u[0]*9*dir,tip[1]-u[1]*9*dir];
  const head=`${tip[0]},${tip[1]} ${back[0]+n[0]*4.5},${back[1]+n[1]*4.5} ${back[0]-n[0]*4.5},${back[1]-n[1]*4.5}`;
  return <g data-pins={pins(P.b,P.c,P.e)}><g transform={`translate(${p[0]} ${p[1]}) rotate(${rotate}) scale(${sx} 1)`} fill="none" stroke={color} strokeWidth={SW}>
    {ring&&<circle cx="2" cy="0" r="27" stroke="var(--line)" fill="var(--white)" fillOpacity=".6"/>}
    <path d="M-30 0 H-10 M-10 -8 L12 -24 V-40 M-10 8 L12 24 V40"/><path d="M-10 -17 V17" strokeWidth="3.4"/>
    <polygon points={head} fill={color} stroke="none"/></g></g>;
}
// Field-effect transistor. n-type: drain up, source down; p-type: source up, drain down. Gate on the left.
export type FetKind='njfet'|'pjfet'|'nmos'|'pmos';
export function fetPins({at:p,kind='nmos',flip=false,vflip=false,rotate=0}:TriOpts&{kind?:FetKind}){
  const sx=flip?-1:1,sTop=(kind[0]==='p')!==vflip;
  const top:Pt=[p[0]+14*sx,p[1]-40],bot:Pt=[p[0]+14*sx,p[1]+40],R=(q:Pt)=>rotPt(q,p,rotate);
  return {g:R([p[0]-30*sx,p[1]]),d:R(sTop?bot:top),s:R(sTop?top:bot)};
}
export function Fet({at:p,kind='nmos',flip=false,vflip=false,rotate=0,color=ink}:TriOpts&{kind?:FetKind}){
  const P=fetPins({at:p,kind,flip,vflip,rotate}),sx=flip?-1:1,sTop=(kind[0]==='p')!==vflip,sy=sTop?-1:1,n=kind[0]==='n';
  const legs=`M0 -12 H14 V-40 M0 12 H14 V40`;
  const body=kind.endsWith('jfet')
    ?<><path d={`M0 -18 V18 ${legs} M-30 0 H-16 V${10*sy} H0`}/><path d={n?`M-4 ${10*sy} l-8 -4.5 v9 Z`:`M-14 ${10*sy} l8 -4.5 v9 Z`} fill={color} stroke="none"/></>
    :<><path d={`M-30 0 H-9 M-9 -14 V14 ${legs} M0 0 H14 V${12*sy}`}/><path d="M0 -18 V-7 M0 -5.5 V5.5 M0 7 V18" strokeWidth="3"/>
      <path d={n?'M2 0 l8 -4.5 v9 Z':'M12 0 l-8 -4.5 v9 Z'} fill={color} stroke="none"/></>;
  // The JFET gate sits near the source end, a common way to show which end is the source.
  return <g data-pins={pins(P.g,P.d,P.s)}><g transform={`translate(${p[0]} ${p[1]}) rotate(${rotate}) scale(${sx} 1)`} fill="none" stroke={color} strokeWidth={SW}>{body}</g></g>;
}
// Op-amp: triangle with inputs on the left. By default the inverting (−) input is on top.
export function opAmpPins({at:p,plusTop=false}:{at:Pt;plusTop?:boolean}){
  const top:Pt=[p[0]-12,p[1]-15],bot:Pt=[p[0]-12,p[1]+15];
  return {minus:plusTop?bot:top,plus:plusTop?top:bot,out:[p[0]+72,p[1]] as Pt};
}
export function OpAmp({at:p,plusTop=false,color=ink}:{at:Pt;plusTop?:boolean;color?:string}){
  const P=opAmpPins({at:p,plusTop}),x=p[0],y=p[1];
  return <g data-pins={pins(P.minus,P.plus,P.out)} stroke={color} strokeWidth={SW} fill="none">
    <polygon points={`${x},${y-32} ${x},${y+32} ${x+60},${y}`} fill="var(--white)"/>
    <path d={`M${x-12} ${y-15} H${x} M${x-12} ${y+15} H${x} M${x+60} ${y} H${x+72}`}/>
    <path d={`M${x+6} ${y-15} h8 ${plusTop?`m-4 -4 v8`:''} M${x+6} ${y+15} h8 ${plusTop?'':`m-4 -4 v8`}`} strokeWidth="1.4"/></g>;
}

/* ---------- Figure shell ---------- */
// Static figure with a caption; captions may contain $inline math$.
export function Figure({caption,children,plot=false}:{caption:string;children:ReactNode;plot?:boolean}){
  return <figure className={plot?'static-plot':'support-figure'}>{children}<figcaption><Tx>{caption}</Tx></figcaption></figure>;
}
export function Schematic({width=640,height=280,description,children,className='wide-circuit'}:{width?:number;height?:number;description:string;children:ReactNode;className?:string}){
  return <svg className={className} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={description}>{children}</svg>;
}
