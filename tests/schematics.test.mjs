import test from 'node:test';
import assert from 'node:assert/strict';
import {lintSvg} from '../scripts/check-schematics.mjs';

const part=(...p)=>`<g data-pins="${p.join(' ')}"></g>`,wire=(...p)=>`<polyline data-wire="${p.join(' ')}"/>`;

test('a wire joining two pins is clean',()=>{
  assert.deepEqual(lintSvg(part('0,0','0,60')+wire('0,60','100,60')+part('100,60','100,120')+wire('100,120','0,120','0,0')),[]);
});
test('a T-junction onto the middle of another wire counts as connected',()=>{
  assert.deepEqual(lintSvg(part('0,0','100,0')+wire('100,0','200,0')+part('200,0','200,120')+wire('200,120','0,120','0,0')+wire('150,0','150,50')+part('150,50','150,110')+wire('150,110','150,120')),[]);
});
test('a wire that stops short of a pin is reported',()=>{
  const problems=lintSvg(part('0,0','0,60')+wire('0,58','100,58'));
  assert.ok(problems.some(p=>p.includes('dangling wire end at (0,58)')));
  assert.ok(problems.some(p=>p.includes('unconnected pin at (0,60)')));
});
