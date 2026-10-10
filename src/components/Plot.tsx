import {useId} from 'react';
import {svgMath,Tx,htmlSub} from './MathText';
type Curve={name:string;color:string;points:[number,number][];dashed?:boolean};
// Log axes spanning two or more decades get ticks at powers of ten (every other decade if there are many).
const decades=(lo:number,hi:number)=>{const a=Math.ceil(lo-1e-9),b=Math.floor(hi+1e-9),step=b-a>7?2:1;return b-a>=2?Array.from({length:Math.floor((b-a)/step)+1},(_,k)=>10**(a+k*step)):null;};
// Linear axes get round tick values (steps of 1, 2, 2.5 or 5 × 10ⁿ), about five per axis.
const niceLinear=(lo:number,hi:number)=>{const raw=(hi-lo)/4,p=10**Math.floor(Math.log10(raw)),step=[1,2,2.5,5,10].map(m=>m*p).find(v=>v>=raw*.999)!;const out:number[]=[];for(let v=Math.ceil(lo/step-1e-9)*step;v<=hi+step*1e-9;v+=step)out.push(Math.abs(v)<step*1e-9?0:Number(v.toPrecision(12)));return out;};
export default function Plot({curves,xRange,yRange,xLabel,yLabel,point,pointLabel='Selected point',description,xScale='linear',yScale='linear',xTicks}:{curves:Curve[];xRange:[number,number];yRange:[number,number];xLabel:string;yLabel:string;point?:[number,number];pointLabel?:string;description:string;xScale?:'linear'|'log';yScale?:'linear'|'log';xTicks?:number[]}) {
 const clip='plot-clip'+useId().replace(/[^a-zA-Z0-9_-]/g,'');
 const tx=(v:number)=>xScale==='log'?Math.log10(v):v,ty=(v:number)=>yScale==='log'?Math.log10(v):v;
 const [xmin,xmax]=xRange.map(tx),[ymin,ymax]=yRange.map(ty);
 const x=(v:number)=>Number((64+(tx(v)-xmin)/(xmax-xmin)*450).toFixed(4)),y=(v:number)=>Number((222-(ty(v)-ymin)/(ymax-ymin)*174).toFixed(4));
 const tick=(v:number)=>{const a=Math.abs(v);if(a>=1e9)return Number((v/1e9).toPrecision(3))+'G';if(a>=1e6)return Number((v/1e6).toPrecision(3))+'M';if(a>=1e3)return Number((v/1e3).toPrecision(3))+'k';if(a>0&&a<.01)return v.toExponential(0);return Number(v.toPrecision(3)).toString();};
 const fractions=[0,.25,.5,.75,1];
 const xt=xTicks??((xScale==='log'&&decades(xmin,xmax))||(xScale==='log'?fractions.map(f=>10**(xmin+(xmax-xmin)*f)):niceLinear(xmin,xmax)));
 const yt=(yScale==='log'&&decades(ymin,ymax))||(yScale==='log'?fractions.map(f=>10**(ymin+(ymax-ymin)*f)):niceLinear(ymin,ymax));
 return <div className="shared-plot"><svg viewBox="0 0 550 280" role="img" aria-label={description}>
 <defs><clipPath id={clip}><rect x="62" y="44" width="454" height="182"/></clipPath></defs>
 <text x="64" y="23" className="axis-title">{svgMath(yLabel)}</text>
 {yt.map(v=>{return <g key={v}><line x1="64" x2="514" y1={y(v)} y2={y(v)} stroke="var(--line)"/><text x="55" y={y(v)+4} textAnchor="end" className="tick">{tick(v)}</text></g>})}
 {xt.map(v=><text key={v} x={x(v)} y="241" textAnchor="middle" className="tick">{tick(v)}</text>)}
 <g clipPath={'url(#'+clip+')'}>{curves.map(c=>{const segs:[number,number][][]=[[]];for(const p of c.points){const ok=p.every(Number.isFinite)&&(xScale!=='log'||p[0]>0)&&(yScale!=='log'||p[1]>0);if(ok)segs[segs.length-1].push(p);else if(segs[segs.length-1].length)segs.push([]);}
 return segs.filter(seg=>seg.length>1).map((seg,i)=><polyline key={c.name+i} points={seg.map(p=>x(p[0])+','+y(p[1])).join(' ')} fill="none" stroke={c.color} strokeWidth="2.7" strokeDasharray={c.dashed?'7 5':undefined}/>);})}</g>
 {point&&<circle cx={x(point[0])} cy={y(point[1])} r="5" fill="var(--orange)" stroke="var(--paper)" strokeWidth="2"/>}
 <text x="289" y="267" textAnchor="middle" className="axis-title">{svgMath(xLabel)}</text></svg>
 <div className="plot-key">{curves.map(c=><span key={c.name}><i style={{borderTop:'2px '+(c.dashed?'dashed':'solid')+' '+c.color}}/><span>{c.name.includes('$')?<Tx>{c.name}</Tx>:htmlSub(c.name)}</span></span>)}{point&&<span><i className="point-key"/>{pointLabel}</span>}</div></div>;
}

