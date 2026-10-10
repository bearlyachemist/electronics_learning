// Math in React components (labs, figures, plots).
// HTML contexts: <M t="V_{BE}"/> or <Tx>{'Raise $V_{BE}$ by 60 mV'}</Tx> render KaTeX.
// SVG contexts (<text>): svgMath('V_CE = 0.20 V') turns X_sub / X_{sub} into real subscripts with tspans,
// because KaTeX HTML cannot live inside an SVG <text> element.
import katex from 'katex';
import {Fragment,type ReactNode} from 'react';

const cache = new Map<string,string>();
export function katexHtml(tex:string, display=false){
  const key=(display?'D':'I')+tex;
  let html=cache.get(key);
  if(html===undefined){html=katex.renderToString(tex,{displayMode:display,throwOnError:false,output:'htmlAndMathml',strict:false});cache.set(key,html);}
  return html;
}
export function M({t}:{t:string}){return <span className="m" dangerouslySetInnerHTML={{__html:katexHtml(t)}}/>}

// Text with $...$ segments rendered as inline math. Everything else stays plain text.
export function Tx({children}:{children:string}){
  return <>{children.split(/(\$[^$]+\$)/).map((p,i)=>i%2?<M key={i} t={p.slice(1,-1)}/>:p)}</>;
}
// Same idea for strings that will be injected as HTML (e.g. practice solutions).
export const texToHtml=(s:string)=>s.replace(/\$([^$]+)\$/g,(_,t)=>katexHtml(t));

const SUB=0.72, SHIFT=0.32;                 // subscript scale and drop (in subscript ems)
const RESET=`${-(SUB*SHIFT).toFixed(4)}em`; // the same drop measured in parent ems
const TOKEN=/([A-Za-zα-ωΑ-ΩΔ])_(\{[^}]*\}|[A-Za-z0-9α-ωΑ-Ω]+)/g;
const upright=(s:string)=>/^[a-z]{2,}$/.test(s)||/\(/.test(s);

export function svgMath(s:ReactNode):ReactNode{
  if(Array.isArray(s))return s.map((c,i)=><Fragment key={i}>{svgMath(c)}</Fragment>);
  if(typeof s!=='string'||!s.includes('_'))return s;
  const out:ReactNode[]=[];let last=0,k=0,m:RegExpExecArray|null;
  TOKEN.lastIndex=0;
  while((m=TOKEN.exec(s))){
    const sub=m[2].startsWith('{')?m[2].slice(1,-1):m[2];
    if(m.index>last)out.push(s.slice(last,m.index));
    out.push(<tspan key={k++} fontStyle="italic">{m[1]}</tspan>);
    out.push(<tspan key={k++} dy={`${SHIFT}em`} fontSize={`${SUB}em`} fontStyle={upright(sub)?'normal':'italic'}>{sub}</tspan>);
    out.push(<tspan key={k++} dy={RESET}>{'​'}</tspan>);
    last=m.index+m[0].length;
  }
  if(last<s.length)out.push(s.slice(last));
  return out;
}

// HTML counterpart of svgMath for plain strings (plot legends, readouts): X_sub → X<sub>sub</sub>.
export function htmlSub(s:string):ReactNode{
  if(!s.includes('_'))return s;
  const out:ReactNode[]=[];let last=0,k=0,m:RegExpExecArray|null;
  TOKEN.lastIndex=0;
  while((m=TOKEN.exec(s))){
    const sub=m[2].startsWith('{')?m[2].slice(1,-1):m[2];
    if(m.index>last)out.push(s.slice(last,m.index));
    out.push(<var key={k++}>{m[1]}</var>,<sub key={k++}>{sub}</sub>);
    last=m.index+m[0].length;
  }
  if(last<s.length)out.push(s.slice(last));
  return out;
}
