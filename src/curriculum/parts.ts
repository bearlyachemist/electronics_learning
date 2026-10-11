// The book is organized as seven parts, each divided into units. Chapter numbers
// are contiguous within a part, so a part is fully described by its units' ranges.
export type Unit = {title: string; from: number; to: number};
export type Part = {id: string; numeral: string; title: string; blurb: string; units: Unit[]};

export const parts: Part[] = [
  {id: 'foundations', numeral: 'I', title: 'Foundations & passive circuits',
    blurb: 'Kirchhoff’s laws, Thévenin models, energy storage, phasors and filters: the language every later part speaks.',
    units: [
      {title: 'DC circuits & energy storage', from: 1, to: 11},
      {title: 'AC circuits & filters', from: 12, to: 18},
    ]},
  {id: 'semiconductors', numeral: 'II', title: 'Semiconductors & transistors',
    blurb: 'From the p–n junction to bipolar and MOS amplifier design, with feedback introduced where transistors first need it.',
    units: [
      {title: 'Diodes', from: 19, to: 25},
      {title: 'Bipolar transistors', from: 26, to: 41},
      {title: 'Feedback & control', from: 42, to: 44},
      {title: 'Field-effect transistors', from: 45, to: 51},
      {title: 'MOS analog design', from: 52, to: 71},
    ]},
  {id: 'opamps', numeral: 'III', title: 'Op amps & precision analog',
    blurb: 'The op amp as a feedback system, its errors and internals, the classic circuits, and the measurement chain around them.',
    units: [
      {title: 'The op amp', from: 72, to: 77},
      {title: 'Op-amp circuits', from: 78, to: 89},
      {title: 'Precision measurement', from: 90, to: 92},
    ]},
  {id: 'power', numeral: 'IV', title: 'Power electronics',
    blurb: 'Linear regulation, power switches and their losses, switching converters, control and layout.',
    units: [
      {title: 'Linear regulation', from: 93, to: 94},
      {title: 'Power switches', from: 95, to: 97},
      {title: 'Switching converters', from: 98, to: 100},
    ]},
  {id: 'rf', numeral: 'V', title: 'Electromagnetics & RF',
    blurb: 'Fields behind the circuit models, waves on lines, RF components and matching, oscillators, receivers, antennas and high-speed channels.',
    units: [
      {title: 'Fields & waves', from: 101, to: 102},
      {title: 'RF circuits', from: 103, to: 106},
      {title: 'Radiation & signal integrity', from: 107, to: 108},
    ]},
  {id: 'mixed', numeral: 'VI', title: 'The analog–digital boundary',
    blurb: 'Sampling, quantization and the converter architectures that cross between continuous and discrete signals.',
    units: [
      {title: 'Sampling', from: 109, to: 109},
      {title: 'Analog-to-digital converters', from: 110, to: 112},
      {title: 'Digital-to-analog converters', from: 113, to: 113},
    ]},
  {id: 'digital', numeral: 'VII', title: 'Digital electronics',
    blurb: 'Logic families, timing and clock domains, and the protocols that move data between chips and boxes.',
    units: [
      {title: 'Logic & timing', from: 114, to: 115},
      {title: 'Interfaces', from: 116, to: 117},
    ]},
];

export function partOf(number: string | number): Part {
  const n = Number(number);
  return parts.find(p => p.units.some(u => n >= u.from && n <= u.to)) ?? parts[0];
}

export function unitOf(number: string | number): Unit {
  const n = Number(number);
  return partOf(n).units.find(u => n >= u.from && n <= u.to)!;
}

export function partRange(p: Part): [number, number] {
  return [p.units[0].from, p.units[p.units.length - 1].to];
}
