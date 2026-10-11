# Precision, power, RF, converters and communication

The October 2026 reorganization keeps chapter URLs stable and places the book's
117 chapters in seven parts. This index records the 23 systems chapters in
`src/content/systems/`; older regulation and power-switch chapters remain in
their existing files. Use the published [contents](https://hebert.phd/electronics/contents/)
for the complete order, and the [systems guide](https://hebert.phd/electronics/systems-coverage/)
for this learning path.

Each systems chapter has three independent problems with hints and solutions,
and a separate synthesis study comparing three operating conditions: 69 problems
and 69 synthesis cases in this section. Across the complete book there are 440
practice problems and 117 synthesis studies with 351 cases.

| Chapter | Stable lesson ID | Coverage and design decisions |
| --- | --- | --- |
| 90 | precision-references | Bandgap cancellation, reference error budgets, drift, dynamic loading and ratiometric measurement |
| 91 | precision-noise-grounding | Integrated noise, electric/magnetic coupling, shared impedance, returns, shielding, guarding and synchronous detection |
| 92 | precision-calibration | Measurement equations, uncertainty, calibration residuals, Kelvin resistance and sensor compensation |
| 94 | power-linear-regulators | Dropout at ripple troughs, thermal limits, transient charge, capacitor stability, PSRR and post-regulation |
| 98 | power-buck-converters | Switching-state derivation, CCM/DCM boundary, capacitor currents, loss budget and averaged plant |
| 99 | power-boost-isolated | Boost currents, right-half-plane zero, inverting/four-switch conversion, flyback/forward distinction and charge pumps |
| 100 | power-control-layout | Current limiting, slope compensation, fault states, parasitic extraction, RC damping, pulse loss and commutation loops |
| 101 | em-fields | Lumped limits, field-derived capacitance/inductance, image return currents, skin depth and radiation |
| 102 | transmission-lines | Distributed storage, launch, reflection, source bounces, termination and reference continuity |
| 103 | rf-components-smith | Real RF components, Q, impedance transformation, Smith-chart construction, transformers and stubs |
| 104 | rf-impedance-matching | Available power, conjugate match, L-network derivation, tolerance, bandwidth and measurement planes |
| 105 | oscillators-pll | Start-up versus limiting, Colpitts, crystal loading, phase noise/jitter and charge-pump PLL dynamics |
| 106 | rf-signal-chains | Cascaded noise, compression, intermodulation, mixer images, reciprocal mixing and bench measurement |
| 107 | antennas-propagation | Current distribution, radiation resistance, efficiency versus match, aperture, polarization, link margin and emission-model limits |
| 108 | differential-pairs | Differential/common modes, odd/even impedance, skew conversion, routing symmetry and channel assessment |
| 109 | sampling-converter-errors | Code conventions, quantization, aliasing, ENOB, jitter and acquisition/error budgets |
| 110 | adc-successive-approximation | Binary search, capacitive redistribution, reference kickback, acquisition, kT/C and multiplexed inputs |
| 111 | adc-flash-pipeline | Comparator thresholds, thermometer encoding, residues, digital correction, latency and interleaving errors |
| 112 | adc-integrating-delta-sigma | Charge balance, dual slope, line rejection, noise shaping, oversampling, decimation and settling |
| 113 | dac-architectures-output | String, R–2R, current steering, segmentation, glitches, settling, reconstruction, hold droop and PWM |
| 115 | digital-logic-timing | Guaranteed levels, charge/edge power, setup/hold, metastability, clock crossings and reset/level shifting |
| 116 | digital-board-protocols | UART framing, SPI phase, I²C ownership/pull-ups, I²S clocks and useful throughput |
| 117 | digital-cable-interfaces | RS-485 bias/turnaround, CAN arbitration, USB endpoints/roles, Ethernet MAC/PHY, protection and buffering |

## Reference roles

The supplied *Art of Electronics*, third edition, guides the precision,
low-noise, power, converter and interface coverage, especially Chapters 5,
8–9 and 12–14 and Appendix H. Fiore's *AC Electrical Circuit Analysis*
supports the complex-impedance and resonance connections. The other supplied
op-amp and filter books inform the earlier amplifier/filter foundation; their
roles and inspected sections are recorded in [textbook-reference-map.md](textbook-reference-map.md).
These are coverage and inspiration sources, not reproduced chapter text or figures.

The systems readings link primary implementation references where device or
protocol details matter: ADI converter tutorials MT-001 and MT-014–024; TI
converter, layout, high-speed-channel, RS-485 and CAN reports; NXP I²C and I²S
specifications; Bosch CAN FD; and USB-IF USB 2.0. Their citations belong beside
the relevant explanations. Interface timing and electrical guarantees still
come from the actual controller/transceiver and selected protocol revision.

The Chapter 107 depth pass additionally links MIT antenna notes for effective
current length and an ADI small-loop example for matching versus dissipation.
Its original examples consistently distinguish a uniform current element
from a centre-fed wire with triangular current. The short-conductor emission
plot uses an electrically short geometry over its displayed range and states
peak/RMS and image-reflection assumptions.

Chapter 100's depth pass derives the two-period extraction method, contrasts
direct parallel resistance with a series RC branch, and computes original
average/pulse-loss examples. The TI ringing report supplies the practical
measurement connection; teaching component values are independently chosen.

## Models and verification

`systems.mjs` implements fixed-topology teaching calculations for buck/boost
CCM, resistive lossless-line boundaries, code bins, aliases, acquisition,
jitter, receiver noise cascades and a first-order delta-sigma accumulator.
The buck explorer reports when its CCM assumption fails. The delta-sigma
explorer demonstrates bounded charge-balance error, not a complete physical ADC.

`antennas.mjs` uses SI units and a specified short-dipole current distribution.
The antenna explorer separates feed-referred dissipation from reflection and
hides numerical estimates beyond its stated electrical-length cutoff. It does
not calculate enclosure detuning, matching bandwidth or long-wire resonances.
RF and converter figures are original SVG; published circuit connections use
the repository's schematic primitives where applicable.

Verification covers independent conservation and limiting cases, numerical
integration of antenna radiated power and RC pulse energy, strict KaTeX,
chapter anchors, three exercises per systems chapter, unique/contiguous
numbering and exactly one part/unit per chapter. `check:systems` checks the
rendered guide and contents and six critical schematic connections: buck,
boost, L match, R–2R ladder, RC snubber and oscillator tank. Other existing
checks cover hosted paths, generic schematic connectivity and synthesis.

The resumed pass verified desktop and phone layouts and exercised the antenna
explorer's low-loss and out-of-model states. Deployment runs these tests and
rendered checks before syncing the notebook. Each completed chapter is pushed
as its own checkpoint; the personal homepage remains unlinked.
