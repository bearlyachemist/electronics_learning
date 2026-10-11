# Textbook coverage map

Status: draft backlog for the next explanatory and practical-detail pass. This is not a record of completed coverage or verified source-page citations. The published design studies are indexed in [synthesis-coverage.md](synthesis-coverage.md); inspected source material is recorded in [textbook-reference-map.md](textbook-reference-map.md).

Purpose: identify additional explanations, examples and practical notes relevant to the existing chapters, guided by the six supplied books. Additions will use original prose, values and drawings. Book content is reference material only.

Abbreviations:

| Key | Book |
|---|---|
| AoE | Horowitz & Hill, *The Art of Electronics*, 3rd ed. |
| Fio | Fiore, *AC Electrical Circuit Analysis* |
| VV | Van Valkenburg, *Analog Filter Design* |
| Asa | Asadi, *Applied Op Amp Circuits* |
| Sel | Selvam, *Analog Function Circuits* |
| Hui | Huijsing, *Operational Amplifiers*, 3rd ed. |

Source section pointers below are provisional and must be checked during implementation. Printed-to-PDF page offsets vary; use verified PDF page numbers from the reference map.

Status legend: ☐ candidate addition pending chapter/source review, ☑ added. An unchecked item does not necessarily mean the existing chapter lacks all related discussion.

## Foundations and passives (1–11)

| Ch | Sources | Additions from the gap analysis |
|---|---|---|
| 1 Dividers | AoE 1.2.1–1.2.7, 1.9.5 | ☑ potentiometers and loaded pots; ☑ thermistor "too hot" sensing divider; ☑ standard (E-series) values and tolerance stacking |
| 2 Thévenin | AoE 1.2.4–1.2.5; Fio 5.2–5.6 | ☐ source conversions (Thévenin ↔ Norton); ☐ superposition worked example; ☐ maximum power transfer; ☐ Δ–Y conversion with a bridge |
| 3 Small-signal | AoE 1.2.6 | ☐ incremental resistance of a zener and an LED; ☐ graphical load-line solution |
| 4 Power | AoE 1.2.2, 1.3.2 | ☐ signal amplitudes: peak, p-p, rms, average of common waveforms; ☐ decibels for power and voltage |
| 5 Capacitors | AoE 1.4.1, 1.10 | ☐ capacitor markings/codes and SMD sizes; ☐ energy in a camera-flash/defibrillator-style discharge |
| 6 RC circuits | AoE 1.4.2 | ☐ RC as a timing element with a comparator (delay, power-on reset) |
| 7–8 Differentiators/Integrators | AoE 1.4.3–1.4.4, 1.7.10 | ☐ frequency-domain view tied to Bode slopes |
| 9 Real capacitors | AoE 1.4.5, 1.7.16 | ☐ capacitor-type selection table across applications |
| 10 Inductors | AoE 1.5.1, 1.6.8 | ☐ inductor markings, core types, energy-storage design example |
| 11 Transformers | AoE 1.5.2, 9.5.2 | ☐ transformer regulation and VA rating example |

## Diodes, supplies and protection (12–18)

| Ch | Sources | Additions |
|---|---|---|
| 12–13 | AoE 1.6.1 | ☐ diode types table (signal, rectifier, Schottky, zener, LED, photodiode, varactor) |
| 14 Rectifiers | AoE 1.6.2–1.6.4, 9.5 | ☐ split (±) supply from a center-tapped transformer; ☐ voltage doubler |
| 15 Regulators | AoE 1.6.5, 9.1–9.3, 9.10 | ☐ three-terminal and adjustable (317-type) regulators; ☐ LDO dropout; ☐ bandgap reference principle |
| 16 Diode applications | AoE 1.6.6 | ☐ diode gates, clamps, voltage multipliers (Cockcroft–Walton) |
| 17–18 Protection | AoE 1.6.7, 9.13 | ☐ crowbar overvoltage protection; ☐ foldback current limiting (cross-ref 44) |

## AC circuits (19–25)

| Ch | Sources | Additions |
|---|---|---|
| 19 Phasors | Fio 1.2–1.6; AoE 1.3.1, 1.7.3 | ☐ Fourier series of square/triangle/sawtooth with harmonic plots; ☐ rms of sums of harmonics |
| 20 Impedance | Fio 2–4; AoE 1.7.1–1.7.5 | ☐ series, parallel and series–parallel RLC worked analyses; ☐ practical inductor Q |
| 21 Reactive power | Fio 7, 9; AoE 1.7.6 | ☐ three-phase power: line/phase relations, balanced load, power-factor correction |
| 22 RC filters | VV 3; Fio 10; AoE 1.7.7–1.7.9 | ☐ bilinear transfer functions; ☐ multi-stage Bode with dB addition |
| 23 Poles | VV 4, 11, 12; AoE 1.7.13 | ☐ first-order allpass phase shifter; ☐ low-pass → high-pass/band-pass frequency transformations |
| 24 Resonance | Fio 8; AoE 1.7.14–1.7.15 | ☐ bandwidth and selectivity examples, series vs parallel comparison table |
| 25 AC Thévenin | Fio 5–6; AoE 1.7.17, 1.8 | ☐ phasor nodal and mesh analysis; ☐ AC superposition with sources at different frequencies |

## Bipolar transistors and building blocks (26–41)

| Ch | Sources | Additions |
|---|---|---|
| 27 BJT switch | AoE 2.2.1–2.2.2, 3.5.3 | ☐ relay/lamp/LED driver examples with snubbers; ☐ BJT vs MOSFET switch choice |
| 28 Follower | AoE 2.2.3–2.2.5, 8.15.1 | ☐ capacitance multiplier ripple filter |
| 29 Biasing | AoE 2.2.5, 2.3.5 | ☐ split-supply bias and AC-coupled examples |
| 31 Current sources | AoE 2.2.6, 9.3.14 | ☐ two-transistor and LED/zener-referenced sources, current-source loads |
| 32 Common emitter | AoE 2.2.7, 2.3.4 | ☐ voltage-divider-biased CE complete design with low-frequency corners |
| 36 Differential | AoE 2.3.8, 8.3 | ☐ BJT input noise: e_n, i_n vs collector current, optimum source resistance |
| 37 Push–pull | AoE 2.4.1 | ☐ V_BE multiplier design numbers |
| 41 Miller | AoE 2.4.5 | ☐ f_T-based bandwidth estimate for a real part |

## Feedback and control (42–46)

| Ch | Sources | Additions |
|---|---|---|
| 42–43 | AoE 2.5, VV 2.3 | ☐ four feedback topologies (series/shunt sampling and mixing) and their impedance effects |
| 44 Supplies | AoE 9.1–9.4, 9.13 | ☐ foldback limiting; ☐ boost and flyback converter energy balance |
| 45 Temperature | AoE 2.6.2 | ☐ thermistor linearization |
| 46 Logic | AoE 2.6.3, 10.1–10.2 | ☐ CMOS inverter as the modern logic gate (transfer curve, static current) |

## Field-effect transistors (47–56)

| Ch | Sources | Additions |
|---|---|---|
| 48–49 JFET | AoE 3.2.1–3.2.7, 3.3 | ☐ JFET current regulator diodes; ☐ VCR linearization trick |
| 50 Dynamics | AoE 3.3.5, 8.6 | ☐ JFET noise vs BJT for high-impedance sources |
| 51 Switches | AoE 3.4; Sel 1.7–1.13 | ☐ analog multiplexers, crosstalk and charge injection numbers |
| 52–56 | AoE 3.5–3.6 | ☐ logic-level gate drive and gate-driver selection; ☐ MOSFET in linear SOA example |

## MOSFET studies and op amps (57–94)

Deepened in the previous pass. Remaining book items to fold in:

| Ch | Sources | Additions |
|---|---|---|
| 72/81 | Hui 4.4, 7.1 | ☐ constant-g_m techniques; ☐ folded-cascode OTA |
| 74 | Hui 5.3–5.4 | ☐ feedback class-AB biasing |
| 75 | Hui 6.2 | ☐ nested Miller compensation for three stages |
| 77 | Hui 1 | ☐ four op-amp types (voltage, inverting/transimpedance, current, floating/OTA) |
| 88/94 | Sel 4; Asa 9 | ☐ astable and monostable multivibrators, sawtooth generator, VCO |
| 90 | VV 5, 7, 12 | ☐ biquad (state-variable) filter; ☐ band-pass and notch designs |
| 94 | Sel 6–10 | ☐ time-division multiplier principle |
