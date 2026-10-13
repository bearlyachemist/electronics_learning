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
  {id: 'opamps', numeral: 'III', title: 'Op amps, noise & precision',
    blurb: 'The op amp as a feedback system, its errors and internals, the classic circuits, low-noise design, and the measurement chain around them.',
    units: [
      {title: 'The op amp', from: 72, to: 77},
      {title: 'Op-amp circuits', from: 78, to: 89},
      {title: 'Low-noise design', from: 90, to: 94},
      {title: 'Precision measurement', from: 95, to: 96},
    ]},
  {id: 'power', numeral: 'IV', title: 'Power electronics',
    blurb: 'From the AC line to regulated rails: rectifiers, linear regulators, heat and safe operating area, power switches, switching and isolated converters, batteries and protection.',
    units: [
      {title: 'Line & linear supplies', from: 97, to: 100},
      {title: 'Heat & power switches', from: 101, to: 104},
      {title: 'Switching converters', from: 105, to: 108},
      {title: 'Storage & protection', from: 109, to: 109},
    ]},
  {id: 'rf', numeral: 'V', title: 'Electromagnetics & RF',
    blurb: 'Fields behind the circuit models, waves on lines, RF components, matching, amplifiers and filters, oscillators, modulation and receivers, antennas and high-speed channels.',
    units: [
      {title: 'Fields & waves', from: 110, to: 111},
      {title: 'RF components & stages', from: 112, to: 115},
      {title: 'Oscillators, modulation & receivers', from: 116, to: 118},
      {title: 'Radiation & signal integrity', from: 119, to: 120},
    ]},
  {id: 'mixed', numeral: 'VI', title: 'The analog–digital boundary',
    blurb: 'Sampling, quantization and the converter architectures that cross between continuous and discrete signals.',
    units: [
      {title: 'Sampling', from: 121, to: 121},
      {title: 'Analog-to-digital converters', from: 122, to: 124},
      {title: 'Digital-to-analog converters', from: 125, to: 125},
    ]},
  {id: 'digital', numeral: 'VII', title: 'Digital electronics & interfaces',
    blurb: 'Logic families and timing, digital signal integrity, and the board and cable protocols that move data, specified bit by bit.',
    units: [
      {title: 'Logic, timing & signal integrity', from: 126, to: 128},
      {title: 'Board-level buses', from: 129, to: 131},
      {title: 'Cable interfaces', from: 132, to: 133},
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
