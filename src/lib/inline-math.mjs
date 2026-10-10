// Vite pre-transform for chapter MDX: turns $tex$ in prose into <M tex="tex"/>.
// MDX would otherwise parse the braces in V_{BE} as JavaScript expressions.
// Skips import/export lines, fenced code, inline code, and JSX attribute values. Write \$ for a literal dollar.
const IMPORT = "import M from '/src/components/M.astro';";
const attr = s => s.replace(/&/g,'&amp;').replace(/"/g,'&quot;');

export function convertInlineMath(src){
  let fenced = false;
  const out = src.split('\n').map(line => {
    if (/^\s*```/.test(line)) { fenced = !fenced; return line; }
    if (fenced || /^(import|export)\s/.test(line)) return line;
    // Protect JSX tags (with quoted/braced attributes) and inline code, then convert the rest.
    const parts = line.split(/(<[A-Za-z/](?:"[^"]*"|'[^']*'|\{[^}]*\}|[^>"'{])*>|`[^`]*`)/);
    return parts.map((p,i) => i % 2 ? p : p
      .replace(/(^|[^\\])\$([^$\n]+?)\$/g, (_, pre, tex) => `${pre}<M tex="${attr(tex.trim())}"/>`)
      .replace(/\\\$/g,'$')).join('');
  }).join('\n');
  return out === src ? src : IMPORT + '\n' + out;
}

// Static chapter links are authored relative to the notebook. Rewrite them in
// the same pre-transform so this also works with Astro's Satteri MDX processor.
export function prefixContentLinks(src, base='/') {
  const prefix = base.replace(/\/$/, '');
  if (!prefix) return src;
  let fenced = false;
  return src.split('\n').map(line => {
    if (/^\s*```/.test(line)) { fenced = !fenced; return line; }
    if (fenced || /^(import|export)\s/.test(line)) return line;
    return line.split(/(`[^`]*`)/).map((part, i) => i % 2 ? part : part
      .replace(/(<[A-Za-z][^>]*>)/g, tag => tag.replace(/\b(href|src)=(["'])(\/(?!\/)[^"']*)\2/g,
        (_, attr, quote, path) => `${attr}=${quote}${prefix}${path}${quote}`))
      .replace(/\]\((\/(?!\/)[^\s)]*)([^)]*)\)/g, (_, path, rest) => `](${prefix}${path}${rest})`)
    ).join('');
  }).join('\n');
}

export default function inlineMath(base='/'){
  return {name:'inline-math', enforce:'pre', transform(code,id){
    if (!id.endsWith('.mdx')) return null;
    const next = prefixContentLinks(convertInlineMath(code), base);
    return next === code ? null : {code: next, map: null};
  }};
}
