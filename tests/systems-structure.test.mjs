import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {chapters} from '../src/curriculum/chapters.ts';
import {systemsChapters} from '../src/curriculum/systems-chapters.ts';
import {parts,partOf,unitOf} from '../src/curriculum/parts.ts';
test('reorganized chapters have contiguous numbers and exactly one part and unit',()=>{
 assert.equal(new Set(chapters.map(c=>c.id)).size,chapters.length);
 assert.equal(new Set(chapters.map(c=>c.href)).size,chapters.length);
 assert.deepEqual(chapters.map(c=>Number(c.number)).sort((a,b)=>a-b),Array.from({length:chapters.length},(_,i)=>i+1));
 for(const c of chapters){
  const matches=parts.flatMap(p=>p.units.filter(u=>Number(c.number)>=u.from&&Number(c.number)<=u.to).map(u=>[p,u]));
  assert.equal(matches.length,1,c.id);
  assert.equal(partOf(c.number),matches[0][0]);assert.equal(unitOf(c.number),matches[0][1]);
 }
 for(const p of parts)for(const u of p.units){assert.ok(u.to>=u.from);assert.equal(chapters.filter(c=>Number(c.number)>=u.from&&Number(c.number)<=u.to).length,u.to-u.from+1);}
});
test('systems chapter display labels agree with their reorganized registry',()=>{
 for(const c of systemsChapters){
  const s=readFileSync(`src/content/systems/${c.id}.mdx`,'utf8');
  assert.ok(s.includes(`CHAPTER ${c.number}</span>`),c.id);
  assert.ok(s.includes(`PART ${partOf(c.number).numeral} /`),c.id);
 }
});
