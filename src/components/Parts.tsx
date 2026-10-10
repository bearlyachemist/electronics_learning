// Shared schematic primitives. Each two-terminal part is 60 units long, centred on (x, y);
// `v` draws it vertically. Wires are drawn separately by the figure that uses them.
import type {ReactNode} from 'react';
type P={x:number;y:number;v?:boolean};
export const green='var(--accent)',orange='var(--orange)',gray='var(--muted)',ink='var(--ink)';
export function Wires({d,color=ink,width=1.8,dashed=false}:{d:string;color?:string;width?:number;dashed?:boolean}){return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dashed?'5 4':undefined}/>}
export function Res({x,y,v}:P){return v?<rect x={x-10} y={y-30} width="20" height="60" fill="var(--white)" stroke={ink} strokeWidth="1.8"/>:<rect x={x-30} y={y-10} width="60" height="20" fill="var(--white)" stroke={ink} strokeWidth="1.8"/>}
export function Cap({x,y,v}:P){return <path fill="none" stroke={ink} strokeWidth="1.8" d={v?`M${x} ${y-30} V${y-7} M${x-20} ${y-7} H${x+20} M${x-20} ${y+7} H${x+20} M${x} ${y+7} V${y+30}`:`M${x-30} ${y} H${x-7} M${x-7} ${y-20} V${y+20} M${x+7} ${y-20} V${y+20} M${x+7} ${y} H${x+30}`}/>}
export function Ind({x,y,v}:P){const arc=v?'a7.5 7.5 0 0 1 0 15 ':'a7.5 7.5 0 0 1 15 0 ';return <path fill="none" stroke={ink} strokeWidth="1.8" d={(v?`M${x} ${y-30} `:`M${x-30} ${y} `)+arc.repeat(4)}/>}
// Diode points from anode to cathode. rotate=0 points right; 90 points down; -90 points up; 180 points left.
export function Diode({x,y,rotate=0,zener=false,color=ink}:{x:number;y:number;rotate?:number;zener?:boolean;color?:string}){return <g transform={`translate(${x} ${y}) rotate(${rotate})`} fill="none" stroke={color} strokeWidth="1.8"><path d={'M-30 0 H-12 M12 0 H30 M-12 -12 L12 0 L-12 12 Z M12 -14 V14'+(zener?' l5 4 M12 -14 l-5 -4':'')}/></g>}
export function Source({x,y,ac=false,label,flip=false}:{x:number;y:number;ac?:boolean;label?:ReactNode;flip?:boolean}){
 return <g><circle cx={x} cy={y} r="25" fill="var(--white)" stroke={ink} strokeWidth="1.8"/>{ac?<path d={`M${x-13} ${y} q6.5 -15 13 0 t13 0`} fill="none" stroke={ink} strokeWidth="1.8"/>:<path d={flip?`M${x-5} ${y+11} h10 m-5 -5 v10 M${x-5} ${y-11} h10`:`M${x-5} ${y-11} h10 m-5 -5 v10 M${x-5} ${y+11} h10`} fill="none" stroke={ink} strokeWidth="1.8"/>}{label&&<text x={x-35} y={y+5} textAnchor="end" className="symbol-label">{label}</text>}</g>;
}
export function Ground({x,y}:{x:number;y:number}){return <path d={`M${x} ${y} v10 m-14 0 h28 m-23 6 h18 m-12 6 h6`} stroke={ink} strokeWidth="1.5" fill="none"/>}
export function Dot({x,y,color=ink}:{x:number;y:number;color?:string}){return <circle cx={x} cy={y} r="3.2" fill={color}/>}
export function Switch({x,y,closed=false}:{x:number;y:number;closed?:boolean}){return <g fill="none" stroke={ink} strokeWidth="1.8"><path d={`M${x-30} ${y} H${x-15} M${x+15} ${y} H${x+30}`}/><path d={closed?`M${x-15} ${y} L${x+15} ${y}`:`M${x-15} ${y} L${x+12} ${y-15}`}/><circle cx={x-15} cy={y} r="2.5" fill={ink}/><circle cx={x+15} cy={y} r="2.5" fill={ink}/></g>}
export function Label({x,y,children,kind='symbol',anchor='start'}:{x:number;y:number;children:ReactNode;kind?:'symbol'|'value'|'output';anchor?:'start'|'middle'|'end'}){return <text x={x} y={y} textAnchor={anchor} className={kind+'-label'}>{children}</text>}

// Complex-plane drawing: real axis right, imaginary axis up. Vectors may start at `from` for tip-to-tail sums.
export type Vec={re:number;im:number;color:string;label?:string;from?:{re:number;im:number};dashed?:boolean;width?:number;side?:1|-1};
export function PhasorDiagram({vectors,scale,description,size=300,circle,xLabel='Re',yLabel='Im',points=[]}:{vectors:Vec[];scale?:number;description:string;size?:number;circle?:number;xLabel?:string;yLabel?:string;points?:{re:number;im:number;color:string}[]}){
 const c=size/2,ends=vectors.flatMap(v=>{const f=v.from??{re:0,im:0};return [Math.hypot(f.re,f.im),Math.hypot(f.re+v.re,f.im+v.im)]});
 const reach=scale??Math.max(1e-12,circle??0,...ends);const k=(c-34)/reach,X=(re:number)=>c+re*k,Y=(im:number)=>c-im*k;
 return <svg className="phasor-svg" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={description}>
  <path d={`M14 ${c} H${size-14} M${c} 14 V${size-14}`} stroke="var(--line)" strokeWidth="1.4"/>
  <text x={size-14} y={c-8} textAnchor="end" className="axis-title">{xLabel}</text><text x={c+8} y="24" className="axis-title">{yLabel}</text>
  {circle&&<circle cx={c} cy={c} r={circle*k} fill="none" stroke="var(--line)" strokeDasharray="4 4"/>}
  {vectors.map((v,i)=>{const f=v.from??{re:0,im:0},x1=X(f.re),y1=Y(f.im),x2=X(f.re+v.re),y2=Y(f.im+v.im),len=Math.hypot(x2-x1,y2-y1);
   if(len<1)return <circle key={i} cx={x1} cy={y1} r="3" fill={v.color}/>;
   const ux=(x2-x1)/len,uy=(y2-y1)/len,h=Math.min(11,len*.45),bx=x2-ux*h,by=y2-uy*h;
   const head=`${x2},${y2} ${bx-uy*h*.42},${by+ux*h*.42} ${bx+uy*h*.42},${by-ux*h*.42}`;
   const side=v.side??1,lx=(x1+x2)/2-uy*15*side,ly=(y1+y2)/2+ux*15*side;
   return <g key={i}><line x1={x1} y1={y1} x2={bx} y2={by} stroke={v.color} strokeWidth={v.width??2.6} strokeDasharray={v.dashed?'6 4':undefined}/><polygon points={head} fill={v.color}/>{v.label&&<text x={lx} y={ly+4} textAnchor="middle" className="phasor-label" fill={v.color}>{v.label}</text>}</g>;})}
  {points.map((p,i)=><circle key={'p'+i} cx={X(p.re)} cy={Y(p.im)} r="4.5" fill={p.color} stroke="var(--paper)" strokeWidth="1.5"/>)}
 </svg>;
}
const prefixes:[number,string][]=[[1e9,'G'],[1e6,'M'],[1e3,'k'],[1,''],[1e-3,'m'],[1e-6,'µ'],[1e-9,'n'],[1e-12,'p']];
// Engineering notation split into [number, prefix+unit] for readouts.
export function eng(v:number,unit:string,digits=3):[string,string]{
 if(v===0)return ['0',unit];if(!Number.isFinite(v))return ['∞',unit];const a=Math.abs(v);
 for(const [s,p] of prefixes)if(a>=s*.9995)return [String(Number((v/s).toPrecision(digits))),p+unit];
 return [v.toExponential(2),unit];
}
export const engText=(v:number,unit:string,digits=3)=>eng(v,unit,digits).join(' ');
export const logspace=(a:number,b:number,n=241)=>Array.from({length:n},(_,k)=>10**(a+(b-a)*k/(n-1)));
// Round tick positions from 0 to max (inclusive where they fit).
export function niceTicks(max:number,count=5){const raw=max/count,p=10**Math.floor(Math.log10(raw)),step=[1,2,2.5,5,10].map(m=>m*p).find(s=>s>=raw)!;return Array.from({length:Math.floor(max/step+1e-9)+1},(_,k)=>Number((k*step).toPrecision(6)));}
// Bipolar transistor. Terminals: base (x-30, y), collector (x+12, y-40), emitter (x+12, y+40).
// Set pnp to reverse the emitter arrow; flip mirrors it horizontally (base on the right).
export function Bjt({x,y,pnp=false,flip=false,color=ink}:{x:number;y:number;pnp?:boolean;flip?:boolean;color?:string}){
 const a=pnp?'M-0.1 15.75 L4.24 23.56 L8.76 16.94 Z':'M8.7 21.75 L-0.16 20.56 L4.36 13.94 Z';
 return <g transform={`translate(${x} ${y})${flip?' scale(-1 1)':''}`} fill="none" stroke={color} strokeWidth="1.8"><circle cx="2" cy="0" r="27" stroke="var(--line)"/><path d="M-30 0 H-10 M-10 9 L12 24 V40 M-10 -9 L12 -24 V-40"/><path d="M-10 -19 V19" strokeWidth="3.2"/><path d={a} fill={color} stroke="none"/></g>;
}
